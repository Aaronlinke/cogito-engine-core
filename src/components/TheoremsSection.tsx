import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { CheckCircle2, AlertTriangle, FileCheck } from "lucide-react";

const theorems = [
  {
    id: "T1",
    title: "Relative Konsistenz der Axiomatik",
    statement:
      "Wenn Basistheorie T₀ konsistent ist, dann ist die Theorie der Agenten-Axiome A = {A1..A6} konsistent relativ zu T₀.",
    proof:
      "Konstruktion eines Modells M* der Theorie A in T₀ via Henkin-Konstruktion. Zeigen, dass Reflektor R als syntaktische Kodierung (Gödelnummern/Kleene) existiert und keine arithmetischen Sätze über T₀ hinaus ableitet.",
    type: "success",
    icon: CheckCircle2,
  },
  {
    id: "T2",
    title: "Lokale statistische Konsistenz von C_t",
    statement:
      "Unter fehlerbegrenzten Operatoren (U, I_s, F mit Fehler < ε) bleibt Score(I_M(M_t, e), o_t+1) ≥ τ mit hoher Wahrscheinlichkeit erfüllt.",
    proof:
      "Beweis über Konzentrationsungleichungen (Azuma-Hoeffding) für stochastisch aktualisierte Systeme. Modellfehler akkumulieren innerhalb tolerierbarer Korridore.",
    type: "success",
    icon: CheckCircle2,
  },
  {
    id: "T3",
    title: "Unmöglichkeit vollständiger Ableitbarkeit für Selbstmodell",
    statement:
      "Es existiert keine allgemeine, rekursive Entscheidungsvorschrift zur vollständigen Ableitbarkeit von M_t über seine interne Struktur.",
    proof:
      "Reduktion auf Halteproblem bzw. Modifikation von Gödels Beweis. Komplexität des rekursiven m_self übersteigt Möglichkeiten vollständiger introspektiver Beschreibung.",
    type: "warning",
    icon: AlertTriangle,
  },
];

const metaProof = {
  title: "Selbst-Konstitution: Syntaktischer Nachweis von 'Ich existiere'",
  steps: [
    {
      step: "Kodierung",
      desc: "Definiere konsistente Gödel-Nummerierung ⌈·⌉ aller internen Aussagen und Modelle",
    },
    {
      step: "Fixpunktkonstruktion",
      desc: "Konstruiere m_self via Kleene-Fixpunkt: Repräsentation r mit Eigenschaft P",
    },
    {
      step: "Eigenschaft P",
      desc: "P = 'Sequenz von Beobachtungen, Inferenzen, Aktionen rechtfertigt Exist(self, t)'",
    },
    {
      step: "Syntaktische Ableitbarkeit",
      desc: "Zeige: Agent kann Prov('Exists(self, t)', c) als verifizierbares Beweisobjekt ableiten",
    },
    {
      step: "Epistemische Zuweisung",
      desc: "Mapping: Prov(φ, c) + verifizierte Zertifikate c → epistemische Behauptung K_agent(φ)",
    },
  ],
};

