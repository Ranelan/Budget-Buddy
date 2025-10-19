import React, { useEffect, useState } from "react";
import Toast from "../components/Toast";

const API_BASE = "http://localhost:8081/api/budget";

export default function BudgetPage() {
  // Search handler for unified search bar
  const [budgets, setBudgets] = useState([]);
  const [form, setForm] = useState({ month: "", year: "", limitAmount: "" });
  const [selectedId, setSelectedId] = useState("");
  const [message, setMessage] = useState("");
  const [showUpdateModal, setShowUpdateModal] = useState(false);
  const [updateForm, setUpdateForm] = useState({ month: "", year: "", limitAmount: "" });
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [toastMessage, setToastMessage] = useState("");
  const [toastType, setToastType] = useState("success");

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
        <div className="goal-header">
          <h1 className="budget-title">Budget Management</h1>
          <button className="signup-btn signup-btn-blue add-goal-btn" onClick={() => setShowCreateModal(true)}>
            + Add Budget
          </button>
        </div>
        {message && <div className="budget-message">{message}</div>}

        {/* Create moved to modal */}

        <h2 className="budgets-title">Budgets</h2>
        {/* Create Modal */}
        {showCreateModal && (
          <div className="modal-overlay" onClick={() => setShowCreateModal(false)}>
            <div className="modal-content modal-aligned" onClick={(e) => e.stopPropagation()}>
              <h2>Create Budget</h2>
              <form className="budget-form" onSubmit={async (e) => {
                e.preventDefault();
                // call handleCreate logic but without event
                // validation
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
                const res = await fetch(`${API_BASE}/create`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) });
                if (res.ok) {
                  setMessage('Budget created!');
                  setToastMessage('Budget created successfully');
                  setToastType('success');
                  setShowCreateModal(false);
                  // clear form
                  setForm({ month: '', year: '', limitAmount: '' });
                  // refresh budgets
                  fetch(`${API_BASE}/findAll`).then(res => res.ok ? res.json() : []).then(setBudgets).catch(() => setBudgets([]));
                } else {
                  setMessage('Failed to create budget.');
                  setToastMessage('Failed to create budget');
                  setToastType('error');
                }
              }}>
                <div className="form-grid-budget">
                  <input className="signup-input" placeholder="Month" value={form.month} onChange={e => setForm({ ...form, month: e.target.value })} />
                  <input className="signup-input" placeholder="Year" value={form.year} onChange={e => setForm({ ...form, year: e.target.value })} />
                  <input className="signup-input" placeholder="Limit Amount" type="number" value={form.limitAmount} onChange={e => setForm({ ...form, limitAmount: e.target.value })} />
                </div>
                <div className="modal-btn-row">
                  <button className="enhanced-btn" type="submit">Create Budget</button>
                  <button className="btn-delete" type="button" onClick={() => setShowCreateModal(false)}>Cancel</button>
                </div>
              </form>
            </div>
          </div>
        )}
        {/* Toast */}
        <Toast message={toastMessage} type={toastType} duration={3000} onClose={() => setToastMessage("")} />
        <div className="goal-grid">
          {budgets.length === 0 ? (
            <div className="no-budgets">No budgets found.</div>
          ) : (
            budgets.map(b => {
              const target = Number(b.limitAmount) || 0;
              const current = 0; // current spending not available here
              const percent = target > 0 ? Math.min(100, Math.round((current / target) * 100)) : 0;
              const remaining = Math.max(0, (target - current).toFixed(2));
              return (
                <div key={b.budgetId} className="goal-card" onClick={() => setSelectedId(b.budgetId)}>
                  <div className="goal-card-top">
                    <div className="goal-title">{b.month} {b.year}</div>
                    <div className="goal-amount">{target}</div>
                  </div>
                  <div className="progress-track"><div className="progress-fill" style={{ width: `${percent}%` }} /></div>
                  <div className="goal-meta">
                    <div className="remaining">R{remaining} remaining</div>
                    <div className="percent-used">{percent}% used</div>
                  </div>
                  {String(selectedId) === String(b.budgetId) && (
                    <div className="goal-controls">
                      <button className="btn-edit" onClick={(ev) => { ev.stopPropagation(); openUpdateModal(); }}>Update</button>
                      <button className="btn-delete" onClick={(ev) => { ev.stopPropagation(); setSelectedId(b.budgetId); setShowDeleteModal(true); }}>Delete</button>
                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>
        {/* Update Modal (aligned with navbar/main content) */}
        {showUpdateModal && (
          <div className="modal-overlay" onClick={() => setShowUpdateModal(false)}>
            <div className="modal-content modal-aligned" onClick={(e) => e.stopPropagation()}>
              <h2>Update Budget</h2>
              <form className="budget-form" onSubmit={handleUpdateSubmit}>
                <div className="form-grid-budget">
                  <input className="signup-input" placeholder="Month" value={updateForm.month} onChange={e => setUpdateForm({ ...updateForm, month: e.target.value })} />
                  <input className="signup-input" placeholder="Year" value={updateForm.year} onChange={e => setUpdateForm({ ...updateForm, year: e.target.value })} />
                  <input className="signup-input" placeholder="Limit Amount" type="number" value={updateForm.limitAmount} onChange={e => setUpdateForm({ ...updateForm, limitAmount: e.target.value })} />
                </div>
                <div className="modal-btn-row">
                  <button className="enhanced-btn" type="submit">Save Changes</button>
                  <button className="btn-delete" type="button" onClick={() => setShowDeleteModal(true)}>Delete</button>
                  <button className="btn-delete" type="button" onClick={() => setShowUpdateModal(false)}>Cancel</button>
                </div>
              </form>
            </div>
          </div>
        )}
        {/* Delete Confirmation Modal */}
        {showDeleteModal && (
          <div className="modal-overlay" onClick={() => setShowDeleteModal(false)}>
            <div className="modal-content modal-aligned" onClick={(e) => e.stopPropagation()}>
              <h2>Delete Budget</h2>
              <p>Are you sure you want to delete this budget? This action cannot be undone.</p>
              <div className="modal-btn-row" style={{ marginTop: '1rem' }}>
                <button className="btn-delete" onClick={async () => {
                  // call existing delete handler and then close modals and show toast
                  const res = await fetch(`${API_BASE}/delete/${selectedId}`, { method: 'DELETE' });
                  if (res.ok) {
                    setToastMessage('Budget deleted');
                    setToastType('success');
                    setShowDeleteModal(false);
                    setShowUpdateModal(false);
                    // refresh budgets
                    fetch(`${API_BASE}/findAll`).then(r => r.ok ? r.json() : []).then(setBudgets).catch(() => setBudgets([]));
                  } else {
                    setToastMessage('Failed to delete budget');
                    setToastType('error');
                  }
                }}>Confirm Delete</button>
                <button className="enhanced-btn" onClick={() => setShowDeleteModal(false)}>Cancel</button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
