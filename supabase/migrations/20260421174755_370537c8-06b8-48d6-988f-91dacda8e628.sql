ALTER TABLE public.dimensions REPLICA IDENTITY FULL;
ALTER TABLE public.dimension_flows REPLICA IDENTITY FULL;
ALTER TABLE public.system_logs REPLICA IDENTITY FULL;

DO $$
BEGIN
  BEGIN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.dimension_flows;
  EXCEPTION WHEN duplicate_object THEN NULL;
  END;
  BEGIN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.system_logs;
  EXCEPTION WHEN duplicate_object THEN NULL;
  END;
END $$;