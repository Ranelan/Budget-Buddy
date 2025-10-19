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
      <div className="dashboard-content">
        <h2>{'Recurring Transactions'}</h2>
        <div className="loading">Loading your transactions...</div>
      </div>
    );
  }

  // Check if the current user is admin
  const isAdmin = localStorage.getItem("isAdmin") === "true";

  return (
    <div className="dashboard-content">
      <h2>{'Recurring Transactions'}</h2>
      
      {error && (
        <div className="error-message">
          <strong>Error:</strong> {error}
          <button onClick={() => setError("")} className="error-close">
            ×
          </button>
        </div>
      )}
      
      {success && (
        <div className="success-message">
          <strong>Success:</strong> {success}
          <button onClick={() => setSuccess("")} className="error-close">
            ×
          </button>
        </div>
      )}

      <div style={{ marginBottom: '20px' }}>
        <button 
          className="btn-add"
          onClick={() => setShowForm(true)}
          style={{ marginRight: '10px' }}
        >
          + Create Recurring Transaction
        </button>
        <button className="btn-refresh" onClick={refreshData}>
          ↻ Refresh
        </button>
      </div>

      {showForm && (
        <div className="modal-overlay">
          <div className="transaction-form">
            <h2>Add Recurring Transaction</h2>
            
            {/* User selection for admin only */}
            {isAdmin && (
              <div className="form-group">
                <label>User: *</label>
                <select
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

            <div className="form-group">
              <label>Description:</label>
              <input
                type="text"
                name="description"
                value={formData.description}
                onChange={handleInputChange}
                placeholder="e.g., Netflix Subscription, Gym Membership"
                required
              />
            </div>

            <div className="form-group">
              <label>Amount:</label>
              <input
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

            <div className="form-group">
              <label>Category:</label>
              <select
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

            <div className="form-group">
              <label>Recurrence Type:</label>
              <select
                name="recurrenceType"
                value={formData.recurrenceType}
                onChange={handleInputChange}
                required
              >
                <option value="DAILY">Daily</option>
                <option value="WEEKLY">Weekly</option>
                <option value="MONTHLY">Monthly</option>
                <option value="YEARLY">Yearly</option>
              </select>
            </div>

            <div className="form-group">
              <label>Next Execution Date: *</label>
              <input
                type="date"
                name="nextExecution"
                value={formData.nextExecution}
                onChange={handleInputChange}
                required
              />
            </div>

            <div className="form-actions">
              <button className="btn-cancel" onClick={resetForm}>
                Cancel
              </button>
              <button 
                className="btn-save" 
                onClick={createRecurringTransaction}
                disabled={
                  !formData.description || 
                  !formData.amount || 
                  !formData.category || 
                  !formData.nextExecution
                }
              >
                Add
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="transactions-table">
        <div className="table-header">
          <span>Description</span>
          <span>Amount</span>
          <span>Category</span>
          <span>Frequency</span>
          <span>Next Date</span>
          <span>Status</span>
          <span>Actions</span>
        </div>
        
        {recurringTransactions.length === 0 ? (
          <div className="no-data">
            No recurring transactions found.{" "}
            <button onClick={() => setShowForm(true)} className="text-link">
              Create your first transaction
            </button>
          </div>
        ) : (
          recurringTransactions.map(transaction => {
            console.log('Transaction row:', transaction); // Debug log
            const daysInfo = getDaysUntilDue(transaction.nextExecution);
            const displayName = getUserDisplayName(transaction);
            
            return (
              <div 
                key={transaction.recurringTransactionId}
                className="table-row"
              >
                <span className="transaction-description">
                  {transaction.description || 'No description'}
                </span>
                <span className="transaction-amount">
                  {formatCurrency(transaction.amount)}
                </span>
                <span className="transaction-category">
                  {transaction.category || 'Uncategorized'}
                </span>
                <span className="recurrence-type">
                  {transaction.recurrenceType?.toLowerCase() || 'N/A'}
                </span>
                <span className="next-execution">
                  {formatDate(transaction.nextExecution)}
                </span>
                <span className={`days-left ${daysInfo.status}`}>
                  {daysInfo.status === 'overdue' && 'Overdue: '}
                  {daysInfo.days}
                  {typeof daysInfo.days === 'number' && ' days'}
                  {daysInfo.status === 'today' && ' (Today)'}
                </span>
                <span className="actions">
                  <button 
                    className="btn-delete"
                    onClick={() => deleteRecurringTransaction(transaction.recurringTransactionId)}
                    title="Delete this recurring transaction"
                  >
                    Delete
                  </button>
                </span>
              </div>
            );
          })
        )}
      </div>

      {recurringTransactions.length > 0 && (
        <div className="transaction-summary">
          <h3>Summary</h3>
          <p>
            Total recurring transactions: <strong>{recurringTransactions.length}</strong>
            {' • '}
            Estimated monthly total: <strong>{formatCurrency(recurringTransactions.reduce((total, t) => {
              if (t.recurrenceType === 'MONTHLY') return total + (t.amount || 0);
              if (t.recurrenceType === 'WEEKLY') return total + (t.amount || 0) * 4;
              if (t.recurrenceType === 'YEARLY') return total + (t.amount || 0) / 12;
              return total + (t.amount || 0) * 30; // Daily
            }, 0))}</strong>
          </p>
        </div>
      )}
    </div>
  );
}

export default RecurringTransactionsSection;