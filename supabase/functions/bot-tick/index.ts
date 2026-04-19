// Bot tick: simulates work for all 'running' bots — adds XP, completes tasks,
// mines coins into the wallet, and writes system logs. Designed to be called
// from the frontend on a heartbeat (every few seconds).
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
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
    );

    // Get running bots
    const { data: bots, error: botsErr } = await supabase
      .from("bots")
      .select("*")
      .eq("status", "running");
    if (botsErr) throw botsErr;

    if (!bots || bots.length === 0) {
      // Set mining_rate=0 if nothing is running
      await supabase
        .from("wallet")
        .update({ mining_rate: 0 })
        .gte("coins", 0);
      return new Response(JSON.stringify({ ticked: 0 }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Pull current wallet (single row)
    const { data: walletRows } = await supabase.from("wallet").select("*").limit(1);
    const wallet = walletRows?.[0];
    if (!wallet) throw new Error("No wallet row");

    let totalCoinsEarned = 0;
    const logs: Array<{ level: string; source: string; message: string }> = [];
    const txs: Array<{
      wallet_id: string;
      bot_id: string;
      amount: number;
      kind: string;
      description: string;
    }> = [];

    for (const bot of bots) {
      const efficiency = Number(bot.efficiency ?? 1);
      const xpGain = Math.floor(5 + Math.random() * 10 * efficiency);
      const taskGain = Math.random() < 0.6 ? 1 : 0;
      const coinGain = +(0.5 + Math.random() * 2.5 * efficiency).toFixed(2);

      const newXp = (bot.xp ?? 0) + xpGain;
      let newLevel = bot.level ?? 1;
      // level up every 100 xp
      while (newXp >= newLevel * 100) newLevel += 1;

      await supabase
        .from("bots")
        .update({
          xp: newXp,
          level: newLevel,
          tasks_completed: (bot.tasks_completed ?? 0) + taskGain,
          last_tick: new Date().toISOString(),
        })
        .eq("id", bot.id);

      totalCoinsEarned += coinGain;
      txs.push({
        wallet_id: wallet.id,
        bot_id: bot.id,
        amount: coinGain,
        kind: "mine",
        description: `${bot.name} mined ${coinGain} coins`,
      });

      if (newLevel > (bot.level ?? 1)) {
        logs.push({
          level: "success",
          source: bot.name,
          message: `🎉 Level up → ${newLevel}`,
        });
      }
    }

    // Update wallet
    await supabase
      .from("wallet")
      .update({
        coins: Number(wallet.coins) + totalCoinsEarned,
        total_mined: Number(wallet.total_mined) + totalCoinsEarned,
        mining_rate: +(totalCoinsEarned).toFixed(2),
      })
      .eq("id", wallet.id);

    if (txs.length) await supabase.from("transactions").insert(txs);
    if (logs.length) await supabase.from("system_logs").insert(logs);

    // Heartbeat log (low frequency)
    if (Math.random() < 0.2) {
      await supabase.from("system_logs").insert({
        level: "info",
        source: "TICK",
        message: `⚡ ${bots.length} bots ticked, +${totalCoinsEarned.toFixed(2)} coins`,
      });
    }

    return new Response(
      JSON.stringify({ ticked: bots.length, mined: totalCoinsEarned }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );
  } catch (e) {
    console.error("bot-tick error", e);
    return new Response(
      JSON.stringify({ error: e instanceof Error ? e.message : String(e) }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      },
    );
  }
});
