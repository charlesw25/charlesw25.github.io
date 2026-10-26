import React from 'react';
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import App from './App';

function renderAt(path: string) {
  return render(
    <MemoryRouter initialEntries={[path]}>
      <App />
    </MemoryRouter>
  );
}

test('the period after the name links to the personal page', () => {
  renderAt('/');
  expect(screen.getByRole('link', { name: 'personal' })).toHaveAttribute('href', '/personal');
});

test('personal page renders review tabs', async () => {
  renderAt('/personal');
  expect(screen.getByRole('heading', { name: 'personal' })).toBeInTheDocument();
  expect(screen.getByRole('tab', { name: /books/ })).toHaveAttribute('aria-selected', 'true');
  // No API URL is configured under test, so the request fails and the page says so.
  expect(await screen.findByText("couldn't load reviews right now.")).toBeInTheDocument();
});
