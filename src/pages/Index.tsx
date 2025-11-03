import { useState } from "react";
import { Hero } from "@/components/Hero";
import { AxiomSection } from "@/components/AxiomSection";
import { OperatorSection } from "@/components/OperatorSection";
import { ArchitectureSection } from "@/components/ArchitectureSection";
import { TheoremsSection } from "@/components/TheoremsSection";
import { Navigation } from "@/components/Navigation";

const Index = () => {
  const [activeSection, setActiveSection] = useState("hero");

  return (
    <div className="min-h-screen bg-background text-foreground">
      <Navigation activeSection={activeSection} setActiveSection={setActiveSection} />
      
      <main className="relative">
        <div id="hero" className="min-h-screen">
          <Hero />
        </div>
        
        <div id="axioms" className="min-h-screen">
          <AxiomSection />
        </div>
        
        <div id="operators" className="min-h-screen">
          <OperatorSection />
        </div>
        
        <div id="architecture" className="min-h-screen">
          <ArchitectureSection />
        </div>
        
        <div id="theorems" className="min-h-screen">
          <TheoremsSection />
        </div>
      </main>
      
      {/* Background effects */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden -z-10">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary/10 rounded-full blur-[128px] animate-pulse-glow" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-secondary/10 rounded-full blur-[128px] animate-pulse-glow" style={{ animationDelay: "1s" }} />
      </div>
    </div>
  );
};

export default Index;
