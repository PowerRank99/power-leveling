
import React from 'react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Filter, Crown, Trophy } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ScrollArea } from '@/components/ui/scroll-area';
import MemberRankingList from '@/components/guilds/MemberRankingList';

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

const MembersList: React.FC<MembersListProps> = ({ members }) => {
  return (
    <div className="p-4">
      <div className="flex justify-between items-center mb-3">
        <h3 className="font-bold text-lg">Todos os Membros</h3>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" className="h-8 px-3 text-sm border-gray-200">
            <Filter className="h-3.5 w-3.5 mr-1" />
            Filtrar
          </Button>
          
          <Select defaultValue="table">
            <SelectTrigger className="w-[100px] h-8 px-3 text-sm border-gray-200">
              <SelectValue placeholder="Visualização" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="cards">Cards</SelectItem>
              <SelectItem value="table">Tabela</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>
      
      {/* Tabular view for better data comparison */}
      <div className="bg-white rounded-lg border border-gray-200 overflow-hidden mb-4">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-12 text-center">Pos.</TableHead>
              <TableHead>Membro</TableHead>
              <TableHead className="text-right">Pontos</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {members.map((member) => (
              <TableRow key={member.id} className={member.isCurrentUser ? "bg-blue-50" : ""}>
                <TableCell className="text-center font-medium">
                  {member.position === 1 ? (
                    <Crown className="h-4 w-4 text-yellow-500 fill-yellow-500 mx-auto" />
                  ) : member.position === 2 ? (
                    <Trophy className="h-4 w-4 text-gray-400 mx-auto" />
                  ) : member.position === 3 ? (
                    <Trophy className="h-4 w-4 text-orange-400 mx-auto" />
                  ) : (
                    member.position
                  )}
                </TableCell>
                <TableCell>
                  <div className="flex items-center">
                    <Avatar className={`h-8 w-8 mr-2 ${member.isCurrentUser ? 'ring-2 ring-fitblue' : ''}`}>
                      <AvatarImage src={member.avatar} alt={member.name} />
                      <AvatarFallback>{member.name.substring(0, 2)}</AvatarFallback>
                    </Avatar>
                    <div>
                      <div className="font-medium flex items-center">
                        {member.name}
                        {member.isCurrentUser && <span className="text-xs text-blue-500 ml-2">(Você)</span>}
                      </div>
                      {member.badge && (
                        <Badge variant="outline" className="text-xs px-1 py-0 h-4 bg-white">{member.badge}</Badge>
                      )}
                    </div>
                  </div>
                </TableCell>
                <TableCell className="text-right font-medium">
                  {member.points} pts
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
      
      {/* Card view for mobile-friendly display */}
      <ScrollArea className="h-[calc(100vh-430px)]">
        <MemberRankingList members={members} />
      </ScrollArea>
    </div>
  );
};

export default MembersList;
