import React, { useState } from "react";
import API, { sendWhatsAppDisease } from "../services/api";

export default function CropDisease() {
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState("");
  const [result, setResult] = useState(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [whatsappMessage, setWhatsappMessage] = useState("");

  const handleFileChange = (event) => {
    const selected = event.target.files && event.target.files[0];

    setFile(selected || null);
    setResult(null);
    setError("");

    if (selected) {
      setPreview(URL.createObjectURL(selected));
    } else {
      setPreview("");
    }
  };

  const analyzeImage = async () => {
    if (!file) {
      setError("Please select a crop or leaf image.");
      return;
    }

    setLoading(true);
    setError("");
    setResult(null);

    try {
      const formData = new FormData();
      formData.append("file", file);

      const response = await API.post("/disease/analyze", formData);

      setResult(response.data);
    } catch (err) {
      console.error("Disease analysis error:", err);

      const detail =
        err &&
        err.response &&
        err.response.data &&
        err.response.data.detail;

      setError(
        typeof detail === "string"
          ? detail
          : "Disease analysis failed. Please try another image."
      );
    } finally {
      setLoading(false);
    }
  };

  const sendDiseaseWhatsApp = async () => {
    try {
      setWhatsappMessage("");
      const user = JSON.parse(localStorage.getItem("user") || "{}");
      await sendWhatsAppDisease({
        farmer_name: user.name || "Farmer",
        crop: result.crop || "Unknown",
        status: result.status || "Uncertain",
        disease: result.disease || "Unknown",
        confidence: Number(result.confidence || 0),
        treatment: Array.isArray(result.treatment) ? result.treatment : [],
        prevention: Array.isArray(result.prevention) ? result.prevention : []
      });
      setWhatsappMessage("WhatsApp notification sent successfully.");
    } catch (err) {
      setWhatsappMessage(
        err?.response?.data?.detail ||
        "Unable to send WhatsApp notification."
      );
    }
  };
  return (
    <main className="page-container">
      <h1>Crop Disease Detection</h1>

      <p>
        Upload a clear crop or leaf image for local AI-based disease
        classification. No Google or paid API is required.
      </p>

      <section className="card">
        <input
          type="file"
          accept="image/png,image/jpeg,image/jpg,image/webp"
          onChange={handleFileChange}
        />

        {preview && (
          <div style={{ marginTop: "20px" }}>
            <img
              src={preview}
              alt="Selected crop"
              style={{
                maxWidth: "420px",
                width: "100%",
                borderRadius: "12px",
                display: "block"
              }}
            />
          </div>
        )}

        <button
          className="btn btn-primary"
          type="button"
          onClick={analyzeImage}
          disabled={!file || loading}
          style={{ marginTop: "20px" }}
        >
          {loading ? "Analyzing..." : "Analyze Image"}
        </button>
      </section>

      {error && (
        <div className="alert alert-error" style={{ marginTop: "20px" }}>
          {error}
        </div>
      )}

      {result && (
        <section className="card" style={{ marginTop: "20px" }}>
          <h2>Analysis Result</h2>

          <p>
            <strong>Crop:</strong> {result.crop || "Unknown"}
          </p>

          <p>
            <strong>Status:</strong> {result.status || "Uncertain"}
          </p>

          <p>
            <strong>Disease:</strong> {result.disease || "Unknown"}
          </p>

          <p>
            <strong>Confidence:</strong> {result.confidence ?? 0}%
          </p>

          {Array.isArray(result.symptoms) && result.symptoms.length > 0 && (
            <>
              <h3>Symptoms</h3>
              <ul>
                {result.symptoms.map((item, index) => (
                  <li key={index}>{item}</li>
                ))}
              </ul>
            </>
          )}

          {Array.isArray(result.treatment) && result.treatment.length > 0 && (
            <>
              <h3>Treatment</h3>
              <ul>
                {result.treatment.map((item, index) => (
                  <li key={index}>{item}</li>
                ))}
              </ul>
            </>
          )}

          {Array.isArray(result.prevention) && result.prevention.length > 0 && (
            <>
              <h3>Prevention</h3>
              <ul>
                {result.prevention.map((item, index) => (
                  <li key={index}>{item}</li>
                ))}
              </ul>
            </>
          )}

          {localStorage.getItem("token") && (
            <div className="card" style={{ marginTop: "24px", textAlign: "center" }}>
              <button className="btn btn-primary" type="button" onClick={sendDiseaseWhatsApp}>
                {String.fromCodePoint(0x1F4F1)} Send Alert to WhatsApp</button>
              {whatsappMessage && <p style={{ marginTop: "12px" }}>{whatsappMessage}</p>}
            </div>
          )}

          {result.notes && (
            <>
              <h3>Notes</h3>
              <p>{result.notes}</p>
            </>
          )}
        </section>
      )}
    </main>
  );
}





