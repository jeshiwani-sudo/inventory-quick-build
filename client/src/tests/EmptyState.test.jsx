import { render, screen } from '@testing-library/react';
import EmptyState from '../components/common/EmptyState';

describe('EmptyState Component', () => {
  it('renders default props', () => {
    render(<EmptyState />);
    expect(screen.getByText(/no data found/i)).toBeInTheDocument();
  });

  it('renders custom title and message', () => {
    render(
      <EmptyState
        title="No stores yet"
        message="Create your first store"
        icon="🏪"
      />
    );
    expect(screen.getByText('No stores yet')).toBeInTheDocument();
    expect(screen.getByText('Create your first store')).toBeInTheDocument();
    expect(screen.getByText('🏪')).toBeInTheDocument();
  });
});