import { XTopTweet } from '@/lib/social/x';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { MessageSquareQuote, ArrowUpCircle, BarChart3 } from 'lucide-react';

interface XCampaignColumnProps {
  topTweets: XTopTweet[];
}

export function XCampaignColumn({ topTweets }: XCampaignColumnProps) {
  const sentimentBadge = (sentiment: XTopTweet['sentiment']) => {
    switch (sentiment) {
      case 'positive':
        return 'bg-emerald-500/20 text-emerald-200 border border-emerald-500/40';
      case 'negative':
        return 'bg-red-500/20 text-red-200 border border-red-500/40';
      default:
        return 'bg-slate-500/20 text-slate-200 border border-slate-500/40';
    }
  };

  return (
    <Card className="bg-gray-900 border-gray-800">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-white text-lg">
          <MessageSquareQuote className="h-5 w-5 text-sky-400" />
          High-Impact Posts & Campaign Mentions
        </CardTitle>
        <CardDescription className="text-gray-400">
          Top organic or campaign posts driving reach for EU banking narratives
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {topTweets.map((tweet) => (
          <div
            key={tweet.id}
            className="rounded-xl border border-gray-800 bg-gray-900/60 p-4 hover:border-sky-500/40 transition-colors"
          >
            <div className="flex items-start justify-between gap-3">
              <div>
                <div className="flex items-center gap-2 text-sm text-white font-semibold">
                  {tweet.author}
                  <span className="text-xs text-gray-400 font-normal">{tweet.handle}</span>
                </div>
                <p className="mt-2 text-sm text-gray-200 leading-relaxed">{tweet.content}</p>
              </div>
              <span className={`text-[10px] uppercase tracking-wide px-2 py-0.5 rounded-full ${sentimentBadge(tweet.sentiment)}`}>
                {tweet.sentiment}
              </span>
            </div>

            <div className="mt-3 flex flex-wrap items-center gap-4 text-xs text-gray-400">
              <span className="flex items-center gap-1">
                <ArrowUpCircle className="h-4 w-4 text-sky-400" />
                {tweet.impressions.toLocaleString()} impressions
              </span>
              <span className="flex items-center gap-1">
                <BarChart3 className="h-4 w-4 text-purple-400" />
                {tweet.engagementRate}% engagement
              </span>
              <span>{tweet.postedAt}</span>
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}

