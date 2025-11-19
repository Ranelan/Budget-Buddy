import React, { useEffect, useState } from "react";
import goalService from "../services/goalService"; // Make sure the path is correct
import Toast from "../components/Toast"; // Assuming you have a Toast component

export default function GoalPage() {
  const [goals, setGoals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState({ goalName: "", targetAmount: "", currentAmount: "", deadLine: "" });
  const [updateForm, setUpdateForm] = useState({ goalName: "", targetAmount: "", currentAmount: "", deadLine: "" });
  const [selectedId, setSelectedId] = useState("");
  const [showUpdateModal, setShowUpdateModal] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [toastMessage, setToastMessage] = useState("");
  const [toastType, setToastType] = useState("success");

  // Helper to robustly obtain the current regular user's id from localStorage.
  // Checks both key variants and falls back to scanning for any key containing 'regularuser'.
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

  // Initial and subsequent data fetching is now handled by the secure service
  const fetchGoals = async () => {
    setLoading(true);
    try {
      const data = await goalService.fetchGoalsForCurrentUser();
      setGoals(data || []);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchGoals();
  }, []);

  const handleCreate = async (e) => {
    e.preventDefault();
    if (!form.goalName.trim() || !form.targetAmount || Number(form.targetAmount) <= 0 || !form.deadLine) {
      setToastMessage("All fields are required and target amount must be greater than zero.");
      setToastType("error");
      return;
    }

    const rawUserId = getCurrentUserId();
    const numericUserId = rawUserId ? Number(rawUserId) : undefined;
    const payload = {
      goalName: form.goalName,
      targetAmount: Number(form.targetAmount),
      currentAmount: Number(form.currentAmount) || 0,
      deadLine: form.deadLine,
      // Attach ownership in both nested and top-level forms for backend compatibility
      regularUser: numericUserId ? { userID: numericUserId } : undefined,
      userId: numericUserId || undefined
    };
    console.log('Submitting goal create payload:', payload);

    try {
      const res = await goalService.createGoal(payload);
      const text = await res.text().catch(() => '');
      let parsed = null;
      try { parsed = text ? JSON.parse(text) : null; } catch (e) { /* ignore */ }
      console.log('Create goal response:', res.status, text, parsed);
      if (res.ok) {
        setToastMessage("Goal created successfully!");
        setToastType("success");
        setShowCreateModal(false);
        setForm({ goalName: "", targetAmount: "", currentAmount: "", deadLine: "" });
        fetchGoals(); // Refresh list securely
      } else {
        setToastMessage("Failed to create goal.");
        setToastType("error");
      }
    } catch (err) {
      console.error('Goal create error:', err);
      setToastMessage('Failed to create goal.');
      setToastType('error');
    }
  };

  const openUpdateModal = (goal) => {
    setSelectedId(goal.goalId);
    setUpdateForm({
      goalName: goal.goalName || "",
      targetAmount: goal.targetAmount || "",
      currentAmount: goal.currentAmount || "",
      // Format date correctly for the input field
      deadLine: goal.deadLine ? new Date(goal.deadLine).toISOString().split('T')[0] : "",
    });
    setShowUpdateModal(true);
  };

  const handleUpdateSubmit = async (e) => {
    e.preventDefault();
    if (!updateForm.goalName.trim() || !updateForm.targetAmount || Number(updateForm.targetAmount) <= 0 || !updateForm.deadLine) {
        setToastMessage("All fields are required and target amount must be greater than zero.");
        setToastType("error");
        return;
    }

    const rawUserId = getCurrentUserId();
    const numericUserId = rawUserId ? Number(rawUserId) : undefined;
    const payload = {
      goalId: selectedId,
      goalName: updateForm.goalName,
      targetAmount: Number(updateForm.targetAmount),
      currentAmount: Number(updateForm.currentAmount) || 0,
      deadLine: updateForm.deadLine,
      regularUser: numericUserId ? { userID: numericUserId } : undefined,
      userId: numericUserId || undefined
    };
    console.log('Submitting goal update payload:', payload);

    try {
      const res = await goalService.updateGoal(payload);
      const text = await res.text().catch(() => '');
      let parsed = null;
      try { parsed = text ? JSON.parse(text) : null; } catch (e) { /* ignore */ }
      console.log('Update goal response:', res.status, text, parsed);
      if (res.ok) {
        setToastMessage("Goal updated successfully!");
        setToastType("success");
        setShowUpdateModal(false);
        fetchGoals(); // Refresh list securely
      } else {
        setToastMessage("Failed to update goal.");
        setToastType("error");
      }
    } catch (err) {
      console.error('Goal update error:', err);
      setToastMessage('Failed to update goal.');
      setToastType('error');
    }
  };

  const handleDelete = async () => {
    const res = await goalService.deleteGoal(selectedId);
    if (res.ok) {
      setToastMessage("Goal deleted successfully!");
      setToastType("success");
      setShowDeleteModal(false);
      fetchGoals(); // Refresh list securely
    } else {
      setToastMessage("Failed to delete goal.");
      setToastType("error");
    }
  };

  return (
    <>
      <Toast message={toastMessage} type={toastType} duration={3000} onClose={() => setToastMessage("")} />

      {/* Loading state */}
      {loading ? (
        <div className="page-loader">
          <div className="loader-spinner" />
          <div className="loader-text">Loading goals...</div>
        </div>
      ) : (
        /* Summary Cards */
        <>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1rem', marginBottom: '1rem' }}>
        <div className="goal-card" style={{ padding: '1rem 1.25rem' }}>
          <div style={{ fontSize: '0.9rem', color: 'hsl(var(--muted-foreground))' }}>Active Goals</div>
          <div style={{ fontSize: '1.6rem', fontWeight: 700 }}>{goals.length}</div>
        </div>
        <div className="goal-card" style={{ padding: '1rem 1.25rem' }}>
          <div style={{ fontSize: '0.9rem', color: 'hsl(var(--muted-foreground))' }}>Total Saved</div>
          <div style={{ fontSize: '1.6rem', fontWeight: 700 }}>R{(goals.reduce((s, g) => s + Number(g.currentAmount || 0), 0)).toLocaleString()}</div>
        </div>
        <div className="goal-card" style={{ padding: '1rem 1.25rem' }}>
          <div style={{ fontSize: '0.9rem', color: 'hsl(var(--muted-foreground))' }}>Total Target</div>
          <div style={{ fontSize: '1.6rem', fontWeight: 700 }}>R{(goals.reduce((s, g) => s + Number(g.targetAmount || 0), 0)).toLocaleString()}</div>
        </div>
      </div>

        <div className="budget-main-card">
        <div className="goal-header">
          <h1 style={{ margin: 0 }}>Your Goals</h1>
          <button className="signup-btn signup-btn-blue add-goal-btn" onClick={() => setShowCreateModal(true)}>+ Add Goal</button>
        </div>

        <div style={{ display: 'grid', gap: '1rem', marginTop: '1rem' }}>
          {goals.length === 0 ? (
            <div className="no-budgets">No goals yet. Click Add Goal to create your first one.</div>
          ) : (
            goals.map(g => {
              const target = Number(g.targetAmount) || 0;
              const current = Number(g.currentAmount) || 0;
              const percent = target > 0 ? Math.min(100, Math.round((current / target) * 100)) : 0;
              const remaining = Math.max(0, (target - current));
              let daysLeftText = '-';
              if (g.deadLine) {
                const diff = Math.ceil((new Date(g.deadLine) - new Date()) / (1000 * 60 * 60 * 24));
                daysLeftText = diff < 0 ? 'Overdue' : diff;
              }
              return (
                <div key={g.goalId} className={`goal-panel goal-card ${selectedId === g.goalId ? 'selected' : ''}`} onClick={() => setSelectedId(g.goalId)}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div style={{ fontWeight: 700, fontSize: '1.05rem' }}>{g.goalName}</div>
                    <div>
                      {selectedId === g.goalId && (
                        <div style={{ display: 'flex', gap: '0.5rem' }}>
                          <button className="btn-edit" onClick={(ev) => { ev.stopPropagation(); openUpdateModal(g); }}>Update</button>
                          <button className="btn-delete" onClick={(ev) => { ev.stopPropagation(); setShowDeleteModal(true); }}>Delete</button>
                        </div>
                      )}
                    </div>
                  </div>
                  <div className="progress-track" style={{marginTop: '0.75rem'}}><div className="progress-fill" style={{ width: `${percent}%` }} /></div>
                  <div className="goal-meta" style={{ marginTop: '0.75rem' }}>
                    <div><div className="meta-label">Current</div><div className="meta-value">R{current.toLocaleString()}</div></div>
                    <div><div className="meta-label">Target</div><div className="meta-value">R{target.toLocaleString()}</div></div>
                    <div><div className="meta-label">Remaining</div><div className="meta-value">R{remaining.toLocaleString()}</div></div>
                    <div><div className="meta-label">Days Left</div><div className="meta-value">{daysLeftText}</div></div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>

        {/* Modals */}
      {showDeleteModal && (
        <div className="modal-overlay" onClick={() => setShowDeleteModal(false)}>
          <div className="modal-content modal-aligned" onClick={(e) => e.stopPropagation()}>
            <h2>Delete Goal</h2>
            <p>Are you sure you want to delete this goal? This action cannot be undone.</p>
            <div className="modal-btn-row" style={{ marginTop: '1rem' }}>
              <button className="btn-delete" onClick={handleDelete}>Confirm Delete</button>
              <button className="enhanced-btn" onClick={() => setShowDeleteModal(false)}>Cancel</button>
            </div>
          </div>
        </div>
      )}

      {showCreateModal && (
          <div className="modal-overlay" onClick={() => setShowCreateModal(false)}>
              <div className="modal-content modal-aligned" onClick={(e) => e.stopPropagation()}>
                  <h2>Create Goal</h2>
                  <form className="budget-form" onSubmit={handleCreate}>
                      <div className="form-grid-budget">
                          <input className="signup-input" placeholder="Goal Name" value={form.goalName} onChange={e => setForm({ ...form, goalName: e.target.value })} />
                          <input className="signup-input" placeholder="Target Amount" type="number" value={form.targetAmount} onChange={e => setForm({ ...form, targetAmount: e.target.value })} />
                          <input className="signup-input" placeholder="Current Amount (Optional)" type="number" value={form.currentAmount} onChange={e => setForm({ ...form, currentAmount: e.target.value })} />
                          <input className="signup-input" type="date" min={new Date().toISOString().split('T')[0]} value={form.deadLine} onChange={e => setForm({ ...form, deadLine: e.target.value })} />
                      </div>
                      <div className="modal-btn-row">
                          <button className="enhanced-btn" type="submit">Create Goal</button>
                          <button className="btn-delete" type="button" onClick={() => setShowCreateModal(false)}>Cancel</button>
                      </div>
                  </form>
              </div>
          </div>
      )}

      {showUpdateModal && (
          <div className="modal-overlay" onClick={() => setShowUpdateModal(false)}>
              <div className="modal-content modal-aligned" onClick={(e) => e.stopPropagation()}>
                  <h2>Update Goal</h2>
                  <form onSubmit={handleUpdateSubmit} className="budget-form">
                      <div className="form-grid-budget">
                          <input className="signup-input" placeholder="Goal Name" value={updateForm.goalName} onChange={e => setUpdateForm({ ...updateForm, goalName: e.target.value })} />
                          <input className="signup-input" placeholder="Target Amount" type="number" value={updateForm.targetAmount} onChange={e => setUpdateForm({ ...updateForm, targetAmount: e.target.value })} />
                          <input className="signup-input" placeholder="Current Amount" type="number" value={updateForm.currentAmount} onChange={e => setUpdateForm({ ...updateForm, currentAmount: e.target.value })} />
                          <input className="signup-input" type="date" min={new Date().toISOString().split('T')[0]} value={updateForm.deadLine} onChange={e => setUpdateForm({ ...updateForm, deadLine: e.target.value })} />
                      </div>
                      <div className="modal-btn-row">
                          <button className="enhanced-btn" type="submit">Save Changes</button>
                          <button className="btn-delete" type="button" onClick={() => setShowUpdateModal(false)}>Cancel</button>
                      </div>
                  </form>
              </div>
          </div>
      )}
        </>
      )}
    </>
  );
}