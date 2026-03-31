import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import App from './App';

const mockWeatherResponse = {
  cod: 200,
  name: 'London',
  sys: { country: 'GB' },
  main: { temp: 15.4, humidity: 72 },
  weather: [{ description: 'light rain', icon: '10d' }],
  wind: { speed: 5.2 },
};

const mockErrorResponse = {
  cod: '404',
  message: 'city not found',
};

beforeEach(() => {
  jest.clearAllMocks();
  process.env.REACT_APP_WEATHER_API_KEY = 'test-api-key';
});

afterEach(() => {
  jest.restoreAllMocks();
});

describe('App rendering', () => {
  test('renders without crashing', () => {
    render(<App />);
    expect(screen.getByText('Weather Man')).toBeInTheDocument();
  });

  test('renders the form with city and country inputs', () => {
    render(<App />);
    expect(screen.getByPlaceholderText('City...')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('Country code...')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /get weather/i })).toBeInTheDocument();
  });
});

describe('Form validation', () => {
  test('shows error when city is empty', async () => {
    render(<App />);
    const form = screen.getByRole('button', { name: /get weather/i }).closest('form');
    fireEvent.submit(form);
    expect(await screen.findByText('Please enter a city name.')).toBeInTheDocument();
  });

  test('shows error when country is empty but city is filled', async () => {
    render(<App />);
    await userEvent.type(screen.getByPlaceholderText('City...'), 'London');
    const form = screen.getByRole('button', { name: /get weather/i }).closest('form');
    fireEvent.submit(form);
    expect(await screen.findByText('Please enter a country code.')).toBeInTheDocument();
  });

  test('shows error for invalid characters in city name', async () => {
    render(<App />);
    await userEvent.type(screen.getByPlaceholderText('City...'), 'L0nd0n!');
    await userEvent.type(screen.getByPlaceholderText('Country code...'), 'GB');
    const form = screen.getByRole('button', { name: /get weather/i }).closest('form');
    fireEvent.submit(form);
    expect(await screen.findByText('City name contains invalid characters.')).toBeInTheDocument();
  });

  test('shows error for invalid country code', async () => {
    render(<App />);
    await userEvent.type(screen.getByPlaceholderText('City...'), 'London');
    await userEvent.type(screen.getByPlaceholderText('Country code...'), 'G1');
    const form = screen.getByRole('button', { name: /get weather/i }).closest('form');
    fireEvent.submit(form);
    expect(await screen.findByText(/Country code must be 2/i)).toBeInTheDocument();
  });

  test('shows error for city name that is too long', async () => {
    render(<App />);
    // Use fireEvent.change to bypass the DOM maxLength constraint and test the JS validation
    fireEvent.change(screen.getByPlaceholderText('City...'), {
      target: { value: 'a'.repeat(101) },
    });
    await userEvent.type(screen.getByPlaceholderText('Country code...'), 'US');
    const form = screen.getByRole('button', { name: /get weather/i }).closest('form');
    fireEvent.submit(form);
    expect(await screen.findByText('City name is too long.')).toBeInTheDocument();
  });
});

describe('API interaction', () => {
  test('displays weather data on successful API response', async () => {
    global.fetch = jest.fn().mockResolvedValue({
      ok: true,
      json: async () => mockWeatherResponse,
    });

    render(<App />);
    await userEvent.type(screen.getByPlaceholderText('City...'), 'London');
    await userEvent.type(screen.getByPlaceholderText('Country code...'), 'GB');
    fireEvent.submit(screen.getByRole('button', { name: /get weather/i }).closest('form'));

    await waitFor(() => {
      expect(screen.getByText(/London, GB/)).toBeInTheDocument();
    });
    expect(screen.getByText(/15\.4 °C/)).toBeInTheDocument();
    expect(screen.getByText(/72%/)).toBeInTheDocument();
    expect(screen.getByText(/Light rain/)).toBeInTheDocument();
    expect(screen.getByText(/5\.2 m\/s/)).toBeInTheDocument();
  });

  test('displays error message when city is not found (404)', async () => {
    global.fetch = jest.fn().mockResolvedValue({
      ok: false,
      json: async () => mockErrorResponse,
    });

    render(<App />);
    await userEvent.type(screen.getByPlaceholderText('City...'), 'FakeCity');
    await userEvent.type(screen.getByPlaceholderText('Country code...'), 'XX');
    fireEvent.submit(screen.getByRole('button', { name: /get weather/i }).closest('form'));

    await waitFor(() => {
      expect(screen.getByRole('alert')).toHaveTextContent('City not found.');
    });
  });

  test('displays network error message when fetch throws', async () => {
    global.fetch = jest.fn().mockRejectedValue(new Error('Network failure'));

    render(<App />);
    await userEvent.type(screen.getByPlaceholderText('City...'), 'London');
    await userEvent.type(screen.getByPlaceholderText('Country code...'), 'GB');
    fireEvent.submit(screen.getByRole('button', { name: /get weather/i }).closest('form'));

    await waitFor(() => {
      expect(screen.getByRole('alert')).toHaveTextContent('Network error');
    });
  });

  test('shows loading state during API call', async () => {
    let resolvePromise;
    global.fetch = jest.fn().mockReturnValue(
      new Promise((resolve) => {
        resolvePromise = resolve;
      })
    );

    render(<App />);
    await userEvent.type(screen.getByPlaceholderText('City...'), 'London');
    await userEvent.type(screen.getByPlaceholderText('Country code...'), 'GB');
    fireEvent.submit(screen.getByRole('button', { name: /get weather/i }).closest('form'));

    expect(screen.getByRole('button', { name: /loading/i })).toBeDisabled();

    resolvePromise({ ok: true, json: async () => mockWeatherResponse });
    await waitFor(() => {
      expect(screen.getByRole('button', { name: /get weather/i })).not.toBeDisabled();
    });
  });

  test('uses HTTPS for API calls', async () => {
    global.fetch = jest.fn().mockResolvedValue({
      ok: true,
      json: async () => mockWeatherResponse,
    });

    render(<App />);
    await userEvent.type(screen.getByPlaceholderText('City...'), 'London');
    await userEvent.type(screen.getByPlaceholderText('Country code...'), 'GB');
    fireEvent.submit(screen.getByRole('button', { name: /get weather/i }).closest('form'));

    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledWith(
        expect.stringContaining('https://')
      );
    });
  });

  test('URL-encodes user input to prevent injection', async () => {
    global.fetch = jest.fn().mockResolvedValue({
      ok: true,
      json: async () => mockWeatherResponse,
    });

    render(<App />);
    await userEvent.type(screen.getByPlaceholderText('City...'), "New York");
    await userEvent.type(screen.getByPlaceholderText('Country code...'), 'US');
    fireEvent.submit(screen.getByRole('button', { name: /get weather/i }).closest('form'));

    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledWith(
        expect.stringContaining('New%20York')
      );
    });
  });

  test('shows missing API key error when env var is not set', async () => {
    const original = process.env.REACT_APP_WEATHER_API_KEY;
    delete process.env.REACT_APP_WEATHER_API_KEY;

    render(<App />);
    await userEvent.type(screen.getByPlaceholderText('City...'), 'London');
    await userEvent.type(screen.getByPlaceholderText('Country code...'), 'GB');
    fireEvent.submit(screen.getByRole('button', { name: /get weather/i }).closest('form'));

    await waitFor(() => {
      expect(screen.getByRole('alert')).toHaveTextContent('API key is not configured');
    });

    process.env.REACT_APP_WEATHER_API_KEY = original;
  });
});
