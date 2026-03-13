"use client";

import { useState } from "react";
import { Plus, X, Loader2, Wand2, ArrowLeft } from "lucide-react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

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
      toast.success("MILESTONES GENERATED. CONFIRM OR EDIT THEN DEPLOY.");
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
        toast.success("PROTOCOL DEPLOYED SUCCESSFULLY");
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
    <div className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-card border border-border w-full max-w-2xl shadow-2xl relative overflow-hidden font-mono">
        <div className="absolute top-0 left-0 w-full h-1 bg-primary" />
        
        <div className="p-6 border-b border-border flex justify-between items-center bg-muted/30">
          <h2 className="text-xl font-bold uppercase tracking-tighter">Initialize New Protocol Node</h2>
          <button onClick={onClose} className="hover:text-primary transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6 max-h-[80vh] overflow-y-auto custom-scrollbar">
          <div className="space-y-2">
            <label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Protocol Title</label>
            <input 
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. HIGH-FIDELITY CONTENT ENGINE"
              className="w-full bg-background border border-border px-4 py-3 rounded-none focus:border-primary outline-none transition-all placeholder:opacity-30 uppercase"
            />
          </div>

          {step === 1 ? (
            <>
              <div className="space-y-2">
                <label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
                  Task (AI will convert to milestones)
                </label>
                <textarea
                  required
                  value={task}
                  onChange={(e) => setTask(e.target.value)}
                  placeholder="DESCRIBE THE TASK ONLY. EX: BUILD A LANDING PAGE + AUTH + DASHBOARD..."
                  rows={5}
                  className="w-full bg-background border border-border px-4 py-3 rounded-none focus:border-primary outline-none transition-all placeholder:opacity-30 uppercase font-sans text-sm"
                />
              </div>

              <div className="pt-2 flex gap-4">
                <button
                  type="button"
                  onClick={handleGenerate}
                  disabled={generating || !title.trim() || !task.trim()}
                  className="flex-grow bg-primary text-primary-foreground py-4 font-bold uppercase tracking-widest hover:bg-primary/90 transition-all disabled:opacity-50 flex justify-center items-center gap-2"
                >
                  {generating ? <Loader2 className="w-5 h-5 animate-spin" /> : <Wand2 className="w-5 h-5" />}
                  {generating ? "Generating..." : "Generate Milestones"}
                </button>
                <button
                  type="button"
                  onClick={onClose}
                  className="px-8 border border-border hover:bg-muted font-bold uppercase tracking-widest transition-all"
                >
                  Abort
                </button>
              </div>
            </>
          ) : (
            <>
              <div className="space-y-2">
                <label className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Scope Definition</label>
                <textarea 
                  required
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="AI GENERATED SCOPE. YOU CAN EDIT BEFORE DEPLOY."
                  rows={3}
                  className="w-full bg-background border border-border px-4 py-3 rounded-none focus:border-primary outline-none transition-all placeholder:opacity-30 uppercase font-sans text-sm"
                />
              </div>

              <div className="space-y-4">
                <div className="flex justify-between items-center border-b border-border pb-2">
                  <label className="text-[10px] font-bold uppercase tracking-widest text-primary">Milestone Segments</label>
                  <button 
                    type="button"
                    onClick={addMilestone}
                    className="text-[10px] font-bold uppercase flex items-center gap-1 hover:text-primary transition-colors"
                  >
                    <Plus className="w-3 h-3" /> [ Inject Segment ]
                  </button>
                </div>

                <div className="space-y-6">
                  {milestones.map((m, index) => (
                    <div key={index} className="p-4 border border-border bg-muted/10 relative group">
                      <button 
                        type="button"
                        onClick={() => removeMilestone(index)}
                        className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity text-muted-foreground hover:text-red-500"
                      >
                        <X className="w-4 h-4" />
                      </button>
                      
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div className="md:col-span-2 space-y-2">
                          <input 
                            required
                            value={m.title}
                            onChange={(e) => updateMilestone(index, "title", e.target.value)}
                            placeholder="SEGMENT TITLE"
                            className="w-full bg-transparent border-b border-border py-1 text-sm focus:border-primary outline-none transition-all uppercase font-bold"
                          />
                          <textarea 
                            required
                            value={m.dod}
                            onChange={(e) => updateMilestone(index, "dod", e.target.value)}
                            placeholder="DEFINITION OF DONE (AQA CRITERIA)"
                            className="w-full bg-transparent border border-border/20 p-2 text-[10px] focus:border-primary outline-none transition-all font-sans"
                            rows={2}
                          />
                        </div>
                        <div className="flex flex-col justify-end">
                          <label className="text-[9px] font-bold uppercase opacity-40 mb-1">Escrow Credit</label>
                          <div className="relative">
                            <span className="absolute left-2 top-1/2 -translate-y-1/2 text-primary font-bold text-xs">$</span>
                            <input 
                              type="number"
                              required
                              value={m.amount}
                              onChange={(e) => updateMilestone(index, "amount", parseFloat(e.target.value) || 0)}
                              className="w-full bg-background border border-border/40 pl-6 pr-2 py-2 text-sm focus:border-primary outline-none transition-all font-bold"
                            />
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="pt-4 flex gap-4">
                <button
                  type="button"
                  onClick={() => setStep(1)}
                  disabled={loading}
                  className="px-5 border border-border hover:bg-muted font-bold uppercase tracking-widest transition-all flex items-center gap-2 disabled:opacity-50"
                >
                  <ArrowLeft className="w-4 h-4" /> Back
                </button>
                <button 
                  type="submit"
                  disabled={loading || milestones.length === 0}
                  className="flex-grow bg-primary text-primary-foreground py-4 font-bold uppercase tracking-widest hover:bg-primary/90 transition-all disabled:opacity-50 flex justify-center items-center gap-2"
                >
                  {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : "Deploy Protocol Instance"}
                </button>
                <button 
                  type="button"
                  onClick={onClose}
                  className="px-8 border border-border hover:bg-muted font-bold uppercase tracking-widest transition-all"
                >
                  Abort
                </button>
              </div>
            </>
          )}
        </form>
      </div>
    </div>
  );
}
