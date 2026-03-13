"use client";

import { useState } from "react";
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
  ShieldAlert
} from "lucide-react";
import { toast } from "sonner";
import { StatusBadge } from "./monitor/StatusBadge";
import { TimelineView } from "./monitor/TimelineView";
import { EmployerResponseButtons } from "./monitor/EmployerResponseButtons";

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

  const isEmployer = project.employerId === user.id;
  const isFreelancer = project.freelancerId === user.id;
  const isUnassigned = !project.freelancerId;

  const handleSubmitWork = async (milestoneId: string) => {
    if (!submissionContent.trim()) {
      toast.error("Protocol error: Submission content required.");
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
        toast.success(`AQA Verification Complete: ${result.aqaResult}`);
        window.location.reload(); // Refresh to show new submission and status
      } else {
        const error = await res.text();
        toast.error(`Submission failed: ${error}`);
      }
    } catch (error) {
      toast.error("Critical connection failure to AQA engine.");
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
        toast.success("Protocol node claimed. Initializing synchronization...");
        window.location.reload();
      }
    } catch (error) {
      toast.error("Failed to claim node.");
    }
  };

  return (
    <div className="flex-grow flex flex-col font-mono text-foreground p-4 md:p-8 pt-24 max-w-7xl mx-auto w-full">
      {/* HUD Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-12 border-b border-border/40 pb-8">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="text-[10px] bg-primary/20 text-primary px-2 py-0.5 rounded-sm border border-primary/20 uppercase font-bold tracking-tighter">
              NODE ACTIVE
            </span>
            <span className="text-[10px] text-muted-foreground uppercase opacity-40 italic">PROTO://{project.id}</span>
          </div>
          <h1 className="text-4xl font-extrabold uppercase tracking-tighter text-glow-primary">{project.title}</h1>
          <p className="text-xs text-muted-foreground uppercase tracking-widest opacity-60">Status: {project.status.replace(/_/g, " ")}</p>
        </div>

        <div className="flex gap-4">
          <div className="p-4 border border-border bg-card/10 rounded flex flex-col items-end min-w-[140px]">
            <span className="text-[9px] uppercase font-bold text-muted-foreground opacity-40">Total Escrow</span>
            <span className="text-xl font-black text-accent tracking-tighter">${project.totalEscrow.toFixed(2)}</span>
          </div>
          {isUnassigned && !isEmployer && (
            <button 
              onClick={handleJoin}
              className="bg-accent text-white px-8 py-4 rounded-sm font-black text-sm uppercase flex items-center gap-2 hover:bg-accent/90 transition-all border border-accent shadow-[0_0_20px_rgba(235,115,31,0.2)]"
            >
              <Zap className="w-4 h-4" />
              CLAIM NODE
            </button>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 flex-grow">
        {/* Terminal Sidebar: Milestones */}
        <div className="lg:col-span-4 space-y-4">
          <h2 className="text-[10px] uppercase font-black tracking-[0.2em] text-muted-foreground/40 mb-4 flex items-center gap-2">
            <Terminal className="w-3 h-3" />
            Milestone Sequence
          </h2>
          {project.milestones.map((m, idx) => (
            <button
              key={m.id}
              onClick={() => setActiveMilestone(m)}
              className={`w-full p-4 border text-left transition-all relative overflow-hidden group ${
                activeMilestone?.id === m.id 
                  ? "bg-card border-primary ring-1 ring-primary/20" 
                  : "bg-card/20 border-border/40 hover:border-primary/20"
              }`}
            >
              <div className="flex justify-between items-start mb-1">
                <span className="text-[9px] font-bold opacity-30 tracking-widest">SEQ_{String(idx + 1).padStart(2, '0')}</span>
                <span className="text-[10px] font-black tracking-tighter text-accent">${m.amount.toFixed(2)}</span>
              </div>
              <div className="flex items-center gap-3">
                {m.status === "APPROVED" ? (
                  <CheckCircle2 className="w-4 h-4 text-green-500" />
                ) : m.status === "REJECTED" ? (
                  <XCircle className="w-4 h-4 text-red-500" />
                ) : m.status === "SUBMITTED" ? (
                  <ShieldAlert className="w-4 h-4 text-cyan-500 animate-pulse" />
                ) : (
                  <Clock className="w-4 h-4 text-primary animate-pulse" />
                ) }
                <span className="text-xs font-bold uppercase tracking-tight line-clamp-1">{m.title}</span>
              </div>
              {activeMilestone?.id === m.id && (
                <div className="absolute bottom-0 left-0 w-full h-[2px] bg-primary animate-pulse" />
              )}
            </button>
          ))}
        </div>

        {/* Main Terminal View */}
        <div className="lg:col-span-8 flex flex-col gap-6">
          {activeMilestone ? (
            <>
              <div className="p-8 border border-border bg-card/10 rounded relative group transition-all hover:bg-card/20 min-h-[400px]">
                <div className="absolute -top-3 left-6 px-3 bg-background border border-border text-[9px] font-black uppercase tracking-[0.3em] text-primary">
                  MILESTONE DETAIL
                </div>
                
                <div className="flex justify-between items-start mb-8">
                  <div>
                    <h2 className="text-2xl font-black uppercase tracking-tight mb-2">{activeMilestone.title}</h2>
                    <div className="flex items-center gap-6">
                      <p className="text-[10px] font-bold text-muted-foreground uppercase flex items-center gap-2">
                        <Activity className="w-3 h-3" />
                        Status: <span className={
                          activeMilestone.status === "APPROVED" ? "text-green-500" : 
                          activeMilestone.status === "SUBMITTED" ? "text-cyan-400" : 
                          "text-primary"
                        }>{activeMilestone.status}</span>
                      </p>
                      <p className="text-[10px] font-bold text-muted-foreground uppercase flex items-center gap-2">
                        <Shield className="w-3 h-3" />
                        AQA Locked: {activeMilestone.submissions.length > 0 ? "YES" : "NO"}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
                  <div className="space-y-3">
                    <h3 className="text-[10px] font-black uppercase tracking-widest text-primary/40">Definition of Done</h3>
                    <div className="p-4 bg-muted/20 border border-border/20 text-xs leading-relaxed opacity-80 italic font-sans whitespace-pre-wrap">
                      {activeMilestone.definitionOfDone}
                    </div>
                  </div>
                  
                  <div className="space-y-3">
                    <h3 className="text-[10px] font-black uppercase tracking-widest text-primary/40">Latest Submission Log</h3>
                    {activeMilestone.submissions.length > 0 ? (
                      <div className="p-4 bg-card border border-primary/20 space-y-4">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2 text-[10px] font-black text-primary">
                            <CheckCircle2 className="w-3 h-3" /> AQA RESULT: {activeMilestone.submissions[0].aqaResult}
                          </div>
                          {activeMilestone.monitorActions?.length > 0 && activeMilestone.status === "SUBMITTED" && (
                            <span className="text-[10px] bg-cyan-500/10 text-cyan-400 px-2 py-0.5 rounded border border-cyan-500/20 font-bold uppercase">
                              Monitor Active
                            </span>
                          )}
                        </div>
                        <p className="text-[10px] text-muted-foreground font-sans leading-loose italic">
                          "{activeMilestone.submissions[0].aqaFeedback}"
                        </p>
                        
                        {activeMilestone.monitorActions?.[0]?.autoReleaseAt && activeMilestone.status === "SUBMITTED" && (
                           <TimelineView autoReleaseAt={new Date(activeMilestone.monitorActions[0].autoReleaseAt)} />
                        )}

                        <div className="text-[8px] text-muted-foreground/30 uppercase tracking-widest pt-2 border-t border-border/10">
                          LOGGED AT: {new Date(activeMilestone.submissions[0].createdAt).toLocaleString()}
                        </div>
                      </div>
                    ) : (
                      <div className="p-8 border border-dashed border-border/20 flex flex-col items-center justify-center text-center">
                        <AlertCircle className="w-6 h-6 text-muted-foreground opacity-10 mb-2" />
                        <span className="text-[9px] text-muted-foreground/30 uppercase font-black">NO SUBMISSION DETECTED</span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Submission Logic */}
                {isFreelancer && activeMilestone.status !== "APPROVED" && (
                  <div className="mt-auto pt-8 border-t border-border/20">
                    <h3 className="text-[10px] font-black uppercase tracking-widest text-primary mb-4">Initialize Submission Node</h3>
                    <div className="space-y-4">
                      <textarea 
                        className="w-full bg-muted/10 border border-border p-4 text-[11px] font-mono focus:border-primary/50 outline-none transition-all placeholder:text-muted-foreground/20 min-h-[150px]"
                        placeholder="PASTE YOUR WORK DELIVERABLES HERE (CODE, DOCS, EVIDENCE)..."
                        value={submissionContent}
                        onChange={(e) => setSubmissionContent(e.target.value)}
                      />
                      <button 
                        onClick={() => handleSubmitWork(activeMilestone.id)}
                        disabled={submitting === activeMilestone.id}
                        className="bg-primary text-white w-full py-4 uppercase font-black text-xs tracking-[0.2em] hover:bg-primary/90 transition-all flex items-center justify-center gap-3 shadow-[0_0_20px_rgba(59,130,246,0.15)] disabled:opacity-50"
                      >
                        {submitting === activeMilestone.id ? (
                          <>
                            <Zap className="w-4 h-4 animate-spin" />
                            AQA ENGINE PROCESSING...
                          </>
                        ) : (
                          <>
                            <ArrowUpRight className="w-4 h-4" />
                            ACTIVATE AQA VERIFICATION
                          </>
                        )}
                      </button>
                    </div>
                  </div>
                )}

                {isEmployer && activeMilestone.submissions.length > 0 && activeMilestone.status === "SUBMITTED" && activeMilestone.monitorActions?.length > 0 && (
                  <div className="mt-8 p-6 bg-cyan-500/5 border border-cyan-500/20 rounded-sm">
                    <div className="flex items-center gap-2 text-cyan-400 mb-4 font-black text-xs uppercase tracking-widest">
                      <Shield className="w-4 h-4" /> AI MONITOR COMMAND CENTER
                    </div>
                    <p className="text-xs text-muted-foreground mb-6 leading-relaxed opacity-80 uppercase font-mono">
                      PROTOCOL ANALYSIS: Automated Quality Assurance verified. Awaiting employer consensus or auto-release resolution.
                    </p>
                    <EmployerResponseButtons 
                      actionId={activeMilestone.monitorActions[0].id} 
                      onSuccess={() => window.location.reload()} 
                    />
                  </div>
                )}
              </div>
            </>
          ) : (
            <div className="flex-grow flex items-center justify-center border border-dashed border-border p-24 text-muted-foreground opacity-20">
              [ NO ACTIVE MILESTONE SELECTED ]
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
