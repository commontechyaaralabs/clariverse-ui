// Voice QA Dashboard - Mock Data Functions
// All data functions for the Manager Dashboard

export interface KPIData {
  overallTeamQAScore: { value: number; trend: number[] };
  complianceAdherence: { value: number; breakdown: { fully: number; partial: number; non: number } };
  customerEmotionIndex: { value: number; trend: number[] };
  highRiskCallsCount: { value: number; trend: 'up' | 'down' | 'stable' };
  averageHandlingTime: { value: number; hourly: number[] };
  silenceSmoothnessScore: { value: number; trend: number[] };
  fraudProtocolAccuracy: { value: number };
  agentsNeedingCoaching: { value: number };
  escalationRiskScore: { value: number };
  totalCallsHandled: { value: number; trend: number[] };
  firstCallResolutionRate: { value: number; resolved: number; unresolved: number };
  fraudDisputeCount: { value: number; breakdown: { fraud: number; dispute: number } };
}

export interface IntentDistribution {
  intent: string;
  percentage: number;
  count: number;
}

export interface IssueHeatmapData {
  intent: string;
  complianceDeviation: number;
  toneProblems: number;
  silence: number;
  incorrectInfo: number;
  emotionalSpikes: number;
  escalationRisk: number;
}

export interface AgentPerformance {
  agentId: string;
  agentName: string;
  qaScore: number;
  complianceScore: number;
  aht: number;
  sentimentHandling: number;
  issues: string[];
  severity: 'low' | 'medium' | 'high' | 'critical';
}

export interface HighRiskCall {
  callId: string;
  intent: string;
  riskCategory: string;
  agentName: string;
  riskScore: number;
  emotionTimeline: number[];
  complianceMisses: string[];
  aiExplanation: string;
  timestamp: string;
}

export interface SkillGapData {
  skill: string;
  expected: number;
  current: number;
}

export interface CoachingTicket {
  agentId: string;
  agentName: string;
  problemSummary: string;
  severity: 'low' | 'medium' | 'high';
  lastIssues: string[];
  recommendedTraining: string;
}

export interface CallDetail {
  callId: string;
  agentName: string;
  customerId: string;
  timestamp: string;
  duration: number;
  emotionTimeline: Array<{ time: number; emotion: number }>;
  silenceTimeline: Array<{ time: number; duration: number }>;
  complianceChecklist: Array<{ item: string; passed: boolean }>;
  speakingRatio: { agent: number; customer: number };
  transcript: Array<{ speaker: 'agent' | 'customer'; text: string; timestamp: number }>;
  aiSummary: string;
  recommendedAction: string;
}

export interface CallListItem {
  callId: string;
  agentName: string;
  intent: string;
  riskScore: number;
  sentiment: number[];
  timestamp: string;
}

// Mock Data Generators

export function getKPIData(): KPIData {
  return {
    overallTeamQAScore: {
      value: 87.5,
      trend: [82, 84, 85, 86, 87, 87.5, 87.5]
    },
    complianceAdherence: {
      value: 92.3,
      breakdown: { fully: 75, partial: 20, non: 5 }
    },
    customerEmotionIndex: {
      value: 3.8,
      trend: [3.2, 3.4, 3.5, 3.6, 3.7, 3.8, 3.8]
    },
    highRiskCallsCount: {
      value: 12,
      trend: 'down'
    },
    averageHandlingTime: {
      value: 342,
      hourly: [320, 345, 350, 340, 335, 330, 325, 340]
    },
    silenceSmoothnessScore: {
      value: 8.2,
      trend: [7.5, 7.8, 8.0, 8.1, 8.2, 8.2, 8.2]
    },
    fraudProtocolAccuracy: {
      value: 94.5
    },
    agentsNeedingCoaching: {
      value: 6
    },
    escalationRiskScore: {
      value: 23.5
    },
    totalCallsHandled: {
      value: 1247,
      trend: [1100, 1150, 1180, 1200, 1220, 1235, 1247]
    },
    firstCallResolutionRate: {
      value: 78.5,
      resolved: 979,
      unresolved: 268
    },
    fraudDisputeCount: {
      value: 34,
      breakdown: { fraud: 18, dispute: 16 }
    }
  };
}

