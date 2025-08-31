import React, { useState, useEffect } from 'react';
import './App.css';

const BASE_URL = 'http://localhost:8081/api/category';
const USERS_URL = 'http://localhost:8081/api/admin/regular-users'; 

function Category({role = 'user'}) {
  const [categories, setCategories] = useState([]);
  const [users, setUsers] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('all');
  const [filterUser, setFilterUser] = useState('all');
  const [filteredCategories, setFilteredCategories] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editingCategory, setEditingCategory] = useState(null);
  const [newCategory, setNewCategory] = useState({ 
    name: '', 
    type: 'Expense', 
    isGlobal: role === 'admin',
    userId: null 
  });
  const [errors, setErrors] = useState({});
  const [showReassignDialog, setShowReassignDialog] = useState(false);
  const [categoryToDelete, setCategoryToDelete] = useState(null);
  const [reassignCategoryId, setReassignCategoryId] = useState('');
  const isAdmin = role === 'admin';

  useEffect(() => {
    fetchCategories();
    fetchUsers();
  }, []);

  const fetchCategories = () => {
    fetch(`${BASE_URL}/findAll`)
      .then(res => res.ok ? res.json() : Promise.reject('Failed to fetch'))
      .then(data => {
        setCategories(data);
        applyFilters(data);
      })
      .catch(err => console.error(err));
  };

  const fetchUsers = () => {
    fetch(USERS_URL)
      .then(res => res.ok ? res.json() : [])
      .then(data => setUsers(data))
      .catch(err => console.error('Failed to fetch users:', err));
  };

  const applyFilters = (data) => {
    let filtered = data.filter(cat =>
      cat.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      cat.type.toLowerCase().includes(searchTerm.toLowerCase())
    );

    if (filterType !== 'all') {
      filtered = filtered.filter(cat => cat.type === filterType);
    }

    if (filterUser !== 'all') {
      filtered = filtered.filter(cat => 
        filterUser === 'system' ? cat.isGlobal : 
        filterUser === 'user' ? !cat.isGlobal : 
        cat.userId === parseInt(filterUser)
      );
    }

    setFilteredCategories(filtered);
  };

  useEffect(() => {
    applyFilters(categories);
  }, [searchTerm, filterType, filterUser, categories]);

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setNewCategory({ 
      ...newCategory, 
      [name]: type === 'checkbox' ? checked : value 
    });
    if (errors[name]) setErrors({ ...errors, [name]: '' });
  };

  const validateForm = () => {
    const newErrors = {};
    if (!newCategory.name.trim()) newErrors.name = 'Name is required';
    if (!newCategory.type) newErrors.type = 'Type is required';
    if (!newCategory.isGlobal && !newCategory.userId) newErrors.userId = 'User required for personal category';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const saveCategory = () => {
    if (!validateForm()) return;

    const method = isEditing ? 'PUT' : 'POST';
    const endpoint = isEditing ? `${BASE_URL}/update` : `${BASE_URL}/create`;

    fetch(endpoint, {
      method,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(newCategory)
    })
      .then(res => res.ok ? res.json() : Promise.reject('Save failed'))
      .then(saved => {
        fetchCategories();
        resetForm();
      })
      .catch(err => console.error(err));
  };

  const confirmDelete = (category) => {
    fetch(`${BASE_URL}/transactionCount/${category.categoryId}`)
      .then(res => res.json())
      .then(count => {
        if (count > 0) {
          setCategoryToDelete(category);
          setShowReassignDialog(true);
        } else {
          proceedWithDelete(category.categoryId);
        }
      })
      .catch(() => proceedWithDelete(category.categoryId));
  };

  const proceedWithDelete = (id, reassignToId = null) => {
    const url = reassignToId 
      ? `${BASE_URL}/delete/${id}?reassignTo=${reassignToId}`
      : `${BASE_URL}/delete/${id}`;

    fetch(url, { method: 'DELETE' })
      .then(res => {
        if (!res.ok) throw new Error('Delete failed');
        setCategories(categories.filter(cat => cat.categoryId !== id));
        setShowReassignDialog(false);
        setCategoryToDelete(null);
      })
      .catch(err => console.error(err));
  };

  const startEditing = (category) => {
    setIsEditing(true);
    setEditingCategory(category);
    setNewCategory({
      name: category.name,
      type: category.type,
      isGlobal: category.isGlobal,
      userId: category.userId || null
    });
    setShowForm(true);
  };

  const resetForm = () => {
    setIsEditing(false);
    setEditingCategory(null);
    setNewCategory({ name: '', type: 'Expense', isGlobal: true, userId: null });
    setErrors({});
    setShowForm(false);
  };

  return (
    <div className="category-management">
      <header className="category-header">
        <h1>🗂️ {isAdmin ? 'Category Management' : 'My Categories'}</h1>
        <p>{isAdmin ? 'Manage Categories' : 'Manage My Categories'}</p>
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

      {/* Table with role-specific columns */}
      <table className="category-table">
        <thead>
          <tr>
            <th>Name</th>
            <th>Type</th>
            {/* Admin-only columns */}
            {isAdmin && <th>Owner</th>}
            {isAdmin && <th>Transactions</th>}
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {filteredCategories.map(cat => (
            <tr key={cat.categoryId} className={cat.isGlobal ? 'system-category' : 'user-category'}>
              <td>
                {cat.name}
                {isAdmin && cat.isGlobal && <span className="badge-global">System</span>}
              </td>
              <td>
                <span className={`type-badge ${cat.type.toLowerCase()}`}>
                  {cat.type === 'Income' ? '💰' : '🛒'} {cat.type}
                </span>
              </td>
              {/* Admin-only data */}
              {isAdmin && (
                <td>
                  {cat.isGlobal ? 'System' : 
                   users.find(u => u.userID === cat.userId)?.userName || 'Unknown User'}
                </td>
              )}
              {isAdmin && <td>{cat.transactionCount || 0}</td>}
              <td>
                <button className="btn-edit" onClick={() => startEditing(cat)}>
                  Edit
                </button>
                {/* Different delete behavior */}
                <button 
                  className="btn-delete" 
                  onClick={() => isAdmin ? confirmDelete(cat) : deleteCategory(cat.categoryId)}
                >
                  Delete
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

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

            {/* Admin-only fields */}
            {isAdmin && (
              <>
                <div className="form-group">
                  <label>
                    <input
                      type="checkbox"
                      name="isGlobal"
                      checked={newCategory.isGlobal}
                      onChange={handleInputChange}
                    />
                    System Category
                  </label>
                </div>

                {!newCategory.isGlobal && (
                  <div className="form-group">
                    <label>User:</label>
                    <select
                      name="userId"
                      value={newCategory.userId || ''}
                      onChange={handleInputChange}
                      className={errors.userId ? 'error' : ''}
                    >
                      <option value="">Select User</option>
                      {users.map(user => (
                        <option key={user.userID} value={user.userID}>
                          {user.userName}
                        </option>
                      ))}
                    </select>
                    {errors.userId && <span className="error-text">{errors.userId}</span>}
                  </div>
                )}
              </>
            )}

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

      {/* Admin-only reassign dialog */}
      {isAdmin && showReassignDialog && categoryToDelete && (
        <div className="modal-overlay">
          <div className="reassign-dialog">
            <h2>Reassign Transactions</h2>
            
            {/* ... admin reassign dialog ... */}
          </div>
        </div>
      )}
    </div>
  );
}

export default Category;