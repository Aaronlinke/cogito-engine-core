import { Card } from "@/components/ui/card";
import { Coins, TrendingUp, Pickaxe } from "lucide-react";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";

type WalletRow = {
  id: string;
  name: string;
  coins: number;
  mining_rate: number;
  total_mined: number;
};

type TxRow = {
  id: string;
  amount: number;
  kind: string;
  description: string | null;
  created_at: string;
};

export const WalletPanel = () => {
  const [wallet, setWallet] = useState<WalletRow | null>(null);
  const [txs, setTxs] = useState<TxRow[]>([]);

  useEffect(() => {
    const load = async () => {
      const { data: w } = await supabase.from("wallet").select("*").limit(1).maybeSingle();
      setWallet(w as WalletRow | null);
      const { data: t } = await supabase
        .from("transactions")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(6);
      setTxs((t ?? []) as TxRow[]);
    };
    load();

    const wch = supabase
      .channel("wallet-changes")
      .on("postgres_changes", { event: "*", schema: "public", table: "wallet" },
        (p) => setWallet(p.new as WalletRow))
      .on("postgres_changes", { event: "INSERT", schema: "public", table: "transactions" },
        (p) => setTxs((prev) => [p.new as TxRow, ...prev].slice(0, 6)))
      .subscribe();
    return () => { supabase.removeChannel(wch); };
  }, []);

  const coins = Number(wallet?.coins ?? 0);
  const rate = Number(wallet?.mining_rate ?? 0);
  const mined = Number(wallet?.total_mined ?? 0);

  return (
    <Card className="p-6 bg-card/80 backdrop-blur">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-bold flex items-center gap-2">
          <Coins className="w-6 h-6 text-accent" />
          Wallet & Economy
        </h2>
      </div>

      <div className="space-y-4">
        <div className="p-4 rounded-lg bg-gradient-to-br from-primary to-accent text-primary-foreground">
          <p className="text-sm opacity-90">Total Balance</p>
          <p className="text-3xl font-bold mt-1">{coins.toLocaleString(undefined, { maximumFractionDigits: 2 })} 🪙</p>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div className="p-3 rounded-lg bg-muted/30 border border-border/50">
            <div className="flex items-center gap-2 mb-1">
              <Pickaxe className="w-4 h-4 text-primary" />
              <p className="text-xs text-muted-foreground">Mining /tick</p>
            </div>
            <p className="text-lg font-bold text-primary">+{rate.toFixed(2)}</p>
          </div>

          <div className="p-3 rounded-lg bg-muted/30 border border-border/50">
            <div className="flex items-center gap-2 mb-1">
              <TrendingUp className="w-4 h-4 text-green-500" />
              <p className="text-xs text-muted-foreground">Total Mined</p>
            </div>
            <p className="text-lg font-bold text-green-500">{mined.toFixed(2)}</p>
          </div>
        </div>

        <div>
          <p className="text-xs uppercase tracking-wide text-muted-foreground mb-2">Recent Transactions</p>
          <div className="space-y-1 max-h-32 overflow-y-auto">
            {txs.length === 0 && <p className="text-xs text-muted-foreground">No transactions yet — start a bot.</p>}
            {txs.map((tx) => (
              <div key={tx.id} className="flex justify-between text-xs py-1 border-b border-border/30 last:border-0">
                <span className="truncate text-muted-foreground">{tx.description ?? tx.kind}</span>
                <span className={tx.amount >= 0 ? "text-green-500" : "text-destructive"}>
                  {tx.amount >= 0 ? "+" : ""}{Number(tx.amount).toFixed(2)}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </Card>
  );
};
