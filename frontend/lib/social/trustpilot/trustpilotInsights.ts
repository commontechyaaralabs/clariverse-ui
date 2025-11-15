import {
  TrustpilotDashboardData,
  TrustpilotEnhancedDashboardData,
  BANK_SOCIAL_TOPICS,
} from '@/lib/api';
import {
  buildComplianceFeatureDataset,
  type CategorySummary,
  type ComplianceFeatureDataset,
  type SentimentLevelMap,
  type SentimentLevelKey,
  type ViralityTopicSummary,
  type TopicWordCloudEntry,
} from './complianceFeature';

export const SENTIMENT_LEVELS = [
  { key: 'level1', label: '1 • Happy', short: 'Happy', color: '#22c55e' },
  { key: 'level2', label: '2 • Bit Irritated', short: 'Bit Irritated', color: '#3b82f6' },
  { key: 'level3', label: '3 • Moderately Concerned', short: 'Moderately Concerned', color: '#9CA3AF' },
  { key: 'level4', label: '4 • Anger', short: 'Anger', color: '#f97316' },
  { key: 'level5', label: '5 • Frustrated', short: 'Frustrated', color: '#ef4444' },
] as const satisfies ReadonlyArray<{
  key: SentimentLevelKey;
  label: string;
  short: string;
  color: string;
}>;

export type SentimentLevelDefinition = (typeof SENTIMENT_LEVELS)[number];

export interface TrustpilotViralPost {
  id: string;
  topic: string;
  summary: string;
  postContent: string;
  timestamp: string;
  author: string;
  sentiment: number;
  sentimentLevel: number;
  viralityScore: number;
  nextAction: string;
  helpfulVotes: number;
  notHelpfulVotes: number;
  reviewViews: number;
  starRating: number;
  sentimentScore: number;
  urgency: 'High' | 'Medium' | 'Low';
  trending: 'Yes' | 'No';
}

export interface TrustpilotInsights {
  metadata: TrustpilotEnhancedDashboardData['metadata'] | {
    last_updated: string;
    update_frequency_seconds: number;
    total_reviews: number;
    trustscore: number;
    response_rate: number;
    avg_response_time_hours: number;
    reputation_risk_score: number;
    clv_at_risk: number;
    unresolved_alerts: number;
    fake_reviews_flagged: number;
    top_complaint: string;
    top_complaint_percentage: number;
  } | null;
  negativeReviewsPercent: number;
  viralityTopics: ViralityTopicSummary[];
  dominantTopicData: Array<{
    name: string;
    helpfulVotes: number;
    viralityScore: number;
    level1: number;
    level2: number;
    level3: number;
    level4: number;
    level5: number;
  }>;
  complianceFeatureDataset: ComplianceFeatureDataset;
  viralNegativePosts: TrustpilotViralPost[];
  sentimentAreaData: Array<{
    level: string;
    compliance: number;
    feature: number;
    appreciation: number;
  }>;
  hasAreaData: boolean;
}

export interface AITrustForecastPoint {
  date: string;
  actualScore: number | null;
  forecastScore: number | null;
  confidenceLower: number;
  confidenceUpper: number;
  confidenceBand: number;
  isForecast: boolean;
}

export interface AITrustDriver {
  label: string;
  impact: number;
  direction: 'positive' | 'negative' | 'neutral';
}

export interface AITrustForecastData {
  points: AITrustForecastPoint[];
  drivers: AITrustDriver[];
  summary: string;
}

export interface TrustpilotPositiveNegativePoint {
  day: number;
  positive: number;
  negative: number;
}

export interface TrustpilotTopicVolumeSplitEntry {
  name: string;
  volume: number;
  sentiment: 'positive' | 'negative';
}

interface BuildTrustpilotInsightsOptions {
  enhancedData: TrustpilotEnhancedDashboardData | null;
  legacyData: TrustpilotDashboardData | null;
  bankTopics?: string[];
}

const WORD_CLOUD_STOP_WORDS = new Set([
  'the',
  'and',
  'for',
  'with',
  'that',
  'from',
  'into',
  'about',
  'this',
  'have',
  'has',
  'are',
  'was',
  'were',
  'been',
  'their',
  'your',
  'our',
  'customer',
  'customers',
  'client',
  'clients',
  'user',
  'users',
  'service',
  'services',
  'support',
  'team',
  'issue',
  'issues',
  'problem',
  'problems',
  'feedback',
  'feature',
  'features',
  'request',
  'requests',
  'trustpilot',
  'experience',
  'providing',
  'provide',
  'making',
  'needs',
  'also',
  'can',
  'able',
  'more',
]);

const LEADING_PHRASE_STOP_WORDS = new Set([
  'need',
  'needs',
  'want',
  'wants',
  'please',
  'add',
  'adding',
  'include',
  'including',
  'introduce',
  'introducing',
  'enable',
  'enabling',
  'allow',
  'allowing',
  'provide',
  'providing',
  'offer',
  'offering',
  'bring',
  'bringing',
  'make',
  'making',
  'should',
  'could',
  'prefer',
  'preferably',
]);

