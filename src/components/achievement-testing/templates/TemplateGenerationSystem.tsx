import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { 
  Tabs, TabsContent, TabsList, TabsTrigger 
} from '@/components/ui/tabs';
import { 
  FileText, Save, Play, Plus, LayoutTemplate, 
  Calendar, Copy, Filter, Edit, Settings 
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { toast } from 'sonner';
import { useTestingDashboard } from '@/contexts/TestingDashboardContext';
import { testDataGenerator } from '@/services/testing/generators/TestDataGeneratorService';
import { CharacterClass } from '@/services/testing/generators/ClassGenerator';
import { supabaseClient } from '@/lib/supabase';

// Define test data template types
interface DataTemplate {
  id: string;
  name: string;
  description: string;
  type: 'preset' | 'custom';
  category: 'workout' | 'streak' | 'pr' | 'class' | 'activity' | 'guild' | 'mixed';
  config: Record<string, any>;
  tags: string[];
  createdAt: Date;
  lastRun?: Date;
}

// Predefined templates
const PRESET_TEMPLATES: DataTemplate[] = [
  {
    id: 'new-user-journey',
    name: 'New User Journey',
    description: 'Creates a complete dataset for a new user getting started',
    type: 'preset',
    category: 'mixed',
    tags: ['beginner', 'onboarding', 'first-week'],
    config: {
      workouts: { count: 5, consecutive: false },
      streak: { days: 3 },
      prs: { count: 2 },
      class: { sequence: ['Guerreiro'] }
    },
    createdAt: new Date()
  },
  {
    id: 'streak-master',
    name: 'Streak Master',
    description: 'Simulates a dedicated user with a long workout streak',
    type: 'preset',
    category: 'streak',
    tags: ['streak', 'consistency', 'dedicated'],
    config: {
      streak: { days: 7 },
      workouts: { count: 7, consecutive: true }
    },
    createdAt: new Date()
  },
  {
    id: 'pr-progression',
    name: 'PR Progression',
    description: 'Simulates a user setting multiple PRs over time',
    type: 'preset',
    category: 'pr',
    tags: ['personal-record', 'strength', 'progression'],
    config: {
      prs: { 
        count: 5,
        progression: true,
        progressionType: 'linear',
        steps: 3
      }
    },
    createdAt: new Date()
  },
  {
    id: 'class-explorer',
    name: 'Class Explorer',
    description: 'Simulates a user trying different character classes',
    type: 'preset',
    category: 'class',
    tags: ['class', 'variety', 'exploration'],
    config: {
      class: { 
        sequence: ['Guerreiro', 'Monge', 'Ninja', 'Bruxo', 'Paladino'], 
        daysBetweenChanges: 20,
        bypassCooldown: true
      }
    },
    createdAt: new Date()
  },
  {
    id: 'guild-experience',
    name: 'Guild Experience',
    description: 'Simulates a user creating and participating in guilds',
    type: 'preset',
    category: 'guild',
    tags: ['guild', 'social', 'community'],
    config: {
      guild: { 
        createGuild: true,
        joinGuilds: 2,
        participateInRaid: true
      }
    },
    createdAt: new Date()
  },
  {
    id: 'power-day-champion',
    name: 'Power Day Champion',
    description: 'Simulates a user maximizing Power Days',
    type: 'preset',
    category: 'activity',
    tags: ['power-day', 'optimizing', 'xp-gain'],
    config: {
      activities: { 
        count: 4,
        includePowerDays: true,
        powerDayCount: 2
      }
    },
    createdAt: new Date()
  }
];

const TemplateGenerationSystem: React.FC = () => {
  const { userId } = useTestingDashboard();
  const [activeTab, setActiveTab] = useState('templates');
  const [templates, setTemplates] = useState<DataTemplate[]>(() => {
    const savedTemplates = localStorage.getItem('test-data-templates');
    const customTemplates = savedTemplates ? JSON.parse(savedTemplates) : [];
    
    return [...PRESET_TEMPLATES, ...customTemplates];
  });
  
  const [currentTemplate, setCurrentTemplate] = useState<DataTemplate | null>(null);
  const [editMode, setEditMode] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  
  const allTags = React.useMemo(() => {
    const tagSet = new Set<string>();
    templates.forEach(template => {
      template.tags.forEach(tag => tagSet.add(tag));
    });
    return Array.from(tagSet);
  }, [templates]);
  
  const filteredTemplates = React.useMemo(() => {
    return templates.filter(template => {
      const matchesSearch = 
        searchQuery === '' || 
        template.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        template.description.toLowerCase().includes(searchQuery.toLowerCase());
      
      const matchesTags = 
        selectedTags.length === 0 || 
        selectedTags.some(tag => template.tags.includes(tag));
      
      return matchesSearch && matchesTags;
    });
  }, [templates, searchQuery, selectedTags]);
  
  const templatesByCategory = React.useMemo(() => {
    const grouped: Record<string, DataTemplate[]> = {
      mixed: [],
      workout: [],
      streak: [],
      pr: [],
      class: [],
      activity: [],
      guild: []
    };
    
    filteredTemplates.forEach(template => {
      if (grouped[template.category]) {
        grouped[template.category].push(template);
      } else {
        grouped.mixed.push(template);
      }
    });
    
    return Object.fromEntries(
      Object.entries(grouped).filter(([_, templates]) => templates.length > 0)
    );
  }, [filteredTemplates]);
  
  const saveTemplates = (updatedTemplates: DataTemplate[]) => {
    const customTemplates = updatedTemplates.filter(t => t.type === 'custom');
    localStorage.setItem('test-data-templates', JSON.stringify(customTemplates));
    
    setTemplates([...PRESET_TEMPLATES, ...customTemplates]);
  };
  
  const createTemplate = () => {
    const newTemplate: DataTemplate = {
      id: crypto.randomUUID(),
      name: 'New Template',
      description: 'Custom data generation template',
      type: 'custom',
      category: 'mixed',
      config: {},
      tags: ['custom'],
      createdAt: new Date()
    };
    
    setCurrentTemplate(newTemplate);
    setEditMode(true);
    setActiveTab('editor');
  };
  
  const saveTemplate = () => {
    if (!currentTemplate) return;
    
    const updatedTemplates = templates.filter(t => t.id !== currentTemplate.id);
    updatedTemplates.push(currentTemplate);
    
    saveTemplates(updatedTemplates);
    setEditMode(false);
    toast.success('Template saved successfully');
  };
  
  const editTemplate = (template: DataTemplate) => {
    setCurrentTemplate({...template});
    setEditMode(true);
    setActiveTab('editor');
  };
  
  const deleteTemplate = (templateId: string) => {
    const updatedTemplates = templates.filter(t => t.id !== templateId);
    saveTemplates(updatedTemplates);
    
    if (currentTemplate?.id === templateId) {
      setCurrentTemplate(null);
      setEditMode(false);
    }
    
    toast.success('Template deleted');
  };
  
  const duplicateTemplate = (template: DataTemplate) => {
    const newTemplate: DataTemplate = {
      ...template,
      id: crypto.randomUUID(),
      name: `${template.name} (Copy)`,
      type: 'custom',
      createdAt: new Date()
    };
    
    const updatedTemplates = [...templates, newTemplate];
    saveTemplates(updatedTemplates);
    toast.success('Template duplicated');
  };
  
  const runTemplate = async (template: DataTemplate) => {
    if (!userId) {
      toast.error('User ID is required');
      return;
    }
    
    setIsGenerating(true);
    
    try {
      const generators = testDataGenerator.getGenerators();
      
      if (template.category === 'workout' || template.category === 'mixed') {
        if (template.config.workouts) {
          await generators.workout.generateWorkoutSeries(userId, {
            count: template.config.workouts.count || 3,
            consecutive: template.config.workouts.consecutive || false,
            startDate: template.config.workouts.startDate ? new Date(template.config.workouts.startDate) : undefined,
            testDataTag: `template-${template.id}`
          });
        }
      }
      
      if (template.category === 'streak' || template.category === 'mixed') {
        if (template.config.streak) {
          await generators.streak.generateStreak(userId, template.config.streak.days || 3, {
            startDate: new Date(),
            testDataTag: `template-${template.id}`
          });
        }
      }
      
      if (template.category === 'pr' || template.category === 'mixed') {
        if (template.config.prs) {
          const exerciseCount = template.config.prs.count || 2;
          const withProgression = template.config.prs.progression || false;
          
          const { data: exercises } = await supabaseClient
            .from('exercises')
            .select('id')
            .limit(exerciseCount);
            
          if (exercises && exercises.length > 0) {
            const exerciseIds = exercises.map(e => e.id);
            
            await generators.pr.generatePRsForMultipleExercises(userId, {
              exerciseIds,
              withProgression,
              progressionOptions: withProgression ? {
                steps: template.config.prs.steps || 3,
                progressionType: template.config.prs.progressionType || 'linear'
              } : undefined,
              testDataTag: `template-${template.id}`
            });
          }
        }
      }
      
      if (template.category === 'class' || template.category === 'mixed') {
        if (template.config.class) {
          const classSequence = template.config.class.sequence || [CharacterClass.GUERREIRO];
          
          await generators.class.simulateClassChangeHistory(userId, {
            sequence: classSequence,
            daysBetweenChanges: template.config.class.daysBetweenChanges || 15,
            bypassCooldown: template.config.class.bypassCooldown || false,
            testDataTag: `template-${template.id}`
          });
        }
      }
      
      if (template.category === 'activity' || template.category === 'mixed') {
        if (template.config.activities) {
          await generators.activity.generateActivityMix(userId, {
            count: template.config.activities.count || 3,
            includePowerDays: template.config.activities.includePowerDays || false,
            testDataTag: `template-${template.id}`
          });
        }
      }
      
      const updatedTemplate = {...template, lastRun: new Date()};
      const updatedTemplates = templates.map(t => 
        t.id === template.id ? updatedTemplate : t
      );
      
      saveTemplates(updatedTemplates);
      
      toast.success('Test data generated successfully');
    } catch (error) {
      console.error('Error generating test data:', error);
      toast.error('Failed to generate test data', { 
        description: error instanceof Error ? error.message : 'Unknown error' 
      });
    } finally {
      setIsGenerating(false);
    }
  };
  
  const toggleTag = (tag: string) => {
    if (selectedTags.includes(tag)) {
      setSelectedTags(selectedTags.filter(t => t !== tag));
    } else {
      setSelectedTags([...selectedTags, tag]);
    }
  };
  
  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="flex items-center text-lg font-orbitron">
          <LayoutTemplate className="mr-2 h-5 w-5 text-arcane" />
          Template Generation System
        </CardTitle>
      </CardHeader>
      
      <CardContent>
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="w-full mb-4">
            <TabsTrigger value="templates">Template Library</TabsTrigger>
            <TabsTrigger value="editor">Template Editor</TabsTrigger>
            <TabsTrigger value="scheduler">Schedule Generation</TabsTrigger>
          </TabsList>
          
          <TabsContent value="templates" className="space-y-4">
            <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-2">
              <div className="relative flex-1">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Filter className="h-4 w-4 text-text-tertiary" />
                </div>
                <Input
                  type="text"
                  placeholder="Search templates..."
                  className="pl-10"
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                />
              </div>
              
              <Button 
                variant="outline"
                onClick={createTemplate}
              >
                <Plus className="mr-1 h-4 w-4" />
                New Template
              </Button>
            </div>
            
            {allTags.length > 0 && (
              <div className="flex flex-wrap gap-1">
                {allTags.map(tag => (
                  <Badge
                    key={tag}
                    variant={selectedTags.includes(tag) ? "arcane" : "outline"}
                    className="cursor-pointer"
                    onClick={() => toggleTag(tag)}
                  >
                    {tag}
                  </Badge>
                ))}
                {selectedTags.length > 0 && (
                  <Button 
                    variant="ghost" 
                    size="sm"
                    onClick={() => setSelectedTags([])}
                    className="text-xs h-6"
                  >
                    Clear
                  </Button>
                )}
              </div>
            )}
            
            {Object.keys(templatesByCategory).length === 0 ? (
              <div className="flex flex-col items-center justify-center h-[200px] text-text-secondary">
                <p>No templates match your criteria</p>
              </div>
            ) : (
              <ScrollArea className="h-[400px]">
                <Accordion type="multiple" className="w-full">
                  {Object.entries(templatesByCategory).map(([category, categoryTemplates]) => (
                    <AccordionItem key={category} value={category}>
                      <AccordionTrigger className="capitalize">
                        {category} Templates ({categoryTemplates.length})
                      </AccordionTrigger>
                      <AccordionContent>
                        <div className="space-y-2 pt-2">
                          {categoryTemplates.map(template => (
                            <Card key={template.id} className="p-4">
                              <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-2">
                                <div>
                                  <div className="flex items-center">
                                    <h3 className="font-semibold">{template.name}</h3>
                                    {template.type === 'preset' && (
                                      <Badge variant="outline" className="ml-2">Preset</Badge>
                                    )}
                                  </div>
                                  <p className="text-xs text-text-secondary mt-1">{template.description}</p>
                                  
                                  <div className="flex flex-wrap gap-1 mt-2">
                                    {template.tags.map(tag => (
                                      <Badge key={tag} variant="outline" className="text-xs">
                                        {tag}
                                      </Badge>
                                    ))}
                                  </div>
                                  
                                  {template.lastRun && (
                                    <div className="text-xs text-text-tertiary mt-2">
                                      Last run: {new Date(template.lastRun).toLocaleDateString()}
                                    </div>
                                  )}
                                </div>
                                
                                <div className="flex space-x-1 self-end sm:self-start">
                                  {template.type === 'custom' && (
                                    <>
                                      <Button 
                                        variant="outline" 
                                        size="sm"
                                        onClick={() => editTemplate(template)}
                                      >
                                        <Edit className="h-3 w-3 mr-1" />
                                        Edit
                                      </Button>
                                      <Button 
                                        variant="outline" 
                                        size="sm"
                                        onClick={() => deleteTemplate(template.id)}
                                      >
                                        Delete
                                      </Button>
                                    </>
                                  )}
                                  
                                  <Button 
                                    variant="outline" 
                                    size="sm"
                                    onClick={() => duplicateTemplate(template)}
                                  >
                                    <Copy className="h-3 w-3 mr-1" />
                                    Duplicate
                                  </Button>
                                  
                                  <Button 
                                    variant="arcane" 
                                    size="sm"
                                    onClick={() => runTemplate(template)}
                                    disabled={isGenerating}
                                  >
                                    <Play className="h-3 w-3 mr-1" />
                                    Run
                                  </Button>
                                </div>
                              </div>
                            </Card>
                          ))}
                        </div>
                      </AccordionContent>
                    </AccordionItem>
                  ))}
                </Accordion>
              </ScrollArea>
            )}
          </TabsContent>
          
          <TabsContent value="editor">
            {!currentTemplate ? (
              <div className="flex flex-col items-center justify-center h-[300px] text-text-secondary">
                <p>No template selected</p>
                <Button 
                  variant="outline" 
                  className="mt-4"
                  onClick={createTemplate}
                >
                  <Plus className="mr-1 h-4 w-4" />
                  Create New Template
                </Button>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <h3 className="text-lg font-medium">
                    {editMode ? 'Edit Template' : 'Template Details'}
                  </h3>
                  <div className="space-x-2">
                    {!editMode ? (
                      <Button 
                        variant="outline"
                        onClick={() => setEditMode(true)}
                        disabled={currentTemplate.type === 'preset'}
                      >
                        <Edit className="mr-1 h-4 w-4" />
                        Edit
                      </Button>
                    ) : (
                      <>
                        <Button 
                          variant="outline"
                          onClick={() => {
                            setEditMode(false);
                            const savedTemplate = templates.find(t => t.id === currentTemplate.id);
                            if (savedTemplate) {
                              setCurrentTemplate(savedTemplate);
                            }
                          }}
                        >
                          Cancel
                        </Button>
                        <Button 
                          onClick={saveTemplate}
                        >
                          <Save className="mr-1 h-4 w-4" />
                          Save Template
                        </Button>
                      </>
                    )}
                  </div>
                </div>
                
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="template-name">Template Name</Label>
                    <Input 
                      id="template-name"
                      value={currentTemplate.name}
                      onChange={e => setCurrentTemplate({...currentTemplate, name: e.target.value})}
                      disabled={!editMode}
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="template-description">Description</Label>
                    <Textarea 
                      id="template-description"
                      value={currentTemplate.description}
                      onChange={e => setCurrentTemplate({...currentTemplate, description: e.target.value})}
                      disabled={!editMode}
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="template-category">Category</Label>
                    <select
                      id="template-category"
                      className="w-full p-2 rounded-md border border-divider/30 bg-midnight-card"
                      value={currentTemplate.category}
                      onChange={e => setCurrentTemplate({...currentTemplate, category: e.target.value as DataTemplate['category']})}
                      disabled={!editMode}
                    >
                      <option value="mixed">Mixed</option>
                      <option value="workout">Workout</option>
                      <option value="streak">Streak</option>
                      <option value="pr">Personal Record</option>
                      <option value="class">Character Class</option>
                      <option value="activity">Activity</option>
                      <option value="guild">Guild</option>
                    </select>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="template-tags">Tags (comma separated)</Label>
                    <Input 
                      id="template-tags"
                      value={currentTemplate.tags.join(', ')}
                      onChange={e => setCurrentTemplate({
                        ...currentTemplate, 
                        tags: e.target.value.split(',').map(tag => tag.trim()).filter(Boolean)
                      })}
                      disabled={!editMode}
                      placeholder="custom, workout, streak, etc."
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label>Template Configuration</Label>
                    <div className="border border-divider/30 rounded-md p-4 space-y-4">
                      {currentTemplate.category === 'workout' || currentTemplate.category === 'mixed' ? (
                        <div className="space-y-2">
                          <h4 className="font-medium">Workout Settings</h4>
                          <div className="grid grid-cols-2 gap-2">
                            <div>
                              <Label htmlFor="workout-count">Number of Workouts</Label>
                              <Input 
                                id="workout-count"
                                type="number"
                                min={1}
                                max={30}
                                value={currentTemplate.config.workouts?.count || 3}
                                onChange={e => setCurrentTemplate({
                                  ...currentTemplate,
                                  config: {
                                    ...currentTemplate.config,
                                    workouts: {
                                      ...currentTemplate.config.workouts,
                                      count: parseInt(e.target.value)
                                    }
                                  }
                                })}
                                disabled={!editMode}
                              />
                            </div>
                            <div className="flex items-center pt-6">
                              <input 
                                type="checkbox"
                                id="workout-consecutive"
                                checked={currentTemplate.config.workouts?.consecutive || false}
                                onChange={e => setCurrentTemplate({
                                  ...currentTemplate,
                                  config: {
                                    ...currentTemplate.config,
                                    workouts: {
                                      ...currentTemplate.config.workouts,
                                      consecutive: e.target.checked
                                    }
                                  }
                                })}
                                disabled={!editMode}
                                className="mr-2"
                              />
                              <Label htmlFor="workout-consecutive">Consecutive Days</Label>
                            </div>
                          </div>
                        </div>
                      ) : null}
                      
                      {currentTemplate.category === 'streak' || currentTemplate.category === 'mixed' ? (
                        <div className="space-y-2">
                          <h4 className="font-medium">Streak Settings</h4>
                          <div>
                            <Label htmlFor="streak-days">Streak Length (days)</Label>
                            <Input 
                              id="streak-days"
                              type="number"
                              min={1}
                              max={30}
                              value={currentTemplate.config.streak?.days || 3}
                              onChange={e => setCurrentTemplate({
                                ...currentTemplate,
                                config: {
                                  ...currentTemplate.config,
                                  streak: {
                                    ...currentTemplate.config.streak,
                                    days: parseInt(e.target.value)
                                  }
                                }
                              })}
                              disabled={!editMode}
                            />
                          </div>
                        </div>
                      ) : null}
                      
                      {currentTemplate.category === 'pr' || currentTemplate.category === 'mixed' ? (
                        <div className="space-y-2">
                          <h4 className="font-medium">Personal Record Settings</h4>
                          <div className="grid grid-cols-2 gap-2">
                            <div>
                              <Label htmlFor="pr-count">Number of PRs</Label>
                              <Input 
                                id="pr-count"
                                type="number"
                                min={1}
                                max={10}
                                value={currentTemplate.config.prs?.count || 2}
                                onChange={e => setCurrentTemplate({
                                  ...currentTemplate,
                                  config: {
                                    ...currentTemplate.config,
                                    prs: {
                                      ...currentTemplate.config.prs,
                                      count: parseInt(e.target.value)
                                    }
                                  }
                                })}
                                disabled={!editMode}
                              />
                            </div>
                            <div className="flex items-center pt-6">
                              <input 
                                type="checkbox"
                                id="pr-progression"
                                checked={currentTemplate.config.prs?.progression || false}
                                onChange={e => setCurrentTemplate({
                                  ...currentTemplate,
                                  config: {
                                    ...currentTemplate.config,
                                    prs: {
                                      ...currentTemplate.config.prs,
                                      progression: e.target.checked
                                    }
                                  }
                                })}
                                disabled={!editMode}
                                className="mr-2"
                              />
                              <Label htmlFor="pr-progression">Show Progression</Label>
                            </div>
                          </div>
                        </div>
                      ) : null}
                      
                      {currentTemplate.category === 'class' || currentTemplate.category === 'mixed' ? (
                        <div className="space-y-2">
                          <h4 className="font-medium">Class Settings</h4>
                          <div>
                            <Label htmlFor="class-sequence">Class Sequence</Label>
                            <select
                              id="class-sequence"
                              multiple
                              className="w-full p-2 rounded-md border border-divider/30 bg-midnight-card h-24"
                              value={currentTemplate.config.class?.sequence || [CharacterClass.GUERREIRO]}
                              onChange={e => {
                                const selectedOptions = Array.from(e.target.selectedOptions, option => option.value);
                                setCurrentTemplate({
                                  ...currentTemplate,
                                  config: {
                                    ...currentTemplate.config,
                                    class: {
                                      ...currentTemplate.config.class,
                                      sequence: selectedOptions
                                    }
                                  }
                                });
                              }}
                              disabled={!editMode}
                            >
                              <option value={CharacterClass.GUERREIRO}>Guerreiro</option>
                              <option value={CharacterClass.MONGE}>Monge</option>
                              <option value={CharacterClass.NINJA}>Ninja</option>
                              <option value={CharacterClass.BRUXO}>Bruxo</option>
                              <option value={CharacterClass.PALADINO}>Paladino</option>
                              <option value={CharacterClass.DRUIDA}>Druida</option>
                            </select>
                            <p className="text-xs text-text-tertiary mt-1">
                              Hold Ctrl/Cmd to select multiple classes
                            </p>
                          </div>
                        </div>
                      ) : null}
                      
                      {currentTemplate.category === 'activity' || currentTemplate.category === 'mixed' ? (
                        <div className="space-y-2">
                          <h4 className="font-medium">Activity Settings</h4>
                          <div className="grid grid-cols-2 gap-2">
                            <div>
                              <Label htmlFor="activity-count">Number of Activities</Label>
                              <Input 
                                id="activity-count"
                                type="number"
                                min={1}
                                max={10}
                                value={currentTemplate.config.activities?.count || 3}
                                onChange={e => setCurrentTemplate({
                                  ...currentTemplate,
                                  config: {
                                    ...currentTemplate.config,
                                    activities: {
                                      ...currentTemplate.config.activities,
                                      count: parseInt(e.target.value)
                                    }
                                  }
                                })}
                                disabled={!editMode}
                              />
                            </div>
                            <div className="flex items-center pt-6">
                              <input 
                                type="checkbox"
                                id="include-power-days"
                                checked={currentTemplate.config.activities?.includePowerDays || false}
                                onChange={e => setCurrentTemplate({
                                  ...currentTemplate,
                                  config: {
                                    ...currentTemplate.config,
                                    activities: {
                                      ...currentTemplate.config.activities,
                                      includePowerDays: e.target.checked
                                    }
                                  }
                                })}
                                disabled={!editMode}
                                className="mr-2"
                              />
                              <Label htmlFor="include-power-days">Include Power Days</Label>
                            </div>
                          </div>
                        </div>
                      ) : null}
                      
                      {editMode && (
                        <div className="pt-4">
                          <Button variant="outline" size="sm">
                            <Settings className="h-4 w-4 mr-1" />
                            Advanced Configuration
                          </Button>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
                
                <div className="pt-4">
                  <Button 
                    variant="arcane"
                    onClick={() => runTemplate(currentTemplate)}
                    disabled={isGenerating}
                    className="w-full"
                  >
                    <Play className="mr-2 h-4 w-4" />
                    Generate Test Data
                  </Button>
                </div>
              </div>
            )}
          </TabsContent>
          
          <TabsContent value="scheduler">
            <div className="flex flex-col items-center justify-center h-[300px] text-text-secondary">
              <Calendar className="h-16 w-16 mb-4 text-text-tertiary" />
              <h3 className="text-lg font-medium">Scheduled Generation</h3>
              <p className="text-center max-w-md mt-2">
                Schedule template runs to automatically generate time-based test data. 
                Useful for testing achievements requiring specific date patterns.
              </p>
              <Button 
                variant="outline" 
                className="mt-4"
              >
                <Plus className="mr-1 h-4 w-4" />
                Create Schedule
              </Button>
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
};

export default TemplateGenerationSystem;
