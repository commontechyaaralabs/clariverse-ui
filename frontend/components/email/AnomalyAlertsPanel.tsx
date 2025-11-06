'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { KPIData, EisenhowerThread } from '@/lib/api';
import { AlertTriangle, Zap, TrendingUp, MessageSquare, X } from 'lucide-react';
import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface AnomalyAlertsPanelProps {
  kpiData: KPIData | null;
  threads: EisenhowerThread[];
}

interface AnomalyAlert {
  id: string;
  type: 'intent_spike' | 'friction_delta' | 'silent_threads' | 'sla_breach' | 'escalation_surge';
  title: string;
  description: string;
  severity: 'critical' | 'warning' | 'info';
  count: number;
  value?: number;
  resolveActions?: string[];
}

export function AnomalyAlertsPanel({ kpiData, threads }: AnomalyAlertsPanelProps) {
  const [selectedAlert, setSelectedAlert] = useState<AnomalyAlert | null>(null);
  const [dismissedAlerts, setDismissedAlerts] = useState<Set<string>>(new Set());

  const alerts: AnomalyAlert[] = [];

  if (!kpiData || threads.length === 0) {
    return null;
  }

  // Intent spike detection
  const p1Threads = threads.filter((t) => t.priority === 'P1').length;
  if (p1Threads > 50) {
    alerts.push({
      id: 'intent-spike',
      type: 'intent_spike',
      title: 'Intent Spike',
      description: `${p1Threads} P1 threads detected - Intent spike in high-priority communications`,
      severity: p1Threads > 100 ? 'critical' : 'warning',
      count: p1Threads,
      resolveActions: [
        'Prioritize P1 thread triage',
        'Assign additional resources',
        'Enable auto-escalation',
      ],
    });
  }

  // Friction delta detection
  const negativeSentimentThreads = threads.filter((t) => (t.overall_sentiment || 3) < 2.5).length;
  const frictionPercent = (negativeSentimentThreads / threads.length) * 100;
  if (frictionPercent > 30) {
    alerts.push({
      id: 'friction-delta',
      type: 'friction_delta',
      title: 'Friction Delta',
      description: `Friction delta ${frictionPercent.toFixed(1)}% - ${negativeSentimentThreads} threads with negative sentiment`,
      severity: frictionPercent > 40 ? 'critical' : 'warning',
      count: negativeSentimentThreads,
      value: frictionPercent,
      resolveActions: [
        'Review sentiment analysis',
        'Prioritize negative sentiment threads',
        'Generate proactive response templates',
      ],
    });
  }

  // Silent threads detection
  const silentThreads = threads.filter((t) => {
    const daysSinceLastMessage =
      (new Date().getTime() - new Date(t.last_message_at).getTime()) / (1000 * 60 * 60 * 24);
    return daysSinceLastMessage > 3 && t.resolution_status !== 'closed';
  }).length;
  if (silentThreads > 20) {
    alerts.push({
      id: 'silent-threads',
      type: 'silent_threads',
      title: 'Silent Threads',
      description: `${silentThreads} silent threads detected - No activity for >3 days`,
      severity: silentThreads > 50 ? 'critical' : 'warning',
      count: silentThreads,
      resolveActions: [
        'Send follow-up reminders',
        'Reassign stale threads',
        'Schedule review meeting',
      ],
    });
  }

  // SLA breach risk
  if (kpiData.sla_breach_risk_percentage > 10) {
    const atRiskCount = Math.round((kpiData.sla_breach_risk_percentage / 100) * (kpiData.total_threads || 0));
    alerts.push({
      id: 'sla-breach',
      type: 'sla_breach',
      title: 'SLA Breach Risk',
      description: `${kpiData.sla_breach_risk_percentage.toFixed(1)}% of threads at risk of SLA breach`,
      severity: kpiData.sla_breach_risk_percentage > 20 ? 'critical' : 'warning',
      count: atRiskCount,
      value: kpiData.sla_breach_risk_percentage,
      resolveActions: [
        'Prioritize at-risk threads',
        'Escalate to management',
        'Adjust SLA targets',
      ],
    });
  }

  // Escalation surge
  if (kpiData.escalation_rate > 10) {
    alerts.push({
      id: 'escalation-surge',
      type: 'escalation_surge',
      title: 'Escalation Surge',
      description: `Escalation rate ${kpiData.escalation_rate.toFixed(1)}% - ${kpiData.escalation_count} threads escalated`,
      severity: kpiData.escalation_rate > 15 ? 'critical' : 'warning',
      count: kpiData.escalation_count,
      resolveActions: [
        'Review escalation patterns',
        'Identify root causes',
        'Improve first-line resolution',
      ],
    });
  }

  const activeAlerts = alerts.filter((a) => !dismissedAlerts.has(a.id));

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical':
        return 'border-red-500 bg-red-500/10';
      case 'warning':
        return 'border-yellow-500 bg-yellow-500/10';
      default:
        return 'border-[#b90abd] bg-[#b90abd]/10';
    }
  };

  const getSeverityIcon = (severity: string) => {
    switch (severity) {
      case 'critical':
        return <AlertTriangle className="h-4 w-4 text-red-400" />;
      case 'warning':
        return <TrendingUp className="h-4 w-4 text-yellow-400" />;
      default:
        return <MessageSquare className="h-4 w-4 text-[#b90abd]" />;
    }
  };

  return (
    <>
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Zap className="h-5 w-5 text-[#b90abd]" />
              <CardTitle className="text-white">Anomaly Alerts Panel</CardTitle>
            </div>
            <div className="flex items-center gap-2 px-2 py-1 bg-[#b90abd]/10 border border-[#b90abd]/30 rounded-md">
              <span className="text-sm">✨</span>
              <span className="text-xs text-[#b90abd] font-medium">AI Detected</span>
            </div>
          </div>
          <CardDescription className="text-gray-400">
            Context notifications with auto-generated resolve actions
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <AnimatePresence>
              {activeAlerts.length > 0 ? (
                activeAlerts.map((alert) => (
                  <motion.div
                    key={alert.id}
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 10 }}
                    className={`border rounded-lg p-4 cursor-pointer hover:border-purple-500/50 transition-all ${getSeverityColor(alert.severity)}`}
                    onClick={() => setSelectedAlert(alert)}
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-start gap-3 flex-1">
                        {getSeverityIcon(alert.severity)}
                        <div className="flex-1 min-w-0">
                          <h4 className="text-sm font-semibold text-white mb-1">{alert.title}</h4>
                          <p className="text-xs text-gray-300">{alert.description}</p>
                        </div>
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={(e) => {
                          e.stopPropagation();
                          setDismissedAlerts((prev) => new Set(prev).add(alert.id));
                        }}
                        className="text-gray-400 hover:text-white"
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  </motion.div>
                ))
              ) : (
                <div className="text-center py-8 text-gray-400 text-sm">
                  No active anomalies detected
                </div>
              )}
            </AnimatePresence>
          </div>
        </CardContent>
      </Card>

      {/* Context Drawer */}
      <AnimatePresence>
        {selectedAlert && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/50 z-40"
              onClick={() => setSelectedAlert(null)}
            />
            <motion.div
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="fixed right-0 top-0 bottom-0 w-96 z-50 overflow-y-auto border-l border-white/10"
            >
              <div className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-xl font-bold text-white">{selectedAlert.title}</h2>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setSelectedAlert(null)}
                    className="text-gray-400 hover:text-white"
                  >
                    <X className="h-5 w-5" />
                  </Button>
                </div>

                <div className="space-y-4">
                  <div>
                    <p className="text-sm text-gray-400 mb-2">{selectedAlert.description}</p>
                    <div className="flex items-center gap-4 text-xs text-gray-500">
                      <span>Severity: {selectedAlert.severity.toUpperCase()}</span>
                      {selectedAlert.count && <span>Count: {selectedAlert.count}</span>}
                      {selectedAlert.value && <span>Value: {selectedAlert.value.toFixed(1)}</span>}
                    </div>
                  </div>

                  {selectedAlert.resolveActions && (
                    <div>
                      <h3 className="text-sm font-semibold text-white mb-3">Suggested Actions</h3>
                      <div className="space-y-2">
                        {selectedAlert.resolveActions.map((action, index) => (
                          <div
                            key={index}
                            className="flex items-center gap-2 p-3 bg-gray-800 rounded-lg border border-gray-700"
                          >
                            <Zap className="h-4 w-4 text-purple-400 flex-shrink-0" />
                            <span className="text-sm text-gray-300">{action}</span>
                            <Button
                              size="sm"
                              className="ml-auto bg-purple-600 hover:bg-purple-700 text-white"
                              onClick={() => {
                                console.log(`Executing: ${action}`);
                                setSelectedAlert(null);
                              }}
                            >
                              Run
                            </Button>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}

