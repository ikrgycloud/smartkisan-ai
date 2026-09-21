import WhatsAppAlert from "../components/WhatsAppAlert";

import React, { useEffect, useState } from "react";
import { getTehsilOptions, getTehsilAnalysis, detectLocation as detectLocationApi } from "../services/api";



function TehsilAnalysis() {
  const [states, setStates] = useState([]);
  const [districts, setDistricts] = useState([]);
  const [tehsils, setTehsils] = useState([]);

  const [state, setState] = useState("");
  const [district, setDistrict] = useState("");
  const [tehsil, setTehsil] = useState("");

  const [analysis, setAnalysis] = useState(null);
  const [coordinates, setCoordinates] = useState(null);
  const [address, setAddress] = useState("");

  const [loading, setLoading] = useState(false);
  const [detecting, setDetecting] = useState(false);

  const [error, setError] = useState("");
  const [locationMessage, setLocationMessage] = useState("");

  // ==========================================================
  // LOAD STATES
  // ==========================================================

  useEffect(() => {
    loadStates();
  }, []);

  const loadStates = async () => {
    try {
      const response = await getTehsilOptions();

      setStates(response.data.states || []);
    } catch (err) {
      console.error(err);
      setError("Unable to load states.");
    }
  };

  // ==========================================================
  // STATE
  // ==========================================================

  const handleStateChange = async (value) => {
    setState(value);
    setDistrict("");
    setTehsil("");
    setDistricts([]);
    setTehsils([]);
    setAnalysis(null);
    setError("");

    if (!value) {
      return;
    }

    try {
      const response = await getTehsilOptions({ state: value });

      setDistricts(response.data.districts || []);
    } catch (err) {
      console.error(err);
      setError("Unable to load districts.");
    }
  };

  // ==========================================================
  // DISTRICT
  // ==========================================================

  const handleDistrictChange = async (value) => {
    setDistrict(value);
    setTehsil("");
    setTehsils([]);
    setAnalysis(null);
    setError("");

    if (!value) {
      return;
    }

    try {
      const response = await getTehsilOptions({ state, district: value });

      setTehsils(response.data.tehsils || []);
    } catch (err) {
      console.error(err);
      setError("Unable to load tehsils.");
    }
  };

  // ==========================================================
  // ANALYZE
  // ==========================================================

  const analyzeTehsil = async (
    selectedState = state,
    selectedDistrict = district,
    selectedTehsil = tehsil
  ) => {
    if (
      !selectedState ||
      !selectedDistrict ||
      !selectedTehsil
    ) {
      setError(
        "Please select State, District and Tehsil."
      );
      return;
    }

    setLoading(true);
    setError("");

    try {
      const response = await getTehsilAnalysis({
        state: selectedState,
        district: selectedDistrict,
        tehsil: selectedTehsil,
      });

      setAnalysis(response.data);
    } catch (err) {
      console.error(err);

      setError(
        err.response?.data?.detail ||
          "Unable to load tehsil analysis."
      );

      setAnalysis(null);
    } finally {
      setLoading(false);
    }
  };

  // ==========================================================
  // AUTOMATIC LOCATION
  // ==========================================================

  const detectLocation = () => {
    setError("");
    setLocationMessage("");
    setDetecting(true);

    if (!navigator.geolocation) {
      setError(
        "Geolocation is not supported by this browser."
      );
      setDetecting(false);
      return;
    }

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const latitude = position.coords.latitude;
        const longitude = position.coords.longitude;

        setCoordinates({
          latitude,
          longitude,
        });

        try {
          const response = await detectLocationApi(latitude, longitude);

          const data = response.data;

          const detectedState =
            data.detected_state ||
            data.state ||
            "";

          const detectedDistrict =
            data.detected_district ||
            data.district ||
            "";

          const detectedTehsil =
            data.detected_tehsil ||
            data.tehsil ||
            "";

          setState(detectedState);
          setDistrict(detectedDistrict);
          setTehsil(detectedTehsil);

          setAddress(
            data.display_name || ""
          );

          setLocationMessage(
            "Location detected successfully."
          );

          // Load districts
          try {
            const districtResponse =
              await getTehsilOptions({ state: detectedState });

            setDistricts(
              districtResponse.data.districts || []
            );
          } catch (err) {
            console.error(err);
          }

          // Load tehsils
          try {
            const tehsilResponse =
              await getTehsilOptions({
                state: detectedState,
                district: detectedDistrict,
              });

            setTehsils(
              tehsilResponse.data.tehsils || []
            );
          } catch (err) {
            console.error(err);
          }

          // Automatically analyze
          if (
            detectedState &&
            detectedDistrict &&
            detectedTehsil
          ) {
            await analyzeTehsil(
              detectedState,
              detectedDistrict,
              detectedTehsil
            );
          }
        } catch (err) {
          console.error(err);

          setError(
            err.response?.data?.detail ||
              "Unable to detect your location."
          );
        } finally {
          setDetecting(false);
        }
      },
      (geoError) => {
        console.error(geoError);

        if (geoError.code === 1) {
          setError(
            "Location permission denied. Please allow location access."
          );
        } else if (geoError.code === 2) {
          setError(
            "Your location could not be determined."
          );
        } else if (geoError.code === 3) {
          setError(
            "Location detection timed out."
          );
        } else {
          setError(
            "Unable to detect your location."
          );
        }

        setDetecting(false);
      },
      {
        enableHighAccuracy: true,
        timeout: 15000,
        maximumAge: 0,
      }
    );
  };

  // ==========================================================
  // CROP DATA
  // ==========================================================

  const cropEntries = analysis?.crops
    ? Object.entries(analysis.crops).sort(
        (a, b) => Number(b[1]) - Number(a[1])
      )
    : [];

  const totalCropRecords = cropEntries.reduce(
    (total, item) =>
      total + Number(item[1] || 0),
    0
  );

  const topCrop =
    cropEntries.length > 0
      ? cropEntries[0]
      : null;

  // ==========================================================
  // CROP ICON
  // ==========================================================

  const getCropIcon = (crop) => {
    const name = crop.toLowerCase();

    if (name.includes("rice")) {
      return "ðŸŒ¾";
    }

    if (name.includes("maize")) {
      return "ðŸŒ½";
    }

    if (name.includes("wheat")) {
      return "ðŸŒ¾";
    }

    if (name.includes("cotton")) {
      return "ðŸŒ¿";
    }

    if (name.includes("sugar")) {
      return "ðŸŽ‹";
    }

    if (name.includes("groundnut")) {
      return "ðŸ¥œ";
    }

    if (name.includes("chilli")) {
      return "ðŸŒ¶ï¸";
    }

    if (name.includes("tomato")) {
      return "ðŸ…";
    }

    return "ðŸŒ±";
  };

  // ==========================================================
  // UI
  // ==========================================================

  return (
    <div
      style={{
        maxWidth: "1150px",
        margin: "0 auto",
        padding: "30px 20px 60px",
      }}
    >
      <h1>Tehsil Analysis</h1>

      <p>
        Automatically detect your location and view
        agricultural information for your Tehsil.
      </p>

      {/* =====================================================
          LOCATION CARD
      ====================================================== */}

      <div
        style={{
          marginTop: "25px",
          padding: "24px",
          border: "1px solid #ddd",
          borderRadius: "14px",
          background: "#fff",
        }}
      >
        <h2>ðŸ“ Automatic Location</h2>

        <p>
          Allow Smart Kisan to identify your
          State, District and Tehsil automatically.
        </p>

        <button
          onClick={detectLocation}
          disabled={detecting}
          style={{
            padding: "12px 22px",
            border: "none",
            borderRadius: "8px",
            cursor: detecting
              ? "not-allowed"
              : "pointer",
            fontWeight: "600",
          }}
        >
          {detecting
            ? "ðŸ“ Detecting..."
            : "ðŸ“ Detect My Location"}
        </button>

        {locationMessage && (
          <p
            style={{
              marginTop: "15px",
              fontWeight: "600",
            }}
          >
            âœ… {locationMessage}
          </p>
        )}

        {coordinates && (
          <p>
            <strong>Coordinates:</strong>{" "}
            {coordinates.latitude.toFixed(5)},{" "}
            {coordinates.longitude.toFixed(5)}
          </p>
        )}

        {error && (
          <div
            style={{
              marginTop: "15px",
              padding: "12px",
              borderRadius: "8px",
              border: "1px solid #e57373",
            }}
          >
            âŒ {error}
          </div>
        )}
      </div>

      {/* =====================================================
          SELECTORS
      ====================================================== */}

      <div
        style={{
          display: "grid",
          gridTemplateColumns:
            "repeat(auto-fit, minmax(220px, 1fr))",
          gap: "16px",
          marginTop: "25px",
        }}
      >
        <div>
          <label>
            <strong>State</strong>
          </label>

          <select
            value={state}
            onChange={(e) =>
              handleStateChange(e.target.value)
            }
            style={{
              width: "100%",
              padding: "11px",
              marginTop: "6px",
            }}
          >
            <option value="">
              Select State
            </option>

            {states.map((item) => (
              <option key={item} value={item}>
                {item}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label>
            <strong>District</strong>
          </label>

          <select
            value={district}
            onChange={(e) =>
              handleDistrictChange(e.target.value)
            }
            disabled={!state}
            style={{
              width: "100%",
              padding: "11px",
              marginTop: "6px",
            }}
          >
            <option value="">
              Select District
            </option>

            {districts.map((item) => (
              <option key={item} value={item}>
                {item}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label>
            <strong>Tehsil</strong>
          </label>

          <select
            value={tehsil}
            onChange={(e) => {
              setTehsil(e.target.value);
              setAnalysis(null);
            }}
            disabled={!district}
            style={{
              width: "100%",
              padding: "11px",
              marginTop: "6px",
            }}
          >
            <option value="">
              Select Tehsil
            </option>

            {tehsils.map((item) => (
              <option key={item} value={item}>
                {item}
              </option>
            ))}
          </select>
        </div>
      </div>

      <button
        onClick={() => analyzeTehsil()}
        disabled={
          loading ||
          !state ||
          !district ||
          !tehsil
        }
        style={{
          marginTop: "20px",
          padding: "12px 25px",
          border: "none",
          borderRadius: "8px",
          cursor:
            loading ||
            !state ||
            !district ||
            !tehsil
              ? "not-allowed"
              : "pointer",
          fontWeight: "600",
        }}
      >
        {loading
          ? "Analyzing..."
          : "Analyze Tehsil"}
      </button>

      {/* =====================================================
          ANALYSIS
      ====================================================== */}

      {analysis && (
        <div style={{ marginTop: "40px" }}>
          <h2>
            ðŸ“ {state} â†’ {district} â†’ {tehsil}
          </h2>

          {/* Statistics */}
          <h3 style={{ marginTop: "25px" }}>
            Statistics
          </h3>

          <div
            style={{
              display: "grid",
              gridTemplateColumns:
                "repeat(auto-fit, minmax(160px, 1fr))",
              gap: "15px",
            }}
          >
            {[
              ["States", analysis.stats?.states],
              [
                "Districts",
                analysis.stats?.districts,
              ],
              [
                "Tehsils",
                analysis.stats?.tehsils,
              ],
              ["Crops", analysis.stats?.crops],
              [
                "Records",
                analysis.stats?.records,
              ],
            ].map(([label, value]) => (
              <div
                key={label}
                style={{
                  padding: "20px",
                  border: "1px solid #ddd",
                  borderRadius: "12px",
                  textAlign: "center",
                }}
              >
                <div>{label}</div>

                <div
                  style={{
                    fontSize: "28px",
                    fontWeight: "700",
                    marginTop: "5px",
                  }}
                >
                  {value || 0}
                </div>
              </div>
            ))}
          </div>

          {/* Top Crop */}
          {topCrop && <WhatsAppAlert type="tehsil" data={{ state, district, tehsil, top_crop: topCrop[0], crop_count: totalCropRecords }} />}

{topCrop && (
            <div
              style={{
                marginTop: "30px",
                padding: "25px",
                borderRadius: "14px",
                border: "1px solid #ddd",
              }}
            >
              <h3>â­ Top Crop</h3>

              <div
                style={{
                  fontSize: "30px",
                  fontWeight: "700",
                  marginTop: "10px",
                }}
              >
                {getCropIcon(topCrop[0])}{" "}
                {topCrop[0]}
              </div>

              <p>
                <strong>
                  {topCrop[1]}
                </strong>{" "}
                records
              </p>

              <p>
                ðŸ’¡ {topCrop[0]} is the dominant
                crop in the available dataset for
                this tehsil.
              </p>
            </div>
          )}

          {/* Crop Ranking */}
          <div style={{ marginTop: "30px" }}>
            <h3>ðŸŒ¾ Crop Ranking</h3>

            {cropEntries.length === 0 ? (
              <p>
                No crop records found.
              </p>
            ) : (
              cropEntries.map(
                ([crop, count], index) => {
                  const percentage =
                    totalCropRecords > 0
                      ? (Number(count) /
                          totalCropRecords) *
                        100
                      : 0;

                  return (
                    <div
                      key={crop}
                      style={{
                        marginBottom: "20px",
                      }}
                    >
                      <div
                        style={{
                          display: "flex",
                          justifyContent:
                            "space-between",
                          marginBottom: "7px",
                        }}
                      >
                        <strong>
                          #{index + 1}{" "}
                          {getCropIcon(crop)}{" "}
                          {crop}
                        </strong>

                        <span>
                          {count} records Â·{" "}
                          {percentage.toFixed(1)}%
                        </span>
                      </div>

                      <div
                        style={{
                          width: "100%",
                          height: "12px",
                          background: "#eee",
                          borderRadius: "10px",
                          overflow: "hidden",
                        }}
                      >
                        <div
                          style={{
                            width: `${percentage}%`,
                            height: "100%",
                            background:
                              "linear-gradient(90deg, #4caf50, #8bc34a)",
                            borderRadius: "10px",
                          }}
                        />
                      </div>
                    </div>
                  );
                }
              )
            )}
          </div>

          {/* Crop Table */}
          <div style={{ marginTop: "30px" }}>
            <h3>ðŸ“Š Crop Information</h3>

            {cropEntries.length > 0 && (
              <div
                style={{
                  overflowX: "auto",
                }}
              >
                <table
                  style={{
                    width: "100%",
                    borderCollapse:
                      "collapse",
                  }}
                >
                  <thead>
                    <tr>
                      <th
                        style={{
                          textAlign: "left",
                          padding: "12px",
                        }}
                      >
                        Rank
                      </th>

                      <th
                        style={{
                          textAlign: "left",
                          padding: "12px",
                        }}
                      >
                        Crop
                      </th>

                      <th
                        style={{
                          textAlign: "left",
                          padding: "12px",
                        }}
                      >
                        Records
                      </th>

                      <th
                        style={{
                          textAlign: "left",
                          padding: "12px",
                        }}
                      >
                        Share
                      </th>
                    </tr>
                  </thead>

                  <tbody>
                    {cropEntries.map(
                      ([crop, count], index) => {
                        const percentage =
                          totalCropRecords > 0
                            ? (Number(count) /
                                totalCropRecords) *
                              100
                            : 0;

                        return (
                          <tr key={crop}>
                            <td
                              style={{
                                padding: "12px",
                              }}
                            >
                              #{index + 1}
                            </td>

                            <td
                              style={{
                                padding: "12px",
                              }}
                            >
                              {getCropIcon(
                                crop
                              )}{" "}
                              {crop}
                            </td>

                            <td
                              style={{
                                padding: "12px",
                              }}
                            >
                              {count}
                            </td>

                            <td
                              style={{
                                padding: "12px",
                              }}
                            >
                              {percentage.toFixed(
                                1
                              )}
                              %
                            </td>
                          </tr>
                        );
                      }
                    )}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          {/* Address */}
          {address && (
            <div
              style={{
                marginTop: "30px",
                padding: "20px",
                borderRadius: "12px",
                border: "1px solid #ddd",
              }}
            >
              <h3>
                ðŸ“Œ Detected Address
              </h3>

              <p>{address}</p>

              {coordinates && (
                <p>
                  <strong>
                    Coordinates:
                  </strong>{" "}
                  {coordinates.latitude.toFixed(
                    5
                  )}
                  ,{" "}
                  {coordinates.longitude.toFixed(
                    5
                  )}
                </p>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default TehsilAnalysis;






