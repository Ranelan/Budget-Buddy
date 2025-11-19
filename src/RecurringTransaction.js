import React, { useState, useEffect } from 'react';
import './App.css';

const RECURRING_BASE_URL = 'http://localhost:8081/api/recurringTransactions';
const USERS_URL = 'http://localhost:8081/api/regularUser'; // Assuming this is the correct URL for users
const CATEGORIES_URL = 'http://localhost:8081/api/category';

function RecurringTransactionsSection() {
  const [recurringTransactions, setRecurringTransactions] = useState([]);
  const [users, setUsers] = useState([]);
  const [categories, setCategories] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(true);
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
  
  // Tolerant helper to read current regular user id from localStorage
  const getCurrentUserId = () => {
    return (
      localStorage.getItem('regularUserID') ||
      localStorage.getItem('regularUserId') ||
      localStorage.getItem('regularuserID') ||
      localStorage.getItem('regularuserid') ||
      null
    );
  };

  const isAdmin = localStorage.getItem("isAdmin") === "true";
  
  useEffect(() => {
    fetchAllRecurringTransactions();
    fetchCategories();
    if (isAdmin) {
      fetchUsers();
    }
  }, [isAdmin]); // Re-run if admin status changes, though unlikely in a session

  // --- UPDATED AND SECURE fetchAllRecurringTransactions FUNCTION ---
  const fetchAllRecurringTransactions = async () => {
    setLoading(true);
    setError("");
    try {
  const isAdminFlag = localStorage.getItem("isAdmin") === "true";
  const currentUser = getCurrentUserId();
      let url = "";

      // STRICT LOGIC: Explicitly define the endpoint. Fail securely.
      if (isAdminFlag) {
        // Rule 1: If user is an admin, allow fetching all recurring transactions.
        url = `${RECURRING_BASE_URL}/findAll`;
      } else if (currentUser) {
        // Rule 2: If not an admin, they MUST have a user ID to fetch their own data.
        url = `${RECURRING_BASE_URL}/byUser/${currentUser}`;
      } else {
        // Rule 3: Fail securely. If not an admin AND no user ID, do not fetch anything.
        console.warn("Access Denied: No valid user or admin session found. Cannot fetch recurring transactions.");
        setRecurringTransactions([]); // Ensure the list is empty
        setLoading(false);
        return; // Stop the function here
      }
      
      const response = await fetch(url);
      if (!response.ok) {
        throw new Error(`Server returned ${response.status} from ${url}`);
      }
      
      const data = await response.json();
      // Normalize recurring transaction objects so the UI can rely on consistent fields
      const normalized = (data || []).map((t) => ({
        recurringTransactionId: t.recurringTransactionId ?? t.id ?? t.recurringId ?? null,
        amount: t.amount ?? t.value ?? 0,
        description: t.description ?? t.title ?? '',
        recurrenceType: t.recurrenceType ?? t.frequency ?? 'MONTHLY',
        nextExecution: t.nextExecution ?? t.nextExecutionDate ?? t.nextRun ?? null,
        category: t.category ?? (t.categoryId ? { categoryId: t.categoryId } : null),
        regularUser: t.regularUser ?? (t.userId ? { userID: t.userId } : null),
        // preserve other fields if needed
        ...t
      }));
      setRecurringTransactions(normalized);

    } catch (err) {
      console.error('Fetch recurring transactions error:', err);
      setError(`Failed to fetch transactions: ${err.message}`);
      setRecurringTransactions([]); // Clear data on error
    } finally {
      setLoading(false);
    }
  };

  const fetchUsers = async () => {
    try {
      const response = await fetch(USERS_URL);
      if (!response.ok) throw new Error(`Failed to fetch users: ${response.status}`);
      const data = await response.json();
      setUsers(data);
    } catch (err) {
      console.error('Failed to fetch users:', err);
    }
  };

  const fetchCategories = async () => {
    try {
      // Categories can be fetched for the current user or globally
      const currentUser = getCurrentUserId();
      const url = currentUser ? `${CATEGORIES_URL}/byUser/${currentUser}` : CATEGORIES_URL;
      const response = await fetch(url);
      if (!response.ok) throw new Error("Failed to fetch categories");
      const data = await response.json();
      // Normalize category objects to ensure a consistent shape for the UI
      const normalized = (data || []).map((c) => {
        const rawId = c.categoryId ?? c.id ?? c.categoryID ?? c.category_id ?? null;
        return {
          categoryId: rawId != null ? Number(rawId) : null,
          name: c.name ?? c.categoryName ?? c.label ?? 'Unnamed',
        };
      });
      setCategories(normalized);
      return normalized;
    } catch (err) {
      console.error("Failed to fetch categories", err);
      return [];
    }
  };

  // Open the form pre-filled for editing a recurring transaction
  const handleEdit = async (recurring) => {
    try {
      // Ensure categories are loaded so the select shows the current value
      const cats = await fetchCategories();

      const catId = recurring.category?.categoryId ?? recurring.categoryId ?? null;

      setFormData({
        recurrenceType: recurring.recurrenceType ?? recurring.frequency ?? 'MONTHLY',
        nextExecution: recurring.nextExecution ? new Date(recurring.nextExecution).toISOString().split('T')[0] : new Date().toISOString().split('T')[0],
        amount: recurring.amount != null ? String(recurring.amount) : '',
        description: recurring.description ?? '',
        category: catId != null ? String(catId) : '',
        userId: recurring.regularUser?.userID ? String(recurring.regularUser.userID) : (recurring.userId ? String(recurring.userId) : ''),
        // store id for update operations
        id: recurring.recurringTransactionId ?? recurring.id ?? null,
      });

      setIsEditing(true);
      setShowForm(true);
    } catch (err) {
      console.error('Failed to prepare edit form:', err);
      setError('Failed to open edit form.');
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  // --- UPDATED AND SAFER createRecurringTransaction ---
  const createRecurringTransaction = async () => {
    setError("");
    setSuccess("");

    // Determine the user ID safely
    let targetUserId;
    if (isAdmin) {
      targetUserId = formData.userId; // Admin chooses from the form
    } else {
      targetUserId = getCurrentUserId(); // Non-admin can only create for themselves
    }

    // Block submission if a user ID could not be determined
    if (!targetUserId) {
      setError("Could not determine a valid user for this transaction. Please log in or select a user.");
      return;
    }

    try {
      const payload = {
        recurrenceType: formData.recurrenceType,
        nextExecution: formData.nextExecution,
        description: formData.description,
        amount: Number(formData.amount),
        category: { categoryId: Number(formData.category) },
        // Safely associate with the determined user
        regularUser: { userID: Number(targetUserId) }
      };

      const response = await fetch(`${RECURRING_BASE_URL}/create`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      
      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Server returned ${response.status}: ${errorText}`);
      }
      
      await response.json(); // We don't need the result, but good to confirm it's valid JSON
      
  await fetchAllRecurringTransactions();
  resetForm();
  setIsEditing(false);
      setSuccess('Recurring transaction created successfully!');
      setTimeout(() => setSuccess(''), 3000);

    } catch (err) {
      console.error('Create recurring transaction error:', err);
      setError(err.message || 'An error occurred while creating the transaction');
    }
  };

  const updateRecurringTransaction = async () => {
    setError("");
    setSuccess("");
    // require id to update
    const id = formData.id;
    if (!id) {
      setError('Missing recurring transaction id for update.');
      return;
    }

    // prepare payload similar to create but with id and top-level fields
      // Build payload strictly matching controller expectations:
      // { recurringTransactionId, recurrenceType, nextExecution, amount, description, category: { categoryId }, regularUser: { userID } }
      const existing = recurringTransactions.find(r => String(r.recurringTransactionId) === String(id));

      const categoryIdNum = formData.category ? Number(formData.category) : (existing?.category?.categoryId ?? null);
      const userIdNum = formData.userId ? Number(formData.userId) : (existing?.regularUser?.userID ?? null) || (getCurrentUserId() ? Number(getCurrentUserId()) : null);

      if (!categoryIdNum || !userIdNum) {
        setError('Update requires a valid category and user. Please ensure both are set.');
        return;
      }

      const payload = {
        recurringTransactionId: id,
        recurrenceType: formData.recurrenceType,
        nextExecution: formData.nextExecution,
        amount: Number(formData.amount),
        description: formData.description,
        category: { categoryId: Number(categoryIdNum) },
        regularUser: { userID: Number(userIdNum) }
      };

      // Primary endpoint per controller
      const endpoint = `${RECURRING_BASE_URL}/update`;
      try {
        console.debug('Updating recurring transaction with payload:', payload);
        const res = await fetch(endpoint, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload)
        });
        const text = await res.text().catch(() => '');
        if (res.ok) {
          // server returns the updated object
          await fetchAllRecurringTransactions();
          resetForm();
          setIsEditing(false);
          setSuccess('Recurring transaction updated successfully!');
          setTimeout(() => setSuccess(''), 3000);
          return;
        } else {
          console.warn(`Endpoint ${endpoint} returned ${res.status}: ${text}`);
          setError(`Failed to update recurring transaction: ${text || res.status}`);
          return;
        }
      } catch (err) {
        console.error('Network error updating recurring transaction', err);
        setError('Network error while updating recurring transaction');
      }
  };

  const deleteRecurringTransaction = async (id) => {
    if (window.confirm('Are you sure you want to delete this recurring transaction?')) {
      setError("");
      setSuccess("");
      try {
        const response = await fetch(`${RECURRING_BASE_URL}/delete/${id}`, { method: 'DELETE' });
        if (response.status === 204 || response.ok) {
          setRecurringTransactions(prev => prev.filter(t => t.recurringTransactionId !== id));
          setSuccess('Transaction deleted successfully!');
          setTimeout(() => setSuccess(''), 3000);
        } else {
          throw new Error('Failed to delete transaction on the server');
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
    setIsEditing(false);
    setError("");
  };
  
  // Helper functions (getDaysUntilDue, formatDate, formatCurrency) remain the same
  const getDaysUntilDue = (nextExecution) => {
    if (!nextExecution) return { days: 'N/A', status: 'unknown' };
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
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'Not set';
    return new Date(dateString).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
  };

  const formatCurrency = (amount) => new Intl.NumberFormat('en-ZA', { style: 'currency', currency: 'ZAR' }).format(amount || 0);

  const getCategoryName = (categoryOrId) => {
    if (categoryOrId == null) return 'Uncategorized';
    const id = typeof categoryOrId === 'object' ? (categoryOrId.categoryId ?? categoryOrId.id) : categoryOrId;
    if (id == null) return 'Uncategorized';
    const target = categories.find(c => String(c.categoryId) === String(id));
    return target?.name || 'Uncategorized';
  };
  
  // JSX rendering code (no significant changes needed)
  if (loading) {
    return (
      <div className="recurring-page-container">
        <div className="recurring-loading">
          <div className="loading-spinner"></div><p>Loading your transactions...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="recurring-page-container">
      <div className="recurring-page-wrapper">
        <header className="recurring-page-header">
          <div className="recurring-header-content">
            <div className="recurring-header-icon"><i className="fas fa-sync-alt"></i></div>
            <div className="recurring-header-text">
              <h1 className="recurring-page-title">Recurring Transactions</h1>
              <p className="recurring-page-subtitle">Manage your subscriptions and automated payments</p>
            </div>
          </div>
          <div className="recurring-header-actions">
            <button className="btn-secondary" onClick={fetchAllRecurringTransactions}><i className="fas fa-sync-alt"></i> Refresh</button>
            <button className="btn-primary" onClick={() => { setIsEditing(false); setShowForm(true); }}><i className="fas fa-plus"></i> New Transaction</button>
          </div>
        </header>
      
        {error && (<div className="alert alert-error"><i className="fas fa-exclamation-circle"></i><span>{error}</span><button onClick={() => setError("")} className="alert-close"><i className="fas fa-times"></i></button></div>)}
        {success && (<div className="alert alert-success"><i className="fas fa-check-circle"></i><span>{success}</span><button onClick={() => setSuccess("")} className="alert-close"><i className="fas fa-times"></i></button></div>)}

        {showForm && (
          <div className="recurring-modal-overlay" onClick={(e) => { if (e.target.className === 'recurring-modal-overlay') resetForm(); }}>
            <div className="recurring-modal">
              <div className="modal-header">
                <h2>{isEditing ? (<><i className="fas fa-edit"></i> Edit Recurring Transaction</>) : (<><i className="fas fa-plus-circle"></i> Add Recurring Transaction</>)}</h2>
                <button className="modal-close" onClick={resetForm}><i className="fas fa-times"></i></button>
              </div>
              <div className="modal-body">
                {isAdmin && (
                  <div className="modern-form-group">
                    <label htmlFor="userId"><i className="fas fa-user"></i> User *</label>
                    <select id="userId" name="userId" value={formData.userId} onChange={handleInputChange} required>
                      <option value="">Select User</option>
                      {users.map(user => (<option key={user.userID} value={String(user.userID)}>{user.userName || `User #${user.userID}`}</option>))}
                    </select>
                  </div>
                )}
                <div className="modern-form-group">
                  <label htmlFor="description"><i className="fas fa-align-left"></i> Description *</label>
                  <input id="description" type="text" name="description" value={formData.description} onChange={handleInputChange} placeholder="e.g., Netflix Subscription" required />
                </div>
                <div className="modern-form-group">
                  <label htmlFor="amount"><i className="fas fa-money-bill-wave"></i> Amount *</label>
                  <input id="amount" type="number" name="amount" value={formData.amount} onChange={handleInputChange} placeholder="0.00" step="0.01" min="0" required />
                </div>
                <div className="modern-form-group">
                  <label htmlFor="category"><i className="fas fa-tags"></i> Category *</label>
                  <select id="category" name="category" value={formData.category} onChange={handleInputChange} required>
                    <option value="">Select Category</option>
                    {categories.map(cat => (<option key={cat.categoryId} value={String(cat.categoryId)}>{cat.name}</option>))}
                  </select>
                </div>
                <div className="modern-form-group">
                  <label htmlFor="recurrenceType"><i className="fas fa-redo-alt"></i> Recurrence Type *</label>
                  <select id="recurrenceType" name="recurrenceType" value={formData.recurrenceType} onChange={handleInputChange} required>
                    <option value="DAILY">📅 Daily</option><option value="WEEKLY">📅 Weekly</option><option value="MONTHLY">📅 Monthly</option><option value="YEARLY">📅 Yearly</option>
                  </select>
                </div>
                <div className="modern-form-group">
                  <label htmlFor="nextExecution"><i className="fas fa-calendar-alt"></i> Next Execution Date *</label>
                  <input id="nextExecution" type="date" name="nextExecution" value={formData.nextExecution} onChange={handleInputChange} required />
                </div>
              </div>
              <div className="modal-footer">
                        <button className="btn-secondary" onClick={resetForm}><i className="fas fa-times"></i> Cancel</button>
                        {isEditing ? (
                          <button className="btn-primary" onClick={updateRecurringTransaction} disabled={!formData.description || !formData.amount || !formData.category || (isAdmin && !formData.userId)}><i className="fas fa-save"></i> Update</button>
                        ) : (
                          <button className="btn-primary" onClick={createRecurringTransaction} disabled={!formData.description || !formData.amount || !formData.category || (isAdmin && !formData.userId)}><i className="fas fa-plus"></i> Create</button>
                        )}
              </div>
            </div>
          </div>
        )}

        <div className="recurring-table-container">
          {recurringTransactions.length === 0 ? (
            <div className="recurring-empty-state">
              <div className="empty-state-icon"><i className="fas fa-sync-alt"></i></div>
              <h3>No Recurring Transactions</h3><p>Set up automated transactions to track your subscriptions.</p>
              <button className="btn-primary" onClick={() => { setIsEditing(false); setShowForm(true); }}><i className="fas fa-plus"></i> Create Your First Transaction</button>
            </div>
          ) : (
            <div className="recurring-table-wrapper">
              <table className="recurring-modern-table">
                <thead><tr><th>Description</th><th>Amount</th><th>Category</th><th>Frequency</th><th>Next Date</th><th>Status</th><th className="text-center">Actions</th></tr></thead>
                <tbody>
                  {recurringTransactions.map(t => {
                    const daysInfo = getDaysUntilDue(t.nextExecution);
                    return (
                      <tr key={t.recurringTransactionId} className="recurring-row">
                        <td><div className="transaction-description">{t.description || 'N/A'}</div></td>
                        <td><span className="transaction-amount">{formatCurrency(t.amount)}</span></td>
                        <td><span className="transaction-category-badge">{getCategoryName(t.category?.categoryId ?? t.categoryId)}</span></td>
                        <td><span className="frequency-badge">{t.recurrenceType}</span></td>
                        <td><span className="next-execution-date">{formatDate(t.nextExecution)}</span></td>
                        <td><span className={`status-badge status-${daysInfo.status}`}>{daysInfo.status === 'overdue' ? '⚠️ Overdue' : daysInfo.status === 'today' ? '🔔 Today' : daysInfo.status === 'urgent' ? `⏰ ${daysInfo.days} days` : `✓ ${daysInfo.days} days`}</span></td>
                        <td className="text-center">
                          <button className="btn-primary btn-sm" onClick={() => handleEdit(t)} title="Edit">
                            <i className="fas fa-edit"></i> Update
                          </button>
                          <button style={{ marginLeft: '8px' }} className="btn-danger btn-sm" onClick={() => deleteRecurringTransaction(t.recurringTransactionId)} title="Delete">
                            <i className="fas fa-trash"></i> Delete
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default RecurringTransactionsSection;