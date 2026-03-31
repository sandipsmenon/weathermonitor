import React from "react";

const Weather = ({ city, country, temperature, humidity, description, icon, windSpeed, error, loading }) => (
  <div className="weather__info">
    {loading && (
      <div className="weather__loading" aria-live="polite" aria-label="Loading weather data">
        <div className="spinner" role="status"></div>
      </div>
    )}

    {!loading && city && country && (
      <p className="weather__key">
        Location:
        <span className="weather__value"> {city}, {country}</span>
      </p>
    )}

    {!loading && icon && description && (
      <p className="weather__key weather__icon-row">
        Conditions:
        <span className="weather__value">
          <img
            src={`https://openweathermap.org/img/wn/${icon}@2x.png`}
            alt={description}
            className="weather__icon"
          />
          {description.charAt(0).toUpperCase() + description.slice(1)}
        </span>
      </p>
    )}

    {!loading && temperature !== undefined && (
      <p className="weather__key">
        Temperature:
        <span className="weather__value"> {Math.round(temperature * 10) / 10} °C</span>
      </p>
    )}

    {!loading && humidity !== undefined && (
      <p className="weather__key">
        Humidity:
        <span className="weather__value"> {humidity}%</span>
      </p>
    )}

    {!loading && windSpeed !== undefined && (
      <p className="weather__key">
        Wind Speed:
        <span className="weather__value"> {Math.round(windSpeed * 10) / 10} m/s</span>
      </p>
    )}

    {!loading && error && (
      <p className="weather__error" role="alert">{error}</p>
    )}
  </div>
);

export default Weather;
