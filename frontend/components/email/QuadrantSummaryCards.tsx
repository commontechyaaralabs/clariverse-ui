'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { QuadrantSummary } from '@/lib/api';
import { 
  Play, 
  Calendar, 
  ArrowUpRight, 
  Trash2, 
  Users, 
  TrendingUp 
} from 'lucide-react';

interface QuadrantSummaryCardsProps {
  data: QuadrantSummary[];
  onQuadrantAction?: (quadrant: string, action: string) => void;
}

const quadrantConfig = {
  do: {
    icon: Play,
    color: 'text-red-400',
    bgColor: 'bg-red-500/10',
    borderColor: 'border-red-500/20',
    description: 'High priority tasks requiring immediate action',
  },
  schedule: {
    icon: Calendar,
    color: 'text-yellow-400',
    bgColor: 'bg-yellow-500/10',
    borderColor: 'border-yellow-500/20',
    description: 'Important tasks to be scheduled for later',
  },
  delegate: {
    icon: ArrowUpRight,
    color: 'text-blue-400',
    bgColor: 'bg-blue-500/10',
    borderColor: 'border-blue-500/20',
    description: 'Urgent tasks that can be delegated to others',
  },
  delete: {
    icon: Trash2,
    color: 'text-gray-400',
    bgColor: 'bg-gray-500/10',
    borderColor: 'border-gray-500/20',
    description: 'Low priority tasks that can be eliminated',
  },
};

export function QuadrantSummaryCards({ data, onQuadrantAction }: QuadrantSummaryCardsProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
      {data.map((quadrant) => {
        const config = quadrantConfig[quadrant.quadrant];
        const Icon = config.icon;
        
        return (
          <Card 
            key={quadrant.quadrant} 
            className={`relative overflow-hidden transition-all duration-200 hover:scale-105 cursor-pointer ${config.borderColor}`}
            onClick={() => onQuadrantAction?.(quadrant.quadrant, 'view')}
          >
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <div className={`p-2 rounded-lg ${config.bgColor}`}>
                  <Icon className={`h-5 w-5 ${config.color}`} />
                </div>
                <div className="text-right">
                  <CardTitle className="text-2xl font-bold text-white">
                    {quadrant.count}
                  </CardTitle>
                  <CardDescription className="text-sm text-gray-400">
                    {quadrant.percentage}% of total
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
            
            <CardContent className="pt-0">
              <div className="space-y-3">
                <div>
                  <h4 className="font-semibold text-white capitalize mb-1">
                    {quadrant.quadrant}
                  </h4>
                  <p className="text-xs text-gray-400">
                    {config.description}
                  </p>
                </div>
                
                <div className="flex items-center justify-between text-xs text-gray-500">
                  <div className="flex items-center gap-1">
                    <Users className="h-3 w-3" />
                    <span>Threads</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <TrendingUp className="h-3 w-3" />
                    <span>{quadrant.percentage}%</span>
                  </div>
                </div>
                
              </div>
            </CardContent>
            
            {/* Progress bar */}
            <div className="absolute bottom-0 left-0 right-0 h-1 bg-gray-700">
              <div
                className={`h-full transition-all duration-500 ${config.bgColor.replace('/10', '')}`}
                style={{ width: `${quadrant.percentage}%` }}
              />
            </div>
          </Card>
        );
      })}
    </div>
  );
}

export function QuadrantStatsOverview({ data }: { data: QuadrantSummary[] }) {
  const total = data.reduce((sum, q) => sum + q.count, 0);
  const maxCount = Math.max(...data.map(q => q.count));
  
  return (
    <Card className="mb-8">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <TrendingUp className="h-5 w-5 text-purple-400" />
          Quadrant Distribution Overview
        </CardTitle>
        <CardDescription>
          Visual breakdown of thread distribution across Eisenhower quadrants
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {data.map((quadrant) => {
            const config = quadrantConfig[quadrant.quadrant];
            const widthPercentage = (quadrant.count / maxCount) * 100;
            
            return (
              <div key={quadrant.quadrant} className="space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium text-gray-300 capitalize">
                    {quadrant.quadrant}
                  </span>
                  <span className="text-sm text-gray-400">
                    {quadrant.count} threads ({quadrant.percentage}%)
                  </span>
                </div>
                <div className="w-full bg-gray-700 rounded-full h-2">
                  <div
                    className={`h-2 rounded-full transition-all duration-500 ${config.bgColor.replace('/10', '')}`}
                    style={{ width: `${widthPercentage}%` }}
                  />
                </div>
              </div>
            );
          })}
        </div>
        
        <div className="mt-6 pt-4 border-t border-gray-700">
          <div className="flex justify-between items-center text-sm">
            <span className="text-gray-400">Total Threads</span>
            <span className="text-white font-semibold">{total}</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
