
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import { Separator } from '@/components/ui/separator';
import { RotateCcw, Save } from 'lucide-react';
import { AchievementTestConfig } from '@/services/testing/AchievementTestingService';

interface TestConfigurationPanelProps {
  config: Partial<AchievementTestConfig>;
  onConfigChange: (config: Partial<AchievementTestConfig>) => void;
  onResetDefaults: () => void;
  isDisabled?: boolean;
}

const TestConfigurationPanel: React.FC<TestConfigurationPanelProps> = ({
  config,
  onConfigChange,
  onResetDefaults,
  isDisabled = false,
}) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Test Configuration</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-4">
            <h3 className="font-semibold">Test Behavior</h3>
            
            <div className="flex items-center justify-between">
              <div>
                <Label htmlFor="cleanup" className="block mb-1">Cleanup After Tests</Label>
                <p className="text-text-secondary text-sm">Remove test data after each test</p>
              </div>
              <Switch
                id="cleanup"
                checked={config.cleanup}
                onCheckedChange={(checked) => onConfigChange({ cleanup: checked })}
                disabled={isDisabled}
              />
            </div>
            
            <div className="flex items-center justify-between">
              <div>
                <Label htmlFor="useTransaction" className="block mb-1">Use Transactions</Label>
                <p className="text-text-secondary text-sm">Run tests in database transactions</p>
              </div>
              <Switch
                id="useTransaction"
                checked={config.useTransaction}
                onCheckedChange={(checked) => onConfigChange({ useTransaction: checked })}
                disabled={isDisabled}
              />
            </div>
            
            <div className="flex items-center justify-between">
              <div>
                <Label htmlFor="verbose" className="block mb-1">Verbose Logging</Label>
                <p className="text-text-secondary text-sm">Log detailed test information</p>
              </div>
              <Switch
                id="verbose"
                checked={config.verbose}
                onCheckedChange={(checked) => onConfigChange({ verbose: checked })}
                disabled={isDisabled}
              />
            </div>
          </div>
          
          <div className="space-y-4">
            <h3 className="font-semibold">Advanced Settings</h3>
            
            <div>
              <Label htmlFor="timeout" className="block mb-1">Test Timeout (ms)</Label>
              <Input
                id="timeout"
                type="number"
                value={config.timeout}
                onChange={(e) => onConfigChange({ timeout: parseInt(e.target.value) })}
                className="bg-midnight-elevated"
                disabled={isDisabled}
              />
              <p className="text-text-secondary text-sm mt-1">Maximum time allowed for each test</p>
            </div>
            
            <div>
              <Label htmlFor="maxRetries" className="block mb-1">Max Retries</Label>
              <Input
                id="maxRetries"
                type="number"
                value={config.maxRetries}
                onChange={(e) => onConfigChange({ maxRetries: parseInt(e.target.value) })}
                className="bg-midnight-elevated"
                disabled={isDisabled}
              />
              <p className="text-text-secondary text-sm mt-1">Number of retry attempts for failed tests</p>
            </div>
          </div>
        </div>
        
        <Separator />
        
        <div className="flex justify-between">
          <Button
            variant="outline"
            onClick={onResetDefaults}
            disabled={isDisabled}
          >
            <RotateCcw className="mr-2 h-4 w-4" />
            Reset to Defaults
          </Button>
          
          <Button
            variant="arcane"
            onClick={() => onConfigChange(config)}
            disabled={isDisabled}
          >
            <Save className="mr-2 h-4 w-4" />
            Apply Settings
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default TestConfigurationPanel;
