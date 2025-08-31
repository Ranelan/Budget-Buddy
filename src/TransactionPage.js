import React, { useState, useEffect } from "react";
import "./App.css";

const API_BASE = "http://localhost:8081/api/transaction";

function TransactionPage() {
  const [transactions, setTransactions] = useState([]);
  const [categories, setCategories] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    amount: "",
    description: "",
    categoryId: "",
    type: "Expense",
    date: new Date().toISOString().split("T")[0],
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    fetchTransactions();
    fetchCategories();
  }, []);

  const fetchTransactions = async () => {
    try {
      setLoading(true);
      const response = await fetch(`${API_BASE}/findAll`);
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
      const response = await fetch(`${API_BASE}/create`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });
      if (response.ok) {
        setShowForm(false);
        setFormData({
          amount: "",
          description: "",
          categoryId: "",
          type: "Expense",
          date: new Date().toISOString().split("T")[0],
        });
        fetchTransactions();
      } else {
        setError("Failed to create transaction");
      }
    } catch (err) {
      setError("Error creating transaction");
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
            <h2>Add New Transaction</h2>
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
                  Add Transaction
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
            <div key={t.id} className={`transaction-card ${t.type.toLowerCase()}`}>
              <div className="transaction-info">
                <div className="transaction-title">{t.description}</div>
                <div className="transaction-category">{getCategoryName(t.categoryId)}</div>
                <div className="transaction-meta">
                  <span>{formatDate(t.date)}</span>
                  <span>Credit Card</span>
                </div>
              </div>
              <div className={`transaction-amount ${t.type.toLowerCase()}`}>
                {formatAmount(t.amount, t.type)}
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
