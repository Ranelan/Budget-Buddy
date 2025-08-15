
import './App.css';



import { useState } from "react";

function App() {
  const [showAdmin, setShowAdmin] = useState(false);

  if (showAdmin) {
    const AdminDashboard = require("./AdminDashboard").default;
    return <AdminDashboard />;
  }

  return (
    <div className="App">
      <header className="App-header">
        <h1 className="Landing-title">Budget Buddy</h1>
        <p className="Landing-description">
          Take control of your personal finances with ease. Track your budget, manage expenses, and plan for your future—all in one place.
        </p>
        <div className="Landing-actions">
          <a className="Landing-link" href="#login">Login</a>
          <span className="Landing-divider">|</span>
          <a className="Landing-link" href="#signup">Sign Up</a>
          <span className="Landing-divider">|</span>
          <button className="Landing-link" style={{border: "none", background: "#008080", cursor: "pointer"}} onClick={() => setShowAdmin(true)}>
            Admin Dashboard
          </button>
        </div>
      </header>
    </div>
  );
}

export default App;
