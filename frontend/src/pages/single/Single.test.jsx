import { render, screen } from '@testing-library/react';
import Single from './Single';

test('Single affiche le détail', () => {
  render(<Single />);
  expect(screen.getByText(/Last Transactions/i)).toBeInTheDocument();
});
