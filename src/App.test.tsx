import React from 'react';
import { fireEvent, render, screen } from '@testing-library/react';
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

test('going back from the personal page restores the home background', async () => {
  // StrictMode, as in index.tsx, runs the personal page's mount effect twice.
  render(
    <React.StrictMode>
      <MemoryRouter>
        <App />
      </MemoryRouter>
    </React.StrictMode>
  );
  expect(document.body).toHaveStyle({ backgroundColor: '#0f0f0f' });

  fireEvent.click(screen.getByRole('link', { name: 'personal' }));
  expect(await screen.findByText("couldn't load reviews right now.")).toBeInTheDocument();
  expect(document.body).toHaveStyle({ backgroundColor: '#000000' });

  fireEvent.click(screen.getByRole('link', { name: '< back' }));
  expect(screen.getByText('Software Engineer based in NYC')).toBeInTheDocument();
  expect(document.body).toHaveStyle({ backgroundColor: '#0f0f0f' });
});
