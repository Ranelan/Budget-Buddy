// AI Service for Financial Tips and Insights
import axios from 'axios';

class AIFinancialService {
  constructor() {
    // Auto-detect which AI provider to use based on available API keys
    this.provider = this.detectProvider();
    this.apiKey = this.getApiKey();
    this.baseURL = this.getBaseURL();
  }

  // Detect available AI provider
  detectProvider() {
    if (process.env.REACT_APP_OPENAI_API_KEY) return 'openai';
    if (process.env.REACT_APP_GEMINI_API_KEY) return 'gemini';
    if (process.env.REACT_APP_CLAUDE_API_KEY) return 'claude';
    if (process.env.REACT_APP_LOCAL_AI_URL) return 'local';
    return 'fallback'; // Use static tips if no AI configured
  }

  // Get the appropriate API key
  getApiKey() {
    switch (this.provider) {
      case 'openai': return process.env.REACT_APP_OPENAI_API_KEY;
      case 'gemini': return process.env.REACT_APP_GEMINI_API_KEY;
      case 'claude': return process.env.REACT_APP_CLAUDE_API_KEY;
      default: return null;
    }
  }

  // Get the appropriate base URL
  getBaseURL() {
    switch (this.provider) {
      case 'openai': return 'https://api.openai.com/v1';
      case 'gemini': return 'https://generativelanguage.googleapis.com/v1';
      case 'claude': return 'https://api.anthropic.com/v1';
      case 'local': return process.env.REACT_APP_LOCAL_AI_URL || 'http://localhost:11434';
      default: return null;
    }
  }

  // Generate personalized financial tips based on user data
  async generateFinancialTips(userData) {
    try {
      const prompt = this.createFinancialTipsPrompt(userData);
      
      switch (this.provider) {
        case 'openai':
          return await this.callOpenAI(prompt);
        case 'gemini':
          return await this.callGemini(prompt);
        case 'claude':
          return await this.callClaude(prompt);
        case 'local':
          return await this.callLocalAI(prompt);
        default:
          return this.getFallbackTips();
      }
    } catch (error) {
      console.error('AI Service Error:', error);
      return this.getFallbackTips();
    }
  }

  // Create a detailed prompt for financial advice
  createFinancialTipsPrompt(userData) {
    const {
      monthlyIncome = 0,
      monthlyExpenses = 0,
      savingsGoals = [],
      categories = [],
      recentTransactions = []
    } = userData;

    const savingsRate = monthlyIncome > 0 ? ((monthlyIncome - monthlyExpenses) / monthlyIncome * 100).toFixed(1) : 0;
    
    return `As a professional financial advisor, provide 3-5 personalized financial tips for a user with the following profile:

Monthly Income: R${monthlyIncome}
Monthly Expenses: R${monthlyExpenses}
Current Savings Rate: ${savingsRate}%
Savings Goals: ${savingsGoals.length > 0 ? savingsGoals.map(g => g.name).join(', ') : 'None set'}
Budget Categories: ${categories.length > 0 ? categories.join(', ') : 'Basic categories'}
Recent Spending Pattern: ${this.analyzeSpendingPattern(recentTransactions)}

Please provide:
1. Actionable, specific advice tailored to their financial situation
2. Tips that are realistic and achievable
3. Focus on areas where they can improve most
4. Include specific Rand amounts or percentages when relevant
5. Keep each tip concise (1-2 sentences)

Format as a JSON array of tip objects with 'title', 'description', and 'priority' (high/medium/low) fields.`;
  }

  // OpenAI API call
  async callOpenAI(prompt) {
    if (!this.apiKey) {
      console.warn('OpenAI API key not found, using fallback tips');
      return this.getFallbackTips();
    }

    const response = await axios.post(`${this.baseURL}/chat/completions`, {
      model: 'gpt-3.5-turbo',
      messages: [
        {
          role: 'system',
          content: 'You are a professional financial advisor who provides practical, personalized financial advice.'
        },
        {
          role: 'user',
          content: prompt
        }
      ],
      max_tokens: 1000,
      temperature: 0.7
    }, {
      headers: {
        'Authorization': `Bearer ${this.apiKey}`,
        'Content-Type': 'application/json'
      }
    });

    const aiResponse = response.data.choices[0].message.content;
    return this.parseAIResponse(aiResponse);
  }

  // Google Gemini API call
  async callGemini(prompt) {
    const apiKey = process.env.REACT_APP_GEMINI_API_KEY;
    if (!apiKey) return this.getFallbackTips();

    const response = await axios.post(
      `https://generativelanguage.googleapis.com/v1/models/gemini-pro:generateContent?key=${apiKey}`,
      {
        contents: [{
          parts: [{
            text: prompt
          }]
        }]
      }
    );

    const aiResponse = response.data.candidates[0].content.parts[0].text;
    return this.parseAIResponse(aiResponse);
  }

  // Anthropic Claude API call
  async callClaude(prompt) {
    const apiKey = process.env.REACT_APP_CLAUDE_API_KEY;
    if (!apiKey) return this.getFallbackTips();

    const response = await axios.post('https://api.anthropic.com/v1/messages', {
      model: 'claude-3-sonnet-20240229',
      max_tokens: 1000,
      messages: [{
        role: 'user',
        content: prompt
      }]
    }, {
      headers: {
        'x-api-key': apiKey,
        'anthropic-version': '2023-06-01',
        'content-type': 'application/json'
      }
    });

    const aiResponse = response.data.content[0].text;
    return this.parseAIResponse(aiResponse);
  }

