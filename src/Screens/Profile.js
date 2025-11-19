import React, { useEffect, useState } from "react";

const API_BASE = "http://localhost:8081/api/regularUser";

export default function Profile() {
  const [user, setUser] = useState(null);
  const [editMode, setEditMode] = useState(false);
  const [form, setForm] = useState({ userName: "", email: "" });
  const [error, setError] = useState("");
  // Accept either key because other parts of the app use slightly different casing
  const userId = localStorage.getItem("regularUserID") || localStorage.getItem("regularUserId");

  useEffect(() => {
    if (!userId) {
      setError("No user ID found. Please log in.");
      return;
    }
    fetch(`${API_BASE}/read/${userId}`)
      .then(res => {
        if (!res.ok) throw new Error("User not found");
        return res.json();
      })
      .then(data => {
        if (!data) {
          setError("User not found.");
        } else {
          setUser(data);
          setForm({ userName: data.userName || "", email: data.email || "" });
        }
      })
      .catch(() => setError("User not found or server error."));
  }, [userId]);

  const handleUpdate = async (e) => {
    e.preventDefault();
    const payload = { ...user, ...form };
    const res = await fetch(`${API_BASE}/update`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload)
    });
    if (res.ok) {
      setEditMode(false);
      const updated = await res.json();
      setUser(updated);
    }
  };

  if (error) return <div style={{ color: "#ff5252", padding: "2em" }}>{error}</div>;
  if (!user) return <div>Loading profile...</div>;

  const handleLogout = () => {
    // Clear both possible storage keys to avoid stale state
    localStorage.removeItem("regularUserID");
    localStorage.removeItem("regularUserId");
    localStorage.removeItem("regularUserName");
    window.location.href = "/";
  };

  return (
    <div className="profile-card">
      <div className="profile-header">
        <h2>Profile</h2>
        <button className="logout-btn" onClick={handleLogout}>Log Out</button>
      </div>
      {!editMode ? (
        <div className="profile-info">
          <div><span className="profile-label">Username:</span> <span className="profile-value">{user.userName}</span></div>
          <div><span className="profile-label">Email:</span> <span className="profile-value">{user.email}</span></div>
          <button className="enhanced-btn" onClick={() => setEditMode(true)}>Edit</button>
        </div>
      ) : (
        <form onSubmit={handleUpdate} className="profile-form">
          <label className="profile-label">Username:</label>
          <input className="profile-input" value={form.userName} onChange={e => setForm({ ...form, userName: e.target.value })} />
          <label className="profile-label">Email:</label>
          <input className="profile-input" value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} />
          <div className="profile-btn-row">
            <button className="enhanced-btn" type="submit">Save</button>
            <button className="btn-delete" type="button" onClick={() => setEditMode(false)}>Cancel</button>
          </div>
        </form>
      )}
    </div>
  );
}
