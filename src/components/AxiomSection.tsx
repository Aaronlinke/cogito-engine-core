import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Database, Eye, Target, Brain, Repeat, Shield } from "lucide-react";

const axioms = [
  {
    id: "A1",
    title: "Zustandsraum & Repräsentation",
    description: "S ist eine messbare Menge mit σ-Algebra. Jeder Zustand enthält interne Repräsentation r und Sensorik s_env.",
    icon: Database,
    color: "text-primary",
  },
  {
    id: "A2",
    title: "Observation",
    description: "Beobachtung o_t = O(s_t) durch messbare Abbildung. Beobachtungen sind inhärent partiell und informationsverlustbehaftet.",
    icon: Eye,
    color: "text-secondary",
  },
  {
    id: "A3",
    title: "Intentionalität",
    description: "Formalisiert als Zielfunktion G: M × S → ℝ. Aktionswahl zielt auf Maximierung des erwarteten kumulativen Werts.",
    icon: Target,
    color: "text-accent",
  },
  {
    id: "A4",
    title: "Inferenz und Modellierung",
    description: "Internes Modell M_t definiert Inferenzoperatoren I_M: M × O* → Distrib(S) für Wahrscheinlichkeitsverteilungen.",
    icon: Brain,
    color: "text-primary",
  },
  {
    id: "A5",
    title: "Selbstreferenz / Reflexivität",
    description: "Reflektor R: M → M' existiert, sodass M_t interne Repräsentation m_self ≡ R(M_t) enthält. Partielle Selbstbeschreibung.",
    icon: Repeat,
    color: "text-secondary",
  },
  {
    id: "A6",
    title: "Kohärenzbedingung",
    description: "Dynamisches Konsistenz-Constraint: Score(I_M(M_t, e), o_t+1) ≥ τ für alle Evidenzen. Probabilistische Konsistenz.",
    icon: Shield,
    color: "text-accent",
  },
];

export const AxiomSection = () => {
  return (
    <section className="relative px-6 py-20">
      <div className="container max-w-6xl mx-auto">
        <div className="text-center mb-12 space-y-4">
          <Badge variant="outline" className="border-primary/30">
            Axiomatische Basis
          </Badge>
          <h2 className="text-4xl md:text-5xl font-bold">
            Die 6 Fundament-<span className="bg-gradient-primary bg-clip-text text-transparent">Axiome</span>
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Formale Basisaxiome über Zustände, Beobachtung, Intentionalität und Selbstreferenz
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {axioms.map((axiom, index) => {
            const Icon = axiom.icon;
            return (
              <Card
                key={axiom.id}
                className="p-6 bg-gradient-card border-border hover:border-primary/50 transition-all hover:shadow-card group"
                style={{ animationDelay: `${index * 100}ms` }}
              >
                <div className="flex items-start gap-4">
                  <div className={`p-3 rounded-lg bg-gradient-glow ${axiom.color}`}>
                    <Icon className="w-6 h-6" />
                  </div>
                  <div className="flex-1 space-y-2">
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-sm text-primary font-bold">{axiom.id}</span>
                      <h3 className="text-lg font-semibold">{axiom.title}</h3>
                    </div>
                    <p className="text-sm text-muted-foreground leading-relaxed">
                      {axiom.description}
                    </p>
                  </div>
                </div>
              </Card>
            );
          })}
        </div>

        <div className="mt-12 p-6 rounded-xl bg-muted/30 border border-border">
          <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
            <Shield className="w-5 h-5 text-primary" />
            Begründung der Axiome
          </h3>
          <p className="text-sm text-muted-foreground leading-relaxed">
            A1-A4 bilden die Standardgrundlage für rationale Agenten in dynamischen Umgebungen. 
            A5 ist kritisch für Selbstmodellierung und Introspektion. A6 stellt eine operationalisierbare, 
            überprüfbare Bedingung für funktionale Kohärenz dar – notwendig für empirische Überprüfungen.
          </p>
        </div>
      </div>
    </section>
  );
};
