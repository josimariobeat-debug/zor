
-- Drop overly permissive anon policies
DROP POLICY IF EXISTS public_view_by_token ON public.op_dispatches;
DROP POLICY IF EXISTS public_view_items ON public.op_dispatch_items;
DROP POLICY IF EXISTS public_update_items ON public.op_dispatch_items;

-- Revoke broad anon grants; anon will only reach data via SECURITY DEFINER RPCs below
REVOKE ALL ON public.op_dispatches FROM anon;
REVOKE ALL ON public.op_dispatch_items FROM anon;

-- Helper: fetch dispatch + items by access token
CREATE OR REPLACE FUNCTION public.public_get_dispatch(_token text)
RETURNS jsonb
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  _dispatch public.op_dispatches%ROWTYPE;
  _items jsonb;
BEGIN
  IF _token IS NULL OR length(_token) < 8 THEN
    RETURN NULL;
  END IF;

  SELECT * INTO _dispatch FROM public.op_dispatches WHERE access_token = _token;
  IF NOT FOUND THEN
    RETURN NULL;
  END IF;

  SELECT COALESCE(jsonb_agg(to_jsonb(i) ORDER BY i.product_name, i.size, i.color), '[]'::jsonb)
    INTO _items
    FROM public.op_dispatch_items i
   WHERE i.dispatch_id = _dispatch.id;

  RETURN jsonb_build_object('dispatch', to_jsonb(_dispatch), 'items', _items);
END;
$$;

-- Toggle a single item's completion using the access token
CREATE OR REPLACE FUNCTION public.public_toggle_dispatch_item(
  _token text,
  _item_id uuid,
  _completed boolean
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  _dispatch_id uuid;
  _qty integer;
  _completed_pieces integer;
BEGIN
  IF _token IS NULL OR length(_token) < 8 THEN
    RAISE EXCEPTION 'invalid token';
  END IF;

  SELECT d.id INTO _dispatch_id
    FROM public.op_dispatches d
    JOIN public.op_dispatch_items i ON i.dispatch_id = d.id
   WHERE d.access_token = _token AND i.id = _item_id;

  IF _dispatch_id IS NULL THEN
    RAISE EXCEPTION 'not found';
  END IF;

  SELECT qty INTO _qty FROM public.op_dispatch_items WHERE id = _item_id;

  UPDATE public.op_dispatch_items
     SET is_completed = _completed,
         completed_qty = CASE WHEN _completed THEN _qty ELSE 0 END,
         completed_at = CASE WHEN _completed THEN now() ELSE NULL END
   WHERE id = _item_id;

  SELECT COALESCE(SUM(qty), 0) INTO _completed_pieces
    FROM public.op_dispatch_items
   WHERE dispatch_id = _dispatch_id AND is_completed = true;

  UPDATE public.op_dispatches
     SET completed_pieces = _completed_pieces,
         updated_at = now()
   WHERE id = _dispatch_id;

  RETURN jsonb_build_object('completed_pieces', _completed_pieces);
END;
$$;

-- Mark all items finished and dispatch as finalized
CREATE OR REPLACE FUNCTION public.public_finish_dispatch(_token text)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  _dispatch public.op_dispatches%ROWTYPE;
BEGIN
  IF _token IS NULL OR length(_token) < 8 THEN
    RAISE EXCEPTION 'invalid token';
  END IF;

  SELECT * INTO _dispatch FROM public.op_dispatches WHERE access_token = _token;
  IF NOT FOUND THEN
    RAISE EXCEPTION 'not found';
  END IF;

  UPDATE public.op_dispatch_items
     SET is_completed = true,
         completed_qty = qty,
         completed_at = COALESCE(completed_at, now())
   WHERE dispatch_id = _dispatch.id;

  UPDATE public.op_dispatches
     SET status = 'finalizado',
         completed_pieces = total_pieces,
         finished_at = now(),
         updated_at = now()
   WHERE id = _dispatch.id;

  IF _dispatch.production_order_id IS NOT NULL THEN
    UPDATE public.production_orders
       SET status = 'finalizado',
           updated_at = now()
     WHERE id = _dispatch.production_order_id;
  END IF;

  RETURN jsonb_build_object('ok', true);
END;
$$;

REVOKE ALL ON FUNCTION public.public_get_dispatch(text) FROM PUBLIC;
REVOKE ALL ON FUNCTION public.public_toggle_dispatch_item(text, uuid, boolean) FROM PUBLIC;
REVOKE ALL ON FUNCTION public.public_finish_dispatch(text) FROM PUBLIC;

GRANT EXECUTE ON FUNCTION public.public_get_dispatch(text) TO anon, authenticated;
GRANT EXECUTE ON FUNCTION public.public_toggle_dispatch_item(text, uuid, boolean) TO anon, authenticated;
GRANT EXECUTE ON FUNCTION public.public_finish_dispatch(text) TO anon, authenticated;
