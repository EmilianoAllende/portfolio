import React from 'react';
import Timeline from './components/Timeline';

function App() {
  return (
    <div className="portfolio-container">
      <header className="portfolio-header">
        <h1>Emiliano Allende</h1>
        <p>Full Stack Developer | Portfolio de Proyectos Destacados</p>
      </header>
      
      <main>
        <Timeline />
      </main>
    </div>
  );
}

export default App;