export function getIntentDistribution(): IntentDistribution[] {
  return [
    { intent: 'Account Inquiry', percentage: 28, count: 349 },
    { intent: 'Fraud Report', percentage: 15, count: 187 },
    { intent: 'Loan Application', percentage: 12, count: 150 },
    { intent: 'Dispute Resolution', percentage: 11, count: 137 },
    { intent: 'Payment Issue', percentage: 10, count: 125 },
    { intent: 'Card Replacement', percentage: 8, count: 100 },
    { intent: 'Balance Inquiry', percentage: 7, count: 87 },
    { intent: 'Other', percentage: 9, count: 112 }
  ];
}

export function getTeamHeatmap(): IssueHeatmapData[] {
  const intents = ['Account Inquiry', 'Fraud Report', 'Loan Application', 'Dispute Resolution', 'Payment Issue', 'Card Replacement'];
  return intents.map(intent => ({
    intent,
    complianceDeviation: Math.random() * 30 + 5,
    toneProblems: Math.random() * 25 + 3,
    silence: Math.random() * 20 + 2,
    incorrectInfo: Math.random() * 35 + 4,
    emotionalSpikes: Math.random() * 40 + 5,
    escalationRisk: Math.random() * 25 + 3
  }));
}

export function getAgentLeaderboard(): AgentPerformance[] {
  const agents = [
    { name: 'Sarah Johnson', id: 'agent_001' },
    { name: 'Michael Chen', id: 'agent_002' },
    { name: 'Emily Rodriguez', id: 'agent_003' },
    { name: 'David Kim', id: 'agent_004' },
    { name: 'Jessica Martinez', id: 'agent_005' },
    { name: 'Robert Taylor', id: 'agent_006' },
    { name: 'Amanda White', id: 'agent_007' },
    { name: 'James Wilson', id: 'agent_008' }
  ];

  return agents.map((agent, idx) => ({
    agentId: agent.id,
    agentName: agent.name,
    qaScore: 85 + Math.random() * 15,
    complianceScore: 88 + Math.random() * 12,
    aht: 280 + Math.random() * 120,
    sentimentHandling: 3.5 + Math.random() * 1.5,
    issues: idx < 3 ? ['Tone inconsistency', 'Long pauses'] : [],
    severity: idx < 2 ? 'high' as const : idx < 4 ? 'medium' as const : 'low' as const
  })).sort((a, b) => b.qaScore - a.qaScore);
}

export function getHighRiskCalls(): HighRiskCall[] {
  const categories = ['Angry Customer', 'Compliance Error', 'Incorrect Info', 'Silence Issue', 'Fraud Risk'];
  const intents = ['Fraud Report', 'Dispute Resolution', 'Loan Application', 'Account Inquiry'];
  const agentNames = [
    'Sarah Johnson',
    'Michael Chen',
    'Emily Rodriguez',
    'David Kim',
    'Jessica Martinez',
    'Robert Taylor',
    'Amanda White',
    'James Wilson'
  ];
  
  return Array.from({ length: 8 }, (_, i) => ({
    callId: `call_${1000 + i}`,
    intent: intents[i % intents.length],
    riskCategory: categories[i % categories.length],
    agentName: agentNames[i % agentNames.length],
    riskScore: 65 + Math.random() * 35,
    emotionTimeline: Array.from({ length: 20 }, () => Math.random() * 2 - 1),
    complianceMisses: i % 2 === 0 ? ['KYC verification', 'Privacy disclaimer'] : ['Fraud script'],
    aiExplanation: `Customer showed frustration during ${intents[i % intents.length].toLowerCase()} discussion. Agent missed critical compliance step.`,
    timestamp: new Date(Date.now() - i * 3600000).toISOString()
  })).sort((a, b) => b.riskScore - a.riskScore);
}

export function getSkillGapData(): SkillGapData[] {
  return [
    { skill: 'Empathy', expected: 90, current: 85 },
    { skill: 'Product Knowledge', expected: 95, current: 88 },
    { skill: 'Fraud Handling', expected: 98, current: 92 },
    { skill: 'Clarity of Explanation', expected: 92, current: 87 },
    { skill: 'Process Accuracy', expected: 95, current: 90 },
    { skill: 'Listening Skill', expected: 90, current: 86 },
    { skill: 'Tone Stability', expected: 88, current: 82 }
  ];
}

