export interface AppStoreKPI {
  id: string;
  label: string;
  value: string;
  change: number;
  trend: 'up' | 'down' | 'flat';
  description: string;
}

export interface AppStoreSentimentPoint {
  date: string;
  positive: number;
  neutral: number;
  negative: number;
}

export interface AppStoreRatingBucket {
  stars: number;
  share: number;
}

export interface AppStoreFeaturedReview {
  title: string;
  body: string;
  rating: number;
  author: string;
  age: string;
}

export interface AppStoreChecklistItem {
  task: string;
  status: 'Completed' | 'In progress' | 'Pending';
  description: string;
}

export interface AppStoreViralityTopic {
  name: string;
  reviewVolume: number;
  star1: number;
  star2: number;
  star3: number;
  star4: number;
  star5: number;
  helpfulVotes?: number;
}

export interface AppStoreModerationTopic {
  name: string;
  totalReviews: number;
  helpfulVotes: number;
  dominantSentiment: AppStoreSentimentLevelKey;
  wordCloud?: Array<{ term: string; weight: number }>;
}

export interface AppStoreModerationSummary {
  key: 'moderation' | 'feature' | 'appreciation';
  label: string;
  totalTopics: number;
  totalReviews: number;
  totalHelpfulVotes: number;
  dominantSentiment: AppStoreSentimentLevelKey;
  topics: AppStoreModerationTopic[];
}

export interface AppStoreModerationDataset {
  summaries: AppStoreModerationSummary[];
}

export interface AppStoreModerationAreaPoint {
  level: string;
  moderation: number;
  feature: number;
  appreciation: number;
}

export interface AppStoreReviewTrendTopic {
  topic: string;
  reviews: number;
  helpfulVotes: number;
}

export interface AppStoreSentimentLevelTimelinePoint {
  date: string;
  level1: number;
  level2: number;
  level3: number;
  level4: number;
  level5: number;
  reviewVolume: number;
  topicsByLevel: Record<AppStoreSentimentLevelKey, AppStoreReviewTrendTopic[]>;
}

export interface AppStoreReviewAlert {
  id: string;
  title: string;
  category: 'performance' | 'payments' | 'accessibility' | 'security';
  rating: number;
  sentimentTag: 'critical' | 'high' | 'medium';
  summary: string;
  recommendedAction: string;
  reviewSnippet: string;
  deviceContext: string;
  iosVersion: string;
  reviewCount: number;
}

export const APPSTORE_RATING_LEVELS = [
  { key: 'star5', label: '5 ★ • Delighted', short: '5★', color: '#facc15' },
  { key: 'star4', label: '4 ★ • Happy', short: '4★', color: '#fde68a' },
  { key: 'star3', label: '3 ★ • Mixed', short: '3★', color: '#9ca3af' },
  { key: 'star2', label: '2 ★ • Frustrated', short: '2★', color: '#fb923c' },
  { key: 'star1', label: '1 ★ • Critical', short: '1★', color: '#f87171' },
] as const;
export const APPSTORE_SENTIMENT_LEVELS = [
  { key: 'level1', dataKey: 'star5', label: '1 • Happy', color: '#22c55e', isFirst: true, isLast: false },
  { key: 'level2', dataKey: 'star4', label: '2 • Bit Irritated', color: '#38bdf8', isFirst: false, isLast: false },
  { key: 'level3', dataKey: 'star3', label: '3 • Moderately Concerned', color: '#9ca3af', isFirst: false, isLast: false },
  { key: 'level4', dataKey: 'star2', label: '4 • Anger', color: '#f97316', isFirst: false, isLast: false },
  { key: 'level5', dataKey: 'star1', label: '5 • Frustrated', color: '#ef4444', isFirst: false, isLast: true },
] as const;

export type AppStoreRatingLevelKey = (typeof APPSTORE_RATING_LEVELS)[number]['key'];
export type AppStoreSentimentLevelKey = (typeof APPSTORE_SENTIMENT_LEVELS)[number]['key'];

export interface AppStoreReviewMomentum {
  starLabel: string;
  share: number;
  change: number;
  trend: 'up' | 'steady' | 'down';
  reviewCount: number;
  topTheme: string;
}

