import React, { useState, useEffect } from "react";
import "./App.css";
import Category from "./Category";
import { BarChart, Bar, XAxis, YAxis, Tooltip, Legend, CartesianGrid, ResponsiveContainer } from "recharts";

const sections = [
  { key: "admin", label: "Admin Management" },
  { key: "users", label: "Regular Users" },
  { key: "categories", label: "Categories" },
  { key: "recurring", label: "Recurring Transactions" },
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
    case "recurring":
      return <RecurringTransactionSection />;
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
              <th>Membership ID</th>
            </tr>
          </thead>
          <tbody>
            {users.map(user => (
              <tr key={user.userID}>
                <td>{user.userID}</td>
                <td>{user.userName}</td>
                <td>{user.email}</td>
                <td>{user.membershipID}</td>
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

function RecurringTransactionSection() {
  const [recurringTransactions, setRecurringTransactions] = useState([]);
  const [users, setUsers] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [formData, setFormData] = useState({
    recurrenceType: 'Monthly',
    nextExecution: new Date().toISOString().split('T')[0],
    userId: ''
  });

  useEffect(() => {
    fetchRecurringTransactions();
    fetchUsers();
  }, []);

  const fetchRecurringTransactions = () => {
    setLoading(true);
    fetch("http://localhost:8081/api/recurringTransactions/findAll")
      .then(res => {
        if (!res.ok) throw new Error('Failed to fetch recurring transactions');
        return res.json();
      })
      .then(data => {
        setRecurringTransactions(data);
        setLoading(false);
      })
      .catch(err => {
        setError(err.message);
        setLoading(false);
      });
  };

  const fetchUsers = () => {
    fetch("http://localhost:8081/api/admin/regular-users")
      .then(res => res.ok ? res.json() : [])
      .then(data => setUsers(data))
      .catch(err => console.error('Failed to fetch users:', err));
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const createRecurringTransaction = () => {
    if (!formData.userId) {
      setError("Please select a user");
      return;
    }

    const payload = {
      recurrenceType: formData.recurrenceType,
      nextExecution: formData.nextExecution,
      regularUser: { userID: parseInt(formData.userId) }
    };

    fetch("http://localhost:8081/api/recurringTransactions/create", {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    })
      .then(res => {
        if (!res.ok) throw new Error('Failed to create transaction');
        return res.json();
      })
      .then(createdTransaction => {
        setRecurringTransactions(prev => [...prev, createdTransaction]);
        resetForm();
        setError('');
      })
      .catch(err => {
        setError(err.message);
      });
  };

  const deleteRecurringTransaction = (id) => {
    if (window.confirm('Are you sure you want to delete this recurring transaction?')) {
      fetch(`http://localhost:8081/api/recurringTransactions/delete/${id}`, { 
        method: 'DELETE' 
      })
        .then(res => {
          if (!res.ok) throw new Error('Failed to delete transaction');
          setRecurringTransactions(prev => 
            prev.filter(t => t.recurringTransactionId !== id)
          );
        })
        .catch(err => {
          setError(err.message);
        });
    }
  };

  const resetForm = () => {
    setFormData({
      recurrenceType: 'Monthly',
      nextExecution: new Date().toISOString().split('T')[0],
      userId: ''
    });
    setShowForm(false);
  };

  const getDaysUntilDue = (nextExecution) => {
    const dueDate = new Date(nextExecution);
    const today = new Date();
    const diffTime = dueDate - today;
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  };

  if (loading) return <div className="dashboard-content">Loading recurring transactions...</div>;

  return (
    <div className="dashboard-content">
      <h2>Recurring Transactions Management</h2>
      
      {error && <div className="error-message">{error}</div>}

      {/* Add Transaction Button */}
      <button 
        className="btn-add"
        onClick={() => setShowForm(true)}
        style={{marginBottom: '20px'}}
      >
        + Create Recurring Transaction
      </button>

      {/* Create Form Modal */}
      {showForm && (
        <div className="modal-overlay">
          <div className="transaction-form">
            <h2>Create Recurring Transaction</h2>
            
            <div className="form-group">
              <label>User:</label>
              <select
                name="userId"
                value={formData.userId}
                onChange={handleInputChange}
                required
              >
                <option value="">Select User</option>
                {users.map(user => (
                  <option key={user.userID} value={user.userID}>
                    {user.userName} ({user.email})
                  </option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label>Recurrence Type:</label>
              <select
                name="recurrenceType"
                value={formData.recurrenceType}
                onChange={handleInputChange}
              >
                <option value="Daily">Daily</option>
                <option value="Weekly">Weekly</option>
                <option value="Monthly">Monthly</option>
                <option value="Yearly">Yearly</option>
              </select>
            </div>

            <div className="form-group">
              <label>Next Execution Date:</label>
              <input
                type="date"
                name="nextExecution"
                value={formData.nextExecution}
                onChange={handleInputChange}
                required
              />
            </div>

            <div className="form-actions">
              <button className="btn-cancel" onClick={resetForm}>
                Cancel
              </button>
              <button className="btn-save" onClick={createRecurringTransaction}>
                Create
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Transactions Table */}
      <div className="transactions-table">
        <div className="table-header">
          <span>ID</span>
          <span>User</span>
          <span>Recurrence Type</span>
          <span>Next Execution</span>
          <span>Days Left</span>
          <span>Actions</span>
        </div>
        
        {recurringTransactions.length === 0 ? (
          <div className="no-data">No recurring transactions found</div>
        ) : (
          recurringTransactions.map(transaction => (
            <div key={transaction.recurringTransactionId} className="table-row">
              <span>#{transaction.recurringTransactionId}</span>
              <span className="user-name">
                {transaction.regularUser?.userName || `User #${transaction.regularUser?.userID || 'Unknown'}`}
              </span>
              <span className="recurrence-type">{transaction.recurrenceType}</span>
              <span>{transaction.nextExecution}</span>
              <span className={`days-left ${getDaysUntilDue(transaction.nextExecution) <= 3 ? 'urgent' : ''}`}>
                {getDaysUntilDue(transaction.nextExecution)} days
              </span>
              <span className="actions">
                <button 
                  className="btn-delete"
                  onClick={() => deleteRecurringTransaction(transaction.recurringTransactionId)}
                >
                  Delete
                </button>
              </span>
            </div>
          ))
        )}
      </div>

      <div className="mt-4">
        <button 
          className="btn-refresh"
          onClick={fetchRecurringTransactions}
        >
          Refresh
        </button>
      </div>
    </div>
  );
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