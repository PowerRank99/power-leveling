
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  ListOrdered, Save, Play, Plus, X, 
  GripVertical, ChevronDown, ChevronUp, ListChecks
} from 'lucide-react';
import { useState } from 'react';
import { useTestingDashboard } from '@/contexts/TestingDashboardContext';
import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Achievement } from '@/types/achievementTypes';

// Define Test Sequence types
interface TestStep {
  id: string;
  type: 'achievement' | 'workout' | 'manual_workout' | 'pr' | 'guild' | 'class' | 'pause';
  config: Record<string, any>;
  description: string;
}

interface TestSequence {
  id: string;
  name: string;
  description: string;
  steps: TestStep[];
  createdAt: Date;
  lastRun?: Date;
}

const TestSequenceBuilder: React.FC = () => {
  const { allAchievements } = useTestingDashboard();
  const [activeTab, setActiveTab] = useState('builder');
  const [sequences, setSequences] = useState<TestSequence[]>(() => {
    const saved = localStorage.getItem('achievement-test-sequences');
    return saved ? JSON.parse(saved) : [];
  });
  const [currentSequence, setCurrentSequence] = useState<TestSequence>({
    id: crypto.randomUUID(),
    name: 'New Test Sequence',
    description: 'A custom test sequence',
    steps: [],
    createdAt: new Date()
  });
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [newStepType, setNewStepType] = useState<TestStep['type']>('achievement');
  
  // Save sequences to localStorage
  const saveSequences = (updatedSequences: TestSequence[]) => {
    localStorage.setItem('achievement-test-sequences', JSON.stringify(updatedSequences));
    setSequences(updatedSequences);
  };
  
  // Save current sequence
  const saveCurrentSequence = () => {
    const updatedSequences = sequences.filter(seq => seq.id !== currentSequence.id);
    updatedSequences.push({...currentSequence, createdAt: new Date()});
    saveSequences(updatedSequences);
  };
  
  // Load a sequence for editing
  const loadSequence = (sequence: TestSequence) => {
    setCurrentSequence(sequence);
    setActiveTab('builder');
  };
  
  // Create a new sequence
  const createNewSequence = () => {
    setCurrentSequence({
      id: crypto.randomUUID(),
      name: 'New Test Sequence',
      description: 'A custom test sequence',
      steps: [],
      createdAt: new Date()
    });
    setActiveTab('builder');
  };
  
  // Delete a sequence
  const deleteSequence = (id: string) => {
    const updatedSequences = sequences.filter(seq => seq.id !== id);
    saveSequences(updatedSequences);
    if (currentSequence.id === id) {
      createNewSequence();
    }
  };
  
  // Add a step to the sequence
  const addStep = (step: TestStep) => {
    setCurrentSequence(prev => ({
      ...prev,
      steps: [...prev.steps, step]
    }));
    setIsDialogOpen(false);
  };
  
  // Remove a step from the sequence
  const removeStep = (stepId: string) => {
    setCurrentSequence(prev => ({
      ...prev,
      steps: prev.steps.filter(step => step.id !== stepId)
    }));
  };
  
  // Handle drag and drop reordering
  const handleDragEnd = (result: any) => {
    if (!result.destination) return;
    
    const items = Array.from(currentSequence.steps);
    const [reorderedItem] = items.splice(result.source.index, 1);
    items.splice(result.destination.index, 0, reorderedItem);
    
    setCurrentSequence(prev => ({
      ...prev,
      steps: items
    }));
  };
  
  // Create a new step based on type
  const createNewStep = () => {
    let newStep: TestStep = {
      id: crypto.randomUUID(),
      type: newStepType,
      config: {},
      description: `New ${newStepType} step`
    };
    
    switch(newStepType) {
      case 'achievement':
        newStep.config = { achievementId: '' };
        break;
      case 'workout':
        newStep.config = { 
          exerciseCount: 3, 
          setCount: 3, 
          durationMinutes: 30 
        };
        break;
      case 'manual_workout':
        newStep.config = { 
          description: 'Manual workout',
          activityType: 'cardio',
          xpAwarded: 100
        };
        break;
      case 'pr':
        newStep.config = {
          exerciseId: '',
          weight: 100,
          previousWeight: 80
        };
        break;
      case 'guild':
        newStep.config = {
          action: 'join', // join, create, leave
          guildId: ''
        };
        break;
      case 'class':
        newStep.config = {
          className: 'Guerreiro'
        };
        break;
      case 'pause':
        newStep.config = {
          durationMs: 1000 // 1 second pause
        };
        break;
    }
    
    addStep(newStep);
  };
  
  // Render step configuration based on type
  const renderStepConfig = (step: TestStep, index: number) => {
    switch(step.type) {
      case 'achievement':
        return (
          <div className="space-y-2">
            <Label>Achievement</Label>
            <select 
              className="w-full p-2 rounded-md border border-divider/30 bg-midnight-card"
              value={step.config.achievementId}
              onChange={(e) => {
                const updatedSteps = [...currentSequence.steps];
                updatedSteps[index].config.achievementId = e.target.value;
                const achievement = allAchievements.find(a => a.id === e.target.value);
                if (achievement) {
                  updatedSteps[index].description = `Check achievement: ${achievement.name}`;
                }
                setCurrentSequence(prev => ({...prev, steps: updatedSteps}));
              }}
            >
              <option value="">Select an achievement</option>
              {allAchievements.map(achievement => (
                <option key={achievement.id} value={achievement.id}>
                  {achievement.name}
                </option>
              ))}
            </select>
          </div>
        );
      
      case 'workout':
        return (
          <div className="space-y-2">
            <div className="grid grid-cols-3 gap-2">
              <div>
                <Label>Exercises</Label>
                <Input 
                  type="number" 
                  min={1} 
                  max={10} 
                  value={step.config.exerciseCount} 
                  onChange={(e) => {
                    const updatedSteps = [...currentSequence.steps];
                    updatedSteps[index].config.exerciseCount = parseInt(e.target.value);
                    updatedSteps[index].description = `Simulate workout: ${e.target.value} exercises, ${updatedSteps[index].config.setCount} sets, ${updatedSteps[index].config.durationMinutes} min`;
                    setCurrentSequence(prev => ({...prev, steps: updatedSteps}));
                  }}
                />
              </div>
              <div>
                <Label>Sets</Label>
                <Input 
                  type="number" 
                  min={1} 
                  max={10} 
                  value={step.config.setCount} 
                  onChange={(e) => {
                    const updatedSteps = [...currentSequence.steps];
                    updatedSteps[index].config.setCount = parseInt(e.target.value);
                    updatedSteps[index].description = `Simulate workout: ${updatedSteps[index].config.exerciseCount} exercises, ${e.target.value} sets, ${updatedSteps[index].config.durationMinutes} min`;
                    setCurrentSequence(prev => ({...prev, steps: updatedSteps}));
                  }}
                />
              </div>
              <div>
                <Label>Duration (min)</Label>
                <Input 
                  type="number" 
                  min={5} 
                  max={120} 
                  value={step.config.durationMinutes} 
                  onChange={(e) => {
                    const updatedSteps = [...currentSequence.steps];
                    updatedSteps[index].config.durationMinutes = parseInt(e.target.value);
                    updatedSteps[index].description = `Simulate workout: ${updatedSteps[index].config.exerciseCount} exercises, ${updatedSteps[index].config.setCount} sets, ${e.target.value} min`;
                    setCurrentSequence(prev => ({...prev, steps: updatedSteps}));
                  }}
                />
              </div>
            </div>
          </div>
        );
      
      case 'pause':
        return (
          <div className="space-y-2">
            <Label>Pause Duration (ms)</Label>
            <Input 
              type="number" 
              min={100} 
              max={10000} 
              step={100}
              value={step.config.durationMs} 
              onChange={(e) => {
                const updatedSteps = [...currentSequence.steps];
                updatedSteps[index].config.durationMs = parseInt(e.target.value);
                updatedSteps[index].description = `Pause for ${parseInt(e.target.value)/1000} seconds`;
                setCurrentSequence(prev => ({...prev, steps: updatedSteps}));
              }}
            />
          </div>
        );
      
      // Additional config options for other step types can be added here
      
      default:
        return (
          <div className="text-text-secondary italic">
            No configuration needed for this step type
          </div>
        );
    }
  };
  
  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="flex items-center text-lg font-orbitron">
          <ListOrdered className="mr-2 h-5 w-5 text-arcane" />
          Test Sequence Builder
        </CardTitle>
      </CardHeader>
      
      <CardContent>
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="w-full mb-4">
            <TabsTrigger value="builder">Sequence Builder</TabsTrigger>
            <TabsTrigger value="saved">Saved Sequences ({sequences.length})</TabsTrigger>
          </TabsList>
          
          <TabsContent value="builder" className="space-y-4">
            <div className="space-y-2">
              <Label>Sequence Name</Label>
              <Input 
                value={currentSequence.name}
                onChange={(e) => setCurrentSequence(prev => ({...prev, name: e.target.value}))}
                placeholder="Enter sequence name"
              />
            </div>
            
            <div className="space-y-2">
              <Label>Description</Label>
              <Textarea 
                value={currentSequence.description}
                onChange={(e) => setCurrentSequence(prev => ({...prev, description: e.target.value}))}
                placeholder="Describe what this test sequence does"
              />
            </div>
            
            <div className="pt-2">
              <Label>Steps</Label>
              <DragDropContext onDragEnd={handleDragEnd}>
                <Droppable droppableId="steps">
                  {(provided) => (
                    <div
                      className="space-y-2 min-h-[200px] border border-divider/30 rounded-md p-2 mt-2"
                      {...provided.droppableProps}
                      ref={provided.innerRef}
                    >
                      {currentSequence.steps.length === 0 ? (
                        <div className="flex flex-col items-center justify-center h-[100px] text-text-secondary">
                          <p>No steps added yet</p>
                          <p className="text-xs">Click "Add Step" to create a test sequence</p>
                        </div>
                      ) : (
                        currentSequence.steps.map((step, index) => (
                          <Draggable key={step.id} draggableId={step.id} index={index}>
                            {(provided) => (
                              <div
                                ref={provided.innerRef}
                                {...provided.draggableProps}
                                className="border border-divider/30 rounded-md p-3 bg-midnight-card"
                              >
                                <div className="flex justify-between items-start mb-2">
                                  <div className="flex items-center">
                                    <div
                                      {...provided.dragHandleProps}
                                      className="mr-2 cursor-grab"
                                    >
                                      <GripVertical className="h-4 w-4 text-text-tertiary" />
                                    </div>
                                    <div>
                                      <div className="font-medium flex items-center">
                                        <Badge className="mr-2 capitalize">
                                          {step.type.replace('_', ' ')}
                                        </Badge>
                                        <span>Step {index + 1}</span>
                                      </div>
                                      <div className="text-xs text-text-secondary mt-1">
                                        {step.description}
                                      </div>
                                    </div>
                                  </div>
                                  <Button
                                    variant="ghost"
                                    size="icon"
                                    onClick={() => removeStep(step.id)}
                                  >
                                    <X className="h-4 w-4" />
                                  </Button>
                                </div>
                                
                                <div className="pl-6">
                                  {renderStepConfig(step, index)}
                                </div>
                              </div>
                            )}
                          </Draggable>
                        ))
                      )}
                      {provided.placeholder}
                    </div>
                  )}
                </Droppable>
              </DragDropContext>
              
              <div className="mt-4 flex justify-between">
                <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                  <DialogTrigger asChild>
                    <Button variant="outline">
                      <Plus className="mr-1 h-4 w-4" />
                      Add Step
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Add Sequence Step</DialogTitle>
                      <DialogDescription>
                        Select the type of step to add to your test sequence
                      </DialogDescription>
                    </DialogHeader>
                    
                    <div className="grid grid-cols-2 gap-2 py-4">
                      <Button
                        variant={newStepType === 'achievement' ? 'arcane' : 'outline'}
                        onClick={() => setNewStepType('achievement')}
                        className="justify-start h-auto py-3"
                      >
                        <div className="text-left">
                          <div className="font-medium">Achievement Check</div>
                          <div className="text-xs text-text-secondary mt-1">
                            Check if an achievement is unlocked
                          </div>
                        </div>
                      </Button>
                      
                      <Button
                        variant={newStepType === 'workout' ? 'arcane' : 'outline'}
                        onClick={() => setNewStepType('workout')}
                        className="justify-start h-auto py-3"
                      >
                        <div className="text-left">
                          <div className="font-medium">Simulate Workout</div>
                          <div className="text-xs text-text-secondary mt-1">
                            Create a workout with custom parameters
                          </div>
                        </div>
                      </Button>
                      
                      <Button
                        variant={newStepType === 'manual_workout' ? 'arcane' : 'outline'}
                        onClick={() => setNewStepType('manual_workout')}
                        className="justify-start h-auto py-3"
                      >
                        <div className="text-left">
                          <div className="font-medium">Manual Workout</div>
                          <div className="text-xs text-text-secondary mt-1">
                            Add a manual workout submission
                          </div>
                        </div>
                      </Button>
                      
                      <Button
                        variant={newStepType === 'pr' ? 'arcane' : 'outline'}
                        onClick={() => setNewStepType('pr')}
                        className="justify-start h-auto py-3"
                      >
                        <div className="text-left">
                          <div className="font-medium">Personal Record</div>
                          <div className="text-xs text-text-secondary mt-1">
                            Create a personal record for an exercise
                          </div>
                        </div>
                      </Button>
                      
                      <Button
                        variant={newStepType === 'guild' ? 'arcane' : 'outline'}
                        onClick={() => setNewStepType('guild')}
                        className="justify-start h-auto py-3"
                      >
                        <div className="text-left">
                          <div className="font-medium">Guild Action</div>
                          <div className="text-xs text-text-secondary mt-1">
                            Join, create or leave a guild
                          </div>
                        </div>
                      </Button>
                      
                      <Button
                        variant={newStepType === 'class' ? 'arcane' : 'outline'}
                        onClick={() => setNewStepType('class')}
                        className="justify-start h-auto py-3"
                      >
                        <div className="text-left">
                          <div className="font-medium">Change Class</div>
                          <div className="text-xs text-text-secondary mt-1">
                            Change character class
                          </div>
                        </div>
                      </Button>
                      
                      <Button
                        variant={newStepType === 'pause' ? 'arcane' : 'outline'}
                        onClick={() => setNewStepType('pause')}
                        className="justify-start h-auto py-3"
                      >
                        <div className="text-left">
                          <div className="font-medium">Pause</div>
                          <div className="text-xs text-text-secondary mt-1">
                            Add a delay between steps
                          </div>
                        </div>
                      </Button>
                    </div>
                    
                    <DialogFooter>
                      <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
                        Cancel
                      </Button>
                      <Button onClick={createNewStep}>
                        Add Step
                      </Button>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>
                
                <div className="space-x-2">
                  <Button 
                    variant="outline"
                    onClick={createNewSequence}
                  >
                    New Sequence
                  </Button>
                  <Button
                    onClick={saveCurrentSequence}
                    disabled={currentSequence.steps.length === 0}
                  >
                    <Save className="mr-1 h-4 w-4" />
                    Save Sequence
                  </Button>
                </div>
              </div>
            </div>
          </TabsContent>
          
          <TabsContent value="saved">
            <div className="space-y-2">
              {sequences.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-[200px] text-text-secondary">
                  <p>No saved sequences</p>
                  <Button 
                    variant="outline" 
                    onClick={createNewSequence}
                    className="mt-2"
                  >
                    <Plus className="mr-1 h-4 w-4" />
                    Create New Sequence
                  </Button>
                </div>
              ) : (
                <ScrollArea className="h-[300px]">
                  <div className="space-y-2">
                    {sequences.map(sequence => (
                      <Card key={sequence.id} className="p-4">
                        <div className="flex justify-between items-start">
                          <div>
                            <h3 className="font-semibold">{sequence.name}</h3>
                            <p className="text-xs text-text-secondary">{sequence.description}</p>
                            <div className="flex items-center space-x-2 mt-1">
                              <Badge variant="outline">{sequence.steps.length} steps</Badge>
                              {sequence.lastRun && (
                                <span className="text-xs text-text-tertiary">
                                  Last run: {new Date(sequence.lastRun).toLocaleDateString()}
                                </span>
                              )}
                            </div>
                          </div>
                          <div className="flex space-x-1">
                            <Button 
                              variant="outline" 
                              size="sm"
                              onClick={() => loadSequence(sequence)}
                            >
                              Edit
                            </Button>
                            <Button 
                              variant="outline" 
                              size="sm"
                              onClick={() => deleteSequence(sequence.id)}
                            >
                              Delete
                            </Button>
                            <Button 
                              variant="arcane" 
                              size="sm"
                            >
                              <Play className="h-3 w-3 mr-1" />
                              Run
                            </Button>
                          </div>
                        </div>
                      </Card>
                    ))}
                  </div>
                </ScrollArea>
              )}
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
};

export default TestSequenceBuilder;
