import { useEffect, useMemo, useState } from "react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";
import { Sparkles, Zap, Activity } from "lucide-react";

const DIMENSIONS = [
  { id: 1, name: "Cognitio", glyph: "Ψ", hue: 217 },
  { id: 2, name: "Aurum", glyph: "Au", hue: 45 },
  { id: 3, name: "Mercatus", glyph: "₿", hue: 142 },
  { id: 4, name: "Ludus", glyph: "◊", hue: 280 },
  { id: 5, name: "Forum", glyph: "Ω", hue: 320 },
  { id: 6, name: "Quantum", glyph: "Q", hue: 190 },
  { id: 7, name: "Reflexio", glyph: "↻", hue: 30 },
  { id: 8, name: "Nexus", glyph: "∞", hue: 260 },
  { id: 9, name: "Genesis", glyph: "✦", hue: 100 },
  { id: 10, name: "Abyssus", glyph: "▼", hue: 350 },
  { id: 11, name: "Veritas", glyph: "△", hue: 60 },
  { id: 12, name: "Fatum", glyph: "✧", hue: 240 },
];

interface DimensionState {
  id: number;
  coins: number;
  load: number;
  sync: number;
  active: boolean;
}

interface CoinFlow {
  id: string;
  from: number;
  to: number;
  amount: number;
  startTime: number;
}

