import { Card } from "@/components/ui/card";
import { Activity, Cpu, HardDrive, Zap } from "lucide-react";
import { useEffect, useState } from "react";

export const SystemStatus = () => {
  const [cpu, setCpu] = useState(0);
  const [memory, setMemory] = useState(0);
  const [threats, setThreats] = useState(0);
  const [energy, setEnergy] = useState(100);

  useEffect(() => {
    const interval = setInterval(() => {
      setCpu(Math.floor(Math.random() * 40 + 30));
      setMemory(Math.floor(Math.random() * 30 + 50));
      setThreats(Math.floor(Math.random() * 3));
      setEnergy(Math.floor(Math.random() * 10 + 90));
    }, 2000);
    return () => clearInterval(interval);
  }, []);

  const stats = [
    { icon: Cpu, label: "CPU Load", value: `${cpu}%`, color: "text-primary" },
    { icon: HardDrive, label: "Memory", value: `${memory}%`, color: "text-secondary" },
    { icon: Activity, label: "Threats", value: threats, color: threats > 0 ? "text-destructive" : "text-green-500" },
    { icon: Zap, label: "Energy", value: `${energy}%`, color: "text-accent" },
  ];

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
      {stats.map((stat) => (
        <Card key={stat.label} className="p-4 bg-card/80 backdrop-blur">
          <div className="flex items-center gap-3">
            <stat.icon className={`w-8 h-8 ${stat.color}`} />
            <div>
              <p className="text-xs text-muted-foreground">{stat.label}</p>
              <p className={`text-2xl font-bold ${stat.color}`}>{stat.value}</p>
            </div>
          </div>
        </Card>
      ))}
    </div>
  );
};