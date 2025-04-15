
import React, { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { 
  User, UserCog, ChevronUp, ChevronDown, 
  Laptop, RefreshCw, Database, Trash2
} from 'lucide-react';
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '@/components/ui/select';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { Badge } from '@/components/ui/badge';
import { useTestingDashboard } from '@/contexts/TestingDashboardContext';
import UserSearchCombobox from '@/components/user/UserSearchCombobox';
import { useAuth } from '@/hooks/useAuth';

interface TestControlPanelProps {
  currentUserId: string;
  testUserId: string;
  onUserChange: (userId: string) => void;
  advancedMode: boolean;
  onModeChange: (advanced: boolean) => void;
}

const TestControlPanel: React.FC<TestControlPanelProps> = ({
  currentUserId,
  testUserId,
  onUserChange,
  advancedMode,
  onModeChange
}) => {
  const { user } = useAuth();
  const { 
    isDataGenerating, 
    isDataCleaning,
    generateTestData,
    cleanupTestData
  } = useTestingDashboard();
  
  const [expanded, setExpanded] = useState(false);
  
  const isSelf = !testUserId || testUserId === currentUserId;
  
  return (
    <Card className="border-arcane-30 shadow-glow-subtle overflow-hidden">
      <Collapsible open={expanded} onOpenChange={setExpanded}>
        <div className="flex items-center justify-between p-3 bg-midnight-elevated">
          <div className="flex items-center gap-3">
            <div className="flex items-center">
              {isSelf ? (
                <User className="h-5 w-5 text-arcane mr-2" />
              ) : (
                <UserCog className="h-5 w-5 text-valor mr-2" />
              )}
              <span className="font-orbitron text-sm">Test Control Panel</span>
            </div>
            
            {!isSelf && (
              <Badge variant="outline" className="bg-valor-15 text-valor border-valor-30">
                Testing as Other User
              </Badge>
            )}
          </div>
          
          <CollapsibleTrigger asChild>
            <Button variant="ghost" size="sm">
              {expanded ? (
                <ChevronUp className="h-4 w-4" />
              ) : (
                <ChevronDown className="h-4 w-4" />
              )}
            </Button>
          </CollapsibleTrigger>
        </div>
        
        <CollapsibleContent>
          <CardContent className="p-4 pt-2 space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* User Selection */}
              <div className="space-y-2">
                <Label htmlFor="user-selection">Test as User</Label>
                <div className="flex space-x-2">
                  <UserSearchCombobox
                    onUserSelect={onUserChange}
                    selectedUserId={testUserId || currentUserId}
                    placeholder="Search users..."
                    className="flex-1"
                  />
                  
                  <Button 
                    variant="outline" 
                    size="icon"
                    onClick={() => onUserChange(currentUserId)}
                    disabled={isSelf}
                    title="Reset to current user"
                  >
                    <RefreshCw className="h-4 w-4" />
                  </Button>
                </div>
              </div>
              
              {/* Mode Switch */}
              <div className="flex items-center justify-start space-x-4">
                <div className="flex items-center space-x-2">
                  <Switch 
                    id="advanced-mode"
                    checked={advancedMode}
                    onCheckedChange={onModeChange}
                  />
                  <Label htmlFor="advanced-mode" className="cursor-pointer">Advanced Mode</Label>
                </div>
                <Laptop className="h-4 w-4 text-text-secondary" />
              </div>
              
              {/* Data Generation */}
              <div className="flex items-center space-x-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={generateTestData}
                  disabled={isDataGenerating || isDataCleaning}
                  className="flex-1"
                >
                  <Database className="h-4 w-4 mr-2" />
                  {isDataGenerating ? 'Generating...' : 'Generate Test Data'}
                </Button>
                
                <Button
                  variant="outline"
                  size="sm"
                  onClick={cleanupTestData}
                  disabled={isDataGenerating || isDataCleaning}
                  className="flex-1"
                >
                  <Trash2 className="h-4 w-4 mr-2" />
                  {isDataCleaning ? 'Cleaning...' : 'Clean Test Data'}
                </Button>
              </div>
            </div>
          </CardContent>
        </CollapsibleContent>
      </Collapsible>
    </Card>
  );
};

export default TestControlPanel;
