
import React, { useState, useEffect } from "react";
import { getFarm, saveFarm } from "../services/api";
import { Link } from "react-router-dom";
import WhatsAppNumbers from "../components/WhatsAppNumbers";

export default function Farm() {
  const [farm, setFarm] = useState({
    farm_name: "",
    farm_size: "",
    state: "",
    district: "",
    tehsil: "",
    soil_type: "",
    agro_zone: "",
  });

  const [loading, setLoading] = useState(true);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState("");

  const token = localStorage.getItem("token");

  // ============================================================
  // LOAD FARM PROFILE
  // ============================================================

  useEffect(() => {
    if (!token) {
      setLoading(false);
      return;
    }

    const loadFarm = async () => {
      try {
        setError("");

        const response = await getFarm();

        if (response?.data) {
          setFarm((previous) => ({
            ...previous,
            ...response.data,
          }));
        }
      } catch (err) {
        // A missing farm profile is normal for a new user.
        if (err?.response?.status !== 404) {
          setError("Could not load farm profile.");
        }
      } finally {
        setLoading(false);
      }
    };

    loadFarm();
  }, [token]);

  // ============================================================
  // SAVE FARM PROFILE
  // ============================================================

  const handleSave = async () => {
    setError("");
    setSaved(false);

    try {
      await saveFarm(farm);

      setSaved(true);

      setTimeout(() => {
        setSaved(false);
      }, 3000);
    } catch (err) {
      setError(
        err?.response?.data?.detail ||
          "Could not save farm profile."
      );
    }
  };

  // ============================================================
  // LOGIN REQUIRED
  // ============================================================

  if (!token) {
    return (
      <div
        className="container"
        style={{
          paddingTop: "3rem",
          textAlign: "center",
        }}
      >
        <div style={{ fontSize: "4rem" }}>🔐</div>

        <h2 style={{ color: "#1a5c2a" }}>
          Login Required
        </h2>

        <p
          style={{
            color: "#666",
            margin: "1rem 0",
          }}
        >
          Sign in to manage your farm profile.
        </p>

        <Link
          to="/login"
          className="btn btn-primary btn-lg"
        >
          Sign In
        </Link>
      </div>
    );
  }

  // ============================================================
  // MAIN PAGE
  // ============================================================

  return (
    <div
      className="container"
      style={{
        paddingTop: "2rem",
        paddingBottom: "3rem",
      }}
    >
      <div className="page-header">
        <h1>👨‍🌾 My Farm Profile</h1>

        <p>
          Save your farm details for faster recommendations.
        </p>
      </div>

      {saved && (
        <div className="alert alert-success">
          ✅ Farm profile saved successfully!
        </div>
      )}

      {error && (
        <div className="alert alert-error">
          {error}
        </div>
      )}

      {loading ? (
        <div className="spinner" />
      ) : (
        <div className="grid-2">

          {/* ======================================================
              FARM DETAILS
          ====================================================== */}

          <div className="card">
            <h3
              style={{
                color: "#1a5c2a",
                marginBottom: "1rem",
              }}
            >
              🏡 Farm Details
            </h3>

            {[
              ["farm_name", "Farm Name", "My Farm"],
              ["farm_size", "Farm Size (acres)", "5"],
              ["state", "State", "Telangana"],
              ["district", "District", "Hyderabad"],
              ["tehsil", "Tehsil", ""],
              ["soil_type", "Soil Type", "Alluvial"],
              ["agro_zone", "Agro-Climatic Zone", ""],
            ].map(([name, label, placeholder]) => (
              <div
                className="form-group"
                key={name}
              >
                <label className="form-label">
                  {label}
                </label>

                <input
                  className="form-input"
                  type={
                    name === "farm_size"
                      ? "number"
                      : "text"
                  }
                  placeholder={placeholder}
                  value={farm[name] || ""}
                  onChange={(event) =>
                    setFarm((previous) => ({
                      ...previous,
                      [name]: event.target.value,
                    }))
                  }
                />
              </div>
            ))}

            <button
              className="btn btn-primary btn-full"
              onClick={handleSave}
            >
              💾 Save Farm Profile
            </button>
          </div>

          {/* ======================================================
              QUICK ACTIONS
          ====================================================== */}

          <div>
            <div className="card card-green">
              <h3 style={{ marginBottom: "1rem" }}>
                🌾 Quick Actions
              </h3>

              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  gap: "0.8rem",
                }}
              >
                <Link
                  to="/predict"
                  className="btn btn-white"
                >
                  🌱 Get Crop Recommendation
                </Link>

                <Link
                  to="/history"
                  className="btn btn-outline"
                >
                  📋 View History
                </Link>

                <Link
                  to="/tehsil-analysis"
                  className="btn btn-outline"
                >
                  📍 Tehsil Analysis
                </Link>
              </div>
            </div>

            <div className="card mt-2">
              <h3
                style={{
                  color: "#1a5c2a",
                  marginBottom: "0.5rem",
                }}
              >
                Why save your farm?
              </h3>

              <ul
                style={{
                  color: "#555",
                  fontSize: "0.9rem",
                  lineHeight: 2,
                  paddingLeft: "1.2rem",
                }}
              >
                <li>Faster recommendations</li>
                <li>Track crop history</li>
                <li>Personalised advice</li>
                <li>Compare seasons</li>
              </ul>
            </div>
            <WhatsAppNumbers />
          </div>

        </div>
      )}
    </div>
  );
}

