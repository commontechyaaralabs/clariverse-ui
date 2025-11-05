'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { EisenhowerThread } from '@/lib/api';
import { GitBranch, ZoomIn, X } from 'lucide-react';
import { useMemo, useState } from 'react';
import { motion } from 'framer-motion';

interface IntentFlowMapProps {
  threads: EisenhowerThread[];
}

interface FlowNode {
  id: string;
  name: string;
  type: 'topic' | 'stage' | 'outcome';
  count: number;
  x: number;
  y: number;
}

interface FlowLink {
  source: string;
  target: string;
  value: number;
  sourceIndex: number;
  targetIndex: number;
}

interface FlowStats {
  totalFlow: number;
  avgFlowStrength: number;
  bottleneckStage: string;
  topTopic: string;
}

export function IntentFlowMap({ threads }: IntentFlowMapProps) {
  const [hoveredLink, setHoveredLink] = useState<FlowLink | null>(null);
  const [hoveredNode, setHoveredNode] = useState<string | null>(null);
  const [isZoomed, setIsZoomed] = useState(false);

  const { nodes, links, stats, topicStageLinks, stageOutcomeLinks } = useMemo(() => {
    // Group threads by topic, stage, and outcome
    const topicMap = new Map<string, number>();
    const stageMap = new Map<string, number>();
    const outcomeMap = new Map<string, number>();
    const topicStageMap = new Map<string, number>();
    const stageOutcomeMap = new Map<string, number>();

    // Helper function to determine stage based on thread properties
    const getStage = (thread: EisenhowerThread): string => {
      // Map thread to stages: Receive | Authenticate | Categorize | Resolution | Escalation | Update | Resolved | Close | Report
      
      // Close stage - threads that are closed
      if (thread.resolution_status === 'closed') {
        // Check if it's been reported (completed and has follow-up or summary)
        if (thread.action_pending_status === 'completed' && (thread.follow_up_required || thread.next_action_suggestion)) {
          return 'Report';
        }
        return 'Close';
      }
      
      // Escalation stage - threads that have been escalated
      if (thread.resolution_status === 'escalated' || thread.escalation_count > 0) {
        return 'Escalation';
      }
      
      // Resolved stage - threads that are completed but not closed
      if (thread.action_pending_status === 'completed' && thread.resolution_status !== 'closed') {
        return 'Resolved';
      }
      
      // Resolution stage - actively being resolved
      if (thread.resolution_status === 'in_progress' && thread.action_pending_status === 'in_progress') {
        return 'Resolution';
      }
      
      // Update stage - threads in progress being updated
      if (thread.resolution_status === 'in_progress' || thread.action_pending_status === 'in_progress') {
        return 'Update';
      }
      
      // Early workflow stages for open threads
      if (thread.resolution_status === 'open') {
        if (thread.action_pending_status === 'pending') {
          // Check if it's early in the workflow
          if (!thread.action_pending_from || thread.action_pending_from === 'company') {
            // First stages: Receive, Authenticate, Categorize
            // Use a deterministic mapping based on thread_id hash
            const hash = thread.thread_id.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
            const stageIndex = hash % 3;
            const earlyStages = ['Receive', 'Authenticate', 'Categorize'];
            return earlyStages[stageIndex];
          }
          return 'Update';
        }
        if (thread.action_pending_status === 'in_progress') {
          return 'Resolution';
        }
      }
      
      // Default fallback
      return 'Receive';
    };

    threads.forEach((thread) => {
      const topic = thread.dominant_cluster_name || 'Unknown';
      
      // Determine stage using the new stage mapping
      const stage = getStage(thread);
      
      const outcome = thread.resolution_status || 'open';

      // Count nodes
      topicMap.set(topic, (topicMap.get(topic) || 0) + 1);
      stageMap.set(stage, (stageMap.get(stage) || 0) + 1);
      outcomeMap.set(outcome, (outcomeMap.get(outcome) || 0) + 1);

      // Count links
      const topicStageKey = `${topic}→${stage}`;
      topicStageMap.set(topicStageKey, (topicStageMap.get(topicStageKey) || 0) + 1);

      const stageOutcomeKey = `${stage}→${outcome}`;
      stageOutcomeMap.set(stageOutcomeKey, (stageOutcomeMap.get(stageOutcomeKey) || 0) + 1);
    });

    // Get top items (limit to prevent overcrowding)
    const topTopics = Array.from(topicMap.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 6) // Show top 6 topics
      .map(([name]) => name);

    // Always show all workflow stages: Receive | Authenticate | Categorize | Resolution | Escalation | Update | Resolved | Close | Report
    const allStages = ['Receive', 'Authenticate', 'Categorize', 'Resolution', 'Escalation', 'Update', 'Resolved', 'Close', 'Report'];
    const topStages = allStages.filter(stage => stageMap.has(stage));

    const topOutcomes = Array.from(outcomeMap.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 4)
      .map(([name]) => name);

    // Create nodes with positions
    const nodeMap = new Map<string, FlowNode>();
    let nodeIndex = 0;

    // Topics (left column) - distribute evenly with better spacing
    const topicNodes: FlowNode[] = topTopics.map((name, idx) => {
      // Calculate spacing to distribute topics evenly across available height
      const totalHeight = 450; // Available height for topics
      const spacing = totalHeight / (topTopics.length + 1);
      const node: FlowNode = {
        id: `topic-${name}`,
        name,
        type: 'topic',
        count: topicMap.get(name) || 0,
        x: 50,
        y: 60 + idx * spacing, // Start a bit higher
      };
      nodeMap.set(node.id, node);
      return node;
    });

    // Stages (middle column) - show all workflow stages with better spacing
    const stageNodes: FlowNode[] = topStages.map((name, idx) => {
      // Calculate spacing to distribute stages evenly across available height
      const totalHeight = 500; // Increased for 9 stages
      const spacing = totalHeight / (topStages.length + 1);
      const node: FlowNode = {
        id: `stage-${name}`,
        name: name, // Already properly formatted
        type: 'stage',
        count: stageMap.get(name) || 0,
        x: 400,
        y: 50 + idx * spacing, // Start a bit higher for better distribution
      };
      nodeMap.set(node.id, node);
      return node;
    });

    // Outcomes (right column) - positioned further right to match topic-to-stage link length
    const outcomeNodes: FlowNode[] = topOutcomes.map((name, idx) => {
      // Calculate spacing similar to topics for better distribution
      const totalHeight = 450;
      const spacing = totalHeight / (topOutcomes.length + 1);
      const node: FlowNode = {
        id: `outcome-${name}`,
        name: name.toUpperCase(),
        type: 'outcome',
        count: outcomeMap.get(name) || 0,
        x: 750, // Positioned further right to match topic-to-stage link length (400 + 120 + 230 = 750)
        y: 60 + idx * spacing, // Match topics spacing pattern for consistency
      };
      nodeMap.set(node.id, node);
      return node;
    });

    const allNodes = [...topicNodes, ...stageNodes, ...outcomeNodes];

    // Create links
    const allLinks: FlowLink[] = [];

    // Topic -> Stage links
    const topicStageLinksData: FlowLink[] = [];
    topicStageMap.forEach((value, key) => {
      const [topic, stage] = key.split('→');
      if (topTopics.includes(topic) && topStages.includes(stage)) {
        const sourceNode = topicNodes.find((n) => n.name === topic);
        const targetNode = stageNodes.find((n) => n.id === `stage-${stage}`); // Use ID instead of name
        if (sourceNode && targetNode) {
          const link: FlowLink = {
            source: sourceNode.id,
            target: targetNode.id,
            value,
            sourceIndex: topicNodes.indexOf(sourceNode),
            targetIndex: stageNodes.indexOf(targetNode),
          };
          allLinks.push(link);
          topicStageLinksData.push(link);
        }
      }
    });

    // Stage -> Outcome links
    const stageOutcomeLinksData: FlowLink[] = [];
    stageOutcomeMap.forEach((value, key) => {
      const [stage, outcome] = key.split('→');
      if (topStages.includes(stage) && topOutcomes.includes(outcome)) {
        const sourceNode = stageNodes.find((n) => n.id === `stage-${stage}`); // Use ID instead of name
        const targetNode = outcomeNodes.find((n) => n.name.toLowerCase() === outcome);
        if (sourceNode && targetNode) {
          const link: FlowLink = {
            source: sourceNode.id,
            target: targetNode.id,
            value,
            sourceIndex: stageNodes.indexOf(sourceNode),
            targetIndex: outcomeNodes.indexOf(targetNode),
          };
          allLinks.push(link);
          stageOutcomeLinksData.push(link);
        }
      }
    });

    // Calculate statistics
    const totalFlow = allLinks.reduce((sum, link) => sum + link.value, 0);
    const avgFlowStrength = allLinks.length > 0 ? totalFlow / allLinks.length : 0;

    // Find bottleneck stage (stage with most incoming flow)
    const stageInflow = new Map<string, number>();
    topicStageLinksData.forEach((link) => {
      const stageId = link.target;
      stageInflow.set(stageId, (stageInflow.get(stageId) || 0) + link.value);
    });
    const bottleneckStage = Array.from(stageInflow.entries())
      .sort((a, b) => b[1] - a[1])[0]?.[0] || 'N/A';
    const bottleneckNode = stageNodes.find((n) => n.id === bottleneckStage);
    const bottleneckName = bottleneckNode?.name || 'N/A';

    // Top topic (most outgoing flow)
    const topicOutflow = new Map<string, number>();
    topicStageLinksData.forEach((link) => {
      const topicId = link.source;
      topicOutflow.set(topicId, (topicOutflow.get(topicId) || 0) + link.value);
    });
    const topTopicId = Array.from(topicOutflow.entries())
      .sort((a, b) => b[1] - a[1])[0]?.[0] || 'N/A';
    const topTopicNode = topicNodes.find((n) => n.id === topTopicId);
    const topTopicName = topTopicNode?.name || 'N/A';

    const stats: FlowStats = {
      totalFlow,
      avgFlowStrength: Math.round(avgFlowStrength * 10) / 10,
      bottleneckStage: bottleneckName,
      topTopic: topTopicName,
    };

    return {
      nodes: allNodes,
      links: allLinks,
      stats,
      topicStageLinks: topicStageLinksData,
      stageOutcomeLinks: stageOutcomeLinksData,
    };
  }, [threads]);

  const maxFlow = Math.max(...links.map((l) => l.value), 1);

  const getNodeColor = (type: string) => {
    switch (type) {
      case 'topic':
        return '#7c3aed'; // purple
      case 'stage':
        return '#3b82f6'; // blue
      case 'outcome':
        return '#10b981'; // green
      default:
        return '#6b7280';
    }
  };

  const getNodeBorderColor = (type: string) => {
    switch (type) {
      case 'topic':
        return '#8b5cf6';
      case 'stage':
        return '#60a5fa';
      case 'outcome':
        return '#34d399';
      default:
        return '#9ca3af';
    }
  };

  const getLinkColor = (link: FlowLink, isHovered: boolean) => {
    if (isHovered) return '#a78bfa';
    if (link.source.startsWith('topic')) return '#7c3aed';
    if (link.source.startsWith('stage')) return '#3b82f6';
    return '#6b7280';
  };

  const getLinkOpacity = (link: FlowLink) => {
    return 0.3 + (link.value / maxFlow) * 0.5;
  };

  const getLinkWidth = (link: FlowLink) => {
    return 2 + (link.value / maxFlow) * 6;
  };

  return (
    <Card className="bg-gray-900 border-gray-700">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <GitBranch className="h-5 w-5 text-purple-400" />
            <CardTitle className="text-white">Intent Flow Map</CardTitle>
          </div>
          <div className="flex items-center gap-2">
            <Button
              onClick={() => setIsZoomed(true)}
              variant="outline"
              size="sm"
              className="bg-purple-600/10 border-purple-500/30 text-purple-300 hover:bg-purple-600/20"
            >
              <ZoomIn className="h-4 w-4 mr-2" />
              Zoom
            </Button>
            <div className="flex items-center gap-2 px-2 py-1 bg-purple-500/10 border border-purple-500/30 rounded-md">
              <span className="text-sm">✨</span>
              <span className="text-xs text-purple-300 font-medium">AI Flow Analysis</span>
            </div>
          </div>
        </div>
        <CardDescription className="text-gray-400">
          Visual flow: Topic → Stage → Outcome • Interactive Sankey-style diagram
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          {/* Flow Visualization */}
          <div className="relative bg-gray-950 rounded-lg border border-gray-800 overflow-hidden" style={{ height: '600px' }}>
            <svg width="100%" height="100%" viewBox="0 0 900 600" preserveAspectRatio="xMidYMid meet" className="absolute inset-0">
              <defs>
                <linearGradient id="topicGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#7c3aed" stopOpacity="0.8" />
                  <stop offset="100%" stopColor="#8b5cf6" stopOpacity="0.6" />
                </linearGradient>
                <linearGradient id="stageGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#3b82f6" stopOpacity="0.8" />
                  <stop offset="100%" stopColor="#60a5fa" stopOpacity="0.6" />
                </linearGradient>
                <linearGradient id="outcomeGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#10b981" stopOpacity="0.8" />
                  <stop offset="100%" stopColor="#34d399" stopOpacity="0.6" />
                </linearGradient>
                <filter id="glow">
                  <feGaussianBlur stdDeviation="3" result="coloredBlur" />
                  <feMerge>
                    <feMergeNode in="coloredBlur" />
                    <feMergeNode in="SourceGraphic" />
                  </feMerge>
                </filter>
              </defs>

              {/* Links - Topic to Stage */}
              {topicStageLinks.map((link, idx) => {
                const sourceNode = nodes.find((n) => n.id === link.source);
                const targetNode = nodes.find((n) => n.id === link.target);
                if (!sourceNode || !targetNode) return null;

                const isHovered = hoveredLink?.source === link.source && hoveredLink?.target === link.target;
                const sourceX = sourceNode.x + 120;
                const targetX = targetNode.x;
                const pathData = `M ${sourceX} ${sourceNode.y + 20} L ${targetX} ${targetNode.y + 20}`;

                return (
                  <motion.path
                    key={`topic-stage-${idx}`}
                    d={pathData}
                    fill="none"
                    stroke={getLinkColor(link, isHovered)}
                    strokeWidth={getLinkWidth(link)}
                    opacity={isHovered ? 0.8 : getLinkOpacity(link)}
                    strokeLinecap="round"
                    filter={isHovered ? 'url(#glow)' : undefined}
                    initial={{ pathLength: 0, opacity: 0 }}
                    animate={{ pathLength: 1, opacity: isHovered ? 0.8 : getLinkOpacity(link) }}
                    transition={{ duration: 0.5, delay: idx * 0.05 }}
                    onMouseEnter={() => setHoveredLink(link)}
                    onMouseLeave={() => setHoveredLink(null)}
                    style={{ cursor: 'pointer' }}
                  />
                );
              })}

               {/* Links - Stage to Outcome */}
               {stageOutcomeLinks.map((link, idx) => {
                 const sourceNode = nodes.find((n) => n.id === link.source);
                 const targetNode = nodes.find((n) => n.id === link.target);
                 if (!sourceNode || !targetNode) return null;

                 const isHovered = hoveredLink?.source === link.source && hoveredLink?.target === link.target;
                 const sourceX = sourceNode.x + 120; // End of stage node
                 const targetX = targetNode.x; // Start of outcome node
                 const pathData = `M ${sourceX} ${sourceNode.y + 20} L ${targetX} ${targetNode.y + 20}`;

                return (
                  <motion.path
                    key={`stage-outcome-${idx}`}
                    d={pathData}
                    fill="none"
                    stroke={getLinkColor(link, isHovered)}
                    strokeWidth={getLinkWidth(link)}
                    opacity={isHovered ? 0.8 : getLinkOpacity(link)}
                    strokeLinecap="round"
                    filter={isHovered ? 'url(#glow)' : undefined}
                    initial={{ pathLength: 0, opacity: 0 }}
                    animate={{ pathLength: 1, opacity: isHovered ? 0.8 : getLinkOpacity(link) }}
                    transition={{ duration: 0.5, delay: (topicStageLinks.length + idx) * 0.05 }}
                    onMouseEnter={() => setHoveredLink(link)}
                    onMouseLeave={() => setHoveredLink(null)}
                    style={{ cursor: 'pointer' }}
                  />
                );
              })}

              {/* Flow value labels on links */}
              {links.map((link, idx) => {
                const sourceNode = nodes.find((n) => n.id === link.source);
                const targetNode = nodes.find((n) => n.id === link.target);
                if (!sourceNode || !targetNode) return null;

                const isHovered = hoveredLink?.source === link.source && hoveredLink?.target === link.target;
                const midX = (sourceNode.x + 120 + targetNode.x) / 2;
                const midY = (sourceNode.y + 20 + targetNode.y + 20) / 2;

                if (!isHovered && link.value < maxFlow * 0.15) return null; // Only show labels for significant flows or when hovered

                return (
                  <motion.g
                    key={`label-${idx}`}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: isHovered ? 1 : 0.6 }}
                  >
                    <rect
                      x={midX - 20}
                      y={midY - 10}
                      width={40}
                      height={20}
                      fill="rgba(0, 0, 0, 0.8)"
                      rx={4}
                    />
                    <text
                      x={midX}
                      y={midY + 5}
                      textAnchor="middle"
                      fill="#ffffff"
                      fontSize="10"
                      fontWeight="600"
                    >
                      {link.value}
                    </text>
                  </motion.g>
                );
              })}

              {/* Nodes */}
              {nodes.map((node, idx) => {
                const isHovered = hoveredNode === node.id;
                const gradientId = `${node.type}Gradient`;
                const color = getNodeColor(node.type);
                const borderColor = getNodeBorderColor(node.type);

                return (
                  <motion.g
                    key={node.id}
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{
                      opacity: 1,
                      scale: isHovered ? 1.1 : 1,
                    }}
                    transition={{ duration: 0.3, delay: idx * 0.05 }}
                  >
                    {/* Node rectangle - wider for outcomes to match topics/stages clarity */}
                    <rect
                      x={node.x}
                      y={node.y}
                      width={node.type === 'outcome' ? 120 : 120}
                      height={40}
                      rx={8}
                      fill={color}
                      fillOpacity={isHovered ? 0.9 : 0.7}
                      stroke={borderColor}
                      strokeWidth={isHovered ? 3 : 2}
                      filter={isHovered ? 'url(#glow)' : undefined}
                      onMouseEnter={() => setHoveredNode(node.id)}
                      onMouseLeave={() => setHoveredNode(null)}
                      style={{ cursor: 'pointer' }}
                    />
                    {/* Node label */}
                    <text
                      x={node.x + 60}
                      y={node.y + 22}
                      textAnchor="middle"
                      fill="#ffffff"
                      fontSize={node.type === 'outcome' ? 11 : 11}
                      fontWeight="600"
                      className="pointer-events-none"
                    >
                      {node.type === 'outcome' 
                        ? (node.name.length > 12 ? `${node.name.substring(0, 12)}...` : node.name)
                        : (node.name.length > 12 ? `${node.name.substring(0, 12)}...` : node.name)
                      }
                    </text>
                    {/* Node count */}
                    <text
                      x={node.x + 60}
                      y={node.y + 35}
                      textAnchor="middle"
                      fill="#d1d5db"
                      fontSize="9"
                      className="pointer-events-none"
                    >
                      {node.count} threads
                    </text>
                  </motion.g>
                );
              })}

              {/* Column labels */}
              <text x="50" y="50" fill="#9ca3af" fontSize="12" fontWeight="600">
                Topics
              </text>
              <text x="400" y="50" fill="#9ca3af" fontSize="12" fontWeight="600">
                Stages
              </text>
              <text x="750" y="50" fill="#9ca3af" fontSize="12" fontWeight="600">
                Outcomes
              </text>

              {/* Arrows between columns */}
              <path
                d="M 220 250 L 240 250 M 230 245 L 240 250 L 230 255"
                stroke="#6b7280"
                strokeWidth="2"
                fill="none"
                opacity="0.5"
              />
              <path
                d="M 520 250 L 540 250 M 530 245 L 540 250 L 530 255"
                stroke="#6b7280"
                strokeWidth="2"
                fill="none"
                opacity="0.5"
              />
            </svg>
          </div>

          {/* Legend */}
          <div className="flex items-center justify-center gap-6 pt-4 border-t border-gray-800">
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 rounded bg-purple-500"></div>
              <span className="text-xs text-gray-400">Topics</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 rounded bg-blue-500"></div>
              <span className="text-xs text-gray-400">Stages</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 rounded bg-green-500"></div>
              <span className="text-xs text-gray-400">Outcomes</span>
            </div>
            <div className="w-px h-4 bg-gray-700"></div>
            <div className="text-xs text-gray-500">
              Line thickness = flow volume • Hover to see details • Click Zoom for full view
            </div>
          </div>
        </div>
      </CardContent>

      {/* Zoom Dialog */}
      <Dialog open={isZoomed} onOpenChange={setIsZoomed}>
        <DialogContent className="max-w-[100vw] max-h-[100vh] w-screen h-screen m-0 p-0 bg-gray-900 border-gray-700 rounded-none flex flex-col">
          <DialogTitle className="sr-only">Intent Flow Map - Full View</DialogTitle>
          <div className="relative bg-gray-950 overflow-hidden flex-1 min-h-0 w-full h-full">
            <svg width="100%" height="100%" viewBox="0 0 1400 800" preserveAspectRatio="xMidYMid meet" className="absolute inset-0">
              <defs>
                <linearGradient id="topicGradientFull" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#7c3aed" stopOpacity="0.8" />
                  <stop offset="100%" stopColor="#8b5cf6" stopOpacity="0.6" />
                </linearGradient>
                <linearGradient id="stageGradientFull" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#3b82f6" stopOpacity="0.8" />
                  <stop offset="100%" stopColor="#60a5fa" stopOpacity="0.6" />
                </linearGradient>
                <linearGradient id="outcomeGradientFull" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#10b981" stopOpacity="0.8" />
                  <stop offset="100%" stopColor="#34d399" stopOpacity="0.6" />
                </linearGradient>
                <filter id="glowFull">
                  <feGaussianBlur stdDeviation="3" result="coloredBlur" />
                  <feMerge>
                    <feMergeNode in="coloredBlur" />
                    <feMergeNode in="SourceGraphic" />
                  </feMerge>
                </filter>
              </defs>

               {/* Links - Topic to Stage (Full View) */}
               {topicStageLinks.map((link, idx) => {
                 const sourceNode = nodes.find((n) => n.id === link.source);
                 const targetNode = nodes.find((n) => n.id === link.target);
                 if (!sourceNode || !targetNode) return null;

                 // Scale positions for larger viewBox
                 const scaleX = 1600 / 900;
                 const scaleY = 800 / 500;
                 const sourceX = (sourceNode.x + 120) * scaleX;
                 const targetX = targetNode.x * scaleX;
                 const sourceY = (sourceNode.y + 20) * scaleY;
                 const targetY = (targetNode.y + 20) * scaleY;
                 const pathData = `M ${sourceX} ${sourceY} L ${targetX} ${targetY}`;

                return (
                  <g key={`topic-stage-full-${idx}`}>
                    <path
                      d={pathData}
                      fill="none"
                      stroke={getLinkColor(link, false)}
                      strokeWidth={getLinkWidth(link) * 1.5}
                      opacity={getLinkOpacity(link)}
                      strokeLinecap="round"
                    />
                    {/* Always show labels in full view */}
                    <rect
                      x={(sourceX + targetX) / 2 - 25}
                      y={(sourceY + targetY) / 2 - 12}
                      width={50}
                      height={24}
                      fill="rgba(0, 0, 0, 0.9)"
                      rx={4}
                    />
                    <text
                      x={(sourceX + targetX) / 2}
                      y={(sourceY + targetY) / 2 + 5}
                      textAnchor="middle"
                      fill="#ffffff"
                      fontSize="12"
                      fontWeight="600"
                    >
                      {link.value}
                    </text>
                  </g>
                );
              })}

               {/* Links - Stage to Outcome (Full View) */}
               {stageOutcomeLinks.map((link, idx) => {
                 const sourceNode = nodes.find((n) => n.id === link.source);
                 const targetNode = nodes.find((n) => n.id === link.target);
                 if (!sourceNode || !targetNode) return null;

                 const scaleX = 1600 / 900;
                 const scaleY = 800 / 500;
                 const sourceX = (sourceNode.x + 120) * scaleX;
                 const targetX = targetNode.x * scaleX;
                 const sourceY = (sourceNode.y + 20) * scaleY;
                 const targetY = (targetNode.y + 20) * scaleY;
                 const pathData = `M ${sourceX} ${sourceY} L ${targetX} ${targetY}`;

                return (
                  <g key={`stage-outcome-full-${idx}`}>
                    <path
                      d={pathData}
                      fill="none"
                      stroke={getLinkColor(link, false)}
                      strokeWidth={getLinkWidth(link) * 1.5}
                      opacity={getLinkOpacity(link)}
                      strokeLinecap="round"
                    />
                    {/* Always show labels in full view */}
                    <rect
                      x={(sourceX + targetX) / 2 - 25}
                      y={(sourceY + targetY) / 2 - 12}
                      width={50}
                      height={24}
                      fill="rgba(0, 0, 0, 0.9)"
                      rx={4}
                    />
                    <text
                      x={(sourceX + targetX) / 2}
                      y={(sourceY + targetY) / 2 + 5}
                      textAnchor="middle"
                      fill="#ffffff"
                      fontSize="12"
                      fontWeight="600"
                    >
                      {link.value}
                    </text>
                  </g>
                );
              })}

              {/* Nodes (Full View) */}
              {nodes.map((node, idx) => {
                const scaleX = 1600 / 900;
                const scaleY = 800 / 500;
                const scaledX = node.x * scaleX;
                const scaledY = node.y * scaleY;
                const color = getNodeColor(node.type);
                const borderColor = getNodeBorderColor(node.type);
                
                // Wider width for outcomes in zoom view - 200px fixed width for better clarity
                const nodeWidth = node.type === 'outcome' ? 200 : 120 * scaleX;
                const nodeHeight = 50 * scaleY; // Slightly taller for better spacing

                return (
                  <g key={`node-full-${node.id}`}>
                    <rect
                      x={scaledX}
                      y={scaledY}
                      width={nodeWidth}
                      height={nodeHeight}
                      rx={10}
                      fill={color}
                      fillOpacity={0.7}
                      stroke={borderColor}
                      strokeWidth={2}
                    />
                    <text
                      x={scaledX + nodeWidth / 2}
                      y={scaledY + (25 * scaleY)}
                      textAnchor="middle"
                      fill="#ffffff"
                      fontSize={node.type === 'outcome' ? 15 : 16}
                      fontWeight="600"
                    >
                      {node.name}
                    </text>
                    <text
                      x={scaledX + nodeWidth / 2}
                      y={scaledY + (42 * scaleY)}
                      textAnchor="middle"
                      fill="#d1d5db"
                      fontSize="13"
                    >
                      {node.count} threads
                    </text>
                  </g>
                );
              })}

               {/* Column labels (Full View) */}
               <text x="60" y="50" fill="#9ca3af" fontSize="16" fontWeight="600">
                 Topics
               </text>
               <text x="750" y="50" fill="#9ca3af" fontSize="16" fontWeight="600">
                 Stages
               </text>
               <text x="1333" y="50" fill="#9ca3af" fontSize="16" fontWeight="600">
                 Outcomes
               </text>
            </svg>
          </div>
        </DialogContent>
      </Dialog>
    </Card>
  );
}
