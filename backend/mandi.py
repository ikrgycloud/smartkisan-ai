# smart_kisan_backend/mandi.py

"""
Mandi price data for Smart Kisan.

NOTE:
The prices in this file are static demonstration/project data.
They are NOT live market prices.
"""

MANDI_DATA = {
    "Rice": [
        {"state": "Andhra Pradesh", "market": "Vijayawada", "min": 1850, "max": 2150, "modal": 2000, "unit": "Quintal"},
        {"state": "Arunachal Pradesh", "market": "Itanagar", "min": 1900, "max": 2300, "modal": 2100, "unit": "Quintal"},
        {"state": "Assam", "market": "Guwahati", "min": 1800, "max": 2200, "modal": 2000, "unit": "Quintal"},
        {"state": "Bihar", "market": "Patna", "min": 1750, "max": 2150, "modal": 1950, "unit": "Quintal"},
        {"state": "Chhattisgarh", "market": "Raipur", "min": 1750, "max": 2150, "modal": 1950, "unit": "Quintal"},
        {"state": "Goa", "market": "Panaji", "min": 1900, "max": 2300, "modal": 2100, "unit": "Quintal"},
        {"state": "Gujarat", "market": "Ahmedabad", "min": 1850, "max": 2250, "modal": 2050, "unit": "Quintal"},
        {"state": "Haryana", "market": "Karnal", "min": 1900, "max": 2300, "modal": 2100, "unit": "Quintal"},
        {"state": "Himachal Pradesh", "market": "Shimla", "min": 1900, "max": 2300, "modal": 2100, "unit": "Quintal"},
        {"state": "Jharkhand", "market": "Ranchi", "min": 1750, "max": 2150, "modal": 1950, "unit": "Quintal"},
        {"state": "Karnataka", "market": "Bengaluru", "min": 1850, "max": 2250, "modal": 2050, "unit": "Quintal"},
        {"state": "Kerala", "market": "Palakkad", "min": 1900, "max": 2300, "modal": 2100, "unit": "Quintal"},
        {"state": "Madhya Pradesh", "market": "Bhopal", "min": 1800, "max": 2200, "modal": 2000, "unit": "Quintal"},
        {"state": "Maharashtra", "market": "Nagpur", "min": 1850, "max": 2250, "modal": 2050, "unit": "Quintal"},
        {"state": "Manipur", "market": "Imphal", "min": 1900, "max": 2300, "modal": 2100, "unit": "Quintal"},
        {"state": "Meghalaya", "market": "Shillong", "min": 1950, "max": 2350, "modal": 2150, "unit": "Quintal"},
        {"state": "Mizoram", "market": "Aizawl", "min": 1950, "max": 2350, "modal": 2150, "unit": "Quintal"},
        {"state": "Nagaland", "market": "Dimapur", "min": 1950, "max": 2350, "modal": 2150, "unit": "Quintal"},
        {"state": "Odisha", "market": "Cuttack", "min": 1800, "max": 2200, "modal": 2000, "unit": "Quintal"},
        {"state": "Punjab", "market": "Amritsar", "min": 2000, "max": 2400, "modal": 2200, "unit": "Quintal"},
        {"state": "Rajasthan", "market": "Jaipur", "min": 1850, "max": 2250, "modal": 2050, "unit": "Quintal"},
        {"state": "Sikkim", "market": "Gangtok", "min": 1950, "max": 2350, "modal": 2150, "unit": "Quintal"},
        {"state": "Tamil Nadu", "market": "Thanjavur", "min": 1900, "max": 2300, "modal": 2100, "unit": "Quintal"},
        {"state": "Telangana", "market": "Hyderabad", "min": 1800, "max": 2200, "modal": 2050, "unit": "Quintal"},
        {"state": "Tripura", "market": "Agartala", "min": 1850, "max": 2250, "modal": 2050, "unit": "Quintal"},
        {"state": "Uttar Pradesh", "market": "Lucknow", "min": 1800, "max": 2200, "modal": 2000, "unit": "Quintal"},
        {"state": "Uttarakhand", "market": "Dehradun", "min": 1900, "max": 2300, "modal": 2100, "unit": "Quintal"},
        {"state": "West Bengal", "market": "Kolkata", "min": 1750, "max": 2100, "modal": 1950, "unit": "Quintal"},
    ],

    "Wheat": [
        {"state": "Haryana", "market": "Karnal", "min": 2050, "max": 2450, "modal": 2250, "unit": "Quintal"},
        {"state": "Madhya Pradesh", "market": "Bhopal", "min": 1900, "max": 2300, "modal": 2100, "unit": "Quintal"},
        {"state": "Punjab", "market": "Ludhiana", "min": 2100, "max": 2500, "modal": 2300, "unit": "Quintal"},
        {"state": "Rajasthan", "market": "Jaipur", "min": 2000, "max": 2400, "modal": 2200, "unit": "Quintal"},
        {"state": "Uttar Pradesh", "market": "Agra", "min": 1950, "max": 2350, "modal": 2150, "unit": "Quintal"},
        {"state": "Gujarat", "market": "Ahmedabad", "min": 1950, "max": 2350, "modal": 2150, "unit": "Quintal"},
        {"state": "Maharashtra", "market": "Nagpur", "min": 1950, "max": 2350, "modal": 2150, "unit": "Quintal"},
        {"state": "Bihar", "market": "Patna", "min": 1900, "max": 2300, "modal": 2100, "unit": "Quintal"},
    ],

    "Maize": [
        {"state": "Telangana", "market": "Nizamabad", "min": 1400, "max": 1800, "modal": 1600, "unit": "Quintal"},
        {"state": "Karnataka", "market": "Davangere", "min": 1350, "max": 1750, "modal": 1550, "unit": "Quintal"},
        {"state": "Bihar", "market": "Patna", "min": 1300, "max": 1700, "modal": 1500, "unit": "Quintal"},
        {"state": "Maharashtra", "market": "Pune", "min": 1400, "max": 1800, "modal": 1600, "unit": "Quintal"},
        {"state": "Madhya Pradesh", "market": "Indore", "min": 1350, "max": 1750, "modal": 1550, "unit": "Quintal"},
        {"state": "Rajasthan", "market": "Kota", "min": 1400, "max": 1800, "modal": 1600, "unit": "Quintal"},
        {"state": "Uttar Pradesh", "market": "Kanpur", "min": 1350, "max": 1750, "modal": 1550, "unit": "Quintal"},
    ],

    "Cotton": [
        {"state": "Telangana", "market": "Warangal", "min": 5500, "max": 6500, "modal": 6000, "unit": "Quintal"},
        {"state": "Gujarat", "market": "Rajkot", "min": 5800, "max": 6800, "modal": 6300, "unit": "Quintal"},
        {"state": "Maharashtra", "market": "Nagpur", "min": 5600, "max": 6600, "modal": 6100, "unit": "Quintal"},
        {"state": "Punjab", "market": "Bathinda", "min": 5700, "max": 6700, "modal": 6200, "unit": "Quintal"},
        {"state": "Haryana", "market": "Hisar", "min": 5600, "max": 6600, "modal": 6100, "unit": "Quintal"},
        {"state": "Madhya Pradesh", "market": "Indore", "min": 5500, "max": 6500, "modal": 6000, "unit": "Quintal"},
        {"state": "Karnataka", "market": "Hubli", "min": 5400, "max": 6400, "modal": 5900, "unit": "Quintal"},
    ],

    "Mustard": [
        {"state": "Rajasthan", "market": "Jaipur", "min": 4800, "max": 5800, "modal": 5300, "unit": "Quintal"},
        {"state": "Haryana", "market": "Hisar", "min": 4900, "max": 5900, "modal": 5400, "unit": "Quintal"},
        {"state": "Uttar Pradesh", "market": "Agra", "min": 4700, "max": 5700, "modal": 5200, "unit": "Quintal"},
        {"state": "Madhya Pradesh", "market": "Indore", "min": 4800, "max": 5800, "modal": 5300, "unit": "Quintal"},
        {"state": "Gujarat", "market": "Ahmedabad", "min": 4700, "max": 5700, "modal": 5200, "unit": "Quintal"},
    ],

    "Pulses": [
        {"state": "Madhya Pradesh", "market": "Indore", "min": 4500, "max": 5500, "modal": 5000, "unit": "Quintal"},
        {"state": "Rajasthan", "market": "Jodhpur", "min": 4400, "max": 5400, "modal": 4900, "unit": "Quintal"},
        {"state": "Maharashtra", "market": "Latur", "min": 4600, "max": 5600, "modal": 5100, "unit": "Quintal"},
        {"state": "Karnataka", "market": "Gulbarga", "min": 4500, "max": 5500, "modal": 5000, "unit": "Quintal"},
        {"state": "Uttar Pradesh", "market": "Lucknow", "min": 4400, "max": 5400, "modal": 4900, "unit": "Quintal"},
    ],

    "Soybean": [
        {"state": "Madhya Pradesh", "market": "Indore", "min": 3800, "max": 4800, "modal": 4300, "unit": "Quintal"},
        {"state": "Maharashtra", "market": "Akola", "min": 3900, "max": 4900, "modal": 4400, "unit": "Quintal"},
        {"state": "Rajasthan", "market": "Kota", "min": 3800, "max": 4800, "modal": 4300, "unit": "Quintal"},
    ],

    "Onion": [
        {"state": "Maharashtra", "market": "Nashik", "min": 800, "max": 1800, "modal": 1300, "unit": "Quintal"},
        {"state": "Karnataka", "market": "Belgaum", "min": 900, "max": 1900, "modal": 1400, "unit": "Quintal"},
        {"state": "Gujarat", "market": "Rajkot", "min": 850, "max": 1850, "modal": 1350, "unit": "Quintal"},
        {"state": "Rajasthan", "market": "Jaipur", "min": 900, "max": 1900, "modal": 1400, "unit": "Quintal"},
    ],

    "Tomato": [
        {"state": "Andhra Pradesh", "market": "Madanapalle", "min": 500, "max": 2000, "modal": 1200, "unit": "Quintal"},
        {"state": "Karnataka", "market": "Kolar", "min": 600, "max": 2100, "modal": 1300, "unit": "Quintal"},
        {"state": "Telangana", "market": "Hyderabad", "min": 700, "max": 2200, "modal": 1400, "unit": "Quintal"},
        {"state": "Maharashtra", "market": "Pune", "min": 600, "max": 2000, "modal": 1300, "unit": "Quintal"},
    ],

    "Potato": [
        {"state": "Uttar Pradesh", "market": "Agra", "min": 600, "max": 1200, "modal": 900, "unit": "Quintal"},
        {"state": "West Bengal", "market": "Hooghly", "min": 700, "max": 1300, "modal": 1000, "unit": "Quintal"},
        {"state": "Bihar", "market": "Patna", "min": 650, "max": 1250, "modal": 950, "unit": "Quintal"},
        {"state": "Punjab", "market": "Jalandhar", "min": 700, "max": 1300, "modal": 1000, "unit": "Quintal"},
    ],
}


# MSP values supplied for the project.
# These are not live market prices.
MSP_2024 = {
    "Rice": 2183,
    "Wheat": 2275,
    "Maize": 1850,
    "Cotton": 7020,
    "Mustard": 5650,
    "Pulses": 6000,
    "Soybean": 4600,
    "Onion": None,
    "Tomato": None,
    "Potato": None,
}


def get_mandi_data():
    """Return mandi prices and MSP data."""
    return {
        "data": MANDI_DATA,
        "msp": MSP_2024,
    }