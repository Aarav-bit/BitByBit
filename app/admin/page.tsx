"use client";

import { useState, useEffect } from "react";
import { Loader2, ShieldAlert, Cpu, Database, Activity } from "lucide-react";
import { Navbar } from "@/components/Navbar";

interface AdminProject {
  id: string;
  title: string;
  status: string;
  employer: { name: string; email: string };
  freelancer?: { name: string; email: string; pfiScore: number };
  milestones: {
    id: string;
    title: string;
    status: string;
    amount: number;
    submissions: {
      id: string;
      aqaResult: string | null;
      aqaFeedback: string | null;
    }[];
  }[];
}

export default function AdminDashboard() {
  const [projects, setProjects] = useState<AdminProject[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/admin")
      .then(res => res.json())
      .then(data => {
        setProjects(data);
        setLoading(false);
      });
  }, []);

  const handleOverride = async (milestoneId: string, status: string, pfiAdjustment: number) => {
    const res = await fetch("/api/admin", {
      method: "PATCH",
      body: JSON.stringify({ milestoneId, status, pfiAdjustment }),
      headers: { "Content-Type": "application/json" }
    });
    if (res.ok) {
        // Refresh local state
        setProjects(prev => prev.map(p => ({
            ...p,
            milestones: p.milestones.map(m => m.id === milestoneId ? { ...m, status } : m)
        })));
    }
  };

  if (loading) return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center font-mono italic">
        <Loader2 className="w-12 h-12 text-primary animate-spin mb-4" />
        <p className="text-[10px] tracking-widest uppercase">Initializing Command Center Infrastructure...</p>
    </div>
  );

  return (
    <div className="min-h-screen bg-background text-foreground font-mono">
      <Navbar />
      <div className="max-w-7xl mx-auto space-y-12 p-8 pt-24">
        {/* Header */}
        <div className="flex justify-between items-end border-b border-primary/20 pb-8">
          <div>
            <h1 className="text-4xl font-extrabold uppercase tracking-tighter flex items-center gap-4">
              <ShieldAlert className="w-10 h-10 text-primary" />
              Command Center
            </h1>
            <p className="text-[10px] text-muted-foreground uppercase tracking-widest mt-2">Global Protocol Monitoring & Overrides</p>
          </div>
          <div className="flex gap-8 text-right">
             <div>
                <p className="text-[9px] uppercase opacity-40">System Pulse</p>
                <div className="flex items-center gap-2 text-green-500">
                    <Activity className="w-4 h-4" />
                    <span className="text-sm font-bold">NOMINAL</span>
                </div>
             </div>
             <div>
                <p className="text-[9px] uppercase opacity-40">Active Nodes</p>
                <div className="flex items-center gap-2 text-primary">
                    <Database className="w-4 h-4" />
                    <span className="text-sm font-bold">{projects.length}</span>
                </div>
             </div>
          </div>
        </div>

        {/* Global Stream */}
        <div className="space-y-6">
          <h2 className="text-xs font-bold uppercase tracking-[0.3em] flex items-center gap-2">
            <Cpu className="w-4 h-4 text-primary" />
            Global Protocol Stream
          </h2>
          
          <div className="grid grid-cols-1 gap-4">
            {projects.map(project => (
              <div key={project.id} className="border border-border bg-card overflow-hidden">
                <div className="p-4 bg-muted/30 border-b border-border flex justify-between items-center">
                  <div>
                    <h3 className="font-bold text-sm uppercase">{project.title}</h3>
                    <p className="text-[10px] text-muted-foreground">Employer: {project.employer.email}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-[10px] uppercase font-bold text-primary">{project.status}</p>
                    <p className="text-[10px] text-muted-foreground">FL: {project.freelancer?.email || "UNASSIGNED"}</p>
                  </div>
                </div>
                
                <div className="p-4 overflow-x-auto">
                    <table className="w-full text-left text-[11px]">
                        <thead>
                            <tr className="border-b border-border/50 opacity-40 uppercase">
                                <th className="py-2">Milestone ID</th>
                                <th>Status</th>
                                <th>Escrow</th>
                                <th>Submissions</th>
                                <th className="text-right">Overrides</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-border/20">
                            {project.milestones.map(m => (
                                <tr key={m.id} className="group">
                                    <td className="py-3 font-bold">{m.title}</td>
                                    <td className="py-3">
                                        <span className={`px-2 py-0.5 text-[9px] font-bold ${
                                            m.status === 'APPROVED' ? 'bg-green-500/10 text-green-500' :
                                            m.status === 'REJECTED' ? 'bg-red-500/10 text-red-500' :
                                            'bg-yellow-500/10 text-yellow-500'
                                        }`}>
                                            {m.status}
                                        </span>
                                    </td>
                                    <td className="py-3">${m.amount.toFixed(2)}</td>
                                    <td className="py-3">{m.submissions.length}</td>
                                    <td className="py-3 text-right space-x-2">
                                        <button 
                                            onClick={() => handleOverride(m.id, "APPROVED", 2)}
                                            className="px-2 py-1 border border-green-500/30 hover:bg-green-500/10 text-green-500 text-[9px] transition-all"
                                        >
                                            FORCE_PASS
                                        </button>
                                        <button 
                                            onClick={() => handleOverride(m.id, "REJECTED", -5)}
                                            className="px-2 py-1 border border-red-500/30 hover:bg-red-500/10 text-red-500 text-[9px] transition-all"
                                        >
                                            FORCE_FAIL
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
