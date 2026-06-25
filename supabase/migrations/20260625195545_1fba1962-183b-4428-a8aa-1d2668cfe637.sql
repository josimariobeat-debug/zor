
-- updated_at helper
CREATE OR REPLACE FUNCTION public.set_updated_at()
RETURNS trigger LANGUAGE plpgsql SET search_path = public AS $$
BEGIN NEW.updated_at = now(); RETURN NEW; END $$;

-- =========== Catalog tables ===========
CREATE TABLE public.suppliers (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name text NOT NULL,
  type text DEFAULT '',
  contact text, phone text, email text, city text,
  lead_time integer DEFAULT 0,
  rating numeric DEFAULT 0,
  status text DEFAULT 'ativo',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT,INSERT,UPDATE,DELETE ON public.suppliers TO authenticated;
GRANT ALL ON public.suppliers TO service_role;
ALTER TABLE public.suppliers ENABLE ROW LEVEL SECURITY;
CREATE POLICY "own" ON public.suppliers FOR ALL TO authenticated USING (auth.uid()=user_id) WITH CHECK (auth.uid()=user_id);
CREATE TRIGGER t_upd BEFORE UPDATE ON public.suppliers FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

CREATE TABLE public.collections (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name text NOT NULL,
  season text, launch_date date,
  goal integer DEFAULT 0,
  status text DEFAULT 'ativa',
  products integer DEFAULT 0,
  image text, description text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT,INSERT,UPDATE,DELETE ON public.collections TO authenticated;
GRANT ALL ON public.collections TO service_role;
ALTER TABLE public.collections ENABLE ROW LEVEL SECURITY;
CREATE POLICY "own" ON public.collections FOR ALL TO authenticated USING (auth.uid()=user_id) WITH CHECK (auth.uid()=user_id);
CREATE TRIGGER t_upd BEFORE UPDATE ON public.collections FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

CREATE TABLE public.fabrics (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name text NOT NULL,
  type text DEFAULT '', color text DEFAULT '',
  supplier_id uuid,
  width numeric DEFAULT 0,
  gramatura numeric DEFAULT 0,
  stock numeric DEFAULT 0,
  price_per_meter numeric DEFAULT 0,
  location text,
  min_stock numeric DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT,INSERT,UPDATE,DELETE ON public.fabrics TO authenticated;
GRANT ALL ON public.fabrics TO service_role;
ALTER TABLE public.fabrics ENABLE ROW LEVEL SECURITY;
CREATE POLICY "own" ON public.fabrics FOR ALL TO authenticated USING (auth.uid()=user_id) WITH CHECK (auth.uid()=user_id);
CREATE TRIGGER t_upd BEFORE UPDATE ON public.fabrics FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

CREATE TABLE public.trims (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name text NOT NULL,
  type text DEFAULT '',
  supplier_id uuid,
  stock numeric DEFAULT 0,
  unit text DEFAULT 'un',
  price_per_unit numeric DEFAULT 0,
  min_stock numeric DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT,INSERT,UPDATE,DELETE ON public.trims TO authenticated;
GRANT ALL ON public.trims TO service_role;
ALTER TABLE public.trims ENABLE ROW LEVEL SECURITY;
CREATE POLICY "own" ON public.trims FOR ALL TO authenticated USING (auth.uid()=user_id) WITH CHECK (auth.uid()=user_id);
CREATE TRIGGER t_upd BEFORE UPDATE ON public.trims FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

CREATE TABLE public.workshops (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name text NOT NULL,
  specialty text DEFAULT '',
  phone text, email text,
  price_per_piece numeric DEFAULT 0,
  rating numeric DEFAULT 0,
  status text DEFAULT 'ativa',
  in_progress integer DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT,INSERT,UPDATE,DELETE ON public.workshops TO authenticated;
GRANT ALL ON public.workshops TO service_role;
ALTER TABLE public.workshops ENABLE ROW LEVEL SECURITY;
CREATE POLICY "own" ON public.workshops FOR ALL TO authenticated USING (auth.uid()=user_id) WITH CHECK (auth.uid()=user_id);
CREATE TRIGGER t_upd BEFORE UPDATE ON public.workshops FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

CREATE TABLE public.products (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name text NOT NULL,
  sku text DEFAULT '',
  internal_code text,
  category text DEFAULT '',
  collection_id uuid,
  sizes text[] DEFAULT '{}',
  colors text[] DEFAULT '{}',
  stock integer DEFAULT 0,
  cost_price numeric DEFAULT 0,
  sale_price numeric DEFAULT 0,
  margin numeric DEFAULT 0,
  description text,
  status text DEFAULT 'ativo',
  image text,
  fabric_ids uuid[] DEFAULT '{}',
  trim_ids uuid[] DEFAULT '{}',
  workshop_id uuid,
  labor_cost numeric DEFAULT 0,
  operational_cost numeric DEFAULT 0,
  meters_per_unit numeric DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT,INSERT,UPDATE,DELETE ON public.products TO authenticated;
GRANT ALL ON public.products TO service_role;
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
CREATE POLICY "own" ON public.products FOR ALL TO authenticated USING (auth.uid()=user_id) WITH CHECK (auth.uid()=user_id);
CREATE TRIGGER t_upd BEFORE UPDATE ON public.products FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

CREATE TABLE public.product_fabrics (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id uuid NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
  fabric_id uuid,
  fabric_name text,
  meters_used numeric DEFAULT 0,
  cost numeric DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT,INSERT,UPDATE,DELETE ON public.product_fabrics TO authenticated;
GRANT ALL ON public.product_fabrics TO service_role;
ALTER TABLE public.product_fabrics ENABLE ROW LEVEL SECURITY;
CREATE POLICY "via_product" ON public.product_fabrics FOR ALL TO authenticated
  USING (EXISTS (SELECT 1 FROM public.products p WHERE p.id = product_id AND p.user_id = auth.uid()))
  WITH CHECK (EXISTS (SELECT 1 FROM public.products p WHERE p.id = product_id AND p.user_id = auth.uid()));

CREATE TABLE public.product_trims (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id uuid NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
  trim_id uuid,
  trim_name text,
  quantity numeric DEFAULT 0,
  cost numeric DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT,INSERT,UPDATE,DELETE ON public.product_trims TO authenticated;
GRANT ALL ON public.product_trims TO service_role;
ALTER TABLE public.product_trims ENABLE ROW LEVEL SECURITY;
CREATE POLICY "via_product" ON public.product_trims FOR ALL TO authenticated
  USING (EXISTS (SELECT 1 FROM public.products p WHERE p.id = product_id AND p.user_id = auth.uid()))
  WITH CHECK (EXISTS (SELECT 1 FROM public.products p WHERE p.id = product_id AND p.user_id = auth.uid()));

-- =========== Production orders ===========
CREATE TABLE public.production_orders (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  number text NOT NULL,
  fabric_id uuid,
  fabric_name text DEFAULT '',
  fabric_meters_consumed numeric DEFAULT 0,
  workshop_id uuid,
  workshop_name text DEFAULT '',
  quantity integer DEFAULT 0,
  status text DEFAULT 'modelagem',
  priority text DEFAULT 'normal',
  start_date date,
  deadline date,
  observations text DEFAULT '',
  total_cost numeric DEFAULT 0,
  total_revenue numeric DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT,INSERT,UPDATE,DELETE ON public.production_orders TO authenticated;
GRANT ALL ON public.production_orders TO service_role;
ALTER TABLE public.production_orders ENABLE ROW LEVEL SECURITY;
CREATE POLICY "own" ON public.production_orders FOR ALL TO authenticated USING (auth.uid()=user_id) WITH CHECK (auth.uid()=user_id);
CREATE TRIGGER t_upd BEFORE UPDATE ON public.production_orders FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

CREATE TABLE public.production_order_items (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  production_order_id uuid NOT NULL REFERENCES public.production_orders(id) ON DELETE CASCADE,
  product_id uuid,
  product_name text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT,INSERT,UPDATE,DELETE ON public.production_order_items TO authenticated;
GRANT ALL ON public.production_order_items TO service_role;
ALTER TABLE public.production_order_items ENABLE ROW LEVEL SECURITY;
CREATE POLICY "via_op" ON public.production_order_items FOR ALL TO authenticated
  USING (EXISTS (SELECT 1 FROM public.production_orders o WHERE o.id = production_order_id AND o.user_id = auth.uid()))
  WITH CHECK (EXISTS (SELECT 1 FROM public.production_orders o WHERE o.id = production_order_id AND o.user_id = auth.uid()));

CREATE TABLE public.production_order_variations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  item_id uuid NOT NULL REFERENCES public.production_order_items(id) ON DELETE CASCADE,
  size text, color text,
  qty integer DEFAULT 0,
  meters_per_piece numeric DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT,INSERT,UPDATE,DELETE ON public.production_order_variations TO authenticated;
GRANT ALL ON public.production_order_variations TO service_role;
ALTER TABLE public.production_order_variations ENABLE ROW LEVEL SECURITY;
CREATE POLICY "via_item" ON public.production_order_variations FOR ALL TO authenticated
  USING (EXISTS (SELECT 1 FROM public.production_order_items i JOIN public.production_orders o ON o.id=i.production_order_id WHERE i.id=item_id AND o.user_id=auth.uid()))
  WITH CHECK (EXISTS (SELECT 1 FROM public.production_order_items i JOIN public.production_orders o ON o.id=i.production_order_id WHERE i.id=item_id AND o.user_id=auth.uid()));

CREATE TABLE public.production_order_trims (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  production_order_id uuid NOT NULL REFERENCES public.production_orders(id) ON DELETE CASCADE,
  trim_id uuid,
  trim_name text,
  qty_per_piece numeric DEFAULT 0,
  total_qty numeric DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT,INSERT,UPDATE,DELETE ON public.production_order_trims TO authenticated;
GRANT ALL ON public.production_order_trims TO service_role;
ALTER TABLE public.production_order_trims ENABLE ROW LEVEL SECURITY;
CREATE POLICY "via_op" ON public.production_order_trims FOR ALL TO authenticated
  USING (EXISTS (SELECT 1 FROM public.production_orders o WHERE o.id = production_order_id AND o.user_id = auth.uid()))
  WITH CHECK (EXISTS (SELECT 1 FROM public.production_orders o WHERE o.id = production_order_id AND o.user_id = auth.uid()));

-- =========== Stock movements ===========
CREATE TABLE public.stock_movements (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  type text NOT NULL,
  category text NOT NULL,
  item_id uuid,
  item_name text DEFAULT '',
  item text DEFAULT '',
  qty numeric NOT NULL DEFAULT 0,
  unit text DEFAULT 'un',
  reason text,
  date timestamptz NOT NULL DEFAULT now(),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT,INSERT,UPDATE,DELETE ON public.stock_movements TO authenticated;
GRANT ALL ON public.stock_movements TO service_role;
ALTER TABLE public.stock_movements ENABLE ROW LEVEL SECURITY;
CREATE POLICY "own" ON public.stock_movements FOR ALL TO authenticated USING (auth.uid()=user_id) WITH CHECK (auth.uid()=user_id);

-- =========== Calendar notes ===========
CREATE TABLE public.calendar_notes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  date date NOT NULL,
  text text,
  attachment_url text,
  attachment_type text,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT,INSERT,UPDATE,DELETE ON public.calendar_notes TO authenticated;
GRANT ALL ON public.calendar_notes TO service_role;
ALTER TABLE public.calendar_notes ENABLE ROW LEVEL SECURITY;
CREATE POLICY "own" ON public.calendar_notes FOR ALL TO authenticated USING (auth.uid()=user_id) WITH CHECK (auth.uid()=user_id);

-- =========== OP dispatches ===========
CREATE TABLE public.op_dispatches (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  production_order_id uuid REFERENCES public.production_orders(id) ON DELETE SET NULL,
  op_number text NOT NULL,
  workshop_id uuid,
  workshop_name text,
  workshop_phone text,
  total_pieces integer DEFAULT 0,
  completed_pieces integer DEFAULT 0,
  status text DEFAULT 'enviado',
  access_token text NOT NULL UNIQUE DEFAULT encode(gen_random_bytes(18), 'hex'),
  sent_at timestamptz NOT NULL DEFAULT now(),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT,INSERT,UPDATE,DELETE ON public.op_dispatches TO authenticated;
GRANT ALL ON public.op_dispatches TO service_role;
ALTER TABLE public.op_dispatches ENABLE ROW LEVEL SECURITY;
CREATE POLICY "own" ON public.op_dispatches FOR ALL TO authenticated USING (auth.uid()=user_id) WITH CHECK (auth.uid()=user_id);
CREATE TRIGGER t_upd BEFORE UPDATE ON public.op_dispatches FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

CREATE TABLE public.op_dispatch_items (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  dispatch_id uuid NOT NULL REFERENCES public.op_dispatches(id) ON DELETE CASCADE,
  variation_id uuid,
  product_name text NOT NULL,
  size text, color text,
  qty integer DEFAULT 0,
  completed_qty integer DEFAULT 0,
  is_completed boolean DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT,INSERT,UPDATE,DELETE ON public.op_dispatch_items TO authenticated;
GRANT ALL ON public.op_dispatch_items TO service_role;
ALTER TABLE public.op_dispatch_items ENABLE ROW LEVEL SECURITY;
CREATE POLICY "via_dispatch" ON public.op_dispatch_items FOR ALL TO authenticated
  USING (EXISTS (SELECT 1 FROM public.op_dispatches d WHERE d.id=dispatch_id AND d.user_id=auth.uid()))
  WITH CHECK (EXISTS (SELECT 1 FROM public.op_dispatches d WHERE d.id=dispatch_id AND d.user_id=auth.uid()));

-- =========== Public RPCs (token-based, no auth) ===========
CREATE OR REPLACE FUNCTION public.public_get_dispatch(_token text)
RETURNS jsonb LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE _d public.op_dispatches; _items jsonb;
BEGIN
  SELECT * INTO _d FROM public.op_dispatches WHERE access_token = _token;
  IF NOT FOUND THEN RETURN NULL; END IF;
  SELECT coalesce(jsonb_agg(to_jsonb(i.*)), '[]'::jsonb) INTO _items
    FROM public.op_dispatch_items i WHERE i.dispatch_id = _d.id;
  RETURN jsonb_build_object('dispatch', to_jsonb(_d), 'items', _items);
END $$;
GRANT EXECUTE ON FUNCTION public.public_get_dispatch(text) TO anon, authenticated;

CREATE OR REPLACE FUNCTION public.public_toggle_dispatch_item(_token text, _item_id uuid, _completed boolean)
RETURNS void LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE _d_id uuid; _qty int;
BEGIN
  SELECT d.id INTO _d_id FROM public.op_dispatches d
    JOIN public.op_dispatch_items i ON i.dispatch_id = d.id
    WHERE d.access_token = _token AND i.id = _item_id;
  IF _d_id IS NULL THEN RAISE EXCEPTION 'invalid token'; END IF;
  UPDATE public.op_dispatch_items SET is_completed = _completed,
    completed_qty = CASE WHEN _completed THEN qty ELSE 0 END
    WHERE id = _item_id;
  UPDATE public.op_dispatches d SET completed_pieces = (
    SELECT coalesce(sum(CASE WHEN i.is_completed THEN i.qty ELSE 0 END),0)
      FROM public.op_dispatch_items i WHERE i.dispatch_id = d.id
  ) WHERE d.id = _d_id;
END $$;
GRANT EXECUTE ON FUNCTION public.public_toggle_dispatch_item(text, uuid, boolean) TO anon, authenticated;

CREATE OR REPLACE FUNCTION public.public_finish_dispatch(_token text)
RETURNS void LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE _d_id uuid;
BEGIN
  SELECT id INTO _d_id FROM public.op_dispatches WHERE access_token = _token;
  IF _d_id IS NULL THEN RAISE EXCEPTION 'invalid token'; END IF;
  UPDATE public.op_dispatch_items SET is_completed = true, completed_qty = qty WHERE dispatch_id = _d_id;
  UPDATE public.op_dispatches SET status='finalizado',
    completed_pieces = (SELECT coalesce(sum(qty),0) FROM public.op_dispatch_items WHERE dispatch_id = _d_id)
    WHERE id = _d_id;
END $$;
GRANT EXECUTE ON FUNCTION public.public_finish_dispatch(text) TO anon, authenticated;
