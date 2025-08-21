import React, { useState } from "react";
import "./App.css";


export default function AdminSignup({ onBack }) {
  const [form, setForm] = useState({
    userName: "",
    email: "",
    password: "",
    adminCode: ""
  });
  const [showPassword, setShowPassword] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
  const response = await fetch("http://localhost:8081/api/admin/create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userName: form.userName,
          email: form.email,
          password: form.password,
          adminCode: form.adminCode
        })
      });
      if (response.ok) {
        const data = await response.json();
        alert("Admin account created!\n" + JSON.stringify(data, null, 2));
        onBack();
      } else {
        alert("Failed to create admin account.");
      }
    } catch (error) {
      alert("Error: " + error);
    }
  };

  return (
    <div className="signup-bg">
      <div className="signup-container">
        <div className="signup-header">
          <span className="signup-appdot" />
          <span className="signup-appname">Budget Buddy</span>
          <nav className="signup-nav">
            <span>Home</span>
            <span>Join</span>
          </nav>
        </div>
        <div className="signup-content">
          <div className="signup-form-section">
            <div className="signup-title-group">
              <span className="signup-subtitle">START FOR FREE</span>
              <h1 className="signup-title">Create new account<span className="signup-title-dot">.</span></h1>
              <span className="signup-login-link">Already A Member? <button type="button" className="signup-link-btn" onClick={onBack}>Log In</button></span>
            </div>
            <form className="signup-form" onSubmit={handleSubmit}>
              <div className="signup-row">
                <input
                  type="text"
                  name="userName"
                  placeholder="User Name"
                  value={form.userName}
                  onChange={handleChange}
                  className="signup-input"
                  required
                />
                <input
                  type="text"
                  name="adminCode"
                  placeholder="Admin Code"
                  value={form.adminCode}
                  onChange={handleChange}
                  className="signup-input"
                  required
                />
              </div>
              <input
                type="email"
                name="email"
                placeholder="Email"
                value={form.email}
                onChange={handleChange}
                className="signup-input"
                required
              />
              <div style={{ position: "relative" }}>
                <input
                  type={showPassword ? "text" : "password"}
                  name="password"
                  placeholder="Password"
                  value={form.password}
                  onChange={handleChange}
                  className="signup-input signup-input-password"
                  required
                  style={{ paddingRight: "2.5em" }}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((v) => !v)}
                  style={{
                    position: "absolute",
                    right: "0.5em",
                    top: "50%",
                    transform: "translateY(-50%)",
                    background: "none",
                    border: "none",
                    color: "#2196f3",
                    fontSize: "1.2em",
                    cursor: "pointer"
                  }}
                  tabIndex={-1}
                  aria-label={showPassword ? "Hide password" : "Show password"}
                >
                  {showPassword ? "🙈" : "👁️"}
                </button>
              </div>
              <div className="signup-btn-row">
                <button type="submit" className="signup-btn signup-btn-blue">Create account</button>
              </div>
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
