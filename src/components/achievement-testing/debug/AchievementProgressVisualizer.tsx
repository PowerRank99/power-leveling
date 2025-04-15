
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useTestingDashboard } from '@/contexts/TestingDashboardContext';
import { Skeleton } from '@/components/ui/skeleton';
import { PieChart, ArrowRight, Hourglass, CheckCircle2, Clock, PieChartIcon } from 'lucide-react';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface AchievementProgressVisualizerProps {
  userId: string;
}

interface ProgressRecord {
  achievementId: string;
  currentValue: number;
  targetValue: number;
  percentage: number;
  lastUpdated: string | null;
  isComplete: boolean;
}

const AchievementProgressVisualizer: React.FC<AchievementProgressVisualizerProps> = ({ userId }) => {
  const { allAchievements } = useTestingDashboard();
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [isLoading, setIsLoading] = useState(false);
  const [progressData, setProgressData] = useState<ProgressRecord[]>([]);
  
  // Get unique achievement categories
  const categories = ['all', ...new Set(allAchievements.map(a => a.category))];
  
  // Fetch progress data
  useEffect(() => {
    const fetchProgressData = async () => {
      if (!userId) return;
      
      setIsLoading(true);
      try {
        // Fetch progress records from database
        const { data: progressRecords, error } = await supabase
          .from('achievement_progress')
          .select('*')
          .eq('user_id', userId);
          
        if (error) {
          toast.error('Error fetching progress data', {
            description: error.message
          });
          return;
        }
        
        // Convert to our format and join with achievement data
        const formattedData: ProgressRecord[] = [];
        
        for (const achievement of allAchievements) {
          // Only include achievements in the selected category, or all if 'all' is selected
          if (selectedCategory !== 'all' && achievement.category !== selectedCategory) {
            continue;
          }
          
          // Find progress record for this achievement
          const progressRecord = progressRecords?.find(p => p.achievement_id === achievement.id);
          
          formattedData.push({
            achievementId: achievement.id,
            currentValue: progressRecord?.current_value || 0,
            targetValue: achievement.requirements.value || 0,
            percentage: progressRecord ? 
              Math.min(100, (progressRecord.current_value / achievement.requirements.value) * 100) : 0,
            lastUpdated: progressRecord?.updated_at || null,
            isComplete: progressRecord?.is_complete || false
          });
        }
        
        // Sort by percentage descending
        formattedData.sort((a, b) => b.percentage - a.percentage);
        
        setProgressData(formattedData);
      } catch (error) {
        console.error('Error fetching progress data:', error);
        toast.error('Error fetching progress data');
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchProgressData();
  }, [userId, selectedCategory, allAchievements]);
  
  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="flex items-center text-lg">
          <PieChartIcon className="mr-2 h-5 w-5 text-arcane" />
          Achievement Progress Visualizer
        </CardTitle>
      </CardHeader>
      
      <CardContent className="space-y-4">
        <div className="flex">
          <Select 
            value={selectedCategory} 
            onValueChange={setSelectedCategory}
          >
            <SelectTrigger className="w-[200px]">
              <SelectValue placeholder="Filter by category" />
            </SelectTrigger>
            <SelectContent>
              {categories.map(category => (
                <SelectItem key={category} value={category}>
                  {category === 'all' ? 'All Categories' : category}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        
        {isLoading ? (
          <div className="space-y-4">
            {[1, 2, 3, 4].map(i => (
              <Skeleton key={i} className="h-16 w-full bg-midnight-elevated" />
            ))}
          </div>
        ) : progressData.length > 0 ? (
          <div className="space-y-3">
            {progressData.map(progress => {
              const achievement = allAchievements.find(a => a.id === progress.achievementId);
              if (!achievement) return null;
              
              return (
                <div 
                  key={progress.achievementId} 
                  className="border border-divider/30 rounded-md p-3 bg-midnight-card"
                >
                  <div className="flex justify-between mb-2">
                    <div>
                      <div className="font-medium">{achievement.name}</div>
                      <div className="text-xs text-text-secondary mt-0.5">
                        {achievement.description}
                      </div>
                    </div>
                    <div className="flex flex-col items-end">
                      <Badge variant={progress.isComplete ? 'success' : 'outline'}>
                        {progress.isComplete ? (
                          <CheckCircle2 className="h-3 w-3 mr-1" />
                        ) : (
                          <Hourglass className="h-3 w-3 mr-1" />
                        )}
                        {progress.isComplete ? 'Completed' : 'In Progress'}
                      </Badge>
                      {progress.lastUpdated && (
                        <div className="text-xs text-text-tertiary mt-1 flex items-center">
                          <Clock className="h-3 w-3 mr-1" />
                          Updated: {new Date(progress.lastUpdated).toLocaleDateString()}
                        </div>
                      )}
                    </div>
                  </div>
                  
                  <div className="space-y-1">
                    <div className="flex justify-between text-xs text-text-secondary">
                      <div>Progress</div>
                      <div>
                        {progress.currentValue} / {progress.targetValue}
                        {' '}
                        ({Math.round(progress.percentage)}%)
                      </div>
                    </div>
                    <Progress value={progress.percentage} className="h-2" />
                    
                    <div className="text-xs flex justify-between mt-2 text-text-secondary">
                      <div>
                        <span className="font-medium text-arcane">
                          {achievement.requirements.type}
                        </span>
                        {' '}requirement
                      </div>
                      
                      <div className="flex items-center">
                        <span className="opacity-70">Current: {progress.currentValue}</span>
                        <ArrowRight className="h-3 w-3 mx-1" />
                        <span>Target: {progress.targetValue}</span>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center h-[300px]">
            <PieChart className="h-12 w-12 text-text-tertiary mb-4" />
            <p className="text-text-secondary">No progress data available</p>
            <p className="text-xs text-text-tertiary mt-1">
              {selectedCategory === 'all' 
                ? 'Try performing activities to generate achievement progress'
                : `No progress data for ${selectedCategory} achievements`}
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default AchievementProgressVisualizer;
