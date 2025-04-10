
import React, { useState } from 'react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Filter, Crown, Trophy, Search } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Input } from "@/components/ui/input";
import MemberRankingList from '@/components/guilds/MemberRankingList';
import { Button } from '@/components/ui/button';
import { motion, AnimatePresence } from 'framer-motion';

interface Member {
  id: string;
  name: string;
  avatar: string;
  points: number;
  position: number;
  isCurrentUser?: boolean;
  badge?: string;
  trend?: 'up' | 'down' | 'same';
}

interface MembersListProps {
  members: Member[];
}

const MembersList: React.FC<MembersListProps> = ({ members: initialMembers }) => {
  const [viewType, setViewType] = useState<'table' | 'cards'>('cards');
  const [searchTerm, setSearchTerm] = useState('');
  const [sortedBy, setSortedBy] = useState<'position' | 'points' | 'name'>('position');
  
  // Filter members based on search term
  const filteredMembers = initialMembers.filter(member => 
    member.name.toLowerCase().includes(searchTerm.toLowerCase())
  );
  
  // Sort members based on selected criterion
  const sortedMembers = [...filteredMembers].sort((a, b) => {
    if (sortedBy === 'position') return a.position - b.position;
    if (sortedBy === 'points') return b.points - a.points;
    if (sortedBy === 'name') return a.name.localeCompare(b.name);
    return 0;
  });

  return (
    <div className="p-4">
      <div className="flex justify-between items-center mb-3">
        <h3 className="font-bold text-lg font-orbitron tracking-wide text-text-primary">Todos os Membros</h3>
        <div className="flex gap-2">
          <div className="relative">
            <Input
              type="text"
              placeholder="Buscar membro..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-8 h-8 bg-midnight-elevated border-divider focus:border-arcane-30 focus:shadow-glow-subtle transition-all"
            />
            <Search className="absolute left-2 top-1/2 transform -translate-y-1/2 h-4 w-4 text-text-tertiary" />
          </div>
          
          <Select value={sortedBy} onValueChange={(value: any) => setSortedBy(value)}>
            <SelectTrigger className="w-[120px] h-8 text-sm border-divider bg-midnight-elevated">
              <SelectValue placeholder="Ordernar por" />
            </SelectTrigger>
            <SelectContent className="bg-midnight-elevated border-divider">
              <SelectItem value="position">Posição</SelectItem>
              <SelectItem value="points">Pontos</SelectItem>
              <SelectItem value="name">Nome</SelectItem>
            </SelectContent>
          </Select>
          
          <Select value={viewType} onValueChange={(value) => setViewType(value as 'table' | 'cards')}>
            <SelectTrigger className="w-[100px] h-8 text-sm border-divider bg-midnight-elevated">
              <SelectValue placeholder="Visualização" />
            </SelectTrigger>
            <SelectContent className="bg-midnight-elevated border-divider">
              <SelectItem value="cards">Cards</SelectItem>
              <SelectItem value="table">Tabela</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>
      
      <AnimatePresence mode="wait">
        {viewType === 'table' ? (
          <motion.div 
            key="table"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.3 }}
            className="bg-midnight-card rounded-lg border border-divider overflow-hidden mb-4"
          >
            <Table>
              <TableHeader>
                <TableRow className="border-divider">
                  <TableHead className="w-12 text-center font-orbitron text-text-secondary">Pos.</TableHead>
                  <TableHead className="font-orbitron text-text-secondary">Membro</TableHead>
                  <TableHead className="text-right font-orbitron text-text-secondary">Pontos</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {sortedMembers.map((member) => (
                  <TableRow key={member.id} className={member.isCurrentUser ? "bg-arcane-15/20" : ""}>
                    <TableCell className="text-center font-medium">
                      {member.position === 1 ? (
                        <Crown className="h-4 w-4 text-achievement fill-achievement mx-auto" />
                      ) : member.position === 2 ? (
                        <Trophy className="h-4 w-4 text-text-secondary mx-auto" />
                      ) : member.position === 3 ? (
                        <Trophy className="h-4 w-4 text-valor mx-auto" />
                      ) : (
                        <span className="text-text-tertiary">{member.position}</span>
                      )}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center">
                        <Avatar className={`h-8 w-8 mr-2 ${member.isCurrentUser ? 'ring-2 ring-arcane shadow-glow-purple' : ''}`}>
                          <AvatarImage src={member.avatar} alt={member.name} />
                          <AvatarFallback className="bg-midnight-card text-text-primary font-orbitron">{member.name.substring(0, 2).toUpperCase()}</AvatarFallback>
                        </Avatar>
                        <div>
                          <div className="font-medium flex items-center">
                            <span className={member.isCurrentUser ? "text-arcane font-orbitron" : "text-text-primary font-orbitron"}>
                              {member.name}
                            </span>
                            {member.isCurrentUser && <span className="text-xs text-arcane ml-2 font-sora">(Você)</span>}
                          </div>
                          {member.badge && (
                            <Badge variant="arcane" className="text-xs px-1 py-0 h-4">
                              {member.badge}
                            </Badge>
                          )}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell className="text-right font-space font-medium text-text-primary">
                      {member.points} pts
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </motion.div>
        ) : (
          <motion.div 
            key="cards"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.3 }}
          >
            <ScrollArea className="h-[calc(100vh-430px)]">
              <MemberRankingList members={sortedMembers} />
            </ScrollArea>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default MembersList;
