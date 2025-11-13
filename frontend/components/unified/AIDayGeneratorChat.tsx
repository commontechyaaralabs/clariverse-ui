'use client';

import { useState, useRef, useEffect, type ReactElement } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { X, Send, Bot, User, Sparkles } from 'lucide-react';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

interface AIDayGeneratorChatProps {
  isOpen: boolean;
  onClose: () => void;
}

const DEFAULT_QUESTIONS = [
  "What are the top priorities across all 5 channels today?",
  "Show me today's key insights from email, chat, ticket, social, and voice",
  "Give me a unified dashboard summary for all channels",
  "What needs immediate attention across all 5 channels?",
  "What are the common trends across email, chat, ticket, social, and voice?",
  "Analyze overall customer sentiment across all channels",
  "Which channel has the highest escalation rates?",
  "Compare performance across all 5 channels"
];

export function AIDayGeneratorChat({ isOpen, onClose }: AIDayGeneratorChatProps) {
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

    // Generate contextual responses based on the question
    if (lowerMessage.includes('priority') || lowerMessage.includes('priorities')) {
      return `**Top Priorities Across All 5 Channels**\n\n` +
        `Based on your unified dashboard, here are the key priorities:\n\n` +
        `📧 **Email Channel**:\n` +
        `• 47 high-priority threads requiring immediate attention\n` +
        `• 12 escalated cases needing urgent response\n` +
        `• Average response time: 2.4 hours\n\n` +
        `💬 **Chat Channel**:\n` +
        `• 89 active conversations in queue\n` +
        `• 15 customers waiting over 5 minutes\n` +
        `• Average handle time: 6.2 minutes\n\n` +
        `🎫 **Ticket Channel**:\n` +
        `• 34 tickets approaching SLA breach\n` +
        `• 8 VIP customer tickets pending\n` +
        `• First response time: 1.8 hours\n\n` +
        `📱 **Social Media**:\n` +
        `• 156 mentions requiring response\n` +
        `• 34 negative sentiment posts\n` +
        `• Trending topics: product quality, delivery times\n\n` +
        `📞 **Voice Transcripts**:\n` +
        `• 23 high-risk calls identified\n` +
        `• 8 compliance violations detected\n` +
        `• QA score: 87.5% (above target)\n\n` +
        `**Recommendation**: Focus on SLA-risk tickets first, then handle chat queue, followed by escalated email cases and negative social sentiment.`;
    }

    if (lowerMessage.includes('insight') || lowerMessage.includes('key insights') || lowerMessage.includes('summary')) {
      return `**Unified Dashboard Insights - All 5 Channels**\n\n` +
        `📊 **Overall Performance**:\n` +
        `• Total interactions: 2,485 across all 5 channels\n` +
        `• Average customer sentiment: 72/100 (Good)\n` +
        `• Overall resolution rate: 81.7%\n` +
        `• Overall escalation rate: 8.2% (slightly elevated)\n\n` +
        `🎯 **Channel Performance**:\n` +
        `• 📧 Email: 543 threads (67% resolved, 2.4hr avg response)\n` +
        `• 💬 Chat: 782 conversations (89% resolved, 6.2min handle time)\n` +
        `• 🎫 Ticket: 456 tickets (76% resolved, 1.8hr first response)\n` +
        `• 📱 Social: 415 interactions (78% positive sentiment)\n` +
        `• 📞 Voice: 289 calls (87.5% QA score, 8.3min avg call)\n\n` +
        `⚠️ **Areas Requiring Attention**:\n` +
        `• Ticket SLA breaches: 34 tickets at risk\n` +
        `• Chat queue: 15 customers waiting over 5 minutes\n` +
        `• Email escalation rate 2.3% above normal\n` +
        `• Social media response time increased by 15%\n` +
        `• Voice compliance: 8 violations flagged\n\n` +
        `**Action Items**: Prioritize ticket SLAs, reduce chat wait times, and address email escalations.`;
    }

    if (lowerMessage.includes('attention') || lowerMessage.includes('immediate') || lowerMessage.includes('urgent')) {
      return `**Immediate Attention Required Across All 5 Channels**\n\n` +
        `🔴 **Critical Items Summary**:\n\n` +
        `📧 **Email** (15 items):\n` +
        `• 8 P1 priority threads\n` +
        `• 7 escalated cases over 24 hours\n\n` +
        `💬 **Chat** (18 items):\n` +
        `• 15 customers waiting over 5 minutes\n` +
        `• 3 escalated conversations\n\n` +
        `🎫 **Ticket** (34 items):\n` +
        `• 26 tickets approaching SLA breach\n` +
        `• 8 VIP customer issues\n\n` +
        `📱 **Social Media** (23 items):\n` +
        `• 18 negative posts requiring response\n` +
        `• 5 viral complaints gaining traction\n\n` +
        `📞 **Voice Transcripts** (12 items):\n` +
        `• 5 high-risk calls requiring follow-up\n` +
        `• 7 compliance violations to resolve\n\n` +
        `**Total**: **102 critical items** need your immediate attention today.\n\n` +
        `**Recommended Priority Order**:\n` +
        `1. Ticket SLA breaches (prevent penalties)\n` +
        `2. Chat queue (customers actively waiting)\n` +
        `3. P1 email threads (high business impact)\n` +
        `4. Viral social complaints (reputation risk)\n` +
        `5. Voice compliance issues (regulatory requirement)`;
    }

    if (lowerMessage.includes('trend') || lowerMessage.includes('trends') || lowerMessage.includes('common')) {
      return `**Common Trends Across All 5 Channels**\n\n` +
        `📈 **Emerging Patterns**:\n\n` +
        `**Top Customer Pain Points**:\n` +
        `• Delivery delays (mentioned 142 times across all channels)\n` +
        `• Product quality concerns (89 mentions)\n` +
        `• Billing issues (67 mentions)\n` +
        `• Account access problems (54 mentions)\n` +
        `• Technical support needs (48 mentions)\n\n` +
        `**Positive Trends**:\n` +
        `• Customer service satisfaction: +12% vs. last week\n` +
        `• First-contact resolution: +8%\n` +
        `• Overall response time: 15% faster\n` +
        `• Chat resolution rate: +6%\n\n` +
        `**Channel-Specific Insights**:\n` +
        `• 📧 Email: Technical support queries increasing (+18%)\n` +
        `• 💬 Chat: Quick resolution preference (+23%)\n` +
        `• 🎫 Ticket: Complex issue escalations trending\n` +
        `• 📱 Social: Product feedback and feature requests (+31%)\n` +
        `• 📞 Voice: More complex troubleshooting calls (+14%)\n\n` +
        `**Recommendation**: Create a unified response playbook for delivery delays. Consider proactive notifications across all channels.`;
    }

    if (lowerMessage.includes('sentiment') || lowerMessage.includes('emotion') || lowerMessage.includes('customer sentiment')) {
      return `**Overall Customer Sentiment Analysis Across All 5 Channels**\n\n` +
        `📊 **Unified Sentiment Score**: **72/100** (Good)\n\n` +
        `**Breakdown by Channel**:\n` +
        `• 📧 Email: 68/100 (Neutral-Positive)\n` +
        `• 💬 Chat: 78/100 (Positive)\n` +
        `• 🎫 Ticket: 70/100 (Positive)\n` +
        `• 📱 Social Media: 65/100 (Mixed)\n` +
        `• 📞 Voice: 81/100 (Very Positive)\n\n` +
        `**Overall Sentiment Distribution**:\n` +
        `• 😊 Very Positive: 28%\n` +
        `• 🙂 Positive: 34%\n` +
        `• 😐 Neutral: 21%\n` +
        `• 😕 Negative: 12%\n` +
        `• 😠 Very Negative: 5%\n\n` +
        `**Key Drivers of Negative Sentiment**:\n` +
        `• Delayed responses (38% of negative mentions)\n` +
        `• Unresolved issues (29%)\n` +
        `• Product defects (18%)\n` +
        `• Billing errors (15%)\n\n` +
        `**Best Practices**:\n` +
        `• Voice and Chat channels have highest satisfaction\n` +
        `• Real-time interaction correlates with better sentiment\n` +
        `• Consider implementing chat-style quick responses in email\n\n` +
        `**Recommendation**: Replicate voice and chat service practices across email, ticket, and social channels.`;
    }

    if (lowerMessage.includes('escalation') || lowerMessage.includes('escalate')) {
      return `**Escalation Analysis Across All 5 Channels**\n\n` +
        `⚠️ **Overall Escalation Rate**: **8.2%** (Target: 6%)\n\n` +
        `**By Channel**:\n` +
        `• 📧 Email: 9.7% (↑ 2.3% above normal)\n` +
        `• 💬 Chat: 5.4% (✅ Below target - best performer)\n` +
        `• 🎫 Ticket: 7.8% (↑ Slightly elevated)\n` +
        `• 📱 Social Media: 11.4% (↑ Highest rate)\n` +
        `• 📞 Voice: 6.1% (✅ Within target)\n\n` +
        `**Escalation Reasons Across All Channels**:\n` +
        `1. Unresolved after 3+ interactions (34%)\n` +
        `2. Customer requested manager (28%)\n` +
        `3. Policy exception needed (19%)\n` +
        `4. Technical complexity (12%)\n` +
        `5. VIP customer (7%)\n\n` +
        `**Top Escalated Topics**:\n` +
        `• Refund requests: 42 escalations\n` +
        `• Technical issues: 35 escalations\n` +
        `• Delivery problems: 28 escalations\n` +
        `• Account access: 19 escalations\n` +
        `• Billing disputes: 16 escalations\n\n` +
        `**Recommendations**:\n` +
        `• Empower agents with $100 refund authority\n` +
        `• Improve first-contact resolution training\n` +
        `• Create escalation prevention playbooks for top topics\n` +
        `• Replicate chat's success practices in email and social`;
    }

    if (lowerMessage.includes('performance') || lowerMessage.includes('channel') || lowerMessage.includes('compare')) {
      return `**Performance Summary - All 5 Channels Comparison**\n\n` +
        `📊 **Channel Metrics Overview**:\n\n` +
        `📧 **Email**:\n` +
        `• Volume: 543 threads\n` +
        `• Resolution Rate: 67.2%\n` +
        `• Avg Response Time: 2.4 hours\n` +
        `• Customer Satisfaction: 68/100\n` +
        `• Status: ⚠️ Needs improvement\n\n` +
        `💬 **Chat**:\n` +
        `• Volume: 782 conversations\n` +
        `• Resolution Rate: 89.1%\n` +
        `• Avg Handle Time: 6.2 minutes\n` +
        `• Customer Satisfaction: 78/100\n` +
        `• Status: ✅ Performing well\n\n` +
        `🎫 **Ticket**:\n` +
        `• Volume: 456 tickets\n` +
        `• Resolution Rate: 76.3%\n` +
        `• Avg First Response: 1.8 hours\n` +
        `• Customer Satisfaction: 70/100\n` +
        `• Status: 🟡 Moderate\n\n` +
        `📱 **Social Media**:\n` +
        `• Volume: 415 interactions\n` +
        `• Response Rate: 89.2%\n` +
        `• Avg Response Time: 45 minutes\n` +
        `• Sentiment Score: 65/100\n` +
        `• Status: 🟡 Moderate\n\n` +
        `📞 **Voice**:\n` +
        `• Volume: 289 calls\n` +
        `• QA Score: 87.5%\n` +
        `• Avg Handle Time: 8.3 minutes\n` +
        `• Customer Satisfaction: 81/100\n` +
        `• Status: ✅ Performing well\n\n` +
        `**Rankings**:\n` +
        `🥇 Best: Voice (81/100 satisfaction)\n` +
        `🥈 Second: Chat (78/100 satisfaction)\n` +
        `🥉 Third: Ticket (70/100 satisfaction)\n` +
        `⚠️ Needs Focus: Email & Social (escalation & response time)`;
    }

    if (lowerMessage.includes('day') || lowerMessage.includes('generate') || lowerMessage.includes('2 minutes')) {
      return `**Your Day in 2 Minutes - All 5 Channels Unified**\n\n` +
        `⏰ **Time**: ${new Date().toLocaleTimeString()}\n` +
        `📅 **Date**: ${new Date().toLocaleDateString()}\n\n` +
        `🎯 **Your Priority Action Plan**:\n\n` +
        `**🔥 Immediate (Next 90 minutes)**:\n` +
        `1. 🎫 Address 26 tickets at SLA risk (Est. 30 min)\n` +
        `2. 💬 Clear chat queue - 15 waiting customers (Est. 20 min)\n` +
        `3. 📧 Handle 8 P1 email threads (Est. 40 min)\n\n` +
        `**⚡ Morning (Next 2 hours)**:\n` +
        `4. 📱 Respond to 18 negative social posts (Est. 30 min)\n` +
        `5. 📞 Review 5 high-risk call recordings (Est. 30 min)\n` +
        `6. 🔄 Follow up on 12 escalated cases (Est. 60 min)\n\n` +
        `**📊 Afternoon**:\n` +
        `7. Review performance metrics across all channels\n` +
        `8. Implement chat best practices in email\n` +
        `9. Analyze delivery delay complaints (142 mentions)\n` +
        `10. Team coaching session on first-contact resolution\n\n` +
        `**📈 Key Numbers Across All Channels**:\n` +
        `• Total critical items: 102\n` +
        `• Total interactions: 2,485\n` +
        `• Estimated time to clear critical items: 5.5 hours\n` +
        `• Team support available: 12 agents\n\n` +
        `**🎁 Quick Wins**:\n` +
        `• Delegate 34 routine tickets to team leads\n` +
        `• Automate 15 standard responses\n` +
        `• Schedule 8 non-urgent items for tomorrow\n` +
        `• Net reduction: 57 items off your plate\n\n` +
        `**🎯 End-of-Day Goals**:\n` +
        `• Clear all SLA-risk tickets (0 breaches)\n` +
        `• Reduce overall escalation rate to <7%\n` +
        `• Improve social sentiment to 70+\n` +
        `• Achieve <2min chat wait time\n` +
        `• Close all P1 email threads`;
    }

    // Default response
    return `I understand you're asking about "${userMessage}". Based on your unified dashboard across all 5 channels:\n\n` +
      `📊 **Quick Overview**:\n` +
      `• Total interactions: 2,485 (Email: 543, Chat: 782, Ticket: 456, Social: 415, Voice: 289)\n` +
      `• Overall customer satisfaction: 72/100\n` +
      `• Critical items requiring attention: 102\n` +
      `• Average resolution rate: 81.7%\n` +
      `• Overall escalation rate: 8.2%\n\n` +
      `**Would you like me to dive deeper into**:\n` +
      `• 📧 Email performance & priorities\n` +
      `• 💬 Chat queue & response times\n` +
      `• 🎫 Ticket SLA status & risks\n` +
      `• 📱 Social media sentiment & trends\n` +
      `• 📞 Voice call quality & compliance\n` +
      `• 📊 Cross-channel comparison\n` +
      `• 🎯 Your personalized action plan for today\n` +
      `• 🔍 Sentiment, escalation, or trend analysis\n\n` +
      `Just ask, and I'll provide detailed insights!`;
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
      const elements: (string | ReactElement)[] = [];
      let lastIndex = 0;
      let elementKey = 0;

      // Process bold text (**text**)
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
          {/* Backdrop */}
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
                  <p className="text-xs text-gray-400">Unified insights across Email, Chat, Ticket, Social & Voice</p>
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
                  placeholder="Ask about your unified dashboard..."
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

