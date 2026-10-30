import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { fetchMeta, fetchReviews, Meta, Review, ReviewType } from './api';
import { projects } from './projects';
import './personal.css';

const TABS: { type: ReviewType; label: string }[] = [
  { type: 'book', label: 'books' },
  { type: 'movie', label: 'movies' },
  { type: 'game', label: 'games' },
];

const REVIEW_PREVIEW_CHARS = 280;

interface TabState {
  items: Review[];
  total: number;
  status: 'loading' | 'ready' | 'error';
  loadingMore?: boolean;
}

// Once a tab's list has loaded, its count comes from that response rather than /meta,
// since the two are cached separately and can disagree. Zero shows no count, as /meta omits it.
function TabCount({ tab, metaCount }: { tab?: TabState; metaCount?: number }) {
  const count = tab?.status === 'ready' ? tab.total : metaCount;
  return count ? <span className="p-count">({count})</span> : null;
}

function ReviewEntry({ review }: { review: Review }) {
  const [expanded, setExpanded] = useState(false);
  const text = review.review || '';
  const isLong = text.length > REVIEW_PREVIEW_CHARS;
  const shown = isLong && !expanded ? `${text.slice(0, REVIEW_PREVIEW_CHARS).trimEnd()}...` : text;

  return (
    <li className="p-entry">
      <h3 className="p-title">
        {review.url ? (
          <a href={review.url} target="_blank" rel="noopener noreferrer">{review.title}</a>
        ) : review.title}
        {review.year && <span className="p-dim"> {review.year}</span>}
      </h3>
      {review.creator && <div className="p-dim">{review.creator}</div>}
      {(review.rating !== null || review.date) && (
        <div className="p-dim">
          {review.rating !== null && <span aria-label={`rated ${review.rating} out of 5`}>★ {review.rating}</span>}
          {review.rating !== null && review.date && <span className="p-sep" />}
          {review.date && review.date.replace(/-/g, '.')}
        </div>
      )}
      {shown && <p className="p-review">{shown}</p>}
      {isLong && (
        <button className="p-button" onClick={() => setExpanded(!expanded)}>
          {expanded ? 'less' : 'more'}
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
    <section className="p-section">
      <div className="p-tabs" role="tablist">
        {TABS.map(({ type, label }) => (
          <button
            key={type}
            role="tab"
            aria-selected={active === type}
            className={`p-button p-tab${active === type ? ' p-tab-active' : ''}`}
            onClick={() => setActive(type)}
          >
            {label}
            <TabCount tab={tabs[type]} metaCount={meta?.counts[type]} />
          </button>
        ))}
      </div>

      {current?.status === 'error' && <p className="p-dim">couldn't load reviews right now.</p>}
      {current?.status === 'loading' && <p className="p-dim">loading...</p>}
      {current?.status === 'ready' && current.items.length === 0 && <p className="p-dim">n/a</p>}

      {current && current.items.length > 0 && (
        <ul className="p-list">
          {current.items.map((review) => <ReviewEntry key={review.id} review={review} />)}
        </ul>
      )}

      {current && current.items.length > 0 && current.items.length < current.total && (
        <button className="p-button p-more" onClick={loadMore} disabled={current.loadingMore}>
          {current.loadingMore ? 'loading...' : `more (${current.items.length}/${current.total})`}
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
    <section className="p-section">
      <h2 className="p-heading">projects</h2>
      <ul className="p-list">
        {projects.map((project) => (
          <li key={project.name} className="p-entry">
            <h3 className="p-title">
              {project.url ? (
                <a href={project.url} target="_blank" rel="noopener noreferrer">{project.name}</a>
              ) : project.name}
            </h3>
            <p className="p-review">{project.description}</p>
            {project.tech && <div className="p-dim">{project.tech.join(' / ')}</div>}
          </li>
        ))}
      </ul>
    </section>
  );
}

function PersonalPage() {
  // This page is pure black. App sets the home page's background once, on its first render, not on
  // route changes, so put back whatever was there when leaving.
  useEffect(() => {
    const previous = document.body.style.backgroundColor;
    document.body.style.backgroundColor = '#000000';
    return () => {
      document.body.style.backgroundColor = previous;
    };
  }, []);

  return (
    <main className="personal">
      <Link to="/" className="p-back">&lt; back</Link>
      <h1 className="p-banner">personal</h1>
      <Projects />
      <Reviews />
    </main>
  );
}

export default PersonalPage;
