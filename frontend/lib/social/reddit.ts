export type RedditTrendDirection = 'up' | 'down' | 'flat';

export interface RedditKPI {
  id: string;
  label: string;
  value: string;
  change: number;
  trend: RedditTrendDirection;
  description: string;
}

export interface RedditSentimentBreakdown {
  topic: string;
  positive: number;
  neutral: number;
  negative: number;
  change: number;
}

export type RedditMomentumType = 'risk' | 'neutral' | 'advocacy';

export interface RedditTrendingThread {
  id: string;
  subreddit: string;
  flair?: string;
  title: string;
  summary: string;
  sentiment: 'positive' | 'neutral' | 'negative';
  upvotes: number;
  comments: number;
  viralityScore: number;
  postedAt: string;
}

export interface RedditCommunitySignal {
  subreddit: string;
  signalLabel: string;
  momentumType: RedditMomentumType;
  growthPercent: number;
  trend: RedditTrendDirection;
  change: number;
  threadVolume: number;
  insight: string;
  topMentions?: string[];
}

export interface RedditModerationAlert {
  id: string;
  topic: string;
  type: 'compliance' | 'security' | 'support' | 'fraud';
  severity: 'critical' | 'high' | 'medium';
  author: string;
  handle: string;
  verified: boolean;
  firstDetected: string;
  detectedAt: string;
  impactedCommunities: number;
  impressions: number;
  upvotes: number;
  comments: number;
  trending: 'yes' | 'no';
  responseWindow: string;
  summary: string;
  recommendedAction: string;
  flaggedCount: number;
}

export interface RedditInfluencer {
  id: string;
  username: string;
  karma: number;
  followers: number;
  sentiment: 'advocate' | 'neutral' | 'detractor';
  lastPostSummary: string;
  engagementRate: number;
  watchlist: boolean;
}

export const REDDIT_SENTIMENT_LEVELS = [
  { key: 'level1', label: '1 • Supportive', short: 'Supportive', color: '#22c55e' },
  { key: 'level2', label: '2 • Curious', short: 'Curious', color: '#38bdf8' },
  { key: 'level3', label: '3 • Neutral', short: 'Neutral', color: '#9CA3AF' },
  { key: 'level4', label: '4 • Heated', short: 'Heated', color: '#f97316' },
  { key: 'level5', label: '5 • Critical', short: 'Critical', color: '#ef4444' },
] as const;

export type RedditSentimentLevelKey = (typeof REDDIT_SENTIMENT_LEVELS)[number]['key'];

export interface RedditViralityTopic {
  name: string;
  viralityScore: number;
  highImpactThreads: number;
  level1: number;
  level2: number;
  level3: number;
  level4: number;
  level5: number;
}

export interface RedditComplianceFeatureTopic {
  name: string;
  totalThreads: number;
  helpfulVotes: number;
  dominantSentiment: RedditSentimentLevelKey;
  wordCloud?: Array<{ term: string; weight: number }>;
}

export interface RedditComplianceFeatureSummary {
  key: 'moderation' | 'feature' | 'appreciation';
  label: string;
  totalTopics: number;
  totalThreads: number;
  totalHelpfulVotes: number;
  dominantSentiment: RedditSentimentLevelKey;
  topics: RedditComplianceFeatureTopic[];
}

export interface RedditComplianceFeatureDataset {
  summaries: RedditComplianceFeatureSummary[];
}

export interface RedditSentimentAreaPoint {
  level: string;
  moderation: number;
  feature: number;
  appreciation: number;
}

export interface RedditSentimentLevelTimelinePoint {
  date: string;
  level1: number;
  level2: number;
  level3: number;
  level4: number;
  level5: number;
  threadVolume: number;
}

export function getRedditKPIs(): RedditKPI[] {
  return [
    {
      id: 'reddit-rating',
      label: 'Average Sentiment',
      value: '4.1',
      change: 0.3,
      trend: 'up',
      description: 'Weighted sentiment score (1-5 scale) across EU banking subreddits',
    },
    {
      id: 'reddit-replied',
      label: 'Replied vs Not Replied',
      value: '71%',
      change: 9,
      trend: 'up',
      description: '156 threads need responses – prioritize high-upvote posts',
    },
    {
      id: 'reddit-response-time',
      label: 'Average Response Time',
      value: '2.4h',
      change: -0.6,
      trend: 'up',
      description: 'Response time within target – maintain playbooks',
    },
    {
      id: 'reddit-sentiment',
      label: 'Positive vs Negative',
      value: '78.6%',
      change: 3.1,
      trend: 'up',
      description: '94 negative threads need attention – focus on top issues',
    },
  ];
}

