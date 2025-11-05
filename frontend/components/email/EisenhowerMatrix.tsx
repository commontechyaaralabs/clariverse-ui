'use client';

import { RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar, ResponsiveContainer, Tooltip } from 'recharts';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { EisenhowerThread } from '@/lib/api';
import { useState, useMemo, useEffect } from 'react';
import { 
  ArrowUpRight, 
  Clock, 
  UserCheck, 
  Trash2, 
  Eye, 
  Lightbulb, 
  User,
  Building,
  Users,
  Target
} from 'lucide-react';

interface EisenhowerMatrixProps {
  data: EisenhowerThread[];
  onThreadClick: (thread: EisenhowerThread) => void;
  onQuadrantClick?: (quadrant: string) => void;
  selectedQuadrant?: string | null;
}

const quadrantColors = {
  do: '#ef4444',      // red
  schedule: '#eab308', // yellow
  delegate: '#3b82f6', // blue
  delete: '#6b7280',   // gray
};

const quadrantLabels = {
  do: 'Do - Now',
  schedule: 'Schedule - Later',
  delegate: 'Delegate - Team',
  delete: 'Delete',
};

// Define allowed priorities for each quadrant
const quadrantPriorities: Record<string, string[]> = {
  do: ['P1', 'P2'],
  schedule: ['P2', 'P3'],
  delegate: ['P3', 'P4'],
  delete: ['P4', 'P5']
};

