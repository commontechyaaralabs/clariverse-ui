'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { AlertTriangle, Clock, Euro, FileText, TrendingUp, CheckCircle } from 'lucide-react';
import { Violation } from '@/lib/voiceData';

interface ViolationCenterProps {
  violations: Violation[];
}

export function ViolationCenter({ violations }: ViolationCenterProps) {
  // Helper function to format dates
  const formatDate = (dateString: string, format: 'short' | 'date' = 'short') => {
    const date = new Date(dateString);
    if (format === 'date') {
      return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    }
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });
  };

  const criticalViolations = violations.filter(v => v.severity === 'critical');
  const highViolations = violations.filter(v => v.severity === 'high');
  const totalFinancialRisk = violations.reduce((sum, v) => sum + v.financialImpact.expectedLoss, 0);
  const overdueViolations = violations.filter(v => {
    if (v.remediation.deadline) {
      return new Date(v.remediation.deadline) < new Date() && v.remediation.status !== 'completed';
    }
    return false;
  });

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical':
        return 'bg-red-500/20 text-red-400 border-red-500/50';
      case 'high':
        return 'bg-orange-500/20 text-orange-400 border-orange-500/50';
      case 'medium':
        return 'bg-yellow-500/20 text-yellow-400 border-yellow-500/50';
      case 'low':
        return 'bg-blue-500/20 text-blue-400 border-blue-500/50';
      default:
        return 'bg-gray-500/20 text-gray-400 border-gray-500/50';
    }
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'GDPR':
        return 'bg-purple-500/20 text-purple-400';
      case 'PSD2':
        return 'bg-blue-500/20 text-blue-400';
      case 'MiFID':
        return 'bg-green-500/20 text-green-400';
      case 'AML':
        return 'bg-red-500/20 text-red-400';
      default:
        return 'bg-gray-500/20 text-gray-400';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'bg-green-500/20 text-green-400';
      case 'in_progress':
        return 'bg-blue-500/20 text-blue-400';
      case 'overdue':
        return 'bg-red-500/20 text-red-400';
      default:
        return 'bg-yellow-500/20 text-yellow-400';
    }
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg flex items-center gap-2">
            <AlertTriangle className="w-5 h-5 text-red-400" />
            Violation Center
          </CardTitle>
          <Badge className="bg-red-500/20 text-red-400 border-red-500/50">
            {violations.length} Active
          </Badge>
        </div>
        <p className="text-xs text-muted-foreground mt-2">
          Granular compliance violations with financial impact tracking and remediation status
        </p>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Summary Stats */}
        <div className="grid grid-cols-4 gap-3">
          <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-3 hover:bg-red-500/15 transition-colors">
            <div className="text-xs text-red-400 mb-1">Critical</div>
            <div className="text-xl font-bold text-white">{criticalViolations.length}</div>
          </div>
          <div className="bg-orange-500/10 border border-orange-500/30 rounded-lg p-3 hover:bg-orange-500/15 transition-colors">
            <div className="text-xs text-orange-400 mb-1">High</div>
            <div className="text-xl font-bold text-white">{highViolations.length}</div>
          </div>
          <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-lg p-3 hover:bg-yellow-500/15 transition-colors">
            <div className="text-xs text-yellow-400 mb-1">Overdue</div>
            <div className="text-xl font-bold text-white">{overdueViolations.length}</div>
          </div>
          <div className="bg-purple-500/10 border border-purple-500/30 rounded-lg p-3 hover:bg-purple-500/15 transition-colors">
            <div className="text-xs text-purple-400 mb-1 flex items-center gap-1">
              <Euro className="w-3 h-3" />
              Expected Loss
            </div>
            <div className="text-xl font-bold text-white">
              €{(totalFinancialRisk / 1000000).toFixed(1)}M
            </div>
          </div>
        </div>

        {/* Violations List */}
        <div className="space-y-2 max-h-[500px] overflow-y-auto pr-2">
          {violations.slice(0, 10).map((violation) => (
            <div
              key={violation.violationId}
              className="bg-white/5 border border-white/10 rounded-lg p-3 hover:border-[#b90abd]/50 hover:bg-white/10 transition-all"
            >
              <div className="flex items-start justify-between mb-2">
                <div className="flex items-center gap-2 flex-wrap">
                  <Badge className={getCategoryColor(violation.category)}>
                    {violation.category}
                  </Badge>
                  <Badge className={getSeverityColor(violation.severity)}>
                    {violation.severity.toUpperCase()}
                  </Badge>
                  {violation.recurrence.isRecurring && (
                    <Badge className="bg-orange-500/20 text-orange-400 border-orange-500/50">
                      Recurring ({violation.recurrence.occurrenceCount}x)
                    </Badge>
                  )}
                </div>
                <div className="text-right">
                  <div className="text-xs text-muted-foreground">
                    {formatDate(violation.timestamp)}
                  </div>
                </div>
              </div>

              <div className="mb-2">
                <div className="text-sm font-semibold text-white mb-1">
                  {violation.regulation}
                </div>
                <div className="text-xs text-muted-foreground">
                  {violation.severityReason}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2 mb-2">
                <div className="bg-white/5 rounded p-2 border border-white/10">
                  <div className="text-xs text-muted-foreground mb-1">Agent</div>
                  <div className="text-sm font-semibold text-white">{violation.agentName}</div>
                </div>
                <div className="bg-white/5 rounded p-2 border border-white/10">
                  <div className="text-xs text-muted-foreground mb-1 flex items-center gap-1">
                    <Euro className="w-3 h-3" />
                    Financial Impact
                  </div>
                  <div className="text-sm font-semibold text-red-400">
                    €{(violation.financialImpact.expectedLoss / 1000).toFixed(0)}K
                  </div>
                  <div className="text-xs text-muted-foreground">
                    {violation.financialImpact.probability}% probability
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Badge className={getStatusColor(violation.remediation.status)}>
                    {violation.remediation.status.replace('_', ' ').toUpperCase()}
                  </Badge>
                  {violation.remediation.deadline && (
                    <div className="text-xs text-muted-foreground flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      {formatDate(violation.remediation.deadline, 'date')}
                    </div>
                  )}
                </div>
                {violation.reporting.reportable && (
                  <Badge className="bg-red-500/20 text-red-400 border-red-500/50">
                    Reportable to {violation.reporting.regulator}
                  </Badge>
                )}
              </div>

              {violation.evidence.transcriptExcerpt && (
                <div className="mt-2 p-2 bg-white/5 border border-white/10 rounded text-xs text-muted-foreground italic">
                  "{violation.evidence.transcriptExcerpt}"
                </div>
              )}
            </div>
          ))}
        </div>

        {violations.length === 0 && (
          <div className="text-center py-8 text-muted-foreground">
            <CheckCircle className="w-12 h-12 mx-auto mb-2 text-green-500" />
            <p>No violations detected</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