export function getCoachingTickets(): CoachingTicket[] {
  return [
    {
      agentId: 'agent_002',
      agentName: 'Michael Chen',
      problemSummary: 'Repeated compliance misses in fraud calls',
      severity: 'high',
      lastIssues: ['Missed KYC verification', 'Incorrect fraud script', 'Tone inconsistency'],
      recommendedTraining: 'Fraud Protocol & Compliance Workshop'
    },
    {
      agentId: 'agent_005',
      agentName: 'Jessica Martinez',
      problemSummary: 'Low empathy scores in dispute calls',
      severity: 'medium',
      lastIssues: ['Poor emotional recognition', 'Rushed responses'],
      recommendedTraining: 'Empathy & Customer Communication'
    },
    {
      agentId: 'agent_006',
      agentName: 'Robert Taylor',
      problemSummary: 'High AHT and silence issues',
      severity: 'medium',
      lastIssues: ['Long pauses', 'Unclear explanations'],
      recommendedTraining: 'Efficiency & Clarity Training'
    }
  ];
}

export function getCallList(): CallListItem[] {
  const agentNames = [
    'Sarah Johnson',
    'Michael Chen',
    'Emily Rodriguez',
    'David Kim',
    'Jessica Martinez',
    'Robert Taylor',
    'Amanda White',
    'James Wilson'
  ];
  
  return Array.from({ length: 20 }, (_, i) => ({
    callId: `call_${2000 + i}`,
    agentName: agentNames[i % agentNames.length],
    intent: ['Account Inquiry', 'Fraud Report', 'Loan Application', 'Dispute Resolution'][i % 4],
    riskScore: 30 + Math.random() * 70,
    sentiment: Array.from({ length: 15 }, () => Math.random() * 2 - 1),
    timestamp: new Date(Date.now() - i * 1800000).toISOString()
  })).sort((a, b) => b.riskScore - a.riskScore);
}

