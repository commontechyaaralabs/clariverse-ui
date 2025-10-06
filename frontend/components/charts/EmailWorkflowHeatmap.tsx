"use client";

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { EmailData } from '@/lib/emailData';

interface HeatmapData {
  workflowStage: string;
  priorityQuadrant: string;
  emailCount: number;
  avgSentiment?: number;
  urgentCount?: number;
}

interface EmailWorkflowHeatmapProps {
  data: EmailData[];
  title?: string;
  className?: string;
  showExport?: boolean;
  onCellClick?: (stage: string, quadrant: string, emails: EmailData[]) => void;
}

const EmailWorkflowHeatmap: React.FC<EmailWorkflowHeatmapProps> = ({ 
  data, 
  title = "Email Workflow vs Priority Matrix",
  className = "",
  showExport = false,
  onCellClick
}) => {
  // Define workflow stages based on the image
  const workflowStages = [
    'Report', 'Close', 'Resolved', 'Update', 'Escalation', 
    'Resolution', 'Categorize', 'Authenticate', 'Receive'
  ];

  // Define priority quadrants based on Eisenhower Matrix
  const priorityQuadrants = ['Do First', 'Schedule', 'Delegate', 'Eliminate'];

  // Process data to create heatmap matrix
  const processHeatmapData = (): HeatmapData[] => {
    const matrix: { [key: string]: { [key: string]: EmailData[] } } = {};
    
    // Initialize matrix
    workflowStages.forEach(stage => {
      matrix[stage] = {};
      priorityQuadrants.forEach(quadrant => {
        matrix[stage][quadrant] = [];
      });
    });

    // Categorize emails based on their properties with more sophisticated logic
    data.forEach(email => {
      const stage = email.stages || 'Receive';
      let quadrant = 'Eliminate'; // Default

      // More sophisticated categorization logic
      const isUrgent = email.urgency === true;
      const isOpen = email.resolution_status === 'open';
      const needsFollowUp = email.follow_up_required === 'yes';
      const isActionPending = email.action_pending_status === 'yes';
      
      // Determine priority quadrant based on email properties
      if (isUrgent && isOpen) {
        quadrant = 'Do First'; // High urgency + open = immediate action
      } else if (needsFollowUp && isOpen && !isUrgent) {
        quadrant = 'Schedule'; // Important but not urgent = schedule
      } else if (isUrgent && !needsFollowUp && isOpen) {
        quadrant = 'Delegate'; // Urgent but not important = delegate
      } else if (isActionPending && !isUrgent) {
        quadrant = 'Schedule'; // Action pending = important to schedule
      } else if (email.resolution_status === 'closed') {
        quadrant = 'Eliminate'; // Completed = eliminate
      } else if (!isUrgent && !needsFollowUp && !isActionPending) {
        quadrant = 'Eliminate'; // Low priority = eliminate
      }

      // Add to matrix
      if (matrix[stage] && matrix[stage][quadrant]) {
        matrix[stage][quadrant].push(email);
      }
    });

    // Convert to flat array for rendering
    const heatmapData: HeatmapData[] = [];
    workflowStages.forEach(stage => {
      priorityQuadrants.forEach(quadrant => {
        const emails = matrix[stage][quadrant] || [];
        const avgSentiment = emails.length > 0 
          ? emails.reduce((sum, email) => sum + (email.overall_sentiment || 0), 0) / emails.length
          : 0;
        const urgentCount = emails.filter(email => email.urgency).length;

        heatmapData.push({
          workflowStage: stage,
          priorityQuadrant: quadrant,
          emailCount: emails.length,
          avgSentiment,
          urgentCount
        });
      });
    });

    return heatmapData;
  };

  const heatmapData = processHeatmapData();

  // Get color intensity based on email count (matching the image style)
  const getColorIntensity = (count: number, maxCount: number): string => {
    if (count === 0) return 'bg-gray-800';
    
    // Match the color scheme from the image more closely
    if (count >= 20) return 'bg-red-700'; // Dark red for 20-22
    if (count >= 15) return 'bg-orange-500'; // Orange for 15-19
    if (count >= 10) return 'bg-yellow-500'; // Yellow for 10-14
    if (count >= 5) return 'bg-blue-400'; // Light blue for 5-9
    return 'bg-blue-600'; // Dark blue for 1-4
  };

  // Get background color with gradient effect
  const getBackgroundColor = (count: number, maxCount: number): string => {
    if (count === 0) return 'bg-gray-800';
    
    const intensity = Math.min(count / maxCount, 1);
    
    if (count >= 20) return 'bg-gradient-to-br from-red-600 to-red-800';
    if (count >= 15) return 'bg-gradient-to-br from-orange-500 to-orange-700';
    if (count >= 10) return 'bg-gradient-to-br from-yellow-500 to-yellow-700';
    if (count >= 5) return 'bg-gradient-to-br from-blue-400 to-blue-600';
    return 'bg-gradient-to-br from-blue-600 to-blue-800';
  };

  // Get text color based on background
  const getTextColor = (count: number, maxCount: number): string => {
    if (count === 0) return 'text-gray-500';
    
    const intensity = Math.min(count / maxCount, 1);
    return intensity >= 0.4 ? 'text-white' : 'text-gray-300';
  };

  // Find maximum count for color scaling
  const maxCount = Math.max(...heatmapData.map(item => item.emailCount));

  // Add loading state
  if (!data || data.length === 0) {
    return (
      <Card className={`bg-[#010101] border border-orange-500/30 rounded-2xl shadow-lg shadow-orange-500/20 ${className}`}>
        <CardContent className="p-8">
          <div className="flex items-center justify-center">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500 mx-auto mb-4"></div>
              <p className="text-gray-400">Loading heatmap data...</p>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={`bg-[#010101] border border-orange-500/30 rounded-2xl shadow-lg shadow-orange-500/20 ${className}`}>
      <CardHeader className="p-6">
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-2xl font-bold text-white mb-2">{title}</CardTitle>
            <p className="text-gray-300 text-sm">Email distribution across workflow stages and priority quadrants</p>
          </div>
          {showExport && (
            <button
              onClick={() => {
                const csvData = heatmapData.map(item => ({
                  'Workflow Stage': item.workflowStage,
                  'Priority Quadrant': item.priorityQuadrant,
                  'Email Count': item.emailCount,
                  'Urgent Count': item.urgentCount || 0,
                  'Avg Sentiment': item.avgSentiment?.toFixed(2) || 'N/A'
                }));
                
                const csvContent = [
                  Object.keys(csvData[0]).join(','),
                  ...csvData.map(row => Object.values(row).join(','))
                ].join('\n');
                
                const blob = new Blob([csvContent], { type: 'text/csv' });
                const url = window.URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.href = url;
                a.download = 'email-workflow-heatmap.csv';
                a.click();
                window.URL.revokeObjectURL(url);
              }}
              className="px-4 py-2 bg-orange-500 hover:bg-orange-600 text-white text-sm font-medium rounded-lg transition-colors duration-200"
            >
              Export CSV
            </button>
          )}
        </div>
      </CardHeader>
      <CardContent className="p-6 pt-0">
        <div className="space-y-6">
          {/* Summary Statistics */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
            {(() => {
              const doFirstTotal = heatmapData
                .filter(item => item.priorityQuadrant === 'Do First')
                .reduce((sum, item) => sum + item.emailCount, 0);
              const scheduleTotal = heatmapData
                .filter(item => item.priorityQuadrant === 'Schedule')
                .reduce((sum, item) => sum + item.emailCount, 0);
              const delegateTotal = heatmapData
                .filter(item => item.priorityQuadrant === 'Delegate')
                .reduce((sum, item) => sum + item.emailCount, 0);
              const eliminateTotal = heatmapData
                .filter(item => item.priorityQuadrant === 'Eliminate')
                .reduce((sum, item) => sum + item.emailCount, 0);

              return (
                <>
                  <div className="text-center p-4 bg-red-500/10 border border-red-500/20 rounded-lg">
                    <div className="text-2xl font-bold text-red-400">{doFirstTotal}</div>
                    <div className="text-xs text-gray-300">Do First</div>
                  </div>
                  <div className="text-center p-4 bg-blue-500/10 border border-blue-500/20 rounded-lg">
                    <div className="text-2xl font-bold text-blue-400">{scheduleTotal}</div>
                    <div className="text-xs text-gray-300">Schedule</div>
                  </div>
                  <div className="text-center p-4 bg-yellow-500/10 border border-yellow-500/20 rounded-lg">
                    <div className="text-2xl font-bold text-yellow-400">{delegateTotal}</div>
                    <div className="text-xs text-gray-300">Delegate</div>
                  </div>
                  <div className="text-center p-4 bg-green-500/10 border border-green-500/20 rounded-lg">
                    <div className="text-2xl font-bold text-green-400">{eliminateTotal}</div>
                    <div className="text-xs text-gray-300">Eliminate</div>
                  </div>
                </>
              );
            })()}
          </div>

          {/* Heatmap Table */}
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr>
                  <th className="text-left text-sm font-semibold text-gray-300 p-3 bg-gray-800/50 rounded-tl-lg min-w-[120px]">
                    Workflow Stage
                  </th>
                  {priorityQuadrants.map(quadrant => (
                    <th key={quadrant} className="text-center text-xs font-semibold text-gray-300 p-2 bg-gray-800/50 min-w-[100px]">
                      {quadrant}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {workflowStages.map(stage => (
                  <tr key={stage} className="border-b border-gray-700/50">
                    <td className="p-3 bg-gray-800/30">
                      <div className="text-sm font-medium text-white">{stage}</div>
                    </td>
                    {priorityQuadrants.map(quadrant => {
                      const cellData = heatmapData.find(
                        item => item.workflowStage === stage && item.priorityQuadrant === quadrant
                      );
                      const count = cellData?.emailCount || 0;
                      const urgentCount = cellData?.urgentCount || 0;
                      
                      return (
                        <td key={quadrant} className="p-2 text-center">
                          <div 
                            className={`relative rounded-lg p-3 transition-all duration-200 hover:scale-105 cursor-pointer group ${
                              getBackgroundColor(count, maxCount)
                            }`}
                            onClick={() => {
                              if (onCellClick && cellData) {
                                const emails = data.filter(email => 
                                  email.stages === stage && 
                                  ((email.urgency && email.resolution_status === 'open' && quadrant === 'Do First') ||
                                   (email.follow_up_required === 'yes' && email.resolution_status === 'open' && !email.urgency && quadrant === 'Schedule') ||
                                   (email.urgency && email.follow_up_required === 'no' && email.resolution_status === 'open' && quadrant === 'Delegate') ||
                                   (email.resolution_status === 'closed' && !email.urgency && quadrant === 'Eliminate'))
                                );
                                onCellClick(stage, quadrant, emails);
                              }
                            }}
                          >
                            {/* Cell content */}
                            <div className={`text-lg font-bold ${getTextColor(count, maxCount)} transition-all duration-200`}>
                              {count}
                            </div>
                            
                            {/* Highlight highest counts */}
                            {count === maxCount && count > 0 && (
                              <div className="absolute inset-0 rounded-lg border-2 border-yellow-400 animate-pulse"></div>
                            )}
                            
                            {/* Add subtle glow effect for non-zero counts */}
                            {count > 0 && (
                              <div className="absolute inset-0 rounded-lg opacity-10 bg-white"></div>
                            )}
                            
                            {/* Urgent indicator */}
                            {urgentCount > 0 && (
                              <div className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 rounded-full flex items-center justify-center">
                                <div className="w-2 h-2 bg-white rounded-full animate-pulse"></div>
                              </div>
                            )}
                            
                            {/* Hover tooltip */}
                            <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none z-10">
                              <div className="bg-black/90 text-white text-xs rounded-lg px-3 py-2 whitespace-nowrap border border-gray-700">
                                <div className="font-semibold">{stage} - {quadrant}</div>
                                <div>Emails: {count}</div>
                                <div className="text-gray-300">
                                  {maxCount > 0 ? `${Math.round((count / maxCount) * 100)}%` : '0%'} of max
                                </div>
                                {urgentCount > 0 && (
                                  <div className="text-red-400">Urgent: {urgentCount}</div>
                                )}
                                {cellData?.avgSentiment && (
                                  <div>Avg Sentiment: {cellData.avgSentiment.toFixed(1)}/5</div>
                                )}
                              </div>
                            </div>
                          </div>
                        </td>
                      );
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Legend and Stats */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Color Legend */}
            <div className="p-4 bg-gray-800/50 rounded-xl border border-gray-700/50">
              <h4 className="text-sm font-semibold text-white mb-3">Email Count Scale</h4>
              <div className="space-y-2">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-gray-300">High (20-22)</span>
                  <div className="w-16 h-3 rounded-full bg-red-600"></div>
                </div>
                <div className="flex items-center justify-between text-xs">
                  <span className="text-gray-300">Medium-High (15-19)</span>
                  <div className="w-16 h-3 rounded-full bg-orange-500"></div>
                </div>
                <div className="flex items-center justify-between text-xs">
                  <span className="text-gray-300">Medium (10-14)</span>
                  <div className="w-16 h-3 rounded-full bg-yellow-500"></div>
                </div>
                <div className="flex items-center justify-between text-xs">
                  <span className="text-gray-300">Low (5-9)</span>
                  <div className="w-16 h-3 rounded-full bg-blue-400"></div>
                </div>
                <div className="flex items-center justify-between text-xs">
                  <span className="text-gray-300">Very Low (1-4)</span>
                  <div className="w-16 h-3 rounded-full bg-blue-600"></div>
                </div>
                <div className="flex items-center justify-between text-xs">
                  <span className="text-gray-500">None (0)</span>
                  <div className="w-16 h-3 rounded-full bg-gray-800"></div>
                </div>
              </div>
            </div>

            {/* Priority Quadrant Legend */}
            <div className="p-4 bg-gray-800/50 rounded-xl border border-gray-700/50">
              <h4 className="text-sm font-semibold text-white mb-3">Priority Quadrants</h4>
              <div className="space-y-2 text-xs text-gray-300">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 bg-red-500 rounded"></div>
                  <span>Do First: High urgency + importance</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 bg-blue-500 rounded"></div>
                  <span>Schedule: High importance, low urgency</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 bg-yellow-500 rounded"></div>
                  <span>Delegate: High urgency, low importance</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 bg-green-500 rounded"></div>
                  <span>Eliminate: Low urgency + importance</span>
                </div>
              </div>
            </div>

            {/* Heatmap Stats */}
            <div className="p-4 bg-gray-800/50 rounded-xl border border-gray-700/50">
              <h4 className="text-sm font-semibold text-white mb-3">Matrix Statistics</h4>
              <div className="space-y-2 text-xs text-gray-300">
                <div className="flex justify-between">
                  <span>Total Emails:</span>
                  <span className="text-white font-semibold">{data.length}</span>
                </div>
                <div className="flex justify-between">
                  <span>Workflow Stages:</span>
                  <span className="text-white font-semibold">{workflowStages.length}</span>
                </div>
                <div className="flex justify-between">
                  <span>Priority Quadrants:</span>
                  <span className="text-white font-semibold">{priorityQuadrants.length}</span>
                </div>
                <div className="flex justify-between">
                  <span>Max Count:</span>
                  <span className="text-white font-semibold">{maxCount}</span>
                </div>
                <div className="flex justify-between">
                  <span>Urgent Emails:</span>
                  <span className="text-red-400 font-semibold">
                    {data.filter(email => email.urgency).length}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default EmailWorkflowHeatmap;
