import React, { useState } from 'react';

interface EmployerResponseButtonsProps {
  actionId: string;
  onSuccess: () => void;
}

export const EmployerResponseButtons: React.FC<EmployerResponseButtonsProps> = ({ actionId, onSuccess }) => {
  const [loading, setLoading] = useState(false);
  const [showRejectInput, setShowRejectInput] = useState(false);
  const [reason, setReason] = useState('');

  const handleRespond = async (decision: 'APPROVE' | 'REJECT') => {
    setLoading(true);
    try {
      const res = await fetch('/api/monitor/respond', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ actionId, decision, reason }),
      });

      if (res.ok) {
        onSuccess();
      } else {
        alert('Failed to submit response');
      }
    } catch (error) {
      console.error(error);
      alert('Error connecting to monitor');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6 relative z-10">
      <div className="flex gap-4">
        <button
          onClick={() => handleRespond('APPROVE')}
          disabled={loading}
          className="group flex-1 relative overflow-hidden bg-accent text-white font-black py-4 px-6 rounded-2xl transition-all hover:scale-[1.02] active:scale-95 disabled:opacity-50 shadow-[0_10px_30px_rgba(235,115,31,0.2)]"
        >
          <div className="absolute inset-0 bg-white/20 -translate-x-full group-hover:translate-x-0 transition-transform duration-500" />
          <span className="relative z-10 uppercase tracking-[0.2em] text-xs">
            {loading ? 'Executing_Release...' : 'Authorize_Payout'}
          </span>
        </button>
        <button
          onClick={() => setShowRejectInput(!showRejectInput)}
          disabled={loading}
          className="group flex-1 relative overflow-hidden border border-red-500/30 hover:border-red-500 bg-red-500/5 text-red-500 font-black py-4 px-6 rounded-2xl transition-all hover:scale-[1.02] active:scale-95 disabled:opacity-50"
        >
          <span className="relative z-10 uppercase tracking-[0.2em] text-xs">
            Abort_Sequence
          </span>
        </button>
      </div>

      {showRejectInput && (
        <div className="space-y-4 p-8 bg-slate-950/80 border border-red-500/20 rounded-[32px] animate-in slide-in-from-top-4 duration-500 shadow-2xl">
          <div className="flex items-center gap-3 text-red-500/60 mb-2">
            <div className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse" />
            <label className="text-[10px] font-black uppercase tracking-widest italic">Input_Interruption_Reason</label>
          </div>
          <textarea
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            className="w-full bg-slate-900/50 border border-white/5 rounded-2xl p-6 text-xs text-white focus:border-red-500/50 outline-none placeholder:text-slate-800 transition-all min-h-[120px] shadow-inner italic font-mono"
            placeholder="PROTOCOL_VIOLATION_SPEC_REQUIRED..."
            rows={3}
          />
          <button
            onClick={() => handleRespond('REJECT')}
            disabled={loading || !reason.trim()}
            className="w-full bg-red-600 hover:bg-red-700 disabled:opacity-50 text-white font-black py-4 px-6 rounded-xl transition-all shadow-[0_10px_20px_rgba(220,38,38,0.2)] uppercase tracking-[0.2em] text-xs"
          >
            Confirm_Dispute_Sequence
          </button>
        </div>
      )}
    </div>
  );
};
