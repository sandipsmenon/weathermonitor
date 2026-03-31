import React from 'react';
import { render, screen } from '@testing-library/react';
import Weather from './Weather';

const defaultProps = {
  city: undefined,
  country: undefined,
  temperature: undefined,
  humidity: undefined,
  description: undefined,
  icon: undefined,
  windSpeed: undefined,
  error: undefined,
  loading: false,
};

describe('Weather component', () => {
  test('renders without crashing with no props', () => {
    render(<Weather {...defaultProps} />);
    expect(document.querySelector('.weather__info')).toBeInTheDocument();
  });

  test('does not display location when city/country are undefined', () => {
    render(<Weather {...defaultProps} />);
    expect(screen.queryByText(/Location:/)).not.toBeInTheDocument();
  });

  test('displays location when city and country are provided', () => {
    render(<Weather {...defaultProps} city="London" country="GB" />);
    expect(screen.getByText(/London, GB/)).toBeInTheDocument();
  });

  test('displays temperature with °C unit', () => {
    render(<Weather {...defaultProps} temperature={15.4} />);
    expect(screen.getByText(/15\.4 °C/)).toBeInTheDocument();
  });

  test('rounds temperature to one decimal place', () => {
    render(<Weather {...defaultProps} temperature={15.456} />);
    expect(screen.getByText(/15\.5 °C/)).toBeInTheDocument();
  });

  test('displays humidity with % unit', () => {
    render(<Weather {...defaultProps} humidity={72} />);
    expect(screen.getByText(/72%/)).toBeInTheDocument();
  });

  test('capitalises first letter of description', () => {
    render(<Weather {...defaultProps} description="light rain" icon="10d" />);
    expect(screen.getByText(/Light rain/)).toBeInTheDocument();
  });

  test('renders weather icon with alt text equal to description', () => {
    render(<Weather {...defaultProps} description="light rain" icon="10d" />);
    const img = screen.getByRole('img', { name: 'light rain' });
    expect(img).toBeInTheDocument();
    expect(img.src).toContain('10d@2x.png');
  });

  test('weather icon uses HTTPS URL', () => {
    render(<Weather {...defaultProps} description="clear sky" icon="01d" />);
    const img = screen.getByRole('img');
    expect(img.src).toMatch(/^https:\/\//);
  });

  test('displays wind speed with m/s unit', () => {
    render(<Weather {...defaultProps} windSpeed={5.2} />);
    expect(screen.getByText(/5\.2 m\/s/)).toBeInTheDocument();
  });

  test('does not display wind speed when undefined', () => {
    render(<Weather {...defaultProps} />);
    expect(screen.queryByText(/m\/s/)).not.toBeInTheDocument();
  });

  test('displays error message with alert role', () => {
    render(<Weather {...defaultProps} error="City not found." />);
    const alert = screen.getByRole('alert');
    expect(alert).toHaveTextContent('City not found.');
  });

  test('does not display error when error is undefined', () => {
    render(<Weather {...defaultProps} />);
    expect(screen.queryByRole('alert')).not.toBeInTheDocument();
  });

  test('shows loading spinner when loading is true', () => {
    render(<Weather {...defaultProps} loading={true} />);
    expect(screen.getByLabelText('Loading weather data')).toBeInTheDocument();
  });

  test('hides weather data while loading', () => {
    render(
      <Weather
        {...defaultProps}
        loading={true}
        city="London"
        country="GB"
        temperature={15}
        humidity={72}
      />
    );
    expect(screen.queryByText(/London/)).not.toBeInTheDocument();
    expect(screen.queryByText(/°C/)).not.toBeInTheDocument();
  });

  test('hides error message while loading', () => {
    render(<Weather {...defaultProps} loading={true} error="Some error" />);
    expect(screen.queryByRole('alert')).not.toBeInTheDocument();
  });

  test('does not show icon section without both icon and description', () => {
    render(<Weather {...defaultProps} icon="10d" />);
    expect(screen.queryByRole('img')).not.toBeInTheDocument();
  });
});
