export type SentimentLevelMap = Record<'level1' | 'level2' | 'level3' | 'level4' | 'level5', number>;

export type SentimentLevelKey = 'level1' | 'level2' | 'level3' | 'level4' | 'level5';

export interface TopicWordCloudEntry {
  term: string;
  weight: number;
}

export interface ViralityTopicSummary {
  name: string;
  helpfulVotes: number;
  viralityScore: number;
  totalPosts: number;
  sentimentLevels: SentimentLevelMap;
  wordCloud?: TopicWordCloudEntry[];
}

type TopicCategory = 'compliance' | 'feature' | 'appreciation' | 'other';

export interface CategorisedTopic extends ViralityTopicSummary {
  category: TopicCategory;
}

export interface CategoryTopicDetail {
  name: string;
  totalPosts: number;
  helpfulVotes: number;
  dominantSentiment: {
    key: SentimentLevelKey;
    label: string;
    value: number;
  };
  wordCloud?: TopicWordCloudEntry[];
}

export interface CategorySummary {
  key: 'compliance' | 'feature' | 'appreciation';
  label: string;
  totalTopics: number;
  totalPosts: number;
  totalHelpfulVotes: number;
  sentimentBreakdown: {
    positivePct: number;
    neutralPct: number;
    negativePct: number;
  };
  dominantSentiment: {
    key: SentimentLevelKey;
    value: number;
    label: string;
  };
  sentimentSegments: Array<{ key: SentimentLevelKey; label: string; percentage: number }>;
  topics: CategoryTopicDetail[];
}

export interface ComplianceFeatureDataset {
  summaries: CategorySummary[];
  barChart: Array<{ key: CategorySummary['key']; label: string; posts: number; topics: number }>;
}

const COMPLIANCE_KEYWORDS = [
  'regulatory',
  'compliance',
  'security',
  'fraud',
  'kyc',
  'verification',
  'account access',
  'account problem',
  'account issue',
  'account locked',
  'account blocking',
  'delayed',
  'delay',
  'very much delayed',
  'customer service',
  'service was not good',
  'support',
  'no guidance',
  'no proper guidance',
  'fee',
  'fees',
  'charge',
  'charges',
  'bug',
  'error',
  'failure',
  'outage',
  'problem',
  'issue',
  'complaint',
  'escalation',
  'verification pending',
  'kyc pending',
  'kyc delay',
];

const FEATURE_REQUEST_KEYWORDS = [
  'feature request',
  'feature',
  'request',
  'upgrade',
  'improvement',
  'innovation',
  'dashboard',
  'transfer',
  'transfers',
  'upi',
  'neft',
  'imps',
  'qr',
  'card management',
  'card control',
  'freeze',
  'loan assistant',
  'loan simulation',
  'emi',
  'experience',
  'integration',
  'roadmap',
  'new',
  'enhancement',
  'support for',
  'custom',
  'wish',
  'dark mode',
  'upi',
  'upi payment',
  'guidance',
  'personal guidance',
  'individual guidance',
  'account opening guidance',
  'new capability',
  'add ',
  'add-on',
  'would love to see',
  'please add',
];

const APPRECIATION_KEYWORDS = [
  'appreciation',
  'appreciate',
  'appreciated',
  'praise',
  'praises',
  'love',
  'loved',
  'delight',
  'delighted',
  'kudos',
  'thank you',
  'thanks',
  'grateful',
  'helpful staff',
  'relationship manager',
  'support team',
  'celebrate',
  'amazing service',
  'friendly',
  'smooth onboarding',
  'fast resolution',
  'stellar',
  'shout-out',
  'shoutout',
];

const CATEGORY_META: Record<
  Exclude<CategorySummary['key'], never>,
  { label: string }
> = {
  compliance: { label: 'Concern Hotspots' },
  feature: { label: 'Feature Requests & Enhancements' },
  appreciation: { label: 'Customer Appreciation Highlights' },
};

const SENTIMENT_LABELS: Record<SentimentLevelKey, { short: string }> = {
  level1: { short: 'Happy' },
  level2: { short: 'Bit Irritated' },
  level3: { short: 'Moderately Concerned' },
  level4: { short: 'Anger' },
  level5: { short: 'Frustrated' },
};

const normalise = (text: string) => text.toLowerCase();

const classifyTopic = (topicName: string): TopicCategory => {
  const name = normalise(topicName);
  if (COMPLIANCE_KEYWORDS.some(keyword => name.includes(keyword))) {
    return 'compliance';
  }
  if (FEATURE_REQUEST_KEYWORDS.some(keyword => name.includes(keyword))) {
    return 'feature';
  }
  if (APPRECIATION_KEYWORDS.some(keyword => name.includes(keyword))) {
    return 'appreciation';
  }
  return 'other';
};

const getDominantSentiment = (sentiments: SentimentLevelMap): { key: SentimentLevelKey; value: number } => {
  const [key, value] = (Object.entries(sentiments) as Array<[SentimentLevelKey, number]>)
    .sort((a, b) => b[1] - a[1])[0] ?? ['level3', 0];
  return { key, value };
};

