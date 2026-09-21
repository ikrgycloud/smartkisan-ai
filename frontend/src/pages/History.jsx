
import React, { useState, useEffect } from "react";
import { getHistory } from "../services/api";
import { Link } from "react-router-dom";

const CROP_EMOJI = {
  Rice: "🌾",
  Wheat: "🌿",
  Maize: "🌽",
  Cotton: "🌸",
  Mustard: "🌻",
  Pulses: "🫘",
  Vegetables: "🥦",
  Apple: "🍎",
  Walnut: "🌰",
  Sugarcane: "🎋",
  Potato: "🥔",
  Barley: "🌾",
};

export default function History() {
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const token = localStorage.getItem("token");

  // ============================================================
  // LOAD HISTORY
  // ============================================================

  useEffect(() => {
    if (!token) {
      setLoading(false);
      return;
    }

    const loadHistory = async () => {
      try {
        setError("");

        const response = await getHistory();

        setHistory(
          Array.isArray(response?.data)
            ? response.data
            : []
        );
      } catch (err) {
        setError(
          err?.response?.data?.detail ||
            "Could not load prediction history."
        );
      } finally {
        setLoading(false);
      }
    };

    loadHistory();
  }, [token]);

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
        <div style={{ fontSize: "4rem" }}>
          🔐
        </div>

        <h2 style={{ color: "#1a5c2a" }}>
          Login Required
        </h2>

        <p
          style={{
            color: "#666",
            margin: "1rem 0",
          }}
        >
          Sign in to see your prediction history.
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
        <h1>📋 Prediction History</h1>

        <p>
          All your past crop recommendations.
        </p>
      </div>

      {error && (
        <div className="alert alert-error">
          {error}
        </div>
      )}

      {loading ? (
        <div className="spinner" />
      ) : history.length === 0 ? (
        <div
          className="card"
          style={{
            textAlign: "center",
            padding: "3rem",
          }}
        >
          <div style={{ fontSize: "3rem" }}>
            🌱
          </div>

          <h3 style={{ color: "#1a5c2a" }}>
            No predictions yet
          </h3>

          <p
            style={{
              color: "#666",
              margin: "1rem 0",
            }}
          >
            Get your first crop recommendation!
          </p>

          <Link
            to="/predict"
            className="btn btn-primary"
          >
            Get Recommendation
          </Link>
        </div>
      ) : (
        <div>
          {history.map((item) => {
            const confidence = Number(
              item.confidence
            );

            return (
              <div
                className="card"
                key={item.id}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "1.5rem",
                }}
              >
                <div
                  style={{
                    fontSize: "2.5rem",
                  }}
                >
                  {CROP_EMOJI[item.top_crop] ||
                    "🌱"}
                </div>

                <div
                  style={{
                    flex: 1,
                  }}
                >
                  <div
                    style={{
                      fontWeight: 700,
                      fontSize: "1.1rem",
                      color: "#1a5c2a",
                    }}
                  >
                    {item.top_crop || "Unknown Crop"}
                  </div>

                  <div
                    style={{
                      color: "#666",
                      fontSize: "0.85rem",
                    }}
                  >
                    {item.state || "Unknown State"}{" "}
                    •{" "}
                    {item.soil_type ||
                      "Soil not specified"}
                  </div>

                  <div
                    style={{
                      color: "#666",
                      fontSize: "0.8rem",
                    }}
                  >
                    {item.created_at
                      ? new Date(
                          item.created_at
                        ).toLocaleString()
                      : "Date unavailable"}
                  </div>
                </div>

                <div
                  style={{
                    textAlign: "right",
                  }}
                >
                  <div
                    style={{
                      fontWeight: 800,
                      fontSize: "1.4rem",
                      color: "#2d8a45",
                    }}
                  >
                    {Number.isFinite(confidence)
                      ? `${confidence.toFixed(1)}%`
                      : "N/A"}
                  </div>

                  <div
                    style={{
                      fontSize: "0.75rem",
                      color: "#666",
                    }}
                  >
                    confidence
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

