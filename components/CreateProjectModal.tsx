"use client";

import { useState } from "react";
import { Plus, X, Loader2, Wand2, ArrowLeft, Terminal, Shield, Cpu, Activity, Zap } from "lucide-react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { motion, AnimatePresence } from "framer-motion";

interface MilestoneDraft {
  title: string;
  dod: string;
  amount: number;
}

export default function CreateProjectModal({ onClose }: { onClose: () => void }) {
  const router = useRouter();
  const [step, setStep] = useState<1 | 2>(1);
  const [title, setTitle] = useState("");
  const [task, setTask] = useState("");
  const [description, setDescription] = useState("");
  const [milestones, setMilestones] = useState<MilestoneDraft[]>([]);
  const [loading, setLoading] = useState(false);
  const [generating, setGenerating] = useState(false);

  const handleGenerate = async () => {
    if (!title.trim() || !task.trim()) return;
    setGenerating(true);

    try {
      const res = await fetch("/api/projects/generate-milestones", {
        method: "POST",
        body: JSON.stringify({ title, task }),
        headers: { "Content-Type": "application/json" },
      });

      if (!res.ok) {
        const errorText = await res.text();
        toast.error(`GENERATION FAILED: ${errorText}`);
        return;
      }

      const data = (await res.json()) as {
        description: string;
        milestones: MilestoneDraft[];
      };

      setDescription(data.description || task);
      setMilestones(Array.isArray(data.milestones) ? data.milestones : []);
      setStep(2);
      toast.success("MILESTONES_GENERATED // LINK_ESTABLISHED");
    } catch (e) {
      console.error(e);
      toast.error("GENERATION FAILED: UNKNOWN ERROR");
    } finally {
      setGenerating(false);
    }
  };

  const addMilestone = () => {
    setMilestones([...milestones, { title: "", dod: "", amount: 0 }]);
  };

  const removeMilestone = (index: number) => {
    setMilestones(milestones.filter((_, i) => i !== index));
  };

  const updateMilestone = (index: number, field: keyof MilestoneDraft, value: string | number) => {
    const newMilestones = milestones.map((m, i) => 
      i === index ? { ...m, [field]: value } : m
    );
    setMilestones(newMilestones);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !description || milestones.length === 0) return;
    
    setLoading(true);
    
    // Calculate total escrow and validate amounts
    const totalEscrow = milestones.reduce((sum, m) => sum + m.amount, 0);
    const hasInvalidAmount = milestones.some(m => m.amount <= 0);

    if (hasInvalidAmount) {
      toast.error("ALL MILESTONE AMOUNTS MUST BE GREATER THAN ZERO.");
      setLoading(false);
      return;
    }

    try {
      const res = await fetch("/api/projects", {
        method: "POST",
        body: JSON.stringify({ title, description, totalEscrow, milestones }),
        headers: { "Content-Type": "application/json" }
      });
      if (res.ok) {
        toast.success("PROTOCOL_DEPLOYED // NODE_LIVE");
        onClose();
        router.refresh();
      } else {
        const errorText = await res.text();
        toast.error(`DEPLOYMENT FAILED: ${errorText}`);
      }
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-md z-50 flex items-center justify-center p-4">
      <motion.div 
        initial={{ opacity: 0, scale: 0.9, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        className="bg-slate-900/90 border border-white/10 w-full max-w-2xl shadow-[0_0_50px_rgba(0,0,0,0.5)] relative overflow-hidden font-mono rounded-3xl"
      >
        <div className="absolute top-0 right-0 p-8 opacity-5 pointer-events-none">
          <Terminal className="w-32 h-32" />
        </div>
        
        {/* Top Scanner Line */}
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-primary to-transparent scanner-line z-20" />
        
        <div className="p-8 border-b border-white/10 flex justify-between items-center bg-slate-900/50 relative z-10">
          <div className="flex items-center gap-4">
            <div className="p-2.5 bg-primary/10 rounded-xl border border-primary/20">
              <Cpu className="w-5 h-5 text-primary text-glow-primary" />
            </div>
            <div>
              <h2 className="text-xl font-black uppercase tracking-tighter italic">Initialize_Protocol</h2>
              <div className="flex items-center gap-2 mt-0.5">
                <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
                <span className="text-[8px] text-slate-500 font-black uppercase tracking-[0.2em]">Secure_Handshake_Active</span>
              </div>
            </div>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-white/5 rounded-full transition-colors group">
            <X className="w-5 h-5 text-slate-500 group-hover:text-primary transition-colors" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-8 space-y-8 max-h-[75vh] overflow-y-auto custom-scrollbar relative z-10">
          <div className="space-y-3">
            <div className="flex justify-between items-end">
              <label className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-500 italic">Node_Identity</label>
              <span className="text-[8px] text-primary/40 font-black uppercase">REQUIRED_FIELD</span>
            </div>
            <div className="relative group">
              <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none">
                <Terminal className="w-4 h-4 text-slate-600 group-focus-within:text-primary transition-colors" />
              </div>
              <input 
                required
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="PROT_ID: GLOBAL_LINK_V1"
                className="w-full bg-slate-950/50 border border-white/5 pl-12 pr-4 py-4 rounded-2xl focus:border-primary/50 outline-none transition-all placeholder:text-slate-700 uppercase font-black text-sm tracking-tight italic"
              />
            </div>
          </div>

          {step === 1 ? (
            <motion.div 
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              className="space-y-8"
            >
              <div className="space-y-3">
                <div className="flex justify-between items-end">
                  <label className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-500 italic">
                    Vector_Task_Input
                  </label>
                  <span className="text-[8px] text-slate-600 font-bold uppercase tracking-widest bg-white/5 px-2 py-0.5 rounded">AI_DECRYPTION_ENABLED</span>
                </div>
                <div className="relative group">
                  <textarea
                    required
                    value={task}
                    onChange={(e) => setTask(e.target.value)}
                    placeholder="DEFINE OBJECTIVE... (E.G. DEVELOP CROSS-PLATFORM SDK WITH RUST CORE)"
                    rows={5}
                    className="w-full bg-slate-950/50 border border-white/5 p-6 rounded-3xl focus:border-primary/50 outline-none transition-all placeholder:text-slate-700 uppercase font-black text-sm tracking-tight italic resize-none"
                  />
                  <div className="absolute bottom-4 right-4 text-[8px] text-slate-700 font-black uppercase tracking-widest">Natural_Lang_Parser</div>
                </div>
              </div>

              <div className="pt-4 flex flex-col sm:flex-row gap-4">
                <button
                  type="button"
                  onClick={handleGenerate}
                  disabled={generating || !title.trim() || !task.trim()}
                  className="flex-grow group relative overflow-hidden bg-primary text-white py-5 rounded-2xl font-black uppercase tracking-[0.2em] shadow-lg border border-white/10 disabled:opacity-30 transition-all text-xs"
                >
                  <div className="absolute inset-0 bg-white/20 -translate-x-full group-hover:translate-x-0 transition-transform duration-500" />
                  <div className="flex justify-center items-center gap-3">
                    {generating ? <Loader2 className="w-5 h-5 animate-spin" /> : <Wand2 className="w-5 h-5 group-hover:rotate-12 transition-transform" />}
                    <span>{generating ? "DECRYPTING..." : "Analyze_And_Generate"}</span>
                  </div>
                </button>
                <button
                  type="button"
                  onClick={onClose}
                  className="px-10 py-5 bg-slate-950/50 border border-white/10 hover:border-slate-700 rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] transition-all"
                >
                  Terminate
                </button>
              </div>
            </motion.div>
          ) : (
            <motion.div 
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              className="space-y-8"
            >
              <div className="space-y-3">
                <label className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-500 italic">Scope_Matrix</label>
                <textarea 
                  required
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="AI_GENERATED_SUMMARY"
                  rows={3}
                  className="w-full bg-slate-950/50 border border-white/5 p-6 rounded-3xl focus:border-primary/50 outline-none transition-all placeholder:text-slate-700 uppercase font-black text-xs tracking-tight italic resize-none"
                />
              </div>

              <div className="space-y-6">
                <div className="flex justify-between items-center border-b border-white/10 pb-4">
                  <div className="flex items-center gap-3">
                    <Activity className="w-4 h-4 text-primary" />
                    <label className="text-[10px] font-black uppercase tracking-[0.3em] text-primary italic">Milestone_Sequences</label>
                  </div>
                  <button 
                    type="button"
                    onClick={addMilestone}
                    className="group flex items-center gap-2 p-1.5 hover:bg-white/5 rounded-lg transition-all"
                  >
                    <div className="w-5 h-5 bg-primary/10 rounded-md border border-primary/20 flex items-center justify-center">
                      <Plus className="w-3 h-3 text-primary" />
                    </div>
                    <span className="text-[9px] font-black uppercase text-slate-500 group-hover:text-primary transition-colors">Inject_Sequence</span>
                  </button>
                </div>

                <div className="space-y-6">
                  <AnimatePresence>
                    {milestones.map((m, index) => (
                      <motion.div 
                        key={index}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95 }}
                        className="p-6 border border-white/5 bg-slate-950/30 rounded-3xl relative group hover:border-white/10 transition-all"
                      >
                        <button 
                          type="button"
                          onClick={() => removeMilestone(index)}
                          className="absolute -top-2 -right-2 w-7 h-7 bg-slate-900 border border-white/10 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all hover:bg-slate-800"
                        >
                          <X className="w-3 h-3 text-slate-500 hover:text-primary" />
                        </button>
                        
                        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                          <div className="md:col-span-3 space-y-4">
                            <div className="relative group/field">
                              <input 
                                required
                                value={m.title}
                                onChange={(e) => updateMilestone(index, "title", e.target.value)}
                                placeholder="SEQ_TITLE: COMPONENT_BUILD"
                                className="w-full bg-transparent border-b border-white/10 py-1.5 text-xs focus:border-primary/50 outline-none transition-all uppercase font-black tracking-tight italic group-hover/field:border-white/20"
                              />
                            </div>
                            <div className="relative group/field">
                              <textarea 
                                required
                                value={m.dod}
                                onChange={(e) => updateMilestone(index, "dod", e.target.value)}
                                placeholder="AQA_CRITERIA: UNIT_TESTS_PASS // LINT_GREEN"
                                className="w-full bg-slate-900/50 border border-white/5 p-4 rounded-2xl text-[10px] focus:border-primary/50 outline-none transition-all font-sans italic resize-none group-hover/field:border-white/10"
                                rows={2}
                              />
                            </div>
                          </div>
                          <div className="flex flex-col justify-end">
                            <label className="text-[8px] font-black uppercase text-slate-600 tracking-widest mb-2">Credit_Val_USD</label>
                            <div className="relative group/field">
                              <div className="absolute left-4 top-1/2 -translate-y-1/2 text-primary font-black text-xs">$</div>
                              <input 
                                type="number"
                                required
                                value={m.amount}
                                onChange={(e) => updateMilestone(index, "amount", parseFloat(e.target.value) || 0)}
                                className="w-full bg-slate-900 border border-white/5 pl-8 pr-4 py-3 rounded-2xl text-[11px] focus:border-primary/50 outline-none transition-all font-black italic group-hover/field:border-white/10"
                              />
                            </div>
                          </div>
                        </div>
                      </motion.div>
                    ))}
                  </AnimatePresence>
                </div>
              </div>

              <div className="pt-6 flex flex-col sm:flex-row gap-4">
                <button
                  type="button"
                  onClick={() => setStep(1)}
                  disabled={loading}
                  className="px-8 py-5 bg-slate-950/50 border border-white/10 hover:border-white/20 transition-all flex items-center justify-center gap-3 rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] disabled:opacity-30"
                >
                  <ArrowLeft className="w-4 h-4" /> Back
                </button>
                <button 
                  type="submit"
                  disabled={loading || milestones.length === 0}
                  className="flex-grow group relative overflow-hidden bg-accent text-white py-5 rounded-2xl font-black uppercase tracking-[0.2em] shadow-[0_0_30px_rgba(34,197,94,0.2)] border border-white/10 disabled:opacity-30 transition-all text-xs"
                >
                  <div className="absolute inset-0 bg-white/20 -translate-x-full group-hover:translate-x-0 transition-transform duration-500" />
                  <div className="flex justify-center items-center gap-3 relative z-10">
                    {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Zap className="w-5 h-5 group-hover:scale-125 transition-transform" />}
                    <span>{loading ? "CONFIGURING..." : "Finalize_And_Broadcast"}</span>
                  </div>
                </button>
                <button 
                  type="button"
                  onClick={onClose}
                  className="px-8 py-5 bg-slate-950/50 border border-white/10 hover:border-slate-700 rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] transition-all"
                >
                  Abort
                </button>
              </div>
            </motion.div>
          )}
        </form>
      </motion.div>
    </div>
  );
}
