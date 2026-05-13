// src/pages/LoginPage.jsx
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import gifSrc from "../assets/finance.gif";
import "../styles/Login.css";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errors, setErrors] = useState({});
  const navigate = useNavigate();

  const validate = () => {
    const newErrors = {};
    if (!email) {
      newErrors.email = "Email is required";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      newErrors.email = "Invalid email format";
    }
    if (!password) {
      newErrors.password = "Password is required";
    } else if (password.length < 6) {
      newErrors.password = "Password must be at least 6 characters";
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;

    try {
      const res = await fetch("http://localhost:5000/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();
      if (res.ok) {
        localStorage.setItem("token", data.token);
        navigate("/dashboard");
      } else {
        setErrors({ apiError: data.message || "Invalid credentials" });
      }
    } catch (err) {
  console.error(err); // Log it for debugging
  setErrors({ apiError: "Server error, try again later." });
}
  };

  return (
    <>
      <nav className="navbar">
        <a className="navbar-logo" href="/">💰 Digital Wallet Tracker</a>
        <div className="navbar-links">
          <a href="/">Home</a>
          <a href="/about">About</a>
          <a href="/contact">Contact Us</a>
        </div>
      </nav>

      <main className="page-content">
        <div className="finance-card">
          <div className="finance-card-left">
            <img src={gifSrc} alt="Finance illustration" className="finance-gif" />
          </div>
          <div className="finance-card-right">
            <div className="form-card">
              <h2>Sign In</h2>
              <form onSubmit={handleSubmit}>
                <input
                  type="email"
                  placeholder="Email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className={errors.email ? "error-input" : ""}
                />
                {errors.email && <p className="error-text">{errors.email}</p>}

                <input
                  type="password"
                  placeholder="Password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className={errors.password ? "error-input" : ""}
                />
                {errors.password && <p className="error-text">{errors.password}</p>}

                {errors.apiError && <p className="error-text">{errors.apiError}</p>}

                <button type="submit" className="btn-green">Login</button>
              </form>
              <p className="login-text">
                Don’t have an account?{" "}
                <a className="login-link" href="/register">Register here</a>
              </p>
            </div>
          </div>
        </div>
      </main>
    </>
  );
}
