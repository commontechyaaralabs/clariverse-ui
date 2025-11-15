import { RedditTrendingThread } from '@/lib/social/reddit';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Flame, MessageSquare, ArrowUpCircle, Clock } from 'lucide-react';
import { SOCIAL_CARD_BASE, SOCIAL_PANEL_BASE } from './theme';

interface RedditContentColumnProps {
  threads: RedditTrendingThread[];
}

export function RedditContentColumn({ threads }: RedditContentColumnProps) {
  return (
    <Card className={`${SOCIAL_CARD_BASE} h-full`}>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-white text-lg">
          <Flame className="h-5 w-5 text-orange-400" />
          Trending Threads
        </CardTitle>
        <CardDescription className="text-gray-400">
          High-impact conversations in EU banking subreddits ranked by virality
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {threads.map((thread) => (
          <div key={thread.id} className={`${SOCIAL_PANEL_BASE} space-y-3`}>
            <div className="flex items-center justify-between">
              <span className="text-xs uppercase tracking-wide text-purple-300">{thread.subreddit}</span>
              {thread.flair && (
                <span className="text-[10px] uppercase tracking-wide bg-purple-500/20 border border-purple-500/40 text-purple-200 px-2 py-0.5 rounded-full">
                  {thread.flair}
                </span>
              )}
            </div>
            <h3 className="mt-2 text-sm font-semibold text-white leading-snug">{thread.title}</h3>
            <p className="mt-2 text-xs text-gray-400 leading-relaxed">{thread.summary}</p>

            <div className="flex flex-wrap items-center gap-4 text-xs text-gray-400">
              <span className="flex items-center gap-1">
                <ArrowUpCircle className={`h-4 w-4 ${thread.sentiment === 'positive' ? 'text-emerald-400' : thread.sentiment === 'negative' ? 'text-red-400' : 'text-gray-400'}`} />
                {thread.upvotes.toLocaleString()} upvotes
              </span>
              <span className="flex items-center gap-1">
                <MessageSquare className="h-4 w-4 text-blue-400" />
                {thread.comments} comments
              </span>
              <span className="flex items-center gap-1">
                <Flame className="h-4 w-4 text-orange-400" />
                Virality {thread.viralityScore}
              </span>
              <span className="flex items-center gap-1">
                <Clock className="h-4 w-4 text-gray-500" />
                {thread.postedAt}
              </span>
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}

