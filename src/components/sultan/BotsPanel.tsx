import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Bot, Play, Square, Plus, Trash2 } from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

type BotRow = {
  id: string;
  name: string;
  type: string;
  status: string;
  level: number;
  xp: number;
  tasks_completed: number;
  efficiency: number;
};

const BOT_TYPES = ["runner", "clicker", "wallet", "game", "manager", "healer", "marketing"];

export const BotsPanel = () => {
  const [bots, setBots] = useState<BotRow[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      const { data, error } = await supabase
        .from("bots")
        .select("*")
        .order("created_at");
      if (error) toast.error(error.message);
      else setBots((data ?? []) as BotRow[]);
      setLoading(false);
    };
    load();

    const channel = supabase
      .channel("bots-changes")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "bots" },
        (payload) => {
          setBots((prev) => {
            if (payload.eventType === "INSERT") return [...prev, payload.new as BotRow];
            if (payload.eventType === "UPDATE")
              return prev.map((b) => (b.id === (payload.new as BotRow).id ? (payload.new as BotRow) : b));
            if (payload.eventType === "DELETE")
              return prev.filter((b) => b.id !== (payload.old as BotRow).id);
            return prev;
          });
        },
      )
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  }, []);

  // Heartbeat — calls bot-tick edge function every 4s
  useEffect(() => {
    const id = setInterval(() => {
      supabase.functions.invoke("bot-tick").catch(() => {});
    }, 4000);
    return () => clearInterval(id);
  }, []);

  const toggleBot = async (bot: BotRow) => {
    const newStatus = bot.status === "running" ? "idle" : "running";
    const { error } = await supabase
      .from("bots")
      .update({ status: newStatus })
      .eq("id", bot.id);
    if (error) return toast.error(error.message);
    await supabase.from("system_logs").insert({
      level: newStatus === "running" ? "success" : "info",
      source: bot.name,
      message: `${newStatus === "running" ? "▶ Started" : "⏹ Stopped"}`,
    });
    toast.success(`${bot.name} ${newStatus}`);
  };

  const addBot = async () => {
    const type = BOT_TYPES[Math.floor(Math.random() * BOT_TYPES.length)];
    const idx = bots.length + 1;
    const { error } = await supabase.from("bots").insert({
      name: `${type.charAt(0).toUpperCase() + type.slice(1)}Bot-${String(idx).padStart(2, "0")}`,
      type,
      status: "idle",
    });
    if (error) toast.error(error.message);
    else toast.success("Bot deployed");
  };

  const deleteBot = async (bot: BotRow) => {
    const { error } = await supabase.from("bots").delete().eq("id", bot.id);
    if (error) toast.error(error.message);
  };

  return (
    <Card className="p-6 bg-card/80 backdrop-blur">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-bold flex items-center gap-2">
          <Bot className="w-6 h-6 text-primary" />
          Active Bots <span className="text-sm text-muted-foreground">({bots.length})</span>
        </h2>
        <Button size="sm" variant="default" onClick={addBot}>
          <Plus className="w-4 h-4 mr-1" /> Deploy
        </Button>
      </div>

      <div className="space-y-3 max-h-[420px] overflow-y-auto">
        {loading && <p className="text-sm text-muted-foreground">Loading...</p>}
        {!loading && bots.length === 0 && (
          <p className="text-sm text-muted-foreground">No bots yet. Deploy one.</p>
        )}
        {bots.map((bot) => (
          <div
            key={bot.id}
            className="flex items-center justify-between p-3 rounded-lg bg-muted/30 border border-border/50"
          >
            <div className="flex items-center gap-3 min-w-0">
              <Bot className={`w-5 h-5 ${bot.status === "running" ? "text-primary animate-pulse" : "text-muted-foreground"}`} />
              <div className="min-w-0">
                <p className="font-semibold truncate">{bot.name}</p>
                <div className="flex flex-wrap gap-2 mt-1">
                  <Badge variant={bot.status === "running" ? "default" : "secondary"}>
                    {bot.status}
                  </Badge>
                  <span className="text-xs text-muted-foreground">
                    Lv {bot.level} · XP {bot.xp} · {bot.tasks_completed} tasks
                  </span>
                </div>
              </div>
            </div>
            <div className="flex gap-1 shrink-0">
              <Button
                size="sm"
                variant={bot.status === "running" ? "destructive" : "default"}
                onClick={() => toggleBot(bot)}
              >
                {bot.status === "running" ? <Square className="w-4 h-4" /> : <Play className="w-4 h-4" />}
              </Button>
              <Button size="sm" variant="ghost" onClick={() => deleteBot(bot)}>
                <Trash2 className="w-4 h-4" />
              </Button>
            </div>
          </div>
        ))}
      </div>
    </Card>
  );
};
