// Test AI Integration
import { AIFinancialService } from './src/services/aiService.js';

console.log('Testing AI Service Configuration...');

// Test environment variables
console.log('Gemini API Key configured:', !!process.env.REACT_APP_GEMINI_API_KEY);
console.log('AI Features enabled:', process.env.REACT_APP_AI_ENABLED);

// Initialize AI service
const aiService = new AIFinancialService();

// Test basic functionality
aiService.generateTips({
  monthlyIncome: 5000,
  monthlyExpenses: 3500,
  savings: 10000,
  debt: 2000
}).then(tips => {
  console.log('AI Tips generated successfully:', tips.length, 'tips');
  tips.forEach((tip, index) => {
    console.log(`${index + 1}. [${tip.priority}] ${tip.title}`);
  });
}).catch(error => {
  console.error('AI Service Error:', error.message);
});