export interface EmailConversation {
  _id: string;
  provider: string;
  account: {
    account_id: string;
    email: string;
    display_name: string;
  };
  thread: {
    thread_id: string;
    subject_norm: string;
    participants: Array<{
      type: string;
      name: string;
      email: string;
    }>;
    first_message_at: string;
    last_message_at: string;
    message_count: number;
  };
  messages: Array<{
    headers: {
      date: string;
      subject: string;
      from: Array<{ name: string; email: string }>;
      to: Array<{ name: string; email: string }>;
    };
    body: {
      mime_type: string;
      text: { plain: string };
    };
  }>;
  stages: string;
  email_summary: string;
  action_pending_status: string;
  action_pending_from: string;
  resolution_status: 'open' | 'in-progress' | 'resolved' | 'closed';
  follow_up_required: 'yes' | 'no';
  follow_up_date: string;
  follow_up_reason: string;
  next_action_suggestion: string;
  urgency: 'high' | 'medium' | 'low';
  sentiment: {
    positive: number;
    neutral: number;
    negative: number;
  };
  dominant_cluster: string;
  subcluster: string;
  confidence_score: number;
}

export interface DashboardMetrics {
  totalEmails: number;
  pendingActions: number;
  resolutionRate: number;
  avgResponseTime: number;
  highUrgencyCount: number;
  sentimentTrend: number;
}

export interface ChartDataPoint {
  date: string;
  value: number;
  label?: string;
}

export interface SentimentData {
  positive: number;
  neutral: number;
  negative: number;
}

export interface FilterOptions {
  status: string[];
  urgency: string[];
  sentiment: string[];
  dateRange: {
    start: string;
    end: string;
  };
  search: string;
}

export interface EmailPreview {
  id: string;
  subject: string;
  sender: string;
  timestamp: string;
  sentiment: 'positive' | 'neutral' | 'negative';
  urgency: 'high' | 'medium' | 'low';
  status: string;
  cluster: string;
  subcluster: string;
  confidence: number;
}
