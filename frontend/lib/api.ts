// Enterprise Email Management System - MongoDB Schema Models
export interface Thread {
  thread_id: string;
  thread_key: string;
  subject_norm: string;
  participants: Array<{
    type: 'customer' | 'external';
    name: string;
    email: string;
    role?: string;
  }>;
  first_message_at: string;
  last_message_at: string;
  message_count: number;
  dominant_cluster_label: string;
  subcluster_label: string;
  action_pending_from: string;
  action_pending_status: 'pending' | 'in_progress' | 'completed' | 'overdue';
  follow_up_required: boolean;
  follow_up_date: string;
  follow_up_reason: string;
  next_action_suggestion: string;
  overall_sentiment: number; // 1-5 scale
  resolution_status: 'open' | 'in_progress' | 'closed' | 'escalated';
  stages: string[];
  urgency: 'critical' | 'high' | 'medium' | 'low';
  priority: 'P1' | 'P2' | 'P3' | 'P4' | 'P5';
  email_summary: string;
  business_impact_score: number; // 0-100
  risk_score: number; // 0-100
  escalation_count: number;
  sla_compliance_rate: number; // 0-100
  avg_resolution_time_days: number;
}

export interface Message {
  message_id: string;
  thread_id: string;
  sender: {
    name: string;
    email: string;
    type: 'customer' | 'external';
  };
  recipients: Array<{
    name: string;
    email: string;
    type: 'to' | 'cc' | 'bcc';
  }>;
  subject: string;
  body: {
    text: string;
    html?: string;
  };
  timestamp: string;
  sentiment: {
    positive: number;
    neutral: number;
    negative: number;
    score: number; // -1 to 1
  };
  attachments?: Array<{
    filename: string;
    size: number;
    type: string;
  }>;
}

export interface KPIData {
  total_threads: number;
  total_messages: number;
  closed_vs_open_percentage: number;
  avg_resolution_time_days: number;
  urgent_threads_count: number;
  critical_issues_count: number;
  customer_waiting_percentage: number;
  customer_waiting_count: number;
  escalation_rate: number;
  sla_breach_risk_percentage: number;
  customer_sentiment_index: number;
  internal_pending_count: number;
  internal_pending_percentage: number;
  threads_by_cluster_subcluster: Record<string, Record<string, number>>;
  avg_sentiment_weighted: number;
  open_pct: number;
  escalation_count: number;
  business_impact_score: number;
  risk_score: number;
  sla_compliance_rate: number;
  urgent_unresolved_count: number;
}

export interface ThreadsOverTimeData {
  date: string;
  total: number;
  urgent: number;
  openCustomer: number;
  openCompany: number;
  closed: number;
}

export interface SentimentTrendData {
  messageId: string;
  timestamp: string;
  sentiment: number;
  positive: number;
  neutral: number;
  negative: number;
}

export interface TopicDistributionData {
  topic: string;
  count: number;
  percentage: number;
  urgentCount: number;
  avgSentiment: number;
  [key: string]: any;
}

export interface PriorityResolutionData {
  priority: string;
  openCustomer: number;
  openCompany: number;
  closed: number;
}

export interface EisenhowerThread {
  thread_id: string;
  subject_norm: string;
  participants: Array<{
    type: 'customer' | 'external';
    name: string;
    email: string;
  }>;
  resolution_status: 'open' | 'in_progress' | 'closed' | 'escalated';
  priority: 'P1' | 'P2' | 'P3' | 'P4' | 'P5';
  urgency: 'critical' | 'high' | 'medium' | 'low';
  importance_score: number; // Computed from business_impact_score, priority, sentiment, follow-ups, escalation
  urgency_flag: number; // Computed from urgency, escalation_count, follow_up_required
  quadrant: 'do' | 'schedule' | 'delegate' | 'delete';
  business_impact_score: number;
  risk_score: number;
  escalation_count: number;
  follow_up_required: boolean;
  overall_sentiment: number;
  next_action_suggestion: string;
  action_pending_from: 'customer' | 'company';
  action_pending_status: 'pending' | 'in_progress' | 'completed' | 'overdue';
  assigned_to?: string;
  owner?: string;
  topic: string;
  dominant_cluster_name: string;
  last_message_at: string;
  first_message_at: string;
}

export interface ThreadDetail {
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
  resolution_status: 'open' | 'in_progress' | 'closed';
  priority: 'high' | 'medium' | 'low';
  next_action_suggestion: string;
  follow_up_date: string;
  follow_up_reason: string;
  messages: Array<{
    headers: {
      date: string;
      subject: string;
      from: Array<{ name: string; email: string }>;
      to: Array<{ name: string; email: string }>;
    };
    body: {
      text: { plain: string };
    };
    sentiment: {
      positive: number;
      neutral: number;
      negative: number;
    };
  }>;
}

export interface QuadrantSummary {
  quadrant: 'do' | 'schedule' | 'delegate' | 'delete';
  count: number;
  percentage: number;
  ctaText: string;
  ctaAction: string;
}

// Advanced Dashboard Interfaces
export interface ClusterRiskHeatmapData {
  cluster: string;
  subcluster: string;
  risk_score: number;
  thread_count: number;
  top_threads: Array<{
    thread_id: string;
    subject_norm: string;
    risk_score: number;
  }>;
}

export interface ActionableCard {
  id: string;
  type: 'top_risk' | 'overdue_followup' | 'opportunity' | 'sla_failure' | 'watchlist';
  title: string;
  description: string;
  priority: 'critical' | 'high' | 'medium' | 'low';
  thread_id: string;
  subject_norm: string;
  participants: Array<{ name: string; email: string; type: string }>;
  next_action_suggestion: string;
  cta_buttons: Array<{
    label: string;
    action: 'escalate' | 'assign_owner' | 'reply' | 'mark_resolved' | 'schedule';
    variant: 'primary' | 'secondary' | 'danger';
  }>;
  metadata: {
    urgency: string;
    sentiment: number;
    follow_up_date?: string;
    sla_breach_risk?: number;
  };
}

export interface NetworkGraphData {
  nodes: Array<{
    id: string;
    label: string;
    type: 'customer' | 'external';
    email: string;
    thread_count: number;
    avg_sentiment: number;
    x?: number;
    y?: number;
  }>;
  edges: Array<{
    source: string;
    target: string;
    weight: number;
    thread_count: number;
  }>;
}

export interface PredictiveMetrics {
  risk_forecast: Array<{
    date: string;
    predicted_risk_score: number;
    confidence: number;
  }>;
  ai_risk_cards: Array<{
    risk_type: string;
    probability: number;
    impact: number;
    recommendation: string;
  }>;
  workload_prediction: Array<{
    date: string;
    predicted_threads: number;
    predicted_urgent: number;
  }>;
}

// Comprehensive Mock Data Generators
function generateMockKPIs(): KPIData {
  return {
    total_threads: 2847,
    total_messages: 12456,
    closed_vs_open_percentage: 78.5,
    avg_resolution_time_days: 2.3,
    urgent_threads_count: 89,
    critical_issues_count: 23,
    customer_waiting_percentage: 15.2,
    customer_waiting_count: 432,
    escalation_rate: 8.7,
    sla_breach_risk_percentage: 12.3,
    customer_sentiment_index: 4,
    internal_pending_count: 342,
    internal_pending_percentage: 12.0,
    threads_by_cluster_subcluster: {
      'Billing Issues': { 'Payment Processing': 45, 'Refunds': 32, 'Invoicing': 28 },
      'Technical Support': { 'Login Issues': 67, 'Feature Requests': 43, 'Bug Reports': 38 },
      'Account Management': { 'Account Setup': 34, 'Profile Updates': 29, 'Security': 41 },
      'General Inquiry': { 'Information': 56, 'Pricing': 23, 'Partnership': 18 }
    },
    avg_sentiment_weighted: 3,
    open_pct: 21.5,
    escalation_count: 247,
    business_impact_score: 72.3,
    risk_score: 45.8,
    sla_compliance_rate: 87.7,
    urgent_unresolved_count: 67
  };
}

// Eisenhower Matrix Importance & Urgency Scoring Algorithm
function calculateImportanceScore(
  business_impact_score: number,
  priority: string,
  sentiment: number,
  follow_up_required: boolean,
  escalation_count: number
): number {
  // Priority weight (P1=1.0, P2=0.8, P3=0.6, P4=0.4, P5=0.2)
  const priorityWeights = { 'P1': 1.0, 'P2': 0.8, 'P3': 0.6, 'P4': 0.4, 'P5': 0.2 };
  const priorityWeight = priorityWeights[priority as keyof typeof priorityWeights] || 0.5;
  
  // Business impact normalized to 0-1
  const businessImpact = business_impact_score / 100;
  
  // Sentiment impact (negative sentiment increases importance)
  const sentimentImpact = sentiment <= 2 ? 1.2 : sentiment >= 4 ? 0.8 : 1.0;
  
  // Follow-up multiplier
  const followUpMultiplier = follow_up_required ? 1.3 : 1.0;
  
  // Escalation multiplier
  const escalationMultiplier = Math.min(1 + (escalation_count * 0.2), 2.0);
  
  return Math.min(
    (businessImpact * priorityWeight * sentimentImpact * followUpMultiplier * escalationMultiplier),
    1.0
  );
}

function calculateUrgencyFlag(
  urgency: string,
  escalation_count: number,
  follow_up_required: boolean,
  sla_compliance_rate: number
): number {
  // Urgency weight (critical=1.0, high=0.8, medium=0.5, low=0.2)
  const urgencyWeights = { 'critical': 1.0, 'high': 0.8, 'medium': 0.5, 'low': 0.2 };
  const urgencyWeight = urgencyWeights[urgency as keyof typeof urgencyWeights] || 0.3;
  
  // SLA pressure (lower compliance = higher urgency)
  const slaPressure = (100 - sla_compliance_rate) / 100;
  
  // Escalation pressure
  const escalationPressure = Math.min(escalation_count * 0.3, 1.0);
  
  // Follow-up pressure
  const followUpPressure = follow_up_required ? 0.4 : 0.0;
  
  const urgencyScore = urgencyWeight + slaPressure + escalationPressure + followUpPressure;
  return urgencyScore > 0.6 ? 1 : 0;
}

// Simple seeded random number generator for consistent data
function seededRandom(seed: number) {
  const x = Math.sin(seed) * 10000;
  return x - Math.floor(x);
}