export const GlaskugelnPanel = () => {
  const [dimensions, setDimensions] = useState<DimensionState[]>(
    DIMENSIONS.map((d) => ({
      id: d.id,
      coins: Math.floor(Math.random() * 500) + 100,
      load: Math.random() * 0.7 + 0.2,
      sync: Math.random() * 0.4 + 0.6,
      active: Math.random() > 0.2,
    }))
  );
  const [flows, setFlows] = useState<CoinFlow[]>([]);
  const [totalCoins, setTotalCoins] = useState(0);
  const [emergence, setEmergence] = useState(0.5);

  // Position calc — circle of 12 around center
  const positions = useMemo(() => {
    const radius = 38; // % of container
    return DIMENSIONS.map((_, i) => {
      const angle = (i / 12) * Math.PI * 2 - Math.PI / 2;
      return {
        x: 50 + Math.cos(angle) * radius,
        y: 50 + Math.sin(angle) * radius,
      };
    });
  }, []);

  // Pull live wallet to seed Meta-Kern total
  useEffect(() => {
    const loadWallet = async () => {
      const { data } = await supabase.from("wallet").select("coins").maybeSingle();
      if (data) setTotalCoins(Number(data.coins));
    };
    loadWallet();

    const channel = supabase
      .channel("glaskugeln-wallet")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "wallet" },
        (payload: any) => {
          if (payload.new?.coins != null) setTotalCoins(Number(payload.new.coins));
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  // Simulation tick — coin flow + state evolution
  useEffect(() => {
    const interval = setInterval(() => {
      // Spawn a new flow
      const from = Math.floor(Math.random() * 12);
      let to = Math.floor(Math.random() * 12);
      while (to === from) to = Math.floor(Math.random() * 12);

      const newFlow: CoinFlow = {
        id: `${Date.now()}-${Math.random()}`,
        from,
        to,
        amount: Math.floor(Math.random() * 20) + 1,
        startTime: Date.now(),
      };
      setFlows((prev) => [...prev.slice(-15), newFlow]);

      // Evolve dimensions
      setDimensions((prev) =>
        prev.map((d, i) => {
          let coinDelta = 0;
          if (i === from) coinDelta -= newFlow.amount;
          if (i === to) coinDelta += newFlow.amount;
          return {
            ...d,
            coins: Math.max(0, d.coins + coinDelta + (Math.random() * 4 - 1)),
            load: Math.max(0.1, Math.min(1, d.load + (Math.random() * 0.1 - 0.05))),
            sync: Math.max(0.3, Math.min(1, d.sync + (Math.random() * 0.06 - 0.03))),
            active: Math.random() > 0.05 ? d.active : !d.active,
          };
        })
      );

      // Emergence drifts based on average sync
      setEmergence((e) => {
        const avgSync = dimensions.reduce((a, b) => a + b.sync, 0) / 12;
        return e * 0.85 + avgSync * 0.15;
      });
    }, 1500);

    return () => clearInterval(interval);
  }, [dimensions]);

  // Cleanup old flows
  useEffect(() => {
    const cleanup = setInterval(() => {
      const now = Date.now();
      setFlows((prev) => prev.filter((f) => now - f.startTime < 2500));
    }, 500);
    return () => clearInterval(cleanup);
  }, []);

  const avgSync = dimensions.reduce((a, b) => a + b.sync, 0) / 12;
  const activeDims = dimensions.filter((d) => d.active).length;

  return (
    <Card className="relative overflow-hidden border-border/50 bg-gradient-to-br from-card to-card/40 p-4 sm:p-6">
      {/* Header */}
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="flex items-center gap-2 text-lg font-bold tracking-tight">
            <Sparkles className="h-5 w-5 text-accent" />
            Oasis · 12 Glaskugeln
          </h2>
          <p className="text-xs text-muted-foreground">
            Meta-KI Omni-Kern · Cross-Dimension Sync
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Badge variant="outline" className="gap-1 border-primary/40 text-primary">
            <Activity className="h-3 w-3" />
            {activeDims}/12 aktiv
          </Badge>
          <Badge variant="outline" className="gap-1 border-accent/40 text-accent">
            <Zap className="h-3 w-3" />
            Sync {(avgSync * 100).toFixed(0)}%
          </Badge>
          <Badge variant="outline" className="border-secondary/40 text-secondary">
            Emergenz Φ {(emergence * 100).toFixed(0)}%
          </Badge>
        </div>
      </div>

      {/* Stage */}
      <div className="relative mx-auto aspect-square w-full max-w-[560px]">
        {/* SVG flow layer */}
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

          {/* Background ring */}
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

          {/* Connection lattice (faint) */}
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

          {/* Spokes to center */}
          {positions.map((p, i) => (
            <line
              key={`spoke-${i}`}
              x1="50"
              y1="50"
              x2={p.x}
              y2={p.y}
              stroke={`hsl(${DIMENSIONS[i].hue} 80% 60%)`}
              strokeWidth="0.1"
              opacity={dimensions[i].active ? 0.35 : 0.1}
            />
          ))}

          {/* Active coin flows */}
          {flows.map((f) => {
            const p1 = positions[f.from];
            const p2 = positions[f.to];
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
                  r="0.9"
                  fill="hsl(var(--accent))"
                  opacity={1 - elapsed * 0.5}
                >
                  <animate
                    attributeName="r"
                    values="0.9;1.4;0.9"
                    dur="0.6s"
                    repeatCount="indefinite"
                  />
                </circle>
              </g>
            );
          })}
        </svg>

        {/* Meta-KI Omni-Kern center */}
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
              <div className="text-[10px] font-mono uppercase tracking-wider text-muted-foreground">
                Omni-Kern
              </div>
              <div className="text-base font-bold sm:text-lg">Meta-KI</div>
              <div className="font-mono text-[10px] text-accent">
                {totalCoins.toFixed(0)} ⛁
              </div>
            </div>
          </div>
        </div>

        {/* 12 Glaskugeln */}
        {DIMENSIONS.map((dim, i) => {
          const state = dimensions[i];
          const pos = positions[i];
          const size = 14 + state.load * 4; // % of container
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
              <div className="group relative h-full w-full cursor-pointer">
                {/* Glow halo */}
                <div
                  className="absolute inset-0 rounded-full blur-md transition-opacity"
                  style={{
                    background: `radial-gradient(circle, hsl(${dim.hue} 80% 60% / ${
                      state.active ? 0.5 : 0.15
                    }), transparent 70%)`,
                    opacity: state.active ? 1 : 0.4,
                  }}
                />
                {/* Sphere */}
                <div
                  className="absolute inset-1 rounded-full border backdrop-blur-sm transition-all"
                  style={{
                    background: `radial-gradient(circle at 30% 30%, hsl(${dim.hue} 80% 70% / 0.4), hsl(${dim.hue} 80% 30% / 0.6))`,
                    borderColor: `hsl(${dim.hue} 80% 60% / ${state.active ? 0.7 : 0.25})`,
                    boxShadow: state.active
                      ? `0 0 20px hsl(${dim.hue} 80% 60% / 0.4)`
                      : "none",
                  }}
                />
                {/* Glyph + label */}
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
                {/* Hover tooltip */}
                <div className="pointer-events-none absolute left-1/2 top-full z-20 mt-1 -translate-x-1/2 whitespace-nowrap rounded-md border border-border bg-popover/95 px-2 py-1 text-[10px] opacity-0 shadow-lg backdrop-blur transition-opacity group-hover:opacity-100">
                  <div className="font-bold">{dim.name}</div>
                  <div className="font-mono text-muted-foreground">
                    {state.coins.toFixed(0)} ⛁ · Load{" "}
                    {(state.load * 100).toFixed(0)}%
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Legend */}
      <div className="mt-4 grid grid-cols-3 gap-2 text-[10px] sm:grid-cols-4 md:grid-cols-6">
        {DIMENSIONS.map((dim, i) => {
          const state = dimensions[i];
          return (
            <div
              key={dim.id}
              className="flex items-center gap-1.5 rounded-md border border-border/50 bg-card/40 px-2 py-1"
            >
              <span
                className="inline-block h-2 w-2 rounded-full"
                style={{
                  backgroundColor: `hsl(${dim.hue} 80% 60%)`,
                  boxShadow: state.active
                    ? `0 0 6px hsl(${dim.hue} 80% 60%)`
                    : "none",
                }}
              />
              <span className="font-mono opacity-80">
                {dim.id}.{dim.name}
              </span>
            </div>
          );
        })}
      </div>
    </Card>
  );
};
