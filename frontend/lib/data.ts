import { EmailConversation, DashboardMetrics, ChartDataPoint, SentimentData } from './types';

// Sample data generation utilities
export const generateEmailConversations = (count: number = 30): EmailConversation[] => {
  const conversations: EmailConversation[] = [];
  const subjects = [
    'API Integration Issue',
    'Billing Question',
    'Feature Request',
    'Account Access Problem',
    'Payment Processing Error',
    'Login Issues',
    'Data Export Request',
    'Subscription Renewal',
    'Technical Support',
    'Refund Request',
    'Password Reset',
    'Account Suspension',
    'Product Feedback',
    'Partnership Inquiry',
    'Security Concern',
    'Performance Issue',
    'Integration Help',
    'Custom Development',
    'Training Request',
    'Compliance Question'
  ];

  const senders = [
    'john.doe@company.com',
    'jane.smith@company.com',
    'mike.wilson@company.com',
    'sarah.jones@company.com',
    'david.brown@company.com',
    'lisa.garcia@company.com',
    'robert.taylor@company.com',
    'emily.davis@company.com',
    'james.miller@company.com',
    'jennifer.anderson@company.com'
  ];

  const dominantClusters = [
    'Technical Issues',
    'Billing Questions',
    'Feature Requests',
    'Account Support',
    'Product Feedback',
    'Security Concerns',
    'Integration Help',
    'Compliance Issues'
  ];

  const subclusters = {
    'Technical Issues': ['API Errors', 'Performance Issues', 'Integration Problems', 'Bug Reports'],
    'Billing Questions': ['Payment Issues', 'Invoice Problems', 'Refund Requests', 'Subscription Changes'],
    'Feature Requests': ['New Features', 'Enhancements', 'Custom Development', 'UI Improvements'],
    'Account Support': ['Login Issues', 'Access Problems', 'Account Settings', 'User Management'],
    'Product Feedback': ['User Experience', 'Product Suggestions', 'Usability Issues', 'Feature Feedback'],
    'Security Concerns': ['Security Issues', 'Data Protection', 'Access Control', 'Compliance'],
    'Integration Help': ['API Integration', 'Third-party Tools', 'Data Sync', 'Webhook Setup'],
    'Compliance Issues': ['GDPR Questions', 'Data Privacy', 'Regulatory Compliance', 'Audit Requests']
  };

  const resolutionStatuses: Array<'open' | 'in-progress' | 'resolved' | 'closed'> = ['open', 'in-progress', 'resolved', 'closed'];
  const urgencyLevels: Array<'high' | 'medium' | 'low'> = ['high', 'medium', 'low'];
  const stages = ['Initial Contact', 'Investigation', 'Resolution', 'Follow-up', 'Closed'];

  for (let i = 0; i < count; i++) {
    const subject = subjects[Math.floor(Math.random() * subjects.length)];
    const sender = senders[Math.floor(Math.random() * senders.length)];
    const dominantCluster = dominantClusters[Math.floor(Math.random() * dominantClusters.length)];
    const subcluster = subclusters[dominantCluster as keyof typeof subclusters][
      Math.floor(Math.random() * subclusters[dominantCluster as keyof typeof subclusters].length)
    ];
    const resolutionStatus = resolutionStatuses[Math.floor(Math.random() * resolutionStatuses.length)];
    const urgency = urgencyLevels[Math.floor(Math.random() * urgencyLevels.length)];
    const stage = stages[Math.floor(Math.random() * stages.length)];

    // Generate sentiment scores
    const sentimentBase = Math.random();
    const sentiment: SentimentData = {
      positive: sentimentBase > 0.6 ? Math.random() * 0.8 + 0.2 : Math.random() * 0.3,
      neutral: sentimentBase > 0.3 && sentimentBase <= 0.6 ? Math.random() * 0.6 + 0.2 : Math.random() * 0.4,
      negative: sentimentBase <= 0.3 ? Math.random() * 0.8 + 0.2 : Math.random() * 0.3
    };

    // Normalize sentiment scores to sum to 1
    const total = sentiment.positive + sentiment.neutral + sentiment.negative;
    sentiment.positive = sentiment.positive / total;
    sentiment.neutral = sentiment.neutral / total;
    sentiment.negative = sentiment.negative / total;

    const now = new Date();
    const daysAgo = Math.floor(Math.random() * 30);
    const firstMessageAt = new Date(now.getTime() - daysAgo * 24 * 60 * 60 * 1000);
    const lastMessageAt = new Date(firstMessageAt.getTime() + Math.random() * 7 * 24 * 60 * 60 * 1000);

    const conversation: EmailConversation = {
      _id: `email_${i + 1}`,
      provider: 'gmail',
      account: {
        account_id: `account_${i + 1}`,
        email: 'support@company.com',
        display_name: 'Customer Support'
      },
      thread: {
        thread_id: `thread_${i + 1}`,
        subject_norm: subject,
        participants: [
          { type: 'from', name: sender.split('@')[0], email: sender },
          { type: 'to', name: 'Customer Support', email: 'support@company.com' }
        ],
        first_message_at: firstMessageAt.toISOString(),
        last_message_at: lastMessageAt.toISOString(),
        message_count: Math.floor(Math.random() * 5) + 1
      },
      messages: [
        {
          headers: {
            date: firstMessageAt.toISOString(),
            subject: subject,
            from: [{ name: sender.split('@')[0], email: sender }],
            to: [{ name: 'Customer Support', email: 'support@company.com' }]
          },
          body: {
            mime_type: 'text/plain',
            text: {
              plain: `This is a sample email message regarding ${subject.toLowerCase()}. The customer is experiencing issues and needs assistance.`
            }
          }
        }
      ],
      stages: stage,
      email_summary: `Customer inquiry about ${subject.toLowerCase()} requiring ${urgency} priority attention.`,
      action_pending_status: Math.random() > 0.5 ? 'yes' : 'no',
      action_pending_from: Math.random() > 0.5 ? 'customer' : 'support',
      resolution_status: resolutionStatus,
      follow_up_required: Math.random() > 0.7 ? 'yes' : 'no',
      follow_up_date: new Date(now.getTime() + Math.random() * 7 * 24 * 60 * 60 * 1000).toISOString(),
      follow_up_reason: Math.random() > 0.5 ? 'Additional information needed' : 'Resolution confirmation',
      next_action_suggestion: `Review ${subject.toLowerCase()} and provide appropriate response.`,
      urgency: urgency,
      sentiment: sentiment,
      dominant_cluster: dominantCluster,
      subcluster: subcluster,
      confidence_score: Math.random() * 0.3 + 0.7 // 70-100% confidence
    };

    conversations.push(conversation);
  }

  return conversations.sort((a, b) => 
    new Date(b.thread.last_message_at).getTime() - new Date(a.thread.last_message_at).getTime()
  );
};

