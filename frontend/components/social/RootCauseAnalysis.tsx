'use client';

import React, { useState, useMemo } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Tooltip as UITooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import {
  ChevronDown,
  ChevronRight,
  AlertTriangle,
  Clock,
  User,
  CheckCircle,
  AlertCircle,
  Download,
  HelpCircle,
  MessageSquare,
  ArrowRight,
  Sparkles,
} from 'lucide-react';
import { TrustpilotCluster, TrustpilotReview } from '@/lib/api';
import type {
  ActionItem,
  CommunicationTemplate,
  RootCauseAnalysis as RootCauseAnalysisType,
} from '@/lib/social/trustpilot/rootCause';
import { generateCommunicationTemplate, generateRootCauseAnalyses } from '@/lib/social/trustpilot/rootCause';

interface RootCauseAnalysisProps {
  clusters: TrustpilotCluster[];
  reviews: TrustpilotReview[];
  onActionUpdate?: (clusterId: string, actionId: string, status: ActionItem['status']) => void;
}

// Generate 5-Whys analysis for a cluster
export default function RootCauseAnalysis({
  clusters,
  reviews,
  onActionUpdate,
}: RootCauseAnalysisProps) {
  const [expandedClusters, setExpandedClusters] = useState<Set<string>>(new Set());
  const [selectedTab, setSelectedTab] = useState<'analysis' | 'history'>('analysis');
  
  // Generate analyses for all clusters
  const analyses = useMemo<RootCauseAnalysisType[]>(
    () => generateRootCauseAnalyses(clusters, reviews),
    [clusters, reviews]
  );
  
  // Generate communication templates
  const communicationTemplates = useMemo(() => {
    return analyses.map(analysis => {
      const cluster = clusters.find(c => c.cluster_id === analysis.cluster_id);
      if (!cluster) return null;
      return {
        analysis,
        template: generateCommunicationTemplate(analysis, cluster),
      };
    }).filter(Boolean) as Array<{ analysis: RootCauseAnalysisType; template: CommunicationTemplate }>;
  }, [analyses, clusters]);
  
  // History data (in real app, this would come from backend)
  const historyData = useMemo(() => {
    return analyses.map(analysis => ({
      ...analysis,
      resolved_at: analysis.status === 'RESOLVED' ? new Date().toISOString() : null,
    }));
  }, [analyses]);
  
  const toggleCluster = (clusterId: string) => {
    const newExpanded = new Set(expandedClusters);
    if (newExpanded.has(clusterId)) {
      newExpanded.delete(clusterId);
    } else {
      newExpanded.add(clusterId);
    }
    setExpandedClusters(newExpanded);
  };
  
  const getUrgencyColor = (urgency: string) => {
    switch (urgency) {
      case 'CRITICAL': return 'text-red-400 bg-red-500/20 border-red-500/50';
      case 'HIGH': return 'text-orange-400 bg-orange-500/20 border-orange-500/50';
      case 'MEDIUM': return 'text-yellow-400 bg-yellow-500/20 border-yellow-500/50';
      case 'LOW': return 'text-gray-400 bg-gray-500/20 border-gray-500/50';
      default: return 'text-gray-400 bg-gray-500/20 border-gray-500/50';
    }
  };
  
  const exportToCSV = () => {
    const csvRows = [
      ['Cluster ID', 'Cluster Name', 'Root Cause', 'Status', 'Owner', 'Created At', 'Resolved At', 'Recurrence Count', 'GDPR Related', 'Regulatory Concern'].join(','),
      ...historyData.map(analysis => [
        analysis.cluster_id,
        `"${analysis.cluster_name}"`,
        `"${analysis.root_cause}"`,
        analysis.status,
        analysis.owner || 'Unassigned',
        analysis.created_at,
        analysis.resolved_at || '',
        analysis.recurrence_count,
        analysis.gdpr_related ? 'Yes' : 'No',
        analysis.regulatory_concern ? 'Yes' : 'No',
      ].join(',')),
    ];
    
    const csvContent = csvRows.join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `root-cause-analysis-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };
  
  return (
    <Card className="bg-gray-900 border-gray-700">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2 text-white">
              <Sparkles className="h-5 w-5 text-purple-400" />
              5-Whys Root Cause Analysis
            </CardTitle>
            <CardDescription className="text-gray-400 mt-1">
              Automated root cause identification and action planning for complaint clusters
            </CardDescription>
          </div>
          <TooltipProvider>
            <UITooltip>
              <TooltipTrigger asChild>
                <button
                  className="p-2 rounded-lg bg-gray-800 hover:bg-gray-700 transition-colors"
                  onClick={() => {
                    const info = `The 5-Whys methodology helps identify root causes by repeatedly asking "Why?" until the fundamental issue is found. This ensures we address underlying problems, not just symptoms.`;
                    alert(info);
                  }}
                >
                  <HelpCircle className="h-5 w-5 text-gray-400" />
                </button>
              </TooltipTrigger>
              <TooltipContent>
                <p className="max-w-xs">Learn about the 5-Whys methodology</p>
              </TooltipContent>
            </UITooltip>
          </TooltipProvider>
        </div>
      </CardHeader>
      <CardContent>
        <Tabs value={selectedTab} onValueChange={(v) => setSelectedTab(v as 'analysis' | 'history')}>
          <TabsList className="grid w-full grid-cols-2 bg-gray-800">
            <TabsTrigger value="analysis" className="data-[state=active]:bg-gray-700">
              Analysis & Actions
            </TabsTrigger>
            <TabsTrigger value="history" className="data-[state=active]:bg-gray-700">
              Compliance History
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="analysis" className="mt-4 space-y-4">
            {analyses.map((analysis) => {
              const cluster = clusters.find(c => c.cluster_id === analysis.cluster_id);
              if (!cluster || cluster.cluster_name.toLowerCase() === 'other') return null;
              
              const isExpanded = expandedClusters.has(analysis.cluster_id);
              const template = communicationTemplates.find(t => t.analysis.cluster_id === analysis.cluster_id)?.template;
              
              return (
                <Card key={analysis.cluster_id} className="bg-gray-800/50 border-gray-700">
                  <CardHeader
                    className="cursor-pointer hover:bg-gray-800/50 transition-colors"
                    onClick={() => toggleCluster(analysis.cluster_id)}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          {isExpanded ? (
                            <ChevronDown className="h-4 w-4 text-gray-400" />
                          ) : (
                            <ChevronRight className="h-4 w-4 text-gray-400" />
                          )}
                          <CardTitle className="text-white text-lg">{cluster.cluster_name}</CardTitle>
                          <span className={`text-xs px-2 py-1 rounded ${getUrgencyColor(cluster.urgency)}`}>
                            {cluster.urgency}
                          </span>
                        </div>
                        <div className="flex items-center gap-4 text-sm text-gray-400 ml-6">
                          <span className="flex items-center gap-1">
                            <AlertCircle className="h-4 w-4" />
                            {analysis.affected_customers} customers affected
                          </span>
                          {analysis.revenue_impact_per_week && (
                            <span className="flex items-center gap-1">
                              {analysis.revenue_impact_per_week.toLocaleString(undefined, {
                                style: 'currency',
                                currency: 'EUR',
                                maximumFractionDigits: 0,
                              })}
                              /week at risk
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  </CardHeader>
                  
                  {isExpanded && (
                    <CardContent className="space-y-6 pt-0">
                      {/* Trustpilot-Only Insight Card */}
                      {analysis.trustpilot_only && (
                        <div className="bg-gray-900/60 rounded-xl border border-purple-500/20 p-6 shadow-inner space-y-6">
                          <div>
                            <h3 className="text-lg font-semibold text-white flex items-center gap-2">
                              <Sparkles className="h-5 w-5 text-purple-400" />
                              Trustpilot-Only Root Cause Analysis
                            </h3>
                            <p className="text-sm text-gray-400">
                              Topic: {analysis.cluster_name}
                            </p>
                          </div>

                          {/* Timeline */}
                          <div>
                            <h4 className="text-sm font-semibold text-gray-200 mb-2 flex items-center gap-2">
                              <Clock className="h-4 w-4 text-blue-300" />
                              Issue Timeline
                            </h4>
                            <ul className="space-y-2">
                              {analysis.trustpilot_only.timeline.map((point, idx) => (
                                <li
                                  key={`${point.label}-${idx}`}
                                  className="flex items-start gap-3 text-sm text-gray-300"
                                >
                                  <span className="min-w-[72px] font-medium text-gray-200">{point.label}:</span>
                                  <span className="flex-1">{point.value}</span>
                                </li>
                              ))}
                            </ul>
                          </div>

                          {/* Five Whys */}
                          <div className="space-y-2">
                            <h4 className="text-sm font-semibold text-gray-200 flex items-center gap-2">
                              <AlertTriangle className="h-4 w-4 text-red-300" />
                              5-Whys Chain (Trustpilot Evidence)
                            </h4>
                            <div className="space-y-2">
                              {analysis.trustpilot_only.five_whys.map((why) => (
                                <details
                                  key={why.level}
                                  className="group border border-gray-700/80 rounded-lg bg-gray-900/70 px-4 py-3 transition-all hover:border-purple-400/30"
                                >
                                  <summary className="flex items-center justify-between cursor-pointer text-sm text-white font-medium">
                                    <span className="flex items-center gap-2">
                                      <span className="inline-flex h-6 w-6 items-center justify-center rounded-full bg-purple-500/20 text-purple-300 text-xs font-semibold">
                                        {why.level}
                                      </span>
                                      {why.title}
                                    </span>
                                    <ChevronDown className="h-4 w-4 text-gray-400 transition-transform group-open:rotate-180" />
                                  </summary>
                                  <div className="mt-3 space-y-2 text-sm text-gray-300">
                                    <p className="text-gray-200 font-medium">{why.summary}</p>
                                    <p className="text-gray-400 whitespace-pre-line">{why.evidence}</p>
                                    <div className="border-t border-gray-700 pt-2 text-gray-200">
                                      <span className="text-xs uppercase tracking-wide text-gray-400">
                                        Inferred Root Cause:
                                      </span>
                                      <p className="text-sm text-white">{why.root_cause}</p>
                                    </div>
                                  </div>
                                </details>
                              ))}
                            </div>
                          </div>

                          {/* Revenue Impact */}
                          <div className="bg-gray-900/70 border border-yellow-500/20 rounded-lg p-4">
                            <h4 className="text-sm font-semibold text-yellow-300 mb-2">
                              Estimated Revenue Impact
                            </h4>
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-sm text-gray-300">
                              <div>
                                <div className="text-xs text-gray-400 uppercase">Affected Customers</div>
                                <div className="text-base text-white font-semibold">
                                  {analysis.trustpilot_only.revenue_impact.affected_customers.toLocaleString()}
                                </div>
                              </div>
                              <div>
                                <div className="text-xs text-gray-400 uppercase">Est. Monthly Churn</div>
                                <div className="text-base text-white font-semibold">
                                  {analysis.trustpilot_only.revenue_impact.estimated_monthly_churn.toLocaleString()} customers
                                </div>
                              </div>
                              <div>
                                <div className="text-xs text-gray-400 uppercase">Revenue at Risk</div>
                                <div className="text-base text-yellow-300 font-semibold">
                                  {analysis.trustpilot_only.revenue_impact.estimated_revenue_at_risk
                                    .toLocaleString(undefined, {
                                      style: 'currency',
                                      currency: 'EUR',
                                      maximumFractionDigits: 0,
                                    })}
                                  /month
                                </div>
                              </div>
                            </div>
                          </div>

                          {/* Recommendations */}
                          <div>
                            <h4 className="text-sm font-semibold text-gray-200 flex items-center gap-2 mb-2">
                              <CheckCircle className="h-4 w-4 text-emerald-300" />
                              Recommended Actions (Trustpilot Signals)
                            </h4>
                            <ol className="list-decimal list-inside space-y-2 text-sm text-gray-300">
                              {analysis.trustpilot_only.recommendations.map((rec, idx) => (
                                <li key={idx}>
                                  <span className="font-semibold text-white">{rec.title}:</span>{' '}
                                  <span>{rec.impact}</span>{' '}
                                  <span className="text-gray-400">({rec.relief})</span>
                                </li>
                              ))}
                            </ol>
                          </div>

                        </div>
                      )}

                      {/* Action Panel */}
                      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                        <div className="bg-gray-900/50 rounded-lg p-4 border border-gray-700">
                          <h3 className="text-white font-semibold mb-4 flex items-center gap-2">
                            <CheckCircle className="h-4 w-4 text-green-400" />
                            Recommended Actions
                          </h3>
                          <div className="space-y-3">
                            {analysis.suggested_actions.map((action) => {
                              return (
                                <div key={action.id} className="bg-gray-800/50 rounded-lg p-3 border border-gray-700">
                                  <div className="flex-1">
                                    <div className="text-sm text-white font-medium mb-1">{action.action}</div>
                                    <div className="flex items-center gap-3 text-xs text-gray-400">
                                      <span className="flex items-center gap-1">
                                        <User className="h-3 w-3" />
                                        {action.responsible_team}
                                      </span>
                                      <span className="flex items-center gap-1">
                                        <Clock className="h-3 w-3" />
                                        {action.estimated_time}
                                      </span>
                                    </div>
                                  </div>
                                  <div className="mt-2">
                                    <span className={`text-xs px-2 py-0.5 rounded ${
                                      action.priority === 'CRITICAL' ? 'bg-red-500/20 text-red-400' :
                                      action.priority === 'HIGH' ? 'bg-orange-500/20 text-orange-400' :
                                      action.priority === 'MEDIUM' ? 'bg-yellow-500/20 text-yellow-400' :
                                      'bg-gray-500/20 text-gray-400'
                                    }`}>
                                      {action.priority}
                                    </span>
                                  </div>
                                </div>
                              );
                            })}
                          </div>
                        </div>
                        
                        {/* Communication Template */}
                        {template && (
                          <div className="bg-gray-900/50 rounded-lg p-4 border border-gray-700">
                            <h3 className="text-white font-semibold mb-4 flex items-center gap-2">
                              <MessageSquare className="h-4 w-4 text-blue-400" />
                              Customer Communication Template
                            </h3>
                            <div className="space-y-3">
                              <div>
                                <div className="text-xs text-gray-400 mb-1">Subject:</div>
                                <div className="text-sm text-white bg-gray-800/50 p-2 rounded">{template.subject}</div>
                              </div>
                              <div>
                                <div className="text-xs text-gray-400 mb-1">Body:</div>
                                <div className="text-sm text-gray-300 bg-gray-800/50 p-3 rounded max-h-64 overflow-y-auto whitespace-pre-wrap">
                                  {template.body}
                                </div>
                              </div>
                              <div className="flex items-center gap-2">
                                <button className="text-xs px-3 py-1.5 bg-blue-500/20 text-blue-400 rounded hover:bg-blue-500/30 transition-colors">
                                  Copy Template
                                </button>
                                <button className="text-xs px-3 py-1.5 bg-gray-700 text-gray-300 rounded hover:bg-gray-600 transition-colors">
                                  Customize
                                </button>
                              </div>
                            </div>
                          </div>
                        )}
                      </div>
                    </CardContent>
                  )}
                </Card>
              );
            })}
          </TabsContent>
          
          <TabsContent value="history" className="mt-4">
            <div className="space-y-4">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-white font-semibold">Root Cause Analysis History</h3>
                <button
                  onClick={exportToCSV}
                  className="flex items-center gap-2 px-4 py-2 bg-gray-800 hover:bg-gray-700 text-white rounded-lg transition-colors text-sm"
                >
                  <Download className="h-4 w-4" />
                  Export CSV
                </button>
              </div>
              
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-gray-700">
                      <th className="text-left p-3 text-gray-400">Cluster</th>
                      <th className="text-left p-3 text-gray-400">Root Cause</th>
                    </tr>
                  </thead>
                  <tbody>
                    {historyData.map((analysis) => (
                      <tr key={analysis.cluster_id} className="border-b border-gray-800 hover:bg-gray-800/50">
                        <td className="p-3 text-white">{analysis.cluster_name}</td>
                        <td className="p-3 text-gray-300 max-w-md truncate">{analysis.root_cause}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}