function generateMockEisenhowerThreads(): EisenhowerThread[] {
  const threads: EisenhowerThread[] = [];
  
  // Target counts for each quadrant
  const targetCounts = {
    do: 12,        // 10-15 range
    schedule: 35,  // 30-40 range
    delegate: 500,  // hundreds
    delete: 1457   // thousands (2004 - 12 - 35 - 500 = 1457)
  };
  
  // Counters to track current assignments
  const quadrantCounts = {
    do: 0,
    schedule: 0,
    delegate: 0,
    delete: 0
  };
  
  const subjects = [
    'Payment processing issue',
    'Account verification required', 
    'Service outage notification',
    'Feature request submission',
    'Billing inquiry',
    'Technical support ticket',
    'Refund request',
    'Account upgrade inquiry',
    'Password reset request',
    'General feedback',
    'Security breach report',
    'Customer complaint escalation',
    'VIP account issue',
    'System performance degradation',
    'Data export request',
    'Integration failure',
    'Compliance violation',
    'Contract renewal inquiry',
    'Partnership proposal',
    'Emergency support request'
  ];

  const priorities: Array<'P1' | 'P2' | 'P3' | 'P4' | 'P5'> = ['P1', 'P2', 'P3', 'P4', 'P5'];
  const urgencies: Array<'critical' | 'high' | 'medium' | 'low'> = ['critical', 'high', 'medium', 'low'];
  const topics = ['Billing', 'Technical Support', 'Account Management', 'General Inquiry', 'Security', 'Feature Request'];
  const dominantClusters = ['Billing Issues', 'Technical Support', 'Account Management', 'General Inquiry', 'Security Concerns', 'Feature Requests'];
  const actionPendingFrom: Array<'customer' | 'company'> = ['customer', 'company'];
  const assignedTo = ['John Smith', 'Sarah Johnson', 'Mike Chen', 'Lisa Wang', 'David Brown', 'Emma Davis'];
  const nextActions = [
    'Follow up with customer within 2 hours',
    'Escalate to senior support team',
    'Schedule follow-up call',
    'Update customer on progress',
    'Close ticket after verification',
    'Assign to billing specialist',
    'Review security logs',
    'Prepare refund documentation',
    'Coordinate with technical team',
    'Send confirmation email'
  ];

  // Use fixed seed for consistent data
  const baseSeed = 12345;

  for (let i = 0; i < 2004; i++) {
    const seed = baseSeed + i;
    const business_impact_score = seededRandom(seed) * 100;
    
    // Determine priority based on which quadrant we'll assign to
    let priority: 'P1' | 'P2' | 'P3' | 'P4' | 'P5';
    if (i < targetCounts.do) {
      // For Do quadrant, assign mix of P1 and P2 (50% each for 12 threads = 6 P1, 6 P2)
      priority = (i % 2 === 0) ? 'P1' : 'P2';
    } else if (i < targetCounts.do + targetCounts.schedule) {
      // For Schedule quadrant, assign mix of P2 and P3
      priority = (i % 2 === 0) ? 'P2' : 'P3';
    } else if (i < targetCounts.do + targetCounts.schedule + targetCounts.delegate) {
      // For Delegate quadrant, assign mix of P3 and P4
      priority = (i % 2 === 0) ? 'P3' : 'P4';
    } else {
      // For Delete quadrant, assign mix of P4 and P5
      priority = (i % 2 === 0) ? 'P4' : 'P5';
    }
    const urgency = urgencies[Math.floor(seededRandom(seed + 2) * urgencies.length)];
    const overall_sentiment = Math.round(seededRandom(seed + 3) * 4) + 1; // 1-5 scale, whole numbers only
    const follow_up_required = seededRandom(seed + 4) > 0.6;
    const escalation_count = Math.floor(seededRandom(seed + 5) * 3);
    const sla_compliance_rate = seededRandom(seed + 6) * 100;
    const topic = topics[Math.floor(seededRandom(seed + 7) * topics.length)];
    const dominantCluster = dominantClusters[Math.floor(seededRandom(seed + 7.5) * dominantClusters.length)];
    const actionPending = actionPendingFrom[Math.floor(seededRandom(seed + 8) * actionPendingFrom.length)];
    
    const assigned = assignedTo[Math.floor(seededRandom(seed + 9) * assignedTo.length)];
    const nextAction = nextActions[Math.floor(seededRandom(seed + 10) * nextActions.length)];
    // Generate dates within the same range as ThreadsOverTimeData (last 30 days)
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - 30);
    const randomDaysAgo = Math.floor(seededRandom(seed + 11) * 30);
    const randomHoursAgo = Math.floor(seededRandom(seed + 12) * 24);
    
    const firstMessageAt = new Date(startDate);
    firstMessageAt.setDate(firstMessageAt.getDate() + randomDaysAgo);
    
    const lastMessageAt = new Date(firstMessageAt);
    lastMessageAt.setHours(lastMessageAt.getHours() + randomHoursAgo);
    
    const importance_score = calculateImportanceScore(
      business_impact_score,
      priority,
      overall_sentiment,
      follow_up_required,
      escalation_count
    );
    
    const urgency_flag = calculateUrgencyFlag(
      urgency,
      escalation_count,
      follow_up_required,
      sla_compliance_rate
    );
    
    // Determine quadrant based on target counts
    // Do: 10-15, Schedule: 30-40, Delegate: hundreds, Delete: thousands
    let quadrant: 'do' | 'schedule' | 'delegate' | 'delete';
    
    // Use thread index to deterministically assign quadrants to meet exact target counts
    // This ensures we hit the exact numbers regardless of priority distribution
    if (quadrantCounts.do < targetCounts.do) {
      quadrant = 'do';
    } else if (quadrantCounts.schedule < targetCounts.schedule) {
      quadrant = 'schedule';
    } else if (quadrantCounts.delegate < targetCounts.delegate) {
      quadrant = 'delegate';
    } else {
      quadrant = 'delete';
    }
    
    // Update counter
    quadrantCounts[quadrant]++;

    threads.push({
      thread_id: `thread_${i + 1}`,
      subject_norm: subjects[i % subjects.length],
      participants: [
        {
          type: 'customer',
          name: `Customer ${i + 1}`,
          email: `customer${i + 1}@example.com`,
        },
        {
          type: 'external',
          name: 'Support Agent',
          email: 'support@company.com',
        },
      ],
      resolution_status: ['open', 'in_progress', 'closed', 'escalated'][Math.floor(seededRandom(seed + 13) * 4)] as any,
      priority,
      urgency,
      importance_score,
      urgency_flag,
      quadrant,
      business_impact_score,
      risk_score: seededRandom(seed + 15) * 100,
      escalation_count,
      follow_up_required,
      overall_sentiment,
      next_action_suggestion: nextAction,
      action_pending_from: actionPending,
      action_pending_status: ['pending', 'in_progress', 'completed', 'overdue'][Math.floor(seededRandom(seed + 14) * 4)] as any,
      assigned_to: assigned,
      owner: assigned,
      topic,
      dominant_cluster_name: dominantCluster,
      first_message_at: firstMessageAt.toISOString(),
      last_message_at: lastMessageAt.toISOString(),
    });
  }

  return threads;
}

function generateMockThreadDetail(threadId: string): ThreadDetail {
  const messages = [];
  const messageCount = Math.floor(Math.random() * 10) + 3;
  
  for (let i = 0; i < messageCount; i++) {
    messages.push({
      headers: {
        date: new Date(Date.now() - i * 24 * 60 * 60 * 1000).toISOString(),
        subject: `Re: Payment processing issue`,
        from: [{ name: i % 2 === 0 ? 'Customer' : 'Support Agent', email: i % 2 === 0 ? 'customer@example.com' : 'support@company.com' }],
        to: [{ name: i % 2 === 0 ? 'Support Agent' : 'Customer', email: i % 2 === 0 ? 'support@company.com' : 'customer@example.com' }],
      },
      body: {
        text: {
          plain: `This is message ${i + 1} content. Lorem ipsum dolor sit amet, consectetur adipiscing elit.`,
        },
      },
      sentiment: {
        positive: Math.random() * 0.4,
        neutral: Math.random() * 0.4 + 0.3,
        negative: Math.random() * 0.3,
      },
    });
  }

  return {
    thread_id: threadId,
    subject_norm: 'Payment processing issue',
    participants: [
      { type: 'customer', name: 'John Doe', email: 'john.doe@example.com' },
      { type: 'external', name: 'Support Agent', email: 'support@company.com' },
    ],
    first_message_at: new Date(Date.now() - messageCount * 24 * 60 * 60 * 1000).toISOString(),
    last_message_at: new Date().toISOString(),
    message_count: messageCount,
    resolution_status: 'in_progress',
    priority: 'high',
    next_action_suggestion: 'Contact payment processor to verify transaction status',
    follow_up_date: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString(),
    follow_up_reason: 'Customer awaiting resolution confirmation',
    messages,
  };
}

// API functions
export async function getKPIs(): Promise<KPIData> {
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 300));
  
  // Get the same thread data to ensure consistency
  const threads = await getEisenhowerThreads();
  
  // Calculate KPIs from actual thread data
  const totalThreads = threads.length;
  const closedThreads = threads.filter(t => t.resolution_status === 'closed').length;
  const urgentThreads = threads.filter(t => t.urgency === 'critical' || t.urgency === 'high').length;
  const criticalIssues = threads.filter(t => t.priority === 'P1').length;
  const customerWaiting = threads.filter(t => t.action_pending_from === 'customer').length;
  let customerWaitingCount = threads.filter(t => 
    t.action_pending_from === 'customer' && t.action_pending_status !== 'completed'
  ).length;
  
  // Ensure minimum value for display (fallback to ~15% if calculation is too low)
  if (customerWaitingCount === 0 || (customerWaitingCount / totalThreads) < 0.05) {
    customerWaitingCount = Math.max(customerWaitingCount, Math.round(totalThreads * 0.15));
  }
  
  const escalatedThreads = threads.filter(t => t.escalation_count > 0).length;
  let internalPending = threads.filter(t => 
    t.action_pending_from === 'company' && t.action_pending_status !== 'completed'
  ).length;
  
  // Ensure minimum value for display (fallback to ~12% if calculation is too low)
  if (internalPending === 0 || (internalPending / totalThreads) < 0.05) {
    internalPending = Math.max(internalPending, Math.round(totalThreads * 0.12));
  }
  
  const avgSentiment = threads.reduce((sum, t) => sum + t.overall_sentiment, 0) / totalThreads;
  const avgResolutionTime = threads.reduce((sum, t) => {
    const start = new Date(t.first_message_at).getTime();
    const end = new Date(t.last_message_at).getTime();
    return sum + ((end - start) / (1000 * 60 * 60 * 24)); // Convert to days
  }, 0) / totalThreads;
  
  return {
    total_threads: totalThreads,
    total_messages: threads.reduce((sum, t) => sum + (t.participants?.length || 0), 0),
    closed_vs_open_percentage: Math.round((closedThreads / totalThreads) * 100 * 10) / 10,
    avg_resolution_time_days: Math.round(avgResolutionTime * 10) / 10,
    urgent_threads_count: urgentThreads,
    critical_issues_count: criticalIssues,
    customer_waiting_count: customerWaitingCount,
    customer_waiting_percentage: Math.round((customerWaitingCount / totalThreads) * 100 * 10) / 10,
    escalation_rate: Math.round((escalatedThreads / totalThreads) * 100 * 10) / 10,
    sla_breach_risk_percentage: Math.round((escalatedThreads / totalThreads) * 100 * 1.5), // Simulate SLA risk
    customer_sentiment_index: Math.round(avgSentiment),
    internal_pending_count: internalPending,
    internal_pending_percentage: Math.round((internalPending / totalThreads) * 100 * 10) / 10,
    threads_by_cluster_subcluster: {
      'Billing Issues': { 'Payment Processing': 45, 'Refunds': 32, 'Invoicing': 28 },
      'Technical Support': { 'Login Issues': 67, 'Feature Requests': 43, 'Bug Reports': 38 },
      'Account Management': { 'Account Setup': 34, 'Profile Updates': 29, 'Security': 41 },
      'General Inquiry': { 'Information': 56, 'Pricing': 23, 'Partnership': 18 }
    },
    avg_sentiment_weighted: Math.round(avgSentiment),
    open_pct: Math.round(((totalThreads - closedThreads) / totalThreads) * 100 * 10) / 10,
    escalation_count: escalatedThreads,
    business_impact_score: Math.round(threads.reduce((sum, t) => sum + t.business_impact_score, 0) / totalThreads),
    risk_score: Math.round(threads.reduce((sum, t) => sum + t.risk_score, 0) / totalThreads),
    sla_compliance_rate: Math.round((100 - (escalatedThreads / totalThreads) * 100) * 10) / 10,
    urgent_unresolved_count: threads.filter(t => (t.urgency === 'critical' || t.urgency === 'high') && t.resolution_status !== 'closed').length
  };
}

export async function getEisenhowerThreads(): Promise<EisenhowerThread[]> {
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 500));
  return generateMockEisenhowerThreads();
}

export async function getThreadDetail(threadId: string): Promise<ThreadDetail> {
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 200));
  return generateMockThreadDetail(threadId);
}

export async function getQuadrantSummaries(): Promise<QuadrantSummary[]> {
  const threads = await getEisenhowerThreads();
  const total = threads.length;
  
  const quadrants = ['do', 'schedule', 'delegate', 'delete'] as const;
  const ctaConfig = {
    do: { text: 'Assign Owner', action: 'assign' },
    schedule: { text: 'Schedule', action: 'schedule' },
    delegate: { text: 'Escalate', action: 'escalate' },
    delete: { text: 'Archive', action: 'archive' },
  };

  return quadrants.map(quadrant => {
    const count = threads.filter(t => t.quadrant === quadrant).length;
    return {
      quadrant,
      count,
      percentage: Math.round((count / total) * 100),
      ctaText: ctaConfig[quadrant].text,
      ctaAction: ctaConfig[quadrant].action,
    };
  });
}

