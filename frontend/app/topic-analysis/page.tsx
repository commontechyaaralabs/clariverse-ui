"use client";

import React, { useState, useRef, useEffect } from 'react';
import { ChevronDown, ChevronLeft, ChevronRight, X, Search, AlertTriangle, Clock, CheckCircle, Zap } from 'lucide-react';
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft, BarChart3, TrendingUp, Users, MessageSquare, Mail, MessageCircle, Ticket, Share2, Mic } from "lucide-react";

// Types based on your email data structure
interface EmailData {
  _id: { $oid: string };
  provider: string;
  thread: {
    thread_id: string;
    thread_key: { m365_conversation_id: string };
    subject_norm: string;
    participants: Array<{
      type: string;
      name: string;
      email: string;
    }>;
    first_message_at: string;
    last_message_at: string;
    message_count: number;
  };
  messages: Array<{
    provider_ids: any;
    headers: {
      date: string;
      subject: string;
      from: Array<{ name: string; email: string }>;
      to: Array<{ name: string; email: string }>;
    };
    body: {
      mime_type: string;
      text: { plain: string };
    };
  }>;
  dominant_topic: string;
  subtopics: string;
  kmeans_cluster_id: number;
  subcluster_id: string;
  subcluster_label: string;
  dominant_cluster_label: string;
  kmeans_cluster_keyphrase: string;
  domain: string;
  action_pending_from: string;
  action_pending_status: string;
  email_summary: string;
  follow_up_date?: string;
  follow_up_reason?: string;
  follow_up_required: string;
  next_action_suggestion: string;
  overall_sentiment: number;
  resolution_status: string;
  sentiment: { [key: string]: number };
  stages: string;
  urgency: boolean;
}

interface DominantCluster {
  kmeans_cluster_id: number;
  dominant_cluster_label: string;
  count: number;
}

interface Subcluster {
  subcluster_id: string;
  subcluster_label: string;
  kmeans_cluster_id: number;
  count: number;
}