const TITLE_CASE_EXCEPTIONS = new Set(['UPI', 'NEFT', 'IMPS', 'QR', 'EMI', 'EMIs', 'API', 'AI', 'KYC', 'AML']);

const FEATURE_TOPIC_KEYWORDS: Record<string, string[]> = {
  'digital innovation appreciation': [
    'Dark Mode',
    'Unified Account Dashboard',
    'Instant Fund Transfers',
    'Card Management Hub',
    'Smart Loan Assistant',
  ],
  'unified account dashboard': [
    'Portfolio Snapshot',
    '360° Balance View',
    'Investment Tracker',
    'Spending Insights',
    'Customisable Widgets',
  ],
  'instant fund transfers': [
    'Predictive Recipient Suggestions',
    'One-Tap UPI',
    'Instant NEFT',
    'IMPS Automation',
    'QR Payments',
  ],
  'card management hub': [
    'Freeze or Unfreeze Card',
    'Dynamic Spend Limits',
    'Real-Time Alerts',
    'Virtual Card Controls',
    'Geo-Fencing',
  ],
  'smart loan assistant': [
    'AI Eligibility Check',
    'Instant EMI Simulation',
    'Pre-Approved Offers',
    'Document Checklist',
    'Refinance Recommendations',
  ],
};

const toReadableCase = (phrase: string) =>
  phrase
    .split(/\s+/)
    .map(word => {
      const upper = word.toUpperCase();
      if (TITLE_CASE_EXCEPTIONS.has(upper)) {
        return upper;
      }
      return upper.charAt(0) + upper.slice(1).toLowerCase();
    })
    .join(' ');

const extractFeaturePhrases = (text: string): string[] => {
  if (!text) {
    return [];
  }

  const cleaned = text.replace(/[–—]/g, '-');
  const segments = cleaned
    .split(/[\n\r•]+/)
    .flatMap(segment => segment.split(/[.;!?]+/))
    .map(segment => segment.trim())
    .filter(Boolean);

  const phrases: string[] = [];
  segments.forEach(segment => {
    const [primary] = segment.split(/[-:]+/);
    if (!primary) {
      return;
    }
    const words = primary.split(/\s+/);
    while (words.length > 0 && LEADING_PHRASE_STOP_WORDS.has(words[0].toLowerCase())) {
      words.shift();
    }
    const phrase = words.join(' ').trim();
    if (phrase.length < 3) {
      return;
    }
    phrases.push(toReadableCase(phrase));
  });

  return Array.from(
    new Map(phrases.map(phrase => [phrase.toLowerCase(), phrase])).values()
  );
};

const buildCuratedWordCloud = (topicName: string): TopicWordCloudEntry[] | null => {
  const keywords = FEATURE_TOPIC_KEYWORDS[topicName.toLowerCase()];
  if (!keywords?.length) {
    return null;
  }
  return keywords.map((term, index) => ({
    term,
    weight: keywords.length - index + 5,
  }));
};

const CURATED_FEATURE_TOPICS: Array<{
  name: string;
  dominantSentiment: SentimentLevelKey;
  totalPosts: number;
  helpfulVotes: number;
  viralityScore: number;
  sentimentLevels?: SentimentLevelMap;
  wordCloud?: TopicWordCloudEntry[];
}> = [
  { name: 'Digital Innovation Appreciation', dominantSentiment: 'level1', totalPosts: 88, helpfulVotes: 9, viralityScore: 600 },
  { name: 'Unified Account Dashboard', dominantSentiment: 'level2', totalPosts: 68, helpfulVotes: 32, viralityScore: 640 },
  { name: 'Instant Fund Transfers', dominantSentiment: 'level3', totalPosts: 62, helpfulVotes: 29, viralityScore: 580 },
  { name: 'Card Management Hub', dominantSentiment: 'level4', totalPosts: 56, helpfulVotes: 27, viralityScore: 540 },
  { name: 'Smart Loan Assistant', dominantSentiment: 'level5', totalPosts: 52, helpfulVotes: 25, viralityScore: 520 },
];

