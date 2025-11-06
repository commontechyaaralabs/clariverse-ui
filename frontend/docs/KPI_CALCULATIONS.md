# KPI Calculation Methodology

This document explains how each Key Performance Indicator (KPI) is calculated in the Fluid Intelligence Dashboard - Voice.

## 1. Team QA Score (87.5%)

**Purpose**: Overall communication quality score for the entire team

**Calculation Method**:
- **Weighted Average** of 5 quality components

**Formula**:
```
Team QA Score = (Empathy × 0.20) + (Compliance × 0.25) + (Tone × 0.15) + (Resolution × 0.25) + (Listening × 0.15)
```

**Range**: 0-100% (Higher is better)

**Example**: If Empathy=85%, Compliance=90%, Tone=88%, Resolution=87%, Listening=86%
- Score = (85×0.20) + (90×0.25) + (88×0.15) + (87×0.25) + (86×0.15) = 87.5%

---

### Component Breakdown:

#### A. Empathy Score (20% weight)

**Purpose**: Measures agent's ability to understand and respond to customer emotions

**Calculation Method**:
- AI analyzes transcript for empathetic language patterns
- Voice tone analysis (warmth, concern, understanding)
- Response appropriateness to customer emotional state

**Factors Measured**:
1. **Empathetic Phrases (30% weight)**: Use of phrases like:
   - "I understand"
   - "I can see how frustrating this must be"
   - "Let me help you with that"
   - "I completely understand your concern"

2. **Emotional Recognition (25% weight)**: Agent correctly identifies customer's emotional state
   - Recognizes frustration, anger, confusion, satisfaction
   - Responds appropriately to emotional cues

3. **Appropriate Response (25% weight)**: Response matches customer's emotional needs
   - Calming responses for angry customers
   - Supportive responses for confused customers
   - Enthusiastic responses for happy customers

4. **Tone Warmth (20% weight)**: Voice analysis shows genuine concern and warmth
   - Pitch variations indicating empathy
   - Pace adjustments showing understanding
   - Volume modulation showing care

**Formula**:
```
Empathy Score = (Empathetic Phrases × 0.30) + (Emotional Recognition × 0.25) + 
                (Appropriate Response × 0.25) + (Tone Warmth × 0.20)
```

**Example**: Agent says "I completely understand your frustration, let me help resolve this for you" with warm, concerned tone = High empathy score (90%)

---

#### B. Compliance Score (25% weight)

**Purpose**: Adherence to mandatory banking scripts and regulatory requirements

**Calculation Method**:
- Automated checklist verification against required scripts
- NLP pattern matching for mandatory phrases
- Regulatory statement detection

**Factors Measured**:
1. **KYC Verification (30% weight)**: Identity verification scripts completed
   - "Can you provide your account number?"
   - "Last four digits of your SSN?"
   - "Date of birth for verification?"
   - "Full name as it appears on the account?"

2. **Fraud Safety Scripts (25% weight)**: Fraud prevention protocols followed
   - "I'll flag this transaction immediately"
   - "Your card will be blocked for security"
   - "We'll issue a new card within 7-10 days"
   - "The fraudulent charge will be removed within 5-7 business days"

3. **Regulatory Statements (25% weight)**: Required legal disclosures
   - "This call may be recorded for quality assurance"
   - "Your information is protected under banking regulations"
   - "You have the right to dispute any charges"
   - "Regulatory compliance statement"

4. **Privacy Disclaimer (20% weight)**: Data protection statements
   - "Your information is confidential"
   - "We will never share your data with third parties"
   - "Your privacy is protected under federal law"

**Formula**:
```
Compliance Score = (KYC Verification × 0.30) + (Fraud Scripts × 0.25) + 
                  (Regulatory Statements × 0.25) + (Privacy Disclaimer × 0.20)
```

**Example**: All 4 categories completed with all required phrases = 100% compliance score

---

#### C. Tone Quality (15% weight)

**Purpose**: Professionalism, clarity, and consistency of communication

**Calculation Method**:
- Voice analysis (pitch, pace, volume consistency)
- Transcript analysis (professional language, clarity)
- Consistency throughout the call

**Factors Measured**:
1. **Professional Language (30% weight)**: Use of professional banking terminology
   - Avoids slang, maintains formality
   - Uses proper titles and respectful language
   - Banking-specific terminology used correctly

2. **Clarity of Speech (25% weight)**: Clear pronunciation, appropriate pace
   - Not too fast or too slow (optimal: 150-160 words per minute)
   - Enunciates clearly
   - No mumbling or unclear words

