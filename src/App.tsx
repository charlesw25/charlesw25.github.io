import React from 'react';
import { Link, Route, Routes } from 'react-router-dom';
import './App.css';
import PersonalPage from './personal/PersonalPage';

function Links() {
  return (
    <nav>
      <ul>
        <li>
          <a href="https://drive.google.com/file/d/1JTK7vjSLoYMagUvfV8HkdY-GkukEp8Fi/view" target="_blank" rel="noopener noreferrer">Resume</a>
        </li>
        <li>
          <a href="https://github.com/charlesw25" target="_blank" rel="noopener noreferrer">GitHub</a>
        </li>
      </ul>
    </nav>
  )
}

function About() {
  return (
    <section className="about-section">
      <p className="about-text">
        I love to build robust things that scale. I'm comfortable working
        across the full stack, however my proudest work lives on the backend:
        designing APIs, distributing workloads, and data flows that hold up under
        load. I aim to write clean and performant code that is easy to maintain
        as well as reduce manual overhead.
      </p>
      <p className="about-text about-tech">
        Some technologies I work with include Python, AWS, PostgreSQL, React, and Redis.
      </p>
    </section>
  );
}

function Home() {
  return (
    <div className="App">
      <header className="App-header inter-main">
        <h1>
          charles wood{' '}
          <Link to="/personal" className="dog-link" aria-label="personal">🐕</Link>
        </h1>
        <h4>Software Engineer based in NYC</h4>
        <Links />
        <About />
      </header>
    </div>
  );
}

function App() {
  document.body.style.backgroundColor = "#0f0f0f"
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/personal" element={<PersonalPage />} />
      <Route path="*" element={<Home />} />
    </Routes>
  );
}

export default App;