const CURATED_APPRECIATION_TOPICS: Array<{
  name: string;
  dominantSentiment: SentimentLevelKey;
  totalPosts: number;
  helpfulVotes: number;
  viralityScore: number;
  wordCloud?: TopicWordCloudEntry[];
  sentimentLevels?: SentimentLevelMap;
}> = [
  {
    name: 'Relationship Manager Shout-outs',
    dominantSentiment: 'level1',
    totalPosts: 74,
    helpfulVotes: 42,
    viralityScore: 480,
    wordCloud: [
      { term: 'personalised check-ins', weight: 12 },
      { term: 'swift callbacks', weight: 10 },
      { term: 'proactive solutions', weight: 9 },
    ],
    sentimentLevels: { level1: 76, level2: 16, level3: 8, level4: 0, level5: 0 },
  },
  {
    name: 'Branch Experience Praise',
    dominantSentiment: 'level1',
    totalPosts: 68,
    helpfulVotes: 39,
    viralityScore: 452,
    wordCloud: [
      { term: 'warm welcome', weight: 11 },
      { term: 'efficient queues', weight: 9 },
      { term: 'knowledgeable staff', weight: 8 },
    ],
    sentimentLevels: { level1: 74, level2: 18, level3: 8, level4: 0, level5: 0 },
  },
  {
    name: 'Digital Service Appreciation',
    dominantSentiment: 'level2',
    totalPosts: 71,
    helpfulVotes: 34,
    viralityScore: 438,
    wordCloud: [
      { term: 'instant approvals', weight: 10 },
      { term: 'smooth onboarding', weight: 9 },
      { term: 'bug-free release', weight: 8 },
    ],
    sentimentLevels: { level1: 62, level2: 28, level3: 10, level4: 0, level5: 0 },
  },
];

const buildWordCloudEntries = (text: string | undefined): TopicWordCloudEntry[] => {
  if (!text) {
    return [];
  }

  const featurePhrases = extractFeaturePhrases(text);
  if (featurePhrases.length > 0) {
    return featurePhrases.map((phrase, index) => ({
      term: phrase,
      weight: featurePhrases.length - index + 3,
    }));
  }

  const frequency = new Map<string, number>();
  const tokens = text
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, ' ')
    .split(/\s+/)
    .map(token => token.trim())
    .filter(token => token.length > 2 && !WORD_CLOUD_STOP_WORDS.has(token));

  tokens.forEach(token => {
    frequency.set(token, (frequency.get(token) ?? 0) + 1);
  });

  return Array.from(frequency.entries())
    .sort((a, b) => b[1] - a[1])
    .slice(0, 15)
    .map(([term, weight]) => ({ term: toReadableCase(term), weight }));
};

const calculateNegativeReviewsPercent = (
  enhancedData: TrustpilotEnhancedDashboardData | null,
  legacyData: TrustpilotDashboardData | null
) => {
  if (enhancedData?.clusters?.length) {
    const totalVolume = enhancedData.clusters.reduce((sum, cluster) => sum + cluster.volume, 0);
    const negativeVolume = enhancedData.clusters.reduce(
      (sum, cluster) => sum + cluster.volume * cluster.sentiment.negative,
      0
    );
    return totalVolume > 0 ? Math.round((negativeVolume / totalVolume) * 100) : 0;
  }
  return legacyData?.kpis?.negativeReviewsPercent ?? 0;
};

const fallbackMetadata = (legacyData: TrustpilotDashboardData | null) => {
  if (!legacyData) {
    return null;
  }

  const { kpis, clusters } = legacyData;

  return {
    last_updated: new Date().toISOString(),
    update_frequency_seconds: 60,
    total_reviews: kpis.totalReviews,
    trustscore: kpis.avgRating,
    response_rate: 0.87,
    avg_response_time_hours: 18,
    reputation_risk_score: 4.2,
    clv_at_risk: 2300000,
    unresolved_alerts: 12,
    fake_reviews_flagged: 3,
    top_complaint: clusters[0] || 'N/A',
    top_complaint_percentage: 28,
  };
};

const calculateTop10NegativeTopics = (
  legacyTopicBubbles: NonNullable<TrustpilotDashboardData['topicBubbles']>,
  bankTopics: string[]
) => {
  const allTopics = [...legacyTopicBubbles];

  if (allTopics.length < 10) {
    const existingTopicNames = new Set(allTopics.map(topic => topic.topic.toLowerCase()));
    bankTopics.forEach((bankTopic, idx) => {
      if (!existingTopicNames.has(bankTopic.toLowerCase()) && allTopics.length < 10) {
        const mockSentiment = (idx % 5 - 2) * 0.3;
        const mockVolume = 50 + idx * 10;
        allTopics.push({
          topic: bankTopic,
          volume: mockVolume,
          sentiment: mockSentiment,
          aiSummary: `AI summary for ${bankTopic}`,
        });
      }
    });
  }

  const topicsWithVirality = allTopics.map(topic => {
    const engagementMultiplier = topic.sentiment < -0.3 ? 1.5 : topic.sentiment > 0.3 ? 1.2 : 1.0;
    const viralityScore = topic.volume * engagementMultiplier * (1 + Math.abs(topic.sentiment));
    return {
      ...topic,
      viralityScore,
    };
  });

  return topicsWithVirality
    .filter(topic => topic.sentiment < 0)
    .sort((a, b) => b.viralityScore - a.viralityScore)
    .slice(0, 10);
};