export function getRedditSentimentBreakdown(): RedditSentimentBreakdown[] {
  return [
    { topic: 'SEPA transfer delays', positive: 22, neutral: 18, negative: 60, change: -7 },
    { topic: 'Mortgage repricing', positive: 35, neutral: 24, negative: 41, change: 5 },
    { topic: 'Mobile app crashes', positive: 14, neutral: 20, negative: 66, change: -3 },
    { topic: 'Sustainable finance offers', positive: 62, neutral: 28, negative: 10, change: 11 },
    { topic: 'PSD2 authentication', positive: 18, neutral: 32, negative: 50, change: -2 },
  ];
}

export function getRedditCommunitySignals(): RedditCommunitySignal[] {
  return [
    {
      subreddit: 'r/EuroBanking',
      signalLabel: 'Trustpilot spillover',
      momentumType: 'risk',
      growthPercent: 31,
      trend: 'up',
      change: 8,
      threadVolume: 186,
      insight: 'Increasing cross-platform amplification of negative Trustpilot reviews into r/EuroBanking.',
      topMentions: ['trustpilot', 'fee-transparency', 'customer-care'],
    },
    {
      subreddit: 'r/EuropeanFinance',
      signalLabel: 'EU policy chatter',
      momentumType: 'neutral',
      growthPercent: 19,
      trend: 'flat',
      change: 0,
      threadVolume: 142,
      insight: 'Stable volume around ECB rate speculation threads.',
      topMentions: ['ecb', 'rate-hike', 'monetary-policy'],
    },
    {
      subreddit: 'r/EUFintech',
      signalLabel: 'CX advocacy',
      momentumType: 'advocacy',
      growthPercent: 27,
      trend: 'up',
      change: 6,
      threadVolume: 96,
      insight: 'Positive stories about sustainable finance coaches driving advocacy.',
      topMentions: ['sustainable-finance', 'coaching', 'mobile-app'],
    },
    {
      subreddit: 'r/BankingTech',
      signalLabel: 'Fraud escalation',
      momentumType: 'risk',
      growthPercent: 12,
      trend: 'down',
      change: -4,
      threadVolume: 58,
      insight: 'Reduction in card cloning complaints after MFA comms rollout.',
      topMentions: ['mfa', 'card-cloning', 'fraud-watch'],
    },
  ];
}

export function getRedditModerationAlerts(): RedditModerationAlert[] {
  return [
    {
      id: 'alert-1',
      topic: 'Cross-border fee transparency AMA',
      type: 'compliance',
      severity: 'high',
      author: 'EuroBank IntelliOps',
      handle: 'u/EuroBankOps',
      verified: true,
      detectedAt: 'Today',
      firstDetected: '08:40 CET',
      impactedCommunities: 7,
      impressions: 94000,
      upvotes: 5200,
      comments: 860,
      trending: 'yes',
      responseWindow: 'Respond within 12h',
      summary: 'High traction AMA challenging EuroBank FX markups versus EU regulations.',
      recommendedAction: 'Coordinate with legal & publish fee comparison explainer within 12 hours.',
      flaggedCount: 37,
    },
    {
      id: 'alert-2',
      topic: 'Suspicious loan offer DM campaign',
      type: 'fraud',
      severity: 'critical',
      author: 'PSD2 Dev Guild',
      handle: 'u/psd2guild',
      verified: false,
      detectedAt: 'Today',
      firstDetected: '07:55 CET',
      impactedCommunities: 5,
      impressions: 128000,
      upvotes: 7800,
      comments: 1360,
      trending: 'yes',
      responseWindow: 'Immediate response required',
      summary: 'Users receiving phishing DMs impersonating EuroBank wealth advisors.',
      recommendedAction: 'Push warning sticky across r/EuroBanking and alert fraud response squad.',
      flaggedCount: 22,
    },
    {
      id: 'alert-3',
      topic: 'Mortgage retention backlash',
      type: 'support',
      severity: 'medium',
      author: 'Customer Retention Mods',
      handle: 'u/EuroBankCareTeam',
      verified: false,
      detectedAt: 'Yesterday',
      firstDetected: '19:20 CET',
      impactedCommunities: 3,
      impressions: 41000,
      upvotes: 2100,
      comments: 540,
      trending: 'no',
      responseWindow: 'Respond within 24h',
      summary: 'Long-term customers complaining about EuroBank renewal call centre wait times.',
      recommendedAction: 'Escalate to CX ops; provide callback slots & moderator update.',
      flaggedCount: 18,
    },
    {
      id: 'alert-4',
      topic: 'PSD2 re-authentication complaint megathread',
      type: 'support',
      severity: 'high',
      author: 'SME Council',
      handle: 'u/SMEvoicesEU',
      verified: true,
      detectedAt: 'Today',
      firstDetected: '09:05 CET',
      impactedCommunities: 6,
      impressions: 76000,
      upvotes: 4600,
      comments: 980,
      trending: 'yes',
      responseWindow: 'Respond within 8h',
      summary: 'SME owners in EU markets reporting repeated PSD2 prompts after EuroBank portal update.',
      recommendedAction: 'Issue product update comment, collect browser debug logs, and share roadmap excerpt.',
      flaggedCount: 29,
    },
    {
      id: 'alert-5',
      topic: 'Branch cash withdrawal limits discussion',
      type: 'compliance',
      severity: 'medium',
      author: 'Italy Retail Ops',
      handle: 'u/EuroBankItalia',
      verified: false,
      detectedAt: 'Today',
      firstDetected: '06:45 CET',
      impactedCommunities: 4,
      impressions: 52000,
      upvotes: 3100,
      comments: 720,
      trending: 'no',
      responseWindow: 'Respond within 18h',
      summary: 'r/EuroBanking thread questioning EuroBank Italy cash withdrawal caps versus ECB guidance.',
      recommendedAction: 'Provide policy clarification with regional branch limits and escalate to policy comms.',
      flaggedCount: 16,
    },
  ];
}

