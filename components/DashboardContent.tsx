"use client";

import { useState, useEffect } from "react";
import { Plus, Wallet, Shield, Activity, Database, ArrowRight, ExternalLink, Cpu, Terminal } from "lucide-react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
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
    <main className="flex-grow max-w-7xl mx-auto px-6 py-24 w-full text-foreground font-mono">
      {/* Background Ambience */}
      <div className="fixed inset-0 pointer-events-none z-0">
        <div className="absolute top-1/4 left-1/4 w-[500px] h-[500px] bg-primary/10 blur-[150px] rounded-full animate-float opacity-50" />
        <div className="absolute bottom-1/4 right-1/4 w-[500px] h-[500px] bg-accent/5 blur-[150px] rounded-full animate-float opacity-30 delay-1000" />
      </div>

      <motion.header 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
        className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-8 mb-16 relative z-10"
      >
        <div className="space-y-3">
          <div className="flex items-center gap-3">
            <span className="flex h-2 w-2 relative">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-primary"></span>
            </span>
            <span className="text-[10px] text-primary font-black tracking-[0.5em] uppercase text-glow-primary">Protocol_Stream_Secure</span>
          </div>
          <h1 className="text-4xl md:text-6xl font-black uppercase tracking-tighter italic">
            CONTROLLER // <span className="text-primary text-glow-primary">{(user.name || "OPERATOR").toUpperCase().split(' ')[0]}</span>
          </h1>
          <div className="flex flex-wrap items-center gap-3 pt-1">
            <div className="px-4 py-1.5 bg-slate-900 border border-primary/20 rounded-lg text-[9px] uppercase tracking-widest font-black flex items-center gap-2.5 shadow-lg group hover:border-primary/50 transition-all">
              <div className="w-1.5 h-1.5 bg-primary rounded-full animate-pulse" />
              <span className="text-slate-400">Branch_ID:</span>
              <span className="text-primary">{user.role}</span>
            </div>
            <div className="px-4 py-1.5 bg-slate-900 border border-accent/20 rounded-lg text-[9px] uppercase tracking-widest font-black flex items-center gap-2.5 shadow-lg group hover:border-accent/50 transition-all">
              <div className="w-1.5 h-1.5 bg-accent rounded-full animate-pulse" />
              <span className="text-slate-400">Reputation_Sig:</span>
              <span className="text-accent text-glow-accent">{user.pfiScore}%_Fidelity</span>
            </div>
          </div>
        </div>
        
        <div className="flex gap-4">
          {isEmployer && (
            <motion.button 
              whileHover={{ scale: 1.05, boxShadow: "0 0 40px rgba(59,130,246,0.3)" }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setIsModalOpen(true)}
              className="group relative overflow-hidden bg-primary text-white px-12 py-6 rounded-2xl font-black text-xs flex items-center gap-4 uppercase tracking-[0.2em] shadow-xl border border-white/20"
            >
              <div className="absolute inset-0 bg-white/20 -translate-x-full group-hover:translate-x-0 transition-transform duration-500" />
              <div className="absolute inset-0 shimmer opacity-0 group-hover:opacity-100" />
              <Plus className="w-5 h-5 group-hover:rotate-180 transition-transform duration-500" />
              <span className="relative z-10">Initialize_Protocol</span>
            </motion.button>
          )}
        </div>
      </motion.header>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-16 relative z-10">
        <StatCard delay={0.1} title="Credit_Buffer" value={`$${user.virtualBalance.toLocaleString()}`} icon={<Wallet className="w-5 h-5" />} />
        <StatCard delay={0.2} title="Active_Nodes" value={projects.length.toString()} icon={<Activity className="w-5 h-5" />} />
        <StatCard delay={0.3} title="Fidelity_Index" value={`${user.pfiScore}%`} icon={<Shield className="w-5 h-5" />} color="text-accent" />
        <StatCard delay={0.4} title="Thread_Load" value="12.7%" icon={<Cpu className="w-5 h-5" />} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-10 relative z-10">
        {/* Main Feed */}
        <div className="lg:col-span-2">
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
            className="flex justify-between items-center mb-8 border-b border-white/10 pb-6"
          >
            <div className="flex items-center gap-4">
              <div className="p-2.5 bg-primary/10 rounded-xl border border-primary/30 shadow-inner">
                <Terminal className="w-5 h-5 text-primary text-glow-primary" />
              </div>
              <h2 className="font-black text-2xl uppercase tracking-tighter italic">Active_Subprocesses</h2>
            </div>
            <Link href="/projects" className="group text-[10px] text-slate-500 hover:text-primary transition-all flex items-center gap-3 uppercase tracking-[0.3em] font-black">
              Archive_Matrix <ArrowRight className="w-4 h-4 group-hover:translate-x-1.5 transition-transform" />
            </Link>
          </motion.div>

          <div className="space-y-8">
            {loading ? (
              <div className="flex flex-col items-center justify-center py-40 space-y-6 border border-white/5 bg-slate-900/40 rounded-3xl backdrop-blur-2xl scanner-line">
                <div className="relative">
                  <Activity className="w-12 h-12 animate-spin text-primary opacity-50" />
                  <div className="absolute inset-0 animate-ping bg-primary/20 rounded-full" />
                </div>
                <div className="text-[10px] font-black tracking-[0.6em] text-primary/80 animate-pulse uppercase">Syncing_Neural_Link...</div>
              </div>
            ) : projects.length === 0 ? (
              <motion.div 
                initial={{ scale: 0.98, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                className="py-40 text-center border border-dashed border-white/10 rounded-3xl bg-slate-900/20 backdrop-blur-sm group hover:border-primary/30 transition-all duration-500"
              >
                <div className="relative inline-block mb-8">
                  <Database className="w-16 h-16 text-slate-800 group-hover:text-primary/20 transition-colors" />
                  <div className="absolute inset-0 animate-pulse bg-primary/5 blur-3xl rounded-full" />
                </div>
                <p className="text-slate-500 text-[11px] uppercase tracking-[0.4em] font-black mb-10">Matrix_Is_Empty</p>
                {isEmployer && (
                  <button 
                    onClick={() => setIsModalOpen(true)}
                    className="group relative px-10 py-3 rounded-full overflow-hidden transition-all"
                  >
                    <div className="absolute inset-0 border border-primary/40 group-hover:border-primary rounded-full" />
                    <div className="absolute inset-0 bg-primary/0 group-hover:bg-primary/10" />
                    <span className="relative z-10 text-[10px] text-primary font-black uppercase tracking-widest">
                      [ Boot_Origin_Node ]
                    </span>
                  </button>
                )}
              </motion.div>
            ) : (
              <motion.div 
                variants={{
                  show: {
                    transition: {
                      staggerChildren: 0.15
                    }
                  }
                }}
                initial="hidden"
                animate="show"
                className="grid grid-cols-1 gap-8"
              >
                {projects.map((project) => (
                  <ProjectCard key={project.id} project={project} isEmployer={isEmployer} />
                ))}
              </motion.div>
            )}
          </div>
        </div>

        {/* Sidebar Log */}
        <div className="hidden lg:block space-y-8">
          <div className="p-8 border border-white/10 bg-slate-900/60 rounded-3xl backdrop-blur-2xl relative overflow-hidden h-full">
            <div className="absolute top-0 right-0 p-4 opacity-5">
              <Activity className="w-24 h-24" />
            </div>
            
            <div className="flex items-center gap-3 mb-10 border-b border-white/5 pb-6">
              <Activity className="w-4 h-4 text-accent" />
              <h3 className="font-black text-sm uppercase tracking-[0.2em] italic">Telemetry_Stream</h3>
              <div className="ml-auto w-1.5 h-1.5 rounded-full bg-accent animate-pulse" />
            </div>

            <div className="space-y-6 overflow-y-auto max-h-[800px] pr-2 custom-scrollbar">
              <LiveLogItem time="16:42:01" status="OK" msg="DECRYPTION_SYNC_COMPLETE" />
              <LiveLogItem time="16:41:45" status="WARN" msg="PK_HANDSHAKE_RETRY_01" type="warning" />
              <LiveLogItem time="16:40:12" status="OK" msg="ESCROW_PITCH_VERIFIED" />
              <LiveLogItem time="16:38:50" status="INFO" msg="NEW_PEER_CONNECTED_ID_88" />
              <LiveLogItem time="16:35:10" status="OK" msg="AQA_VALIDATION_PASSED" type="success" />
              <LiveLogItem time="16:32:04" status="INFO" msg="UPDATING_DISTRIBUTED_LEDGER" />
              <LiveLogItem time="16:30:55" status="OK" msg="PROTOCOL_INITIALIZED" />
              <LiveLogItem time="16:28:12" status="OK" msg="CORE_KERNEL_READY" />
            </div>

            <div className="mt-10 p-4 bg-white/5 rounded-xl border border-white/5 space-y-3">
              <div className="flex justify-between items-center text-[8px] font-black uppercase text-slate-500 tracking-widest">
                <span>Kernel_Status</span>
                <span className="text-accent text-glow-accent">Operational</span>
              </div>
              <div className="w-full bg-white/5 h-1 rounded-full overflow-hidden">
                <motion.div 
                  animate={{ width: ["80%", "85%", "82%"] }}
                  transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
                  className="bg-accent h-full" 
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      {isModalOpen && <CreateProjectModal onClose={() => { setIsModalOpen(false); fetchProjects(); }} />}
    </main>
  );
}

