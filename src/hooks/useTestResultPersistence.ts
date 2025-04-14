
import { useLocalStorage } from '@/hooks/useLocalStorage';
import { AchievementTestResult } from '@/services/testing/AchievementTestingService';

interface PersistentTestData {
  results: AchievementTestResult[];
  lastUpdated: string;
}

export function useTestResultPersistence() {
  const [persistentData, setPersistentData] = useLocalStorage<PersistentTestData>('achievement-test-results', {
    results: [],
    lastUpdated: new Date().toISOString()
  });

  const saveResults = (results: AchievementTestResult[]) => {
    setPersistentData({
      results,
      lastUpdated: new Date().toISOString()
    });
  };

  const clearResults = () => {
    setPersistentData({
      results: [],
      lastUpdated: new Date().toISOString()
    });
  };

  return {
    savedResults: persistentData.results,
    lastUpdated: persistentData.lastUpdated,
    saveResults,
    clearResults
  };
}
