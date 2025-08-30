import React, { useEffect, useState } from "react";

const API_BASE = "http://localhost:8081/api/budget";

export default function BudgetPage() {
  const [budgets, setBudgets] = useState([]);
  const [form, setForm] = useState({ month: "", year: "", limitAmount: "" });
  const [selectedId, setSelectedId] = useState("");
  const [message, setMessage] = useState("");

  // Fetch all budgets
  useEffect(() => {
    fetch(`${API_BASE}/findAll`)
      .then(res => res.ok ? res.json() : [])
      .then(setBudgets)
      .catch(() => setBudgets([]));
  }, []);

  // Create budget
  const handleCreate = async () => {
    const res = await fetch(`${API_BASE}/create`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form)
    });
    if (res.ok) {
      setMessage("Budget created!");
      window.location.reload();
    } else {
      setMessage("Failed to create budget.");
    }
  };

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

  // Update budget
  const handleUpdate = async () => {
    const res = await fetch(`${API_BASE}/update`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...form, id: selectedId })
    });
    if (res.ok) {
      setMessage("Budget updated!");
      window.location.reload();
    } else {
      setMessage("Failed to update budget.");
    }
  };

  // Delete budget
  const handleDelete = async () => {
    const res = await fetch(`${API_BASE}/delete/${selectedId}`, { method: "DELETE" });
    if (res.ok) {
      setMessage("Budget deleted!");
      window.location.reload();
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
    <div className="budget-page">
      <h1>Budget Management</h1>
      <div style={{ color: "red" }}>{message}</div>
      <div className="budget-form">
        <input
          placeholder="Month"
          value={form.month}
          onChange={e => setForm({ ...form, month: e.target.value })}
        />
        <input
          placeholder="Year"
          value={form.year}
          onChange={e => setForm({ ...form, year: e.target.value })}
        />
        <input
          placeholder="Limit Amount"
          type="number"
          value={form.limitAmount}
          onChange={e => setForm({ ...form, limitAmount: e.target.value })}
        />
        <button onClick={handleCreate}>Create Budget</button>
        <button onClick={handleFindByMonth}>Find by Month</button>
        <button onClick={handleFindByYear}>Find by Year</button>
        <button onClick={handleFindByLimitAmount}>Find by Limit Amount</button>
      </div>
      <div className="budget-id-actions">
        <input
          placeholder="Budget ID"
          value={selectedId}
          onChange={e => setSelectedId(e.target.value)}
        />
        <button onClick={handleRead}>Read</button>
        <button onClick={handleUpdate}>Update</button>
        <button onClick={handleDelete}>Delete</button>
      </div>
      <h2>Budgets</h2>
      <table border="1">
        <thead>
          <tr>
            <th>ID</th>
            <th>Month</th>
            <th>Year</th>
            <th>Limit Amount</th>
          </tr>
        </thead>
        <tbody>
          {budgets.map(b => (
            <tr key={b.id}>
              <td>{b.id}</td>
              <td>{b.month}</td>
              <td>{b.year}</td>
              <td>{b.limitAmount}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