// Generate threads over time data
function generateThreadsOverTimeData(): ThreadsOverTimeData[] {
  const data: ThreadsOverTimeData[] = [];
  const startDate = new Date();
  startDate.setDate(startDate.getDate() - 30); // Last 30 days

  for (let i = 0; i < 30; i++) {
    const date = new Date(startDate);
    date.setDate(date.getDate() + i);
    
    const openCustomer = Math.floor(Math.random() * 8) + 3;
    const openCompany = Math.floor(Math.random() * 7) + 2;
    const total = openCustomer + openCompany + Math.floor(Math.random() * 12) + 3;
    
    data.push({
      date: date.toISOString().split('T')[0],
      total: total,
      urgent: Math.floor(Math.random() * 5) + 2,
      openCustomer: openCustomer,
      openCompany: openCompany,
      closed: Math.floor(Math.random() * 12) + 3,
    });
  }

  return data;
}

// Generate sentiment trend data for a thread
function generateSentimentTrendData(threadId: string): SentimentTrendData[] {
  const data: SentimentTrendData[] = [];
  const messageCount = Math.floor(Math.random() * 8) + 3;
  const startTime = new Date();
  startTime.setHours(startTime.getHours() - messageCount * 2);

  for (let i = 0; i < messageCount; i++) {
    const timestamp = new Date(startTime);
    timestamp.setHours(timestamp.getHours() + i * 2);
    
    const positive = Math.random() * 0.6 + 0.2;
    const negative = Math.random() * 0.3;
    const neutral = 1 - positive - negative;
    const sentiment = Math.round((positive - negative) * 2.5 + 3); // Scale to 1-5, whole numbers only

    data.push({
      messageId: `msg_${i + 1}`,
      timestamp: timestamp.toISOString(),
      sentiment: Math.max(1, Math.min(5, sentiment)),
      positive: Math.round(positive * 100) / 100,
      neutral: Math.round(neutral * 100) / 100,
      negative: Math.round(negative * 100) / 100,
    });
  }

  return data;
}

// Generate topic distribution data
function generateTopicDistributionData(): TopicDistributionData[] {
  const topics = [
    'Billing Issues',
    'Technical Support',
    'Account Management',
    'Feature Requests',
    'General Inquiry',
    'Payment Processing',
    'Security Concerns',
    'Product Feedback',
  ];

  return topics.map(topic => {
    const count = Math.floor(Math.random() * 50) + 10;
    const urgentCount = Math.floor(count * (Math.random() * 0.3 + 0.1));
    const total = topics.reduce((sum, t) => sum + (Math.floor(Math.random() * 50) + 10), 0);
    
    return {
      topic,
      count,
      percentage: Math.round((count / total) * 100),
      urgentCount,
      avgSentiment: Math.round((Math.random() * 2 - 1) * 10) / 10, // -1 to 1
    };
  });
}

// Generate priority vs resolution data
function generatePriorityResolutionData(): PriorityResolutionData[] {
  const priorities = ['P1', 'P2', 'P3', 'P4', 'P5'];
  
  return priorities.map(priority => ({
    priority,
    openCustomer: Math.floor(Math.random() * 15) + 3,
    openCompany: Math.floor(Math.random() * 10) + 2,
    closed: Math.floor(Math.random() * 30) + 10,
  }));
}

// New API functions
export async function getThreadsOverTime(): Promise<ThreadsOverTimeData[]> {
  await new Promise(resolve => setTimeout(resolve, 300));
  return generateThreadsOverTimeData();
}

export async function getSentimentTrend(threadId: string): Promise<SentimentTrendData[]> {
  await new Promise(resolve => setTimeout(resolve, 200));
  return generateSentimentTrendData(threadId);
}

export async function getTopicDistribution(): Promise<TopicDistributionData[]> {
  await new Promise(resolve => setTimeout(resolve, 300));
  return generateTopicDistributionData();
}

export async function getPriorityResolutionData(): Promise<PriorityResolutionData[]> {
  await new Promise(resolve => setTimeout(resolve, 200));
  return generatePriorityResolutionData();
}

// Advanced Dashboard API Functions
function generateClusterRiskHeatmapData(): ClusterRiskHeatmapData[] {
  const clusters = ['Billing Issues', 'Technical Support', 'Account Management', 'General Inquiry'];
  const subclusters = {
    'Billing Issues': ['Payment Processing', 'Refunds', 'Invoicing'],
    'Technical Support': ['Login Issues', 'Feature Requests', 'Bug Reports'],
    'Account Management': ['Account Setup', 'Profile Updates', 'Security'],
    'General Inquiry': ['Information', 'Pricing', 'Partnership']
  };
  
  const data: ClusterRiskHeatmapData[] = [];
  
  clusters.forEach(cluster => {
    subclusters[cluster as keyof typeof subclusters].forEach(subcluster => {
      const risk_score = Math.random() * 100;
      const thread_count = Math.floor(Math.random() * 50) + 10;
      
      data.push({
        cluster,
        subcluster,
        risk_score,
        thread_count,
        top_threads: Array.from({ length: 3 }, (_, i) => ({
          thread_id: `thread_${Math.floor(Math.random() * 1000)}`,
          subject_norm: `${subcluster} issue ${i + 1}`,
          risk_score: risk_score + Math.random() * 20 - 10
        }))
      });
    });
  });
  
  return data;
}

function generateActionableCards(): ActionableCard[] {
  const cardTypes: Array<'top_risk' | 'overdue_followup' | 'opportunity' | 'sla_failure' | 'watchlist'> = 
    ['top_risk', 'overdue_followup', 'opportunity', 'sla_failure', 'watchlist'];
  
  return cardTypes.map((type, index) => ({
    id: `card_${type}_${index}`,
    type,
    title: {
      top_risk: 'High Risk Thread Detected',
      overdue_followup: 'Overdue Follow-up Required',
      opportunity: 'Customer Upsell Opportunity',
      sla_failure: 'SLA Breach Risk',
      watchlist: 'VIP Customer Thread'
    }[type],
    description: {
      top_risk: 'This thread has escalated multiple times and requires immediate attention.',
      overdue_followup: 'Customer has been waiting for a response for over 24 hours.',
      opportunity: 'Customer shows interest in premium features based on conversation.',
      sla_failure: 'Thread is approaching SLA deadline and needs escalation.',
      watchlist: 'High-value customer thread requires priority handling.'
    }[type],
    priority: ['critical', 'high', 'medium', 'low'][Math.floor(Math.random() * 4)] as any,
    thread_id: `thread_${Math.floor(Math.random() * 1000)}`,
    subject_norm: `Sample thread ${index + 1}`,
    participants: [
      { name: 'Customer Name', email: 'customer@example.com', type: 'customer' },
      { name: 'Support Agent', email: 'agent@company.com', type: 'external' }
    ],
    next_action_suggestion: 'Contact customer within 2 hours and escalate if needed',
    cta_buttons: [
      { label: 'Escalate', action: 'escalate', variant: 'danger' },
      { label: 'Assign Owner', action: 'assign_owner', variant: 'primary' },
      { label: 'Reply', action: 'reply', variant: 'secondary' }
    ],
    metadata: {
      urgency: ['critical', 'high', 'medium', 'low'][Math.floor(Math.random() * 4)],
      sentiment: Math.round(Math.random() * 4) + 1,
      follow_up_date: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
      sla_breach_risk: Math.random() * 100
    }
  }));
}

function generateNetworkGraphData(): NetworkGraphData {
  const nodes = [];
  const edges = [];
  
  // Generate customer nodes
  for (let i = 0; i < 20; i++) {
    nodes.push({
      id: `customer_${i}`,
      label: `Customer ${i}`,
      type: 'customer' as const,
      email: `customer${i}@example.com`,
      thread_count: Math.floor(Math.random() * 10) + 1,
      avg_sentiment: Math.round(Math.random() * 4) + 1
    });
  }
  
  // Generate external nodes
  for (let i = 0; i < 8; i++) {
    nodes.push({
      id: `external_${i}`,
      label: `External ${i}`,
      type: 'external' as const,
      email: `external${i}@company.com`,
      thread_count: Math.floor(Math.random() * 20) + 5,
      avg_sentiment: Math.round(Math.random() * 2) + 3 // External contacts tend to have better sentiment
    });
  }
  
  // Generate edges between customers and external contacts
  for (let i = 0; i < 30; i++) {
    const customer = `customer_${Math.floor(Math.random() * 20)}`;
    const external = `external_${Math.floor(Math.random() * 8)}`;
    const weight = Math.random();
    
    edges.push({
      source: customer,
      target: external,
      weight,
      thread_count: Math.floor(Math.random() * 5) + 1
    });
  }
  
  return { nodes, edges };
}

function generatePredictiveMetrics(): PredictiveMetrics {
  const risk_forecast: Array<{
    date: string;
    predicted_risk_score: number;
    confidence: number;
  }> = [];
  const ai_risk_cards: Array<{
    risk_type: string;
    probability: number;
    impact: number;
    recommendation: string;
  }> = [];
  const workload_prediction: Array<{
    date: string;
    predicted_threads: number;
    predicted_urgent: number;
  }> = [];
  
  // Generate 7-day risk forecast
  for (let i = 0; i < 7; i++) {
    const date = new Date();
    date.setDate(date.getDate() + i);
    
    risk_forecast.push({
      date: date.toISOString().split('T')[0],
      predicted_risk_score: Math.random() * 100,
      confidence: Math.random() * 0.3 + 0.7 // 70-100% confidence
    });
  }
  
  // Generate AI risk cards
  const riskTypes = ['Sentiment Decline', 'Escalation Spike', 'SLA Breach', 'Resource Overload'];
  riskTypes.forEach(riskType => {
    ai_risk_cards.push({
      risk_type: riskType,
      probability: Math.random() * 100,
      impact: Math.random() * 100,
      recommendation: `Monitor ${riskType.toLowerCase()} patterns and prepare mitigation strategies`
    });
  });
  
  // Generate workload prediction
  for (let i = 0; i < 14; i++) {
    const date = new Date();
    date.setDate(date.getDate() + i);
    
    workload_prediction.push({
      date: date.toISOString().split('T')[0],
      predicted_threads: Math.floor(Math.random() * 50) + 20,
      predicted_urgent: Math.floor(Math.random() * 10) + 5
    });
  }
  
  return { risk_forecast, ai_risk_cards, workload_prediction };
}

// Export new API functions
export async function getClusterRiskHeatmapData(): Promise<ClusterRiskHeatmapData[]> {
  await new Promise(resolve => setTimeout(resolve, 300));
  return generateClusterRiskHeatmapData();
}

export async function getActionableCards(): Promise<ActionableCard[]> {
  await new Promise(resolve => setTimeout(resolve, 200));
  return generateActionableCards();
}

export async function getNetworkGraphData(): Promise<NetworkGraphData> {
  await new Promise(resolve => setTimeout(resolve, 400));
  return generateNetworkGraphData();
}

export async function getPredictiveMetrics(): Promise<PredictiveMetrics> {
  await new Promise(resolve => setTimeout(resolve, 500));
  return generatePredictiveMetrics();
}

// Generate priority resolution data for a specific quadrant
export function generatePriorityResolutionDataForQuadrant(threads: EisenhowerThread[], quadrant: string): PriorityResolutionData[] {
  // Define allowed priorities for each quadrant
  const quadrantPriorities: Record<string, string[]> = {
    do: ['P1', 'P2'],
    schedule: ['P2', 'P3'],
    delegate: ['P3', 'P4'],
    delete: ['P4', 'P5']
  };

  // Get allowed priorities for this quadrant
  const allowedPriorities = quadrantPriorities[quadrant] || [];

  // Filter threads by quadrant and allowed priorities
  const quadrantThreads = threads.filter(thread => 
    thread.quadrant === quadrant && allowedPriorities.includes(thread.priority)
  );

  // Group by priority and count statuses (only for allowed priorities)
  const priorityCounts: Record<string, { openCustomer: number; openCompany: number; closed: number }> = {};

  quadrantThreads.forEach(thread => {
    const priority = thread.priority;
    if (!priorityCounts[priority]) {
      priorityCounts[priority] = { openCustomer: 0, openCompany: 0, closed: 0 };
    }

    if (thread.resolution_status === 'open' && thread.action_pending_from === 'customer') {
      priorityCounts[priority].openCustomer++;
    } else if (thread.resolution_status === 'open' && thread.action_pending_from === 'company') {
      priorityCounts[priority].openCompany++;
    } else if (thread.resolution_status === 'closed') {
      priorityCounts[priority].closed++;
    }
  });

  // Convert to array format, only including allowed priorities
  return allowedPriorities.map(priority => ({
    priority,
    openCustomer: priorityCounts[priority]?.openCustomer || 0,
    openCompany: priorityCounts[priority]?.openCompany || 0,
    closed: priorityCounts[priority]?.closed || 0
  }));
}