function LiveLogItem({ time, status, msg, type = "info" }: { time: string, status: string, msg: string, type?: "info" | "warning" | "success" }) {
  const colors = {
    info: "text-slate-500",
    warning: "text-amber-500",
    success: "text-accent"
  };

  return (
    <div className="flex gap-4 group cursor-default">
      <span className="text-[9px] font-mono text-slate-600 group-hover:text-primary transition-colors">{time}</span>
      <div className="flex flex-col gap-1">
        <div className="flex items-center gap-2">
          <span className={`text-[8px] font-black border px-1.5 py-0.5 rounded leading-none ${type === 'info' ? 'border-slate-800 text-slate-500' : type === 'warning' ? 'border-amber-900/50 text-amber-500' : 'border-accent/40 text-accent'}`}>
            {status}
          </span>
          <span className={`text-[9px] font-black tracking-tighter uppercase transition-colors ${type === 'info' ? 'group-hover:text-slate-300' : ''}`}>
            {msg}
          </span>
        </div>
      </div>
    </div>
  );
}

function ProjectCard({ project, isEmployer }: { project: Project, isEmployer: boolean }) {
  const completedMilestones = project.milestones.filter((m) => m.status === "APPROVED").length;
  const totalMilestones = project.milestones.length;
  const progress = totalMilestones > 0 ? (completedMilestones / totalMilestones) * 100 : 0;

  return (
    <motion.div 
      variants={{
        hidden: { opacity: 0, x: -20 },
        show: { opacity: 1, x: 0 }
      }}
      whileHover={{ y: -5, borderColor: "rgba(59,130,246,0.3)", boxShadow: "0 10px 40px rgba(0,0,0,0.4)" }}
      className="group p-8 border border-white/10 bg-slate-900/40 transition-all relative overflow-hidden rounded-3xl backdrop-blur-md"
    >
      <div className="absolute top-0 right-0 w-40 h-40 bg-primary/5 blur-3xl rounded-full -translate-y-20 translate-x-20 group-hover:bg-primary/10 transition-all duration-700" />
      
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-10 relative z-10">
        <div className="flex-grow space-y-5">
          <div className="flex items-center gap-4">
            <span className="text-[9px] bg-primary/10 text-primary px-4 py-1.5 rounded-full border border-primary/30 uppercase font-black tracking-[0.2em] shadow-sm">
              {project.status.replace(/_/g, " ")}
            </span>
            <span className="text-[9px] text-slate-600 font-mono tracking-widest uppercase bg-black/20 px-3 py-1 rounded">MTRX_{project.id.slice(-8).toUpperCase()}</span>
          </div>
          <h3 className="text-3xl md:text-4xl font-black uppercase tracking-tighter italic group-hover:text-glow-primary transition-all duration-300">{project.title}</h3>
          <div className="flex flex-wrap items-center gap-8">
            <div className="flex items-center gap-3">
              <div className="w-1.5 h-1.5 rounded-full bg-slate-700" />
              <span className="text-[9px] text-slate-500 uppercase font-black tracking-widest">Peer:</span> 
              <span className="text-[11px] font-black text-slate-300 italic group-hover:text-white transition-colors">
                {isEmployer ? (project.freelancer?.name || "LISTENING_FOR_SIGNAL") : project.employer.name}
              </span>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-1.5 h-1.5 rounded-full bg-accent animate-pulse" />
              <span className="text-[9px] text-slate-500 uppercase font-black tracking-widest">Status:</span> 
              <span className="text-[11px] font-black text-accent/80 uppercase tracking-tighter italic">Link_Active</span>
            </div>
          </div>
        </div>

        <div className="flex flex-col items-start md:items-end gap-6 w-full md:w-auto">
          <div className="text-left md:text-right">
            <div className="text-[8px] text-slate-500 uppercase font-black tracking-[0.3em] mb-1.5">Credit_Allocation</div>
            <div className="text-5xl font-black text-accent tracking-tighter italic drop-shadow-[0_0_20px_rgba(34,197,94,0.3)]">${project.totalEscrow.toLocaleString()}</div>
          </div>
          <Link 
            href={`/projects/${project.id}`}
            className="group/btn relative w-full md:w-auto overflow-hidden px-10 py-4 bg-slate-900 border border-white/5 hover:border-primary transition-all flex items-center justify-center gap-4 rounded-2xl shadow-xl"
          >
            <div className="absolute inset-0 bg-primary opacity-0 group-hover/btn:opacity-10 transition-opacity" />
            <div className="absolute inset-0 scanner-line opacity-0 group-hover/btn:opacity-10" />
            <span className="relative z-10 text-[10px] font-black uppercase tracking-[0.4em]">Mount_Unit</span> 
            <ArrowRight className="w-4 h-4 transition-transform group-hover/btn:translate-x-1.5" />
          </Link>
        </div>
      </div>

      <div className="mt-12 pt-8 border-t border-white/5 relative z-10">
        <div className="flex justify-between items-center mb-4">
          <div className="flex items-center gap-2.5">
            <Cpu className="w-3 h-3 text-slate-600" />
            <span className="text-[9px] text-slate-500 font-black uppercase tracking-[0.4em]">Deployment_Progress</span>
          </div>
          <span className="text-[11px] text-primary font-black italic tracking-tighter uppercase text-glow-primary">
            {completedMilestones}/{totalMilestones} Units // {Math.round(progress)}% Sync
          </span>
        </div>
        <div className="bg-slate-950 h-2.5 rounded-full overflow-hidden border border-white/5 shadow-inner">
          <motion.div 
            initial={{ width: 0 }}
            whileInView={{ width: `${progress}%` }}
            viewport={{ once: true }}
            transition={{ duration: 1.5, ease: "circOut", delay: 0.2 }}
            className="bg-primary h-full relative"
          >
            <div className="absolute inset-0 shimmer opacity-30" />
            <div className="absolute inset-0 bg-glow-primary opacity-50" />
          </motion.div>
        </div>
      </div>
    </motion.div>
  );
}

