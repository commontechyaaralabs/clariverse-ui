export interface PlayStoreKPI {
  id: string;
  label: string;
  value: string;
  change: number;
  trend: 'up' | 'down' | 'flat';
  description: string;
}

export interface PlayStoreSentimentPoint {
  date: string;
  positive: number;
  neutral: number;
  negative: number;
}

export interface PlayStoreVersionInsight {
  version: string;
  adoptionShare: number;
  highlight: string;
}

export interface PlayStoreReviewQueueItem {
  id: string;
  summary: string;
  sentiment: 'positive' | 'neutral' | 'negative';
  source: string;
}

export interface PlayStoreActionItem {
  title: string;
  owner: string;
  status: 'Planned' | 'In progress' | 'Done';
  description: string;
}

export interface PlayStoreViralityTopic {
  name: string;
  reviewVolume: number;
  star1: number;
  star2: number;
  star3: number;
  star4: number;
  star5: number;
  helpfulVotes?: number;
}

export interface PlayStoreModerationTopic {
  name: string;
  totalReviews: number;
  helpfulVotes: number;
  dominantSentiment: PlayStoreSentimentLevelKey;
  wordCloud?: Array<{ term: string; weight: number }>;
}

export interface PlayStoreModerationSummary {
  key: 'moderation' | 'feature' | 'appreciation';
  label: string;
  totalTopics: number;
  totalReviews: number;
  totalHelpfulVotes: number;
  dominantSentiment: PlayStoreSentimentLevelKey;
  topics: PlayStoreModerationTopic[];
}

export interface PlayStoreModerationDataset {
  summaries: PlayStoreModerationSummary[];
}

export interface PlayStoreModerationAreaPoint {
  level: string;
  moderation: number;
  feature: number;
  appreciation: number;
}

export interface PlayStoreReviewTrendTopic {
  topic: string;
  reviews: number;
  helpfulVotes: number;
}

export interface PlayStoreSentimentLevelTimelinePoint {
  date: string;
  level1: number;
  level2: number;
  level3: number;
  level4: number;
  level5: number;
  reviewVolume: number;
  topicsByLevel: Record<PlayStoreSentimentLevelKey, PlayStoreReviewTrendTopic[]>;
}

export interface PlayStoreReviewAlert {
  id: string;
  title: string;
  category: 'performance' | 'payments' | 'accessibility' | 'security';
  rating: number;
  sentimentTag: 'critical' | 'high' | 'medium';
  summary: string;
  recommendedAction: string;
  reviewSnippet: string;
  deviceContext: string;
  androidVersion: string;
  reviewCount: number;
}

export const PLAYSTORE_SENTIMENT_LEVELS = [
  { key: 'level1', dataKey: 'star5', label: '1 • Happy', color: '#22c55e', isFirst: true, isLast: false },
  { key: 'level2', dataKey: 'star4', label: '2 • Bit Irritated', color: '#38bdf8', isFirst: false, isLast: false },
  { key: 'level3', dataKey: 'star3', label: '3 • Moderately Concerned', color: '#9ca3af', isFirst: false, isLast: false },
  { key: 'level4', dataKey: 'star2', label: '4 • Anger', color: '#f97316', isFirst: false, isLast: false },
  { key: 'level5', dataKey: 'star1', label: '5 • Frustrated', color: '#ef4444', isFirst: false, isLast: true },
] as const;

export type PlayStoreSentimentLevelKey = (typeof PLAYSTORE_SENTIMENT_LEVELS)[number]['key'];

export function getPlayStoreKPIs(): PlayStoreKPI[] {
  return [
    {
      id: 'playstore-rating',
      label: 'Average Rating',
      value: '4.2',
      change: -0.3,
      trend: 'down',
      description: '7-day rolling average following v12.4 rollout',
    },
    {
      id: 'playstore-replied',
      label: 'Replied vs Not Replied',
      value: '62%',
      change: -3,
      trend: 'down',
      description: '218 reviews need responses – prioritize negative reviews',
    },
    {
      id: 'playstore-response-time',
      label: 'Average Response Time',
      value: '5.2h',
      change: 1.1,
      trend: 'down',
      description: 'Response time above target – optimize workflow',
    },
    {
      id: 'playstore-sentiment',
      label: 'Positive vs Negative',
      value: '67.8%',
      change: -4.2,
      trend: 'down',
      description: '156 negative reviews need attention – focus on top issues',
    },
  ];
}

