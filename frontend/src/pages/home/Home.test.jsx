import { render, screen } from '@testing-library/react';
import Home from './Home';

test('Home affiche le titre principal', () => {
  render(<Home />);
  expect(screen.getByText(/Taux de précipitations/i)).toBeInTheDocument();
});
