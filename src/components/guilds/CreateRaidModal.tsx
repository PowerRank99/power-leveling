
import React, { useState } from 'react';
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle,
  DialogFooter
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Calendar } from '@/components/ui/calendar';
import { 
  Popover,
  PopoverContent,
  PopoverTrigger, 
} from '@/components/ui/popover';
import { Calendar as CalendarIcon } from 'lucide-react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from 'sonner';

// Import the GuildService for raid creation
import { GuildService } from '@/services/rpg/guild/GuildService';
import { useAuth } from '@/hooks/useAuth';

interface CreateRaidModalProps {
  guildId: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess?: (raidId: string) => void;
}

const CreateRaidModal: React.FC<CreateRaidModalProps> = ({
  guildId,
  open,
  onOpenChange,
  onSuccess
}) => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [name, setName] = useState('');
  const [raidType, setRaidType] = useState<'consistency' | 'beast' | 'elemental'>('consistency');
  const [startDate, setStartDate] = useState<Date>(new Date());
  const [endDate, setEndDate] = useState<Date>(() => {
    const date = new Date();
    date.setDate(date.getDate() + 7); // Default end date is 7 days from now
    return date;
  });
  const [daysRequired, setDaysRequired] = useState<number>(3);
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!name) {
      toast.error('Por favor, insira um nome para a missão');
      return;
    }
    
    if (!user?.id) {
      toast.error('Você precisa estar logado para criar uma missão');
      return;
    }
    
    setLoading(true);
    
    try {
      const raidId = await GuildService.createRaid(guildId, user.id, {
        name,
        raidType,
        startDate,
        endDate,
        daysRequired
      });
      
      if (raidId && onSuccess) {
        onSuccess(raidId);
      } else {
        onOpenChange(false);
      }
    } catch (error) {
      console.error('Error creating raid:', error);
      toast.error('Erro ao criar missão', {
        description: 'Ocorreu um erro ao criar a missão. Tente novamente.'
      });
    } finally {
      setLoading(false);
    }
  };
  
  const getRaidTypeLabel = (type: string) => {
    switch (type) {
      case 'consistency': return 'Consistência';
      case 'beast': return 'Fera Mitológica';
      case 'elemental': return 'Desafio Elemental';
      default: return 'Desconhecido';
    }
  };
  
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="bg-midnight-card border-arcane-30">
        <DialogHeader>
          <DialogTitle className="text-xl font-orbitron text-text-primary">Criar Nova Missão</DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name" className="text-sm text-text-secondary">Nome da Missão</Label>
            <Input 
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Ex: Treino Consistente"
              className="bg-midnight-elevated border-divider text-text-primary"
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="type" className="text-sm text-text-secondary">Tipo de Missão</Label>
            <Select value={raidType} onValueChange={(value) => setRaidType(value as any)}>
              <SelectTrigger id="type" className="bg-midnight-elevated border-divider text-text-primary">
                <SelectValue placeholder="Selecione o tipo" />
              </SelectTrigger>
              <SelectContent className="bg-midnight-elevated border-divider">
                <SelectItem value="consistency" className="text-text-primary hover:bg-arcane-15">
                  Consistência - Treinar X dias
                </SelectItem>
                <SelectItem value="beast" className="text-text-primary hover:bg-arcane-15">
                  Fera Mitológica - Acumular treinos coletivos
                </SelectItem>
                <SelectItem value="elemental" className="text-text-primary hover:bg-arcane-15">
                  Desafio Elemental - Treinos de tipos específicos
                </SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label className="text-sm text-text-secondary">Data Início</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button 
                    variant="outline" 
                    className="w-full bg-midnight-elevated border-divider text-text-primary justify-start"
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {startDate ? format(startDate, 'PPP', { locale: ptBR }) : <span>Selecionar data</span>}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0 bg-midnight-elevated border-arcane-30">
                  <Calendar
                    mode="single"
                    selected={startDate}
                    onSelect={(date) => date && setStartDate(date)}
                    initialFocus
                    className="bg-midnight-base"
                  />
                </PopoverContent>
              </Popover>
            </div>
            
            <div className="space-y-2">
              <Label className="text-sm text-text-secondary">Data Fim</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button 
                    variant="outline" 
                    className="w-full bg-midnight-elevated border-divider text-text-primary justify-start"
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {endDate ? format(endDate, 'PPP', { locale: ptBR }) : <span>Selecionar data</span>}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0 bg-midnight-elevated border-arcane-30">
                  <Calendar
                    mode="single"
                    selected={endDate}
                    onSelect={(date) => date && setEndDate(date)}
                    initialFocus
                    className="bg-midnight-base"
                  />
                </PopoverContent>
              </Popover>
            </div>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="days" className="text-sm text-text-secondary">
              Dias Necessários
            </Label>
            <Input
              id="days"
              type="number"
              min="1"
              max="30"
              value={daysRequired}
              onChange={(e) => setDaysRequired(parseInt(e.target.value) || 1)}
              className="bg-midnight-elevated border-divider text-text-primary"
            />
            <p className="text-xs text-text-tertiary">
              Para missões de consistência: dias de treino necessários.
              Para outros tipos: dias para completar os objetivos.
            </p>
          </div>
          
          <DialogFooter>
            <Button 
              type="button" 
              variant="outline"
              className="border-divider text-text-secondary bg-midnight-elevated hover:bg-midnight-base"
              onClick={() => onOpenChange(false)}
              disabled={loading}
            >
              Cancelar
            </Button>
            <Button 
              type="submit"
              variant="arcane"
              className="font-sora"
              disabled={loading}
            >
              {loading ? 'Criando...' : 'Criar Missão'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default CreateRaidModal;