const generateActionSuggestion = (topic: { topic: string; sentiment: number }): string => {
  const topicLower = topic.topic.toLowerCase();
  const { sentiment } = topic;

  if (topicLower.includes('payment') || topicLower.includes('transaction')) {
    if (sentiment < -0.5) {
      return 'Urgent: Investigate payment gateway issues. Contact payment provider and review recent system updates. Notify affected customers immediately.';
    }
    return 'Monitor payment processing logs. Review error rates and implement fallback mechanisms.';
  }
  if (topicLower.includes('app') || topicLower.includes('mobile') || topicLower.includes('crash')) {
    if (sentiment < -0.5) {
      return 'Critical: Review crash reports and recent app updates. Prioritise hotfix release and communicate resolution timelines.';
    }
    return 'Analyse crash logs and device compatibility. Schedule app stability improvements in the next release.';
  }
  if (topicLower.includes('support') || topicLower.includes('call')) {
    if (sentiment < -0.5) {
      return 'High Priority: Review support team response times and escalate complex cases. Provide refresher training immediately.';
    }
    return 'Enhance support documentation and coaching to maintain consistency.';
  }
  if (topicLower.includes('access') || topicLower.includes('account')) {
    if (sentiment < -0.5) {
      return 'Urgent: Audit authentication systems and provide alternative access pathways for locked-out customers.';
    }
    return 'Improve account recovery flows and reduce friction in verification steps.';
  }
  if (topicLower.includes('fee') || topicLower.includes('charge')) {
    if (sentiment < -0.5) {
      return 'Review fee transparency and communicate changes clearly. Consider goodwill adjustments where appropriate.';
    }
    return 'Clarify pricing details within onboarding and FAQs to reduce confusion.';
  }
  if (topicLower.includes('system') || topicLower.includes('outage')) {
    if (sentiment < -0.5) {
      return 'Critical: Investigate platform stability, implement redundancy, and provide real-time incident updates.';
    }
    return 'Monitor infrastructure KPIs closely and schedule preventative maintenance.';
  }

  if (sentiment < -0.5) {
    return `Urgent action required for ${topic.topic}. Investigate feedback drivers and deploy a rapid response plan.`;
  }
  return `Monitor ${topic.topic} closely and plan targeted improvements to uplift sentiment.`;
};

const generateNegativePostSummary = (topic: { topic: string; sentiment: number; volume: number }) => {
  const topicLower = topic.topic.toLowerCase();
  const summaries: Record<string, string[]> = {
    payment: [
      'Multiple users report payment failures during checkout with unclear error messages.',
      'Customers experience significant delays in payment processing, leaving transactions pending for hours.',
      'Payment gateway issues are causing repeated transaction failures, blocking purchases.',
      'Recurring payment glitches are eroding trust, with delays in issuing refunds.',
    ],
    app: [
      'The latest mobile update introduces frequent crashes, blocking access to key features.',
      'Users encounter freezing and forced restarts during login, impacting productivity.',
      'App performance has degraded with slow load times and intermittent crashes.',
      'Critical crash observed whenever users attempt actions in the payments section.',
    ],
    support: [
      'Support wait times have spiked, with customers reporting hours-long delays.',
      'Frontline support is struggling with payment-related cases, slowing resolutions.',
      'Customers feel ignored due to inconsistent follow-ups from the support desk.',
      'Agents appear under-trained on new releases, resulting in mixed guidance.',
    ],
    access: [
      'Customers are locked out of accounts with password reset flows failing silently.',
      'Account access is being blocked without clear messaging on remediation steps.',
      'Two-factor authentication misfires are preventing legitimate logins.',
      'Account recovery journeys are too complex, leaving users stranded.',
    ],
    fee: [
      'Hidden fees surface after transactions, with customers citing misleading communication.',
      'Unexpected fee increases are being flagged without any advanced notice.',
      'High transaction fees are pushing users to consider alternative providers.',
      'Fee statements remain confusing, with multiple unexplained charges appearing.',
    ],
    system: [
      'A widespread outage is impacting all services with limited communication on timelines.',
      'Intermittent system failures are emerging during peak hours.',
      'Overall system responsiveness is down, creating frustration during critical tasks.',
      'Extended maintenance windows are leading to prolonged downtime without backups.',
    ],
  };

  for (const [key, summaryList] of Object.entries(summaries)) {
    if (topicLower.includes(key)) {
      const index = Math.floor(Math.abs(topic.sentiment) * summaryList.length) % summaryList.length;
      return summaryList[index];
    }
  }

  const defaultSummaries = [
    `Multiple negative reports surface around ${topic.topic}, signalling urgent attention is needed.`,
    `A significant wave of complaints regarding ${topic.topic} is bringing sentiment down.`,
    `Customer concerns about ${topic.topic} are increasing across channels.`,
    `Critical blockers reported within ${topic.topic}. Swift intervention recommended.`,
  ];
  const index = Math.floor(Math.abs(topic.sentiment) * defaultSummaries.length) % defaultSummaries.length;
  return defaultSummaries[index];
};

