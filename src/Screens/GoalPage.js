import React, { useEffect, useState } from "react";

const API_BASE = "http://localhost:8081/api/goal";

export default function GoalPage() {
  const [goals, setGoals] = useState([]);
  const [form, setForm] = useState({ goalName: "", targetAmount: "", currentAmount: "", deadLine: "" });
  const [selectedId, setSelectedId] = useState("");
  const [showUpdateModal, setShowUpdateModal] = useState(false);
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
    <div className="goal-page">
      <h1>Goal Management</h1>
      <div style={{ color: "red" }}>{message}</div>
      <div className="goal-form">
        <input
          placeholder="Goal Name"
          value={form.goalName}
          onChange={e => setForm({ ...form, goalName: e.target.value })}
        />
        <input
          placeholder="Target Amount (R)"
          type="number"
          value={form.targetAmount}
          onChange={e => setForm({ ...form, targetAmount: e.target.value })}
        />
        <input
          placeholder="Current Amount (R)"
          type="number"
          value={form.currentAmount}
          onChange={e => setForm({ ...form, currentAmount: e.target.value })}
        />
        <input
          type="date"
          min={new Date().toISOString().split('T')[0]}
          value={form.deadLine}
          onChange={e => setForm({ ...form, deadLine: e.target.value })}
        />
  {/* Membership ID removed, regularUser is set automatically */}
  <button onClick={handleCreate}>Create Goal</button>
      </div>
  {/* Goal ID actions removed for cleaner UI */}
      <h2>Goals</h2>
      <table border="1">
        <thead>
          <tr>
            <th>Name</th>
            <th>Target Amount</th>
            <th>Current Amount</th>
            <th>Deadline</th>
          </tr>
        </thead>
        <tbody>
          {goals.map(g => (
            <tr key={g.goalId || g.id} onClick={() => openUpdateModal(g)} style={{ cursor: "pointer" }}>
              <td>{g.goalName}</td>
              <td>R{Number(g.targetAmount).toLocaleString('en-ZA', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
              <td>R{Number(g.currentAmount).toLocaleString('en-ZA', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
              <td>{g.deadLine}</td>
            </tr>
          ))}
        </tbody>
      </table>
      {showUpdateModal && (
        <div className="modal-overlay">
          <div className="modal-content">
            <h2>Update Goal</h2>
            <form onSubmit={handleUpdateSubmit} className="goal-form">
              <input
                placeholder="Goal Name"
                value={updateForm.goalName}
                onChange={e => setUpdateForm({ ...updateForm, goalName: e.target.value })}
              />
              <input
                placeholder="Target Amount (R)"
                type="number"
                value={updateForm.targetAmount}
                onChange={e => setUpdateForm({ ...updateForm, targetAmount: e.target.value })}
              />
              <input
                placeholder="Current Amount (R)"
                type="number"
                value={updateForm.currentAmount}
                onChange={e => setUpdateForm({ ...updateForm, currentAmount: e.target.value })}
              />
              <input
                type="date"
                min={new Date().toISOString().split('T')[0]}
                value={updateForm.deadLine}
                onChange={e => setUpdateForm({ ...updateForm, deadLine: e.target.value })}
              />
              <button className="enhanced-btn" type="submit">Save</button>
              <button className="btn-delete" type="button" onClick={handleDelete}>Delete</button>
              <button className="btn-delete" type="button" onClick={() => setShowUpdateModal(false)}>Cancel</button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
