
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
      <h3 className="text-lg font-medium text-gray-700 mb-4">Recompensas</h3>
      
      <div className="bg-green-50 rounded-lg p-4">
        <div className="flex items-center">
          <div className="bg-green-500 rounded-full p-3 mr-4">
            <Trophy className="h-6 w-6 text-white" />
          </div>
          <div>
            <FormField
              control={form.control}
              name="xpReward"
              render={({ field }) => (
                <FormItem>
                  <p className="text-xl font-semibold text-green-600">+{field.value} XP</p>
                  <p className="text-gray-600">Ao completar a quest</p>
                  <input 
                    type="hidden" 
                    {...field}
                  />
                  <FormMessage />
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
