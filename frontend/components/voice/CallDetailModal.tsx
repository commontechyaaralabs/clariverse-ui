'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { LineChart, Line, AreaChart, Area, BarChart, Bar, XAxis, YAxis, CartesianGrid, ResponsiveContainer, Tooltip, ReferenceLine, Cell } from 'recharts';
import { CallDetail } from '@/lib/voiceData';
import { CheckCircle, XCircle } from 'lucide-react';

interface CallDetailModalProps {
  call: CallDetail | null;
  open: boolean;
  onClose: () => void;
}

export function CallDetailModal({ call, open, onClose }: CallDetailModalProps) {
  if (!call) return null;

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto bg-app-black/98 border-white/10">
        <DialogHeader>
          <DialogTitle className="text-2xl">Call Details: {call.callId}</DialogTitle>
          <DialogDescription className="text-muted-foreground">
            Agent: {call.agentName} | Duration: {Math.round(call.duration)}s | {new Date(call.timestamp).toLocaleString()}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 mt-4">
          {/* Emotion and Silence Timeline */}
          <div className="grid grid-cols-2 gap-4">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="text-sm">Emotion Timeline</CardTitle>
                  <div className="flex items-center gap-3 text-xs">
                    <div className="flex items-center gap-1">
                      <div className="w-12 h-3 rounded-full bg-gradient-to-r from-red-500 via-yellow-500 to-green-500"></div>
                    </div>
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <span className="text-red-400">Negative</span>
                      <span className="text-yellow-400">Neutral</span>
                      <span className="text-green-400">Positive</span>
                    </div>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="h-64 relative">
                  <div className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-2 transform -rotate-90 origin-center z-10">
                    <p className="text-xs text-muted-foreground whitespace-nowrap">Emotion Score</p>
                  </div>
                  <div className="w-full h-full flex items-center justify-center">
                    <ResponsiveContainer width="100%" height="100%">
                      <AreaChart data={call.emotionTimeline} margin={{ top: 10, right: 20, left: 10, bottom: 10 }}>
                      <defs>
                        {(() => {
                          // Calculate dynamic gradient stops based on actual sentiment values
                          const maxTime = Math.max(...call.emotionTimeline.map(d => d.time));
                          const getSentimentColor = (value: number) => {
                            // Red for negative (0-1.5), Yellow/Orange for neutral (1.5-3.5), Green for positive (3.5-5)
                            if (value <= 1.5) {
                              // Negative: Red shades (darker red to lighter red)
                              const ratio = value / 1.5;
                              if (ratio < 0.33) return '#dc2626'; // Dark red
                              if (ratio < 0.66) return '#ef4444'; // Red
                              return '#f87171'; // Light red
                            } else if (value <= 3.5) {
                              // Neutral: Yellow/Orange shades
                              const ratio = (value - 1.5) / 2;
                              if (ratio < 0.33) return '#f97316'; // Orange
                              if (ratio < 0.66) return '#fbbf24'; // Yellow-orange
                              return '#eab308'; // Yellow
                            } else {
                              // Positive: Green shades
                              const ratio = (value - 3.5) / 1.5;
                              if (ratio < 0.33) return '#84cc16'; // Light green
                              if (ratio < 0.66) return '#22c55e'; // Green
                              return '#10b981'; // Dark green
                            }
                          };

                          // Create gradient stops for line (horizontal gradient)
                          const lineStops = call.emotionTimeline.map((point, index) => {
                            const offset = (point.time / maxTime) * 100;
                            const color = getSentimentColor(point.emotion);
                            return { offset: `${offset}%`, color, opacity: 1 };
                          });

                          // Create gradient stops for area fill (vertical gradient with horizontal color variation)
                          const areaStops = call.emotionTimeline.map((point, index) => {
                            const offset = (point.time / maxTime) * 100;
                            const color = getSentimentColor(point.emotion);
                            return { offset: `${offset}%`, color, opacity: 0.4 };
                          });

                          return (
                            <>
                              {/* Dynamic horizontal gradient for line based on sentiment at each time point */}
                              <linearGradient id="sentimentLineGradient" x1="0" y1="0" x2="1" y2="0">
                                {lineStops.map((stop, idx) => (
                                  <stop key={idx} offset={stop.offset} stopColor={stop.color} stopOpacity={stop.opacity} />
                                ))}
                              </linearGradient>
                              {/* Dynamic gradient for area fill */}
                              <linearGradient id="sentimentAreaGradient" x1="0" y1="0" x2="1" y2="0">
                                {areaStops.map((stop, idx) => (
                                  <stop key={idx} offset={stop.offset} stopColor={stop.color} stopOpacity={stop.opacity} />
                                ))}
                              </linearGradient>
                              {/* Vertical gradient overlay for area depth */}
                              <linearGradient id="sentimentGradient" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="0%" stopColor="currentColor" stopOpacity={0.4}/>
                                <stop offset="100%" stopColor="currentColor" stopOpacity={0.1}/>
                              </linearGradient>
                              <filter id="glow">
                                <feGaussianBlur stdDeviation="3" result="coloredBlur"/>
                                <feMerge>
                                  <feMergeNode in="coloredBlur"/>
                                  <feMergeNode in="SourceGraphic"/>
                                </feMerge>
                              </filter>
                            </>
                          );
                        })()}
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" stroke="rgba(255, 255, 255, 0.1)" strokeWidth={1} />
                      <XAxis 
                        dataKey="time" 
                        stroke="#939394" 
                        fontSize={11}
                        axisLine={false}
                        tickLine={false}
                        tick={{ fill: '#939394' }}
                      />
                      <YAxis 
                        stroke="#939394" 
                        fontSize={11}
                        axisLine={false}
                        tickLine={false}
                        tick={{ fill: '#939394' }}
                        domain={[0, 5]}
                      />
                      <ReferenceLine y={2.5} stroke="#939394" strokeDasharray="2 2" strokeOpacity={0.5} />
                      <Tooltip 
                        contentStyle={{ 
                          background: 'rgba(1, 1, 1, 0.95)',
                          backdropFilter: 'blur(20px)',
                          border: '2px solid rgba(185, 10, 189, 0.4)',
                          borderRadius: '12px',
                          color: '#ffffff',
                          boxShadow: '0 8px 32px rgba(0, 0, 0, 0.3), 0 0 20px rgba(185, 10, 189, 0.3)',
                          padding: '8px 12px'
                        }}
                        formatter={(value: number) => {
                          // Lower values (0-1.5) = Negative, Middle (1.5-3.5) = Neutral, Higher (3.5-5) = Positive
                          const emotion = value >= 3.5 ? 'Positive' : value <= 1.5 ? 'Negative' : 'Neutral';
                          return [`${emotion} (${value.toFixed(2)}/5)`, 'Emotion'];
                        }}
                        labelFormatter={(label) => `Time: ${label.toFixed(1)}s`}
                      />
                      <Area 
                        type="monotone" 
                        dataKey="emotion" 
                        stroke="url(#sentimentLineGradient)" 
                        strokeWidth={3}
                        fill="url(#sentimentAreaGradient)"
                        filter="url(#glow)"
                        dot={false}
                        activeDot={{ r: 6, fill: '#b90abd', stroke: '#fff', strokeWidth: 2 }}
                      />
                      </AreaChart>
                    </ResponsiveContainer>
                  </div>
                </div>
                <div className="mt-0 text-center">
                  <p className="text-xs text-muted-foreground">Time (seconds)</p>
                </div>
                <div className="mt-0 flex items-center justify-between text-xs text-muted-foreground">
                  <span>Avg: {(call.emotionTimeline.reduce((sum, d) => sum + d.emotion, 0) / call.emotionTimeline.length).toFixed(2)}/5</span>
                  <span>Duration: {call.duration}s</span>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="text-sm">Silence Timeline</CardTitle>
                  <div className="text-xs text-muted-foreground">
                    Total Silence: {call.silenceTimeline.reduce((sum, d) => sum + d.duration, 0).toFixed(1)}s
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="h-64 relative">
                  <div className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-8 transform -rotate-90 origin-center z-10">
                    <p className="text-xs text-muted-foreground whitespace-nowrap">Duration (seconds)</p>
                  </div>
                  <div className="w-full h-full flex items-center justify-center">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={call.silenceTimeline} margin={{ top: 10, right: 20, left: 10, bottom: 10 }}>
                      <defs>
                        <linearGradient id="silenceGradient" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="0%" stopColor="#f59e0b" stopOpacity={1}/>
                          <stop offset="50%" stopColor="#fbbf24" stopOpacity={0.9}/>
                          <stop offset="100%" stopColor="#f59e0b" stopOpacity={0.7}/>
                        </linearGradient>
                        <filter id="barGlow">
                          <feGaussianBlur stdDeviation="2" result="coloredBlur"/>
                          <feMerge>
                            <feMergeNode in="coloredBlur"/>
                            <feMergeNode in="SourceGraphic"/>
                          </feMerge>
                        </filter>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" stroke="rgba(255, 255, 255, 0.1)" strokeWidth={1} />
                      <XAxis 
                        dataKey="time" 
                        stroke="#939394" 
                        fontSize={11}
                        axisLine={false}
                        tickLine={false}
                        tick={{ fill: '#939394' }}
                      />
                      <YAxis 
                        stroke="#939394" 
                        fontSize={11}
                        axisLine={false}
                        tickLine={false}
                        tick={{ fill: '#939394' }}
                      />
                      <Tooltip 
                        contentStyle={{ 
                          background: 'rgba(1, 1, 1, 0.95)',
                          backdropFilter: 'blur(20px)',
                          border: '2px solid rgba(245, 158, 11, 0.4)',
                          borderRadius: '12px',
                          color: '#ffffff',
                          boxShadow: '0 8px 32px rgba(0, 0, 0, 0.3), 0 0 20px rgba(245, 158, 11, 0.3)',
                          padding: '8px 12px'
                        }}
                        formatter={(value: number) => [`${value.toFixed(2)}s`, 'Silence Duration']}
                        labelFormatter={(label) => `Time: ${label.toFixed(1)}s`}
                      />
                      <Bar 
                        dataKey="duration" 
                        fill="url(#silenceGradient)"
                        filter="url(#barGlow)"
                        radius={[4, 4, 0, 0]}
                      >
                        {call.silenceTimeline.map((entry, index) => {
                          const isLong = entry.duration > 5;
                          return (
                            <Cell 
                              key={`cell-${index}`}
                              fill={isLong ? '#ef4444' : 'url(#silenceGradient)'}
                            />
                          );
                        })}
                      </Bar>
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </div>
                <div className="mt-0 text-center">
                  <p className="text-xs text-muted-foreground">Time (seconds)</p>
                </div>
                <div className="mt-0 flex items-center justify-between text-xs text-muted-foreground">
                  <span>Instances: {call.silenceTimeline.length}</span>
                  <span className="flex items-center gap-1">
                    <span className="w-2 h-2 rounded-full bg-orange-500"></span>
                    Normal
                    <span className="w-2 h-2 rounded-full bg-red-500 ml-2"></span>
                    Long (&gt;5s)
                  </span>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Speaking Ratio and Compliance Checklist */}
          <div className="grid grid-cols-2 gap-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-sm">Speaking Ratio</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-muted-foreground">Agent</span>
                      <span className="text-sm font-semibold text-white">{call.speakingRatio.agent}%</span>
                    </div>
                    <div className="h-4 bg-gray-800 rounded-full overflow-hidden">
                      <div className="h-full bg-gradient-to-r from-[#b90abd] to-[#5332ff]" style={{ width: `${call.speakingRatio.agent}%` }} />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-muted-foreground">Customer</span>
                      <span className="text-sm font-semibold text-white">{call.speakingRatio.customer}%</span>
                    </div>
                    <div className="h-4 bg-gray-800 rounded-full overflow-hidden">
                      <div className="h-full bg-blue-500" style={{ width: `${call.speakingRatio.customer}%` }} />
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-sm">Compliance Checklist</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {call.complianceChecklist.map((item, idx) => (
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
              <CardTitle className="text-lg">Full Transcript</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3 max-h-96 overflow-y-auto">
                {call.transcript.map((entry, idx) => (
                  <div
                    key={idx}
                    className={`p-3 rounded-lg ${
                      entry.speaker === 'agent' 
                        ? 'bg-[#b90abd]/20 border-l-4 border-[#b90abd]' 
                        : 'bg-blue-500/20 border-l-4 border-blue-500'
                    }`}
                  >
                    <div className="flex items-center gap-2 mb-2">
                      <span className={`text-xs font-semibold uppercase px-2 py-1 rounded ${
                        entry.speaker === 'agent'
                          ? 'bg-[#b90abd]/30 text-[#b90abd]'
                          : 'bg-blue-500/30 text-blue-400'
                      }`}>
                        {entry.speaker}
                      </span>
                      <span className="text-xs text-muted-foreground">{entry.timestamp}s</span>
                    </div>
                    <p className="text-sm text-white leading-relaxed">{entry.text}</p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* AI Summary & Recommendation */}
          <div className="grid grid-cols-2 gap-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-sm">AI Summary</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground leading-relaxed">{call.aiSummary}</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle className="text-sm">Recommended Action</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-orange-400 leading-relaxed">{call.recommendedAction}</p>
              </CardContent>
            </Card>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

