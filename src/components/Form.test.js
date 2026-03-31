import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import Form from './Form';

describe('Form component', () => {
  const mockGetWeather = jest.fn((e) => e.preventDefault());

  beforeEach(() => {
    mockGetWeather.mockClear();
  });

  test('renders city input', () => {
    render(<Form getWeather={mockGetWeather} loading={false} />);
    expect(screen.getByPlaceholderText('City...')).toBeInTheDocument();
  });

  test('renders country code input', () => {
    render(<Form getWeather={mockGetWeather} loading={false} />);
    expect(screen.getByPlaceholderText('Country code...')).toBeInTheDocument();
  });

  test('renders the submit button with correct label', () => {
    render(<Form getWeather={mockGetWeather} loading={false} />);
    expect(screen.getByRole('button', { name: /get weather/i })).toBeInTheDocument();
  });

  test('calls getWeather handler on form submit', () => {
    render(<Form getWeather={mockGetWeather} loading={false} />);
    fireEvent.submit(screen.getByRole('button').closest('form'));
    expect(mockGetWeather).toHaveBeenCalledTimes(1);
  });

  test('city input has maxLength of 100', () => {
    render(<Form getWeather={mockGetWeather} loading={false} />);
    expect(screen.getByPlaceholderText('City...')).toHaveAttribute('maxLength', '100');
  });

  test('country input has maxLength of 3', () => {
    render(<Form getWeather={mockGetWeather} loading={false} />);
    expect(screen.getByPlaceholderText('Country code...')).toHaveAttribute('maxLength', '3');
  });

  test('city input has aria-label', () => {
    render(<Form getWeather={mockGetWeather} loading={false} />);
    expect(screen.getByLabelText('City name')).toBeInTheDocument();
  });

  test('country input has aria-label', () => {
    render(<Form getWeather={mockGetWeather} loading={false} />);
    expect(screen.getByLabelText(/Country code/i)).toBeInTheDocument();
  });

  test('inputs and button are disabled when loading', () => {
    render(<Form getWeather={mockGetWeather} loading={true} />);
    expect(screen.getByPlaceholderText('City...')).toBeDisabled();
    expect(screen.getByPlaceholderText('Country code...')).toBeDisabled();
    expect(screen.getByRole('button')).toBeDisabled();
  });

  test('button shows "Loading..." text when loading', () => {
    render(<Form getWeather={mockGetWeather} loading={true} />);
    expect(screen.getByRole('button')).toHaveTextContent('Loading...');
  });

  test('inputs and button are enabled when not loading', () => {
    render(<Form getWeather={mockGetWeather} loading={false} />);
    expect(screen.getByPlaceholderText('City...')).not.toBeDisabled();
    expect(screen.getByPlaceholderText('Country code...')).not.toBeDisabled();
    expect(screen.getByRole('button')).not.toBeDisabled();
  });

  test('does not call getWeather when button is disabled', () => {
    render(<Form getWeather={mockGetWeather} loading={true} />);
    fireEvent.click(screen.getByRole('button'));
    expect(mockGetWeather).not.toHaveBeenCalled();
  });
});
