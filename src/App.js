
import './App.css';
import './App.css';
import { BrowserRouter as Router, Routes, Route, Link } from "react-router-dom";
import AdminDashboard from "./AdminDashboard";
import AdminSignup from "./AdminSignup";
import AdminLogin from "./AdminLogin";
import RegularUserSignUp from "./RegularUserSignUp";
import RegularUserLogin from "./RegularUserLogin";
import UserDashboard from "./UserDashboard";

function Home() {
  return (
    <div className="signup-bg">
      <div className="signup-container">
        <div className="signup-header">
          <span className="signup-appdot" />
          <span className="signup-appname">Budget Buddy</span>
          <nav className="signup-nav">
            <Link className="signup-nav-link" to="/">Home</Link>
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
              <Link to="/admin-login">
                <button className="signup-btn signup-btn-blue enhanced-btn">Admin Login</button>
              </Link>
              <Link to="/user-login">
                <button className="signup-btn signup-btn-blue enhanced-btn">User Login</button>
              </Link>
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

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/admin-dashboard" element={<AdminDashboard />} />
        <Route path="/admin-signup" element={<AdminSignup />} />
        <Route path="/admin-login" element={<AdminLogin />} />
        <Route path="/user-signup" element={<RegularUserSignUp />} />
        <Route path="/user-login" element={<RegularUserLogin />} />
        <Route path="/user-dashboard/*" element={<UserDashboard />} />
      </Routes>
    </Router>
  );
}

export default App;
