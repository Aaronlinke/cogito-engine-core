import { Card } from "@/components/ui/card";
import { Terminal, AlertCircle, CheckCircle, Info } from "lucide-react";
import { useEffect, useState } from "react";

interface LogEntry {
  id: number;
  type: "success" | "error" | "info" | "cmd";
  message: string;
  time: string;
}

export const LogsPanel = () => {
  const [logs, setLogs] = useState<LogEntry[]>([
    { id: 1, type: "cmd", message: "🚀 BLACK SULTAN OS INITIALIZED", time: new Date().toLocaleTimeString() },
    { id: 2, type: "success", message: "✓ All bots loaded successfully", time: new Date().toLocaleTimeString() },
    { id: 3, type: "info", message: "📊 Monitoring systems active", time: new Date().toLocaleTimeString() },
  ]);

  useEffect(() => {
    const messages = [
      { type: "success" as const, message: "✓ Mining cycle completed +15 coins" },
      { type: "info" as const, message: "📡 P2P network sync complete" },
      { type: "success" as const, message: "✓ Runner Bot completed task #43" },
      { type: "info" as const, message: "🔍 Scanning for threats..." },
      { type: "success" as const, message: "✓ Blockchain verification passed" },
      { type: "info" as const, message: "💰 Wallet balance updated" },
    ];

    const interval = setInterval(() => {
      const randomMsg = messages[Math.floor(Math.random() * messages.length)];
      const newLog: LogEntry = {
        id: Date.now(),
        type: randomMsg.type,
        message: randomMsg.message,
        time: new Date().toLocaleTimeString(),
      };
      setLogs(prev => [...prev.slice(-19), newLog]);
    }, 4000);

    return () => clearInterval(interval);
  }, []);

  const getIcon = (type: string) => {
    switch (type) {
      case "success": return <CheckCircle className="w-4 h-4 text-green-500" />;
      case "error": return <AlertCircle className="w-4 h-4 text-destructive" />;
      case "cmd": return <Terminal className="w-4 h-4 text-primary" />;
      default: return <Info className="w-4 h-4 text-secondary" />;
    }
  };

  return (
    <Card className="p-6 bg-card/80 backdrop-blur">
      <div className="flex items-center gap-2 mb-4">
        <Terminal className="w-6 h-6 text-primary" />
        <h2 className="text-xl font-bold">System Logs</h2>
      </div>

      <div className="h-48 overflow-y-auto space-y-2 font-mono text-xs bg-background/50 rounded-lg p-4">
        {logs.map((log) => (
          <div key={log.id} className="flex items-start gap-2 text-foreground/80">
            {getIcon(log.type)}
            <span className="text-muted-foreground">[{log.time}]</span>
            <span>{log.message}</span>
          </div>
        ))}
      </div>
    </Card>
  );
};