export const generateDashboardMetrics = (conversations: EmailConversation[]): DashboardMetrics => {
  const totalEmails = conversations.length;
  const pendingActions = conversations.filter(c => c.action_pending_status === 'yes').length;
  const resolvedEmails = conversations.filter(c => c.resolution_status === 'resolved' || c.resolution_status === 'closed').length;
  const resolutionRate = totalEmails > 0 ? (resolvedEmails / totalEmails) * 100 : 0;
  
  // Calculate average response time (simulated)
  const avgResponseTime = conversations.reduce((acc, conv) => {
    const firstMessage = new Date(conv.thread.first_message_at);
    const lastMessage = new Date(conv.thread.last_message_at);
    const responseTime = (lastMessage.getTime() - firstMessage.getTime()) / (1000 * 60 * 60); // hours
    return acc + responseTime;
  }, 0) / totalEmails;

  const highUrgencyCount = conversations.filter(c => c.urgency === 'high').length;
  
  // Calculate sentiment trend (simulated)
  const recentEmails = conversations.slice(0, 10);
  const avgSentiment = recentEmails.reduce((acc, conv) => {
    return acc + (conv.sentiment.positive - conv.sentiment.negative);
  }, 0) / recentEmails.length;
  const sentimentTrend = avgSentiment * 100;

  return {
    totalEmails,
    pendingActions,
    resolutionRate: Math.round(resolutionRate * 10) / 10,
    avgResponseTime: Math.round(avgResponseTime * 10) / 10,
    highUrgencyCount,
    sentimentTrend: Math.round(sentimentTrend * 10) / 10
  };
};

