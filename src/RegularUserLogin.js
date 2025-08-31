
import React, { useState } from "react";
import "./App.css";
import axios from "axios";
import { useNavigate } from 'react-router-dom';

const API_URL = "http://localhost:8081/api/regularUser";



function RegularUserLogin() {
  const [formData, setFormData] = useState({
    email: "",
    password: ""
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
    <div className="signup-bg">
      <div className="signup-container">
        <div className="signup-header">
          <span className="signup-appdot" />
          <span className="signup-appname">Budget Buddy</span>
        </div>
        <div className="signup-content">
          <div className="signup-form-section">
            <div className="signup-title-group">
              <span className="signup-subtitle">USER LOGIN</span>
              <h1 className="signup-title">Sign in<span className="signup-title-dot">.</span></h1>
              <span className="signup-login-link">Don't have an account? <a href="/user-signup" className="signup-link-btn">Sign Up</a></span>
            </div>
            <form className="signup-form" onSubmit={handleSubmit}>
              <input
                name="email"
                className="signup-input"
                type="email"
                placeholder="Email"
                value={formData.email}
                onChange={handleChange}
                required
              />
              <input
                name="password"
                className="signup-input signup-input-password"
                type="password"
                placeholder="Password"
                value={formData.password}
                onChange={handleChange}
                required
              />
              <div className="signup-btn-row">
                <button type="submit" className="signup-btn signup-btn-blue">Login</button>
              </div>
              {message && <p style={{ marginTop: "1em", color: "#ffd700" }}>{message}</p>}
            </form>
          </div>
          <div className="signup-side-img">
            <div className="signup-side-img-content">
              <span className="signup-side-img-icon">💰</span>
              <span className="signup-side-img-text">Smart budgeting helps you save, plan, and achieve your financial goals. Start tracking your expenses and take control today!</span>
            </div>
          </div>
        </div>
        <div className="signup-footer">
          <span className="signup-footer-logo">BB</span>
        </div>
      </div>
    </div>
  );
}

export default RegularUserLogin;