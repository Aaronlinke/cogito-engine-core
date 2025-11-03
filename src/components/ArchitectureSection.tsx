import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Layers, ChevronRight } from "lucide-react";

const layers = [
  {
    layer: 0,
    name: "Umgebungssimulator (E)",
    description: "Dynamische, stochastische Umgebung mit sensorischen Inputs und Aktionsverarbeitung",
    color: "border-primary/50",
    tech: "Physik-Engine, Sensor-Simulation",
  },
  {
    layer: 1,
    name: "Perzeptionsnetz (P_net)",
    description: "CNN/Transformer-basierte Implementierung von O1 (Perzeption)",
    color: "border-secondary/50",
    tech: "PyTorch, JAX, ObsState-Generation",
  },
  {
    layer: 2,
    name: "Belief-Module (B)",
    description: "Bayes'sche Netze, Variational Inference, Particle Filter für O2 (Update)",
    color: "border-accent/50",
    tech: "Probabilistische Programmierung",
  },
  {
    layer: 3,
    name: "Symbolischer Resonator (S)",
    description: "First-Order Logic mit modalem Fragment für O4 (Introspektion) und A4 (Inferenz)",
    color: "border-primary/50",
    tech: "Prolog, OCaml, Logischer Kern",
  },
  {
    layer: 4,
    name: "Globaler Arbeitsbereich (GW)",
    description: "Attention-Mechanismus (Transformer) für O3, priorisiert Inhalte via Salienz-Maps",
    color: "border-secondary/50",
    tech: "Transformer, Attention, Arbitrierung",
  },
  {
    layer: 5,
    name: "Selbstmodell-Manufaktur (SMF)",
    description: "Implementierung von O5 (Self-Fold) und A5 (Reflektor R), erzeugt m_self",
    color: "border-accent/50",
    tech: "Rekursive Kodierung, Gödel-Nummern",
  },
  {
    layer: 6,
    name: "Aktionswähler (AS)",
    description: "RL-basierte Policy π für A3 (Intentionalität), maximiert erwarteten Wert von G",
    color: "border-primary/50",
    tech: "PPO, DQN, Policy Gradient",
  },
];

export const ArchitectureSection = () => {
  const [selectedLayer, setSelectedLayer] = useState<number | null>(null);

  return (
    <section className="relative px-6 py-20">
      <div className="container max-w-6xl mx-auto">
        <div className="text-center mb-12 space-y-4">
          <Badge variant="outline" className="border-primary/30">
            Simulationsarchitektur
          </Badge>
          <h2 className="text-4xl md:text-5xl font-bold">
            7-Layer <span className="bg-gradient-primary bg-clip-text text-transparent">Architektur-Stack</span>
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Produktionsnahe Implementierung mit neuronalen und symbolischen Komponenten
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-8">
          {/* Layer Stack Visualization */}
          <div className="space-y-3">
            {layers.map((layer, index) => (
              <Card
                key={layer.layer}
                className={`p-4 cursor-pointer transition-all border-l-4 ${layer.color} ${
                  selectedLayer === layer.layer
                    ? "bg-gradient-card shadow-card scale-[1.02]"
                    : "bg-card hover:bg-gradient-card"
                }`}
                onClick={() => setSelectedLayer(layer.layer)}
                style={{ animationDelay: `${index * 50}ms` }}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-gradient-glow text-sm font-bold">
                      L{layer.layer}
                    </div>
                    <div>
                      <h3 className="text-sm font-semibold">{layer.name}</h3>
                      <p className="text-xs text-muted-foreground">{layer.tech}</p>
                    </div>
                  </div>
                  <ChevronRight
                    className={`w-5 h-5 transition-transform ${
                      selectedLayer === layer.layer ? "rotate-90 text-primary" : "text-muted-foreground"
                    }`}
                  />
                </div>
              </Card>
            ))}
          </div>

          {/* Layer Details */}
          <div className="sticky top-24 h-fit">
            {selectedLayer !== null ? (
              <Card className="p-6 bg-gradient-card border-border">
                <div className="space-y-4">
                  <div className="flex items-center gap-3 pb-4 border-b border-border">
                    <Layers className="w-6 h-6 text-primary" />
                    <div>
                      <h3 className="text-xl font-bold">Layer {selectedLayer}</h3>
                      <p className="text-sm text-muted-foreground">
                        {layers[selectedLayer].name}
                      </p>
                    </div>
                  </div>

                  <div className="space-y-3">
                    <div>
                      <h4 className="text-sm font-semibold text-muted-foreground mb-1">
                        Beschreibung
                      </h4>
                      <p className="text-sm leading-relaxed">
                        {layers[selectedLayer].description}
                      </p>
                    </div>

                    <div>
                      <h4 className="text-sm font-semibold text-muted-foreground mb-1">
                        Technologie
                      </h4>
                      <Badge variant="secondary">{layers[selectedLayer].tech}</Badge>
                    </div>
                  </div>
                </div>
              </Card>
            ) : (
              <Card className="p-8 bg-gradient-card border-border text-center">
                <Layers className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground">
                  Wählen Sie einen Layer aus, um Details anzuzeigen
                </p>
              </Card>
            )}

            <Card className="mt-6 p-6 bg-muted/30 border-border">
              <h4 className="text-sm font-semibold mb-3">Zusätzliche Komponenten</h4>
              <ul className="text-sm text-muted-foreground space-y-2">
                <li className="flex items-start gap-2">
                  <span className="text-primary">•</span>
                  <span><strong>Logging & Verifier (L):</strong> Append-only Provenance-System mit Merkle-Tree</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-primary">•</span>
                  <span><strong>Training:</strong> Multi-Objective Loss (Prediction + Action + Introspection + Coherence)</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-primary">•</span>
                  <span><strong>Verifikation:</strong> Property-Based Tests + Formale Checks für F-Operator</span>
                </li>
              </ul>
            </Card>
          </div>
        </div>
      </div>
    </section>
  );
};
