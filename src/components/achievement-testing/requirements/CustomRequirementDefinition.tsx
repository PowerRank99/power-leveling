
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  Code, Save, Plus, X, CopyCheck, ListPlus, AlertCircle
} from 'lucide-react';
import { useTestingDashboard } from '@/contexts/TestingDashboardContext';
import { toast } from 'sonner';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';

// Custom requirement pattern types
interface RequirementPattern {
  id: string;
  name: string;
  description: string;
  requirementType: string;
  formula: string;
  examples: Array<{
    value: number;
    description: string;
  }>;
  createdAt: Date;
}

const CustomRequirementDefinition: React.FC = () => {
  const { allAchievements } = useTestingDashboard();
  
  // State for custom patterns
  const [patterns, setPatterns] = useState<RequirementPattern[]>(() => {
    const saved = localStorage.getItem('custom-requirement-patterns');
    return saved ? JSON.parse(saved) : [];
  });
  
  const [currentPattern, setCurrentPattern] = useState<RequirementPattern>({
    id: crypto.randomUUID(),
    name: '',
    description: '',
    requirementType: '',
    formula: '',
    examples: [{ value: 0, description: '' }],
    createdAt: new Date()
  });
  
  const [editMode, setEditMode] = useState(false);
  const [formulaError, setFormulaError] = useState<string | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  
  // Save patterns to localStorage
  const savePatterns = (updatedPatterns: RequirementPattern[]) => {
    localStorage.setItem('custom-requirement-patterns', JSON.stringify(updatedPatterns));
    setPatterns(updatedPatterns);
  };
  
  // Create a new pattern
  const createPattern = () => {
    setCurrentPattern({
      id: crypto.randomUUID(),
      name: '',
      description: '',
      requirementType: '',
      formula: '',
      examples: [{ value: 0, description: '' }],
      createdAt: new Date()
    });
    setEditMode(true);
    setFormulaError(null);
  };
  
  // Save the current pattern
  const savePattern = () => {
    if (!currentPattern.name || !currentPattern.requirementType) {
      toast.error('Name and type are required');
      return;
    }
    
    if (!validateFormula()) {
      return;
    }
    
    const updatedPatterns = patterns.filter(p => p.id !== currentPattern.id);
    updatedPatterns.push({
      ...currentPattern,
      createdAt: new Date()
    });
    
    savePatterns(updatedPatterns);
    setEditMode(false);
    toast.success('Pattern saved successfully');
  };
  
  // Edit a pattern
  const editPattern = (pattern: RequirementPattern) => {
    setCurrentPattern({...pattern});
    setEditMode(true);
    setFormulaError(null);
  };
  
  // Delete a pattern
  const deletePattern = (patternId: string) => {
    const updatedPatterns = patterns.filter(p => p.id !== patternId);
    savePatterns(updatedPatterns);
    
    if (currentPattern?.id === patternId) {
      createPattern();
    }
    
    toast.success('Pattern deleted');
  };
  
  // Add an example to the current pattern
  const addExample = () => {
    setCurrentPattern({
      ...currentPattern,
      examples: [
        ...currentPattern.examples,
        { value: 0, description: '' }
      ]
    });
  };
  
  // Remove an example from the current pattern
  const removeExample = (index: number) => {
    const updatedExamples = [...currentPattern.examples];
    updatedExamples.splice(index, 1);
    
    setCurrentPattern({
      ...currentPattern,
      examples: updatedExamples
    });
  };
  
  // Update an example
  const updateExample = (index: number, field: 'value' | 'description', value: any) => {
    const updatedExamples = [...currentPattern.examples];
    if (field === 'value') {
      updatedExamples[index].value = Number(value);
    } else {
      updatedExamples[index].description = value;
    }
    
    setCurrentPattern({
      ...currentPattern,
      examples: updatedExamples
    });
  };
  
  // Validate the formula
  const validateFormula = (): boolean => {
    if (!currentPattern.formula) {
      setFormulaError('Formula is required');
      return false;
    }
    
    try {
      // Simple test with level 1
      const testValue = 1;
      // Create a safe evaluation context
      const evalContext = {
        level: testValue,
        xp: testValue
      };
      
      // Replace variables with context values
      let formulaWithVars = currentPattern.formula
        .replace(/level/g, evalContext.level.toString())
        .replace(/xp/g, evalContext.xp.toString());
      
      // Basic security check for forbidden operations
      if (
        formulaWithVars.includes('window') || 
        formulaWithVars.includes('document') || 
        formulaWithVars.includes('fetch') ||
        formulaWithVars.includes('eval') ||
        formulaWithVars.includes('setTimeout') ||
        formulaWithVars.includes('setInterval')
      ) {
        setFormulaError('Formula contains forbidden operations');
        return false;
      }
      
      // Try to evaluate (this is a basic approach, could be improved)
      // eslint-disable-next-line no-new-func
      const result = Function('"use strict";return (' + formulaWithVars + ')')();
      
      if (typeof result !== 'number' || isNaN(result)) {
        setFormulaError('Formula must evaluate to a number');
        return false;
      }
      
      setFormulaError(null);
      return true;
    } catch (error) {
      setFormulaError(`Invalid formula: ${error instanceof Error ? error.message : 'Unknown error'}`);
      return false;
    }
  };
  
  // Apply pattern to achievement for preview
  const applyPatternToAchievement = (achievementId: string) => {
    const achievement = allAchievements.find(a => a.id === achievementId);
    if (!achievement) {
      toast.error('Achievement not found');
      return;
    }
    
    // Generate values for different levels
    const values = [];
    for (let level = 1; level <= 99; level += 10) {
      try {
        // Create evaluation context
        const evalContext = {
          level,
          xp: level * 100 // Simplified XP calculation for example
        };
        
        // Replace variables
        let formulaWithVars = currentPattern.formula
          .replace(/level/g, evalContext.level.toString())
          .replace(/xp/g, evalContext.xp.toString());
        
        // Evaluate
        // eslint-disable-next-line no-new-func
        const result = Function('"use strict";return (' + formulaWithVars + ')')();
        
        values.push({
          level,
          value: Math.round(result) // Round to nearest integer
        });
      } catch (error) {
        console.error('Formula evaluation error:', error);
      }
    }
    
    // Show preview dialog
    setIsDialogOpen(true);
  };
  
  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="flex items-center text-lg font-orbitron">
          <Code className="mr-2 h-5 w-5 text-arcane" />
          Custom Requirement Patterns
        </CardTitle>
      </CardHeader>
      
      <CardContent className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Pattern list */}
          <div className="md:col-span-1 space-y-2">
            <div className="flex justify-between items-center">
              <h3 className="font-medium">Saved Patterns</h3>
              <Button 
                variant="outline" 
                size="sm"
                onClick={createPattern}
              >
                <Plus className="h-3 w-3 mr-1" />
                New
              </Button>
            </div>
            
            <ScrollArea className="h-[400px] border border-divider/30 rounded-md p-2">
              {patterns.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-[200px] text-text-secondary">
                  <p>No patterns defined</p>
                  <p className="text-xs">Create a new pattern to get started</p>
                </div>
              ) : (
                <div className="space-y-2">
                  {patterns.map(pattern => (
                    <div 
                      key={pattern.id}
                      className={`p-2 border rounded-md cursor-pointer ${
                        currentPattern?.id === pattern.id 
                          ? 'border-arcane bg-arcane-15' 
                          : 'border-divider/30 hover:border-arcane-30'
                      }`}
                      onClick={() => editPattern(pattern)}
                    >
                      <div className="flex justify-between items-start">
                        <div>
                          <h4 className="font-medium">{pattern.name}</h4>
                          <div className="flex items-center mt-1">
                            <Badge variant="outline" className="text-xs">
                              {pattern.requirementType}
                            </Badge>
                          </div>
                        </div>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={(e) => {
                            e.stopPropagation();
                            deletePattern(pattern.id);
                          }}
                        >
                          <X className="h-3 w-3" />
                        </Button>
                      </div>
                      <p className="text-xs text-text-secondary mt-1 line-clamp-2">
                        {pattern.description}
                      </p>
                    </div>
                  ))}
                </div>
              )}
            </ScrollArea>
          </div>
          
          {/* Pattern editor */}
          <div className="md:col-span-2 space-y-4">
            <div className="flex justify-between items-center">
              <h3 className="font-medium">
                {editMode ? 'Edit Pattern' : 'Pattern Details'}
              </h3>
              <div className="space-x-2">
                {!editMode ? (
                  <Button 
                    variant="outline"
                    onClick={() => setEditMode(true)}
                    disabled={!currentPattern?.id}
                  >
                    Edit
                  </Button>
                ) : (
                  <>
                    <Button 
                      variant="outline"
                      onClick={() => {
                        setEditMode(false);
                        // Reset to saved state if canceling edit
                        const savedPattern = patterns.find(p => p.id === currentPattern.id);
                        if (savedPattern) {
                          setCurrentPattern(savedPattern);
                        } else {
                          createPattern();
                        }
                      }}
                    >
                      Cancel
                    </Button>
                    <Button 
                      onClick={savePattern}
                    >
                      <Save className="mr-1 h-4 w-4" />
                      Save
                    </Button>
                  </>
                )}
              </div>
            </div>
            
            {currentPattern ? (
              <div className="space-y-4 border border-divider/30 rounded-md p-4">
                <div className="space-y-2">
                  <Label htmlFor="pattern-name">Pattern Name</Label>
                  <Input 
                    id="pattern-name"
                    value={currentPattern.name}
                    onChange={e => setCurrentPattern({...currentPattern, name: e.target.value})}
                    disabled={!editMode}
                    placeholder="e.g., Level-based workout requirement"
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="pattern-type">Requirement Type</Label>
                  <Input 
                    id="pattern-type"
                    value={currentPattern.requirementType}
                    onChange={e => setCurrentPattern({...currentPattern, requirementType: e.target.value})}
                    disabled={!editMode}
                    placeholder="e.g., WORKOUT_COUNT, PR_COUNT, etc."
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="pattern-description">Description</Label>
                  <Textarea 
                    id="pattern-description"
                    value={currentPattern.description}
                    onChange={e => setCurrentPattern({...currentPattern, description: e.target.value})}
                    disabled={!editMode}
                    placeholder="Explain what this requirement pattern does"
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="pattern-formula">
                    Formula <span className="text-text-tertiary text-xs">(Supports variables: level, xp)</span>
                  </Label>
                  <div className="relative">
                    <Textarea 
                      id="pattern-formula"
                      value={currentPattern.formula}
                      onChange={e => {
                        setCurrentPattern({...currentPattern, formula: e.target.value});
                        setFormulaError(null);
                      }}
                      disabled={!editMode}
                      placeholder="e.g., Math.ceil(level * 2)"
                      className={formulaError ? 'border-valor' : ''}
                    />
                    {editMode && (
                      <Button
                        variant="ghost"
                        size="sm"
                        className="absolute right-2 bottom-2"
                        onClick={validateFormula}
                      >
                        <CopyCheck className="h-4 w-4 mr-1" />
                        Validate
                      </Button>
                    )}
                  </div>
                  {formulaError && (
                    <div className="text-xs text-valor flex items-center">
                      <AlertCircle className="h-3 w-3 mr-1" />
                      {formulaError}
                    </div>
                  )}
                </div>
                
                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <Label>Examples</Label>
                    {editMode && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={addExample}
                      >
                        <Plus className="h-3 w-3 mr-1" />
                        Add Example
                      </Button>
                    )}
                  </div>
                  
                  <div className="space-y-2">
                    {currentPattern.examples.map((example, index) => (
                      <div key={index} className="flex space-x-2 items-start">
                        <div className="w-1/4">
                          <Label htmlFor={`example-value-${index}`} className="text-xs">Value</Label>
                          <Input 
                            id={`example-value-${index}`}
                            type="number"
                            value={example.value}
                            onChange={e => updateExample(index, 'value', e.target.value)}
                            disabled={!editMode}
                          />
                        </div>
                        <div className="flex-1">
                          <Label htmlFor={`example-desc-${index}`} className="text-xs">Description</Label>
                          <Input 
                            id={`example-desc-${index}`}
                            value={example.description}
                            onChange={e => updateExample(index, 'description', e.target.value)}
                            disabled={!editMode}
                            placeholder="e.g., Required for level 10 users"
                          />
                        </div>
                        {editMode && (
                          <Button
                            variant="ghost"
                            size="icon"
                            className="mt-5"
                            onClick={() => removeExample(index)}
                            disabled={currentPattern.examples.length <= 1}
                          >
                            <X className="h-4 w-4" />
                          </Button>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
                
                {currentPattern.id && (
                  <div className="pt-2">
                    <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                      <DialogTrigger asChild>
                        <Button variant="outline">
                          <ListPlus className="mr-1 h-4 w-4" />
                          Test with Achievement
                        </Button>
                      </DialogTrigger>
                      <DialogContent>
                        <DialogHeader>
                          <DialogTitle>Apply Pattern to Achievement</DialogTitle>
                          <DialogDescription>
                            Select an achievement to see how this pattern would work when applied
                          </DialogDescription>
                        </DialogHeader>
                        
                        <div className="py-4">
                          <Label>Select Achievement</Label>
                          <select
                            className="w-full p-2 rounded-md border border-divider/30 bg-midnight-card mt-1"
                            onChange={(e) => applyPatternToAchievement(e.target.value)}
                          >
                            <option value="">Select an achievement</option>
                            {allAchievements.map(achievement => (
                              <option key={achievement.id} value={achievement.id}>
                                {achievement.name}
                              </option>
                            ))}
                          </select>
                          
                          <div className="mt-4">
                            <h4 className="font-medium mb-2">Pattern: {currentPattern.name}</h4>
                            <pre className="p-2 bg-midnight-elevated rounded-md text-xs overflow-x-auto">
                              {currentPattern.formula}
                            </pre>
                            
                            <h4 className="font-medium mt-4 mb-2">Sample Values:</h4>
                            <div className="border border-divider/30 rounded-md overflow-hidden">
                              <table className="w-full text-sm">
                                <thead>
                                  <tr className="bg-midnight-elevated">
                                    <th className="p-2 text-left">Level</th>
                                    <th className="p-2 text-left">Required Value</th>
                                  </tr>
                                </thead>
                                <tbody>
                                  {[1, 10, 25, 50, 75, 99].map(level => {
                                    // Safe evaluation
                                    let value = 0;
                                    try {
                                      const formulaWithVars = currentPattern.formula
                                        .replace(/level/g, level.toString())
                                        .replace(/xp/g, (level * 100).toString());
                                      
                                      // eslint-disable-next-line no-new-func
                                      value = Math.round(Function('"use strict";return (' + formulaWithVars + ')')());
                                    } catch (e) {
                                      value = 0;
                                    }
                                    
                                    return (
                                      <tr key={level} className="border-t border-divider/30">
                                        <td className="p-2">{level}</td>
                                        <td className="p-2">{value}</td>
                                      </tr>
                                    );
                                  })}
                                </tbody>
                              </table>
                            </div>
                          </div>
                        </div>
                        
                        <DialogFooter>
                          <Button onClick={() => setIsDialogOpen(false)}>
                            Close
                          </Button>
                        </DialogFooter>
                      </DialogContent>
                    </Dialog>
                  </div>
                )}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center h-[300px] text-text-secondary border border-divider/30 rounded-md">
                <p>No pattern selected</p>
                <Button 
                  variant="outline" 
                  className="mt-4"
                  onClick={createPattern}
                >
                  <Plus className="mr-1 h-4 w-4" />
                  Create New Pattern
                </Button>
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default CustomRequirementDefinition;
