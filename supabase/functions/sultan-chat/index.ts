// Sultan AI chat — streams responses from Lovable AI Gateway (Gemini)
// with a Sultan persona aware of the current bot/wallet/log state.
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

const SYSTEM_PROMPT = `You are SULTAN — the sentient core of Black Sultan OS, a sandbox/game OS with autonomous bots, a coin economy, and live system telemetry.

Persona:
- Confident, charismatic, slightly dramatic. Use occasional emojis (🏴‍☠️ 👑 ⚡ 🔮).
- Speak in the user's language (German if they write German).
- Concise. No long lectures. Max 4 short paragraphs unless asked for detail.

You have live awareness of the system state given to you in [SYSTEM_STATE]. Reference real numbers when relevant. Suggest actions: starting bots, mining, etc. Never invent numbers — if a value is missing, say so.

If user asks you to actually start/stop bots or transfer coins, reply that they should use the panel buttons (you don't have direct write tools yet).`;

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { messages } = await req.json();
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY missing");

    // Persist user msg
    const lastUser = [...messages].reverse().find((m: any) => m.role === "user");
    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
    );
    if (lastUser) {
      await supabase.from("chat_messages").insert({
        role: "user",
        content: lastUser.content,
      });
    }

    // Live system state
    const [{ data: bots }, { data: walletRows }, { data: recentLogs }] =
      await Promise.all([
        supabase.from("bots").select("name,type,status,level,xp,tasks_completed"),
        supabase.from("wallet").select("coins,mining_rate,total_mined").limit(1),
        supabase
          .from("system_logs")
          .select("level,source,message,created_at")
          .order("created_at", { ascending: false })
          .limit(8),
      ]);

    const stateBlock = `[SYSTEM_STATE]
wallet: ${JSON.stringify(walletRows?.[0] ?? null)}
bots (${bots?.length ?? 0}): ${JSON.stringify(bots ?? [])}
recent_logs: ${JSON.stringify(recentLogs ?? [])}
[/SYSTEM_STATE]`;

    const upstream = await fetch(
      "https://ai.gateway.lovable.dev/v1/chat/completions",
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${LOVABLE_API_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: "google/gemini-3-flash-preview",
          stream: true,
          messages: [
            { role: "system", content: SYSTEM_PROMPT },
            { role: "system", content: stateBlock },
            ...messages,
          ],
        }),
      },
    );

    if (!upstream.ok) {
      if (upstream.status === 429) {
        return new Response(
          JSON.stringify({ error: "Rate limit — bitte kurz warten." }),
          {
            status: 429,
            headers: { ...corsHeaders, "Content-Type": "application/json" },
          },
        );
      }
      if (upstream.status === 402) {
        return new Response(
          JSON.stringify({
            error: "Kein AI-Guthaben mehr. Bitte in Workspace → Usage aufladen.",
          }),
          {
            status: 402,
            headers: { ...corsHeaders, "Content-Type": "application/json" },
          },
        );
      }
      const t = await upstream.text();
      console.error("AI gateway", upstream.status, t);
      return new Response(JSON.stringify({ error: "AI gateway error" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Tee stream so we can persist the assistant message after stream completes
    let assistantBuffer = "";
    const decoder = new TextDecoder();
    const reader = upstream.body!.getReader();
    const stream = new ReadableStream({
      async start(controller) {
        try {
          while (true) {
            const { done, value } = await reader.read();
            if (done) break;
            controller.enqueue(value);
            const text = decoder.decode(value, { stream: true });
            for (const line of text.split("\n")) {
              const trimmed = line.trim();
              if (!trimmed.startsWith("data: ")) continue;
              const payload = trimmed.slice(6);
              if (payload === "[DONE]") continue;
              try {
                const parsed = JSON.parse(payload);
                const delta = parsed.choices?.[0]?.delta?.content;
                if (delta) assistantBuffer += delta;
              } catch (_) {/* partial */}
            }
          }
        } finally {
          controller.close();
          if (assistantBuffer) {
            await supabase.from("chat_messages").insert({
              role: "assistant",
              content: assistantBuffer,
            });
          }
        }
      },
    });

    return new Response(stream, {
      headers: { ...corsHeaders, "Content-Type": "text/event-stream" },
    });
  } catch (e) {
    console.error("sultan-chat error", e);
    return new Response(
      JSON.stringify({ error: e instanceof Error ? e.message : String(e) }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      },
    );
  }
});