export function getPlayStoreSentimentTimeline(): PlayStoreSentimentPoint[] {
  const today = new Date();
  return Array.from({ length: 7 }).map((_, index) => {
    const date = new Date(today);
    const offset = 6 - index;
    date.setDate(today.getDate() - offset);

    return {
      date: date.toLocaleDateString('en-GB', { month: 'short', day: 'numeric' }),
      positive: Math.round(38 + index * 1.5),
      neutral: Math.round(34 - index * 0.6),
      negative: Math.round(28 - index * 0.9),
    };
  });
}

export function getPlayStoreVersionInsights(): PlayStoreVersionInsight[] {
  return [
    {
      version: 'v12.4.1',
      adoptionShare: 62,
      highlight: 'Primary rollout build stabilising biometric login incident.',
    },
    {
      version: 'v12.3.0',
      adoptionShare: 28,
      highlight: 'Legacy build still live in LATAM — monitor crash regression.',
    },
    {
      version: 'Beta channel',
      adoptionShare: 10,
      highlight: 'Testing new purchase flow and Firebase remote config toggles.',
    },
  ];
}

export function getPlayStoreReviewQueue(): PlayStoreReviewQueueItem[] {
  return [
    {
      id: 'PS-9921',
      summary: 'Post-update login loop on Samsung Galaxy S22',
      sentiment: 'negative',
      source: 'Support escalation',
    },
    {
      id: 'PS-9912',
      summary: 'In-app purchase pending for 48h — repeated follow-ups',
      sentiment: 'negative',
      source: 'Play Store review',
    },
    {
      id: 'PS-9904',
      summary: 'Kudos for new budgeting widgets — request for more currencies',
      sentiment: 'positive',
      source: 'Play Store review',
    },
    {
      id: 'PS-9897',
      summary: 'Accessibility users requesting larger font within transaction list',
      sentiment: 'neutral',
      source: 'Community forum',
    },
  ];
}

export function getPlayStoreActionItems(): PlayStoreActionItem[] {
  return [
    {
      title: 'Deploy hotfix to stabilise login loop',
      owner: 'Mobile Backend',
      status: 'In progress',
      description: 'Backend fix rolling out via staged rollout channel.',
    },
    {
      title: 'Update Play Store listing screenshots',
      owner: 'Growth Marketing',
      status: 'Planned',
      description: 'Highlight new budgeting widgets and carbon insights.',
    },
    {
      title: 'Run targeted push to recover churned users',
      owner: 'Lifecycle Ops',
      status: 'Planned',
      description: 'Triggered after stability fix confirmed for v12.4.1.',
    },
  ];
}

export function getPlayStoreViralityTopics(): PlayStoreViralityTopic[] {
  return [
    {
      name: 'Biometric login stability',
      reviewVolume: 174,
      star1: 18,
      star2: 22,
      star3: 28,
      star4: 46,
      star5: 60,
      helpfulVotes: 11_420,
    },
    {
      name: 'Google Wallet integration',
      reviewVolume: 152,
      star1: 28,
      star2: 31,
      star3: 24,
      star4: 34,
      star5: 35,
      helpfulVotes: 9_860,
    },
    {
      name: 'Budget widgets refresh',
      reviewVolume: 139,
      star1: 12,
      star2: 18,
      star3: 26,
      star4: 42,
      star5: 41,
      helpfulVotes: 8_940,
    },
    {
      name: 'Crash frequency on Pixel 7',
      reviewVolume: 128,
      star1: 36,
      star2: 34,
      star3: 24,
      star4: 20,
      star5: 14,
      helpfulVotes: 8_120,
    },
    {
      name: 'Dark mode readability',
      reviewVolume: 121,
      star1: 10,
      star2: 16,
      star3: 22,
      star4: 38,
      star5: 35,
      helpfulVotes: 7_460,
    },
    {
      name: 'Push notifications delay',
      reviewVolume: 112,
      star1: 24,
      star2: 28,
      star3: 26,
      star4: 22,
      star5: 12,
      helpfulVotes: 6_780,
    },
    {
      name: 'Subscription billing clarity',
      reviewVolume: 104,
      star1: 16,
      star2: 20,
      star3: 26,
      star4: 28,
      star5: 14,
      helpfulVotes: 6_120,
    },
    {
      name: 'Offline access expectations',
      reviewVolume: 98,
      star1: 14,
      star2: 18,
      star3: 28,
      star4: 24,
      star5: 14,
      helpfulVotes: 5_780,
    },
    {
      name: 'Android Auto performance',
      reviewVolume: 87,
      star1: 12,
      star2: 18,
      star3: 24,
      star4: 20,
      star5: 13,
      helpfulVotes: 5_120,
    },
    {
      name: 'Multi-language support',
      reviewVolume: 81,
      star1: 9,
      star2: 14,
      star3: 21,
      star4: 22,
      star5: 15,
      helpfulVotes: 4_540,
    },
  ];
}

