import React from "react";
import { addWhatsAppRecipient, getWhatsAppRecipients, deleteWhatsAppRecipient } from "../services/api";

export default function WhatsAppNumbers() {
  const [recipients, setRecipients] = React.useState([]);
  const [name, setName] = React.useState("");
  const [phone, setPhone] = React.useState("");
  const [message, setMessage] = React.useState("");

  const loadRecipients = async () => {
    try {
      const response = await getWhatsAppRecipients();
      setRecipients(response.data || []);
    } catch {
      setMessage("Unable to load WhatsApp numbers.");
    }
  };

  React.useEffect(() => {
    loadRecipients();
  }, []);

  const addNumber = async () => {
    if (!phone.trim()) {
      setMessage("Please enter a WhatsApp number.");
      return;
    }

    try {
      await addWhatsAppRecipient({
        name: name.trim() || null,
        phone: phone.trim()
      });
      setName("");
      setPhone("");
      setMessage("WhatsApp number added successfully.");
      await loadRecipients();
    } catch (err) {
      setMessage(typeof err?.response?.data?.detail === "string" ? err.response.data.detail : "WhatsApp number must contain exactly 10 digits.");
    }
  };

  const removeNumber = async (id) => {
    try {
      await deleteWhatsAppRecipient(id);
      setMessage("WhatsApp number removed.");
      await loadRecipients();
    } catch (err) {
      setMessage(err?.response?.data?.detail || "Unable to remove WhatsApp number.");
    }
  };

  return (
    <div style={{ marginTop: "24px", padding: "20px", border: "1px solid #ddd", borderRadius: "12px" }}>
      <h3>WhatsApp Numbers</h3>

      <input
        type="text"
        placeholder="Name (optional)"
        value={name}
        onChange={(e) => setName(e.target.value)}
        style={{ display: "block", width: "100%", marginBottom: "10px", padding: "10px" }}
      />

      <input
        type="tel"
        placeholder="WhatsApp number"
        value={phone}
        onChange={(e) => setPhone(e.target.value)}
        style={{ display: "block", width: "100%", marginBottom: "10px", padding: "10px" }}
      />

      <button className="btn btn-primary" onClick={addNumber}>
        Add WhatsApp Number
      </button>

      {message && <p style={{ marginTop: "12px" }}>{message}</p>}

      {recipients.length > 0 && (
        <div style={{ marginTop: "16px" }}>
          {recipients.map((recipient) => (
            <div key={recipient.id} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "10px 0", borderBottom: "1px solid #eee" }}>
              <span>
                {recipient.name ? `${recipient.name}: ` : ""}
                {recipient.phone}
              </span>
              <button type="button" onClick={() => removeNumber(recipient.id)}>
                Remove
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
