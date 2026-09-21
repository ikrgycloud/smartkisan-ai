import React, { useEffect, useState } from "react";
import WhatsAppAlert from "../components/WhatsAppAlert";

const Weather = () => {
  const [weather, setWeather] = useState(null);
  const [error, setError] = useState("");

  useEffect(() => {
    const loadWeather = async () => {
      try {
        const response = await fetch(
          "https://api.open-meteo.com/v1/forecast?latitude=17.3850&longitude=78.4867&current=temperature_2m,relative_humidity_2m,precipitation,wind_speed_10m&daily=temperature_2m_max,temperature_2m_min,precipitation_sum,rain_sum,wind_speed_10m_max&timezone=Asia%2FKolkata"
        );

        if (!response.ok) {
          throw new Error("Weather service unavailable");
        }

        const data = await response.json();
        setWeather(data);
      } catch (err) {
        setError("Unable to load live weather.");
      }
    };

    loadWeather();
  }, []);

  return (
    <div className="container" style={{ padding: "30px 20px 60px" }}>
      <div className="page-header">
        <h1>🌦️ Weather Intelligence</h1>
        <p>Live weather and 2026 agricultural weather outlook for Hyderabad.</p>
      </div>

      {error && <div className="alert-error">{error}</div>}

      {weather && (
        <>
          <div className="card" style={{ padding: "24px", marginBottom: "24px" }}>
            <h2>🔴 Live Weather</h2>
            <p>Hyderabad, Telangana</p>

            <div className="grid-2">
              <div>
                <h3>{weather.current.temperature_2m} °C</h3>
                <p>Temperature</p>
              </div>

              <div>
                <h3>{weather.current.relative_humidity_2m}%</h3>
                <p>Humidity</p>
              </div>

              <div>
                <h3>{weather.current.precipitation} mm</h3>
                <p>Rainfall</p>
              </div>

              <div>
                <h3>{weather.current.wind_speed_10m} km/h</h3>
                <p>Wind Speed</p>
              </div>
            </div>
          </div>

          <div className="card" style={{ padding: "24px" }}>
            <h2>📅 2026 Weather Outlook</h2>
            <p>Upcoming daily weather conditions and rainfall outlook.</p>

            <div style={{ overflowX: "auto" }}>
              <table>
                <thead>
                  <tr>
                    <th style={{padding:'10px'}}>Date</th>
                    <th style={{padding:'10px'}}>Min °C</th>
                    <th style={{padding:'10px'}}>Max °C</th>
                    <th style={{padding:'10px'}}>Rain mm</th>
                    <th style={{padding:'10px'}}>Wind km/h</th>
                  </tr>
                </thead>

                <tbody>
                  {weather.daily.time.map((date, index) => (
                    <tr key={date}>
                      <td>{date}</td>
                      <td>{weather.daily.temperature_2m_min[index]}</td>
                      <td>{weather.daily.temperature_2m_max[index]}</td>
                      <td>{weather.daily.precipitation_sum[index]}</td>
                      <td>{weather.daily.wind_speed_10m_max[index]}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          <div className="card" style={{ padding: "24px", marginTop: "24px" }}>
            <h2>🌾 2026 Agricultural Weather Outlook</h2>
            <p>Seasonal farming guidance. Actual weather may vary.</p>

            <div className="grid-2">
              <div>
                <h3>🌧️ Monsoon</h3>
                <p>June – September</p>
                <p>Monitor rainfall, drainage and soil moisture.</p>
              </div>

              <div>
                <h3>🌱 Rabi</h3>
                <p>October – January</p>
                <p>Plan crops for cooler and relatively dry conditions.</p>
              </div>

              <div>
                <h3>☀️ Summer</h3>
                <p>February – May</p>
                <p>Monitor heat stress and irrigation requirements.</p>
              </div>

              <div>
                <h3>💧 Farmer Advisory</h3>
                <p>Check live weather before irrigation, spraying and fertilizer application.</p>
              </div>
            </div>
          </div>
        </>
      )}

      <WhatsAppAlert
        type="weather"
        data={{
          city: "Hyderabad",
          temperature: weather?.current?.temperature_2m,
          humidity: weather?.current?.relative_humidity_2m,
          rainfall_mm: weather?.current?.precipitation,
          wind_kmh: weather?.current?.wind_speed_10m
        }}
      />
    </div>
  );
};

export default Weather;