const generateViralNegativePosts = (
  topics: ReturnType<typeof calculateTop10NegativeTopics>
): TrustpilotViralPost[] => {
  return topics.map((topic, index) => {
    const postContent = generateNegativePostSummary(topic);
    const timestamp = new Date(Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000).toISOString();
    const author = `User${Math.floor(Math.random() * 1000)}`;
    const sentimentLevel = topic.sentiment <= -0.6 ? 5 : topic.sentiment <= -0.2 ? 4 : 3;

    const reviewViews = Math.round(topic.volume * (15 + Math.random() * 25));
    const helpfulVotes = Math.round(reviewViews * (0.02 + Math.random() * 0.05));
    const notHelpfulVotes = Math.round(helpfulVotes * (0.02 + Math.random() * 0.08));

    let starRating: number;
    if (topic.sentiment <= -0.6) {
      starRating = Math.random() > 0.5 ? 1 : 2;
    } else if (topic.sentiment <= -0.2) {
      starRating = Math.random() > 0.3 ? 2 : 3;
    } else if (topic.sentiment <= 0.2) {
      starRating = Math.random() > 0.5 ? 3 : 4;
    } else {
      starRating = Math.random() > 0.3 ? 4 : 5;
    }

    return {
      id: `trustpilot-post-${index}`,
      topic: topic.topic,
      summary: postContent,
      postContent,
      timestamp,
      author,
      sentiment: topic.sentiment,
      sentimentLevel,
      viralityScore: Math.round(topic.viralityScore),
      nextAction: generateActionSuggestion(topic),
      helpfulVotes,
      notHelpfulVotes,
      reviewViews,
      starRating,
      sentimentScore: Math.round((topic.sentiment + 1) * 50),
      urgency: sentimentLevel >= 4 ? 'High' : sentimentLevel === 3 ? 'Medium' : 'Low',
      trending: reviewViews > 500 ? 'Yes' : 'No',
    };
  });
};

const buildViralityTopics = (
  legacyTopicBubbles: NonNullable<TrustpilotDashboardData['topicBubbles']>,
  viralNegativePosts: TrustpilotViralPost[],
  bankTopics: string[]
): ViralityTopicSummary[] => {
  const allTopics = [...legacyTopicBubbles];
  const helpfulVotesByTopic = viralNegativePosts.reduce((map, post) => {
    map.set(post.topic, (map.get(post.topic) || 0) + (post.helpfulVotes || 0));
    return map;
  }, new Map<string, number>());

  if (allTopics.length < 10) {
    const existingTopicNames = new Set(allTopics.map(t => t.topic.toLowerCase()));
    bankTopics.forEach((bankTopic, idx) => {
      if (!existingTopicNames.has(bankTopic.toLowerCase()) && allTopics.length < 10) {
        const mockSentiment = (idx % 5 - 2) * 0.3;
        const mockVolume = 50 + idx * 10;
        allTopics.push({
          topic: bankTopic,
          volume: mockVolume,
          sentiment: mockSentiment,
          aiSummary: `AI summary for ${bankTopic}`,
        });
      }
    });
  }

  const topicsWithVirality = allTopics.map(topic => {
    const engagementMultiplier = topic.sentiment < -0.3 ? 1.5 : topic.sentiment > 0.3 ? 1.2 : 1.0;
    const viralityScore = topic.volume * engagementMultiplier * (1 + Math.abs(topic.sentiment));
    return {
      ...topic,
      viralityScore,
    };
  });

  return topicsWithVirality
    .sort((a, b) => b.viralityScore - a.viralityScore)
    .slice(0, 10)
    .map(topic => {
      const curatedWordCloud = buildCuratedWordCloud(topic.topic);
      const wordCloud = curatedWordCloud ?? buildWordCloudEntries(`${topic.topic} ${topic.aiSummary ?? ''}`);
      const sentimentLevel = (() => {
        if (topic.sentiment <= -0.6) return 5;
        if (topic.sentiment <= -0.2) return 4;
        if (topic.sentiment <= 0.2) return 3;
        if (topic.sentiment <= 0.6) return 2;
        return 1;
      })();

      const distribution: Record<number, number> = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };

      if (sentimentLevel === 1) {
        distribution[1] = Math.round(topic.volume * 0.7);
        distribution[2] = Math.round(topic.volume * 0.25);
        distribution[3] = Math.round(topic.volume * 0.05);
      } else if (sentimentLevel === 2) {
        distribution[1] = Math.round(topic.volume * 0.2);
        distribution[2] = Math.round(topic.volume * 0.65);
        distribution[3] = Math.round(topic.volume * 0.15);
      } else if (sentimentLevel === 3) {
        distribution[2] = Math.round(topic.volume * 0.25);
        distribution[3] = Math.round(topic.volume * 0.5);
        distribution[4] = Math.round(topic.volume * 0.25);
      } else if (sentimentLevel === 4) {
        distribution[3] = Math.round(topic.volume * 0.15);
        distribution[4] = Math.round(topic.volume * 0.65);
        distribution[5] = Math.round(topic.volume * 0.2);
      } else {
        distribution[4] = Math.round(topic.volume * 0.25);
        distribution[5] = Math.round(topic.volume * 0.7);
        distribution[3] = Math.round(topic.volume * 0.05);
      }

      const total = distribution[1] + distribution[2] + distribution[3] + distribution[4] + distribution[5];
      const toPercent = (value: number) => Number(((value / (total || 1)) * 100).toFixed(1));

      const helpfulVotes = helpfulVotesByTopic.get(topic.topic) ?? Math.max(Math.round(topic.viralityScore / 20), 0);

      const levelPercents = {
        level1: total > 0 ? toPercent(distribution[1]) : 0,
        level2: total > 0 ? toPercent(distribution[2]) : 0,
        level3: total > 0 ? toPercent(distribution[3]) : 0,
        level4: total > 0 ? toPercent(distribution[4]) : 0,
        level5: total > 0 ? toPercent(distribution[5]) : 0,
      };

      const levelSum = Number(
        (
          levelPercents.level1 +
          levelPercents.level2 +
          levelPercents.level3 +
          levelPercents.level4 +
          levelPercents.level5
        ).toFixed(1)
      );

      if (total > 0 && levelSum !== 100) {
        const diff = Number((100 - levelSum).toFixed(1));
        levelPercents.level5 = Number((levelPercents.level5 + diff).toFixed(1));
      }

      return {
        name: topic.topic,
        helpfulVotes,
        viralityScore: Math.round(topic.viralityScore),
        totalPosts: topic.volume,
        sentimentLevels: levelPercents,
        wordCloud,
      };
    });
};

