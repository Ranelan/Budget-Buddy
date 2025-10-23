import React, { useState, useEffect, useCallback } from 'react';
import './App.css';
import Toast from './components/Toast';

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
    categoryId: null, // Add categoryId for editing
    name: '', 
    type: 'Expense'
  });
  const [errors, setErrors] = useState({});
  const [showReassignDialog, setShowReassignDialog] = useState(false);
  const [categoryToDelete, setCategoryToDelete] = useState(null);
  const [reassignCategoryId, setReassignCategoryId] = useState('');
  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState({ message: '', type: 'success' });
  
  const isAdmin = role === 'admin' || localStorage.getItem('isAdmin') === 'true';

  // Helper to robustly obtain the current regular user's id from localStorage.
  const getCurrentUserId = () => {
    const explicit = localStorage.getItem('regularUserID') || localStorage.getItem('regularUserId');
    if (explicit) return explicit;
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key && key.toLowerCase().includes('regularuser')) {
        const val = localStorage.getItem(key);
        if (val) return val;
      }
    }
    return null;
  };

  const applyFilters = useCallback((data) => {
    let filtered = data.filter(cat =>
      cat.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      cat.type.toLowerCase().includes(searchTerm.toLowerCase())
    );

    if (filterType !== 'all') {
      filtered = filtered.filter(cat => cat.type === filterType);
    }

    if (filterUser !== 'all' && isAdmin) { // Filter only for admin
      filtered = filtered.filter(cat => 
        filterUser === 'system' ? cat.isGlobal : 
        filterUser === 'user' ? !cat.isGlobal : 
        String(cat.userId) === String(filterUser)
      );
    }

    setFilteredCategories(filtered);
  }, [searchTerm, filterType, filterUser, isAdmin]);

  // --- UPDATED AND SECURE fetchCategories FUNCTION ---
  const fetchCategories = useCallback(() => {
    setLoading(true);
  const isAdminFlag = role === 'admin' || localStorage.getItem('isAdmin') === 'true';
  const currentUser = getCurrentUserId();
    let url = "";

    // STRICT LOGIC: Explicitly define the endpoint. Fail securely.
    if (isAdminFlag) {
      // Rule 1: If user is an admin, allow fetching all categories.
      url = `${BASE_URL}/findAll`;
    } else if (currentUser) {
      // Rule 2: If not an admin, they MUST have a user ID to fetch their own data.
      url = `${BASE_URL}/byUser/${currentUser}`;
    } else {
      // Rule 3: Fail securely. If not an admin AND no user ID, do not fetch anything.
      // Log helpful diagnostics so devs can see which keys are present.
      console.warn("Access Denied: No valid user or admin session found. Cannot fetch categories.", {
        isAdminLocal: localStorage.getItem('isAdmin'),
        regularUserID: localStorage.getItem('regularUserID'),
        regularUserId: localStorage.getItem('regularUserId')
      });
      setCategories([]);
      setFilteredCategories([]); // Also clear filtered results
      setLoading(false);
      return; // Stop the function here
    }

    fetch(url)
      .then(res => {
        if (!res.ok) {
          throw new Error(`Failed to fetch categories from ${url}, status: ${res.status}`);
        }
        return res.json();
      })
      .then(data => {
        setCategories(data || []);
        // applyFilters will be called by the useEffect watching `categories`
      })
      .catch(err => {
        console.error(err);
        setToast({ message: 'Could not load categories', type: 'error' });
        setCategories([]);
      })
      .finally(() => {
        setLoading(false);
      });
  }, [role]);

  const fetchUsers = useCallback(() => {
    if (!isAdmin) return;
    
    fetch(USERS_URL)
      .then(res => res.ok ? res.json() : [])
      .then(data => setUsers(data))
      .catch(err => console.error('Failed to fetch users:', err));
  }, [isAdmin]);


  useEffect(() => {
    fetchCategories();
    if (isAdmin) {
      fetchUsers();
    }
  }, [fetchCategories, fetchUsers, isAdmin]);

  useEffect(() => {
    applyFilters(categories);
  }, [applyFilters, categories]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setNewCategory({ ...newCategory, [name]: value });
    if (errors[name]) setErrors({ ...errors, [name]: '' });
  };

  const validateForm = () => {
    const newErrors = {};
    if (!newCategory.name.trim()) newErrors.name = 'Name is required';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // --- UPDATED saveCategory with User Association ---
  const saveCategory = async () => {
    if (!validateForm()) return;

    const method = isEditing ? 'PUT' : 'POST';
    const endpoint = isEditing ? `${BASE_URL}/update` : `${BASE_URL}/create`;
    const rawUserId = getCurrentUserId();
    const numericUserId = rawUserId ? Number(rawUserId) : undefined;

    // Prepare payload, ensuring user association for new categories
    const payload = {
      categoryId: isEditing ? newCategory.categoryId : undefined, // Only send ID when updating
      name: newCategory.name,
      type: newCategory.type,
      // For a non-admin, associate the category with their user ID (both nested and top-level)
      regularUser: !isAdmin && numericUserId ? { userID: numericUserId } : undefined,
      userId: !isAdmin && numericUserId ? numericUserId : undefined
    };

    console.log('Saving category to', endpoint, 'method', method, 'payload', payload);

    try {
      const res = await fetch(endpoint, {
        method,
        headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
        body: JSON.stringify(payload)
      });

      // Read text safely (some endpoints return empty body)
      const text = await res.text().catch(() => '');
      let parsed = null;
      try { parsed = text ? JSON.parse(text) : null; } catch (e) { /* ignore parse errors */ }
      console.log('Save category response', res.status, text, parsed);

      if (!res.ok) {
        const errMsg = parsed && parsed.message ? parsed.message : (text || `HTTP ${res.status}`);
        throw new Error(errMsg);
      }

      setToast({ message: `Category ${isEditing ? 'updated' : 'created'} successfully`, type: 'success' });
      fetchCategories();
      resetForm();
    } catch (error) {
      console.error('Save category error:', error);
      setToast({ message: `Error saving category: ${error.message}`, type: 'error' });
    }
  };

  const deleteCategory = (id) => {
    if (window.confirm('Are you sure you want to delete this category? Any transactions using it will be uncategorized.')) {
      fetch(`${BASE_URL}/delete/${id}`, { method: 'DELETE' })
        .then(res => {
          if (!res.ok) throw new Error('Delete failed on server');
          setToast({ message: 'Category deleted', type: 'success' });
          fetchCategories(); // Re-fetch to get the updated list
        })
        .catch(err => {
          console.error('Delete error:', err);
          setToast({ message: 'Failed to delete category', type: 'error' });
        });
    }
  };
  
  // Admin-specific delete logic remains the same
  const confirmDelete = (category) => {
    // This is a simplified version. A real implementation might check transaction counts.
    proceedWithDelete(category.categoryId);
  };

  const proceedWithDelete = (id, reassignToId = null) => {
    let url = `${BASE_URL}/delete/${id}`;
    if (reassignToId) {
      url += `?reassignTo=${reassignToId}`;
    }
    fetch(url, { method: 'DELETE' })
      .then(res => {
        if (!res.ok) throw new Error('Delete failed');
        setToast({ message: 'Category deleted successfully', type: 'success' });
        fetchCategories();
        setShowReassignDialog(false);
      })
      .catch(err => {
        setToast({ message: `Failed to delete category: ${err.message}`, type: 'error' });
        setShowReassignDialog(false);
      });
  };

  const startEditing = (category) => {
    setIsEditing(true);
    setNewCategory({
      categoryId: category.categoryId,
      name: category.name,
      type: category.type
    });
    setShowForm(true);
  };

  const resetForm = () => {
    setIsEditing(false);
    setNewCategory({ categoryId: null, name: '', type: 'Expense' });
    setErrors({});
    setShowForm(false);
  };

  // JSX remains the same
  return (
    <div className="category-page-container">
      <div className="category-page-wrapper">
        <Toast message={toast.message} type={toast.type} onClose={() => setToast({ message: '', type: 'success' })} />
        <header className="category-page-header">
          <div className="category-header-content">
            <div className="category-header-icon"><i className="fas fa-tags"></i></div>
            <div className="category-header-text">
              <h1 className="category-page-title">{isAdmin ? 'Category Management' : 'My Categories'}</h1>
              <p className="category-page-subtitle">{isAdmin ? 'Manage all system and user categories' : 'Organize your expenses and income'}</p>
            </div>
          </div>
          <div className="category-header-actions">
            <button className="btn-primary" onClick={() => setShowForm(true)}><i className="fas fa-plus"></i> {isAdmin ? 'Add Category' : 'New Category'}</button>
          </div>
        </header>

        <div className="category-filters-section">
          <div className="category-search">
            <div className="search-input-wrapper">
              <i className="fas fa-search search-icon"></i>
              <input type="text" placeholder="Search categories..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="search-input"/>
            </div>
          </div>
          {isAdmin && (
            <div className="category-filters">
              <div className="filter-group">
                <label><i className="fas fa-filter"></i> Type</label>
                <select value={filterType} onChange={(e) => setFilterType(e.target.value)} className="filter-select">
                  <option value="all">All Types</option>
                  <option value="Expense">💸 Expense</option>
                  <option value="Income">💰 Income</option>
                </select>
              </div>
              <div className="filter-group">
                <label><i className="fas fa-user"></i> Owner</label>
                <select value={filterUser} onChange={(e) => setFilterUser(e.target.value)} className="filter-select">
                  <option value="all">All Owners</option>
                  <option value="system">🔒 System</option>
                  <option value="user">👤 All Users</option>
                  {users.map(user => (<option key={user.userID} value={user.userID}>{user.userName}</option>))}
                </select>
              </div>
            </div>
          )}
        </div>

        <div className="category-table-container">
          {loading ? (
            <div className="category-loading"><div className="loading-spinner"></div><p>Loading categories...</p></div>
          ) : filteredCategories.length > 0 ? (
            <div className="category-table-wrapper">
              <table className="category-modern-table">
                <thead>
                  <tr>
                    <th><i className="fas fa-tag"></i> Name</th>
                    <th><i className="fas fa-list"></i> Type</th>
                    {isAdmin && <th><i className="fas fa-user"></i> Owner</th>}
                    <th className="text-center"><i className="fas fa-cog"></i> Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredCategories.map(cat => (
                    <tr key={cat.categoryId} className={`category-row ${cat.isGlobal ? 'system-row' : 'user-row'}`}>
                      <td>
                        <div className="category-name">
                          {cat.name}
                          {isAdmin && cat.isGlobal && (<span className="badge-system"><i className="fas fa-lock"></i> System</span>)}
                        </div>
                      </td>
                      <td>
                        <span className={`category-type-badge ${cat.type.toLowerCase()}`}>
                          <i className={cat.type === 'Income' ? 'fas fa-arrow-up' : 'fas fa-arrow-down'}></i> {cat.type}
                        </span>
                      </td>
                      {isAdmin && (
                        <td>
                          <span className="owner-label">
                            {cat.isGlobal ? (<><i className="fas fa-cog"></i> System</>) : (<><i className="fas fa-user"></i> {users.find(u => u.userID === cat.userId)?.userName || 'Unknown User'}</>)}
                          </span>
                        </td>
                      )}
                      <td>
                        <div className="action-buttons">
                          <button className="btn-action btn-edit" onClick={() => startEditing(cat)} title="Edit category"><i className="fas fa-edit"></i></button>
                          <button className="btn-action btn-delete" onClick={() => isAdmin ? confirmDelete(cat) : deleteCategory(cat.categoryId)} title="Delete category"><i className="fas fa-trash"></i></button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="category-empty-state">
              <div className="empty-state-icon"><i className="fas fa-tags"></i></div>
              <h3>No Categories Found</h3>
              <p>{searchTerm || filterType !== 'all' || (isAdmin && filterUser !== 'all') ? 'Try adjusting your filters' : 'Get started by creating a category'}</p>
              <button className="btn-primary" onClick={() => setShowForm(true)}><i className="fas fa-plus"></i> Create Category</button>
            </div>
          )}
        </div>

        {showForm && (
          <div className="category-modal-overlay" onClick={(e) => { if (e.target.className === 'category-modal-overlay') resetForm(); }}>
            <div className="category-modal">
              <div className="modal-header">
                <h2><i className={isEditing ? 'fas fa-edit' : 'fas fa-plus'}></i> {isEditing ? 'Edit Category' : 'Create New Category'}</h2>
                <button className="modal-close" onClick={resetForm}><i className="fas fa-times"></i></button>
              </div>
              <div className="modal-body">
                <div className="modern-form-group">
                  <label htmlFor="category-name"><i className="fas fa-tag"></i> Category Name</label>
                  <input id="category-name" type="text" name="name" value={newCategory.name} onChange={handleInputChange} className={errors.name ? 'input-error' : ''} placeholder="e.g., Groceries, Salary"/>
                  {errors.name && <span className="error-message">{errors.name}</span>}
                </div>
                <div className="modern-form-group">
                  <label htmlFor="category-type"><i className="fas fa-list"></i> Category Type</label>
                  <select id="category-type" name="type" value={newCategory.type} onChange={handleInputChange} className={errors.type ? 'input-error' : ''}>
                    <option value="Expense">💸 Expense</option>
                    <option value="Income">💰 Income</option>
                  </select>
                </div>
              </div>
              <div className="modal-footer">
                <button className="btn-secondary" onClick={resetForm}><i className="fas fa-times"></i> Cancel</button>
                <button className="btn-primary" onClick={saveCategory}><i className={isEditing ? 'fas fa-save' : 'fas fa-plus'}></i> {isEditing ? 'Update Category' : 'Create Category'}</button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default Category;