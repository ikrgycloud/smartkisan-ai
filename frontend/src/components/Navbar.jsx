import React from "react";
import { Link, NavLink } from "react-router-dom";

function Navbar({ user, setUser }) {
  return (
    <header className="sk-navbar">
      <div className="sk-navbar-inner">

        <Link to="/" className="sk-brand">
          <span className="sk-brand-icon">🌱</span>
          <span className="sk-brand-text">
            <strong>Smart Kisan</strong>
            <small>AI for Agriculture</small>
          </span>
        </Link>

        <nav className="sk-nav-links">
          <NavLink to="/" end>Home</NavLink>
          <NavLink to="/predict">Predict</NavLink>
          <NavLink to="/weather">Weather</NavLink>
          <NavLink to="/mandi-prices">Mandi Prices</NavLink>
          <NavLink to="/disease">Crop Disease</NavLink>
          <NavLink to="/profit-estimator">Profit</NavLink>
          <NavLink to="/tehsil-analysis">Tehsil</NavLink>
          <NavLink to="/history">History</NavLink>
          <NavLink to="/farm">My Farm</NavLink>
        </nav>

        <div className="sk-nav-actions">
          {user ? (
            <button
              className="sk-nav-login"
              onClick={() => setUser(null)}
            >
              Logout
            </button>
          ) : (
            <>
              <Link to="/login" className="sk-nav-login">
                Login
              </Link>

              <Link to="/register" className="sk-nav-register">
                Register
              </Link>
            </>
          )}
        </div>

      </div>
    </header>
  );
}

export default Navbar;
