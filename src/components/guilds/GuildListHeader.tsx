
import React from 'react';

interface GuildListHeaderProps {
  title: string;
  description: string;
}

const GuildListHeader: React.FC<GuildListHeaderProps> = ({ title, description }) => {
  return (
    <div className="bg-gradient-to-r from-arcane to-valor text-text-primary p-4 border-b border-arcane-30 shadow-glow-subtle">
      <h2 className="text-xl font-orbitron font-bold mb-1 tracking-wider text-white" style={{ textShadow: '0 1px 2px rgba(0, 0, 0, 0.3)' }}>{title}</h2>
      <p className="text-sm text-text-primary/90 font-sora mb-3 leading-relaxed" style={{ textShadow: '0 1px 1px rgba(0, 0, 0, 0.2)' }}>
        {description}
      </p>
    </div>
  );
};

export default GuildListHeader;
