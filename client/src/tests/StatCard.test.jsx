import { render, screen } from '@testing-library/react';
import StatCard from '../components/common/StatCard';

describe('StatCard Component', () => {
  it('renders title and value', () => {
    render(<StatCard title="Total Received" value={42} icon="📥" color="bg-blue-500" />);
    expect(screen.getByText('Total Received')).toBeInTheDocument();
    expect(screen.getByText('42')).toBeInTheDocument();
  });

  it('renders icon', () => {
    render(<StatCard title="In Stock" value={10} icon="📦" color="bg-green-500" />);
    expect(screen.getByText('📦')).toBeInTheDocument();
  });

  it('renders string value', () => {
    render(<StatCard title="Unpaid" value="KES 5,000" icon="💰" color="bg-orange-500" />);
    expect(screen.getByText('KES 5,000')).toBeInTheDocument();
  });

  it('renders zero value', () => {
    render(<StatCard title="Spoilt" value={0} icon="⚠️" color="bg-red-500" />);
    expect(screen.getByText('0')).toBeInTheDocument();
  });
});