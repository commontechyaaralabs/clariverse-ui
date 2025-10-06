'use client';

import { useState, useEffect, useRef } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { NetworkGraphData } from '@/lib/api';

interface NetworkGraphProps {
  data: NetworkGraphData;
}

export function NetworkGraph({ data }: NetworkGraphProps) {
  const svgRef = useRef<SVGSVGElement>(null);
  const [hoveredNode, setHoveredNode] = useState<NetworkGraphData['nodes'][0] | null>(null);
  const [hoveredEdge, setHoveredEdge] = useState<NetworkGraphData['edges'][0] | null>(null);

  useEffect(() => {
    if (!svgRef.current) return;

    const svg = svgRef.current;
    const width = 600;
    const height = 400;

    // Simple force-directed layout simulation
    const nodes = data.nodes.map(node => ({
      ...node,
      x: Math.random() * (width - 100) + 50,
      y: Math.random() * (height - 100) + 50,
      vx: 0,
      vy: 0
    }));

    // Force simulation (simplified)
    const updatePositions = () => {
      nodes.forEach(node => {
        // Repulsion from other nodes
        nodes.forEach(other => {
          if (node.id !== other.id) {
            const dx = node.x - other.x;
            const dy = node.y - other.y;
            const distance = Math.sqrt(dx * dx + dy * dy);
            if (distance > 0 && distance < 100) {
              const force = 1000 / (distance * distance);
              node.vx += (dx / distance) * force;
              node.vy += (dy / distance) * force;
            }
          }
        });

        // Attraction from connected nodes
        data.edges.forEach(edge => {
          if (edge.source === node.id) {
            const target = nodes.find(n => n.id === edge.target);
            if (target) {
              const dx = target.x - node.x;
              const dy = target.y - node.y;
              const distance = Math.sqrt(dx * dx + dy * dy);
              if (distance > 0) {
                const force = distance * 0.01;
                node.vx += (dx / distance) * force;
                node.vy += (dy / distance) * force;
              }
            }
          }
        });

        // Apply velocity with damping
        node.vx *= 0.9;
        node.vy *= 0.9;
        node.x += node.vx;
        node.y += node.vy;

        // Keep nodes within bounds
        node.x = Math.max(30, Math.min(width - 30, node.x));
        node.y = Math.max(30, Math.min(height - 30, node.y));
      });
    };

    // Run simulation
    for (let i = 0; i < 100; i++) {
      updatePositions();
    }

    // Update node positions in data
    data.nodes.forEach(node => {
      const simulatedNode = nodes.find(n => n.id === node.id);
      if (simulatedNode) {
        node.x = simulatedNode.x;
        node.y = simulatedNode.y;
      }
    });
  }, [data]);

  const getNodeColor = (type: string) => {
    switch (type) {
      case 'customer': return '#3B82F6'; // Blue
      case 'agent': return '#10B981'; // Green
      case 'manager': return '#F59E0B'; // Yellow
      case 'external': return '#EF4444'; // Red
      default: return '#6B7280'; // Gray
    }
  };

  const getNodeSize = (threadCount: number) => {
    return Math.max(8, Math.min(20, 8 + threadCount * 0.5));
  };

  const getSentimentColor = (sentiment: number) => {
    if (sentiment <= 2) return '#EF4444'; // Red
    if (sentiment <= 3) return '#F59E0B'; // Yellow
    return '#10B981'; // Green
  };

  return (
    <Card className="bg-gray-900 border-gray-700">
      <CardHeader>
        <CardTitle className="text-white">People & Collaboration Network</CardTitle>
        <CardDescription className="text-gray-400">
          Customer-agent interaction patterns and communication flows
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {/* Legend */}
          <div className="flex items-center gap-6 text-sm">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
              <span className="text-gray-300">Customers</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-green-500 rounded-full"></div>
              <span className="text-gray-300">Agents</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
              <span className="text-gray-300">Managers</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-red-500 rounded-full"></div>
              <span className="text-gray-300">External</span>
            </div>
          </div>

          {/* Network Graph */}
          <div className="relative">
            <svg
              ref={svgRef}
              width="100%"
              height="400"
              className="border border-gray-700 rounded-lg bg-gray-800"
            >
              {/* Edges */}
              {data.edges.map((edge, index) => {
                const sourceNode = data.nodes.find(n => n.id === edge.source);
                const targetNode = data.nodes.find(n => n.id === edge.target);
                
                if (!sourceNode || !targetNode) return null;

                return (
                  <line
                    key={index}
                    x1={sourceNode.x || 0}
                    y1={sourceNode.y || 0}
                    x2={targetNode.x || 0}
                    y2={targetNode.y || 0}
                    stroke="#4B5563"
                    strokeWidth={edge.weight * 3}
                    opacity={0.6}
                    onMouseEnter={() => setHoveredEdge(edge)}
                    onMouseLeave={() => setHoveredEdge(null)}
                  />
                );
              })}

              {/* Nodes */}
              {data.nodes.map((node) => (
                <g key={node.id}>
                  <circle
                    cx={node.x || 0}
                    cy={node.y || 0}
                    r={getNodeSize(node.thread_count)}
                    fill={getNodeColor(node.type)}
                    stroke={getSentimentColor(node.avg_sentiment)}
                    strokeWidth="2"
                    className="cursor-pointer transition-all duration-200 hover:r-6"
                    onMouseEnter={() => setHoveredNode(node)}
                    onMouseLeave={() => setHoveredNode(null)}
                  />
                  <text
                    x={node.x || 0}
                    y={(node.y || 0) + 4}
                    textAnchor="middle"
                    className="text-xs fill-white pointer-events-none"
                    fontSize="10"
                  >
                    {node.label.split(' ')[1]}
                  </text>
                </g>
              ))}
            </svg>

            {/* Hover Tooltips */}
            {hoveredNode && (
              <div className="absolute z-10 bg-gray-800 border border-gray-600 rounded-lg p-3 shadow-xl max-w-xs">
                <div className="space-y-1 text-sm">
                  <div className="text-white font-medium">{hoveredNode.label}</div>
                  <div className="text-gray-300">
                    <div>Type: <span className="text-blue-400">{hoveredNode.type}</span></div>
                    <div>Email: <span className="text-gray-400">{hoveredNode.email}</span></div>
                    <div>Threads: <span className="text-green-400">{hoveredNode.thread_count}</span></div>
                    <div>Avg Sentiment: <span className={getSentimentColor(hoveredNode.avg_sentiment)}>{hoveredNode.avg_sentiment}</span></div>
                  </div>
                </div>
              </div>
            )}

            {hoveredEdge && (
              <div className="absolute z-10 bg-gray-800 border border-gray-600 rounded-lg p-3 shadow-xl max-w-xs">
                <div className="space-y-1 text-sm">
                  <div className="text-white font-medium">Connection</div>
                  <div className="text-gray-300">
                    <div>Weight: <span className="text-blue-400">{hoveredEdge.weight.toFixed(2)}</span></div>
                    <div>Thread Count: <span className="text-green-400">{hoveredEdge.thread_count}</span></div>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Statistics */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-400">
                {data.nodes.filter(n => n.type === 'customer').length}
              </div>
              <div className="text-gray-400">Customers</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-400">
                {data.nodes.filter(n => n.type === 'external').length}
              </div>
              <div className="text-gray-400">Agents</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-yellow-400">
                {data.nodes.length}
              </div>
              <div className="text-gray-400">Total Nodes</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-red-400">
                {data.edges.length}
              </div>
              <div className="text-gray-400">Connections</div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

