'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import type { PredictiveMetrics } from '@/lib/api';
import { TrendingUp, TrendingDown, AlertTriangle, Brain, Calendar } from 'lucide-react';

interface PredictiveMetricsProps {
  data: PredictiveMetrics;
}

export function PredictiveMetrics({ data }: PredictiveMetricsProps) {
  const getRiskLevel = (probability: number, impact: number) => {
    const riskScore = (probability + impact) / 2;
    if (riskScore > 80) return { level: 'Critical', color: 'text-red-400', bgColor: 'bg-red-500/10' };
    if (riskScore > 60) return { level: 'High', color: 'text-orange-400', bgColor: 'bg-orange-500/10' };
    if (riskScore > 40) return { level: 'Medium', color: 'text-yellow-400', bgColor: 'bg-yellow-500/10' };
    return { level: 'Low', color: 'text-green-400', bgColor: 'bg-green-500/10' };
  };

  const getConfidenceColor = (confidence: number) => {
    if (confidence > 0.9) return 'text-green-400';
    if (confidence > 0.7) return 'text-yellow-400';
    return 'text-red-400';
  };

  return (
    <div className="space-y-6">
      {/* Risk Forecast */}
      <Card className="bg-gray-900 border-gray-700">
        <CardHeader>
          <CardTitle className="text-white flex items-center gap-2">
            <TrendingUp className="h-5 w-5 text-blue-400" />
            Risk Forecast
          </CardTitle>
          <CardDescription className="text-gray-400">
            7-day predicted risk trends
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="grid grid-cols-7 gap-2">
              {data.risk_forecast.map((forecast, index) => (
                <div key={index} className="text-center">
                  <div className="text-xs text-gray-400 mb-1">
                    {new Date(forecast.date).toLocaleDateString('en-US', { weekday: 'short' })}
                  </div>
                  <div className="text-xs text-gray-300 mb-1">
                    {new Date(forecast.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                  </div>
                  <div className="text-lg font-bold text-white">
                    {Math.round(forecast.predicted_risk_score)}
                  </div>
                  <div className={`text-xs ${getConfidenceColor(forecast.confidence)}`}>
                    {Math.round(forecast.confidence * 100)}%
                  </div>
                </div>
              ))}
            </div>
            
            {/* Trend Line */}
            <div className="h-20 bg-gray-800 rounded-lg p-4 flex items-end justify-between">
              {data.risk_forecast.map((forecast, index) => (
                <div
                  key={index}
                  className="bg-blue-500 rounded-t"
                  style={{
                    width: '12px',
                    height: `${(forecast.predicted_risk_score / 100) * 100}%`,
                    minHeight: '4px'
                  }}
                />
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* AI Risk Cards */}
      <Card className="bg-gray-900 border-gray-700">
        <CardHeader>
          <CardTitle className="text-white flex items-center gap-2">
            <Brain className="h-5 w-5 text-purple-400" />
            AI Risk Assessment
          </CardTitle>
          <CardDescription className="text-gray-400">
            Machine learning powered risk predictions
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {data.ai_risk_cards.map((card, index) => {
              const riskInfo = getRiskLevel(card.probability, card.impact);
              return (
                <div
                  key={index}
                  className={`p-4 rounded-lg border ${riskInfo.bgColor} border-gray-600`}
                >
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <AlertTriangle className="h-4 w-4 text-orange-400" />
                      <h4 className="font-medium text-white">{card.risk_type}</h4>
                    </div>
                    <div className={`px-2 py-1 rounded text-xs font-medium ${riskInfo.color} bg-gray-800`}>
                      {riskInfo.level}
                    </div>
                  </div>
                  
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-400">Probability:</span>
                      <span className="text-white">{Math.round(card.probability)}%</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-400">Impact:</span>
                      <span className="text-white">{Math.round(card.impact)}%</span>
                    </div>
                    <div className="mt-3">
                      <div className="text-xs text-gray-400 mb-1">Recommendation:</div>
                      <div className="text-xs text-gray-300">{card.recommendation}</div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Workload Prediction */}
      <Card className="bg-gray-900 border-gray-700">
        <CardHeader>
          <CardTitle className="text-white flex items-center gap-2">
            <Calendar className="h-5 w-5 text-green-400" />
            Workload Prediction
          </CardTitle>
          <CardDescription className="text-gray-400">
            14-day predicted thread volume
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {/* Chart */}
            <div className="h-32 bg-gray-800 rounded-lg p-4">
              <div className="flex items-end justify-between h-full">
                {data.workload_prediction.map((prediction, index) => (
                  <div key={index} className="flex flex-col items-center">
                    <div className="flex flex-col items-end gap-1">
                      <div
                        className="bg-blue-500 rounded-t w-4"
                        style={{
                          height: `${(prediction.predicted_threads / 70) * 100}%`,
                          minHeight: '4px'
                        }}
                      />
                      <div
                        className="bg-red-500 rounded-t w-4"
                        style={{
                          height: `${(prediction.predicted_urgent / 15) * 100}%`,
                          minHeight: '2px'
                        }}
                      />
                    </div>
                    <div className="text-xs text-gray-400 mt-2 transform -rotate-45 origin-left">
                      {new Date(prediction.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                    </div>
                  </div>
                ))}
              </div>
            </div>
            
            {/* Legend */}
            <div className="flex items-center gap-4 text-sm">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-blue-500 rounded"></div>
                <span className="text-gray-300">Total Threads</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-red-500 rounded"></div>
                <span className="text-gray-300">Urgent Threads</span>
              </div>
            </div>

            {/* Statistics */}
            <div className="grid grid-cols-3 gap-4 text-center">
              <div>
                <div className="text-2xl font-bold text-blue-400">
                  {Math.round(data.workload_prediction.reduce((sum, p) => sum + p.predicted_threads, 0) / data.workload_prediction.length)}
                </div>
                <div className="text-xs text-gray-400">Avg Daily Threads</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-red-400">
                  {Math.round(data.workload_prediction.reduce((sum, p) => sum + p.predicted_urgent, 0) / data.workload_prediction.length)}
                </div>
                <div className="text-xs text-gray-400">Avg Daily Urgent</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-green-400">
                  {Math.round((data.workload_prediction.reduce((sum, p) => sum + p.predicted_urgent, 0) / data.workload_prediction.reduce((sum, p) => sum + p.predicted_threads, 0)) * 100)}%
                </div>
                <div className="text-xs text-gray-400">Urgent Ratio</div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

