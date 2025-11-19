import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Bot, Play, Square, RefreshCw } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

interface BotType {
  id: string;
  name: string;
  status: "active" | "idle" | "stopped";
  xp: number;
  tasks: number;
}

export const BotsPanel = () => {
  const [bots, setBots] = useState<BotType[]>([
    { id: "1", name: "Runner Bot", status: "active", xp: 1250, tasks: 42 },
    { id: "2", name: "Wallet Bot", status: "active", xp: 980, tasks: 28 },
    { id: "3", name: "Clicker Bot", status: "idle", xp: 750, tasks: 15 },
    { id: "4", name: "Game Bot", status: "stopped", xp: 500, tasks: 0 },
  ]);

  const toggleBot = (id: string) => {
    setBots(prev => prev.map(bot => {
      if (bot.id === id) {
        const newStatus = bot.status === "active" ? "stopped" : "active";
        toast.success(`${bot.name} ${newStatus === "active" ? "started" : "stopped"}`);
        return { ...bot, status: newStatus };
      }
      return bot;
    }));
  };

  return (
    <Card className="p-6 bg-card/80 backdrop-blur">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-bold flex items-center gap-2">
          <Bot className="w-6 h-6 text-primary" />
          Active Bots
        </h2>
        <Button size="sm" variant="outline">
          <RefreshCw className="w-4 h-4 mr-2" />
          Refresh
        </Button>
      </div>

      <div className="space-y-3">
        {bots.map((bot) => (
          <div
            key={bot.id}
            className="flex items-center justify-between p-3 rounded-lg bg-muted/30 border border-border/50"
          >
            <div className="flex items-center gap-3">
              <Bot className="w-5 h-5 text-muted-foreground" />
              <div>
                <p className="font-semibold">{bot.name}</p>
                <div className="flex gap-2 mt-1">
                  <Badge variant={bot.status === "active" ? "default" : "secondary"}>
                    {bot.status}
                  </Badge>
                  <span className="text-xs text-muted-foreground">
                    XP: {bot.xp} | Tasks: {bot.tasks}
                  </span>
                </div>
              </div>
            </div>
            <Button
              size="sm"
              variant={bot.status === "active" ? "destructive" : "default"}
              onClick={() => toggleBot(bot.id)}
            >
              {bot.status === "active" ? (
                <><Square className="w-4 h-4 mr-1" /> Stop</>
              ) : (
                <><Play className="w-4 h-4 mr-1" /> Start</>
              )}
            </Button>
          </div>
        ))}
      </div>
    </Card>
  );
};