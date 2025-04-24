
import React from 'react';
import { ScrollArea } from '@/components/ui/scroll-area';
import { motion } from 'framer-motion';
import GuildCard from './GuildCard';
import EmptyState from '@/components/ui/EmptyState';
import { Button } from '@/components/ui/button';
import { PlusIcon } from 'lucide-react';

interface Guild {
  id: string;
  name: string;
  description: string;
  avatar: string;
  memberCount: number;
  level: number;
  questCount: number;
  isUserGuildMaster: boolean;
}

interface GuildTabContentProps {
  guilds: Guild[];
  isUserMember: boolean;
  onCreateGuild?: () => void;
}

const GuildTabContent: React.FC<GuildTabContentProps> = ({ guilds, isUserMember, onCreateGuild }) => {
  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };
  
  const item = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0, transition: { duration: 0.3, ease: [0.16, 1, 0.3, 1] } }
  };

  if (guilds.length === 0) {
    return (
      <EmptyState 
        icon="Users" 
        title="Nenhuma guilda encontrada" 
        description={isUserMember ? 
          "Você ainda não participa de nenhuma guilda ou nenhuma corresponde à sua pesquisa." :
          "Não foram encontradas guildas sugeridas para você no momento."
        }
        action={isUserMember && onCreateGuild ? (
          <Button 
            onClick={onCreateGuild} 
            className="bg-arcane hover:bg-arcane-60 mt-4 text-text-primary shadow-glow-subtle border border-arcane-30 transition-all duration-300 hover:shadow-glow-purple group hover:-translate-y-1"
          >
            <span>Criar uma guilda</span>
            <motion.span
              animate={{ x: [0, 2, 0] }}
              transition={{ repeat: Infinity, duration: 1.5 }}
            >
              <PlusIcon className="h-4 w-4 ml-1.5" />
            </motion.span>
          </Button>
        ) : undefined}
      />
    );
  }

  return (
    <ScrollArea className={`h-[calc(100vh-${isUserMember ? '250px' : '300px'})]`}>
      <motion.div 
        className="space-y-4"
        variants={container}
        initial="hidden"
        animate="show"
      >
        {guilds.map(guild => (
          <motion.div key={guild.id} variants={item}>
            <GuildCard guild={guild} isUserMember={isUserMember} />
          </motion.div>
        ))}
      </motion.div>
    </ScrollArea>
  );
};

export default GuildTabContent;
