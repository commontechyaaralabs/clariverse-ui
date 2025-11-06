'use client';

import { EmailConversation } from '@/lib/types';
import { CheckCircle, XCircle, Clock, Eye, AlertTriangle, Mail, User, Calendar, X } from 'lucide-react';

interface EmailPreviewCardProps {
  conversation: EmailConversation;
  onClick?: () => void;
  onClose?: () => void;
  showCloseButton?: boolean;
  variant?: 'simple' | 'detailed';
}

export default function EmailPreviewCard({ 
  conversation, 
  onClick, 
  onClose, 
  showCloseButton = false,
  variant = 'simple'
}: EmailPreviewCardProps) {
  const getSentimentIcon = (sentiment: { positive: number; neutral: number; negative: number }) => {
    const maxSentiment = Math.max(sentiment.positive, sentiment.neutral, sentiment.negative);
    if (maxSentiment === sentiment.positive) {
      return <CheckCircle className="w-4 h-4 text-emerald-400" />;
    } else if (maxSentiment === sentiment.negative) {
      return <XCircle className="w-4 h-4 text-red-400" />;
    } else {
      return <Clock className="w-4 h-4 text-yellow-400" />;
    }
  };

  const getUrgencyColor = (urgency: string) => {
    switch (urgency) {
      case 'high': return 'bg-red-500/20 text-red-400 border-red-500/30';
      case 'medium': return 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30';
      case 'low': return 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30';
      default: return 'bg-app-gray-500/20 text-app-gray-400 border-app-gray-500/30';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'open': return 'bg-[#b90abd]/20 text-[#b90abd] border-[#b90abd]/30';
      case 'in-progress': return 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30';
      case 'resolved': return 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30';
      case 'closed': return 'bg-app-gray-500/20 text-app-gray-400 border-app-gray-500/30';
      default: return 'bg-app-gray-500/20 text-app-gray-400 border-app-gray-500/30';
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      month: 'numeric', 
      day: 'numeric', 
      year: 'numeric' 
    });
  };

  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString('en-US', { 
      hour: 'numeric', 
      minute: '2-digit',
      hour12: true 
    });
  };

  // Simple variant for dashboard
  if (variant === 'simple') {
    return (
      <div 
        className="bg-app-gray-800 border border-app-gray-700 rounded-xl p-4 hover:bg-app-gray-700 cursor-pointer group relative animate-fade-in transition-colors"
        onClick={onClick}
      >
        {/* Header */}
        <div className="flex items-start justify-between mb-3">
          <div className="flex-1 min-w-0">
            <h3 className="text-white text-base font-semibold mb-1 truncate">
              {conversation.thread.subject_norm}
            </h3>
            <p className="text-app-gray-400 text-xs">
              {conversation.thread.participants[0]?.email}
            </p>
          </div>
          <div className="flex items-center space-x-2 ml-3">
            <div className="bg-app-gray-600 rounded-lg px-2 py-1 flex items-center space-x-1">
              <Eye className="w-3 h-3 text-white" />
              <span className="text-white text-xs font-medium">View</span>
            </div>
          </div>
        </div>

        {/* Status Badges */}
        <div className="flex items-center space-x-2 mb-3">
          <span className={`px-2 py-1 rounded text-xs font-medium ${getUrgencyColor(conversation.urgency)}`}>
            {conversation.urgency.toUpperCase()}
          </span>
          <span className={`px-2 py-1 rounded text-xs font-medium ${getStatusColor(conversation.resolution_status)}`}>
            {conversation.resolution_status.replace('-', ' ').toUpperCase()}
          </span>
          {conversation.urgency === 'high' && (
            <div className="flex items-center space-x-1 px-2 py-1 rounded bg-red-500/20 text-red-400">
              <AlertTriangle className="w-3 h-3" />
              <span className="text-xs font-medium">URGENT</span>
            </div>
          )}
        </div>

        {/* Analysis Results - Simplified */}
        <div className="grid grid-cols-2 gap-3 mb-3">
          <div>
            <p className="text-app-gray-400 text-xs mb-1">Cluster</p>
            <p className="text-white text-sm font-medium truncate">{conversation.dominant_cluster}</p>
          </div>
          <div>
            <p className="text-app-gray-400 text-xs mb-1">Confidence</p>
            <p className="text-white text-sm font-medium">{Math.round(conversation.confidence_score * 100)}%</p>
          </div>
        </div>

        {/* Description */}
        <div className="mb-3">
          <p className="text-app-gray-300 text-xs leading-relaxed line-clamp-2">
            {conversation.email_summary}
          </p>
        </div>

        {/* Footer - Simplified */}
        <div className="flex items-center justify-between pt-3 border-t border-white/10">
          <div className="flex items-center space-x-3 text-xs text-app-gray-400">
            <div className="flex items-center space-x-1">
              <User className="w-3 h-3" />
              <span>{conversation.thread.message_count}</span>
            </div>
            <div className="flex items-center space-x-1">
              <Clock className="w-3 h-3" />
              <span>{formatTime(conversation.thread.first_message_at)}</span>
            </div>
          </div>
          <div className="flex items-center space-x-1">
            {getSentimentIcon(conversation.sentiment)}
            <span className="text-app-gray-400 text-xs">
              {conversation.sentiment.positive > conversation.sentiment.negative ? 'Positive' : 
               conversation.sentiment.negative > conversation.sentiment.positive ? 'Negative' : 'Neutral'}
            </span>
          </div>
        </div>
      </div>
    );
  }

  // Detailed variant for popup
  return (
    <div 
      className="bg-black border border-app-gray-700 rounded-xl p-6 hover-lift cursor-pointer group relative animate-fade-in"
      onClick={onClick}
    >
      {/* Close Button */}
      {showCloseButton && onClose && (
        <button
          onClick={(e) => {
            e.stopPropagation();
            onClose();
          }}
          className="absolute top-3 right-3 p-1 rounded-lg hover:bg-white/10 transition-colors"
        >
          <X className="w-4 h-4 text-app-gray-400 hover:text-white" />
        </button>
      )}

      {/* Header */}
      <div className="flex items-start justify-between mb-4">
        <div className="flex-1 min-w-0">
          <h3 className="text-white text-lg font-semibold mb-2">
            {conversation.thread.subject_norm}
          </h3>
          <p className="text-app-gray-400 text-sm">
            {conversation.thread.participants[0]?.email}
          </p>
        </div>
        <div className="flex items-center space-x-2 ml-3">
          <div className="bg-app-gray-600 rounded-lg px-3 py-2 flex items-center space-x-2">
            <Eye className="w-4 h-4 text-white" />
            <span className="text-white text-sm font-medium">View Details</span>
          </div>
        </div>
      </div>

      {/* Status Badges */}
      <div className="flex items-center space-x-2 mb-4">
        <span className={`px-3 py-1 rounded text-sm font-medium ${getUrgencyColor(conversation.urgency)}`}>
          {conversation.urgency.toUpperCase()}
        </span>
        <span className={`px-3 py-1 rounded text-sm font-medium ${getStatusColor(conversation.resolution_status)}`}>
          {conversation.resolution_status.replace('-', ' ').toUpperCase()}
        </span>
        {conversation.urgency === 'high' && (
          <div className="flex items-center space-x-1 px-3 py-1 rounded bg-red-500/20 text-red-400">
            <AlertTriangle className="w-4 h-4" />
            <span className="text-sm font-medium">URGENT</span>
          </div>
        )}
      </div>

      {/* Analysis Results - Detailed */}
      <div className="grid grid-cols-2 gap-4 mb-4">
        <div>
          <p className="text-app-gray-400 text-sm mb-1">Cluster</p>
          <p className="text-white text-base font-medium">{conversation.dominant_cluster}</p>
        </div>
        <div>
          <p className="text-app-gray-400 text-sm mb-1">Confidence</p>
          <p className="text-white text-base font-medium">{Math.round(conversation.confidence_score * 100)}%</p>
        </div>
      </div>

      {/* Description */}
      <div className="mb-4">
        <p className="text-app-gray-300 text-sm leading-relaxed">
          {conversation.email_summary}
        </p>
      </div>

      {/* Footer - Detailed */}
      <div className="flex items-center justify-between pt-4 border-t border-white/10">
        <div className="flex items-center space-x-4 text-sm text-app-gray-400">
          <div className="flex items-center space-x-1">
            <User className="w-4 h-4" />
            <span>{conversation.thread.message_count} participants</span>
          </div>
          <div className="flex items-center space-x-1">
            <Clock className="w-4 h-4" />
            <span>{formatTime(conversation.thread.first_message_at)}</span>
          </div>
        </div>
        <div className="flex items-center space-x-2">
          {getSentimentIcon(conversation.sentiment)}
          <span className="text-app-gray-400 text-sm">
            {conversation.sentiment.positive > conversation.sentiment.negative ? 'Positive' : 
             conversation.sentiment.negative > conversation.sentiment.positive ? 'Negative' : 'Neutral'}
          </span>
        </div>
      </div>
    </div>
  );
}
