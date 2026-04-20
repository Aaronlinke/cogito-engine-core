ALTER TABLE public.dimension_agents
  ADD COLUMN IF NOT EXISTS xp INTEGER NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS last_tick TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS total_generated NUMERIC NOT NULL DEFAULT 0;

CREATE OR REPLACE FUNCTION public.process_agent_tick()
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  _agent RECORD;
  _gen NUMERIC;
  _xp_gain INTEGER;
  _new_xp INTEGER;
  _new_level INTEGER;
  _leveled BOOLEAN;
  _processed INTEGER := 0;
  _total_coins NUMERIC := 0;
  _level_ups INTEGER := 0;
BEGIN
  FOR _agent IN
    SELECT a.id, a.dimension_id, a.category, a.name, a.level, a.xp, a.output, a.status,
           d.active AS dim_active, d.load AS dim_load
    FROM public.dimension_agents a
    JOIN public.dimensions d ON d.id = a.dimension_id
    WHERE a.status = 'active' AND d.active = true
  LOOP
    -- Coin generation: base output × level × dim_load × random(0.7..1.3)
    _gen := GREATEST(0, COALESCE(_agent.output, 0)) * _agent.level
            * COALESCE(_agent.dim_load, 0.5)
            * (0.7 + random() * 0.6) * 0.1;  -- scaled per tick

    -- XP: every tick, more XP for higher-output agents
    _xp_gain := GREATEST(1, FLOOR(2 + COALESCE(_agent.output, 0) / 10 + random() * 3))::INTEGER;
    _new_xp := _agent.xp + _xp_gain;
    _new_level := _agent.level;
    _leveled := false;

    -- Level up loop (handles multi-level if huge XP gain)
    WHILE _new_xp >= _new_level * 100 LOOP
      _new_xp := _new_xp - (_new_level * 100);
      _new_level := _new_level + 1;
      _leveled := true;
      _level_ups := _level_ups + 1;
    END LOOP;

    UPDATE public.dimension_agents
      SET xp = _new_xp,
          level = _new_level,
          total_generated = total_generated + _gen,
          last_tick = now()
      WHERE id = _agent.id;

    IF _gen > 0 THEN
      UPDATE public.dimensions
        SET coins = coins + _gen,
            total_in = total_in + _gen
        WHERE id = _agent.dimension_id;
      _total_coins := _total_coins + _gen;
    END IF;

    IF _leveled THEN
      INSERT INTO public.system_logs (level, source, message, metadata)
        VALUES ('success', 'agent',
          format('%s lvl-up → L%s', _agent.name, _new_level),
          jsonb_build_object('agent_id', _agent.id, 'dimension_id', _agent.dimension_id,
                             'level', _new_level, 'category', _agent.category));
    END IF;

    _processed := _processed + 1;
  END LOOP;

  IF _processed > 0 THEN
    INSERT INTO public.system_logs (level, source, message, metadata)
      VALUES ('info', 'meta-ki',
        format('Agent-Tick: %s aktiv · %s ⛁ generiert · %s lvl-ups',
          _processed, round(_total_coins, 2), _level_ups),
        jsonb_build_object('processed', _processed, 'coins', _total_coins, 'level_ups', _level_ups));
  END IF;

  RETURN jsonb_build_object(
    'processed', _processed,
    'coins_generated', _total_coins,
    'level_ups', _level_ups
  );
END;
$$;