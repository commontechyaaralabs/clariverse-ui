'use client';

import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { X, Send, Bot, User, Sparkles } from 'lucide-react';
import { KPIData, HighRiskCall, AgentPerformance, CoachingTicket, IntentDistribution } from '@/lib/voiceData';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

interface AIDayGeneratorChatProps {
  isOpen: boolean;
  onClose: () => void;
  kpiData: KPIData | null;
  highRiskCalls: HighRiskCall[];
  agentLeaderboard: AgentPerformance[];
  coachingTickets: CoachingTicket[];
  intentDistribution: IntentDistribution[];
}

const DEFAULT_QUESTIONS = [
  "What are the top priorities for today?",
  "Show me today's key insights",
  "Analyze the dashboard performance",
  "What needs immediate attention?",
  "Give me a summary of critical issues",
  "What are the trends I should know?",
  "Which calls require escalation?",
  "What's the team performance analysis?",
  "Show me compliance insights",
  "What are the coaching opportunities?"
];

export function AIDayGeneratorChat({ 
  isOpen, 
  onClose, 
  kpiData, 
  highRiskCalls,
  agentLeaderboard,
  coachingTickets,
  intentDistribution
}: AIDayGeneratorChatProps) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const scrollToBottom = () => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    }
  };

  useEffect(() => {
    // Only scroll to bottom when there are messages and not on initial mount
    if (messages.length > 0) {
      const timer = setTimeout(() => {
        scrollToBottom();
      }, 100);
      return () => clearTimeout(timer);
    }
  }, [messages.length]);

  useEffect(() => {
    if (isOpen && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isOpen]);

  const generateAIResponse = async (userMessage: string): Promise<string> => {
    // Simulate AI response generation
    await new Promise(resolve => setTimeout(resolve, 1000 + Math.random() * 2000));

    const lowerMessage = userMessage.toLowerCase();

    // Generate contextual responses based on the question and available data
    if (lowerMessage.includes('priority') || lowerMessage.includes('top priority')) {
      const criticalCalls = highRiskCalls.filter(c => c.riskScore >= 80);
      const highRiskCount = highRiskCalls.length;
      
      return `Based on your voice dashboard, here are today's top priorities:\n\n` +
        `🔴 **Critical Calls**: ${criticalCalls.length} calls requiring immediate attention\n` +
        `⚠️ **High-Risk Calls**: ${highRiskCount} total high-risk calls\n` +
        `📊 **Team QA Score**: ${kpiData?.overallTeamQAScore?.value.toFixed(1) || 'N/A'}%\n\n` +
        `**Action Items**:\n` +
        `• Review ${criticalCalls.length} critical calls immediately\n` +
        `• Address ${coachingTickets.length} coaching tickets\n` +
        `• Monitor ${highRiskCount} high-risk calls for escalation\n\n` +
        `Focus on the Core Intelligence column for detailed call analysis.`;
    }

    if (lowerMessage.includes('insight') || lowerMessage.includes('key insight')) {
      if (!kpiData) return "I don't have access to KPI data at the moment.";
      
      const qaScore = kpiData.overallTeamQAScore?.value || 0;
      const complianceScore = kpiData.euComplianceScore?.overallScore || 0;
      const emotionIndex = kpiData.customerEmotionIndex?.value || 0;
      const escalationRisk = kpiData.escalationRiskScore?.value || 0;
      
      return `Here are today's key insights from your voice dashboard:\n\n` +
        `📊 **Team QA Score**: ${qaScore.toFixed(1)}% - ${qaScore > 80 ? '✅ Excellent performance' : qaScore > 60 ? '⚠️ Needs improvement' : '🔴 Critical attention needed'}\n` +
        `🛡️ **EU Compliance Score**: ${complianceScore.toFixed(1)}% - ${complianceScore > 90 ? '✅ Compliant' : '⚠️ Review required'}\n` +
        `😊 **Customer Emotion Index**: ${emotionIndex.toFixed(1)}/5 - ${emotionIndex < 2.5 ? '✅ Positive' : emotionIndex < 3.5 ? '⚠️ Neutral' : '🔴 Negative'}\n` +
        `⚡ **Escalation Risk**: ${escalationRisk.toFixed(1)}% - ${escalationRisk > 30 ? '⚠️ High risk' : '✅ Low risk'}\n\n` +
        `**Recommendation**: ${qaScore < 70 ? 'Focus on improving team QA scores through targeted coaching.' : 'Maintain current performance levels and address any compliance gaps.'}`;
    }

    if (lowerMessage.includes('analyze') || lowerMessage.includes('dashboard') || lowerMessage.includes('performance')) {
      if (!kpiData) return "I don't have access to KPI data at the moment.";
      
      const totalCalls = kpiData.totalCallsHandled?.value || 0;
      const highRiskCount = highRiskCalls.length;
      const agentsNeedingAttention = agentLeaderboard.filter(a => a.severity !== 'low').length;
      
      return `**Voice Dashboard Analysis**\n\n` +
        `📞 **Total Calls**: ${totalCalls.toLocaleString()}\n` +
        `🔴 **High-Risk Calls**: ${highRiskCount} (${((highRiskCount / totalCalls) * 100).toFixed(1)}%)\n` +
        `👥 **Agents Needing Attention**: ${agentsNeedingAttention}\n` +
        `📋 **Coaching Tickets**: ${coachingTickets.length}\n\n` +
        `**Key Metrics**:\n` +
        `• Team QA Score: ${kpiData.overallTeamQAScore?.value.toFixed(1) || 'N/A'}%\n` +
        `• EU Compliance: ${kpiData.euComplianceScore?.overallScore.toFixed(1) || 'N/A'}%\n` +
        `• Customer Emotion: ${kpiData.customerEmotionIndex?.value.toFixed(1) || 'N/A'}/5\n` +
        `• Escalation Risk: ${kpiData.escalationRiskScore?.value.toFixed(1) || 'N/A'}%\n\n` +
        `**Action Items**: Review the Team Health, Core Intelligence, and Action & Coaching columns for detailed insights.`;
    }

    if (lowerMessage.includes('attention') || lowerMessage.includes('immediate') || lowerMessage.includes('urgent')) {
      const criticalCalls = highRiskCalls.filter(c => c.riskScore >= 80);
      const agentsNeedingAttention = agentLeaderboard.filter(a => a.severity !== 'low');
      const urgentCoaching = coachingTickets.filter(t => t.severity === 'high');
      
      return `**Immediate Attention Required**\n\n` +
        `You have several items requiring immediate attention:\n\n` +
        `🔴 **Critical Calls**: ${criticalCalls.length} calls\n` +
        `⚠️ **High-Risk Calls**: ${highRiskCalls.length} calls\n` +
        `👥 **Agents Needing Attention**: ${agentsNeedingAttention.length} agents\n` +
        `📋 **Urgent Coaching Tickets**: ${urgentCoaching.length} tickets\n\n` +
        `**Top Priority Actions**:\n` +
        `${criticalCalls.slice(0, 3).map((call, i) => `${i + 1}. Review call ${call.callId} - ${call.riskCategory}`).join('\n')}\n\n` +
        `**Recommendation**: Start with critical calls in the Core Intelligence column, then address urgent coaching tickets.`;
    }

    if (lowerMessage.includes('summary') || lowerMessage.includes('critical') || lowerMessage.includes('issue')) {
      const criticalCalls = highRiskCalls.filter(c => c.riskScore >= 80);
      const totalCalls = kpiData?.totalCallsHandled?.value || 0;
      
      return `**Critical Issues Summary**\n\n` +
        `🔴 **Critical Calls**: ${criticalCalls.length}\n` +
        `📞 **Total Calls**: ${totalCalls.toLocaleString()}\n` +
        `⚠️ **High-Risk Calls**: ${highRiskCalls.length}\n` +
        `👥 **Agents with Issues**: ${agentLeaderboard.filter(a => a.severity !== 'low').length}\n` +
        `📋 **Coaching Tickets**: ${coachingTickets.length}\n\n` +
        `**Breakdown by Intent**:\n` +
        intentDistribution.slice(0, 5).map(intent => 
          `• ${intent.intent}: ${intent.count} calls (${intent.percentage.toFixed(1)}%)`
        ).join('\n') + '\n\n' +
        `**Next Steps**: Review the Core Intelligence column for detailed call analysis and the Action & Coaching column for agent performance.`;
    }

    if (lowerMessage.includes('trend') || lowerMessage.includes('trends')) {
      const topIntents = intentDistribution.slice(0, 5);
      const topAgents = agentLeaderboard.slice(0, 5);
      
      return `**Key Trends Analysis**\n\n` +
        `📊 **Top Call Intents**:\n` +
        topIntents.map((intent, i) => 
          `${i + 1}. ${intent.intent}: ${intent.count} calls (${intent.percentage.toFixed(1)}%)`
        ).join('\n') + '\n\n' +
        `👥 **Top Performing Agents**:\n` +
        topAgents.map((agent, i) => 
          `${i + 1}. ${agent.agentName}: ${agent.qaScore.toFixed(1)}% QA Score`
        ).join('\n') + '\n\n' +
        `📈 **Performance Trends**:\n` +
        `• Team QA Score: ${kpiData?.overallTeamQAScore?.value.toFixed(1) || 'N/A'}%\n` +
        `• Customer Emotion: ${kpiData?.customerEmotionIndex?.value.toFixed(1) || 'N/A'}/5\n` +
        `• Compliance Score: ${kpiData?.euComplianceScore?.overallScore.toFixed(1) || 'N/A'}%\n\n` +
        `Check the Team Health column for detailed trend visualizations.`;
    }

    if (lowerMessage.includes('escalation') || lowerMessage.includes('escalate')) {
      const escalationRisk = kpiData?.escalationRiskScore?.value || 0;
      const callsAtRisk = highRiskCalls.filter(c => c.riskScore >= 70).length;
      const highRiskCount = highRiskCalls.length;
      
      return `**Escalation Analysis**\n\n` +
        `⚡ **Escalation Risk Score**: ${escalationRisk.toFixed(1)}%\n` +
        `📞 **Calls at Risk**: ${callsAtRisk}\n` +
        `⚠️ **High-Risk Calls**: ${highRiskCount}\n\n` +
        `**Top High-Risk Calls**:\n` +
        highRiskCalls.slice(0, 5).map((call, i) => 
          `${i + 1}. Call ${call.callId}: ${call.riskCategory} (Risk Score: ${call.riskScore})`
        ).join('\n') + '\n\n' +
        `**Recommendation**: ${escalationRisk > 30 ? 'High escalation risk detected. Review high-risk calls immediately and provide coaching to agents involved.' : 'Escalation risk is manageable. Continue monitoring high-risk calls.'}`;
    }

    if (lowerMessage.includes('team') || lowerMessage.includes('performance') || lowerMessage.includes('agent')) {
      const topAgents = agentLeaderboard.slice(0, 5);
      const agentsNeedingAttention = agentLeaderboard.filter(a => a.severity !== 'low');
      const avgQAScore = agentLeaderboard.length > 0
        ? agentLeaderboard.reduce((sum, a) => sum + a.qaScore, 0) / agentLeaderboard.length
        : 0;
      
      return `**Team Performance Analysis**\n\n` +
        `📊 **Average QA Score**: ${avgQAScore.toFixed(1)}%\n` +
        `👥 **Total Agents**: ${agentLeaderboard.length}\n` +
        `⚠️ **Agents Needing Attention**: ${agentsNeedingAttention.length}\n\n` +
        `**Top Performing Agents**:\n` +
        topAgents.map((agent, i) => 
          `${i + 1}. ${agent.agentName}: ${agent.qaScore.toFixed(1)}% (${agent.severity} severity)`
        ).join('\n') + '\n\n' +
        `**Coaching Opportunities**:\n` +
        `• Active coaching tickets: ${coachingTickets.length}\n` +
        `• Agents needing attention: ${agentsNeedingAttention.length}\n\n` +
        `Review the Action & Coaching column for detailed agent performance and coaching recommendations.`;
    }

    if (lowerMessage.includes('compliance')) {
      if (!kpiData?.euComplianceScore) return "I don't have access to compliance data at the moment.";
      
      const compliance = kpiData.euComplianceScore;
      const categories = Object.values(compliance.byRegulation);
      const violations = categories.filter((reg) => reg.score < 90);
      
      return `**Compliance Insights**\n\n` +
        `🛡️ **Overall Compliance Score**: ${compliance.overallScore.toFixed(1)}%\n\n` +
        `**Transcript Checks**:\n` +
        categories.map((reg) => `• ${reg.label}: ${reg.score.toFixed(1)}%`).join('\n') + '\n\n' +
        `**Needs Attention**:\n` +
        (violations.length > 0 
          ? violations.map((reg) => `• ${reg.label}: ${reg.score.toFixed(1)}% - Investigate ${reg.transcriptSignals[0].toLowerCase()}`).join('\n')
          : '✅ All regulations are compliant') + '\n\n' +
        `**Recommendation**: ${compliance.overallScore < 90 ? 'Coach agents on the flagged transcript cues and reinforce call-open scripts.' : 'Maintain current coaching cadence and continue monitoring transcript cues.'}`;
    }

    if (lowerMessage.includes('coaching') || lowerMessage.includes('opportunity')) {
      const urgentCoaching = coachingTickets.filter(t => t.severity === 'high');
      const activeCoaching = coachingTickets.length;
      
      return `**Coaching Opportunities**\n\n` +
        `📋 **Active Coaching Tickets**: ${activeCoaching}\n` +
        `🔴 **Urgent Priority**: ${urgentCoaching.length}\n\n` +
        `**Top Coaching Priorities**:\n` +
        coachingTickets.slice(0, 5).map((ticket, i) => 
          `${i + 1}. ${ticket.agentName}: ${ticket.problemSummary} (${ticket.severity} severity)`
        ).join('\n') + '\n\n' +
        `**Recommendation**: ${urgentCoaching.length > 0 ? 'Address urgent coaching tickets immediately to improve team performance.' : 'Review coaching tickets and provide targeted feedback to agents.'}`;
    }

    // Default response
    return `I understand you're asking about "${userMessage}". Based on your voice dashboard data:\n\n` +
      `• **Total Calls**: ${kpiData?.totalCallsHandled?.value.toLocaleString() || 'N/A'}\n` +
      `• **Team QA Score**: ${kpiData?.overallTeamQAScore?.value.toFixed(1) || 'N/A'}%\n` +
      `• **High-Risk Calls**: ${highRiskCalls.length}\n` +
      `• **Coaching Tickets**: ${coachingTickets.length}\n\n` +
      `Would you like me to analyze a specific aspect of your voice dashboard? Try asking about:\n` +
      `• Top priorities\n` +
      `• Key insights\n` +
      `• Team performance\n` +
      `• Compliance status\n` +
      `• Coaching opportunities`;
  };

  const handleSendMessage = async (message?: string) => {
    const messageText = message || inputValue.trim();
    if (!messageText) return;

    // Add user message
    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: messageText,
      timestamp: new Date(),
    };

    setMessages(prev => [...prev, userMessage]);
    setInputValue('');
    setIsLoading(true);

    // Generate AI response
    const aiResponse = await generateAIResponse(messageText);

    const assistantMessage: Message = {
      id: (Date.now() + 1).toString(),
      role: 'assistant',
      content: aiResponse,
      timestamp: new Date(),
    };

    setMessages(prev => [...prev, assistantMessage]);
    setIsLoading(false);
  };

  const handleQuestionClick = (question: string) => {
    handleSendMessage(question);
  };

  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const renderMarkdown = (text: string) => {
    const lines = text.split('\n');
    
    return lines.map((line, lineIndex) => {
      const elements: (string | React.ReactElement)[] = [];
      let lastIndex = 0;
      let elementKey = 0;

      // Process bold text (**text**)
      // Create a new regex for each line to avoid state issues
      const boldRegex = /\*\*(.*?)\*\*/g;
      const matches = Array.from(line.matchAll(boldRegex));
      
      matches.forEach((match) => {
        if (match.index !== undefined) {
          // Add text before the match
          if (match.index > lastIndex) {
            elements.push(line.substring(lastIndex, match.index));
          }
          // Add bold text
          elements.push(
            <strong key={`bold-${lineIndex}-${elementKey++}`} className="font-semibold">
              {match[1]}
            </strong>
          );
          lastIndex = match.index + match[0].length;
        }
      });
      
      // Add remaining text
      if (lastIndex < line.length) {
        elements.push(line.substring(lastIndex));
      }

      return (
        <span key={`line-${lineIndex}`}>
          {elements.length > 0 ? elements : line}
          {lineIndex < lines.length - 1 && <br />}
        </span>
      );
    });
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50">
          {/* Backdrop - Transparent, no blur */}
          <motion.div 
            className="absolute inset-0 pointer-events-auto"
            onClick={onClose}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            style={{ backgroundColor: 'transparent' }}
          />
          
          {/* Chat Drawer */}
          <motion.div 
            className="absolute right-0 top-0 h-[90vh] max-h-[800px] w-full max-w-2xl border-l border-white/10 flex flex-col rounded-l-lg overflow-hidden"
            onClick={(e) => e.stopPropagation()}
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            style={{ backgroundColor: 'var(--sidebar)', boxShadow: 'none', filter: 'none', textShadow: 'none' }}
          >
            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b border-white/10 bg-app-black/50">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-gradient-to-r from-[#b90abd] to-[#5332ff]">
                  <Sparkles className="h-5 w-5 text-white" />
                </div>
                <div>
                  <h2 className="text-lg font-semibold text-white">AI Day Generator</h2>
                  <p className="text-xs text-gray-400">Get insights and analyze your voice dashboard</p>
                </div>
              </div>
              <Button
                variant="ghost"
                size="icon"
                onClick={onClose}
                className="text-gray-400 hover:text-white"
              >
                <X className="h-5 w-5" />
              </Button>
            </div>

            {/* Default Questions */}
            {messages.length === 0 && (
              <div className="p-4 border-b border-white/10 bg-app-black/30">
                <p className="text-sm text-gray-400 mb-3">Try asking:</p>
                <div className="flex flex-wrap gap-2">
                  {DEFAULT_QUESTIONS.map((question, index) => (
                    <button
                      key={index}
                      onClick={() => handleQuestionClick(question)}
                      className="px-3 py-1.5 text-xs bg-[#b90abd]/10 border border-[#b90abd]/30 text-[#b90abd] rounded-full hover:bg-[#b90abd]/20 hover:border-[#b90abd]/50 transition-all duration-200"
                    >
                      {question}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4 min-h-0">
              {messages.map((message) => (
                <div
                  key={message.id}
                  className={`flex gap-3 ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  {message.role === 'assistant' && (
                    <div className="flex-shrink-0 w-8 h-8 rounded-full bg-gradient-to-r from-[#b90abd] to-[#5332ff] flex items-center justify-center">
                      <Bot className="h-4 w-4 text-white" />
                    </div>
                  )}
                  <div
                    className={`max-w-[80%] rounded-lg p-3 ${
                      message.role === 'user'
                        ? 'bg-gradient-to-r from-[#b90abd] to-[#5332ff] text-white'
                        : 'bg-app-black/50 border border-white/10 text-gray-100'
                    }`}
                  >
                    <div className="text-sm whitespace-pre-wrap">{renderMarkdown(message.content)}</div>
                    <div className={`text-xs mt-1 ${
                      message.role === 'user' ? 'text-white/70' : 'text-gray-500'
                    }`}>
                      {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </div>
                  </div>
                  {message.role === 'user' && (
                    <div className="flex-shrink-0 w-8 h-8 rounded-full bg-gray-700 flex items-center justify-center">
                      <User className="h-4 w-4 text-white" />
                    </div>
                  )}
                </div>
              ))}
              
              {isLoading && (
                <div className="flex gap-3 justify-start">
                  <div className="flex-shrink-0 w-8 h-8 rounded-full bg-gradient-to-r from-[#b90abd] to-[#5332ff] flex items-center justify-center">
                    <Bot className="h-4 w-4 text-white" />
                  </div>
                  <div className="bg-app-black/50 border border-white/10 rounded-lg p-3">
                    <div className="flex gap-1">
                      <div className="w-2 h-2 bg-[#b90abd] rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
                      <div className="w-2 h-2 bg-[#b90abd] rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
                      <div className="w-2 h-2 bg-[#b90abd] rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
                    </div>
                  </div>
                </div>
              )}
              
              <div ref={messagesEndRef} />
            </div>

            {/* Input */}
            <div className="p-4 border-t border-white/10 bg-app-black/50">
              <div className="flex gap-2">
                <input
                  ref={inputRef}
                  type="text"
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  onKeyPress={handleKeyPress}
                  placeholder="Ask about your voice dashboard..."
                  className="flex-1 px-4 py-2 bg-app-black/50 border border-white/10 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-white/20 focus:ring-0 focus:shadow-none"
                />
                <Button
                  onClick={() => handleSendMessage()}
                  disabled={!inputValue.trim() || isLoading}
                  className="bg-gradient-to-r from-[#b90abd] to-[#5332ff] hover:from-[#a009b3] hover:to-[#4a2ae6] text-white focus:ring-0 focus:shadow-none focus-visible:ring-0 shadow-none"
                >
                  <Send className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}

