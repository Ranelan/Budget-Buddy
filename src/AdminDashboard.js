import React, { useState } from "react";
import "./AdminDashboard.css";


export default function AdminDashboard() {
  const [admin, setAdmin] = useState({
    userID: "",
    userName: "",
    email: "",
    password: "",
    adminCode: ""
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setAdmin((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    alert("Admin details submitted!\n" + JSON.stringify(admin, null, 2));
  };

  return (
    <div className="admin-dashboard">
      <h2>Admin Dashboard</h2>
      <form className="admin-form" onSubmit={handleSubmit}>
        <label>
          Admin Code:
          <input
            type="text"
            name="adminCode"
            value={admin.adminCode}
            onChange={handleChange}
            required
          />
        </label>
        <label>
          User Name:
          <input
            type="text"
            name="userName"
            value={admin.userName}
            onChange={handleChange}
            required
          />
        </label>
        <label>
          Email:
          <input
            type="email"
            name="email"
            value={admin.email}
            onChange={handleChange}
            required
          />
        </label>
        <label>
          Password:
          <input
            type="password"
            name="password"
            value={admin.password}
            onChange={handleChange}
            required
          />
        </label>
        <button type="submit" className="admin-submit">Save Admin</button>
      </form>
  {/* ...no admin info section... */}
    </div>
  );
}
