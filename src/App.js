
import './App.css';



import { useState } from "react";


function App() {
  const [page, setPage] = useState("landing");

  if (page === "adminDashboard") {
    const AdminDashboard = require("./AdminDashboard").default;
    return <AdminDashboard />;
  }
  if (page === "adminSignup") {
    const AdminSignup = require("./AdminSignup").default;
    return <AdminSignup onBack={() => setPage("adminLogin")} setPage={setPage} />;
  }
  if (page === "adminLogin") {
    const AdminLogin = require("./AdminLogin").default;
    return <AdminLogin onBack={() => setPage("adminSignup")} setPage={setPage} />;
  }
  if (page === "userLogin") {
    const UserLogin = require("./UserLogin").default;
    return <UserLogin onBack={() => setPage("userSignup")} setPage={setPage} />;
  }
  if (page === "userSignup") {
    const UserSignup = require("./UserSignup").default;
    return <UserSignup onBack={() => setPage("userLogin")} setPage={setPage} />;
  }

  return (
    <div className="signup-bg">
      <div className="signup-container">
        <div className="signup-header">
          <span className="signup-appdot" />
          <span className="signup-appname">Budget Buddy</span>
          <nav className="signup-nav">
            <span className="signup-nav-link" onClick={() => setPage("landing")}>Home</span>
            <span className="signup-nav-link" onClick={() => setPage("adminSignup")}>Join</span>
            <span className="signup-nav-link" onClick={() => setPage("adminLogin")}>Login</span>
          </nav>
        </div>
        <div className="signup-content">
          <div className="signup-form-section">
            <div className="signup-title-group">
              <span className="signup-subtitle">WELCOME</span>
              <h1 className="signup-title">Take control of your personal finances<span className="signup-title-dot">.</span></h1>
              <span className="signup-login-link">Track your budget, manage expenses, and plan for your future—all in one place.</span>
            </div>
            <div className="signup-btn-row">
              <button className="signup-btn signup-btn-blue" onClick={() => setPage("adminLogin")}>Admin Login</button>
              <button className="signup-btn signup-btn-gray" onClick={() => setPage("adminSignup")}>Admin Sign Up</button>
              <button className="signup-btn signup-btn-blue" onClick={() => setPage("userLogin")}>User Login</button>
              <button className="signup-btn signup-btn-gray" onClick={() => setPage("userSignup")}>User Sign Up</button>
            </div>
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

export default App;