export function getAppStoreKPIs(): AppStoreKPI[] {
  return [
    {
      id: 'appstore-rating',
      label: 'Average Rating',
      value: '4.6',
      change: 0.2,
      trend: 'up',
      description: 'Rolling 30-day average rating for v14.3 release',
    },
    {
      id: 'appstore-replied',
      label: 'Replied vs Not Replied',
      value: '68%',
      change: 5,
      trend: 'down',
      description: '142 reviews need responses – prioritize negative reviews',
    },
    {
      id: 'appstore-response-time',
      label: 'Average Response Time',
      value: '3.8h',
      change: -0.4,
      trend: 'up',
      description: 'Response time within target – maintain playbooks',
    },
    {
      id: 'appstore-sentiment',
      label: 'Positive vs Negative',
      value: '84.2%',
      change: 2.1,
      trend: 'up',
      description: '67 negative reviews need attention – focus on top issues',
    },
  ];
}

const reviewMomentumCache: AppStoreReviewMomentum[] = [
      {
        starLabel: '5-star cheerleaders',
        share: 58,
        change: 4.2,
        trend: 'up',
        reviewCount: 126,
        topTheme: 'Praise for crash fixes & dark mode polish',
      },
      {
        starLabel: '4-star promoters',
        share: 23,
        change: 1.1,
        trend: 'steady',
        reviewCount: 84,
        topTheme: 'Requests for scheduling notifications',
      },
      {
        starLabel: '3-star neutrals',
        share: 11,
        change: -0.8,
        trend: 'down',
        reviewCount: 48,
        topTheme: 'Offline access still missing for travellers',
      },
      {
        starLabel: '2-star detractors',
        share: 5,
        change: -1.4,
        trend: 'down',
        reviewCount: 22,
        topTheme: 'Payment verification loops on older devices',
      },
      {
        starLabel: '1-star churn risks',
        share: 3,
        change: -0.6,
        trend: 'down',
        reviewCount: 14,
        topTheme: 'Widget crashes and data sync failures',
      },
    ];
export function getAppStoreReviewMomentum(): AppStoreReviewMomentum[] {
  return reviewMomentumCache;
}

export function getAppStoreSentimentTimeline(): AppStoreSentimentPoint[] {
  const today = new Date();
  return Array.from({ length: 7 }).map((_, index) => {
    const date = new Date(today);
    const offset = 6 - index;
    date.setDate(today.getDate() - offset);

    return {
      date: date.toLocaleDateString('en-GB', { month: 'short', day: 'numeric' }),
      positive: Math.round(45 + index * 1.2),
      neutral: Math.round(33 - index * 0.5),
      negative: Math.round(22 - index * 0.7),
    };
  });
}

const viralityTopicsCache: AppStoreViralityTopic[] = [
  {
    name: 'Biometric login reliability',
    reviewVolume: 182,
    star1: 12,
    star2: 18,
    star3: 24,
    star4: 56,
    star5: 72,
    helpfulVotes: 12_400,
  },
  {
    name: 'Payment authorization loop',
    reviewVolume: 156,
    star1: 42,
    star2: 31,
    star3: 28,
    star4: 19,
    star5: 36,
    helpfulVotes: 10_950,
  },
  {
    name: 'Widget refresh accuracy',
    reviewVolume: 138,
    star1: 18,
    star2: 26,
    star3: 32,
    star4: 34,
    star5: 28,
    helpfulVotes: 9_780,
  },
  {
    name: 'Push notification delays',
    reviewVolume: 124,
    star1: 24,
    star2: 28,
    star3: 26,
    star4: 22,
    star5: 24,
    helpfulVotes: 8_620,
  },
  {
    name: 'App launch performance',
    reviewVolume: 118,
    star1: 8,
    star2: 14,
    star3: 28,
    star4: 36,
    star5: 32,
    helpfulVotes: 7_540,
  },
  {
    name: 'Cross-device sync',
    reviewVolume: 105,
    star1: 12,
    star2: 18,
    star3: 24,
    star4: 28,
    star5: 23,
    helpfulVotes: 6_880,
  },
  {
    name: 'Savings insights clarity',
    reviewVolume: 97,
    star1: 6,
    star2: 12,
    star3: 20,
    star4: 30,
    star5: 29,
    helpfulVotes: 5_420,
  },
  {
    name: 'Recurring transfers stability',
    reviewVolume: 92,
    star1: 14,
    star2: 22,
    star3: 28,
    star4: 18,
    star5: 10,
    helpfulVotes: 4_760,
  },
  {
    name: 'Budget alert relevance',
    reviewVolume: 86,
    star1: 9,
    star2: 16,
    star3: 24,
    star4: 21,
    star5: 16,
    helpfulVotes: 4_120,
  },
  {
    name: 'Offline access expectations',
    reviewVolume: 81,
    star1: 10,
    star2: 18,
    star3: 26,
    star4: 19,
    star5: 8,
    helpfulVotes: 3_560,
  },
];
export function getAppStoreViralityTopics(): AppStoreViralityTopic[] {
  return viralityTopicsCache;
}