export const generateSentimentTrendData = (conversations: EmailConversation[]): ChartDataPoint[] => {
  const last30Days = Array.from({ length: 30 }, (_, i) => {
    const date = new Date();
    date.setDate(date.getDate() - (29 - i));
    return date.toISOString().split('T')[0];
  });

  return last30Days.map(date => {
    const dayEmails = conversations.filter(conv => 
      conv.thread.first_message_at.startsWith(date)
    );
    
    const avgSentiment = dayEmails.length > 0 
      ? dayEmails.reduce((acc, conv) => {
          return acc + (conv.sentiment.positive - conv.sentiment.negative);
        }, 0) / dayEmails.length
      : 0;

    return {
      date,
      value: Math.round(avgSentiment * 100) / 100,
      label: new Date(date).toLocaleDateString()
    };
  });
};

export const generateSentimentPolarData = (conversations: EmailConversation[]) => {
  if (conversations.length === 0) {
    return [
      { name: 'positive', value: 0, color: '#10b981', percentage: 0 },
      { name: 'neutral', value: 0, color: '#f59e0b', percentage: 0 },
      { name: 'negative', value: 0, color: '#ef4444', percentage: 0 }
    ];
  }

  let positiveCount = 0;
  let neutralCount = 0;
  let negativeCount = 0;

  conversations.forEach(conv => {
    const { positive, neutral, negative } = conv.sentiment;
    const maxSentiment = Math.max(positive, neutral, negative);
    
    if (maxSentiment === positive) {
      positiveCount++;
    } else if (maxSentiment === neutral) {
      neutralCount++;
    } else {
      negativeCount++;
    }
  });

  const total = conversations.length;
  const positivePercentage = Math.round((positiveCount / total) * 100);
  const neutralPercentage = Math.round((neutralCount / total) * 100);
  const negativePercentage = Math.round((negativeCount / total) * 100);

  return [
    { 
      name: 'positive', 
      value: positivePercentage, 
      color: '#b90abd', // Electric Violet
      percentage: positivePercentage 
    },
    { 
      name: 'neutral', 
      value: neutralPercentage, 
      color: '#5332ff', // Blue
      percentage: neutralPercentage 
    },
    { 
      name: 'negative', 
      value: negativePercentage, 
      color: '#939394', // Manatee
      percentage: negativePercentage 
    }
  ];
};

export const generateSentimentTrendDataByPeriod = (conversations: EmailConversation[], period: string): ChartDataPoint[] => {
  const now = new Date();
  let dataPoints: ChartDataPoint[] = [];
  
  if (period === '1d') {
    // Last 24 hours, hourly data
    dataPoints = Array.from({ length: 24 }, (_, i) => {
      const date = new Date(now);
      date.setHours(date.getHours() - (23 - i));
      return {
        date: date.toISOString(),
        value: Math.floor(Math.random() * 100) + 10,
        label: date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })
      };
    });
  } else if (period === '1w') {
    // Last 7 days, daily data
    dataPoints = Array.from({ length: 7 }, (_, i) => {
      const date = new Date(now);
      date.setDate(date.getDate() - (6 - i));
      return {
        date: date.toISOString().split('T')[0],
        value: Math.floor(Math.random() * 200) + 50,
        label: date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
      };
    });
  } else {
    // Last 30 days, daily data (default)
    dataPoints = Array.from({ length: 30 }, (_, i) => {
      const date = new Date(now);
      date.setDate(date.getDate() - (29 - i));
      return {
        date: date.toISOString().split('T')[0],
        value: Math.floor(Math.random() * 300) + 100,
        label: date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
      };
    });
  }

  return dataPoints;
};

