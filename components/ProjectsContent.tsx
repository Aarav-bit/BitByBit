"use client";

import { useState, useEffect } from "react";
import { Search, Filter, Activity, ArrowRight, Shield, Database, Users } from "lucide-react";
import Link from "next/link";
import { toast } from "sonner";

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
  const myProjects = filteredProjects.filter(p => !!p.freelancer);

  return (
    <main className="flex-grow max-w-7xl mx-auto px-4 py-12 w-full font-mono">
      <div className="mb-12 border-b border-border pb-8">
        <h1 className="text-4xl font-black uppercase tracking-tighter mb-2">
          PROTOCOL // <span className="text-primary font-mono">REGISTRY</span>
        </h1>
        <p className="text-muted-foreground text-[10px] uppercase tracking-[0.3em] font-bold">
          Central Node for All Active and Available Subsidies
        </p>
      </div>

      <div className="flex flex-col md:flex-row gap-4 mb-8">
        <div className="relative flex-grow">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground opacity-40" />
          <input 
            type="text"
            placeholder="FILTER BY PROTOCOL TITLE OR DESCRIPTION..."
            className="w-full bg-card/30 border border-border rounded-sm py-3 pl-10 pr-4 text-[10px] uppercase font-bold tracking-widest focus:border-primary/50 outline-none transition-all placeholder:text-muted-foreground/30"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <button className="bg-card border border-border px-6 py-3 text-[10px] uppercase font-black hover:border-primary/50 transition-all flex items-center gap-2">
          <Filter className="w-4 h-4 opacity-40" />
          Protocol Filter
        </button>
      </div>

      <div className="grid grid-cols-1 gap-12">
        {/* AVAILABLE PROJECTS - FOR FREELANCERS */}
        {user.role === "FREELANCER" && availableProjects.length > 0 && (
          <section>
            <div className="flex items-center gap-3 mb-6">
              <div className="w-2 h-2 rounded-full bg-accent animate-ping" />
              <h2 className="font-bold text-sm uppercase tracking-[0.25em] text-accent">Open Protocol Nodes</h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {availableProjects.map(p => (
                <div key={p.id} className="p-6 border border-border bg-card/20 hover:bg-card/40 transition-all group relative overflow-hidden">
                  <div className="absolute top-0 left-0 w-full h-[1px] bg-accent/20 group-hover:bg-accent transition-colors" />
                  <div className="flex justify-between items-start mb-4">
                    <h3 className="text-lg font-bold uppercase tracking-tight">{p.title}</h3>
                    <span className="text-accent font-black text-xl tracking-tighter">${p.totalEscrow}</span>
                  </div>
                  <p className="text-[10px] text-muted-foreground font-sans line-clamp-2 mb-6 opacity-60">
                    {p.description}
                  </p>
                  <div className="flex items-center justify-between mt-auto pt-4 border-t border-border/20">
                    <div className="flex items-center gap-2 text-[9px] text-muted-foreground font-bold uppercase opacity-40">
                      <Users className="w-3 h-3" />
                      {p.employer.name}
                    </div>
                    <button 
                      onClick={() => handleJoin(p.id)}
                      className="text-[9px] bg-accent/10 border border-accent/20 text-accent px-4 py-2 hover:bg-accent hover:text-white transition-all uppercase font-black tracking-widest shadow-[0_0_15px_rgba(235,115,31,0.1)]"
                    >
                      CLAIM NODE
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* ALL PROJECTS STREAM */}
        <section>
          <div className="flex items-center gap-3 mb-6">
            <div className="w-2 h-2 rounded-full bg-primary" />
            <h2 className="font-bold text-sm uppercase tracking-[0.25em] text-primary/80">Active Protocol Stream</h2>
          </div>
          
          {loading ? (
            <div className="flex items-center gap-3 text-muted-foreground text-xs animate-pulse p-12 border border-border/20 rounded bg-card/10">
              <Activity className="w-4 h-4 animate-spin text-primary" />
              SYNCHRONIZING WITH BITBYBIT DATA LAYER...
            </div>
          ) : filteredProjects.length === 0 ? (
            <div className="p-24 border border-dashed border-border/30 rounded text-center">
              <Database className="w-12 h-12 text-muted-foreground mx-auto mb-4 opacity-5" />
              <p className="text-[10px] uppercase font-bold tracking-[0.2em] text-muted-foreground italic">No projects found in this parity segment.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-4">
              {filteredProjects.map(p => (
                <Link 
                  href={`/projects/${p.id}`} 
                  key={p.id}
                  className="flex flex-col md:flex-row justify-between items-start md:items-center p-6 border border-border bg-card/10 hover:bg-card/40 hover:border-primary/40 transition-all group"
                >
                  <div className="flex-grow">
                    <div className="flex items-center gap-3 mb-2">
                      <span className={`text-[8px] font-black px-2 py-0.5 rounded-sm uppercase tracking-tighter ${p.freelancer ? 'bg-primary/20 text-primary' : 'bg-accent/20 text-accent underline'}`}>
                        {p.freelancer ? "CONNECTED" : "UNCLAIMED"}
                      </span>
                      <span className="text-[8px] text-muted-foreground opacity-30">P://{p.id.slice(-8)}</span>
                    </div>
                    <h3 className="text-xl font-black uppercase tracking-tight group-hover:text-primary transition-colors">{p.title}</h3>
                    <div className="flex items-center gap-4 mt-2 text-[9px] text-muted-foreground uppercase font-bold opacity-60">
                      <span className="flex items-center gap-1"><Shield className="w-3 h-3" /> {p.milestones.length} Milestones</span>
                      <span className="flex items-center gap-1 opacity-20">|</span>
                      <span className="flex items-center gap-1"><Users className="w-3 h-3" /> {p.employer.name}</span>
                    </div>
                  </div>
                  
                  <div className="flex flex-col items-end gap-3 min-w-[200px] mt-6 md:mt-0 pt-6 md:pt-0 border-t md:border-t-0 border-border/20 w-full md:w-auto">
                    <div className="text-right">
                      <div className="text-[10px] font-black text-accent tracking-tighter text-xl">${p.totalEscrow}</div>
                      <div className="text-[8px] text-muted-foreground uppercase tracking-widest font-bold opacity-40">ESCROW LOCK</div>
                    </div>
                    <div className="flex items-center gap-2 text-[9px] font-black text-primary uppercase group-hover:gap-4 transition-all tracking-widest">
                      ACCESS NODE <ArrowRight className="w-3 h-3" />
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </section>
      </div>
    </main>
  );
}
