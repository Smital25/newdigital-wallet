import React, { useState } from "react";

export default function ContactPage() {
  const [form, setForm] = useState({ name: "", email: "", message: "" });

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log("Contact Form Submitted:", form);
    alert("Message sent! We'll get back to you soon.");
  };

  // Navbar styles
  const navbarStyle = {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    padding: "15px 40px",
    backgroundColor: "#2e7d32",
    color: "white",
    position: "sticky",
    top: 0,
    zIndex: 1000,
  };

  const logoStyle = {
    fontSize: "1.5rem",
    fontWeight: "bold",
    cursor: "pointer",
    display: "flex",
    alignItems: "center",
    gap: "8px",
  };

  const navLinksStyle = {
    display: "flex",
    gap: "20px",
    alignItems: "center",
  };

  const linkStyle = {
    color: "white",
    textDecoration: "none",
    fontSize: "1rem",
    fontWeight: 500,
    transition: "color 0.3s ease",
  };

  const linkHover = (e, hover) => {
    e.target.style.color = hover ? "#bbf7d0" : "white";
  };

  // Page container styles
  const containerStyle = {
    minHeight: "100vh",
    backgroundColor: "#f9fafb",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    padding: "40px",
  };

  const titleStyle = {
    fontSize: "2.5rem",
    fontWeight: "bold",
    marginBottom: "20px",
    color: "#2e7d32",
    textAlign: "center",
  };

  const formStyle = {
    backgroundColor: "white",
    padding: "30px",
    borderRadius: "12px",
    boxShadow: "0 4px 20px rgba(0, 0, 0, 0.1)",
    width: "100%",
    maxWidth: "500px",
    display: "flex",
    flexDirection: "column",
    gap: "15px",
  };

  const inputStyle = {
    padding: "10px 14px",
    border: "1px solid #2e7d32",
    borderRadius: "8px",
    fontSize: "1rem",
  };

  const buttonStyle = {
    backgroundColor: "#2e7d32",
    color: "white",
    padding: "12px",
    border: "none",
    borderRadius: "8px",
    fontSize: "1rem",
    fontWeight: 500,
    cursor: "pointer",
    transition: "background-color 0.3s ease",
  };

  return (
    <>
      {/* Navbar */}
      <nav style={navbarStyle}>
        <div style={logoStyle} onClick={() => (window.location.href = "/")}>
          💰 Digital Wallet Tracker
        </div>
        <div style={navLinksStyle}>
          <a
            href="/"
            style={linkStyle}
            onMouseEnter={(e) => linkHover(e, true)}
            onMouseLeave={(e) => linkHover(e, false)}
          >
            Home
          </a>
          <a
            href="/about"
            style={linkStyle}
            onMouseEnter={(e) => linkHover(e, true)}
            onMouseLeave={(e) => linkHover(e, false)}
          >
            About
          </a>
          <a
            href="/login"
            style={linkStyle}
            onMouseEnter={(e) => linkHover(e, true)}
            onMouseLeave={(e) => linkHover(e, false)}
          >
            Login
          </a>
          <a
            href="/register"
            style={linkStyle}
            onMouseEnter={(e) => linkHover(e, true)}
            onMouseLeave={(e) => linkHover(e, false)}
          >
            Register
          </a>
        </div>
      </nav>

      {/* Contact Page */}
      <div style={containerStyle}>
        <h2 style={titleStyle}>Contact Us</h2>
        <form onSubmit={handleSubmit} style={formStyle}>
          <input
            name="name"
            placeholder="Your Name"
            value={form.name}
            onChange={handleChange}
            style={inputStyle}
            required
          />
          <input
            type="email"
            name="email"
            placeholder="Your Email"
            value={form.email}
            onChange={handleChange}
            style={inputStyle}
            required
          />
          <textarea
            name="message"
            placeholder="Your Message"
            rows="4"
            value={form.message}
            onChange={handleChange}
            style={{ ...inputStyle, resize: "none" }}
            required
          />
          <button
            type="submit"
            style={buttonStyle}
            onMouseEnter={(e) => (e.target.style.backgroundColor = "#2e7d32")}
            onMouseLeave={(e) => (e.target.style.backgroundColor = "#2e7d32")}
          >
            Send Message
          </button>
        </form>
      </div>
    </>
  );
}
