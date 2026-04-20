import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    let body: any = {};
    try {
      body = await req.json();
    } catch (_) {
      body = {};
    }

    const auto = body.auto !== false; // default: auto-pick
    let from = Number(body.from);
    let to = Number(body.to);
    let amount = Number(body.amount);
    const reason: string = typeof body.reason === "string" ? body.reason : "cross-dim sync";

    // Load dimensions
    const { data: dims, error: dimErr } = await supabase
      .from("dimensions")
      .select("id, coins, load, sync, active")
      .order("id");

    if (dimErr || !dims || dims.length === 0) {
      return new Response(
        JSON.stringify({ error: "no dimensions" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const active = dims.filter((d: any) => d.active);
    if (active.length < 2) {
      return new Response(
        JSON.stringify({ skipped: true, reason: "not enough active dimensions" }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    if (auto || !from || !to) {
      // Pick richest active as source, weighted random target
      const sorted = [...active].sort((a: any, b: any) => Number(b.coins) - Number(a.coins));
      const source = sorted[Math.floor(Math.random() * Math.min(4, sorted.length))];
      const candidates = active.filter((d: any) => d.id !== source.id);
      const target = candidates[Math.floor(Math.random() * candidates.length)];
      from = source.id;
      to = target.id;
      const srcCoins = Number(source.coins);
      amount = Math.max(1, Math.min(srcCoins * 0.08, Math.random() * 25 + 5));
    }

    if (!Number.isFinite(from) || !Number.isFinite(to) || !Number.isFinite(amount)) {
      return new Response(
        JSON.stringify({ error: "invalid from/to/amount" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Tick natural state evolution on all dims
    const updates = active.map((d: any) => {
      const newLoad = Math.max(0.15, Math.min(1, Number(d.load) + (Math.random() * 0.1 - 0.05)));
      const newSync = Math.max(0.4, Math.min(1, Number(d.sync) + (Math.random() * 0.06 - 0.03)));
      return supabase
        .from("dimensions")
        .update({ load: newLoad, sync: newSync })
        .eq("id", d.id);
    });
    await Promise.all(updates);

    // Execute atomic flow via SQL function
    const { data: flowId, error: flowErr } = await supabase.rpc("execute_dimension_flow", {
      _from: from,
      _to: to,
      _amount: amount,
      _reason: reason,
    });

    if (flowErr) {
      return new Response(
        JSON.stringify({ error: flowErr.message }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    return new Response(
      JSON.stringify({ ok: true, flow_id: flowId, from, to, amount }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (e) {
    return new Response(
      JSON.stringify({ error: String(e) }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
