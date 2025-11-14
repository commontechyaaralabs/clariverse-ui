export type Trend = 'up' | 'down' | 'flat';

export interface XKPI {
  id: string;
  label: string;
  value: string;
  change: number;
  trend: Trend;
  description: string;
}

export interface XSentimentPoint {
  timestamp: string;
  positive: number;
  neutral: number;
  negative: number;
}

export interface XHashtagTrend {
  hashtag: string;
  growthPercent: number;
  volume: number;
  sentiment: 'positive' | 'neutral' | 'negative';
  summary: string;
}

export interface XConversationCluster {
  topic: string;
  share: number;
  growth: number;
  summary: string;
}

export interface XTrendingPost {
  id: string;
  author: string;
  handle: string;
  verified: boolean;
  text: string;
  impressions: number;
  likes: number;
  reposts: number;
  sentiment: 'positive' | 'neutral' | 'negative';
  postedAt: string;
}

export interface XTopTweet {
  id: string;
  author: string;
  handle: string;
  content: string;
  sentiment: 'positive' | 'neutral' | 'negative';
  impressions: number;
  engagementRate: number;
  postedAt: string;
}

export interface XResponseAlert {
  id: string;
  topic: string;
  urgency: 'critical' | 'high' | 'medium';
  summary: string;
  recommendedAction: string;
  impactedHandles: number;
  firstDetected: string;
  author: string;
  handle: string;
  verified: boolean;
  starRating: number;
  sentimentLevel: number;
  viralityScore: number;
  trending: 'Yes' | 'No';
  likes: number;
  reposts: number;
  impressions: number;
}

export interface XCreatorWatch {
  id: string;
  name: string;
  handle: string;
  followers: number;
  avgEngagement: number;
  sentiment: 'ally' | 'neutral' | 'critic';
  lastPost: string;
  watchStatus: 'monitor' | 'engage' | 'sustain';
}

export const X_SENTIMENT_LEVELS = [
  { key: 'level1', label: '1 • Happy', short: 'Happy', color: '#22c55e' },
  { key: 'level2', label: '2 • Bit Irritated', short: 'Bit Irritated', color: '#3b82f6' },
  { key: 'level3', label: '3 • Moderately Concerned', short: 'Moderately Concerned', color: '#9CA3AF' },
  { key: 'level4', label: '4 • Anger', short: 'Anger', color: '#f97316' },
  { key: 'level5', label: '5 • Frustrated', short: 'Frustrated', color: '#ef4444' },
] as const;

export type XViralitySentimentLevel = (typeof X_SENTIMENT_LEVELS)[number]['key'];

export interface XViralityTopic {
  name: string;
  viralityScore: number;
  views: number;
  likes: number;
  level1: number;
  level2: number;
  level3: number;
  level4: number;
  level5: number;
}

export interface XFeatureWordCloudEntry {
  term: string;
  weight: number;
}

export interface XFeatureTopic {
  name: string;
  totalPosts: number;
  helpfulVotes: number;
  dominantSentiment: {
    key: (typeof X_SENTIMENT_LEVELS)[number]['key'];
    label: string;
    value?: number;
  };
  wordCloud?: XFeatureWordCloudEntry[];
}

export interface XFeatureSummary {
  key: 'compliance' | 'feature' | 'appreciation';
  label: string;
  totalTopics: number;
  totalPosts: number;
  totalHelpfulVotes: number;
  dominantSentiment: {
    key: (typeof X_SENTIMENT_LEVELS)[number]['key'];
    label: string;
  };
  topics: XFeatureTopic[];
}

export interface XComplianceFeatureDataset {
  summaries: XFeatureSummary[];
}

export interface XSentimentAreaPoint {
  level: string;
  compliance: number;
  feature: number;
  appreciation: number;
}

export interface XSentimentLevelTimelinePoint {
  date: string;
  level1: number;
  level2: number;
  level3: number;
  level4: number;
  level5: number;
  tweetVolume: number;
}

