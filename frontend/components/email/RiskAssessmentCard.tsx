'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { AlertTriangle, TrendingUp, Clock } from 'lucide-react';

interface RiskMetrics {
  slaBreach: number;
  escalationRate: number;
  customerWaiting: number;
}

interface RiskAssessmentCardProps {
  data: RiskMetrics;
}

export function RiskAssessmentCard({ data }: RiskAssessmentCardProps) {
  const riskItems = [
    {
      label: 'SLA Breach Risk',
      value: data.slaBreach,
      color: 'bg-red-500',
      icon: AlertTriangle,
      description: 'Threads at risk of SLA breach'
    },
    {
      label: 'Escalation Rate',
      value: data.escalationRate,
      color: 'bg-yellow-500',
      icon: TrendingUp,
      description: 'Threads that have been escalated'
    },
    {
      label: 'Customer Waiting',
      value: data.customerWaiting,
      color: 'bg-blue-500',
      icon: Clock,
      description: 'Threads pending customer response'
    }
  ];

  return (
    <Card className="bg-gray-900 border-gray-700">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-white">
          <AlertTriangle className="h-5 w-5 text-orange-400" />
          Risk Assessment
        </CardTitle>
        <CardDescription className="text-gray-400">
          Key risk indicators and performance metrics
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {riskItems.map((item, index) => {
          const Icon = item.icon;
          const percentage = Math.min(100, Math.max(0, item.value));
          
          return (
            <div key={index} className="flex items-center justify-between">
              <div className="flex items-center gap-3 min-w-0 flex-1">
                <div className="min-w-0">
                  <div className="text-sm font-medium text-white truncate">
                    {item.label}
                  </div>
                  <div className="text-xs text-gray-400 truncate">
                    {item.description}
                  </div>
                </div>
              </div>
              
              <div className="flex items-center gap-3 ml-4">
                {/* Progress Bar */}
                <div className="w-24 h-2 bg-gray-700 rounded-full overflow-hidden">
                  <div 
                    className={`h-full ${item.color} transition-all duration-300 ease-out`}
                    style={{ width: `${percentage}%` }}
                  />
                </div>
                
                {/* Percentage */}
                <div className="text-sm font-semibold text-white min-w-[3rem] text-right">
                  {item.value.toFixed(1)}%
                </div>
              </div>
            </div>
          );
        })}
      </CardContent>
    </Card>
  );
}