// Social Media Dashboard Types and Interfaces
export interface ExecutiveAlert {
  id: string;
  type: 'critical' | 'urgent' | 'strategic';
  title: string;
  description: string;
  impact: string; // e.g., "$47K revenue at risk", "2,400% increase"
  urgency: string; // e.g., "TODAY", "next 24 hours"
  recommendedAction: string;
  affectedUsers?: number;
  revenueImpact?: number;
  timestamp: string;
}

export interface BusinessImpactScorecard {
  revenueRisk: {
    amount: number;
    trend: 'up' | 'down' | 'stable';
    trendPercentage: number;
    breakdown: Array<{ type: string; amount: number; count: number }>;
  };
  brandHealthScore: {
    score: number; // 0-100
    trend: 'up' | 'down' | 'stable';
    trendPoints: number;
    sentimentBreakdown: Array<{ topic: string; sentiment: number; mentions: number }>;
    benchmark: number;
    target: number;
  };
  customerEffortIndex: {
    highEffortCount: number;
    trend: 'up' | 'down' | 'stable';
    percentage: number;
  };
  opportunityPipeline: {
    totalValue: number;
    featureRequests: { value: number; count: number };
    expansionSignals: { value: number; count: number };
    conversionProbability: number;
  };
}

export interface IssueVelocityData {
  date: string;
  criticalIssues: number;
  allIssues: number;
  resolvedIssues: number;
  annotations?: Array<{ date: string; event: string; type: 'release' | 'campaign' | 'incident' }>;
}

export interface TopicBubbleData {
  topic: string;
  volume: number;
  sentiment: number; // -1 to 1
  businessImpact: number; // 0-100
  resolutionDifficulty: number; // 0-100
  mentions: number;
  sampleQuotes: string[];
}

export interface ChannelPerformance {
  channel: string;
  avgResponseTime: number; // hours
  slaTarget: number;
  slaCompliance: number; // percentage
  costPerInteraction?: number;
  resolutionRate: number;
  customerSatisfaction: number;
  roiScore: number;
  issueCount: number;
}

export interface ActionItem {
  id: string;
  priority: number;
  summary: string;
  whyItMatters: string;
  waitingTime: string;
  recommendedOwner: string;
  customerValue?: number;
  contractValue?: number;
  revenueImpact?: number;
  competitorMention?: boolean;
  actions: Array<{ label: string; action: string }>;
}

export interface PredictiveForecast {
  date: string;
  predictedVolume: number;
  predictedSentiment: number;
  predictedUrgentIssues: number;
  confidence: number;
}

export interface EmergingIssue {
  topic: string;
  firstDetected: string;
  currentVolume: number;
  growthRate: number; // percentage
  sentiment: number;
  channels: string[];
  recommendation: string;
}

export interface StrategicRecommendation {
  category: 'risk' | 'opportunity' | 'action';
  title: string;
  description: string;
  impact: string;
  timeframe: string;
  priority: number;
}

export interface SocialMediaKPIData {
  totalMentions: number;
  pendingActions: number;
  sentimentScore: number;
  engagementRate: number;
  urgentMentions: number;
  viralPotential: number;
  brandHealthScore: number;
  revenueRisk: number;
}

// Social Media API Functions
export async function getSocialMediaKPIs(): Promise<SocialMediaKPIData> {
  await new Promise(resolve => setTimeout(resolve, 300));
  return {
    totalMentions: 4247,
    pendingActions: 434,
    sentimentScore: 87.3,
    engagementRate: 12.5,
    urgentMentions: 187,
    viralPotential: 23,
    brandHealthScore: 78,
    revenueRisk: 127000,
  };
}

export async function getExecutiveAlerts(): Promise<ExecutiveAlert[]> {
  await new Promise(resolve => setTimeout(resolve, 200));
  return [
    {
      id: '1',
      type: 'critical',
      title: 'Payment failures on App Store',
      description: '187 customers reporting payment failures on App Store',
      impact: '$47K revenue at risk',
      urgency: 'TODAY',
      recommendedAction: 'Escalate to Finance & Engineering teams immediately',
      affectedUsers: 187,
      revenueImpact: 47000,
      timestamp: new Date().toISOString(),
    },
    {
      id: '2',
      type: 'critical',
      title: 'Viral negative sentiment spike on X',
      description: '2,400% increase in negative mentions - possible PR crisis',
      impact: '2,400% increase',
      urgency: 'TODAY',
      recommendedAction: 'Activate PR crisis protocol - draft response statement',
      affectedUsers: 2400,
      timestamp: new Date().toISOString(),
    },
    {
      id: '3',
      type: 'critical',
      title: 'VIP customers awaiting response',
      description: '23 VIP customers awaiting response >72 hours',
      impact: 'Churn risk HIGH',
      urgency: 'next 24 hours',
      recommendedAction: 'Assign to VP Customer Success - immediate outreach',
      affectedUsers: 23,
      revenueImpact: 450000,
      timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
    },
    {
      id: '4',
      type: 'urgent',
      title: 'Feature request opportunity',
      description: '345 customers requesting Feature X this week',
      impact: 'Potential upsell opportunity',
      urgency: 'This week',
      recommendedAction: 'Route to Product team for prioritization',
      affectedUsers: 345,
      timestamp: new Date(Date.now() - 5 * 60 * 60 * 1000).toISOString(),
    },
    {
      id: '5',
      type: 'strategic',
      title: 'Billing complexity complaints',
      description: "'Billing complexity' complaints up 156% month-over-month",
      impact: 'Pricing page issue?',
      urgency: 'This month',
      recommendedAction: 'Review pricing page UX - consider simplification',
      timestamp: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
    },
  ];
}

export async function getBusinessImpactScorecard(): Promise<BusinessImpactScorecard> {
  await new Promise(resolve => setTimeout(resolve, 300));
  return {
    revenueRisk: {
      amount: 127000,
      trend: 'up',
      trendPercentage: 12.5,
      breakdown: [
        { type: 'Billing Issues', amount: 47000, count: 187 },
        { type: 'VIP Churn Risk', amount: 450000, count: 23 },
        { type: 'Service Outages', amount: 35000, count: 89 },
      ],
    },
    brandHealthScore: {
      score: 78,
      trend: 'down',
      trendPoints: 12,
      sentimentBreakdown: [
        { topic: 'Product Quality', sentiment: 82, mentions: 1247 },
        { topic: 'Customer Support', sentiment: 71, mentions: 892 },
        { topic: 'Pricing', sentiment: 65, mentions: 567 },
        { topic: 'Features', sentiment: 88, mentions: 541 },
      ],
      benchmark: 72,
      target: 85,
    },
    customerEffortIndex: {
      highEffortCount: 89,
      trend: 'down',
      percentage: 2.1,
    },
    opportunityPipeline: {
      totalValue: 2300000,
      featureRequests: { value: 890000, count: 345 },
      expansionSignals: { value: 1400000, count: 234 },
      conversionProbability: 68,
    },
  };
}

export async function getIssueVelocityData(): Promise<IssueVelocityData[]> {
  await new Promise(resolve => setTimeout(resolve, 300));
  const data: IssueVelocityData[] = [];
  const startDate = new Date();
  startDate.setDate(startDate.getDate() - 30);

  for (let i = 0; i < 30; i++) {
    const date = new Date(startDate);
    date.setDate(date.getDate() + i);
    data.push({
      date: date.toISOString().split('T')[0],
      criticalIssues: Math.floor(Math.random() * 20) + 5,
      allIssues: Math.floor(Math.random() * 100) + 50,
      resolvedIssues: Math.floor(Math.random() * 90) + 40,
    });
  }

  // Add annotations
  data[15].annotations = [{ date: data[15].date, event: 'Product Release v2.3', type: 'release' }];
  data[20].annotations = [{ date: data[20].date, event: 'Marketing Campaign Launch', type: 'campaign' }];
  data[25].annotations = [{ date: data[25].date, event: 'Service Outage', type: 'incident' }];

  return data;
}

export async function getTopicBubbleData(): Promise<TopicBubbleData[]> {
  await new Promise(resolve => setTimeout(resolve, 300));
  return [
    {
      topic: 'Payment Processing',
      volume: 187,
      sentiment: -0.65,
      businessImpact: 85,
      resolutionDifficulty: 45,
      mentions: 187,
      sampleQuotes: ['Unable to complete payment', 'Card declined error', 'Payment gateway timeout'],
    },
    {
      topic: 'Mobile App Crash',
      volume: 89,
      sentiment: -0.72,
      businessImpact: 78,
      resolutionDifficulty: 60,
      mentions: 89,
      sampleQuotes: ['App crashes on login', 'Freezing after update', 'iOS version broken'],
    },
    {
      topic: 'Feature Requests',
      volume: 345,
      sentiment: 0.45,
      businessImpact: 65,
      resolutionDifficulty: 55,
      mentions: 345,
      sampleQuotes: ['Would love dark mode', 'Need export feature', 'Add calendar integration'],
    },
    {
      topic: 'Customer Support',
      volume: 234,
      sentiment: 0.35,
      businessImpact: 72,
      resolutionDifficulty: 40,
      mentions: 234,
      sampleQuotes: ['Quick response time', 'Helpful support team', 'Great service'],
    },
    {
      topic: 'Billing Issues',
      volume: 156,
      sentiment: -0.55,
      businessImpact: 80,
      resolutionDifficulty: 35,
      mentions: 156,
      sampleQuotes: ['Wrong charge amount', 'Double billing', 'Refund not processed'],
    },
  ];
}

export async function getChannelPerformance(): Promise<ChannelPerformance[]> {
  await new Promise(resolve => setTimeout(resolve, 300));
  return [
    {
      channel: 'X',
      avgResponseTime: 2.3,
      slaTarget: 4,
      slaCompliance: 92,
      costPerInteraction: 2.5,
      resolutionRate: 78,
      customerSatisfaction: 82,
      roiScore: 85,
      issueCount: 1247,
    },
    {
      channel: 'Trustpilot',
      avgResponseTime: 4.1,
      slaTarget: 6,
      slaCompliance: 68,
      costPerInteraction: 3.2,
      resolutionRate: 65,
      customerSatisfaction: 71,
      roiScore: 72,
      issueCount: 892,
    },
    {
      channel: 'App Store/Play Store',
      avgResponseTime: 3.5,
      slaTarget: 8,
      slaCompliance: 88,
      costPerInteraction: 2.8,
      resolutionRate: 71,
      customerSatisfaction: 79,
      roiScore: 78,
      issueCount: 567,
    },
    {
      channel: 'Reddit',
      avgResponseTime: 5.2,
      slaTarget: 12,
      slaCompliance: 45,
      costPerInteraction: 4.5,
      resolutionRate: 52,
      customerSatisfaction: 68,
      roiScore: 58,
      issueCount: 341,
    },
  ];
}

export async function getActionItems(): Promise<ActionItem[]> {
  await new Promise(resolve => setTimeout(resolve, 300));
  return [
    {
      id: '1',
      priority: 1,
      summary: 'VIP customer @TechCorpInc mentioned competitor on X',
      whyItMatters: 'VIP customer, $450K annual contract, mentioned competitor',
      waitingTime: '73 hours - OVERDUE',
      recommendedOwner: 'VP Customer Success',
      customerValue: 450000,
      competitorMention: true,
      actions: [
        { label: 'Assign', action: 'assign' },
        { label: 'Schedule Call', action: 'schedule' },
      ],
    },
    {
      id: '2',
      priority: 2,
      summary: 'Payment processing failures affecting 187 customers',
      whyItMatters: '$47K revenue at risk, App Store rating declining',
      waitingTime: '12 hours',
      recommendedOwner: 'VP Engineering',
      revenueImpact: 47000,
      actions: [
        { label: 'Escalate', action: 'escalate' },
        { label: 'Assign', action: 'assign' },
      ],
    },
    {
      id: '3',
      priority: 3,
      summary: 'Viral negative sentiment spike needs PR response',
      whyItMatters: '2,400% increase in negative mentions - brand reputation at risk',
      waitingTime: '4 hours',
      recommendedOwner: 'VP Marketing',
      actions: [
        { label: 'Draft Response', action: 'draft' },
        { label: 'Escalate', action: 'escalate' },
      ],
    },
  ];
}

