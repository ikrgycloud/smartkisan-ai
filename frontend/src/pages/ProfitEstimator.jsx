
import React, { useState } from "react";
import { estimateProfit } from "../services/api";
import WhatsAppAlert from "../components/WhatsAppAlert";

const initialForm = {
  crop: "Maize",
  acres: "",
  yield_per_acre: "",
  mandi_price: "",
  seed_cost: "",
  fertilizer_cost: "",
  labour_cost: "",
  other_cost: "",
};

const crops = [
  "Maize",
  "Rice",
  "Wheat",
  "Cotton",
  "Sugarcane",
  "Groundnut",
  "Chickpea",
  "Tomato",
  "Potato",
];

function ProfitEstimator() {
  const [form, setForm] = useState(initialForm);
  const [result, setResult] = useState(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleChange = (event) => {
    const { name, value } = event.target;

    setForm((currentForm) => ({
      ...currentForm,
      [name]: value,
    }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    setError("");
    setResult(null);

    if (!form.acres || !form.yield_per_acre || !form.mandi_price) {
      setError("Please enter acres, yield and mandi price.");
      return;
    }

    const data = {
      crop: form.crop,
      acres: Number(form.acres),
      yield_per_acre: Number(form.yield_per_acre),
      mandi_price: Number(form.mandi_price),
      seed_cost: Number(form.seed_cost || 0),
      fertilizer_cost: Number(form.fertilizer_cost || 0),
      labour_cost: Number(form.labour_cost || 0),
      other_cost: Number(form.other_cost || 0),
    };

    try {
      setLoading(true);

      const response = await estimateProfit(data);

      setResult(response.data);
    } catch (err) {
      console.error("Profit estimation error:", err);

      if (err.response?.data) {
        const detail = err.response.data.detail;

        if (Array.isArray(detail)) {
          setError(
            detail
              .map((item) => item.msg || "Invalid input")
              .join(", ")
          );
        } else {
          setError(
            detail ||
              err.response.data.message ||
              "Server error while calculating profit."
          );
        }
      } else {
        setError(
          "Could not connect to the Smart Kisan backend. Make sure the backend is running on port 8001."
        );
      }
    } finally {
      setLoading(false);
    }
  };

  const formatRupees = (value) => {
    const number = Number(value || 0);

    return `Rs. ${number.toLocaleString("en-IN", {
      maximumFractionDigits: 2,
    })}`;
  };

  return (
    <div className="profit-page">
      <div className="profit-container">
        <div className="profit-header">
          <h1>Crop Profit Estimator</h1>

          <p>
            Estimate revenue, farming costs and expected profit.
          </p>
        </div>

        {error && (
          <div className="profit-error">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <section className="profit-card">
            <h2>Crop Details</h2>

            <div className="profit-field">
              <label htmlFor="crop">Crop</label>

              <select
                id="crop"
                name="crop"
                value={form.crop}
                onChange={handleChange}
              >
                {crops.map((crop) => (
                  <option key={crop} value={crop}>
                    {crop}
                  </option>
                ))}
              </select>
            </div>

            <div className="profit-grid">
              <div className="profit-field">
                <label htmlFor="acres">
                  Farm Size (acres)
                </label>

                <input
                  id="acres"
                  name="acres"
                  type="number"
                  min="0"
                  step="0.01"
                  value={form.acres}
                  onChange={handleChange}
                  placeholder="Example: 5"
                />
              </div>

              <div className="profit-field">
                <label htmlFor="yield_per_acre">
                  Expected Yield (quintals/acre)
                </label>

                <input
                  id="yield_per_acre"
                  name="yield_per_acre"
                  type="number"
                  min="0"
                  step="0.01"
                  value={form.yield_per_acre}
                  onChange={handleChange}
                  placeholder="Example: 20"
                />
              </div>

              <div className="profit-field">
                <label htmlFor="mandi_price">
                  Mandi Price (Rs./quintal)
                </label>

                <input
                  id="mandi_price"
                  name="mandi_price"
                  type="number"
                  min="0"
                  step="0.01"
                  value={form.mandi_price}
                  onChange={handleChange}
                  placeholder="Example: 2200"
                />
              </div>
            </div>
          </section>

          <section className="profit-card">
            <h2>Estimated Costs</h2>

            <div className="profit-grid">
              <div className="profit-field">
                <label htmlFor="seed_cost">
                  Seed Cost (Rs.)
                </label>

                <input
                  id="seed_cost"
                  name="seed_cost"
                  type="number"
                  min="0"
                  step="0.01"
                  value={form.seed_cost}
                  onChange={handleChange}
                  placeholder="0"
                />
              </div>

              <div className="profit-field">
                <label htmlFor="fertilizer_cost">
                  Fertilizer Cost (Rs.)
                </label>

                <input
                  id="fertilizer_cost"
                  name="fertilizer_cost"
                  type="number"
                  min="0"
                  step="0.01"
                  value={form.fertilizer_cost}
                  onChange={handleChange}
                  placeholder="0"
                />
              </div>

              <div className="profit-field">
                <label htmlFor="labour_cost">
                  Labour Cost (Rs.)
                </label>

                <input
                  id="labour_cost"
                  name="labour_cost"
                  type="number"
                  min="0"
                  step="0.01"
                  value={form.labour_cost}
                  onChange={handleChange}
                  placeholder="0"
                />
              </div>

              <div className="profit-field">
                <label htmlFor="other_cost">
                  Other Costs (Rs.)
                </label>

                <input
                  id="other_cost"
                  name="other_cost"
                  type="number"
                  min="0"
                  step="0.01"
                  value={form.other_cost}
                  onChange={handleChange}
                  placeholder="0"
                />
              </div>
            </div>

            <button
              type="submit"
              className="profit-button"
              disabled={loading}
            >
              {loading ? "Calculating..." : "Calculate Profit"}
            </button>
          </section>
        </form>

        <section className="profit-card result-card">
          <h2>Your Estimate</h2>

          {!result && (
            <p className="result-placeholder">
              Enter your crop and farming details.
            </p>
          )}

          {result && (
            <div className="result-grid">
              <div className="result-item">
                <span>Crop</span>
                <strong>
                  {result.crop || form.crop}
                </strong>
              </div>

              <div className="result-item">
                <span>Total Yield</span>
                <strong>
                  {Number(
                    result.total_yield || 0
                  ).toLocaleString("en-IN")}{" "}
                  quintals
                </strong>
              </div>

              <div className="result-item">
                <span>Revenue</span>
                <strong>
                  {formatRupees(result.revenue)}
                </strong>
              </div>

              <div className="result-item">
                <span>Total Cost</span>
                <strong>
                  {formatRupees(result.total_cost)}
                </strong>
              </div>

              <div className="result-item result-profit">
                <span>Expected Profit</span>
                <strong>
                  {formatRupees(result.profit)}
                </strong>
              </div>

              <div className="result-item">
                <span>Profit / Acre</span>
                <strong>
                  {formatRupees(result.profit_per_acre)}
                </strong>
              </div>
            </div>
          )}
        </section>

        {result && <WhatsAppAlert type="profit" data={{ crop: result.crop || form.crop, acres: form.acres, total_yield: result.total_yield, revenue: result.revenue, total_cost: result.total_cost, profit: result.profit, profit_per_acre: result.profit_per_acre, mandi_price: form.mandi_price }} />}
      </div>
    </div>
  );
}

export default ProfitEstimator;




