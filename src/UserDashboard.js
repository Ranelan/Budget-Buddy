import React, { useState } from "react";
import BudgetPage from "./BudgetPage";
import "../App.css";

export default function UserDashboard() {
  const [showBudget, setShowBudget] = useState(false);

  return (
    <div className="dashboard-bg">
      <div className="dashboard-container">
        <header className="dashboard-header">
          <span className="dashboard-logo">Budget Buddy</span>
          <nav className="dashboard-nav">
            <button className="dashboard-btn" onClick={() => setShowBudget(false)}>Home</button>
            <button className="dashboard-btn" onClick={() => setShowBudget(true)}>Budget</button>
          </nav>
        </header>
        <main className="dashboard-main">
          {!showBudget ? (
            <div className="dashboard-welcome">
              <h2>Welcome, Regular User!</h2>
              <p>Track your expenses, view your budget, and manage your finances all in one place.</p>
            </div>
          ) : (
            <BudgetPage />
          )}
        </main>
        <footer className="dashboard-footer">
          <span className="footer-logo">BB</span>
        </footer>
      </div>
    </div>
  );
}
