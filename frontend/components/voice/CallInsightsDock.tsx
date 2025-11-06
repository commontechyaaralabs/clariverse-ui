'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, ResponsiveContainer, Tooltip } from 'recharts';
import { CallDetail, CallListItem } from '@/lib/voiceData';
import { X, CheckCircle, XCircle, Clock } from 'lucide-react';

interface CallInsightsDockProps {
  calls: CallListItem[];
  selectedCall: CallDetail | null;
  onCallSelect: (callId: string) => void;
  onClose: () => void;
}

export function CallInsightsDock({ calls, selectedCall, onCallSelect, onClose }: CallInsightsDockProps) {
  const [isExpanded, setIsExpanded] = useState(false);

  // Auto-expand when a call is selected
  useEffect(() => {
    if (selectedCall) {
      setIsExpanded(true);
    }
  }, [selectedCall]);

  if (!isExpanded && !selectedCall) {
    return (
      <div className="fixed bottom-12 left-0 right-0 h-16 bg-app-black/95 border-t border-white/10 z-50">
        <div className="container mx-auto px-4 h-full flex items-center justify-between">
          <div className="flex items-center gap-4 flex-1 overflow-x-auto">
            <span className="text-sm text-muted-foreground whitespace-nowrap">Critical Calls:</span>
            {calls.slice(0, 10).map((call) => (
              <button
                key={call.callId}
                onClick={() => {
                  onCallSelect(call.callId);
                  setIsExpanded(true);
                }}
                className="text-xs px-3 py-1.5 rounded border border-white/20 hover:border-white/40 transition-colors whitespace-nowrap"
              >
                <span className="text-white">{call.agentName}</span>
                <span className="text-muted-foreground ml-1">({call.intent})</span>
                <span className={`ml-2 ${call.riskScore > 70 ? 'text-red-500' : call.riskScore > 50 ? 'text-orange-500' : 'text-yellow-500'}`}>
                  {call.riskScore.toFixed(0)}%
                </span>
              </button>
            ))}
          </div>
          <Button size="sm" onClick={() => setIsExpanded(true)}>
            Expand
          </Button>
        </div>
      </div>
    );
  }

  if (!selectedCall) return null;

  return (
    <div className="fixed bottom-12 left-0 right-0 bg-app-black/98 border-t border-white/10 z-50 shadow-2xl" style={{ height: isExpanded ? '70vh' : '300px' }}>
      <div className="container mx-auto px-4 h-full flex flex-col">
        <div className="flex items-center justify-between py-3 border-b border-white/10">
          <div>
            <CardTitle className="text-lg">Call Details: {selectedCall.callId}</CardTitle>
            <p className="text-sm text-muted-foreground">
              Agent: {selectedCall.agentName} | Duration: {Math.round(selectedCall.duration)}s | {new Date(selectedCall.timestamp).toLocaleString()}
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Button size="sm" variant="outline" onClick={() => setIsExpanded(!isExpanded)}>
              {isExpanded ? 'Collapse' : 'Expand'}
            </Button>
            <Button size="sm" variant="outline" onClick={onClose}>
              <X className="w-4 h-4" />
            </Button>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto py-4">
          <div className="grid grid-cols-2 gap-4 mb-4">
            {/* Emotion Timeline */}
            <Card>
              <CardHeader>
                <CardTitle className="text-sm">Emotion Timeline</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-32">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={selectedCall.emotionTimeline}>
                      <Line type="monotone" dataKey="emotion" stroke="#b90abd" strokeWidth={2} dot={false} />
                      <Tooltip />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>

            {/* Silence Timeline */}
            <Card>
              <CardHeader>
                <CardTitle className="text-sm">Silence Timeline</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-32">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={selectedCall.silenceTimeline}>
                      <Bar dataKey="duration" fill="#f59e0b" />
                      <Tooltip />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="grid grid-cols-2 gap-4 mb-4">
            {/* Speaking Ratio */}
            <Card>
              <CardHeader>
                <CardTitle className="text-sm">Speaking Ratio</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">Agent</span>
                    <span className="text-sm font-semibold text-white">{selectedCall.speakingRatio.agent}%</span>
                  </div>
                  <div className="h-4 bg-gray-800 rounded-full overflow-hidden">
                    <div className="h-full bg-gradient-to-r from-[#b90abd] to-[#5332ff]" style={{ width: `${selectedCall.speakingRatio.agent}%` }} />
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">Customer</span>
                    <span className="text-sm font-semibold text-white">{selectedCall.speakingRatio.customer}%</span>
                  </div>
                  <div className="h-4 bg-gray-800 rounded-full overflow-hidden">
                    <div className="h-full bg-blue-500" style={{ width: `${selectedCall.speakingRatio.customer}%` }} />
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Compliance Checklist */}
            <Card>
              <CardHeader>
                <CardTitle className="text-sm">Compliance Checklist</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {selectedCall.complianceChecklist.map((item, idx) => (
                    <div key={idx} className="flex items-center justify-between p-2 rounded bg-white/5">
                      <span className="text-sm text-white">{item.item}</span>
                      {item.passed ? (
                        <CheckCircle className="w-5 h-5 text-green-500" />
                      ) : (
                        <XCircle className="w-5 h-5 text-red-500" />
                      )}
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Transcript */}
          <Card>
            <CardHeader>
              <CardTitle className="text-sm">Transcript</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2 max-h-48 overflow-y-auto">
                {selectedCall.transcript.map((entry, idx) => (
                  <div
                    key={idx}
                    className={`p-2 rounded ${
                      entry.speaker === 'agent' ? 'bg-[#b90abd]/20 border-l-2 border-[#b90abd]' : 'bg-blue-500/20 border-l-2 border-blue-500'
                    }`}
                  >
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-xs font-semibold text-white uppercase">{entry.speaker}</span>
                      <span className="text-xs text-muted-foreground">{entry.timestamp}s</span>
                    </div>
                    <p className="text-sm text-white">{entry.text}</p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* AI Summary & Recommendation */}
          <div className="grid grid-cols-2 gap-4 mt-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-sm">AI Summary</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">{selectedCall.aiSummary}</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle className="text-sm">Recommended Action</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-orange-400">{selectedCall.recommendedAction}</p>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}

