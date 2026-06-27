
CREATE OR REPLACE FUNCTION public.public_finish_dispatch(_token text)
 RETURNS void
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
DECLARE _d_id uuid; _po_id uuid;
BEGIN
  SELECT id, production_order_id INTO _d_id, _po_id FROM public.op_dispatches WHERE access_token = _token;
  IF _d_id IS NULL THEN RAISE EXCEPTION 'invalid token'; END IF;
  UPDATE public.op_dispatch_items SET is_completed = true, completed_qty = qty WHERE dispatch_id = _d_id;
  UPDATE public.op_dispatches SET status='finalizado',
    completed_pieces = (SELECT coalesce(sum(qty),0) FROM public.op_dispatch_items WHERE dispatch_id = _d_id)
    WHERE id = _d_id;
  IF _po_id IS NOT NULL THEN
    UPDATE public.production_orders SET status='finalizado', updated_at=now() WHERE id = _po_id;
  END IF;
END $function$;

ALTER TABLE public.production_orders REPLICA IDENTITY FULL;
ALTER PUBLICATION supabase_realtime ADD TABLE public.production_orders;
