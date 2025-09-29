
import React, { useState } from "react";
import "./App.css";
import axios from "axios";
import { useNavigate } from 'react-router-dom';

const API_URL = "http://localhost:8081/api/regularUser";



function RegularUserLogin() {
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    accountType: ""
  });
  const [message, setMessage] = useState("");
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.post(`${API_URL}/login`, {
        email: formData.email,
        password: formData.password
      });
      setMessage("User Login successful!");
      // Store user info for dashboard greeting
      if (response.data && response.data.userName) {
        localStorage.setItem("regularUserName", response.data.userName);
      } else {
        localStorage.setItem("regularUserName", formData.email);
      }
      // Store userID for profile
      if (response.data && response.data.userID) {
        localStorage.setItem("regularUserId", response.data.userID);
      }
      setTimeout(() => {
        navigate('/user-dashboard');
      }, 800);
    } catch (error) {
      if (error.response) {
        setMessage(`Error: ${error.response.status} - ${error.response.statusText}`);
      } else {
        setMessage("Error connecting to server");
      }
      console.error(error);
    }
  };

  return (
    <div className="modern-login-bg">
      <div className="modern-login-container">
        <div className="modern-login-card">
          <div className="modern-login-header">
            <h1 className="modern-login-title">Welcome Back</h1>
            <p className="modern-login-subtitle">Sign in to your PersonalFinance account</p>
          </div>
          
          <form className="modern-login-form" onSubmit={handleSubmit}>
            <div className="form-group">
              <label className="form-label">Account Type</label>
              <select 
                name="accountType"
                className="form-select"
                value={formData.accountType}
                onChange={handleChange}
              >
                <option value="">Select account type</option>
                <option value="regular">Regular User</option>
                <option value="admin">Administrator</option>
              </select>
            </div>
            
            <div className="form-group">
              <label className="form-label">Email</label>
              <input
                name="email"
                className="form-input"
                type="email"
                placeholder="Enter your email"
                value={formData.email}
                onChange={handleChange}
                required
              />
            </div>
            
            <div className="form-group">
              <label className="form-label">Password</label>
              <input
                name="password"
                className="form-input"
                type="password"
                placeholder="Enter your password"
                value={formData.password}
                onChange={handleChange}
                required
              />
            </div>
            
            <button type="submit" className="modern-login-btn">Sign In</button>
            
            {message && <p className="login-message">{message}</p>}
            
            <div className="login-links">
              <a href="#" className="forgot-password-link">Forgot your password?</a>
              <p className="signup-prompt">
                Don't have an account? <a href="/user-signup" className="signup-link">Sign up</a>
              </p>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

export default RegularUserLogin;