import { render, screen } from '@testing-library/react';
import Data from './Data';

test('Data affiche le titre Données', () => {
  render(<Data />);
  expect(screen.getByText(/données/i)).toBeInTheDocument();
});
