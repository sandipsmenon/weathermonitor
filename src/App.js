import React, { useState, useCallback } from "react";

import Titles from "./components/Titles";
import Form from "./components/Form";
import Weather from "./components/Weather";

const API_KEY = process.env.REACT_APP_WEATHER_API_KEY;
const API_BASE_URL = "https://api.openweathermap.org/data/2.5/weather";

const CITY_PATTERN = /^[a-zA-Z\s\-'.]+$/;
const COUNTRY_PATTERN = /^[a-zA-Z]{2,3}$/;

function validateInputs(city, country) {
  if (!city || !city.trim()) {
    return "Please enter a city name.";
  }
  if (!country || !country.trim()) {
    return "Please enter a country code.";
  }
  if (city.trim().length > 100) {
    return "City name is too long.";
  }
  if (!CITY_PATTERN.test(city.trim())) {
    return "City name contains invalid characters.";
  }
  if (!COUNTRY_PATTERN.test(country.trim())) {
    return "Country code must be 2–3 letters (e.g. US, GB, AUS).";
  }
  return null;
}

function App() {
  const [weather, setWeather] = useState({
    temperature: undefined,
    city: undefined,
    country: undefined,
    humidity: undefined,
    description: undefined,
    icon: undefined,
    windSpeed: undefined,
  });
  const [error, setError] = useState(undefined);
  const [loading, setLoading] = useState(false);

  const getWeather = useCallback(async (e) => {
    e.preventDefault();

    const city = e.target.elements.city.value.trim();
    const country = e.target.elements.country.value.trim();

    const validationError = validateInputs(city, country);
    if (validationError) {
      setError(validationError);
      setWeather({
        temperature: undefined,
        city: undefined,
        country: undefined,
        humidity: undefined,
        description: undefined,
        icon: undefined,
        windSpeed: undefined,
      });
      return;
    }

    if (!API_KEY) {
      setError("API key is not configured. Please set REACT_APP_WEATHER_API_KEY.");
      return;
    }

    setLoading(true);
    setError(undefined);
    setWeather({
      temperature: undefined,
      city: undefined,
      country: undefined,
      humidity: undefined,
      description: undefined,
      icon: undefined,
      windSpeed: undefined,
    });

    try {
      const url = `${API_BASE_URL}?q=${encodeURIComponent(city)},${encodeURIComponent(country)}&appid=${encodeURIComponent(API_KEY)}&units=metric`;
      const response = await fetch(url);
      const data = await response.json();

      if (response.ok && data.cod === 200) {
        setWeather({
          temperature: data.main.temp,
          city: data.name,
          country: data.sys.country,
          humidity: data.main.humidity,
          description: data.weather[0].description,
          icon: data.weather[0].icon,
          windSpeed: data.wind?.speed,
        });
      } else {
        const msg = data.message
          ? `${data.message.charAt(0).toUpperCase()}${data.message.slice(1)}.`
          : "Could not retrieve weather data. Please check your inputs.";
        setError(msg);
      }
    } catch (err) {
      setError("Network error. Please check your connection and try again.");
    } finally {
      setLoading(false);
    }
  }, []);

  return (
    <div className="wrapper">
      <div className="main">
        <div className="container-fluid h-100">
          <div className="row h-100">
            <div className="col-md-5 title-container">
              <Titles />
            </div>
            <div className="col-md-7 form-container">
              <Form getWeather={getWeather} loading={loading} />
              <Weather
                temperature={weather.temperature}
                humidity={weather.humidity}
                city={weather.city}
                country={weather.country}
                description={weather.description}
                icon={weather.icon}
                windSpeed={weather.windSpeed}
                error={error}
                loading={loading}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;
