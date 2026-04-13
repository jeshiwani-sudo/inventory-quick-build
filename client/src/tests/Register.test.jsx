import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { MemoryRouter, Routes, Route } from 'react-router-dom';
import Register from '../pages/auth/Register';

const renderRegister = (search = '') => {
  return render(
    <MemoryRouter initialEntries={[`/register${search}`]}>
      <Routes>
        <Route path="/register" element={<Register />} />
      </Routes>
    </MemoryRouter>
  );
};

describe('Register Page - Merchant Mode (no token)', () => {
  it('renders merchant registration form', () => {
    renderRegister();
    expect(screen.getByText(/register as merchant/i)).toBeInTheDocument();
  });

  it('shows store name field for merchant', () => {
    renderRegister();
    expect(screen.getByPlaceholderText(/Shop Name/i)).toBeInTheDocument();
  });

  it('shows email field for merchant', () => {
    renderRegister();
    expect(screen.getByPlaceholderText(/merchant1@gmail.com/i)).toBeInTheDocument();
  });

  it('shows validation error for missing store name', async () => {
    renderRegister();
    fireEvent.click(screen.getByRole('button', { name: /create merchant account/i }));
    await waitFor(() => {
      expect(screen.getByText(/store name is required/i)).toBeInTheDocument();
    });
  });

  it('shows password mismatch error', async () => {
    renderRegister();
    fireEvent.change(screen.getByPlaceholderText(/merchant1@gmail.com/i), {
      target: { value: 'test@gmail.com' },
    });
    fireEvent.change(screen.getByPlaceholderText(/Shop Name/i), {
      target: { value: 'My Store' },
    });
    fireEvent.change(screen.getByPlaceholderText(/john doe/i), {
      target: { value: 'Test User' },
    });
    const passwordFields = screen.getAllByPlaceholderText(/••••••••/i);
    fireEvent.change(passwordFields[0], { target: { value: 'password123' } });
    fireEvent.change(passwordFields[1], { target: { value: 'different123' } });
    fireEvent.click(screen.getByRole('button', { name: /create merchant account/i }));
    await waitFor(() => {
      expect(screen.getByText(/passwords do not match/i)).toBeInTheDocument();
    });
  });
});