  // Local AI service call (like Ollama)
  async callLocalAI(prompt) {
    try {
      const response = await axios.post('http://localhost:11434/api/generate', {
        model: 'llama2', // or any other local model
        prompt: prompt,
        stream: false
      });

      return this.parseAIResponse(response.data.response);
    } catch (error) {
      console.warn('Local AI not available, using fallback tips');
      return this.getFallbackTips();
    }
  }

  // Parse AI response and ensure proper format
  parseAIResponse(response) {
    try {
      // Try to extract JSON from the response
      const jsonMatch = response.match(/\[[\s\S]*\]/);
      if (jsonMatch) {
        const tips = JSON.parse(jsonMatch[0]);
        return this.validateTips(tips);
      }
      
      // If no JSON found, create tips from text
      return this.createTipsFromText(response);
    } catch (error) {
      console.error('Error parsing AI response:', error);
      return this.getFallbackTips();
    }
  }

  // Create tips from plain text response
  createTipsFromText(text) {
    const lines = text.split('\n').filter(line => line.trim());
    const tips = [];
    
    for (let i = 0; i < Math.min(lines.length, 5); i++) {
      const line = lines[i].trim();
      if (line && line.length > 10) {
        tips.push({
          title: `Financial Tip ${i + 1}`,
          description: line.replace(/^\d+\.?\s*/, ''), // Remove numbering
          priority: i < 2 ? 'high' : i < 4 ? 'medium' : 'low'
        });
      }
    }
    
    return tips.length > 0 ? tips : this.getFallbackTips();
  }

  // Validate tips format
  validateTips(tips) {
    if (!Array.isArray(tips)) return this.getFallbackTips();
    
    return tips.filter(tip => 
      tip.title && tip.description && tip.priority
    ).slice(0, 5); // Limit to 5 tips
  }

  // Analyze spending patterns for better prompts
  analyzeSpendingPattern(transactions) {
    if (!transactions || transactions.length === 0) {
      return 'No recent transaction data available';
    }

  const categories = {};

    transactions.forEach(transaction => {
      if (transaction.type === 'expense') {
  categories[transaction.category] = (categories[transaction.category] || 0) + transaction.amount;
      }
    });

    const topCategory = Object.keys(categories).reduce((a, b) => 
      categories[a] > categories[b] ? a : b, ''
    );

    return `Highest spending in ${topCategory} ($${categories[topCategory]?.toFixed(2) || 0})`;
  }

  // Fallback tips when AI is not available
  getFallbackTips() {
    const fallbackTips = [
      {
        title: "Build Your Emergency Fund",
        description: "Aim to save 3-6 months of expenses in a separate savings account for unexpected costs.",
        priority: "high"
      },
      {
        title: "Track Your Spending",
        description: "Review your expenses weekly to identify areas where you can cut back and save more.",
        priority: "high"
      },
      {
        title: "Automate Your Savings",
        description: "Set up automatic transfers to savings accounts to ensure consistent saving habits.",
        priority: "medium"
      },
      {
        title: "Review Subscriptions",
        description: "Cancel unused subscriptions and services to reduce monthly recurring expenses.",
        priority: "medium"
      },
      {
        title: "Set Clear Financial Goals",
        description: "Define specific, measurable financial goals with deadlines to stay motivated.",
        priority: "low"
      }
    ];

    return fallbackTips.slice(0, 3 + Math.floor(Math.random() * 3)); // Return 3-5 random tips
  }

  // Generate budget insights
  async generateBudgetInsights(budgetData, actualSpending) {
    const insights = [];
    
    Object.keys(budgetData).forEach(category => {
      const budgeted = budgetData[category];
      const actual = actualSpending[category] || 0;
      const variance = ((actual - budgeted) / budgeted * 100).toFixed(1);
      
      if (Math.abs(variance) > 10) {
        insights.push({
          category,
          budgeted,
          actual,
          variance: parseFloat(variance),
          status: variance > 0 ? 'over' : 'under'
        });
      }
    });

    return insights;
  }

  // Generate spending predictions
  async predictSpending(historicalData) {
    // Simple trend analysis - can be enhanced with ML
    const monthlyAverages = {};
    
    historicalData.forEach(month => {
      Object.keys(month.spending).forEach(category => {
        if (!monthlyAverages[category]) {
          monthlyAverages[category] = [];
        }
        monthlyAverages[category].push(month.spending[category]);
      });
    });

    const predictions = {};
    Object.keys(monthlyAverages).forEach(category => {
      const amounts = monthlyAverages[category];
      const average = amounts.reduce((a, b) => a + b, 0) / amounts.length;
      const trend = amounts.length > 1 ? 
        (amounts[amounts.length - 1] - amounts[0]) / amounts.length : 0;
      
      predictions[category] = {
        predicted: average + trend,
        confidence: amounts.length > 3 ? 'high' : 'medium'
      };
    });

    return predictions;
  }
}

export default AIFinancialService;