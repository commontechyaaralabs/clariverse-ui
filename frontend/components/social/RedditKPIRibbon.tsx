import type { ReactNode } from 'react';
import { RedditKPI } from '@/lib/social/reddit';
import { Card, CardContent } from '@/components/ui/card';
import {
  ArrowDownRight,
  ArrowUpRight,
  Minus,
  MessageCircle,
  Activity,
  Flame,
  ShieldCheck,
} from 'lucide-react';

interface RedditKPIRibbonProps {
  data: RedditKPI[];
}

export function RedditKPIRibbon({ data }: RedditKPIRibbonProps) {
  const iconMap: Record<string, ReactNode> = {
    'kpi-mentions': <MessageCircle className="h-5 w-5" />,
    'kpi-sentiment': <Activity className="h-5 w-5" />,
    'kpi-virality': <Flame className="h-5 w-5" />,
    'kpi-response': <ShieldCheck className="h-5 w-5" />,
  };

  const getTrendIcon = (trend: RedditKPI['trend']) => {
    if (trend === 'up') return <ArrowUpRight className="h-4 w-4 text-emerald-400" />;
    if (trend === 'down') return <ArrowDownRight className="h-4 w-4 text-red-400" />;
    return <Minus className="h-4 w-4 text-slate-400" />;
  };

  const getTrendColor = (trend: RedditKPI['trend']) => {
    if (trend === 'up') return 'text-emerald-400';
    if (trend === 'down') return 'text-red-400';
    return 'text-gray-400';
  };

  return (
    <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
      {data.map((kpi) => {
        // Show AI indicator for problematic metrics
        const showAI = kpi.trend === 'down' || 
                      (kpi.value.includes('%') && parseFloat(kpi.value) < 70) ||
                      (kpi.label.includes('Sentiment') && parseFloat(kpi.value) < 4.0);
        
        return (
          <Card
            key={kpi.id}
            className={`relative overflow-hidden group transition-all duration-300 shadow-lg hover:shadow-2xl ${
              showAI ? 'border-l-4 border-l-[#b90abd] hover:border-l-[#a009b3]' : 'hover:border-[#b90abd]/30'
            } hover:scale-[1.02] hover:-translate-y-1`}
          >
            {/* AI Sparkle Indicator */}
            {showAI && (
              <div className="absolute top-2 left-2 z-10">
                <span className="text-lg animate-pulse">✨</span>
              </div>
            )}
            
            {/* Purple glow effect on hover */}
            <div className={`absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none ${
              showAI ? 'bg-gradient-to-br from-[#b90abd]/10 via-[#b90abd]/5 to-transparent' : ''
            }`} />
            
            <CardContent className={`p-6 relative z-10 ${showAI ? 'pt-8' : ''}`}>
              <div className="flex items-start justify-between mb-4">
                <div className="text-xs uppercase tracking-wider text-slate-400 font-medium">
                  {kpi.label}
                </div>
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-[#1e293b] text-purple-400 group-hover:scale-110 transition-transform duration-200">
                  {iconMap[kpi.id] ?? <Activity className="h-5 w-5" />}
                </div>
              </div>
              <div className="mb-2">
                <div className="text-2xl font-bold text-white mb-1">{kpi.value}</div>
                <div className={`text-sm font-semibold ${getTrendColor(kpi.trend)}`}>
                  {kpi.change > 0 ? '+' : ''}{kpi.change}
                  {kpi.label.includes('Sentiment') && !kpi.label.includes('vs') ? '' : 
                   kpi.label.includes('Time') ? 'h' : '%'}
                </div>
              </div>
              <div className={`mt-3 p-2 rounded-md text-xs ${
                showAI ? 'bg-[#b90abd]/10 border border-[#b90abd]/20 text-[#b90abd]' : 'bg-gray-800/50 text-gray-400'
              }`}>
                {kpi.description}
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}

