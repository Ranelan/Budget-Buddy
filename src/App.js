
import React, { useState, useEffect, createContext, useContext } from 'react';
import './App.css';
import { BrowserRouter as Router, Routes, Route, Link, Navigate, useLocation } from "react-router-dom";
import { useNavigate } from "react-router-dom";
import axios from 'axios';
import AdminDashboard from "./AdminDashboard";
import AdminSignup from "./AdminSignup";
import AdminLogin from "./AdminLogin";
import RegularUserSignUp from "./RegularUserSignUp";
import RegularUserLogin from "./RegularUserLogin";
import UserDashboard from "./UserDashboard";
import About from "./About";
import Contact from "./Contact";

import NotFound from "./NotFound";

// Theme context for color mode toggle
const ThemeContext = createContext();

function useTheme() {
  return useContext(ThemeContext);
}

// Authentication context
const AuthContext = createContext();

function useAuth() {
  return useContext(AuthContext);
}

// Authentication Provider Component
function AuthProvider({ children }) {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [userType, setUserType] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  // Check authentication status on app load
  useEffect(() => {
    checkAuthStatus();
  }, []);

  const checkAuthStatus = () => {
    const adminId = localStorage.getItem("adminId");
    const adminName = localStorage.getItem("adminName");
    const regularUserId = localStorage.getItem("regularUserId");
    const regularUserName = localStorage.getItem("regularUserName");

    if (adminId && adminName) {
      setIsAuthenticated(true);
      setUserType('admin');
    } else if (regularUserId || regularUserName) {
      setIsAuthenticated(true);
      setUserType('user');
    } else {
      setIsAuthenticated(false);
      setUserType(null);
    }
    
    setIsLoading(false);
  };

  const login = (type) => {
    setIsAuthenticated(true);
    setUserType(type);
  };

  const logout = () => {
    // Clear all authentication data
    localStorage.removeItem("adminId");
    localStorage.removeItem("adminName");
    localStorage.removeItem("regularUserId");
    localStorage.removeItem("regularUserName");
    
    setIsAuthenticated(false);
    setUserType(null);
  };

  const value = {
    isAuthenticated,
    userType,
    isLoading,
    login,
    logout,
    checkAuthStatus
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

// Protected Route Components
function ProtectedRoute({ children, requiredUserType = null }) {
  const { isAuthenticated, userType, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="loading-container">
        <div className="loading-spinner">
          <p>Loading...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (requiredUserType && userType !== requiredUserType) {
    // If user is authenticated but doesn't have the required user type
    return <Navigate to={userType === 'admin' ? '/admin-dashboard' : '/user-dashboard'} replace />;
  }

  return children;
}

// Redirect authenticated users away from login/signup pages
function PublicRoute({ children }) {
  const { isAuthenticated, userType, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="loading-container">
        <div className="loading-spinner">
          <p>Loading...</p>
        </div>
      </div>
    );
  }

  if (isAuthenticated) {
    return <Navigate to={userType === 'admin' ? '/admin-dashboard' : '/user-dashboard'} replace />;
  }

  return children;
}

function Home() {
  // Smooth scroll to features section
  const handleScrollToFeatures = () => {
    const featuresSection = document.querySelector('.features-section');
    if (featuresSection) {
      featuresSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };
  
  return (
    <div className="professional-landing">
      <section className="hero-section-modern">
        <div className="hero-container">
          <div className="hero-content-modern">
            <div className="hero-badge fade-in">
              <i className="fas fa-sparkles"></i>
              <span>AI-Powered Financial Intelligence</span>
            </div>
            <h1 className="hero-title-modern fade-in" style={{ animationDelay: '0.2s' }}>
              Take Control of Your 
              <span className="hero-title-highlight"> Financial Future</span>
            </h1>
            <p className="hero-subtitle-modern fade-in" style={{ animationDelay: '0.4s' }}>
              Transform your financial life with intelligent budgeting, AI-powered insights, 
              and comprehensive expense tracking. Join thousands who trust Budget Buddy.
            </p>
            <div className="hero-cta-modern fade-in" style={{ animationDelay: '0.6s' }}>
              <Link to="/user-signup" className="btn btn-primary btn-lg">
                <i className="fas fa-rocket"></i>
                Start Free Today
              </Link>
              <button className="btn btn-ghost btn-lg" onClick={handleScrollToFeatures}>
                <i className="fas fa-play-circle"></i>
                See How It Works
              </button>
            </div>
            <div className="hero-stats fade-in" style={{ animationDelay: '0.8s' }}>
              <div className="hero-stat">
                <div className="hero-stat-number">10K+</div>
                <div className="hero-stat-label">Happy Users</div>
              </div>
              <div className="hero-stat">
                <div className="hero-stat-number">R2M+</div>
                <div className="hero-stat-label">Money Saved</div>
              </div>
              <div className="hero-stat">
                <div className="hero-stat-number">98%</div>
                <div className="hero-stat-label">Satisfaction</div>
              </div>
            </div>
          </div>
          <div className="hero-visual slide-up" style={{ animationDelay: '0.4s' }}>
            <div className="hero-dashboard-container">
              <img src="/hero-dashboard-C5pyZVDE.jpg" alt="Budget Buddy Dashboard" className="hero-dashboard-modern" />
              <div className="hero-floating-cards">
                <div className="floating-card card-1">
                  <i className="fas fa-chart-line"></i>
                  <span>+24% Savings</span>
                </div>
                <div className="floating-card card-2">
                  <i className="fas fa-shield-alt"></i>
                  <span>Secure & Protected</span>
                </div>
                <div className="floating-card card-3">
                  <i className="fas fa-robot"></i>
                  <span>AI Insights</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="features-section">
        <div className="container">
          <div className="section-header text-center">
            <h2 className="section-title">Powerful Financial Tools</h2>
            <p className="section-subtitle">
              Everything you need to master your finances with AI-powered intelligence
            </p>
          </div>
          
          <div className="features-grid-modern">
            <div className="feature-card-modern">
              <div className="feature-icon-modern">
                <i className="fas fa-chart-line"></i>
              </div>
              <h3 className="feature-title">Smart Transaction Tracking</h3>
              <p className="feature-description">
                Automatically categorize transactions with AI and get real-time insights into your spending patterns.
              </p>
              <div className="feature-highlight">AI-Powered</div>
            </div>

            <div className="feature-card-modern">
              <div className="feature-icon-modern">
                <i className="fas fa-bullseye"></i>
              </div>
              <h3 className="feature-title">Intelligent Budget Planning</h3>
              <p className="feature-description">
                Create dynamic budgets that adapt to your lifestyle with predictive analytics and smart recommendations.
              </p>
              <div className="feature-highlight">Adaptive</div>
            </div>

            <div className="feature-card-modern">
              <div className="feature-icon-modern">
                <i className="fas fa-rocket"></i>
              </div>
              <h3 className="feature-title">Goal Achievement System</h3>
              <p className="feature-description">
                Set ambitious financial goals and let our AI coach guide you with personalized strategies and milestones.
              </p>
              <div className="feature-highlight">Personalized</div>
            </div>

            <div className="feature-card-modern">
              <div className="feature-icon-modern">
                <i className="fas fa-shield-alt"></i>
              </div>
              <h3 className="feature-title">Bank-Level Security</h3>
              <p className="feature-description">
                Your financial data is protected with enterprise-grade encryption and multi-factor authentication.
              </p>
              <div className="feature-highlight">Secure</div>
            </div>

            <div className="feature-card-modern">
              <div className="feature-icon-modern">
                <i className="fas fa-sync-alt"></i>
              </div>
              <h3 className="feature-title">Automated Workflows</h3>
              <p className="feature-description">
                Streamline recurring transactions and bills with intelligent automation and smart notifications.
              </p>
              <div className="feature-highlight">Automated</div>
            </div>

            <div className="feature-card-modern">
              <div className="feature-icon-modern">
                <i className="fas fa-brain"></i>
              </div>
              <h3 className="feature-title">AI Financial Advisor</h3>
              <p className="feature-description">
                Get personalized financial advice and optimization tips powered by advanced machine learning algorithms.
              </p>
              <div className="feature-highlight">Intelligent</div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}


// Professional Header Component
function AppHeader() {
  const { isAuthenticated, userType, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [isScrolled, setIsScrolled] = useState(false);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  const isDashboard = location.pathname.startsWith('/user-dashboard') || location.pathname.startsWith('/admin-dashboard');
  const userName = localStorage.getItem("regularUserName") || localStorage.getItem("adminName") || "User";

  useEffect(() => {
    const handleScroll = () => {
      const scrollTop = window.scrollY;
      setIsScrolled(scrollTop > 50);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (isDropdownOpen && !event.target.closest('.header-user-dropdown')) {
        setIsDropdownOpen(false);
      }
    };

    document.addEventListener('click', handleClickOutside);
    return () => document.removeEventListener('click', handleClickOutside);
  }, [isDropdownOpen]);

  const handleLogout = () => {
    setIsDropdownOpen(false);
    logout();
    navigate('/');
  };

  const dashboardNavItems = [
    { path: "/user-dashboard/home", label: "Dashboard", icon: "fas fa-home" },
    { path: "/user-dashboard/budget", label: "Budget", icon: "fas fa-chart-pie" },
    { path: "/user-dashboard/goal", label: "Goals", icon: "fas fa-bullseye" },
    { path: "/user-dashboard/transaction", label: "Transactions", icon: "fas fa-exchange-alt" },
    { path: "/user-dashboard/recurring", label: "Recurring", icon: "fas fa-sync-alt" },
    { path: "/user-dashboard/category", label: "Categories", icon: "fas fa-tags" }
  ];

  return (
    <header className={`professional-header ${isScrolled ? 'scrolled' : ''} ${isDashboard ? 'dashboard-header' : ''}`} role="banner">
      <div className="header-container">
        <Link to="/" className="header-logo">
          <div className="header-logo-icon">
            <i className="fas fa-coins"></i>
          </div>
          <span className="header-logo-text">
            Budget <span className="header-logo-highlight">Buddy</span>
          </span>
        </Link>
        
        {isDashboard && isAuthenticated ? (
          // Dashboard Navigation
          <nav className="header-dashboard-nav" role="navigation" aria-label="Dashboard navigation">
            {dashboardNavItems.map((item) => {
              const isActive = location.pathname === item.path || 
                (item.path === "/user-dashboard/home" && location.pathname === "/user-dashboard");
              
              return (
                <button
                  key={item.path}
                  className={`header-dashboard-nav-item ${isActive ? 'active' : ''}`}
                  onClick={() => navigate(item.path)}
                >
                  <i className={item.icon}></i>
                  <span>{item.label}</span>
                </button>
              );
            })}
          </nav>
        ) : (
          // Main Navigation
          <nav className="header-nav" role="navigation" aria-label="Main navigation">
            {isAuthenticated && (
              <Link 
                to="/user-dashboard/home" 
                className={`header-nav-link ${isDashboard ? 'active' : ''}`}
              >
                Dashboard
              </Link>
            )}
            <Link to="/" className={`header-nav-link ${location.pathname === '/' ? 'active' : ''}`}>Home</Link>
            <Link to="/about" className={`header-nav-link ${location.pathname === '/about' ? 'active' : ''}`}>About</Link>
            <Link to="/contact" className={`header-nav-link ${location.pathname === '/contact' ? 'active' : ''}`}>Contact</Link>
          </nav>
        )}

        <div className="header-actions">
          {isAuthenticated ? (
            <div className={`header-user-dropdown ${isDropdownOpen ? 'open' : ''}`}>
              <button 
                className="header-user-trigger"
                onClick={() => setIsDropdownOpen(!isDropdownOpen)}
              >
                <div className="header-user-badge">
                  {userName.charAt(0).toUpperCase()}
                </div>
                <div className="header-user-info-text">
                  <div className="header-user-name">{userName}</div>
                  <div className="header-user-role">{userType === 'admin' ? 'Admin' : 'User'}</div>
                </div>
                <i className="fas fa-chevron-down header-dropdown-icon"></i>
              </button>
              <div className="header-user-dropdown-menu">
                <Link to="/user-dashboard/profile" className="header-dropdown-item">
                  <i className="fas fa-user"></i>
                  Profile
                </Link>
                <Link to="/settings" className="header-dropdown-item">
                  <i className="fas fa-cog"></i>
                  Settings
                </Link>
                <div className="header-dropdown-divider"></div>
                <button onClick={handleLogout} className="header-dropdown-item danger">
                  <i className="fas fa-sign-out-alt"></i>
                  Logout
                </button>
              </div>
            </div>
          ) : (
            <>
              <Link to="/login" className="btn btn-ghost btn-sm">
                Sign In
              </Link>
              <Link to="/user-signup" className="btn btn-primary btn-sm">
                Get Started
              </Link>
            </>
          )}
        </div>
      </div>
    </header>
  );
}

function App() {
  const [theme, setTheme] = useState(() => localStorage.getItem('theme') || 'dark');
  useEffect(() => {
    document.body.setAttribute('data-theme', theme);
    localStorage.setItem('theme', theme);
  }, [theme]);

  const toggleTheme = () => setTheme(theme === 'dark' ? 'light' : 'dark');

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme }}>
      <AuthProvider>
        <Router>
          <AppHeader />
          <main id="main-content" tabIndex="-1" role="main">
            <Routes>
              {/* Public Routes - accessible to everyone */}
              <Route path="/" element={<Home />} />
              <Route path="/about" element={<About />} />
              <Route path="/contact" element={<Contact />} />
              
              {/* Public Routes - redirect if already logged in */}
              <Route path="/login" element={
                <PublicRoute>
                  <LoginLanding />
                </PublicRoute>
              } />
              <Route path="/signup" element={
                <PublicRoute>
                  <SignupLanding />
                </PublicRoute>
              } />
              <Route path="/admin-signup" element={
                <PublicRoute>
                  <AdminSignup />
                </PublicRoute>
              } />
              <Route path="/admin-login" element={
                <PublicRoute>
                  <AdminLogin />
                </PublicRoute>
              } />
              <Route path="/user-signup" element={
                <PublicRoute>
                  <RegularUserSignUp />
                </PublicRoute>
              } />
              
              {/* Protected Routes - require authentication */}
              <Route path="/admin-dashboard" element={
                <ProtectedRoute requiredUserType="admin">
                  <AdminDashboard />
                </ProtectedRoute>
              } />
              <Route path="/user-dashboard/*" element={
                <ProtectedRoute requiredUserType="user">
                  <UserDashboard />
                </ProtectedRoute>
              } />
              
              {/* 404 Route */}
              <Route path="*" element={<NotFound />} />
            </Routes>
          </main>
          <footer className="main-footer" role="contentinfo">
            <div className="footer-content">
              <p>&copy; {new Date().getFullYear()} Budget Buddy. All rights reserved.</p>
              <div className="footer-social">
                <a href="mailto:contact@budgetbuddy.com" aria-label="Email" target="_blank" rel="noopener noreferrer">
                  <svg width="24" height="24" fill="currentColor" viewBox="0 0 24 24"><path d="M20 4H4c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 2v.01L12 13 4 6.01V6h16zM4 20v-9.99l7.99 7.99c.39.39 1.02.39 1.41 0L20 10.01V20H4z"/></svg>
                </a>
                <a href="https://github.com/Ranelan/raney" aria-label="GitHub" target="_blank" rel="noopener noreferrer">
                  <svg width="24" height="24" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2C6.48 2 2 6.58 2 12.26c0 4.5 2.87 8.32 6.84 9.67.5.09.68-.22.68-.48 0-.24-.01-.87-.01-1.7-2.78.62-3.37-1.36-3.37-1.36-.45-1.18-1.1-1.5-1.1-1.5-.9-.63.07-.62.07-.62 1 .07 1.53 1.05 1.53 1.05.89 1.56 2.34 1.11 2.91.85.09-.66.35-1.11.63-1.37-2.22-.26-4.56-1.14-4.56-5.07 0-1.12.39-2.03 1.03-2.75-.1-.26-.45-1.3.1-2.7 0 0 .84-.28 2.75 1.05A9.38 9.38 0 0112 6.84c.85.004 1.71.12 2.51.35 1.91-1.33 2.75-1.05 2.75-1.05.55 1.4.2 2.44.1 2.7.64.72 1.03 1.63 1.03 2.75 0 3.94-2.34 4.81-4.57 5.07.36.32.68.94.68 1.9 0 1.37-.01 2.47-.01 2.81 0 .27.18.58.69.48A10.01 10.01 0 0022 12.26C22 6.58 17.52 2 12 2z"/></svg>
                </a>
                <a href="https://linkedin.com/in/yourprofile" aria-label="LinkedIn" target="_blank" rel="noopener noreferrer">
                  <svg width="24" height="24" fill="currentColor" viewBox="0 0 24 24"><path d="M19 0h-14c-2.76 0-5 2.24-5 5v14c0 2.76 2.24 5 5 5h14c2.76 0 5-2.24 5-5v-14c0-2.76-2.24-5-5-5zm-11 19h-3v-10h3v10zm-1.5-11.28c-.97 0-1.75-.79-1.75-1.75s.78-1.75 1.75-1.75 1.75.79 1.75 1.75-.78 1.75-1.75 1.75zm15.5 11.28h-3v-5.6c0-1.34-.03-3.07-1.87-3.07-1.87 0-2.16 1.46-2.16 2.97v5.7h-3v-10h2.88v1.36h.04c.4-.75 1.38-1.54 2.84-1.54 3.04 0 3.6 2 3.6 4.59v5.59z"/></svg>
                </a>
                <a href="https://twitter.com/yourprofile" aria-label="Twitter" target="_blank" rel="noopener noreferrer">
                  <svg width="24" height="24" fill="currentColor" viewBox="0 0 24 24"><path d="M22.46 6c-.77.35-1.6.59-2.47.7a4.3 4.3 0 001.88-2.37 8.59 8.59 0 01-2.72 1.04 4.28 4.28 0 00-7.29 3.9A12.13 12.13 0 013 4.8a4.28 4.28 0 001.32 5.71c-.7-.02-1.36-.21-1.94-.53v.05a4.28 4.28 0 003.43 4.19c-.33.09-.68.14-1.04.14-.25 0-.5-.02-.74-.07a4.29 4.29 0 004 2.98A8.6 8.6 0 012 19.54a12.13 12.13 0 006.56 1.92c7.88 0 12.2-6.53 12.2-12.2 0-.19-.01-.38-.02-.57A8.72 8.72 0 0024 4.59a8.48 8.48 0 01-2.54.7z"/></svg>
                </a>
              </div>
            </div>
          </footer>
        </Router>
      </AuthProvider>
    </ThemeContext.Provider>
  );
}
function LoginLanding() {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [formData, setFormData] = useState({
    accountType: "",
    email: "",
    password: ""
  });
  const [message, setMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    // Clear any previous messages when user starts typing
    if (message) setMessage("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.accountType) {
      setMessage("Please select an account type");
      return;
    }

    setIsLoading(true);
    setMessage("");

    try {
      if (formData.accountType === "admin") {
        // Admin login
        const response = await fetch("http://localhost:8081/api/admin/login", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            email: formData.email,
            password: formData.password
          })
        });

        if (response.ok) {
          const data = await response.json();
          // Store admin data as per AdminLogin.js
          localStorage.setItem("adminId", data.userID);
          localStorage.setItem("adminName", data.userName);
          
          // Update auth context
          login('admin');
          
          setMessage("Admin login successful! Redirecting...");
          setTimeout(() => {
            navigate("/admin-dashboard");
          }, 800);
        } else {
          setMessage("Admin login failed. Please check your credentials.");
        }
      } else {
        // Regular user login using axios like RegularUserLogin.js
        const response = await axios.post("http://localhost:8081/api/regularUser/login", {
          email: formData.email,
          password: formData.password
        });

        // Store user data as per RegularUserLogin.js
        if (response.data && response.data.userName) {
          localStorage.setItem("regularUserName", response.data.userName);
        } else {
          localStorage.setItem("regularUserName", formData.email);
        }
        if (response.data && response.data.userID) {
          localStorage.setItem("regularUserId", response.data.userID);
        }

        // Update auth context
        login('user');

        setMessage("User login successful! Redirecting...");
        setTimeout(() => {
          navigate('/user-dashboard');
        }, 800);
      }
    } catch (error) {
      console.error("Login error:", error);
      if (formData.accountType === "user") {
        // Handle axios error format for regular user
        if (error.response) {
          setMessage(`Error: ${error.response.status} - ${error.response.statusText}`);
        } else {
          setMessage("Error connecting to server");
        }
      } else {
        setMessage("Network error. Please try again later.");
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="modern-login-bg">
      <div className="modern-login-container">
        <div className="modern-login-card">
          <div className="modern-login-header">
            <h1 className="modern-login-title">Welcome Back</h1>
            <p className="modern-login-subtitle">Sign in to your Budget Buddy account</p>
          </div>
          
          <form className="modern-login-form" onSubmit={handleSubmit}>
            <div className="form-group">
              <label className="form-label">Account Type</label>
              <select 
                name="accountType"
                className="form-select"
                value={formData.accountType}
                onChange={handleChange}
                required
              >
                <option value="">Select account type</option>
                <option value="user">User</option>
                <option value="admin">Admin</option>
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
            
            <button type="submit" className="modern-login-btn" disabled={isLoading}>
              {isLoading ? "Signing In..." : 
               formData.accountType === "admin" ? "Sign In as Admin" :
               formData.accountType === "user" ? "Sign In as User" : "Sign In"}
            </button>
            
            {message && (
              <p className={`login-message ${message.includes('successful') ? '' : 'error-message'}`}>
                {message}
              </p>
            )}
            
            <div className="login-links">
              <a href="#" className="forgot-password-link">Forgot your password?</a>
              <p className="signup-prompt">
                Don't have an account? <a href="/signup" className="signup-link">Sign up</a>
              </p>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

function SignupLanding() {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [formData, setFormData] = useState({
    accountType: "",
    userName: "",
    email: "",
    password: "",
    adminCode: "" // Only for admin signup
  });
  const [message, setMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    // Clear any previous messages when user starts typing
    if (message) setMessage("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.accountType) {
      setMessage("Please select an account type");
      return;
    }

    setIsLoading(true);
    setMessage("");

    try {
      if (formData.accountType === "admin") {
        // Admin signup
        const response = await fetch("http://localhost:8081/api/admin/create", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            userName: formData.userName,
            email: formData.email,
            password: formData.password,
            adminCode: formData.adminCode,
            userID: "" // As per AdminSignup.js
          })
        });

        if (response.ok) {
          const data = await response.json();
          // Store admin data as per AdminSignup.js
          localStorage.setItem("adminId", data.userID);
          localStorage.setItem("adminName", data.userName);
          
          // Update auth context
          login('admin');
          
          setMessage("Admin created successfully! Redirecting...");
          setTimeout(() => {
            navigate("/admin-dashboard");
          }, 800);
        } else {
          setMessage("Failed to create admin account.");
        }
      } else {
        // Regular user signup using axios like RegularUserSignUp.js
        const response = await axios.post("http://localhost:8081/api/regularUser/create", {
          userName: formData.userName,
          email: formData.email,
          password: formData.password
        });

        // Update auth context for user
        login('user');

        setMessage("User created successfully! Redirecting...");
        setTimeout(() => {
          navigate("/user-dashboard");
        }, 800);
      }
    } catch (error) {
      console.error("Signup error:", error);
      if (formData.accountType === "user") {
        // Handle axios error format for regular user
        if (error.response) {
          setMessage(`Error: ${error.response.status} - ${error.response.statusText}`);
        } else {
          setMessage("Error connecting to server");
        }
      } else {
        setMessage("Error connecting to server");
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="modern-login-bg">
      <div className="modern-login-container">
        <div className="modern-login-card">
          <div className="modern-login-header">
            <h1 className="modern-login-title">Create Account</h1>
            <p className="modern-login-subtitle">Join Budget Buddy today</p>
          </div>
          
          <form className="modern-login-form" onSubmit={handleSubmit}>
            <div className="form-group">
              <label className="form-label">Account Type</label>
              <select 
                name="accountType"
                className="form-select"
                value={formData.accountType}
                onChange={handleChange}
                required
              >
                <option value="">Select account type</option>
                <option value="user">User</option>
                <option value="admin">Admin</option>
              </select>
            </div>
            
            <div className="form-group">
              <label className="form-label">Username</label>
              <input
                name="userName"
                className="form-input"
                type="text"
                placeholder="Enter your username"
                value={formData.userName}
                onChange={handleChange}
                required
              />
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
            
            {formData.accountType === "admin" && (
              <div className="form-group">
                <label className="form-label">Admin Code</label>
                <input
                  name="adminCode"
                  className="form-input"
                  type="text"
                  placeholder="Enter admin access code"
                  value={formData.adminCode}
                  onChange={handleChange}
                  required
                />
              </div>
            )}
            
            <button type="submit" className="modern-login-btn" disabled={isLoading}>
              {isLoading ? "Creating Account..." : 
               formData.accountType === "admin" ? "Create Admin Account" :
               formData.accountType === "user" ? "Create User Account" : "Create Account"}
            </button>
            
            {message && (
              <p className={`login-message ${message.includes('successful') ? '' : 'error-message'}`}>
                {message}
              </p>
            )}
            
            <div className="login-links">
              <p className="signup-prompt">
                Already have an account? <a href="/login" className="signup-link">Sign in</a>
              </p>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

export default App;
