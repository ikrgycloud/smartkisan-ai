import React, { useState } from "react";
import { predictGuest, predict, sendWhatsAppCrop } from "../services/api";

const EMOJI = {
  Rice: "[Rice]",
  Wheat: "[Wheat]",
  Maize: "[Maize]",
  Cotton: "[Cotton]",
  Mustard: "[Mustard]",
  Pulses: "[Pulses]",
  Vegetables: "[Vegetables]",
  Apple: "[Apple]",
  Walnut: "[Walnut]",
  Sugarcane: "[Sugarcane]",
  Potato: "[Potato]"
};

const EXAMPLES = {
  "Rice": {
    state:"Andhra Pradesh",
    soil_type:"Alluvial",
    agro_zone:"Southern Plateau and Hills Region",
    ph:6.9,
    nitrogen:30.7,
    phosphorus:204.9,
    potassium:53.4,
    rainfall:232.5,
    temperature:27.9,
    humidity:65.0
  },
  "Maize": {
    state:"Telangana",
    soil_type:"Alluvial Soil",
    agro_zone:"Southern Plateau and Hills Region",
    ph:6.9,
    nitrogen:14.9,
    phosphorus:219.0,
    potassium:35.2,
    rainfall:172.9,
    temperature:27.5,
    humidity:64.7
  },
  "Cotton": {
    state:"Andhra Pradesh",
    soil_type:"Black Cotton Soil (Vertisols)",
    agro_zone:"Southern Plateau and Hills Region",
    ph:7.8,
    nitrogen:55.4,
    phosphorus:178.6,
    potassium:77.9,
    rainfall:59.4,
    temperature:27.7,
    humidity:64.2
  }
};

