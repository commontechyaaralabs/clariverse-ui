'use client';

import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { X, Send, Bot, User, Sparkles } from 'lucide-react';
import { KPIData, EisenhowerThread } from '@/lib/api';

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
  threads: EisenhowerThread[];
}

const DEFAULT_QUESTIONS = [
  "What are the top priorities for today?",
  "Show me today's key insights",
  "Analyze the dashboard performance",
  "What needs immediate attention?",
  "Give me a summary of critical issues",
  "What are the trends I should know?",
  "Which threads require escalation?",
  "What's the sentiment analysis for today?"
];

export function AIDayGeneratorChat({ isOpen, onClose, kpiData, threads }: AIDayGeneratorChatProps) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

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
      const highPriorityThreads = threads.filter(t => t.priority === 'P1' || t.priority === 'P2');
      return `Based on your dashboard, you have **${highPriorityThreads.length} high-priority threads** that need immediate attention:\n\n` +
        `• **P1 Threads**: ${highPriorityThreads.filter(t => t.priority === 'P1').length} threads requiring urgent action\n` +
        `• **P2 Threads**: ${highPriorityThreads.filter(t => t.priority === 'P2').length} threads needing prompt response\n\n` +
        `Focus on the "Do - Now" quadrant in your Eisenhower Matrix. These threads have high business impact and require your immediate attention.`;
    }

    if (lowerMessage.includes('insight') || lowerMessage.includes('key insight')) {
      if (!kpiData) return "I don't have access to KPI data at the moment.";
      
      const escalationRate = kpiData.escalation_rate || 0;
      const sentiment = kpiData.customer_sentiment_index || 0;
      const closedRate = kpiData.closed_vs_open?.closed || 0;
      
      return `Here are today's key insights:\n\n` +
        `📊 **Escalation Rate**: ${escalationRate.toFixed(1)}% - ${escalationRate > 50 ? '⚠️ High escalation trend detected' : '✅ Within normal range'}\n` +
        `😊 **Customer Sentiment**: ${sentiment}/100 - ${sentiment > 60 ? 'Positive' : sentiment > 40 ? 'Neutral' : 'Needs attention'}\n` +
        `✅ **Resolution Rate**: ${closedRate.toFixed(1)}% of threads closed\n\n` +
        `**Recommendation**: ${escalationRate > 50 ? 'Focus on reducing escalations by addressing high-priority threads first.' : 'Maintain current performance levels.'}`;
    }

    if (lowerMessage.includes('analyze') || lowerMessage.includes('dashboard') || lowerMessage.includes('performance')) {
      if (!kpiData) return "I don't have access to KPI data at the moment.";
      
      const totalThreads = threads.length;
      const pendingCustomer = kpiData.pending_customer || 0;
      const pendingInternal = kpiData.pending_internal || 0;
      
      return `**Dashboard Analysis**\n\n` +
        `📈 **Total Threads**: ${totalThreads}\n` +
        `⏳ **Pending - Customer**: ${pendingCustomer} (${((pendingCustomer / totalThreads) * 100).toFixed(1)}%)\n` +
        `📋 **Pending - Internal**: ${pendingInternal} (${((pendingInternal / totalThreads) * 100).toFixed(1)}%)\n\n` +
        `**Key Metrics**:\n` +
        `• Average resolution time: ${kpiData.avg_resolution_time_days?.toFixed(1) || 'N/A'} days\n` +
        `• Escalation rate: ${kpiData.escalation_rate?.toFixed(1) || 'N/A'}%\n` +
        `• Customer sentiment: ${kpiData.customer_sentiment_index || 'N/A'}/100\n\n` +
        `**Action Items**: Review the Eisenhower Matrix to prioritize your workload effectively.`;
    }

    if (lowerMessage.includes('attention') || lowerMessage.includes('immediate') || lowerMessage.includes('urgent')) {
      const urgentThreads = threads.filter(t => 
        t.priority === 'P1' || 
        t.escalation_count > 0 || 
        t.overall_sentiment >= 4
      );
      
      return `**Immediate Attention Required**\n\n` +
        `You have **${urgentThreads.length} threads** that need immediate attention:\n\n` +
        `• **P1 Priority**: ${threads.filter(t => t.priority === 'P1').length} threads\n` +
        `• **Escalated**: ${threads.filter(t => t.escalation_count > 0).length} threads\n` +
        `• **High Sentiment Issues**: ${threads.filter(t => t.overall_sentiment >= 4).length} threads\n\n` +
        `**Recommendation**: Start with the "Do - Now" quadrant in your Eisenhower Matrix. These threads have the highest business impact and urgency.`;
    }

    if (lowerMessage.includes('summary') || lowerMessage.includes('critical') || lowerMessage.includes('issue')) {
      const criticalThreads = threads.filter(t => 
        t.priority === 'P1' || 
        t.business_impact_score > 70 ||
        t.escalation_count > 0
      );
      
      return `**Critical Issues Summary**\n\n` +
        `🔴 **Critical Threads**: ${criticalThreads.length}\n` +
        `📊 **Total Threads**: ${threads.length}\n` +
        `⚡ **Escalated**: ${threads.filter(t => t.escalation_count > 0).length}\n\n` +
        `**Breakdown by Quadrant**:\n` +
        `• Do - Now: ${threads.filter(t => t.quadrant === 'do').length} threads\n` +
        `• Schedule - Later: ${threads.filter(t => t.quadrant === 'schedule').length} threads\n` +
        `• Delegate - Team: ${threads.filter(t => t.quadrant === 'delegate').length} threads\n` +
        `• Delete: ${threads.filter(t => t.quadrant === 'delete').length} threads\n\n` +
        `**Next Steps**: Review the Risk Assessment card and Eisenhower Matrix for detailed analysis.`;
    }

    if (lowerMessage.includes('trend') || lowerMessage.includes('trends')) {
      return `**Key Trends Analysis**\n\n` +
        `📈 **Thread Volume**: ${threads.length} total threads\n` +
        `📊 **Priority Distribution**:\n` +
        `  • P1: ${threads.filter(t => t.priority === 'P1').length}\n` +
        `  • P2: ${threads.filter(t => t.priority === 'P2').length}\n` +
        `  • P3: ${threads.filter(t => t.priority === 'P3').length}\n` +
        `  • P4: ${threads.filter(t => t.priority === 'P4').length}\n` +
        `  • P5: ${threads.filter(t => t.priority === 'P5').length}\n\n` +
        `**Sentiment Trends**:\n` +
        `• Positive (1-2): ${threads.filter(t => t.overall_sentiment <= 2).length} threads\n` +
        `• Neutral (3): ${threads.filter(t => t.overall_sentiment === 3).length} threads\n` +
        `• Negative (4-5): ${threads.filter(t => t.overall_sentiment >= 4).length} threads\n\n` +
        `Check the Threads Over Time chart for detailed trend visualization.`;
    }

    if (lowerMessage.includes('escalation') || lowerMessage.includes('escalate')) {
      const escalatedThreads = threads.filter(t => t.escalation_count > 0);
      
      return `**Escalation Analysis**\n\n` +
        `⚠️ **Escalated Threads**: ${escalatedThreads.length}\n` +
        `📊 **Escalation Rate**: ${((escalatedThreads.length / threads.length) * 100).toFixed(1)}%\n\n` +
        `**Top Escalated Threads**:\n` +
        escalatedThreads.slice(0, 5).map((t, i) => 
          `${i + 1}. ${t.subject_norm} (Priority: ${t.priority}, Escalations: ${t.escalation_count})`
        ).join('\n') + '\n\n' +
        `**Recommendation**: Address these escalated threads immediately to prevent further escalation.`;
    }

    if (lowerMessage.includes('sentiment') || lowerMessage.includes('emotion')) {
      const sentimentDistribution = {
        calm: threads.filter(t => t.overall_sentiment === 1).length,
        irritated: threads.filter(t => t.overall_sentiment === 2).length,
        concerned: threads.filter(t => t.overall_sentiment === 3).length,
        angry: threads.filter(t => t.overall_sentiment === 4).length,
        frustrated: threads.filter(t => t.overall_sentiment === 5).length,
      };
      
      const avgSentiment = threads.length > 0
        ? threads.reduce((sum, t) => sum + t.overall_sentiment, 0) / threads.length
        : 0;
      
      return `**Sentiment Analysis**\n\n` +
        `📊 **Average Sentiment**: ${avgSentiment.toFixed(2)}/5\n\n` +
        `**Distribution**:\n` +
        `• 😊 Calm (1): ${sentimentDistribution.calm} threads\n` +
        `• 😐 Bit Irritated (2): ${sentimentDistribution.irritated} threads\n` +
        `• 😐 Moderately Concerned (3): ${sentimentDistribution.concerned} threads\n` +
        `• 😠 Anger (4): ${sentimentDistribution.angry} threads\n` +
        `• 😡 Frustrated (5): ${sentimentDistribution.frustrated} threads\n\n` +
        `**Insight**: ${avgSentiment > 3 ? '⚠️ Higher sentiment scores indicate customer frustration. Focus on addressing these threads promptly.' : '✅ Sentiment levels are manageable. Continue maintaining quality service.'}`;
    }

    // Default response
    return `I understand you're asking about "${userMessage}". Based on your dashboard data:\n\n` +
      `• You have **${threads.length} total threads** to manage\n` +
      `• Current escalation rate: ${kpiData?.escalation_rate?.toFixed(1) || 'N/A'}%\n` +
      `• Customer sentiment index: ${kpiData?.customer_sentiment_index || 'N/A'}/100\n\n` +
      `Would you like me to analyze a specific aspect of your dashboard? Try asking about:\n` +
      `• Top priorities\n` +
      `• Key insights\n` +
      `• Critical issues\n` +
      `• Trends and patterns`;
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
      const elements: (string | JSX.Element)[] = [];
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
            style={{ backgroundColor: 'var(--sidebar)' }}
          >
            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b border-white/10 bg-app-black/50">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-gradient-to-r from-[#b90abd] to-[#5332ff]">
                  <Sparkles className="h-5 w-5 text-white" />
                </div>
                <div>
                  <h2 className="text-lg font-semibold text-white">AI Day Generator</h2>
                  <p className="text-xs text-gray-400">Get insights and analyze your dashboard</p>
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
                  placeholder="Ask about your dashboard..."
                  className="flex-1 px-4 py-2 bg-app-black/50 border border-white/10 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-white/20"
                />
                <Button
                  onClick={() => handleSendMessage()}
                  disabled={!inputValue.trim() || isLoading}
                  className="bg-gradient-to-r from-[#b90abd] to-[#5332ff] hover:from-[#a009b3] hover:to-[#4a2ae6] text-white"
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