export default function TopicAnalysis() {
  const [selectedChannel, setSelectedChannel] = useState<string>("email");
  const [selectedDominantTopics, setSelectedDominantTopics] = useState<number[]>([]);
  const [selectedSubtopics, setSelectedSubtopics] = useState<string[]>([]);
  const [selectedMessageType, setSelectedMessageType] = useState<string>("all");
  const [dominantDropdownOpen, setDominantDropdownOpen] = useState(false);
  const [subtopicDropdownOpen, setSubtopicDropdownOpen] = useState(false);
  const [messageTypeDropdownOpen, setMessageTypeDropdownOpen] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedEmail, setSelectedEmail] = useState<EmailData | null>(null);
  const [loading, setLoading] = useState(true);
  const [loadingDocuments, setLoadingDocuments] = useState(false);
  const [dominantClusters, setDominantClusters] = useState<DominantCluster[]>([]);
  const [subclusters, setSubclusters] = useState<Subcluster[]>([]);
  const [emails, setEmails] = useState<EmailData[]>([]);
  const [allEmails, setAllEmails] = useState<EmailData[]>([]);
  const [pagination, setPagination] = useState({
    current_page: 1,
    page_size: 30,
    total_documents: 0,
    total_pages: 0,
    filtered_count: 0,
    has_next: false,
    has_previous: false,
    page_document_count: 0,
  });
  const [searchTerm, setSearchTerm] = useState('');
  
  const dominantDropdownRef = useRef<HTMLDivElement>(null);
  const subtopicDropdownRef = useRef<HTMLDivElement>(null);
  const messageTypeDropdownRef = useRef<HTMLDivElement>(null);

  const channels = [
    { id: "email", label: "Email", icon: Mail },
    { id: "chat", label: "Chat", icon: MessageCircle },
    { id: "ticket", label: "Ticket", icon: Ticket },
    { id: "social", label: "Social Media", icon: Share2 },
    { id: "voice", label: "Voice", icon: Mic },
  ];

  const messageTypes = [
    { id: "all", label: "All Messages", icon: Mail },
    { id: "single", label: "Single Emails", icon: Mail },
    { id: "thread", label: "Thread Conversations", icon: MessageSquare },
  ];

  // Load email data from local JSON file
  useEffect(() => {
    const loadEmailData = async () => {
      try {
        setLoading(true);
        const response = await fetch('/data/email-data.json');
        const data: EmailData[] = await response.json();
        
        setAllEmails(data);
        
        // Extract unique dominant clusters and subclusters
        const dominantClusterMap = new Map<number, { label: string; count: number }>();
        const subclusterMap = new Map<string, { label: string; kmeans_cluster_id: number; count: number }>();
        
        data.forEach(email => {
          // Dominant clusters
          const clusterId = email.kmeans_cluster_id;
          const clusterLabel = email.dominant_cluster_label;
          if (clusterId && clusterLabel) {
            const existing = dominantClusterMap.get(clusterId);
            dominantClusterMap.set(clusterId, {
              label: clusterLabel,
              count: (existing?.count || 0) + 1
            });
          }
          
          // Subclusters
          const subclusterId = email.subcluster_id;
          const subclusterLabel = email.subcluster_label;
          if (subclusterId && subclusterLabel) {
            const existing = subclusterMap.get(subclusterId);
            subclusterMap.set(subclusterId, {
              label: subclusterLabel,
              kmeans_cluster_id: clusterId,
              count: (existing?.count || 0) + 1
            });
          }
        });
        
        setDominantClusters(
          Array.from(dominantClusterMap.entries()).map(([id, data]) => ({
            kmeans_cluster_id: id,
            dominant_cluster_label: data.label,
            count: data.count
          }))
        );
        
        setSubclusters(
          Array.from(subclusterMap.entries()).map(([id, data]) => ({
            subcluster_id: id,
            subcluster_label: data.label,
            kmeans_cluster_id: data.kmeans_cluster_id,
            count: data.count
          }))
        );
        
      } catch (error) {
        console.error('Error loading email data:', error);
      } finally {
        setLoading(false);
      }
    };

    if (allEmails.length === 0) {
      loadEmailData();
    }
  }, []);

  // Filter and paginate emails based on selected filters
  useEffect(() => {
    const filterAndPaginateEmails = () => {
      if (selectedChannel !== "email" || !allEmails.length) {
        setEmails([]);
        setPagination({
          current_page: 1,
          page_size: 30,
          total_documents: 0,
          total_pages: 0,
          filtered_count: 0,
          has_next: false,
          has_previous: false,
          page_document_count: 0,
        });
        return;
      }

      let filteredEmails = allEmails;

      // Apply dominant topic filter
      if (selectedDominantTopics.length > 0) {
        filteredEmails = filteredEmails.filter(email => 
          selectedDominantTopics.includes(email.kmeans_cluster_id)
        );
      }

      // Apply subtopic filter
      if (selectedSubtopics.length > 0) {
        filteredEmails = filteredEmails.filter(email => 
          selectedSubtopics.includes(email.subcluster_id)
        );
      }

      // Apply message type filter
      if (selectedMessageType !== "all") {
        if (selectedMessageType === "single") {
          filteredEmails = filteredEmails.filter(email => email.thread.message_count === 1);
        } else if (selectedMessageType === "thread") {
          filteredEmails = filteredEmails.filter(email => email.thread.message_count > 1);
        }
      }

      // Apply search filter
      if (searchTerm) {
        const searchLower = searchTerm.toLowerCase();
        filteredEmails = filteredEmails.filter(email => {
          const subject = email.thread.subject_norm || '';
          const sender = email.thread.participants.find(p => p.type === 'from')?.name || '';
          const content = email.messages[0]?.body.text.plain || '';
          
          return (
            subject.toLowerCase().includes(searchLower) ||
            sender.toLowerCase().includes(searchLower) ||
            content.toLowerCase().includes(searchLower) ||
            email.dominant_cluster_label?.toLowerCase().includes(searchLower) ||
            email.subcluster_label?.toLowerCase().includes(searchLower)
          );
        });
      }

      const totalDocuments = filteredEmails.length;
      const totalPages = Math.ceil(totalDocuments / 30);
      const startIndex = (currentPage - 1) * 30;
      const endIndex = startIndex + 30;
      const paginatedEmails = filteredEmails.slice(startIndex, endIndex);

      setEmails(paginatedEmails);
      setPagination({
        current_page: currentPage,
        page_size: 30,
        total_documents: totalDocuments,
        total_pages: totalPages,
        filtered_count: totalDocuments,
        has_next: currentPage < totalPages,
        has_previous: currentPage > 1,
        page_document_count: paginatedEmails.length,
      });
    };

    filterAndPaginateEmails();
  }, [selectedChannel, allEmails, selectedDominantTopics, selectedSubtopics, selectedMessageType, currentPage, searchTerm]);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        dominantDropdownOpen &&
        dominantDropdownRef.current &&
        !dominantDropdownRef.current.contains(event.target as Node)
      ) {
        setDominantDropdownOpen(false);
      }
      if (
        subtopicDropdownOpen &&
        subtopicDropdownRef.current &&
        !subtopicDropdownRef.current.contains(event.target as Node)
      ) {
        setSubtopicDropdownOpen(false);
      }
      if (
        messageTypeDropdownOpen &&
        messageTypeDropdownRef.current &&
        !messageTypeDropdownRef.current.contains(event.target as Node)
      ) {
        setMessageTypeDropdownOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [dominantDropdownOpen, subtopicDropdownOpen, messageTypeDropdownOpen]);

  const handleDominantTopicToggle = (clusterId: number) => {
    setSelectedDominantTopics(prev => 
      prev.includes(clusterId) 
        ? prev.filter(id => id !== clusterId)
        : [clusterId] // Only allow one selection at a time
    );
    setSelectedSubtopics([]); // Clear subtopics when dominant topic changes
    setCurrentPage(1); // Reset to first page
  };

  const handleSubtopicToggle = (subtopicId: string) => {
    setSelectedSubtopics(prev => 
      prev.includes(subtopicId) 
        ? prev.filter(id => id !== subtopicId)
        : [...prev, subtopicId] // Allow multiple selections
    );
    setCurrentPage(1); // Reset to first page
  };

  const handleMessageTypeChange = (messageType: string) => {
    setSelectedMessageType(messageType);
    setCurrentPage(1); // Reset to first page
  };

  const handleEmailClick = (email: EmailData) => {
    if (selectedEmail?._id.$oid === email._id.$oid) {
      setSelectedEmail(null);
    } else {
      setSelectedEmail(email);
      
      setTimeout(() => {
        const detailsPanel = document.querySelector('[data-email-details]');
        if (detailsPanel) {
          const header = document.querySelector('.sticky.top-0');
          const headerHeight = header ? header.getBoundingClientRect().height : 80;
          
          const elementRect = detailsPanel.getBoundingClientRect();
          const absoluteElementTop = elementRect.top + window.pageYOffset;
          const offset = absoluteElementTop - headerHeight - 20;
          
          window.scrollTo({
            top: offset,
            behavior: 'smooth'
          });
        }
      }, 100);
    }
  };

  const clearAllFilters = () => {
    setSelectedDominantTopics([]);
    setSelectedSubtopics([]);
    setSelectedMessageType("all");
    setSearchTerm('');
    setCurrentPage(1);
  };

  const handlePreviousPage = () => {
    if (pagination.has_previous) {
      setCurrentPage(pagination.current_page - 1);
    }
  };

  const handleNextPage = () => {
    if (pagination.has_next) {
      setCurrentPage(pagination.current_page + 1);
    }
  };

  const getChannelData = () => {
    const baseData = {
      all: { totalTopics: 811, growthRate: "+15%", activeUsers: "2.4k", messages: "4.2k" },
      email: { totalTopics: dominantClusters.length, growthRate: "+12%", activeUsers: "1.2k", messages: allEmails.length.toString() },
      chat: { totalTopics: 189, growthRate: "-5%", activeUsers: "0.8k", messages: "1.2k" },
      ticket: { totalTopics: 156, growthRate: "+8%", activeUsers: "0.6k", messages: "0.9k" },
      social: { totalTopics: 134, growthRate: "+3%", activeUsers: "1.5k", messages: "2.1k" },
      voice: { totalTopics: 98, growthRate: "-2%", activeUsers: "0.3k", messages: "0.4k" },
    };
    return baseData[selectedChannel as keyof typeof baseData] || baseData.all;
  };

  const channelData = getChannelData();

  // Get channel-specific description
  const getChannelDescription = () => {
    const descriptions = {
      email: "Explore and filter email messages by topics and subtopics to gain actionable insights",
      chat: "Chat topic analysis will be available once chat data is loaded",
      ticket: "Ticket topic analysis will be available once ticket data is loaded", 
      social: "Social media topic analysis will be available once social media data is loaded",
      voice: "Voice transcript topic analysis will be available once voice data is loaded",
      all: "Comprehensive topic analysis across all communication channels"
    };
    return descriptions[selectedChannel as keyof typeof descriptions] || descriptions.all;
  };

  // Check if channel has data
  const hasChannelData = (channel: string) => {
    return channel === "email" && allEmails.length > 0;
  };


  // Main topic analysis page with channel selection
  return (
    <div className="relative overflow-hidden min-h-screen">
      {/* Background - only covers the main content area */}
      <div
        className="absolute inset-0 z-0"
        style={{ background: 'linear-gradient(135deg, #0a0a0a 0%, #1a0a1a 50%, #0a0a1a 100%)' }}
      />
      <div
        className="absolute inset-0 z-10 pointer-events-none"
        style={{
          background: 'linear-gradient(135deg, rgba(185, 10, 189, 0.3) 0%, rgba(83, 50, 255, 0.3) 100%)',
          mixBlendMode: 'multiply',
        }}
      />
      
      {/* Main Content */}
      <div className="relative z-20">
        {/* Header Section */}
        <section className="pb-4 px-6">
          <div className="max-w-[95vw] mx-auto">
            <div className="text-center mb-4">
              <h2 className="text-4xl md:text-6xl font-bold mb-4 bg-gradient-to-r from-pink-400 to-purple-400 bg-clip-text text-transparent">
                Topic Analysis Dashboard
              </h2>
                  <p className="text-xl text-gray-300 max-w-4xl mx-auto mb-8">
                    {selectedChannel === "email" 
                      ? "Explore and filter email messages by topics and subtopics to gain actionable insights"
                      : "Explore and filter messages by topics and subtopics to gain actionable insights"
                    }
                  </p>
            </div>

            <div className="flex flex-col w-full">
              {/* Channel Selection Filter */}
              <div className="bg-gray-900 bg-opacity-95 border border-gray-700 rounded-lg shadow-lg p-4 mb-4">
                <h3 className="text-white text-lg font-semibold mb-4">Select Channel</h3>
                <div className="flex flex-wrap gap-3">
                  {channels.map((channel) => {
                    const IconComponent = channel.icon;
                    return (
                      <button
                        key={channel.id}
                        onClick={() => setSelectedChannel(channel.id)}
                        className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-all ${
                          selectedChannel === channel.id
                            ? 'bg-gradient-to-r from-pink-500 to-purple-500 text-white shadow-lg'
                            : 'bg-gray-800 text-gray-300 hover:bg-gray-700 hover:text-white'
                        }`}
                      >
                        <IconComponent className="h-4 w-4" />
                        {channel.label}
                      </button>
                    );
                  })}
                </div>
              </div>


              {/* Show email analysis below channel selection */}
              {selectedChannel === "email" && allEmails.length > 0 && (
                <>
                  {/* Filter Bar */}
                  <div className="sticky top-0 z-30 bg-gray-900 bg-opacity-95 border border-gray-700 rounded-lg shadow-lg p-4 mb-4 flex flex-wrap gap-4 items-center justify-between transition-all duration-300">
                    {/* Dominant Topics Filter */}
                    <div className="relative min-w-[220px]" ref={dominantDropdownRef}>
                      <label className="text-sm font-semibold text-gray-200 mb-1 block">Dominant Topics</label>
                      <button
                        aria-label="Select dominant topics"
                        onClick={() => setDominantDropdownOpen(!dominantDropdownOpen)}
                        className="w-full bg-gray-800 text-white rounded-lg p-3 border border-gray-600 flex items-center justify-between hover:bg-gray-700 focus:ring-2 focus:ring-pink-500 focus:outline-none transition-all"
                      >
                        <span className="text-sm">
                          {selectedDominantTopics.length > 0 
                            ? `${selectedDominantTopics.length} topic${selectedDominantTopics.length > 1 ? 's' : ''} selected`
                            : 'Select topics...'}
                        </span>
                        <ChevronDown className={`w-4 h-4 transition-transform ${dominantDropdownOpen ? 'rotate-180' : ''}`} />
                      </button>
                      {dominantDropdownOpen && (
                        <div className="absolute z-50 w-64 mt-1 bg-gray-800 border border-gray-600 rounded-lg shadow-xl max-h-60 overflow-y-auto animate-fade-in">
                          {loading ? (
                            <div className="p-4 text-gray-300">Loading clusters...</div>
                          ) : (
                            dominantClusters.map((cluster) => (
                              <div
                                key={cluster.kmeans_cluster_id}
                                onClick={() => handleDominantTopicToggle(cluster.kmeans_cluster_id)}
                                className={`p-3 cursor-pointer hover:bg-pink-600/20 flex items-center justify-between transition-all ${
                                  selectedDominantTopics.includes(cluster.kmeans_cluster_id) ? 'bg-pink-600/30' : ''
                                }`}
                                tabIndex={0}
                                role="option"
                                aria-selected={selectedDominantTopics.includes(cluster.kmeans_cluster_id)}
                              >
                                <span className="text-gray-200 text-sm">{cluster.dominant_cluster_label}</span>
                                {selectedDominantTopics.includes(cluster.kmeans_cluster_id) && (
                                  <div className="w-4 h-4 rounded-full bg-pink-500 flex items-center justify-center">
                                    <span className="text-white text-xs">✓</span>
                                  </div>
                                )}
                              </div>
                            ))
                          )}
                        </div>
                      )}
                    </div>
                    {/* Subtopics Filter */}
                    <div className="relative min-w-[220px]" ref={subtopicDropdownRef}>
                      <label className="text-sm font-semibold text-gray-200 mb-1 block">Subtopics</label>
                      <button
                        aria-label="Select subtopics"
                        onClick={() => setSubtopicDropdownOpen(!subtopicDropdownOpen)}
                        disabled={selectedDominantTopics.length === 0}
                        className="w-full bg-gray-800 text-white rounded-lg p-3 border border-gray-600 flex items-center justify-between hover:bg-gray-700 focus:ring-2 focus:ring-purple-500 focus:outline-none transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        <span className="text-sm">
                          {selectedSubtopics.length > 0 
                            ? `${selectedSubtopics.length} subtopic${selectedSubtopics.length > 1 ? 's' : ''} selected`
                            : selectedDominantTopics.length === 0 
                              ? 'Select dominant topics first...'
                              : 'Select multiple subtopics...'}
                        </span>
                        <ChevronDown className={`w-4 h-4 transition-transform ${subtopicDropdownOpen ? 'rotate-180' : ''}`} />
                      </button>
                      {subtopicDropdownOpen && selectedDominantTopics.length > 0 && (
                        <div className="absolute z-50 w-64 mt-1 bg-gray-800 border border-gray-600 rounded-lg shadow-xl max-h-60 overflow-y-auto animate-fade-in">
                          {subclusters
                            .filter(sub => selectedDominantTopics.includes(sub.kmeans_cluster_id))
                            .map((subcluster) => (
                              <div
                                key={subcluster.subcluster_id}
                                onClick={() => handleSubtopicToggle(subcluster.subcluster_id)}
                                className={`p-3 cursor-pointer hover:bg-purple-600/20 flex items-center justify-between transition-all ${
                                  selectedSubtopics.includes(subcluster.subcluster_id) ? 'bg-purple-600/30' : ''
                                }`}
                                tabIndex={0}
                                role="option"
                                aria-selected={selectedSubtopics.includes(subcluster.subcluster_id)}
                              >
                                <span className="text-gray-200 text-sm">{subcluster.subcluster_label}</span>
                                {selectedSubtopics.includes(subcluster.subcluster_id) && (
                                  <div className="w-4 h-4 rounded-full bg-purple-500 flex items-center justify-center">
                                    <span className="text-white text-xs">✓</span>
                                  </div>
                                )}
                              </div>
                            ))}
                        </div>
                      )}
                    </div>
                  {/* Message Type Filter */}
                  <div className="relative min-w-[220px]" ref={messageTypeDropdownRef}>
                    <label className="text-sm font-semibold text-gray-200 mb-1 block">Message Type</label>
                    <button
                      aria-label="Select message type"
                      onClick={() => setMessageTypeDropdownOpen(!messageTypeDropdownOpen)}
                      className="w-full bg-gray-800 text-white rounded-lg p-3 border border-gray-600 flex items-center justify-between hover:bg-gray-700 focus:ring-2 focus:ring-blue-500 focus:outline-none transition-all"
                    >
                      <span className="text-sm">
                        {messageTypes.find(type => type.id === selectedMessageType)?.label || 'All Messages'}
                      </span>
                      <ChevronDown className={`w-4 h-4 transition-transform ${messageTypeDropdownOpen ? 'rotate-180' : ''}`} />
                    </button>
                    {messageTypeDropdownOpen && (
                      <div className="absolute z-50 w-64 mt-1 bg-gray-800 border border-gray-600 rounded-lg shadow-xl max-h-60 overflow-y-auto animate-fade-in">
                        {messageTypes.map((type) => {
                          const IconComponent = type.icon;
                          return (
                            <div
                              key={type.id}
                              onClick={() => handleMessageTypeChange(type.id)}
                              className={`p-3 cursor-pointer hover:bg-blue-600/20 flex items-center gap-3 transition-all ${
                                selectedMessageType === type.id ? 'bg-blue-600/30' : ''
                              }`}
                              tabIndex={0}
                              role="option"
                              aria-selected={selectedMessageType === type.id}
                            >
                              <IconComponent className="w-4 h-4 text-gray-300" />
                              <span className="text-gray-200 text-sm">{type.label}</span>
                              {selectedMessageType === type.id && (
                                <div className="w-4 h-4 rounded-full bg-blue-500 flex items-center justify-center ml-auto">
                                  <span className="text-white text-xs">✓</span>
                                </div>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>
                  
                  {/* Clear Filters Button */}
                  <div className="flex-1 flex items-end justify-end">
                    <button
                      onClick={clearAllFilters}
                      className="bg-red-600 text-white rounded-lg p-3 hover:bg-red-700 text-sm focus:ring-2 focus:ring-red-400 focus:outline-none transition-all"
                    >
                      Clear Filters
                    </button>
                  </div>
                  </div>
                  
                  {/* Active Filters Summary Chips */}
                  {(selectedDominantTopics.length > 0 || selectedSubtopics.length > 0 || selectedMessageType !== "all") && (
                    <div className="flex flex-wrap gap-2 mb-4">
                      {selectedDominantTopics.map((clusterId) => {
                        const cluster = dominantClusters.find(c => c.kmeans_cluster_id === clusterId);
                        return (
                          <span
                            key={clusterId}
                            className="bg-pink-600 text-white px-3 py-1 rounded-full text-xs flex items-center gap-1 shadow-sm animate-fade-in"
                          >
                            {cluster?.dominant_cluster_label || `Cluster ${clusterId}`}
                            <X 
                              className="w-3 h-3 cursor-pointer" 
                              onClick={() => handleDominantTopicToggle(clusterId)}
                              aria-label={`Remove filter ${cluster?.dominant_cluster_label}`}
                            />
                          </span>
                        );
                      })}
                      {selectedSubtopics.map((subtopicId) => {
                        const subtopic = subclusters.find(s => s.subcluster_id === subtopicId);
                        return (
                          <span
                            key={subtopicId}
                            className="bg-purple-600 text-white px-3 py-1 rounded-full text-xs flex items-center gap-1 shadow-sm animate-fade-in"
                          >
                            {subtopic?.subcluster_label || `Subtopic ${subtopicId}`}
                            <X 
                              className="w-3 h-3 cursor-pointer" 
                              onClick={() => handleSubtopicToggle(subtopicId)}
                              aria-label={`Remove filter ${subtopic?.subcluster_label}`}
                            />
                          </span>
                        );
                      })}
                      {selectedMessageType !== "all" && (
                        <span className="bg-blue-600 text-white px-3 py-1 rounded-full text-xs flex items-center gap-1 shadow-sm animate-fade-in">
                          {messageTypes.find(type => type.id === selectedMessageType)?.label || selectedMessageType}
                          <X 
                            className="w-3 h-3 cursor-pointer" 
                            onClick={() => handleMessageTypeChange("all")}
                            aria-label={`Remove message type filter`}
                          />
                        </span>
                      )}
                    </div>
                  )}
                  <hr className="border-gray-700 mb-4" />

                  {/* Main Content */}
                  <div className="flex-1 flex flex-col">
                    {/* Toolbar */}
                    <div className="bg-gray-800 bg-opacity-80 border-b border-gray-700 p-4 flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <div className="relative">
                          <Search className="w-5 h-5 text-gray-400 absolute left-3 top-1/2 transform -translate-y-1/2" />
                          <input
                            type="text"
                            placeholder="Search emails..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="pl-10 pr-4 py-2 bg-gray-700 text-gray-200 border border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-500 text-sm"
                          />
                        </div>
                      </div>
                      <div className="text-sm text-gray-300">
                        Showing {pagination.page_document_count} of {pagination.total_documents} emails
                      </div>
                    </div>

                    {/* Content Area */}
                    <div className="flex-1 flex overflow-hidden">
                      {/* Email List */}
                      <div className="w-full bg-gray-800 bg-opacity-50 overflow-y-auto">
                        {loadingDocuments ? (
                          <div className="p-4 text-center text-gray-300">
                            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-pink-500 mx-auto mb-2"></div>
                            Loading emails...
                          </div>
                        ) : emails.length === 0 && !loadingDocuments ? (
                          <div className="p-4 text-center text-gray-300">
                            No emails match the selected criteria. Try adjusting your filters.
                          </div>
                        ) : (
                          <>
                            {emails.map((email) => (
                              <div key={email._id.$oid} className="flex">
                                {/* Email List Item */}
                                <div
                                  onClick={() => handleEmailClick(email)}
                                  className={`p-4 border-b border-gray-700 hover:bg-gray-700 cursor-pointer flex-1 ${
                                    selectedEmail?._id.$oid === email._id.$oid ? 'bg-gray-700' : ''
                                  }`}
                                >
                                  <div className="flex items-center justify-between">
                                    <div className="flex-1">
                                      <div className="font-medium text-white text-base mb-1 flex items-center gap-2">
                                        {email.thread.subject_norm || 'No Subject'}
                                        {email.thread.message_count > 1 && (
                                          <span className="bg-blue-600 text-white text-xs px-2 py-1 rounded-full flex items-center gap-1 animate-fade-in">
                                            <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                                              <path fillRule="evenodd" d="M18 10c0 3.866-3.582 7-8 7a8.841 8.841 0 01-4.083-.98L2 17l1.338-3.123C2.493 12.767 2 11.434 2 10c0-3.866 3.582-7 8-7s8 3.134 8 7zM7 9H5v2h2V9zm8 0h-2v2h2V9zM9 9h2v2H9V9z" clipRule="evenodd" />
                                            </svg>
                                            {email.thread.message_count}
                                          </span>
                                        )}
                                      </div>
                                      <div className="text-sm text-gray-300 flex items-center gap-2">
                                        {email.thread.participants.find(p => p.type === 'from')?.name || 'Unknown Sender'}
                                        {email.thread.message_count === 1 && (
                                          <span className="bg-gray-600 text-gray-200 text-xs px-2 py-1 rounded-full animate-fade-in">
                                            Single Email
                                          </span>
                                        )}
                                      </div>
                                    </div>
                                    <div className="flex items-center gap-2">
                                      {email.urgency && (
                                        <span className="px-2 py-1 bg-red-600 text-white text-xs rounded-full">
                                          Urgent
                                        </span>
                                      )}
                                    </div>
                                  </div>
                                </div>
                                
                                {/* Email Details - appears right next to selected item */}
                                {selectedEmail?._id.$oid === email._id.$oid && (
                                  <div data-email-details className="w-2/3 bg-gray-800 bg-opacity-80 border-l border-gray-700 p-6">
                                    <div className="flex justify-between items-center mb-4">
                                      <h2 className="text-xl font-semibold text-white">{selectedEmail.thread.subject_norm || 'No Subject'}</h2>
                                      <button
                                        onClick={() => setSelectedEmail(null)}
                                        className="p-1 hover:bg-gray-700 rounded-full"
                                      >
                                        <X className="w-5 h-5 text-gray-300" />
                                      </button>
                                    </div>
                                    <div className="border-b border-gray-600 pb-4 mb-4">
                                      <div className="text-sm text-gray-300">From: {selectedEmail.thread.participants.find(p => p.type === 'from')?.name || 'N/A'}</div>
                                      <div className="text-sm text-gray-300">To: {selectedEmail.thread.participants.filter(p => p.type === 'to').map(p => p.name).join(', ') || 'N/A'}</div>
                                      <div className="text-sm text-gray-300">Date: {selectedEmail.thread.first_message_at || 'N/A'}</div>
                                    </div>
                                    <div className="space-y-6">
                                      <div>
                                        <label className="text-sm font-medium text-gray-300 mb-3 block">
                                          Email Thread ({selectedEmail.thread.message_count} message{selectedEmail.thread.message_count > 1 ? 's' : ''})
                                        </label>
                                        <div className="max-h-80 overflow-y-auto space-y-4">
                                          {selectedEmail.messages.map((message, index) => (
                                            <div key={index} className="relative">
                                              {/* Message Header */}
                                              <div className="flex items-center justify-between mb-2">
                                                <div className="flex items-center gap-3">
                                                  <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white text-sm font-semibold">
                                                    {message.headers.from[0]?.name?.charAt(0) || '?'}
                                                  </div>
                                                  <div>
                                                    <div className="text-white font-medium text-sm">
                                                      {message.headers.from[0]?.name || 'Unknown Sender'}
                                                    </div>
                                                    <div className="text-gray-400 text-xs">
                                                      {new Date(message.headers.date).toLocaleString()}
                                                    </div>
                                                  </div>
                                                </div>
                                                {index === 0 && (
                                                  <span className="bg-green-600 text-white text-xs px-2 py-1 rounded-full">
                                                    Original
                                                  </span>
                                                )}
                                              </div>
                                              
                                              {/* Message Content */}
                                              <div className="ml-11 p-4 bg-gray-900 rounded-lg border-l-4 border-blue-500">
                                                <div className="text-gray-200 whitespace-pre-wrap text-sm leading-relaxed">
                                                  {message.body.text.plain || 'No content available'}
                                                </div>
                                              </div>
                                              
                                              {/* Follow-up Arrow */}
                                              {index < selectedEmail.messages.length - 1 && (
                                                <div className="flex justify-center my-3">
                                                  <div className="flex items-center gap-2 text-gray-400">
                                                    <div className="w-6 h-6 border-2 border-gray-400 rounded-full flex items-center justify-center">
                                                      <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                                                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-8.707l-3-3a1 1 0 00-1.414 1.414L10.586 9H7a1 1 0 100 2h3.586l-1.293 1.293a1 1 0 101.414 1.414l3-3a1 1 0 000-1.414z" clipRule="evenodd" />
                                                      </svg>
                                                    </div>
                                                    <span className="text-xs font-medium">Follow-up</span>
                                                  </div>
                                                </div>
                                              )}
                                            </div>
                                          ))}
                                        </div>
                                      </div>
                                      <div className="grid grid-cols-2 gap-4">
                                        <div>
                                          <label className="text-sm font-medium text-gray-300">Dominant Cluster Label</label>
                                          <div className="mt-1 text-pink-400 font-medium">{selectedEmail.dominant_cluster_label || 'N/A'}</div>
                                        </div>
                                        <div>
                                          <label className="text-sm font-medium text-gray-300">Subcluster Label</label>
                                          <div className="mt-1 text-purple-400 font-medium">{selectedEmail.subcluster_label || 'N/A'}</div>
                                        </div>
                                      </div>
                                      <div className="grid grid-cols-2 gap-4">
                                        <div>
                                          <label className="text-sm font-medium text-gray-300">Dominant Topic</label>
                                          <div className="mt-1 text-gray-200">{selectedEmail.dominant_topic || 'N/A'}</div>
                                        </div>
                                        <div>
                                          <label className="text-sm font-medium text-gray-300">Subtopics</label>
                                          <div className="mt-1 text-gray-200">{selectedEmail.subtopics || 'N/A'}</div>
                                        </div>
                                      </div>
                                      <div className="grid grid-cols-2 gap-4">
                                        <div>
                                          <label className="text-sm font-medium text-gray-300">Resolution Status</label>
                                          <div className="mt-1 text-gray-200">{selectedEmail.resolution_status || 'N/A'}</div>
                                        </div>
                                        <div>
                                          <label className="text-sm font-medium text-gray-300">Overall Sentiment</label>
                                          <div className="mt-1 text-gray-200">{selectedEmail.overall_sentiment || 'N/A'}</div>
                                        </div>
                                      </div>
                                    </div>
                                  </div>
                                )}
                              </div>
                            ))}
                            {pagination.total_pages > 1 && (
                              <div className="p-4 flex justify-between items-center bg-gray-800 bg-opacity-80 border-t border-gray-700">
                                <button
                                  onClick={handlePreviousPage}
                                  disabled={!pagination.has_previous}
                                  className="flex items-center gap-2 px-3 py-1 bg-gray-700 text-white rounded-lg hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                  <ChevronLeft className="w-4 h-4" />
                                  Previous
                                </button>
                                <div className="text-sm text-gray-300">
                                  Page {pagination.current_page} of {pagination.total_pages} • Showing {pagination.page_document_count} of {pagination.total_documents} emails
                                </div>
                                <button
                                  onClick={handleNextPage}
                                  disabled={!pagination.has_next}
                                  className="flex items-center gap-2 px-3 py-1 bg-gray-700 text-white rounded-lg hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                  Next
                                  <ChevronRight className="w-4 h-4" />
                                </button>
                              </div>
                            )}
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                </>
              )}


                  {/* Show message for other channels (excluding "email") */}
                  {selectedChannel !== "email" && (
                    <div className="text-center py-16">
                      <div className="w-24 h-24 bg-gradient-to-br from-purple-500/20 to-pink-500/20 rounded-full flex items-center justify-center mx-auto mb-6">
                        <TrendingUp className="w-12 h-12 text-purple-400" />
                      </div>
                      <h3 className="text-2xl font-semibold text-white mb-4">
                        {channels.find(c => c.id === selectedChannel)?.label} Analysis
                      </h3>
                      <p className="text-gray-300 max-w-md mx-auto">
                        {selectedChannel === "chat" && "Chat topic analysis will be available soon with advanced conversation insights."}
                        {selectedChannel === "ticket" && "Support ticket analysis will be available soon with resolution tracking."}
                        {selectedChannel === "social" && "Social media sentiment analysis will be available soon with engagement metrics."}
                        {selectedChannel === "voice" && "Voice transcript analysis will be available soon with call insights."}
                      </p>
                    </div>
                  )}
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