export function getAppStoreModerationDataset(): AppStoreModerationDataset {
  return {
    summaries: [
      {
        key: 'moderation',
        label: 'Quality & Trust Moderation',
        totalTopics: 3,
        totalReviews: 1_004,
        totalHelpfulVotes: 382,
        dominantSentiment: 'level4',
        topics: [
          {
            name: 'Payment authentication escalation',
            totalReviews: 368,
            helpfulVotes: 138,
            dominantSentiment: 'level5',
          },
          {
            name: 'Biometric login complaints',
            totalReviews: 332,
            helpfulVotes: 132,
            dominantSentiment: 'level4',
          },
          {
            name: 'Widget refresh issues',
            totalReviews: 304,
            helpfulVotes: 112,
            dominantSentiment: 'level3',
          },
        ],
      },
      {
        key: 'feature',
        label: 'Feature Requests & Enhancements',
        totalTopics: 3,
        totalReviews: 1_508,
        totalHelpfulVotes: 422,
        dominantSentiment: 'level2',
        topics: [
          {
            name: 'Customizable notifications',
            totalReviews: 548,
            helpfulVotes: 158,
            dominantSentiment: 'level2',
            wordCloud: [
              { term: 'schedule', weight: 10 },
              { term: 'quiet hours', weight: 9 },
              { term: 'alert filters', weight: 8 },
            ],
          },
          {
            name: 'Family account controls',
            totalReviews: 498,
            helpfulVotes: 146,
            dominantSentiment: 'level3',
            wordCloud: [
              { term: 'shared cards', weight: 9 },
              { term: 'spending limits', weight: 8 },
              { term: 'permissions', weight: 7 },
            ],
          },
          {
            name: 'Travel mode automation',
            totalReviews: 462,
            helpfulVotes: 118,
            dominantSentiment: 'level2',
            wordCloud: [
              { term: 'auto roaming', weight: 9 },
              { term: 'currency tips', weight: 8 },
              { term: 'travel alerts', weight: 7 },
            ],
          },
        ],
      },
      {
        key: 'appreciation',
        label: 'Customer Appreciation Highlights',
        totalTopics: 3,
        totalReviews: 812,
        totalHelpfulVotes: 286,
        dominantSentiment: 'level1',
        topics: [
          {
            name: 'Lightning-fast card replacements',
            totalReviews: 276,
            helpfulVotes: 98,
            dominantSentiment: 'level1',
            wordCloud: [
              { term: 'same-day dispatch', weight: 11 },
              { term: 'zero hassle', weight: 10 },
              { term: 'travel rescue', weight: 9 },
            ],
          },
          {
            name: 'Relationship manager shout-outs',
            totalReviews: 262,
            helpfulVotes: 94,
            dominantSentiment: 'level1',
            wordCloud: [
              { term: 'warm follow-ups', weight: 10 },
              { term: 'proactive guidance', weight: 9 },
              { term: 'personal touch', weight: 8 },
            ],
          },
          {
            name: 'Carbon insights delight',
            totalReviews: 274,
            helpfulVotes: 94,
            dominantSentiment: 'level2',
            wordCloud: [
              { term: 'footprint tracker', weight: 10 },
              { term: 'eco nudges', weight: 9 },
              { term: 'impact stories', weight: 8 },
            ],
          },
        ],
      },
    ],
  };
}

export function getAppStoreModerationAreaData(): AppStoreModerationAreaPoint[] {
  return [
    { level: '1 • Happy', moderation: 8, feature: 35, appreciation: 78 },
    { level: '2 • Bit Irritated', moderation: 14, feature: 30, appreciation: 0 },
    { level: '3 • Moderately Concerned', moderation: 24, feature: 18, appreciation: 0 },
    { level: '4 • Anger', moderation: 32, feature: 11, appreciation: 0 },
    { level: '5 • Frustrated', moderation: 22, feature: 6, appreciation: 0 },
  ];
}

