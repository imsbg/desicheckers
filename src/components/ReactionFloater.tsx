import React from 'react';

export interface FloatingReaction {
  id: string;
  emoji: string;
  sender: string;
  leftPercent: number;
}

interface ReactionFloaterProps {
  reactions: FloatingReaction[];
}

export const ReactionFloater: React.FC<ReactionFloaterProps> = ({ reactions }) => {
  if (reactions.length === 0) return null;

  return (
    <div className="fixed inset-0 pointer-events-none z-50 overflow-hidden">
      {reactions.map((item) => (
        <div
          key={item.id}
          style={{ left: `${item.leftPercent}%` }}
          className="absolute bottom-24 flex flex-col items-center animate-float-up"
        >
          <span className="text-3xl sm:text-4xl drop-shadow-lg">{item.emoji}</span>
          <span className="mt-0.5 px-2 py-0.5 rounded-full bg-slate-900/80 text-white text-[10px] font-bold shadow">
            {item.sender}
          </span>
        </div>
      ))}
    </div>
  );
};