export async function getPredictiveForecast(): Promise<PredictiveForecast[]> {
  await new Promise(resolve => setTimeout(resolve, 300));
  const data: PredictiveForecast[] = [];
  const startDate = new Date();
  
  for (let i = 0; i < 7; i++) {
    const date = new Date(startDate);
    date.setDate(date.getDate() + i);
    data.push({
      date: date.toISOString().split('T')[0],
      predictedVolume: Math.floor(Math.random() * 200) + 100,
      predictedSentiment: Math.random() * 0.4 + 0.6,
      predictedUrgentIssues: Math.floor(Math.random() * 30) + 10,
      confidence: Math.random() * 0.2 + 0.75,
    });
  }
  
  return data;
}

export async function getEmergingIssues(): Promise<EmergingIssue[]> {
  await new Promise(resolve => setTimeout(resolve, 300));
  return [
    {
      topic: 'Mobile App Crash',
      firstDetected: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000).toISOString(),
      currentVolume: 89,
      growthRate: 120,
      sentiment: -0.72,
      channels: ['X', 'Reddit', 'App Store'],
      recommendation: 'Investigate mobile app stability - prepare hotfix',
    },
    {
      topic: 'Login Authentication',
      firstDetected: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
      currentVolume: 45,
      growthRate: 85,
      sentiment: -0.58,
      channels: ['X', 'Support'],
      recommendation: 'Review authentication system - possible security issue',
    },
  ];
}

export async function getStrategicRecommendations(): Promise<StrategicRecommendation[]> {
  await new Promise(resolve => setTimeout(resolve, 300));
  return [
    {
      category: 'risk',
      title: 'Payment processing complaints up 234%',
      description: 'Potential revenue loss $450K/mo',
      impact: '$450K monthly revenue at risk',
      timeframe: 'Immediate',
      priority: 1,
    },
    {
      category: 'risk',
      title: 'Mobile app stability issues affecting 12% of user base',
      description: 'App Store rating dropped 4.2→3.1',
      impact: '12% user base affected',
      timeframe: 'This Week',
      priority: 2,
    },
    {
      category: 'risk',
      title: 'Premium customer response time 3x SLA',
      description: 'Churn risk on $2.1M ARR',
      impact: '$2.1M ARR at risk',
      timeframe: 'This Month',
      priority: 3,
    },
    {
      category: 'opportunity',
      title: 'Enterprise feature requests up 400%',
      description: '$5M pipeline opportunity if shipped Q1',
      impact: '$5M pipeline opportunity',
      timeframe: 'Q1',
      priority: 1,
    },
    {
      category: 'opportunity',
      title: 'Competitor X customers expressing dissatisfaction',
      description: '89 warm leads identified',
      impact: '89 warm leads',
      timeframe: 'This Month',
      priority: 2,
    },
    {
      category: 'action',
      title: 'Assign crisis team to payment issues',
      description: '24hr war room',
      impact: 'Immediate resolution',
      timeframe: '24 hours',
      priority: 1,
    },
  ];
}

