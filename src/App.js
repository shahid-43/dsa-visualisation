// App.js
import React from 'react';
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import HeapVisualizer from './components/HeapVisualizer/HeapVisualizer';
import GraphVisualizer from './components/GraphVisualizer/GraphVisualizer';
import './App.css';

function App() {
  console.log("GraphVisualizer:", GraphVisualizer);
  return (
    <Router>
      <div className="container">
        <nav className="controls">
          <Link to="/heap"><button className="heap-type">Heap</button></Link>
          <Link to="/Graph"><button className="insert-btn">Graph</button></Link>
          <Link to="/stack"><button className="insert-btn">Stack</button></Link>
          <Link to="/queue"><button className="extract-btn">Queue</button></Link>
        </nav>

        <Routes>
          <Route path="/heap" element={<HeapVisualizer />} />
          <Route path="/Graph" element={<GraphVisualizer />} />
          <Route path="/stack" element={<h2 style={{ textAlign: 'center', marginTop: '50px' }}>Stack Visualizer Coming Soon</h2>} />
          <Route path="/queue" element={<h2 style={{ textAlign: 'center', marginTop: '50px' }}>Queue Visualizer Coming Soon</h2>} />
          <Route path="*" element={<h2 style={{ textAlign: 'center', marginTop: '50px' }}>Choose a Visualizer Above</h2>} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;