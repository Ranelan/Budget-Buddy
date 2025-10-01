// Custom hook for AI-powered financial features
import { useState, useEffect, useCallback } from 'react';
import AIFinancialService from '../services/aiService';

const useAIFinancial = () => {
  const [tips, setTips] = useState([]);
  const [insights, setInsights] = useState([]);
  const [predictions, setPredictions] = useState({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const aiService = new AIFinancialService();

  // Generate financial tips based on user data
  const generateTips = useCallback(async (userData) => {
    setLoading(true);
    setError(null);
    
    try {
      const newTips = await aiService.generateFinancialTips(userData);
      setTips(newTips);
      
      // Store tips in localStorage with timestamp
      localStorage.setItem('aiFinancialTips', JSON.stringify({
        tips: newTips,
        timestamp: Date.now(),
        userData: userData
      }));
      
    } catch (err) {
      setError('Failed to generate financial tips');
      console.error('AI Tips Error:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  // Generate budget insights
  const generateInsights = useCallback(async (budgetData, actualSpending) => {
    try {
      const budgetInsights = await aiService.generateBudgetInsights(budgetData, actualSpending);
      setInsights(budgetInsights);
    } catch (err) {
      console.error('Budget Insights Error:', err);
    }
  }, []);

  // Generate spending predictions
  const generatePredictions = useCallback(async (historicalData) => {
    try {
      const spendingPredictions = await aiService.predictSpending(historicalData);
      setPredictions(spendingPredictions);
    } catch (err) {
      console.error('Predictions Error:', err);
    }
  }, []);

  // Load cached tips on component mount
  useEffect(() => {
    const cachedData = localStorage.getItem('aiFinancialTips');
    if (cachedData) {
      try {
        const { tips: cachedTips, timestamp } = JSON.parse(cachedData);
        
        // Use cached tips if they're less than 24 hours old
        const isRecent = Date.now() - timestamp < 24 * 60 * 60 * 1000;
        if (isRecent && cachedTips?.length > 0) {
          setTips(cachedTips);
        }
      } catch (err) {
        console.error('Error loading cached tips:', err);
      }
    }
  }, []);

  // Get user financial data from localStorage
  const getUserFinancialData = useCallback(() => {
    try {
      // This would typically come from your app's state management
      // For now, we'll gather data from localStorage and provide defaults
      
      const userData = {
        monthlyIncome: parseFloat(localStorage.getItem('monthlyIncome')) || 0,
        monthlyExpenses: parseFloat(localStorage.getItem('monthlyExpenses')) || 0,
        savingsGoals: JSON.parse(localStorage.getItem('savingsGoals') || '[]'),
        categories: JSON.parse(localStorage.getItem('budgetCategories') || '[]'),
        recentTransactions: JSON.parse(localStorage.getItem('recentTransactions') || '[]'),
        budgetData: JSON.parse(localStorage.getItem('budgetData') || '{}')
      };

      return userData;
    } catch (err) {
      console.error('Error gathering user data:', err);
      return {
        monthlyIncome: 0,
        monthlyExpenses: 0,
        savingsGoals: [],
        categories: [],
        recentTransactions: [],
        budgetData: {}
      };
    }
  }, []);

  // Auto-generate tips when user data changes significantly
  const autoGenerateTips = useCallback(async () => {
    const userData = getUserFinancialData();
    
    // Check if we have enough data to generate meaningful tips
    if (userData.monthlyIncome > 0 || userData.recentTransactions.length > 0) {
      await generateTips(userData);
    }
  }, [generateTips, getUserFinancialData]);

  // Refresh tips manually
  const refreshTips = useCallback(async () => {
    const userData = getUserFinancialData();
    await generateTips(userData);
  }, [generateTips, getUserFinancialData]);

  return {
    // State
    tips,
    insights,
    predictions,
    loading,
    error,
    
    // Actions
    generateTips,
    generateInsights,
    generatePredictions,
    autoGenerateTips,
    refreshTips,
    getUserFinancialData
  };
};

export default useAIFinancial;