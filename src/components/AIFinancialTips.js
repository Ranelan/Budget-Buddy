// AI Financial Tips Component
import React, { useEffect, useState } from 'react';
import useAIFinancial from '../hooks/useAIFinancial';
import '../App.css';

const AIFinancialTips = ({ className = '', autoGenerate = true }) => {
  const { 
    tips, 
    loading, 
    error, 
    autoGenerateTips, 
    refreshTips 
  } = useAIFinancial();
  
  const [expanded, setExpanded] = useState({});

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
                  <button className="ai-tip-action-btn primary">
                    Take Action
                  </button>
                  <button className="ai-tip-action-btn secondary">
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
    </div>
  );
};

export default AIFinancialTips;