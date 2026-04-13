import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { Provider } from 'react-redux';
import { MemoryRouter } from 'react-router-dom';
import { configureStore } from '@reduxjs/toolkit';
import Login from '../pages/auth/Login';
import authReducer from '../store/slices/authSlice';

const renderWithProviders = (component) => {
  const store = configureStore({
    reducer: { auth: authReducer },
  });
  return render(
    <Provider store={store}>
      <MemoryRouter>{component}</MemoryRouter>
    </Provider>
  );
};

describe('Login Page', () => {
  it('renders login form', () => {
    renderWithProviders(<Login />);
    expect(screen.getByPlaceholderText(/you@example.com/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /sign in/i })).toBeInTheDocument();
  });

  it('shows forgot password link', () => {
    renderWithProviders(<Login />);
    expect(screen.getByText(/forgot password/i)).toBeInTheDocument();
  });

  it('shows register link', () => {
    renderWithProviders(<Login />);
    expect(screen.getByText(/register here/i)).toBeInTheDocument();
  });

  it('shows validation error when email is empty', async () => {
    renderWithProviders(<Login />);
    fireEvent.click(screen.getByRole('button', { name: /sign in/i }));
    await waitFor(() => {
      expect(screen.getByText(/email is required/i)).toBeInTheDocument();
    });
  });

  it('shows validation error when password is empty', async () => {
    renderWithProviders(<Login />);
    fireEvent.change(screen.getByPlaceholderText(/you@example.com/i), {
      target: { value: 'test@gmail.com' },
    });
    fireEvent.click(screen.getByRole('button', { name: /sign in/i }));
    await waitFor(() => {
      expect(screen.getByText(/password is required/i)).toBeInTheDocument();
    });
  });

  it('shows validation error for short password', async () => {
    renderWithProviders(<Login />);
    fireEvent.change(screen.getByPlaceholderText(/you@example.com/i), {
      target: { value: 'test@gmail.com' },
    });
    const passwordFields = screen.getAllByPlaceholderText(/••••••••/i);
    fireEvent.change(passwordFields[0], { target: { value: '123' } });
    fireEvent.click(screen.getByRole('button', { name: /sign in/i }));
    await waitFor(() => {
      expect(screen.getByText(/at least 6 characters/i)).toBeInTheDocument();
    });
  });
});