'use client';

import { EmailConversation } from '@/lib/types';
import { CheckCircle, XCircle, Clock, User, Mail } from 'lucide-react';

interface EmailConversationThreadProps {
  conversation: EmailConversation;
}

export default function EmailConversationThread({ conversation }: EmailConversationThreadProps) {
  const getSentimentIcon = (sentiment: { positive: number; neutral: number; negative: number }) => {
    const maxSentiment = Math.max(sentiment.positive, sentiment.neutral, sentiment.negative);
    if (maxSentiment === sentiment.positive) {
      return <CheckCircle className="w-4 h-4 text-green-500" />;
    } else if (maxSentiment === sentiment.negative) {
      return <XCircle className="w-4 h-4 text-red-500" />;
    } else {
      return <Clock className="w-4 h-4 text-yellow-500" />;
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString();
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="bg-app-gray-800 border border-app-gray-700 rounded-2xl p-6 animate-slide-down">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-2xl font-bold text-white">{conversation.thread.subject_norm}</h2>
          <div className="flex items-center space-x-2">
            {getSentimentIcon(conversation.sentiment)}
            <span className="text-app-gray-400 text-sm">Sentiment Analysis</span>
          </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-app-gray-800 border border-app-gray-700 rounded-xl p-4">
            <h3 className="text-app-white font-semibold mb-2">Conversation Details</h3>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-manatee">Thread ID:</span>
                <span className="text-app-white">{conversation.thread.thread_id}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-manatee">Message Count:</span>
                <span className="text-app-white">{conversation.thread.message_count}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-manatee">First Message:</span>
                <span className="text-app-white">{formatDate(conversation.thread.first_message_at)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-manatee">Last Message:</span>
                <span className="text-app-white">{formatDate(conversation.thread.last_message_at)}</span>
              </div>
            </div>
          </div>
          
          <div className="bg-app-gray-800 border border-app-gray-700 rounded-xl p-4">
            <h3 className="text-app-white font-semibold mb-2">Analysis Results</h3>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-manatee">Dominant Cluster:</span>
                <span className="text-app-white">{conversation.dominant_cluster}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-manatee">Subcluster:</span>
                <span className="text-app-white">{conversation.subcluster}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-manatee">Confidence:</span>
                <span className="text-app-white">{Math.round(conversation.confidence_score * 100)}%</span>
              </div>
              <div className="flex justify-between">
                <span className="text-manatee">Urgency:</span>
                <span className={`text-app-white font-semibold ${
                  conversation.urgency === 'high' ? 'text-red-500' :
                  conversation.urgency === 'medium' ? 'text-yellow-500' : 'text-green-500'
                }`}>
                  {conversation.urgency.toUpperCase()}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Message Thread */}
      <div className="bg-app-gray-800 border border-app-gray-700 rounded-2xl p-6 animate-slide-up">
        <h3 className="text-xl font-bold text-white mb-6">Message Thread</h3>
        <div className="space-y-4">
          {conversation.messages.map((message, index) => (
            <div key={index} className="bg-app-gray-800 border border-app-gray-700 rounded-xl p-4 hover:bg-app-gray-700 transition-colors">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center space-x-2">
                <Mail className="w-4 h-4 text-app-blue" />
                <span className="text-app-white font-medium">
                  {message.headers.from[0]?.name || message.headers.from[0]?.email}
                </span>
                <span className="text-manatee text-sm">
                  ({message.headers.from[0]?.email})
                </span>
              </div>
              <span className="text-manatee text-sm">
                {formatDate(message.headers.date)}
              </span>
            </div>
            
              <div className="bg-app-gray-900 border border-app-gray-600 rounded-lg p-3 mt-2">
                <p className="text-white text-sm whitespace-pre-wrap leading-relaxed">
                  {message.body.text.plain}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Action Items */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 animate-slide-up">
        <div className="bg-app-gray-800 border border-app-gray-700 rounded-2xl p-6">
          <h4 className="text-white font-bold mb-3 flex items-center space-x-2">
            <CheckCircle className="w-5 h-5 text-emerald-400" />
            <span>Next Action</span>
          </h4>
          <p className="text-app-gray-300 text-sm leading-relaxed">{conversation.next_action_suggestion}</p>
        </div>
        
        <div className="bg-app-gray-800 border border-app-gray-700 rounded-2xl p-6">
          <h4 className="text-white font-bold mb-3 flex items-center space-x-2">
            <Clock className="w-5 h-5 text-electric-violet" />
            <span>Follow-up Required</span>
          </h4>
          <p className="text-app-gray-300 text-sm leading-relaxed">
            {conversation.follow_up_required === 'yes' 
              ? `Yes - ${conversation.follow_up_reason}` 
              : 'No follow-up required'
            }
          </p>
        </div>
      </div>
    </div>
  );
}
