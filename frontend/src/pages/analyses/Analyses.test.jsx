import { render, screen } from '@testing-library/react';
import Analyses from './Analyses';
import { MemoryRouter } from 'react-router-dom';


test('Analyses affiche le titre Analyses', () => {
  <MemoryRouter>
    <Analyses/>
  </MemoryRouter>
  expect(screen.getByText(/analyses/i)).toBeInTheDocument();
});
