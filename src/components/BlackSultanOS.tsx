import { useState, useEffect } from "react";
import { SystemHeader } from "./sultan/SystemHeader";
import { SystemStatus } from "./sultan/SystemStatus";
import { BotsPanel } from "./sultan/BotsPanel";
import { WalletPanel } from "./sultan/WalletPanel";
import { MapPanel } from "./sultan/MapPanel";
import { ChatPanel } from "./sultan/ChatPanel";
import { LogsPanel } from "./sultan/LogsPanel";

export const BlackSultanOS = () => {
  const [systemTime, setSystemTime] = useState(Date.now());

  useEffect(() => {
    const interval = setInterval(() => {
      setSystemTime(Date.now());
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="min-h-screen bg-background text-foreground overflow-hidden">
      <SystemHeader systemTime={systemTime} />
      
      <main className="container mx-auto p-4 space-y-4">
        <SystemStatus />
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <BotsPanel />
          <WalletPanel />
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <MapPanel />
          <ChatPanel />
        </div>
        
        <LogsPanel />
      </main>

      {/* Background effects */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden -z-10">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary/10 rounded-full blur-[128px] animate-pulse" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-accent/10 rounded-full blur-[128px] animate-pulse" style={{ animationDelay: "1s" }} />
      </div>
    </div>
  );
};