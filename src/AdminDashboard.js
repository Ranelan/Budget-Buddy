import React, { useState } from "react";
import "./App.css";
import Category from "./Category";

const sections = [
  { key: "admin", label: "Admin Management" },
  { key: "users", label: "Regular Users" },
  { key: "categories", label: "Categories" },
  { key: "analytics", label: "Analytics" }
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

  React.useEffect(() => {
    setLoading(true);
    fetch("http://localhost:8081/api/admin/analytics")
      .then(res => res.json())
      .then(data => { setAnalytics(data); setLoading(false); })
      .catch(err => { setError("Failed to fetch analytics"); setLoading(false); });
  }, []);

  return (
    <div className="dashboard-content">
      <h2>Analytics</h2>
      {loading ? <div>Loading...</div> : null}
      {error ? <div style={{color:'red'}}>{error}</div> : null}
      {analytics ? (
        <pre style={{background:'#222',color:'#fff',padding:'1em',borderRadius:'8px'}}>{JSON.stringify(analytics,null,2)}</pre>
      ) : null}
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
