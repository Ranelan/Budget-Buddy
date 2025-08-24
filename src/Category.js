import React, { useState, useEffect } from 'react';
import './App.css';

const BASE_URL = 'http://localhost:8081/api/category';

function Category() {
  const [categories, setCategories] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filteredCategories, setFilteredCategories] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editingCategory, setEditingCategory] = useState(null);
  const [newCategory, setNewCategory] = useState({ name: '', type: 'Expense', transaction: '' });
  const [errors, setErrors] = useState({});

  useEffect(() => {
    fetch(`${BASE_URL}/findAll`)
      .then(res => res.ok ? res.json() : Promise.reject('Failed to fetch'))
      .then(data => {
        setCategories(data);
        setFilteredCategories(data);
      })
      .catch(err => console.error(err));
  }, []);

  useEffect(() => {
    const filtered = categories.filter(cat =>
      cat.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      cat.type.toLowerCase().includes(searchTerm.toLowerCase())
    );
    setFilteredCategories(filtered);
  }, [searchTerm, categories]);

  const handleSearch = (e) => setSearchTerm(e.target.value);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setNewCategory({ ...newCategory, [name]: value });
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

    fetch(endpoint, {
      method,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(newCategory)
    })
      .then(res => res.ok ? res.json() : Promise.reject('Save failed'))
      .then(saved => {
        if (isEditing) {
          setCategories(categories.map(cat => cat.categoryId === saved.categoryId ? saved : cat));
        } else {
          setCategories([...categories, saved]);
        }
        resetForm();
      })
      .catch(err => console.error(err));
  };

  const deleteCategory = (id) => {
    if (window.confirm('Delete this category?')) {
      fetch(`${BASE_URL}/delete/${id}`)
        .then(res => {
          if (!res.ok) throw new Error('Delete failed');
          setCategories(categories.filter(cat => cat.categoryId !== id));
        })
        .catch(err => console.error(err));
    }
  };

  const startEditing = (category) => {
    setIsEditing(true);
    setEditingCategory(category);
    setNewCategory({
      name: category.name,
      type: category.type,
      transaction: category.transaction?.description || ''
    });
    setShowForm(true);
  };

  const resetForm = () => {
    setIsEditing(false);
    setEditingCategory(null);
    setNewCategory({ name: '', type: 'Expense', transaction: '' });
    setErrors({});
    setShowForm(false);
  };

  return (
    <div className="category-management">
      <header className="category-header">
        <h1>🗂️ Categories</h1>
        <p>Manage your income and expense categories</p>
      </header>

      <div className="search-bar">
        <input
          type="text"
          placeholder="Search by name or type..."
          value={searchTerm}
          onChange={handleSearch}
        />
        <button className="btn-primary" onClick={() => setShowForm(true)}>+ Add Category</button>
      </div>

      <table className="category-table">
        <thead>
          <tr>
            <th>Name</th>
            <th>Type</th>
            <th>Transaction</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {filteredCategories.length > 0 ? (
            filteredCategories.map(cat => (
              <tr key={cat.categoryId}>
                <td>{cat.name}</td>
                <td>
                  <span className={`type-badge ${cat.type.toLowerCase()}`}>
                    {cat.type === 'Income' ? '💰' : '🛒'} {cat.type}
                  </span>
                </td>
                <td>{cat.transaction?.description || '—'}</td>
                <td>
                  <button className="btn-edit" onClick={() => startEditing(cat)}>Edit</button>
                  <button className="btn-delete" onClick={() => deleteCategory(cat.categoryId)}>Delete</button>
                </td>
              </tr>
            ))
          ) : (
            <tr><td colSpan="4">No categories found</td></tr>
          )}
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

            <div className="form-group">
              <label>Transaction Description:</label>
              <input
                type="text"
                name="transaction"
                value={newCategory.transaction}
                onChange={handleInputChange}
                placeholder="Optional"
              />
            </div>

            <div className="form-actions">
              <button className="btn-secondary" onClick={resetForm}>Cancel</button>
              <button className="btn-primary" onClick={saveCategory}>Save</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default Category;