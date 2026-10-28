-- Atomic stock decrement. Run in the Supabase SQL Editor.
-- products.id is UUID (see schema.sql).

CREATE OR REPLACE FUNCTION public.decrement_stock(p_id uuid, qty integer)
RETURNS boolean
LANGUAGE plpgsql
SECURITY INVOKER
SET search_path = public
AS $$
DECLARE
  updated integer;
BEGIN
  IF qty IS NULL OR qty <= 0 THEN
    RETURN false;
  END IF;

  UPDATE public.products
  SET stock = stock - qty
  WHERE id = p_id
    AND stock >= qty;

  GET DIAGNOSTICS updated = ROW_COUNT;
  RETURN updated = 1;
END;
$$;

-- Used only to roll back a partial decrement if a later line item fails.
CREATE OR REPLACE FUNCTION public.increment_stock(p_id uuid, qty integer)
RETURNS boolean
LANGUAGE plpgsql
SECURITY INVOKER
SET search_path = public
AS $$
DECLARE
  updated integer;
BEGIN
  IF qty IS NULL OR qty <= 0 THEN
    RETURN false;
  END IF;

  UPDATE public.products
  SET stock = stock + qty
  WHERE id = p_id;

  GET DIAGNOSTICS updated = ROW_COUNT;
  RETURN updated = 1;
END;
$$;

-- Idempotency flag so Razorpay verify + webhook cannot decrement twice.
ALTER TABLE public.orders
  ADD COLUMN IF NOT EXISTS stock_decremented BOOLEAN NOT NULL DEFAULT false;

REVOKE ALL ON FUNCTION public.decrement_stock(uuid, integer) FROM PUBLIC, anon, authenticated;
REVOKE ALL ON FUNCTION public.increment_stock(uuid, integer) FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.decrement_stock(uuid, integer) TO service_role;
GRANT EXECUTE ON FUNCTION public.increment_stock(uuid, integer) TO service_role;
