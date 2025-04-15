
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Card } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import TestingDashboard from '@/components/testing/dashboard/TestingDashboard';
import TestConfigurationPanel from '@/components/testing/TestConfigurationPanel';
import { AchievementTestRunner } from '@/components/testing/AchievementTestRunner';
import { TestResultViewer } from '@/components/testing/TestResultViewer';
import ScenarioTestingTab from '@/components/testing/dashboard/ScenarioTestingTab';
import PageHeader from '@/components/ui/PageHeader';
import BottomNavBar from '@/components/navigation/BottomNavBar';
import AuthRequiredRoute from '@/components/AuthRequiredRoute';
import { 
  AchievementTestingService, 
  AchievementTestResult 
} from '@/services/testing/AchievementTestingService';
import { TestCoverageService } from '@/services/testing/TestCoverageService';
import { useAuth } from '@/hooks/useAuth';
import { useTestResultPersistence } from '@/hooks/useTestResultPersistence';
import { toast } from 'sonner';

// Import scenario runner and all scenarios
import { scenarioRunner } from '@/services/testing/scenarios';
import '@/services/testing/scenarios/importAllScenarios';

const TestingDashboardPage: React.FC = () => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('dashboard');
  const { savedResults, saveResults, clearResults } = useTestResultPersistence();
  const [testService, setTestService] = useState<AchievementTestingService | null>(null);
  const [results, setResults] = useState<AchievementTestResult[]>(savedResults);
  const [isLoading, setIsLoading] = useState(false);
  const [testConfig, setTestConfig] = useState({
    useCleanup: true,
    useTransaction: true,
    verbose: true
  });
  
  // Initialize the test service
  useEffect(() => {
    if (user?.id) {
      const service = new AchievementTestingService(user.id, testConfig);
      setTestService(service);
    }
  }, [user?.id, testConfig]);
  
  // Calculate stats from results
  const stats = {
    totalAchievements: TestCoverageService.generateCoverageReport().totalAchievements,
    testedAchievements: TestCoverageService.generateCoverageReport().testedAchievements,
    passedTests: results.filter(r => r.success).length,
    failedTests: results.filter(r => !r.success).length,
    coveragePercentage: TestCoverageService.generateCoverageReport().coveragePercentage
  };
  
  const handleRunAllTests = async () => {
    if (!testService) return;
    
    setIsLoading(true);
    try {
      const response = await testService.runAllTests();
      if (response.success && response.data) {
        setResults(response.data);
        saveResults(response.data);
        toast.success('All tests completed', {
          description: `${response.data.filter(r => r.success).length} passed, ${response.data.filter(r => !r.success).length} failed`
        });
      } else {
        toast.error('Failed to run tests', {
          description: response.error?.message
        });
      }
    } catch (error) {
      toast.error('Error running tests', {
        description: error instanceof Error ? error.message : 'Unknown error'
      });
    } finally {
      setIsLoading(false);
    }
  };
  
  const handleRunCategoryTests = async (category: string) => {
    if (!testService) return;
    
    setIsLoading(true);
    try {
      const response = await testService.runCategoryTests(category as any);
      if (response.success && response.data) {
        // Merge with existing results (replace only those of the same category)
        const existingResults = results.filter(r => r.category !== category);
        const newResults = [...existingResults, ...response.data];
        setResults(newResults);
        saveResults(newResults);
        
        toast.success(`${category} tests completed`, {
          description: `${response.data.filter(r => r.success).length} passed, ${response.data.filter(r => !r.success).length} failed`
        });
      } else {
        toast.error('Failed to run category tests', {
          description: response.error?.message
        });
      }
    } catch (error) {
      toast.error('Error running tests', {
        description: error instanceof Error ? error.message : 'Unknown error'
      });
    } finally {
      setIsLoading(false);
    }
  };
  
  const handleClearResults = () => {
    clearResults();
    setResults([]);
    toast.info('Test results cleared');
  };
  
  const handleExportResults = () => {
    if (results.length === 0) return;
    
    const report = testService?.getTestReport();
    const blob = new Blob([JSON.stringify(report, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    
    const a = document.createElement('a');
    a.href = url;
    a.download = `achievement-test-report-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    
    toast.success('Test report exported');
  };
  
  const handleUpdateConfig = () => {
    if (!testService) return;
    
    testService.updateConfig(testConfig);
    toast.success('Test configuration updated');
  };
  
  return (
    <AuthRequiredRoute>
      <div className="pb-20 min-h-screen bg-midnight-base">
        <PageHeader 
          title="Achievement Testing Dashboard" 
          showBackButton={true} 
          rightContent={
            <Badge variant="outline" className="bg-valor-15 text-valor border-valor-30">
              DEV ONLY
            </Badge>
          }
        />
        
        <div className="p-4 space-y-4">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="w-full mb-4 bg-midnight-card border border-divider/30 shadow-subtle overflow-x-auto flex-nowrap">
              <TabsTrigger value="dashboard" className="flex-1">Dashboard</TabsTrigger>
              <TabsTrigger value="runner" className="flex-1">Test Runner</TabsTrigger>
              <TabsTrigger value="scenarios" className="flex-1">Scenarios</TabsTrigger>
              <TabsTrigger value="results" className="flex-1">Results</TabsTrigger>
              <TabsTrigger value="configuration" className="flex-1">Configuration</TabsTrigger>
            </TabsList>
            
            <TabsContent value="dashboard">
              <TestingDashboard 
                stats={stats}
                results={results.slice(-5)}
                onRunAllTests={handleRunAllTests}
                onRunCategoryTests={handleRunCategoryTests}
                onClearResults={handleClearResults}
                onExportResults={handleExportResults}
                isLoading={isLoading}
              />
            </TabsContent>
            
            <TabsContent value="runner">
              <Card className="p-4 bg-midnight-card border-divider/30">
                <AchievementTestRunner 
                  userId={user?.id || ''}
                  onResultsChange={(newResults) => {
                    setResults(newResults);
                    saveResults(newResults);
                  }}
                  results={results}
                  isLoading={isLoading}
                  setIsLoading={setIsLoading}
                />
              </Card>
            </TabsContent>
            
            <TabsContent value="scenarios">
              <ScenarioTestingTab userId={user?.id || ''} />
            </TabsContent>
            
            <TabsContent value="results">
              <Card className="p-4 bg-midnight-card border-divider/30">
                <TestResultViewer
                  results={results}
                  onClearResults={handleClearResults}
                  onExportResults={handleExportResults}
                />
              </Card>
            </TabsContent>
            
            <TabsContent value="configuration">
              <Card className="p-4 bg-midnight-card border-divider/30">
                <TestConfigurationPanel
                  useCleanup={testConfig.useCleanup}
                  useTransaction={testConfig.useTransaction}
                  verbose={testConfig.verbose}
                  onCleanupChange={(value) => setTestConfig(prev => ({ ...prev, useCleanup: value }))}
                  onTransactionChange={(value) => setTestConfig(prev => ({ ...prev, useTransaction: value }))}
                  onVerboseChange={(value) => setTestConfig(prev => ({ ...prev, verbose: value }))}
                  onUpdateConfig={handleUpdateConfig}
                  isLoading={isLoading}
                />
              </Card>
            </TabsContent>
          </Tabs>
        </div>
        
        <BottomNavBar />
      </div>
    </AuthRequiredRoute>
  );
};

export default TestingDashboardPage;