export function getXKPIs(): XKPI[] {
  return [
    {
      id: 'x-rating',
      label: 'Average Sentiment',
      value: '3.8',
      change: -0.2,
      trend: 'down',
      description: 'Weighted sentiment score (1-5 scale) across EU banking mentions',
    },
    {
      id: 'x-replied',
      label: 'Replied vs Not Replied',
      value: '63%',
      change: 5,
      trend: 'down',
      description: '284 mentions need responses – prioritize critical complaints',
    },
    {
      id: 'x-response-time',
      label: 'Average Response Time',
      value: '42m',
      change: -8,
      trend: 'up',
      description: 'Response time within target – maintain playbooks',
    },
    {
      id: 'x-sentiment',
      label: 'Positive vs Negative',
      value: '72.4%',
      change: -1.6,
      trend: 'down',
      description: '189 negative posts need attention – focus on top issues',
    },
  ];
}

export function getXSentimentTimeline(): XSentimentPoint[] {
  const today = new Date();
  return Array.from({ length: 7 }).map((_, index) => {
    const date = new Date(today);
    const offset = 6 - index;
    date.setDate(today.getDate() - offset);

    const basePositive = 34;
    const baseNeutral = 30;
    const baseNegative = 36;

    return {
      timestamp: date.toLocaleDateString('en-GB', { month: 'short', day: 'numeric' }),
      positive: Math.round(basePositive + index * 1.8),
      neutral: Math.round(baseNeutral - index * 0.8),
      negative: Math.round(baseNegative - index * 1.2),
    };
  });
}

export function getXHashtagTrends(): XHashtagTrend[] {
  return [
    {
      hashtag: '#SEPAStorm',
      growthPercent: 42,
      volume: 1280,
      sentiment: 'negative',
      summary: 'Delay complaints for cross-border payroll transfers trending in Germany + Italy.',
    },
    {
      hashtag: '#GreenSavings',
      growthPercent: 31,
      volume: 940,
      sentiment: 'positive',
      summary: 'Influencers praising sustainable finance savings boosters.',
    },
    {
      hashtag: '#PSD2Pain',
      growthPercent: 18,
      volume: 760,
      sentiment: 'negative',
      summary: 'Developers venting about repeated strong customer authentication prompts.',
    },
    {
      hashtag: '#BankInApp',
      growthPercent: 12,
      volume: 620,
      sentiment: 'neutral',
      summary: 'Product updates around instant card freeze/unfreeze features.',
    },
  ];
}

export function getXConversationClusters(): XConversationCluster[] {
  return [
    {
      topic: 'Payment reliability',
      share: 28,
      growth: 9,
      summary: 'Outage chatter concentrated on DE/FR commuters referencing missed wages.',
    },
    {
      topic: 'Mortgage repricing',
      share: 18,
      growth: -4,
      summary: 'Renewal strategies being compared with Nordic challenger banks.',
    },
    {
      topic: 'Digital trust & security',
      share: 22,
      growth: 6,
      summary: 'MFA fatigue + PSD2 flows driving security conversations.',
    },
    {
      topic: 'Climate finance advocacy',
      share: 14,
      growth: 11,
      summary: 'Positive momentum around eco-loan incentives and carbon dashboards.',
    },
  ];
}

export function getXTrendingPosts(): XTrendingPost[] {
  return [
    {
      id: 'tweet-1',
      author: 'Elena Rossi',
      handle: '@elenafintech',
      verified: true,
      text: 'Day 3 waiting on a SEPA payment from 🇩🇪 to 🇮🇹. Anyone else seeing lag with @EuroBank? #SEPAStorm',
      impressions: 1_800_000,
      likes: 12400,
      reposts: 3800,
      sentiment: 'negative',
      postedAt: '2h ago',
    },
    {
      id: 'tweet-2',
      author: 'Climate Capital',
      handle: '@climate_capital',
      verified: false,
      text: 'Credit where its due – @EuroBank green savings coach is best-in-class. Clear steps, real impact. 🌱 #GreenSavings',
      impressions: 920000,
      likes: 8800,
      reposts: 2100,
      sentiment: 'positive',
      postedAt: '5h ago',
    },
    {
      id: 'tweet-3',
      author: 'PSD2 Dev Guild',
      handle: '@psd2guild',
      verified: false,
      text: 'Developers: please stop forcing MFA twice in a 10 min window. Latest @EuroBank mobile update regressed SCA. #PSD2Pain',
      impressions: 640000,
      likes: 5200,
      reposts: 1700,
      sentiment: 'negative',
      postedAt: '8h ago',
    },
  ];
}

