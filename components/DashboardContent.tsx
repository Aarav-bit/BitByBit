"use client";

import { useState, useEffect } from "react";
import { Plus, Wallet, Shield, Activity, Database, ArrowRight, ExternalLink } from "lucide-react";
import Link from "next/link";
import CreateProjectModal from "./CreateProjectModal";

interface Project {
  id: string;
  title: string;
  description: string;
  status: string;
  totalEscrow: number;
  milestones: { id: string; status: string }[];
  employer: { name: string; email: string };
  freelancer?: { name: string; email: string };
}

interface User {
  name: string | null;
  role: string | null;
  pfiScore: number;
  virtualBalance: number;
}

export default function DashboardContent({ user }: { user: User }) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchProjects = async () => {
    try {
      const res = await fetch("/api/projects");
      if (res.ok) {
        const data: Project[] = await res.json();
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

  const isEmployer = user.role === "EMPLOYER";

  return (
    <main className="flex-grow max-w-7xl mx-auto px-4 py-12 w-full text-foreground font-mono">
      <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-12">
        <div>
          <h1 className="text-3xl font-bold uppercase tracking-tighter text-glow-primary">
            TERMINAL // <span className="text-primary">{(user.name || "UNIDENTIFIED USER").replace(/\s+null$/i, "")}</span>
          </h1>
          <p className="text-muted-foreground text-xs flex flex-wrap items-center gap-4 mt-2">
            <span className="flex items-center gap-2">
              <span className="opacity-40">BRANCH:</span>
              <span className="text-foreground font-bold border-b border-primary/40">{user.role}</span>
            </span>
            <span className="opacity-20">|</span>
            <span className="flex items-center gap-2">
              <span className="opacity-40">REPUTATION (PFI):</span>
              <span className="text-foreground tracking-widest">{user.pfiScore}%</span>
            </span>
          </p>
        </div>
        
        <div className="flex gap-4">
          {isEmployer && (
            <button 
              onClick={() => setIsModalOpen(true)}
              className="bg-primary text-primary-foreground px-6 py-3 rounded-sm font-bold text-sm flex items-center gap-2 hover:bg-primary/90 transition-all uppercase cursor-pointer shadow-[0_0_20px_rgba(59,130,246,0.2)] border border-primary/20"
            >
              <Plus className="w-4 h-4" />
              NEW PROTOCOL
            </button>
          )}
        </div>
      </header>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
        <StatCard title="Virtual Balance" value={`$${user.virtualBalance.toFixed(2)}`} icon={<Wallet className="w-4 h-4" />} />
        <StatCard title="Active Protocols" value={projects.length.toString()} icon={<Activity className="w-4 h-4" />} />
        <StatCard title="Reliability Index" value={`${user.pfiScore}%`} icon={<Shield className="w-4 h-4" />} color="text-accent" />
        <StatCard title="System Uptime" value="99.9%" icon={<Activity className="w-4 h-4" />} />
      </div>

      <section>
        <div className="flex justify-between items-end mb-6 border-b border-border pb-4">
          <div className="flex items-center gap-3">
            <div className="w-2 h-2 rounded-full bg-primary animate-pulse" />
            <h2 className="font-bold text-lg uppercase tracking-[0.2em] text-primary/80">Active Protocol Stream</h2>
          </div>
          <Link href="/projects" className="text-[10px] text-muted-foreground hover:text-primary transition-colors flex items-center gap-1 uppercase tracking-widest font-bold">
            Full Archive <ExternalLink className="w-3 h-3" />
          </Link>
        </div>

        <div className="space-y-4">
          {loading ? (
            <div className="flex items-center gap-3 text-muted-foreground text-xs animate-pulse p-12 border border-border/20 rounded bg-card/10">
              <Activity className="w-4 h-4 animate-spin text-primary" />
              SYNCHRONIZING WITH FLUXCRED DATA LAYER...
            </div>
          ) : projects.length === 0 ? (
            <div className="py-24 text-center border border-dashed border-border/50 rounded bg-muted/5">
              <Database className="w-12 h-12 text-muted-foreground mx-auto mb-4 opacity-10" />
              <p className="text-muted-foreground italic text-sm uppercase tracking-widest leading-loose">No active protocols detected in local buffer.</p>
              {isEmployer && (
                <button 
                  onClick={() => setIsModalOpen(true)}
                  className="mt-6 text-[10px] text-primary hover:underline uppercase font-bold tracking-widest"
                >
                  [ Initialize First Protocol Node ]
                </button>
              )}
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-4">
              {projects.map((project) => (
                <ProjectCard key={project.id} project={project} isEmployer={isEmployer} />
              ))}
            </div>
          )}
        </div>
      </section>

      {isModalOpen && <CreateProjectModal onClose={() => { setIsModalOpen(false); fetchProjects(); }} />}
    </main>
  );
}

function ProjectCard({ project, isEmployer }: { project: Project, isEmployer: boolean }) {
  const completedMilestones = project.milestones.filter((m) => m.status === "APPROVED").length;
  const totalMilestones = project.milestones.length;
  const progress = totalMilestones > 0 ? (completedMilestones / totalMilestones) * 100 : 0;

  return (
    <div className="group p-6 border border-border bg-card/30 hover:bg-card/70 hover:border-primary/50 transition-all relative overflow-hidden backdrop-blur-sm">
      <div className="absolute top-0 left-0 w-1 h-full bg-primary/20 group-hover:bg-primary transition-colors" />
      
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div className="flex-grow">
          <div className="flex items-center gap-2 mb-2">
            <span className="text-[10px] bg-primary/10 text-primary px-2 py-0.5 rounded-sm border border-primary/20 uppercase font-bold tracking-tighter">
              {project.status.replace(/_/g, " ")}
            </span>
            <span className="text-[10px] text-muted-foreground uppercase opacity-40">PROTO://{project.id.slice(-8)}</span>
          </div>
          <h3 className="text-xl font-bold uppercase tracking-tight group-hover:text-primary transition-colors mb-1">{project.title}</h3>
          <p className="text-xs text-muted-foreground line-clamp-1 max-w-2xl font-sans opacity-80">
            {isEmployer ? (
              <span className="flex items-center gap-2">
                <span className="opacity-40 uppercase">Freelancer:</span> 
                <span className="text-foreground">{project.freelancer?.name || "UNASSIGNED"}</span>
              </span>
            ) : (
              <span className="flex items-center gap-2">
                <span className="opacity-40 uppercase">Employer:</span> 
                <span className="text-foreground">{project.employer.name}</span>
              </span>
            )}
          </p>
        </div>

        <div className="flex flex-col items-start md:items-end gap-3 min-w-[150px]">
          <div className="text-left md:text-right">
            <div className="text-[9px] text-muted-foreground uppercase mb-1 font-bold tracking-widest opacity-60">Escrow Value</div>
            <div className="text-2xl font-black text-accent tracking-tighter">${project.totalEscrow.toFixed(2)}</div>
          </div>
          <Link 
            href={`/projects/${project.id}`}
            className="text-[10px] bg-muted/50 border border-border/40 px-6 py-2 hover:bg-primary hover:text-primary-foreground hover:border-primary transition-all flex items-center gap-2 uppercase font-black tracking-widest"
          >
            Access Node <ArrowRight className="w-3 h-3 group-hover:translate-x-1 transition-transform" />
          </Link>
        </div>
      </div>

      <div className="mt-8">
        <div className="flex justify-between items-center mb-2">
          <span className="text-[9px] text-muted-foreground font-bold uppercase tracking-widest opacity-60">Protocol Progress</span>
          <span className="text-[9px] text-primary font-bold uppercase tracking-widest">
            {completedMilestones}/{totalMilestones} Milestones Clear ({Math.round(progress)}%)
          </span>
        </div>
        <div className="bg-muted/30 h-1.5 rounded-full overflow-hidden border border-border/10">
          <div 
            className="bg-primary h-full transition-all duration-1000 ease-out shadow-[0_0_10px_rgba(59,130,246,0.5)]" 
            style={{ width: `${progress}%` }} 
          />
        </div>
      </div>
    </div>
  );
}

function StatCard({ title, value, icon, color = "text-primary" }: { title: string, value: string, icon: React.ReactNode, color?: string }) {
  return (
    <div className="p-6 border border-border bg-card relative overflow-hidden group hover:border-primary/30 transition-all">
      <div className="absolute -right-6 -bottom-6 text-primary/5 group-hover:text-primary/10 transition-transform group-hover:scale-125 duration-500">
        <div className="w-24 h-24">{icon}</div>
      </div>
      <div className="flex justify-between items-center mb-6 relative z-10">
        <span className="text-[10px] text-muted-foreground uppercase tracking-widest font-bold opacity-60">{title}</span>
        <div className={`${color} opacity-80 group-hover:opacity-100 transition-opacity`}>{icon}</div>
      </div>
      <div className="text-3xl font-black tracking-tighter relative z-10 group-hover:text-primary transition-colors cursor-default">{value}</div>
    </div>
  );
}
