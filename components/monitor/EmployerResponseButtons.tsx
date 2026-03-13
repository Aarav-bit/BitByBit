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
    <div className="space-y-4">
      <div className="flex gap-3">
        <button
          onClick={() => handleRespond('APPROVE')}
          disabled={loading}
          className="flex-1 bg-cyan-500 hover:bg-cyan-600 disabled:opacity-50 text-black font-bold py-2 px-4 rounded transition-colors"
        >
          {loading ? 'Processing...' : 'Approve & Release'}
        </button>
        <button
          onClick={() => setShowRejectInput(!showRejectInput)}
          disabled={loading}
          className="flex-1 border border-red-500/50 hover:bg-red-500/10 text-red-500 font-bold py-2 px-4 rounded transition-colors"
        >
          Reject / Dispute
        </button>
      </div>

      {showRejectInput && (
        <div className="space-y-2 p-3 bg-red-500/5 border border-red-500/20 rounded">
          <label className="text-xs text-gray-400">Reason for rejection (Escalates to Human Review)</label>
          <textarea
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            className="w-full bg-black border border-gray-800 rounded p-2 text-sm text-white focus:border-red-500 outline-none"
            placeholder="Describe why this milestone doesn't meet the Definition of Done..."
            rows={3}
          />
          <button
            onClick={() => handleRespond('REJECT')}
            disabled={loading || !reason.trim()}
            className="w-full bg-red-600 hover:bg-red-700 disabled:opacity-50 text-white font-bold py-2 px-4 rounded transition-colors"
          >
            Confirm Rejection
          </button>
        </div>
      )}
    </div>
  );
};
