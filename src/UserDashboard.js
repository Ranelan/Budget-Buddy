// import React from "react";
// import { Routes, Route, Link, useLocation } from "react-router-dom";
// import BudgetPage from "./Screens/BudgetPage";
// import GoalPage from "./Screens/GoalPage";
// import Profile from "./Screens/Profile";
// import Category from "./Category"
// import "./App.css";

// function DashboardHome() {
//   const userName = localStorage.getItem("regularUserName") || "Regular User";
//   return (
//     <div style={{ width: "100%", display: "flex", flexDirection: "column", alignItems: "center", gap: "2em" }}>
//       <div className="dashboard-welcome" style={{ background: "#232a36", borderRadius: "24px", boxShadow: "0 4px 24px rgba(0,0,0,0.10)", padding: "2em 3em", textAlign: "center", width: "100%", maxWidth: "500px" }}>
//         <h2 style={{ color: "#2196f3", fontWeight: 700, fontSize: "2.2em" }}>Welcome, {userName}!</h2>
//         <p style={{ color: "#b0b3b8", fontSize: "1.2em" }}>
//           Track your expenses, view your budget, and manage your finances all in one place.
//         </p>
//       </div>
//       <div style={{ display: "flex", gap: "2em", width: "100%", justifyContent: "center" }}>
//         <div style={{ background: "#232a36", borderRadius: "18px", boxShadow: "0 2px 12px rgba(33,150,243,0.10)", padding: "1.5em 2em", minWidth: "180px", textAlign: "center" }}>
//           <div style={{ fontSize: "2em", color: "#2196f3", marginBottom: "0.5em" }}>
//             <i className="fas fa-wallet" />
//           </div>
//           <div style={{ fontWeight: 700, fontSize: "1.1em" }}>Budget Overview</div>
//           <div style={{ color: "#b0b3b8", fontSize: "0.95em" }}>View and manage your monthly budgets.</div>
//         </div>
//         <div style={{ background: "#232a36", borderRadius: "18px", boxShadow: "0 2px 12px rgba(33,150,243,0.10)", padding: "1.5em 2em", minWidth: "180px", textAlign: "center" }}>
//           <div style={{ fontSize: "2em", color: "#2196f3", marginBottom: "0.5em" }}>
//             <i className="fas fa-bullseye" />
//           </div>
//           <div style={{ fontWeight: 700, fontSize: "1.1em" }}>Goals</div>
//           <div style={{ color: "#b0b3b8", fontSize: "0.95em" }}>Set and track your financial goals.</div>
//         </div>
//       </div>
//     </div>
//   );
// }

// export default function UserDashboard() {
//   const location = useLocation();
//   return (
//     <div className="dashboard-bg">
//       <div className="dashboard-container" style={{ flexDirection: "row", gap: "2em" }}>
//         {/* Sidebar Navigation */}
//         <aside className="dashboard-sidebar">
//           <div className="dashboard-sidebar-title">Menu</div>
//           <Link to="" className={`dashboard-sidebar-link${location.pathname.endsWith("/user-dashboard") ? " active" : ""}`}>Home</Link>
//           <Link to="budget" className={`dashboard-sidebar-link${location.pathname.includes("budget") ? " active" : ""}`}>Budget</Link>
//           <Link to="goal" className={`dashboard-sidebar-link${location.pathname.includes("goal") ? " active" : ""}`}>Goals</Link>
//           <Link to="profile" className={`dashboard-sidebar-link${location.pathname.includes("profile") ? " active" : ""}`}>Profile</Link>
//         </aside>

//         {/* Main Content */}
//         <section className="dashboard-content">
//           <Routes>
//             <Route index element={<DashboardHome />} />
//             <Route path="budget" element={<BudgetPage />} />
//             <Route path="goal" element={<GoalPage />} />
//             <Route path="profile" element={<Profile />} />
//           </Routes>
//         </section>
//       </div>
//     </div>
//   );
// }



import React from "react";
import { Routes, Route, Link, useLocation } from "react-router-dom";
import BudgetPage from "./Screens/BudgetPage";
import GoalPage from "./Screens/GoalPage";
import Profile from "./Screens/Profile";
import Category from "./Category";
import "./App.css";

