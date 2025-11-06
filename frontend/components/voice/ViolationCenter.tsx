'use client';

import { useMemo, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { AlertTriangle, Clock, Euro, FileText, CheckCircle } from 'lucide-react';
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
      case 'CONSENT':
        return 'bg-purple-500/20 text-purple-400';
      case 'IDENTITY':
        return 'bg-blue-500/20 text-blue-400';
      case 'SANCTIONS':
        return 'bg-red-500/20 text-red-400';
      case 'SUITABILITY':
        return 'bg-green-500/20 text-green-400';
      case 'CDD':
        return 'bg-yellow-500/20 text-yellow-400';
      default:
        return 'bg-gray-500/20 text-gray-400';
    }
  };

  const getCategoryLabel = (category: string) => {
    switch (category) {
      case 'CONSENT':
        return 'Consent';
      case 'IDENTITY':
        return 'Identity';
      case 'SANCTIONS':
        return 'Sanctions';
      case 'SUITABILITY':
        return 'Suitability';
      case 'CDD':
        return 'Beneficial Ownership';
      default:
        return category;
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

  const [selectedViolation, setSelectedViolation] = useState<Violation | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const handleViolationClick = (violation: Violation) => {
    setSelectedViolation(violation);
    setIsDialogOpen(true);
  };

  const renderTranscriptSnippet = useMemo(() => {
    if (!selectedViolation) return null;
    const { transcriptExcerpt } = selectedViolation.evidence;
    const parts = transcriptExcerpt.split(/(\[[^\]]+\])/g);
    return (
      <p className="text-sm leading-relaxed">
        {parts.map((part, index) => {
          if (/^\[.*\]$/.test(part)) {
            return (
              <span
                key={index}
                className="mx-1 rounded bg-[#b90abd]/20 px-1.5 py-0.5 text-[#b90abd]"
              >
                {part.replace(/\[|\]/g, '')}
              </span>
            );
          }
          return <span key={index}>{part}</span>;
        })}
      </p>
    );
  }, [selectedViolation]);

  const renderFullTranscript = useMemo(() => {
    if (!selectedViolation || !selectedViolation.evidence.fullTranscript) return null;
    const segments = selectedViolation.evidence.fullTranscript;
    return (
      <div className="space-y-2">
        {segments.map((segment, index) => (
          <div
            key={`${segment.speaker}-${index}`}
            className={`flex items-start gap-3 rounded-lg border px-3 py-2 transition-all ${
              segment.violation
                ? 'border-[#b90abd]/60 bg-[#b90abd]/10 shadow-[0_0_18px_rgba(185,10,189,0.15)]'
                : 'border-white/10 bg-white/5'
            }`}
          >
            <div className={`text-[11px] font-semibold uppercase tracking-wide ${
              segment.speaker === 'agent'
                ? 'text-[#b90abd]'
                : segment.speaker === 'customer'
                  ? 'text-teal-300'
                  : 'text-white/50'
            }`}
            >
              {segment.speaker}
            </div>
            <div className="flex-1 text-sm text-white/80">
              {segment.text}
            </div>
            {segment.timestamp !== undefined && (
              <div className="text-[10px] text-white/40">
                {segment.timestamp}s
              </div>
            )}
          </div>
        ))}
      </div>
    );
  }, [selectedViolation]);

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
          Transcript-detected compliance violations with financial impact tracking and remediation status
        </p>
      </CardHeader>
      <CardContent className="space-y-4 max-h-[32rem] overflow-y-auto pr-2">
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
        <div className="space-y-2">
          {violations.slice(0, 10).map((violation) => (
            <div
              key={violation.violationId}
              className="bg-white/5 border border-white/10 rounded-lg p-3 hover:border-[#b90abd]/50 hover:bg-white/10 transition-all cursor-pointer"
              onClick={() => handleViolationClick(violation)}
            >
              <div className="flex items-start justify-between mb-2">
                <div className="flex items-center gap-2 flex-wrap">
                  <Badge className={getCategoryColor(violation.category)}>
                    {getCategoryLabel(violation.category)}
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

      <Dialog open={isDialogOpen} onOpenChange={(open) => {
        setIsDialogOpen(open);
        if (!open) setSelectedViolation(null);
      }}>
        <DialogContent className="max-w-3xl bg-gray-950 border border-white/10 text-white max-h-[85vh] overflow-y-auto">
          {selectedViolation && (
            <div className="space-y-6">
              <DialogHeader>
                <DialogTitle className="text-xl font-semibold flex items-center gap-2">
                  <AlertTriangle className="w-5 h-5 text-red-400" />
                  {getCategoryLabel(selectedViolation.category)} Violation
                </DialogTitle>
                <p className="text-xs text-white/60">
                  Detected automatically from voice transcript at {formatDate(selectedViolation.timestamp)}
                </p>
              </DialogHeader>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-white/5 border border-white/10 rounded-lg p-4 space-y-3">
                  <h4 className="text-sm font-semibold text-white">Violation Details</h4>
                  <div className="space-y-1 text-sm text-white/70">
                    <div>
                      <span className="text-white/40">Regulation:</span> {selectedViolation.regulation}
                    </div>
                    <div>
                      <span className="text-white/40">Severity:</span> {selectedViolation.severity.toUpperCase()}
                    </div>
                    <div>
                      <span className="text-white/40">Agent:</span> {selectedViolation.agentName}
                    </div>
                    <div>
                      <span className="text-white/40">Financial Impact:</span> €{(selectedViolation.financialImpact.expectedLoss / 1000).toFixed(0)}K expected
                    </div>
                    <div>
                      <span className="text-white/40">Probability:</span> {selectedViolation.financialImpact.probability}%
                    </div>
                    <div>
                      <span className="text-white/40">Occurrence:</span> {selectedViolation.recurrence.pattern}
                    </div>
                  </div>
                </div>

                <div className="bg-white/5 border border-white/10 rounded-lg p-4 space-y-3">
                  <h4 className="text-sm font-semibold text-white">Remediation & Reporting</h4>
                  <div className="space-y-2 text-sm text-white/70">
                    <div>
                      <span className="text-white/40">Action:</span> {selectedViolation.remediation.action}
                    </div>
                    <div>
                      <span className="text-white/40">Deadline:</span> {selectedViolation.remediation.deadline ? formatDate(selectedViolation.remediation.deadline, 'date') : 'N/A'}
                    </div>
                    <div>
                      <span className="text-white/40">Responsible:</span> {selectedViolation.remediation.responsibleTeam}
                    </div>
                    {selectedViolation.reporting.reportable && (
                      <div>
                        <span className="text-white/40">Report To:</span> {selectedViolation.reporting.regulator} by {formatDate(selectedViolation.reporting.reportDeadline, 'date')}
                      </div>
                    )}
                    {selectedViolation.customerNotification.required && (
                      <div>
                        <span className="text-white/40">Customer Notification Due:</span> {formatDate(selectedViolation.customerNotification.deadline, 'date')}
                      </div>
                    )}
                  </div>
                </div>
              </div>

              <div className="bg-white/5 border border-white/10 rounded-lg p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <h4 className="text-sm font-semibold text-white flex items-center gap-2">
                    <FileText className="w-4 h-4" /> Consent Violation Transcript
                  </h4>
                  <div className="text-xs text-white/50">Reference timestamp: {selectedViolation.evidence.timestamp}s</div>
                </div>
                <div className="text-[10px] uppercase tracking-wide text-white/40">
                  {renderFullTranscript ? 'Highlighted turns show exactly where the violation occurred.' : 'Summary excerpt from the call.'}
                </div>
                <div className="max-h-72 overflow-y-auto pr-2">
                  {renderFullTranscript ? (
                    renderFullTranscript
                  ) : (
                    <div className="rounded-lg border border-[#b90abd]/30 bg-[#b90abd]/5 p-4 text-sm text-white/80">
                      {renderTranscriptSnippet}
                    </div>
                  )}
                </div>
              </div>

              <div className="bg-white/5 border border-white/10 rounded-lg p-4">
                <h4 className="text-sm font-semibold text-white mb-2">Why this was flagged</h4>
                <p className="text-sm text-white/70">
                  {selectedViolation.severityReason}
                </p>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </Card>
  );
}