export function EisenhowerMatrix({ data, onThreadClick, onQuadrantClick, selectedQuadrant }: EisenhowerMatrixProps) {
  const [hoveredThread, setHoveredThread] = useState<EisenhowerThread | null>(null);
  const [selectedPriorities, setSelectedPriorities] = useState<Record<string, string | null>>({
    do: null,
    schedule: null,
    delegate: null,
    delete: null
  });
  const [sentimentValues, setSentimentValues] = useState<Record<string, number | null>>({
    do: null,
    schedule: null,
    delegate: null,
    delete: null
  });
  const [isDragging, setIsDragging] = useState<Record<string, boolean>>({
    do: false,
    schedule: false,
    delegate: false,
    delete: false
  });
  const [currentPages, setCurrentPages] = useState<Record<string, number>>({
    do: 1,
    schedule: 1,
    delegate: 1,
    delete: 1
  });
  
  const threadsPerPage = 5;

  // Calculate priority distribution for each quadrant
  const quadrantPriorityData = useMemo(() => {
    const quadrants = ['do', 'schedule', 'delegate', 'delete'] as const;
    return quadrants.map(quadrant => {
      const quadrantThreads = data.filter(thread => thread.quadrant === quadrant);
      const priorityCount = quadrantThreads.reduce((acc, thread) => {
        acc[thread.priority] = (acc[thread.priority] || 0) + 1;
        return acc;
      }, {} as Record<string, number>);

      return {
        quadrant,
        total: quadrantThreads.length,
        priorities: Object.entries(priorityCount).map(([priority, count]) => ({
          priority,
          count,
          percentage: Math.round((count / quadrantThreads.length) * 100)
        }))
      };
    });
  }, [data]);

  // Prepare radar chart data for quadrant performance
  const radarData = useMemo(() => {
    const quadrants = ['do', 'schedule', 'delegate', 'delete'] as const;
    
    return quadrants.map(quadrant => {
      const quadrantThreads = data.filter(thread => thread.quadrant === quadrant);
      
      // Calculate performance metrics for this quadrant
      const avgImportance = quadrantThreads.reduce((sum, thread) => sum + thread.importance_score, 0) / quadrantThreads.length || 0;
      const avgUrgency = quadrantThreads.reduce((sum, thread) => sum + thread.urgency_flag, 0) / quadrantThreads.length || 0;
      const avgBusinessImpact = quadrantThreads.reduce((sum, thread) => sum + thread.business_impact_score, 0) / quadrantThreads.length || 0;
      const avgSentiment = quadrantThreads.reduce((sum, thread) => sum + thread.overall_sentiment, 0) / quadrantThreads.length || 0;
      const escalationRate = quadrantThreads.filter(thread => thread.escalation_count > 0).length / quadrantThreads.length || 0;

      // Normalize metrics to 0-100 scale
      const normalizedMetrics = {
        importance: Math.round(avgImportance * 100),
        urgency: Math.round(avgUrgency * 100),
        businessImpact: Math.round(avgBusinessImpact),
        sentiment: Math.round((avgSentiment / 5) * 100),
        escalationRate: Math.round(escalationRate * 100),
        resolutionRate: Math.round((quadrantThreads.filter(t => t.resolution_status === 'closed').length / quadrantThreads.length) * 100),
        efficiency: Math.round((100 - escalationRate * 100) * (avgSentiment / 5)),
        workload: Math.round(Math.min(100, quadrantThreads.length * 2)) // Scale thread count to 0-100
      };

      return {
        quadrant: quadrant.charAt(0).toUpperCase() + quadrant.slice(1),
        ...normalizedMetrics,
        threadCount: quadrantThreads.length
      };
    });
  }, [data]);

  const getQuadrantIcon = (quadrant: string) => {
    switch (quadrant) {
      case 'do': return <ArrowUpRight className="h-4 w-4" />;
      case 'schedule': return <Clock className="h-4 w-4" />;
      case 'delegate': return <UserCheck className="h-4 w-4" />;
      case 'delete': return <Trash2 className="h-4 w-4" />;
      default: return <Eye className="h-4 w-4" />;
    }
  };


  const getSentimentColor = (sentiment: number) => {
    if (sentiment === 1) return '#10B981'; // Green - Calm
    if (sentiment === 2) return '#84CC16'; // Light Green - Bit Irritated
    if (sentiment === 3) return '#F59E0B'; // Yellow - Moderately Concerned
    if (sentiment === 4) return '#F97316'; // Orange - Anger
    return '#EF4444'; // Red - Frustrated
  };

  const getActionPendingColor = (pendingFrom: string) => {
    switch (pendingFrom) {
      case 'customer': return 'bg-blue-500/20 text-blue-400 border-blue-500';
      case 'company': return 'bg-yellow-500/20 text-yellow-400 border-yellow-500';
      default: return 'bg-gray-500/20 text-gray-400 border-gray-500';
    }
  };

  const getActionPendingIcon = (pendingFrom: string) => {
    switch (pendingFrom) {
      case 'customer': return <User className="h-3 w-3" />;
      case 'company': return <Building className="h-3 w-3" />;
      default: return <Clock className="h-3 w-3" />;
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'P1': return 'bg-red-500/20 text-red-400 border-red-500';
      case 'P2': return 'bg-orange-500/20 text-orange-400 border-orange-500';
      case 'P3': return 'bg-yellow-500/20 text-yellow-400 border-yellow-500';
      case 'P4': return 'bg-blue-500/20 text-blue-400 border-blue-500';
      case 'P5': return 'bg-gray-500/20 text-gray-400 border-gray-500';
      default: return 'bg-gray-500/20 text-gray-400 border-gray-500';
    }
  };

  const getPriorityFilterColor = (priority: string) => {
    switch (priority) {
      case 'P1': return 'bg-red-900/50 text-red-300 border-red-600 hover:bg-red-800/50';
      case 'P2': return 'bg-orange-900/50 text-orange-300 border-orange-600 hover:bg-orange-800/50';
      case 'P3': return 'bg-yellow-900/50 text-yellow-300 border-yellow-600 hover:bg-yellow-800/50';
      case 'P4': return 'bg-blue-900/50 text-blue-300 border-blue-600 hover:bg-blue-800/50';
      case 'P5': return 'bg-gray-900/50 text-gray-300 border-gray-600 hover:bg-gray-800/50';
      default: return 'bg-gray-900/50 text-gray-300 border-gray-600 hover:bg-gray-800/50';
    }
  };

  const handlePriorityFilter = (quadrant: string, priority: string) => {
    setSelectedPriorities(prev => ({
      ...prev,
      [quadrant]: prev[quadrant] === priority ? null : priority
    }));
    // Reset to page 1 when filter changes
    setCurrentPages(prev => ({
      ...prev,
      [quadrant]: 1
    }));
  };

  const handleSentimentChange = (quadrant: string, value: number | null) => {
    setSentimentValues(prev => ({
      ...prev,
      [quadrant]: value
    }));
    // Reset to page 1 when filter changes
    setCurrentPages(prev => ({
      ...prev,
      [quadrant]: 1
    }));
  };

  const handlePageChange = (quadrant: string, page: number) => {
    setCurrentPages(prev => ({
      ...prev,
      [quadrant]: page
    }));
  };

  const handleSliderClick = (quadrant: string, event: React.MouseEvent<HTMLDivElement>) => {
    const rect = event.currentTarget.getBoundingClientRect();
    const percent = Math.max(0, Math.min(1, (event.clientX - rect.left) / rect.width));
    const value = Math.round(1 + percent * 4); // Whole numbers only (1-5)
    
    handleSentimentChange(quadrant, value);
  };

  const handleMouseMove = (event: MouseEvent) => {
    const activeQuadrant = Object.entries(isDragging).find(([_, dragging]) => dragging);
    if (!activeQuadrant) return;
    
    const [quadrant] = activeQuadrant;
    const sliderElement = document.querySelector(`[data-quadrant="${quadrant}"]`);
    if (!sliderElement) return;
    
    const rect = sliderElement.getBoundingClientRect();
    const percent = Math.max(0, Math.min(1, (event.clientX - rect.left) / rect.width));
    const value = Math.round(1 + percent * 4); // Whole numbers only (1-5)
    
    handleSentimentChange(quadrant, value);
  };

  const handleMouseUp = () => {
    setIsDragging({
      do: false,
      schedule: false,
      delegate: false,
      delete: false
    });
  };

  // Add global mouse event listeners with throttling for smooth performance
  useEffect(() => {
    if (Object.values(isDragging).some(dragging => dragging)) {
      let animationFrame: number;
      
      const throttledMouseMove = (event: MouseEvent) => {
        if (animationFrame) {
          cancelAnimationFrame(animationFrame);
        }
        animationFrame = requestAnimationFrame(() => {
          handleMouseMove(event);
        });
      };
      
      document.addEventListener('mousemove', throttledMouseMove, { passive: true });
      document.addEventListener('mouseup', handleMouseUp);
      
      return () => {
        if (animationFrame) {
          cancelAnimationFrame(animationFrame);
        }
        document.removeEventListener('mousemove', throttledMouseMove);
        document.removeEventListener('mouseup', handleMouseUp);
      };
    }
  }, [isDragging]);

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      const value = payload[0].value;
      const name = payload[0].name;
      return (
        <div className="bg-blue-500 text-white px-3 py-2 rounded-lg shadow-lg">
          <div className="font-medium">{name}: {value}</div>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="space-y-6">
      {/* Quadrant Cards - Always full width, never split */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {Object.entries(quadrantLabels).map(([quadrant, label]) => {
          // Filter threads based on selected priority and sentiment threshold for this specific quadrant
          let filteredQuadrantThreads = data.filter(thread => thread.quadrant === quadrant);
          const selectedPriority = selectedPriorities[quadrant];
          const sentimentThreshold = sentimentValues[quadrant];
          
          if (selectedPriority) {
            filteredQuadrantThreads = filteredQuadrantThreads.filter(thread => thread.priority === selectedPriority);
          }
          
          // Apply sentiment filter only if a value is selected
          if (sentimentThreshold !== null) {
            filteredQuadrantThreads = filteredQuadrantThreads.filter(thread => 
              thread.overall_sentiment === sentimentThreshold
            );
          }
          
          const quadrantThreads = data.filter(thread => thread.quadrant === quadrant);
          const quadrantPriorityInfo = quadrantPriorityData.find(q => q.quadrant === quadrant);
          const currentPage = currentPages[quadrant];
          
          // Calculate pagination
          const totalPages = Math.ceil(filteredQuadrantThreads.length / threadsPerPage);
          const startIndex = (currentPage - 1) * threadsPerPage;
          const endIndex = startIndex + threadsPerPage;
          const paginatedThreads = filteredQuadrantThreads.slice(startIndex, endIndex);
          const colors = {
            do: { bg: 'bg-red-500/10', border: 'border-red-500', text: 'text-red-400', icon: 'bg-red-500' },
            schedule: { bg: 'bg-yellow-500/10', border: 'border-yellow-500', text: 'text-yellow-400', icon: 'bg-yellow-500' },
            delegate: { bg: 'bg-blue-500/10', border: 'border-blue-500', text: 'text-blue-400', icon: 'bg-blue-500' },
            delete: { bg: 'bg-gray-500/10', border: 'border-gray-500', text: 'text-gray-400', icon: 'bg-gray-500' }
          }[quadrant] || { bg: 'bg-gray-500/10', border: 'border-gray-500', text: 'text-gray-400', icon: 'bg-gray-500' };
          
          return (
            <Card
              key={quadrant}
              className={`bg-gray-900 hover:scale-[1.01] transition-transform duration-200`}
              style={{ border: `2px solid ${quadrant === 'do' ? '#ef4444' : quadrant === 'schedule' ? '#eab308' : quadrant === 'delegate' ? '#3b82f6' : '#6b7280'}` }}
            >
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className={`p-2 rounded-lg ${colors.icon}`}>
                      {getQuadrantIcon(quadrant)}
                    </div>
                    <div>
                      <CardTitle className={`text-lg ${colors.text}`}>
                        {label}
                      </CardTitle>
                      <CardDescription className="text-gray-400 text-sm">
                        {filteredQuadrantThreads.length} threads
                        {selectedPriority && ` (${selectedPriority} only)`}
                        {sentimentThreshold !== null && 
                          ` (Sentiment = ${sentimentThreshold})`
                        }
                      </CardDescription>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                  <div className={`px-3 py-1 rounded-full text-sm font-medium ${colors.text} bg-gray-800`}>
                    {Math.round((quadrantThreads.length / data.length) * 100)}%
                    </div>
                    {(selectedPriority || sentimentThreshold !== null) && (
                      <button
                        onClick={() => {
                          handlePriorityFilter(quadrant, '');
                          handleSentimentChange(quadrant, null);
                        }}
                        className="px-2 py-1 text-xs bg-gray-700 hover:bg-gray-600 text-gray-300 rounded border border-gray-600 transition-colors"
                        title="Clear all filters"
                      >
                        Clear All
                      </button>
                    )}
                  </div>
                </div>
              </CardHeader>
              
              <CardContent className="space-y-4">
                  {/* Priority Filter Buttons - Individual for each quadrant */}
                  <div className="space-y-2">
                    <div className="text-xs font-medium text-gray-300">Filter by Priority</div>
                    <div className="flex flex-wrap gap-2">
                      {(quadrantPriorities[quadrant] || []).map((priority) => {
                        const priorityCount = quadrantThreads.filter(t => t.priority === priority).length;
                        const isSelected = selectedPriority === priority;
                        const baseColors = getPriorityFilterColor(priority);
                      
                      return (
                        <button
                          key={priority}
                          onClick={() => handlePriorityFilter(quadrant, priority)}
                          className={`
                            px-3 py-1 rounded-lg border transition-all duration-200 
                            ${baseColors}
                            ${isSelected ? 'ring-2 ring-white/30 scale-105' : ''}
                            flex items-center gap-1 text-xs
                          `}
                        >
                          <span className="font-medium">{priority}</span>
                          <span className="text-gray-400">({priorityCount})</span>
                        </button>
                      );
                    })}
                    {selectedPriority && (
                      <button
                        onClick={() => handlePriorityFilter(quadrant, '')}
                        className="px-2 py-1 rounded-lg border border-gray-600 bg-gray-800 text-gray-300 hover:bg-gray-700 transition-colors text-xs"
                      >
                        Clear
                      </button>
                    )}
                  </div>
                </div>

                {/* Enhanced Sentiment Threshold Filter */}
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="text-xs font-medium text-gray-300">Filter by Sentiment (1 - 5)</div>
                    {sentimentThreshold !== null && (
                      <button
                        onClick={() => handleSentimentChange(quadrant, null)}
                        className="text-xs text-blue-400 hover:text-blue-300 transition-colors"
                        title="Reset to show all sentiments"
                      >
                        Reset
                      </button>
                    )}
                  </div>
                  
                  <div className="space-y-4">
                    <div className="relative">
                      {/* Slider Track */}
                      <div 
                        className="relative h-2 bg-gray-600 rounded-full cursor-pointer slider-track"
                        data-quadrant={quadrant}
                        onClick={(e) => handleSliderClick(quadrant, e)}
                      >
                        {/* Tick Marks */}
                        {[1, 2, 3, 4, 5].map((tick) => (
                          <div
                            key={tick}
                            className="absolute w-0.5 h-2 bg-gray-500 rounded-full transform -translate-x-0.5"
                            style={{ left: `${((tick - 1) / 4) * 100}%` }}
                          />
                        ))}
                        
                        {/* Active Range - only show when filter is applied */}
                        {sentimentThreshold !== null && (
                          <div 
                            className="absolute h-full bg-gradient-to-r from-green-500 via-yellow-500 to-red-500 rounded-full"
                            style={{
                              left: 0,
                              width: `${((sentimentThreshold - 1) / 4) * 100}%`
                            }}
                          />
                        )}
                        
                        {/* Single Handle with Enhanced Tooltip - only show when filter is applied */}
                        {sentimentThreshold !== null && (
                          <div 
                            className="absolute w-6 h-6 bg-white rounded-full cursor-grab active:cursor-grabbing transform -translate-y-2 -translate-x-3 shadow-lg hover:shadow-xl transition-all duration-150 border-2 border-blue-500 select-none"
                            style={{ left: `${((sentimentThreshold - 1) / 4) * 100}%` }}
                            onMouseDown={(e) => {
                              e.preventDefault();
                              setIsDragging(prev => ({ ...prev, [quadrant]: true }));
                            }}
                            onDragStart={(e) => e.preventDefault()}
                          >
                            {/* Enhanced Tooltip */}
                            <div className="absolute -top-12 left-1/2 transform -translate-x-1/2 bg-gray-900 text-white text-sm px-3 py-2 rounded-lg shadow-xl whitespace-nowrap pointer-events-none border border-gray-700">
                              <div className="font-semibold">{sentimentThreshold}</div>
                              <div className="text-xs text-gray-300">
                                {sentimentThreshold === 1 ? 'Calm' : 
                                 sentimentThreshold === 2 ? 'Bit Irritated' :
                                 sentimentThreshold === 3 ? 'Moderately Concerned' :
                                 sentimentThreshold === 4 ? 'Anger' : 'Frustrated'}
                              </div>
                              <div className="absolute top-full left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-gray-900"></div>
                            </div>
                          </div>
                        )}
                        
                        {/* Click anywhere to set filter */}
                        <div 
                          className="absolute inset-0 cursor-pointer"
                          onClick={(e) => {
                            if (sentimentThreshold === null) {
                              handleSliderClick(quadrant, e);
                            }
                          }}
                        />
                      </div>
                      
                      {/* Enhanced Range Labels with Tick Values */}
                      <div className="flex justify-between text-xs text-gray-500 mt-3">
                        {[1, 2, 3, 4, 5].map((value) => (
                          <span key={value} className="text-center">
                            {value}
                          </span>
                        ))}
                      </div>
                    </div>
                    
                    {/* Enhanced Descriptive Labels */}
                    <div className="flex justify-between text-xs">
                      <span className="text-green-400">Calm (1)</span>
                      <span className="text-yellow-400">Moderately Concerned (3)</span>
                      <span className="text-red-400">Frustrated (5)</span>
                    </div>
                    
                  </div>
                </div>

                {/* Thread List */}
                <div className="space-y-2 max-h-64 overflow-y-auto">
                  {paginatedThreads.map((thread) => (
                    <div
                      key={thread.thread_id}
                      className="p-3 bg-gray-800/50 rounded-lg cursor-pointer hover:bg-gray-700/50 transition-colors"
                      onClick={() => onThreadClick(thread)}
                      onMouseEnter={() => setHoveredThread(thread)}
                      onMouseLeave={() => setHoveredThread(null)}
                    >
                      <div className="space-y-2">
                        {/* Subject */}
                          <div className="text-sm text-white font-medium truncate">
                            {thread.subject_norm}
                        </div>
                        
                        {/* Next Action Suggestion */}
                        <div className="flex items-start gap-2">
                          <Lightbulb className="h-3 w-3 text-yellow-400 mt-0.5 flex-shrink-0" />
                          <div className="text-xs text-gray-400 italic truncate">
                            {thread.next_action_suggestion}
                          </div>
                        </div>

                        {/* Action Pending Badge */}
                        <div className="flex items-center gap-2">
                          <div className={`flex items-center gap-1 px-2 py-1 rounded-full text-xs border ${getActionPendingColor(thread.action_pending_from)}`}>
                            {getActionPendingIcon(thread.action_pending_from)}
                            <span>Pending from {thread.action_pending_from}</span>
                          </div>
                        </div>

                        {/* Owner and Priority */}
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <User className="h-3 w-3 text-gray-400" />
                            <span className="text-xs text-gray-400">
                              {thread.assigned_to || thread.owner || 'Unassigned'}
                            </span>
                          </div>
                          <div className="flex items-center gap-1">
                            <span className={`text-xs px-2 py-1 rounded ${getPriorityColor(thread.priority)}`}>
                              {thread.priority}
                            </span>
                            <span 
                              className="text-xs px-2 py-1 rounded"
                              style={{ 
                                color: getSentimentColor(thread.overall_sentiment), 
                                backgroundColor: '#374151' 
                              }}
                            >
                              {thread.overall_sentiment}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Pagination */}
                {totalPages > 1 && (
                  <div className="flex items-center justify-between mt-4 px-2">
                    <div className="text-xs text-gray-400">
                      Page {currentPage} of {totalPages}
                    </div>
                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => handlePageChange(quadrant, Math.max(1, currentPage - 1))}
                        disabled={currentPage === 1}
                        className="px-2 py-1 text-xs bg-gray-800 border border-gray-600 rounded hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed text-gray-300"
                      >
                        ←
                      </button>
                      
                      {/* Page numbers */}
                      {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                        let pageNum: number;
                        if (totalPages <= 5) {
                          pageNum = i + 1;
                        } else if (currentPage <= 3) {
                          pageNum = i + 1;
                        } else if (currentPage >= totalPages - 2) {
                          pageNum = totalPages - 4 + i;
                        } else {
                          pageNum = currentPage - 2 + i;
                        }
                        
                        return (
                          <button
                            key={pageNum}
                            onClick={() => handlePageChange(quadrant, pageNum)}
                            className={`px-2 py-1 text-xs border rounded ${
                              currentPage === pageNum
                                ? 'bg-blue-600 border-blue-500 text-white'
                                : 'bg-gray-800 border-gray-600 text-gray-300 hover:bg-gray-700'
                            }`}
                          >
                            {pageNum}
                          </button>
                        );
                      })}
                      
                      <button
                        onClick={() => handlePageChange(quadrant, Math.min(totalPages, currentPage + 1))}
                        disabled={currentPage === totalPages}
                        className="px-2 py-1 text-xs bg-gray-800 border border-gray-600 rounded hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed text-gray-300"
                      >
                        →
                      </button>
                    </div>
                    </div>
                  )}
              </CardContent>
            </Card>
          );
        })}
      </div>

    </div>
  );
}