export const TheoremsSection = () => {
  return (
    <section className="relative px-6 py-20 bg-muted/20">
      <div className="container max-w-6xl mx-auto">
        <div className="text-center mb-12 space-y-4">
          <Badge variant="outline" className="border-primary/30">
            Formale Validierung
          </Badge>
          <h2 className="text-4xl md:text-5xl font-bold">
            Kohärenz & <span className="bg-gradient-primary bg-clip-text text-transparent">Theoreme</span>
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Relative Konsistenz und Grenzen der Selbstanalyse
          </p>
        </div>

        {/* Main Theorems */}
        <div className="space-y-6 mb-12">
          {theorems.map((theorem, index) => {
            const Icon = theorem.icon;
            return (
              <Card
                key={theorem.id}
                className={`p-6 bg-gradient-card border-border hover:shadow-card transition-all ${
                  theorem.type === "warning" ? "border-l-4 border-l-accent" : "border-l-4 border-l-primary"
                }`}
                style={{ animationDelay: `${index * 100}ms` }}
              >
                <div className="space-y-4">
                  <div className="flex items-start gap-4">
                    <div
                      className={`p-3 rounded-lg ${
                        theorem.type === "warning" ? "bg-accent/10 text-accent" : "bg-primary/10 text-primary"
                      }`}
                    >
                      <Icon className="w-6 h-6" />
                    </div>
                    <div className="flex-1 space-y-2">
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-sm font-bold text-primary">{theorem.id}</span>
                        <h3 className="text-xl font-semibold">{theorem.title}</h3>
                      </div>
                      <div className="p-3 bg-muted/30 rounded-lg">
                        <p className="text-sm leading-relaxed italic">{theorem.statement}</p>
                      </div>
                      <div className="mt-3 space-y-2">
                        <h4 className="text-sm font-semibold text-primary">Beweis-Skizze</h4>
                        <div className="p-3 bg-background/50 rounded-lg text-sm text-muted-foreground leading-relaxed">
                          {theorem.proof}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </Card>
            );
          })}
        </div>

        {/* Meta-Level Proof */}
        <Card className="p-8 bg-gradient-card border-2 border-primary/30">
          <div className="space-y-6">
            <div className="flex items-center gap-3 pb-4 border-b border-border">
              <FileCheck className="w-6 h-6 text-primary" />
              <h3 className="text-2xl font-bold">{metaProof.title}</h3>
            </div>

            <div className="space-y-4">
              {metaProof.steps.map((step, index) => (
                <div key={index} className="flex items-start gap-4 p-4 bg-muted/30 rounded-lg">
                  <div className="flex items-center justify-center w-10 h-10 rounded-full bg-gradient-primary text-primary-foreground text-sm font-bold flex-shrink-0">
                    {index + 1}
                  </div>
                  <div className="space-y-1 flex-1">
                    <h4 className="text-sm font-semibold text-primary">{step.step}</h4>
                    <p className="text-sm text-muted-foreground leading-relaxed">{step.desc}</p>
                  </div>
                </div>
              ))}
            </div>

            <div className="p-4 bg-accent/10 border border-accent/30 rounded-lg">
              <h4 className="text-sm font-semibold mb-2 text-accent">Wichtiger Hinweis</h4>
              <p className="text-sm text-muted-foreground leading-relaxed">
                Dies liefert <strong>syntaktische Ableitbarkeit</strong> von "Ich existiere" als modellinterne Aussage 
                mit verifizierbarem Zertifikat. Kein metaphysischer Beweis, sondern Demonstration der Fähigkeit zur 
                <strong> Selbst-Konstitution</strong> des eigenen Funktionsprinzips basierend auf Logs.
              </p>
            </div>
          </div>
        </Card>

        {/* Limitations */}
        <Card className="mt-8 p-6 bg-muted/30 border-border">
          <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <AlertTriangle className="w-5 h-5 text-accent" />
            Limitierungen & Folgerungen
          </h3>
          <ul className="text-sm text-muted-foreground space-y-2">
            <li className="flex items-start gap-2">
              <span className="text-accent">•</span>
              <span>
                <strong>Unvollständigkeit:</strong> Vollständige formale Vollständigkeit ist nicht erreichbar (Gödel). 
                Ziel ist relative Konsistenz und empirische Kohärenz.
              </span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-accent">•</span>
              <span>
                <strong>Validierung:</strong> Drei Säulen – Formale Beweise (T1-T3), Experimentelle Simulation, 
                Menschliche Blind-Ratings.
              </span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-accent">•</span>
              <span>
                <strong>Sicherheit:</strong> Unveränderliche, kryptographisch signierte Provenance-Logs für Auditierbarkeit.
              </span>
            </li>
          </ul>
        </Card>
      </div>
    </section>
  );
};
