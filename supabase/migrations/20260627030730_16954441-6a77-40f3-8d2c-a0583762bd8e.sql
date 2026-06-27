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

  SELECT COALESCE(jsonb_agg(item ORDER BY item->>'product_name', item->>'size', item->>'color'), '[]'::jsonb)
    INTO _items
    FROM (
      SELECT to_jsonb(i) || jsonb_build_object('product_image', p.image) AS item
        FROM public.op_dispatch_items i
        LEFT JOIN public.production_order_variations v ON v.id = i.variation_id
        LEFT JOIN public.production_order_items poi ON poi.id = v.item_id
        LEFT JOIN public.products p ON p.id = poi.product_id
       WHERE i.dispatch_id = _dispatch.id
    ) s;

  RETURN jsonb_build_object('dispatch', to_jsonb(_dispatch), 'items', _items);
END;
$$;