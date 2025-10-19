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
    name: '', 
    type: 'Expense'
  });
  const [errors, setErrors] = useState({});
  const [showReassignDialog, setShowReassignDialog] = useState(false);
  const [categoryToDelete, setCategoryToDelete] = useState(null);
  const [reassignCategoryId, setReassignCategoryId] = useState('');
  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState({ message: '', type: 'success' });

  const isAdmin = role === 'admin';

  // Fetch categories
  const fetchCategories = useCallback(() => {
    setLoading(true);
    fetch(`${BASE_URL}/findAll`)
      .then(async res => {
        const text = await res.text();
        console.log('Raw response from /findAll:', text);
        if (!res.ok) {
          throw new Error('Failed to fetch: ' + text);
        }
        let data = [];
        if (text && text.trim() !== '') {
          try {
            data = JSON.parse(text);
          } catch (e) {
            throw new Error('Invalid JSON response: ' + text);
          }
        }
        return data;
      })
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
      let savedData;
        try {
            savedData = responseText && responseText.trim() !== '' ? JSON.parse(responseText) : {};
            console.log('Saved successfully:', savedData);
            setToast({ message: 'Category saved', type: 'success' });
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
        setToast({ message: 'Category deleted', type: 'success' });
      })
        .catch(err => {
          console.error('Delete error:', err);
          setToast({ message: 'Failed to delete category', type: 'error' });
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
        setToast({ message: 'Category deleted', type: 'success' });
        fetchCategories();
        setShowReassignDialog(false);
        setCategoryToDelete(null);
        setReassignCategoryId('');
      })
      .catch(err => {
        console.error('Delete error:', err);
        setToast({ message: 'Failed to delete category', type: 'error' });
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
<<<<<<< Updated upstream
    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'flex-start', minHeight: '80vh', width: '100%' }}>
      <div style={{ background: '#232a36', borderRadius: '24px', boxShadow: '0 8px 32px rgba(33,150,243,0.13)', padding: '2em 1.5em', maxWidth: '480px', width: '100%', marginTop: '2em' }}>
        <Toast message={toast.message} type={toast.type} onClose={() => setToast({ message: '', type: 'success' })} />
        <header className="category-header">
          <h1 className="category-title" style={{ color: '#21cbf3', fontWeight: 800, fontSize: '2em', marginBottom: '0.5em', textAlign: 'center' }}>
            <span role="img" aria-label="folder">📁</span> My Categories
          </h1>
          <div style={{ color: '#b0b3b8', textAlign: 'center', marginBottom: '1.5em' }}>Manage your personal categories</div>
=======
    <div className="category-page-container">
      <div className="category-page-wrapper">
        {/* Header Section */}
        <header className="category-page-header">
          <div className="category-header-content">
            <div className="category-header-icon">
              <i className="fas fa-tags"></i>
            </div>
            <div className="category-header-text">
              <h1 className="category-page-title">
                {isAdmin ? 'Category Management' : 'My Categories'}
              </h1>
              <p className="category-page-subtitle">
                {isAdmin ? 'Manage all system and user categories' : 'Organize your expenses and income'}
              </p>
            </div>
          </div>
          <div className="category-header-actions">
            <button className="btn-primary" onClick={() => setShowForm(true)}>
              <i className="fas fa-plus"></i>
              {isAdmin ? 'Add Category' : 'New Category'}
            </button>
          </div>
>>>>>>> Stashed changes
        </header>

        {/* Filters Section */}
        <div className="category-filters-section">
          {isAdmin && (
            <div className="category-filters">
              <div className="filter-group">
                <label>
                  <i className="fas fa-search"></i>
                  Search
                </label>
                <input
                  type="text"
                  placeholder="Search by name or type..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="filter-input"
                />
              </div>

              <div className="filter-group">
                <label>
                  <i className="fas fa-filter"></i>
                  Type
                </label>
                <select value={filterType} onChange={(e) => setFilterType(e.target.value)} className="filter-select">
                  <option value="all">All Types</option>
                  <option value="Expense">💸 Expense</option>
                  <option value="Income">💰 Income</option>
                </select>
              </div>

              <div className="filter-group">
                <label>
                  <i className="fas fa-user"></i>
                  Owner
                </label>
                <select value={filterUser} onChange={(e) => setFilterUser(e.target.value)} className="filter-select">
                  <option value="all">All Categories</option>
                  <option value="system">🔒 System Categories</option>
                  <option value="user">👤 User Categories</option>
                  {users.map(user => (
                    <option key={user.userID} value={user.userID}>
                      {user.userName}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          )}

          {!isAdmin && (
            <div className="category-search">
              <div className="search-input-wrapper">
                <i className="fas fa-search search-icon"></i>
                <input
                  type="text"
                  placeholder="Search your categories..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="search-input"
                />
              </div>
            </div>
          )}
        </div>

        {/* Categories Table Section */}
        <div className="category-table-container">
          {loading ? (
            <div className="category-loading">
              <div className="loading-spinner"></div>
              <p>Loading categories...</p>
            </div>
          ) : filteredCategories.length > 0 ? (
            <div className="category-table-wrapper">
              <table className="category-modern-table">
                <thead>
                  <tr>
                    <th>
                      <i className="fas fa-tag"></i> Name
                    </th>
                    <th>
                      <i className="fas fa-list"></i> Type
                    </th>
                    {isAdmin && (
                      <>
                        <th>
                          <i className="fas fa-user"></i> Owner
                        </th>
                        <th>
                          <i className="fas fa-receipt"></i> Transactions
                        </th>
                      </>
                    )}
                    <th className="text-center">
                      <i className="fas fa-cog"></i> Actions
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {filteredCategories.map(cat => (
                    <tr key={cat.categoryId} className={`category-row ${(cat.isGlobal || false) ? 'system-row' : 'user-row'}`}>
                      <td>
                        <div className="category-name">
                          {cat.name}
                          {isAdmin && (cat.isGlobal || false) && (
                            <span className="badge-system">
                              <i className="fas fa-lock"></i> System
                            </span>
                          )}
                        </div>
                      </td>
                      <td>
                        <span className={`category-type-badge ${cat.type.toLowerCase()}`}>
                          <i className={cat.type === 'Income' ? 'fas fa-arrow-up' : 'fas fa-arrow-down'}></i>
                          {cat.type}
                        </span>
                      </td>
                      {isAdmin && (
                        <>
                          <td>
                            <span className="owner-label">
                              {(cat.isGlobal || false) ? (
                                <>
                                  <i className="fas fa-cog"></i> System
                                </>
                              ) : (
                                <>
                                  <i className="fas fa-user"></i> {users.find(u => u.userID === cat.userId)?.userName || 'Unknown'}
                                </>
                              )}
                            </span>
                          </td>
                          <td>
                            <span className="transaction-count">
                              {cat.transactionCount || 0}
                            </span>
                          </td>
                        </>
                      )}
                      <td>
                        <div className="action-buttons">
                          <button 
                            className="btn-action btn-edit" 
                            onClick={() => startEditing(cat)}
                            title="Edit category"
                          >
                            <i className="fas fa-edit"></i>
                          </button>
                          <button 
                            className="btn-action btn-delete" 
                            onClick={() => isAdmin ? confirmDelete(cat) : deleteCategory(cat.categoryId)}
                            title="Delete category"
                          >
                            <i className="fas fa-trash"></i>
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="category-empty-state">
              <div className="empty-state-icon">
                <i className="fas fa-tags"></i>
              </div>
              <h3>No Categories Found</h3>
              <p>
                {searchTerm || filterType !== 'all' || filterUser !== 'all'
                  ? 'Try adjusting your filters or search terms'
                  : 'Get started by creating your first category'}
              </p>
              <button className="btn-primary" onClick={() => setShowForm(true)}>
                <i className="fas fa-plus"></i>
                Create Category
              </button>
            </div>
          )}
        </div>

        {/* Category Form Modal */}
        {showForm && (
          <div className="category-modal-overlay" onClick={(e) => {
            if (e.target.className === 'category-modal-overlay') resetForm();
          }}>
            <div className="category-modal">
              <div className="modal-header">
                <h2>
                  <i className={isEditing ? 'fas fa-edit' : 'fas fa-plus'}></i>
                  {isEditing ? 'Edit Category' : 'Create New Category'}
                </h2>
                <button className="modal-close" onClick={resetForm}>
                  <i className="fas fa-times"></i>
                </button>
              </div>

              <div className="modal-body">
                <div className="modern-form-group">
                  <label htmlFor="category-name">
                    <i className="fas fa-tag"></i>
                    Category Name
                  </label>
                  <input
                    id="category-name"
                    type="text"
                    name="name"
                    value={newCategory.name}
                    onChange={handleInputChange}
                    className={errors.name ? 'input-error' : ''}
                    placeholder="e.g., Groceries, Salary"
                  />
                  {errors.name && <span className="error-message">{errors.name}</span>}
                </div>

                <div className="modern-form-group">
                  <label htmlFor="category-type">
                    <i className="fas fa-list"></i>
                    Category Type
                  </label>
                  <select
                    id="category-type"
                    name="type"
                    value={newCategory.type}
                    onChange={handleInputChange}
                    className={errors.type ? 'input-error' : ''}
                  >
                    <option value="Expense">💸 Expense</option>
                    <option value="Income">💰 Income</option>
                  </select>
                  {errors.type && <span className="error-message">{errors.type}</span>}
                </div>
              </div>

              <div className="modal-footer">
                <button className="btn-secondary" onClick={resetForm}>
                  <i className="fas fa-times"></i>
                  Cancel
                </button>
                <button className="btn-primary" onClick={saveCategory}>
                  <i className={isEditing ? 'fas fa-save' : 'fas fa-plus'}></i>
                  {isEditing ? 'Update Category' : 'Create Category'}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Reassign Dialog Modal */}
        {isAdmin && showReassignDialog && categoryToDelete && (
          <div className="category-modal-overlay">
            <div className="category-modal reassign-modal">
              <div className="modal-header warning-header">
                <h2>
                  <i className="fas fa-exclamation-triangle"></i>
                  Category Has Transactions
                </h2>
                <button className="modal-close" onClick={() => {
                  setShowReassignDialog(false);
                  setCategoryToDelete(null);
                  setReassignCategoryId('');
                }}>
                  <i className="fas fa-times"></i>
                </button>
              </div>

              <div className="modal-body">
                <div className="warning-message">
                  <p>
                    The category <strong>"{categoryToDelete.name}"</strong> has transactions assigned to it. 
                    Please choose what to do with them:
                  </p>
                </div>
                
                <div className="modern-form-group">
                  <label htmlFor="reassign-select">
                    <i className="fas fa-exchange-alt"></i>
                    Reassign Transactions To
                  </label>
                  <select
                    id="reassign-select"
                    value={reassignCategoryId}
                    onChange={(e) => setReassignCategoryId(e.target.value)}
                    className="reassign-select"
                  >
                    <option value="">⚠️ Delete All Transactions (Cannot be undone)</option>
                    <optgroup label="Same Type Categories">
                      {categories
                        .filter(cat => 
                          cat.categoryId !== categoryToDelete.categoryId && 
                          cat.type === categoryToDelete.type
                        )
                        .map(cat => (
                          <option key={cat.categoryId} value={cat.categoryId}>
                            {cat.name} {(cat.isGlobal || false) ? "(System)" : ""}
                          </option>
                        ))}
                    </optgroup>
                  </select>
                  
                  {reassignCategoryId ? (
                    <div className="info-box">
                      <i className="fas fa-info-circle"></i>
                      <small>Transactions will be moved to the selected category</small>
                    </div>
                  ) : (
                    <div className="danger-box">
                      <i className="fas fa-exclamation-triangle"></i>
                      <small>All transactions in this category will be permanently deleted</small>
                    </div>
                  )}
                </div>
              </div>

              <div className="modal-footer">
                <button 
                  className="btn-secondary" 
                  onClick={() => {
                    setShowReassignDialog(false);
                    setCategoryToDelete(null);
                    setReassignCategoryId('');
                  }}
                >
                  <i className="fas fa-times"></i>
                  Cancel
                </button>
                <button 
                  className={reassignCategoryId ? "btn-primary" : "btn-danger"} 
                  onClick={() => proceedWithDelete(categoryToDelete.categoryId, reassignCategoryId)}
                >
                  <i className={reassignCategoryId ? 'fas fa-exchange-alt' : 'fas fa-trash'}></i>
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