export function getXResponseAlerts(): XResponseAlert[] {
  return [
    {
      id: 'resp-1',
      topic: 'SEPA pay delay',
      urgency: 'critical',
      summary: 'Verified finance journalist detailing cross-border payroll delays hitting EU commuters.',
      recommendedAction: 'Publish holding statement within 30 minutes and DM journalist with ops timeline.',
      impactedHandles: 46,
      firstDetected: 'Today · 08:15 CET',
      author: 'Lena Gruber',
      handle: '@finjournoEU',
      verified: true,
      starRating: 2,
      sentimentLevel: 5,
      viralityScore: 612,
      trending: 'Yes',
      likes: 6300,
      reposts: 2100,
      impressions: 1240000,
    },
    {
      id: 'resp-2',
      topic: 'PSD2 MFA complaints',
      urgency: 'high',
      summary: 'Developer community thread flagging repeated MFA prompts after mobile release.',
      recommendedAction: 'Ship technical explainer thread + DM top handles with roadmap and hotfix timing.',
      impactedHandles: 31,
      firstDetected: 'Today · 09:40 CET',
      author: 'PSD2 Dev Guild',
      handle: '@psd2guild',
      verified: false,
      starRating: 1,
      sentimentLevel: 4,
      viralityScore: 488,
      trending: 'Yes',
      likes: 5200,
      reposts: 1700,
      impressions: 640000,
    },
    {
      id: 'resp-3',
      topic: 'Mortgage retention backlash',
      urgency: 'high',
      summary: 'Customers comparing loyalty incentives and calling out lack of retention offers.',
      recommendedAction: 'Post retention roadmap + direct traffic to callback scheduler.',
      impactedHandles: 24,
      firstDetected: 'Today · 07:55 CET',
      author: 'Marcus Lindholm',
      handle: '@nordicfinance',
      verified: false,
      starRating: 2,
      sentimentLevel: 4,
      viralityScore: 352,
      trending: 'No',
      likes: 3700,
      reposts: 950,
      impressions: 520000,
    },
    {
      id: 'resp-4',
      topic: 'FX markup transparency',
      urgency: 'medium',
      summary: 'Policy aide asking for hard data on FX markup disclosures versus EU challengers.',
      recommendedAction: 'Coordinate with policy + publish data-backed thread linking transparency dashboard.',
      impactedHandles: 18,
      firstDetected: 'Yesterday · 19:30 CET',
      author: 'EU Policy Pulse',
      handle: '@EUPolicyPulse',
      verified: false,
      starRating: 3,
      sentimentLevel: 3,
      viralityScore: 241,
      trending: 'No',
      likes: 2100,
      reposts: 480,
      impressions: 310000,
    },
    {
      id: 'resp-5',
      topic: 'App release feedback loop',
      urgency: 'medium',
      summary: 'Beta cohort posting crash clips and requesting Android 6.5 patch timeline.',
      recommendedAction: 'Acknowledge bugs, share Jira ID, and pin rolling status updates.',
      impactedHandles: 21,
      firstDetected: 'Today · 06:05 CET',
      author: 'App Beta Watch',
      handle: '@AppBetaWatch',
      verified: false,
      starRating: 3,
      sentimentLevel: 3,
      viralityScore: 198,
      trending: 'No',
      likes: 1800,
      reposts: 520,
      impressions: 286000,
    },
  ];
}

export function getXCreatorWatchlist(): XCreatorWatch[] {
  return [
    {
      id: 'creator-1',
      name: 'Marcus Lindholm',
      handle: '@nordicfinance',
      followers: 128000,
      avgEngagement: 5.6,
      sentiment: 'critic',
      lastPost: 'Thread comparing mortgage retention packages across EU banks.',
      watchStatus: 'engage',
    },
    {
      id: 'creator-2',
      name: 'Nadia Eco',
      handle: '@nadiaeco',
      followers: 98000,
      avgEngagement: 7.1,
      sentiment: 'ally',
      lastPost: 'Live demo walk-through of green savings and carbon ledger.',
      watchStatus: 'sustain',
    },
    {
      id: 'creator-3',
      name: 'EU Payments Watch',
      handle: '@EUPayments',
      followers: 156000,
      avgEngagement: 4.3,
      sentiment: 'critic',
      lastPost: 'Tweetstorm about SEPA instant adoption targets.',
      watchStatus: 'monitor',
    },
  ];
}

