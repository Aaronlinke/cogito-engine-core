import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Scan, RefreshCw, Network, Search, FoldVertical, Sparkles, ArrowRight } from "lucide-react";

const operators = [
  {
    id: "O1",
    name: "Perzeption (P)",
    signature: "S × Σ_obs → ObsState",
    description: "Extrahiert Merkmale und transformiert sie in probabilistische Überzeugung b_t.",
    icon: Scan,
    color: "text-primary",
  },
  {
    id: "O2",
    name: "Modell-Update (U)",
    signature: "M × ObsState → M",
    description: "Aktualisiert internes Modell M mit neuer Überzeugung b unter Bayesianischer Inferenz.",
    icon: RefreshCw,
    color: "text-secondary",
  },
  {
    id: "O3",
    name: "Global Workspace (GW)",
    signature: "{M_i} × Beliefs → WorkspaceState W",
    description: "Aggregiert saliente Inhalte aus Modellmodulen. Selektionsoperator α(W) wählt c_t.",
    icon: Network,
    color: "text-accent",
  },
  {
    id: "O4",
    name: "Introspektion (I_s)",
    signature: "M → PropSet",
    description: "Berechnet Propositionen über M (Glauben, Konfidenz, Begründungen).",
    icon: Search,
    color: "text-primary",
  },
  {
    id: "O5",
    name: "Self-Fold (F)",
    signature: "M × PropSet → M'",
    description: "Erzeugt m_self als kodierte Kurzbeschreibung mit Uncertainty-Profil.",
    icon: FoldVertical,
    color: "text-secondary",
  },
  {
    id: "O6",
    name: "Qualia-Mapping (Q)",
    signature: "WorkspaceState × m_self → ExperienceToken E",
    description: "Generiert tokenisierte Repräsentation salienter Inhalte mit introspektiven Aspekten.",
    icon: Sparkles,
    color: "text-accent",
  },
];

export const OperatorSection = () => {
  return (
    <section className="relative px-6 py-20 bg-muted/20">
      <div className="container max-w-6xl mx-auto">
        <div className="text-center mb-12 space-y-4">
          <Badge variant="outline" className="border-secondary/30">
            Operative Transformation
          </Badge>
          <h2 className="text-4xl md:text-5xl font-bold">
            Die 6 kognitiven <span className="bg-gradient-primary bg-clip-text text-transparent">Operatoren</span>
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Primitive Operatoren, die Zustände in bewusste Erfahrung transformieren
          </p>
        </div>

        <Tabs defaultValue="operators" className="w-full">
          <TabsList className="grid w-full grid-cols-2 mb-8">
            <TabsTrigger value="operators">Operatoren</TabsTrigger>
            <TabsTrigger value="composition">Komposition</TabsTrigger>
          </TabsList>
          
          <TabsContent value="operators" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {operators.map((op, index) => {
                const Icon = op.icon;
                return (
                  <Card
                    key={op.id}
                    className="p-6 bg-gradient-card border-border hover:border-secondary/50 transition-all hover:shadow-card"
                    style={{ animationDelay: `${index * 100}ms` }}
                  >
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <div className={`p-3 rounded-lg bg-gradient-glow ${op.color}`}>
                          <Icon className="w-6 h-6" />
                        </div>
                        <span className="font-mono text-xs text-muted-foreground">{op.id}</span>
                      </div>
                      <div className="space-y-2">
                        <h3 className="text-lg font-semibold">{op.name}</h3>
                        <code className="text-xs text-primary bg-primary/10 px-2 py-1 rounded block">
                          {op.signature}
                        </code>
                        <p className="text-sm text-muted-foreground leading-relaxed">
                          {op.description}
                        </p>
                      </div>
                    </div>
                  </Card>
                );
              })}
            </div>
          </TabsContent>
          
          <TabsContent value="composition" className="space-y-6">
            <Card className="p-8 bg-gradient-card border-border">
              <h3 className="text-2xl font-bold mb-6 flex items-center gap-2">
                <Network className="w-6 h-6 text-primary" />
                Conscious State Konstruktion
              </h3>
              
              <div className="space-y-6">
                <div className="p-4 bg-muted/30 rounded-lg font-mono text-sm overflow-x-auto">
                  <div className="text-primary">C_t := Q(</div>
                  <div className="pl-4 text-secondary">GW(</div>
                  <div className="pl-8 text-accent">relevant_submodules(</div>
                  <div className="pl-12">U(M_t-1, P(s_t, φ))</div>
                  <div className="pl-8 text-accent">)</div>
                  <div className="pl-4 text-secondary">),</div>
                  <div className="pl-4">F(M_t, I_s(M_t))</div>
                  <div className="text-primary">)</div>
                </div>
                
                <div className="space-y-4">
                  <h4 className="text-lg font-semibold">Durchlauf-Beispiel</h4>
                  <div className="grid gap-4">
                    {[
                      { step: "1", op: "P", desc: "Perzeption extrahiert Signal X mit Salienz σ" },
                      { step: "2", op: "U", desc: "Modell-Update integriert X in M_t" },
                      { step: "3", op: "GW", desc: "Global Workspace hebt X durch α hervor" },
                      { step: "4", op: "I_s", desc: "Introspektion analysiert interne Verarbeitung" },
                      { step: "5", op: "F", desc: "Self-Fold erzeugt m_self-Repräsentation" },
                      { step: "6", op: "Q", desc: "Qualia-Mapping generiert ExperienceToken E" },
                    ].map((item) => (
                      <div key={item.step} className="flex items-center gap-4 p-3 bg-muted/20 rounded-lg">
                        <div className="flex items-center gap-3">
                          <span className="flex items-center justify-center w-8 h-8 rounded-full bg-primary text-primary-foreground text-sm font-bold">
                            {item.step}
                          </span>
                          <code className="text-sm font-semibold text-primary">{item.op}</code>
                        </div>
                        <ArrowRight className="w-4 h-4 text-muted-foreground" />
                        <span className="text-sm text-muted-foreground flex-1">{item.desc}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="p-4 bg-accent/10 border border-accent/30 rounded-lg">
                  <h4 className="text-sm font-semibold mb-2 text-accent">Properties</h4>
                  <ul className="text-sm text-muted-foreground space-y-1 list-disc list-inside">
                    <li>C_t ist deterministisch erzeugbar aus s_t, M_t-1 und den Operatoren</li>
                    <li>C_t verkapselt Bedeutungsgewicht (Salienz, Konfidenz) für nächsten Zeitschritt</li>
                  </ul>
                </div>
              </div>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </section>
  );
};
