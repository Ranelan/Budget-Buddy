import React, { useState, useEffect, useCallback } from 'react';
import './App.css';

const BASE_URL = 'http://localhost:8081/api/category';
const USERS_URL = 'http://localhost:8081/api/admin/regular-users';

function Category({ role = 'user' }) {
  const [categories, setCategories] = useState([]);
  const [users, setUsers] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('all');
  const [filterUser, setFilterUser] = useState('all');
  const [filteredCategories, setFilteredCategories] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [newCategory, setNewCategory] = useState({ 
    name: '', 
    type: 'Expense'
  });
  const [errors, setErrors] = useState({});
  const [showReassignDialog, setShowReassignDialog] = useState(false);
  const [categoryToDelete, setCategoryToDelete] = useState(null);
  const [reassignCategoryId, setReassignCategoryId] = useState('');
  const [loading, setLoading] = useState(false);

  const isAdmin = role === 'admin';

  // Fetch categories
  const fetchCategories = useCallback(() => {
    setLoading(true);
    fetch(`${BASE_URL}/findAll`)
      .then(res => res.ok ? res.json() : Promise.reject('Failed to fetch'))
      .then(data => {
        setCategories(data);
        applyFilters(data);
        setLoading(false);
      })
      .catch(err => {
        console.error(err);
        setLoading(false);
      });
  }, []);

  // Fetch users (admin only)
  const fetchUsers = useCallback(() => {
    if (!isAdmin) return;
    
    fetch(USERS_URL)
      .then(res => res.ok ? res.json() : [])
      .then(data => setUsers(data))
      .catch(err => console.error('Failed to fetch users:', err));
  }, [isAdmin]);

  // Apply filters with useCallback to avoid dependency issues
  const applyFilters = useCallback((data) => {
    let filtered = data.filter(cat =>
      cat.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      cat.type.toLowerCase().includes(searchTerm.toLowerCase())
    );

    if (filterType !== 'all') {
      filtered = filtered.filter(cat => cat.type === filterType);
    }

    if (filterUser !== 'all') {
      filtered = filtered.filter(cat => 
        filterUser === 'system' ? (cat.isGlobal || false) : 
        filterUser === 'user' ? !(cat.isGlobal || false) : 
        cat.userId === parseInt(filterUser)
      );
    }

    setFilteredCategories(filtered);
  }, [searchTerm, filterType, filterUser]);

  useEffect(() => {
    fetchCategories();
    fetchUsers();
  }, [fetchCategories, fetchUsers]);

  useEffect(() => {
    applyFilters(categories);
  }, [applyFilters, categories]);

  const handleSearch = (e) => setSearchTerm(e.target.value);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setNewCategory({ 
      ...newCategory, 
      [name]: value 
    });
    if (errors[name]) setErrors({ ...errors, [name]: '' });
  };

  const validateForm = () => {
    const newErrors = {};
    if (!newCategory.name.trim()) newErrors.name = 'Name is required';
    if (!newCategory.type) newErrors.type = 'Type is required';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const saveCategory = () => {
    if (!validateForm()) return;

    const method = isEditing ? 'PUT' : 'POST';
    const endpoint = isEditing ? `${BASE_URL}/update` : `${BASE_URL}/create`;

    // Only send fields that your Spring Boot Category entity actually has
    const payload = {
      name: newCategory.name,
      type: newCategory.type
    };

    console.log('Sending payload:', payload);

    fetch(endpoint, {
      method,
      headers: { 
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      },
      body: JSON.stringify(payload)
    })
    .then(async (response) => {
      console.log('Response status:', response.status);
      const responseText = await response.text();
      console.log('Response text:', responseText);
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${responseText}`);
      }
      
      try {
        const savedData = JSON.parse(responseText);
        console.log('Saved successfully:', savedData);
        alert('Category saved successfully!');
        fetchCategories();
        resetForm();
        return savedData;
      } catch (e) {
        throw new Error('Invalid JSON response: ' + responseText);
      }
    })
    .catch(error => {
      console.error('Save error:', error);
      alert('Error saving category: ' + error.message);
    });
  };

  // Delete category for users
  const deleteCategory = (id) => {
    if (window.confirm('Are you sure you want to delete this category?')) {
      fetch(`${BASE_URL}/delete/${id}`, { method: 'DELETE' })
        .then(res => {
          if (!res.ok) throw new Error('Delete failed');
          setCategories(prev => prev.filter(cat => cat.categoryId !== id));
          setFilteredCategories(prev => prev.filter(cat => cat.categoryId !== id));
        })
        .catch(err => {
          console.error('Delete error:', err);
          alert('Failed to delete category. Please try again.');
        });
    }
  };

  // Admin delete with reassignment option
  const confirmDelete = (category) => {
    // For now, just proceed with delete since we don't have transactionCount endpoint
    proceedWithDelete(category.categoryId);
  };

  const proceedWithDelete = (id, reassignToId = null) => {
    let url = `${BASE_URL}/delete/${id}`;
    
    if (reassignToId) {
      url += `?reassignTo=${reassignToId}`;
    }

    fetch(url, { 
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json'
      }
    })
      .then(res => {
        if (!res.ok) throw new Error('Delete failed');
        alert('Category deleted successfully.');
        fetchCategories();
        setShowReassignDialog(false);
        setCategoryToDelete(null);
        setReassignCategoryId('');
      })
      .catch(err => {
        console.error('Delete error:', err);
        alert('Failed to delete category. Please try again.');
        setShowReassignDialog(false);
        setCategoryToDelete(null);
      });
  };

  const startEditing = (category) => {
    setIsEditing(true);
    setNewCategory({
      name: category.name,
      type: category.type
    });
    setShowForm(true);
  };

  const resetForm = () => {
    setIsEditing(false);
    setNewCategory({ name: '', type: 'Expense' });
    setErrors({});
    setShowForm(false);
  };

  return (
    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'flex-start', minHeight: '80vh', width: '100%' }}>
      <div style={{ background: '#232a36', borderRadius: '24px', boxShadow: '0 8px 32px rgba(33,150,243,0.13)', padding: '2em 1.5em', maxWidth: '480px', width: '100%', marginTop: '2em' }}>
        <header className="category-header">
          <h1 className="category-title" style={{ color: '#21cbf3', fontWeight: 800, fontSize: '2em', marginBottom: '0.5em', textAlign: 'center' }}>
            <span role="img" aria-label="folder">📁</span> My Categories
          </h1>
          <div style={{ color: '#b0b3b8', textAlign: 'center', marginBottom: '1.5em' }}>Manage your personal categories</div>
        </header>

        {isAdmin && (
          <div className="admin-filters">
            <div className="filter-group">
              <input
                type="text"
                placeholder="Search by name or type..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>

            <div className="filter-group">
              <select value={filterType} onChange={(e) => setFilterType(e.target.value)}>
                <option value="all">All Types</option>
                <option value="Expense">Expense</option>
                <option value="Income">Income</option>
              </select>
            </div>

            <div className="filter-group">
              <select value={filterUser} onChange={(e) => setFilterUser(e.target.value)}>
                <option value="all">All Categories</option>
                <option value="system">System Categories</option>
                <option value="user">User Categories</option>
                {users.map(user => (
                  <option key={user.userID} value={user.userID}>
                    {user.userName}
                  </option>
                ))}
              </select>
            </div>

            <button className="btn-primary" onClick={() => setShowForm(true)}>
              + Add Category
            </button>
          </div>
        )}

        {!isAdmin && (
          <div className="user-search">
            <input
              type="text"
              placeholder="Search your categories..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            <button className="btn-primary" onClick={() => setShowForm(true)}>
              + New Category
            </button>
          </div>
        )}

        {loading ? (
          <div className="loading">Loading categories...</div>
        ) : (
          <table className="category-table">
            <thead>
              <tr>
                <th>Name</th>
                <th>Type</th>
                {isAdmin && <th>Owner</th>}
                {isAdmin && <th>Transactions</th>}
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredCategories.length > 0 ? (
                filteredCategories.map(cat => (
                  <tr key={cat.categoryId} className={(cat.isGlobal || false) ? 'system-category' : 'user-category'}>
                    <td>
                      {cat.name}
                      {isAdmin && (cat.isGlobal || false) && <span className="badge-global">System</span>}
                    </td>
                    <td>
                      <span className={`type-badge ${cat.type.toLowerCase()}`}>
                        {cat.type === 'Income' ? '💰' : '🛒'} {cat.type}
                      </span>
                    </td>
                    {isAdmin && (
                      <td>
                        {(cat.isGlobal || false) ? 'System' : 
                         users.find(u => u.userID === cat.userId)?.userName || 'Unknown User'}
                      </td>
                    )}
                    {isAdmin && <td>{cat.transactionCount || 0}</td>}
                    <td>
                      <button className="btn-edit" onClick={() => startEditing(cat)}>
                        Edit
                      </button>
                      <button 
                        className="btn-delete" 
                        onClick={() => isAdmin ? confirmDelete(cat) : deleteCategory(cat.categoryId)}
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={isAdmin ? 5 : 3} className="no-data">
                    No categories found
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        )}

        {showForm && (
          <div className="modal-overlay">
            <div className="category-form">
              <h2>{isEditing ? 'Edit Category' : 'Add Category'}</h2>

              <div className="form-group">
                <label>Name:</label>
                <input
                  type="text"
                  name="name"
                  value={newCategory.name}
                  onChange={handleInputChange}
                  className={errors.name ? 'error' : ''}
                  placeholder="Enter category name"
                />
                {errors.name && <span className="error-text">{errors.name}</span>}
              </div>

              <div className="form-group">
                <label>Type:</label>
                <select
                  name="type"
                  value={newCategory.type}
                  onChange={handleInputChange}
                  className={errors.type ? 'error' : ''}
                >
                  <option value="Expense">Expense</option>
                  <option value="Income">Income</option>
                </select>
                {errors.type && <span className="error-text">{errors.type}</span>}
              </div>

              <div className="form-actions">
                <button className="btn-secondary" onClick={resetForm}>
                  Cancel
                </button>
                <button className="btn-primary" onClick={saveCategory}>
                  {isEditing ? 'Update' : 'Create'}
                </button>
              </div>
            </div>
          </div>
        )}

        {isAdmin && showReassignDialog && categoryToDelete && (
          <div className="modal-overlay">
            <div className="reassign-dialog">
              <h3>⚠️ Category Has Transactions</h3>
              <p>
                The category "<strong>{categoryToDelete.name}</strong>" has transactions assigned. 
                Please choose what to do with them:
              </p>
              
              <div className="form-group">
                <label>Reassign transactions to:</label>
                <select
                  value={reassignCategoryId}
                  onChange={(e) => setReassignCategoryId(e.target.value)}
                  className="reassign-select"
                >
                  <option value="">-- Delete Transactions (Cannot be undone) --</option>
                  <optgroup label="Same Type Categories">
                    {categories
                      .filter(cat => 
                        cat.categoryId !== categoryToDelete.categoryId && 
                        cat.type === categoryToDelete.type
                      )
                      .map(cat => (
                        <option key={cat.categoryId} value={cat.categoryId}>
                          {cat.name} {(cat.isGlobal || false) && "(System)"}
                        </option>
                      ))}
                  </optgroup>
                </select>
                {reassignCategoryId && (
                  <div className="reassign-warning">
                    <small>Transactions will be moved to the selected category</small>
                  </div>
                )}
                {!reassignCategoryId && (
                  <div className="reassign-danger">
                    <small>⚠️ All transactions in this category will be permanently deleted</small>
                  </div>
                )}
              </div>

              <div className="dialog-actions">
                <button 
                  className="btn-secondary" 
                  onClick={() => {
                    setShowReassignDialog(false);
                    setCategoryToDelete(null);
                    setReassignCategoryId('');
                  }}
                >
                  Cancel
                </button>
                <button 
                  className={reassignCategoryId ? "btn-primary" : "btn-danger"} 
                  onClick={() => proceedWithDelete(categoryToDelete.categoryId, reassignCategoryId)}
                >
                  {reassignCategoryId ? 'Reassign & Delete' : 'Delete Everything'}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default Category;