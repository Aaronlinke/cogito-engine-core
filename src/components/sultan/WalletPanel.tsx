import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Coins, TrendingUp, Pickaxe, DollarSign } from "lucide-react";
import { useEffect, useState } from "react";

export const WalletPanel = () => {
  const [coins, setCoins] = useState(15750);
  const [miningRate, setMiningRate] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      const rate = Math.floor(Math.random() * 15 + 5);
      setMiningRate(rate);
      setCoins(prev => prev + rate);
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  return (
    <Card className="p-6 bg-card/80 backdrop-blur">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-bold flex items-center gap-2">
          <Coins className="w-6 h-6 text-accent" />
          Wallet & Economy
        </h2>
      </div>

      <div className="space-y-4">
        <div className="p-4 rounded-lg bg-gradient-primary text-primary-foreground">
          <p className="text-sm opacity-90">Total Balance</p>
          <p className="text-3xl font-bold mt-1">{coins.toLocaleString()} 🪙</p>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div className="p-3 rounded-lg bg-muted/30 border border-border/50">
            <div className="flex items-center gap-2 mb-1">
              <Pickaxe className="w-4 h-4 text-primary" />
              <p className="text-xs text-muted-foreground">Mining Rate</p>
            </div>
            <p className="text-lg font-bold text-primary">+{miningRate}/s</p>
          </div>

          <div className="p-3 rounded-lg bg-muted/30 border border-border/50">
            <div className="flex items-center gap-2 mb-1">
              <TrendingUp className="w-4 h-4 text-green-500" />
              <p className="text-xs text-muted-foreground">24h Growth</p>
            </div>
            <p className="text-lg font-bold text-green-500">+12.5%</p>
          </div>
        </div>

        <div className="flex gap-2">
          <Button className="flex-1" variant="default">
            <DollarSign className="w-4 h-4 mr-2" />
            Trade
          </Button>
          <Button className="flex-1" variant="outline">
            <Pickaxe className="w-4 h-4 mr-2" />
            Mine
          </Button>
        </div>
      </div>
    </Card>
  );
};