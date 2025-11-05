# Dashboard Views & Components Documentation

## 📊 View Overview

### 1. Executive Summary (`/email`)
**Purpose**: Main dashboard overview with comprehensive KPIs and thread management

**Key Components**:
- **KPI Cards** (5 metrics)
- **Eisenhower Quadrant Distribution** (4-quadrant grid)
- **Priority vs Resolution Status Chart** (bar chart)
- **Eisenhower Matrix** (thread cards by quadrant)
- **Risk Assessment Card**
- **Threads Over Time Chart**
- **Actionable Cards**
- **Network Graph**

---

### 2. Executive Cockpit (`/email/executive`)
**Purpose**: Real-time decision wall for executives - F1 telemetry-style dashboard

**Key Components**:
- **Dynamic KPI Stack** (top strip)
- **Auto-Insights Ticker** (horizontal marquee)
- **Risk Radar** (polar plot)
- **Intent Flow Map** (Sankey visualization)
- **Next 10 Actions Feed** (ranked actions)

---

### 3. Manager View (`/email/manager`)
**Purpose**: Operational dashboard for team workload and queue management

**Key Components**:
- **Daily Digest Card**
- **Queue Health Monitor**
- **Bottleneck Heatmap**
- **Decision Debt Tracker**
- **Anomaly Alerts Panel**

---

### 4. Finance View (`/email/finance`)
**Purpose**: Approval workflow and financial impact analysis

**Key Components**:
- **Approval Metrics** (4 KPI cards)
- **Approval Distribution by Priority** (pie chart)
- **Approval Trend** (7-day area + line chart)
- **Approval Owner Performance** (table)
- **At-Risk Approvals** (detailed table)

---

### 5. Ops View (`/email/ops`)
**Purpose**: Customer operations friction monitoring and sentiment analysis

**Key Components**:
- **Friction Metrics** (3 KPI cards)
- **Sentiment Trend Chart** (area chart)
- **Customer Segments Table**

---

## 📈 Detailed Component Documentation

### **Executive Summary View Components**

#### 1. KPI Cards (5 Cards)
Shows 5 key performance indicators:

| Card | What It Shows | Formula/Metric |
|------|---------------|----------------|
| **% Closed vs Open** | Resolution status breakdown | `closed_threads / total_threads × 100` |
| **Escalation Rate** | Percentage of escalated threads | `escalated_threads / total_threads × 100` |
| **Customer Sentiment Index** | Overall customer satisfaction (0-100) | `avg_sentiment × 20` (normalized from 1-5 scale) |
| **Pending - Customer** | Threads awaiting customer response | Count of threads where `action_pending_from = 'customer'` |
| **Pending - Internal** | Threads awaiting internal action | Count of threads where `action_pending_from = 'company'` |

**Features**:
- AI insights when thresholds are exceeded
- Color-coded (green = healthy, yellow = warning, red = critical)
- Hover effects with purple glow

---

#### 2. Eisenhower Quadrant Distribution
**What it shows**: Thread distribution across 4 priority quadrants

**Quadrants**:
- **Do - Now** (Red): Important & Urgent - Critical items requiring immediate attention
- **Schedule - Later** (Yellow): Important, Not Urgent - Plan for later
- **Delegate - Team** (Blue): Not Important, Urgent - Can be assigned to team
- **Postponed** (Gray): Not Important, Not Urgent - Low priority

**Features**:
- Shows count and percentage for each quadrant
- Clicking a quadrant opens Priority vs Resolution Status chart
- AI Priority Analysis badge

---

#### 3. Priority vs Resolution Status Chart
**What it shows**: Stacked bar chart showing how threads are distributed by:
- **X-axis**: Priority levels (P1, P2, P3, P4, P5)
- **Y-axis**: Thread count
- **Stacked bars**: 
  - Blue = Open - Customer (waiting for customer)
  - Orange = Open - Company (waiting for internal action)
  - Green = Closed (resolved)

**Features**:
- Clickable bars to filter by priority/status
- Topics breakdown shown below for each priority
- Custom tooltips with detailed counts

---

#### 4. Eisenhower Matrix
**What it shows**: Detailed thread cards organized by quadrant
- Shows thread details: subject, participants, priority, sentiment
- Grouped by quadrant (Do, Schedule, Delegate, Delete)
- Clickable threads open detail drawer

---

#### 5. Risk Assessment Card
**What it shows**: Three risk metrics:
- **SLA Breach Risk**: % of threads at risk of breaching SLA
- **Escalation Rate**: % of threads that have been escalated
- **Customer Waiting**: % of threads waiting for customer response

---

#### 6. Threads Over Time Chart
**What it shows**: Line chart showing thread volume trends
- **X-axis**: Time (dates)
- **Y-axis**: Thread count
- **Lines**: Total, Urgent, Open (Customer), Open (Company), Closed

---

