import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { login, getMe } from "../services/api";

export default function Login({ setUser }) {
  const [form, setForm] = useState({ username:"", password:"" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const submit = async (e) => {
    e.preventDefault(); setLoading(true); setError("");
    try {
      const res = await login(form);
      localStorage.setItem("token", res.data.access_token);

      const me = await getMe();
      localStorage.setItem("user", JSON.stringify(me.data));

      setUser({
        token: res.data.access_token,
        ...me.data,
      });

      navigate("/predict");
    } catch {
      setError("Invalid email or password.");
    }
    setLoading(false);
  };

  return (
    <div style={{ minHeight:"80vh", display:"flex", alignItems:"center", justifyContent:"center", padding:"2rem" }}>
      <div style={{ width:"100%", maxWidth:"420px" }}>
        <div className="card">
          <div style={{ textAlign:"center", marginBottom:"2rem" }}>
            <div style={{ fontSize:"3rem" }}></div>
            <h2 style={{ color:"#1a5c2a" }}>Welcome Back</h2>
            <p style={{ color:"#666" }}>Sign in to Smart Kisan</p>
          </div>
          {error && <div className="alert alert-error">{error}</div>}
          <form onSubmit={submit}>
            <div className="form-group">
              <label className="form-label">Email</label>
              <input className="form-input" type="email" placeholder="your@email.com" value={form.username} onChange={e => setForm({ ...form, username:e.target.value })} required />
            </div>
            <div className="form-group">
              <label className="form-label">Password</label>
              <input className="form-input" type="password" placeholder="password" value={form.password} onChange={e => setForm({ ...form, password:e.target.value })} required />
            </div>
            <button className="btn btn-primary btn-full btn-lg" type="submit" disabled={loading}>
              {loading ? "Signing in..." : "Sign In"}
            </button>
          </form>
          <p style={{ textAlign:"center", marginTop:"1rem", color:"#666", fontSize:"0.9rem" }}>
            No account? <Link to="/register" style={{ color:"#2d8a45", fontWeight:600 }}>Create one free</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