const buildDominantTopicData = (viralityTopics: ViralityTopicSummary[]) =>
  viralityTopics
    .slice()
    .sort((a, b) => {
      if (b.helpfulVotes !== a.helpfulVotes) {
        return b.helpfulVotes - a.helpfulVotes;
      }
      return b.viralityScore - a.viralityScore;
    })
    .map(topic => ({
      name: topic.name,
      helpfulVotes: topic.helpfulVotes,
      viralityScore: topic.viralityScore,
      level1: topic.sentimentLevels.level1,
      level2: topic.sentimentLevels.level2,
      level3: topic.sentimentLevels.level3,
      level4: topic.sentimentLevels.level4,
      level5: topic.sentimentLevels.level5,
    }));

const mergeCuratedFeatureTopics = (topics: ViralityTopicSummary[]): ViralityTopicSummary[] => {
  const merged = [...topics];

  [...CURATED_FEATURE_TOPICS, ...CURATED_APPRECIATION_TOPICS].forEach(curated => {
    const key = curated.name.toLowerCase();
    const existingIndex = merged.findIndex(topic => topic.name.toLowerCase() === key);

    if (existingIndex >= 0) {
      const existingTopic = merged[existingIndex];
      merged[existingIndex] = {
        ...existingTopic,
        sentimentLevels: curated.sentimentLevels ?? existingTopic.sentimentLevels,
        wordCloud:
          curated.wordCloud ??
          buildCuratedWordCloud(curated.name) ??
          existingTopic.wordCloud,
      };
      return;
    }

    const defaultSentimentLevels: SentimentLevelMap = curated.sentimentLevels ?? {
      level1: curated.dominantSentiment === 'level1' ? 100 : 0,
      level2: curated.dominantSentiment === 'level2' ? 100 : 0,
      level3: curated.dominantSentiment === 'level3' ? 100 : 0,
      level4: curated.dominantSentiment === 'level4' ? 100 : 0,
      level5: curated.dominantSentiment === 'level5' ? 100 : 0,
    };

    merged.push({
      name: curated.name,
      helpfulVotes: curated.helpfulVotes,
      viralityScore: curated.viralityScore,
      totalPosts: curated.totalPosts,
      sentimentLevels: defaultSentimentLevels,
      wordCloud: curated.wordCloud ?? buildCuratedWordCloud(curated.name) ?? [],
    });
  });

  return merged;
};

const buildSentimentAreaData = (
  dataset: ComplianceFeatureDataset,
  sentimentLevels = SENTIMENT_LEVELS
) => {
  const getPct = (summary: CategorySummary | undefined, key: SentimentLevelKey) =>
    summary?.sentimentSegments.find(segment => segment.key === key)?.percentage ?? 0;

  const complianceSummary = dataset.summaries.find(summary => summary.key === 'compliance');
  const featureSummary = dataset.summaries.find(summary => summary.key === 'feature');
  const appreciationSummary = dataset.summaries.find(summary => summary.key === 'appreciation');
  const appreciationTotalPct =
    appreciationSummary?.sentimentSegments.reduce((sum, segment) => sum + segment.percentage, 0) ?? 0;

  return sentimentLevels.map(level => ({
    level: level.label,
    compliance: getPct(complianceSummary, level.key),
    feature: getPct(featureSummary, level.key),
    appreciation: level.key === 'level1' ? appreciationTotalPct : 0,
  }));
};

