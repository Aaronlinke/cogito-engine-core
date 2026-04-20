import { useEffect, useState } from "react";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from "@/components/ui/sheet";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { supabase } from "@/integrations/supabase/client";
import { Brain, Cog, FlaskConical, Megaphone, Users, Sparkles, Power } from "lucide-react";
import { toast } from "sonner";

interface Dimension {
  id: number;
  name: string;
  glyph: string;
  hue: number;
  coins: number;
  load: number;
  sync: number;
  active: boolean;
  total_in: number;
  total_out: number;
}

interface Agent {
  id: string;
  dimension_id: number;
  category: string;
  name: string;
  role: string;
  status: string;
  level: number;
  output: number;
}

const CATEGORIES: Record<
  string,
  { label: string; icon: typeof Brain; color: string }
> = {
  haupt_bot: { label: "Haupt-Bot", icon: Sparkles, color: "text-accent" },
  gehirn_bot: { label: "Gehirn-Bot", icon: Brain, color: "text-primary" },
  manager_bot: { label: "Manager-Bots", icon: Cog, color: "text-secondary" },
  forscher: { label: "Forscherteam", icon: FlaskConical, color: "text-primary" },
  umfrage: { label: "Umfrage & Feedback", icon: Users, color: "text-muted-foreground" },
  marketing: { label: "Marketing & Dropshipping", icon: Megaphone, color: "text-accent" },
  npc: { label: "NPC-Bots / Exo-System", icon: Users, color: "text-secondary" },
};

const ORDER = ["haupt_bot", "gehirn_bot", "manager_bot", "forscher", "umfrage", "marketing", "npc"];

