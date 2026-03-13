import Link from "next/link";
import { Navbar } from "@/components/Navbar";
import { Zap, Activity, Database, Lock, ArrowRight, ShieldCheck } from "lucide-react";

export default function Home() {
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      
      <main className="flex-grow flex flex-col items-center justify-center px-4 py-20 text-center relative overflow-hidden bg-background font-mono">
        {/* Decorative Grid */}
        <div className="absolute inset-0 opacity-[0.03] pointer-events-none" 
             style={{ backgroundImage: 'radial-gradient(circle at center, #3b82f6 1px, transparent 1px)', backgroundSize: '40px 40px' }} />
        
        <div className="relative z-10 max-w-4xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-primary/20 bg-primary/5 text-primary text-[10px] font-bold tracking-tighter uppercase mb-8 animate-pulse">
            <Activity className="w-3 h-3" /> System Status: Operational // AQA Active
          </div>
          
          <h1 className="text-6xl md:text-8xl font-black mb-6 uppercase tracking-tighter leading-none">
            Trust is <span className="text-primary italic">Algorithmic</span>
          </h1>
          
          <p className="text-muted-foreground text-lg mb-12 max-w-2xl mx-auto font-sans leading-relaxed">
            BITBYBIT is the world&apos;s first AI-native escrow protocol. We use autonomous quality assurance (AQA) to trigger payments the second work meets the definition of done.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <Link 
              href="/dashboard"
              className="group bg-primary text-primary-foreground px-10 py-4 rounded font-bold text-lg flex items-center gap-2 hover:bg-primary/90 transition-all uppercase tracking-tight shadow-[0_0_20px_rgba(59,130,246,0.3)]"
            >
              Initialize Node <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </Link>
            <button className="px-10 py-4 rounded font-bold text-lg border border-border hover:bg-muted/50 transition-all uppercase tracking-tight">
              View Protocol
            </button>
          </div>

          <div className="mt-24 grid grid-cols-1 md:grid-cols-3 gap-8 text-left border-t border-border/50 pt-16">
            <FeatureCard 
              icon={<ShieldCheck className="w-6 h-6" />}
              title="Virtual Escrow"
              description="Funds are locked in project nodes, immutable until AQA verification."
            />
            <FeatureCard 
              icon={<Zap className="w-6 h-6" />}
              title="AQA Payouts"
              description="AI agents evaluate deliverables against the DoD. PASS = Instant credit."
            />
            <FeatureCard 
              icon={<Database className="w-6 h-6" />}
              title="PFI Reputation"
              description="Professional Fidelity Index tracks reliability scores on the ledger."
            />
          </div>
        </div>
      </main>

      <footer className="border-t border-border py-8 px-4 text-center text-[10px] text-muted-foreground font-mono uppercase tracking-[0.2em]">
        <div className="flex justify-center gap-6 mb-4">
          <span className="flex items-center gap-1"><Lock className="w-3 h-3" /> Secure Node</span>
          <span className="flex items-center gap-1 opacity-50 underline cursor-not-allowed">Protocol Paper</span>
          <span className="flex items-center gap-1 opacity-50 underline cursor-not-allowed">API Registry</span>
        </div>
        &copy; {new Date().getFullYear()} BITBYBIT PROTOCOL // AGENTIC ESCROW LAYER
      </footer>
    </div>
  );
}

function FeatureCard({ icon, title, description }: { icon: React.ReactNode, title: string, description: string }) {
  return (
    <div className="group border-l border-border pl-6 py-2 hover:border-primary transition-colors">
      <div className="text-primary mb-4 group-hover:scale-110 transition-transform origin-left">{icon}</div>
      <h3 className="font-bold text-sm uppercase tracking-widest mb-2">{title}</h3>
      <p className="text-xs text-muted-foreground font-sans leading-relaxed">{description}</p>
    </div>
  );
}
