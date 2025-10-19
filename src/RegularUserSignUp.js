import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import "./App.css";
import axios from "axios";
import Toast from "./components/Toast";

const API_URL = "http://localhost:8081/api/regularUser";

function RegularUserSignUp() {
  const [formData, setFormData] = useState({
    username: "",
    email: "",
    password: ""
  });

  const [message, setMessage] = useState(""); // Success/error messages
  const [toastMessage, setToastMessage] = useState("");
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.post(`${API_URL}/create`, {
  userName: formData.username,
  email: formData.email,
  password: formData.password
});
      console.log("Created user:", response.data);
      // show toast and then redirect to login when toast closes
      setToastMessage("Account created successfully. You can now log in.");
      // If you want to automatically navigate after a fixed delay instead of waiting for onClose,
      // you can uncomment the following line (duration in ms):
      // setTimeout(() => navigate('/user-login'), 3000);
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
              <span className="signup-subtitle">USER SIGN UP</span>
              <h1 className="signup-title">Create Account<span className="signup-title-dot">.</span></h1>
              <span className="signup-login-link">Already have an account? <a href="/user-login" className="signup-link-btn">Login</a></span>
            </div>
            <form className="signup-form" onSubmit={handleSubmit}>
              <input
                name="username"
                className="signup-input"
                type="text"
                placeholder="Username"
                value={formData.username}
                onChange={handleChange}
                required
              />
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
                <button type="submit" className="signup-btn signup-btn-blue">Sign Up</button>
              </div>
              {message && <p style={{ marginTop: "1em", color: "#ffd700" }}>{message}</p>}
              <Toast
                message={toastMessage}
                type="success"
                duration={3000}
                onClose={() => {
                  setToastMessage("");
                  navigate('/user-login');
                }}
              />
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

export default RegularUserSignUp;
