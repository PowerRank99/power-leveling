
import React from 'react';
import { Shield, Compass, Trophy } from 'lucide-react';

const GuildBanner: React.FC = () => {
  return (
    <div className="bg-gradient-to-r from-arcane to-valor text-text-primary p-5 border-b border-arcane-30 shadow-glow-subtle">
      <h2 className="text-xl font-orbitron font-bold mb-2 tracking-wider">Guildas</h2>
      <p className="text-sm text-text-secondary font-sora mb-4 leading-relaxed">
        Junte-se a outros atletas, complete missões e ganhe recompensas juntos.
      </p>
      
      <div className="flex gap-3 flex-wrap">
        <div className="bg-midnight-elevated/40 backdrop-blur-sm rounded-full p-2 px-3.5 flex items-center text-sm border border-white/10 font-sora transition-all duration-300 hover:shadow-glow-purple hover:bg-midnight-elevated hover:border-arcane-30">
          <Shield className="h-4 w-4 mr-2 text-arcane" />
          <span>Comunidade</span>
        </div>
        <div className="bg-midnight-elevated/40 backdrop-blur-sm rounded-full p-2 px-3.5 flex items-center text-sm border border-white/10 font-sora transition-all duration-300 hover:shadow-glow-purple hover:bg-midnight-elevated hover:border-arcane-30">
          <Compass className="h-4 w-4 mr-2 text-arcane" />
          <span>Missões</span>
        </div>
        <div className="bg-midnight-elevated/40 backdrop-blur-sm rounded-full p-2 px-3.5 flex items-center text-sm border border-white/10 font-sora transition-all duration-300 hover:shadow-glow-purple hover:bg-midnight-elevated hover:border-arcane-30">
          <Trophy className="h-4 w-4 mr-2 text-achievement" />
          <span>Conquistas</span>
        </div>
      </div>
    </div>
  );
};

export default GuildBanner;
