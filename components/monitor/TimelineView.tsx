import React, { useEffect, useState } from 'react';

interface TimelineViewProps {
  autoReleaseAt: Date;
}

export const TimelineView: React.FC<TimelineViewProps> = ({ autoReleaseAt }) => {
  const [timeLeft, setTimeLeft] = useState<string>('');
  const [percentage, setPercentage] = useState<number>(0);

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      const end = new Date(autoReleaseAt);
      const diff = end.getTime() - now.getTime();

      if (diff <= 0) {
        setTimeLeft('Expired');
        setPercentage(100);
        return;
      }

      const days = Math.floor(diff / (1000 * 60 * 60 * 24));
      const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
      const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));

      setTimeLeft(`${days}d ${hours}h ${minutes}m`);
      
      // Assume a 5-day window for calculation (432000000 ms)
      const windowMs = 5 * 24 * 60 * 60 * 1000;
      const elapsed = windowMs - diff;
      setPercentage(Math.min(100, Math.max(0, (elapsed / windowMs) * 100)));
    };

    updateTime();
    const timer = setInterval(updateTime, 60000);
    return () => clearInterval(timer);
  }, [autoReleaseAt]);

  return (
    <div className="w-full space-y-2">
      <div className="flex justify-between text-xs text-gray-400">
        <span>AI Monitor Review Window</span>
        <span className="font-mono text-cyan-400">{timeLeft} remaining</span>
      </div>
      <div className="h-1.5 w-full bg-gray-800 rounded-full overflow-hidden">
        <div 
          className="h-full bg-cyan-500 transition-all duration-1000 ease-linear"
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  );
};
