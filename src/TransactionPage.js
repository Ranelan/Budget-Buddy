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

  // Helper to get current user ID
  const getCurrentUserId = () => {
    return localStorage.getItem('regularUserID') || localStorage.getItem('regularUserId');
  };

  // Load categories and transactions on initial mount
  useEffect(() => {
    fetchCategories();
    fetchTransactions();
  }, []);

  const fetchTransactions = async () => {
    setLoading(true);
    setError("");
    try {
      const isAdmin = localStorage.getItem('isAdmin') === 'true';
      const currentUser = getCurrentUserId();
      let url = "";

      if (isAdmin) {
        url = `${API_BASE}/all`;
      } else if (currentUser) {
        url = `${API_BASE}/byUser/${currentUser}`;
      } else {
        console.warn("Access Denied: No valid user or admin session found.");
        setTransactions([]);
        setLoading(false);
        return;
      }

      const response = await fetch(url);

      if (response.ok) {
        const data = await response.json();
        const normalized = (data || []).map((t) => ({
          id: t.id || t.transactionId,
          amount: t.amount,
          date: t.date,
          description: t.description,
          type: t.type,
          categoryId: t.categoryId || t.category?.categoryId,
        }));
        setTransactions(normalized);
      } else {
        setError("Could not load transactions.");
        setTransactions([]);
      }
    } catch (err) {
      setError("A network error occurred. Please try again.");
      setTransactions([]);
    } finally {
      setLoading(false);
    }
  };

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
        setCategories([]);
        return;
      }
      const response = await fetch(url);
      if (response.ok) {
        setCategories(await response.json() || []);
      } else {
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

      let response;
      let endpoint;
      let method;

      // Define the base payload shared by both create and update
      const basePayload = {
        amount: parseFloat(formData.amount),
        description: formData.description,
        type: formData.type,
        date: formData.date,
        category: formData.categoryId ? { categoryId: Number(formData.categoryId) } : null,
        regularUser: numericUserId ? { userID: numericUserId } : undefined,
      };

      if (isEditing) {
        // For UPDATING, add the transaction ID to the payload
        if (!formData.id) {
          setError("Cannot update: Missing transaction ID.");
          return;
        }

        // Build a robust payload: include nested category object AND top-level categoryId
        // Also include nested regularUser and top-level userId for compatibility with different backends
        const updatePayload = {
          ...basePayload,
          transactionId: formData.id,
          categoryId: formData.categoryId ? Number(formData.categoryId) : undefined,
          userId: rawUserId ? Number(rawUserId) : undefined,
        };



        // Try multiple update endpoints to handle backend variations.
        // 1) PUT /api/transactions/{id}
        // 2) PUT /api/transactions/update
        // 3) POST /api/transactions/create (fallback - server may treat create as upsert)

        const tryEndpoints = [
          { url: `${API_BASE}/${formData.id}`, method: 'PUT' },
          { url: `${API_BASE}/update`, method: 'PUT' },
          { url: `${API_BASE}/create`, method: 'POST' }
        ];

        let lastError = null;
        for (const ep of tryEndpoints) {
          try {
            console.debug(`Attempting ${ep.method} ${ep.url}`);
            const res = await fetch(`${API_BASE}/update`, {
  method: 'PUT',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify(updatePayload)
});

            if (res.ok) {
              response = res; // mark success and break
              break;
            } else {
              // capture last error text for helpful message
              const txt = await res.text().catch(() => `HTTP ${res.status}`);
              lastError = `Endpoint ${ep.url} returned ${res.status}: ${txt}`;
              console.warn(lastError);
            }
          } catch (err) {
            lastError = err.message || String(err);
            console.warn(`Network error for ${ep.url}:`, err);
          }
        }

        if (!response) {
          setError(`Failed to update transaction. ${lastError || 'No response from server.'}`);
          return;
        }
      } else {
        // For CREATING, use the payload without an ID
        // ensure create payload also contains categoryId and userId fields
        const createPayload = {
          ...basePayload,
          categoryId: formData.categoryId ? Number(formData.categoryId) : undefined,
          userId: rawUserId ? Number(rawUserId) : undefined,
        };

        endpoint = `${API_BASE}/create`;
        method = 'POST';
        response = await fetch(endpoint, {
          method: method,
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(createPayload)
        });
      }

      if (response.ok) {
        setShowForm(false);
        setFormData({
          id: "", amount: "", description: "", categoryId: "", type: "Expense", date: new Date().toISOString().split("T")[0],
        });
        setIsEditing(false);
        await fetchTransactions(); // Refresh the list
      } else {
        const errorText = await response.text().catch(() => `HTTP Status ${response.status}`);
        setError(`Failed to ${isEditing ? 'update' : 'create'} transaction: ${errorText}`);
      }
    } catch (err) {
      console.error(`Error during form submission:`, err);
      setError(`A network error occurred while ${isEditing ? 'updating' : 'creating'} the transaction.`);
    }
  };

  const handleEdit = (transaction) => {
    setFormData({
      id: transaction.id || transaction.transactionId,
      amount: transaction.amount?.toString() || '',
      description: transaction.description || '',
      categoryId: transaction.categoryId || '',
      type: transaction.type || 'Expense',
      date: transaction.date ? new Date(transaction.date).toISOString().split("T")[0] : new Date().toISOString().split("T")[0],
    });
    setIsEditing(true);
    setShowForm(true);
  };

  const handleDelete = async (id) => {
    try {
      const response = await fetch(`${API_BASE}/delete/${id}`, { method: 'DELETE' });
      if (response.ok) {
        await fetchTransactions();
      } else {
        setError('Failed to delete transaction');
      }
    } catch (err) {
      setError("Error deleting transaction");
    }
  };

  const formatDate = (dateString) => new Date(dateString).toLocaleDateString("en-US", { day: "2-digit", month: "short", year: "numeric" });
  const getCategoryName = (categoryId) => categories.find((cat) => String(cat.categoryId) === String(categoryId))?.name || "Uncategorized";
  const formatAmount = (amount, type) => type === "Income" ? `+R ${Number(amount).toFixed(2)}` : `-R ${Number(amount).toFixed(2)}`;

  return (
    <div style={{ minHeight: '100vh', padding: '2em' }}>
      {loading && <div style={{position: 'fixed', top: 80, right: 20}}>Loading...</div>}
      <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
        <div style={{ background: 'white', borderRadius: '16px', padding: '1.25em', marginBottom: '1.5em', boxShadow: '0 4px 20px rgba(0,0,0,0.06)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <h2 style={{ color: '#2d3748', margin: 0, fontSize: '1.5em', fontWeight: '600' }}>Transactions</h2>
            <button 
              onClick={() => setShowForm(true)}
              style={{ background: '#4299e1', color: 'white', border: 'none', padding: '0.6em 1.1em', borderRadius: '8px', fontSize: '0.95em', fontWeight: '600', cursor: 'pointer', boxShadow: '0 2px 10px rgba(66, 153, 225, 0.2)', transition: 'all 0.2s ease' }}
              onMouseOver={(e) => e.target.style.background = '#3182ce'}
              onMouseOut={(e) => e.target.style.background = '#4299e1'}
            >
              + Add Transaction
            </button>
          </div>
        </div>

        {error && (<div style={{ background: '#fed7d7', color: '#c53030', padding: '1em', borderRadius: '8px', marginBottom: '1em', border: '1px solid #feb2b2' }}>{error}</div>)}

        {showForm && (
          <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
            <div style={{ background: 'white', borderRadius: '16px', padding: '2.5em', width: '90%', maxWidth: '500px', boxShadow: '0 10px 40px rgba(0,0,0,0.2)'}}>
              <h2 style={{ color: '#2d3748', margin: '0 0 1.5em 0', fontSize: '1.5em', fontWeight: '600' }}>{isEditing ? "Update Transaction" : "Add New Transaction"}</h2>
              <form onSubmit={handleSubmit}>
                <div style={{ display: 'flex', gap: '1em', marginBottom: '1em' }}>
                  <input type="number" name="amount" placeholder="Amount (R)" value={formData.amount} onChange={handleInputChange} required min="0" step="0.01" style={{ flex: 1, padding: '0.75em', borderRadius: '8px', border: '1px solid #e2e8f0', background: '#f7fafc', fontSize: '1em' }}/>
                  <select name="type" value={formData.type} onChange={handleInputChange} style={{ padding: '0.75em', borderRadius: '8px', border: '1px solid #e2e8f0', background: '#f7fafc', fontSize: '1em', minWidth: '120px' }}>
                    <option value="Expense">Expense</option><option value="Income">Income</option>
                  </select>
                </div>
                <input type="text" name="description" placeholder="Description" value={formData.description} onChange={handleInputChange} required style={{ width: '100%', padding: '0.75em', borderRadius: '8px', border: '1px solid #e2e8f0', background: '#f7fafc', marginBottom: '1em', fontSize: '1em' }} />
                <select name="categoryId" value={formData.categoryId} onChange={handleInputChange} style={{ width: '100%', padding: '0.75em', borderRadius: '8px', border: '1px solid #e2e8f0', background: '#f7fafc', marginBottom: '1em', fontSize: '1em' }}>
                  <option value="">Uncategorized</option>
                  {categories.map((cat) => (<option key={cat.categoryId} value={cat.categoryId}>{cat.name}</option>))}
                </select>
                <input type="date" name="date" value={formData.date} onChange={handleInputChange} required style={{ width: '100%', padding: '0.75em', borderRadius: '8px', border: '1px solid #e2e8f0', background: '#f7fafc', marginBottom: '2em', fontSize: '1em' }}/>
                <div style={{ display: 'flex', gap: '1em', justifyContent: 'flex-end' }}>
                  <button type="button" onClick={() => { setShowForm(false); setIsEditing(false); setFormData({ id: "", amount: "", description: "", categoryId: "", type: "Expense", date: new Date().toISOString().split("T")[0] }); }} style={{ padding: '0.75em 1.5em', borderRadius: '8px', border: '1px solid #e2e8f0', background: 'transparent', color: '#718096', cursor: 'pointer', fontSize: '1em', fontWeight: '600' }}>Cancel</button>
                  <button type="submit" style={{ padding: '0.75em 1.5em', borderRadius: '8px', border: 'none', background: '#4299e1', color: 'white', cursor: 'pointer', fontSize: '1em', fontWeight: '600' }}>{isEditing ? "Update Transaction" : "Add Transaction"}</button>
                </div>
              </form>
            </div>
          </div>
        )}

        <div>
          {transactions.length === 0 && !loading ? (
            <div style={{ background: 'white', color: '#718096', textAlign: 'center', padding: '3em', borderRadius: '16px', boxShadow: '0 4px 20px rgba(0,0,0,0.1)' }}>No transactions yet.</div>
          ) : (
            transactions.map((t) => (
              <div key={t.id} style={{ background: 'white', borderRadius: '16px', padding: '1.5em 2em', marginBottom: '1em', display: 'flex', alignItems: 'center', justifyContent: 'space-between', boxShadow: '0 2px 12px rgba(0,0,0,0.08)' }}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5em', flex: 1 }}>
                  <div style={{ color: '#2d3748', fontWeight: '600', fontSize: '1.1em' }}>{t.description}</div>
                  <div style={{ color: '#4299e1', fontSize: '1em', fontWeight: '500' }}>{getCategoryName(t.categoryId)}</div>
                  <div style={{ color: '#a0aec0', fontSize: '0.95em' }}>{formatDate(t.date)}</div>
                </div>
                <div style={{ color: t.type === 'Income' ? '#48bb78' : '#f56565', fontWeight: '700', fontSize: '1.2em', marginRight: '2em' }}>{formatAmount(t.amount, t.type)}</div>
                <div style={{ display: 'flex', flexDirection: 'row', gap: '0.75em', alignItems: 'center' }}>
                  <button onClick={() => handleEdit(t)} style={{ padding: '0.5em 1em', borderRadius: '6px', border: '1px solid #4299e1', background: 'transparent', color: '#4299e1', cursor: 'pointer', minWidth: '80px', fontSize: '0.9em', fontWeight: '600' }}>Update</button>
                  <button onClick={() => handleDelete(t.id)} style={{ padding: '0.5em 1em', borderRadius: '6px', border: '1px solid #f56565', background: 'transparent', color: '#f56565', cursor: 'pointer', minWidth: '80px', fontSize: '0.9em', fontWeight: '600' }}>Delete</button>
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