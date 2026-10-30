import React from 'react';
import { fireEvent, render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import PersonalPage from './PersonalPage';
import { fetchMeta, fetchReviews, Review, ReviewPage, ReviewType } from './api';

jest.mock('./api');

const mockFetchMeta = fetchMeta as jest.MockedFunction<typeof fetchMeta>;
const mockFetchReviews = fetchReviews as jest.MockedFunction<typeof fetchReviews>;

function review(type: ReviewType, n: number): Review {
  return {
    id: `${type}-${n}`, type, title: `${type} ${n}`, creator: null, year: null,
    rating: null, review: null, date: null, cover_url: null, url: null, source: 'test',
  };
}

function page(type: ReviewType, offset: number, count: number, total: number): ReviewPage {
  return {
    items: Array.from({ length: count }, (_, i) => review(type, offset + i)),
    total,
    limit: 20,
    offset,
  };
}

function renderPage() {
  return render(
    <MemoryRouter>
      <PersonalPage />
    </MemoryRouter>
  );
}

test('an opened tab counts its loaded list, not /meta', async () => {
  // /meta was cached after a game was added; the games list was cached before it.
  mockFetchMeta.mockResolvedValue({ counts: { book: 18, game: 1 }, last_synced: null });
  mockFetchReviews.mockImplementation(async (type) => (
    type === 'book' ? page('book', 0, 18, 18) : page(type, 0, 0, 0)
  ));
  renderPage();

  expect(await screen.findByText('book 0')).toBeInTheDocument();
  expect(screen.getByRole('tab', { name: /books/ })).toHaveTextContent(/^books\(18\)$/);
  // Not opened yet, so /meta's count stands.
  expect(screen.getByRole('tab', { name: /games/ })).toHaveTextContent(/^games\(1\)$/);

  fireEvent.click(screen.getByRole('tab', { name: /games/ }));
  expect(await screen.findByText('n/a')).toBeInTheDocument();
  expect(screen.getByRole('tab', { name: /games/ })).toHaveTextContent(/^games$/);
});

test('the count follows the list through "more"', async () => {
  mockFetchMeta.mockResolvedValue({ counts: { book: 20 }, last_synced: null });
  mockFetchReviews
    .mockResolvedValueOnce(page('book', 0, 20, 21))
    .mockResolvedValueOnce(page('book', 20, 2, 22));
  renderPage();

  fireEvent.click(await screen.findByRole('button', { name: 'more (20/21)' }));
  expect(screen.getByRole('tab', { name: /books/ })).toHaveTextContent(/^books\(21\)$/);

  expect(await screen.findByText('book 21')).toBeInTheDocument();
  expect(screen.getByRole('tab', { name: /books/ })).toHaveTextContent(/^books\(22\)$/);
  expect(mockFetchReviews).toHaveBeenLastCalledWith('book', 20);
});
