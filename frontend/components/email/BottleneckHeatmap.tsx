'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { EisenhowerThread } from '@/lib/api';
import { AlertTriangle, User } from 'lucide-react';
import { useMemo, useState } from 'react';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

interface BottleneckHeatmapProps {
  threads: EisenhowerThread[];
}

interface HeatmapCell {
  owner: string;
  stage: string;
  avgAge: number; // in hours
  count: number;
  suggestion?: string;
}

export function BottleneckHeatmap({ threads }: BottleneckHeatmapProps) {
  const [hoveredCell, setHoveredCell] = useState<{ owner: string; stage: string } | null>(null);

  // Helper function to determine stage based on thread properties (same as IntentFlowMap)
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

  const heatmapData = useMemo(() => {
    const now = new Date().getTime();
    const cellMap = new Map<string, { ages: number[]; count: number }>();

    threads.forEach((thread) => {
      const owner = thread.owner || thread.assigned_to || 'Unassigned';
      const stage = getStage(thread); // Use the stage mapping function
      const key = `${owner}|${stage}`;

      const lastMessageTime = new Date(thread.last_message_at).getTime();
      const ageHours = (now - lastMessageTime) / (1000 * 60 * 60);

      const existing = cellMap.get(key) || { ages: [], count: 0 };
      existing.ages.push(ageHours);
      existing.count += 1;
      cellMap.set(key, existing);
    });

    // Get unique owners and stages
    const owners = Array.from(new Set(threads.map((t) => t.owner || t.assigned_to || 'Unassigned')));
    const stages = Array.from(new Set(threads.map((t) => getStage(t)))); // Use stage mapping function

    // Create heatmap cells
    const cells: HeatmapCell[] = [];

    owners.forEach((owner) => {
      stages.forEach((stage) => {
        const key = `${owner}|${stage}`;
        const data = cellMap.get(key);

        if (data && data.count > 0) {
          const avgAge = data.ages.reduce((sum, age) => sum + age, 0) / data.ages.length;

          // Generate AI suggestion for redistribution
          let suggestion: string | undefined;
          if (avgAge > 72) {
            // Items older than 3 days
            const otherOwners = owners.filter((o) => o !== owner && o !== 'Unassigned');
            if (otherOwners.length > 0) {
              suggestion = `Consider redistributing ${Math.round(data.count * 0.3)} items to ${otherOwners[0]}`;
            }
          }

          cells.push({
            owner,
            stage,
            avgAge,
            count: data.count,
            suggestion,
          });
        }
      });
    });

    return { cells, owners, stages };
  }, [threads]);

  const getColorForAge = (ageHours: number) => {
    if (ageHours > 168) return 'bg-red-600'; // > 7 days
    if (ageHours > 72) return 'bg-red-500'; // > 3 days
    if (ageHours > 48) return 'bg-orange-500'; // > 2 days
    if (ageHours > 24) return 'bg-yellow-500'; // > 1 day
    return 'bg-green-500'; // < 1 day
  };

  const maxAge = Math.max(...heatmapData.cells.map((c) => c.avgAge), 1);

  return (
    <Card className="bg-gray-900 border-gray-700">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-purple-400" />
            <CardTitle className="text-white">Bottleneck Heatmap</CardTitle>
          </div>
          <div className="flex items-center gap-2 px-2 py-1 bg-purple-500/10 border border-purple-500/30 rounded-md">
            <span className="text-sm">✨</span>
            <span className="text-xs text-purple-300 font-medium">AI Suggestions</span>
          </div>
        </div>
        <CardDescription className="text-gray-400">
          Grid: Owner × Stage. Cell color = average age of items
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <div className="inline-block min-w-full">
            <table className="w-full border-collapse">
              <thead>
                <tr>
                  <th className="text-left text-xs font-medium text-gray-400 p-2 border border-gray-700">
                    Owner / Stage
                  </th>
                  {heatmapData.stages.map((stage) => (
                    <th
                      key={stage}
                      className="text-center text-xs font-medium text-gray-400 p-2 border border-gray-700 min-w-[100px]"
                    >
                      {stage.length > 10 ? `${stage.substring(0, 10)}...` : stage}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {heatmapData.owners.map((owner) => (
                  <tr key={owner}>
                    <td className="text-xs font-medium text-gray-300 p-2 border border-gray-700 bg-gray-800">
                      <div className="flex items-center gap-2">
                        <User className="h-3 w-3" />
                        {owner.length > 12 ? `${owner.substring(0, 12)}...` : owner}
                      </div>
                    </td>
                    {heatmapData.stages.map((stage) => {
                      const cell = heatmapData.cells.find(
                        (c) => c.owner === owner && c.stage === stage
                      );
                      const isHovered = hoveredCell?.owner === owner && hoveredCell?.stage === stage;

                      return (
                        <td
                          key={stage}
                          className={`border border-gray-700 p-2 text-center cursor-pointer transition-all ${
                            cell
                              ? `${getColorForAge(cell.avgAge)} text-white`
                              : 'bg-gray-800 text-gray-600'
                          } ${isHovered ? 'ring-2 ring-purple-400' : ''}`}
                          onMouseEnter={() => setHoveredCell({ owner, stage })}
                          onMouseLeave={() => setHoveredCell(null)}
                        >
                          <TooltipProvider>
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <div className="flex flex-col items-center gap-1">
                                  {cell ? (
                                    <>
                                      <span className="text-xs font-semibold">{cell.count}</span>
                                      <span className="text-[10px] opacity-90">
                                        {cell.avgAge.toFixed(0)}h
                                      </span>
                                    </>
                                  ) : (
                                    <span className="text-xs">-</span>
                                  )}
                                </div>
                              </TooltipTrigger>
                              {cell && (
                                <TooltipContent
                                  side="right"
                                  className="bg-gray-800 border border-gray-600 text-white max-w-xs"
                                >
                                  <div className="space-y-2">
                                    <div>
                                      <p className="font-semibold text-sm">{owner}</p>
                                      <p className="text-xs text-gray-400">{stage}</p>
                                    </div>
                                    <div className="text-xs space-y-1">
                                      <div>
                                        <span className="text-gray-400">Items: </span>
                                        <span className="text-white">{cell.count}</span>
                                      </div>
                                      <div>
                                        <span className="text-gray-400">Avg Age: </span>
                                        <span className="text-white">{cell.avgAge.toFixed(1)} hours</span>
                                      </div>
                                    </div>
                                    {cell.suggestion && (
                                      <div className="pt-2 border-t border-gray-700">
                                        <p className="text-xs text-purple-300 font-medium">
                                          💡 {cell.suggestion}
                                        </p>
                                      </div>
                                    )}
                                  </div>
                                </TooltipContent>
                              )}
                            </Tooltip>
                          </TooltipProvider>
                        </td>
                      );
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Legend */}
        <div className="mt-4 flex items-center gap-4 text-xs text-gray-400">
          <span>Legend:</span>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-green-500 rounded" />
            <span>&lt; 24h</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-yellow-500 rounded" />
            <span>1-2 days</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-orange-500 rounded" />
            <span>2-3 days</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-red-500 rounded" />
            <span>3-7 days</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-red-600 rounded" />
            <span>&gt; 7 days</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

