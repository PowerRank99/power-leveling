import React, { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Slider } from '@/components/ui/slider';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { toast } from 'sonner';
import { TestDataGenerator } from '@/services/testing/generators';
import { AchievementIdMappingService } from '@/services/common/AchievementIdMappingService';
import { AchievementUtils } from '@/constants/achievements/AchievementUtils';
import { Achievement } from '@/types/achievementTypes';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { AlertTriangle } from 'lucide-react';

interface TemplateConfig {
  id: string;
  name: string;
  description: string;
  template: string;
  generator: TestDataGenerator;
  params: {
    [key: string]: {
      type: 'string' | 'number' | 'boolean' | 'select' | 'multiselect';
      label: string;
      description?: string;
      default?: any;
      options?: any[];
    };
  };
}

interface TemplateGenerationSystemProps {
  userId: string;
  templates: TemplateConfig[];
  onTemplateGenerated: (template: string) => void;
}

const TemplateGenerationSystem: React.FC<TemplateGenerationSystemProps> = ({ userId, templates, onTemplateGenerated }) => {
  const [selectedTemplate, setSelectedTemplate] = useState<string | null>(null);
  const [templateParams, setTemplateParams] = useState<Record<string, any>>({});
  const [generatedTemplate, setGeneratedTemplate] = useState<string>('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [isCleanupEnabled, setIsCleanupEnabled] = useState(true);
  const [achievementMappings, setAchievementMappings] = useState<{ stringId: string; uuid: string }[]>([]);
  const [selectedAchievements, setSelectedAchievements] = useState<string[]>([]);
  const [availableAchievements, setAvailableAchievements] = useState<Achievement[]>([]);
  const [selectedGenerator, setSelectedGenerator] = useState<TestDataGenerator | null>(null);
  const [generatorParams, setGeneratorParams] = useState<Record<string, any>>({});
  const [generatorResults, setGeneratorResults] = useState<any[]>([]);
  const [isGeneratorRunning, setIsGeneratorRunning] = useState(false);
  const [generatorError, setGeneratorError] = useState<string | null>(null);
  
  useEffect(() => {
    const loadMappings = async () => {
      try {
        await AchievementIdMappingService.initialize();
        const mappings = AchievementIdMappingService.getAllMappings();
        setAchievementMappings(mappings);
      } catch (error) {
        console.error('Error loading achievement mappings:', error);
        toast.error('Failed to load achievement mappings');
      }
    };
    
    loadMappings();
  }, []);
  
  useEffect(() => {
    const loadAchievements = async () => {
      try {
        const achievements = await AchievementUtils.getAllAchievements();
        setAvailableAchievements(achievements);
      } catch (error) {
        console.error('Error loading achievements:', error);
        toast.error('Failed to load achievements');
      }
    };
    
    loadAchievements();
  }, []);
  
  useEffect(() => {
    if (templates.length > 0 && !selectedTemplate) {
      setSelectedTemplate(templates[0].id);
    }
  }, [templates, selectedTemplate]);
  
  const handleTemplateChange = (templateId: string) => {
    setSelectedTemplate(templateId);
    setGeneratedTemplate('');
    
    const template = templates.find(t => t.id === templateId);
    if (template) {
      setSelectedGenerator(template.generator);
      
      const initialParams: Record<string, any> = {};
      Object.entries(template.params).forEach(([key, config]) => {
        initialParams[key] = config.default;
      });
      setTemplateParams(initialParams);
    }
  };
  
  const handleParamChange = (key: string, value: any) => {
    setTemplateParams(prev => ({
      ...prev,
      [key]: value
    }));
  };
  
  const generateTemplate = () => {
    if (!selectedTemplate) {
      toast.error('Please select a template');
      return;
    }
    
    setIsGenerating(true);
    
    try {
      const template = templates.find(t => t.id === selectedTemplate);
      if (!template) {
        throw new Error('Template not found');
      }
      
      let generated = template.template;
      
      // Replace template parameters
      Object.entries(templateParams).forEach(([key, value]) => {
        const regex = new RegExp(`\\{\\{\\s*${key}\\s*\\}\\}`, 'g');
        generated = generated.replace(regex, value);
      });
      
      // Replace achievement string IDs with UUIDs
      achievementMappings.forEach(mapping => {
        const regex = new RegExp(`\\{\\{\\s*${mapping.stringId}\\s*\\}\\}`, 'g');
        generated = generated.replace(regex, mapping.uuid);
      });
      
      setGeneratedTemplate(generated);
      onTemplateGenerated(generated);
      toast.success('Template generated successfully');
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      toast.error('Failed to generate template', {
        description: errorMessage
      });
    } finally {
      setIsGenerating(false);
    }
  };
  
  const handleAchievementSelect = (achievementId: string) => {
    setSelectedAchievements(prev => {
      if (prev.includes(achievementId)) {
        return prev.filter(id => id !== achievementId);
      } else {
        return [...prev, achievementId];
      }
    });
  };
  
  const handleGeneratorParamChange = (key: string, value: any) => {
    setGeneratorParams(prev => ({
      ...prev,
      [key]: value
    }));
  };
  
  const runGenerator = async () => {
    if (!selectedGenerator) {
      toast.error('No generator selected');
      return;
    }
    
    setIsGeneratorRunning(true);
    setGeneratorError(null);
    
    try {
      const result = await selectedGenerator.generate(userId, generatorParams);
      
      if (result.success) {
        setGeneratorResults([result.data]);
        toast.success('Generator ran successfully', {
          description: result.message
        });
      } else {
        setGeneratorError(result.message || 'Unknown error');
        toast.error('Generator failed', {
          description: result.message
        });
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      setGeneratorError(errorMessage);
      toast.error('Generator failed', {
        description: errorMessage
      });
    } finally {
      setIsGeneratorRunning(false);
    }
  };
  
  const cleanupGenerator = async () => {
    if (!selectedGenerator) {
      toast.error('No generator selected');
      return;
    }
    
    setIsGeneratorRunning(true);
    setGeneratorError(null);
    
    try {
      const success = await selectedGenerator.cleanup(userId);
      
      if (success) {
        setGeneratorResults([]);
        toast.success('Generator data cleaned up successfully');
      } else {
        setGeneratorError('Cleanup failed');
        toast.error('Generator cleanup failed');
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      setGeneratorError(errorMessage);
      toast.error('Generator cleanup failed', {
        description: errorMessage
      });
    } finally {
      setIsGeneratorRunning(false);
    }
  };
  
  const template = templates.find(t => t.id === selectedTemplate);
  
  return (
    <div className="space-y-4">
      <Card className="bg-midnight-card border-divider/30">
        <CardHeader>
          <CardTitle>Template Configuration</CardTitle>
          <CardDescription>Configure the template and generate the output</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label htmlFor="template-select">Select Template</Label>
            <Select
              value={selectedTemplate || ''}
              onValueChange={handleTemplateChange}
            >
              <SelectTrigger id="template-select">
                <SelectValue placeholder="Select a template" />
              </SelectTrigger>
              <SelectContent>
                {templates.map(template => (
                  <SelectItem key={template.id} value={template.id}>
                    {template.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          
          {template && (
            <div className="space-y-4">
              <h3 className="text-lg font-medium">{template.name}</h3>
              <p className="text-text-secondary">{template.description}</p>
              
              <div className="space-y-2">
                <h4 className="text-sm font-medium">Template Parameters</h4>
                {Object.entries(template.params).map(([key, config]) => (
                  <div key={key} className="space-y-1">
                    <Label htmlFor={`param-${key}`}>{config.label}</Label>
                    {config.type === 'string' && (
                      <Input
                        type="text"
                        id={`param-${key}`}
                        value={templateParams[key] || ''}
                        onChange={(e) => handleParamChange(key, e.target.value)}
                      />
                    )}
                    {config.type === 'number' && (
                      <Input
                        type="number"
                        id={`param-${key}`}
                        value={templateParams[key] || ''}
                        onChange={(e) => handleParamChange(key, Number(e.target.value))}
                      />
                    )}
                    {config.type === 'boolean' && (
                      <Switch
                        id={`param-${key}`}
                        checked={templateParams[key] || false}
                        onCheckedChange={(checked) => handleParamChange(key, checked)}
                      />
                    )}
                    {config.type === 'select' && (
                      <Select
                        value={templateParams[key] || ''}
                        onValueChange={(value) => handleParamChange(key, value)}
                      >
                        <SelectTrigger id={`param-${key}`}>
                          <SelectValue placeholder="Select an option" />
                        </SelectTrigger>
                        <SelectContent>
                          {config.options?.map(option => (
                            <SelectItem key={option} value={option}>
                              {option}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    )}
                    {config.type === 'multiselect' && (
                      <div className="text-text-secondary">
                        Multi-select is not implemented yet.
                      </div>
                    )}
                    {config.description && (
                      <p className="text-sm text-text-secondary">{config.description}</p>
                    )}
                  </div>
                ))}
              </div>
              
              <Button onClick={generateTemplate} disabled={isGenerating}>
                {isGenerating ? 'Generating...' : 'Generate Template'}
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
      
      {template && template.generator && (
        <Card className="bg-midnight-card border-divider/30">
          <CardHeader>
            <CardTitle>Data Generator</CardTitle>
            <CardDescription>Generate test data using the selected generator</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {template.generator && (
              <div className="space-y-4">
                <h3 className="text-lg font-medium">Generator Parameters</h3>
                
                {template.generator.getGenerators && (
                  <Alert variant="warning">
                    <AlertTriangle className="h-4 w-4" />
                    <AlertTitle>Nested Generators</AlertTitle>
                    <AlertDescription>
                      This generator has nested generators. Please configure them separately.
                    </AlertDescription>
                  </Alert>
                )}
                
                {Object.keys(template.params).map(key => {
                  const config = template.params[key];
                  
                  return (
                    <div key={key} className="space-y-1">
                      <Label htmlFor={`generator-param-${key}`}>{config.label}</Label>
                      {config.type === 'string' && (
                        <Input
                          type="text"
                          id={`generator-param-${key}`}
                          value={generatorParams[key] || ''}
                          onChange={(e) => handleGeneratorParamChange(key, e.target.value)}
                        />
                      )}
                      {config.type === 'number' && (
                        <Input
                          type="number"
                          id={`generator-param-${key}`}
                          value={generatorParams[key] || ''}
                          onChange={(e) => handleGeneratorParamChange(key, Number(e.target.value))}
                        />
                      )}
                      {config.type === 'boolean' && (
                        <Switch
                          id={`generator-param-${key}`}
                          checked={generatorParams[key] || false}
                          onCheckedChange={(checked) => handleGeneratorParamChange(key, checked)}
                        />
                      )}
                      {config.type === 'select' && (
                        <Select
                          value={generatorParams[key] || ''}
                          onValueChange={(value) => handleGeneratorParamChange(key, value)}
                        >
                          <SelectTrigger id={`generator-param-${key}`}>
                            <SelectValue placeholder="Select an option" />
                          </SelectTrigger>
                          <SelectContent>
                            {config.options?.map(option => (
                              <SelectItem key={option} value={option}>
                                {option}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      )}
                      {config.type === 'multiselect' && (
                        <div className="text-text-secondary">
                          Multi-select is not implemented yet.
                        </div>
                      )}
                      {config.description && (
                        <p className="text-sm text-text-secondary">{config.description}</p>
                      )}
                    </div>
                  );
                })}
                
                <div className="flex items-center space-x-4">
                  <Button onClick={runGenerator} disabled={isGeneratorRunning}>
                    {isGeneratorRunning ? 'Running Generator...' : 'Run Generator'}
                  </Button>
                  
                  <Button variant="destructive" onClick={cleanupGenerator} disabled={isGeneratorRunning}>
                    {isGeneratorRunning ? 'Cleaning Up...' : 'Cleanup Data'}
                  </Button>
                </div>
                
                {generatorError && (
                  <Alert variant="destructive">
                    <AlertTriangle className="h-4 w-4" />
                    <AlertTitle>Generator Error</AlertTitle>
                    <AlertDescription>{generatorError}</AlertDescription>
                  </Alert>
                )}
                
                {generatorResults.length > 0 && (
                  <div className="space-y-2">
                    <h4 className="text-sm font-medium">Generator Results</h4>
                    <pre className="text-xs bg-midnight-elevated rounded p-2 overflow-x-auto">
                      {JSON.stringify(generatorResults, null, 2)}
                    </pre>
                  </div>
                )}
              </div>
            )}
          </CardContent>
        </Card>
      )}
      
      {generatedTemplate && (
        <Card className="bg-midnight-card border-divider/30">
          <CardHeader>
            <CardTitle>Generated Template</CardTitle>
            <CardDescription>The generated template output</CardDescription>
          </CardHeader>
          <CardContent>
            <Textarea
              value={generatedTemplate}
              readOnly
              className="bg-midnight-elevated border-divider/30"
            />
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default TemplateGenerationSystem;
