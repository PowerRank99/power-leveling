
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Play, Pause, Plus, Save, Trash2, Clock } from 'lucide-react';
import { useTestingDashboard } from '@/contexts/TestingDashboardContext';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';

interface TestBatchTabProps {
  userId: string;
}

interface BatchConfig {
  id: string;
  name: string;
  description: string;
  achievements: string[];
}

const TestBatchTab: React.FC<TestBatchTabProps> = ({ userId }) => {
  const { 
    allAchievements, 
    selectedAchievements,
    testProgress,
    runTests,
    isLoading
  } = useTestingDashboard();
  
  const [batchConfigs, setBatchConfigs] = useState<BatchConfig[]>([
    {
      id: '1',
      name: 'Workout Basics',
      description: 'Basic workout achievements for new users',
      achievements: ['primeiro-treino', 'embalo-fitness', 'total-7']
    },
    {
      id: '2',
      name: 'Streak Master',
      description: 'All streak-related achievements',
      achievements: ['trinca-poderosa', 'streak-7', 'streak-14', 'streak-21', 'streak-30']
    }
  ]);
  
  const [newBatchName, setNewBatchName] = useState('');
  const [newBatchDescription, setNewBatchDescription] = useState('');
  
  const saveBatch = () => {
    if (newBatchName.trim() === '') return;
    
    const newBatch: BatchConfig = {
      id: Date.now().toString(),
      name: newBatchName,
      description: newBatchDescription,
      achievements: Array.from(selectedAchievements)
    };
    
    setBatchConfigs(prev => [...prev, newBatch]);
    setNewBatchName('');
    setNewBatchDescription('');
  };
  
  const deleteBatch = (id: string) => {
    setBatchConfigs(prev => prev.filter(batch => batch.id !== id));
  };
  
  const runBatch = (achievements: string[]) => {
    runTests(achievements);
  };
  
  return (
    <div className="space-y-4">
      <Alert className="bg-arcane-15 border-arcane-30">
        <Clock className="h-4 w-4 text-arcane" />
        <AlertTitle>Batch Testing</AlertTitle>
        <AlertDescription>
          Create and save batches of achievement tests. Run them sequentially to test multiple achievements at once.
        </AlertDescription>
      </Alert>
      
      {testProgress.isRunning && (
        <Card className="border-arcane-30 p-3 space-y-2">
          <div className="flex justify-between items-center">
            <h3 className="font-semibold">Running Batch</h3>
            <span className="text-sm text-text-secondary">
              {testProgress.completed} / {testProgress.total}
            </span>
          </div>
          <div className="w-full h-2 bg-midnight-card rounded-full overflow-hidden">
            <div 
              className="h-full bg-arcane"
              style={{ width: `${(testProgress.completed / testProgress.total) * 100}%` }}
            />
          </div>
          {testProgress.currentTest && (
            <p className="text-xs text-text-tertiary">
              Current: {testProgress.currentTest}
            </p>
          )}
        </Card>
      )}
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Saved Batches */}
        <div className="lg:col-span-2">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-lg font-orbitron">Saved Batches</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {batchConfigs.length === 0 ? (
                <div className="text-center py-8 text-text-tertiary">
                  <p>No saved batches yet</p>
                  <p className="text-xs mt-2">
                    Select achievements and save them as a batch to appear here
                  </p>
                </div>
              ) : (
                <ScrollArea className="h-[400px]">
                  <div className="space-y-4">
                    {batchConfigs.map(batch => {
                      // Get achievement details for this batch
                      const batchAchievements = allAchievements.filter(a => 
                        batch.achievements.includes(a.id)
                      );
                      
                      return (
                        <div 
                          key={batch.id} 
                          className="border border-divider/30 rounded-md p-3 space-y-2"
                        >
                          <div className="flex justify-between items-start">
                            <div>
                              <h3 className="font-semibold">{batch.name}</h3>
                              <p className="text-sm text-text-secondary">{batch.description}</p>
                            </div>
                            <div className="flex space-x-2">
                              <Button 
                                variant="outline" 
                                size="sm"
                                onClick={() => runBatch(batch.achievements)}
                                disabled={isLoading}
                              >
                                <Play className="h-3 w-3 mr-1" />
                                Run
                              </Button>
                              <Button 
                                variant="ghost" 
                                size="sm"
                                onClick={() => deleteBatch(batch.id)}
                              >
                                <Trash2 className="h-3 w-3" />
                              </Button>
                            </div>
                          </div>
                          
                          <div className="flex flex-wrap gap-2">
                            {batchAchievements.map(achievement => (
                              <Badge 
                                key={achievement.id}
                                variant="outline"
                                className="bg-midnight-elevated"
                              >
                                {achievement.name}
                              </Badge>
                            ))}
                            {batchAchievements.length === 0 && (
                              <span className="text-xs text-text-tertiary">
                                No achievements in this batch
                              </span>
                            )}
                          </div>
                          
                          <div className="flex justify-between text-xs text-text-tertiary">
                            <span>{batchAchievements.length} achievements</span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </ScrollArea>
              )}
            </CardContent>
          </Card>
        </div>
        
        {/* Create New Batch */}
        <div>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-lg font-orbitron">Create Batch</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Input
                  placeholder="Batch name"
                  value={newBatchName}
                  onChange={(e) => setNewBatchName(e.target.value)}
                  className="bg-midnight-elevated border-divider"
                />
                
                <Input
                  placeholder="Description (optional)"
                  value={newBatchDescription}
                  onChange={(e) => setNewBatchDescription(e.target.value)}
                  className="bg-midnight-elevated border-divider"
                />
              </div>
              
              <div className="border border-divider/30 rounded-md p-2">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm font-semibold">Selected Achievements</span>
                  <Badge variant="outline">
                    {selectedAchievements.size}
                  </Badge>
                </div>
                
                <ScrollArea className="h-[200px]">
                  {selectedAchievements.size === 0 ? (
                    <div className="text-center py-4 text-text-tertiary">
                      <p className="text-xs">
                        No achievements selected. 
                        Select achievements in the Categories tab.
                      </p>
                    </div>
                  ) : (
                    <div className="space-y-1">
                      {Array.from(selectedAchievements).map(id => {
                        const achievement = allAchievements.find(a => a.id === id);
                        if (!achievement) return null;
                        
                        return (
                          <div 
                            key={id}
                            className="text-xs p-1 border-b border-divider/10 last:border-0"
                          >
                            {achievement.name}
                          </div>
                        );
                      })}
                    </div>
                  )}
                </ScrollArea>
              </div>
              
              <div className="flex space-x-2">
                <Button 
                  variant="outline"
                  onClick={saveBatch}
                  disabled={newBatchName.trim() === '' || selectedAchievements.size === 0}
                  className="flex-1"
                >
                  <Save className="h-4 w-4 mr-1" />
                  Save Batch
                </Button>
                
                <Button 
                  variant="arcane"
                  onClick={() => runTests()}
                  disabled={selectedAchievements.size === 0 || isLoading}
                  className="flex-1"
                >
                  <Play className="h-4 w-4 mr-1" />
                  Run Selected
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default TestBatchTab;