export function getRedditInfluencers(): RedditInfluencer[] {
  return [
    {
      id: 'infl-1',
      username: 'EuroFinMaria',
      karma: 58200,
      followers: 4200,
      sentiment: 'advocate',
      lastPostSummary: 'Shared positive walkthrough of instant SEPA pilot in Spain.',
      engagementRate: 4.2,
      watchlist: false,
    },
    {
      id: 'infl-2',
      username: 'PSD2Skeptic',
      karma: 31210,
      followers: 1900,
      sentiment: 'detractor',
      lastPostSummary: 'Highlighting MFA friction for business accounts.',
      engagementRate: 5.8,
      watchlist: true,
    },
    {
      id: 'infl-3',
      username: 'GreenYield',
      karma: 22110,
      followers: 2500,
      sentiment: 'advocate',
      lastPostSummary: 'Promoting sustainable savings bundle and carbon offset tracking.',
      engagementRate: 3.9,
      watchlist: false,
    },
  ];
}

export function getRedditViralityTopics(): RedditViralityTopic[] {
  return [
    { name: 'SEPA transfer delays', viralityScore: 512, highImpactThreads: 186, level1: 6, level2: 12, level3: 28, level4: 32, level5: 22 },
    { name: 'Mortgage retention backlash', viralityScore: 468, highImpactThreads: 154, level1: 8, level2: 15, level3: 26, level4: 29, level5: 22 },
    { name: 'PSD2 re-auth friction', viralityScore: 437, highImpactThreads: 132, level1: 5, level2: 11, level3: 24, level4: 31, level5: 29 },
    { name: 'Green savings success stories', viralityScore: 372, highImpactThreads: 118, level1: 34, level2: 28, level3: 22, level4: 10, level5: 6 },
    { name: 'Mobile app stability', viralityScore: 341, highImpactThreads: 104, level1: 12, level2: 21, level3: 30, level4: 24, level5: 13 },
    { name: 'KYC verification queues', viralityScore: 296, highImpactThreads: 97, level1: 10, level2: 19, level3: 27, level4: 25, level5: 19 },
    { name: 'Cross-border fee transparency', viralityScore: 284, highImpactThreads: 91, level1: 9, level2: 18, level3: 25, level4: 26, level5: 22 },
    { name: 'Sustainable project funding', viralityScore: 244, highImpactThreads: 78, level1: 31, level2: 26, level3: 23, level4: 12, level5: 8 },
    { name: 'Community bug reports', viralityScore: 218, highImpactThreads: 72, level1: 14, level2: 20, level3: 29, level4: 22, level5: 15 },
    { name: 'Savings automation tips', viralityScore: 198, highImpactThreads: 65, level1: 37, level2: 29, level3: 21, level4: 9, level5: 4 },
  ];
}

