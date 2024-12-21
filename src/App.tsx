import React from 'react';
import './App.css';

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

function App() {
  document.body.style.backgroundColor = "#F5F5F5"
  return (
    <div className="App">
      <header className="App-header inter-main">
        <h1>
          charles wood
        </h1>
        <h4>Software Engineer based in NYC</h4>
        <Links />
      </header>
    </div>
  );
}

export default App;
