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

function formatDate(iso: string) {
  return new Date(`${iso}T00:00:00`).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
}

function ReviewCard({ review }: { review: Review }) {
  const [expanded, setExpanded] = useState(false);
  const [coverFailed, setCoverFailed] = useState(false);
  const text = review.review || '';
  const isLong = text.length > REVIEW_PREVIEW_CHARS;

  const title = (
    <>
      {review.title}
      {review.year && <span className="review-year"> ({review.year})</span>}
    </>
  );

  return (
    <li className="review-card">
      {review.cover_url && !coverFailed ? (
        <img
          className="review-cover"
          src={review.cover_url}
          alt=""
          loading="lazy"
          onError={() => setCoverFailed(true)}
        />
      ) : (
        <div className="review-cover review-cover-empty" aria-hidden="true" />
      )}
      <div className="review-body">
        <h3 className="review-title">
          {review.url ? (
            <a href={review.url} target="_blank" rel="noopener noreferrer">{title}</a>
          ) : title}
        </h3>
        {review.creator && <p className="review-creator">{review.creator}</p>}
        <p className="review-meta">
          {review.rating !== null && <span aria-label={`rated ${review.rating} out of 5`}>★ {review.rating}</span>}
          {review.rating !== null && review.date && ' · '}
          {review.date && <span>{formatDate(review.date)}</span>}
        </p>
        {text && (
          <p className={`review-text${isLong && !expanded ? ' review-text-clamped' : ''}`}>{text}</p>
        )}
        {isLong && (
          <button className="text-button" onClick={() => setExpanded(!expanded)}>
            {expanded ? 'show less' : 'read more'}
          </button>
        )}
      </div>
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
    <section className="personal-section">
      <h2>reviews</h2>
      <div className="tabs" role="tablist">
        {TABS.map(({ type, label }) => (
          <button
            key={type}
            role="tab"
            aria-selected={active === type}
            className={`tab${active === type ? ' tab-active' : ''}`}
            onClick={() => setActive(type)}
          >
            {label}
            {meta?.counts[type] !== undefined && <span className="tab-count">{meta.counts[type]}</span>}
          </button>
        ))}
      </div>

      {current?.status === 'error' && <p className="personal-note">couldn't load reviews right now.</p>}
      {current?.status === 'loading' && <p className="personal-note">loading…</p>}
      {current?.status === 'ready' && current.items.length === 0 && <p className="personal-note">nothing here yet.</p>}

      {current && current.items.length > 0 && (
        <ul className="review-list">
          {current.items.map((review) => <ReviewCard key={review.id} review={review} />)}
        </ul>
      )}

      {current && current.items.length > 0 && current.items.length < current.total && (
        <button className="text-button load-more" onClick={loadMore} disabled={current.loadingMore}>
          {current.loadingMore ? 'loading…' : 'load more'}
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
    <section className="personal-section">
      <h2>projects</h2>
      <ul className="project-list">
        {projects.map((project) => (
          <li key={project.name} className="project">
            <h3 className="review-title">
              {project.url ? (
                <a href={project.url} target="_blank" rel="noopener noreferrer">{project.name}</a>
              ) : project.name}
            </h3>
            <p className="review-text">{project.description}</p>
            {project.tech && <p className="review-meta">{project.tech.join(' · ')}</p>}
          </li>
        ))}
      </ul>
    </section>
  );
}

function PersonalPage() {
  return (
    <div className="App">
      <main className="App-header inter-main personal-page">
        <Link to="/" className="back-link">← charles wood</Link>
        <h1>personal</h1>
        <Projects />
        <Reviews />
      </main>
    </div>
  );
}

export default PersonalPage;
