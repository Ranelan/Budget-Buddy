import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import "./App.css";
import Category from "./Category";
import { BarChart, Bar, XAxis, YAxis, Tooltip, Legend, CartesianGrid,ResponsiveContainer, } from "recharts";

const sections = [
  { key: "admin", label: "Admin Management" },
  { key: "users", label: "Regular Users" },
  { key: "categories", label: "Categories" },
  { key: "analytics", label: "Analytics" },
  { key: "profile", label: "Admin Profile"}
];

function Sidebar({ selected, onSelect }) {
  return (
    <div className="dashboard-sidebar">
      <div className="dashboard-sidebar-title">Management</div>
      {sections.map((section) => (
        <button
          key={section.key}
          className={`dashboard-sidebar-link${selected === section.key ? " active" : ""}`}
          onClick={() => onSelect(section.key)}
        >
          {section.label}
        </button>
      ))}
    </div>
  );
}

function MainContent({ selected }) {
  switch (selected) {
    case "admin":
      return <AdminSection />;
    case "users":
      return <UsersSection />;
    case "categories":
      return <CategoriesSection />;
    case "analytics":
      return <AnalyticsSection />;
    case "profile":
      return <AdminProfileSection />;
    default:
      return <div className="dashboard-content">Select a management section.</div>;
  }
}