export function getPlayStoreReviewAlerts(): PlayStoreReviewAlert[] {
  return [
    {
      id: 'ps-alert-001',
      title: 'Balance widget freezing on Android 14',
      category: 'performance',
      rating: 2,
      sentimentTag: 'critical',
      summary: '“Widget freezes after latest update and shows outdated balance until force restarting the app.”',
      recommendedAction: 'Ship micro-patch to refresh widget service; update Play Store listing response with ETA.',
      reviewSnippet: 'Widget freezes after the latest update and shows yesterday’s balance until I force close the app.',
      deviceContext: 'Pixel 7 Pro • Widget v2.4.0',
      androidVersion: 'Android 14 QPR2',
      reviewCount: 41,
    },
    {
      id: 'ps-alert-002',
      title: 'UPI payments stuck on pending',
      category: 'payments',
      rating: 1,
      sentimentTag: 'critical',
      summary: '“UPI transfer keeps spinning on processing and funds get locked for hours. Happened three times this week.”',
      recommendedAction: 'Coordinate with payments ops; push in-app banner explaining mitigation steps for users.',
      reviewSnippet: 'UPI payment keeps spinning and amount gets debited twice before refund. Need a fix fast.',
      deviceContext: 'OnePlus 11 • Build v12.4.1',
      androidVersion: 'Android 13',
      reviewCount: 56,
    },
    {
      id: 'ps-alert-003',
      title: 'Voiceover support missing labels',
      category: 'accessibility',
      rating: 3,
      sentimentTag: 'high',
      summary: '“TalkBack can’t read transaction amount labels after the redesign. Accessibility team please fix soon.”',
      recommendedAction: 'Patch TalkBack labels for transaction list; acknowledge review with accessibility improvements.',
      reviewSnippet: 'TalkBack doesn’t read the amount labels anymore since the redesign. Accessibility needs attention.',
      deviceContext: 'Samsung Galaxy S23 • Accessibility build',
      androidVersion: 'Android 14',
      reviewCount: 18,
    },
    {
      id: 'ps-alert-004',
      title: 'Carbon insights delight users',
      category: 'performance',
      rating: 5,
      sentimentTag: 'medium',
      summary: '“Love the new carbon insights dashboard – finally see carbon footprint per purchase. Keep expanding it.”',
      recommendedAction: 'Amplify positive feedback via Play Store listing & social proof. Consider featuring in release notes.',
      reviewSnippet: 'New carbon insights dashboard is amazing. Helps me see the footprint per purchase.',
      deviceContext: 'Pixel 6a • Build v12.4.1',
      androidVersion: 'Android 13',
      reviewCount: 29,
    },
  ];
}

