'use client';

import { Card, CardContent } from '@/components/ui/card';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { PriorityResolutionData } from '@/lib/api';
import { AlertTriangle, CheckCircle, Clock, Target } from 'lucide-react';

interface PriorityResolutionChartProps {
  data: PriorityResolutionData[];
  onPriorityClick?: (priority: string, status: string) => void;
}

export function PriorityResolutionChart({ data, onPriorityClick }: PriorityResolutionChartProps) {
  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-gray-800 border border-gray-600 rounded-lg p-3 shadow-lg">
          <p className="font-semibold text-white text-sm mb-2">Priority {label}</p>
          <div className="space-y-1">
            {payload.map((entry: any, index: number) => (
              <div key={index} className="flex items-center gap-2 text-xs">
                <div
                  className="w-3 h-3 rounded-full"
                  style={{ backgroundColor: entry.color }}
                />
                <span className="text-gray-300">{entry.dataKey}:</span>
                <span className="text-white font-medium">{entry.value}</span>
              </div>
            ))}
            <div className="pt-2 mt-2 border-t border-gray-600">
              <div className="flex items-center gap-2 text-xs">
                <span className="text-gray-300">Total:</span>
                <span className="text-white font-medium">
                  {payload.reduce((sum: number, entry: any) => sum + entry.value, 0)}
                </span>
              </div>
            </div>
          </div>
        </div>
      );
    }
    return null;
  };

  const handleBarClick = (data: any) => {
    if (data && onPriorityClick) {
      // Find which status was clicked based on the bar position
      const status = data.activePayload?.[0]?.dataKey;
      onPriorityClick(data.activeLabel, status);
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'P1': return '#ef4444'; // red
      case 'P2': return '#f97316'; // orange
      case 'P3': return '#eab308'; // yellow
      case 'P4': return '#3b82f6'; // blue
      case 'P5': return '#6b7280'; // gray
      default: return '#6b7280';
    }
  };

  const getPriorityIcon = (priority: string) => {
    switch (priority) {
      case 'P1': return <AlertTriangle className="h-4 w-4 text-red-400" />;
      case 'P2': return <AlertTriangle className="h-4 w-4 text-orange-400" />;
      case 'P3': return <Clock className="h-4 w-4 text-yellow-400" />;
      case 'P4': return <Target className="h-4 w-4 text-blue-400" />;
      case 'P5': return <Target className="h-4 w-4 text-gray-400" />;
      default: return <Target className="h-4 w-4 text-gray-400" />;
    }
  };

  const totalOpen = data.reduce((sum, d) => sum + d.openCustomer + d.openCompany, 0);
  const totalInProgress = 0; // No inProgress property in the interface
  const totalClosed = data.reduce((sum, d) => sum + d.closed, 0);
  const totalThreads = totalOpen + totalInProgress + totalClosed;

  return (
    <Card>
      <CardContent className="pt-6">
        <div className="h-80 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={data}
              margin={{ top: 20, right: 30, left: 20, bottom: 20 }}
              onClick={handleBarClick}
            >
              <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
              <XAxis
                dataKey="priority"
                tick={{ fill: '#9ca3af', fontSize: 12 }}
                axisLine={{ stroke: '#4b5563' }}
                tickLine={{ stroke: '#4b5563' }}
              />
              <YAxis
                tick={{ fill: '#9ca3af', fontSize: 12 }}
                axisLine={{ stroke: '#4b5563' }}
                tickLine={{ stroke: '#4b5563' }}
              />
              <Tooltip content={<CustomTooltip />} />
              <Legend />
              <Bar
                dataKey="openCustomer"
                stackId="a"
                fill="#3b82f6"
                name="Open - Customer"
                radius={[0, 0, 0, 0]}
              />
              <Bar
                dataKey="openCompany"
                stackId="a"
                fill="#f97316"
                name="Open - Company"
                radius={[0, 0, 0, 0]}
              />
              <Bar
                dataKey="closed"
                stackId="a"
                fill="#10b981"
                name="Closed"
                radius={[4, 4, 0, 0]}
              />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Priority Summary */}
        <div className="mt-6 space-y-4">
          <h4 className="text-sm font-medium text-gray-300">Priority Breakdown</h4>
          <div className="grid grid-cols-1 md:grid-cols-5 gap-3">
            {data.map((priority) => {
              const total = priority.openCustomer + priority.openCompany + priority.closed;
              const openCustomerPercentage = Math.round((priority.openCustomer / total) * 100);
              const isCritical = priority.priority === 'P1' && priority.openCustomer > 0;
              
              return (
                <div
                  key={priority.priority}
                  className={`p-3 rounded-lg border transition-colors cursor-pointer ${
                    isCritical 
                      ? 'bg-red-500/10 border-red-500/20 hover:bg-red-500/20' 
                      : 'bg-gray-800 border-gray-700 hover:bg-gray-700'
                  }`}
                  onClick={() => onPriorityClick?.(priority.priority, 'open')}
                >
                  <div className="flex items-center gap-2 mb-2">
                    {getPriorityIcon(priority.priority)}
                    <span className="text-sm font-medium text-white">
                      {priority.priority}
                    </span>
                    {isCritical && (
                      <AlertTriangle className="h-3 w-3 text-red-400" />
                    )}
                  </div>
                  
                  <div className="space-y-1">
                    <div className="flex justify-between text-xs">
                      <span className="text-gray-400">Open - Customer:</span>
                      <span className={`font-medium ${isCritical ? 'text-red-400' : 'text-blue-400'}`}>
                        {priority.openCustomer}
                      </span>
                    </div>
                    <div className="flex justify-between text-xs">
                      <span className="text-gray-400">Open - Company:</span>
                      <span className="text-orange-400 font-medium">{priority.openCompany}</span>
                    </div>
                    <div className="flex justify-between text-xs">
                      <span className="text-gray-400">Closed:</span>
                      <span className="text-green-400 font-medium">{priority.closed}</span>
                    </div>
                    <div className="pt-1 mt-1 border-t border-gray-600">
                      <div className="flex justify-between text-xs">
                        <span className="text-gray-400">Total:</span>
                        <span className="text-white font-medium">{total}</span>
                      </div>
                      <div className="flex justify-between text-xs">
                        <span className="text-gray-400">Open Customer %:</span>
                        <span className={`font-medium ${isCritical ? 'text-red-400' : 'text-gray-300'}`}>
                          {openCustomerPercentage}%
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

      </CardContent>
    </Card>
  );
}
