"use client";

import { useState, useEffect } from "react";
import { Search, Filter, Activity, ArrowRight, Shield, Database, Users, Cpu, Globe, Zap } from "lucide-react";
import Link from "next/link";
import { toast } from "sonner";
import { motion, AnimatePresence } from "framer-motion";

interface Project {
  id: string;
  title: string;
  description: string;
  status: string;
  totalEscrow: number;
  employer: { name: string; email: string };
  freelancer?: { name: string; email: string };
  milestones: { id: string }[];
}

export default function ProjectsContent({ user }: { user: any }) {
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  const fetchProjects = async () => {
    try {
      const res = await fetch("/api/projects");
      if (res.ok) {
        const data = await res.json();
        setProjects(data);
      }
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProjects();
  }, []);

  const handleJoin = async (projectId: string) => {
    try {
      const res = await fetch(`/api/projects/${projectId}/join`, {
        method: "POST"
      });
      if (res.ok) {
        toast.success("Protocol node claimed. Initializing synchronization...");
        fetchProjects();
      } else {
        toast.error("Failed to claim node. System busy or restricted.");
      }
    } catch (error) {
      toast.error("Critical error during protocol joining.");
    }
  };

  const filteredProjects = projects.filter(p => 
    p.title.toLowerCase().includes(search.toLowerCase()) || 
    p.description.toLowerCase().includes(search.toLowerCase())
  );

  const availableProjects = filteredProjects.filter(p => !p.freelancer);

  return (
    <main className="flex-grow max-w-7xl mx-auto px-6 py-16 w-full relative">
      {/* Background Ambience */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-[500px] bg-gradient-to-b from-primary/5 via-transparent to-transparent -z-10 blur-3xl" />
      
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-16 relative"
      >
        <div className="flex items-center gap-4 mb-4">
          <div className="h-[1px] w-12 bg-primary/40" />
          <span className="text-[10px] uppercase tracking-[0.5em] font-black text-primary/60">System_Registry_v4.0</span>
        </div>
        <h1 className="text-5xl md:text-7xl font-black uppercase tracking-tighter mb-4 italic leading-none">
          Project <span className="text-glow-primary">Protocol</span>
        </h1>
        <div className="flex flex-col md:flex-row md:items-center gap-6">
          <p className="text-slate-500 text-[11px] uppercase tracking-[0.3em] font-bold max-w-xl leading-relaxed">
            Centralized clearing house for distributed development nodes. 
            All escrowed assets are mathematically secured via FluxLink protocol.
          </p>
          <div className="flex items-center gap-8 ml-auto border-l border-white/10 pl-8">
            <div className="flex flex-col">
              <span className="text-[10px] text-slate-500 uppercase font-black tracking-widest">Nodes_Online</span>
              <span className="text-2xl font-black italic text-glow-primary">{projects.length}</span>
            </div>
            <div className="flex flex-col">
              <span className="text-[10px] text-slate-500 uppercase font-black tracking-widest">Liquidity_Locked</span>
              <span className="text-2xl font-black italic text-glow-accent">${projects.reduce((acc, p) => acc + p.totalEscrow, 0).toLocaleString()}</span>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Control Bar */}
      <motion.div 
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="flex flex-col md:flex-row gap-6 mb-16 p-2 bg-slate-900/40 border border-white/5 rounded-2xl backdrop-blur-xl"
      >
        <div className="relative flex-grow">
          <Search className="absolute left-6 top-1/2 -translate-y-1/2 w-4 h-4 text-primary opacity-50" />
          <input 
            type="text"
            placeholder="SEARCH REGISTRY BY PROTOCOL ID OR TITLE..."
            className="w-full bg-transparent rounded-xl py-4 pl-14 pr-6 text-[11px] uppercase font-black tracking-widest focus:bg-white/5 outline-none transition-all placeholder:text-slate-600"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <div className="flex gap-4 p-2">
          <button className="px-8 py-3 bg-white/5 hover:bg-white/10 border border-white/5 rounded-xl text-[10px] uppercase font-black tracking-widest transition-all flex items-center gap-3">
            <Filter className="w-3.5 h-3.5 opacity-60" />
            Filter_Config
          </button>
          <div className="w-[1px] h-full bg-white/10 mx-2 hidden md:block" />
          <div className="flex items-center gap-3 px-4">
            <Activity className="w-4 h-4 text-accent" />
            <div className="flex flex-col">
              <span className="text-[8px] uppercase font-black text-slate-500">Node_Status</span>
              <span className="text-[10px] uppercase font-black text-accent text-glow-accent">Syncing</span>
            </div>
          </div>
        </div>
      </motion.div>

      <div className="space-y-20">
        {/* AVAILABLE PROJECTS - FOR FREELANCERS */}
        {user.role === "FREELANCER" && availableProjects.length > 0 && (
          <section>
            <div className="flex items-center gap-4 mb-10 overflow-hidden">
              <div className="p-3 bg-accent/10 border border-accent/20 rounded-xl">
                <Globe className="w-5 h-5 text-accent animate-pulse" />
              </div>
              <div className="flex flex-col">
                <h2 className="font-black text-xl uppercase tracking-widest italic text-accent">Open Access Nodes</h2>
                <span className="text-[9px] text-slate-500 uppercase font-black tracking-[0.3em]">Direct_Join_Available</span>
              </div>
              <div className="flex-grow h-[1px] bg-gradient-to-r from-accent/30 to-transparent ml-6" />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <AnimatePresence mode="popLayout">
                {availableProjects.map((p, idx) => (
                  <motion.div 
                    key={p.id}
                    layout
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    transition={{ delay: idx * 0.05 }}
                    className="p-8 border border-accent/10 bg-slate-900/40 rounded-3xl group relative overflow-hidden backdrop-blur-md"
                  >
                    <div className="absolute top-0 right-0 p-6 opacity-5 group-hover:opacity-10 transition-opacity">
                      <Zap className="w-20 h-20 text-accent" />
                    </div>
                    
                    <div className="flex justify-between items-start mb-6">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <div className="w-1.5 h-1.5 rounded-full bg-accent animate-ping" />
                          <span className="text-[9px] text-accent font-black uppercase tracking-widest">Active_Node</span>
                        </div>
                        <h3 className="text-2xl font-black uppercase tracking-tighter italic group-hover:text-glow-accent transition-all leading-none pt-2">{p.title}</h3>
                      </div>
                      <div className="text-right">
                        <span className="text-accent font-black text-4xl tracking-tighter italic drop-shadow-[0_0_15px_rgba(235,115,31,0.3)]">${p.totalEscrow.toLocaleString()}</span>
                      </div>
                    </div>

                    <p className="text-[12px] text-slate-400 font-sans leading-relaxed mb-10 opacity-70 group-hover:opacity-100 transition-opacity line-clamp-2">
                      {p.description}
                    </p>

                    <div className="flex items-center justify-between pt-6 border-t border-white/5">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-white/5 border border-white/10 flex items-center justify-center">
                          <Users className="w-4 h-4 text-slate-500" />
                        </div>
                        <div className="flex flex-col">
                          <span className="text-[8px] text-slate-500 uppercase font-black">Origin_Peer</span>
                          <span className="text-[10px] text-slate-300 font-bold uppercase">{p.employer.name}</span>
                        </div>
                      </div>
                      <button 
                        onClick={() => handleJoin(p.id)}
                        className="group/btn relative px-8 py-3 bg-accent/20 hover:bg-accent border border-accent/40 hover:border-accent text-accent hover:text-white transition-all rounded-xl font-black uppercase tracking-widest text-[9px] shadow-[0_0_20px_rgba(235,115,31,0.1)] hover:shadow-[0_0_30px_rgba(235,115,31,0.3)]"
                      >
                        <span className="relative z-10">Claim_Node_ID</span>
                      </button>
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          </section>
        )}

        {/* ALL PROJECTS STREAM */}
        <section>
          <div className="flex items-center gap-4 mb-10 overflow-hidden">
            <div className="p-3 bg-primary/10 border border-primary/20 rounded-xl">
              <Cpu className="w-5 h-5 text-primary" />
            </div>
            <div className="flex flex-col">
              <h2 className="font-black text-xl uppercase tracking-widest italic text-primary">Registry Stream</h2>
              <span className="text-[9px] text-slate-500 uppercase font-black tracking-[0.3em]">Network_Archive_Logs</span>
            </div>
            <div className="flex-grow h-[1px] bg-gradient-to-r from-primary/30 to-transparent ml-6" />
          </div>
          
          {loading ? (
            <div className="flex flex-col items-center justify-center py-32 border border-white/5 rounded-3xl bg-slate-900/20 backdrop-blur-xl relative overflow-hidden group">
              <div className="absolute inset-0 scanner-line opacity-20" />
              <motion.div 
                animate={{ rotate: 360 }}
                transition={{ duration: 4, repeat: Infinity, ease: "linear" }}
                className="mb-6"
              >
                <div className="p-4 bg-primary/10 border border-primary/30 rounded-full">
                  <Activity className="w-8 h-8 text-primary" />
                </div>
              </motion.div>
              <p className="text-[11px] font-black uppercase tracking-[0.5em] text-primary/60 animate-pulse">Syncing_Protocol_Registry...</p>
            </div>
          ) : filteredProjects.length === 0 ? (
            <div className="py-40 border border-dashed border-white/10 rounded-3xl text-center bg-slate-900/10">
              <Database className="w-16 h-16 text-slate-800 mx-auto mb-6" />
              <p className="text-[11px] uppercase font-black tracking-[0.4em] text-slate-500 italic px-10">No protocol segments match your query parameters.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-4">
              <AnimatePresence mode="popLayout">
                {filteredProjects.map((p, idx) => (
                  <motion.div
                    key={p.id}
                    layout
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: idx * 0.03 }}
                  >
                    <Link 
                      href={`/projects/${p.id}`} 
                      className="flex flex-col md:flex-row justify-between items-start md:items-center p-8 bg-slate-900/40 border border-white/5 hover:border-primary/40 hover:bg-slate-900/60 transition-all group rounded-2xl relative overflow-hidden backdrop-blur-md"
                    >
                      <div className="absolute left-0 top-0 h-full w-[2px] bg-primary scale-y-0 group-hover:scale-y-100 transition-transform origin-top" />
                      
                      <div className="flex-grow space-y-4">
                        <div className="flex items-center gap-4">
                          <span className={`text-[9px] font-black px-4 py-1 rounded-full uppercase tracking-tighter shadow-inner ${p.freelancer ? 'bg-primary/10 text-primary border border-primary/30' : 'bg-slate-800 text-slate-500 border border-white/5'}`}>
                            {p.freelancer ? "Link_Established" : "Awaiting_Peer"}
                          </span>
                          <span className="text-[9px] font-mono text-slate-600 tracking-widest opacity-50 font-black">P_TRX://{p.id.slice(-12).toUpperCase()}</span>
                        </div>
                        <h3 className="text-2xl font-black uppercase tracking-tight group-hover:text-glow-primary transition-all leading-tight italic">{p.title}</h3>
                        <div className="flex flex-wrap items-center gap-6 text-[9px] text-slate-500 uppercase font-black tracking-widest">
                          <span className="flex items-center gap-2 group-hover:text-slate-300 transition-colors"><Shield className="w-3.5 h-3.5" /> {p.milestones.length} Milestones</span>
                          <span className="w-1 h-1 rounded-full bg-slate-800" />
                          <span className="flex items-center gap-2 group-hover:text-slate-300 transition-colors"><Users className="w-3.5 h-3.5" /> {p.employer.name}</span>
                        </div>
                      </div>
                      
                      <div className="flex flex-col items-end gap-6 min-w-[240px] mt-8 md:mt-0 pt-8 md:pt-0 border-t md:border-t-0 border-white/5 w-full md:w-auto">
                        <div className="text-right">
                          <div className="text-[10px] text-slate-500 uppercase tracking-[0.3em] font-black mb-1">Escrow_Volume</div>
                          <div className="text-4xl font-black text-accent tracking-tighter italic drop-shadow-[0_0_15px_rgba(235,115,31,0.2)]">${p.totalEscrow.toLocaleString()}</div>
                        </div>
                        <div className="flex items-center gap-3 text-[10px] font-black text-primary uppercase group-hover:gap-5 transition-all tracking-[0.4em]">
                          Access_Node <ArrowRight className="w-4 h-4" />
                        </div>
                      </div>
                    </Link>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          )}
        </section>
      </div>
    </main>
  );
}
