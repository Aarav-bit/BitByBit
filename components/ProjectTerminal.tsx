"use client";

import { useState, useEffect } from "react";
import { 
  Shield, 
  Terminal, 
  Clock, 
  CheckCircle2, 
  XCircle, 
  AlertCircle, 
  ArrowUpRight, 
  Code, 
  FileText,
  Activity,
  Zap,
  Lock,
  Unlock,
  ShieldAlert,
  Cpu,
  Database,
  Globe,
  Server,
  Loader2
} from "lucide-react";
import { toast } from "sonner";
import { StatusBadge } from "./monitor/StatusBadge";
import { TimelineView } from "./monitor/TimelineView";
import { EmployerResponseButtons } from "./monitor/EmployerResponseButtons";
import { motion, AnimatePresence } from "framer-motion";

interface Submission {
  id: string;
  content: string;
  aqaResult: string;
  aqaFeedback: string | null;
  createdAt: string;
}

interface Milestone {
  id: string;
  title: string;
  amount: number;
  status: string;
  definitionOfDone: string;
  submissions: Submission[];
  monitorActions: any[]; 
}

interface Project {
  id: string;
  title: string;
  description: string;
  status: string;
  totalEscrow: number;
  employerId: string;
  freelancerId: string | null;
  milestones: Milestone[];
  employer: { name: string; email: string };
  freelancer?: { name: string; email: string };
  monitor?: any;
}

interface User {
  id: string;
  name: string | null;
  email: string;
  role: string | null;
  pfiScore: number;
}

