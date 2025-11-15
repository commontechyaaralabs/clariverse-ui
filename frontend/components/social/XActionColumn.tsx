import { XResponseAlert, XCreatorWatch } from '@/lib/social/x';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Tooltip as UITooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { Users, AlertTriangle, TrendingUp, Clock, Hash, Star, Repeat2, Eye, Heart } from 'lucide-react';
import { SOCIAL_CARD_BASE, SOCIAL_PANEL_BASE, SOCIAL_TOOLTIP_SURFACE } from './theme';

interface XActionColumnProps {
  responseAlerts: XResponseAlert[];
  creatorWatchlist: XCreatorWatch[];
}

export function XActionColumn({ responseAlerts, creatorWatchlist }: XActionColumnProps) {
  const urgencyChip = (urgency: XResponseAlert['urgency']) => {
    switch (urgency) {
      case 'critical':
        return 'bg-red-500/20 text-red-300 border border-red-500/40';
      case 'high':
        return 'bg-orange-500/20 text-orange-300 border border-orange-500/40';
      default:
        return 'bg-yellow-500/20 text-yellow-300 border border-yellow-500/40';
    }
  };

  return (
    <div className="flex flex-col gap-6 h-full min-h-0">
      <Card className={SOCIAL_CARD_BASE}>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-white text-lg">
            <AlertTriangle className="h-5 w-5 text-red-400" />
            X Viral Response Alerts
          </CardTitle>
          <CardDescription className="text-gray-400">
            Hover to review post context, reach, and recommended playbooks before responding
          </CardDescription>
        </CardHeader>
        <CardContent className="xl:max-h-[460px] xl:overflow-y-auto">
          <div className="space-y-3 pr-1">
            <TooltipProvider delayDuration={200}>
              {responseAlerts.map((alert) => (
                <UITooltip key={alert.id}>
                  <TooltipTrigger asChild>
                    <div className={`${SOCIAL_PANEL_BASE} cursor-pointer`}>
                      <div className="flex items-start justify-between gap-3 mb-2">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            {(alert.urgency === 'critical' || alert.urgency === 'high') && (
                              <span className="text-xs font-semibold text-orange-300 bg-orange-500/20 px-2 py-0.5 rounded flex items-center gap-1 uppercase tracking-wide">
                                <TrendingUp className="h-3 w-3" />
                                Viral
                              </span>
                            )}
                            <span className="text-[11px] text-gray-400 flex items-center gap-1">
                              <Clock className="h-3 w-3" />
                              {alert.firstDetected}
                            </span>
                          </div>
                          <div className="flex items-center gap-2">
                            <h4 className="text-sm font-semibold text-white">{alert.topic}</h4>
                            {alert.verified && <Star className="h-3.5 w-3.5 text-sky-300 fill-sky-300" />}
                          </div>
                          <div className="text-xs text-gray-400 flex items-center gap-2 mt-1">
                            <span className="text-gray-300 font-medium">{alert.author}</span>
                            <span>{alert.handle}</span>
                          </div>
                          <p className="text-xs text-gray-300 line-clamp-2 mt-2">{alert.summary}</p>
                        </div>
                        <span className={`text-[11px] px-2 py-0.5 rounded-full uppercase tracking-wide ${urgencyChip(alert.urgency)}`}>
                          {alert.urgency}
                        </span>
                      </div>
                      <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-xs text-gray-400">
                        <span className="flex items-center gap-1">
                          <Hash className="h-3 w-3 text-purple-300" />
                          {alert.impactedHandles} handles
                        </span>
                        <span className="flex items-center gap-1">
                          <Eye className="h-3 w-3 text-blue-300" />
                          {alert.impressions.toLocaleString()} impressions
                        </span>
                        <span className="flex items-center gap-1">
                          <Heart className="h-3 w-3 text-rose-300" />
                          {alert.likes.toLocaleString()} likes
                        </span>
                        <span className="flex items-center gap-1">
                          <Repeat2 className="h-3 w-3 text-sky-300" />
                          {alert.reposts.toLocaleString()} reposts
                        </span>
                      </div>
                    </div>
                  </TooltipTrigger>
                  <TooltipContent side="left" align="start" className={SOCIAL_TOOLTIP_SURFACE} sideOffset={10}>
                    <div className="space-y-3">
                      <div>
                        <div className="flex items-center justify-between mb-2">
                          <h3 className="text-sm font-bold text-white">{alert.topic}</h3>
                          <span className="text-xs text-sky-300 bg-sky-500/20 px-2 py-0.5 rounded">X</span>
                        </div>
                        <div className="text-[11px] text-gray-400 space-y-1">
                          <div className="flex items-center gap-2 text-gray-300">
                            <span className="font-medium">{alert.author}</span>
                            <span>{alert.handle}</span>
                            {alert.verified && (
                              <span className="inline-flex items-center gap-1 text-sky-300 text-[11px]">
                                <Star className="h-3 w-3 fill-sky-300" />
                                Verified
                              </span>
                            )}
                          </div>
                          <div>
                            First detected {alert.firstDetected} · {alert.impactedHandles} high-impact handles · Virality score {alert.viralityScore}
                          </div>
                        </div>
                      </div>

                      <div className="border-t border-white/10 pt-2">
                        <h4 className="text-xs font-semibold text-gray-300 mb-1">Live Thread Summary</h4>
                        <p className="text-xs text-gray-400 leading-relaxed">{alert.summary}</p>
                      </div>

                      <div className="border-t border-white/10 pt-2 grid grid-cols-2 gap-3 text-[11px] text-gray-300">
                        <div>
                          <span className="text-gray-400">Sentiment Level:</span>{' '}
                          <span className={alert.sentimentLevel >= 4 ? 'text-red-300 font-semibold' : 'text-yellow-300 font-semibold'}>
                            Level {alert.sentimentLevel}
                          </span>
                        </div>
                        <div>
                          <span className="text-gray-400">Trending:</span>{' '}
                          <span className={alert.trending === 'Yes' ? 'text-orange-300 font-semibold' : 'text-gray-400'}>{alert.trending}</span>
                        </div>
                        <div>
                          <span className="text-gray-400">Engagement:</span>{' '}
                          <span>{alert.likes.toLocaleString()} likes · {alert.reposts.toLocaleString()} reposts</span>
                        </div>
                        <div>
                          <span className="text-gray-400">Impressions:</span>{' '}
                          <span>{alert.impressions.toLocaleString()}</span>
                        </div>
                      </div>

                      <div className="border-t border-white/10 pt-2">
                        <h4 className="text-xs font-semibold text-red-300 mb-1">Recommended Action</h4>
                        <p className="text-xs text-gray-300 leading-relaxed">{alert.recommendedAction}</p>
                      </div>
                    </div>
                  </TooltipContent>
                </UITooltip>
              ))}
            </TooltipProvider>
          </div>
        </CardContent>
      </Card>

      <Card className={`${SOCIAL_CARD_BASE} flex flex-col flex-1 min-h-[420px]`}>
        <CardHeader className="px-6 pt-6 pb-3">
          <CardTitle className="flex items-center gap-2 text-white text-lg">
            <Users className="h-5 w-5 text-sky-400" />
            Creator Watchlist
          </CardTitle>
          <CardDescription className="text-gray-400">
            Influential voices shaping perception of EU bank experiences on X
          </CardDescription>
        </CardHeader>
        <CardContent className="px-6 pb-6 space-y-3 overflow-y-auto flex-1 min-h-0">
          {creatorWatchlist.map((creator) => (
            <div key={creator.id} className={`${SOCIAL_PANEL_BASE} space-y-3`}>
              <div className="grid grid-cols-[minmax(0,_1fr)_auto] gap-4 items-start">
                <div>
                  <h4 className="text-sm font-semibold text-white">{creator.name}</h4>
                  <p className="text-xs text-gray-400">{creator.handle}</p>
                </div>
                <div className="text-right text-xs text-gray-400 whitespace-nowrap leading-relaxed">
                  <div>{creator.followers.toLocaleString()} followers</div>
                  <div>{creator.avgEngagement}% engagement</div>
                </div>
              </div>
              <p className="text-xs text-gray-400 leading-relaxed">{creator.lastPost}</p>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}