export function getRedditComplianceFeatureDataset(): RedditComplianceFeatureDataset {
  return {
    summaries: [
      {
        key: 'moderation',
        label: 'Moderation Hotspots',
        totalTopics: 3,
        totalThreads: 1_420,
        totalHelpfulVotes: 408,
        dominantSentiment: 'level5',
        topics: [
          {
            name: 'Cross-border fee transparency AMA',
            totalThreads: 520,
            helpfulVotes: 152,
            dominantSentiment: 'level5',
          },
          {
            name: 'PSD2 verification fatigue',
            totalThreads: 470,
            helpfulVotes: 138,
            dominantSentiment: 'level4',
          },
          {
            name: 'Mortgage retention wait times',
            totalThreads: 430,
            helpfulVotes: 118,
            dominantSentiment: 'level4',
          },
        ],
      },
      {
        key: 'feature',
        label: 'Feature Requests & Enhancements',
        totalTopics: 3,
        totalThreads: 1_060,
        totalHelpfulVotes: 346,
        dominantSentiment: 'level2',
        topics: [
          {
            name: 'Smart budgeting automations',
            totalThreads: 360,
            helpfulVotes: 118,
            dominantSentiment: 'level2',
            wordCloud: [
              { term: 'subscription tracking', weight: 10 },
              { term: 'bill forecast', weight: 9 },
              { term: 'AI tips', weight: 8 },
            ],
          },
          {
            name: 'Instant card freeze rules',
            totalThreads: 340,
            helpfulVotes: 112,
            dominantSentiment: 'level3',
            wordCloud: [
              { term: 'merchant limits', weight: 9 },
              { term: 'travel profile', weight: 8 },
              { term: 'joint controls', weight: 7 },
            ],
          },
          {
            name: 'Multi-currency travel wallets',
            totalThreads: 360,
            helpfulVotes: 116,
            dominantSentiment: 'level1',
            wordCloud: [
              { term: 'fee free atm', weight: 9 },
              { term: 'auto convert', weight: 8 },
              { term: 'insurance bundle', weight: 7 },
            ],
          },
        ],
      },
      {
        key: 'appreciation',
        label: 'Community Appreciation Highlights',
        totalTopics: 3,
        totalThreads: 820,
        totalHelpfulVotes: 284,
        dominantSentiment: 'level1',
        topics: [
          {
            name: 'Savings goals success wall',
            totalThreads: 290,
            helpfulVotes: 102,
            dominantSentiment: 'level1',
            wordCloud: [
              { term: 'debt free', weight: 10 },
              { term: 'milestone share', weight: 9 },
              { term: 'celebration post', weight: 8 },
            ],
          },
          {
            name: 'Support hero shout-outs',
            totalThreads: 268,
            helpfulVotes: 96,
            dominantSentiment: 'level1',
            wordCloud: [
              { term: 'overnight fix', weight: 9 },
              { term: 'proactive dm', weight: 8 },
              { term: 'thank you thread', weight: 7 },
            ],
          },
          {
            name: 'Green savings impact stories',
            totalThreads: 262,
            helpfulVotes: 86,
            dominantSentiment: 'level2',
            wordCloud: [
              { term: 'solar panels', weight: 9 },
              { term: 'carbon offset', weight: 8 },
              { term: 'community garden', weight: 7 },
            ],
          },
        ],
      },
    ],
  };
}

export function getRedditComplianceFeatureAreaData(): RedditSentimentAreaPoint[] {
  return [
    { level: '1 • Happy', moderation: 10, feature: 32, appreciation: 74 },
    { level: '2 • Bit Irritated', moderation: 14, feature: 28, appreciation: 0 },
    { level: '3 • Moderately Concerned', moderation: 27, feature: 20, appreciation: 0 },
    { level: '4 • Anger', moderation: 30, feature: 14, appreciation: 0 },
    { level: '5 • Frustrated', moderation: 19, feature: 6, appreciation: 0 },
  ];
}

export function getRedditSentimentLevelTimeline(): RedditSentimentLevelTimelinePoint[] {
  const today = new Date();
  return Array.from({ length: 14 }).map((_, index) => {
    const date = new Date(today);
    const offset = 13 - index;
    date.setDate(today.getDate() - offset);

    const baseVolume = 140 + Math.sin(index * 0.45) * 35;
    const threadVolume = Math.max(110, Math.round(baseVolume + Math.cos(index * 0.3) * 20));

    const level1 = Math.max(10, Math.round(threadVolume * (0.18 + Math.sin(index * 0.4) * 0.04)));
    const level2 = Math.max(12, Math.round(threadVolume * (0.21 + Math.cos(index * 0.35) * 0.03)));
    const level3 = Math.max(15, Math.round(threadVolume * (0.27 + Math.sin(index * 0.3) * 0.02)));
    const level4 = Math.max(18, Math.round(threadVolume * (0.22 + Math.cos(index * 0.25) * 0.035)));
    const level5 = Math.max(10, Math.round(threadVolume * (0.12 + Math.sin(index * 0.33) * 0.03)));

    const totalAssigned = level1 + level2 + level3 + level4 + level5;
    const adjustment = threadVolume - totalAssigned;

    return {
      date: date.toISOString().split('T')[0],
      level1,
      level2,
      level3,
      level4,
      level5: level5 + adjustment,
      threadVolume,
    };
  });
}

