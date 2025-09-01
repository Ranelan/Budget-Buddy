import React, { useState, useEffect } from 'react';
import './App.css';

const RECURRING_BASE_URL = 'http://localhost:8081/api/recurringTransactions';
const USERS_URL = 'http://localhost:8081/api/regularUser/findAll';

function RecurringTransactionsSection() {
  const [recurringTransactions, setRecurringTransactions] = useState([]);
  const [users, setUsers] = useState([]);
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
  
  const isAdmin = localStorage.getItem("adminID") !== null;
  const currentUserId = localStorage.getItem("regularUserID");
  const currentUserRole = isAdmin ? 'admin' : 'user';

  useEffect(() => {
    if (isAdmin) {
      Promise.all([fetchAllRecurringTransactions(), fetchUsers()]);
    } else if (currentUserId) {
      fetchUserRecurringTransactions();
    } else {
      setError("User not logged in");
      setLoading(false);
    }
  }, [isAdmin, currentUserId]);

  const fetchAllRecurringTransactions = async () => {
    setLoading(true);
    setError("");
    
    try {
      const response = await fetch(`${RECURRING_BASE_URL}/findAll`);
      
      if (!response.ok) {
        throw new Error(`Server returned ${response.status}`);
      }
      
      const data = await response.json();
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
      
      const allTransactions = await response.json();

      const userTransactions = allTransactions.filter(transaction => 
        transaction.regularUser?.userID == currentUserId || 
        transaction.userId == currentUserId
      );
      
      setRecurringTransactions(userTransactions);
      
    } catch (err) {
      console.error('Fetch error:', err);
      setError(`Failed to fetch your transactions: ${err.message}`);
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

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    setError("");
    setSuccess("");
  };

  const createRecurringTransaction = async () => {
    if (!isAdmin && !currentUserId) {
      setError("Please log in to create transactions");
      return;
    }

    if (isAdmin && !formData.userId) {
      setError("Please select a user");
      return;
    }

    if (!formData.nextExecution) {
      setError("Please select a next execution date");
      return;
    }

    try {
      const targetUserId = isAdmin ? parseInt(formData.userId) : parseInt(currentUserId);
      
      const payload = {
        recurrenceType: formData.recurrenceType,
        nextExecution: formData.nextExecution,
        amount: parseFloat(formData.amount) || 0,
        description: formData.description,
        category: formData.category,
        regularUser: {
          userID: targetUserId
        }
      };

      console.log('Creating transaction:', payload);

      const response = await fetch(`${RECURRING_BASE_URL}/create`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify(payload)
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Failed to create: ${response.status} - ${errorText}`);
      }

      const createdTransaction = await response.json();
      
      if (isAdmin) {
        fetchAllRecurringTransactions();
      } else {
        fetchUserRecurringTransactions();
      }
      
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
        const response = await fetch(`${RECURRING_BASE_URL}/delete/${id}`, { 
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

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
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
    if (isAdmin) {
      fetchAllRecurringTransactions();
      fetchUsers();
    } else {
      fetchUserRecurringTransactions();
    }
  };

  if (loading) {
    return (
      <div className="dashboard-content">
        <h2>{isAdmin ? 'Recurring Transactions Management' : 'My Recurring Transactions'}</h2>
        <div className="loading">Loading {isAdmin ? 'all' : 'your'} transactions...</div>
      </div>
    );
  }

  return (
    <div className="dashboard-content">
      <h2>{isAdmin ? 'Recurring Transactions Management' : 'My Recurring Transactions'}</h2>
      
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
          + {isAdmin ? 'Create' : 'Add'} Recurring Transaction
        </button>
        <button className="btn-refresh" onClick={refreshData}>
          ↻ Refresh
        </button>
      </div>

      {showForm && (
        <div className="modal-overlay">
          <div className="transaction-form">
            <h2>{isAdmin ? 'Create' : 'Add'} Recurring Transaction</h2>
            
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
              <input
                type="text"
                name="category"
                value={formData.category}
                onChange={handleInputChange}
                placeholder="e.g., Entertainment, Utilities"
                required
              />
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
                  (isAdmin ? !formData.userId : false) || 
                  !formData.description || 
                  !formData.amount || 
                  !formData.category || 
                  !formData.nextExecution
                }
              >
                {isAdmin ? 'Create' : 'Add'}
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="transactions-table">
        <div className="table-header">
          {isAdmin && <span>User</span>}
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
              {isAdmin ? 'Create' : 'Add'} your first transaction
            </button>
          </div>
        ) : (
          recurringTransactions.map(transaction => {
            const daysInfo = getDaysUntilDue(transaction.nextExecution);
            const displayName = getUserDisplayName(transaction);
            
            return (
              <div 
                key={transaction.recurringTransactionId}
                className="table-row"
              >
                {isAdmin && (
                  <span className="user-name">{displayName}</span>
                )}
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
            {isAdmin && ` across ${new Set(recurringTransactions.map(t => t.regularUser?.userID)).size} users`}
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