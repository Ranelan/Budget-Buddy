import React, { useState, useEffect } from "react";
import "./App.css";

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

  // Load categories and transactions
  useEffect(() => {
    const mockCategories = [
      { categoryId: "1", name: "Food" },
      { categoryId: "2", name: "Transport" },
      { categoryId: "3", name: "Utilities" },
      { categoryId: "4", name: "Income" },
      { categoryId: "5", name: "Entertainment" },
    ];

    const mockTransactions = [
      { id: 1, description: "Groceries", categoryId: "1", amount: 120, type: "Expense", date: "2025-09-01" },
      { id: 2, description: "Bus fare", categoryId: "2", amount: 15, type: "Expense", date: "2025-09-02" },
      { id: 3, description: "Salary", categoryId: "4", amount: 5000, type: "Income", date: "2025-09-01" },
    ];

    setCategories(mockCategories);
    setTransactions(mockTransactions);
  }, []);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const newTransaction = {
      id: transactions.length + 1,
      ...formData
    };
    setTransactions([...transactions, newTransaction]);
    setShowForm(false);
    setFormData({
      amount: "",
      description: "",
      categoryId: "",
      type: "Expense",
      date: new Date().toISOString().split("T")[0],
    });
  };

  const getCategoryName = (categoryId) => {
    const category = categories.find((cat) => cat.categoryId === categoryId);
    return category ? category.name : "Uncategorized";
  };

  const formatAmount = (amount, type) => type === "Income" ? `R ${amount}` : `-R ${amount}`;
  const formatDate = (dateString) =>
    new Date(dateString).toLocaleDateString("en-US", { day: "2-digit", month: "short", year: "numeric" });

  return (
    <div className="transaction-page">
      <div className="transaction-header">
        <h1>💳 Transactions</h1>
        <button className="btn-add" onClick={() => setShowForm(true)}>+ Add Transaction</button>
      </div>

      {showForm && (
        <div className="modal-overlay">
          <div className="transaction-form">
            <h2>Add New Transaction</h2>
            <form onSubmit={handleSubmit}>
              <div className="form-row">
                <input
                  type="number"
                  name="amount"
                  placeholder="Amount"
                  value={formData.amount}
                  onChange={handleInputChange}
                  required
                />
                <select name="type" value={formData.type} onChange={handleInputChange}>
                  <option value="Expense">Expense</option>
                  <option value="Income">Income</option>
                </select>
              </div>
              <input
                type="text"
                name="description"
                placeholder="Description"
                value={formData.description}
                onChange={handleInputChange}
                required
              />
              {/* ✅ Category dropdown */}
              <select
                name="categoryId"
                value={formData.categoryId}
                onChange={handleInputChange}
                required
              >
                <option value="">Select Category</option>
                {categories.map((cat) => (
                  <option key={cat.categoryId} value={cat.categoryId}>{cat.name}</option>
                ))}
              </select>
              <input type="date" name="date" value={formData.date} onChange={handleInputChange} required />
              <div className="form-actions">
                <button type="button" className="btn-cancel" onClick={() => setShowForm(false)}>Cancel</button>
                <button type="submit" className="btn-submit">Add</button>
              </div>
            </form>
          </div>
        </div>
      )}

      <div className="transaction-list">
        {transactions.length === 0 ? (
          <div className="no-transactions">No transactions yet.</div>
        ) : (
          transactions.map((t) => (
            <div key={t.id} className={`transaction-card ${t.type.toLowerCase()}`}>
              <div className="transaction-left">
                <div className="transaction-desc">{t.description}</div>
                <div className="transaction-category">{getCategoryName(t.categoryId)}</div>
              </div>
              <div className="transaction-right">
                <div className="transaction-date">{formatDate(t.date)}</div>
                <div className={`transaction-amount ${t.type.toLowerCase()}`}>{formatAmount(t.amount, t.type)}</div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

export default TransactionPage;