export default function Predict() {
  const user = JSON.parse(localStorage.getItem("user") || "null");
  const [form, setForm] = useState({
    state:"Telangana",
    soil_type:"Alluvial Soil",
    agro_zone:"Southern Plateau and Hills Region",
    ph:6.8,
    nitrogen:120,
    phosphorus:40,
    potassium:180,
    rainfall:120,
    temperature:28,
    humidity:75
  });

  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [whatsappLoading, setWhatsappLoading] = useState(false);
  const [whatsappMessage, setWhatsappMessage] = useState("");

  const set = (e) => {
    setForm({
      ...form,
      [e.target.name]:
        e.target.type === "number"
          ? parseFloat(e.target.value)
          : e.target.value
    });
  };

  const submit = async () => {
    setLoading(true);
    setError("");
    setResult(null);

    try {
      const token = localStorage.getItem("token");
      const res = token
        ? await predict(form)
        : await predictGuest(form);

      setResult(res.data);
    } catch {
      setError("Prediction failed. Check your inputs.");
    }

    setLoading(false);
  };

  return (
    <div
      className="container"
      style={{ paddingTop:"2rem", paddingBottom:"3rem" }}
    >
      <div className="page-header">
        <h1>Crop Recommendation</h1>
        <p>
          Enter your farm conditions and let Smart Kisan automatically detect the most suitable crop.
        </p>
      </div>

      <div className="card">
        <h3 style={{ color:"#1a5c2a", marginBottom:"1rem" }}>
          Quick Examples
        </h3>

        <div
          style={{
            display:"flex",
            gap:"0.8rem",
            flexWrap:"wrap"
          }}
        >
          {Object.entries(EXAMPLES).map(([label, values]) => (
            <button
              key={label}
              className="btn btn-primary"
              onClick={() => setForm({ ...form, ...values })}
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      <div className="grid-2">
        <div>
          <div className="card">
            <h3
              style={{
                color:"#1a5c2a",
                marginBottom:"1rem"
              }}
            >
              Location
            </h3>

            {[
              ["state","State"],
              ["soil_type","Soil Type"],
              ["agro_zone","Agro Zone"]
            ].map(([name,label]) => (
              <div className="form-group" key={name}>
                <label className="form-label">{label}</label>
                <input
                  className="form-input"
                  type="text"
                  name={name}
                  value={form[name]}
                  onChange={set}
                />
              </div>
            ))}
          </div>

          <div className="card">
            <h3
              style={{
                color:"#1a5c2a",
                marginBottom:"1rem"
              }}
            >
              Weather
            </h3>

            {[
              ["rainfall","Rainfall (cm)"],
              ["temperature","Temperature (C)"],
              ["humidity","Humidity (%)"]
            ].map(([name,label]) => (
              <div className="form-group" key={name}>
                <label className="form-label">{label}</label>
                <input
                  className="form-input"
                  type="number"
                  step="0.1"
                  name={name}
                  value={form[name]}
                  onChange={set}
                />
              </div>
            ))}
          </div>
        </div>

        <div className="card">
          <h3
            style={{
              color:"#1a5c2a",
              marginBottom:"1rem"
            }}
          >
            Soil
          </h3>

          {[
            ["ph","pH"],
            ["nitrogen","Nitrogen (N)"],
            ["phosphorus","Phosphorus (P)"],
            ["potassium","Potassium (K)"]
          ].map(([name,label]) => (
            <div className="form-group" key={name}>
              <label className="form-label">{label}</label>
              <input
                className="form-input"
                type="number"
                step="0.1"
                name={name}
                value={form[name]}
                onChange={set}
              />
            </div>
          ))}
        </div>
      </div>

      {error && (
        <div className="alert alert-error">
          {error}
        </div>
      )}

      <button
        className="btn btn-primary btn-full btn-lg"
        onClick={submit}
        disabled={loading}
      >
        {loading
          ? "Analysing..."
          : "Automatically Detect & Recommend Crop"}
      </button>

      {loading && <div className="spinner" />}

      {result && (
        <div>
          <div className="result-hero">
            <div style={{ fontSize:"2rem" }}>
              {EMOJI[result.top_crop] || "[Crop]"}
            </div>

            <div className="result-crop">
              {result.top_crop}
            </div>

            <div className="confidence-badge">
              {result.confidence.toFixed(1)}% confidence
            </div>
          </div>

          <div className="medal-grid">
            {result.top3.map((item, i) => (
              <div className="medal-card" key={i}>
                <div style={{ fontSize:"2rem" }}>
                  #{i + 1}
                </div>

                <div style={{ fontSize:"1.5rem" }}>
                  {EMOJI[item.crop] || "[Crop]"}
                </div>

                <div
                  style={{
                    fontWeight:700,
                    color:"#1a5c2a"
                  }}
                >
                  {item.crop}
                </div>

                <div className="medal-score">
                  {item.confidence.toFixed(1)}%
                </div>

                <div
                  className="progress-bar"
                  style={{ marginTop:"0.5rem" }}
                >
                  <div
                    className="progress-fill"
                    style={{
                      width:item.confidence + "%"
                    }}
                  />
                </div>
              </div>
            ))}
          </div>

          <div className="card" style={{ background:"#f0fdf4", border:"1px solid #22c55e" }}>
            <h3
              style={{
                color:"#166534",
                marginBottom:"0.5rem"
              }}
            >
              Advice
            </h3>

            <p>{result.advice}</p>
          </div>

          {localStorage.getItem("token") && (
            <div className="card" style={{ marginTop:"1rem", textAlign:"center" }}>
              <button
                className="btn btn-primary"
                disabled={whatsappLoading || !user?.phone}
                onClick={async () => {
                  setWhatsappLoading(true);
                  setWhatsappMessage("");
                  try {
                    await sendWhatsAppCrop({
                      farmer_name: user?.name || "Farmer",
                      top_crop: result.top_crop,
                      confidence: result.confidence,
                      top3: result.top3,
                      advice: result.advice
                    });
                    setWhatsappMessage("WhatsApp notification sent successfully.");
                  } catch (err) {
                    setWhatsappMessage(err?.response?.data?.detail || "Could not send WhatsApp alert.");
                  }
                  setWhatsappLoading(false);
                }}
              >
                {whatsappLoading ? "Sending..." : "Send Recommendation to WhatsApp"}
              </button>
              {!user?.phone && <p style={{ marginTop:"0.75rem", color:"#b45309" }}>Please register a phone number to use WhatsApp alerts.</p>}
              {whatsappMessage && <p style={{ marginTop:"0.75rem" }}>{whatsappMessage}</p>}
            </div>
          )}
        </div>
      )}
    </div>
  );
}



