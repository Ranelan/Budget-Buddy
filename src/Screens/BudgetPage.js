import React, { useEffect, useState } from "react";

const API_BASE = "http://localhost:8081/api/budget";

export default function BudgetPage() {
  // Search handler for unified search bar
  const [budgets, setBudgets] = useState([]);
  const [form, setForm] = useState({ month: "", year: "", limitAmount: "" });
  const [selectedId, setSelectedId] = useState("");
  const [message, setMessage] = useState("");
  const [showUpdateModal, setShowUpdateModal] = useState(false);
  const [updateForm, setUpdateForm] = useState({ month: "", year: "", limitAmount: "" });

  // Fetch all budgets
  useEffect(() => {
    fetch(`${API_BASE}/findAll`)
      .then(res => res.ok ? res.json() : [])
      .then(setBudgets)
      .catch(() => setBudgets([]));
  }, []);

  // Create budget
  const handleCreate = async (e) => {
    e.preventDefault();
    // Validation: no empty fields, no zero limit
    if (!form.month.trim() || !form.year.trim() || !form.limitAmount || Number(form.limitAmount) <= 0) {
      setMessage("All fields are required and limit amount must be greater than zero.");
      return;
    }
    const payload = {
      month: form.month,
      year: form.year,
      limitAmount: form.limitAmount,
      regularUser: localStorage.getItem("regularUserId") ? { userID: localStorage.getItem("regularUserId") } : undefined
    };
    const res = await fetch(`${API_BASE}/create`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload)
    });
    if (res.ok) {
      setMessage("Budget created!");
    } else {
      setMessage("Failed to create budget.");
    }
  }

  // Read budget by ID
  const handleRead = async () => {
    const res = await fetch(`${API_BASE}/read/${selectedId}`);
    if (res.ok) {
      const data = await res.json();
      setBudgets([data]);
      setMessage("");
    } else {
      setMessage("Budget not found.");
    }
  };

  // Show update modal and prefill form
  const openUpdateModal = () => {
    const budget = budgets.find(b => b.budgetId === selectedId);
    if (budget) {
      setUpdateForm({
        month: budget.month || "",
        year: budget.year || "",
        limitAmount: budget.limitAmount || ""
      });
      setShowUpdateModal(true);
    }
  };

  // Handle update from modal
  const handleUpdateSubmit = async (e) => {
    e.preventDefault();
    const payload = {
      budgetId: selectedId,
      month: updateForm.month,
      year: updateForm.year,
      limitAmount: updateForm.limitAmount,
      regularUser: localStorage.getItem("regularUserId") ? { userID: localStorage.getItem("regularUserId") } : undefined
    };
    const res = await fetch(`${API_BASE}/update`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload)
    });
    if (res.ok) {
      setMessage("Budget updated!");
      setShowUpdateModal(false);
      // Refresh budgets without leaving page
      fetch(`${API_BASE}/findAll`)
        .then(res => res.ok ? res.json() : [])
        .then(setBudgets)
        .catch(() => setBudgets([]));
    } else {
      setMessage("Failed to update budget.");
    }
  };

  // Delete budget
  const handleDelete = async () => {
    const res = await fetch(`${API_BASE}/delete/${selectedId}`, { method: "DELETE" });
    if (res.ok) {
      setMessage("Budget deleted!");
      // Refresh budgets without leaving page
      fetch(`${API_BASE}/findAll`)
        .then(res => res.ok ? res.json() : [])
        .then(setBudgets)
        .catch(() => setBudgets([]));
    } else {
      setMessage("Failed to delete budget.");
    }
  };

  // Find by month
  const handleFindByMonth = async () => {
    const res = await fetch(`${API_BASE}/findByMonth/${form.month}`);
    if (res.ok) {
      setBudgets(await res.json());
      setMessage("");
    } else {
      setMessage("No budgets found for month.");
    }
  };

  // Find by year
  const handleFindByYear = async () => {
    const res = await fetch(`${API_BASE}/findByYear/${form.year}`);
    if (res.ok) {
      setBudgets(await res.json());
      setMessage("");
    } else {
      setMessage("No budgets found for year.");
    }
  };

  // Find by limit amount
  const handleFindByLimitAmount = async () => {
    const res = await fetch(`${API_BASE}/findByLimitAmountGreaterThan/${form.limitAmount}`);
    if (res.ok) {
      setBudgets(await res.json());
      setMessage("");
    } else {
      setMessage("No budgets found above amount.");
    }
  };

  return (
    <div className="dashboard-main">
      {/* Welcome Section */}
      <section className="welcome-section">
        <h1 className="welcome-title">
          <i className="fas fa-chart-pie" style={{ marginRight: '0.5rem', color: 'hsl(var(--primary))' }}></i>
          Budget Management
        </h1>
        <p className="welcome-subtitle">
          Set and manage your monthly spending limits to stay on track with your financial goals.
        </p>
      </section>

      {/* Alert Message */}
      {message && (
        <section className="alert-section">
          <div className={`status-alert ${message.includes('Failed') || message.includes('not found') ? 'error' : 'success'}`}>
            <i className={`fas ${message.includes('Failed') || message.includes('not found') ? 'fa-exclamation-triangle' : 'fa-check-circle'}`}></i>
            <span>{message}</span>
            <button className="alert-close" onClick={() => setMessage('')}>
              <i className="fas fa-times"></i>
            </button>
          </div>
        </section>
      )}

      {/* Create Budget Section */}
      <section className="cards-section">
        <div className="feature-card budget-create-card">
          <div className="card-header">
            <div className="card-icon">
              <i className="fas fa-plus-circle"></i>
            </div>
          </div>
          <div className="card-body">
            <h3 className="card-title">Create New Budget</h3>
            <p className="card-description">Set a spending limit for a specific month and year</p>
            
            <form className="budget-form" onSubmit={handleCreate}>
              <div className="form-grid-budget">
                <div className="form-group">
                  <label className="form-label">Month</label>
                  <input
                    className="form-input"
                    placeholder="e.g., January"
                    value={form.month}
                    onChange={e => setForm({ ...form, month: e.target.value })}
                    required
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Year</label>
                  <input
                    className="form-input"
                    placeholder="e.g., 2025"
                    type="number"
                    value={form.year}
                    onChange={e => setForm({ ...form, year: e.target.value })}
                    required
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Budget Limit (ZAR)</label>
                  <input
                    className="form-input"
                    placeholder="0.00"
                    type="number"
                    step="0.01"
                    min="0.01"
                    value={form.limitAmount}
                    onChange={e => setForm({ ...form, limitAmount: e.target.value })}
                    required
                  />
                </div>
              </div>
              <div className="form-actions">
                <button className="btn btn-primary" type="submit">
                  <i className="fas fa-plus"></i>
                  Create Budget
                </button>
              </div>
            </form>
          </div>
        </div>
      </section>

      {/* Selected Budget Actions */}
      {selectedId && (
        <section className="cards-section">
          <div className="feature-card budget-actions-card">
            <div className="card-header">
              <div className="card-icon">
                <i className="fas fa-cog"></i>
              </div>
            </div>
            <div className="card-body">
              <h3 className="card-title">Budget Actions</h3>
              <p className="card-description">Manage your selected budget</p>
              <div className="action-buttons">
                <button className="btn btn-outline" onClick={openUpdateModal}>
                  <i className="fas fa-edit"></i>
                  Update Budget
                </button>
                <button className="btn btn-destructive" onClick={handleDelete}>
                  <i className="fas fa-trash"></i>
                  Delete Budget
                </button>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* Update Modal */}
      {showUpdateModal && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="modal-header">
              <h3 className="modal-title">
                <i className="fas fa-edit"></i>
                Update Budget
              </h3>
              <button 
                className="modal-close"
                onClick={() => setShowUpdateModal(false)}
                type="button"
              >
                <i className="fas fa-times"></i>
              </button>
            </div>
            <form onSubmit={handleUpdateSubmit}>
              <div className="modal-body">
                <div className="form-grid-budget">
                  <div className="form-group">
                    <label className="form-label">Month</label>
                    <input
                      className="form-input"
                      placeholder="Month"
                      value={updateForm.month}
                      onChange={e => setUpdateForm({ ...updateForm, month: e.target.value })}
                      required
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Year</label>
                    <input
                      className="form-input"
                      placeholder="Year"
                      type="number"
                      value={updateForm.year}
                      onChange={e => setUpdateForm({ ...updateForm, year: e.target.value })}
                      required
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Budget Limit (ZAR)</label>
                    <input
                      className="form-input"
                      placeholder="Limit Amount"
                      type="number"
                      step="0.01"
                      min="0.01"
                      value={updateForm.limitAmount}
                      onChange={e => setUpdateForm({ ...updateForm, limitAmount: e.target.value })}
                      required
                    />
                  </div>
                </div>
              </div>
              <div className="modal-footer">
                <button className="btn btn-outline" type="button" onClick={() => setShowUpdateModal(false)}>
                  Cancel
                </button>
                <button className="btn btn-primary" type="submit">
                  <i className="fas fa-save"></i>
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Budgets List */}
      <section className="cards-section">
        <div className="section-header">
          <h2 className="section-title">
            <i className="fas fa-list"></i>
            Your Budgets
          </h2>
          <p className="section-subtitle">
            {budgets.length > 0 ? `${budgets.length} budget${budgets.length !== 1 ? 's' : ''} found` : 'No budgets created yet'}
          </p>
        </div>

        {budgets.length === 0 ? (
          <div className="empty-state">
            <div className="empty-icon">
              <i className="fas fa-chart-pie"></i>
            </div>
            <h3 className="empty-title">No budgets found</h3>
            <p className="empty-description">
              Create your first budget to start tracking your monthly spending limits.
            </p>
          </div>
        ) : (
          <div className="cards-grid">
            {budgets.map(b => (
              <div 
                key={b.budgetId} 
                className={`feature-card budget-item-card ${selectedId === b.budgetId ? 'selected' : ''}`}
                onClick={() => setSelectedId(selectedId === b.budgetId ? "" : b.budgetId)}
              >
                <div className="card-header">
                  <div className="card-icon">
                    <i className="fas fa-calendar-alt"></i>
                  </div>
                  {selectedId === b.budgetId && (
                    <div className="selected-indicator">
                      <i className="fas fa-check-circle"></i>
                    </div>
                  )}
                </div>
                <div className="card-body">
                  <h3 className="card-title">{b.month} {b.year}</h3>
                  <div className="budget-amount-display">
                    <span className="budget-label">Budget Limit</span>
                    <span className="budget-value">
                      R{Number(b.limitAmount).toLocaleString('en-ZA', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </span>
                  </div>
                  <p className="card-description">
                    Click to {selectedId === b.budgetId ? 'deselect' : 'select'} this budget
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
