export type ReviewType = 'book' | 'movie' | 'game';

export interface Review {
  id: string;
  type: ReviewType;
  title: string;
  creator: string | null;
  year: number | null;
  rating: number | null;
  review: string | null;
  date: string | null;
  cover_url: string | null;
  url: string | null;
  source: string;
}

export interface ReviewPage {
  items: Review[];
  total: number;
  limit: number;
  offset: number;
}

export interface Meta {
  counts: Partial<Record<ReviewType, number>>;
  last_synced: string | null;
}

// Set at build time, e.g. REACT_APP_API_URL=https://api.example.com in .env.production.local
export const API_URL = (process.env.REACT_APP_API_URL || '').replace(/\/$/, '');

async function get<T>(path: string, signal?: AbortSignal): Promise<T> {
  if (!API_URL) {
    throw new Error('REACT_APP_API_URL is not set');
  }
  const response = await fetch(`${API_URL}${path}`, { signal });
  if (!response.ok) {
    throw new Error(`${path} returned ${response.status}`);
  }
  return response.json();
}

export function fetchReviews(type: ReviewType, offset: number, signal?: AbortSignal) {
  return get<ReviewPage>(`/reviews?type=${type}&limit=20&offset=${offset}`, signal);
}

export function fetchMeta(signal?: AbortSignal) {
  return get<Meta>('/meta', signal);
}
