
import React, { useState, useEffect, createContext, useContext } from 'react';
import './App.css';
import { BrowserRouter as Router, Routes, Route, Link } from "react-router-dom";
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

function Home() {
  // Smooth scroll to About section
  const handleScrollToAbout = () => {
    const aboutSection = document.querySelector('.about-section');
    if (aboutSection) {
      aboutSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };
  return (
    <div className="hero-bg">
      <section className="hero-section">
        <div className="hero-content">
          <h1 className="hero-title">Take Control of Your Financial Future</h1>
          <p className="hero-subtitle">
            Track expenses, manage budgets, and gain insights into your spending patterns with our comprehensive personal finance platform.
          </p>
          <div className="hero-cta-row">
            <Link to="/user-signup">
              <button className="hero-btn hero-btn-primary">Get Started</button>
            </Link>
            <button className="hero-btn hero-btn-outline" onClick={handleScrollToAbout}>Learn More</button>
          </div>
        </div>
        <div className="hero-image">
          <img src="/hero-dashboard-C5pyZVDE.jpg" alt="Financial Dashboard Analytics" className="hero-dashboard-img" />
        </div>
      </section>

      {/* Features Section */}
      <section className="features-section">
        <div className="features-container">
          <h2 className="features-title">Powerful Financial Management Tools</h2>
          <p className="features-subtitle">Everything you need to take control of your finances in one place</p>
          
          <div className="features-grid">
            <div className="feature-card">
              <div className="feature-icon">
                <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M12 2v20m8-10H2"/>
                </svg>
              </div>
              <h3>Transaction Tracking</h3>
              <p>Record and categorize all your income and expenses with our intuitive transaction management system.</p>
            </div>

            <div className="feature-card">
              <div className="feature-icon">
                <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M21 12a9 9 0 00-9-9 9.75 9.75 0 00-6.74 2.74L3 8"/>
                  <path d="M3 3v5h5"/>
                  <path d="M3 12a9 9 0 009 9 9.75 9.75 0 006.74-2.74L21 16"/>
                  <path d="M16 16h5v5"/>
                </svg>
              </div>
              <h3>Budget Planning</h3>
              <p>Create and monitor monthly budgets across different categories to stay on track with your financial goals.</p>
            </div>

            <div className="feature-card">
              <div className="feature-icon">
                <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M22 12h-4l-3 9L9 3l-3 9H2"/>
                </svg>
              </div>
              <h3>Goal Setting</h3>
              <p>Set savings goals and track your progress with visual indicators and milestone celebrations.</p>
            </div>

            <div className="feature-card">
              <div className="feature-icon">
                <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M9 11H5a2 2 0 00-2 2v7a2 2 0 002 2h14a2 2 0 002-2v-7a2 2 0 00-2-2h-4M9 11V9a3 3 0 116 0v2M9 11h6"/>
                </svg>
              </div>
              <h3>Secure Management</h3>
              <p>Your financial data is protected with bank-level security and encrypted storage for peace of mind.</p>
            </div>

            <div className="feature-card">
              <div className="feature-icon">
                <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <rect x="3" y="4" width="18" height="18" rx="2" ry="2"/>
                  <line x1="16" y1="2" x2="16" y2="6"/>
                  <line x1="8" y1="2" x2="8" y2="6"/>
                  <line x1="3" y1="10" x2="21" y2="10"/>
                </svg>
              </div>
              <h3>Recurring Transactions</h3>
              <p>Automate recurring income and expenses to simplify your financial tracking and planning.</p>
            </div>

            <div className="feature-card">
              <div className="feature-icon">
                <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M4 15s1-1 4-1 5 2 8 2 4-1 4-1V3s-1 1-4 1-5-2-8-2-4 1-4 1z"/>
                  <line x1="4" y1="22" x2="4" y2="15"/>
                </svg>
              </div>
              <h3>Category Management</h3>
              <p>Organize your expenses with custom categories and get insights into your spending patterns.</p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}


function App() {
  const [theme, setTheme] = useState(() => localStorage.getItem('theme') || 'dark');
  useEffect(() => {
    document.body.setAttribute('data-theme', theme);
    localStorage.setItem('theme', theme);
  }, [theme]);

  // Scroll detection for sticky navigation
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      const scrollTop = window.scrollY;
      setIsScrolled(scrollTop > 50);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const toggleTheme = () => setTheme(theme === 'dark' ? 'light' : 'dark');

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme }}>
      <Router>
        <header role="banner">
          <nav className={`main-nav ${isScrolled ? 'scrolled' : ''}`} role="navigation" aria-label="Main navigation">
            <div className="nav-content">
              <div className="nav-logo">
                <Link to="/" className="logo-text-link">
                  <span className="logo-svg" aria-label="Budget Buddy Icon" style={{display:'flex',alignItems:'center',marginRight:'0.5em'}}>
                    <svg width="40" height="40" viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <rect x="6" y="10" width="44" height="44" rx="10" stroke="#4299e1" strokeWidth="4" fill="none"/>
                      <rect x="38" y="24" width="14" height="16" rx="4" stroke="#4299e1" strokeWidth="4" fill="none"/>
                      <circle cx="22" cy="28" r="2.5" fill="#4299e1"/>
                      <circle cx="34" cy="28" r="2.5" fill="#4299e1"/>
                      <path d="M24 36c1.5 2 6.5 2 8 0" stroke="#4299e1" strokeWidth="2.5" strokeLinecap="round"/>
                    </svg>
                  </span>
                  <span className="logo-text">Budget <span className="logo-text-highlight">Buddy</span></span>
                </Link>
              </div>
              <ul className="nav-links-right">
                <li><Link to="/">Home</Link></li>
                <li><Link to="/about">About</Link></li>
                <li><Link to="/contact">Contact</Link></li>
                <li><Link to="/login">Login</Link></li>
              </ul>
            </div>
          </nav>
        </header>
        <main id="main-content" tabIndex="-1" role="main">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/about" element={<About />} />
            <Route path="/contact" element={<Contact />} />
            <Route path="/admin-dashboard" element={<AdminDashboard />} />
            <Route path="/admin-signup" element={<AdminSignup />} />
            <Route path="/admin-login" element={<AdminLogin />} />
            <Route path="/user-signup" element={<RegularUserSignUp />} />
            <Route path="/signup" element={<SignupLanding />} />
            <Route path="/login" element={<LoginLanding />} />
            <Route path="/user-dashboard/*" element={<UserDashboard />} />
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
    </ThemeContext.Provider>
  );
}
function LoginLanding() {
  const navigate = useNavigate();
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
