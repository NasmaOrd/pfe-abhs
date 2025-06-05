import { render, screen } from '@testing-library/react';
import Modele from './Modele';

test('Modele affiche le titre Modèle', () => {
  render(<Modele />);
  expect(screen.getByText(/modèle/i)).toBeInTheDocument();
});
