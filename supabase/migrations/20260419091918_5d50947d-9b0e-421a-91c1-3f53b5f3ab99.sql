-- Bots table
CREATE TABLE public.bots (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  type TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'idle',
  level INT NOT NULL DEFAULT 1,
  xp INT NOT NULL DEFAULT 0,
  tasks_completed INT NOT NULL DEFAULT 0,
  efficiency NUMERIC NOT NULL DEFAULT 1.0,
  last_tick TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Wallet table (single global wallet for now, no auth)
CREATE TABLE public.wallet (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL DEFAULT 'Sultan Treasury',
  coins NUMERIC NOT NULL DEFAULT 1000,
  mining_rate NUMERIC NOT NULL DEFAULT 0,
  total_mined NUMERIC NOT NULL DEFAULT 0,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Transactions
CREATE TABLE public.transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  wallet_id UUID REFERENCES public.wallet(id) ON DELETE CASCADE,
  bot_id UUID REFERENCES public.bots(id) ON DELETE SET NULL,
  amount NUMERIC NOT NULL,
  kind TEXT NOT NULL,
  description TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- System logs
CREATE TABLE public.system_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  level TEXT NOT NULL DEFAULT 'info',
  source TEXT NOT NULL,
  message TEXT NOT NULL,
  metadata JSONB,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Chat messages (Sultan AI)
CREATE TABLE public.chat_messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  role TEXT NOT NULL,
  content TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.bots ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.wallet ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.system_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.chat_messages ENABLE ROW LEVEL SECURITY;

-- Permissive policies (no auth yet) — public sandbox
CREATE POLICY "public read bots" ON public.bots FOR SELECT USING (true);
CREATE POLICY "public write bots" ON public.bots FOR ALL USING (true) WITH CHECK (true);

CREATE POLICY "public read wallet" ON public.wallet FOR SELECT USING (true);
CREATE POLICY "public write wallet" ON public.wallet FOR ALL USING (true) WITH CHECK (true);

CREATE POLICY "public read tx" ON public.transactions FOR SELECT USING (true);
CREATE POLICY "public write tx" ON public.transactions FOR ALL USING (true) WITH CHECK (true);

CREATE POLICY "public read logs" ON public.system_logs FOR SELECT USING (true);
CREATE POLICY "public write logs" ON public.system_logs FOR ALL USING (true) WITH CHECK (true);

CREATE POLICY "public read chat" ON public.chat_messages FOR SELECT USING (true);
CREATE POLICY "public write chat" ON public.chat_messages FOR ALL USING (true) WITH CHECK (true);

-- updated_at trigger function
CREATE OR REPLACE FUNCTION public.touch_updated_at()
RETURNS TRIGGER LANGUAGE plpgsql SET search_path = public AS $$
BEGIN NEW.updated_at = now(); RETURN NEW; END; $$;

CREATE TRIGGER touch_bots BEFORE UPDATE ON public.bots
  FOR EACH ROW EXECUTE FUNCTION public.touch_updated_at();
CREATE TRIGGER touch_wallet BEFORE UPDATE ON public.wallet
  FOR EACH ROW EXECUTE FUNCTION public.touch_updated_at();

-- Realtime
ALTER TABLE public.bots REPLICA IDENTITY FULL;
ALTER TABLE public.wallet REPLICA IDENTITY FULL;
ALTER TABLE public.transactions REPLICA IDENTITY FULL;
ALTER TABLE public.system_logs REPLICA IDENTITY FULL;
ALTER TABLE public.chat_messages REPLICA IDENTITY FULL;

ALTER PUBLICATION supabase_realtime ADD TABLE public.bots;
ALTER PUBLICATION supabase_realtime ADD TABLE public.wallet;
ALTER PUBLICATION supabase_realtime ADD TABLE public.transactions;
ALTER PUBLICATION supabase_realtime ADD TABLE public.system_logs;
ALTER PUBLICATION supabase_realtime ADD TABLE public.chat_messages;

-- Seed: wallet + initial bots + welcome log
INSERT INTO public.wallet (name, coins, mining_rate) VALUES ('Sultan Treasury', 1000, 0);

INSERT INTO public.bots (name, type, status) VALUES
  ('RunnerBot-01', 'runner', 'idle'),
  ('ClickerBot-02', 'clicker', 'idle'),
  ('WalletBot-03', 'wallet', 'idle'),
  ('GameBot-04', 'game', 'idle'),
  ('ManagerBot-05', 'manager', 'idle'),
  ('HealerBot-06', 'healer', 'idle');

INSERT INTO public.system_logs (level, source, message) VALUES
  ('info', 'CORE', '🏴‍☠️ Black Sultan OS initialized'),
  ('success', 'DB', 'All tables online, RLS active'),
  ('info', 'AI', 'Sultan persona loaded');