function StatCard({ title, value, icon, delay, color = "text-primary" }: { title: string, value: string, icon: React.ReactNode, delay: number, color?: string }) {
  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ delay }}
      whileHover={{ y: -5, borderColor: "rgba(59,130,246,0.5)", boxShadow: "0 15px 40px rgba(0,0,0,0.4)" }}
      className="p-10 border border-white/10 bg-slate-900/40 rounded-3xl relative group backdrop-blur-xl transition-all duration-300 flex flex-col items-center text-center justify-between min-h-[220px]"
    >
      <div className="absolute -right-6 -bottom-6 text-primary/5 group-hover:text-primary/10 transition-all duration-700 ease-out rotate-12 pointer-events-none">
        <div className="w-32 h-32">{icon}</div>
      </div>
      <div className="absolute top-0 right-0 scanner-line opacity-0 group-hover:opacity-10 h-1/2 w-full pointer-events-none" />
      
      <div className="flex flex-col items-center gap-2 relative z-10 w-full">
        <div className={`${color} opacity-40 group-hover:opacity-100 group-hover:scale-110 transition-all duration-500 p-3 bg-white/5 rounded-2xl border border-white/5 group-hover:border-primary/20 mb-2`}>
          {icon}
        </div>
        <span className="text-[10px] text-slate-500 uppercase tracking-[0.4em] font-black">{title}</span>
        <div className="w-12 h-0.5 bg-primary/30 rounded-full group-hover:w-20 transition-all duration-500" />
      </div>

      <div className={`text-5xl md:text-6xl font-black tracking-tighter italic relative z-10 transition-all duration-500 py-4 ${color === 'text-primary' ? 'group-hover:text-glow-primary' : 'group-hover:text-glow-accent'}`}>
        {value}
      </div>
      
      <div className="absolute bottom-0 left-0 w-full h-[2px] bg-gradient-to-r from-transparent via-primary/40 to-transparent opacity-0 group-hover:opacity-100 transition-all duration-500" />
    </motion.div>
  );
}

