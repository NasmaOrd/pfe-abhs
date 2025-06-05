import { render, screen } from '@testing-library/react';
import New from './New';

test('New affiche le formulaire de création', () => {
  render(<New inputs={[]} />);
  expect(screen.getByText(/Créer/i)).toBeInTheDocument();
});
