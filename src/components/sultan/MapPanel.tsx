import { Card } from "@/components/ui/card";
import { MapPin, Navigation } from "lucide-react";
import { useState } from "react";

export const MapPanel = () => {
  const [position, setPosition] = useState({ x: 50, y: 50 });

  const handleMapClick = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;
    setPosition({ x, y });
  };

  return (
    <Card className="p-6 bg-card/80 backdrop-blur">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-bold flex items-center gap-2">
          <Navigation className="w-6 h-6 text-secondary" />
          Interactive Map
        </h2>
        <span className="text-sm text-muted-foreground">
          {position.x.toFixed(0)}, {position.y.toFixed(0)}
        </span>
      </div>

      <div
        className="relative w-full h-64 rounded-lg bg-muted/20 border-2 border-border cursor-crosshair overflow-hidden"
        onClick={handleMapClick}
      >
        <div className="absolute inset-0 opacity-10">
          <div className="grid grid-cols-10 grid-rows-10 h-full">
            {Array.from({ length: 100 }).map((_, i) => (
              <div key={i} className="border border-primary/20" />
            ))}
          </div>
        </div>

        <div
          className="absolute w-8 h-8 -ml-4 -mt-4 transition-all duration-300"
          style={{ left: `${position.x}%`, top: `${position.y}%` }}
        >
          <MapPin className="w-8 h-8 text-primary animate-bounce" fill="currentColor" />
        </div>

        <div className="absolute bottom-2 left-2 text-xs text-muted-foreground bg-background/80 px-2 py-1 rounded">
          Click to set target location
        </div>
      </div>
    </Card>
  );
};