export function getPlayStoreModerationDataset(): PlayStoreModerationDataset {
  return {
    summaries: [
      {
        key: 'moderation',
        label: 'Quality & Trust Moderation',
        totalTopics: 3,
        totalReviews: 1_145,
        totalHelpfulVotes: 418,
        dominantSentiment: 'level4',
        topics: [
          {
            name: 'Login loop complaints',
            totalReviews: 428,
            helpfulVotes: 156,
            dominantSentiment: 'level5',
          },
          {
            name: 'UPI processing delays',
            totalReviews: 376,
            helpfulVotes: 148,
            dominantSentiment: 'level4',
          },
          {
            name: 'Crash regression on Pixel',
            totalReviews: 341,
            helpfulVotes: 114,
            dominantSentiment: 'level3',
          },
        ],
      },
      {
        key: 'feature',
        label: 'Feature Requests & Enhancements',
        totalTopics: 3,
        totalReviews: 1_012,
        totalHelpfulVotes: 312,
        dominantSentiment: 'level2',
        topics: [
          {
            name: 'Customisable budgeting widgets',
            totalReviews: 372,
            helpfulVotes: 118,
            dominantSentiment: 'level2',
            wordCloud: [
              { term: 'currencies', weight: 10 },
              { term: 'dark mode', weight: 9 },
              { term: 'filters', weight: 8 },
            ],
          },
          {
            name: 'Travel spend alerts',
            totalReviews: 336,
            helpfulVotes: 102,
            dominantSentiment: 'level3',
            wordCloud: [
              { term: 'roaming', weight: 9 },
              { term: 'FX fees', weight: 8 },
              { term: 'notifications', weight: 7 },
            ],
          },
          {
            name: 'Multi-language support',
            totalReviews: 304,
            helpfulVotes: 92,
            dominantSentiment: 'level2',
            wordCloud: [
              { term: 'regional', weight: 9 },
              { term: 'voice prompts', weight: 8 },
              { term: 'keyboard', weight: 7 },
            ],
          },
        ],
      },
      {
        key: 'appreciation',
        label: 'Customer Appreciation Highlights',
        totalTopics: 3,
        totalReviews: 864,
        totalHelpfulVotes: 274,
        dominantSentiment: 'level1',
        topics: [
          {
            name: 'Carbon insights dashboard love',
            totalReviews: 292,
            helpfulVotes: 98,
            dominantSentiment: 'level1',
            wordCloud: [
              { term: 'footprint clarity', weight: 11 },
              { term: 'eco goals', weight: 10 },
              { term: 'purchase insights', weight: 9 },
            ],
          },
          {
            name: 'Support chat shout-outs',
            totalReviews: 286,
            helpfulVotes: 92,
            dominantSentiment: 'level1',
            wordCloud: [
              { term: 'instant callbacks', weight: 10 },
              { term: 'friendly reps', weight: 9 },
              { term: 'weekend coverage', weight: 8 },
            ],
          },
          {
            name: 'Savings automation praise',
            totalReviews: 286,
            helpfulVotes: 84,
            dominantSentiment: 'level2',
            wordCloud: [
              { term: 'smart rounding', weight: 9 },
              { term: 'auto stash', weight: 8 },
              { term: 'goal reminders', weight: 7 },
            ],
          },
        ],
      },
    ],
  };
}

export function getPlayStoreModerationAreaData(): PlayStoreModerationAreaPoint[] {
  return [
    { level: '1 • Happy', moderation: 9, feature: 33, appreciation: 76 },
    { level: '2 • Bit Irritated', moderation: 16, feature: 28, appreciation: 0 },
    { level: '3 • Moderately Concerned', moderation: 24, feature: 20, appreciation: 0 },
    { level: '4 • Anger', moderation: 31, feature: 13, appreciation: 0 },
    { level: '5 • Frustrated', moderation: 20, feature: 6, appreciation: 0 },
  ];
}

