import React, { useState, useEffect } from "react";
import "./App.css";

const API_BASE = "http://localhost:8081/api/transactions";

function TransactionPage() {
  // State hooks at the top of the component
  const [transactions, setTransactions] = useState([]);
  const [categories, setCategories] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    id: "",
    amount: "",
    description: "",
    categoryId: "",
    type: "Expense",
    date: new Date().toISOString().split("T")[0],
  });
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // Load categories and transactions
  useEffect(() => {
    const mockCategories = [
      { categoryId: "1", name: "Food" },
      { categoryId: "2", name: "Transport" },
      { categoryId: "3", name: "Utilities" },
      { categoryId: "4", name: "Income" },
      { categoryId: "5", name: "Entertainment" },
    ];

    const mockTransactions = [
      { id: 1, description: "Groceries", categoryId: "1", amount: 120, type: "Expense", date: "2025-09-01" },
      { id: 2, description: "Bus fare", categoryId: "2", amount: 15, type: "Expense", date: "2025-09-02" },
      { id: 3, description: "Salary", categoryId: "4", amount: 5000, type: "Income", date: "2025-09-01" },
    ];

    setCategories(mockCategories);
    setTransactions(mockTransactions);
  }, []);

  const fetchTransactions = async () => {
    try {
      setLoading(true);
      const response = await fetch(`${API_BASE}/all`);
      if (response.ok) {
        const data = await response.json();
        setTransactions(data);
      } else {
        // If API fails, use mock data
        console.log("API not available, using mock data");
      }
    } catch (err) {
      console.log("API not available, using mock data");
    } finally {
      setLoading(false);
    }
  };

  const fetchCategories = async () => {
    try {
      const response = await fetch("http://localhost:8081/api/category/findAll");
      if (response.ok) {
        const data = await response.json();
        setCategories(data);
      }
    } catch (err) {
      console.error("Failed to fetch categories");
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    
    try {
      let response;
      const transactionData = {
        ...formData,
        amount: parseFloat(formData.amount),
        id: isEditing ? formData.id : Date.now() // Generate ID if not editing
      };

      if (isEditing) {
        // For demo purposes, we'll update locally
        setTransactions(prev => prev.map(t => 
          t.id === transactionData.id ? transactionData : t
        ));
      } else {
        // For demo purposes, we'll add locally
        const newTransaction = {
          ...transactionData,
          id: Date.now() // Use timestamp as unique ID
        };
        setTransactions(prev => [...prev, newTransaction]);
      }

      // Reset form and close modal
      setShowForm(false);
      setFormData({
        id: "",
        amount: "",
        description: "",
        categoryId: "",
        type: "Expense",
        date: new Date().toISOString().split("T")[0],
      });
      setIsEditing(false);

      // If you want to use the actual API, uncomment this:
      /*
      if (isEditing) {
        response = await fetch(`${API_BASE}/update`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(formData),
        });
      } else {
        response = await fetch(`${API_BASE}/create`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(formData),
        });
      }
      
      if (response.ok) {
        setShowForm(false);
        setFormData({
          id: "",
          amount: "",
          description: "",
          categoryId: "",
          type: "Expense",
          date: new Date().toISOString().split("T")[0],
        });
        setIsEditing(false);
        fetchTransactions(); // Refresh the list
      } else {
        setError(isEditing ? "Failed to update transaction" : "Failed to create transaction");
      }
      */
    } catch (err) {
      setError(isEditing ? "Error updating transaction" : "Error creating transaction");
      console.error("Transaction error:", err);
    }
  };

  const handleEdit = (transaction) => {
    setFormData({
      id: transaction.id,
      amount: transaction.amount.toString(),
      description: transaction.description,
      categoryId: transaction.categoryId,
      type: transaction.type,
      date: transaction.date,
    });
    setIsEditing(true);
    setShowForm(true);
  };

  const handleDelete = async (id) => {
    try {
      // For demo purposes, delete locally
      setTransactions(prev => prev.filter(t => t.id !== id));
      
      // If you want to use the actual API, uncomment this:
      /*
      const response = await fetch(`${API_BASE}/delete/${id}`, {
        method: "DELETE",
      });
      if (response.ok) {
        fetchTransactions();
      } else {
        setError("Failed to delete transaction");
      }
      */
    } catch (err) {
      setError("Error deleting transaction");
    }
  };

  const formatDate = (dateString) => {
    const options = { day: "2-digit", month: "short", year: "numeric" };
    return new Date(dateString).toLocaleDateString("en-US", options);
  };

  const getCategoryName = (categoryId) => {
    const category = categories.find((cat) => cat.categoryId === categoryId);
    return category ? category.name : "Uncategorized";
  };

  const formatAmount = (amount, type) => type === "Income" ? `R ${amount}` : `-R ${amount}`;

  return (
    <div style={{ 
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', 
      minHeight: '100vh', 
      padding: '2em' 
    }}>
      <div style={{ 
        maxWidth: '1200px', 
        margin: '0 auto' 
      }}>
        {/* Welcome Header */}
        <div style={{ 
          background: 'white', 
          borderRadius: '16px', 
          padding: '2.5em', 
          marginBottom: '2em',
          boxShadow: '0 4px 20px rgba(0,0,0,0.1)'
        }}>
          <h1 style={{ 
            color: '#2d3748', 
            margin: '0 0 0.5em 0', 
            fontSize: '2.2em',
            fontWeight: '700'
          }}>
            Welcome back, MilaniMntwaphi!
          </h1>
          <p style={{ 
            color: '#718096', 
            fontSize: '1.2em', 
            margin: '0 0 1.5em 0',
            lineHeight: '1.6'
          }}>
            Manage your finances with ease and confidence
          </p>
          
          <div style={{
            height: '1px',
            background: 'linear-gradient(90deg, transparent, #e2e8f0, transparent)',
            margin: '2em 0'
          }}></div>

          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <h2 style={{ 
              color: '#2d3748', 
              margin: 0,
              fontSize: '1.5em',
              fontWeight: '600'
            }}>
              Transactions
            </h2>
            <button 
              onClick={() => setShowForm(true)}
              style={{
                background: '#4299e1',
                color: 'white',
                border: 'none',
                padding: '0.75em 1.5em',
                borderRadius: '8px',
                fontSize: '1em',
                fontWeight: '600',
                cursor: 'pointer',
                boxShadow: '0 2px 10px rgba(66, 153, 225, 0.3)',
                transition: 'all 0.2s ease'
              }}
              onMouseOver={(e) => e.target.style.background = '#3182ce'}
              onMouseOut={(e) => e.target.style.background = '#4299e1'}
            >
              + Add Transaction
            </button>
          </div>
          <p style={{ 
            color: '#718096', 
            margin: '0.5em 0 0 0',
            fontSize: '1em'
          }}>
            Track all your income and expenses in one place
          </p>
        </div>

        {/* Error Message */}
        {error && (
          <div style={{
            background: '#fed7d7',
            color: '#c53030',
            padding: '1em',
            borderRadius: '8px',
            marginBottom: '1em',
            border: '1px solid #feb2b2'
          }}>
            {error}
          </div>
        )}

        {/* Transaction Form Modal */}
        {showForm && (
          <div style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: 'rgba(0,0,0,0.5)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1000
          }}>
            <div style={{ 
              background: 'white', 
              borderRadius: '16px', 
              padding: '2.5em', 
              width: '90%', 
              maxWidth: '500px',
              boxShadow: '0 10px 40px rgba(0,0,0,0.2)'
            }}>
              <h2 style={{ 
                color: '#2d3748', 
                margin: '0 0 1.5em 0',
                fontSize: '1.5em',
                fontWeight: '600'
              }}>
                {isEditing ? "Update Transaction" : "Add New Transaction"}
              </h2>
              <form onSubmit={handleSubmit}>
                <div style={{ display: 'flex', gap: '1em', marginBottom: '1em' }}>
                  <input
                    type="number"
                    name="amount"
                    placeholder="Amount (R)"
                    value={formData.amount}
                    onChange={handleInputChange}
                    required
                    min="0"
                    step="0.01"
                    style={{
                      flex: 1,
                      padding: '0.75em',
                      borderRadius: '8px',
                      border: '1px solid #e2e8f0',
                      background: '#f7fafc',
                      color: '#2d3748',
                      fontSize: '1em'
                    }}
                  />
                  <select 
                    name="type" 
                    value={formData.type} 
                    onChange={handleInputChange}
                    style={{
                      padding: '0.75em',
                      borderRadius: '8px',
                      border: '1px solid #e2e8f0',
                      background: '#f7fafc',
                      color: '#2d3748',
                      fontSize: '1em',
                      minWidth: '120px'
                    }}
                  >
                    <option value="Expense">Expense</option>
                    <option value="Income">Income</option>
                  </select>
                </div>
                <input
                  type="text"
                  name="description"
                  placeholder="Description"
                  value={formData.description}
                  onChange={handleInputChange}
                  required
                  style={{
                    width: '100%',
                    padding: '0.75em',
                    borderRadius: '8px',
                    border: '1px solid #e2e8f0',
                    background: '#f7fafc',
                    color: '#2d3748',
                    marginBottom: '1em',
                    fontSize: '1em'
                  }}
                />
                <select
                  name="categoryId"
                  value={formData.categoryId}
                  onChange={handleInputChange}
                  required
                  style={{
                    width: '100%',
                    padding: '0.75em',
                    borderRadius: '8px',
                    border: '1px solid #e2e8f0',
                    background: '#f7fafc',
                    color: '#2d3748',
                    marginBottom: '1em',
                    fontSize: '1em'
                  }}
                >
                  <option value="">Select Category</option>
                  {categories.map((cat) => (
                    <option key={cat.categoryId} value={cat.categoryId}>{cat.name}</option>
                  ))}
                </select>
                <input 
                  type="date" 
                  name="date" 
                  value={formData.date} 
                  onChange={handleInputChange} 
                  required 
                  style={{
                    width: '100%',
                    padding: '0.75em',
                    borderRadius: '8px',
                    border: '1px solid #e2e8f0',
                    background: '#f7fafc',
                    color: '#2d3748',
                    marginBottom: '2em',
                    fontSize: '1em'
                  }}
                />
                <div style={{ display: 'flex', gap: '1em', justifyContent: 'flex-end' }}>
                  <button
                    type="button"
                    onClick={() => {
                      setShowForm(false);
                      setIsEditing(false);
                      setFormData({
                        id: "",
                        amount: "",
                        description: "",
                        categoryId: "",
                        type: "Expense",
                        date: new Date().toISOString().split("T")[0],
                      });
                    }}
                    style={{
                      padding: '0.75em 1.5em',
                      borderRadius: '8px',
                      border: '1px solid #e2e8f0',
                      background: 'transparent',
                      color: '#718096',
                      cursor: 'pointer',
                      fontSize: '1em',
                      fontWeight: '600',
                      transition: 'all 0.2s ease'
                    }}
                    onMouseOver={(e) => {
                      e.target.style.background = '#f7fafc';
                      e.target.style.color = '#2d3748';
                    }}
                    onMouseOut={(e) => {
                      e.target.style.background = 'transparent';
                      e.target.style.color = '#718096';
                    }}
                  >
                    Cancel
                  </button>
                  <button 
                    type="submit"
                    style={{
                      padding: '0.75em 1.5em',
                      borderRadius: '8px',
                      border: 'none',
                      background: '#4299e1',
                      color: 'white',
                      cursor: 'pointer',
                      fontSize: '1em',
                      fontWeight: '600',
                      transition: 'all 0.2s ease'
                    }}
                    onMouseOver={(e) => e.target.style.background = '#3182ce'}
                    onMouseOut={(e) => e.target.style.background = '#4299e1'}
                  >
                    {isEditing ? "Update Transaction" : "Add Transaction"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Transactions List */}
        <div>
          {transactions.length === 0 ? (
            <div style={{ 
              background: 'white',
              color: '#718096', 
              textAlign: 'center', 
              padding: '3em',
              borderRadius: '16px',
              boxShadow: '0 4px 20px rgba(0,0,0,0.1)'
            }}>
              No transactions yet.
            </div>
          ) : (
            transactions.map((t) => (
              <div key={t.id} style={{
                background: 'white',
                borderRadius: '16px',
                padding: '1.5em 2em',
                marginBottom: '1em',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                boxShadow: '0 2px 12px rgba(0,0,0,0.08)',
                transition: 'transform 0.2s ease, box-shadow 0.2s ease'
              }}
              onMouseOver={(e) => {
                e.currentTarget.style.transform = 'translateY(-2px)';
                e.currentTarget.style.boxShadow = '0 4px 20px rgba(0,0,0,0.12)';
              }}
              onMouseOut={(e) => {
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.boxShadow = '0 2px 12px rgba(0,0,0,0.08)';
              }}
              >
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5em', flex: 1 }}>
                  <div style={{ color: '#2d3748', fontWeight: '600', fontSize: '1.1em' }}>{t.description}</div>
                  <div style={{ color: '#4299e1', fontSize: '1em', fontWeight: '500' }}>{getCategoryName(t.categoryId)}</div>
                  <div style={{ color: '#a0aec0', fontSize: '0.95em', display: 'flex', gap: '1em' }}>
                    <span>{formatDate(t.date)}</span>
                    <span>Credit Card</span>
                  </div>
                </div>
                <div style={{ 
                  color: t.type === 'Income' ? '#48bb78' : '#f56565', 
                  fontWeight: '700', 
                  fontSize: '1.2em', 
                  marginRight: '2em' 
                }}>
                  {formatAmount(t.amount, t.type)}
                </div>
                <div style={{ display: 'flex', flexDirection: 'row', gap: '0.75em', alignItems: 'center' }}>
                  <button 
                    onClick={() => handleEdit(t)}
                    style={{
                      padding: '0.5em 1em',
                      borderRadius: '6px',
                      border: '1px solid #4299e1',
                      background: 'transparent',
                      color: '#4299e1',
                      cursor: 'pointer',
                      minWidth: '80px',
                      fontSize: '0.9em',
                      fontWeight: '600',
                      transition: 'all 0.2s ease'
                    }}
                    onMouseOver={(e) => {
                      e.target.style.background = '#4299e1';
                      e.target.style.color = 'white';
                    }}
                    onMouseOut={(e) => {
                      e.target.style.background = 'transparent';
                      e.target.style.color = '#4299e1';
                    }}
                  >
                    Update
                  </button>
                  <button 
                    onClick={() => handleDelete(t.id)}
                    style={{
                      padding: '0.5em 1em',
                      borderRadius: '6px',
                      border: '1px solid #f56565',
                      background: 'transparent',
                      color: '#f56565',
                      cursor: 'pointer',
                      minWidth: '80px',
                      fontSize: '0.9em',
                      fontWeight: '600',
                      transition: 'all 0.2s ease'
                    }}
                    onMouseOver={(e) => {
                      e.target.style.background = '#f56565';
                      e.target.style.color = 'white';
                    }}
                    onMouseOut={(e) => {
                      e.target.style.background = 'transparent';
                      e.target.style.color = '#f56565';
                    }}
                  >
                    Delete
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}

export default TransactionPage;
