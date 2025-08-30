import React, { useState } from "react";
import "./App.css";
import axios from "axios";

const API_URL = "http://localhost:8081/api/regularUser";

function RegularUserLogin() {
  const [formData, setFormData] = useState({
    //username: "",
    email: "",
    password: ""
  });

  const [message, setMessage] = useState(""); // Success/error messages

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.post(`${API_URL}/login`, {
  //userName: formData.username,
  email: formData.email,
  password: formData.password
});
      setMessage("User Login successful!");
      console.log("Login:", response.data);
    } catch (error) {
      if (error.response) {
        setMessage(`Error: ${error.response.status} - ${error.response.statusText}`);
      } else {
        setMessage("Error connecting to server");
      }
      console.error(error);
    }
  };

  return (
    <div className="signup-bg">
      <div className="signup-container">
        <div className="signup-header">
          <span className="signup-appdot"></span>
          <span className="signup-appname">BudgetBuddy</span>
        </div>
        <div className="signup-content">
          <form className="signup-form" onSubmit={handleSubmit}>
            
            <input
              name="email"
              className="signup-input"
              type="email"
              placeholder="Email"
              value={formData.email}
              onChange={handleChange}
              required
            />
            <input
              name="password"
              className="signup-input signup-input-password"
              type="password"
              placeholder="Password"
              value={formData.password}
              onChange={handleChange}
              required
            />
            <div className="signup-btn-row">
              <button type="submit" className="signup-btn signup-btn-blue">Login</button>
              <button type="button" className="signup-btn signup-btn-gray" onClick={() => setFormData({ username: "", email: "", password: "" })}>Cancel</button>
            </div>
            {message && <p style={{ marginTop: "1em", color: "#ffd700" }}>{message}</p>}
          </form>
        </div>
      </div>
    </div>
  );
}

export default RegularUserLogin;