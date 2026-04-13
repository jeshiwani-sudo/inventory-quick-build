import { render, screen } from '@testing-library/react';
import Table from '../components/common/Table';

const columns = [
  { header: 'Name', accessor: 'name' },
  { header: 'Email', accessor: 'email' },
];

const data = [
  { name: 'Clerk One', email: 'clerk1@gmail.com' },
  { name: 'Clerk Two', email: 'clerk2@gmail.com' },
];

describe('Table Component', () => {
  it('renders column headers', () => {
    render(<Table columns={columns} data={data} />);
    expect(screen.getByText('Name')).toBeInTheDocument();
    expect(screen.getByText('Email')).toBeInTheDocument();
  });

  it('renders data rows', () => {
    render(<Table columns={columns} data={data} />);
    expect(screen.getByText('Clerk One')).toBeInTheDocument();
    expect(screen.getByText('clerk2@gmail.com')).toBeInTheDocument();
  });

  it('shows loading state', () => {
    render(<Table columns={columns} data={[]} loading={true} />);
    expect(screen.getByText(/loading/i)).toBeInTheDocument();
  });

  it('shows empty state when no data', () => {
    render(<Table columns={columns} data={[]} />);
    expect(screen.getByText(/no data available/i)).toBeInTheDocument();
  });
});