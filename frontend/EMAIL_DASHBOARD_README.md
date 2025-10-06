# Enterprise Email Management System Dashboard

## Overview

This is a comprehensive Next.js dashboard for an enterprise-level Email Management System built with React, Tailwind CSS, and TypeScript. The dashboard provides AI-powered insights, advanced analytics, and actionable intelligence for email thread management.

## Features

### 🔝 Row 1: Global Filters & KPI Cards
- **KPI Cards**: Total Threads, Total Messages, % Closed vs Open, Avg Resolution Time, Urgent Threads, Critical Issues, Customer-Waiting %, Escalation Rate, SLA Breach Risk %, Customer Sentiment Index
- **Eisenhower Distribution**: Visual breakdown of thread distribution across quadrants

### 🟦 Row 2: Timeline & Workload Charts
- **Threads Over Time**: Historical thread volume trends
- **Sentiment Trend**: Real-time sentiment analysis across conversations

### 🟩 Row 3: Topic & Cluster Intelligence
- **Topic Distribution**: Breakdown of email topics with urgency indicators
- **Cluster Risk Heatmap**: Risk distribution across clusters and subclusters with interactive hover tooltips

### 🟨 Row 4: Sentiment & Customer Experience
- **Priority Resolution Chart**: Resolution status by priority level
- **Customer Sentiment Overview**: Real-time sentiment analysis across all channels

### 🟧 Row 5: Workflow Pipeline
- **Quadrant Summary Cards**: Actionable cards for each Eisenhower quadrant
- **Quadrant Stats Overview**: Statistical breakdown of quadrant performance

### 🟪 Row 6: Urgency vs Importance (Eisenhower Matrix)
- **Interactive Scatterplot**: Visual representation of importance vs urgency
- **Quadrant Cards**: Detailed breakdown with action buttons for each quadrant
- **Advanced Tooltips**: Comprehensive thread information on hover

### 🟫 Row 7: Follow-ups & Next Actions
- **Actionable Cards**: Top Risk, Overdue Follow-up, Opportunity, SLA Failure, Watchlist
- **CTA Buttons**: Escalate, Assign Owner, Reply, Mark Resolved, Schedule
- **Hover Tooltips**: Thread details, participants, next action suggestions

### ⬛ Row 8: People & Collaboration
- **Network Graph**: Customer-agent interaction patterns and communication flows
- **Force-directed Layout**: Interactive visualization of relationships
- **Statistics**: Customer/Agent counts and connection metrics

### ⬜ Row 9: Thread Dynamics
- **Thread Resolution Trends**: Average resolution time by priority level
- **SLA Compliance Dashboard**: Service level agreement performance metrics

### 🟥 Row 10: Predictive / Risk Metrics
- **Risk Forecast**: 7-day predicted risk trends with confidence intervals
- **AI Risk Assessment**: Machine learning powered risk predictions
- **Workload Prediction**: 14-day predicted thread volume

## Data Models

### MongoDB Schema

#### Threads Collection
```typescript
interface Thread {
  thread_id: string;
  thread_key: string;
  subject_norm: string;
  participants: Array<{
    type: 'customer' | 'agent' | 'manager' | 'external';
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
```

#### Messages Collection
```typescript
interface Message {
  message_id: string;
  thread_id: string;
  sender: {
    name: string;
    email: string;
    type: 'customer' | 'agent' | 'manager' | 'external';
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
```

## Eisenhower Matrix Algorithm

### Importance Score Calculation
```typescript
function calculateImportanceScore(
  business_impact_score: number,
  priority: string,
  sentiment: number,
  follow_up_required: boolean,
  escalation_count: number
): number {
  // Priority weight (P1=1.0, P2=0.8, P3=0.6, P4=0.4, P5=0.2)
  const priorityWeights = { 'P1': 1.0, 'P2': 0.8, 'P3': 0.6, 'P4': 0.4, 'P5': 0.2 };
  const priorityWeight = priorityWeights[priority];
  
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
```

