import React from "react";

export default function AboutPage() {
  const navbarStyle = {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    padding: "15px 40px",
    backgroundColor: "#2e7d32", // teal-green shade
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

  const containerStyle = {
    minHeight: "100vh",
    backgroundColor: "white",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    padding: "40px",
  };

  const titleStyle = {
    fontSize: "2.5rem",
    fontWeight: "bold",
    marginBottom: "20px",
    color: "#065f46",
    textAlign: "center",
  };

  const textStyle = {
    fontSize: "1.125rem",
    color: "#374151",
    maxWidth: "800px",
    textAlign: "center",
    lineHeight: "1.6",
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
            href="/contact"
            style={linkStyle}
            onMouseEnter={(e) => linkHover(e, true)}
            onMouseLeave={(e) => linkHover(e, false)}
          >
            Contact Us
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

      {/* About Section */}
      <div style={containerStyle}>
        <h2 style={titleStyle}>About Us</h2>
        <p style={textStyle}>
          Digital Wallet Tracker is your trusted tool for managing finances effortlessly.
          Our mission is to empower individuals with clear, actionable insights into their
          spending and saving habits, helping them achieve their financial goals.
        </p>
      </div>
    </>
  );
}
