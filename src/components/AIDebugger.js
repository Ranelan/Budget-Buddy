// Debug component to test AI integration
import React, { useEffect, useState } from 'react';
import AIFinancialService from '../services/aiService';

const AIDebugger = () => {
  const [debugInfo, setDebugInfo] = useState({});
  const [testResult, setTestResult] = useState(null);

  useEffect(() => {
    const aiService = new AIFinancialService();
    
    const info = {
      provider: aiService.provider,
      hasApiKey: !!aiService.apiKey,
      baseURL: aiService.baseURL,
      envVars: {
        gemini: !!process.env.REACT_APP_GEMINI_API_KEY,
        openai: !!process.env.REACT_APP_OPENAI_API_KEY,
        claude: !!process.env.REACT_APP_CLAUDE_API_KEY,
        aiEnabled: process.env.REACT_APP_AI_ENABLED
      }
    };
    
    setDebugInfo(info);

    // Test AI generation
    if (aiService.provider !== 'fallback') {
      const testData = {
        monthlyIncome: 5000,
        monthlyExpenses: 3500,
        savingsGoals: [{ name: 'Emergency Fund' }],
        categories: ['Food', 'Transportation', 'Entertainment']
      };

      aiService.generateFinancialTips(testData)
        .then(tips => {
          setTestResult({ success: true, tips });
        })
        .catch(error => {
          setTestResult({ success: false, error: error.message });
        });
    }
  }, []);

  return (
    <div style={{ 
      position: 'fixed', 
      top: '10px', 
      right: '10px', 
      background: 'white', 
      border: '1px solid #ccc', 
      padding: '15px', 
      borderRadius: '8px',
      maxWidth: '300px',
      fontSize: '12px',
      zIndex: 9999,
      boxShadow: '0 4px 8px rgba(0,0,0,0.1)'
    }}>
      <h4 style={{ margin: '0 0 10px 0', color: '#333' }}>🤖 AI Debug Info</h4>
      
      <div><strong>Provider:</strong> {debugInfo.provider}</div>
      <div><strong>API Key:</strong> {debugInfo.hasApiKey ? '✅ Configured' : '❌ Missing'}</div>
      <div><strong>Base URL:</strong> {debugInfo.baseURL}</div>
      
      <h5 style={{ margin: '10px 0 5px 0' }}>Environment:</h5>
      <div>Gemini: {debugInfo.envVars?.gemini ? '✅' : '❌'}</div>
      <div>OpenAI: {debugInfo.envVars?.openai ? '✅' : '❌'}</div>
      <div>Claude: {debugInfo.envVars?.claude ? '✅' : '❌'}</div>
      <div>AI Enabled: {debugInfo.envVars?.aiEnabled ? '✅' : '❌'}</div>
      
      {testResult && (
        <div style={{ marginTop: '10px', padding: '8px', background: '#f5f5f5', borderRadius: '4px' }}>
          <strong>Test Result:</strong>
          {testResult.success ? (
            <div style={{ color: 'green' }}>
              ✅ Success! Generated {testResult.tips.length} tips
            </div>
          ) : (
            <div style={{ color: 'red' }}>
              ❌ Failed: {testResult.error}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default AIDebugger;