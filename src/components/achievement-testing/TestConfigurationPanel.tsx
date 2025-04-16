
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Button } from '@/components/ui/button';
import { X } from 'lucide-react';

export interface TestConfigurationPanelProps {
  useCleanup: boolean;
  useTransaction: boolean;
  verbose: boolean;
  onCleanupChange: (value: boolean) => void;
  onTransactionChange: (value: boolean) => void;
  onVerboseChange: (value: boolean) => void;
  onUpdateConfig: () => void;
  isLoading: boolean;
  onClose?: () => void;
}

const TestConfigurationPanel: React.FC<TestConfigurationPanelProps> = ({
  useCleanup,
  useTransaction,
  verbose,
  onCleanupChange,
  onTransactionChange,
  onVerboseChange,
  onUpdateConfig,
  isLoading,
  onClose
}) => {
  return (
    <Card className="p-4 mb-4 bg-midnight-card border-divider/30">
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg">Test Configuration</CardTitle>
          {onClose && (
            <Button
              variant="ghost"
              size="icon"
              onClick={onClose}
              className="h-6 w-6"
              aria-label="Close configuration panel"
            >
              <X className="h-4 w-4" />
            </Button>
          )}
        </div>
        <CardDescription>
          Configure how achievement tests are executed
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-3">
          <div className="flex items-center space-x-2">
            <Switch
              id="cleanup"
              checked={useCleanup}
              onCheckedChange={onCleanupChange}
            />
            <Label htmlFor="cleanup">Cleanup After Test</Label>
          </div>
          <p className="text-xs text-text-secondary ml-6">
            Automatically remove test data after test completion
          </p>
        </div>

        <div className="space-y-3">
          <div className="flex items-center space-x-2">
            <Switch
              id="transaction"
              checked={useTransaction}
              onCheckedChange={onTransactionChange}
            />
            <Label htmlFor="transaction">Use Transactions</Label>
          </div>
          <p className="text-xs text-text-secondary ml-6">
            Run tests in database transactions to prevent side effects
          </p>
        </div>

        <div className="space-y-3">
          <div className="flex items-center space-x-2">
            <Switch
              id="verbose"
              checked={verbose}
              onCheckedChange={onVerboseChange}
            />
            <Label htmlFor="verbose">Verbose Logging</Label>
          </div>
          <p className="text-xs text-text-secondary ml-6">
            Show detailed log information during test execution
          </p>
        </div>

        <Button 
          onClick={onUpdateConfig} 
          disabled={isLoading}
          variant="outline"
          className="w-full"
        >
          Update Configuration
        </Button>
      </CardContent>
    </Card>
  );
};

export default TestConfigurationPanel;