export function getAppStoreSentimentLevelTimeline(): AppStoreSentimentLevelTimelinePoint[] {
  const levelTopics: Record<AppStoreSentimentLevelKey, Array<{ topic: string; helpfulMultiplier: number }>> = {
    level1: [
      { topic: 'Savings insights clarity', helpfulMultiplier: 0.55 },
      { topic: 'Digital innovation praise', helpfulMultiplier: 0.52 },
      { topic: 'App navigation delight', helpfulMultiplier: 0.48 },
      { topic: 'Customer support shout-outs', helpfulMultiplier: 0.46 },
    ],
    level2: [
      { topic: 'Budget alert relevance', helpfulMultiplier: 0.47 },
      { topic: 'Cross-device sync', helpfulMultiplier: 0.44 },
      { topic: 'Goal tracking boosts', helpfulMultiplier: 0.42 },
      { topic: 'Savings nudges timing', helpfulMultiplier: 0.39 },
    ],
    level3: [
      { topic: 'Recurring transfers stability', helpfulMultiplier: 0.41 },
      { topic: 'Offline access expectations', helpfulMultiplier: 0.38 },
      { topic: 'FX fee transparency', helpfulMultiplier: 0.36 },
      { topic: 'Loan eligibility clarity', helpfulMultiplier: 0.35 },
    ],
    level4: [
      { topic: 'Push notification delays', helpfulMultiplier: 0.34 },
      { topic: 'Biometric login complaints', helpfulMultiplier: 0.32 },
      { topic: 'Widget refresh issues', helpfulMultiplier: 0.31 },
    ],
    level5: [
      { topic: 'Payment authorization loop', helpfulMultiplier: 0.33 },
      { topic: 'Stuck card verification', helpfulMultiplier: 0.32 },
      { topic: 'Account lockout escalation', helpfulMultiplier: 0.31 },
    ],
  };

  const today = new Date();

  return Array.from({ length: 14 }).map((_, index) => {
    const date = new Date(today);
    const offset = 13 - index;
    date.setDate(today.getDate() - offset);

    const reviewVolume = Math.max(620, Math.round(860 + Math.sin(index * 0.34) * 150 + Math.cos(index * 0.19) * 95));

    const macroPulse = Math.sin((index / 13) * Math.PI) * 0.12;
    const latePulse = Math.cos(((index / 13) * Math.PI) + 0.9) * 0.08;
    const volatility = Math.sin(index * 0.58) * 0.04 + Math.cos(index * 0.41) * 0.035;

    let level1Share = 0.33 + macroPulse * 0.5 + volatility * -0.25 + Math.cos(index * 0.27) * 0.05;
    let level2Share = 0.28 + macroPulse * -0.35 + volatility * 0.4 + Math.sin(index * 0.31 + 0.4) * 0.045;
    let level3Share = 0.22 + macroPulse * 0.18 + latePulse * -0.2 + Math.cos(index * 0.37 + 0.7) * 0.04;
    let level4Share = 0.11 + macroPulse * -0.12 + volatility * 0.28 + Math.sin(index * 0.43 + 1.1) * 0.035;
    let level5Share = 0.06 + macroPulse * 0.08 + latePulse * 0.22 + Math.cos(index * 0.49 + 1.5) * 0.032;

    const minShare = 0.015;
    level1Share = Math.max(minShare, level1Share);
    level2Share = Math.max(minShare, level2Share);
    level3Share = Math.max(minShare, level3Share);
    level4Share = Math.max(minShare, level4Share);
    level5Share = Math.max(minShare, level5Share);

    const totalShare = level1Share + level2Share + level3Share + level4Share + level5Share;
    level1Share /= totalShare;
    level2Share /= totalShare;
    level3Share /= totalShare;
    level4Share /= totalShare;
    level5Share = 1 - (level1Share + level2Share + level3Share + level4Share);

    const shares: Record<AppStoreSentimentLevelKey, number> = {
      level1: level1Share,
      level2: level2Share,
      level3: level3Share,
      level4: level4Share,
      level5: level5Share,
    };

    const levelCounts: Record<AppStoreSentimentLevelKey, number> = {
      level1: Math.round(reviewVolume * shares.level1),
      level2: Math.round(reviewVolume * shares.level2),
      level3: Math.round(reviewVolume * shares.level3),
      level4: Math.round(reviewVolume * shares.level4),
      level5: Math.round(reviewVolume * shares.level5),
    };

    const assignedTotal = levelCounts.level1 + levelCounts.level2 + levelCounts.level3 + levelCounts.level4 + levelCounts.level5;
    if (assignedTotal !== reviewVolume) {
      levelCounts.level1 += reviewVolume - assignedTotal;
    }

    const toPercent = (share: number) => parseFloat((share * 100).toFixed(1));

    const topicsByLevel: Record<AppStoreSentimentLevelKey, AppStoreReviewTrendTopic[]> = {
      level1: [],
      level2: [],
      level3: [],
      level4: [],
      level5: [],
    };

    (Object.keys(topicsByLevel) as AppStoreSentimentLevelKey[]).forEach(levelKey => {
      const templates = levelTopics[levelKey];
      const firstTemplate = templates[(index + templates.length) % templates.length];
      const secondTemplate = templates[(index + 1 + templates.length) % templates.length];
      const thirdTemplate = templates[(index + 2 + templates.length) % templates.length];
      const pool = levelCounts[levelKey];
      const primaryShare = levelKey === 'level1' ? 0.52 : levelKey === 'level5' ? 0.68 : 0.58;
      const secondaryShare = levelKey === 'level4' ? 0.24 : 0.28;
      let firstReviews = Math.max(18, Math.round(pool * primaryShare));
      let secondReviews = Math.max(14, Math.round(pool * secondaryShare));
      let thirdReviews = Math.max(0, pool - firstReviews - secondReviews);
      if (thirdReviews < 0) {
        secondReviews += thirdReviews;
        thirdReviews = 0;
      }
      if (secondReviews < 0) {
        firstReviews += secondReviews;
        secondReviews = 0;
      }

      const buildHelpful = (reviews: number, multiplier: number) => Math.max(10, Math.round(reviews * multiplier));

      const levelTopicsArray: AppStoreReviewTrendTopic[] = [];
      if (firstReviews > 0) {
        levelTopicsArray.push({
          topic: firstTemplate.topic,
          reviews: firstReviews,
          helpfulVotes: buildHelpful(firstReviews, firstTemplate.helpfulMultiplier),
        });
      }
      if (secondReviews > 0) {
        levelTopicsArray.push({
          topic: secondTemplate.topic,
          reviews: secondReviews,
          helpfulVotes: buildHelpful(secondReviews, secondTemplate.helpfulMultiplier),
        });
      }
      if (thirdReviews > 0) {
        levelTopicsArray.push({
          topic: thirdTemplate.topic,
          reviews: thirdReviews,
          helpfulVotes: buildHelpful(thirdReviews, thirdTemplate.helpfulMultiplier * 0.9),
        });
      }

      topicsByLevel[levelKey] = levelTopicsArray;
    });

    return {
      date: date.toISOString().split('T')[0],
      level1: toPercent(level1Share),
      level2: toPercent(level2Share),
      level3: toPercent(level3Share),
      level4: toPercent(level4Share),
      level5: toPercent(level5Share),
      reviewVolume,
      topicsByLevel,
    };
  });
}