#### 7. Actionable Cards
**What it shows**: Priority action items with suggested actions
- Top risk threads
- Overdue follow-ups
- SLA failures
- Opportunities

---

#### 8. Network Graph
**What it shows**: Customer-agent interaction network
- Nodes = People (customers/agents)
- Edges = Communication connections
- Size/color = Thread count / sentiment

---

### **Executive Cockpit View Components**

#### 1. Dynamic KPI Stack (Top Strip)
**What it shows**: 4 real-time metrics with delta animations

| Metric | What It Shows | Calculation |
|--------|---------------|-------------|
| **SLA Breach %** | Percentage of threads at risk | `sla_breach_risk_percentage` |
| **Decision Debt** | Hours of pending decisions | `internal_pending_count × avg_resolution_time_days × 24` |
| **₹ At-Risk** | Financial value at risk | `urgent_threads × business_impact_score × 10,000` |
| **Intent Spikes** | Change in thread volume | `(current_total - previous_total) / previous_total × 100` |

**Features**:
- Color animations on value changes
- Delta indicators (↑/↓) showing change from previous period
- Pulsing borders for high-risk items

---

#### 2. Auto-Insights Ticker
**What it shows**: Horizontal scrolling marquee of AI-generated insights
- Rotates every 60 seconds
- Shows alerts like:
  - "X threads likely to breach SLA today (₹X Cr)"
  - "Decision debt at Xhrs"
  - "X P1 threads detected - Intent spike"
  - "Friction delta X%"
  - "X silent threads detected"

**Features**:
- Color-coded by severity (critical/warning/info)
- Auto-refreshes with new insights

---

#### 3. Risk Radar (Polar Plot)
**What it shows**: Polar/spider chart showing risk by topic
- **Radius** (distance from center): Value at risk (business impact × priority)
- **Color**: Escalation probability (red = high, green = low)
- **Angle**: Different topics/clusters

**Formula**: 
- Value at Risk = `business_impact_score × priority_weight / 100`
- Escalation Probability = `escalation_count / total_threads × 100`

**Features**:
- Top 8 topics displayed
- Interactive tooltips with detailed metrics
- Gradient rings for escalation probability

---

#### 4. Intent Flow Map
**What it shows**: Sankey-style flow visualization
- **Flow**: Topic → Stage → Outcome
- Shows how threads flow through different stages to final outcomes
- **Nodes**: Topics, Stages, Outcomes (Open/Closed/etc.)
- **Links**: Connection strength between nodes

**Features**:
- Visual representation of workflow bottlenecks
- Grouped by topic clusters

---

#### 5. Next 10 Actions Feed
**What it shows**: Top 10 ranked actionable items
- **Ranking**: By priority (critical > high > medium > low)
- **Each item shows**:
  - Priority badge
  - Title and description
  - Thread subject
  - SLA risk percentage
  - One-click "Run" button

**Features**:
- Animated entry for each item
- One-click execution of actions
- Loading states during execution

---

### **Manager View Components**

#### 1. Daily Digest Card
**What it shows**: AI-generated daily task plan
- **Do Now**: Critical items (P1 threads) requiring immediate attention
- **Delegate**: Items that can be assigned to team members
- **Schedule**: Items to plan for later

**Features**:
- "Generate My Day Plan" button
- Progress bar showing completion status
- Checkboxes to mark items complete
- Animated fade-out when completed

---

#### 2. Queue Health Monitor
**What it shows**: Real-time queue status and owner performance

**Left Side - Gauge Chart**:
- **Percentage**: Queue health (0-100%)
- **Calculation**: Based on capacity utilization, status distribution, and load balance
- **Color**: Green (>80%), Yellow (50-80%), Red (<50%)

**Right Side - Owner Status Cards**:
- Shows each owner's:
  - Open thread count
  - Throughput (threads/week)
  - Status (healthy/warning/critical)
- Traffic light indicators (green/yellow/red)

**Features**:
- "Rebalance Queue" button (AI simulation)
- Real-time updates
- Owner load distribution

---

#### 3. Bottleneck Heatmap
**What it shows**: Grid showing bottlenecks by Owner × Stage

**Grid Structure**:
- **Rows**: Owners/Assignees
- **Columns**: Stages (e.g., "review", "approval", "pending")
- **Cell Color**: Average age of items (red = old, green = recent)
- **Cell Value**: Count and age in hours

**Color Coding**:
- 🟢 Green: < 24 hours
- 🟡 Yellow: 1-2 days
- 🟠 Orange: 2-3 days
- 🔴 Red: 3-7 days
- 🔴 Dark Red: > 7 days

**Features**:
- Hover tooltips with AI redistribution suggestions
- "Assign to..." recommendations on hover
- Identifies overloaded owners and slow stages

---

#### 4. Decision Debt Tracker
**What it shows**: Line chart of cumulative pending decisions over time