export function getPlayStoreSentimentLevelTimeline(): PlayStoreSentimentLevelTimelinePoint[] {
  const levelTopics: Record<PlayStoreSentimentLevelKey, Array<{ topic: string; helpfulMultiplier: number }>> = {
    level1: [
      { topic: 'Carbon insights delight', helpfulMultiplier: 0.58 },
      { topic: 'Budgeting widgets praise', helpfulMultiplier: 0.52 },
      { topic: 'Savings automation wins', helpfulMultiplier: 0.5 },
      { topic: 'Support shout-outs', helpfulMultiplier: 0.46 },
    ],
    level2: [
      { topic: 'Notification scheduling asks', helpfulMultiplier: 0.45 },
      { topic: 'Android Auto suggestions', helpfulMultiplier: 0.42 },
      { topic: 'Multi-language roadmap', helpfulMultiplier: 0.4 },
      { topic: 'Wealth product coverage', helpfulMultiplier: 0.38 },
    ],
    level3: [
      { topic: 'Travel mode experience', helpfulMultiplier: 0.36 },
      { topic: 'Voice control roadmap', helpfulMultiplier: 0.34 },
      { topic: 'Recurring payment cadence', helpfulMultiplier: 0.33 },
      { topic: 'Privacy centre clarity', helpfulMultiplier: 0.32 },
    ],
    level4: [
      { topic: 'Push delay frustration', helpfulMultiplier: 0.31 },
      { topic: 'Crash regression threads', helpfulMultiplier: 0.3 },
      { topic: 'Login loop reopenings', helpfulMultiplier: 0.29 },
    ],
    level5: [
      { topic: 'UPI stuck payments', helpfulMultiplier: 0.32 },
      { topic: 'Widget freeze escalations', helpfulMultiplier: 0.31 },
      { topic: 'Balance sync failures', helpfulMultiplier: 0.3 },
    ],
  };

  const today = new Date();

  return Array.from({ length: 14 }).map((_, index) => {
    const date = new Date(today);
    const offset = 13 - index;
    date.setDate(today.getDate() - offset);

    const reviewVolume = Math.max(600, Math.round(830 + Math.sin(index * 0.33) * 140 + Math.cos(index * 0.2) * 90));

    const macroPulse = Math.sin((index / 13) * Math.PI) * 0.1;
    const latePulse = Math.cos(((index / 13) * Math.PI) + 1) * 0.07;
    const volatility = Math.sin(index * 0.55) * 0.035 + Math.cos(index * 0.4) * 0.03;

    let level1Share = 0.32 + macroPulse * 0.45 + volatility * -0.2 + Math.cos(index * 0.26) * 0.04;
    let level2Share = 0.27 + macroPulse * -0.33 + volatility * 0.35 + Math.sin(index * 0.3 + 0.5) * 0.04;
    let level3Share = 0.22 + macroPulse * 0.16 + latePulse * -0.18 + Math.cos(index * 0.34 + 0.8) * 0.035;
    let level4Share = 0.12 + macroPulse * -0.1 + volatility * 0.24 + Math.sin(index * 0.4 + 1.1) * 0.03;
    let level5Share = 0.07 + macroPulse * 0.07 + latePulse * 0.18 + Math.cos(index * 0.48 + 1.4) * 0.028;

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

    const shares: Record<PlayStoreSentimentLevelKey, number> = {
      level1: level1Share,
      level2: level2Share,
      level3: level3Share,
      level4: level4Share,
      level5: level5Share,
    };

    const levelCounts: Record<PlayStoreSentimentLevelKey, number> = {
      level1: Math.round(reviewVolume * shares.level1),
      level2: Math.round(reviewVolume * shares.level2),
      level3: Math.round(reviewVolume * shares.level3),
      level4: Math.round(reviewVolume * shares.level4),
      level5: Math.round(reviewVolume * shares.level5),
    };

    const topicsByLevel: Record<PlayStoreSentimentLevelKey, PlayStoreReviewTrendTopic[]> = {
      level1: [],
      level2: [],
      level3: [],
      level4: [],
      level5: [],
    };

    (Object.keys(levelCounts) as PlayStoreSentimentLevelKey[]).forEach(levelKey => {
      const templates = levelTopics[levelKey];
      const firstTemplate = templates[(index + templates.length) % templates.length];
      const secondTemplate = templates[(index + 1 + templates.length) % templates.length];
      const thirdTemplate = templates[(index + 2 + templates.length) % templates.length];
      const pool = levelCounts[levelKey];

      const primaryShare = levelKey === 'level1' ? 0.54 : levelKey === 'level5' ? 0.66 : 0.58;
      const secondaryShare = levelKey === 'level4' ? 0.25 : 0.28;
      let firstReviews = Math.max(18, Math.round(pool * primaryShare));
      let secondReviews = Math.max(12, Math.round(pool * secondaryShare));
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

      const topicsArray: PlayStoreReviewTrendTopic[] = [];
      if (firstReviews > 0) {
        topicsArray.push({
          topic: firstTemplate.topic,
          reviews: firstReviews,
          helpfulVotes: buildHelpful(firstReviews, firstTemplate.helpfulMultiplier),
        });
      }
      if (secondReviews > 0) {
        topicsArray.push({
          topic: secondTemplate.topic,
          reviews: secondReviews,
          helpfulVotes: buildHelpful(secondReviews, secondTemplate.helpfulMultiplier),
        });
      }
      if (thirdReviews > 0) {
        topicsArray.push({
          topic: thirdTemplate.topic,
          reviews: thirdReviews,
          helpfulVotes: buildHelpful(thirdReviews, thirdTemplate.helpfulMultiplier * 0.9),
        });
      }

      topicsByLevel[levelKey] = topicsArray;
    });

    return {
      date: date.toISOString().split('T')[0],
      level1: Math.round(level1Share * 1000) / 10,
      level2: Math.round(level2Share * 1000) / 10,
      level3: Math.round(level3Share * 1000) / 10,
      level4: Math.round(level4Share * 1000) / 10,
      level5: Math.round(level5Share * 1000) / 10,
      reviewVolume,
      topicsByLevel,
    };
  });
}

