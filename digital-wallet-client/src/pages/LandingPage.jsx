import React, { useEffect } from "react";
import { Link } from "react-router-dom";
import "bootstrap/dist/css/bootstrap.min.css";
import "aos/dist/aos.css";
import AOS from "aos";
import "../styles/LandingPage.css";

// Images
import heroGif from "../assets/hero.gif";
import walletIcon from "../assets/wallet.jpg";
import categoryIcon from "../assets/category.jpg";
import savingsIcon from "../assets/savings.jpg";
import whyUsImg from "../assets/whyus.jpg";
import benefit1Img from "../assets/benefit1.jpg";
import benefit2Img from "../assets/benefit2.jpg";
import benefit3Img from "../assets/benefit3.jpg";

export default function LandingPage() {
  useEffect(() => {
    AOS.init({ duration: 1000, once: true });
  }, []);

  return (
    <div className="d-flex flex-column min-vh-100 bg-white">
      {/* Navbar */}
      <nav className="navbar navbar-expand-lg navbar-dark bg-success shadow-sm sticky-top">
        <div className="container-fluid px-4">
          <Link className="navbar-brand fw-bold text-white" to="/">
            💰 Digital Wallet Tracker
          </Link>
          <div>
            <Link to="/login" className="btn btn-outline-light me-2">
              Login
            </Link>
            <Link to="/register" className="btn btn-light text-success fw-bold">
              Register
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <main className="flex-grow-1 hero-section text-white bg-success">
  <div className="container py-5">
    <div className="row align-items-center">
      {/* Left Side Text */}
      <div className="col-md-6" data-aos="fade-right">
        <h2 className="display-4 fw-bold mb-3 text-shadow">
          Track, Save & Grow Your Money 🚀
        </h2>
        <p className="lead mb-4">
          Manage your income, expenses, and savings goals with smart analytics,
          multi-wallet support, and interactive visualizations — all in one place.
        </p>
        <Link
          to="/register"
          className="btn btn-light text-success btn-lg me-3 fw-bold hover-scale"
        >
          Get Started
        </Link>
        <Link
          to="/login"
          className="btn btn-outline-light btn-lg hover-scale"
        >
          Sign In
        </Link>
      </div>

      {/* Right Side GIF */}
      <div className="col-md-6 text-center" data-aos="fade-left">
        <img
          src={heroGif}
          alt="Hero Animation"
          className="img-fluid rounded-3 shadow-lg hero-gif"
        />
      </div>
    </div>
  </div>
</main>


      {/* Features Section */}
      <section className="py-5 bg-white text-center">
        <div className="container">
          <h2 className="fw-bold mb-5 text-success" data-aos="fade-up">🌟 Features</h2>
          <div className="row justify-content-center g-4">
            {[
              { title: "Multi-Wallet Support", desc: "Track cash, bank, UPI & more in one dashboard.", img: walletIcon },
              { title: "Smart Categorization", desc: "Auto-sort expenses by category for easy insights.", img: categoryIcon },
              { title: "Savings Goals", desc: "Set and track goals with progress visuals.", img: savingsIcon },
            ].map((f, idx) => (
              <div key={idx} className="col-md-4" data-aos="fade-up" data-aos-delay={idx * 150}>
                <div className="card h-100 shadow-sm p-3 border-0 animate-hover">
                  <img src={f.img} alt={f.title} className="mb-3 feature-icon rounded" />
                  <div className="card-body">
                    <h5 className="card-title fw-bold text-success">{f.title}</h5>
                    <p className="card-text text-muted">{f.desc}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Why Us Section */}
      <section className="py-5 bg-light">
        <div className="container">
          <div className="row align-items-center">
            <div className="col-md-6" data-aos="fade-right">
              <img src={whyUsImg} alt="Why Choose Us" className="img-fluid rounded-3 shadow" />
            </div>
            <div className="col-md-6" data-aos="fade-left">
              <h2 className="fw-bold mb-4 text-success">💡 Why Choose Us?</h2>
              <ul className="list-unstyled fs-5">
                <li>✅ Intuitive & easy-to-use interface</li>
                <li>✅ Powerful analytics for better decisions</li>
                <li>✅ Secure & privacy-focused data handling</li>
                <li>✅ Cross-device syncing</li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="py-5 bg-white text-center">
        <div className="container">
          <h2 className="fw-bold mb-5 text-success" data-aos="fade-up">📈 Benefits</h2>
          <div className="row justify-content-center g-4">
            {[
              { text: "Gain full control over your finances", img: benefit1Img },
              { text: "Identify unnecessary expenses & save more", img: benefit2Img },
              { text: "Achieve your financial goals faster", img: benefit3Img },
            ].map((b, idx) => (
              <div key={idx} className="col-md-4" data-aos="fade-up" data-aos-delay={idx * 150}>
                <div className="card h-100 shadow-sm p-3 border-0 bg-success bg-opacity-10">
                  <img src={b.img} alt={`Benefit ${idx + 1}`} className="mb-3 feature-icon rounded" />
                  <div className="card-body">
                    <p className="card-text fw-bold">{b.text}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-success text-white py-3 text-center mt-auto">
        <div className="mb-2">
          <Link to="/about" className="text-decoration-none text-white me-3 fw-bold">About Us</Link>
          <Link to="/contact" className="text-decoration-none text-white fw-bold">Contact Us</Link>
        </div>
        &copy; {new Date().getFullYear()} Digital Wallet Tracker. All rights reserved.
      </footer>
    </div>
  );
}
