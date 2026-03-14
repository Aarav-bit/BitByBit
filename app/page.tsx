import Link from "next/link";
import { Navbar } from "@/components/Navbar";
import { Zap, Activity, Database, Lock, ArrowRight, ShieldCheck } from "lucide-react";
import { HoverCard } from "@/components/ui/HoverCard";

export default function Home() {
  return (
    <div className="min-h-screen flex flex-col relative z-10">
      <Navbar />
      
      <main className="flex-grow flex flex-col items-center justify-center px-4 py-20 text-center relative overflow-hidden font-mono">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(59,130,246,0.05)_0%,transparent_70%)] pointer-events-none" />
        
        <div className="relative z-10 max-w-5xl">
          <div 
            className="inline-flex items-center gap-3 px-4 py-1.5 rounded-full border border-white/5 bg-white/5 text-primary text-[10px] font-bold tracking-[0.2em] uppercase mb-12 animate-in fade-in slide-in-from-bottom-4 duration-1000"
          >
            <div className="w-2 h-2 rounded-full bg-primary animate-pulse shadow-[0_0_10px_rgba(59,130,246,1)]" />
            PROTOCOL V0.1.0-ALPHA // AQA ENGINE STANDBY
          </div>
          
          <h1 className="text-7xl md:text-[10rem] font-black mb-8 uppercase tracking-tighter leading-none glow-text animate-in fade-in zoom-in-95 duration-1000 delay-200">
            DECENTRALIZED <br />
            <span className="text-primary italic relative">
              QUALITY
              <span className="absolute -bottom-2 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-primary/50 to-transparent" />
            </span>
          </h1>
          
          <p className="text-slate-400 text-xl mb-16 max-w-3xl mx-auto font-sans leading-relaxed opacity-0 animate-in fade-in slide-in-from-bottom-4 fill-mode-forwards duration-1000 delay-500">
            FluxCred is the algorithmic layer for the next economy. We automate trust via autonomous quality assurance (AQA), triggering payments the millisecond deliverables meet the definition of done.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-8 justify-center items-center opacity-0 animate-in fade-in slide-in-from-bottom-8 fill-mode-forwards duration-1000 delay-700">
            <Link 
              href="/dashboard"
              className="group bg-primary text-primary-foreground px-16 py-6 rounded-full font-black text-xl flex items-center gap-3 hover:bg-primary/90 transition-all uppercase tracking-tight shadow-[0_0_40px_rgba(59,130,246,0.3)] hover:shadow-[0_0_60px_rgba(59,130,246,0.5)] active:scale-95"
            >
              UPLINK NODE <ArrowRight className="w-6 h-6 group-hover:translate-x-1 transition-transform" />
            </Link>
            <button className="px-16 py-6 rounded-full font-black text-xl border border-white/10 hover:bg-white/5 transition-all uppercase tracking-tight backdrop-blur-xl relative overflow-hidden group">
              <span className="relative z-10">PROTOCOL SPECS</span>
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000" />
            </button>
          </div>

          <div className="mt-32 grid grid-cols-1 md:grid-cols-3 gap-8 text-left pt-16">
            <HoverCard delay={0.1}>
              <ShieldCheck className="w-8 h-8 text-primary mb-4" />
              <h3 className="font-bold text-base uppercase tracking-widest mb-3">Virtual Escrow</h3>
              <p className="text-sm text-slate-400 font-sans leading-relaxed">
                Funds are locked in project nodes, immutable and transparent until AQA verification triggers release.
              </p>
            </HoverCard>
            
            <HoverCard delay={0.2}>
              <Zap className="w-8 h-8 text-accent mb-4" />
              <h3 className="font-bold text-base uppercase tracking-widest mb-3">AQA Payouts</h3>
              <p className="text-sm text-slate-400 font-sans leading-relaxed">
                Multi-agent AI evaluates deliverables against the DoD. Weighted scoring ensures precision and fairness.
              </p>
            </HoverCard>

            <HoverCard delay={0.3}>
              <Database className="w-8 h-8 text-primary mb-4" />
              <h3 className="font-bold text-base uppercase tracking-widest mb-3">PFI Reputation</h3>
              <p className="text-sm text-slate-400 font-sans leading-relaxed">
                The Professional Fidelity Index tracks reliability scores on-chain, creating a trustless meritocracy.
              </p>
            </HoverCard>
          </div>
        </div>
      </main>

      <footer className="border-t border-white/5 py-12 px-4 text-center text-[10px] text-slate-500 font-mono uppercase tracking-[0.3em] backdrop-blur-md">
        <div className="flex justify-center gap-8 mb-6">
          <span className="flex items-center gap-2 hover:text-primary transition-colors cursor-pointer"><Lock className="w-3 h-3" /> Secure Node</span>
          <span className="flex items-center gap-2 hover:text-primary transition-colors cursor-pointer">Protocol Paper</span>
          <span className="flex items-center gap-2 hover:text-primary transition-colors cursor-pointer">API Registry</span>
        </div>
        &copy; {new Date().getFullYear()} FLUXCRED PROTOCOL // AGENTIC ESCROW LAYER // VER-0.1.0-ALPHA
      </footer>
    </div>
  );
}
