// AI Financial Tips Component
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import useAIFinancial from '../hooks/useAIFinancial';
import '../App.css';

const AIFinancialTips = ({ className = '', autoGenerate = true }) => {
  const navigate = useNavigate();
  const { 
    tips, 
    loading, 
    error, 
    autoGenerateTips, 
    refreshTips 
  } = useAIFinancial();
  
  const [expanded, setExpanded] = useState({});
  const [showModal, setShowModal] = useState(false);
  const [modalContent, setModalContent] = useState(null);

  // Auto-generate tips when component mounts
  useEffect(() => {
    if (autoGenerate && tips.length === 0) {
      autoGenerateTips();
    }
  }, [autoGenerate, tips.length, autoGenerateTips]);

  const toggleExpanded = (index) => {
    setExpanded(prev => ({
      ...prev,
      [index]: !prev[index]
    }));
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'high': return 'hsl(var(--destructive))';
      case 'medium': return 'hsl(var(--warning))';
      case 'low': return 'hsl(var(--success))';
      default: return 'hsl(var(--primary))';
    }
  };

  const getPriorityIcon = (priority) => {
    switch (priority) {
      case 'high': return '🔥';
      case 'medium': return '⚡';
      case 'low': return '💡';
      default: return '📊';
    }
  };

  const handleTakeAction = (tip, index) => {
    // Handle different types of actions based on the tip content
    if (tip.title.toLowerCase().includes('budget')) {
      // Navigate to budget page
      navigate('/user-dashboard/budget');
    } else if (tip.title.toLowerCase().includes('saving') || tip.title.toLowerCase().includes('emergency')) {
      // Navigate to goals page
      navigate('/user-dashboard/goal');
    } else if (tip.title.toLowerCase().includes('spending') || tip.title.toLowerCase().includes('transaction')) {
      // Navigate to transactions page
      navigate('/user-dashboard/transaction');
    } else if (tip.title.toLowerCase().includes('recurring') || tip.title.toLowerCase().includes('subscription')) {
      // Navigate to recurring payments page
      navigate('/user-dashboard/recurring');
    } else {
      // Default action - navigate to the most relevant section
      navigate('/user-dashboard/budget');
    }
  };

  const handleLearnMore = (tip, index) => {
    const learnMoreContent = {
      'Build Your Emergency Fund': {
        title: 'Building Your Emergency Fund',
        content: 'An emergency fund should cover 3-6 months of expenses. Here\'s how to build one:',
        steps: [
          'Start with a small goal: Save R5,000-R10,000 first',
          'Open a separate high-yield savings account',
          'Automate small weekly transfers ($25-50)',
          'Gradually increase to 3-6 months of expenses',
          'Only use for true emergencies'
        ],
        tips: 'Keep emergency funds easily accessible but separate from daily spending accounts.'
      },
      'Track Your Spending': {
        title: 'Effective Spending Tracking',
        content: 'Understanding where your money goes is the first step to financial control:',
        steps: [
          'Use the 50/30/20 rule as a guideline',
          'Review transactions weekly',
          'Categorize all expenses',
          'Identify spending patterns',
          'Find areas to reduce spending'
        ],
        tips: 'Try tracking for at least one month to get accurate spending patterns.'
      },
      'Automate Your Savings': {
        title: 'Automation for Financial Success',
        content: 'Make saving effortless with automation:',
        steps: [
          'Set up automatic transfers after payday',
          'Start small - even R250/week helps',
          'Increase gradually as income grows',
          'Treat savings like a bill',
          'Review and adjust monthly'
        ],
        tips: 'Automating removes the temptation to skip saving when money is tight.'
      }
    };

    const content = learnMoreContent[tip.title] || {
      title: tip.title,
      content: tip.description,
      steps: ['Consult with a financial advisor for personalized guidance'],
      tips: 'Every financial situation is unique - consider professional advice for major decisions.'
    };

    setModalContent({ ...content, originalTip: tip });
    setShowModal(true);
  };

  if (loading) {
    return (
      <div className={`ai-tips-container ${className}`}>
        <div className="ai-tips-header">
          <h3 className="ai-tips-title">
            <span className="ai-tips-icon">🤖</span>
            AI Financial Tips
          </h3>
        </div>
        <div className="ai-tips-loading">
          <div className="ai-tips-spinner"></div>
          <p>Analyzing your financial data...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={`ai-tips-container ${className}`}>
        <div className="ai-tips-header">
          <h3 className="ai-tips-title">
            <span className="ai-tips-icon">🤖</span>
            AI Financial Tips
          </h3>
          <button 
            className="ai-tips-refresh-btn"
            onClick={refreshTips}
            disabled={loading}
          >
            🔄
          </button>
        </div>
        <div className="ai-tips-error">
          <p>Unable to generate personalized tips right now.</p>
          <button className="ai-tips-retry-btn" onClick={refreshTips}>
            Try Again
          </button>
        </div>
      </div>
    );
  }

  if (tips.length === 0) {
    return (
      <div className={`ai-tips-container ${className}`}>
        <div className="ai-tips-header">
          <h3 className="ai-tips-title">
            <span className="ai-tips-icon">🤖</span>
            AI Financial Tips
          </h3>
          <button 
            className="ai-tips-refresh-btn"
            onClick={refreshTips}
            disabled={loading}
          >
            ✨
          </button>
        </div>
        <div className="ai-tips-empty">
          <p>Add some financial data to get personalized AI tips!</p>
          <button className="ai-tips-generate-btn" onClick={refreshTips}>
            Generate Tips
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className={`ai-tips-container ${className}`}>
      <div className="ai-tips-header">
        <h3 className="ai-tips-title">
          <span className="ai-tips-icon">🤖</span>
          AI Financial Tips
        </h3>
        <button 
          className="ai-tips-refresh-btn"
          onClick={refreshTips}
          disabled={loading}
          title="Get new tips"
        >
          🔄
        </button>
      </div>

      <div className="ai-tips-list">
        {tips.map((tip, index) => (
          <div 
            key={index} 
            className={`ai-tip-card priority-${tip.priority}`}
            style={{ '--priority-color': getPriorityColor(tip.priority) }}
          >
            <div className="ai-tip-header">
              <div className="ai-tip-priority">
                <span className="ai-tip-priority-icon">
                  {getPriorityIcon(tip.priority)}
                </span>
                <span className="ai-tip-priority-text">
                  {tip.priority.toUpperCase()}
                </span>
              </div>
              <button 
                className="ai-tip-expand-btn"
                onClick={() => toggleExpanded(index)}
              >
                {expanded[index] ? '−' : '+'}
              </button>
            </div>
            
            <h4 className="ai-tip-title">{tip.title}</h4>
            
            <div className={`ai-tip-content ${expanded[index] ? 'expanded' : ''}`}>
              <p className="ai-tip-description">{tip.description}</p>
              
              {expanded[index] && (
                <div className="ai-tip-actions">
                  <button 
                    className="ai-tip-action-btn primary"
                    onClick={() => handleTakeAction(tip, index)}
                  >
                    Take Action
                  </button>
                  <button 
                    className="ai-tip-action-btn secondary"
                    onClick={() => handleLearnMore(tip, index)}
                  >
                    Learn More
                  </button>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

      <div className="ai-tips-footer">
        <p className="ai-tips-disclaimer">
          💡 Tips are generated based on your financial data. Always consult a financial advisor for major decisions.
        </p>
      </div>

      {/* Learn More Modal */}
      {showModal && modalContent && (
        <div className="ai-modal-overlay" onClick={() => setShowModal(false)}>
          <div className="ai-modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="ai-modal-header">
              <h3>{modalContent.title}</h3>
              <button 
                className="ai-modal-close"
                onClick={() => setShowModal(false)}
              >
                ×
              </button>
            </div>
            <div className="ai-modal-body">
              <p className="ai-modal-description">{modalContent.content}</p>
              {modalContent.steps && (
                <div className="ai-modal-steps">
                  <h4>Action Steps:</h4>
                  <ul>
                    {modalContent.steps.map((step, idx) => (
                      <li key={idx}>{step}</li>
                    ))}
                  </ul>
                </div>
              )}
              {modalContent.tips && (
                <div className="ai-modal-tips">
                  <p><strong>💡 Pro Tip:</strong> {modalContent.tips}</p>
                </div>
              )}
            </div>
            <div className="ai-modal-footer">
              <button 
                className="ai-modal-btn secondary"
                onClick={() => setShowModal(false)}
              >
                Close
              </button>
              <button 
                className="ai-modal-btn primary"
                onClick={() => {
                  setShowModal(false);
                  handleTakeAction(modalContent.originalTip, 0);
                }}
              >
                Take Action
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AIFinancialTips;