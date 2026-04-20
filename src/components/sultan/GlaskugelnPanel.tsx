import { useEffect, useMemo, useState } from "react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { Sparkles, Zap, Activity, Play, Pause } from "lucide-react";
import { DimensionDetailSheet } from "./DimensionDetailSheet";

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

interface DimensionFlow {
  id: string;
  from_dim: number;
  to_dim: number;
  amount: number;
  created_at: string;
}

interface AnimatedFlow extends DimensionFlow {
  startTime: number;
}

export const GlaskugelnPanel = () => {
  const [dimensions, setDimensions] = useState<Dimension[]>([]);
  const [flows, setFlows] = useState<AnimatedFlow[]>([]);
  const [totalCoins, setTotalCoins] = useState(0);
  const [autoFlow, setAutoFlow] = useState(true);
  const [busy, setBusy] = useState(false);
  const [selectedDim, setSelectedDim] = useState<Dimension | null>(null);

  const positions = useMemo(() => {
    const radius = 38;
    return Array.from({ length: 12 }, (_, i) => {
      const angle = (i / 12) * Math.PI * 2 - Math.PI / 2;
      return {
        x: 50 + Math.cos(angle) * radius,
        y: 50 + Math.sin(angle) * radius,
      };
    });
  }, []);

  // Load dimensions + wallet, subscribe realtime
  useEffect(() => {
    const load = async () => {
      const [{ data: dims }, { data: wallet }, { data: recentFlows }] = await Promise.all([
        supabase.from("dimensions").select("*").order("id"),
        supabase.from("wallet").select("coins").maybeSingle(),
        supabase
          .from("dimension_flows")
          .select("*")
          .order("created_at", { ascending: false })
          .limit(10),
      ]);
      if (dims) setDimensions(dims as Dimension[]);
      if (wallet) setTotalCoins(Number(wallet.coins));
      if (recentFlows) {
        const now = Date.now();
        setFlows(
          (recentFlows as DimensionFlow[]).map((f, i) => ({
            ...f,
            startTime: now - i * 200,
          }))
        );
      }
    };
    load();

    const channel = supabase
      .channel("glaskugeln-rt")
      .on(
        "postgres_changes",
        { event: "UPDATE", schema: "public", table: "dimensions" },
        (payload: any) => {
          setDimensions((prev) =>
            prev.map((d) => (d.id === payload.new.id ? { ...d, ...payload.new } : d))
          );
        }
      )
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "dimension_flows" },
        (payload: any) => {
          setFlows((prev) => [
            ...prev.slice(-15),
            { ...(payload.new as DimensionFlow), startTime: Date.now() },
          ]);
        }
      )
      .on(
        "postgres_changes",
        { event: "UPDATE", schema: "public", table: "wallet" },
        (payload: any) => {
          if (payload.new?.coins != null) setTotalCoins(Number(payload.new.coins));
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  // Auto-trigger real flows via edge function
  useEffect(() => {
    if (!autoFlow) return;
    const interval = setInterval(async () => {
      if (busy) return;
      setBusy(true);
      try {
        await supabase.functions.invoke("dimension-flow", { body: { auto: true } });
      } catch (e) {
        console.error("flow err", e);
      } finally {
        setBusy(false);
      }
    }, 2500);
    return () => clearInterval(interval);
  }, [autoFlow, busy]);

  // Cleanup old animated flows
  useEffect(() => {
    const cleanup = setInterval(() => {
      const now = Date.now();
      setFlows((prev) => prev.filter((f) => now - f.startTime < 2500));
    }, 500);
    return () => clearInterval(cleanup);
  }, []);

  const triggerOnce = async () => {
    setBusy(true);
    try {
      await supabase.functions.invoke("dimension-flow", { body: { auto: true } });
    } finally {
      setBusy(false);
    }
  };

  const avgSync = dimensions.length
    ? dimensions.reduce((a, b) => a + Number(b.sync), 0) / dimensions.length
    : 0;
  const activeDims = dimensions.filter((d) => d.active).length;
  const dimCoinsTotal = dimensions.reduce((a, b) => a + Number(b.coins), 0);
  const emergence = avgSync;

  if (dimensions.length === 0) {
    return (
      <Card className="p-6 text-center text-sm text-muted-foreground">
        Lade Dimensionen…
      </Card>
    );
  }

  return (
    <Card className="relative overflow-hidden border-border/50 bg-gradient-to-br from-card to-card/40 p-4 sm:p-6">
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="flex items-center gap-2 text-lg font-bold tracking-tight">
            <Sparkles className="h-5 w-5 text-accent" />
            Oasis · 12 Glaskugeln
          </h2>
          <p className="text-xs text-muted-foreground">
            Meta-KI Omni-Kern · Echte Cross-Dimension Transaktionen
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <Badge variant="outline" className="gap-1 border-primary/40 text-primary">
            <Activity className="h-3 w-3" />
            {activeDims}/12 aktiv
          </Badge>
          <Badge variant="outline" className="gap-1 border-accent/40 text-accent">
            <Zap className="h-3 w-3" />
            Sync {(avgSync * 100).toFixed(0)}%
          </Badge>
          <Badge variant="outline" className="border-secondary/40 text-secondary">
            Φ {(emergence * 100).toFixed(0)}%
          </Badge>
          <Button
            size="sm"
            variant={autoFlow ? "default" : "outline"}
            onClick={() => setAutoFlow((v) => !v)}
            className="h-7 gap-1 px-2 text-xs"
          >
            {autoFlow ? <Pause className="h-3 w-3" /> : <Play className="h-3 w-3" />}
            {autoFlow ? "Auto" : "Pausiert"}
          </Button>
          <Button
            size="sm"
            variant="outline"
            onClick={triggerOnce}
            disabled={busy}
            className="h-7 px-2 text-xs"
          >
            Flow
          </Button>
        </div>
      </div>

      <div className="relative mx-auto aspect-square w-full max-w-[560px]">
        <svg
          className="pointer-events-none absolute inset-0 h-full w-full"
          viewBox="0 0 100 100"
          preserveAspectRatio="none"
        >
          <defs>
            <radialGradient id="coreGlow" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor="hsl(var(--accent))" stopOpacity="0.5" />
              <stop offset="60%" stopColor="hsl(var(--primary))" stopOpacity="0.15" />
              <stop offset="100%" stopColor="transparent" />
            </radialGradient>
          </defs>

          <circle
            cx="50"
            cy="50"
            r="38"
            fill="none"
            stroke="hsl(var(--border))"
            strokeWidth="0.15"
            strokeDasharray="0.8 0.8"
            opacity="0.5"
          />
          <circle cx="50" cy="50" r="22" fill="url(#coreGlow)" />

          {positions.map((p, i) =>
            positions.slice(i + 1).map((q, j) => (
              <line
                key={`${i}-${j}`}
                x1={p.x}
                y1={p.y}
                x2={q.x}
                y2={q.y}
                stroke="hsl(var(--primary))"
                strokeWidth="0.05"
                opacity="0.08"
              />
            ))
          )}

          {positions.map((p, i) => {
            const dim = dimensions[i];
            return (
              <line
                key={`spoke-${i}`}
                x1="50"
                y1="50"
                x2={p.x}
                y2={p.y}
                stroke={`hsl(${dim?.hue ?? 217} 80% 60%)`}
                strokeWidth="0.1"
                opacity={dim?.active ? 0.35 : 0.1}
              />
            );
          })}

          {flows.map((f) => {
            const fromIdx = f.from_dim - 1;
            const toIdx = f.to_dim - 1;
            const p1 = positions[fromIdx];
            const p2 = positions[toIdx];
            if (!p1 || !p2) return null;
            const elapsed = (Date.now() - f.startTime) / 2000;
            if (elapsed > 1) return null;
            const x = p1.x + (p2.x - p1.x) * elapsed;
            const y = p1.y + (p2.y - p1.y) * elapsed;
            return (
              <g key={f.id}>
                <line
                  x1={p1.x}
                  y1={p1.y}
                  x2={p2.x}
                  y2={p2.y}
                  stroke="hsl(var(--accent))"
                  strokeWidth="0.2"
                  opacity={0.4 * (1 - elapsed)}
                />
                <circle
                  cx={x}
                  cy={y}
                  r={0.7 + Math.min(1.5, Number(f.amount) / 30)}
                  fill="hsl(var(--accent))"
                  opacity={1 - elapsed * 0.4}
                />
              </g>
            );
          })}
        </svg>

        {/* Meta-KI Omni-Kern */}
        <div
          className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2"
          style={{ width: "26%", aspectRatio: "1" }}
        >
          <div className="relative h-full w-full">
            <div className="absolute inset-0 animate-pulse rounded-full bg-gradient-to-br from-primary/40 via-accent/30 to-secondary/40 blur-xl" />
            <div className="absolute inset-2 rounded-full border border-primary/40 bg-card/80 backdrop-blur-sm" />
            <div
              className="absolute inset-3 rounded-full border border-accent/30"
              style={{
                animation: "spin 12s linear infinite",
                background:
                  "conic-gradient(from 0deg, transparent, hsl(var(--accent) / 0.3), transparent)",
              }}
            />
            <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
              <div className="text-[9px] font-mono uppercase tracking-wider text-muted-foreground">
                Omni-Kern
              </div>
              <div className="text-base font-bold sm:text-lg">Meta-KI</div>
              <div className="font-mono text-[10px] text-accent">
                {totalCoins.toFixed(0)} ⛁
              </div>
              <div className="font-mono text-[8px] text-muted-foreground">
                Σ {dimCoinsTotal.toFixed(0)}
              </div>
            </div>
          </div>
        </div>

        {/* 12 Glaskugeln */}
        {dimensions.map((dim, i) => {
          const pos = positions[i];
          const size = 14 + Number(dim.load) * 4;
          return (
            <div
              key={dim.id}
              className="absolute -translate-x-1/2 -translate-y-1/2 transition-all duration-700"
              style={{
                left: `${pos.x}%`,
                top: `${pos.y}%`,
                width: `${size}%`,
                aspectRatio: "1",
              }}
            >
              <button
                type="button"
                onClick={() => setSelectedDim(dim)}
                aria-label={`${dim.name} öffnen`}
                className="group relative h-full w-full cursor-pointer rounded-full focus:outline-none focus:ring-2 focus:ring-primary/60 hover:scale-110 transition-transform"
              >
                <div
                  className="absolute inset-0 rounded-full blur-md transition-opacity"
                  style={{
                    background: `radial-gradient(circle, hsl(${dim.hue} 80% 60% / ${
                      dim.active ? 0.5 : 0.15
                    }), transparent 70%)`,
                    opacity: dim.active ? 1 : 0.4,
                  }}
                />
                <div
                  className="absolute inset-1 rounded-full border backdrop-blur-sm transition-all"
                  style={{
                    background: `radial-gradient(circle at 30% 30%, hsl(${dim.hue} 80% 70% / 0.4), hsl(${dim.hue} 80% 30% / 0.6))`,
                    borderColor: `hsl(${dim.hue} 80% 60% / ${dim.active ? 0.7 : 0.25})`,
                    boxShadow: dim.active
                      ? `0 0 20px hsl(${dim.hue} 80% 60% / 0.4)`
                      : "none",
                  }}
                />
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <div
                    className="text-sm font-bold"
                    style={{ color: `hsl(${dim.hue} 90% 85%)` }}
                  >
                    {dim.glyph}
                  </div>
                  <div className="text-[8px] font-mono uppercase opacity-80">
                    {dim.id}
                  </div>
                </div>
                <div className="pointer-events-none absolute left-1/2 top-full z-20 mt-1 -translate-x-1/2 whitespace-nowrap rounded-md border border-border bg-popover/95 px-2 py-1 text-[10px] opacity-0 shadow-lg backdrop-blur transition-opacity group-hover:opacity-100">
                  <div className="font-bold">{dim.name}</div>
                  <div className="font-mono text-muted-foreground">
                    {Number(dim.coins).toFixed(0)} ⛁ · Load{" "}
                    {(Number(dim.load) * 100).toFixed(0)}% · Sync{" "}
                    {(Number(dim.sync) * 100).toFixed(0)}%
                  </div>
                  <div className="font-mono text-[9px] text-muted-foreground">
                    in {Number(dim.total_in).toFixed(0)} · out{" "}
                    {Number(dim.total_out).toFixed(0)}
                  </div>
                </div>
              </button>
            </div>
          );
        })}
      </div>

      <div className="mt-4 grid grid-cols-3 gap-2 text-[10px] sm:grid-cols-4 md:grid-cols-6">
        {dimensions.map((dim) => (
          <button
            key={dim.id}
            onClick={() => setSelectedDim(dim)}
            className="flex items-center gap-1.5 rounded-md border border-border/50 bg-card/40 px-2 py-1 text-left transition-colors hover:border-primary/40 hover:bg-card/70"
          >
            <span
              className="inline-block h-2 w-2 rounded-full"
              style={{
                backgroundColor: `hsl(${dim.hue} 80% 60%)`,
                boxShadow: dim.active ? `0 0 6px hsl(${dim.hue} 80% 60%)` : "none",
              }}
            />
            <span className="font-mono opacity-80">
              {dim.id}.{dim.name}
            </span>
            <span className="ml-auto font-mono text-muted-foreground">
              {Number(dim.coins).toFixed(0)}
            </span>
          </button>
        ))}
      </div>

      <DimensionDetailSheet
        dimension={selectedDim}
        open={!!selectedDim}
        onOpenChange={(v) => !v && setSelectedDim(null)}
      />
    </Card>
  );
};
