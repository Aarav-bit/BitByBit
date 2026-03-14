"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { Loader2, Shield, Activity, Zap, ArrowRight, Lock } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export default function ClientRoleSelector() {
  const router = useRouter();
  const [loading, setLoading] = useState<string | null>(null);

  const selectRole = async (role: string) => {
    setLoading(role);
    try {
      const res = await fetch("/api/user/role", {
        method: "POST",
        body: JSON.stringify({ role }),
        headers: { "Content-Type": "application/json" }
      });
      if (res.ok) {
        router.refresh();
      }
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(null);
    }
  };

  return (
    <div className="flex flex-col items-center max-w-5xl mx-auto w-full px-6">
      <motion.div 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center mb-16 space-y-4"
      >
        <div className="inline-flex items-center gap-2 px-3 py-1 bg-primary/10 border border-primary/20 rounded-full text-[10px] font-black tracking-[0.4em] text-primary uppercase animate-pulse">
          Identity Verification Required
        </div>
        <h1 className="text-5xl md:text-7xl font-black uppercase tracking-tighter italic">
          Select <span className="text-glow-primary">Protocol</span> Branch
        </h1>
        <p className="text-muted-foreground max-w-lg mx-auto font-sans leading-relaxed">
          Your choice determines your authorization level and available terminal modules within the FluxCred economy.
        </p>
      </motion.div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-10 w-full">
        <RoleCard 
          id="EMPLOYER"
          title="Protocol Authority" 
          description="Initialize secure milestones, fund automated escrows, and verify deliverables via AQA consensus." 
          icon={<Shield className="w-10 h-10" />}
          loading={loading === "EMPLOYER"}
          onClick={() => selectRole("EMPLOYER")}
          delay={0.2}
          accent="primary"
          features={["Deploy Protocols", "Smart Escrow", "Custom AQA Rules"]}
        />
        <RoleCard 
          id="FREELANCER"
          title="Node Freelancer" 
          description="Join active projects, push unit-tested deliverables, and build your Professional Fidelity Index (PFI)." 
          icon={<Activity className="w-10 h-10" />}
          loading={loading === "FREELANCER"}
          onClick={() => selectRole("FREELANCER")}
          delay={0.4}
          accent="accent"
          features={["Claim Uplinks", "PFI Reputation", "Instant Payouts"]}
        />
      </div>

      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.8 }}
        className="mt-16 flex items-center gap-3 text-[10px] font-black tracking-[0.2em] text-white/20 uppercase"
      >
        <Lock className="w-3 h-3" /> Encrypted Session // Peer-to-Peer Verification Active
      </motion.div>
    </div>
  );
}

function RoleCard({ 
  id, 
  title, 
  description, 
  icon, 
  loading, 
  onClick, 
  delay, 
  accent,
  features 
}: { 
  id: string,
  title: string, 
  description: string, 
  icon: React.ReactNode, 
  loading: boolean, 
  onClick: () => void,
  delay: number,
  accent: "primary" | "accent",
  features: string[]
}) {
  const isHovered = false; // Internal state would be better, but keeping it simple

  return (
    <motion.button 
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ delay, duration: 0.5 }}
      whileHover={{ y: -10, scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      onClick={onClick}
      disabled={loading !== false && loading !== null}
      className={`relative group p-10 border border-white/5 bg-white/2 backdrop-blur-xl text-left flex flex-col items-center gap-8 transition-all disabled:opacity-50 cursor-pointer overflow-hidden rounded-sm w-full`}
    >
      {/* Background Glow */}
      <div className={`absolute -top-24 -right-24 w-48 h-48 rounded-full blur-[80px] opacity-10 group-hover:opacity-20 transition-opacity ${accent === "primary" ? "bg-primary" : "bg-accent"}`} />
      
      <div className={`${accent === "primary" ? "text-primary" : "text-accent"} group-hover:scale-125 transition-all duration-500 relative`}>
        <div className="absolute inset-0 blur-lg opacity-40 group-hover:opacity-100 transition-opacity">{icon}</div>
        <div className="relative z-10">{loading ? <Loader2 className="w-10 h-10 animate-spin" /> : icon}</div>
      </div>

      <div className="text-center relative z-10 w-full">
        <h3 className="font-black text-3xl mb-4 italic uppercase tracking-tighter group-hover:text-glow-primary transition-colors">{title}</h3>
        <p className="text-xs text-muted-foreground font-sans leading-relaxed mb-8 opacity-80">{description}</p>
        
        <div className="flex flex-col gap-3 items-center">
          {features.map((feat, i) => (
            <div key={i} className="flex items-center gap-2 text-[9px] font-black tracking-widest uppercase text-white/40">
              <Zap className={`w-3 h-3 ${accent === "primary" ? "text-primary/40" : "text-accent/40"}`} />
              {feat}
            </div>
          ))}
        </div>
      </div>

      <div className="mt-4 pt-6 border-t border-white/5 w-full">
        <div className={`flex items-center justify-center gap-3 py-3 px-6 rounded-full border transition-all ${
          accent === "primary" 
            ? "border-primary/20 bg-primary/5 text-primary group-hover:bg-primary group-hover:text-white" 
            : "border-accent/20 bg-accent/5 text-accent group-hover:bg-accent group-hover:text-white"
        }`}>
          <span className="text-[10px] font-black uppercase tracking-widest">Connect to {id} Branch</span>
          <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
        </div>
      </div>

      {/* Decorative Corner */}
      <div className={`absolute top-0 right-0 w-8 h-8 border-t-2 border-r-2 opacity-20 transition-opacity group-hover:opacity-100 ${accent === "primary" ? "border-primary" : "border-accent"}`} />
    </motion.button>
  );
}

