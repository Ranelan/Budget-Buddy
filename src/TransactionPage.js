import React, { useState, useEffect } from "react";
import "./App.css";

const API_BASE = "http://localhost:8081/api/transactions";

function TransactionPage() {
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

  useEffect(() => {
    fetchTransactions();
    fetchCategories();
  }, []);

  const fetchTransactions = async () => {
    try {
      setLoading(true);
      const response = await fetch(`${API_BASE}/all`);
      if (response.ok) {
        const data = await response.json();
        setTransactions(data);
      }
    } catch (err) {
      setError("Failed to fetch transactions");
    } finally {
      setLoading(false);
    }
  };

  const fetchCategories = async () => {
    try {
      const response = await fetch("http://localhost:8081/api/category/findAll");
      if (response.ok) {
        const data = await response.json();
        setCategories(data);
      }
    } catch (err) {
      console.error("Failed to fetch categories");
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      let response;
      if (isEditing) {
        response = await fetch(`${API_BASE}/update`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(formData),
        });
      } else {
        response = await fetch(`${API_BASE}/create`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(formData),
        });
      }
      if (response.ok) {
        setShowForm(false);
        setFormData({
          id: "",
          amount: "",
          description: "",
          categoryId: "",
          type: "Expense",
          date: new Date().toISOString().split("T")[0],
        });
        setIsEditing(false);
        fetchTransactions();
      } else {
        setError(isEditing ? "Failed to update transaction" : "Failed to create transaction");
      }
    } catch (err) {
      setError(isEditing ? "Error updating transaction" : "Error creating transaction");
    }
  };

  const handleEdit = (transaction) => {
    setFormData({
      id: transaction.id || transaction.transactionId,
      amount: transaction.amount,
      description: transaction.description,
      categoryId: transaction.categoryId,
      type: transaction.type,
      date: transaction.date,
    });
    setIsEditing(true);
    setShowForm(true);
  };

  const handleDelete = async (id) => {
    try {
      const response = await fetch(`${API_BASE}/delete/${id}`, {
        method: "DELETE",
      });
      if (response.ok) {
        fetchTransactions();
      } else {
        setError("Failed to delete transaction");
      }
    } catch (err) {
      setError("Error deleting transaction");
    }
  };

  const formatDate = (dateString) => {
    const options = { day: "2-digit", month: "short", year: "numeric" };
    return new Date(dateString).toLocaleDateString("en-US", options);
  };

  const formatAmount = (amount, type) =>
    type === "Income" ? `R ${amount}` : `-R ${amount}`;

  const getCategoryName = (categoryId) => {
    const category = categories.find((cat) => cat.categoryId === categoryId);
    return category ? category.name : "Uncategorized";
  };

  return (
    <div className={`transaction-page ${showForm ? "modal-active" : ""}`}>
      {/* Background overlay */}
      {showForm && <div className="modal-backdrop" onClick={() => setShowForm(false)} />}

      <div className="transaction-header">
        <h1>Transactions</h1>
        <button className="enhanced-btn" onClick={() => setShowForm(true)}>
          + Add Transaction
        </button>
      </div>

      {error && <div className="error-message">{error}</div>}

      {/* Add Transaction Modal */}
      {showForm && (
        <div className="modal-overlay">
          <div className="transaction-form">
            <h2>{isEditing ? "Update Transaction" : "Add New Transaction"}</h2>
            <form onSubmit={handleSubmit}>
              <div className="form-row">
                <div className="form-group">
                  <label>Amount</label>
                  <input
                    type="number"
                    name="amount"
                    value={formData.amount}
                    onChange={handleInputChange}
                    required
                    step="0.01"
                    placeholder="0.00"
                  />
                </div>
                <div className="form-group">
                  <label>Type</label>
                  <select name="type" value={formData.type} onChange={handleInputChange}>
                    <option value="Expense">Expense</option>
                    <option value="Income">Income</option>
                  </select>
                </div>
              </div>

              <div className="form-group">
                <label>Description</label>
                <input
                  type="text"
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  placeholder="Enter description"
                  required
                />
              </div>

              <div className="form-group">
                <label>Category</label>
                <select
                  name="categoryId"
                  value={formData.categoryId}
                  onChange={handleInputChange}
                  required
                >
                  <option value="">Select Category</option>
                  {categories.map((cat) => (
                    <option key={cat.categoryId} value={cat.categoryId}>
                      {cat.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <label>Date</label>
                <input
                  type="date"
                  name="date"
                  value={formData.date}
                  onChange={handleInputChange}
                  required
                />
              </div>

              <div className="form-actions">
                <button
                  type="button"
                  className="btn-secondary"
                  onClick={() => setShowForm(false)}
                >
                  Cancel
                </button>
                <button type="submit" className="btn-primary">
                  {isEditing ? "Update Transaction" : "Add Transaction"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Transaction List */}
      <div className="transaction-list">
        {loading ? (
          <div>Loading transactions...</div>
        ) : transactions.length > 0 ? (
          transactions.map((t) => (
            <div key={t.id || t.transactionId} className={`transaction-card ${t.type.toLowerCase()}`} style={{
              background: '#232a36',
              borderRadius: '18px',
              boxShadow: '0 2px 12px rgba(33,150,243,0.10)',
              padding: '1.5em 2em',
              marginBottom: '1.2em',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              gap: '2em',
            }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5em', flex: 1 }}>
                <div style={{ color: '#fff', fontWeight: 'bold', fontSize: '1.1em' }}>{t.description}</div>
                <div style={{ color: '#ffd700', fontSize: '1em' }}>{getCategoryName(t.categoryId)}</div>
                <div style={{ color: '#b0b3b8', fontSize: '0.95em', display: 'flex', gap: '1em' }}>
                  <span>{formatDate(t.date)}</span>
                  <span>Credit Card</span>
                </div>
              </div>
              <div style={{ color: t.type === 'Income' ? '#21cbf3' : '#ff5252', fontWeight: 700, fontSize: '1.2em', marginRight: '2em' }}>
                {formatAmount(t.amount, t.type)}
              </div>
              <div style={{ display: 'flex', flexDirection: 'row', gap: '1em', alignItems: 'center' }}>
                <button className="btn-edit" style={{ minWidth: '90px' }} onClick={() => handleEdit(t)}>
                  Update
                </button>
                <button className="btn-delete" style={{ minWidth: '90px' }} onClick={() => handleDelete(t.id || t.transactionId)}>
                  Delete
                </button>
              </div>
            </div>
          ))
        ) : (
          <div className="no-transactions">No transactions found</div>
        )}
      </div>
    </div>
  );
}

export default TransactionPage;
