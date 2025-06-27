// HeapVisualizer.js
import React, { useState, useEffect, useRef } from 'react';
import {
  heapifyUp,
  heapifyDown,
  buildHeap
} from './heapUtils';
import './HeapVisualizer.css';

function HeapVisualizer() {
  const [heap, setHeap] = useState([50, 30, 40, 20, 25, 35, 15]);
  const [isMaxHeap, setIsMaxHeap] = useState(true);
  const [inputValue, setInputValue] = useState(42);
  const svgRef = useRef(null);

  useEffect(() => {
    setHeap((prev) => buildHeap([...prev], isMaxHeap));
  }, [isMaxHeap]);

  useEffect(() => {
    drawTree();
  }, [heap]);

  const toggleHeapType = () => {
    setIsMaxHeap(!isMaxHeap);
  };

  const insertValue = () => {
    if (isNaN(inputValue)) {
      alert('Please enter a valid number');
      return;
    }
    const newHeap = [...heap, parseInt(inputValue)];
    heapifyUp(newHeap, newHeap.length - 1, isMaxHeap);
    setHeap(newHeap);
    setInputValue(Math.floor(Math.random() * 90) + 10);
  };

  const extractRoot = () => {
    if (heap.length === 0) {
      alert('Heap is empty!');
      return;
    }
    const newHeap = [...heap];
    const root = newHeap[0];
    newHeap[0] = newHeap[newHeap.length - 1];
    newHeap.pop();
    heapifyDown(newHeap, 0, isMaxHeap);
    setHeap(newHeap);
    alert(`Extracted: ${root}`);
  };

  const clearHeap = () => {
    setHeap([]);
  };

  const drawTree = () => {
    const svg = svgRef.current;
    if (!svg) return;

    svg.innerHTML = '';
    const width = svg.clientWidth;
    const height = svg.clientHeight;
    const levelHeight = 80;

    const getCoordinates = (i) => {
      const level = Math.floor(Math.log2(i + 1));
      const nodesInLevel = Math.pow(2, level);
      const positionInLevel = i - (nodesInLevel - 1);
      const x = (width / (nodesInLevel + 1)) * (positionInLevel + 1);
      const y = (level + 1) * levelHeight;
      return { x, y };
    };

    heap.forEach((_, i) => {
      const { x, y } = getCoordinates(i);
      const left = 2 * i + 1;
      const right = 2 * i + 2;

      if (left < heap.length) {
        const { x: x2, y: y2 } = getCoordinates(left);
        const line = document.createElementNS('http://www.w3.org/2000/svg', 'line');
        line.setAttribute('x1', x);
        line.setAttribute('y1', y);
        line.setAttribute('x2', x2);
        line.setAttribute('y2', y2);
        line.setAttribute('class', 'edge');
        svg.appendChild(line);
      }
      if (right < heap.length) {
        const { x: x2, y: y2 } = getCoordinates(right);
        const line = document.createElementNS('http://www.w3.org/2000/svg', 'line');
        line.setAttribute('x1', x);
        line.setAttribute('y1', y);
        line.setAttribute('x2', x2);
        line.setAttribute('y2', y2);
        line.setAttribute('class', 'edge');
        svg.appendChild(line);
      }
    });

    heap.forEach((val, i) => {
      const { x, y } = getCoordinates(i);

      const circle = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
      circle.setAttribute('cx', x);
      circle.setAttribute('cy', y);
      circle.setAttribute('r', 20);
      circle.setAttribute('class', 'node');
      svg.appendChild(circle);

      const text = document.createElementNS('http://www.w3.org/2000/svg', 'text');
      text.setAttribute('x', x);
      text.setAttribute('y', y);
      text.setAttribute('class', 'node-text');
      text.textContent = val;
      svg.appendChild(text);
    });
  };

  return (
    <div className="container">
      <h1>🌳 Interactive Heap Visualization</h1>

      <div className="controls">
        <button className="heap-type" onClick={toggleHeapType}>
          <span>{isMaxHeap ? 'Max Heap' : 'Min Heap'}</span>
        </button>
        <input type="number" value={inputValue} onChange={(e) => setInputValue(e.target.value)} />
        <button className="insert-btn" onClick={insertValue}>Insert</button>
        <button className="extract-btn" onClick={extractRoot}>Extract Root</button>
        <button onClick={clearHeap}>Clear</button>
      </div>

      <div className="visualization">
        <div className="tree-container">
          <div className="section-title">🌲 Tree Representation</div>
          <svg id="tree-svg" ref={svgRef} width="100%" height="400px"></svg>
        </div>

        <div className="array-container">
          <div className="section-title">📊 Array Representation</div>
          <div className="info">
            <div className="heap-property">
              {isMaxHeap ? 'Max Heap: Parent ≥ Children' : 'Min Heap: Parent ≤ Children'}
            </div>
            <div>Array indices: parent = (i-1)/2, left = 2i+1, right = 2i+2</div>
          </div>
          <div className="array-display">
            {heap.map((val, idx) => (
              <div key={idx} className="array-item">
                <div>{val}<br /><small>{idx}</small></div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

export default HeapVisualizer;