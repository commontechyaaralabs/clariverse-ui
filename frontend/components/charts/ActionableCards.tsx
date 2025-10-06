'use client';

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ActionableCard } from '@/lib/api';
import { 
  AlertTriangle, 
  Clock, 
  TrendingUp, 
  AlertCircle, 
  Star,
  ArrowUpRight,
  UserPlus,
  MessageSquare,
  CheckCircle,
  Calendar
} from 'lucide-react';

interface ActionableCardsProps {
  data: ActionableCard[];
  onActionClick?: (action: string, cardId: string) => void;
}

export function ActionableCards({ data, onActionClick }: ActionableCardsProps) {

  const getCardIcon = (type: string) => {
    switch (type) {
      case 'top_risk': return <AlertTriangle className="h-5 w-5" />;
      case 'overdue_followup': return <Clock className="h-5 w-5" />;
      case 'opportunity': return <TrendingUp className="h-5 w-5" />;
      case 'sla_failure': return <AlertCircle className="h-5 w-5" />;
      case 'watchlist': return <Star className="h-5 w-5" />;
      default: return <AlertTriangle className="h-5 w-5" />;
    }
  };

  const getCardColor = (priority: string, type: string, title: string) => {
    // Override priority for specific business logic
    const effectivePriority = getEffectivePriority(priority, type, title);
    
    switch (effectivePriority) {
      case 'critical': return 'border-red-500 bg-red-500/10';
      case 'high': return 'border-orange-500 bg-orange-500/10';
      case 'medium': return 'border-yellow-500 bg-yellow-500/10';
      case 'low': return 'border-blue-500 bg-blue-500/10';
      default: return 'border-gray-500 bg-gray-500/10';
    }
  };

  const getPriorityTextColor = (priority: string, type: string, title: string) => {
    // Override priority for specific business logic
    const effectivePriority = getEffectivePriority(priority, type, title);
    
    switch (effectivePriority) {
      case 'critical': return 'text-red-400';
      case 'high': return 'text-orange-400';
      case 'medium': return 'text-yellow-400';
      case 'low': return 'text-blue-400';
      default: return 'text-gray-400';
    }
  };

  const getEffectivePriority = (priority: string, type: string, title: string) => {
    // Business logic for priority overrides
    if (type === 'watchlist' && title.toLowerCase().includes('vip')) {
      return 'critical'; // VIP Customer Threads are CRITICAL
    }
    if (type === 'opportunity') {
      return 'medium'; // Customer upsell opportunities are important but not critical
    }
    return priority; // Keep original priority for other types
  };

  const getButtonVariant = (variant: string) => {
    switch (variant) {
      case 'primary': return 'bg-blue-600 hover:bg-blue-700 text-white';
      case 'secondary': return 'bg-gray-600 hover:bg-gray-700 text-white';
      case 'danger': return 'bg-red-600 hover:bg-red-700 text-white';
      default: return 'bg-gray-600 hover:bg-gray-700 text-white';
    }
  };

  const getButtonIcon = (action: string) => {
    switch (action) {
      case 'escalate': return <ArrowUpRight className="h-4 w-4" />;
      case 'assign_owner': return <UserPlus className="h-4 w-4" />;
      case 'reply': return <MessageSquare className="h-4 w-4" />;
      case 'mark_resolved': return <CheckCircle className="h-4 w-4" />;
      case 'schedule': return <Calendar className="h-4 w-4" />;
      default: return <ArrowUpRight className="h-4 w-4" />;
    }
  };

  const getSentimentColor = (sentiment: number) => {
    if (sentiment <= 2) return 'text-red-400';
    if (sentiment <= 3) return 'text-yellow-400';
    return 'text-green-400';
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-white">Actionable Items</h3>
        <div className="text-sm text-gray-400">{data.length} items requiring attention</div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 auto-rows-fr">
        {data.map((card) => {
          const effectivePriority = getEffectivePriority(card.priority, card.type, card.title);
          
          return (
            <Card 
              key={card.id}
              className={`
                bg-gray-900 border-gray-700 cursor-pointer transition-all duration-200
                hover:shadow-lg hover:scale-105 relative h-full
                ${getCardColor(card.priority, card.type, card.title)}
              `}
            >
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center gap-2 flex-1 min-w-0">
                    <div className={getPriorityTextColor(card.priority, card.type, card.title)}>
                      {getCardIcon(card.type)}
                    </div>
                    <CardTitle className="text-white text-sm font-medium truncate">
                      {card.title}
                    </CardTitle>
                  </div>
                  <div className={`
                    px-2 py-1 rounded-full text-xs font-medium flex-shrink-0
                    ${getPriorityTextColor(card.priority, card.type, card.title)} bg-gray-800
                  `}>
                    {effectivePriority.toUpperCase()}
                  </div>
                </div>
                <CardDescription className="text-gray-400 text-xs mt-2 line-clamp-3 break-words">
                  {card.description}
                </CardDescription>
              </CardHeader>
            
            <CardContent className="space-y-3 flex-1 flex flex-col">
              {/* Thread Info */}
              <div className="space-y-1">
                <div className="text-xs text-gray-300 font-medium truncate">
                  Thread: {card.thread_id}
                </div>
                <div className="text-xs text-gray-400 line-clamp-2">
                  {card.subject_norm}
                </div>
              </div>

              {/* Participants */}
              <div className="space-y-1">
                <div className="text-xs text-gray-300 font-medium">Participants:</div>
                <div className="flex flex-wrap gap-1 max-h-16 overflow-hidden">
                  {card.participants.slice(0, 3).map((participant, index) => (
                    <span 
                      key={index}
                      className="text-xs px-2 py-1 bg-gray-800 rounded text-gray-300 truncate max-w-24"
                    >
                      {participant.name}
                    </span>
                  ))}
                  {card.participants.length > 3 && (
                    <span className="text-xs px-2 py-1 bg-gray-700 rounded text-gray-400">
                      +{card.participants.length - 3}
                    </span>
                  )}
                </div>
              </div>

              {/* Next Action - Highlighted */}
              <div className="space-y-2 p-3 bg-blue-900/20 border border-blue-500/30 rounded-lg">
                <div className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-blue-400" />
                  <div className="text-sm font-semibold text-blue-300">Next Action Required</div>
                </div>
                <div className="text-sm text-white font-medium leading-relaxed">
                  {card.next_action_suggestion}
                </div>
              </div>

              {/* Additional Details */}
              <div className="space-y-2 pt-2 border-t border-gray-700">
                <div className="text-xs text-white font-medium">Additional Details</div>
                <div className="space-y-1 text-xs text-gray-300">
                  <div className="truncate">Thread ID: {card.thread_id}</div>
                  {card.metadata.sla_breach_risk && (
                    <div className="break-words">Risk Score: {card.metadata.sla_breach_risk.toFixed(1)}%</div>
                  )}
                  {card.metadata.follow_up_date && (
                    <div>Follow-up Date: {new Date(card.metadata.follow_up_date).toLocaleDateString()}</div>
                  )}
                </div>
              </div>

              {/* Metadata */}
              <div className="flex items-center justify-between text-xs gap-2">
                <div className="flex items-center gap-1 min-w-0">
                  <span className="text-gray-400">Urgency:</span>
                  <span className={getPriorityTextColor(card.metadata.urgency, card.type, card.title)}>
                    {effectivePriority.toUpperCase()}
                  </span>
                </div>
                <div className="flex items-center gap-1 min-w-0">
                  <span className="text-gray-400">Sentiment:</span>
                  <span className={getSentimentColor(card.metadata.sentiment)}>
                    {card.metadata.sentiment}
                  </span>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-2 pt-2 flex-wrap mt-auto">
                {card.cta_buttons
                  .filter(button => 
                    button.action !== 'escalate' && 
                    button.action !== 'assign_owner' && 
                    button.action !== 'reply'
                  )
                  .map((button, index) => (
                  <Button
                    key={index}
                    size="sm"
                    className={`
                        text-xs px-2 py-1 h-auto flex-shrink-0
                      ${getButtonVariant(button.variant)}
                    `}
                    onClick={() => onActionClick?.(button.action, card.id)}
                  >
                    <div className="flex items-center gap-1">
                      {getButtonIcon(button.action)}
                        <span className="truncate max-w-20">{button.label}</span>
                    </div>
                  </Button>
                ))}
              </div>
            </CardContent>

          </Card>
          );
        })}
      </div>
    </div>
  );
}

