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
