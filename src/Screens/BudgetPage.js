import React, { useEffect, useState } from "react";

const API_BASE = "http://localhost:8081/api/budget";

export default function BudgetPage() {
  // Search handler for unified search bar
  const handleSearch = (query) => {
    query = query.trim();
    if (!query) return;
    // Try month
    fetch(`${API_BASE}/findByMonth/${query}`)
      .then(res => res.ok ? res.json() : [])
      .then(data => {
        if (data && data.length) return setBudgets(data);
        // Try year
        fetch(`${API_BASE}/findByYear/${query}`)
          .then(res => res.ok ? res.json() : [])
          .then(data2 => {
            if (data2 && data2.length) return setBudgets(data2);
            // Try limit amount
            fetch(`${API_BASE}/findByLimitAmountGreaterThan/${query}`)
              .then(res => res.ok ? res.json() : [])
              .then(data3 => {
                setBudgets(data3);
              });
          });
      });
  };
  const [budgets, setBudgets] = useState([]);
  const [form, setForm] = useState({ month: "", year: "", limitAmount: "" });
  const [selectedId, setSelectedId] = useState("");
  const [message, setMessage] = useState("");
  const [search, setSearch] = useState("");
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
    <div className="dashboard-content">
      <div className="budget-main-card">
        <h1 className="budget-title">Budget Management</h1>
        {message && <div className="budget-message">{message}</div>}
        <form className="budget-form" onSubmit={handleCreate}>
          <div style={{ display: 'flex', gap: '1em', width: '100%', justifyContent: 'center' }}>
            <input
              className="signup-input"
              placeholder="Month"
              value={form.month}
              onChange={e => setForm({ ...form, month: e.target.value })}
            />
            <input
              className="signup-input"
              placeholder="Year"
              value={form.year}
              onChange={e => setForm({ ...form, year: e.target.value })}
            />
            <input
              className="signup-input"
              placeholder="Limit Amount"
              type="number"
              value={form.limitAmount}
              onChange={e => setForm({ ...form, limitAmount: e.target.value })}
            />
          </div>
          <button className="enhanced-btn" type="submit" style={{ margin: '0 auto', display: 'block' }}>Create Budget</button>
        </form>
        {selectedId && (
          <div className="budget-id-actions">
            <button className="btn-edit" onClick={openUpdateModal}>Update</button>
            <button className="btn-delete" onClick={handleDelete}>Delete</button>
          </div>
        )}

        {showUpdateModal && (
          <div className="modal-overlay">
            <div className="modal-content">
              <h2>Update Budget</h2>
              <form onSubmit={handleUpdateSubmit} className="budget-form">
                <div style={{ display: 'flex', gap: '1em', width: '100%', flexWrap: 'wrap', justifyContent: 'center' }}>
                  <input
                    className="signup-input"
                    placeholder="Month"
                    value={updateForm.month}
                    onChange={e => setUpdateForm({ ...updateForm, month: e.target.value })}
                  />
                  <input
                    className="signup-input"
                    placeholder="Year"
                    value={updateForm.year}
                    onChange={e => setUpdateForm({ ...updateForm, year: e.target.value })}
                  />
                  <input
                    className="signup-input"
                    placeholder="Limit Amount"
                    type="number"
                    value={updateForm.limitAmount}
                    onChange={e => setUpdateForm({ ...updateForm, limitAmount: e.target.value })}
                  />
                </div>
                <div className="modal-btn-row">
                  <button className="enhanced-btn" type="submit">Save</button>
                  <button className="btn-delete" type="button" onClick={() => setShowUpdateModal(false)}>Cancel</button>
                </div>
              </form>
            </div>
          </div>
        )}
        <h2 className="budgets-title">Budgets</h2>
        <div className="budget-cards-container">
          {budgets.length === 0 ? (
            <div className="no-budgets">No budgets found.</div>
          ) : (
            budgets.map(b => (
              <div key={b.budgetId} className="budget-card" onClick={() => setSelectedId(b.budgetId)}>
                <div className="budget-card-month-year">{b.month} {b.year}</div>
                <div className="budget-card-limit-label">Limit:</div>
                <div className="budget-card-limit-amount">{b.limitAmount}</div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
