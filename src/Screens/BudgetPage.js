import React, { useEffect, useState } from "react";
import Toast from "../components/Toast";

const API_BASE = "http://localhost:8081/api/budget";

export default function BudgetPage() {
  // State management
  const [budgets, setBudgets] = useState([]);
  const [form, setForm] = useState({ month: "", year: "", limitAmount: "" });
  const [selectedId, setSelectedId] = useState("");
  const [message] = useState("");
  const [showUpdateModal, setShowUpdateModal] = useState(false);
  const [updateForm, setUpdateForm] = useState({ month: "", year: "", limitAmount: "" });
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [toastMessage, setToastMessage] = useState("");
  const [toastType, setToastType] = useState("success");

  // === STRICT REFRESH LOGIC ===
  // Reusable helper to discover the currently-logged-in regular user's id.
  // This mirrors the tolerant lookup used in other screens (checks both key variants
  // and falls back to scanning for any key containing 'regularuser').
  const getCurrentUserId = () => {
    const explicit = localStorage.getItem("regularUserID") || localStorage.getItem("regularUserId");
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

  const refreshBudgets = async () => {
    try {
      const isAdmin = localStorage.getItem("isAdmin") === "true";
      const currentUser = getCurrentUserId();

      let url = "";

      // STRICT CHECK: Only explicitly allow findAll if truly an admin.
      if (isAdmin) {
        url = `${API_BASE}/findAll`;
      } 
      // If not admin, they MUST have a currentUser ID to see anything.
      else if (currentUser) {
        url = `${API_BASE}/byUser/${currentUser}`;
      } 
      // If neither (e.g., logged out, or weird state), show nothing. 
      // Do NOT default to findAll.
      else {
        console.warn("Access denied: No valid user or admin credentials found.", {
          isAdminLocal: localStorage.getItem("isAdmin"),
          regularUserID: localStorage.getItem("regularUserID"),
          regularUserId: localStorage.getItem("regularUserId")
        });
        setBudgets([]);
        return;
      }

      const res = await fetch(url);

      if (!res.ok) {
        // If the API call fails (e.g., 401 Unauthorized, 403 Forbidden), clear budgets
        console.warn(`BudgetPage: Failed to fetch from ${url}, status: ${res.status}`);
        setBudgets([]);
        return;
      }

      const data = await res.json();
      setBudgets(data || []);
    } catch (error) {
      console.error("Error loading budgets:", error);
      setBudgets([]);
    }
  };

  // Fetch all budgets on initial component load
  useEffect(() => {
    refreshBudgets();
  }, []);

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
    if (!updateForm.month.trim() || !updateForm.year.trim() || !updateForm.limitAmount || Number(updateForm.limitAmount) <= 0) {
        setToastMessage("All fields are required and limit amount must be greater than zero.");
        setToastType("error");
        return;
    }

    // We must attach the user ID to maintain ownership if it's a regular user
    const regularUserId = getCurrentUserId();
    const numericUserId = regularUserId ? Number(regularUserId) : undefined;
    const payload = {
      budgetId: selectedId,
      month: updateForm.month,
      year: updateForm.year,
      // Ensure numeric amount is sent
      limitAmount: Number(updateForm.limitAmount),
      // Attach ownership in two ways: nested object and top-level id to match backend variations
      regularUser: numericUserId ? { userID: numericUserId } : undefined,
      userId: numericUserId || undefined
    };
    console.log('Submitting budget update payload:', payload);

    const res = await fetch(`${API_BASE}/update`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload)
    });

    if (res.ok) {
      setToastMessage("Budget updated successfully!");
      setToastType("success");
      setShowUpdateModal(false);
      refreshBudgets(); 
    } else {
      setToastMessage("Failed to update budget.");
      setToastType("error");
    }
  };

  // Handle create from modal
  const handleCreateSubmit = async (e) => {
    e.preventDefault();
    if (!form.month.trim() || !form.year.trim() || !form.limitAmount || Number(form.limitAmount) <= 0) {
      setToastMessage("All fields are required and limit amount must be greater than zero.");
      setToastType("error");
      return;
    }

    const regularUserId = getCurrentUserId();
    const numericUserId = regularUserId ? Number(regularUserId) : undefined;
    const payload = {
      month: form.month,
      year: form.year,
      // Ensure numeric amount is sent
      limitAmount: Number(form.limitAmount),
      // Ensure the new budget is tied to the current user
      regularUser: numericUserId ? { userID: numericUserId } : undefined,
      userId: numericUserId || undefined
    };
    console.log('Submitting budget create payload:', payload);

    try {
      const res = await fetch(`${API_BASE}/create`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Accept: "application/json" },
        body: JSON.stringify(payload)
      });
      const text = await res.text();
      let json = null;
      try { json = text ? JSON.parse(text) : null; } catch (e) { /* ignore */ }
      console.log('Create response status:', res.status, 'body:', text, 'parsed:', json);
      if (res.ok) {
        setToastMessage('Budget created successfully');
        setToastType('success');
        setShowCreateModal(false);
        setForm({ month: '', year: '', limitAmount: '' }); 
        refreshBudgets();
      } else {
        setToastMessage('Failed to create budget');
        setToastType('error');
      }
    } catch (err) {
      console.error('Budget create error:', err);
      setToastMessage('Failed to create budget');
      setToastType('error');
    }
  };

  // Handle delete from modal
  const handleDeleteConfirm = async () => {
    const res = await fetch(`${API_BASE}/delete/${selectedId}`, { method: 'DELETE' });
    if (res.ok) {
      setToastMessage('Budget deleted successfully');
      setToastType('success');
      setShowDeleteModal(false);
      setShowUpdateModal(false); 
      refreshBudgets();
    } else {
      setToastMessage('Failed to delete budget');
      setToastType('error');
    }
  };

  return (
    <div className="dashboard-content">
      <Toast message={toastMessage} type={toastType} duration={3000} onClose={() => setToastMessage("")} />
      <div className="budget-main-card">
        <div className="goal-header">
          <h1 className="budget-title">Budget Management</h1>
          <button className="signup-btn signup-btn-blue add-goal-btn" onClick={() => setShowCreateModal(true)}>
            + Add Budget
          </button>
        </div>
        {message && <div className="budget-message">{message}</div>}

        <h2 className="budgets-title">Budget Overview</h2>

        {/* Create Modal */}
        {showCreateModal && (
          <div className="modal-overlay" onClick={() => setShowCreateModal(false)}>
            <div className="modal-content modal-aligned" onClick={(e) => e.stopPropagation()}>
              <h2>Create Budget</h2>
              <form className="budget-form" onSubmit={handleCreateSubmit}>
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

        <div className="goal-grid">
          {budgets.length === 0 ? (
            <div className="no-budgets">No budgets found.</div>
          ) : (
            budgets.map(b => {
              const target = Number(b.limitAmount) || 0;
              // Placeholder for current spending. You'd typically fetch this separately or have it in the budget object.
              const current = 0; 
              const percent = target > 0 ? Math.min(100, Math.round((current / target) * 100)) : 0;
              const remaining = Math.max(0, (target - current).toFixed(2));
              return (
                <div key={b.budgetId} className="goal-card" onClick={() => setSelectedId(b.budgetId)}>
                  <div className="goal-card-top">
                    <div className="goal-title">{b.month} {b.year}</div>
                    <div className="goal-amount">R{target}</div>
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

        {/* Update Modal */}
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
                <button className="btn-delete" onClick={handleDeleteConfirm}>Confirm Delete</button>
                <button className="enhanced-btn" onClick={() => setShowDeleteModal(false)}>Cancel</button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}