const aggregateSentiment = (topics: ViralityTopicSummary[]) => {
  const totals = {
    positive: 0,
    neutral: 0,
    negative: 0,
  };

  const weightSum = topics.reduce((sum, topic) => sum + topic.totalPosts, 0) || 1;

  topics.forEach(topic => {
    totals.positive += ((topic.sentimentLevels.level1 + topic.sentimentLevels.level2) / 100) * topic.totalPosts;
    totals.neutral += (topic.sentimentLevels.level3 / 100) * topic.totalPosts;
    totals.negative += ((topic.sentimentLevels.level4 + topic.sentimentLevels.level5) / 100) * topic.totalPosts;
  });

  return {
    positivePct: (totals.positive / weightSum) * 100,
    neutralPct: (totals.neutral / weightSum) * 100,
    negativePct: (totals.negative / weightSum) * 100,
  };
};

const summariseTopics = (
  key: CategorySummary['key'],
  topics: ViralityTopicSummary[]
): CategorySummary => {
  const { label } = CATEGORY_META[key];
  const totalTopics = topics.length;
  const totalPosts = topics.reduce((sum, topic) => sum + topic.totalPosts, 0);
  const totalHelpfulVotes = topics.reduce((sum, topic) => sum + topic.helpfulVotes, 0);
  const sentimentBreakdown = aggregateSentiment(topics);
  const dominantSentiment = getDominantSentiment(
    topics.reduce(
      (acc, topic) => {
        (Object.keys(topic.sentimentLevels) as SentimentLevelKey[]).forEach(levelKey => {
          acc[levelKey] += (topic.sentimentLevels[levelKey] / 100) * topic.totalPosts;
        });
        return acc;
      },
      {
        level1: 0,
        level2: 0,
        level3: 0,
        level4: 0,
        level5: 0,
      } as SentimentLevelMap
    )
  );

  const sentimentSegments = (Object.entries(
    topics.reduce(
      (acc, topic) => {
        (Object.keys(topic.sentimentLevels) as SentimentLevelKey[]).forEach(levelKey => {
          acc[levelKey] += (topic.sentimentLevels[levelKey] / 100) * topic.totalPosts;
        });
        acc.totalWeight += topic.totalPosts;
        return acc;
      },
      {
        totalWeight: 0,
        level1: 0,
        level2: 0,
        level3: 0,
        level4: 0,
        level5: 0,
      } as SentimentLevelMap & { totalWeight: number }
    )
  ) as Array<[SentimentLevelKey | 'totalWeight', number]>)
    .filter(([keyName]) => keyName !== 'totalWeight')
    .map(([levelKey, rawValue]) => ({
      key: levelKey as SentimentLevelKey,
      label: SENTIMENT_LABELS[levelKey as SentimentLevelKey]?.short ?? '',
      percentage:
        ((rawValue as number) /
          Math.max(
            1,
            topics.reduce((sum, topic) => sum + topic.totalPosts, 0)
          )) * 100,
    }));
  const totalSegmentPct = sentimentSegments.reduce((sum, seg) => sum + seg.percentage, 0);
  if (sentimentSegments.length > 0 && totalSegmentPct !== 100) {
    const diff = 100 - totalSegmentPct;
    sentimentSegments[sentimentSegments.length - 1].percentage += diff;
  }

  const topicsSorted = topics
    .slice()
    .sort((a, b) => b.totalPosts - a.totalPosts)
    .map(topic => {
      const sentimentEntry = Object.entries(topic.sentimentLevels).sort((a, b) => b[1] - a[1])[0];
      const defaultSentimentKey: SentimentLevelKey = 'level3';
      const dominantKey = (sentimentEntry?.[0] as SentimentLevelKey | undefined) ?? defaultSentimentKey;
      const dominantValue = sentimentEntry?.[1] ?? 0;

      return {
        name: topic.name,
        totalPosts: topic.totalPosts,
        helpfulVotes: topic.helpfulVotes,
        dominantSentiment: {
          key: dominantKey,
          label: SENTIMENT_LABELS[dominantKey]?.short ?? SENTIMENT_LABELS[defaultSentimentKey].short,
          value: dominantValue,
        },
        wordCloud: topic.wordCloud,
      };
    });

  const dominantSentimentWithLabel = (() => {
    const defaultSentimentKey: SentimentLevelKey = 'level3';
    const key = dominantSentiment?.key ?? defaultSentimentKey;
    const value = dominantSentiment?.value ?? 0;
    return {
      key,
      value,
      label: SENTIMENT_LABELS[key]?.short ?? SENTIMENT_LABELS[defaultSentimentKey].short,
    };
  })();

  return {
    key,
    label,
    totalTopics,
    totalPosts,
    totalHelpfulVotes,
    sentimentBreakdown,
    dominantSentiment: dominantSentimentWithLabel,
    sentimentSegments,
    topics: topicsSorted,
  };
};

export const buildComplianceFeatureDataset = (
  topics: ViralityTopicSummary[]
): ComplianceFeatureDataset => {
  const categorised = topics.map(topic => ({
    ...topic,
    category: classifyTopic(topic.name),
  }));

  const complianceTopics = categorised.filter(topic => topic.category === 'compliance');
  const featureTopics = categorised.filter(topic => topic.category === 'feature');
  const appreciationTopics = categorised.filter(topic => topic.category === 'appreciation');

  const summaries: CategorySummary[] = [
    summariseTopics('compliance', complianceTopics),
    summariseTopics('feature', featureTopics),
    summariseTopics('appreciation', appreciationTopics),
  ];

  const barChart = summaries.map(summary => ({
    key: summary.key,
    label: summary.label,
    posts: summary.totalPosts,
    topics: summary.totalTopics,
  }));

  return { summaries, barChart };
};

