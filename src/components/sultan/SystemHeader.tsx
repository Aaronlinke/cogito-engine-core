import { Crown } from "lucide-react";

interface SystemHeaderProps {
  systemTime: number;
}

export const SystemHeader = ({ systemTime }: SystemHeaderProps) => {
  return (
    <header className="border-b border-border bg-card/50 backdrop-blur-sm sticky top-0 z-50">
      <div className="container mx-auto px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Crown className="w-8 h-8 text-primary" />
          <h1 className="text-2xl font-bold bg-gradient-primary bg-clip-text text-transparent">
            BLACK SULTAN OS
          </h1>
        </div>
        
        <div className="flex items-center gap-6">
          <div className="text-sm">
            <span className="text-muted-foreground">System Time:</span>
            <span className="ml-2 font-mono text-primary">
              {new Date(systemTime).toLocaleTimeString()}
            </span>
          </div>
          
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
            <span className="text-sm text-green-500 font-semibold">ONLINE</span>
          </div>
        </div>
      </div>
    </header>
  );
};