export function getXViralityTopics(): XViralityTopic[] {
  return [
    {
      name: 'Mobile App Crashes',
      viralityScore: 512,
      views: 1_820_000,
      likes: 28_400,
      level1: 4,
      level2: 9,
      level3: 18,
      level4: 31,
      level5: 38,
    },
    {
      name: 'SEPA Payment Delays',
      viralityScore: 486,
      views: 1_540_000,
      likes: 25_100,
      level1: 6,
      level2: 12,
      level3: 24,
      level4: 26,
      level5: 32,
    },
    {
      name: 'PSD2 MFA Friction',
      viralityScore: 434,
      views: 1_180_000,
      likes: 21_200,
      level1: 5,
      level2: 11,
      level3: 22,
      level4: 28,
      level5: 34,
    },
    {
      name: 'Mortgage Retention Backlash',
      viralityScore: 371,
      views: 920_000,
      likes: 17_400,
      level1: 8,
      level2: 14,
      level3: 26,
      level4: 24,
      level5: 28,
    },
    {
      name: 'FX Transparency Debate',
      viralityScore: 298,
      views: 760_000,
      likes: 13_800,
      level1: 10,
      level2: 19,
      level3: 31,
      level4: 22,
      level5: 18,
    },
    {
      name: 'Card Fraud Alerts',
      viralityScore: 276,
      views: 684_000,
      likes: 12_900,
      level1: 12,
      level2: 18,
      level3: 28,
      level4: 24,
      level5: 18,
    },
    {
      name: 'Climate Finance Momentum',
      viralityScore: 232,
      views: 548_000,
      likes: 10_400,
      level1: 32,
      level2: 26,
      level3: 22,
      level4: 13,
      level5: 7,
    },
    {
      name: 'Instant Card Freeze Shoutouts',
      viralityScore: 208,
      views: 482_000,
      likes: 9_400,
      level1: 36,
      level2: 28,
      level3: 18,
      level4: 12,
      level5: 6,
    },
    {
      name: 'Sustainable Savings Praise',
      viralityScore: 196,
      views: 438_000,
      likes: 8_800,
      level1: 44,
      level2: 24,
      level3: 18,
      level4: 9,
      level5: 5,
    },
    {
      name: 'Digital Trust & Security',
      viralityScore: 182,
      views: 396_000,
      likes: 7_600,
      level1: 14,
      level2: 22,
      level3: 29,
      level4: 20,
      level5: 15,
    },
  ];
}

