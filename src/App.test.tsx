import React from 'react';
import { fireEvent, render, screen } from '@testing-library/react';
import { MemoryRouter, useNavigate } from 'react-router-dom';
import App from './App';

function renderAt(path: string) {
  return render(
    <MemoryRouter initialEntries={[path]}>
      <App />
    </MemoryRouter>
  );
}

test('the home page does not link to the personal page', () => {
  renderAt('/');
  expect(screen.getByRole('heading', { name: 'charles wood.' })).toBeInTheDocument();
  expect(screen.queryByRole('link', { name: 'personal' })).not.toBeInTheDocument();
});

test('the personal page has no link back to home', () => {
  renderAt('/personal');
  expect(screen.queryByRole('link', { name: /back/ })).not.toBeInTheDocument();
});

test('personal page renders review tabs', async () => {
  renderAt('/personal');
  expect(screen.getByRole('heading', { name: 'personal' })).toBeInTheDocument();
  expect(screen.getByRole('tab', { name: /books/ })).toHaveAttribute('aria-selected', 'true');
  // No API URL is configured under test, so the request fails and the page says so.
  expect(await screen.findByText("couldn't load reviews right now.")).toBeInTheDocument();
});

// Neither page links to the other any more, so tests move between them like the browser's address bar.
function Go() {
  const navigate = useNavigate();
  return (
    <>
      <button onClick={() => navigate('/personal')}>to personal</button>
      <button onClick={() => navigate('/')}>to home</button>
    </>
  );
}

test('going back from the personal page restores the home background', async () => {
  // StrictMode, as in index.tsx, runs the personal page's mount effect twice.
  render(
    <React.StrictMode>
      <MemoryRouter>
        <App />
        <Go />
      </MemoryRouter>
    </React.StrictMode>
  );
  expect(document.body).toHaveStyle({ backgroundColor: '#0f0f0f' });

  fireEvent.click(screen.getByRole('button', { name: 'to personal' }));
  expect(await screen.findByText("couldn't load reviews right now.")).toBeInTheDocument();
  expect(document.body).toHaveStyle({ backgroundColor: '#000000' });

  fireEvent.click(screen.getByRole('button', { name: 'to home' }));
  expect(screen.getByText('Software Engineer based in NYC')).toBeInTheDocument();
  expect(document.body).toHaveStyle({ backgroundColor: '#0f0f0f' });
});
