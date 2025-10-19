import React, { useState, useEffect } from 'react';
import './App.css';

const RECURRING_BASE_URL = 'http://localhost:8081/api/recurringTransactions';
const USERS_URL = 'http://localhost:8081/api/regularUser/findAll';

function RecurringTransactionsSection() {
  const [recurringTransactions, setRecurringTransactions] = useState([]);
  const [users, setUsers] = useState([]);
  const [categories, setCategories] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [loading, setLoading] = useState(true);
  const [usersLoading, setUsersLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const [formData, setFormData] = useState({
    recurrenceType: 'MONTHLY',
    nextExecution: new Date().toISOString().split('T')[0],
    amount: '',
    description: '',
    category: '',
    userId: ''
  });
  
  // Get current user ID from localStorage
  const currentUserId = localStorage.getItem("regularUserID");
  
  useEffect(() => {
    fetchAllRecurringTransactions();
    fetchUsers();
    fetchCategories();
  }, []);

  const fetchAllRecurringTransactions = async () => {
    setLoading(true);
    setError("");
    try {
      const response = await fetch(`${RECURRING_BASE_URL}/findAll`);
      if (!response.ok) {
        throw new Error(`Server returned ${response.status}`);
      }
      const text = await response.text();
      let data = [];
      if (text && text.trim() !== '') {
        try {
          data = JSON.parse(text);
        } catch (e) {
          throw new Error('Invalid JSON response: ' + text);
        }
      }
      setRecurringTransactions(data);
    } catch (err) {
      console.error('Fetch error:', err);
      setError(`Failed to fetch transactions: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  const fetchUserRecurringTransactions = async () => {
    setLoading(true);
    setError("");
    
    try {
      const response = await fetch(`${RECURRING_BASE_URL}/findAll`);
      if (!response.ok) {
        throw new Error(`Server returned ${response.status}`);
      }
      const text = await response.text();
      let allTransactions = [];
      if (text && text.trim() !== '') {
        try {
          allTransactions = JSON.parse(text);
        } catch (e) {
          throw new Error('Invalid JSON response: ' + text);
        }
      }
      // Show all transactions since login is not required
      setRecurringTransactions(allTransactions);
    } catch (err) {
      console.error('Fetch error:', err);
      setError(`Failed to fetch transactions: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  const fetchUsers = async () => {
    setUsersLoading(true);
    
    try {
      const response = await fetch(USERS_URL);
      
      if (!response.ok) {
        throw new Error(`Failed to fetch users: ${response.status}`);
      }
      
      const data = await response.json();
      setUsers(data);
      
    } catch (err) {
      console.error('Failed to fetch users:', err);
    } finally {
      setUsersLoading(false);
    }
  };

  const fetchCategories = async () => {
    try {
      const response = await fetch("http://localhost:8081/api/category/findAll");
      if (!response.ok) throw new Error("Failed to fetch categories");
      const text = await response.text();
      let data = [];
      if (text && text.trim() !== "") {
        try {
          data = JSON.parse(text);
        } catch (e) {
          throw new Error('Invalid JSON response: ' + text);
        }
      }
      setCategories(data);
    } catch (err) {
      console.error("Failed to fetch categories", err);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    setError("");
    setSuccess("");
  };

  // In createRecurringTransaction, ensure amount is sent as a number
  const createRecurringTransaction = async () => {
    try {
      const targetUserId = formData.userId || currentUserId || 1;
      const payload = {
        recurrenceType: formData.recurrenceType,
        nextExecution: formData.nextExecution,
        regularUser: {
          userID: targetUserId
        },
        description: formData.description,
        amount: Number(formData.amount),
        category: formData.category
      };
      console.log('Payload sent to backend:', payload); // Debug log
      const response = await fetch(`${RECURRING_BASE_URL}/create`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify(payload)
      });
      const createdTransaction = await response.json();
      console.log('Created transaction from backend:', createdTransaction); // Debug log
      fetchAllRecurringTransactions();
      resetForm();
      setSuccess('Recurring transaction created successfully!');
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      console.error('Create error:', err);
      setError(err.message);
    }
  };

  const deleteRecurringTransaction = async (id) => {
    if (window.confirm('Are you sure you want to delete this recurring transaction?')) {
      try {
        const response = await fetch(`${RECURRING_BASE_URL}/delete${id}`, { 
          method: 'DELETE' 
        });
        if (response.status === 204 || response.ok) {
          setRecurringTransactions(prev => 
            prev.filter(t => t.recurringTransactionId !== id)
          );
          setSuccess('Transaction deleted successfully!');
          setTimeout(() => setSuccess(''), 3000);
        } else {
          throw new Error('Failed to delete transaction');
        }
      } catch (err) {
        setError(err.message);
      }
    }
  };

  const resetForm = () => {
    setFormData({
      recurrenceType: 'MONTHLY',
      nextExecution: new Date().toISOString().split('T')[0],
      amount: '',
      description: '',
      category: '',
      userId: ''
    });
    setShowForm(false);
    setError("");
  };

  const getDaysUntilDue = (nextExecution) => {
    if (!nextExecution) return { days: 'N/A', status: 'unknown' };
    
    try {
      const dueDate = new Date(nextExecution);
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      
      const diffTime = dueDate - today;
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      
      let status = 'normal';
      if (diffDays < 0) status = 'overdue';
      else if (diffDays === 0) status = 'today';
      else if (diffDays <= 3) status = 'urgent';
      
      return { days: Math.abs(diffDays), status };
    } catch (error) {
      return { days: 'N/A', status: 'unknown' };
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'Not set';
    
    try {
      return new Date(dateString).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
      });
    } catch (error) {
      return String(dateString);
    }
  };

  // Update formatCurrency to use ZAR (South African Rand)
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-ZA', {
      style: 'currency',
      currency: 'ZAR'
    }).format(amount || 0);
  };

  const getUserDisplayName = (transaction) => {
    const userObj = transaction.regularUser || transaction.user;
    const userId = userObj?.userID || userObj?.id || transaction.userId;
    
    if (userObj?.userName) return userObj.userName;
    if (userObj?.name) return userObj.name;
    if (userObj?.email) return userObj.email;
    
    if (userId) {
      const foundUser = users.find(u => 
        u.userID === userId || u.id === userId
      );
      if (foundUser?.userName) return foundUser.userName;
      if (foundUser?.name) return foundUser.name;
      if (foundUser?.email) return foundUser.email;
      return `User #${userId}`;
    }
    
    return 'Unknown User';
  };

  const refreshData = () => {
    fetchAllRecurringTransactions();
    fetchUsers();
  };

  if (loading) {
    return (
      <div className="recurring-page-container">
        <div className="recurring-loading">
          <div className="loading-spinner"></div>
          <p>Loading your transactions...</p>
        </div>
      </div>
    );
  }

  // Check if the current user is admin
  const isAdmin = localStorage.getItem("isAdmin") === "true";

  return (
    <div className="recurring-page-container">
      <div className="recurring-page-wrapper">
        {/* Header Section */}
        <header className="recurring-page-header">
          <div className="recurring-header-content">
            <div className="recurring-header-icon">
              <i className="fas fa-sync-alt"></i>
            </div>
            <div className="recurring-header-text">
              <h1 className="recurring-page-title">Recurring Transactions</h1>
              <p className="recurring-page-subtitle">
                Manage your subscriptions and automated payments
              </p>
            </div>
          </div>
          <div className="recurring-header-actions">
            <button className="btn-secondary" onClick={refreshData}>
              <i className="fas fa-sync-alt"></i>
              Refresh
            </button>
            <button className="btn-primary" onClick={() => setShowForm(true)}>
              <i className="fas fa-plus"></i>
              New Transaction
            </button>
          </div>
        </header>
      
        {/* Alert Messages */}
        {error && (
          <div className="alert alert-error">
            <i className="fas fa-exclamation-circle"></i>
            <span>{error}</span>
            <button onClick={() => setError("")} className="alert-close">
              <i className="fas fa-times"></i>
            </button>
          </div>
        )}
      
        {success && (
          <div className="alert alert-success">
            <i className="fas fa-check-circle"></i>
            <span>{success}</span>
            <button onClick={() => setSuccess("")} className="alert-close">
              <i className="fas fa-times"></i>
            </button>
          </div>
        )}

        {/* Form Modal */}
        {showForm && (
          <div className="recurring-modal-overlay" onClick={(e) => {
            if (e.target.className === 'recurring-modal-overlay') resetForm();
          }}>
            <div className="recurring-modal">
              <div className="modal-header">
                <h2>
                  <i className="fas fa-plus-circle"></i>
                  Add Recurring Transaction
                </h2>
                <button className="modal-close" onClick={resetForm}>
                  <i className="fas fa-times"></i>
                </button>
              </div>

              <div className="modal-body">
                {/* User selection for admin only */}
                {isAdmin && (
                  <div className="modern-form-group">
                    <label htmlFor="userId">
                      <i className="fas fa-user"></i>
                      User *
                    </label>
                    <select
                      id="userId"
                      name="userId"
                      value={formData.userId}
                      onChange={handleInputChange}
                      required
                      disabled={usersLoading}
                    >
                      <option value="">Select User</option>
                      {users.map(user => (
                        <option key={user.userID || user.id} value={user.userID || user.id}>
                          {user.userName || user.name || user.email || `User #${user.userID || user.id}`}
                        </option>
                      ))}
                    </select>
                    {usersLoading && <div className="loading-small">Loading users...</div>}
                  </div>
                )}

                <div className="modern-form-group">
                  <label htmlFor="description">
                    <i className="fas fa-align-left"></i>
                    Description *
                  </label>
                  <input
                    id="description"
                    type="text"
                    name="description"
                    value={formData.description}
                    onChange={handleInputChange}
                    placeholder="e.g., Netflix Subscription, Gym Membership"
                    required
                  />
                </div>

                <div className="modern-form-group">
                  <label htmlFor="amount">
                    <i className="fas fa-money-bill-wave"></i>
                    Amount *
                  </label>
                  <input
                    id="amount"
                    type="number"
                    name="amount"
                    value={formData.amount}
                    onChange={handleInputChange}
                    placeholder="0.00"
                    step="0.01"
                    min="0"
                    required
                  />
                </div>

                <div className="modern-form-group">
                  <label htmlFor="category">
                    <i className="fas fa-tags"></i>
                    Category *
                  </label>
                  <select
                    id="category"
                    name="category"
                    value={formData.category}
                    onChange={handleInputChange}
                    required
                  >
                    <option value="">Select Category</option>
                    {categories.map(cat => (
                      <option key={cat.categoryId} value={cat.name}>{cat.name}</option>
                    ))}
                  </select>
                </div>

                <div className="modern-form-group">
                  <label htmlFor="recurrenceType">
                    <i className="fas fa-redo-alt"></i>
                    Recurrence Type *
                  </label>
                  <select
                    id="recurrenceType"
                    name="recurrenceType"
                    value={formData.recurrenceType}
                    onChange={handleInputChange}
                    required
                  >
                    <option value="DAILY">📅 Daily</option>
                    <option value="WEEKLY">📅 Weekly</option>
                    <option value="MONTHLY">📅 Monthly</option>
                    <option value="YEARLY">📅 Yearly</option>
                  </select>
                </div>

                <div className="modern-form-group">
                  <label htmlFor="nextExecution">
                    <i className="fas fa-calendar-alt"></i>
                    Next Execution Date *
                  </label>
                  <input
                    id="nextExecution"
                    type="date"
                    name="nextExecution"
                    value={formData.nextExecution}
                    onChange={handleInputChange}
                    required
                  />
                </div>
              </div>

              <div className="modal-footer">
                <button className="btn-secondary" onClick={resetForm}>
                  <i className="fas fa-times"></i>
                  Cancel
                </button>
                <button 
                  className="btn-primary" 
                  onClick={createRecurringTransaction}
                  disabled={
                    !formData.description || 
                    !formData.amount || 
                    !formData.category || 
                    !formData.nextExecution
                  }
                >
                  <i className="fas fa-plus"></i>
                  Create
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Transactions Table */}
        <div className="recurring-table-container">
          {recurringTransactions.length === 0 ? (
            <div className="recurring-empty-state">
              <div className="empty-state-icon">
                <i className="fas fa-sync-alt"></i>
              </div>
              <h3>No Recurring Transactions</h3>
              <p>Set up automated transactions to track your subscriptions and recurring payments</p>
              <button className="btn-primary" onClick={() => setShowForm(true)}>
                <i className="fas fa-plus"></i>
                Create Your First Transaction
              </button>
            </div>
          ) : (
            <>
              <div className="recurring-table-wrapper">
                <table className="recurring-modern-table">
                  <thead>
                    <tr>
                      <th><i className="fas fa-align-left"></i> Description</th>
                      <th><i className="fas fa-money-bill-wave"></i> Amount</th>
                      <th><i className="fas fa-tags"></i> Category</th>
                      <th><i className="fas fa-redo-alt"></i> Frequency</th>
                      <th><i className="fas fa-calendar-alt"></i> Next Date</th>
                      <th><i className="fas fa-clock"></i> Status</th>
                      <th className="text-center"><i className="fas fa-cog"></i> Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {recurringTransactions.map(transaction => {
                      console.log('Transaction row:', transaction);
                      const daysInfo = getDaysUntilDue(transaction.nextExecution);
                      
                      return (
                        <tr key={transaction.recurringTransactionId} className="recurring-row">
                          <td>
                            <div className="transaction-description">
                              <i className="fas fa-file-alt"></i>
                              {transaction.description || 'No description'}
                            </div>
                          </td>
                          <td>
                            <span className="transaction-amount">
                              {formatCurrency(transaction.amount)}
                            </span>
                          </td>
                          <td>
                            <span className="transaction-category-badge">
                              <i className="fas fa-tag"></i>
                              {transaction.category || 'Uncategorized'}
                            </span>
                          </td>
                          <td>
                            <span className="frequency-badge">
                              {transaction.recurrenceType === 'DAILY' && '📅 Daily'}
                              {transaction.recurrenceType === 'WEEKLY' && '📅 Weekly'}
                              {transaction.recurrenceType === 'MONTHLY' && '📅 Monthly'}
                              {transaction.recurrenceType === 'YEARLY' && '📅 Yearly'}
                              {!transaction.recurrenceType && 'N/A'}
                            </span>
                          </td>
                          <td>
                            <span className="next-execution-date">
                              {formatDate(transaction.nextExecution)}
                            </span>
                          </td>
                          <td>
                            <span className={`status-badge status-${daysInfo.status}`}>
                              {daysInfo.status === 'overdue' && '⚠️ Overdue'}
                              {daysInfo.status === 'today' && '🔔 Today'}
                              {daysInfo.status === 'urgent' && `⏰ ${daysInfo.days} days`}
                              {daysInfo.status === 'normal' && `✓ ${daysInfo.days} days`}
                              {daysInfo.status === 'unknown' && 'N/A'}
                            </span>
                          </td>
                          <td>
                            <div className="action-buttons">
                              <button 
                                className="btn-action btn-delete"
                                onClick={() => deleteRecurringTransaction(transaction.recurringTransactionId)}
                                title="Delete this recurring transaction"
                              >
                                <i className="fas fa-trash"></i>
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>

              {/* Summary Section */}
              <div className="recurring-summary">
                <div className="summary-card">
                  <div className="summary-icon">
                    <i className="fas fa-list"></i>
                  </div>
                  <div className="summary-content">
                    <span className="summary-label">Total Transactions</span>
                    <span className="summary-value">{recurringTransactions.length}</span>
                  </div>
                </div>
                <div className="summary-card">
                  <div className="summary-icon">
                    <i className="fas fa-calculator"></i>
                  </div>
                  <div className="summary-content">
                    <span className="summary-label">Estimated Monthly</span>
                    <span className="summary-value">
                      {formatCurrency(recurringTransactions.reduce((total, t) => {
                        if (t.recurrenceType === 'MONTHLY') return total + (t.amount || 0);
                        if (t.recurrenceType === 'WEEKLY') return total + (t.amount || 0) * 4;
                        if (t.recurrenceType === 'YEARLY') return total + (t.amount || 0) / 12;
                        return total + (t.amount || 0) * 30; // Daily
                      }, 0))}
                    </span>
                  </div>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

export default RecurringTransactionsSection;