import { render, screen } from '@testing-library/react';
import Login from './Login';

test('Login affiche le formulaire de connexion', () => {
  render(<Login />);
  expect(screen.getByRole('button', { name: /se connecter/i })).toBeInTheDocument();
});
