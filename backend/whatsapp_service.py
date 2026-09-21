import os
import re
from pathlib import Path
import httpx
from dotenv import load_dotenv
from concurrent.futures import ThreadPoolExecutor

ENV_PATH = Path(__file__).resolve().parent.parent / ".env"
WHATSAPP_PHONE_ID = "1267685809768077"
WHATSAPP_API_URL = f"https://graph.facebook.com/v19.0/{WHATSAPP_PHONE_ID}/messages"

def _get_token():
    load_dotenv(ENV_PATH, override=True)
    return os.getenv("WHATSAPP_TOKEN", "")

def _e164(phone):
    digits = re.sub(r"\D", "", str(phone))
    if digits.startswith("91") and len(digits) == 12:
        return digits
    if len(digits) == 10 and digits[0] in "6789":
        return "91" + digits
    raise ValueError("Invalid Indian mobile number.")

def _send(payload):
    token = _get_token()
    headers = {"Authorization": f"Bearer {token}", "Content-Type": "application/json"}
    try:
        response = httpx.post(WHATSAPP_API_URL, json=payload, headers=headers, timeout=15)
        print("WHATSAPP TO:", payload.get("to"))
        print("WHATSAPP RESPONSE:", response.status_code, response.text)
        response.raise_for_status()
        return response.json()
    except httpx.HTTPStatusError as exc:
        raise RuntimeError(f"WhatsApp API error: {exc.response.text}") from exc
    except httpx.RequestError as exc:
        raise RuntimeError(f"WhatsApp connection error: {exc}") from exc

def _text_message(phone, body):
    return _send({"messaging_product": "whatsapp", "to": _e164(phone), "type": "text", "text": {"body": body}})



def send_to_multiple_numbers(phones, sender):
    def send_one(phone):
        try:
            return sender(phone)
        except Exception as exc:
            return {'phone': phone, 'error': str(exc)}

    with ThreadPoolExecutor(max_workers=max(1, len(phones))) as executor:
        return list(executor.map(send_one, phones))
def notify_crop_recommendation(phone, farmer_name, top_crop, confidence, top3, advice=None):
    payload = {
        "messaging_product": "whatsapp",
        "to": _e164(phone),
        "type": "template",
        "template": {
            "name": "smart_kisan_crop_alert",
            "language": {"code": "en"},
            "components": [
                {
                    "type": "body",
                    "parameters": [
                        {"type": "text", "text": str(farmer_name)},
                        {"type": "text", "text": str(top_crop)},
                        {"type": "text", "text": str(round(confidence * 100, 1))}
                    ]
                }
            ]
        }
    }
    return _send(payload)
def notify_mandi_price_alert(phone, farmer_name, crop, mandi_name, price, msp=None, state=None):
    return _send({
        "messaging_product": "whatsapp",
        "to": _e164(phone),
        "type": "template",
        "template": {
            "name": "smart_kisan_mandi_alert",
            "language": {"code": "en"},
            "components": [
                {
                    "type": "body",
                    "parameters": [
                        {"type": "text", "text": str(farmer_name)},
                        {"type": "text", "text": str(crop)},
                        {"type": "text", "text": str(mandi_name if not state else mandi_name + ", " + state)},
                        {"type": "text", "text": f"{price:,.0f}"},
                        {"type": "text", "text": f"{msp:,.0f}" if msp is not None else "N/A"}
                    ]
                }
            ]
        }
    })
def notify_weather_alert(phone, farmer_name, city, temperature, humidity, rainfall_mm, wind_kmh, advisory=None):
    return _send({
        "messaging_product": "whatsapp",
        "to": _e164(phone),
        "type": "template",
        "template": {
            "name": "smart_kisan_weather_alert",
            "language": {"code": "en"},
            "components": [
                {
                    "type": "body",
                    "parameters": [
                        {"type": "text", "text": str(farmer_name)},
                        {"type": "text", "text": str(city)},
                        {"type": "text", "text": f"{temperature:.1f}"},
                        {"type": "text", "text": f"{humidity:.0f}"},
                        {"type": "text", "text": f"{rainfall_mm:.1f}"},
                        {"type": "text", "text": f"{wind_kmh:.1f}"}
                    ]
                }
            ]
        }
    })
def notify_disease_alert(phone, farmer_name, crop, status, disease, confidence, treatment=None, prevention=None):
    treatment_text = "See Smart Kisan app"
    if treatment:
        treatment_text = "; ".join(treatment)

    return _send({
        "messaging_product": "whatsapp",
        "to": _e164(phone),
        "type": "template",
        "template": {
            "name": "smart_kisan_disease_alert",
            "language": {"code": "en"},
            "components": [
                {
                    "type": "body",
                    "parameters": [
                        {"type": "text", "text": str(farmer_name)},
                        {"type": "text", "text": str(crop)},
                        {"type": "text", "text": str(disease)},
                        {"type": "text", "text": str(status)},
                        {"type": "text", "text": str(treatment_text)}
                    ]
                }
            ]
        }
    })
def notify_tehsil_alert(phone, farmer_name, state, district, tehsil, top_crop, crop_count):
    body = (
        f"Smart Kisan Tehsil Analysis\n\n"
        f"Farmer: {farmer_name}\n"
        f"State: {state}\n"
        f"District: {district}\n"
        f"Tehsil: {tehsil}\n"
        f"Top Crop: {top_crop}\n"
        f"Crop Records: {crop_count}"
    )
    return _text_message(phone, body)

def notify_profit_alert(phone, farmer_name, crop, acres, total_yield, revenue, total_cost, profit, profit_per_acre):
    return _send({
        "messaging_product": "whatsapp",
        "to": _e164(phone),
        "type": "template",
        "template": {
            "name": "smart_kisan_profit_alert",
            "language": {"code": "en"},
            "components": [
                {
                    "type": "body",
                    "parameters": [
                        {"type": "text", "text": str(farmer_name)},
                        {"type": "text", "text": str(crop)},
                        {"type": "text", "text": "See app"},
                        {"type": "text", "text": f"{revenue:,.0f}"},
                        {"type": "text", "text": "N/A"},
                        {"type": "text", "text": "N/A"}
                    ]
                }
            ]
        }
    })

def send_crop_template(phone, farmer_name, top_crop, confidence):
    """Use approved template — works for ANY number without daily opt-in."""
    return _send({
        "messaging_product": "whatsapp",
        "to": _e164(phone),
        "type": "template",
        "template": {
            "name": "smart_kisan_crop_alert",
            "language": {"code": "en"},
            "components": [{
                "type": "body",
                "parameters": [
                    {"type": "text", "text": str(farmer_name)},
                    {"type": "text", "text": str(top_crop)},
                    {"type": "text", "text": f"{float(confidence)*100:.1f}"},
                ]
            }]
        }
    })