export const buildTrustpilotInsights = ({
  enhancedData,
  legacyData,
  bankTopics = BANK_SOCIAL_TOPICS,
}: BuildTrustpilotInsightsOptions): TrustpilotInsights => {
  const metadata = enhancedData?.metadata || fallbackMetadata(legacyData);
  const negativeReviewsPercent = calculateNegativeReviewsPercent(enhancedData, legacyData);

  const legacyTopicBubbles = legacyData?.topicBubbles ?? [];
  const top10NegativeTopics = calculateTop10NegativeTopics(legacyTopicBubbles, bankTopics);
  const viralNegativePosts = generateViralNegativePosts(top10NegativeTopics);
  const baseViralityTopics = buildViralityTopics(legacyTopicBubbles, viralNegativePosts, bankTopics);
  const viralityTopics = mergeCuratedFeatureTopics(baseViralityTopics);

  const complianceFeatureDataset = buildComplianceFeatureDataset(viralityTopics);
  const dominantTopicData = buildDominantTopicData(viralityTopics);
  const sentimentAreaData = buildSentimentAreaData(complianceFeatureDataset);
  const hasAreaData = sentimentAreaData.some(
    point => point.compliance > 0.1 || point.feature > 0.1 || point.appreciation > 0.1
  );

  return {
    metadata,
    negativeReviewsPercent,
    viralityTopics,
    dominantTopicData,
    complianceFeatureDataset,
    viralNegativePosts,
    sentimentAreaData,
    hasAreaData,
  };
};

export const expandToDailyDates = (
  data: Array<{ date: string; sentiment: number; reviewVolume: number }>
) => {
  if (data.length === 0) return data;

  if (data.length > 20) {
    return data.map(d => ({
      ...d,
      date: new Date(d.date).toISOString().split('T')[0],
    }));
  }

  const sortedData = [...data].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
  const firstDate = new Date(sortedData[0].date);
  const lastDate = new Date(sortedData[sortedData.length - 1].date);
  const dailyData: Array<{ date: string; sentiment: number; reviewVolume: number }> = [];

  const dataMap = new Map<string, { sentiment: number; reviewVolume: number }>();
  sortedData.forEach(d => {
    const dateKey = new Date(d.date).toISOString().split('T')[0];
    dataMap.set(dateKey, { sentiment: d.sentiment, reviewVolume: d.reviewVolume });
  });

  const currentDate = new Date(firstDate);
  let lastKnownData = sortedData[0];

  while (currentDate <= lastDate) {
    const dateKey = currentDate.toISOString().split('T')[0];
    const existingData = dataMap.get(dateKey);

    if (existingData) {
      const dataPoint = {
        date: dateKey,
        sentiment: existingData.sentiment,
        reviewVolume: existingData.reviewVolume,
      };
      dailyData.push(dataPoint);
      lastKnownData = { date: dateKey, ...existingData };
    } else {
      dailyData.push({
        date: dateKey,
        sentiment: lastKnownData.sentiment,
        reviewVolume: Math.round(lastKnownData.reviewVolume * 0.8),
      });
    }

    currentDate.setDate(currentDate.getDate() + 1);
  }

  return dailyData;
};

export const getAITrustForecastData = (): AITrustForecastData => {
  const rawPoints: Array<{
    date: string;
    actual?: number;
    forecast?: number;
    lower?: number;
    upper?: number;
  }> = [
    { date: 'Aug 07', actual: 59.4 },
    { date: 'Aug 10', actual: 60.2 },
    { date: 'Aug 13', actual: 59.8 },
    { date: 'Aug 16', actual: 60.9 },
    { date: 'Aug 19', actual: 61.6 },
    { date: 'Aug 22', actual: 60.7 },
    { date: 'Aug 25', actual: 61.5 },
    { date: 'Aug 28', actual: 62.6 },
    { date: 'Aug 31', actual: 61.9 },
    { date: 'Sep 03', actual: 63.2 },
    { date: 'Sep 06', actual: 63.9 },
    { date: 'Sep 09', actual: 64.7 },
    { date: 'Sep 12', actual: 63.8 },
    { date: 'Sep 15', actual: 65.1 },
    { date: 'Sep 18', actual: 64.4 },
    { date: 'Sep 21', actual: 65.6 },
    { date: 'Sep 24', forecast: 66.3, lower: 64.5, upper: 68.0 },
    { date: 'Sep 27', forecast: 67.1, lower: 65.0, upper: 69.2 },
    { date: 'Sep 30', forecast: 67.9, lower: 65.6, upper: 70.3 },
    { date: 'Oct 03', forecast: 68.8, lower: 66.2, upper: 71.1 },
    { date: 'Oct 06', forecast: 69.6, lower: 66.8, upper: 72.4 },
    { date: 'Oct 09', forecast: 70.3, lower: 67.3, upper: 73.3 },
    { date: 'Oct 12', forecast: 71.1, lower: 67.9, upper: 74.2 },
  ];

  const points: AITrustForecastPoint[] = rawPoints.map(point => {
    const isForecast = typeof point.forecast === 'number';
    const confidenceLower = isForecast ? point.lower ?? point.forecast! - 1.8 : 0;
    const confidenceUpper = isForecast ? point.upper ?? point.forecast! + 1.8 : 0;
    const confidenceBand = isForecast ? confidenceUpper - confidenceLower : 0;

    return {
      date: point.date,
      actualScore: isForecast ? null : point.actual ?? null,
      forecastScore: isForecast ? point.forecast ?? null : null,
      confidenceLower,
      confidenceUpper,
      confidenceBand,
      isForecast,
    };
  });

  const drivers: AITrustDriver[] = [
    { label: 'Mobile App UX', impact: 0.8, direction: 'positive' },
    { label: 'Loan Process Simplification', impact: -0.9, direction: 'negative' },
    { label: 'Customer Support Responsiveness', impact: 0.5, direction: 'positive' },
    { label: 'Account Security Confidence', impact: 0.3, direction: 'positive' },
    { label: 'Fees & Charges Transparency', impact: -0.3, direction: 'negative' },
  ];

  const summary =
    'Trust is projected to rise by ~3 points over the next month after oscillating through late September. Gains are powered by sustained improvements in mobile experience and faster support queues, while loan journey friction continues to weigh on momentum.';

  return {
    points,
    drivers,
    summary,
  };
};

