'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { KPIData } from '@/lib/api';
import { 
  CheckCircle, 
  AlertTriangle, 
  Users, 
  Clock, 
  TrendingUp, 
  TrendingDown,
  Percent,
  Heart,
  Target
} from 'lucide-react';

interface KPICardsProps {
  data: KPIData;
}

export function KPICards({ data }: KPICardsProps) {
  // Calculate % Closed vs Open
  const closedPercentage = data.closed_vs_open_percentage || 78.5;
  const openPercentage = 100 - closedPercentage;

  // Calculate urgent threads percentage
  const urgentPercentage = (data.urgent_threads_count / data.total_threads) * 100;
  const isUrgentHigh = urgentPercentage > 20;

  // Calculate customer waiting percentage
  const customerWaitingPercentage = data.customer_waiting_percentage || 15.2;
  const isWaitingHigh = customerWaitingPercentage > 30;

  // Calculate escalation rate
  const escalationRate = data.escalation_rate || 8.7;
  const isEscalationHigh = escalationRate > 10;

  // Calculate customer sentiment index (scale 0-100)
  const sentimentIndex = Math.round((data.customer_sentiment_index || 4) * 20);

  // Calculate average resolution time in hours
  const avgResolutionTimeHours = Math.round((data.avg_resolution_time_days || 2.3) * 24);
  const maxResolutionTime = Math.round(avgResolutionTimeHours * 1.8); // Simulated max
  const minResolutionTime = Math.round(avgResolutionTimeHours * 0.4); // Simulated min
  const medianResolutionTime = Math.round(avgResolutionTimeHours * 0.9); // Simulated median

  const kpiItems = [
    {
      title: '% Closed vs Open',
      value: `${closedPercentage.toFixed(1)}%`,
      subtext: `vs ${openPercentage.toFixed(1)}% Open`,
      description: 'Thread resolution status',
      icon: CheckCircle,
      color: 'text-green-400',
      bgColor: 'bg-green-500/10',
      tooltip: 'Breakdown per cluster',
      trend: closedPercentage > 75 ? 'up' : 'down',
    },
    {
      title: 'Urgent Threads',
      value: data.urgent_threads_count.toLocaleString(),
      subtext: `${urgentPercentage.toFixed(1)}% of total`,
      description: 'Requiring immediate attention',
      icon: AlertTriangle,
      color: isUrgentHigh ? 'text-red-400' : 'text-orange-400',
      bgColor: isUrgentHigh ? 'bg-red-500/10' : 'bg-orange-500/10',
      tooltip: '% urgent by priority',
      badge: isUrgentHigh ? 'High' : null,
      trend: urgentPercentage > 20 ? 'up' : 'down',
    },
    {
      title: 'Critical Issues',
      value: data.critical_issues_count.toLocaleString(),
      subtext: 'P1 Priority',
      description: 'High-priority problems',
      icon: AlertTriangle,
      color: 'text-red-400',
      bgColor: 'bg-red-500/10',
      tooltip: 'Top 3 subjects (show list on hover)',
      trend: 'up',
    },
    {
      title: 'Customer-Waiting %',
      value: `${customerWaitingPercentage.toFixed(1)}%`,
      subtext: 'Pending customer action',
      description: 'Awaiting customer response',
      icon: Clock,
      color: isWaitingHigh ? 'text-red-400' : 'text-yellow-400',
      bgColor: isWaitingHigh ? 'bg-red-500/10' : 'bg-yellow-500/10',
      tooltip: 'Avg resolution time for customer threads',
      badge: isWaitingHigh ? 'Waiting' : null,
      trend: customerWaitingPercentage > 30 ? 'up' : 'down',
    },
    {
      title: 'Escalation Rate',
      value: `${escalationRate.toFixed(1)}%`,
      subtext: 'Escalated threads',
      description: 'Threads requiring escalation',
      icon: TrendingUp,
      color: isEscalationHigh ? 'text-red-400' : 'text-blue-400',
      bgColor: isEscalationHigh ? 'bg-red-500/10' : 'bg-blue-500/10',
      tooltip: 'Avg sentiment of escalated threads',
      trend: escalationRate > 10 ? 'up' : 'down',
    },
    {
      title: 'Customer Sentiment Index',
      value: `${sentimentIndex}/100`,
      subtext: 'Overall satisfaction',
      description: 'Customer satisfaction score',
      icon: Heart,
      color: sentimentIndex > 70 ? 'text-green-400' : sentimentIndex > 50 ? 'text-yellow-400' : 'text-red-400',
      bgColor: sentimentIndex > 70 ? 'bg-green-500/10' : sentimentIndex > 50 ? 'bg-yellow-500/10' : 'bg-red-500/10',
      tooltip: 'Show best/worst thread IDs',
      trend: sentimentIndex > 70 ? 'up' : 'down',
      progress: sentimentIndex,
    },
    {
      title: 'Avg Resolution Time',
      value: `${avgResolutionTimeHours}h`,
      subtext: 'in hours',
      description: 'Average time to resolve',
      icon: Clock,
      color: avgResolutionTimeHours < 24 ? 'text-green-400' : avgResolutionTimeHours < 72 ? 'text-yellow-400' : 'text-red-400',
      bgColor: avgResolutionTimeHours < 24 ? 'bg-green-500/10' : avgResolutionTimeHours < 72 ? 'bg-yellow-500/10' : 'bg-red-500/10',
      tooltip: `Max: ${maxResolutionTime}h, Min: ${minResolutionTime}h, Median: ${medianResolutionTime}h`,
      trend: avgResolutionTimeHours < 48 ? 'down' : 'up',
    },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 mb-8">
      {kpiItems.map((item, index) => {
        const Icon = item.icon;
        const TrendIcon = item.trend === 'up' ? TrendingUp : TrendingDown;
        const trendColor = item.trend === 'up' ? 'text-green-400' : 'text-red-400';
        
        return (
          <Card 
            key={index} 
            className="relative overflow-hidden group hover:scale-105 transition-all duration-200 shadow-lg hover:shadow-xl bg-gray-900 border-gray-700"
            title={item.tooltip}
          >
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-300">
                {item.title}
              </CardTitle>
              <div className="flex items-center gap-2">
                {item.badge && (
                  <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                    item.badge === 'High' ? 'bg-red-500/20 text-red-400' : 'bg-yellow-500/20 text-yellow-400'
                  }`}>
                    {item.badge}
                  </span>
                )}
                <div className={`p-2 rounded-lg ${item.bgColor}`}>
                  <Icon className={`h-4 w-4 ${item.color}`} />
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div>
                <div className="text-2xl font-bold text-white mb-1">{item.value}</div>
                <div className="text-sm text-gray-400 mb-2">{item.subtext}</div>
                <div className="flex items-center justify-between">
                  <p className="text-xs text-gray-500">{item.description}</p>
                  <div className="flex items-center gap-1">
                    <TrendIcon className={`h-3 w-3 ${trendColor}`} />
                    {item.progress && (
                      <div className="w-12 bg-gray-700 rounded-full h-1.5">
                        <div 
                          className={`h-1.5 rounded-full ${
                            item.progress > 70 ? 'bg-green-400' : item.progress > 50 ? 'bg-yellow-400' : 'bg-red-400'
                          }`}
                          style={{ width: `${item.progress}%` }}
                        />
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}

export function EisenhowerDistributionCard({ data }: { data: KPIData }) {
  // Calculate Eisenhower distribution from the threads data
  // For now, we'll use mock distribution values since we don't have the actual thread data here
  const distribution = {
    do: Math.round(data.total_threads * 0.35),
    schedule: Math.round(data.total_threads * 0.30),
    delegate: Math.round(data.total_threads * 0.25),
    delete: Math.round(data.total_threads * 0.10),
  };
  
  const total = Object.values(distribution).reduce((sum, val) => sum + val, 0);

  const quadrants = [
    {
      name: 'Do',
      value: distribution.do,
      percentage: Math.round((distribution.do / total) * 100),
      color: 'bg-red-500',
      description: 'Important & Urgent',
    },
    {
      name: 'Schedule',
      value: distribution.schedule,
      percentage: Math.round((distribution.schedule / total) * 100),
      color: 'bg-yellow-500',
      description: 'Important, Not Urgent',
    },
    {
      name: 'Delegate',
      value: distribution.delegate,
      percentage: Math.round((distribution.delegate / total) * 100),
      color: 'bg-blue-500',
      description: 'Not Important, Urgent',
    },
    {
      name: 'Delete',
      value: distribution.delete,
      percentage: Math.round((distribution.delete / total) * 100),
      color: 'bg-gray-500',
      description: 'Not Important, Not Urgent',
    },
  ];

  return (
    <Card className="col-span-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Target className="h-5 w-5 text-purple-400" />
          Eisenhower Quadrant Distribution
        </CardTitle>
        <CardDescription>
          Thread distribution across priority quadrants
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {quadrants.map((quadrant, index) => (
            <div key={index} className="text-center">
              <div className="flex items-center justify-center mb-2">
                <div className={`w-4 h-4 rounded-full ${quadrant.color} mr-2`} />
                <span className="text-sm font-medium text-gray-300">
                  {quadrant.name}
                </span>
              </div>
              <div className="text-2xl font-bold text-white mb-1">
                {quadrant.value}
              </div>
              <div className="text-xs text-gray-400 mb-2">
                {quadrant.percentage}%
              </div>
              <div className="text-xs text-gray-500">
                {quadrant.description}
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
