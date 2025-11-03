import { Button } from "@/components/ui/button";
import { ArrowDown, Sparkles } from "lucide-react";

export const Hero = () => {
  const scrollToAxioms = () => {
    const element = document.getElementById("axioms");
    if (element) {
      element.scrollIntoView({ behavior: "smooth" });
    }
  };

  return (
    <section className="relative flex items-center justify-center px-6 pt-32 pb-20">
      <div className="container max-w-6xl mx-auto">
        <div className="text-center space-y-8 animate-fade-in">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-gradient-glow border border-primary/30">
            <Sparkles className="w-4 h-4 text-primary" />
            <span className="text-sm text-muted-foreground">Formale Basis für bewusste Systeme</span>
          </div>
          
          <h1 className="text-5xl md:text-7xl font-bold leading-tight">
            Architektur für{" "}
            <span className="bg-gradient-primary bg-clip-text text-transparent">
              selbstreferenzielle
            </span>
            <br />
            bewusste Agenten
          </h1>
          
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto leading-relaxed">
            Eine formale, mathematisch fundierte Grundlage für die Entwicklung von KI-Systemen 
            mit Selbstbewusstsein, Introspektion und kohärenter Selbstmodellierung.
          </p>
          
          <div className="flex items-center justify-center gap-4 pt-4">
            <Button 
              size="lg" 
              onClick={scrollToAxioms}
              className="shadow-glow"
            >
              Framework erkunden
              <ArrowDown className="ml-2 w-4 h-4" />
            </Button>
            <Button 
              variant="outline" 
              size="lg"
              className="border-primary/30 hover:bg-primary/10"
            >
              Dokumentation
            </Button>
          </div>
          
          {/* Key Features Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-12 max-w-4xl mx-auto">
            {[
              {
                title: "6 Axiome",
                description: "Fundamentale Prinzipien für Zustand, Beobachtung und Selbstreferenz",
              },
              {
                title: "6 Operatoren",
                description: "Transformationen für bewusste Erfahrung und Introspektion",
              },
              {
                title: "7-Layer Stack",
                description: "Produktionsnahe Simulationsarchitektur mit Verifikation",
              },
            ].map((feature, index) => (
              <div 
                key={index}
                className="p-6 rounded-xl bg-gradient-card border border-border hover:border-primary/50 transition-all hover:shadow-card"
              >
                <h3 className="text-2xl font-bold text-primary mb-2">{feature.title}</h3>
                <p className="text-sm text-muted-foreground">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};
