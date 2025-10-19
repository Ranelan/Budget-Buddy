import React from "react";
import { Routes, Route, useNavigate, useLocation } from "react-router-dom";
import BudgetPage from "./Screens/BudgetPage";
import GoalPage from "./Screens/GoalPage";
import Profile from "./Screens/Profile";
import Category from "./Category";
import RecurringTransaction from "./RecurringTransaction";
import TransactionPage from "./TransactionPage";
import AIFinancialTips from "./components/AIFinancialTips";
import "./App.css";


function HomeContent() {
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
    <main className="dashboard-main">
        {/* Welcome Section */}
        <section className="welcome-section">
          <h1 className="welcome-title">
            Welcome back, <span>{userName}</span>! 
          </h1>
          <p className="welcome-subtitle">
            Manage your finances with ease and confidence
          </p>
        </section>

        {/* Dashboard Cards */}
        <section className="cards-section">
          <div className="cards-grid">
            {dashboardCards.map((card, index) => (
              <div 
                key={index}
                className="feature-card" 
                onClick={() => navigate(card.path)}
              >
                <div className="card-header">
                  <div className="card-icon">
                    <i className={card.icon}></i>
                  </div>
                  <i className="fas fa-arrow-right card-arrow"></i>
                </div>
                <div className="card-body">
                  <h3 className="card-title">{card.title}</h3>
                  <p className="card-description">{card.description}</p>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* AI Tips Section */}
        <section className="ai-section">
          <AIFinancialTips />
        </section>
    </main>
  );
}

export default function UserDashboard() {
  const location = useLocation();

  return (
    <div className="user-dashboard-wrapper">
      <div className="clean-dashboard">
        <div className="dashboard-content">
          <Routes>
            <Route index element={<HomeContent />} />
            <Route path="home" element={<HomeContent />} />
            <Route path="budget" element={<BudgetPage />} />
            <Route path="goal" element={<GoalPage />} />
            <Route path="profile" element={<Profile />} />
            <Route path="transaction" element={<TransactionPage />} />
            <Route path="category" element={<Category />} />
            <Route path="recurring" element={<RecurringTransaction />} />
            <Route path="*" element={<HomeContent />} />
          </Routes>
        </div>
      </div>
    </div>
  );
}
