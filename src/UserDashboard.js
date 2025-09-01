import React from "react";
import { Routes, Route, Link, useLocation, useNavigate } from "react-router-dom";
import BudgetPage from "./Screens/BudgetPage";
import GoalPage from "./Screens/GoalPage";
import Profile from "./Screens/Profile";
import Category from "./Category";
import RecurringTransaction from "./RecurringTransaction";

function Home() {
  const userName = localStorage.getItem("regularUserName") || "Regular User";
  const navigate = useNavigate();
  return (
    <div className="dashboard-content" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100%' }}>
      <h1 style={{ color: '#21cbf3', fontWeight: 800, fontSize: '2.2em', marginBottom: '0.5em', textAlign: 'center' }}>Welcome, {userName}!</h1>
      <p style={{ color: '#b0b3b8', fontSize: '1.2em', textAlign: 'center', marginBottom: '2em' }}>
        Track your expenses, view your budget, and manage your finances all in one place.
      </p>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '2em', justifyContent: 'center', width: '100%', maxWidth: '700px' }}>
        <div style={{ background: '#232a36', borderRadius: '18px', boxShadow: '0 2px 12px rgba(33,150,243,0.10)', padding: '2em 2.5em', textAlign: 'center' , cursor: 'pointer'}}>
          <div style={{ color: '#fff', fontWeight: 'bold', fontSize: '1.1em', marginBottom: '0.5em' }}>Budget Overview</div>
          <div onClick={() => navigate("/user-dashboard/budget")} style={{ color: '#b0b3b8', fontSize: '1em'}}>View and manage your monthly budgets.</div>
        </div>
        <div style={{ background: '#232a36', borderRadius: '18px', boxShadow: '0 2px 12px rgba(33,150,243,0.10)', padding: '2em 2.5em', textAlign: 'center', cursor: 'pointer' }}>
          <div style={{ color: '#fff', fontWeight: 'bold', fontSize: '1.1em', marginBottom: '0.5em' }}>Goals</div>
          <div onClick={() => navigate("/user-dashboard/goal")} style={{ color: '#b0b3b8', fontSize: '1em' }}>Set and track your financial goals.</div>
        </div>
<<<<<<< HEAD
        <div style={{ background: '#232a36', borderRadius: '18px', boxShadow: '0 2px 12px rgba(33,150,243,0.10)', padding: '2em 2.5em', textAlign: 'center', cursor: 'pointer' }}>
          <div style={{ color: '#fff', fontWeight: 'bold', fontSize: '1.1em', marginBottom: '0.5em' }}>Transactions</div>
          <div onClick={() => navigate("/user-dashboard/transaction")} style={{ color: '#b0b3b8', fontSize: '1em' }}>View and manage your transactions.</div>
=======
        <div style={{ background: '#232a36', borderRadius: '18px', boxShadow: '0 2px 12px rgba(33,150,243,0.10)', padding: '2em 2.5em', textAlign: 'center' }}>
          <div style={{ color: '#fff', fontWeight: 'bold', fontSize: '1.1em', marginBottom: '0.5em' }}>Recurring Transactions</div>
          <div style={{ color: '#b0b3b8', fontSize: '1em' }}>Manage your subscriptions and recurring payments.</div>
>>>>>>> 24b57531aece5246618b2f458abea51ff846044a
        </div>
        <div style={{ background: '#232a36', borderRadius: '18px', boxShadow: '0 2px 12px rgba(33,150,243,0.10)', padding: '2em 2.5em', textAlign: 'center', cursor: 'pointer' }}>
          <div style={{ color: '#fff', fontWeight: 'bold', fontSize: '1.1em', marginBottom: '0.5em' }}>Category</div>
          <div onClick={() => navigate("/user-dashboard/category")} style={{ color: '#b0b3b8', fontSize: '1em' }}>Manage your budget categories.</div>
        </div>
      </div>
    </div>
  );
}

function Transaction() {
  return (
    <div className="dashboard-content" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100%' }}>
      <h1 style={{ color: '#21cbf3', fontWeight: 800, fontSize: '2em', marginBottom: '0.5em', textAlign: 'center' }}>Transactions</h1>
      <p style={{ color: '#b0b3b8', fontSize: '1.1em', textAlign: 'center', marginBottom: '2em' }}>
        View and manage your transactions here.
      </p>
    </div>
  );
}

export default function UserDashboard() {
  const location = useLocation();
  return (
    <div className="dashboard-bg" style={{ minHeight: '100vh', background: '#181a20', display: 'flex', justifyContent: 'center', alignItems: 'center', padding: '2em 0' }}>
      <div style={{ display: 'flex', width: '100%', maxWidth: '1200px', gap: '2em', justifyContent: 'center', alignItems: 'center' }}>
        <aside className="dashboard-sidebar" style={{ minWidth: '220px', background: '#232733', borderRadius: '24px', boxShadow: '0 4px 24px rgba(0,0,0,0.15)', padding: '2em 1em', display: 'flex', flexDirection: 'column', alignItems: 'flex-start', gap: '1.5em' }}>
          <div style={{ marginBottom: '1em', fontWeight: 'bold', color: '#21cbf3', fontSize: '1.1em', letterSpacing: '1px' }}>Menu</div>
          <Link className={`dashboard-sidebar-link${location.pathname.endsWith('/home') ? ' active' : ''}`} to="home">Home</Link>
          <Link className={`dashboard-sidebar-link${location.pathname.endsWith('/budget') ? ' active' : ''}`} to="budget">Budget</Link>
          <Link className={`dashboard-sidebar-link${location.pathname.endsWith('/goal') ? ' active' : ''}`} to="goal">Goals</Link>
          <Link className={`dashboard-sidebar-link${location.pathname.endsWith('/recurring') ? ' active' : ''}`} to="recurring">Recurring Transactions</Link>
          <Link className={`dashboard-sidebar-link${location.pathname.endsWith('/transaction') ? ' active' : ''}`} to="transaction">Transaction</Link>
          <Link className={`dashboard-sidebar-link${location.pathname.endsWith('/category') ? ' active' : ''}`} to="category">Category</Link>
          <Link className={`dashboard-sidebar-link${location.pathname.endsWith('/profile') ? ' active' : ''}`} to="profile">Profile</Link>
        </aside>
        <main className="dashboard-content" style={{ flex: 1, background: '#232733', borderRadius: '24px', boxShadow: '0 4px 24px rgba(0,0,0,0.10)', padding: '2em', minHeight: '600px', color: '#fff', margin: '0 auto' }}>
          <Routes>
            <Route path="home" element={<Home />} />
            <Route path="budget" element={<BudgetPage />} />
            <Route path="goal" element={<GoalPage />} />
            <Route path="profile" element={<Profile />} />
            <Route path="transaction" element={<Transaction />} />
            <Route path="category" element={<Category />} />
            <Route path="recurring" element={<RecurringTransaction />} />
            <Route path="*" element={<Home />} />
          </Routes>
        </main>
      </div>
    </div>
  );
}