const POSITIVE_NEGATIVE_SERIES: TrustpilotPositiveNegativePoint[] = [
  { day: 1, positive: 2, negative: -1 },
  { day: 2, positive: 6, negative: -2 },
  { day: 3, positive: 4, negative: -5 },
  { day: 4, positive: 9, negative: -8 },
  { day: 5, positive: 5, negative: -3 },
  { day: 6, positive: 12, negative: -9 },
  { day: 7, positive: 8, negative: -4 },
  { day: 8, positive: 15, negative: -12 },
  { day: 9, positive: 7, negative: -2 },
  { day: 10, positive: 18, negative: -11 },
  { day: 11, positive: 11, negative: -3 },
  { day: 12, positive: 22, negative: -7 },
  { day: 13, positive: 14, negative: -4 },
  { day: 14, positive: 26, negative: -1 },
  { day: 15, positive: 19, negative: -6 },
  { day: 16, positive: 30, negative: -10 },
  { day: 17, positive: 24, negative: -2 },
  { day: 18, positive: 32, negative: -14 },
  { day: 19, positive: 28, negative: -9 },
  { day: 20, positive: 38, negative: -6 },
  { day: 21, positive: 20, negative: -15 },
  { day: 22, positive: 45, negative: -12 },
  { day: 23, positive: 48, negative: -25 },
  { day: 24, positive: 52, negative: -8 },
  { day: 25, positive: 54, negative: -6 },
  { day: 26, positive: 42, negative: -3 },
  { day: 27, positive: 36, negative: -18 },
  { day: 28, positive: 29, negative: -10 },
  { day: 29, positive: 33, negative: -5 },
  { day: 30, positive: 25, negative: -4 },
];

export const getTrustpilotPositiveNegativeSeries = (): TrustpilotPositiveNegativePoint[] => POSITIVE_NEGATIVE_SERIES;

const TRUSTPILOT_TOPIC_VOLUME_SPLIT: TrustpilotTopicVolumeSplitEntry[] = [
  { name: 'SEPA Transfer Reliability', volume: 54, sentiment: 'negative' },
  { name: 'PSD2 Authentication UX', volume: 48, sentiment: 'negative' },
  { name: 'Mortgage Retention Loyalty', volume: 45, sentiment: 'negative' },
  { name: 'ATM & Branch Capacity', volume: 42, sentiment: 'negative' },
  { name: 'Digital Trust & Security', volume: 40, sentiment: 'negative' },
  { name: 'EuroBank Green Finance', volume: 38, sentiment: 'positive' },
  { name: 'Instant Card Freeze', volume: 36, sentiment: 'positive' },
  { name: 'KYC Verification Backlog', volume: 34, sentiment: 'negative' },
  { name: 'Treasury FX Hedging', volume: 33, sentiment: 'negative' },
  { name: 'Climate Savings Accelerators', volume: 31, sentiment: 'positive' },
  { name: 'Payments Outage Comms', volume: 30, sentiment: 'negative' },
  { name: 'AI Relationship Manager', volume: 28, sentiment: 'positive' },
  { name: 'Regulatory Reporting Portal', volume: 27, sentiment: 'negative' },
  { name: 'SME Lending Journey', volume: 26, sentiment: 'negative' },
  { name: 'Fee Transparency Hub', volume: 25, sentiment: 'positive' },
  { name: 'Cross-Border Payroll Team', volume: 24, sentiment: 'negative' },
  { name: 'FX Markup Comparisons', volume: 23, sentiment: 'negative' },
  { name: 'Card Personalisation', volume: 22, sentiment: 'positive' },
  { name: 'Instant SEPA Pilot (Italy)', volume: 21, sentiment: 'positive' },
  { name: 'Wealth Advisory Access', volume: 20, sentiment: 'negative' },
];

export const getTrustpilotTopicVolumeSplit = (): TrustpilotTopicVolumeSplitEntry[] =>
  TRUSTPILOT_TOPIC_VOLUME_SPLIT;

