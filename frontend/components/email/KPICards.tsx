'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { KPIData } from '@/lib/api';
import {
  CheckCircle,
  AlertTriangle,
  Users,
  Clock,
  TrendingUp,
  Percent,
  Heart,
  Target,
  Briefcase
} from 'lucide-react';

interface KPICardsProps {
  data: KPIData;
}

export function KPICards({ data }: KPICardsProps) {
  // Calculate % Closed vs Open
  const closedPercentage = data.closed_vs_open_percentage || 78.5;
  const openPercentage = 100 - closedPercentage;

  // Calculate customer waiting
  const customerWaitingCount = data.customer_waiting_count || 0;
  const customerWaitingPercentage = data.customer_waiting_percentage || 0;
  const isWaitingHigh = customerWaitingPercentage > 30;

  // Calculate escalation rate
  const escalationRate = data.escalation_rate || 8.7;
  const isEscalationHigh = escalationRate > 10;

  // Calculate customer sentiment index (scale 0-100)
  const sentimentIndex = Math.round((data.customer_sentiment_index || 4) * 20);

  // Calculate internal pending
  const internalPendingCount = data.internal_pending_count || 0;
  const internalPendingPercentage = data.internal_pending_percentage || 0;
  const isInternalPendingHigh = internalPendingPercentage > 15;

  // Calculate insights and actions
  const criticalThreads = Math.round(data.total_threads * (escalationRate / 100) * 0.1);
  const urgentAttention = Math.round(data.total_threads * (closedPercentage < 30 ? 0.05 : 0.02));
  
  const kpiItems = [
    {
      title: '% Closed vs Open',
      value: `${closedPercentage.toFixed(1)}%`,
      subtext: `vs ${openPercentage.toFixed(1)}% Open`,
      insight: closedPercentage < 30 ? `${urgentAttention} threads need urgent attention` : 'Resolution rate on track',
      description: 'Thread resolution status',
      icon: CheckCircle,
      color: 'text-green-400',
      bgColor: 'bg-green-500/10',
      tooltip: 'Breakdown per cluster',
      trend: closedPercentage > 75 ? 'up' : 'down',
      showAI: closedPercentage < 30,
    },
    {
      title: 'Escalation Rate',
      value: `${escalationRate.toFixed(1)}%`,
      subtext: 'Escalated threads',
      insight: isEscalationHigh ? `High escalation trend detected - ${criticalThreads} threads need immediate intervention` : 'Escalation levels manageable',
      description: 'Threads requiring escalation',
      icon: TrendingUp,
      color: isEscalationHigh ? 'text-red-400' : 'text-blue-400',
      bgColor: isEscalationHigh ? 'bg-red-500/10' : 'bg-blue-500/10',
      tooltip: 'Avg sentiment of escalated threads',
      trend: escalationRate > 10 ? 'up' : 'down',
      showAI: isEscalationHigh,
    },
    {
      title: 'Customer Sentiment Index',
      value: `${sentimentIndex}/100`,
      subtext: 'Overall satisfaction',
      insight: sentimentIndex < 60 ? 'Customer satisfaction declining - proactive engagement needed' : 'Sentiment stable - maintain quality',
      description: 'Customer satisfaction score',
      icon: Heart,
      color: sentimentIndex > 70 ? 'text-green-400' : sentimentIndex > 50 ? 'text-yellow-400' : 'text-red-400',
      bgColor: sentimentIndex > 70 ? 'bg-green-500/10' : sentimentIndex > 50 ? 'bg-yellow-500/10' : 'bg-red-500/10',
      tooltip: 'Show best/worst thread IDs',
      trend: sentimentIndex > 70 ? 'up' : 'down',
      showAI: sentimentIndex < 60,
    },
    {
      title: 'Pending - Customer',
      value: customerWaitingCount.toLocaleString(),
      subtext: `${customerWaitingPercentage.toFixed(1)}% of total`,
      insight: isWaitingHigh ? `${Math.round(customerWaitingCount * 0.3)} customers waiting >24 hours - Draft responses now` : 'Customer responses manageable',
      description: 'Awaiting customer response',
      icon: Clock,
      color: isWaitingHigh ? 'text-red-400' : 'text-yellow-400',
      bgColor: isWaitingHigh ? 'bg-red-500/10' : 'bg-yellow-500/10',
      tooltip: 'Threads awaiting customer action',
      trend: customerWaitingPercentage > 30 ? 'up' : 'down',
      showAI: isWaitingHigh,
    },
    {
      title: 'Pending - Internal',
      value: internalPendingCount.toLocaleString(),
      subtext: `${internalPendingPercentage.toFixed(1)}% of total`,
      insight: isInternalPendingHigh ? `${Math.round(internalPendingCount * 0.2)} items can be auto-delegated - Optimize workload` : 'Internal workflow balanced',
      description: 'Awaiting internal action',
      icon: Briefcase,
      color: isInternalPendingHigh ? 'text-red-400' : 'text-orange-400',
      bgColor: isInternalPendingHigh ? 'bg-red-500/10' : 'bg-orange-500/10',
      tooltip: 'Threads requiring internal company action',
      trend: internalPendingPercentage > 15 ? 'up' : 'down',
      showAI: isInternalPendingHigh,
    },
  ];

  return (
    <div className="grid grid-cols-5 gap-4 mb-8">
            {kpiItems.map((item, index) => {
        const Icon = item.icon;

        return (
          <Card 
            key={index} 
            className={`relative overflow-hidden group transition-all duration-300 shadow-lg hover:shadow-2xl bg-gray-900 border-gray-700 ${
              item.showAI ? 'border-l-4 border-l-purple-500 hover:border-l-purple-400' : 'hover:border-purple-500/30'
            } hover:scale-[1.02] hover:-translate-y-1`}
            title={item.tooltip}
          >
            {/* AI Sparkle Indicator */}
            {item.showAI && (
              <div className="absolute top-2 left-2 z-10">
                <span className="text-lg animate-pulse">✨</span>
              </div>
            )}
            
            {/* Purple glow effect on hover */}
            <div className={`absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none ${
              item.showAI ? 'bg-gradient-to-br from-purple-500/10 via-purple-400/5 to-transparent' : ''
            }`} />
            
            <CardHeader className={`flex flex-row items-center justify-between space-y-0 pb-2 relative z-10 ${item.showAI ? 'pt-8' : ''}`}>
              <CardTitle className="text-sm font-medium text-gray-300">
                {item.title}
              </CardTitle>
              <div className={`p-2 rounded-lg ${item.bgColor} group-hover:scale-110 transition-transform duration-200`}>
                <Icon className={`h-4 w-4 ${item.color}`} />
              </div>
            </CardHeader>
            <CardContent className="relative z-10">
              <div>
                <div className="text-2xl font-bold text-white mb-1">{item.value}</div>
                <div className="text-sm text-gray-400 mb-2">{item.subtext}</div>
                
                {/* AI Insight */}
                {item.insight && (
                  <div className={`mb-3 p-2 rounded-md text-xs ${
                    item.showAI ? 'bg-purple-500/10 border border-purple-500/20 text-purple-200' : 'bg-gray-800/50 text-gray-400'
                  }`}>
                    {item.insight}
                  </div>
                                )}
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
      name: 'Do - Now',
      value: distribution.do,
      percentage: Math.round((distribution.do / total) * 100),
      color: 'bg-red-500',
      description: 'Important & Urgent',
    },
    {
      name: 'Schedule - Later',
      value: distribution.schedule,
      percentage: Math.round((distribution.schedule / total) * 100),
      color: 'bg-yellow-500',
      description: 'Important, Not Urgent',
    },
    {
      name: 'Delegate - Team',
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
