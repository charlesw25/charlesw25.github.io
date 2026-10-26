import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { fetchMeta, fetchReviews, Meta, Review, ReviewType } from './api';
import { projects } from './projects';
import './personal.css';

const TABS: { type: ReviewType; dir: string }[] = [
  { type: 'book', dir: 'books' },
  { type: 'movie', dir: 'movies' },
  { type: 'game', dir: 'games' },
];

const REVIEW_PREVIEW_CHARS = 280;

interface TabState {
  items: Review[];
  total: number;
  status: 'loading' | 'ready' | 'error';
  loadingMore?: boolean;
}

function Prompt({ path = '~/personal', children }: { path?: string; children?: React.ReactNode }) {
  return (
    <div className="term-line">
      <span className="term-prompt">charles@wood:{path}$</span> {children}
    </div>
  );
}

// Two slots per star so half stars show: 4.5 -> [#########.] 4.5/5
function ratingBar(rating: number) {
  const filled = Math.min(10, Math.max(0, Math.round(rating * 2)));
  return `[${'#'.repeat(filled)}${'.'.repeat(10 - filled)}] ${rating}/5`;
}

function ReviewEntry({ review }: { review: Review }) {
  const [expanded, setExpanded] = useState(false);
  const text = review.review || '';
  const isLong = text.length > REVIEW_PREVIEW_CHARS;
  const shown = isLong && !expanded ? `${text.slice(0, REVIEW_PREVIEW_CHARS).trimEnd()}...` : text;

  return (
    <li className="term-entry">
      <div className="term-title">
        {review.url ? (
          <a href={review.url} target="_blank" rel="noopener noreferrer">{review.title}</a>
        ) : review.title}
        {review.year && <span className="term-dim"> ({review.year})</span>}
      </div>
      {review.creator && <div className="term-dim">by {review.creator}</div>}
      {(review.rating !== null || review.date) && (
        <div className="term-dim">
          {review.rating !== null && <span aria-label={`rated ${review.rating} out of 5`}>{ratingBar(review.rating)}</span>}
          {review.rating !== null && review.date && ' | '}
          {review.date}
        </div>
      )}
      {shown && <p className="term-review">{shown}</p>}
      {isLong && (
        <button className="term-button" onClick={() => setExpanded(!expanded)}>
          {expanded ? '[- less]' : '[+ more]'}
        </button>
      )}
    </li>
  );
}

function Reviews() {
  const [active, setActive] = useState<ReviewType>('book');
  const [tabs, setTabs] = useState<Partial<Record<ReviewType, TabState>>>({});
  const [meta, setMeta] = useState<Meta | null>(null);
  const current = tabs[active];
  const activeDir = TABS.find((t) => t.type === active)!.dir;

  useEffect(() => {
    const controller = new AbortController();
    fetchMeta(controller.signal).then(setMeta).catch(() => {});
    return () => controller.abort();
  }, []);

  // Load the first page of a tab the first time it's opened; later visits reuse it.
  // Switching away mid-request aborts it, so the tab loads again when revisited.
  useEffect(() => {
    if (tabs[active]?.status === 'ready') {
      return;
    }
    const controller = new AbortController();
    setTabs((prev) => ({ ...prev, [active]: { items: [], total: 0, status: 'loading' } }));
    fetchReviews(active, 0, controller.signal)
      .then((page) => setTabs((prev) => ({
        ...prev,
        [active]: { items: page.items, total: page.total, status: 'ready' },
      })))
      .catch((err) => {
        if (!controller.signal.aborted) {
          console.error(err);
          setTabs((prev) => ({ ...prev, [active]: { items: [], total: 0, status: 'error' } }));
        }
      });
    return () => controller.abort();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [active]);

  function loadMore() {
    if (!current || current.status !== 'ready' || current.loadingMore) {
      return;
    }
    const type = active;
    setTabs((prev) => ({ ...prev, [type]: { ...current, loadingMore: true } }));
    fetchReviews(type, current.items.length)
      .then((page) => setTabs((prev) => ({
        ...prev,
        [type]: { items: [...current.items, ...page.items], total: page.total, status: 'ready' },
      })))
      .catch((err) => {
        console.error(err);
        setTabs((prev) => ({ ...prev, [type]: { ...current, loadingMore: false } }));
      });
  }

  return (
    <section>
      <Prompt>ls reviews/</Prompt>
      <div className="term-dirs" role="tablist">
        {TABS.map(({ type, dir }) => (
          <button
            key={type}
            role="tab"
            aria-selected={active === type}
            className={`term-button term-dir${active === type ? ' term-dir-active' : ''}`}
            onClick={() => setActive(type)}
          >
            {dir}/
            {meta?.counts[type] !== undefined && <span className="term-dim"> {meta.counts[type]}</span>}
          </button>
        ))}
      </div>

      <Prompt>{`cat reviews/${activeDir}/*`}</Prompt>
      {current?.status === 'error' && <div className="term-line">cat: reviews/{activeDir}: connection refused</div>}
      {current?.status === 'loading' && <div className="term-line term-dim">reading...</div>}
      {current?.status === 'ready' && current.items.length === 0 && (
        <div className="term-line">{`cat: reviews/${activeDir}/*: no such file or directory`}</div>
      )}

      {current && current.items.length > 0 && (
        <ul className="term-list">
          {current.items.map((review) => <ReviewEntry key={review.id} review={review} />)}
        </ul>
      )}

      {current && current.items.length > 0 && current.items.length < current.total && (
        <button className="term-button term-more" onClick={loadMore} disabled={current.loadingMore}>
          {current.loadingMore
            ? 'reading...'
            : `-- more (${current.items.length}/${current.total}) --`}
        </button>
      )}
    </section>
  );
}

function Projects() {
  if (projects.length === 0) {
    return null;
  }
  return (
    <section>
      <Prompt>cat projects.txt</Prompt>
      <ul className="term-list">
        {projects.map((project) => (
          <li key={project.name} className="term-entry">
            <div className="term-title">
              {project.url ? (
                <a href={project.url} target="_blank" rel="noopener noreferrer">{project.name}</a>
              ) : project.name}
            </div>
            <p className="term-review">{project.description}</p>
            {project.tech && <div className="term-dim">{project.tech.join(' / ')}</div>}
          </li>
        ))}
      </ul>
    </section>
  );
}

function PersonalPage() {
  // App sets the home page's background on every render; this page is pure black.
  useEffect(() => {
    document.body.style.backgroundColor = '#000000';
  });

  return (
    <main className="terminal">
      <Prompt path="~">cd personal</Prompt>
      <h1 className="term-banner">personal</h1>
      <Projects />
      <Reviews />
      <Prompt>
        <Link to="/" className="term-link">cd ..</Link>
        <span className="term-cursor" aria-hidden="true" />
      </Prompt>
    </main>
  );
}

export default PersonalPage;