export function getCallDetail(callId: string): CallDetail {
  // Extract agent name and call info from high-risk calls or call list
  const highRiskCalls = getHighRiskCalls();
  const callList = getCallList();
  const matchingCall = highRiskCalls.find(call => call.callId === callId) || 
                       callList.find(call => call.callId === callId);
  const agentName = matchingCall?.agentName || 'Sarah Johnson';
  
  // Generate realistic transcript based on call type
  const callType = matchingCall?.intent || 'Account Inquiry';
  const transcripts: Record<string, Array<{ speaker: 'agent' | 'customer'; text: string; timestamp: number }>> = {
    'Fraud Report': [
      { speaker: 'agent', text: 'Thank you for calling. How can I assist you today?', timestamp: 0 },
      { speaker: 'customer', text: 'I noticed a suspicious transaction on my account for $2,500. I didn\'t make this purchase.', timestamp: 4 },
      { speaker: 'agent', text: 'I understand your concern. Let me verify your identity first. Can you provide your account number and the last four digits of your social security number?', timestamp: 12 },
      { speaker: 'customer', text: 'Sure, my account number is 4567-8901-2345-6789, and my SSN ends in 1234.', timestamp: 18 },
      { speaker: 'agent', text: 'Thank you. I can see the transaction you\'re referring to. It was made yesterday at 3:45 PM. Do you recognize the merchant name "TechStore Online"?', timestamp: 25 },
      { speaker: 'customer', text: 'No, I\'ve never heard of that store. This is definitely fraudulent.', timestamp: 32 },
      { speaker: 'agent', text: 'I\'ll flag this transaction immediately and issue you a new card. The fraudulent charge will be removed from your account within 5-7 business days.', timestamp: 38 },
      { speaker: 'customer', text: 'That\'s great, thank you. How long will it take to get my new card?', timestamp: 45 },
      { speaker: 'agent', text: 'Your new card will arrive within 7-10 business days. Is there anything else I can help you with today?', timestamp: 50 },
      { speaker: 'customer', text: 'No, that\'s all. Thank you for your help.', timestamp: 55 }
    ],
    'Dispute Resolution': [
      { speaker: 'agent', text: 'Thank you for calling. How can I assist you today?', timestamp: 0 },
      { speaker: 'customer', text: 'I need to dispute a charge on my account. I was charged twice for the same purchase.', timestamp: 3 },
      { speaker: 'agent', text: 'I can help you with that. Can you provide me with the transaction date and amount?', timestamp: 8 },
      { speaker: 'customer', text: 'Yes, it was on March 15th for $89.99. The merchant is "BestBuy Electronics".', timestamp: 12 },
      { speaker: 'agent', text: 'I see two charges for $89.99 on that date. Let me initiate a dispute for the duplicate charge. This process typically takes 10-14 business days.', timestamp: 18 },
      { speaker: 'customer', text: 'That seems like a long time. Can you credit my account now?', timestamp: 25 },
      { speaker: 'agent', text: 'I understand your frustration. While the investigation is ongoing, I can place a temporary credit on your account. The final resolution will be determined after we review the merchant\'s response.', timestamp: 30 },
      { speaker: 'customer', text: 'Okay, that works. When will I see the credit?', timestamp: 38 },
      { speaker: 'agent', text: 'The temporary credit should appear within 2-3 business days. You\'ll receive a letter in the mail with the final decision.', timestamp: 42 },
      { speaker: 'customer', text: 'Thank you for your help.', timestamp: 48 }
    ],
    'Loan Application': [
      { speaker: 'agent', text: 'Thank you for calling. How can I assist you today?', timestamp: 0 },
      { speaker: 'customer', text: 'I submitted a loan application last week and haven\'t heard back. Can you check the status?', timestamp: 3 },
      { speaker: 'agent', text: 'I\'d be happy to check that for you. Can I have your application reference number?', timestamp: 8 },
      { speaker: 'customer', text: 'I don\'t have it with me. Can you look it up by my social security number?', timestamp: 12 },
      { speaker: 'agent', text: 'For security purposes, I\'ll need to verify your identity first. Can you provide your full name, date of birth, and the last four digits of your SSN?', timestamp: 16 },
      { speaker: 'customer', text: 'My name is John Smith, DOB is 05/15/1985, and my SSN ends in 5678.', timestamp: 22 },
      { speaker: 'agent', text: 'Thank you. I can see your application is currently under review. Our loan department is verifying your income and credit information. You should receive a decision within 3-5 business days.', timestamp: 28 },
      { speaker: 'customer', text: 'Is there anything I can do to speed this up? I really need the funds soon.', timestamp: 35 },
      { speaker: 'agent', text: 'I understand the urgency. Unfortunately, the review process cannot be expedited, but I can ensure all your documents are properly submitted. Have you received any requests for additional documentation?', timestamp: 40 },
      { speaker: 'customer', text: 'No, I haven\'t received any requests. I\'ll wait to hear back. Thank you.', timestamp: 48 }
    ],
    'Account Inquiry': [
      { speaker: 'agent', text: 'Thank you for calling. How can I assist you today?', timestamp: 0 },
      { speaker: 'customer', text: 'I want to check my account balance and recent transactions.', timestamp: 3 },
      { speaker: 'agent', text: 'I can help you with that. For security, can you verify your account number and the last four digits of your social security number?', timestamp: 7 },
      { speaker: 'customer', text: 'My account number is 1234-5678-9012-3456, and my SSN ends in 9876.', timestamp: 12 },
      { speaker: 'agent', text: 'Thank you. Your current balance is $3,456.78. I can see your last five transactions. Would you like me to go through them?', timestamp: 18 },
      { speaker: 'customer', text: 'Yes, please.', timestamp: 22 },
      { speaker: 'agent', text: 'On March 20th, you had a deposit of $2,000. On March 21st, a purchase at "Grocery Store" for $125.50. On March 22nd, an ATM withdrawal of $200. On March 23rd, a purchase at "Gas Station" for $45.00. And today, a purchase at "Coffee Shop" for $8.75.', timestamp: 25 },
      { speaker: 'customer', text: 'That all looks correct. Thank you for your help.', timestamp: 35 },
      { speaker: 'agent', text: 'You\'re welcome. Is there anything else I can assist you with today?', timestamp: 38 },
      { speaker: 'customer', text: 'No, that\'s all. Have a great day!', timestamp: 42 }
    ]
  };
  
  const transcript = transcripts[callType] || transcripts['Account Inquiry'];
  const duration = transcript[transcript.length - 1]?.timestamp || 342;
  
  return {
    callId,
    agentName,
    customerId: 'cust_12345',
    timestamp: matchingCall?.timestamp || new Date().toISOString(),
    duration,
    emotionTimeline: Array.from({ length: Math.ceil(duration / 6.84) }, (_, i) => ({
      time: i * 6.84,
      emotion: Math.max(0, Math.min(5, 2.5 + Math.sin(i / 5) * 1.5 + (Math.random() * 1.5 - 0.75)))
    })),
    silenceTimeline: Array.from({ length: Math.ceil(duration / 40) }, (_, i) => ({
      time: i * 40,
      duration: 2 + Math.random() * 5
    })),
    complianceChecklist: [
      { item: 'KYC Verification', passed: (matchingCall && 'complianceMisses' in matchingCall && matchingCall.complianceMisses?.includes('KYC verification')) ? false : true },
      { item: 'Identity Confirmation', passed: true },
      { item: 'Fraud Safety Script', passed: (matchingCall && 'complianceMisses' in matchingCall && matchingCall.complianceMisses?.includes('Fraud script')) ? false : true },
      { item: 'Privacy Disclaimer', passed: (matchingCall && 'complianceMisses' in matchingCall && matchingCall.complianceMisses?.includes('Privacy disclaimer')) ? false : true },
      { item: 'Regulatory Statement', passed: true }
    ],
    speakingRatio: { agent: 45, customer: 55 },
    transcript,
    aiSummary: (matchingCall && 'aiExplanation' in matchingCall) ? matchingCall.aiExplanation : 'Call transcript analysis complete. Review recommended for quality assurance.',
    recommendedAction: (matchingCall && 'riskCategory' in matchingCall) 
      ? (matchingCall.riskCategory === 'Compliance Error' 
          ? 'Review compliance protocols. Agent needs retraining on mandatory banking scripts.'
          : matchingCall.riskCategory === 'Angry Customer'
          ? 'Review de-escalation techniques. Consider additional training on handling frustrated customers.'
          : 'Review call for quality assurance and provide feedback to agent.')
      : 'Review call for quality assurance and provide feedback to agent.'
  };
}

