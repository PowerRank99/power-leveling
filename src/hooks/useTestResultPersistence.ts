
import { useState, useEffect } from 'react';
import { AchievementTestResult } from '@/services/testing/AchievementTestingService';

// Local storage key for test results
const TEST_RESULTS_STORAGE_KEY = 'achievement-test-results';

export const useTestResultPersistence = () => {
  const [savedResults, setSavedResults] = useState<AchievementTestResult[]>([]);
  
  // Load saved results on component mount
  useEffect(() => {
    const loadSavedResults = () => {
      try {
        const savedData = localStorage.getItem(TEST_RESULTS_STORAGE_KEY);
        if (savedData) {
          const parsedResults = JSON.parse(savedData) as AchievementTestResult[];
          setSavedResults(parsedResults);
        }
      } catch (error) {
        console.error('Error loading saved test results:', error);
      }
    };
    
    loadSavedResults();
  }, []);
  
  // Save results to local storage
  const saveResults = (results: AchievementTestResult[]) => {
    try {
      localStorage.setItem(TEST_RESULTS_STORAGE_KEY, JSON.stringify(results));
      setSavedResults(results);
    } catch (error) {
      console.error('Error saving test results:', error);
    }
  };
  
  // Clear saved results
  const clearResults = () => {
    try {
      localStorage.removeItem(TEST_RESULTS_STORAGE_KEY);
      setSavedResults([]);
    } catch (error) {
      console.error('Error clearing test results:', error);
    }
  };
  
  return {
    savedResults,
    saveResults,
    clearResults
  };
};
