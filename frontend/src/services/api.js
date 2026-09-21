
import axios from "axios";

const API = axios.create({
  baseURL: process.env.REACT_APP_API_URL || "http://127.0.0.1:8001",
  timeout: 30000,
});

// ============================================================
// REQUEST INTERCEPTOR
// ============================================================

API.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");

    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    if (config.data instanceof FormData) {
      delete config.headers["Content-Type"];
    }

    return config;
  },
  (error) => Promise.reject(error)
);

// ============================================================
// AUTHENTICATION
// ============================================================

export const register = (data) => {
  return API.post("/register", data);
};

export const login = (data) => {
  return API.post(
    "/login",
    new URLSearchParams(data),
    {
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
    }
  );
};

export const getMe = () => {
  return API.get("/me");
};

// ============================================================
// CROP PREDICTION
// ============================================================

export const predict = (data) => {
  return API.post("/predict", data);
};

export const predictGuest = (data) => {
  return API.post("/predict/guest", data);
};

// ============================================================
// HISTORY
// ============================================================

export const getHistory = () => {
  return API.get("/history");
};

export const deletePrediction = (id) => {
  return API.delete(`/history/${id}`);
};

// ============================================================
// FARM
// ============================================================

export const getFarm = () => {
  return API.get("/farm");
};

export const saveFarm = (data) => {
  return API.post("/farm", data);
};

export const updateFarm = (data) => {
  return API.put("/farm", data);
};

// ============================================================
// MANDI PRICES
// ============================================================

export const getMandiPrices = (params = {}) => {
  return API.get("/mandi-prices", { params });
};

// ============================================================
// TEHSIL ANALYSIS
// ============================================================

export const getTehsilOptions = (params = {}) => {
  return API.get("/tehsil-options", { params });
};

export const getTehsilAnalysis = (params) => {
  return API.get("/tehsil-analysis", { params });
};

export const detectLocation = (latitude, longitude) => {
  return API.get("/location/detect", {
    params: {
      latitude,
      longitude,
    },
  });
};

// ============================================================
// STATISTICS
// ============================================================

export const getStats = () => {
  return API.get("/stats");
};

// ============================================================
// CROP DISEASE
// ============================================================

export const analyzeDisease = (formData) => {
  return API.post("/disease/analyze", formData);
};

// ============================================================
// PROFIT ESTIMATOR
// ============================================================

export const estimateProfit = (data) => {
  return API.post("/profit-estimate", data);
};

// ============================================================
// WHATSAPP NOTIFICATIONS
// ============================================================

export const sendWhatsAppCrop = (data) => {
  return API.post("/notify/crop", data);
};

export const sendWhatsAppMandi = (data) => {
  return API.post("/notify/mandi", data);
};

export const sendWhatsAppWeather = (data) => {
  return API.post("/notify/weather", data);
};

// ============================================================
// DEFAULT API
// ============================================================

export default API;



export const sendWhatsAppDisease = (data) => API.post('/notify/disease', data);

export const sendWhatsAppProfit = (data) => API.post('/notify/profit', data);
export const sendWhatsAppTehsil = (data) => API.post('/notify/tehsil', data);


export const addWhatsAppRecipient = (data) => API.post('/notify/recipients', data);
export const getWhatsAppRecipients = () => API.get('/notify/recipients');
export const deleteWhatsAppRecipient = (id) => API.delete("/notify/recipients/" + id);