function DashboardHome() {
  const userName = localStorage.getItem("regularUserName") || "Regular User";
  return (
    <div style={{ width: "100%", display: "flex", flexDirection: "column", alignItems: "center", gap: "2em" }}>
      <div className="dashboard-welcome" style={{ background: "#232a36", borderRadius: "24px", boxShadow: "0 4px 24px rgba(0,0,0,0.10)", padding: "2em 3em", textAlign: "center", width: "100%", maxWidth: "500px" }}>
        <h2 style={{ color: "#2196f3", fontWeight: 700, fontSize: "2.2em" }}>Welcome, {userName}!</h2>
        <p style={{ color: "#b0b3b8", fontSize: "1.2em" }}>
          Track your expenses, view your budget, and manage your finances all in one place.
        </p>
      </div>
      <div style={{ display: "flex", gap: "2em", width: "100%", justifyContent: "center", flexWrap: "wrap" }}>
        <div style={{ background: "#232a36", borderRadius: "18px", boxShadow: "0 2px 12px rgba(33,150,243,0.10)", padding: "1.5em 2em", minWidth: "180px", textAlign: "center", cursor: "pointer" }} onClick={() => window.location.href = "/user-dashboard/budget"}>
          <div style={{ fontSize: "2em", color: "#2196f3", marginBottom: "0.5em" }}>
            <i className="fas fa-wallet" />
          </div>
          <div style={{ fontWeight: 700, fontSize: "1.1em" }}>Budget Overview</div>
          <div style={{ color: "#b0b3b8", fontSize: "0.95em" }}>View and manage your monthly budgets.</div>
        </div>
        <div style={{ background: "#232a36", borderRadius: "18px", boxShadow: "0 2px 12px rgba(33,150,243,0.10)", padding: "1.5em 2em", minWidth: "180px", textAlign: "center", cursor: "pointer" }} onClick={() => window.location.href = "/user-dashboard/category"}>
          <div style={{ fontSize: "2em", color: "#2196f3", marginBottom: "0.5em" }}>
            <i className="fas fa-folder" />
          </div>
          <div style={{ fontWeight: 700, fontSize: "1.1em" }}>Categories</div>
          <div style={{ color: "#b0b3b8", fontSize: "0.95em" }}>Manage your expense categories.</div>
        </div>
        <div style={{ background: "#232a36", borderRadius: "18px", boxShadow: "0 2px 12px rgba(33,150,243,0.10)", padding: "1.5em 2em", minWidth: "180px", textAlign: "center", cursor: "pointer" }} onClick={() => window.location.href = "/user-dashboard/goal"}>
          <div style={{ fontSize: "2em", color: "#2196f3", marginBottom: "0.5em" }}>
            <i className="fas fa-bullseye" />
          </div>
          <div style={{ fontWeight: 700, fontSize: "1.1em" }}>Goals</div>
          <div style={{ color: "#b0b3b8", fontSize: "0.95em" }}>Set and track your financial goals.</div>
        </div>
      </div>
    </div>
  );
}

function CategoriesPage() {
  return (
    <div style={{ width: "100%", padding: "20px" }}>
      <Category role="user" />
    </div>
  );
}

export default function UserDashboard() {
  const location = useLocation();
  
  return (
    <div className="dashboard-bg">
      <div className="dashboard-container" style={{ flexDirection: "row", gap: "2em" }}>
        {/* Sidebar Navigation */}
        <aside className="dashboard-sidebar">
          <div className="dashboard-sidebar-title">Menu</div>
          <Link to="" className={`dashboard-sidebar-link${location.pathname.endsWith("/user-dashboard") ? " active" : ""}`}>
            <i className="fas fa-home" style={{ marginRight: "10px" }}></i>
            Home
          </Link>
          <Link to="budget" className={`dashboard-sidebar-link${location.pathname.includes("budget") ? " active" : ""}`}>
            <i className="fas fa-wallet" style={{ marginRight: "10px" }}></i>
            Budget
          </Link>
          <Link to="category" className={`dashboard-sidebar-link${location.pathname.includes("category") ? " active" : ""}`}>
            <i className="fas fa-folder" style={{ marginRight: "10px" }}></i>
            Categories
          </Link>
          <Link to="goal" className={`dashboard-sidebar-link${location.pathname.includes("goal") ? " active" : ""}`}>
            <i className="fas fa-bullseye" style={{ marginRight: "10px" }}></i>
            Goals
          </Link>
          <Link to="profile" className={`dashboard-sidebar-link${location.pathname.includes("profile") ? " active" : ""}`}>
            <i className="fas fa-user" style={{ marginRight: "10px" }}></i>
            Profile
          </Link>
        </aside>

        {/* Main Content */}
        <section className="dashboard-content" style={{ flex: 1, minHeight: "80vh" }}>
          <Routes>
            <Route index element={<DashboardHome />} />
            <Route path="budget" element={<BudgetPage />} />
            <Route path="category" element={<CategoriesPage />} />
            <Route path="goal" element={<GoalPage />} />
            <Route path="profile" element={<Profile />} />
          </Routes>
        </section>
      </div>
    </div>
  );
}