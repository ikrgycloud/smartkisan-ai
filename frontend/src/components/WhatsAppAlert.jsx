import React from "react";
import { sendWhatsAppWeather, sendWhatsAppMandi, sendWhatsAppProfit, sendWhatsAppTehsil } from "../services/api";

export default function WhatsAppAlert({ type = "weather", data = {} }) {
  const [loading, setLoading] = React.useState(false);
  const [message, setMessage] = React.useState("");

  const send = async () => {
    setLoading(true);
    setMessage("");

    try {
      const user = JSON.parse(localStorage.getItem("user") || "{}");

      if (type === "weather") {
        await sendWhatsAppWeather({
          farmer_name: user.name || "Farmer",
          city: data.city || "Hyderabad",
          temperature: Number(data.temperature || 0),
          humidity: Number(data.humidity || 0),
          rainfall_mm: Number(data.rainfall_mm || 0),
          wind_kmh: Number(data.wind_kmh || 0),
          advisory: data.advisory || "Check current weather before irrigation, spraying and fertilizer application."
        });
      }

      if (type === "profit") {
        await sendWhatsAppProfit({
          farmer_name: user.name || "Farmer",
          crop: data.crop || "Crop",
          acres: Number(data.acres || 0),
          total_yield: Number(data.total_yield || 0),
          revenue: Number(data.revenue || 0),
          total_cost: Number(data.total_cost || 0),
          profit: Number(data.profit || 0),
          profit_per_acre: Number(data.profit_per_acre || 0), mandi_price: Number(data.mandi_price || 0)
        });
      }

      if (type === "tehsil") {
        await sendWhatsAppTehsil({
          state: data.state || "State",
          district: data.district || "District",
          tehsil: data.tehsil || "Tehsil",
          top_crop: data.top_crop || "Unknown",
          crop_count: Number(data.crop_count || 0)
        });
      }

      if (type === "mandi") {
        await sendWhatsAppMandi({
          farmer_name: user.name || "Farmer",
          crop: data.crop || "Crop",
          mandi_name: data.mandi_name || data.market || "Mandi",
          price: Number(data.price || data.modal || 0),
          msp: data.msp == null ? null : Number(data.msp),
          state: data.state || null
        });
      }

      setMessage("WhatsApp notification sent successfully.");
    } catch (err) {
      setMessage(
        err?.response?.data?.detail ||
        "Unable to send WhatsApp notification."
      );
    } finally {
      setLoading(false);
    }
  };



  return (
    <div style={{ marginTop: "24px", padding: "16px", textAlign: "center", display: "block", visibility: "visible" }}>
      <button
        className="btn btn-primary"
        onClick={send}
        disabled={loading}
      >
        {loading ? "Sending..." : "Send Alert to WhatsApp"}
      </button>

      {message && (
        <p style={{ marginTop: "12px" }}>
          {message}
        </p>
      )}
    </div>
  );
}



