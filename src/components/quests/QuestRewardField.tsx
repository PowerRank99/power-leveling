
import React from 'react';
import { Trophy } from 'lucide-react';
import { 
  FormField, 
  FormItem, 
  FormMessage 
} from '@/components/ui/form';
import { UseFormReturn } from 'react-hook-form';
import { QuestFormData } from './QuestForm';

interface QuestRewardFieldProps {
  form: UseFormReturn<QuestFormData>;
}

const QuestRewardField: React.FC<QuestRewardFieldProps> = ({ form }) => {
  return (
    <div>
      <h3 className="text-lg font-orbitron text-text-primary mb-4">Recompensas</h3>
      
      <div className="bg-achievement-15 rounded-lg border border-achievement-30 p-4">
        <div className="flex items-center">
          <div className="bg-achievement-30 rounded-full p-3 mr-4 border border-achievement shadow-glow-gold">
            <Trophy className="h-6 w-6 text-achievement" />
          </div>
          <div>
            <FormField
              control={form.control}
              name="xpReward"
              render={({ field }) => (
                <FormItem>
                  <p className="text-xl font-semibold font-space text-achievement">+{field.value} XP</p>
                  <p className="text-text-secondary font-sora">Ao completar a quest</p>
                  <input 
                    type="hidden" 
                    {...field}
                  />
                  <FormMessage className="text-valor" />
                </FormItem>
              )}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default QuestRewardField;
