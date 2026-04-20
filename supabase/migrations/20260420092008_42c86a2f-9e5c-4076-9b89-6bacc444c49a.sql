CREATE TABLE public.dimension_agents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  dimension_id INTEGER NOT NULL REFERENCES public.dimensions(id) ON DELETE CASCADE,
  category TEXT NOT NULL,
  name TEXT NOT NULL,
  role TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'active',
  level INTEGER NOT NULL DEFAULT 1,
  output NUMERIC NOT NULL DEFAULT 0,
  metadata JSONB,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.dimension_agents ENABLE ROW LEVEL SECURITY;
CREATE POLICY "public read agents" ON public.dimension_agents FOR SELECT USING (true);
CREATE POLICY "public write agents" ON public.dimension_agents FOR ALL USING (true) WITH CHECK (true);

CREATE INDEX idx_agents_dim ON public.dimension_agents(dimension_id);
CREATE INDEX idx_agents_cat ON public.dimension_agents(dimension_id, category);

CREATE TRIGGER touch_agents_updated_at
  BEFORE UPDATE ON public.dimension_agents
  FOR EACH ROW EXECUTE FUNCTION public.touch_updated_at();

ALTER TABLE public.dimension_agents REPLICA IDENTITY FULL;
ALTER PUBLICATION supabase_realtime ADD TABLE public.dimension_agents;

-- Seed agents for all 12 dimensions
INSERT INTO public.dimension_agents (dimension_id, category, name, role, level, output)
SELECT d.id, t.category, t.name || ' #' || d.id, t.role, t.level, t.output
FROM public.dimensions d
CROSS JOIN (VALUES
  ('haupt_bot',   'Free-Cash Generator',  'Hauptverdiener der Dimension', 5, 120),
  ('gehirn_bot',  'Decision Cortex',      'Entscheidungslogik & Strategie', 4, 0),
  ('manager_bot', 'Manager Alpha',        'Optimierung & Kontrolle', 3, 0),
  ('manager_bot', 'Manager Beta',         'Risiko & Compliance', 3, 0),
  ('forscher',    'Datenanalyst',         'Pattern-Detection & Rückrechnung', 3, 0),
  ('forscher',    'Kausalität-Prüfer',    'DKA / KAA Validierung', 2, 0),
  ('umfrage',     'Feedback-Sensor',      'Nutzerverhalten tracken', 2, 0),
  ('marketing',   'TikTok-Agent',         'Viral-Content Generator', 4, 80),
  ('marketing',   'Facebook-Agent',       'Ads & Reach-Optimierung', 3, 60),
  ('marketing',   'Dropship-Operator',    'Revenue-Pipeline', 3, 95),
  ('npc',         'Mini-Bot Trader',      'Coins generieren & handeln', 2, 25),
  ('npc',         'Mini-Bot Builder',     'Welt verbessern, Software bauen', 2, 18),
  ('npc',         'Mini-Bot Quest-NPC',   'Spieler-Interaktion', 1, 12)
) AS t(category, name, role, level, output);