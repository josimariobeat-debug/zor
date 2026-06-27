UPDATE public.fabrics SET operational_cost = 0 WHERE operational_cost IS NULL OR operational_cost < 0;
ALTER TABLE public.fabrics
  ALTER COLUMN operational_cost SET NOT NULL,
  ALTER COLUMN operational_cost SET DEFAULT 0;
ALTER TABLE public.fabrics
  DROP CONSTRAINT IF EXISTS fabrics_operational_cost_non_negative;
ALTER TABLE public.fabrics
  ADD CONSTRAINT fabrics_operational_cost_non_negative
  CHECK (operational_cost >= 0);