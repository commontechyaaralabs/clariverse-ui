import { AppStoreReviewAlert } from '@/lib/social/appstore';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { AlertTriangle, Star } from 'lucide-react';
import { Tooltip as UITooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

interface AppStoreActionColumnProps {
  alerts: AppStoreReviewAlert[];
}

const tagTone = (tag: AppStoreReviewAlert['sentimentTag']) => {
  switch (tag) {
    case 'critical':
      return 'bg-red-500/20 text-red-300 border border-red-500/40';
    case 'high':
      return 'bg-orange-500/20 text-orange-300 border border-orange-500/40';
    default:
      return 'bg-yellow-500/20 text-yellow-300 border border-yellow-500/40';
  }
};

export function AppStoreActionColumn({ alerts }: AppStoreActionColumnProps) {
  return (
    <Card className="bg-gray-900 border-gray-800 flex flex-col min-h-[420px]">
      <CardHeader className="px-6 pt-6 pb-3">
        <CardTitle className="flex items-center gap-2 text-white text-lg">
          <AlertTriangle className="h-5 w-5 text-red-400" />
          App Store Review Alerts
        </CardTitle>
        <CardDescription className="text-gray-400">
          High-impact review clusters driving rating pressure in the App Store
        </CardDescription>
      </CardHeader>
      <CardContent className="px-6 pb-6 space-y-2.5 overflow-y-auto flex-1 min-h-0 xl:max-h-[460px]">
        <TooltipProvider delayDuration={200}>
          {alerts.map(alert => (
            <UITooltip key={alert.id}>
              <TooltipTrigger asChild>
                <div className="p-3 rounded-lg border border-gray-800 bg-gray-900/60 hover:bg-gray-900 hover:border-red-500/40 transition-all cursor-pointer">
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex-1 space-y-1">
                      <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-[11px] uppercase tracking-wide text-gray-400">
                        <span>{alert.category}</span>
                        <span
                          className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] ${tagTone(alert.sentimentTag)}`}
                        >
                          {alert.sentimentTag}
                        </span>
                        <span className="flex items-center gap-1 text-xs text-yellow-300 normal-case">
                          {Array.from({ length: alert.rating }).map((_, index) => (
                            <Star key={index} className="h-3 w-3 fill-yellow-300 text-yellow-300" />
                          ))}
                          <span className="text-gray-400 ml-1 uppercase tracking-wide text-[10px]">{alert.rating}★</span>
                        </span>
                      </div>
                      <h4 className="text-sm font-semibold text-white leading-snug">{alert.title}</h4>
                      <p className="text-[10px] uppercase tracking-wide text-gray-500">Review signal</p>
                      <p className="text-xs text-gray-300 leading-snug">{alert.reviewSnippet.replace(/^“|”$/g, '')}</p>
                    </div>
                    <span className="text-[11px] text-gray-500 whitespace-nowrap">{alert.reviewCount} reviews</span>
                  </div>
                </div>
              </TooltipTrigger>
              <TooltipContent
                side="left"
                align="start"
                className="max-w-md p-4 bg-gray-900 border border-red-500/40 shadow-xl text-gray-200"
                sideOffset={10}
              >
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <h3 className="text-sm font-bold text-white">{alert.title}</h3>
                    <span className="text-xs text-purple-300 bg-purple-500/20 px-2 py-0.5 rounded">
                      App Store
                    </span>
                  </div>
                  <div className="text-xs text-gray-400 space-y-2">
                    <p>Rating: {alert.rating}★</p>
                    <p>Reviews in focus: {alert.reviewCount}</p>
                    <div>
                      <h4 className="text-[11px] uppercase tracking-wide text-gray-500">Review content</h4>
                      <p className="text-gray-300 leading-relaxed">{alert.summary}</p>
                    </div>
                  </div>
                  <div className="border-t border-gray-800 pt-2 text-xs text-gray-300 space-y-2">
                    <h4 className="text-xs font-semibold text-red-300 mb-1">Recommended Action</h4>
                    <p>{alert.recommendedAction}</p>
                  </div>
                </div>
              </TooltipContent>
            </UITooltip>
          ))}
        </TooltipProvider>
      </CardContent>
    </Card>
  );
}

