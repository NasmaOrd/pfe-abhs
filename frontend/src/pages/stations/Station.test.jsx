import { render, screen } from '@testing-library/react';
import Stations from './Stations';

test('Stations affiche la liste des stations', () => {
  render(<Stations />);
  expect(screen.getByText(/stations/i)).toBeInTheDocument();
});
