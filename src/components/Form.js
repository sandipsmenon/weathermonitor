import React from "react";

const Form = ({ getWeather, loading }) => (
  <form onSubmit={getWeather} noValidate>
    <input
      type="text"
      name="city"
      placeholder="City..."
      maxLength={100}
      aria-label="City name"
      disabled={loading}
      autoComplete="off"
    />
    <input
      type="text"
      name="country"
      placeholder="Country code..."
      maxLength={3}
      aria-label="Country code (e.g. US, GB)"
      disabled={loading}
      autoComplete="off"
    />
    <button type="submit" disabled={loading} aria-busy={loading}>
      {loading ? "Loading..." : "Get Weather"}
    </button>
  </form>
);

export default Form;
