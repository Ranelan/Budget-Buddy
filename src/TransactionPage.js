import React, { useState, useEffect } from "react";
import "./App.css";

const API_BASE = "http://localhost:8081/api/transactions";

function TransactionPage() {
  // State hooks at the top of the component
  const [transactions, setTransactions] = useState([]);
  const [categories, setCategories] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    id: "",
    amount: "",
    description: "",
    categoryId: "",
    type: "Expense",
    date: new Date().toISOString().split("T")[0],
  });
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // Robust helper to discover the current regular user's id in localStorage.
  const getCurrentUserId = () => {
    const explicit = localStorage.getItem('regularUserID') || localStorage.getItem('regularUserId');
    if (explicit) return explicit;
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key && key.toLowerCase().includes('regularuser')) {
        const val = localStorage.getItem(key);
        if (val) return val;
      }
    }
    return null;
  };

  // Load categories and transactions on initial mount
  useEffect(() => {
    fetchCategories();
    fetchTransactions();
  }, []);

  // --- UPDATED AND SECURE fetchTransactions FUNCTION ---
  const fetchTransactions = async () => {
    setLoading(true);
    setError(""); // Clear previous errors on a new fetch
    try {
  const isAdmin = localStorage.getItem('isAdmin') === 'true';
  const currentUser = getCurrentUserId();
      let url = ""; // Initialize url to be determined by logic

      // STRICT LOGIC: Explicitly define which endpoint to use. Fail securely.
      if (isAdmin) {
        // Rule 1: If the user is an admin, allow fetching all transactions.
        url = `${API_BASE}/all`;
      } else if (currentUser) {
        // Rule 2: If not an admin, they MUST have a user ID to fetch their data.
        url = `${API_BASE}/byUser/${currentUser}`;
      } else {
        // Rule 3: Fail securely. If not an admin AND no user ID, do not fetch anything.
        // This prevents falling back to the '/all' endpoint.
        console.warn("Access Denied: No valid user or admin session found. Cannot fetch transactions.", {
          isAdminLocal: localStorage.getItem('isAdmin'),
          regularUserID: localStorage.getItem('regularUserID'),
          regularUserId: localStorage.getItem('regularUserId')
        });
        setTransactions([]); // Ensure the list is empty
        setLoading(false);
        return; // Stop the function here
      }

      const response = await fetch(url);

      if (response.ok) {
        const data = await response.json();
        // Normalize transaction shape so frontend always uses `id` and `categoryId` fields
        const normalized = (data || []).map((t) => ({
          // backend may return `id` or `transactionId`
          id: t.id || t.transactionId || null,
          transactionId: t.transactionId || t.id || null,
          amount: t.amount,
          date: t.date,
          description: t.description,
          type: t.type,
          // category may be nested or top-level
          categoryId: t.categoryId || (t.category && t.category.categoryId) || null,
          category: t.category || null,
          regularUser: t.regularUser || null
        }));
        setTransactions(normalized);
      } else {
        console.error(`Failed to fetch transactions from ${url} with status:`, response.status);
        setError("Could not load transactions.");
        setTransactions([]);
      }
    } catch (err) {
      console.error('An error occurred during fetchTransactions:', err);
      setError("A network error occurred. Please try again.");
      setTransactions([]);
    } finally {
      setLoading(false);
    }
  };

  // This function remains the same, as categories are likely public
  const fetchCategories = async () => {
    try {
      const isAdmin = localStorage.getItem('isAdmin') === 'true';
      const currentUser = getCurrentUserId();
      let url = '';
      if (isAdmin) {
        url = 'http://localhost:8081/api/category/findAll';
      } else if (currentUser) {
        url = `http://localhost:8081/api/category/byUser/${currentUser}`;
      } else {
        console.warn('Categories: no user id or admin flag found; returning empty list.', {
          isAdminLocal: localStorage.getItem('isAdmin'),
          regularUserID: localStorage.getItem('regularUserID'),
          regularUserId: localStorage.getItem('regularUserId')
        });
        setCategories([]);
        return;
      }

      console.log('Fetching categories from', url);
      const response = await fetch(url);
      if (response.ok) {
        const data = await response.json();
        setCategories(data || []);
      } else {
        console.error('Failed to fetch categories from', url, response.status);
        setCategories([]);
      }
    } catch (err) {
      console.error("Failed to fetch categories", err);
      setCategories([]);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    
    try {
      const rawUserId = getCurrentUserId();
      const numericUserId = rawUserId ? Number(rawUserId) : undefined;
      const txId = formData.id;

      // If we're editing, ensure we actually have an id to update
      if (isEditing && !txId) {
        console.error('Attempted to update transaction but no id present in formData');
        setError('Missing transaction id for update');
        return;
      }

      // Build payload without the id field when it's undefined
      const { id, ...rest } = formData;
      const payload = {
        ...rest,
        amount: parseFloat(formData.amount),
        // categoryId should be numeric or null if uncategorized
        // include both nested category object and top-level id (some backends expect one or the other)
        category: formData.categoryId ? { categoryId: Number(formData.categoryId) } : null,
        categoryId: formData.categoryId ? Number(formData.categoryId) : null,
        // Attach ownership information in nested and top-level fields
        regularUser: numericUserId ? { userID: numericUserId } : undefined,
        userId: numericUserId || undefined
      };
      console.log('Submitting transaction payload:', payload);

      let response;
      if (isEditing) {
        // Try primary update endpoint, but fall back to a few alternatives if the backend uses a different URL.
        const tryUpdate = async () => {
          const attempts = [
            { url: `${API_BASE}/update`, method: 'PUT' },
            // some backends expect PUT to /api/transactions/{id}
            ...(txId ? [{ url: `${API_BASE}/${txId}`, method: 'PUT' }] : []),
            // last-resort: some APIs use POST to create with id to upsert
            { url: `${API_BASE}/create`, method: 'POST' }
          ];
          for (const attempt of attempts) {
            try {
              console.log('Attempting transaction update to', attempt.url, attempt.method);
              const res = await fetch(attempt.url, {
                method: attempt.method,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
              });
              if (res.status === 404) {
                console.warn('Update attempt returned 404 for', attempt.url);
                continue; // try next
              }
              if (res.status === 401) {
                // Unauthorized — stop trying further and surface this to the user
                console.error('Update attempt unauthorized for', attempt.url);
                return res;
              }
              return res; // return whatever response (ok or other status)
            } catch (err) {
              console.error('Update attempt failed for', attempt.url, err);
              // try next
            }
          }
          return null;
        };
        response = await tryUpdate();
      } else {
        response = await fetch(`${API_BASE}/create`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload)
        });
      }

      if (response && response.ok) {
        // Try to read response body for debugging
        const text = await response.text().catch(() => '');
        let parsed = null;
        try { parsed = text ? JSON.parse(text) : null; } catch (e) { /* ignore */ }
        console.log('Transaction create/update response:', response.status, text, parsed);
        setShowForm(false);
        setFormData({
          id: "", amount: "", description: "", categoryId: "", type: "Expense", date: new Date().toISOString().split("T")[0],
        });
        setIsEditing(false);
        await fetchTransactions(); // Refresh the list securely
      } else {
        if (!response) {
          console.error('Transaction create/update failed: no response from any attempt');
          setError(isEditing ? 'Failed to update: no response' : 'Failed to create: no response');
        } else {
          const errorText = await response.text().catch(() => '');
          console.error('Transaction create/update failed:', response.status, errorText);
          setError(isEditing ? `Failed to update: ${errorText || response.status}` : `Failed to create: ${errorText || response.status}`);
        }
      }
    } catch (err) {
      setError(isEditing ? "Error updating transaction" : "Error creating transaction");
    }
  };

  const handleEdit = (transaction) => {
    setFormData({
      // Make editing tolerant to either {id} or {transactionId} and nested category
      id: transaction.id || transaction.transactionId,
      amount: transaction.amount != null ? transaction.amount.toString() : '',
      description: transaction.description || '',
      categoryId: transaction.categoryId || (transaction.category && transaction.category.categoryId) || '',
      type: transaction.type || 'Expense',
      date: transaction.date ? new Date(transaction.date).toISOString().split("T")[0] : new Date().toISOString().split("T")[0], // Format date correctly
    });
    setIsEditing(true);
    setShowForm(true);
  };

  const handleDelete = async (id) => {
    try {
      const response = await fetch(`${API_BASE}/delete/${id}`, { method: 'DELETE' });
      if (response.ok) {
        await fetchTransactions(); // Refresh the list securely
      } else {
        setError('Failed to delete transaction');
      }
    } catch (err) {
      setError("Error deleting transaction");
    }
  };

  // Helper functions for formatting (no changes needed)
  const formatDate = (dateString) => new Date(dateString).toLocaleDateString("en-US", { day: "2-digit", month: "short", year: "numeric" });
  const getCategoryName = (categoryId) => {
    if (categoryId === null || categoryId === undefined || categoryId === '') return "Uncategorized";
    const found = categories.find((cat) => String(cat.categoryId) === String(categoryId));
    return found ? found.name : "Uncategorized";
  };
  const formatAmount = (amount, type) => type === "Income" ? `+R ${amount.toFixed(2)}` : `-R ${amount.toFixed(2)}`;

  // JSX rendering code (no changes needed, it remains the same)
  return (
    <div style={{ minHeight: '100vh', padding: '2em' }}>
      {loading && <div style={{position: 'fixed', top: 80, right: 20}}>Loading...</div>}
      <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
        {/* Compact Transactions Header */}
        <div style={{ background: 'white', borderRadius: '16px', padding: '1.25em', marginBottom: '1.5em', boxShadow: '0 4px 20px rgba(0,0,0,0.06)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <h2 style={{ color: '#2d3748', margin: 0, fontSize: '1.5em', fontWeight: '600' }}>Transactions</h2>
            <button 
              onClick={() => setShowForm(true)}
              style={{
                background: '#4299e1', color: 'white', border: 'none', padding: '0.6em 1.1em', borderRadius: '8px',
                fontSize: '0.95em', fontWeight: '600', cursor: 'pointer', boxShadow: '0 2px 10px rgba(66, 153, 225, 0.2)',
                transition: 'all 0.2s ease'
              }}
              onMouseOver={(e) => e.target.style.background = '#3182ce'}
              onMouseOut={(e) => e.target.style.background = '#4299e1'}
            >
              + Add Transaction
            </button>
          </div>
        </div>

        {/* Error Message */}
        {error && (
          <div style={{ background: '#fed7d7', color: '#c53030', padding: '1em', borderRadius: '8px', marginBottom: '1em', border: '1px solid #feb2b2' }}>
            {error}
          </div>
        )}

        {/* Transaction Form Modal */}
        {showForm && (
          <div style={{
            position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.5)',
            display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000
          }}>
            <div style={{ background: 'white', borderRadius: '16px', padding: '2.5em', width: '90%', maxWidth: '500px', boxShadow: '0 10px 40px rgba(0,0,0,0.2)'}}>
              <h2 style={{ color: '#2d3748', margin: '0 0 1.5em 0', fontSize: '1.5em', fontWeight: '600' }}>
                {isEditing ? "Update Transaction" : "Add New Transaction"}
              </h2>
              <form onSubmit={handleSubmit}>
                <div style={{ display: 'flex', gap: '1em', marginBottom: '1em' }}>
                  <input type="number" name="amount" placeholder="Amount (R)" value={formData.amount} onChange={handleInputChange} required min="0" step="0.01" style={{ flex: 1, padding: '0.75em', borderRadius: '8px', border: '1px solid #e2e8f0', background: '#f7fafc', color: '#2d3748', fontSize: '1em' }}/>
                  <select name="type" value={formData.type} onChange={handleInputChange} style={{ padding: '0.75em', borderRadius: '8px', border: '1px solid #e2e8f0', background: '#f7fafc', color: '#2d3748', fontSize: '1em', minWidth: '120px' }}>
                    <option value="Expense">Expense</option>
                    <option value="Income">Income</option>
                  </select>
                </div>
                <input type="text" name="description" placeholder="Description" value={formData.description} onChange={handleInputChange} required style={{ width: '100%', padding: '0.75em', borderRadius: '8px', border: '1px solid #e2e8f0', background: '#f7fafc', color: '#2d3748', marginBottom: '1em', fontSize: '1em' }} />
                <select name="categoryId" value={formData.categoryId} onChange={handleInputChange} style={{ width: '100%', padding: '0.75em', borderRadius: '8px', border: '1px solid #e2e8f0', background: '#f7fafc', color: '#2d3748', marginBottom: '1em', fontSize: '1em' }}>
                  <option value="">Uncategorized</option>
                  {categories.map((cat) => (<option key={cat.categoryId} value={cat.categoryId}>{cat.name}</option>))}
                </select>
                <input type="date" name="date" value={formData.date} onChange={handleInputChange} required style={{ width: '100%', padding: '0.75em', borderRadius: '8px', border: '1px solid #e2e8f0', background: '#f7fafc', color: '#2d3748', marginBottom: '2em', fontSize: '1em' }}/>
                <div style={{ display: 'flex', gap: '1em', justifyContent: 'flex-end' }}>
                  <button type="button" onClick={() => { setShowForm(false); setIsEditing(false); setFormData({ id: "", amount: "", description: "", categoryId: "", type: "Expense", date: new Date().toISOString().split("T")[0] }); }} style={{ padding: '0.75em 1.5em', borderRadius: '8px', border: '1px solid #e2e8f0', background: 'transparent', color: '#718096', cursor: 'pointer', fontSize: '1em', fontWeight: '600', transition: 'all 0.2s ease' }} onMouseOver={(e) => { e.target.style.background = '#f7fafc'; e.target.style.color = '#2d3748'; }} onMouseOut={(e) => { e.target.style.background = 'transparent'; e.target.style.color = '#718096'; }}>Cancel</button>
                  <button type="submit" style={{ padding: '0.75em 1.5em', borderRadius: '8px', border: 'none', background: '#4299e1', color: 'white', cursor: 'pointer', fontSize: '1em', fontWeight: '600', transition: 'all 0.2s ease' }} onMouseOver={(e) => e.target.style.background = '#3182ce'} onMouseOut={(e) => e.target.style.background = '#4299e1'}>
                    {isEditing ? "Update Transaction" : "Add Transaction"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Transactions List */}
        <div>
          {transactions.length === 0 && !loading ? (
            <div style={{ background: 'white', color: '#718096', textAlign: 'center', padding: '3em', borderRadius: '16px', boxShadow: '0 4px 20px rgba(0,0,0,0.1)' }}>No transactions yet.</div>
          ) : (
            transactions.map((t) => (
              <div key={t.id} style={{
                background: 'white', borderRadius: '16px', padding: '1.5em 2em', marginBottom: '1em', display: 'flex',
                alignItems: 'center', justifyContent: 'space-between', boxShadow: '0 2px 12px rgba(0,0,0,0.08)',
                transition: 'transform 0.2s ease, box-shadow 0.2s ease'
              }}
              onMouseOver={(e) => { e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.boxShadow = '0 4px 20px rgba(0,0,0,0.12)'; }}
              onMouseOut={(e) => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = '0 2px 12px rgba(0,0,0,0.08)'; }}
              >
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5em', flex: 1 }}>
                  <div style={{ color: '#2d3748', fontWeight: '600', fontSize: '1.1em' }}>{t.description}</div>
                  <div style={{ color: '#4299e1', fontSize: '1em', fontWeight: '500' }}>{getCategoryName(t.categoryId)}</div>
                  <div style={{ color: '#a0aec0', fontSize: '0.95em' }}>{formatDate(t.date)}</div>
                </div>
                <div style={{ color: t.type === 'Income' ? '#48bb78' : '#f56565', fontWeight: '700', fontSize: '1.2em', marginRight: '2em' }}>
                  {formatAmount(t.amount, t.type)}
                </div>
                <div style={{ display: 'flex', flexDirection: 'row', gap: '0.75em', alignItems: 'center' }}>
                  <button onClick={() => handleEdit(t)} style={{ padding: '0.5em 1em', borderRadius: '6px', border: '1px solid #4299e1', background: 'transparent', color: '#4299e1', cursor: 'pointer', minWidth: '80px', fontSize: '0.9em', fontWeight: '600', transition: 'all 0.2s ease' }} onMouseOver={(e) => { e.target.style.background = '#4299e1'; e.target.style.color = 'white'; }} onMouseOut={(e) => { e.target.style.background = 'transparent'; e.target.style.color = '#4299e1'; }}>Update</button>
                  <button onClick={() => handleDelete(t.id)} style={{ padding: '0.5em 1em', borderRadius: '6px', border: '1px solid #f56565', background: 'transparent', color: '#f56565', cursor: 'pointer', minWidth: '80px', fontSize: '0.9em', fontWeight: '600', transition: 'all 0.2s ease' }} onMouseOver={(e) => { e.target.style.background = '#f56565'; e.target.style.color = 'white'; }} onMouseOut={(e) => { e.target.style.background = 'transparent'; e.target.style.color = '#f56565'; }}>Delete</button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}

export default TransactionPage;