export function getAppStoreRatingDistribution(): AppStoreRatingBucket[] {
  return [
    { stars: 5, share: 58 },
    { stars: 4, share: 26 },
    { stars: 3, share: 9 },
    { stars: 2, share: 4 },
    { stars: 1, share: 3 },
  ];
}

export function getAppStoreFeaturedReviews(): AppStoreFeaturedReview[] {
  return [
    {
      title: '“Finally feels polished”',
      body: 'New release fixed login crashes and the widgets are genuinely useful. Performance is buttery smooth.',
      rating: 5,
      author: 'iOSDevQueen',
      age: '18h ago',
    },
    {
      title: '“Dark mode tweaks appreciated”',
      body: 'Accessibility update is a huge win. Would love to schedule notifications, but overall great job.',
      rating: 4,
      author: 'AccessibilityNinja',
      age: '2d ago',
    },
    {
      title: '“Still missing offline support”',
      body: 'Redesign looks clean, yet offline mode is still a pain point when travelling. Please prioritise.',
      rating: 3,
      author: 'globetrotter88',
      age: '3d ago',
    },
  ];
}

export function getAppStoreChecklist(): AppStoreChecklistItem[] {
  return [
    {
      task: 'Respond to critical feedback within 4h',
      status: 'In progress',
      description: 'Escalated reviews tracked in Zendesk automation.',
    },
    {
      task: 'Push hotfix for biometric login edge case',
      status: 'Pending',
      description: 'Awaiting QA sign-off before phased release.',
    },
    {
      task: 'Publish App Store “What’s New” clip',
      status: 'Completed',
      description: 'Video assets submitted and approved by App Review.',
    },
  ];
}

export interface AppStoreTopicVolumeSplitEntry {
  name: string;
  volume: number;
  sentiment: 'positive' | 'negative';
}