export const generateResolutionStatusData = (conversations: EmailConversation[]) => {
  const statusCounts = conversations.reduce((acc, conv) => {
    acc[conv.resolution_status] = (acc[conv.resolution_status] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  return Object.entries(statusCounts).map(([status, count]) => ({
    status: status.charAt(0).toUpperCase() + status.slice(1).replace('-', ' '),
    count,
    percentage: Math.round((count / conversations.length) * 100)
  }));
};

export const generateUrgencyData = (conversations: EmailConversation[]) => {
  const urgencyCounts = conversations.reduce((acc, conv) => {
    acc[conv.urgency] = (acc[conv.urgency] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  return Object.entries(urgencyCounts).map(([urgency, count]) => ({
    urgency: urgency.charAt(0).toUpperCase() + urgency.slice(1),
    count,
    percentage: Math.round((count / conversations.length) * 100)
  }));
};

export const generateUrgencyGaugeData = (conversations: EmailConversation[]) => {
  const urgencyCounts = conversations.reduce((acc, conv) => {
    acc[conv.urgency] = (acc[conv.urgency] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const total = conversations.length;
  
  return [
    { 
      name: 'high', 
      value: urgencyCounts.high || 0, 
      color: '#b90abd', 
      percentage: total > 0 ? Math.round(((urgencyCounts.high || 0) / total) * 100) : 0
    },
    { 
      name: 'medium', 
      value: urgencyCounts.medium || 0, 
      color: '#5332ff', 
      percentage: total > 0 ? Math.round(((urgencyCounts.medium || 0) / total) * 100) : 0
    },
    { 
      name: 'low', 
      value: urgencyCounts.low || 0, 
      color: '#939394', 
      percentage: total > 0 ? Math.round(((urgencyCounts.low || 0) / total) * 100) : 0
    }
  ];
};

export const generateVolumeTrendData = (conversations: EmailConversation[]): ChartDataPoint[] => {
  const last7Days = Array.from({ length: 7 }, (_, i) => {
    const date = new Date();
    date.setDate(date.getDate() - (6 - i));
    return date.toISOString().split('T')[0];
  });

  return last7Days.map(date => {
    const dayEmails = conversations.filter(conv => 
      conv.thread.first_message_at.startsWith(date)
    );

    return {
      date,
      value: dayEmails.length,
      label: new Date(date).toLocaleDateString()
    };
  });
};

export const generateUrgencyCircularData = (conversations: EmailConversation[]) => {
  const urgencyCounts = conversations.reduce((acc, conv) => {
    acc[conv.urgency] = (acc[conv.urgency] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const total = conversations.length;
  
  const data = [
    {
      name: 'High',
      value: urgencyCounts.high || 0,
      percentage: total > 0 ? Math.round(((urgencyCounts.high || 0) / total) * 100) : 0,
      color: '#b90abd' // Electric Violet
    },
    {
      name: 'Medium', 
      value: urgencyCounts.medium || 0,
      percentage: total > 0 ? Math.round(((urgencyCounts.medium || 0) / total) * 100) : 0,
      color: '#5332ff' // Blue
    },
    {
      name: 'Low',
      value: urgencyCounts.low || 0,
      percentage: total > 0 ? Math.round(((urgencyCounts.low || 0) / total) * 100) : 0,
      color: '#939394' // Manatee
    }
  ];

  return { data, total };
};
