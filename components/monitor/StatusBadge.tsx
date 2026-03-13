import React from 'react';
import { EscrowStatus } from '@prisma/client';

interface StatusBadgeProps {
  status: EscrowStatus;
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({ status }) => {
  const getColors = () => {
    switch (status) {
      case 'HELD':
        return 'bg-blue-500/10 text-blue-400 border-blue-500/20';
      case 'PARTIAL':
        return 'bg-yellow-500/10 text-yellow-400 border-yellow-500/20';
      case 'RELEASED':
        return 'bg-green-500/10 text-green-400 border-green-500/20';
      case 'REFUNDED':
        return 'bg-red-500/10 text-red-400 border-red-500/20';
      case 'DISPUTED':
        return 'bg-purple-500/10 text-purple-400 border-purple-500/20';
      default:
        return 'bg-gray-500/10 text-gray-400 border-gray-500/20';
    }
  };

  return (
    <span className={`px-2 py-1 rounded-full text-xs font-medium border ${getColors()}`}>
      {status}
    </span>
  );
};