export function getTrendData() {
  return {
    qaTrend: Array.from({ length: 7 }, (_, i) => ({ day: i + 1, value: 82 + i * 0.8 + Math.random() * 2 })),
    complianceTrend: Array.from({ length: 7 }, (_, i) => ({ day: i + 1, value: 88 + i * 0.6 + Math.random() * 2 })),
    emotionTrend: Array.from({ length: 7 }, (_, i) => ({ day: i + 1, value: 3.2 + i * 0.08 + Math.random() * 0.2 })),
    fraudTrend: Array.from({ length: 7 }, (_, i) => ({ day: i + 1, value: 92 + i * 0.4 + Math.random() * 2 })),
    escalationTrend: Array.from({ length: 7 }, (_, i) => ({ day: i + 1, value: 25 - i * 0.5 + Math.random() * 3 })),
    coachingTrend: Array.from({ length: 7 }, (_, i) => ({ day: i + 1, value: 8 - i * 0.3 + Math.random() * 1 }))
  };
}

export function getTeamHealthData() {
  return {
    qaScore: 87.5,
    qaBreakdown: {
      empathy: 85,
      compliance: 92,
      tone: 88,
      resolution: 86,
      listening: 89
    },
    qaTrend: [82, 84, 85, 86, 87, 87.5, 87.5],
    complianceData: {
      kycRate: 95,
      identityConfirmation: 93,
      fraudScript: 94,
      regulatoryStatement: 91,
      privacyDisclaimer: 96,
      violations: 12
    },
    emotionData: {
      positive: 45,
      neutral: 35,
      negative: 20,
      timeline: Array.from({ length: 24 }, (_, i) => Math.sin(i / 3) * 0.3 + 0.5)
    },
    escalationData: {
      riskScore: 23.5,
      callsAtRisk: 12,
      agentsInvolved: ['Agent B', 'Agent E', 'Agent F'],
      topCauses: ['Compliance miss', 'Tone issues', 'Long silence'],
      trend: [28, 26, 25, 24, 23.5, 23.5, 23.5]
    }
  };
}

