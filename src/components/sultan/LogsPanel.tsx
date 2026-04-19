import { Card } from "@/components/ui/card";
import { Terminal, AlertCircle, CheckCircle, Info } from "lucide-react";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";

type LogRow = {
  id: string;
  level: string;
  source: string;
  message: string;
  created_at: string;
};

export const LogsPanel = () => {
  const [logs, setLogs] = useState<LogRow[]>([]);

  useEffect(() => {
    const load = async () => {
      const { data } = await supabase
        .from("system_logs")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(50);
      setLogs(((data ?? []) as LogRow[]).reverse());
    };
    load();

    const ch = supabase
      .channel("logs-changes")
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "system_logs" },
        (p) => setLogs((prev) => [...prev.slice(-49), p.new as LogRow]),
      )
      .subscribe();
    return () => { supabase.removeChannel(ch); };
  }, []);

  const getIcon = (level: string) => {
    switch (level) {
      case "success": return <CheckCircle className="w-4 h-4 text-green-500 shrink-0" />;
      case "error": return <AlertCircle className="w-4 h-4 text-destructive shrink-0" />;
      case "cmd": return <Terminal className="w-4 h-4 text-primary shrink-0" />;
      default: return <Info className="w-4 h-4 text-secondary shrink-0" />;
    }
  };

  return (
    <Card className="p-6 bg-card/80 backdrop-blur">
      <div className="flex items-center gap-2 mb-4">
        <Terminal className="w-6 h-6 text-primary" />
        <h2 className="text-xl font-bold">System Logs</h2>
        <span className="text-xs text-muted-foreground ml-auto">{logs.length} events</span>
      </div>

      <div className="h-56 overflow-y-auto space-y-1 font-mono text-xs bg-background/50 rounded-lg p-4">
        {logs.length === 0 && <p className="text-muted-foreground">Awaiting events…</p>}
        {logs.map((log) => (
          <div key={log.id} className="flex items-start gap-2 text-foreground/80">
            {getIcon(log.level)}
            <span className="text-muted-foreground shrink-0">
              [{new Date(log.created_at).toLocaleTimeString()}]
            </span>
            <span className="text-accent shrink-0">{log.source}</span>
            <span className="break-all">{log.message}</span>
          </div>
        ))}
      </div>
    </Card>
  );
};
