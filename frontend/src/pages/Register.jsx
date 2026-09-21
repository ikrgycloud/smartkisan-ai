import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { register } from "../services/api";

export default function Register({ setUser }) {
  const [form, setForm] = useState({ name:"", email:"", phone:"", password:"", state:"", district:"" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const submit = async (e) => {
    e.preventDefault(); setLoading(true); setError("");
    try { await register(form); navigate("/login"); }
    catch (err) { setError(err.response?.data?.detail || "Registration failed."); }
    setLoading(false);
  };

  return (
    <div style={{ minHeight:"80vh", display:"flex", alignItems:"center", justifyContent:"center", padding:"2rem" }}>
      <div style={{ width:"100%", maxWidth:"480px" }}>
        <div className="card">
          <div style={{ textAlign:"center", marginBottom:"2rem" }}>
            <div style={{ fontSize:"3rem" }}></div>
            <h2 style={{ color:"#1a5c2a" }}>Create Account</h2>
            <p style={{ color:"#666" }}>Join Smart Kisan free!</p>
          </div>
          {error && <div className="alert alert-error">{error}</div>}
          <form onSubmit={submit}>
            {[["name","Full Name","text","Ravi Kumar"],["email","Email","email","ravi@example.com"],["phone","Phone Number","tel","9876543210"],["password","Password","password","password"],["state","State","text","Telangana"],["district","District","text","Hyderabad"]].map(([name,label,type,ph]) => (
              <div className="form-group" key={name}>
                <label className="form-label">{label}</label>
                <input className="form-input" type={type} placeholder={ph} value={form[name]} onChange={e => setForm({ ...form, [name]:e.target.value })} required={!["state","district"].includes(name)} />
              </div>
            ))}
            <button className="btn btn-primary btn-full btn-lg" type="submit" disabled={loading}>
              {loading ? "Creating..." : "Create Account"}
            </button>
          </form>
          <p style={{ textAlign:"center", marginTop:"1rem", color:"#666", fontSize:"0.9rem" }}>
            Have account? <Link to="/login" style={{ color:"#2d8a45", fontWeight:600 }}>Sign in</Link>
          </p>
        </div>
      </div>
    </div>
  );
}

