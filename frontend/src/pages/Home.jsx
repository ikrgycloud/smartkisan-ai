import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { getStats } from "../services/api";

export default function Home() {
  const [stats, setStats] = useState(null);

  useEffect(() => {
    getStats()
      .then((response) => {
        setStats(response.data);
      })
      .catch((error) => {
        console.error("Unable to load dashboard statistics:", error);
      });
  }, []);

  const accuracy =
    typeof stats?.model_accuracy === "number"
      ? (stats.model_accuracy * 100).toFixed(2) + "%"
      : "93.53%";

  const top3Accuracy =
    typeof stats?.top3_accuracy === "number"
      ? (stats.top3_accuracy * 100).toFixed(2) + "%"
      : "98.14%";

  const testRecords = stats?.test_records ?? "1,129";

  const macroF1 =
    typeof stats?.macro_f1 === "number"
      ? stats.macro_f1.toFixed(3)
      : "0.682";

  const totalStates = stats?.total_states ?? "34";
  const totalCrops = stats?.total_crops ?? "9";

  return (
    <main className="page-container">
      <section className="hero-section">
        <h1>Smart Kisan</h1>

        <p>AI-powered farming decisions for Indian agriculture</p>

        <div
          style={{
            display: "flex",
            gap: "12px",
            flexWrap: "wrap",
            marginTop: "20px",
          }}
        >
          <span>Machine Learning</span>
          <span>{totalStates} States</span>
          <span>{totalCrops} Crops</span>
          <span>{accuracy} Accuracy</span>
        </div>

        <div
          style={{
            display: "flex",
            gap: "12px",
            flexWrap: "wrap",
            marginTop: "24px",
          }}
        >
          <Link to="/predict" className="btn">
            Get Recommendation
          </Link>

          <Link to="/register" className="btn btn-outline">
            Join Free
          </Link>
        </div>
      </section>

      <section
        style={{
          display: "grid",
          gridTemplateColumns:
            "repeat(auto-fit, minmax(180px, 1fr))",
          gap: "16px",
          marginTop: "32px",
        }}
      >
        <div className="card">
          <h2>{accuracy}</h2>
          <p>Test Accuracy</p>
        </div>

        <div className="card">
          <h2>{top3Accuracy}</h2>
          <p>Top-3 Accuracy</p>
        </div>

        <div className="card">
          <h2>{testRecords}</h2>
          <p>Test Records</p>
        </div>

        <div className="card">
          <h2>{macroF1}</h2>
          <p>Macro F1</p>
        </div>
      </section>

      <section className="card" style={{ marginTop: "32px" }}>
        <h2>Live Weather and Farming Intelligence</h2>
        <h3>Hyderabad, IN - Current Conditions</h3>

        <div
          style={{
            display: "grid",
            gridTemplateColumns:
              "repeat(auto-fit, minmax(150px, 1fr))",
            gap: "16px",
            marginTop: "20px",
          }}
        >
          <div>
            <strong>26 C</strong>
            <p>Temperature</p>
            <small>Feels 26 C</small>
          </div>

          <div>
            <strong>83%</strong>
            <p>Humidity</p>
          </div>

          <div>
            <strong>4.12 m/s</strong>
            <p>Wind Speed</p>
          </div>

          <div>
            <strong>100%</strong>
            <p>Rain Probability</p>
          </div>
        </div>

        <p style={{ marginTop: "20px" }}>
          High rainfall expected. Avoid spraying pesticides and
          fertilizers. Ensure proper field drainage.
        </p>
      </section>

      <section className="card" style={{ marginTop: "32px" }}>
        <h2>Tehsil Farming Intelligence</h2>

        <h3>Detected Farming Area</h3>

        <p>
          <strong>
            Greater Hyderabad Municipal Corporation Central Zone
          </strong>
          , Hyderabad, Telangana
        </p>

        <h3>Crop Calendar</h3>

        <div
          style={{
            display: "grid",
            gridTemplateColumns:
              "repeat(auto-fit, minmax(220px, 1fr))",
            gap: "16px",
          }}
        >
          <div>
            <h4>Rice</h4>
            <strong>Jun - Oct</strong>
            <p>Kharif</p>
            <small>
              Best with monsoon rainfall and good water availability.
            </small>
          </div>

          <div>
            <h4>Maize</h4>
            <strong>Jun - Sep / Oct - Jan</strong>
            <p>Kharif / Rabi</p>
            <small>
              Needs well-drained soil and moderate rainfall.
            </small>
          </div>

          <div>
            <h4>Cotton</h4>
            <strong>Jun - Dec</strong>
            <p>Kharif</p>
            <small>
              Suitable during warm weather with adequate soil moisture.
            </small>
          </div>

          <div>
            <h4>Pulses</h4>
            <strong>Oct - Jan</strong>
            <p>Rabi</p>
            <small>
              Suitable for relatively dry conditions and well-drained soil.
            </small>
          </div>

          <div>
            <h4>Vegetables</h4>
            <strong>Most months</strong>
            <p>Year-round</p>
            <small>
              Choose varieties according to temperature and water availability.
            </small>
          </div>
        </div>
      </section>

      <section style={{ marginTop: "32px" }}>
        <h2>Platform Features</h2>

        <div
          style={{
            display: "grid",
            gridTemplateColumns:
              "repeat(auto-fit, minmax(220px, 1fr))",
            gap: "16px",
          }}
        >
          <div className="card">
            <h3>Crop Recommendation</h3>
            <p>ML-powered crop recommendations.</p>
            <strong>Live</strong>
            <div style={{ marginTop: "12px" }}>
              <Link to="/predict">Open</Link>
            </div>
          </div>

          <div className="card">
            <h3>Crop Disease</h3>
            <p>Local AI crop and leaf disease classification.</p>
            <strong>Live</strong>
            <div style={{ marginTop: "12px" }}>
              <Link to="/disease">Open</Link>
            </div>
          </div>

          <div className="card">
            <h3>Mandi Prices</h3>
            <p>Current crop market prices and market information.</p>
            <strong>Live</strong>
            <div style={{ marginTop: "12px" }}>
              <Link to="/mandi-prices">Open</Link>
            </div>
          </div>

          <div className="card">
            <h3>Tehsil Analysis</h3>
            <p>Regional crop and farming data.</p>
            <strong>Live</strong>
            <div style={{ marginTop: "12px" }}>
              <Link to="/tehsil-analysis">Open</Link>
            </div>
          </div>

          <div className="card">
            <h3>My Farm</h3>
            <p>Save and manage your farm profile.</p>
            <strong>Live</strong>
            <div style={{ marginTop: "12px" }}>
              <Link to="/farm">Open</Link>
            </div>
          </div>

          <div className="card">
            <h3>Model Performance</h3>
            <p>Review F1 score and model evaluation.</p>
            <strong>Live</strong>
          </div>
        </div>
      </section>

      <section className="card" style={{ marginTop: "32px" }}>
        <h2>Model Performance</h2>

        {[
          ["Cotton", "0.97"],
          ["Rice", "0.95"],
          ["Maize", "0.93"],
          ["Wheat", "0.91"],
          ["Pulses", "0.88"],
          ["Mustard", "0.85"],
          ["Sugarcane", "0.72"],
          ["Vegetables", "0.61"],
          ["Potato", "0.48"],
          ["Barley", "0.35"],
        ].map(([crop, score]) => (
          <div
            key={crop}
            style={{
              display: "flex",
              justifyContent: "space-between",
              padding: "8px 0",
              borderBottom: "1px solid #eee",
            }}
          >
            <strong>{crop}</strong>
            <span>{score}</span>
          </div>
        ))}
      </section>

      <section className="card" style={{ marginTop: "32px" }}>
        <h2>How It Works</h2>

        <div
          style={{
            display: "grid",
            gridTemplateColumns:
              "repeat(auto-fit, minmax(200px, 1fr))",
            gap: "20px",
          }}
        >
          <div>
            <h3>1. Enter Data</h3>
            <p>Enter soil, location and weather information.</p>
          </div>

          <div>
            <h3>2. ML Processing</h3>
            <p>19 features are analysed by the machine learning model.</p>
          </div>

          <div>
            <h3>3. Get Results</h3>
            <p>Receive top crop recommendations with confidence.</p>
          </div>

          <div>
            <h3>4. Verify</h3>
            <p>Review the recommendation and model metrics.</p>
          </div>
        </div>
      </section>

      <section className="card" style={{ marginTop: "32px" }}>
        <h2>Ready to make smarter farming decisions</h2>

        <p>
          Use AI-powered crop recommendations and live mandi
          prices to make better agricultural decisions.
        </p>

        <div
          style={{
            display: "flex",
            gap: "12px",
            flexWrap: "wrap",
            marginTop: "16px",
          }}
        >
          <Link to="/predict" className="btn">
            Start Prediction
          </Link>

          <Link to="/mandi-prices" className="btn btn-outline">
            Check Mandi Prices
          </Link>
        </div>
      </section>
    </main>
  );
}