const APPSTORE_TOPIC_VOLUME_SPLIT: AppStoreTopicVolumeSplitEntry[] = [
  { name: 'App Stability Trust', volume: 48, sentiment: 'negative' },
  { name: 'PSD2 Authentication UX', volume: 44, sentiment: 'negative' },
  { name: 'Card Personalisation', volume: 40, sentiment: 'positive' },
  { name: 'SEPA Transfer Reliability', volume: 38, sentiment: 'negative' },
  { name: 'Instant Refund Engine', volume: 36, sentiment: 'positive' },
  { name: 'FX Markup Comparisons', volume: 34, sentiment: 'negative' },
  { name: 'EuroBank Green Finance', volume: 32, sentiment: 'positive' },
  { name: 'Mortgage Retention Loyalty', volume: 31, sentiment: 'negative' },
  { name: 'Digital Trust & Security', volume: 30, sentiment: 'negative' },
  { name: 'Fee Transparency Hub', volume: 29, sentiment: 'positive' },
  { name: 'Instant SEPA Pilot (Italy)', volume: 28, sentiment: 'positive' },
  { name: 'Cross-Border Payroll Team', volume: 27, sentiment: 'negative' },
  { name: 'KYC Verification Backlog', volume: 26, sentiment: 'negative' },
  { name: 'AI Relationship Manager', volume: 25, sentiment: 'positive' },
  { name: 'Creator Kickstart', volume: 24, sentiment: 'positive' },
  { name: 'Wealth Advisory Access', volume: 23, sentiment: 'negative' },
  { name: 'Climate Savings Accelerators', volume: 22, sentiment: 'positive' },
  { name: 'Payments Outage Comms', volume: 21, sentiment: 'negative' },
  { name: 'Travel Mode Upgrades', volume: 20, sentiment: 'positive' },
  { name: 'Treasury FX Hedging', volume: 19, sentiment: 'negative' },
];

export const getAppStoreTopicVolumeSplit = (): AppStoreTopicVolumeSplitEntry[] =>
  APPSTORE_TOPIC_VOLUME_SPLIT;

export function getAppStoreReviewAlerts(): AppStoreReviewAlert[] {
  return [
    {
      id: 'appstore-alert-1',
      title: 'Payment authentication loop',
      category: 'payments',
      rating: 2,
      sentimentTag: 'critical',
      summary: 'Recurring failures when authenticating Apple Pay transactions after 14.3 update.',
      recommendedAction: 'Escalate to payments squad for hotfix and push proactive in-app banner.',
      reviewSnippet: '“Card verification keeps spinning forever, even after re-adding the card.”',
      deviceContext: 'iPhone 15 Pro · Face ID',
      iosVersion: 'iOS 17.3',
      reviewCount: 46,
    },
    {
      id: 'appstore-alert-2',
      title: 'Widget data out-of-sync',
      category: 'performance',
      rating: 3,
      sentimentTag: 'high',
      summary: 'Home widget lags real balance by several hours and occasionally freezes the app.',
      recommendedAction: 'Rebuild widget refresh logic and publish status update in release notes.',
      reviewSnippet: '“Widget shows yesterday’s balance until I force open the app twice.”',
      deviceContext: 'iPhone 14 · Always-on display',
      iosVersion: 'iOS 17.2',
      reviewCount: 31,
    },
    {
      id: 'appstore-alert-3',
      title: 'Biometric fallback confusion',
      category: 'security',
      rating: 2,
      sentimentTag: 'medium',
      summary: 'Touch ID fallback prompts appear twice and log users out of active sessions.',
      recommendedAction: 'Update onboarding copy and adjust fallback timeout thresholds.',
      reviewSnippet: '“Touch ID fails the first time and then kicks me back to login without warning.”',
      deviceContext: 'iPad Air · Touch ID',
      iosVersion: 'iPadOS 17.1',
      reviewCount: 24,
    },
    {
      id: 'appstore-alert-4',
      title: 'VoiceOver label gaps',
      category: 'accessibility',
      rating: 3,
      sentimentTag: 'medium',
      summary: 'Transfer flow buttons missing VoiceOver hints causing confusion for screen readers.',
      recommendedAction: 'Patch accessibility labels and include QA checklist for future releases.',
      reviewSnippet: '“VoiceOver just says ‘button’ on confirm transfer. Not accessible.”',
      deviceContext: 'iPhone SE · VoiceOver',
      iosVersion: 'iOS 16.7',
      reviewCount: 18,
    },
  ];
}

