import { RedditInfluencer, RedditModerationAlert } from '@/lib/social/reddit';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Users, AlertTriangle, Hash, MessageSquare, ThumbsUp, Eye, Clock, Star } from 'lucide-react';
import { Tooltip as UITooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

interface RedditActionColumnProps {
  moderationAlerts: RedditModerationAlert[];
  influencers: RedditInfluencer[];
}

export function RedditActionColumn({ moderationAlerts, influencers }: RedditActionColumnProps) {
  return (
    <div className="flex flex-col gap-6 h-full min-h-0">
      <Card className="bg-gray-900 border-gray-800">
        <CardHeader className="px-6 pt-6 pb-3">
          <CardTitle className="flex items-center gap-2 text-white text-lg">
            <AlertTriangle className="h-5 w-5 text-red-400" />
            Reddit Moderation Alerts
          </CardTitle>
          <CardDescription className="text-gray-400">
            High-velocity reports and policy-sensitive conversations pulled directly from Reddit mod queues
          </CardDescription>
        </CardHeader>
        <CardContent className="px-6 pb-6 space-y-3 xl:max-h-[460px] xl:overflow-y-auto">
          <TooltipProvider delayDuration={200}>
            {moderationAlerts.map(alert => (
              <UITooltip key={alert.id}>
                <TooltipTrigger asChild>
                  <div className="p-4 rounded-lg border border-gray-800 bg-gray-900/60 hover:bg-gray-900 hover:border-red-500/40 transition-all cursor-pointer">
                    <div className="flex items-start justify-between gap-3 mb-2">
                      <div className="flex-1 space-y-1.5">
                        <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-[11px] text-gray-400 uppercase tracking-wide">
                          <span>r/{alert.type}</span>
                          {(alert.severity === 'critical' || alert.severity === 'high') && (
                            <span className="text-orange-300">priority</span>
                          )}
                          <span className="flex items-center gap-1 text-gray-400 normal-case">
                            <Clock className="h-3 w-3" />
                            {alert.detectedAt} · {alert.firstDetected}
                          </span>
                        </div>
                        <h4 className="text-sm font-semibold text-white">{alert.topic}</h4>
                        <div className="text-xs text-gray-400 flex items-center gap-2">
                          <span className="text-gray-300 font-medium">{alert.author}</span>
                          <span>{alert.handle}</span>
                          {alert.verified && <Star className="h-3 w-3 text-sky-300 fill-sky-300" />}
                        </div>
                        <p className="text-xs text-gray-300 leading-relaxed line-clamp-2">{alert.summary}</p>
                      </div>
                      <span
                        className={`text-[11px] px-2 py-0.5 rounded-full uppercase tracking-wide ${
                          alert.severity === 'critical'
                            ? 'bg-red-500/20 text-red-300 border border-red-500/40'
                            : alert.severity === 'high'
                            ? 'bg-orange-500/20 text-orange-300 border border-orange-500/40'
                            : 'bg-yellow-500/20 text-yellow-300 border border-yellow-500/40'
                        }`}
                      >
                        {alert.severity}
                      </span>
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
                    <div className="flex items-center justify-between gap-3">
                      <h3 className="text-sm font-bold text-white leading-snug">{alert.topic}</h3>
                      <span className="text-xs text-purple-300 bg-purple-500/20 px-2 py-0.5 rounded">Reddit</span>
                    </div>
                    <div className="text-xs text-gray-400 space-y-1">
                      <div className="flex items-center gap-2 text-gray-300">
                        <span className="font-semibold text-white">{alert.author}</span>
                        <span>{alert.handle}</span>
                        {alert.verified && (
                          <span className="inline-flex items-center gap-1 text-sky-300">
                            <Star className="h-3 w-3 fill-sky-300" />
                            Verified
                          </span>
                        )}
                      </div>
                      <p>First detected {alert.detectedAt} · {alert.firstDetected}</p>
                      <p>Moderation type: {alert.type}</p>
                      <p>Severity: {alert.severity}</p>
                      <p>{alert.summary}</p>
                    </div>
                    <div className="grid grid-cols-2 gap-3 text-[11px] text-gray-300 border-t border-gray-800 pt-2">
                      <div>
                        <span className="text-gray-400">Threads flagged:</span>{' '}
                        <span>{(alert.flaggedCount ?? 0).toLocaleString()}</span>
                      </div>
                      <div>
                        <span className="text-gray-400">Subs impacted:</span>{' '}
                        <span>{alert.impactedCommunities}</span>
                      </div>
                      <div>
                        <span className="text-gray-400">Impressions:</span>{' '}
                        <span>{(alert.impressions ?? 0).toLocaleString()}</span>
                      </div>
                      <div>
                        <span className="text-gray-400">Engagement:</span>{' '}
                        <span>
                          {(alert.upvotes ?? 0).toLocaleString()} upvotes · {(alert.comments ?? 0).toLocaleString()} comments
                        </span>
                      </div>
                      <div>
                        <span className="text-gray-400">Trending:</span>{' '}
                        <span className={alert.trending === 'yes' ? 'text-orange-300 font-semibold' : 'text-gray-400'}>
                          {alert.trending === 'yes' ? 'Yes' : 'No'}
                        </span>
                      </div>
                    </div>
                    <div className="border-t border-gray-800 pt-2 space-y-2 text-xs text-gray-300">
                      <h4 className="text-xs font-semibold text-red-300">Recommended Action</h4>
                      <p>{alert.recommendedAction}</p>
                    </div>
                  </div>
                </TooltipContent>
              </UITooltip>
            ))}
          </TooltipProvider>
        </CardContent>
      </Card>

      <Card className="bg-gray-900 border-gray-800 flex flex-col flex-1 min-h-[420px]">
        <CardHeader className="px-6 pt-6 pb-3">
          <CardTitle className="flex items-center gap-2 text-white text-lg">
            <Users className="h-5 w-5 text-purple-400" />
            Influencer & Watchlist Accounts
          </CardTitle>
          <CardDescription className="text-gray-400">
            Monitor high-reach Redditors shaping sentiment around EU banking topics
          </CardDescription>
        </CardHeader>
        <CardContent className="px-6 pb-6 space-y-3 overflow-y-auto flex-1 min-h-0">
          {influencers.map(profile => (
            <div key={profile.id} className="rounded-lg border border-gray-800 bg-gray-900/60 p-4 space-y-3">
              <div className="grid grid-cols-[minmax(0,_1fr)_auto] gap-4 items-start">
                <div>
                  <p className="text-sm font-semibold text-white">u/{profile.username}</p>
                  <p className="text-xs text-gray-400 capitalize">{profile.sentiment}</p>
                </div>
                <div className="text-right text-xs text-gray-400 whitespace-nowrap leading-relaxed">
                  <div>{profile.karma.toLocaleString()} karma</div>
                  <div>{profile.followers.toLocaleString()} followers</div>
                </div>
              </div>
              <p className="text-xs text-gray-400 leading-relaxed">{profile.lastPostSummary}</p>
              <div className="flex items-center justify-between text-xs text-gray-400">
                <span>Engagement rate: {profile.engagementRate}%</span>
                {profile.watchlist && (
                  <span className="text-red-400 text-[11px] uppercase tracking-wide">Watch closely</span>
                )}
              </div>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}