export const DimensionDetailSheet = ({
  dimension,
  open,
  onOpenChange,
}: {
  dimension: Dimension | null;
  open: boolean;
  onOpenChange: (v: boolean) => void;
}) => {
  const [agents, setAgents] = useState<Agent[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!dimension || !open) return;
    setLoading(true);
    supabase
      .from("dimension_agents")
      .select("*")
      .eq("dimension_id", dimension.id)
      .order("category")
      .then(({ data }) => {
        if (data) setAgents(data as Agent[]);
        setLoading(false);
      });

    const channel = supabase
      .channel(`dim-agents-${dimension.id}`)
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "dimension_agents",
          filter: `dimension_id=eq.${dimension.id}`,
        },
        (payload: any) => {
          if (payload.eventType === "UPDATE") {
            setAgents((prev) =>
              prev.map((a) => (a.id === payload.new.id ? { ...a, ...payload.new } : a))
            );
          } else if (payload.eventType === "INSERT") {
            setAgents((prev) => [...prev, payload.new as Agent]);
          } else if (payload.eventType === "DELETE") {
            setAgents((prev) => prev.filter((a) => a.id !== payload.old.id));
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [dimension, open]);

  if (!dimension) return null;

  const grouped = ORDER.map((cat) => ({
    category: cat,
    items: agents.filter((a) => a.category === cat),
  })).filter((g) => g.items.length > 0);

  const toggleDimension = async () => {
    const { error } = await supabase
      .from("dimensions")
      .update({ active: !dimension.active })
      .eq("id", dimension.id);
    if (error) toast.error(error.message);
    else toast.success(dimension.active ? "Dimension deaktiviert" : "Dimension aktiviert");
  };

  const toggleAgent = async (agent: Agent) => {
    const newStatus = agent.status === "active" ? "idle" : "active";
    const { error } = await supabase
      .from("dimension_agents")
      .update({ status: newStatus })
      .eq("id", agent.id);
    if (error) toast.error(error.message);
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent
        side="right"
        className="w-full overflow-hidden sm:max-w-md"
        style={{
          background: `linear-gradient(180deg, hsl(${dimension.hue} 40% 12%), hsl(var(--card)))`,
        }}
      >
        <SheetHeader>
          <div className="flex items-center gap-3">
            <div
              className="flex h-12 w-12 items-center justify-center rounded-full border text-xl font-bold"
              style={{
                borderColor: `hsl(${dimension.hue} 80% 60%)`,
                background: `radial-gradient(circle at 30% 30%, hsl(${dimension.hue} 80% 60% / 0.4), hsl(${dimension.hue} 80% 30% / 0.6))`,
                color: `hsl(${dimension.hue} 90% 85%)`,
                boxShadow: `0 0 20px hsl(${dimension.hue} 80% 60% / 0.4)`,
              }}
            >
              {dimension.glyph}
            </div>
            <div className="flex-1 text-left">
              <SheetTitle className="text-xl">
                {dimension.id}. {dimension.name}
              </SheetTitle>
              <SheetDescription className="text-xs">
                Glaskugel · Dimension {dimension.id}
              </SheetDescription>
            </div>
            <Button
              size="sm"
              variant={dimension.active ? "default" : "outline"}
              onClick={toggleDimension}
              className="gap-1"
            >
              <Power className="h-3 w-3" />
              {dimension.active ? "Aktiv" : "Off"}
            </Button>
          </div>
        </SheetHeader>

        <div className="mt-4 grid grid-cols-3 gap-2 text-center text-xs">
          <div className="rounded-md border border-border/50 bg-card/40 p-2">
            <div className="font-mono text-base text-accent">
              {Number(dimension.coins).toFixed(0)}
            </div>
            <div className="text-[10px] uppercase text-muted-foreground">Coins</div>
          </div>
          <div className="rounded-md border border-border/50 bg-card/40 p-2">
            <div className="font-mono text-base text-primary">
              {(Number(dimension.load) * 100).toFixed(0)}%
            </div>
            <div className="text-[10px] uppercase text-muted-foreground">Load</div>
          </div>
          <div className="rounded-md border border-border/50 bg-card/40 p-2">
            <div className="font-mono text-base text-secondary">
              {(Number(dimension.sync) * 100).toFixed(0)}%
            </div>
            <div className="text-[10px] uppercase text-muted-foreground">Sync</div>
          </div>
        </div>

        <div className="mt-2 grid grid-cols-2 gap-2 text-center text-[10px]">
          <div className="rounded-md border border-border/50 bg-card/30 p-1.5">
            <span className="text-muted-foreground">In: </span>
            <span className="font-mono text-primary">
              {Number(dimension.total_in).toFixed(0)} ⛁
            </span>
          </div>
          <div className="rounded-md border border-border/50 bg-card/30 p-1.5">
            <span className="text-muted-foreground">Out: </span>
            <span className="font-mono text-accent">
              {Number(dimension.total_out).toFixed(0)} ⛁
            </span>
          </div>
        </div>

        <ScrollArea className="mt-4 h-[calc(100vh-340px)] pr-3">
          {loading ? (
            <div className="py-8 text-center text-sm text-muted-foreground">
              Lade Agenten…
            </div>
          ) : (
            <div className="space-y-4 pb-6">
              {grouped.map(({ category, items }) => {
                const meta = CATEGORIES[category];
                const Icon = meta?.icon ?? Users;
                return (
                  <div key={category}>
                    <h3 className="mb-2 flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-muted-foreground">
                      <Icon className={`h-3.5 w-3.5 ${meta?.color ?? ""}`} />
                      {meta?.label ?? category}
                      <span className="ml-auto font-mono text-[10px]">{items.length}</span>
                    </h3>
                    <div className="space-y-1.5">
                      {items.map((agent) => (
                        <button
                          key={agent.id}
                          onClick={() => toggleAgent(agent)}
                          className="group flex w-full items-center gap-2 rounded-md border border-border/50 bg-card/40 p-2 text-left transition-colors hover:border-primary/40 hover:bg-card/70"
                        >
                          <div
                            className={`h-2 w-2 shrink-0 rounded-full ${
                              agent.status === "active"
                                ? "bg-primary shadow-[0_0_6px_hsl(var(--primary))]"
                                : "bg-muted"
                            }`}
                          />
                          <div className="min-w-0 flex-1">
                            <div className="truncate text-xs font-medium">
                              {agent.name}
                            </div>
                            <div className="truncate text-[10px] text-muted-foreground">
                              {agent.role}
                            </div>
                          </div>
                          <div className="flex shrink-0 flex-col items-end gap-0.5">
                            <Badge
                              variant="outline"
                              className="h-4 px-1 font-mono text-[9px]"
                            >
                              L{agent.level}
                            </Badge>
                            {Number(agent.output) > 0 && (
                              <span className="font-mono text-[9px] text-accent">
                                {Number(agent.output).toFixed(0)} ⛁/h
                              </span>
                            )}
                          </div>
                        </button>
                      ))}
                    </div>
                  </div>
                );
              })}
              {grouped.length === 0 && (
                <div className="py-8 text-center text-sm text-muted-foreground">
                  Keine Agenten in dieser Dimension.
                </div>
              )}
            </div>
          )}
        </ScrollArea>
      </SheetContent>
    </Sheet>
  );
};
