import "./App.css";
import React, { useState } from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";

import Navbar from "./components/Navbar";
import Home from "./pages/Home";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Predict from "./pages/Predict";
import History from "./pages/History";
import Farm from "./pages/Farm";
import MandiPrices from "./pages/MandiPrices";
import CropDisease from "./pages/CropDisease";
import ProfitEstimator from "./pages/ProfitEstimator";
import TehsilAnalysis from "./pages/TehsilAnalysis";
import Weather from "./pages/Weather";

function App() {
  const [user, setUser] = useState(null);

  return (
    <BrowserRouter>
      <Navbar user={user} setUser={setUser} />

      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login setUser={setUser} />} />
        <Route path="/register" element={<Register />} />
        <Route path="/predict" element={<Predict user={user} />} />
        <Route path="/history" element={<History />} />
        <Route path="/farm" element={<Farm user={user} setUser={setUser} />} />
        <Route path="/mandi-prices" element={<MandiPrices user={user} />} />
        <Route path="/disease" element={<CropDisease user={user} />} />
        <Route path="/crop-disease" element={<CropDisease user={user} />} />
        <Route path="/profit-estimator" element={<ProfitEstimator user={user} />} />
        <Route path="/tehsil-analysis" element={<TehsilAnalysis user={user} />} />
        <Route path="/weather" element={<Weather user={user} />} />

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
