import React, { useEffect, useMemo, useState } from "react";
import API from "../services/api";
import WhatsAppAlert from "../components/WhatsAppAlert";

export default function MandiPrices() {
  const [data, setData] = useState(null);
  const [crop, setCrop] = useState("All");
  const [state, setState] = useState("All");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let mounted = true;

    API.get("/mandi-prices")
      .then((response) => {
        if (mounted) {
          setData(response.data);
        }
      })
      .catch((err) => {
        console.error("Mandi price error:", err);

        if (mounted) {
          const detail =
            err &&
            err.response &&
            err.response.data &&
            err.response.data.detail;

          setError(
            typeof detail === "string"
              ? detail
              : "Unable to load mandi prices."
          );
        }
      })
      .finally(() => {
        if (mounted) {
          setLoading(false);
        }
      });

    return () => {
      mounted = false;
    };
  }, []);

  const rows = useMemo(() => {
    if (!data || !data.data) {
      return [];
    }

    const output = [];

    Object.entries(data.data).forEach(([cropName, markets]) => {
      markets.forEach((item) => {
        output.push({
          crop: cropName,
          state: item.state,
          market: item.market,
          min: item.min,
          max: item.max,
          modal: item.modal,
          unit: item.unit
        });
      });
    });

    return output;
  }, [data]);

  const crops = useMemo(() => {
    return ["All", ...new Set(rows.map((item) => item.crop))];
  }, [rows]);

  const states = useMemo(() => {
    return ["All", ...new Set(rows.map((item) => item.state))];
  }, [rows]);

  const filteredRows = useMemo(() => {
    return rows.filter((item) => {
      const cropMatch = crop === "All" || item.crop === crop;
      const stateMatch = state === "All" || item.state === state;

      return cropMatch && stateMatch;
    });
  }, [rows, crop, state]);

  return (
    <main className="page-container">
      <h1>Mandi Prices</h1>

      <p>
        Compare mandi prices across crops and markets. Values shown are
        project data and are not guaranteed to be live market prices.
      </p>

      {loading && <p>Loading mandi prices...</p>}

      {error && <div className="error-message">{error}</div>}

      {!loading && !error && (
        <>
          <div className="prediction-form">
            <select
              value={crop}
              onChange={(e) => setCrop(e.target.value)}
            >
              {crops.map((item) => (
                <option key={item} value={item}>
                  {item === "All" ? "All Crops" : item}
                </option>
              ))}
            </select>

            <select
              value={state}
              onChange={(e) => setState(e.target.value)}
            >
              {states.map((item) => (
                <option key={item} value={item}>
                  {item === "All" ? "All States" : item}
                </option>
              ))}
            </select>
          </div>

          <section className="prediction-result">
            <h2>Market Prices</h2>

            <div style={{ overflowX: "auto" }}>
              <table
                style={{
                  width: "100%",
                  borderCollapse: "collapse"
                }}
              >
                <thead>
                  <tr>
                    <th align="left">Crop</th>
                    <th align="left">State</th>
                    <th align="left">Market</th>
                    <th align="right">Min</th>
                    <th align="right">Max</th>
                    <th align="right">Modal</th>
                    <th align="left">Unit</th>
                  </tr>
                </thead>

                <tbody>
                  {filteredRows.map((item, index) => (
                    <tr key={`${item.crop}-${item.market}-${index}`}>
                      <td>{item.crop}</td>
                      <td>{item.state}</td>
                      <td>{item.market}</td>
                      <td align="right">Rs.{item.min}</td>
                      <td align="right">Rs.{item.max}</td>
                      <td align="right">
                        <strong>Rs.{item.modal}</strong>
                      </td>
                      <td>{item.unit}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {filteredRows.length === 0 && (
              <p>No mandi prices match the selected filters.</p>
            )}
          </section>

          <section className="prediction-result">
            <h2>MSP Reference</h2>

            <p>
              MSP values below are project reference values, not live mandi
              prices.
            </p>

            {data && data.msp && (
              <div style={{ overflowX: "auto" }}>
                <table
                  style={{
                    width: "100%",
                    borderCollapse: "collapse"
                  }}
                >
                  <thead>
                    <tr>
                      <th align="left">Crop</th>
                      <th align="right">MSP (Rs./Quintal)</th>
                    </tr>
                  </thead>

                  <tbody>
                    {Object.entries(data.msp).map(([name, value]) => (
                      <tr key={name}>
                        <td>{name}</td>
                        <td align="right">
                          {value === null ? "N/A" : `Rs.${value}`}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </section>

          {filteredRows.length > 0 && (
            <WhatsAppAlert
              type="mandi"
              data={{
                crop: filteredRows[0].crop,
                market: filteredRows[0].market,
                state: filteredRows[0].state,
                modal: filteredRows[0].modal,
                msp: data?.msp?.[filteredRows[0].crop]
              }}
            />
          )}
        </>
      )}
    </main>
  );
}

