-- Dimensions table (12 Glaskugeln)
CREATE TABLE public.dimensions (
  id INTEGER PRIMARY KEY,
  name TEXT NOT NULL,
  glyph TEXT NOT NULL,
  hue INTEGER NOT NULL,
  coins NUMERIC NOT NULL DEFAULT 100,
  load NUMERIC NOT NULL DEFAULT 0.5,
  sync NUMERIC NOT NULL DEFAULT 0.7,
  active BOOLEAN NOT NULL DEFAULT true,
  total_in NUMERIC NOT NULL DEFAULT 0,
  total_out NUMERIC NOT NULL DEFAULT 0,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.dimensions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "public read dimensions" ON public.dimensions FOR SELECT USING (true);
CREATE POLICY "public write dimensions" ON public.dimensions FOR ALL USING (true) WITH CHECK (true);

CREATE TRIGGER touch_dimensions_updated_at
  BEFORE UPDATE ON public.dimensions
  FOR EACH ROW EXECUTE FUNCTION public.touch_updated_at();

-- Cross-dimension flows table (real transactions between dimensions)
CREATE TABLE public.dimension_flows (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  from_dim INTEGER NOT NULL REFERENCES public.dimensions(id),
  to_dim INTEGER NOT NULL REFERENCES public.dimensions(id),
  amount NUMERIC NOT NULL,
  reason TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.dimension_flows ENABLE ROW LEVEL SECURITY;

CREATE POLICY "public read flows" ON public.dimension_flows FOR SELECT USING (true);
CREATE POLICY "public write flows" ON public.dimension_flows FOR ALL USING (true) WITH CHECK (true);

CREATE INDEX idx_flows_created ON public.dimension_flows(created_at DESC);

-- Realtime
ALTER TABLE public.dimensions REPLICA IDENTITY FULL;
ALTER TABLE public.dimension_flows REPLICA IDENTITY FULL;
ALTER PUBLICATION supabase_realtime ADD TABLE public.dimensions;
ALTER PUBLICATION supabase_realtime ADD TABLE public.dimension_flows;

-- Seed 12 dimensions
INSERT INTO public.dimensions (id, name, glyph, hue, coins, load, sync, active) VALUES
  (1,  'Cognitio', 'Ψ',  217, 320, 0.55, 0.82, true),
  (2,  'Aurum',    'Au',  45, 540, 0.70, 0.91, true),
  (3,  'Mercatus', '₿',  142, 410, 0.65, 0.78, true),
  (4,  'Ludus',    '◊',  280, 280, 0.45, 0.74, true),
  (5,  'Forum',    'Ω',  320, 220, 0.40, 0.69, true),
  (6,  'Quantum',  'Q',  190, 380, 0.60, 0.88, true),
  (7,  'Reflexio', '↻',   30, 190, 0.35, 0.72, true),
  (8,  'Nexus',    '∞',  260, 460, 0.75, 0.85, true),
  (9,  'Genesis',  '✦',  100, 310, 0.50, 0.80, true),
  (10, 'Abyssus',  '▼',  350, 150, 0.30, 0.60, false),
  (11, 'Veritas',  '△',   60, 270, 0.55, 0.83, true),
  (12, 'Fatum',    '✧',  240, 200, 0.40, 0.67, true);

-- Atomic flow function: transfer coins between two dimensions and record flow + log
CREATE OR REPLACE FUNCTION public.execute_dimension_flow(
  _from INTEGER,
  _to INTEGER,
  _amount NUMERIC,
  _reason TEXT DEFAULT 'cross-dim sync'
)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  _flow_id UUID;
  _from_coins NUMERIC;
BEGIN
  IF _from = _to THEN RAISE EXCEPTION 'from and to must differ'; END IF;
  IF _amount <= 0 THEN RAISE EXCEPTION 'amount must be positive'; END IF;

  SELECT coins INTO _from_coins FROM public.dimensions WHERE id = _from FOR UPDATE;
  IF _from_coins IS NULL THEN RAISE EXCEPTION 'source dimension not found'; END IF;
  IF _from_coins < _amount THEN _amount := _from_coins * 0.5; END IF;
  IF _amount <= 0 THEN RETURN NULL; END IF;

  UPDATE public.dimensions
    SET coins = coins - _amount, total_out = total_out + _amount
    WHERE id = _from;
  UPDATE public.dimensions
    SET coins = coins + _amount, total_in = total_in + _amount
    WHERE id = _to;

  INSERT INTO public.dimension_flows (from_dim, to_dim, amount, reason)
    VALUES (_from, _to, _amount, _reason)
    RETURNING id INTO _flow_id;

  INSERT INTO public.system_logs (level, source, message, metadata)
    VALUES ('info', 'meta-ki', format('Flow %s → %s : %s ⛁', _from, _to, round(_amount, 2)),
      jsonb_build_object('from', _from, 'to', _to, 'amount', _amount, 'reason', _reason));

  RETURN _flow_id;
END;
$$;