export default function ProjectTerminal({ project, user }: { project: Project, user: User }) {
  const [submitting, setSubmitting] = useState<string | null>(null);
  const [submissionContent, setSubmissionContent] = useState("");
  const [activeMilestone, setActiveMilestone] = useState<Milestone | null>(
    project.milestones.find(m => m.status === "PENDING") || project.milestones[0]
  );
  const [glitch, setGlitch] = useState(false);

  useEffect(() => {
    const interval = setInterval(() => {
      setGlitch(true);
      setTimeout(() => setGlitch(false), 200);
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  const isEmployer = project.employerId === user.id;
  const isFreelancer = project.freelancerId === user.id;
  const isUnassigned = !project.freelancerId;

  const handleSubmitWork = async (milestoneId: string) => {
    if (!submissionContent.trim()) {
      toast.error("PROTOCOL_ERROR: SUBMISSION_CONTENT_REQUIRED");
      return;
    }

    setSubmitting(milestoneId);
    try {
      const res = await fetch("/api/milestones/submit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ milestoneId, content: submissionContent }),
      });

      if (res.ok) {
        const result = await res.json();
        toast.success(`AQA_VERIFICATION_COMPLETE // RESULT: ${result.aqaResult}`);
        window.location.reload();
      } else {
        const error = await res.text();
        toast.error(`SUBMISSION_FAILED: ${error}`);
      }
    } catch (error) {
      toast.error("CRITICAL_CONNECTION_FAILURE: AQA_ENGINE_OFFLINE");
    } finally {
      setSubmitting(null);
    }
  };

  const handleJoin = async () => {
    try {
      const res = await fetch(`/api/projects/${project.id}/join`, {
        method: "POST"
      });
      if (res.ok) {
        toast.success("PROTOCOL_NODE_CLAIMED // INITIALIZING_SYNC");
        window.location.reload();
      }
    } catch (error) {
      toast.error("FAILED_TO_CLAIM_NODE");
    }
  };

  return (
    <div className="flex-grow flex flex-col font-mono text-slate-200 p-4 md:p-8 pt-24 max-w-7xl mx-auto w-full relative overflow-hidden">
      {/* Background Decor */}
      <div className="absolute top-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-primary/20 to-transparent" />
      <div className="absolute inset-0 pointer-events-none opacity-[0.03] bg-[url('https://grainy-gradients.vercel.app/noise.svg')] brightness-100" />
      
      {/* HUD Header */}
      <motion.div 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 mb-12 border-b border-white/5 pb-10 relative z-10"
      >
        <div className="space-y-4">
          <div className="flex items-center gap-3">
            <div className={`flex items-center gap-2 px-3 py-1 bg-primary/10 border border-primary/20 rounded-full transition-all ${glitch ? 'skew-x-12 opacity-50' : ''}`}>
              <div className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse shadow-[0_0_8px_rgba(59,130,246,0.8)]" />
              <span className="text-[10px] text-primary font-black uppercase tracking-[0.2em] italic">Node_Active</span>
            </div>
            <span className="text-[8px] text-slate-500 font-black uppercase tracking-[0.3em] font-mono opacity-50">PROT_ID: {project.id.slice(0, 16)}...</span>
          </div>
          
          <div className="relative group">
            <h1 className={`text-5xl font-black uppercase tracking-tighter text-glow-primary italic ${glitch ? 'glitch-text' : ''}`}>
              {project.title}
            </h1>
            <div className="absolute -bottom-2 left-0 w-1/3 h-0.5 bg-gradient-to-r from-primary to-transparent" />
          </div>
          
          <div className="flex items-center gap-6">
            <div className="flex items-center gap-2">
              <span className="text-[10px] text-slate-500 font-black uppercase tracking-[0.2em]">Deployment_Status:</span>
              <span className="text-[10px] text-primary font-black uppercase tracking-[0.1em]">{project.status.replace(/_/g, " ")}</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] text-slate-500 font-black uppercase tracking-[0.2em]">Network_Load:</span>
              <div className="flex items-center gap-0.5">
                {[1, 2, 3, 4, 5].map(i => (
                  <div key={i} className={`w-1 h-3 rounded-full ${i <= 3 ? 'bg-primary/60' : 'bg-slate-800'}`} />
                ))}
              </div>
            </div>
          </div>
        </div>

        <div className="flex items-stretch gap-4">
          <div className="px-6 py-4 bg-slate-900/40 backdrop-blur-md border border-white/5 rounded-3xl flex flex-col items-end justify-center min-w-[160px] relative overflow-hidden group">
            <div className="absolute top-0 right-0 w-12 h-12 bg-accent/5 rounded-full -mr-6 -mt-6 blur-2xl group-hover:bg-accent/10 transition-all" />
            <span className="text-[9px] uppercase font-black text-slate-500 tracking-[0.2em] mb-1">Escrow_Volume</span>
            <div className="flex items-end gap-1">
              <span className="text-xs font-black text-accent mb-1">$</span>
              <span className="text-3xl font-black text-accent text-glow-accent tracking-tighter italic">{project.totalEscrow.toLocaleString()}</span>
            </div>
          </div>
          
          {isUnassigned && !isEmployer && (
            <button 
              onClick={handleJoin}
              className="relative group overflow-hidden bg-accent text-white px-10 py-4 rounded-3xl font-black text-xs uppercase flex items-center gap-3 hover:scale-[1.02] transition-all border border-white/10 shadow-[0_10px_30px_rgba(235,115,31,0.2)]"
            >
              <div className="absolute inset-0 bg-white/20 -translate-x-full group-hover:translate-x-0 transition-transform duration-500" />
              <Zap className="w-4 h-4 group-hover:rotate-12 transition-transform" />
              <span className="relative z-10 tracking-[0.2em]">Claim_Node</span>
            </button>
          )}
        </div>
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 flex-grow relative z-10">
        {/* Terminal Sidebar: Milestones */}
        <motion.div 
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="lg:col-span-4 flex flex-col gap-6"
        >
          <div className="flex flex-col gap-4">
            <div className="flex items-center justify-between mb-2">
              <h2 className="text-[10px] uppercase font-black tracking-[0.3em] text-slate-500 italic flex items-center gap-2">
                <Database className="w-3 h-3 text-primary" />
                Sequence_Map
              </h2>
              <div className="text-[8px] text-slate-700 font-bold uppercase">v.3.0.4</div>
            </div>
            
            <div className="space-y-3 overflow-y-auto max-h-[500px] pr-2 custom-scrollbar">
              {project.milestones.map((m, idx) => (
                <button
                  key={m.id}
                  onClick={() => setActiveMilestone(m)}
                  className={`w-full p-5 rounded-2xl border text-left transition-all relative overflow-hidden group hover:scale-[1.02] ${
                    activeMilestone?.id === m.id 
                      ? "bg-primary/10 border-primary/40 ring-1 ring-primary/20 shadow-[0_0_20px_rgba(59,130,246,0.1)]" 
                      : "bg-slate-900/20 border-white/5 hover:border-white/10"
                  }`}
                >
                  <div className="flex justify-between items-start mb-3">
                    <span className={`text-[9px] font-black tracking-[0.2em] ${activeMilestone?.id === m.id ? 'text-primary' : 'text-slate-600'}`}>
                      SEQ_{String(idx + 1).padStart(2, '0')}
                    </span>
                    <span className="text-[10px] font-black tracking-widest text-accent/80 italic font-mono">${m.amount.toFixed(0)}</span>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className={`p-2 rounded-lg ${
                      m.status === "APPROVED" ? "bg-accent/10" : 
                      m.status === "REJECTED" ? "bg-red-500/10" : 
                      m.status === "SUBMITTED" ? "bg-primary/20" : 
                      "bg-slate-800/50"
                    }`}>
                      {m.status === "APPROVED" ? (
                        <Shield className="w-4 h-4 text-accent" />
                      ) : m.status === "REJECTED" ? (
                        <XCircle className="w-4 h-4 text-red-500" />
                      ) : m.status === "SUBMITTED" ? (
                        <Activity className="w-4 h-4 text-primary animate-pulse" />
                      ) : (
                        <Clock className="w-4 h-4 text-slate-600" />
                      ) }
                    </div>
                    <div className="flex flex-col">
                      <span className={`text-xs font-black uppercase tracking-tight line-clamp-1 italic ${activeMilestone?.id === m.id ? 'text-white' : 'text-slate-500'}`}>
                        {m.title}
                      </span>
                      <span className="text-[8px] text-slate-600 font-black uppercase tracking-widest mt-0.5">{m.status}</span>
                    </div>
                  </div>
                  {activeMilestone?.id === m.id && (
                    <motion.div 
                      layoutId="active-indicator"
                      className="absolute right-0 top-0 h-full w-0.5 bg-primary shadow-[0_0_10px_rgba(59,130,246,0.5)]" 
                    />
                  )}
                </button>
              ))}
            </div>
          </div>

          {/* Mini Telemetry */}
          <div className="flex-grow p-6 bg-slate-950/50 border border-white/5 rounded-3xl relative overflow-hidden mt-auto">
            <div className="flex items-center gap-2 mb-4 text-[9px] font-black text-slate-500 uppercase tracking-widest italic">
              <Activity className="w-3 h-3 text-accent" /> System_Logs
            </div>
            <div className="space-y-3 overflow-y-auto h-[120px] text-[8px] font-mono pr-2 custom-scrollbar">
              <div className="flex gap-2 opacity-40">
                <span className="text-slate-600">14:02:11</span>
                <span className="text-primary">[OK]</span>
                <span className="truncate">SOCKET_HANDSHAKE_INITIATED</span>
              </div>
              <div className="flex gap-2 opacity-60 text-primary">
                <span className="text-slate-600">14:02:15</span>
                <span>[OK]</span>
                <span className="truncate">ENCRYPTION_LAYER_ARMED</span>
              </div>
              <div className="flex gap-2 text-accent animate-pulse">
                <span className="text-slate-600">14:02:50</span>
                <span>[LIVE]</span>
                <span className="truncate">DATA_STREAM_SYNCHRONIZED</span>
              </div>
              <div className="flex gap-2 text-slate-500 italic">
                <span className="text-slate-600">--:--:--</span>
                <span>[WAIT]</span>
                <span className="truncate">LISTENING_FOR_PFI_SIGNAL...</span>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Main Terminal View */}
        <motion.div 
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          className="lg:col-span-8 flex flex-col"
        >
          <AnimatePresence mode="wait">
            {activeMilestone ? (
              <motion.div 
                key={activeMilestone.id}
                initial={{ opacity: 0, scale: 0.98 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 1.02 }}
                className="p-10 bg-slate-900/40 backdrop-blur-xl border border-white/10 rounded-[40px] relative group overflow-hidden flex flex-col flex-grow shadow-2xl"
              >
                <div className="absolute top-0 right-0 p-8 opacity-5 pointer-events-none -mr-4 -mt-4">
                  <Cpu className="w-48 h-48 text-primary" />
                </div>
                
                {/* Header Section */}
                <div className="flex flex-col md:flex-row justify-between items-start gap-8 mb-12 relative z-10">
                  <div className="space-y-4">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 rounded-2xl bg-primary/10 border border-primary/20 flex items-center justify-center shadow-inner group-hover:scale-110 transition-transform duration-500">
                        <Cpu className="w-6 h-6 text-primary" />
                      </div>
                      <div className="flex flex-col">
                        <h2 className="text-3xl font-black uppercase tracking-tighter italic text-glow-primary">{activeMilestone.title}</h2>
                        <span className="text-[9px] text-slate-500 uppercase font-black tracking-[0.3em] opacity-50 italic">NODE_SEQUENCE_ALPHA // {activeMilestone.id.slice(-12)}</span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex flex-col items-end">
                    <span className="text-[10px] font-black uppercase tracking-[0.4em] text-slate-600 mb-1">ALLOCATED_CREDITS</span>
                    <div className="flex items-baseline gap-1">
                      <span className="text-sm font-black text-accent">$</span>
                      <span className="text-4xl font-black text-accent text-glow-accent italic font-mono tracking-tighter">{activeMilestone.amount.toLocaleString()}</span>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-10 mb-10 relative z-10 flex-grow">
                  <div className="space-y-4 flex flex-col">
                    <div className="flex items-center gap-3">
                      <div className="w-1.5 h-1.5 rounded-full bg-primary" />
                      <h3 className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-500 italic">Specification_Protocol</h3>
                    </div>
                    <div className="p-8 bg-slate-950/60 border border-white/5 rounded-[32px] text-xs leading-relaxed text-slate-400 italic font-sans whitespace-pre-wrap relative flex-grow group-hover:border-primary/20 transition-colors shadow-inner">
                      <div className="absolute top-4 right-6 text-[8px] font-black text-slate-800 tracking-widest opacity-40">DECRYPTED_SPEC_v4</div>
                      {activeMilestone.definitionOfDone}
                    </div>
                  </div>
                  
                  <div className="space-y-4 flex flex-col">
                    <div className="flex items-center gap-3">
                      <div className="w-1.5 h-1.5 rounded-full bg-accent" />
                      <h3 className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-500 italic">Validation_Telemetry</h3>
                    </div>
                    
                    <div className="flex-grow">
                      {activeMilestone.submissions.length > 0 ? (
                        <div className="p-8 bg-slate-900/60 border border-primary/20 rounded-[32px] space-y-8 relative group/sub h-full flex flex-col shadow-2xl">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3 text-[11px] font-black text-primary italic tracking-widest px-4 py-2 bg-primary/10 rounded-xl border border-primary/20">
                              <Zap className="w-3.5 h-3.5" /> AQA_VERDICT: {activeMilestone.submissions[0].aqaResult}
                            </div>
                            {activeMilestone.monitorActions?.length > 0 && activeMilestone.status === "SUBMITTED" && (
                              <div className="flex items-center gap-2 text-[10px] text-cyan-400 font-black uppercase tracking-widest italic">
                                <Activity className="w-3 h-3 animate-pulse" /> Live_Monitor
                              </div>
                            )}
                          </div>
                          
                          <div className="p-6 bg-slate-950/60 rounded-2xl border border-white/5 flex-grow">
                            <p className="text-[11px] text-slate-400 font-sans leading-relaxed italic opacity-80">
                              "{activeMilestone.submissions[0].aqaFeedback}"
                            </p>
                          </div>
                          
                          {activeMilestone.monitorActions?.[0]?.autoReleaseAt && activeMilestone.status === "SUBMITTED" && (
                            <div className="bg-primary/5 rounded-2xl p-4 border border-primary/10">
                              <TimelineView autoReleaseAt={new Date(activeMilestone.monitorActions[0].autoReleaseAt)} />
                            </div>
                          )}

                          <div className="flex justify-between items-center text-[9px] text-slate-700 font-black uppercase tracking-widest pt-6 border-t border-white/5 mt-auto">
                            <span className="flex items-center gap-2"><Clock className="w-3 h-3" /> SYNCED: {new Date(activeMilestone.submissions[0].createdAt).toLocaleTimeString()}</span>
                            <span className="flex items-center gap-2"><Server className="w-3 h-3" /> NODE_04</span>
                          </div>
                        </div>
                      ) : (
                        <div className="h-full border border-dashed border-white/10 rounded-[32px] flex flex-col items-center justify-center text-center group-hover:bg-white/[0.02] transition-all p-12">
                          <div className="w-16 h-16 rounded-full bg-slate-900 border border-white/5 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-500">
                            <ShieldAlert className="w-8 h-8 text-slate-800" />
                          </div>
                          <span className="text-[10px] text-slate-700 font-black uppercase tracking-[0.4em] italic mb-2">Awaiting_Peer_Handshake</span>
                          <span className="text-[8px] text-slate-800 uppercase font-black tracking-widest">Protocol_Idle</span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Submission Logic */}
                {isFreelancer && activeMilestone.status !== "APPROVED" && (
                  <motion.div 
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="mt-4 pt-10 border-t border-white/5 relative z-10"
                  >
                    <div className="flex items-center gap-3 mb-6">
                      <Terminal className="w-4 h-4 text-primary" />
                      <h3 className="text-[10px] font-black uppercase tracking-[0.3em] text-primary italic">Command_Input_Interface</h3>
                    </div>
                    <div className="space-y-6">
                      <div className="relative group">
                        <textarea 
                          className="w-full bg-slate-950/80 border border-white/5 p-8 rounded-[32px] text-[11px] font-mono focus:border-primary/50 outline-none transition-all placeholder:text-slate-800 min-h-[160px] italic shadow-inner resize-none text-primary/80"
                          placeholder="INPUT WORK DELIVERABLES... (PROTOCOL ENFORCED)"
                          value={submissionContent}
                          onChange={(e) => setSubmissionContent(e.target.value)}
                        />
                        <div className="absolute bottom-6 right-10 text-[9px] text-slate-700 font-black uppercase tracking-widest italic opacity-50">Secure_Uplink_v4_AQA</div>
                      </div>
                      
                      <button 
                        onClick={() => handleSubmitWork(activeMilestone.id)}
                        disabled={submitting === activeMilestone.id || !submissionContent}
                        className="group relative overflow-hidden bg-primary text-white w-full py-5 rounded-[22px] uppercase font-black text-xs tracking-[0.3em] shadow-[0_15px_40px_rgba(59,130,246,0.3)] disabled:opacity-30 transition-all hover:scale-[1.01] hover:shadow-[0_20px_50px_rgba(59,130,246,0.4)]"
                      >
                        <div className="absolute inset-0 bg-white/20 -translate-x-full group-hover:translate-x-0 transition-transform duration-500" />
                        <div className="flex items-center justify-center gap-3 relative z-10">
                          {submitting === activeMilestone.id ? (
                            <>
                              <Loader2 className="w-5 h-5 animate-spin" />
                              INITIATING_AQA_SEQUENCE...
                            </>
                          ) : (
                            <>
                              <Zap className="w-5 h-5 group-hover:scale-125 transition-transform" />
                              Authorize_Work_Transmission
                            </>
                          )}
                        </div>
                      </button>
                    </div>
                  </motion.div>
                )}

                {isEmployer && activeMilestone.submissions.length > 0 && activeMilestone.status === "SUBMITTED" && activeMilestone.monitorActions?.length > 0 && (
                  <motion.div 
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="mt-4 p-10 bg-accent/5 border border-accent/20 rounded-[32px] relative overflow-hidden shadow-2xl"
                  >
                    <div className="absolute top-0 right-0 p-8 opacity-5 pointer-events-none">
                      <Shield className="w-48 h-48 text-accent" />
                    </div>
                    <div className="flex items-center gap-4 text-accent mb-6 font-black text-lg uppercase tracking-widest italic relative z-10">
                      <div className="w-10 h-10 rounded-xl bg-accent/10 border border-accent/20 flex items-center justify-center">
                        <Shield className="w-5 h-5" />
                      </div>
                      AI_Security_Verification_Active
                    </div>
                    <p className="text-[11px] text-slate-400 mb-10 leading-relaxed uppercase font-mono italic relative z-10 opacity-80">
                      PROTOCOL ANALYSIS: THE AQA_ENGINE HAS VERIFIED THE INTEGRITY OF THIS SUBMISSION. YOU MAY NOW AUTHORIZE THE ESCROW RELEASE OR ABORT THE SEQUENCE.
                    </p>
                    <EmployerResponseButtons 
                      actionId={activeMilestone.monitorActions[0].id} 
                      onSuccess={() => window.location.reload()} 
                    />
                  </motion.div>
                )}
              </motion.div>
            ) : (
              <div className="flex-grow flex flex-col items-center justify-center border border-dashed border-white/5 rounded-[40px] p-24 text-slate-700 group transition-all h-full bg-slate-900/10">
                <div className="w-24 h-24 rounded-full border border-white/5 flex items-center justify-center mb-8 animate-pulse bg-slate-900/40 shadow-inner">
                  <Terminal className="w-10 h-10 opacity-10" />
                </div>
                <span className="text-[10px] font-black uppercase tracking-[0.8em] opacity-10 italic">[ AWAITING_COMMAND_INPUT ]</span>
              </div>
            )}
          </AnimatePresence>
        </motion.div>
      </div>
    </div>
  );
}