export function getXComplianceFeatureDataset(): XComplianceFeatureDataset {
  return {
    summaries: [
      {
        key: 'compliance',
        label: 'Concern Hotspots',
        totalTopics: 3,
        totalPosts: 1_680,
        totalHelpfulVotes: 460,
        dominantSentiment: {
          key: 'level5',
          label: 'Frustrated',
        },
        topics: [
          {
            name: 'SEPA payroll delays',
            totalPosts: 620,
            helpfulVotes: 180,
            dominantSentiment: { key: 'level5', label: 'Frustrated', value: 54 },
          },
          {
            name: 'PSD2 MFA friction',
            totalPosts: 540,
            helpfulVotes: 160,
            dominantSentiment: { key: 'level4', label: 'Anger', value: 42 },
          },
          {
            name: 'Mortgage retention backlash',
            totalPosts: 520,
            helpfulVotes: 120,
            dominantSentiment: { key: 'level4', label: 'Anger', value: 36 },
          },
        ],
      },
      {
        key: 'feature',
        label: 'Feature Requests & Enhancements',
        totalTopics: 3,
        totalPosts: 1_120,
        totalHelpfulVotes: 320,
        dominantSentiment: {
          key: 'level2',
          label: 'Bit Irritated',
        },
        topics: [
          {
            name: 'Smart budgeting coach',
            totalPosts: 380,
            helpfulVotes: 110,
            dominantSentiment: { key: 'level2', label: 'Bit Irritated', value: 41 },
            wordCloud: [
              { term: 'bill forecasting', weight: 10 },
              { term: 'cashflow alerts', weight: 9 },
              { term: 'subscription cleanup', weight: 8 },
              { term: 'ai spending tips', weight: 7 },
            ],
          },
          {
            name: 'Instant card freeze automations',
            totalPosts: 360,
            helpfulVotes: 102,
            dominantSentiment: { key: 'level3', label: 'Moderately Concerned', value: 38 },
            wordCloud: [
              { term: 'travel notices', weight: 9 },
              { term: 'merchant locks', weight: 8 },
              { term: 'atm radius', weight: 7 },
              { term: 'shared controls', weight: 6 },
            ],
          },
          {
            name: 'Multi-currency travel wallet',
            totalPosts: 380,
            helpfulVotes: 108,
            dominantSentiment: { key: 'level1', label: 'Happy', value: 46 },
            wordCloud: [
              { term: 'rate alerts', weight: 9 },
              { term: 'fee-free atm', weight: 8 },
              { term: 'travel insurance', weight: 7 },
              { term: 'auto convert', weight: 6 },
            ],
          },
        ],
      },
      {
        key: 'appreciation',
        label: 'Customer Appreciation Highlights',
        totalTopics: 3,
        totalPosts: 880,
        totalHelpfulVotes: 292,
        dominantSentiment: {
          key: 'level1',
          label: 'Supportive',
        },
        topics: [
          {
            name: '24h support win threads',
            totalPosts: 310,
            helpfulVotes: 108,
            dominantSentiment: { key: 'level1', label: 'Supportive', value: 52 },
            wordCloud: [
              { term: 'midnight callbacks', weight: 10 },
              { term: 'human agent', weight: 9 },
              { term: 'thank you note', weight: 8 },
            ],
          },
          {
            name: 'Sustainable investment shout-outs',
            totalPosts: 284,
            helpfulVotes: 94,
            dominantSentiment: { key: 'level1', label: 'Supportive', value: 48 },
            wordCloud: [
              { term: 'impact portfolio', weight: 9 },
              { term: 'green bonds', weight: 8 },
              { term: 'community funds', weight: 7 },
            ],
          },
          {
            name: 'App design applause',
            totalPosts: 286,
            helpfulVotes: 90,
            dominantSentiment: { key: 'level2', label: 'Curious', value: 36 },
            wordCloud: [
              { term: 'frictionless ux', weight: 8 },
              { term: 'smooth onboarding', weight: 8 },
              { term: 'dark mode polish', weight: 7 },
            ],
          },
        ],
      },
    ],
  };
}

export function getXComplianceFeatureAreaData(): XSentimentAreaPoint[] {
  return [
    { level: 'Level 1', compliance: 12, feature: 34, appreciation: 72 },
    { level: 'Level 2', compliance: 18, feature: 28, appreciation: 0 },
    { level: 'Level 3', compliance: 26, feature: 20, appreciation: 0 },
    { level: 'Level 4', compliance: 28, feature: 12, appreciation: 0 },
    { level: 'Level 5', compliance: 16, feature: 6, appreciation: 0 },
  ];
}

export function getXSentimentLevelTimeline(): XSentimentLevelTimelinePoint[] {
  const today = new Date();
  return Array.from({ length: 14 }).map((_, index) => {
    const date = new Date(today);
    const offset = 13 - index;
    date.setDate(today.getDate() - offset);

    const baseVolume = 180 + Math.sin((index / 2) * Math.PI) * 40;
    const volatility = Math.cos(index * 0.6) * 20;
    const tweetVolume = Math.max(140, Math.round(baseVolume + volatility));

    const level1 = Math.max(12, Math.round(tweetVolume * (0.18 + Math.sin(index * 0.4) * 0.04)));
    const level2 = Math.max(15, Math.round(tweetVolume * (0.22 + Math.cos(index * 0.3) * 0.03)));
    const level3 = Math.max(18, Math.round(tweetVolume * (0.27 + Math.sin(index * 0.35) * 0.02)));
    const level4 = Math.max(20, Math.round(tweetVolume * (0.20 + Math.cos(index * 0.27) * 0.035)));
    const level5 = Math.max(14, Math.round(tweetVolume * (0.13 + Math.sin(index * 0.31) * 0.025)));

    const totalAssigned = level1 + level2 + level3 + level4 + level5;
    const adjustment = tweetVolume - totalAssigned;

    return {
      date: date.toISOString().split('T')[0],
      level1,
      level2,
      level3,
      level4,
      level5: level5 + adjustment,
      tweetVolume,
    };
  });
}
