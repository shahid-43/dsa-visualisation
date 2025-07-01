import React, { useState, useEffect, useCallback } from 'react';
import { Play, Pause, RotateCcw, SkipForward, Plus, Trash2, Settings } from 'lucide-react';

const GraphVisualizer = () => {
  // Predefined graph templates
  const graphTemplates = {
    simple: {
      nodes: ['A', 'B', 'C', 'D', 'E', 'F'],
      edges: [
        ['A', 'B'], ['A', 'C'], ['B', 'D'], ['B', 'E'], ['C', 'F'], ['E', 'F']
      ],
      positions: {
        'A': { x: 200, y: 100 },
        'B': { x: 100, y: 200 },
        'C': { x: 300, y: 200 },
        'D': { x: 50, y: 300 },
        'E': { x: 150, y: 300 },
        'F': { x: 350, y: 300 }
      },
      hasCycle: false
    },
    cyclic: {
      nodes: ['A', 'B', 'C', 'D', 'E'],
      edges: [
        ['A', 'B'], ['B', 'C'], ['C', 'D'], ['D', 'E'], ['E', 'A'], ['B', 'D']
      ],
      positions: {
        'A': { x: 200, y: 50 },
        'B': { x: 350, y: 150 },
        'C': { x: 300, y: 300 },
        'D': { x: 100, y: 300 },
        'E': { x: 50, y: 150 }
      },
      hasCycle: true
    },
    tree: {
      nodes: ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H'],
      edges: [
        ['A', 'B'], ['A', 'C'], ['B', 'D'], ['B', 'E'], ['C', 'F'], ['C', 'G'], ['D', 'H']
      ],
      positions: {
        'A': { x: 200, y: 50 },
        'B': { x: 120, y: 150 },
        'C': { x: 280, y: 150 },
        'D': { x: 80, y: 250 },
        'E': { x: 160, y: 250 },
        'F': { x: 240, y: 250 },
        'G': { x: 320, y: 250 },
        'H': { x: 40, y: 350 }
      },
      hasCycle: false
    },
    large: {
      nodes: ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J'],
      edges: [
        ['A', 'B'], ['A', 'C'], ['B', 'D'], ['B', 'E'], ['C', 'F'], ['D', 'G'], 
        ['E', 'H'], ['F', 'I'], ['G', 'J'], ['H', 'I'], ['I', 'J']
      ],
      positions: {
        'A': { x: 200, y: 50 },
        'B': { x: 120, y: 130 },
        'C': { x: 280, y: 130 },
        'D': { x: 60, y: 210 },
        'E': { x: 180, y: 210 },
        'F': { x: 340, y: 210 },
        'G': { x: 20, y: 290 },
        'H': { x: 140, y: 290 },
        'I': { x: 260, y: 290 },
        'J': { x: 200, y: 370 }
      },
      hasCycle: false
    }
  };

  const [currentTemplate, setCurrentTemplate] = useState('simple');
  const [nodes, setNodes] = useState(graphTemplates.simple.nodes);
  const [edges, setEdges] = useState(graphTemplates.simple.edges);
  const [nodePositions, setNodePositions] = useState(graphTemplates.simple.positions);
  const [hasCycle, setHasCycle] = useState(graphTemplates.simple.hasCycle);
  const [rootNode, setRootNode] = useState('A');
  
  const [visitedNodes, setVisitedNodes] = useState(new Set());
  const [currentNode, setCurrentNode] = useState(null);
  const [queue, setQueue] = useState([]);
  const [stack, setStack] = useState([]);
  const [algorithm, setAlgorithm] = useState('BFS');
  const [isRunning, setIsRunning] = useState(false);
  const [step, setStep] = useState(0);
  const [traversalOrder, setTraversalOrder] = useState([]);
  const [speed, setSpeed] = useState(1000);
  const [showCustomizer, setShowCustomizer] = useState(false);
  
  // Custom graph building states
  const [newNodeName, setNewNodeName] = useState('');
  const [selectedNodes, setSelectedNodes] = useState([]);

  // Convert edges to adjacency list
  const getAdjacencyList = useCallback(() => {
    const graph = {};
    if (!nodes || !Array.isArray(nodes)) return graph;
    
    nodes.forEach(node => {
      graph[node] = [];
    });
    
    if (edges && Array.isArray(edges)) {
      edges.forEach(edge => {
        if (Array.isArray(edge) && edge.length >= 2) {
          const [from, to] = edge;
          if (graph[from] && graph[to]) {
            graph[from].push(to);
            graph[to].push(from); // Undirected graph
          }
        }
      });
    }
    return graph;
  }, [nodes, edges]);

  const reset = useCallback(() => {
    setVisitedNodes(new Set());
    setCurrentNode(null);
    setQueue([]);
    setStack([]);
    setStep(0);
    setTraversalOrder([]);
    setIsRunning(false);
  }, []);

  const initializeAlgorithm = useCallback((startNode = rootNode) => {
    reset();
    if (algorithm === 'BFS') {
      setQueue([startNode]);
    } else {
      setStack([startNode]);
    }
    setCurrentNode(startNode);
  }, [algorithm, reset, rootNode]);

  const bfsStep = useCallback(() => {
    const graph = getAdjacencyList();
    
    if (!queue || queue.length === 0) {
      setIsRunning(false);
      setCurrentNode(null);
      return;
    }

    const node = queue[0];
    if (!node || !graph[node]) {
      setIsRunning(false);
      return;
    }

    const newQueue = queue.slice(1);
    const newVisited = new Set(visitedNodes);
    newVisited.add(node);
    
    setVisitedNodes(newVisited);
    setCurrentNode(node);
    setTraversalOrder(prev => [...prev, node]);

    // Add unvisited neighbors to queue
    if (graph[node] && Array.isArray(graph[node])) {
      graph[node].forEach(neighbor => {
        if (!newVisited.has(neighbor) && !newQueue.includes(neighbor) && !queue.includes(neighbor)) {
          newQueue.push(neighbor);
        }
      });
    }
    
    setQueue(newQueue);
    setStep(prev => prev + 1);
  }, [queue, visitedNodes, getAdjacencyList]);

  const dfsStep = useCallback(() => {
    const graph = getAdjacencyList();
    
    if (!stack || stack.length === 0) {
      setIsRunning(false);
      setCurrentNode(null);
      return;
    }

    const node = stack[stack.length - 1];
    if (!node || !graph[node]) {
      setIsRunning(false);
      return;
    }

    const newStack = stack.slice(0, -1);
    
    if (visitedNodes.has(node)) {
      setStack(newStack);
      return;
    }

    const newVisited = new Set(visitedNodes);
    newVisited.add(node);
    
    setVisitedNodes(newVisited);
    setCurrentNode(node);
    setTraversalOrder(prev => [...prev, node]);

    // Add unvisited neighbors to stack (reverse order for consistent traversal)
    if (graph[node] && Array.isArray(graph[node])) {
      const neighbors = [...graph[node]].reverse();
      neighbors.forEach(neighbor => {
        if (!newVisited.has(neighbor)) {
          newStack.push(neighbor);
        }
      });
    }
    
    setStack(newStack);
    setStep(prev => prev + 1);
  }, [stack, visitedNodes, getAdjacencyList]);

  const runStep = useCallback(() => {
    if (algorithm === 'BFS') {
      bfsStep();
    } else {
      dfsStep();
    }
  }, [algorithm, bfsStep, dfsStep]);

  useEffect(() => {
    let interval;
    if (isRunning) {
      interval = setInterval(runStep, speed);
    }
    return () => clearInterval(interval);
  }, [isRunning, runStep, speed]);

  const togglePlay = () => {
    if (!isRunning && visitedNodes.size === 0) {
      initializeAlgorithm();
    }
    setIsRunning(!isRunning);
  };

  const loadTemplate = (templateName) => {
    const template = graphTemplates[templateName];
    setCurrentTemplate(templateName);
    setNodes(template.nodes);
    setEdges(template.edges);
    setNodePositions(template.positions);
    setHasCycle(template.hasCycle);
    setRootNode(template.nodes[0]);
    reset();
  };

  const addNode = () => {
    if (newNodeName && !nodes.includes(newNodeName)) {
      const newNodes = [...nodes, newNodeName];
      setNodes(newNodes);
      
      // Position new node in a spiral pattern
      const angle = (newNodes.length - 1) * 0.5;
      const radius = 80 + (newNodes.length - 1) * 20;
      const centerX = 200;
      const centerY = 200;
      
      setNodePositions(prev => ({
        ...prev,
        [newNodeName]: {
          x: centerX + radius * Math.cos(angle),
          y: centerY + radius * Math.sin(angle)
        }
      }));
      
      setNewNodeName('');
    }
  };

  const removeNode = (nodeToRemove) => {
    if (nodes.length <= 1) return;
    
    const newNodes = nodes.filter(node => node !== nodeToRemove);
    const newEdges = edges.filter(([from, to]) => from !== nodeToRemove && to !== nodeToRemove);
    const newPositions = { ...nodePositions };
    delete newPositions[nodeToRemove];
    
    setNodes(newNodes);
    setEdges(newEdges);
    setNodePositions(newPositions);
    
    if (rootNode === nodeToRemove) {
      setRootNode(newNodes[0]);
    }
    
    reset();
  };

  const toggleEdge = (node1, node2) => {
    const edgeExists = edges.some(([from, to]) => 
      (from === node1 && to === node2) || (from === node2 && to === node1)
    );
    
    if (edgeExists) {
      setEdges(edges.filter(([from, to]) => 
        !((from === node1 && to === node2) || (from === node2 && to === node1))
      ));
    } else {
      setEdges([...edges, [node1, node2]]);
    }
    reset();
  };

  const handleNodeClick = (node) => {
    if (showCustomizer) {
      if (selectedNodes.length === 0) {
        setSelectedNodes([node]);
      } else if (selectedNodes.length === 1) {
        if (selectedNodes[0] !== node) {
          toggleEdge(selectedNodes[0], node);
        }
        setSelectedNodes([]);
      }
    }
  };

  const detectCycles = useCallback(() => {
    const graph = getAdjacencyList();
    if (!nodes || nodes.length === 0) return false;
    
    const visited = new Set();
    
    const hasCycleDFS = (node, parent) => {
      visited.add(node);
      
      if (!graph[node] || !Array.isArray(graph[node])) return false;
      
      for (const neighbor of graph[node]) {
        if (neighbor === parent) continue;
        if (visited.has(neighbor)) return true;
        if (hasCycleDFS(neighbor, node)) return true;
      }
      
      return false;
    };
    
    for (const node of nodes) {
      if (!visited.has(node)) {
        if (hasCycleDFS(node, null)) {
          return true;
        }
      }
    }
    return false;
  }, [nodes, getAdjacencyList]);

  const getNodeColor = (node) => {
    if (showCustomizer && selectedNodes.includes(node)) return '#ffd43b';
    if (currentNode === node) return '#ff6b6b';
    if (visitedNodes.has(node)) return '#51cf66';
    if (node === rootNode) return '#339af0';
    return '#74c0fc';
  };

  const getEdgeColor = (from, to) => {
    if (visitedNodes.has(from) && visitedNodes.has(to)) return '#51cf66';
    return '#dee2e6';
  };

  const renderEdges = () => {
    return edges.map(([from, to], idx) => {
      const fromPos = nodePositions[from];
      const toPos = nodePositions[to];
      if (!fromPos || !toPos) return null;
      
      return (
        <line
          key={`${from}-${to}-${idx}`}
          x1={fromPos.x}
          y1={fromPos.y}
          x2={toPos.x}
          y2={toPos.y}
          stroke={getEdgeColor(from, to)}
          strokeWidth="3"
          opacity="0.7"
        />
      );
    });
  };

  const renderNodes = () => {
    return nodes.map(node => {
      const pos = nodePositions[node];
      if (!pos) return null;
      
      return (
        <g key={node} onClick={() => handleNodeClick(node)} style={{ cursor: showCustomizer ? 'pointer' : 'default' }}>
          <circle
            cx={pos.x}
            cy={pos.y}
            r="25"
            fill={getNodeColor(node)}
            stroke="#495057"
            strokeWidth="2"
          />
          <text
            x={pos.x}
            y={pos.y + 5}
            textAnchor="middle"
            fontSize="14"
            fontWeight="bold"
            fill="white"
          >
            {node}
          </text>
          {showCustomizer && (
            <text
              x={pos.x + 35}
              y={pos.y - 20}
              fontSize="12"
              fill="#e03131"
              style={{ cursor: 'pointer' }}
              onClick={(e) => {
                e.stopPropagation();
                removeNode(node);
              }}
            >
              ✕
            </text>
          )}
        </g>
      );
    });
  };

  return (
    <div className="p-6 max-w-7xl mx-auto bg-white">
      <h1 className="text-3xl font-bold text-center mb-8 text-gray-800">
        Advanced BFS vs DFS Visualizer
      </h1>
      
      <div className="flex flex-col xl:flex-row gap-8">
        {/* Graph Visualization */}
        <div className="flex-1">
          <div className="bg-gray-50 rounded-lg p-4 border">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold">Graph Visualization</h3>
              <button
                onClick={() => setShowCustomizer(!showCustomizer)}
                className={`flex items-center gap-2 px-3 py-1 rounded text-sm ${
                  showCustomizer ? 'bg-orange-500 text-white' : 'bg-gray-200 text-gray-700'
                }`}
              >
                <Settings size={16} />
                {showCustomizer ? 'Exit Edit' : 'Edit Graph'}
              </button>
            </div>
            <svg width="450" height="450" className="mx-auto border rounded">
              {renderEdges()}
              {renderNodes()}
            </svg>
            {showCustomizer && (
              <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded text-sm">
                <p><strong>Edit Mode:</strong> Click a node, then click another to toggle edge. Click the ✕ to remove nodes.</p>
                <p className="text-yellow-700">Selected: {selectedNodes.join(' → ')}</p>
              </div>
            )}
          </div>
        </div>

        {/* Controls and Information */}
        <div className="flex-1 space-y-6">
          {/* Graph Templates */}
          <div className="bg-white border rounded-lg p-4">
            <h3 className="text-lg font-semibold mb-3">Graph Templates</h3>
            <div className="grid grid-cols-2 gap-2">
              {Object.keys(graphTemplates).map(template => (
                <button
                  key={template}
                  onClick={() => loadTemplate(template)}
                  className={`px-3 py-2 rounded text-sm font-medium capitalize ${
                    currentTemplate === template
                      ? 'bg-indigo-500 text-white'
                      : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                  }`}
                >
                  {template}
                </button>
              ))}
            </div>
          </div>

          {/* Graph Configuration */}
          <div className="bg-white border rounded-lg p-4">
            <h3 className="text-lg font-semibold mb-3">Graph Configuration</h3>
            
            {/* Root Node Selection */}
            <div className="mb-4">
              <label className="block text-sm font-medium mb-2">Root Node:</label>
              <select
                value={rootNode}
                onChange={(e) => setRootNode(e.target.value)}
                className="w-full px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                {nodes.map(node => (
                  <option key={node} value={node}>{node}</option>
                ))}
              </select>
            </div>

            {/* Add Node */}
            <div className="mb-4">
              <label className="block text-sm font-medium mb-2">Add Node:</label>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={newNodeName}
                  onChange={(e) => setNewNodeName(e.target.value.toUpperCase())}
                  placeholder="Node name"
                  className="flex-1 px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                  maxLength="2"
                />
                <button
                  onClick={addNode}
                  className="px-3 py-2 bg-green-500 text-white rounded hover:bg-green-600"
                >
                  <Plus size={16} />
                </button>
              </div>
            </div>

            {/* Graph Properties */}
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="font-medium">Nodes:</span>
                <span>{nodes.length}</span>
              </div>
              <div className="flex justify-between">
                <span className="font-medium">Edges:</span>
                <span>{edges.length}</span>
              </div>
              <div className="flex justify-between">
                <span className="font-medium">Has Cycle:</span>
                <span className={detectCycles() ? 'text-red-600 font-medium' : 'text-green-600 font-medium'}>
                  {detectCycles() ? 'Yes' : 'No'}
                </span>
              </div>
            </div>
          </div>

          {/* Algorithm Selection */}
          <div className="bg-white border rounded-lg p-4">
            <h3 className="text-lg font-semibold mb-3">Algorithm</h3>
            <div className="flex gap-2">
              <button
                onClick={() => {
                  setAlgorithm('BFS');
                  reset();
                }}
                className={`px-4 py-2 rounded font-medium ${
                  algorithm === 'BFS'
                    ? 'bg-blue-500 text-white'
                    : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                }`}
              >
                BFS (Breadth-First)
              </button>
              <button
                onClick={() => {
                  setAlgorithm('DFS');
                  reset();
                }}
                className={`px-4 py-2 rounded font-medium ${
                  algorithm === 'DFS'
                    ? 'bg-purple-500 text-white'
                    : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                }`}
              >
                DFS (Depth-First)
              </button>
            </div>
          </div>

          {/* Controls */}
          <div className="bg-white border rounded-lg p-4">
            <h3 className="text-lg font-semibold mb-3">Controls</h3>
            <div className="flex gap-2 mb-4">
              <button
                onClick={togglePlay}
                className="flex items-center gap-2 px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600"
              >
                {isRunning ? <Pause size={16} /> : <Play size={16} />}
                {isRunning ? 'Pause' : 'Play'}
              </button>
              <button
                onClick={runStep}
                disabled={isRunning}
                className="flex items-center gap-2 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 disabled:opacity-50"
              >
                <SkipForward size={16} />
                Step
              </button>
              <button
                onClick={reset}
                className="flex items-center gap-2 px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600"
              >
                <RotateCcw size={16} />
                Reset
              </button>
            </div>
            
            {/* Speed Control */}
            <div>
              <label className="block text-sm font-medium mb-2">
                Speed: {speed}ms
              </label>
              <input
                type="range"
                min="200"
                max="2000"
                step="200"
                value={speed}
                onChange={(e) => setSpeed(Number(e.target.value))}
                className="w-full"
              />
            </div>
          </div>

          {/* Current State */}
          <div className="bg-white border rounded-lg p-4">
            <h3 className="text-lg font-semibold mb-3">Current State</h3>
            <div className="space-y-2 text-sm">
              <div>
                <span className="font-medium">Step:</span> {step}
              </div>
              <div>
                <span className="font-medium">Root Node:</span>{' '}
                <span className="px-2 py-1 bg-blue-100 text-blue-700 rounded">
                  {rootNode}
                </span>
              </div>
              <div>
                <span className="font-medium">Current Node:</span>{' '}
                <span className="px-2 py-1 bg-red-100 text-red-700 rounded">
                  {currentNode || 'None'}
                </span>
              </div>
              <div>
                <span className="font-medium">Visited:</span>{' '}
                {Array.from(visitedNodes).map(node => (
                  <span key={node} className="px-2 py-1 bg-green-100 text-green-700 rounded mr-1">
                    {node}
                  </span>
                ))}
              </div>
              <div>
                <span className="font-medium">
                  {algorithm === 'BFS' ? 'Queue:' : 'Stack:'}
                </span>{' '}
                {(algorithm === 'BFS' ? queue : stack).map((node, idx) => (
                  <span key={idx} className="px-2 py-1 bg-blue-100 text-blue-700 rounded mr-1">
                    {node}
                  </span>
                ))}
              </div>
              <div>
                <span className="font-medium">Traversal Order:</span>{' '}
                <div className="mt-1 text-xs font-mono bg-gray-100 p-2 rounded">
                  {traversalOrder.join(' → ') || 'Not started'}
                </div>
              </div>
            </div>
          </div>

          {/* Legend */}
          <div className="bg-white border rounded-lg p-4">
            <h3 className="text-lg font-semibold mb-3">Legend</h3>
            <div className="space-y-2 text-sm">
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 bg-blue-300 rounded-full"></div>
                <span>Root Node</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 bg-blue-200 rounded-full"></div>
                <span>Unvisited Node</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 bg-red-400 rounded-full"></div>
                <span>Current Node</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 bg-green-400 rounded-full"></div>
                <span>Visited Node</span>
              </div>
              {showCustomizer && (
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 bg-yellow-300 rounded-full"></div>
                  <span>Selected Node</span>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default GraphVisualizer;