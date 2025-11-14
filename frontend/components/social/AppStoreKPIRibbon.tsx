import { AppStoreKPI } from '@/lib/social/appstore';
import { Card, CardContent } from '@/components/ui/card';
import { Star, MessageSquare, Clock, ShieldCheck } from 'lucide-react';

interface AppStoreKPIRibbonProps {
  data: AppStoreKPI[];
}

export function AppStoreKPIRibbon({ data }: AppStoreKPIRibbonProps) {
  const resolveIcon = (label: string) => {
    const normalized = label.toLowerCase();
    if (normalized.includes('rating')) return <Star className="h-5 w-5" />;
    if (normalized.includes('response')) return <MessageSquare className="h-5 w-5" />;
    if (normalized.includes('crash') || normalized.includes('stability')) return <ShieldCheck className="h-5 w-5" />;
    return <Clock className="h-5 w-5" />;
  };

  const getTrendColor = (trend: 'up' | 'down' | 'flat') => {
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
                      (kpi.label.includes('Rating') && parseFloat(kpi.value) < 4.0);
        
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
                  {resolveIcon(kpi.label)}
                </div>
              </div>
              <div className="mb-2">
                <div className="text-2xl font-bold text-white mb-1">{kpi.value}</div>
                <span className={`text-sm font-semibold ${getTrendColor(kpi.trend)}`}>
                  {kpi.change > 0 ? '+' : ''}{kpi.change}
                  {kpi.label.includes('Rating') ? '' : kpi.label.includes('Time') ? 'h' : '%'}
                </span>
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

