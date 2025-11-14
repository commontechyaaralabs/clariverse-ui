import { XKPI } from '@/lib/social/x';
import { Card, CardContent } from '@/components/ui/card';
import {
  Star,
  MessageSquare,
  Clock,
  TrendingUp,
  TrendingDown,
  Activity,
} from 'lucide-react';

interface XKPIRibbonProps {
  data: XKPI[];
}

export function XKPIRibbon({ data }: XKPIRibbonProps) {
  const resolveIcon = (id: string) => {
    switch (id) {
      case 'x-rating':
        return <Star className="h-5 w-5 fill-yellow-400" />;
      case 'x-replied':
        return <MessageSquare className="h-5 w-5" />;
      case 'x-response-time':
        return <Clock className="h-5 w-5" />;
      case 'x-sentiment':
        return <Activity className="h-5 w-5" />;
      default:
        return <Activity className="h-5 w-5" />;
    }
  };

  const colorForTrend = (trend: XKPI['trend']) => {
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
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-[#1e293b] text-sky-400 group-hover:scale-110 transition-transform duration-200">
                  {resolveIcon(kpi.id)}
                </div>
              </div>
              <div className="mb-4">
                <div className="text-4xl font-bold text-white mb-2">{kpi.value}</div>
                <div className="text-sm text-slate-400">
                  {kpi.id === 'x-rating' && 'Weighted sentiment score'}
                  {kpi.id === 'x-replied' && `vs ${100 - parseInt(kpi.value)}% Not Replied`}
                  {kpi.id === 'x-response-time' && 'Average response time'}
                  {kpi.id === 'x-sentiment' && `vs ${(100 - parseFloat(kpi.value)).toFixed(1)}% Negative`}
                </div>
              </div>
              <div className={`p-3 rounded-md text-xs leading-relaxed ${
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