**X-axis**: Date (last 30 days)
**Y-axis**: Cumulative debt in hours

**Formula**: 
```
Decision Debt = internal_pending_count × avg_resolution_time_days × 24
```

**Features**:
- Tooltip shows pending count for each date
- Tracks trend of decision backlog
- Highlights increasing debt

---

#### 5. Anomaly Alerts Panel
**What it shows**: Contextual alerts for anomalies

**Alert Types**:
1. **Intent Spike**: Sudden increase in P1 threads
2. **Friction Delta**: High percentage of negative sentiment threads
3. **Silent Threads**: Threads inactive for >3 days
4. **SLA Breach Risk**: High risk of SLA violations
5. **Escalation Surge**: Unusual increase in escalations

**Features**:
- Clickable alerts open context drawer
- Auto-generated "Resolve" action suggestions
- Dismissible alerts
- Severity indicators (critical/warning/info)

---

### **Finance View Components**

#### 1. Approval Metrics (4 KPI Cards)
**Cards**:
- **Total Value at Risk**: Total ₹ value of pending approvals
- **Avg Approval Latency**: Average days waiting for approval
- **At-Risk Approvals**: Count of approvals stuck >3 days
- **Approval Rate**: Percentage of completed approvals

---

#### 2. Approval Distribution by Priority (Pie Chart)
**What it shows**: Distribution of pending approvals by priority level (P1-P5)
- Each slice = Priority level
- Size = Number of approvals at that priority
- Color-coded by priority (P1=red, P2=orange, etc.)

---

#### 3. Approval Trend (7 Days)
**What it shows**: Area + Line chart over last 7 days
- **Area (Green)**: Pending approvals count
- **Line (Purple)**: Total value (₹) at risk
- **Dual Y-axis**: Count (left) and Value (right)

---

#### 4. Approval Owner Performance
**What it shows**: Table of approval owners with:
- Owner name
- Approval count
- Average processing time (days)
- Total value managed (₹)

**Sorted by**: Highest count first

---

#### 5. At-Risk Approvals Table
**What it shows**: Detailed table of stuck approvals (>3 days old)
- Subject
- Priority
- Stage
- Age (days)
- Value at risk (₹)
- Owner

---

### **Ops View Components**

#### 1. Friction Metrics (3 KPI Cards)
**Cards**:
- **Friction Index**: % of threads with negative sentiment
- **Customer Segments**: Breakdown by sentiment (Positive/Neutral/Negative)
- **Avg Sentiment**: Overall sentiment score (0-100)

---

#### 2. Sentiment Trend Chart
**What it shows**: Area chart of customer sentiment over time
- **X-axis**: Date
- **Y-axis**: Sentiment score (1-5 scale)
- **Area fill**: Gradient purple
- Shows sentiment trend for last 30 days

---

#### 3. Customer Segments Table
**What it shows**: Table of sentiment distribution
- Segment (Positive/Neutral/Negative)
- Count of threads
- Percentage of total

---

## 🎯 Key Metrics Explained

### **Decision Debt**
- **Formula**: `internal_pending_count × avg_resolution_time_days × 24 hours`
- **Meaning**: Total hours of work pending internal decisions
- **Use**: Tracks organizational decision-making capacity

### **Value at Risk (₹)**
- **Formula**: `urgent_threads × business_impact_score × 10,000`
- **Meaning**: Estimated financial impact of unresolved urgent items
- **Use**: Prioritize high-value items

### **Intent Spikes**
- **Formula**: `(current_threads - previous_threads) / previous_threads × 100`
- **Meaning**: Percentage change in thread volume
- **Use**: Detect sudden increases in communication volume

### **Friction Index**
- **Formula**: `(negative_sentiment_threads / total_threads) × 100`
- **Meaning**: Percentage of threads with negative sentiment
- **Use**: Measure customer satisfaction issues

### **Queue Health**
- **Formula**: Complex calculation based on:
  - Capacity utilization (0-100% = 100-50% health)
  - Status distribution (critical owners reduce health)
  - Load balance (uneven distribution reduces health)
- **Meaning**: Overall health of work queue (0-100%)
- **Use**: Monitor if team is overloaded

---

## 🔄 Data Flow

All views:
- Auto-refresh every 30 seconds
- Use same data sources from `/lib/api`
- Share filter state via Zustand store
- Support date range filtering
- Show loading states during data fetch

---

## 🎨 Visual Indicators

- **🟢 Green**: Healthy/Normal/Positive
- **🟡 Yellow**: Warning/Caution
- **🔴 Red**: Critical/High Risk
- **🟣 Purple**: AI-enhanced/Highlighted
- **Border-2**: Active/Selected tab
- **Pulsing**: High-priority alerts
- **Sparkle ✨**: AI-generated insights

---

This documentation provides a comprehensive overview of all views and their components. Each visualization is designed to provide actionable insights for different roles and use cases.