3. **Consistency (25% weight)**: Tone remains consistent throughout call
   - Doesn't become impatient or frustrated
   - Maintains professional demeanor
   - No sudden tone changes

4. **Politeness (20% weight)**: Courteous and respectful throughout
   - Says "please" and "thank you"
   - Apologizes when appropriate
   - Uses respectful language

**Formula**:
```
Tone Quality = (Professional Language × 0.30) + (Clarity × 0.25) + 
               (Consistency × 0.25) + (Politeness × 0.20)
```

**Example**: Agent maintains professional, clear, polite tone throughout entire call = High tone score (88%)

---

#### D. Resolution Accuracy (25% weight)

**Purpose**: Correctness of information provided and problem resolution

**Calculation Method**:
- Fact-checking against banking knowledge base
- Verification of solutions provided
- Customer outcome tracking

**Factors Measured**:
1. **Information Accuracy (35% weight)**: Correct facts and data provided
   - Account balances are correct
   - Transaction details are accurate
   - Policy information is current and correct
   - Interest rates, fees, dates are accurate

2. **Solution Correctness (30% weight)**: Appropriate solution for the problem
   - Correct process followed
   - Right department/team involved
   - Appropriate resolution steps taken
   - Follows bank procedures correctly

3. **Problem Resolution (25% weight)**: Customer's issue actually resolved
   - Follow-up confirms resolution
   - Customer satisfaction indicates success
   - Issue doesn't require callback or escalation

4. **No Misinformation (10% weight)**: No incorrect information given
   - Penalty for providing wrong information
   - Penalty for outdated policies
   - Penalty for incorrect procedures

**Formula**:
```
Resolution Accuracy = (Information Accuracy × 0.35) + (Solution Correctness × 0.30) + 
                     (Problem Resolution × 0.25) + (No Misinformation × 0.10)
```

**Example**: Agent provides correct account info, follows proper process, resolves issue successfully = High resolution score (87%)

---

#### E. Listening Patterns (15% weight)

**Purpose**: Active listening indicators showing agent understands customer needs

**Calculation Method**:
- Analysis of response appropriateness
- Detection of interruptions
- Question relevance to customer statements

**Factors Measured**:
1. **Appropriate Responses (35% weight)**: Responses directly address what customer said
   - Agent references customer's specific concern
   - Follows up on customer's statements
   - Doesn't give generic responses

2. **No Interruptions (25% weight)**: Agent doesn't interrupt customer
   - Lets customer finish speaking
   - Waits for natural pauses
   - Doesn't talk over customer

3. **Relevant Questions (25% weight)**: Questions relate to customer's issue
   - Asks clarifying questions about the problem
   - Doesn't ask irrelevant questions
   - Questions help understand the issue better

4. **Acknowledgment (15% weight)**: Agent acknowledges customer's concerns
   - "I understand you're concerned about..."
   - "Let me make sure I have this right..."
   - "So if I understand correctly..."

**Formula**:
```
Listening Patterns = (Appropriate Responses × 0.35) + (No Interruptions × 0.25) + 
                    (Relevant Questions × 0.25) + (Acknowledgment × 0.15)
```

**Example**: Agent listens fully, asks relevant questions, acknowledges concerns, doesn't interrupt = High listening score (86%)

---

## 2. Compliance Adherence (92.3%)

**Purpose**: Measures how well agents follow mandatory banking scripts and regulations

**Calculation Method**:
- **Percentage Breakdown** of calls by compliance level:
  - **Fully Compliant (75%)**: All required scripts and protocols followed correctly
    - KYC verification completed
    - Fraud safety scripts used
    - Regulatory statements included
    - Privacy disclaimers provided
  - **Partially Compliant (20%)**: Most protocols followed, minor omissions
    - Missing non-critical statements
    - Incomplete verification steps
  - **Non-Compliant (5%)**: Critical protocols missed
    - Missing KYC verification
    - Fraud scripts not used
    - Regulatory statements omitted

**Formula**:
```
Compliance Adherence = (Fully Compliant Calls / Total Calls) × 100
```

**Range**: 0-100% (Higher is better)

**Breakdown**: Fully (75%) + Partial (20%) + Non (5%) = 100%

---

## 3. Customer Emotion Index (3.8/5)

**Purpose**: Aggregated emotional state of customers based on AI sentiment analysis

