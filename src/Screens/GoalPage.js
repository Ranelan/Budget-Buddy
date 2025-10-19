import React, { useEffect, useState } from "react";

const API_BASE = "http://localhost:8081/api/goal";

export default function GoalPage() {
  const [goals, setGoals] = useState([]);
  const [form, setForm] = useState({ goalName: "", targetAmount: "", currentAmount: "", deadLine: "" });
  const [selectedId, setSelectedId] = useState("");
  const [showUpdateModal, setShowUpdateModal] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [updateForm, setUpdateForm] = useState({ goalName: "", targetAmount: "", currentAmount: "", deadLine: "" });
  const [message, setMessage] = useState("");

  useEffect(() => {
    fetch(`${API_BASE}/findAll`)
      .then(res => res.ok ? res.json() : [])
      .then(setGoals)
      .catch(() => setGoals([]));
  }, []);

  const handleCreate = async () => {
    // Validation: no empty fields, amounts > 0
    if (!form.goalName.trim() || !form.targetAmount || Number(form.targetAmount) <= 0 || !form.deadLine) {
      setMessage("All fields are required and amounts must be greater than zero.");
      return;
    }
    const payload = {
      goalName: form.goalName,
      targetAmount: form.targetAmount,
      currentAmount: form.currentAmount || 0,
      deadLine: form.deadLine,
      regularUser: localStorage.getItem("regularUserId") ? { userID: localStorage.getItem("regularUserId") } : undefined
    };
    const res = await fetch(`${API_BASE}/create`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload)
    });
    if (res.ok) {
      setMessage("Goal created!");
      window.location.reload();
    } else {
      setMessage("Failed to create goal.");
    }
  };

  // Show update modal and prefill form
  const openUpdateModal = (goal) => {
    setSelectedId(goal.goalId);
    setUpdateForm({
      goalName: goal.goalName || "",
      targetAmount: goal.targetAmount || "",
      currentAmount: goal.currentAmount || "",
      deadLine: goal.deadLine || ""
    });
    setShowUpdateModal(true);
  };

  const handleUpdateSubmit = async (e) => {
    e.preventDefault();
    // Validation: no empty fields, amounts > 0
    if (!updateForm.goalName.trim() || !updateForm.targetAmount || Number(updateForm.targetAmount) <= 0 || !updateForm.deadLine) {
      setMessage("All fields are required and amounts must be greater than zero.");
      return;
    }
    const payload = {
      goalId: selectedId,
      goalName: updateForm.goalName,
      targetAmount: updateForm.targetAmount,
      currentAmount: updateForm.currentAmount || 0,
      deadLine: updateForm.deadLine,
      regularUser: localStorage.getItem("regularUserId") ? { userID: localStorage.getItem("regularUserId") } : undefined
    };
    const res = await fetch(`${API_BASE}/update`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload)
    });
    if (res.ok) {
      setMessage("Goal updated!");
      setShowUpdateModal(false);
      window.location.reload();
    } else {
      setMessage("Failed to update goal.");
    }
  };

  const handleDelete = async () => {
    const res = await fetch(`${API_BASE}/delete/${selectedId}`, { method: "DELETE" });
    if (res.ok) {
      setMessage("Goal deleted!");
      setShowUpdateModal(false);
      window.location.reload();
    } else {
      setMessage("Failed to delete goal.");
    }
  };

  const handleFindByGoalName = async () => {
    const res = await fetch(`${API_BASE}/findByGoalName/${form.goalName}`);
    if (res.ok) {
      setGoals(await res.json());
      setMessage("");
    } else {
      setMessage("No goals found for name.");
    }
  };

  const handleFindByDeadLine = async () => {
    const res = await fetch(`${API_BASE}/findByDeadLine/${form.deadLine}`);
    if (res.ok) {
      setGoals(await res.json());
      setMessage("");
    } else {
      setMessage("No goals found for deadline.");
    }
  };

  const handleFindByMembershipId = async () => {
    const res = await fetch(`${API_BASE}/findByRegularUser_MembershipID/${form.membershipId}`);
    if (res.ok) {
      setGoals(await res.json());
      setMessage("");
    } else {
      setMessage("No goals found for membership ID.");
    }
  };

  return (
    <div className="dashboard-content">
      {/* Top stat cards row (summary) */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1rem', marginBottom: '1rem' }}>
        <div className="goal-card" style={{ padding: '1rem 1.25rem' }}>
          <div style={{ fontSize: '0.9rem', color: 'hsl(var(--muted-foreground))' }}>Active Goals</div>
          <div style={{ fontSize: '1.6rem', fontWeight: 700 }}>{goals.length}</div>
        </div>
        <div className="goal-card" style={{ padding: '1rem 1.25rem' }}>
          <div style={{ fontSize: '0.9rem', color: 'hsl(var(--muted-foreground))' }}>Total Saved</div>
          <div style={{ fontSize: '1.6rem', fontWeight: 700 }}>R{(goals.reduce((s,g) => s + Number(g.currentAmount || 0),0)).toLocaleString()}</div>
        </div>
        <div className="goal-card" style={{ padding: '1rem 1.25rem' }}>
          <div style={{ fontSize: '0.9rem', color: 'hsl(var(--muted-foreground))' }}>Total Target</div>
          <div style={{ fontSize: '1.6rem', fontWeight: 700 }}>R{(goals.reduce((s,g) => s + Number(g.targetAmount || 0),0)).toLocaleString()}</div>
        </div>
      </div>

      <div className="budget-main-card">
        <div className="goal-header">
          <h1 style={{ margin: 0 }}>Your Goals</h1>
          <button className="signup-btn signup-btn-blue add-goal-btn" onClick={() => setShowCreateModal(true)}>+ Add Goal</button>
        </div>

        {message && <div className="goal-message">{message}</div>}

        <div style={{ display: 'grid', gap: '1rem', marginTop: '1rem' }}>
          {goals.length === 0 ? (
            <div className="no-budgets">No goals yet. Click Add Goal to create your first one.</div>
          ) : (
            goals.map(g => {
              const target = Number(g.targetAmount) || 0;
              const current = Number(g.currentAmount) || 0;
              const percent = target > 0 ? Math.min(100, Math.round((current / target) * 100)) : 0;
              const remaining = Math.max(0, (target - current).toFixed(2));
              // days left calculation (if deadline present)
              let daysLeft = '';
              if (g.deadLine) {
                const d = new Date(g.deadLine);
                const diff = Math.ceil((d - new Date()) / (1000 * 60 * 60 * 24));
                daysLeft = diff;
              }
              return (
                <div key={g.goalId || g.id} className="goal-panel goal-card" style={{ padding: '1rem 1.25rem' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div>
                      <div style={{ fontWeight: 700, fontSize: '1.05rem' }}>{g.goalName}</div>
                      <div style={{ color: 'hsl(var(--muted-foreground))', fontSize: '0.9rem' }}>{g.category || ''}</div>
                    </div>
                    <div>
                      <button className="btn-edit" onClick={() => openUpdateModal(g)}>Edit</button>
                    </div>
                  </div>
                  <div style={{ marginTop: '0.75rem' }}>
                    <div className="progress-track"><div className="progress-fill" style={{ width: `${percent}%` }} /></div>
                  </div>
                  <div className="goal-meta" style={{ marginTop: '0.75rem' }}>
                    <div>
                      <div style={{ color: 'hsl(var(--muted-foreground))' }}>Current</div>
                      <div style={{ fontWeight: 700 }}>R{current.toLocaleString()}</div>
                    </div>
                    <div>
                      <div style={{ color: 'hsl(var(--muted-foreground))' }}>Target</div>
                      <div style={{ fontWeight: 700 }}>R{target.toLocaleString()}</div>
                    </div>
                    <div>
                      <div style={{ color: 'hsl(var(--muted-foreground))' }}>Remaining</div>
                      <div style={{ fontWeight: 700 }}>R{Number(remaining).toLocaleString()}</div>
                    </div>
                    <div>
                      <div style={{ color: 'hsl(var(--muted-foreground))' }}>Days Left</div>
                      <div style={{ fontWeight: 700 }}>{daysLeft}</div>
                    </div>
                  </div>
                  <div style={{ display: 'flex', gap: '0.75rem', marginTop: '1rem' }}>
                    <button className="signup-btn signup-btn-blue" onClick={() => { /* add money flow placeholder */ }}>Add Money</button>
                    <button className="enhanced-btn" onClick={() => openUpdateModal(g)}>View Details</button>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* Create Modal (kept consistent with Budget modals) */}
      {showCreateModal && (
        <div className="modal-overlay" onClick={() => setShowCreateModal(false)}>
          <div className="modal-content modal-aligned" onClick={(e) => e.stopPropagation()}>
            <h2>Create Goal</h2>
            <form className="budget-form" onSubmit={(e) => { e.preventDefault(); handleCreate(); }}>
              <div className="form-grid-budget">
                <input className="signup-input" placeholder="Goal Name" value={form.goalName} onChange={e => setForm({ ...form, goalName: e.target.value })} />
                <input className="signup-input" placeholder="Target Amount" type="number" value={form.targetAmount} onChange={e => setForm({ ...form, targetAmount: e.target.value })} />
                <input className="signup-input" placeholder="Current Amount" type="number" value={form.currentAmount} onChange={e => setForm({ ...form, currentAmount: e.target.value })} />
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
                <button className="enhanced-btn" type="submit">Save</button>
                <button className="btn-delete" type="button" onClick={handleDelete}>Delete</button>
                <button className="btn-delete" type="button" onClick={() => setShowUpdateModal(false)}>Cancel</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}