### Urgency Flag Calculation
```typescript
function calculateUrgencyFlag(
  urgency: string,
  escalation_count: number,
  follow_up_required: boolean,
  sla_compliance_rate: number
): number {
  // Urgency weight (critical=1.0, high=0.8, medium=0.5, low=0.2)
  const urgencyWeights = { 'critical': 1.0, 'high': 0.8, 'medium': 0.5, 'low': 0.2 };
  const urgencyWeight = urgencyWeights[urgency];
  
  // SLA pressure (lower compliance = higher urgency)
  const slaPressure = (100 - sla_compliance_rate) / 100;
  
  // Escalation pressure
  const escalationPressure = Math.min(escalation_count * 0.3, 1.0);
  
  // Follow-up pressure
  const followUpPressure = follow_up_required ? 0.4 : 0.0;
  
  const urgencyScore = urgencyWeight + slaPressure + escalationPressure + followUpPressure;
  return urgencyScore > 0.6 ? 1 : 0;
}
```

## Color Coding System

### Sentiment Colors
- **Red (≤2)**: Negative sentiment
- **Yellow (2.1–3.0)**: Neutral sentiment  
- **Green (≥3.1)**: Positive sentiment

### Priority Colors
- **P1**: Red (#EF4444)
- **P2**: Orange (#F59E0B)
- **P3**: Blue (#3B82F6)
- **P4**: Green (#10B981)
- **P5**: Gray (#6B7280)

### Risk Level Colors
- **Critical (>80%)**: Red (#EF4444)
- **High (60-80%)**: Orange (#F59E0B)
- **Medium (40-60%)**: Yellow (#EAB308)
- **Low (<40%)**: Green (#10B981)

## Components

### Core Components
- `KPICards`: Main KPI metrics display
- `EisenhowerMatrix`: Interactive scatterplot with quadrant cards
- `ClusterRiskHeatmap`: Risk distribution visualization
- `ActionableCards`: Actionable items with CTAs
- `NetworkGraph`: People and collaboration network
- `PredictiveMetrics`: AI-powered risk forecasting

### Chart Components
- `ThreadsOverTimeChart`: Timeline visualization
- `SentimentTrendChart`: Sentiment analysis over time
- `TopicDistributionChart`: Topic breakdown
- `PriorityResolutionChart`: Priority vs resolution status

### UI Components
- `EmailFilters`: Comprehensive filtering system
- `ThreadDetailDrawer`: Detailed thread view
- `QuadrantSummaryCards`: Eisenhower quadrant summaries

## API Functions

All data is currently mocked with realistic enterprise-level data:

- `getKPIs()`: Main dashboard metrics
- `getEisenhowerThreads()`: Threads with importance/urgency scores
- `getClusterRiskHeatmapData()`: Risk distribution data
- `getActionableCards()`: Actionable items requiring attention
- `getNetworkGraphData()`: People and collaboration data
- `getPredictiveMetrics()`: AI risk forecasting data

## Installation & Usage

1. Install dependencies:
```bash
npm install
```

2. Run the development server:
```bash
npm run dev
```

3. Navigate to `/email` to view the dashboard

## Future Integration

The dashboard is designed for easy integration with:
- MongoDB for data persistence
- Real-time APIs for live updates
- Machine learning models for predictive analytics
- External CRM systems
- Email service providers (Gmail, Outlook, etc.)

## Responsive Design

The dashboard is fully responsive and optimized for:
- Desktop (1920x1080+)
- Tablet (768px-1024px)
- Mobile (320px-768px)

## Performance Features

- Lazy loading of components
- Optimized re-renders with React hooks
- Efficient data structures
- Responsive image loading
- Smooth animations and transitions

## Security Considerations

- Input validation and sanitization
- XSS protection
- CSRF protection
- Secure API endpoints
- Role-based access control ready

## Accessibility

- WCAG 2.1 AA compliant
- Keyboard navigation support
- Screen reader compatible
- High contrast mode support
- Focus management

---

This dashboard represents a comprehensive solution for enterprise email management with advanced analytics, AI-powered insights, and actionable intelligence for improved customer service operations.