**Calculation Method**:
- **Average sentiment score** across all customer interactions
- AI analyzes:
  - **Transcript text** (NLP): Keywords, phrases, language patterns
  - **Voice tone** (Audio analysis): Pitch, pace, volume, stress patterns
  - **Conversation flow**: Interruptions, pauses, response patterns

**Scoring Scale**:
- **1.0-1.5**: Very Negative (Angry, frustrated, threatening)
- **1.5-2.5**: Negative (Upset, dissatisfied)
- **2.5-3.5**: Neutral (Calm, matter-of-fact)
- **3.5-4.5**: Positive (Satisfied, friendly)
- **4.5-5.0**: Very Positive (Delighted, enthusiastic)

**Formula**:
```
Customer Emotion Index = Sum of all customer emotion scores / Total calls analyzed
```

**Range**: 1-5 (Lower is better - indicates calmer, more satisfied customers)

**Example**: If 1000 calls have average sentiment of 3.8, it means customers are generally neutral-to-positive

---

## 4. High-Risk Calls Count (12)

**Purpose**: Number of calls flagged as critical requiring immediate manager review

**Calculation Method**:
- **Count of calls** matching any high-risk criteria:

**High-Risk Criteria**:
1. **Escalation Likelihood > 70%**: AI predicts high probability of supervisor escalation
2. **Angry Customer**: Emotion score < 2.0 (very negative sentiment)
3. **Compliance Violations**: Critical protocols missed (KYC, fraud scripts)
4. **Agent Errors**: Incorrect information provided, tone issues
5. **Long Silences**: Multiple pauses > 5 seconds (indicates confusion or delays)
6. **Rapid Sentiment Decline**: Customer emotion drops significantly during call

**Formula**:
```
High-Risk Calls = Count of calls matching any high-risk criteria
```

**Range**: 0+ (Lower is better)

**Action**: Each high-risk call requires immediate manager review and potential intervention

---

## 5. Escalation Risk Score (23.5%)

**Purpose**: AI-predicted probability of calls escalating to supervisors

**Calculation Method**:
- **AI Machine Learning Model** analyzes multiple factors:

**Factors Considered**:
1. **Customer Sentiment Trends**: Negative trajectory during call
2. **Agent Behavior Patterns**: Defensive responses, interruptions, dismissive tone
3. **Call Duration**: Very short (< 2 min) or very long (> 15 min) calls
4. **Compliance Misses**: Missing mandatory scripts increases escalation risk
5. **Historical Patterns**: Similar calls that escalated in the past
6. **Issue Complexity**: Complex problems more likely to escalate
7. **Agent Experience Level**: Less experienced agents have higher escalation rates

**Formula**:
```
Escalation Risk = AI Model Prediction (0-100%)
```

**Range**: 0-100% (Lower is better)

**Interpretation**:
- **0-20%**: Low risk - Normal operations
- **20-40%**: Moderate risk - Monitor closely
- **40-60%**: High risk - Review calls, provide coaching
- **60-100%**: Critical risk - Immediate intervention needed

---

## 6. Total Calls Handled (1247)

**Purpose**: Simple count of all calls processed in the selected timeframe

**Calculation Method**:
- **Direct count** of all call records in the system

**Includes**:
- All call types (Account Inquiry, Fraud Report, Loan Application, Dispute Resolution, etc.)
- All call statuses:
  - Completed calls
  - Transferred calls
  - Abandoned calls (customer hung up)
- All agents in the team
- All time periods within the selected date range

**Formula**:
```
Total Calls = Count of all call records in database
```

**Range**: 0+ (Used for tracking volume trends and workload)

**Usage**: 
- Track daily/weekly/monthly call volume
- Identify peak hours and days
- Plan staffing levels
- Measure team productivity

---

## Data Sources

All KPIs are calculated from:
1. **Call Transcripts**: Full conversation text
2. **Audio Analysis**: Voice tone, pace, pauses
3. **Compliance Checklists**: Mandatory script adherence
4. **AI Sentiment Analysis**: Customer emotion detection
5. **Agent Performance Data**: Individual agent metrics
6. **Historical Data**: Past call patterns and outcomes

## Update Frequency

- **Real-time**: High-Risk Calls, Total Calls
- **Hourly**: Team QA Score, Compliance Adherence, Customer Emotion
- **Daily**: Escalation Risk Score (recalculated with new data)

## Notes

- All calculations use AI/ML models trained on historical banking call center data
- Scores are normalized and calibrated to industry benchmarks
- Trend indicators show 7-day rolling averages
- Lower values for Customer Emotion and Escalation Risk indicate better performance

