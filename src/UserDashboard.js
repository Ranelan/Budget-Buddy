import React from "react";
import { Routes, Route, Link, useLocation, useNavigate } from "react-router-dom";
import BudgetPage from "./Screens/BudgetPage";
import GoalPage from "./Screens/GoalPage";
import Profile from "./Screens/Profile";
import Category from "./Category";
import RecurringTransaction from "./RecurringTransaction";
import TransactionPage from "./TransactionPage";
import AIFinancialTips from "./components/AIFinancialTips";
import "./App.css";

// Dashboard Navigation Component
function DashboardNav({ currentPage }) {
  const navigate = useNavigate();

  const navItems = [
    { path: "/user-dashboard/home", label: "Home", icon: "fas fa-home" },
    { path: "/user-dashboard/budget", label: "Budget", icon: "fas fa-chart-pie" },
    { path: "/user-dashboard/goal", label: "Goals", icon: "fas fa-bullseye" },
    { path: "/user-dashboard/transaction", label: "Transactions", icon: "fas fa-exchange-alt" },
    { path: "/user-dashboard/recurring", label: "Recurring", icon: "fas fa-sync-alt" },
    { path: "/user-dashboard/category", label: "Categories", icon: "fas fa-tags" },
    { path: "/user-dashboard/profile", label: "Profile", icon: "fas fa-user-cog" }
  ];

  return (
    <nav className="dashboard-nav">
      <div className="dashboard-nav-container">
        {navItems.map((item) => (
          <button
            key={item.path}
            className={`dashboard-nav-item ${currentPage === item.path ? 'active' : ''}`}
            onClick={() => navigate(item.path)}
          >
            <i className={item.icon}></i>
            <span>{item.label}</span>
          </button>
        ))}
      </div>
    </nav>
  );
}

function Home() {
  const userName = localStorage.getItem("regularUserName") || "User";
  const navigate = useNavigate();

  const dashboardCards = [
    {
      title: "Budget Overview",
      description: "View and manage your monthly budgets with smart insights.",
      path: "/user-dashboard/budget",
      icon: "fas fa-chart-pie",
      color: "var(--primary)"
    },
    {
      title: "Financial Goals",
      description: "Set and track your savings and financial milestones.",
      path: "/user-dashboard/goal",
      icon: "fas fa-bullseye",
      color: "var(--success)"
    },
    {
      title: "Transactions", 
      description: "Track all your income and expenses in one place.",
      path: "/user-dashboard/transaction",
      icon: "fas fa-exchange-alt",
      color: "var(--secondary)"
    },
    {
      title: "Recurring Payments",
      description: "Monitor subscriptions and automated transactions.",
      path: "/user-dashboard/recurring",
      icon: "fas fa-sync-alt",
      color: "var(--warning)"
    },
    {
      title: "Categories",
      description: "Organize expenses with smart categorization.",
      path: "/user-dashboard/category",
      icon: "fas fa-tags",
      color: "var(--info)"
    },
    {
      title: "Profile Settings",
      description: "Customize your account and preferences.",
      path: "/user-dashboard/profile",
      icon: "fas fa-user-cog",
      color: "var(--muted-foreground)"
    }
  ];

  return (
    <div className="professional-dashboard">
      <DashboardNav currentPage="/user-dashboard/home" />
      
      <div className="dashboard-container">
        <div className="dashboard-hero fade-in">
          <div className="dashboard-hero-content">
            <h1 className="dashboard-title">
              Welcome back, <span className="text-primary">{userName}</span>! 💼
            </h1>
            <p className="dashboard-subtitle">
              Take control of your financial future with AI-powered insights and smart budgeting tools.
            </p>
          </div>
        </div>

        <div className="dashboard-grid slide-up">
          {dashboardCards.map((card, index) => (
            <div 
              key={index}
              className="dashboard-card" 
              onClick={() => navigate(card.path)}
              style={{ animationDelay: `${index * 0.1}s` }}
            >
              <div className="dashboard-card-icon">
                <i className={card.icon}></i>
              </div>
              <div className="dashboard-card-content">
                <h3 className="dashboard-card-title">{card.title}</h3>
                <p className="dashboard-card-description">{card.description}</p>
              </div>
              <div className="dashboard-card-arrow">
                <i className="fas fa-arrow-right"></i>
              </div>
            </div>
          ))}
        </div>

        {/* AI Financial Tips Section */}
        <div className="fade-in" style={{ animationDelay: '0.8s' }}>
          <AIFinancialTips />
        </div>
      </div>
    </div>
  );
}

export default function UserDashboard() {
  const location = useLocation();

  return (
    <div className="user-dashboard-wrapper">
      <Routes>
        <Route path="home" element={<Home />} />
        <Route path="budget" element={<BudgetPage />} />
        <Route path="goal" element={<GoalPage />} />
        <Route path="profile" element={<Profile />} />
        <Route path="transaction" element={<TransactionPage />} />
        <Route path="category" element={<Category />} />
        <Route path="recurring" element={<RecurringTransaction />} />
        <Route path="*" element={<Home />} />
      </Routes>
    </div>
  );
}
