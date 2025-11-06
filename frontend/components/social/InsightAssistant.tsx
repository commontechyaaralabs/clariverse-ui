'use client';

import { useState, useRef, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { MessageCircle, Send, X, Brain, Sparkles } from 'lucide-react';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  highlights?: Array<{ element: string; reason: string }>;
}

interface InsightAssistantProps {
  onHighlight?: (element: string) => void;
}

export function InsightAssistant({ onHighlight }: InsightAssistantProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      role: 'assistant',
      content: 'I\'m your AI Insight Assistant. Ask me questions like "Why did sentiment drop last week?" or "Which topic caused most urgency?"',
    },
  ]);
  const [input, setInput] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSend = () => {
    if (!input.trim()) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: input,
    };

    setMessages(prev => [...prev, userMessage]);
    setInput('');

    // Simulate AI response
    setTimeout(() => {
      const aiResponse: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: generateAIResponse(input),
        highlights: generateHighlights(input),
      };
      setMessages(prev => [...prev, aiResponse]);
    }, 1000);
  };

  const generateAIResponse = (query: string): string => {
    const lowerQuery = query.toLowerCase();
    
    if (lowerQuery.includes('sentiment') && lowerQuery.includes('drop')) {
      return 'Sentiment dropped 23% in the last 7 days, primarily due to app crashes in version 2.4.1. The issue is affecting 23% of iOS users. I\'ve highlighted the sentiment trend chart.';
    }
    if (lowerQuery.includes('urgency') || lowerQuery.includes('urgent')) {
      return 'Payment Failures topic has the highest urgency (89%) with 567 messages. 67% of users report waiting >24 hours for resolution. I\'ve highlighted the urgency radar chart.';
    }
    if (lowerQuery.includes('complaint') && lowerQuery.includes('play store')) {
      return 'Top complaints on Play Store: App Crashes (234 mentions), Payment Failures (189 mentions), and Slow Performance (156 mentions). These correlate with version 3.4.2 release.';
    }
    if (lowerQuery.includes('emerging') || lowerQuery.includes('trending')) {
      return 'Login Issues topic is emerging with 34% growth in the last 3 days. Sentiment is -0.58, indicating urgent attention needed. I\'ve highlighted the topic growth trend.';
    }
    
    return 'I understand your question. Let me analyze the data and provide insights. Would you like to know more about a specific topic, sentiment trends, or urgent issues?';
  };

  const generateHighlights = (query: string): Array<{ element: string; reason: string }> => {
    const lowerQuery = query.toLowerCase();
    if (lowerQuery.includes('sentiment')) {
      return [{ element: 'sentiment-chart', reason: 'Shows sentiment trend over time' }];
    }
    if (lowerQuery.includes('urgency')) {
      return [{ element: 'urgency-radar', reason: 'Displays urgency levels by platform' }];
    }
    return [];
  };

  if (!isOpen) {
    return (
      <Button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-6 right-6 w-14 h-14 rounded-full bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-500 hover:to-purple-600 text-white shadow-lg hover:shadow-purple-500/30 transition-all duration-200 z-50"
      >
        <MessageCircle className="h-6 w-6" />
      </Button>
    );
  }

  return (
    <Card className="fixed bottom-6 right-6 w-96 h-[600px] bg-gray-900 border-purple-500/30 shadow-2xl z-50 flex flex-col">
      <CardHeader className="pb-3 border-b border-gray-700">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Brain className="h-5 w-5 text-purple-400" />
            <CardTitle className="text-white text-lg">Insight Assistant</CardTitle>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setIsOpen(false)}
            className="h-6 w-6 p-0 text-gray-400 hover:text-white"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
      </CardHeader>
      <CardContent className="flex-1 flex flex-col p-4 overflow-hidden">
        <div className="flex-1 overflow-y-auto space-y-4 mb-4">
          {messages.map((message) => (
            <div
              key={message.id}
              className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              <div
                className={`max-w-[80%] rounded-lg p-3 ${
                  message.role === 'user'
                    ? 'bg-purple-600 text-white'
                    : 'bg-gray-800 text-gray-100'
                }`}
              >
                {message.role === 'assistant' && (
                  <Sparkles className="h-3 w-3 text-purple-400 mb-1" />
                )}
                <p className="text-sm leading-relaxed">{message.content}</p>
                {message.highlights && message.highlights.length > 0 && (
                  <div className="mt-2 pt-2 border-t border-gray-700">
                    {message.highlights.map((highlight, idx) => (
                      <button
                        key={idx}
                        onClick={() => onHighlight?.(highlight.element)}
                        className="text-xs text-purple-300 hover:text-purple-200 underline block"
                      >
                        {highlight.reason}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>
          ))}
          <div ref={messagesEndRef} />
        </div>
        <div className="flex gap-2">
          <Input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleSend()}
            placeholder="Ask about sentiment, urgency, trends..."
            className="flex-1 bg-gray-800 border-gray-700 text-white"
          />
          <Button
            onClick={handleSend}
            className="bg-purple-600 hover:bg-purple-500"
            size="sm"
          >
            <Send className="h-4 w-4" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