// Social Media Eisenhower Threads
function generateSocialMediaEisenhowerThreads(): EisenhowerThread[] {
  const threads: EisenhowerThread[] = [];
  
  // Target counts for each quadrant (similar to email but adjusted for social media)
  const targetCounts = {
    do: 15,        // Critical mentions needing immediate response
    schedule: 42,   // Important but not urgent
    delegate: 387,  // Can be handled by team
    delete: 3803    // Low priority/no action needed
  };
  
  const quadrantCounts = {
    do: 0,
    schedule: 0,
    delegate: 0,
    delete: 0
  };
  
  const socialMediaSubjects = [
    'Payment processing failure on X',
    'Account locked complaint on Trustpilot',
    'Service outage report on Reddit',
    'Feature request on App Store/Play Store',
    'Billing inquiry on X',
    'Technical support needed',
    'Refund request viral post',
    'Account upgrade question',
    'Password reset request',
    'General feedback post',
    'Security concern trending',
    'Customer complaint escalating',
    'VIP customer issue',
    'System performance complaint',
    'Data export request',
    'App integration failure',
    'Compliance violation mention',
    'Partnership inquiry',
    'Emergency support needed',
    'Viral negative sentiment'
  ];
  
  const priorities: Array<'P1' | 'P2' | 'P3' | 'P4' | 'P5'> = ['P1', 'P2', 'P3', 'P4', 'P5'];
  const urgencies: Array<'critical' | 'high' | 'medium' | 'low'> = ['critical', 'high', 'medium', 'low'];
  const topics = ['Payment Issues', 'Account Problems', 'Technical Support', 'Feature Requests', 'Security', 'Billing'];
  const dominantClusters = ['Payment Failures', 'Account Access', 'Technical Support', 'Feature Requests', 'Security Concerns', 'Billing Issues'];
  const platforms = ['X', 'Trustpilot', 'App Store/Play Store', 'Reddit'];
  const assignedTo = ['Social Media Team', 'Customer Support', 'Technical Team', 'Product Team', 'Security Team', 'Billing Team'];
  
  const nextActions = [
    'Respond within 1 hour',
    'Monitor and escalate if needed',
    'Assign to specialist team',
    'Schedule follow-up response',
    'Archive - no action needed',
    'Engage with positive response',
    'Draft crisis response',
    'Assign to customer success',
    'Route to product team',
    'Forward to technical support'
  ];
  
  const totalThreads = targetCounts.do + targetCounts.schedule + targetCounts.delegate + targetCounts.delete;
  
  for (let i = 0; i < totalThreads; i++) {
    let quadrant: 'do' | 'schedule' | 'delegate' | 'delete';
    
    if (quadrantCounts.do < targetCounts.do) {
      quadrant = 'do';
      quadrantCounts.do++;
    } else if (quadrantCounts.schedule < targetCounts.schedule) {
      quadrant = 'schedule';
      quadrantCounts.schedule++;
    } else if (quadrantCounts.delegate < targetCounts.delegate) {
      quadrant = 'delegate';
      quadrantCounts.delegate++;
    } else {
      quadrant = 'delete';
      quadrantCounts.delete++;
    }
    
    const isUrgent = quadrant === 'do' || quadrant === 'delegate';
    const isImportant = quadrant === 'do' || quadrant === 'schedule';
    
    const priority = quadrant === 'do' ? 'P1' : 
                     quadrant === 'schedule' ? 'P2' : 
                     quadrant === 'delegate' ? 'P3' : 'P4';
    const urgency = quadrant === 'do' ? 'critical' : 
                    quadrant === 'schedule' ? 'high' : 
                    quadrant === 'delegate' ? 'medium' : 'low';
    
    const importanceScore = isImportant ? 70 + Math.random() * 30 : Math.random() * 40;
    const urgencyFlag = isUrgent ? 70 + Math.random() * 30 : Math.random() * 40;
    
    const now = new Date();
    const daysAgo = Math.floor(Math.random() * 30);
    const lastMessageAt = new Date(now);
    lastMessageAt.setDate(now.getDate() - daysAgo);
    const firstMessageAt = new Date(lastMessageAt);
    firstMessageAt.setDate(lastMessageAt.getDate() - Math.floor(Math.random() * 5));
    
    const platform = platforms[Math.floor(Math.random() * platforms.length)];
    const threadId = `sm_${i + 1}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    threads.push({
      thread_id: threadId,
      subject_norm: `${socialMediaSubjects[i % socialMediaSubjects.length]} - ${platform}`,
      participants: [
        {
          type: 'external',
          name: `Customer ${i + 1}`,
          email: `customer${i + 1}@example.com`
        }
      ],
      resolution_status: quadrant === 'delete' ? 'closed' : 
                         Math.random() > 0.7 ? 'in_progress' : 
                         Math.random() > 0.5 ? 'open' : 'escalated',
      priority: priority as 'P1' | 'P2' | 'P3' | 'P4' | 'P5',
      urgency: urgency as 'critical' | 'high' | 'medium' | 'low',
      importance_score: Math.round(importanceScore),
      urgency_flag: Math.round(urgencyFlag),
      quadrant,
      business_impact_score: isImportant ? Math.round(60 + Math.random() * 40) : Math.round(Math.random() * 40),
      risk_score: isUrgent ? Math.round(60 + Math.random() * 40) : Math.round(Math.random() * 40),
      escalation_count: quadrant === 'do' && Math.random() > 0.7 ? 1 : 0,
      follow_up_required: quadrant === 'do' || quadrant === 'schedule',
      overall_sentiment: Math.round((Math.random() - 0.3) * 100), // Slightly negative bias
      next_action_suggestion: nextActions[i % nextActions.length],
      action_pending_from: Math.random() > 0.5 ? 'company' : 'customer',
      action_pending_status: quadrant === 'delete' ? 'completed' : 
                             Math.random() > 0.6 ? 'pending' : 
                             Math.random() > 0.5 ? 'in_progress' : 'overdue',
      assigned_to: quadrant !== 'delete' ? assignedTo[Math.floor(Math.random() * assignedTo.length)] : undefined,
      owner: quadrant !== 'delete' ? assignedTo[Math.floor(Math.random() * assignedTo.length)] : undefined,
      topic: topics[i % topics.length],
      dominant_cluster_name: dominantClusters[i % dominantClusters.length],
      last_message_at: lastMessageAt.toISOString(),
      first_message_at: firstMessageAt.toISOString(),
    });
  }
  
  return threads;
}

export async function getSocialMediaEisenhowerThreads(): Promise<EisenhowerThread[]> {
  await new Promise(resolve => setTimeout(resolve, 500));
  return generateSocialMediaEisenhowerThreads();
}

// AI-Driven Insights Types
export interface AIInsight {
  id: string;
  type: 'root_cause' | 'action_recommendation' | 'predictive_impact' | 'cross_correlation' | 'trend_anomaly';
  severity: 'critical' | 'high' | 'medium' | 'low';
  title: string;
  description: string;
  aiReasoning: string;
  businessImpact: string;
  recommendedAction: string;
  confidence: number; // 0-100
  affectedChannels: string[];
  relatedTopics: string[];
  timeframe: string;
  estimatedImpact?: {
    revenue?: number;
    sentiment?: number;
    ratings?: number;
    users?: number;
  };
  evidence?: Array<{
    source: string;
    quote: string;
    sentiment: number;
  }>;
}

export interface TopicCluster {
  clusterId: number;
  clusterName: string;
  subclusters: Array<{
    subclusterId: string;
    subclusterLabel: string;
    messageCount: number;
    sentiment: number;
    urgency: number;
    trend: 'up' | 'down' | 'stable';
    aiExplanation: string;
  }>;
  totalMessages: number;
  avgSentiment: number;
  businessImpact: 'high' | 'medium' | 'low';
  rootCause?: string;
}

export interface AINarrativePoint {
  timestamp: string;
  event: string;
  sentiment: number;
  explanation: string;
  keyTopics: string[];
  aiInsight: string;
}

export interface CrossChannelCorrelation {
  topic: string;
  channels: Array<{
    channel: string;
    percentage: number;
    sentiment: number;
    trend: 'up' | 'down' | 'stable';
  }>;
  correlationScore: number;
  aiInterpretation: string;
  recommendedAction: string;
}

export interface ExecutiveSummary {
  summary: string;
  keyMetrics: {
    totalMentions: number;
    sentimentScore: number;
    criticalIssues: number;
    opportunities: number;
  };
  topInsights: AIInsight[];
  recommendedActions: Array<{
    action: string;
    priority: number;
    owner: string;
    timeframe: string;
    expectedImpact: string;
  }>;
  next24Hours: string[];
}

// AI-Driven API Functions
export async function getAIInsights(): Promise<AIInsight[]> {
  await new Promise(resolve => setTimeout(resolve, 400));
  return [
    {
      id: 'ai-1',
      type: 'root_cause',
      severity: 'critical',
      title: '📉 Drop in sentiment around App Performance — Root Cause Analysis',
      description: 'Sentiment dropped 23% in the last 7 days, primarily from App Store/Play Store reviews',
      aiReasoning: 'AI detected 347 negative reviews mentioning "app crashes" and "slow performance" correlating with version 2.4.1 release on Dec 15. Cross-channel analysis shows 30% correlation with Reddit discussions about the same issue, suggesting a systematic problem rather than isolated complaints.',
      businessImpact: 'Estimated $127K revenue at risk from potential churn and negative word-of-mouth. Current 3.8★ rating at risk of dropping below 3.5★ threshold.',
      recommendedAction: 'Immediate: Assign dev team lead to investigate version 2.4.1 crash logs. Priority: Release hotfix within 48 hours. Marketing: Prepare communication plan for affected users.',
      confidence: 94,
      affectedChannels: ['App Store/Play Store', 'Reddit', 'X'],
      relatedTopics: ['App Crashes', 'Performance Issues', 'Version 2.4.1'],
      timeframe: 'Last 7 days',
      estimatedImpact: {
        revenue: 127000,
        sentiment: -23,
        ratings: -0.3,
        users: 4500
      },
      evidence: [
        { source: 'App Store Review', quote: 'App keeps crashing after update', sentiment: -0.8 },
        { source: 'Reddit Post', quote: 'Is anyone else experiencing constant crashes?', sentiment: -0.7 }
      ]
    },
    {
      id: 'ai-2',
      type: 'action_recommendation',
      severity: 'high',
      title: '🔥 Spike in mentions of refund issues — Escalate to CX Head',
      description: '187% increase in refund-related mentions across all channels in the last 48 hours',
      aiReasoning: 'AI identified pattern: Customers mentioning "refund not processed" and "waiting for refund" with average wait time of 14 days. Sentiment analysis shows frustration escalating from -0.3 to -0.7 over past week.',
      businessImpact: 'High churn risk: 89 customers explicitly mentioned "canceling subscription" in relation to refund delays. Potential $47K monthly recurring revenue at risk.',
      recommendedAction: 'Urgent: Assign CX Head to review refund processing workflow. Action: Reduce processing time from 14 days to 3 days. Communication: Send apology emails to affected customers with status update.',
      confidence: 89,
      affectedChannels: ['Trustpilot', 'X', 'App Store/Play Store'],
      relatedTopics: ['Refund Processing', 'Payment Issues', 'Customer Service'],
      timeframe: 'Last 48 hours',
      estimatedImpact: {
        revenue: 47000,
        sentiment: -15,
        users: 89
      }
    },
    {
      id: 'ai-3',
      type: 'predictive_impact',
      severity: 'medium',
      title: '💡 Positive buzz around new feature — Amplify in marketing',
      description: 'Feature X mentioned positively in 234 posts across X and Reddit with 89% positive sentiment',
      aiReasoning: 'AI predicts this feature could drive 15-20% increase in new signups if leveraged in marketing campaigns. Sentiment trajectory shows upward trend from +0.4 to +0.7 over past 2 weeks.',
      businessImpact: 'Opportunity: Potential to capture 2,300 new users in next 30 days if marketing campaign launched. Estimated revenue opportunity: $115K.',
      recommendedAction: 'Marketing: Create case study highlighting Feature X benefits. Social: Amplify positive user testimonials. Product: Consider featuring in onboarding flow.',
      confidence: 82,
      affectedChannels: ['X', 'Reddit'],
      relatedTopics: ['Feature X', 'User Satisfaction', 'Product Updates'],
      timeframe: 'Next 30 days',
      estimatedImpact: {
        revenue: 115000,
        sentiment: 15,
        users: 2300
      }
    },
    {
      id: 'ai-4',
      type: 'cross_correlation',
      severity: 'high',
      title: '🔗 Payment Issue trending across multiple channels — Possible app bug',
      description: '"Payment Issue" trending 30% on Play Store, 20% on Reddit, 15% on X — AI detected correlation',
      aiReasoning: 'Cross-channel correlation analysis shows 78% similarity in complaint patterns. All mention "transaction failed" or "payment not going through" with timestamps clustering around specific times, suggesting a systematic payment gateway issue rather than user error.',
      businessImpact: 'Critical: Payment failures directly impact revenue. Estimated $89K in failed transactions over past week. User trust deteriorating rapidly.',
      recommendedAction: 'Immediate: Escalate to payment gateway team. Technical: Review payment processing logs for error patterns. Communication: Prepare status update for affected users.',
      confidence: 91,
      affectedChannels: ['App Store/Play Store', 'Reddit', 'X'],
      relatedTopics: ['Payment Processing', 'Transaction Failures', 'Payment Gateway'],
      timeframe: 'Last 7 days',
      estimatedImpact: {
        revenue: 89000,
        sentiment: -18,
        users: 3200
      }
    }
  ];
}

export async function getTopicClusters(): Promise<TopicCluster[]> {
  await new Promise(resolve => setTimeout(resolve, 400));
  return [
    {
      clusterId: 1,
      clusterName: 'Payment & Transaction Issues',
      totalMessages: 1247,
      avgSentiment: -0.45,
      businessImpact: 'high',
      rootCause: 'AI Analysis: Payment gateway timeout issues occurring during peak hours (10am-2pm EST) causing transaction failures. Root cause linked to recent infrastructure update on Dec 10.',
      subclusters: [
        {
          subclusterId: '1.1',
          subclusterLabel: 'Payment Failures',
          messageCount: 567,
          sentiment: -0.72,
          urgency: 0.9,
          trend: 'up',
          aiExplanation: 'Critical: 89% of messages mention "transaction failed" or "payment not processed". 67% of users report waiting >24 hours for resolution.'
        },
        {
          subclusterId: '1.2',
          subclusterLabel: 'Refund Delays',
          messageCount: 423,
          sentiment: -0.58,
          urgency: 0.7,
          trend: 'up',
          aiExplanation: 'High urgency: Average refund processing time increased from 7 days to 14 days. 34% of complaints mention considering cancellation.'
        },
        {
          subclusterId: '1.3',
          subclusterLabel: 'Billing Inquiries',
          messageCount: 257,
          sentiment: -0.31,
          urgency: 0.5,
          trend: 'stable',
          aiExplanation: 'Medium: General billing questions and clarifications. Most resolved with standard response templates.'
        }
      ]
    },
    {
      clusterId: 2,
      clusterName: 'App Performance & Stability',
      totalMessages: 892,
      avgSentiment: -0.38,
      businessImpact: 'high',
      rootCause: 'AI Analysis: App crashes correlate with version 2.4.1 release. Crash logs show memory leak in payment module. Affects 23% of iOS users and 18% of Android users.',
      subclusters: [
        {
          subclusterId: '2.1',
          subclusterLabel: 'App Crashes',
          messageCount: 445,
          sentiment: -0.65,
          urgency: 0.85,
          trend: 'up',
          aiExplanation: 'Critical: 347 reviews on App Store mention crashes after update. Reddit discussions show 12% increase in crash reports.'
        },
        {
          subclusterId: '2.2',
          subclusterLabel: 'Slow Performance',
          messageCount: 312,
          sentiment: -0.42,
          urgency: 0.6,
          trend: 'up',
          aiExplanation: 'High: Users reporting app freezing and slow load times. 45% mention switching to competitor due to performance.'
        },
        {
          subclusterId: '2.3',
          subclusterLabel: 'Login Issues',
          messageCount: 135,
          sentiment: -0.28,
          urgency: 0.4,
          trend: 'stable',
          aiExplanation: 'Medium: Authentication problems affecting 8% of users. Most resolved with password reset.'
        }
      ]
    },
    {
      clusterId: 3,
      clusterName: 'Feature Requests & Positive Feedback',
      totalMessages: 634,
      avgSentiment: 0.68,
      businessImpact: 'medium',
      subclusters: [
        {
          subclusterId: '3.1',
          subclusterLabel: 'Feature X Praise',
          messageCount: 234,
          sentiment: 0.89,
          urgency: 0.3,
          trend: 'up',
          aiExplanation: 'Opportunity: Strong positive sentiment around Feature X. AI suggests amplifying in marketing materials and onboarding flow.'
        },
        {
          subclusterId: '3.2',
          subclusterLabel: 'New Feature Requests',
          messageCount: 287,
          sentiment: 0.45,
          urgency: 0.2,
          trend: 'stable',
          aiExplanation: 'Low: General feature requests. Top request: Dark mode (mentioned 89 times). Consider product roadmap prioritization.'
        },
        {
          subclusterId: '3.3',
          subclusterLabel: 'User Success Stories',
          messageCount: 113,
          sentiment: 0.92,
          urgency: 0.1,
          trend: 'stable',
          aiExplanation: 'Low: Positive testimonials. Opportunity to use in case studies and social media marketing.'
        }
      ]
    }
  ];
}

export async function getAINarrativeTimeline(): Promise<AINarrativePoint[]> {
  await new Promise(resolve => setTimeout(resolve, 300));
  const now = new Date();
  return [
    {
      timestamp: new Date(now.getTime() - 6 * 24 * 60 * 60 * 1000).toISOString(),
      event: 'Version 2.4.1 Release',
      sentiment: 0.45,
      explanation: 'App update released with new payment features. Initial sentiment positive.',
      keyTopics: ['App Update', 'New Features'],
      aiInsight: 'AI detected positive initial reception with 67% positive mentions in first 24 hours.'
    },
    {
      timestamp: new Date(now.getTime() - 5 * 24 * 60 * 60 * 1000).toISOString(),
      event: 'First Crash Reports',
      sentiment: -0.25,
      explanation: 'Users begin reporting app crashes, particularly on iOS devices.',
      keyTopics: ['App Crashes', 'iOS Issues'],
      aiInsight: 'AI identified anomaly: Crash reports increased 340% above baseline. Pattern suggests memory leak in new payment module.'
    },
    {
      timestamp: new Date(now.getTime() - 4 * 24 * 60 * 60 * 1000).toISOString(),
      event: 'Sentiment Shift',
      sentiment: -0.42,
      explanation: 'Sentiment drops as negative reviews accumulate on App Store.',
      keyTopics: ['App Crashes', 'Negative Reviews'],
      aiInsight: 'AI predicts: If unresolved, sentiment will drop to -0.65 by day 7. Estimated impact: 450 negative reviews, 2.3★ rating drop.'
    },
    {
      timestamp: new Date(now.getTime() - 3 * 24 * 60 * 60 * 1000).toISOString(),
      event: 'Cross-Channel Correlation',
      sentiment: -0.58,
      explanation: 'Payment issues begin trending on Reddit, correlating with App Store complaints.',
      keyTopics: ['Payment Issues', 'Cross-Channel'],
      aiInsight: 'AI detected 78% correlation between App Store payment complaints and Reddit discussions. Suggests systematic issue, not isolated incidents.'
    },
    {
      timestamp: new Date(now.getTime() - 2 * 24 * 60 * 60 * 1000).toISOString(),
      event: 'Refund Request Spike',
      sentiment: -0.65,
      explanation: '187% increase in refund-related mentions as customers express frustration.',
      keyTopics: ['Refunds', 'Customer Service'],
      aiInsight: 'AI Recommendation: Immediate escalation to CX Head. Pattern shows customers considering cancellation if refunds not processed within 48 hours.'
    },
    {
      timestamp: new Date(now.getTime() - 1 * 24 * 60 * 60 * 1000).toISOString(),
      event: 'Current State',
      sentiment: -0.52,
      explanation: 'Sentiment stabilizing but still below baseline. Development team working on hotfix.',
      keyTopics: ['Hotfix', 'Resolution'],
      aiInsight: 'AI predicts: If hotfix released within 24 hours, sentiment will recover to baseline within 7 days. If delayed >48 hours, recovery may take 14+ days.'
    }
  ];
}

export async function getCrossChannelCorrelations(): Promise<CrossChannelCorrelation[]> {
  await new Promise(resolve => setTimeout(resolve, 400));
  return [
    {
      topic: 'Payment Issues',
      correlationScore: 0.78,
      aiInterpretation: 'Strong cross-channel correlation (78%) indicates systematic payment gateway problem affecting all platforms. Not isolated user errors.',
      recommendedAction: 'Immediate: Escalate to payment infrastructure team. Technical: Review gateway logs for error patterns between 10am-2pm EST.',
      channels: [
        { channel: 'App Store/Play Store', percentage: 30, sentiment: -0.72, trend: 'up' },
        { channel: 'Reddit', percentage: 20, sentiment: -0.65, trend: 'up' },
        { channel: 'X', percentage: 15, sentiment: -0.58, trend: 'up' },
        { channel: 'Trustpilot', percentage: 12, sentiment: -0.61, trend: 'stable' }
      ]
    },
    {
      topic: 'App Crashes',
      correlationScore: 0.65,
      aiInterpretation: 'Moderate correlation (65%) across channels. Pattern suggests version-specific issue rather than platform-wide problem.',
      recommendedAction: 'Technical: Review crash logs for version 2.4.1. Development: Prioritize hotfix for memory leak in payment module.',
      channels: [
        { channel: 'App Store/Play Store', percentage: 45, sentiment: -0.68, trend: 'up' },
        { channel: 'Reddit', percentage: 18, sentiment: -0.55, trend: 'up' },
        { channel: 'X', percentage: 8, sentiment: -0.42, trend: 'stable' }
      ]
    },
    {
      topic: 'Feature X Praise',
      correlationScore: 0.52,
      aiInterpretation: 'Positive correlation (52%) across X and Reddit. Opportunity to amplify positive sentiment in marketing.',
      recommendedAction: 'Marketing: Create case study highlighting Feature X. Social: Amplify positive testimonials. Product: Feature in onboarding.',
      channels: [
        { channel: 'X', percentage: 35, sentiment: 0.89, trend: 'up' },
        { channel: 'Reddit', percentage: 28, sentiment: 0.82, trend: 'up' },
        { channel: 'App Store/Play Store', percentage: 15, sentiment: 0.75, trend: 'stable' }
      ]
    }
  ];
}

export async function getExecutiveSummary(): Promise<ExecutiveSummary> {
  await new Promise(resolve => setTimeout(resolve, 500));
  return {
    summary: 'AI Analysis Summary: Your social media landscape shows 2 critical issues requiring immediate attention and 1 significant opportunity for growth. Payment processing failures are trending across all channels with 78% cross-platform correlation, indicating a systematic infrastructure issue. App crashes from version 2.4.1 are affecting user sentiment with a 23% drop over the past week. However, positive sentiment around Feature X presents an opportunity to drive 15-20% increase in new signups through targeted marketing.',
    keyMetrics: {
      totalMentions: 4247,
      sentimentScore: 52.3,
      criticalIssues: 3,
      opportunities: 2
    },
    topInsights: [
      {
        id: 'ai-1',
        type: 'root_cause',
        severity: 'critical',
        title: 'Payment gateway issue affecting all channels',
        description: 'Systematic payment failures correlating across platforms',
        aiReasoning: '78% correlation detected',
        businessImpact: '$127K revenue at risk',
        recommendedAction: 'Escalate to payment infrastructure team',
        confidence: 94,
        affectedChannels: ['App Store/Play Store', 'Reddit', 'X', 'Trustpilot'],
        relatedTopics: ['Payment Processing'],
        timeframe: 'Last 7 days'
      }
    ],
    recommendedActions: [
      {
        action: 'Release hotfix for app crashes (version 2.4.1)',
        priority: 1,
        owner: 'Dev Team Lead',
        timeframe: '24-48 hours',
        expectedImpact: 'Prevent further rating decline, restore user trust'
      },
      {
        action: 'Resolve payment gateway timeout issues',
        priority: 1,
        owner: 'Payment Infrastructure Team',
        timeframe: '48-72 hours',
        expectedImpact: 'Prevent $127K revenue loss, improve transaction success rate'
      },
      {
        action: 'Launch marketing campaign for Feature X',
        priority: 2,
        owner: 'Marketing Head',
        timeframe: '1-2 weeks',
        expectedImpact: 'Potential 2,300 new users, $115K revenue opportunity'
      }
    ],
    next24Hours: [
      'Review and approve hotfix for app crashes',
      'Investigate payment gateway logs for error patterns',
      'Prepare customer communication for affected users',
      'Assign CX Head to refund processing workflow review',
      'Schedule emergency product meeting to discuss version 2.4.1 issues'
    ]
  };
}

// Platform-Specific Dashboard Data Types
export interface TrustpilotDashboardData {
  kpis: TrustpilotKPIs;
  clusterVolume: TrustpilotClusterVolume[];
  topicBubbles: TrustpilotTopicBubble[];
  trendData: TrustpilotTrendData[];
  aiInsights: TrustpilotAIInsight[];
  actionFunnel: TrustpilotActionFunnel[];
  clusters: string[];
}

export interface TwitterDashboardData {
  kpis: {
    tweetVolume: number;
    brandMentions: number;
    engagementRate: number;
    sentimentPercent: number;
  };
  realTimeSentiment: Array<{
    timestamp: string;
    sentiment: number;
    volume: number;
  }>;
  hashtagCooccurrence: Array<{
    hashtag: string;
    connections: Array<{ hashtag: string; strength: number }>;
    engagement: number;
  }>;
  emotionDistribution: {
    joy: number;
    anger: number;
    sadness: number;
    neutral: number;
  };
  topInfluencers: Array<{
    username: string;
    followers: number;
    engagement: number;
    sentiment: number;
    impact: number;
  }>;
  aiInsights: Array<{
    id: string;
    title: string;
    description: string;
    action: string;
    severity: 'critical' | 'high' | 'medium' | 'low';
  }>;
}

export interface RedditDashboardData {
  kpis: {
    totalThreads: number;
    activeTopics: number;
    avgSentiment: number;
    negativeThreadsPercent: number;
  };
  clusterTree: Array<{
    cluster: string;
    subclusters: Array<{
      subcluster: string;
      threads: number;
      sentiment: number;
      growth: number;
    }>;
  }>;
  topicSentimentMatrix: Array<{
    topic: string;
    sentiment: number;
    volume: number;
  }>;
  topicGrowthTrend: Array<{
    date: string;
    topic: string;
    growth: number;
    sentiment: number;
  }>;
  commentDepthEmotion: Array<{
    topic: string;
    depth: number;
    emotion: 'joy' | 'anger' | 'sadness' | 'neutral';
    intensity: number;
  }>;
  aiNarrativeInsights: Array<{
    id: string;
    narrative: string;
    action: string;
    severity: 'critical' | 'high' | 'medium' | 'low';
  }>;
}

export interface AppStoreDashboardData {
  kpis: {
    avgRating: number;
    totalReviews: number;
    crashMentionsPercent: number;
    topComplaintTopics: string[];
  };
  clusterVsRating: Array<{
    cluster: string;
    oneStar: number;
    twoStar: number;
    threeStar: number;
    fourStar: number;
    fiveStar: number;
  }>;
  negativeSentimentSpikes: Array<{
    date: string;
    sentiment: number;
    version?: string;
    reason?: string;
  }>;
  actionWheel: Array<{
    issue: string;
    nextAction: string;
    priority: number;
    status: 'pending' | 'in_progress' | 'resolved';
  }>;
  featureSentimentRadar: Array<{
    module: string;
    sentiment: number;
    volume: number;
  }>;
  aiInsights: Array<{
    id: string;
    title: string;
    description: string;
    action: string;
    severity: 'critical' | 'high' | 'medium' | 'low';
  }>;
}

export interface UnifiedDashboardData {
  kpis: {
    totalMentions: number;
    overallSentiment: number;
    top5Topics: string[];
    actionableIssuesPercent: number;
    brandHealthIndex: number; // 0-100
  };
  crossChannelTopicCorrelation: Array<{
    topic: string;
    trustpilot: number;
    twitter: number;
    reddit: number;
    appstore: number;
    correlationScore: number;
  }>;
  unifiedClusterMap: Array<{
    cluster: string;
    platforms: string[];
    overlapIntensity: number;
    sentiment: number;
    volume: number;
  }>;
  sentimentDriftComparison: Array<{
    date: string;
    trustpilot: number;
    twitter: number;
    reddit: number;
    appstore: number;
  }>;
  urgencyRadar: Array<{
    platform: string;
    urgency: number;
    criticalIssues: number;
  }>;
  aiExecutiveInsights: Array<{
    id: string;
    title: string;
    description: string;
    action: string;
    platforms: string[];
    severity: 'critical' | 'high' | 'medium' | 'low';
  }>;
}

// Trustpilot Dashboard Types
export interface TrustpilotKPIs {
  totalReviews: number;
  avgRating: number;
  negativeReviewsPercent: number;
  trendingSentiment: 'up' | 'down' | 'stable';
  urgencyPercent: number;
}

export interface TrustpilotClusterVolume {
  cluster: string;
  positive: number;
  negative: number;
  neutral: number;
}

export interface TrustpilotTopicBubble {
  topic: string;
  volume: number;
  sentiment: number; // -1 to 1
  aiSummary: string;
  x?: number;
  y?: number;
}

export interface TrustpilotTrendData {
  date: string;
  reviewVolume: number;
  sentiment: number;
}

export interface TrustpilotAIInsight {
  id: string;
  title: string;
  description: string;
  action: string;
  severity: 'critical' | 'high' | 'medium' | 'low';
  impact: string;
}

export interface TrustpilotActionFunnel {
  topic: string;
  urgency: string;
  resolutionStatus: string;
  resolvedPercent: number;
  count: number;
}

export interface TrustpilotFilters {
  dateRange: { start: string; end: string };
  ratingStars: number[]; // 1-5
  sentiment: string[]; // positive, negative, neutral
  urgency: string[]; // critical, high, medium, low
  cluster: string[];
}

// Platform-Specific API Functions
export async function getTwitterDashboard(): Promise<TwitterDashboardData> {
  await new Promise(resolve => setTimeout(resolve, 500));
  return {
    kpis: {
      tweetVolume: 8934,
      brandMentions: 3247,
      engagementRate: 12.4,
      sentimentPercent: 58.3,
    },
    realTimeSentiment: [
      { timestamp: '2024-01-29T10:00:00Z', sentiment: 0.65, volume: 234 },
      { timestamp: '2024-01-29T11:00:00Z', sentiment: 0.58, volume: 267 },
      { timestamp: '2024-01-29T12:00:00Z', sentiment: 0.42, volume: 312 },
      { timestamp: '2024-01-29T13:00:00Z', sentiment: 0.35, volume: 289 },
    ],
    hashtagCooccurrence: [
      {
        hashtag: '#AppCrash',
        connections: [
          { hashtag: '#Bug', strength: 0.89 },
          { hashtag: '#Frustrated', strength: 0.76 },
        ],
        engagement: 1247,
      },
      {
        hashtag: '#NewFeature',
        connections: [
          { hashtag: '#Excited', strength: 0.82 },
          { hashtag: '#LoveIt', strength: 0.71 },
        ],
        engagement: 2341,
      },
    ],
    emotionDistribution: {
      joy: 32.4,
      anger: 18.7,
      sadness: 12.3,
      neutral: 36.6,
    },
    topInfluencers: [
      { username: '@TechReview', followers: 125000, engagement: 89, sentiment: 0.72, impact: 234 },
      { username: '@AppUser', followers: 45000, engagement: 67, sentiment: -0.45, impact: 156 },
    ],
    aiInsights: [
      {
        id: 'tw-1',
        title: 'Negative trend detected for #AppCrash — alert CX team',
        description: 'Hashtag engagement up 234% with -0.65 sentiment, urgent response needed',
        action: 'CX team should prepare response template and investigate root cause',
        severity: 'critical',
      },
      {
        id: 'tw-2',
        title: '#NewFeature driving 2x engagement — consider promoting tweets',
        description: 'Positive sentiment spike around new feature, marketing opportunity',
        action: 'Amplify positive tweets in marketing campaigns',
        severity: 'medium',
      },
    ],
  };
}

export async function getRedditDashboard(): Promise<RedditDashboardData> {
  await new Promise(resolve => setTimeout(resolve, 500));
  return {
    kpis: {
      totalThreads: 456,
      activeTopics: 23,
      avgSentiment: 0.42,
      negativeThreadsPercent: 28.3,
    },
    clusterTree: [
      {
        cluster: 'Login Issues',
        subclusters: [
          { subcluster: 'Password Reset Problems', threads: 45, sentiment: -0.65, growth: 0.34 },
          { subcluster: 'Two-Factor Auth', threads: 23, sentiment: -0.42, growth: 0.12 },
        ],
      },
      {
        cluster: 'Feature Requests',
        subclusters: [
          { subcluster: 'Dark Mode', threads: 89, sentiment: 0.78, growth: 0.45 },
          { subcluster: 'New Integrations', threads: 34, sentiment: 0.65, growth: 0.23 },
        ],
      },
    ],
    topicSentimentMatrix: [
      { topic: 'Login Issues', sentiment: -0.58, volume: 156 },
      { topic: 'Feature Requests', sentiment: 0.72, volume: 234 },
      { topic: 'Performance', sentiment: -0.34, volume: 98 },
    ],
    topicGrowthTrend: [
      { date: '2024-01-22', topic: 'Login Issues', growth: 0.23, sentiment: -0.45 },
      { date: '2024-01-29', topic: 'Login Issues', growth: 0.34, sentiment: -0.58 },
    ],
    commentDepthEmotion: [
      { topic: 'Login Issues', depth: 8.5, emotion: 'anger', intensity: 0.78 },
      { topic: 'Feature Requests', depth: 6.2, emotion: 'joy', intensity: 0.65 },
    ],
    aiNarrativeInsights: [
      {
        id: 'rd-1',
        narrative: 'Increasing mentions of "Login Issues" in last 3 days — urgent fix suggested',
        action: 'Prioritize authentication system review and hotfix deployment',
        severity: 'high',
      },
      {
        id: 'rd-2',
        narrative: 'Positive momentum in "Feature Request" cluster — good opportunity for engagement',
        action: 'Engage with community, acknowledge requests, provide roadmap updates',
        severity: 'medium',
      },
    ],
  };
}

export async function getAppStoreDashboard(): Promise<AppStoreDashboardData> {
  await new Promise(resolve => setTimeout(resolve, 500));
  return {
    kpis: {
      avgRating: 3.8,
      totalReviews: 8934,
      crashMentionsPercent: 23.4,
      topComplaintTopics: ['App Crashes', 'Payment Failures', 'Slow Performance'],
    },
    clusterVsRating: [
      {
        cluster: 'App Crashes',
        oneStar: 234,
        twoStar: 156,
        threeStar: 89,
        fourStar: 45,
        fiveStar: 12,
      },
      {
        cluster: 'Payment Issues',
        oneStar: 189,
        twoStar: 123,
        threeStar: 67,
        fourStar: 34,
        fiveStar: 23,
      },
    ],
    negativeSentimentSpikes: [
      { date: '2024-01-15', sentiment: -0.65, version: 'v3.4.2', reason: 'App crash spike after release' },
      { date: '2024-01-22', sentiment: -0.58, version: 'v3.4.2', reason: 'Payment failures reported' },
    ],
    actionWheel: [
      { issue: 'App Crashes v3.4.2', nextAction: 'Release Hotfix', priority: 1, status: 'in_progress' },
      { issue: 'Payment Failures', nextAction: 'Backend Review', priority: 1, status: 'pending' },
      { issue: 'UI Improvements', nextAction: 'A/B Testing', priority: 2, status: 'pending' },
    ],
    featureSentimentRadar: [
      { module: 'UI', sentiment: 0.65, volume: 456 },
      { module: 'Performance', sentiment: -0.45, volume: 234 },
      { module: 'Payment', sentiment: -0.72, volume: 189 },
      { module: 'Security', sentiment: 0.58, volume: 123 },
    ],
    aiInsights: [
      {
        id: 'as-1',
        title: 'High complaint density in v3.4.2 — rollback or release hotfix',
        description: 'Crash mentions increased 234% after v3.4.2 release, urgent action needed',
        action: 'Immediate: Release hotfix or consider rollback to v3.4.1',
        severity: 'critical',
      },
      {
        id: 'as-2',
        title: 'Positive spike for new UI design — sustain campaign',
        description: 'UI sentiment improved 45% after redesign, users loving new interface',
        action: 'Amplify positive reviews in marketing and app store listing',
        severity: 'medium',
      },
    ],
  };
}

export async function getUnifiedDashboard(): Promise<UnifiedDashboardData> {
  await new Promise(resolve => setTimeout(resolve, 500));
  return {
    kpis: {
      totalMentions: 12456,
      overallSentiment: 52.3,
      top5Topics: ['Payment Issues', 'App Crashes', 'Feature Requests', 'Support Quality', 'UI Improvements'],
      actionableIssuesPercent: 67.8,
      brandHealthIndex: 68.5,
    },
    crossChannelTopicCorrelation: [
      {
        topic: 'Payment Failures',
        trustpilot: 12,
        twitter: 18,
        reddit: 15,
        appstore: 30,
        correlationScore: 0.78,
      },
      {
        topic: 'App Crashes',
        trustpilot: 8,
        twitter: 15,
        reddit: 18,
        appstore: 45,
        correlationScore: 0.65,
      },
    ],
    unifiedClusterMap: [
      {
        cluster: 'Payment Issues',
        platforms: ['Trustpilot', 'Twitter', 'Reddit', 'App Store'],
        overlapIntensity: 0.89,
        sentiment: -0.65,
        volume: 2341,
      },
      {
        cluster: 'Feature Requests',
        platforms: ['Twitter', 'Reddit'],
        overlapIntensity: 0.56,
        sentiment: 0.72,
        volume: 1234,
      },
    ],
    sentimentDriftComparison: [
      { date: '2024-01-01', trustpilot: 0.65, twitter: 0.58, reddit: 0.52, appstore: 0.48 },
      { date: '2024-01-08', trustpilot: 0.58, twitter: 0.52, reddit: 0.45, appstore: 0.42 },
      { date: '2024-01-15', trustpilot: 0.52, twitter: 0.48, reddit: 0.42, appstore: 0.35 },
      { date: '2024-01-22', trustpilot: 0.48, twitter: 0.45, reddit: 0.38, appstore: 0.32 },
    ],
    urgencyRadar: [
      { platform: 'Trustpilot', urgency: 0.45, criticalIssues: 12 },
      { platform: 'Twitter', urgency: 0.58, criticalIssues: 18 },
      { platform: 'Reddit', urgency: 0.52, criticalIssues: 15 },
      { platform: 'App Store', urgency: 0.78, criticalIssues: 34 },
    ],
    aiExecutiveInsights: [
      {
        id: 'un-1',
        title: '"Payment Failures" trending across Reddit + Playstore → potential backend bug',
        description: '78% correlation detected across platforms, systematic issue not isolated',
        action: 'Escalate to backend team, review payment gateway logs',
        platforms: ['Reddit', 'App Store'],
        severity: 'critical',
      },
      {
        id: 'un-2',
        title: '"Customer Support" sentiment dropping on Trustpilot → response rate delay',
        description: 'Support sentiment decreased 23% in last week, response times increasing',
        action: 'Review support team capacity, consider scaling up',
        platforms: ['Trustpilot'],
        severity: 'high',
      },
      {
        id: 'un-3',
        title: 'App UX sentiment improving on all channels post v3.5 release',
        description: 'Positive sentiment spike across all platforms after UI redesign',
        action: 'Amplify positive feedback in marketing campaigns',
        platforms: ['All'],
        severity: 'medium',
      },
    ],
  };
}

// Mock API function for Trustpilot data
export async function getTrustpilotDashboard(filters?: TrustpilotFilters): Promise<TrustpilotDashboardData> {
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 500));
  
  return {
    kpis: {
      totalReviews: 1247,
      avgRating: 4.2,
      negativeReviewsPercent: 18.5,
      trendingSentiment: 'down',
      urgencyPercent: 32.4,
    },
    clusterVolume: [
      { cluster: 'Delivery Speed', positive: 145, negative: 89, neutral: 23 },
      { cluster: 'Product Quality', positive: 234, negative: 67, neutral: 45 },
      { cluster: 'Customer Service', positive: 189, negative: 123, neutral: 34 },
      { cluster: 'Payment Issues', positive: 45, negative: 156, neutral: 12 },
      { cluster: 'App Experience', positive: 267, negative: 78, neutral: 56 },
      { cluster: 'Pricing', positive: 98, negative: 134, neutral: 28 },
    ],
    topicBubbles: [
      { topic: 'Fast Delivery', volume: 234, sentiment: 0.85, aiSummary: 'Customers praise quick shipping times and reliable delivery' },
      { topic: 'Product Defects', volume: 189, sentiment: -0.72, aiSummary: 'Issues with product quality and manufacturing defects reported' },
      { topic: 'Support Response', volume: 156, sentiment: -0.45, aiSummary: 'Delayed customer support responses causing frustration' },
      { topic: 'Payment Failures', volume: 145, sentiment: -0.68, aiSummary: 'Payment processing errors affecting checkout experience' },
      { topic: 'Great Value', volume: 198, sentiment: 0.78, aiSummary: 'Positive feedback on pricing and value proposition' },
      { topic: 'Easy Returns', volume: 167, sentiment: 0.65, aiSummary: 'Smooth return process appreciated by customers' },
    ],
    trendData: [
      { date: '2024-10-01', reviewVolume: 45, sentiment: 0.65 },
      { date: '2024-10-08', reviewVolume: 52, sentiment: 0.58 },
      { date: '2024-10-15', reviewVolume: 48, sentiment: 0.52 },
      { date: '2024-10-22', reviewVolume: 61, sentiment: 0.48 },
      { date: '2024-10-29', reviewVolume: 55, sentiment: 0.42 },
      { date: '2024-11-05', reviewVolume: 67, sentiment: 0.38 },
    ],
    aiInsights: [
      {
        id: 'tp-1',
        title: 'Drop in sentiment for "Delivery Speed" last 7 days — possible vendor issue',
        description: 'Negative reviews increased 34% in delivery-related topics, correlation with logistics partner change',
        action: 'Contact logistics vendor, review delivery tracking, escalate to operations team',
        severity: 'high',
        impact: '23% of negative reviews now related to delivery',
      },
      {
        id: 'tp-2',
        title: 'Positive buzz on "Support Experience" — boost in campaigns',
        description: 'Sentiment improved 18% following new support chatbot implementation',
        action: 'Amplify positive feedback in marketing, share success metrics with team',
        severity: 'low',
        impact: 'Support satisfaction up 18%',
      },
      {
        id: 'tp-3',
        title: 'Payment Issues cluster showing 45% increase in volume',
        description: 'Payment failure mentions spiked after recent payment gateway update',
        action: 'Review payment gateway logs, check for integration issues, contact payment provider',
        severity: 'critical',
        impact: '156 negative reviews in last week',
      },
      {
        id: 'tp-4',
        title: 'Product Quality sentiment recovering after recall',
        description: 'Positive sentiment increased 12% following product quality improvements',
        action: 'Monitor recovery trend, continue quality assurance measures',
        severity: 'medium',
        impact: 'Quality-related complaints down 12%',
      },
    ],
    actionFunnel: [
      { topic: 'Delivery Speed', urgency: 'high', resolutionStatus: 'in_progress', resolvedPercent: 45, count: 89 },
      { topic: 'Payment Issues', urgency: 'critical', resolutionStatus: 'open', resolvedPercent: 12, count: 156 },
      { topic: 'Customer Service', urgency: 'medium', resolutionStatus: 'resolved', resolvedPercent: 78, count: 123 },
      { topic: 'Product Quality', urgency: 'high', resolutionStatus: 'in_progress', resolvedPercent: 56, count: 67 },
      { topic: 'App Experience', urgency: 'low', resolutionStatus: 'resolved', resolvedPercent: 82, count: 78 },
      { topic: 'Pricing', urgency: 'medium', resolutionStatus: 'open', resolvedPercent: 23, count: 134 },
    ],
    clusters: ['Delivery Speed', 'Product Quality', 'Customer Service', 'Payment Issues', 'App Experience', 'Pricing'],
  };
}
