
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { ChevronRight, ChevronDown, Trophy, Calculator, BookOpen } from 'lucide-react';
import { useTestingDashboard } from '@/contexts/TestingDashboardContext';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { getRankColorClass } from '@/utils/achievementUtils';

interface TestRequirementsTabProps {
  userId: string;
}

const TestRequirementsTab: React.FC<TestRequirementsTabProps> = ({ userId }) => {
  const { 
    allAchievements, 
    userAchievements,
    expandedCategories,
    toggleCategoryExpansion,
    simulateAchievement
  } = useTestingDashboard();
  
  const [selectedAchievement, setSelectedAchievement] = useState<string | null>(null);
  
  // Group achievements by category
  const achievementsByCategory = allAchievements.reduce((acc, achievement) => {
    if (!acc[achievement.category]) {
      acc[achievement.category] = [];
    }
    acc[achievement.category].push(achievement);
    return acc;
  }, {} as Record<string, typeof allAchievements>);
  
  // Get selected achievement details
  const achievementDetail = selectedAchievement 
    ? allAchievements.find(a => a.id === selectedAchievement) 
    : null;
  
  const isUnlocked = selectedAchievement 
    ? userAchievements[selectedAchievement]?.isUnlocked || false
    : false;
  
  return (
    <div className="space-y-4">
      <Alert className="bg-arcane-15 border-arcane-30">
        <BookOpen className="h-4 w-4 text-arcane" />
        <AlertTitle>Achievement Requirements Analyzer</AlertTitle>
        <AlertDescription>
          Understand exactly what it takes to earn each achievement. Compare user progress against requirements.
        </AlertDescription>
      </Alert>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-lg font-orbitron">Achievement List</CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <ScrollArea className="h-[600px]">
                <div className="p-3 space-y-1">
                  {Object.entries(achievementsByCategory).map(([category, achievements]) => (
                    <Collapsible 
                      key={category}
                      open={expandedCategories.has(category)}
                      onOpenChange={() => toggleCategoryExpansion(category)}
                    >
                      <div className="flex items-center justify-between">
                        <CollapsibleTrigger asChild>
                          <Button 
                            variant="ghost" 
                            className="flex items-center justify-start w-full p-2 text-left"
                          >
                            {expandedCategories.has(category) ? 
                              <ChevronDown className="mr-2 h-4 w-4" /> : 
                              <ChevronRight className="mr-2 h-4 w-4" />}
                            <span className="font-semibold capitalize">{category}</span>
                            <Badge variant="outline" className="ml-2">
                              {achievements.length}
                            </Badge>
                          </Button>
                        </CollapsibleTrigger>
                      </div>
                      
                      <CollapsibleContent>
                        <div className="pl-6 space-y-1">
                          {achievements.map(achievement => {
                            const isSelected = selectedAchievement === achievement.id;
                            const isAchieved = userAchievements[achievement.id]?.isUnlocked || false;
                            
                            return (
                              <div
                                key={achievement.id}
                                className={`p-2 rounded-md cursor-pointer ${
                                  isSelected 
                                    ? 'bg-arcane-15 border border-arcane-30' 
                                    : 'hover:bg-midnight-elevated'
                                }`}
                                onClick={() => setSelectedAchievement(achievement.id)}
                              >
                                <div className="flex items-center justify-between">
                                  <div>
                                    <div className="flex items-center">
                                      <h4 className="font-medium text-sm mr-2">{achievement.name}</h4>
                                      <Badge 
                                        variant="outline" 
                                        className={`px-1 py-0 text-xs ${getRankColorClass(achievement.rank)}`}
                                      >
                                        {achievement.rank}
                                      </Badge>
                                      
                                      {isAchieved && (
                                        <Badge 
                                          variant="outline" 
                                          className="ml-1 px-1 py-0 text-xs bg-green-900/20 text-green-500 border-green-900/30"
                                        >
                                          Unlocked
                                        </Badge>
                                      )}
                                    </div>
                                    <p className="text-xs text-text-secondary truncate">
                                      {achievement.description}
                                    </p>
                                  </div>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      </CollapsibleContent>
                    </Collapsible>
                  ))}
                </div>
              </ScrollArea>
            </CardContent>
          </Card>
        </div>
        
        <div className="lg:col-span-2">
          {selectedAchievement && achievementDetail ? (
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-lg font-orbitron flex items-center">
                  <Trophy className="mr-2 h-5 w-5 text-arcane" />
                  Achievement Requirements
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-2 md:gap-4">
                  <div>
                    <h2 className="text-xl font-bold">{achievementDetail.name}</h2>
                    <p className="text-text-secondary">{achievementDetail.description}</p>
                  </div>
                  
                  <div className="flex flex-col items-end gap-2">
                    <div className="flex items-center space-x-2">
                      <Badge 
                        variant="outline" 
                        className={getRankColorClass(achievementDetail.rank)}
                      >
                        Rank {achievementDetail.rank}
                      </Badge>
                      
                      <Badge 
                        variant="outline" 
                        className="capitalize"
                      >
                        {achievementDetail.category}
                      </Badge>
                      
                      {isUnlocked ? (
                        <Badge 
                          variant="outline" 
                          className="bg-green-900/20 text-green-500 border-green-900/30"
                        >
                          Unlocked
                        </Badge>
                      ) : (
                        <Badge 
                          variant="outline" 
                          className="bg-gray-900/20 text-gray-500 border-gray-900/30"
                        >
                          Locked
                        </Badge>
                      )}
                    </div>
                    
                    <Button 
                      variant="outline" 
                      size="sm" 
                      onClick={() => simulateAchievement(achievementDetail.id)}
                    >
                      Simulate
                    </Button>
                  </div>
                </div>
                
                <div className="border border-divider/30 rounded-md p-3 bg-midnight-elevated">
                  <h3 className="font-semibold mb-2 flex items-center">
                    <Calculator className="h-4 w-4 mr-2 text-arcane" />
                    Requirements Analysis
                  </h3>
                  
                  <div className="space-y-3">
                    {/* Main requirement */}
                    <div className="space-y-1">
                      <h4 className="text-sm font-medium">Primary Requirement</h4>
                      <div className="bg-midnight-card p-2 rounded-md">
                        <div className="flex justify-between items-center">
                          <span className="text-sm">
                            {achievementDetail.requirements.type === 'workout_count' && (
                              <>Complete {achievementDetail.requirements.value} workouts</>
                            )}
                            {achievementDetail.requirements.type === 'streak' && (
                              <>Maintain a streak of {achievementDetail.requirements.value} days</>
                            )}
                            {achievementDetail.requirements.type === 'pr_count' && (
                              <>Set {achievementDetail.requirements.value} personal records</>
                            )}
                            {achievementDetail.requirements.type === 'manual_workouts' && (
                              <>Submit {achievementDetail.requirements.value} manual workouts</>
                            )}
                            {achievementDetail.requirements.type === 'level' && (
                              <>Reach level {achievementDetail.requirements.value}</>
                            )}
                            {achievementDetail.requirements.type === 'join_guild' && (
                              <>Join a guild</>
                            )}
                          </span>
                          <span className="text-xs text-text-tertiary">
                            {achievementDetail.requirements.type.replace('_', ' ')}
                          </span>
                        </div>
                        
                        {/* Progress bar placeholder - in a real implementation, you'd show actual progress */}
                        <div className="w-full h-2 bg-midnight-base rounded-full overflow-hidden mt-2">
                          <div 
                            className={`h-full ${isUnlocked ? 'bg-green-500' : 'bg-arcane'}`}
                            style={{ width: isUnlocked ? '100%' : '30%' }}
                          />
                        </div>
                      </div>
                    </div>
                    
                    {/* Additional conditions */}
                    <div className="space-y-1">
                      <h4 className="text-sm font-medium">Additional Conditions</h4>
                      <div className="bg-midnight-card p-2 rounded-md">
                        {achievementDetail.requirements.metadata ? (
                          <div className="space-y-2">
                            {Object.entries(achievementDetail.requirements.metadata).map(([key, value]) => (
                              <div key={key} className="flex justify-between items-center">
                                <span className="text-sm capitalize">{key.replace('_', ' ')}</span>
                                <span className="text-sm">{value?.toString()}</span>
                              </div>
                            ))}
                          </div>
                        ) : (
                          <p className="text-sm text-text-tertiary">No additional conditions</p>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="border border-divider/30 rounded-md p-3 bg-midnight-elevated">
                    <h3 className="font-semibold mb-2">Reward</h3>
                    <div className="space-y-2">
                      <div className="flex justify-between items-center">
                        <span className="text-sm">XP</span>
                        <span className="text-sm text-arcane font-semibold">
                          +{achievementDetail.xpReward} XP
                        </span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-sm">Achievement Points</span>
                        <span className="text-sm font-semibold">
                          {achievementDetail.points} points
                        </span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="border border-divider/30 rounded-md p-3 bg-midnight-elevated">
                    <h3 className="font-semibold mb-2">Actions to Earn</h3>
                    <div className="space-y-2">
                      <Button 
                        variant="outline" 
                        size="sm" 
                        className="w-full justify-start"
                      >
                        Generate Test Data
                      </Button>
                      <Button 
                        variant="outline" 
                        size="sm" 
                        className="w-full justify-start"
                      >
                        Run Test for This Achievement
                      </Button>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ) : (
            <Card>
              <CardContent className="p-8 flex flex-col items-center justify-center text-center">
                <Trophy className="h-12 w-12 text-text-tertiary mb-4" />
                <h3 className="text-lg font-semibold mb-2">Select an Achievement</h3>
                <p className="text-text-secondary max-w-md">
                  Choose an achievement from the list to see detailed requirements, 
                  track progress, and understand what it takes to earn it.
                </p>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
};

export default TestRequirementsTab;
