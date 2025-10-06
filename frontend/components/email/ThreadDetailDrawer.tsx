'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ThreadDetail } from '@/lib/api';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  X, 
  Calendar, 
  Clock, 
  Users, 
  MessageSquare, 
  AlertCircle,
  CheckCircle,
  Circle,
  ArrowRight,
  User,
  Mail
} from 'lucide-react';
import { useState } from 'react';

interface ThreadDetailDrawerProps {
  thread: ThreadDetail | null;
  isOpen: boolean;
  onClose: () => void;
}

const statusConfig = {
  open: { icon: Circle, color: 'text-yellow-400', bgColor: 'bg-yellow-500/10' },
  in_progress: { icon: Clock, color: 'text-blue-400', bgColor: 'bg-blue-500/10' },
  closed: { icon: CheckCircle, color: 'text-green-400', bgColor: 'bg-green-500/10' },
};

const priorityConfig = {
  high: { color: 'text-red-400', bgColor: 'bg-red-500/10' },
  medium: { color: 'text-yellow-400', bgColor: 'bg-yellow-500/10' },
  low: { color: 'text-green-400', bgColor: 'bg-green-500/10' },
};

export function ThreadDetailDrawer({ thread, isOpen, onClose }: ThreadDetailDrawerProps) {
  const [activeTab, setActiveTab] = useState<'overview' | 'messages'>('overview');

  if (!thread) return null;

  const statusInfo = statusConfig[thread.resolution_status];
  const priorityInfo = priorityConfig[thread.priority];
  const StatusIcon = statusInfo.icon;


  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const getSentimentColor = (sentiment: number) => {
    if (sentiment === 1) return 'text-green-400';
    if (sentiment === 2) return 'text-lime-400';
    if (sentiment === 3) return 'text-yellow-400';
    if (sentiment === 4) return 'text-orange-400';
    return 'text-red-400';
  };

  const getSentimentLabel = (sentiment: number) => {
    if (sentiment === 1) return 'Calm';
    if (sentiment === 2) return 'Bit Irritated';
    if (sentiment === 3) return 'Moderately Concerned';
    if (sentiment === 4) return 'Anger';
    return 'Frustrated';
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50">
          {/* Backdrop */}
          <motion.div 
            className="absolute inset-0 bg-black/50 backdrop-blur-sm"
            onClick={onClose}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
          />
          
          {/* Drawer */}
          <motion.div 
            className="absolute right-0 top-0 h-full w-full max-w-2xl bg-gray-900 border-l border-gray-700 shadow-2xl"
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
          >
            <div className="flex flex-col h-full">
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-gray-700">
            <div className="flex items-center gap-3">
              <div className={`p-2 rounded-lg ${statusInfo.bgColor}`}>
                <StatusIcon className={`h-5 w-5 ${statusInfo.color}`} />
              </div>
              <div>
                <h2 className="text-lg font-semibold text-white">
                  {thread.subject_norm}
                </h2>
                <p className="text-sm text-gray-400">
                  Thread ID: {thread.thread_id}
                </p>
              </div>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={onClose}
              className="text-gray-400 hover:text-white hover:bg-gray-700"
            >
              <X className="h-5 w-5" />
            </Button>
          </div>

          {/* Tabs */}
          <div className="flex border-b border-gray-700">
            {[
              { id: 'overview', label: 'Overview', icon: MessageSquare },
              { id: 'messages', label: 'Messages', icon: Users },
            ].map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as any)}
                  className={`flex items-center gap-2 px-6 py-3 text-sm font-medium transition-colors ${
                    activeTab === tab.id
                      ? 'text-blue-400 border-b-2 border-blue-400 bg-blue-500/5'
                      : 'text-gray-400 hover:text-white hover:bg-gray-700/50'
                  }`}
                >
                  <Icon className="h-4 w-4" />
                  {tab.label}
                </button>
              );
            })}
          </div>

          {/* Content */}
          <div className="flex-1 overflow-y-auto p-6">
            {activeTab === 'overview' && (
              <div className="space-y-6">
                {/* Thread Info */}
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Thread Information</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="text-sm font-medium text-gray-400">Status</label>
                        <div className={`flex items-center gap-2 mt-1 ${priorityInfo.color}`}>
                          <StatusIcon className="h-4 w-4" />
                          <span className="capitalize">{thread.resolution_status}</span>
                        </div>
                      </div>
                      <div>
                        <label className="text-sm font-medium text-gray-400">Priority</label>
                        <div className={`flex items-center gap-2 mt-1 ${priorityInfo.color}`}>
                          <AlertCircle className="h-4 w-4" />
                          <span className="capitalize">{thread.priority}</span>
                        </div>
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="text-sm font-medium text-gray-400">Created</label>
                        <p className="text-white text-sm mt-1">
                          {formatDate(thread.first_message_at)}
                        </p>
                      </div>
                      <div>
                        <label className="text-sm font-medium text-gray-400">Last Activity</label>
                        <p className="text-white text-sm mt-1">
                          {formatDate(thread.last_message_at)}
                        </p>
                      </div>
                    </div>

                    <div>
                      <label className="text-sm font-medium text-gray-400">Message Count</label>
                      <p className="text-white text-sm mt-1">{thread.message_count} messages</p>
                    </div>
                  </CardContent>
                </Card>

                {/* Participants */}
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Participants</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {thread.participants.map((participant, index) => (
                        <div key={index} className="flex items-center gap-3 p-3 bg-gray-800 rounded-lg">
                          <div className="p-2 bg-blue-500/10 rounded-lg">
                            <User className="h-4 w-4 text-blue-400" />
                          </div>
                          <div className="flex-1">
                            <p className="text-white font-medium">{participant.name}</p>
                            <p className="text-gray-400 text-sm">{participant.email}</p>
                          </div>
                          <span className="text-xs text-gray-500 capitalize">
                            {participant.type}
                          </span>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>

                {/* Next Action & Follow-up */}
                <Card>
                  <CardHeader>
                    <CardTitle className="text-lg">Action Items</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <label className="text-sm font-medium text-gray-400">Next Action Suggestion</label>
                      <p className="text-white text-sm mt-1 bg-gray-800 p-3 rounded-lg">
                        {thread.next_action_suggestion}
                      </p>
                    </div>
                    
                    {thread.follow_up_date && (
                      <div>
                        <label className="text-sm font-medium text-gray-400">Follow-up Required</label>
                        <div className="mt-1 space-y-2">
                          <div className="flex items-center gap-2 text-yellow-400">
                            <Calendar className="h-4 w-4" />
                            <span className="text-sm">
                              {formatDate(thread.follow_up_date)}
                            </span>
                          </div>
                          <p className="text-gray-300 text-sm bg-gray-800 p-3 rounded-lg">
                            {thread.follow_up_reason}
                          </p>
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </div>
            )}

            {activeTab === 'messages' && (
              <div className="space-y-4">
                {thread.messages.map((message, index) => (
                  <Card key={index}>
                    <CardContent className="p-4">
                      <div className="flex items-start gap-3">
                        <div className="p-2 bg-gray-700 rounded-lg">
                          <Mail className="h-4 w-4 text-gray-400" />
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center justify-between mb-2">
                            <div className="flex items-center gap-2">
                              <span className="text-white font-medium">
                                {message.headers.from[0].name}
                              </span>
                              <ArrowRight className="h-3 w-3 text-gray-400" />
                              <span className="text-gray-400">
                                {message.headers.to[0].name}
                              </span>
                            </div>
                            <span className="text-xs text-gray-500">
                              {formatDate(message.headers.date)}
                            </span>
                          </div>
                          <p className="text-gray-300 text-sm leading-relaxed">
                            {message.body.text.plain}
                          </p>
                          <div className="flex items-center gap-4 mt-3 text-xs">
                            <span className={`${getSentimentColor(message.sentiment.positive - message.sentiment.negative)}`}>
                              {getSentimentLabel(message.sentiment.positive - message.sentiment.negative)}
                            </span>
                            <span className="text-gray-500">
                              Pos: {Math.round(message.sentiment.positive * 100)}%
                            </span>
                            <span className="text-gray-500">
                              Neg: {Math.round(message.sentiment.negative * 100)}%
                            </span>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}

          </div>

          {/* Footer */}
          <div className="p-6 border-t border-gray-700">
            <div className="flex gap-3">
              <Button className="flex-1 bg-blue-600 hover:bg-blue-700 text-white">
                Take Action
              </Button>
              <Button variant="outline" className="border-gray-600 text-gray-300 hover:bg-gray-700">
                Export Thread
              </Button>
            </div>
          </div>
          </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
