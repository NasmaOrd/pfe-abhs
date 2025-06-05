import { render, screen } from '@testing-library/react';
import List from './List';

test('List affiche la liste des items', () => {
  render(<List />);
  expect(screen.getByText(/voir/i)).toBeInTheDocument();
});