function AdminSection() {
  const [admins, setAdmins] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  React.useEffect(() => {
    setLoading(true);
    fetch("http://localhost:8081/api/admin/findAll")
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data)) {
          setAdmins(data);
        } else if (data && Array.isArray(data.admins)) {
          setAdmins(data.admins);
        } else {
          setAdmins([]);
          setError("Unexpected response format");
        }
        setLoading(false);
      })
      .catch(err => { setError("Failed to fetch admins"); setLoading(false); });
  }, []);

  return (
    <div className="dashboard-content">
      <h2>Admin Management</h2>
      {loading ? <div>Loading...</div> : null}
      {error ? <div style={{color:'red'}}>{error}</div> : null}
      {admins.length === 0 && !loading ? <div>No admins found.</div> : null}
      {Array.isArray(admins) && admins.length > 0 && (
        <table className="dashboard-table">
          <thead>
            <tr>
              <th>ID</th>
              <th>User Name</th>
              <th>Email</th>
            </tr>
          </thead>
          <tbody>
            {admins.map(admin => (
              <tr key={admin.id}>
                <td>{admin.id}</td>
                <td>{admin.userName}</td>
                <td>{admin.email}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}

function UsersSection() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  React.useEffect(() => {
    setLoading(true);
    fetch("http://localhost:8081/api/admin/regular-users")
      .then(res => res.json())
      .then(data => { setUsers(data); setLoading(false); })
      .catch(err => { setError("Failed to fetch users"); setLoading(false); });
  }, []);

  return (
    <div className="dashboard-content">
      <h2>Regular Users</h2>
      {loading ? <div>Loading...</div> : null}
      {error ? <div style={{color:'red'}}>{error}</div> : null}
      {users.length === 0 && !loading ? <div>No users found.</div> : null}
      {Array.isArray(users) && users.length > 0 && (
        <table className="dashboard-table">
          <thead>
            <tr>
              <th>ID</th>
              <th>User Name</th>
              <th>Email</th>
            </tr>
          </thead>
          <tbody>
            {users.map(user => (
              <tr key={user.id}>
                <td>{user.id}</td>
                <td>{user.userName}</td>
                <td>{user.email}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}

function CategoriesSection() {
  return (
    <div className="dashboard-content">
      <Category role="admin" />
    </div>
  )
}

function AnalyticsSection() {
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    setLoading(true);
    fetch("http://localhost:8081/api/admin/analytics")
      .then((res) => {
        if (!res.ok) throw new Error("Failed to fetch analytics");
        return res.json();
      })
      .then((data) => {
        setAnalytics(data);
        setLoading(false);
      })
      .catch(() => {
        setError("Failed to fetch analytics");
        setLoading(false);
      });
  }, []);

  if (loading) return <div className="text-gray-500">Loading analytics...</div>;
  if (error) return <div className="text-red-500">{error}</div>;
  if (!analytics) return <div>No analytics data available.</div>;

  const categoryData = Object.entries(analytics.transactionsByCategory || {}).map(
    ([name, count]) => ({ name, count })
  );

  const typeData = Object.entries(analytics.transactionsByType || {}).map(
    ([type, count]) => ({ type, count })
  );

  const renderBarChart = (data, xKey, title, color) => (
    <div className="bg-white p-4 rounded-2xl shadow-md mb-6">
      <h3 className="text-lg font-semibold mb-4">{title}</h3>
      <ResponsiveContainer width="100%" height={300}>
        <BarChart
          data={data}
          margin={{ top: 20, right: 20, left: 0, bottom: 5 }}
        >
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey={xKey} />
          <YAxis />
          <Tooltip />
          <Legend />
          <Bar dataKey="count" fill={color} radius={[6, 6, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );

  return (
    <div className="dashboard-content">
      <h2 className="text-2xl font-bold mb-6">Analytics Overview</h2>
      {renderBarChart(categoryData, "name", "Transactions by Category", "#6366F1")}
      {renderBarChart(typeData, "type", "Transactions by Type", "#10B981")}
    </div>
  );
}
const API_BASE = "http://localhost:8081/api/admin";
function AdminProfileSection() {
 const [admin, setAdmin] = useState(null);
  const [editMode, setEditMode] = useState(false);
  const [form, setForm] = useState({ userName: "", email: "" });
  const [error, setError] = useState("");
  const adminId = localStorage.getItem("adminId");

  useEffect(() => {
    if (!adminId) {
      setError("No admin ID found. Please log in.");
      return;
    }
    fetch(`${API_BASE}/read/${adminId}`)
      .then(res => {
        if (!res.ok) throw new Error("Admin not found");
        return res.json();
      })
      .then(data => {
        if (!data) {
          setError("Admin not found.");
        } else {
          setAdmin(data);
          setForm({ userName: data.userName || "", email: data.email || "" });
        }
      })
      .catch(() => setError("Admin not found or server error."));
  }, [adminId]);

  const handleUpdate = async (e) => {
    e.preventDefault();
    const payload = { ...admin, ...form };
    const res = await fetch(`${API_BASE}/update`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload)
    });
    if (res.ok) {
      setEditMode(false);
      const updated = await res.json();
      setAdmin(updated);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("adminId");
    localStorage.removeItem("adminName");
    window.location.href = "/";
  };

  if (error) return <div style={{ color: "#ff5252", padding: "2em" }}>{error}</div>;
  if (!admin) return <div>Loading profile...</div>;

  return (
    <div className="profile-card">
      <div className="profile-header">
        <h2>Admin Profile</h2>
        <button className="logout-btn" onClick={handleLogout}>Log Out</button>
      </div>
      {!editMode ? (
        <div className="profile-info">
          <div>
            <span className="profile-label">Username:</span>
            <span className="profile-value">{admin.userName}</span>
          </div>
          <div>
            <span className="profile-label">Email:</span>
            <span className="profile-value">{admin.email}</span>
          </div>
          <button className="enhanced-btn" onClick={() => setEditMode(true)}>Edit</button>
        </div>
      ) : (
        <form onSubmit={handleUpdate} className="profile-form">
          <label className="profile-label">Username:</label>
          <input
            className="profile-input"
            value={form.userName}
            onChange={e => setForm({ ...form, userName: e.target.value })}
          />
          <label className="profile-label">Email:</label>
          <input
            className="profile-input"
            value={form.email}
            onChange={e => setForm({ ...form, email: e.target.value })}
          />
          <div className="profile-btn-row">
            <button className="enhanced-btn" type="submit">Save</button>
            <button className="btn-delete" type="button" onClick={() => setEditMode(false)}>Cancel</button>
          </div>
        </form>
      )}
    </div>
  );
}

export default function AdminDashboard({ setPage }) {
  const [selected, setSelected] = useState("admin");
  return (
    <div className="dashboard-bg">
      <div className="dashboard-container">
        <Sidebar selected={selected} onSelect={setSelected} />
        <MainContent selected={selected} />
      </div>
    </div>
  );
}
