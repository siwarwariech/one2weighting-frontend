import React from "react";
import { Link } from "react-router-dom";
import "./Home.css";

export default function Home() {
  return (
    <div className="home-hero">
      <header className="home-header">
        <h1 className="home-logo">One2Weighting</h1>
        <nav className="home-nav">
          <Link to="/chatbot" className="home-nav-link">
            How It Works
          </Link>
          <Link to="/signin" className="home-login-btn">
            Login
          </Link>
        </nav>
      </header>

      <div className="home-card">
        <h2>An easy and effective way to weight your data</h2>
        <p>
          You’re here because you want a solution for your Data Weighting
          troubles. With our easy-to-use tool you'll have representative,
          weighted results within 10 minutes.
        </p>
        <Link to="/signup" className="home-getstarted-btn">
          Get Started
        </Link>
      </div>
    </div>
  );
}
