'use client';

import { useState, useEffect, useCallback, useMemo, Fragment } from 'react';
import {
  getTrustpilotDashboard,
  getTrustpilotEnhancedDashboard,
  TrustpilotDashboardData,
  TrustpilotEnhancedDashboardData,
  TrustpilotFilters,
  TrustpilotCluster,
  TrustpilotReview,
} from '@/lib/api';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Tooltip as UITooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import {
  RefreshCw,
  AlertTriangle,
  TrendingDown,
  TrendingUp,
  Users,
  Zap,
  X,
  Play,
  MessageSquare,
  ThumbsUp,
  ShoppingBag,
  Smartphone,
  Grid3x3,
  Filter,
  BarChart3,
  Sparkles,
  ChevronDown,
  Minus,
  Eye,
  CheckCircle,
  Shield,
  Target,
  Activity,
  ArrowRight,
  Search,
  ChevronRight,
  Briefcase,
  Calendar,
  User,
  Flag,
  Info,
  Heart,
} from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend, LineChart, Line, ReferenceLine, ScatterChart, Scatter, Cell, PieChart, Pie, AreaChart, Area, ComposedChart, LabelList } from 'recharts';
import { TrustpilotDashboard } from './trustpilot/TrustpilotDashboard';
import XDashboard from './x/page';
import RedditDashboard from './reddit/page';
import AppStoreDashboard from './appstore/page';
import PlayStoreDashboard from './playstore/page';

type Channel = 'all' | 'trustpilot' | 'x' | 'reddit' | 'appstore' | 'playstore';
type DisplayChannel = Exclude<Channel, 'all'>;

export default function SocialMediaDashboard() {
  // Data states
  const [trustpilotData, setTrustpilotData] = useState<TrustpilotDashboardData | null>(null);
  const [trustpilotEnhancedData, setTrustpilotEnhancedData] = useState<TrustpilotEnhancedDashboardData | null>(null);
  const [channelData, setChannelData] = useState<Record<Channel, any>>({
    all: null,
    trustpilot: null,
    x: null,
    reddit: null,
    appstore: null,
    playstore: null,
  });
  
  // Trustpilot filters state
  const [trustpilotFilters, setTrustpilotFilters] = useState<TrustpilotFilters>({
    dateRange: { start: '', end: '' },
    ratingStars: [],
    sentiment: [],
    urgency: [],
    cluster: [],
  });

  // Enhanced Trustpilot Dashboard State
  const [selectedCluster, setSelectedCluster] = useState<TrustpilotCluster | null>(null);
  const [selectedSubcluster, setSelectedSubcluster] = useState<string | null>(null);
  const [selectedReviews, setSelectedReviews] = useState<TrustpilotReview[]>([]);
  const [reviewFilters, setReviewFilters] = useState<{
    urgency: string[];
    priority: string[];
    resolution_status: string[];
    sentiment: string[];
    searchQuery: string;
  }>({
    urgency: [],
    priority: [],
    resolution_status: [],
    sentiment: [],
    searchQuery: '',
  });
  const [reviewSortBy, setReviewSortBy] = useState<'recency' | 'urgency' | 'sentiment' | 'influence'>('urgency');

  // Filter and sort reviews - moved to top level to comply with Rules of Hooks
  const filteredAndSortedReviews = useMemo(() => {
    if (!trustpilotEnhancedData) return [];
    
    let reviews = [...trustpilotEnhancedData.reviews];
    
    // Apply filters
    if (reviewFilters.urgency.length > 0) {
      reviews = reviews.filter(r => reviewFilters.urgency.includes(r.metadata.urgency));
    }
    if (reviewFilters.priority.length > 0) {
      reviews = reviews.filter(r => reviewFilters.priority.includes(r.metadata.priority));
    }
    if (reviewFilters.resolution_status.length > 0) {
      reviews = reviews.filter(r => reviewFilters.resolution_status.includes(r.metadata.resolution_status));
    }
    if (reviewFilters.sentiment.length > 0) {
      reviews = reviews.filter(r => reviewFilters.sentiment.includes(r.metadata.overall_sentiment));
    }
    if (reviewFilters.searchQuery) {
      const query = reviewFilters.searchQuery.toLowerCase();
      reviews = reviews.filter(r => 
        r.text.toLowerCase().includes(query) || 
        r.metadata.summary.toLowerCase().includes(query) ||
        r.reviewer.name.toLowerCase().includes(query)
      );
    }
    
    // Apply sorting
    reviews.sort((a, b) => {
      switch (reviewSortBy) {
        case 'urgency':
          const urgencyOrder = { 'CRITICAL': 4, 'HIGH': 3, 'MEDIUM': 2, 'LOW': 1 };
          return (urgencyOrder[b.metadata.urgency] || 0) - (urgencyOrder[a.metadata.urgency] || 0);
        case 'recency':
          return new Date(b.posted_date).getTime() - new Date(a.posted_date).getTime();
        case 'sentiment':
          const sentimentOrder = { 'NEGATIVE': 4, 'MIXED': 3, 'NEUTRAL': 2, 'POSITIVE': 1 };
          return (sentimentOrder[b.metadata.overall_sentiment] || 0) - (sentimentOrder[a.metadata.overall_sentiment] || 0);
        case 'influence':
          const aInfluence = a.reviewer.is_influencer ? (a.reviewer.influencer_reach || 0) : 0;
          const bInfluence = b.reviewer.is_influencer ? (b.reviewer.influencer_reach || 0) : 0;
          return bInfluence - aInfluence;
        default:
          return 0;
      }
    });
    
    return reviews;
  }, [trustpilotEnhancedData, reviewFilters, reviewSortBy]);

  // Get reviews for selected cluster/subcluster - moved to top level
  const getReviewsForSelection = useCallback(() => {
    if (!trustpilotEnhancedData) return [];
    if (selectedSubcluster) {
      return trustpilotEnhancedData.reviews.filter(r => r.subcluster_id === selectedSubcluster);
    }
    if (selectedCluster) {
      return trustpilotEnhancedData.reviews.filter(r => r.cluster_id === selectedCluster.cluster_id);
    }
    return filteredAndSortedReviews;
  }, [trustpilotEnhancedData, selectedCluster, selectedSubcluster, filteredAndSortedReviews]);

  // UI states
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<Channel>('all');
  const [dateFilterPreset, setDateFilterPreset] = useState<string>('One Month');
  const [dateRange, setDateRange] = useState<{ start: string; end: string }>({ start: '', end: '' });
  
  // Track selected sentiment point for each channel independently
  const [selectedSentimentPoints, setSelectedSentimentPoints] = useState<
    Partial<Record<Channel, { date: string; sentimentLevel: number }>>
  >({});
  // Track expanded review in explorer
  const [expandedReviewId, setExpandedReviewId] = useState<string | null>(null);

  // Calculate date range based on preset
  const calculateDateRange = useCallback((preset: string) => {
    const today = new Date();
    const endDate = new Date(today);
    endDate.setHours(23, 59, 59, 999);
    
    let startDate = new Date(today);
    
    switch (preset) {
      case 'All':
        return { start: '', end: '' };
      case 'Current day':
        startDate.setHours(0, 0, 0, 0);
        break;
      case 'One Week':
        startDate.setDate(today.getDate() - 7);
        startDate.setHours(0, 0, 0, 0);
        break;
      case 'One Month':
        startDate.setMonth(today.getMonth() - 1);
        startDate.setHours(0, 0, 0, 0);
        break;
      case '6 Months':
        startDate.setMonth(today.getMonth() - 6);
        startDate.setHours(0, 0, 0, 0);
        break;
      case 'Custom':
        return dateRange;
      default:
        startDate.setMonth(today.getMonth() - 1);
        startDate.setHours(0, 0, 0, 0);
    }
    
    const formatDate = (date: Date) => {
      const year = date.getFullYear();
      const month = String(date.getMonth() + 1).padStart(2, '0');
      const day = String(date.getDate()).padStart(2, '0');
      return `${year}-${month}-${day}`;
    };
    
    return {
      start: formatDate(startDate),
      end: formatDate(endDate)
    };
  }, [dateRange]);

  // Handle preset change
  const handlePresetChange = useCallback((preset: string) => {
    setDateFilterPreset(preset);
    if (preset !== 'Custom') {
      const newDateRange = calculateDateRange(preset);
      setDateRange(newDateRange);
    }
  }, [calculateDateRange]);

  // Initialize date range on mount
  useEffect(() => {
    if (dateFilterPreset !== 'Custom') {
      const newDateRange = calculateDateRange(dateFilterPreset);
      setDateRange(newDateRange);
    }
  }, []); // Only run on mount

  // Load initial data
  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = useCallback(async () => {
    setIsLoading(true);
    try {
      // Load Trustpilot data when viewing Trustpilot tab or aggregated "All" tab
      if (activeTab === 'trustpilot' || activeTab === 'all') {
        const tpData = await getTrustpilotDashboard(trustpilotFilters);
        setTrustpilotData(tpData);
        // Also load enhanced dashboard data
        const enhancedData = await getTrustpilotEnhancedDashboard(trustpilotFilters);
        setTrustpilotEnhancedData(enhancedData);
      }
      
      // Load channel-specific data (placeholder for now)
      setChannelData({
        all: null,
        trustpilot: { message: 'Trustpilot data loading...' },
        x: { message: 'X (Twitter) data loading...' },
        reddit: { message: 'Reddit data loading...' },
        appstore: { message: 'App Store data loading...' },
        playstore: { message: 'Play Store data loading...' },
      });
    } catch (error) {
      console.error('Error loading dashboard data:', error);
    } finally {
      setIsLoading(false);
    }
  }, [activeTab, trustpilotFilters]);

  // Load Trustpilot data when tab changes
  useEffect(() => {
    if (activeTab === 'trustpilot') {
      loadDashboardData();
    }
  }, [activeTab, loadDashboardData]);

  const getChannelIcon = (channel: Channel) => {
    switch (channel) {
      case 'all':
        return <Grid3x3 className="h-4 w-4" />;
      case 'trustpilot':
        // Trustpilot logo - Star with T
        return (
          <svg className="h-4 w-4" viewBox="0 0 24 24" fill="currentColor">
            <path d="M12 0l3.09 6.26L22 7.27l-5 4.87 1.18 6.88L12 17.77l-6.18 1.25L7 12.14 2 7.27l6.91-1.01L12 0z"/>
          </svg>
        );
      case 'x':
        // X (Twitter) logo
        return (
          <svg className="h-4 w-4" viewBox="0 0 24 24" fill="currentColor">
            <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
          </svg>
        );
      case 'reddit':
        // Reddit logo - Snoo head
        return (
          <svg className="h-4 w-4" viewBox="0 0 24 24" fill="currentColor">
            <path d="M12 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0zm5.01 4.744c.688 0 1.25.561 1.25 1.249a1.25 1.25 0 0 1-2.498.056l-2.597-.547-.8 3.747c1.824.07 3.48.632 4.674 1.488.308-.309.73-.491 1.207-.491.968 0 1.754.786 1.754 1.754 0 .716-.435 1.333-1.01 1.614a3.111 3.111 0 0 1 .042.52c0 2.694-3.13 4.87-7.004 4.87-3.874 0-7.004-2.176-7.004-4.87 0-.183.015-.366.043-.534A1.748 1.748 0 0 1 4.028 12c0-.968.786-1.754 1.754-1.754.463 0 .898.196 1.207.49 1.207-.883 2.878-1.43 4.744-1.487l.885-4.182a.342.342 0 0 1 .14-.197.35.35 0 0 1 .238-.042l2.906.617a1.214 1.214 0 0 1 1.108-.701zM9.25 12C8.561 12 8 12.562 8 13.25c0 .687.561 1.248 1.25 1.248.687 0 1.248-.561 1.248-1.249 0-.688-.561-1.249-1.249-1.249zm5.5 0c-.687 0-1.248.561-1.248 1.25 0 .687.561 1.248 1.249 1.248.688 0 1.249-.561 1.249-1.249 0-.687-.562-1.249-1.25-1.249zm-5.466 3.99a.327.327 0 0 0-.231.094.33.33 0 0 0 0 .463c.842.842 2.484.913 2.961.913.477 0 2.105-.056 2.961-.913a.361.361 0 0 0 .029-.463.33.33 0 0 0-.463 0c-.547.533-1.684.73-2.512.73-.828 0-1.979-.196-2.512-.73a.326.326 0 0 0-.232-.095z"/>
          </svg>
        );
      case 'appstore':
        // Apple App Store logo
        return (
          <svg className="h-4 w-4" viewBox="0 0 24 24" fill="currentColor">
            <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.11-2.51 1.28-.02 2.5.87 3.29.87.79 0 2.26-1.07 3.81-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M13 3.5c.73-.83 1.94-1.46 2.94-1.5.13 1.17-.34 2.35-1.04 3.19-.69.85-1.83 1.51-2.95 1.42-.15-1.15.41-2.35 1.05-3.11z"/>
          </svg>
        );
      case 'playstore':
        // Google Play Store logo
        return (
          <svg className="h-4 w-4" viewBox="0 0 24 24" fill="currentColor">
            <path d="M3.609 1.814L13.792 12L3.609 22.186a.996.996 0 01-.61-.92V2.734a1 1 0 01.61-.92zm10.89 10.893l2.302 2.302-10.937 6.333 8.635-8.635zm3.199-3.198l2.807 1.626a1 1 0 010 1.73l-2.808 1.626L13.5 12l4.198-2.491zM5.864 2.658L16.802 8.99l-2.302 2.302-8.636-8.634z"/>
          </svg>
        );
      default:
        return null;
    }
  };

  const getChannelName = (channel: Channel) => {
    switch (channel) {
      case 'all':
        return 'All';
      case 'trustpilot':
        return 'Trustpilot';
      case 'x':
        return 'X (Twitter)';
      case 'reddit':
        return 'Reddit';
      case 'appstore':
        return 'App Store';
      case 'playstore':
        return 'Play Store';
      default:
        return '';
    }
  };

  // Function to render sentiment chart - works for all channels
  const renderSentimentChart = (
    trendData: Array<{ date: string; sentiment: number; reviewVolume: number }>,
    channel: Channel
  ) => {
    const selectedSentimentPoint = selectedSentimentPoints[channel] ?? null;
    // Map sentiment (-1 to 1) to sentiment level (1-5, where 1=calm, 5=frustrated)
    const mapSentimentToLevel = (sentiment: number): number => {
      if (sentiment <= -0.6) return 5; // Very frustrated
      if (sentiment <= -0.2) return 4; // Frustrated
      if (sentiment <= 0.2) return 3; // Neutral
      if (sentiment <= 0.6) return 2; // Satisfied
      return 1; // Calm/Positive
    };

    // Bank-related topics
    const bankTopics = [
      'Excellent Call Support',
      'Payment Processing Failure',
      'Mobile App Crashes',
      'Service Information Request',
      'Digital Innovation Appreciation',
      'System Outage Frustration',
      'Trade Finance Satisfaction',
      'Account Access Problems',
      'Fee Structure Criticism',
    ];

    const sentimentLevels = [1, 2, 3, 4, 5];
    const sentimentLevelLabels = ['Calm', 'Satisfied', 'Neutral', 'Frustrated', 'Very Frustrated'];
    const defaultChannels: Channel[] = ['trustpilot', 'x', 'reddit', 'appstore', 'playstore'];
    const topicChannelConfig: Record<string, Channel[]> = {
      'Excellent Call Support': ['trustpilot', 'x'],
      'Digital Innovation Appreciation': ['trustpilot', 'appstore'],
      'Trade Finance Satisfaction': ['trustpilot'],
      'Payment Processing Failure': ['trustpilot', 'x', 'reddit'],
      'Mobile App Crashes': ['appstore', 'playstore', 'x'],
      'Service Information Request': ['trustpilot', 'x'],
      'System Outage Frustration': ['x', 'reddit'],
      'Account Access Problems': ['trustpilot', 'x', 'reddit'],
      'Fee Structure Criticism': ['trustpilot', 'reddit'],
    };
    const sentimentLevelMeta = sentimentLevels.map((level, index) => ({
      level,
      label: `Level ${level}: ${sentimentLevelLabels[index]}`,
      short: sentimentLevelLabels[index],
      color: ['#22c55e', '#3b82f6', '#9ca3af', '#f59e0b', '#ef4444'][index],
    }));
    const sentimentDetailStyles: Record<number, {
      panel: string;
      label: string;
      value: string;
      topic: string;
      channel: string;
      posts: string;
    }> = {
      1: {
        panel: 'border-emerald-500/40 bg-emerald-500/10',
        label: 'text-emerald-300',
        value: 'text-emerald-200',
        topic: 'border-emerald-500/30 bg-emerald-500/5',
        channel: 'border-emerald-500/40 bg-emerald-500/10 text-emerald-200',
        posts: 'bg-emerald-500/20 text-emerald-200',
      },
      2: {
        panel: 'border-sky-500/40 bg-sky-500/10',
        label: 'text-sky-300',
        value: 'text-sky-200',
        topic: 'border-sky-500/30 bg-sky-500/5',
        channel: 'border-sky-500/40 bg-sky-500/10 text-sky-200',
        posts: 'bg-sky-500/20 text-sky-200',
      },
      3: {
        panel: 'border-slate-500/40 bg-slate-500/10',
        label: 'text-slate-300',
        value: 'text-slate-200',
        topic: 'border-slate-500/30 bg-slate-500/5',
        channel: 'border-slate-500/40 bg-slate-500/10 text-slate-200',
        posts: 'bg-slate-500/20 text-slate-200',
      },
      4: {
        panel: 'border-amber-500/40 bg-amber-500/10',
        label: 'text-amber-300',
        value: 'text-amber-200',
        topic: 'border-amber-500/30 bg-amber-500/5',
        channel: 'border-amber-500/40 bg-amber-500/10 text-amber-200',
        posts: 'bg-amber-500/20 text-amber-200',
      },
      5: {
        panel: 'border-red-500/40 bg-red-500/10',
        label: 'text-red-300',
        value: 'text-red-200',
        topic: 'border-red-500/30 bg-red-500/5',
        channel: 'border-red-500/40 bg-red-500/10 text-red-200',
        posts: 'bg-red-500/20 text-red-200',
      },
    };

    // Create time-based data structure: for each day, simulate daily social media posts
    const seededRandom = (seed: number, min: number, max: number) => {
      const x = Math.sin(seed) * 10000;
      return Math.floor((x - Math.floor(x)) * (max - min + 1)) + min;
    };
    const seededChance = (seed: number) => {
      const x = Math.sin(seed) * 10000;
      return x - Math.floor(x);
    };
    
    // Define channels for sentiment chart
    const sentimentChannels: Channel[] = ['x', 'reddit', 'appstore', 'playstore'];
    
    const timeBasedSentimentData = trendData.map((trend, index) => {
      const date = trend.date;
      const baseSentiment = trend.sentiment;
      
      // Create daily variation
      const dayVariation = Math.sin(index * 0.5) * 0.3;
      const dailySentiment = baseSentiment + dayVariation;
      const dateSeed = index * 1000 + date.length;
      
      // Create topic distribution for each sentiment level
      const topicsBySentiment: Record<number, Array<{ topic: string; volume: number; postCount: number; channels?: Channel[] }>> = {
        1: [], 2: [], 3: [], 4: [], 5: []
      };

      // Level 1 (Calm)
      const calmBasePosts = dailySentiment > 0.2 
        ? Math.round(40 + seededRandom(dateSeed + 1, 0, 60) + (dailySentiment * 40))
        : Math.round(15 + seededRandom(dateSeed + 1, 0, 25));
      
      if (calmBasePosts > 20) {
        topicsBySentiment[1].push({ 
          topic: 'Excellent Call Support', 
          volume: Math.round(calmBasePosts * 0.4),
          postCount: Math.round(calmBasePosts * 0.3),
          channels: topicChannelConfig['Excellent Call Support'] ?? defaultChannels,
        });
        topicsBySentiment[1].push({ 
          topic: 'Digital Innovation Appreciation', 
          volume: Math.round(calmBasePosts * 0.35),
          postCount: Math.round(calmBasePosts * 0.25),
          channels: topicChannelConfig['Digital Innovation Appreciation'] ?? defaultChannels,
        });
        topicsBySentiment[1].push({ 
          topic: 'Trade Finance Satisfaction', 
          volume: Math.round(calmBasePosts * 0.25),
          postCount: Math.round(calmBasePosts * 0.2),
          channels: topicChannelConfig['Trade Finance Satisfaction'] ?? defaultChannels,
        });
      } else {
        topicsBySentiment[1].push({ 
          topic: 'Excellent Call Support', 
          volume: calmBasePosts,
          postCount: Math.round(calmBasePosts * 0.7),
          channels: topicChannelConfig['Excellent Call Support'] ?? defaultChannels,
        });
      }

      // Level 2 (Satisfied)
      const satisfiedPosts = Math.round(30 + seededRandom(dateSeed + 2, 0, 40) + (Math.max(0, dailySentiment) * 30));
      topicsBySentiment[2].push({ 
        topic: 'Service Information Request', 
        volume: Math.round(satisfiedPosts * 0.5),
        postCount: Math.round(satisfiedPosts * 0.4),
        channels: topicChannelConfig['Service Information Request'] ?? defaultChannels,
      });
      topicsBySentiment[2].push({ 
        topic: 'Trade Finance Satisfaction', 
        volume: Math.round(satisfiedPosts * 0.5),
        postCount: Math.round(satisfiedPosts * 0.35),
        channels: topicChannelConfig['Trade Finance Satisfaction'] ?? defaultChannels,
      });

      // Level 3 (Neutral)
      const neutralPosts = Math.round(35 + seededRandom(dateSeed + 3, 0, 25));
      topicsBySentiment[3].push({ 
        topic: 'Mobile App Crashes', 
        volume: Math.round(neutralPosts * 0.6),
        postCount: Math.round(neutralPosts * 0.5),
        channels: topicChannelConfig['Mobile App Crashes'] ?? defaultChannels,
      });
      topicsBySentiment[3].push({ 
        topic: 'Service Information Request', 
        volume: Math.round(neutralPosts * 0.4),
        postCount: Math.round(neutralPosts * 0.4),
        channels: topicChannelConfig['Service Information Request'] ?? defaultChannels,
      });

      // Level 4 (Frustrated)
      const frustratedBasePosts = dailySentiment < -0.1
        ? Math.round(40 + seededRandom(dateSeed + 4, 0, 50) + (Math.abs(dailySentiment) * 40))
        : Math.round(15 + seededRandom(dateSeed + 4, 0, 20));
      
      if (frustratedBasePosts > 25) {
        topicsBySentiment[4].push({ 
          topic: 'Payment Processing Failure', 
          volume: Math.round(frustratedBasePosts * 0.4),
          postCount: Math.round(frustratedBasePosts * 0.35),
          channels: topicChannelConfig['Payment Processing Failure'] ?? defaultChannels,
        });
        topicsBySentiment[4].push({ 
          topic: 'Account Access Problems', 
          volume: Math.round(frustratedBasePosts * 0.35),
          postCount: Math.round(frustratedBasePosts * 0.3),
          channels: topicChannelConfig['Account Access Problems'] ?? defaultChannels,
        });
        topicsBySentiment[4].push({ 
          topic: 'Fee Structure Criticism', 
          volume: Math.round(frustratedBasePosts * 0.25),
          postCount: Math.round(frustratedBasePosts * 0.25),
          channels: topicChannelConfig['Fee Structure Criticism'] ?? defaultChannels,
        });
      } else {
        topicsBySentiment[4].push({ 
          topic: 'Account Access Problems', 
          volume: frustratedBasePosts,
          postCount: Math.round(frustratedBasePosts * 0.8),
          channels: topicChannelConfig['Account Access Problems'] ?? defaultChannels,
        });
      }

      // Level 5 (Very Frustrated)
      const veryFrustratedBasePosts = dailySentiment < -0.2
        ? Math.round(50 + seededRandom(dateSeed + 5, 0, 60) + (Math.abs(dailySentiment) * 50))
        : Math.round(10 + seededRandom(dateSeed + 5, 0, 15));
      
      if (veryFrustratedBasePosts > 20) {
        topicsBySentiment[5].push({ 
          topic: 'Payment Processing Failure', 
          volume: Math.round(veryFrustratedBasePosts * 0.4),
          postCount: Math.round(veryFrustratedBasePosts * 0.35),
          channels: topicChannelConfig['Payment Processing Failure'] ?? defaultChannels,
        });
        topicsBySentiment[5].push({ 
          topic: 'System Outage Frustration', 
          volume: Math.round(veryFrustratedBasePosts * 0.35),
          postCount: Math.round(veryFrustratedBasePosts * 0.3),
          channels: topicChannelConfig['System Outage Frustration'] ?? defaultChannels,
        });
        topicsBySentiment[5].push({ 
          topic: 'Mobile App Crashes', 
          volume: Math.round(veryFrustratedBasePosts * 0.25),
          postCount: Math.round(veryFrustratedBasePosts * 0.25),
          channels: topicChannelConfig['Mobile App Crashes'] ?? defaultChannels,
        });
      } else {
        topicsBySentiment[5].push({ 
          topic: 'System Outage Frustration', 
          volume: veryFrustratedBasePosts,
          postCount: Math.round(veryFrustratedBasePosts * 0.9),
          channels: topicChannelConfig['System Outage Frustration'] ?? defaultChannels,
        });
      }

      return {
        date,
        formattedDate: new Date(date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
        sentiment: dailySentiment,
        topicsBySentiment,
      };
    });

    // Create channel-specific data
    const createChannelData = (timePoint: typeof timeBasedSentimentData[0], channel: Channel, channelIndex: number) => {
      const channelMultipliers: Record<Channel, number> = {
        'all': 1,
        'trustpilot': 0.8,
        'x': 1.2,
        'reddit': 0.9,
        'appstore': 0.7,
        'playstore': 0.7,
      };
      const channelInclusionBias: Record<Channel, number> = {
        trustpilot: 0.2,
        x: 0.3,
        reddit: 0.35,
        appstore: 0.45,
        playstore: 0.42,
        all: 0,
      };
      
      const multiplier = channelMultipliers[channel] || 1;
      const channelSeed = channelIndex * 100 + timePoint.date.length;
      
      const channelTopicsBySentiment: Record<number, Array<{ topic: string; volume: number; postCount: number; channels: Channel[] }>> = {
        1: [], 2: [], 3: [], 4: [], 5: []
      };
      
      sentimentLevels.forEach((level) => {
        const baseTopics = timePoint.topicsBySentiment[level];
        const allowedTopics: Array<typeof baseTopics[number]> = [];
        baseTopics.forEach((topic) => {
          const allowed = topic.channels ?? topicChannelConfig[topic.topic] ?? defaultChannels;
          if (!allowed.includes(channel)) {
            return;
          }
          allowedTopics.push(topic);
          const channelVariation = seededRandom(channelSeed + level, -10, 10);
          const scaledVolume = Math.max(1, Math.round(topic.volume * multiplier + channelVariation));
          const scaledPostCount = Math.max(1, Math.round((topic.postCount || 0) * multiplier + channelVariation * 0.7));
          const chanceSeed = channelSeed + level * 31 + topic.topic.length;
          const presenceChance = seededChance(chanceSeed);
          const inclusionThreshold = channelInclusionBias[channel] ?? 0.35;
          if (presenceChance < inclusionThreshold && allowedTopics.length > 1) {
            return;
          }
          
          channelTopicsBySentiment[level].push({
            topic: topic.topic,
            volume: scaledVolume,
            postCount: scaledPostCount,
            channels: [channel],
          });
        });
        if (channelTopicsBySentiment[level].length === 0 && allowedTopics.length > 0) {
          const fallbackTopic = allowedTopics[0];
          const fallbackVariation = seededRandom(channelSeed + level * 13, -6, 6);
          channelTopicsBySentiment[level].push({
            topic: fallbackTopic.topic,
            volume: Math.max(1, Math.round(fallbackTopic.volume * multiplier * 0.7 + fallbackVariation)),
            postCount: Math.max(1, Math.round((fallbackTopic.postCount || 0) * multiplier * 0.6 + fallbackVariation * 0.5)),
            channels: [channel],
          });
        }
      });
      
      return channelTopicsBySentiment;
    };

    // Create line chart data
    const sentimentTimeLineData = timeBasedSentimentData.map((timePoint, timeIndex) => {
      const dataPoint: any = { 
        date: timePoint.formattedDate,
        fullDate: timePoint.date,
        sentiment: timePoint.sentiment,
      };
      
      const channelDataMap: Partial<Record<Channel, Record<number, Array<{ topic: string; volume: number; postCount?: number; channels?: Channel[] }>>>> = {};
      channelDataMap.trustpilot = createChannelData(timePoint, 'trustpilot', timeIndex);
      sentimentChannels.forEach((ch) => {
        channelDataMap[ch] = createChannelData(timePoint, ch, timeIndex);
      });
      
      dataPoint.channelData = channelDataMap as Record<Channel, Record<number, Array<{ topic: string; volume: number; postCount?: number; channels?: Channel[] }>>>;
      
      sentimentLevels.forEach((level) => {
        const topics = timePoint.topicsBySentiment[level];
        const totalVolume = topics.reduce((sum, t) => sum + t.volume, 0);
        const totalPosts = topics.reduce((sum, t) => sum + (t.postCount || 0), 0);
        
        dataPoint[`Level ${level}`] = totalVolume;
        dataPoint[`topics_${level}`] = topics;
        dataPoint[`postCount_${level}`] = totalPosts;
      });
      
      return dataPoint;
    });
    
    // Filter data based on channel parameter (not state)
    // Add channel-specific variations to make lines look different
    const getChannelVariation = (ch: Channel, index: number, level: number) => {
      // Each channel gets different variation patterns
      const channelPatterns: Record<Channel, number> = {
        'all': Math.sin(index * 0.3 + level * 0.5) * 0.2,
        'trustpilot': Math.sin(index * 0.25 + level * 0.4) * 0.15,
        'x': Math.sin(index * 0.35 + level * 0.6) * 0.25,
        'reddit': Math.sin(index * 0.28 + level * 0.45) * 0.18,
        'appstore': Math.sin(index * 0.32 + level * 0.55) * 0.22,
        'playstore': Math.sin(index * 0.3 + level * 0.5) * 0.2,
      };
      return channelPatterns[ch] || 0;
    };

    const filteredSentimentTimeLineData = sentimentTimeLineData.map((dataPoint, dataIndex) => {
      if (channel === 'all') {
        const aggregatedDataPoint: any = {
          date: dataPoint.date,
          fullDate: dataPoint.fullDate,
          sentiment: dataPoint.sentiment,
        };
        
        sentimentLevels.forEach((level) => {
          let totalVolume = 0;
          let totalPosts = 0;
          const allTopics: Array<{ topic: string; volume: number; postCount: number; channels: Channel[] }> = [];
          const topicMap = new Map<string, { volume: number; postCount: number; channels: Set<Channel> }>();
          
          (Object.values(dataPoint.channelData || {}) as Array<Record<number, Array<{ topic: string; volume: number; postCount: number; channels?: Channel[] }>>>).forEach((channelTopics) => {
            const levelTopics = channelTopics[level] || [];
            levelTopics.forEach((topic: { topic: string; volume: number; postCount: number; channels?: Channel[] }) => {
              const existing = topicMap.get(topic.topic);
              if (existing) {
                existing.volume += topic.volume;
                existing.postCount += topic.postCount;
                (topic.channels || []).forEach((ch) => existing.channels.add(ch));
              } else {
                const channelSet = new Set<Channel>();
                (topic.channels || []).forEach((ch) => channelSet.add(ch));
                topicMap.set(topic.topic, { volume: topic.volume, postCount: topic.postCount, channels: channelSet });
              }
              totalVolume += topic.volume;
              totalPosts += topic.postCount;
            });
          });
          
          // Add channel-specific variation
          const variation = getChannelVariation(channel, dataIndex, level);
          totalVolume = Math.max(1, Math.round(totalVolume * (1 + variation)));
          
          topicMap.forEach((value, key) => {
            allTopics.push({ topic: key, volume: value.volume, postCount: value.postCount, channels: Array.from(value.channels) });
          });
          
          aggregatedDataPoint[`Level ${level}`] = totalVolume;
          aggregatedDataPoint[`topics_${level}`] = allTopics.sort((a, b) => b.volume - a.volume);
          aggregatedDataPoint[`postCount_${level}`] = totalPosts;
        });
        
        return aggregatedDataPoint;
      } else {
        const channelData = dataPoint.channelData?.[channel] || {};
        const channelDataPoint: any = {
          date: dataPoint.date,
          fullDate: dataPoint.fullDate,
          sentiment: dataPoint.sentiment,
        };
        
        sentimentLevels.forEach((level) => {
          const topics: Array<{ topic: string; volume: number; postCount: number; channels?: Channel[] }> = channelData[level] || [];
          let totalVolume = topics.reduce((sum: number, t: { topic: string; volume: number; postCount: number }) => sum + t.volume, 0);
          const totalPosts = topics.reduce((sum: number, t: { topic: string; volume: number; postCount: number }) => sum + (t.postCount || 0), 0);
          
          // Add channel-specific variation to make lines look different
          const variation = getChannelVariation(channel, dataIndex, level);
          totalVolume = Math.max(1, Math.round(totalVolume * (1 + variation)));
          
          channelDataPoint[`Level ${level}`] = totalVolume;
          channelDataPoint[`topics_${level}`] = topics;
          channelDataPoint[`postCount_${level}`] = totalPosts;
        });
        
        return channelDataPoint;
      }
    });

    // Calculate Y-axis domain
    let maxValue = 0;
    filteredSentimentTimeLineData.forEach((dataPoint) => {
      sentimentLevels.forEach((level) => {
        const value = dataPoint[`Level ${level}`] as number;
        if (value && value > maxValue) {
          maxValue = value;
        }
      });
    });
    
    const yAxisMax = maxValue > 0 ? Math.ceil(maxValue * 1.1) : 100;
    const yAxisDomain: [number, number] = [0, Math.ceil(yAxisMax / 10) * 10];

    return (
      <Card className="bg-app-black/60 border border-white/10 shadow-xl">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-white">
            <BarChart3 className="h-5 w-5 text-purple-400" />
            Daily Social Media Posts by Sentiment Level
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-2">
          <div className="flex flex-col xl:flex-row gap-6">
            <div className={`w-full transition-all duration-300 ${selectedSentimentPoint ? 'xl:w-2/3' : ''}`}>
              <ResponsiveContainer width="100%" height={420}>
                <LineChart
                  data={filteredSentimentTimeLineData}
                  margin={{ top: 12, right: 32, bottom: 12, left: 8 }}
                >
                  <CartesianGrid strokeDasharray="3 3" stroke="#1f2937" />
                  <XAxis 
                    dataKey="date" 
                    stroke="#9CA3AF" 
                    fontSize={12}
                    tickLine={false}
                    axisLine={false}
                  />
                  <YAxis 
                    domain={yAxisDomain}
                    stroke="#9CA3AF" 
                    fontSize={12}
                    tickLine={false}
                    axisLine={false}
                    label={{
                      value: 'Number of Posts (Volume)',
                      angle: -90,
                      position: 'insideLeft',
                      fill: '#9CA3AF',
                      fontSize: 12,
                    }}
                  />
                  <Legend 
                    verticalAlign="bottom"
                    height={36}
                    wrapperStyle={{ color: '#CBD5F5', fontSize: 12 }}
                    formatter={(value: string) => {
                      const match = value.match(/Level (\d)/);
                      if (match) {
                        const meta = sentimentLevelMeta.find(item => item.level === Number(match[1]));
                        if (meta) return meta.label;
                      }
                      return value;
                    }}
                  />
                  {selectedSentimentPoint && (
                    <ReferenceLine
                      x={selectedSentimentPoint.date}
                      stroke="#f9fafb22"
                      strokeWidth={1}
                    />
                  )}
                  {sentimentLevelMeta.map(({ level, color, label }) => (
                    <Line
                      key={`sentiment-level-${level}`}
                      type="monotone"
                      dataKey={`Level ${level}`}
                      name={`Level ${level}`}
                      stroke={color}
                      strokeWidth={2.8}
                      strokeOpacity={0.85}
                      dot={({ cx, cy, payload }) => {
                        if (typeof cx !== 'number' || typeof cy !== 'number' || !payload) return <></>;
                        const dateKey = payload.fullDate || payload.date;
                        const value = payload[`Level ${level}`];
                        if (!dateKey || value === null || value === undefined || value < 1) {
                          return <></>;
                        }
                        const isSelected =
                          selectedSentimentPoint?.date === (payload.date || payload.fullDate) &&
                          selectedSentimentPoint?.sentimentLevel === level;
                        return (
                          <circle
                            key={`sentiment-dot-${level}-${payload.fullDate || payload.date}-${cx}-${cy}`}
                            cx={cx}
                            cy={cy}
                            r={isSelected ? 6 : 4}
                            fill={color}
                            stroke="#0f172a"
                            strokeWidth={isSelected ? 2 : 1.5}
                            cursor="pointer"
                            onClick={() =>
                              setSelectedSentimentPoints(prev => ({
                                ...prev,
                                [channel]: {
                                  date: (payload.date || payload.fullDate) as string,
                                sentimentLevel: level,
                                },
                              }))
                            }
                          />
                        );
                      }}
                      activeDot={false}
                      connectNulls={false}
                      isAnimationActive={false}
                    />
                  ))}
                </LineChart>
              </ResponsiveContainer>
            </div>
            
            {selectedSentimentPoint && (() => {
              const dataPoint = filteredSentimentTimeLineData.find(d => d.date === selectedSentimentPoint.date);
              if (!dataPoint) return null;
              
              const sentimentLevel = selectedSentimentPoint.sentimentLevel;
              const dataPointValue = dataPoint[`Level ${sentimentLevel}`] as number;
              
              if (dataPointValue === null || dataPointValue === undefined || dataPointValue < 1) {
                return null;
              }
              
              const topics = dataPoint[`topics_${sentimentLevel}`] as Array<{ topic: string; volume: number; postCount?: number; channels?: Channel[] }> || [];
              const totalPosts = dataPoint[`postCount_${sentimentLevel}`] as number || 0;
              const sortedTopics = [...topics].sort((a, b) => b.volume - a.volume);
              
              const sentimentColors = sentimentLevelMeta.map(meta => meta.color);
              const sentimentColor = sentimentColors[sentimentLevel - 1];
              const sentimentMeta = sentimentLevelMeta.find(meta => meta.level === sentimentLevel);
              const detailStyles = sentimentDetailStyles[sentimentLevel] || sentimentDetailStyles[3];
              
              return (
                <div className="w-full xl:w-1/3">
                  <Card className="bg-app-black/70 border border-white/10 shadow-xl h-full">
                    <CardHeader className="relative pb-4">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() =>
                          setSelectedSentimentPoints(prev => {
                            const updated = { ...prev };
                            delete updated[channel];
                            return updated;
                          })
                        }
                        className="absolute top-2 right-2 h-8 w-8 p-0 text-muted-foreground hover:text-white"
                      >
                        <X className="h-4 w-4" />
                      </Button>
                      <CardTitle className="flex items-center gap-2 text-white pr-8">
                        <div 
                          className="w-3 h-3 rounded-full"
                          style={{ 
                            backgroundColor: sentimentColor,
                            boxShadow: `0 0 8px ${sentimentColor}80`
                          }}
                        />
                        {selectedSentimentPoint.date}
                      </CardTitle>
                      <CardDescription className="text-muted-foreground">
                        Sentiment Level {sentimentLevel}: {sentimentMeta?.short ?? sentimentLevelLabels[sentimentLevel - 1]}
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className={`p-4 rounded-lg border ${detailStyles.panel}`}>
                        <div className="flex justify-between items-center">
                          <span className={`text-sm font-semibold uppercase tracking-wide ${detailStyles.label}`}>
                            Total Posts
                          </span>
                          <span className={`text-lg font-bold ${detailStyles.value}`}>
                            {totalPosts} posts
                          </span>
                        </div>
                      </div>
                      
                      {sortedTopics.length > 0 ? (
                        <div>
                          <h4 className="text-sm font-semibold text-muted-foreground mb-3 uppercase tracking-wide">
                            Topics for {sentimentLevelLabels[sentimentLevel - 1]} ({sortedTopics.length})
                          </h4>
                          <div className="space-y-3 max-h-[400px] overflow-y-auto pr-2">
                            {sortedTopics.map((topic, idx) => (
                              <div key={idx} className={`p-3 rounded-lg border flex flex-col gap-2 ${detailStyles.topic}`}>
                                <div className="flex justify-between items-start gap-3">
                                  <span className="text-sm font-medium text-white flex-1">
                                    {topic.topic}
                                  </span>
                                  <div className="flex flex-col items-end gap-2 min-w-[120px]">
                                    {(() => {
                                      const topicChannels =
                                        topic.channels && topic.channels.length > 0
                                          ? topic.channels
                                          : channel !== 'all'
                                            ? [channel]
                                            : [];
                                      const displayChannels = topicChannels.filter(
                                        topicChannel =>
                                          !(channel === 'trustpilot' && topicChannel === 'trustpilot')
                                      );
                                      if (displayChannels.length === 0) {
                                        return null;
                                      }
                                      return (
                                        <div className="flex flex-wrap justify-end gap-1">
                                          {displayChannels.map(topicChannel => (
                                            <span
                                              key={`${topic.topic}-${topicChannel}`}
                                              className={`inline-flex items-center gap-1 rounded-full border px-2 py-1 text-[10px] font-semibold uppercase tracking-wide ${detailStyles.channel}`}
                                            >
                                              <span className="inline-flex items-center justify-center">
                                                {getChannelIcon(topicChannel)}
                                              </span>
                                              {getChannelName(topicChannel)}
                                            </span>
                                          ))}
                                        </div>
                                      );
                                    })()}
                                    {topic.postCount !== undefined && topic.postCount > 0 && (
                                      <span className={`text-xs font-semibold px-2 py-1 rounded ${detailStyles.posts}`}>
                                        {topic.postCount} {topic.postCount === 1 ? 'post' : 'posts'}
                                      </span>
                                    )}
                                  </div>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      ) : (
                        <div className="text-center py-8 text-muted-foreground">
                          No topics available for this sentiment level
                        </div>
                      )}
                    </CardContent>
                  </Card>
                </div>
              );
            })()}
          </div>
        </CardContent>
      </Card>
    );
  };

  // Calculate comprehensive Brand Health KPIs (Phase 1 spec)
  const calculateBrandHealthKPIs = useMemo(() => {
    // Generate mock data for "all" channel when trustpilot data is not loaded
    if (!trustpilotData || activeTab === 'all') {
      // Return enhanced mock KPIs when no data or on "all" tab
      return {
        totalMentions7d: 13542,
        totalMentions30d: 50287,
        avgSentimentScore: 78.5,
        negativitySpikePercent: 3.4,
        platformWithHighestNegativity: 'Reddit',
        top3TrendingTopics: ['Payment Processing', 'Mobile App Performance', 'Customer Support'],
        viralityIndex: 6.0,
        emotionMix: { calm: 24, frustrated: 61, delighted: 15 },
        platformHealth: {
          x: { sentiment: 64, negativePercent: 36, rating: null, engagement: 'High', volume: 'High', virality: 3 },
          reddit: { sentiment: 56, negativePercent: 44, rating: null, engagement: 'Medium', volume: 'Medium', virality: 2 },
          trustpilot: { sentiment: 76, negativePercent: 27, rating: 4.2, engagement: 'Low', volume: 'Low', virality: 1 },
          appstore: { sentiment: 69, negativePercent: 31, rating: 4.6, engagement: 'Medium', volume: 'Medium', virality: 1 },
          playstore: { sentiment: 59, negativePercent: 41, rating: 3.4, engagement: 'High', volume: 'High', virality: 3 },
        },
      };
    }

    const { kpis, trendData, topicBubbles } = trustpilotData;
    
    // Calculate 7d and 30d mentions
    const now = new Date();
    const last7d = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    const last30d = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
    
    const mentions7d = trendData.filter(d => new Date(d.date) >= last7d).reduce((sum, d) => sum + d.reviewVolume, 0);
    const mentions30d = trendData.filter(d => new Date(d.date) >= last30d).reduce((sum, d) => sum + d.reviewVolume, 0);
    
    // Calculate weighted average sentiment score across all platforms
    const avgSentiment = trendData.reduce((sum, d) => sum + d.sentiment, 0) / trendData.length;
    const sentimentScore = Math.round((avgSentiment + 1) * 50); // Convert -1 to 1 range to 0-100
    
    // Calculate negativity spike % (compare last 7d to previous 7d)
    const last14d = new Date(now.getTime() - 14 * 24 * 60 * 60 * 1000);
    const prev7dNegative = trendData.filter(d => {
      const date = new Date(d.date);
      return date >= last14d && date < last7d && d.sentiment < 0;
    }).reduce((sum, d) => sum + d.reviewVolume, 0);
    const current7dNegative = trendData.filter(d => {
      const date = new Date(d.date);
      return date >= last7d && d.sentiment < 0;
    }).reduce((sum, d) => sum + d.reviewVolume, 0);
    const rawNegativitySpikePercent = prev7dNegative > 0 
      ? ((current7dNegative - prev7dNegative) / prev7dNegative * 100)
      : 0;
    const negativitySpikePercent = Math.abs(rawNegativitySpikePercent) < 0.5
      ? (rawNegativitySpikePercent >= 0 ? 2.1 : -2.1)
      : rawNegativitySpikePercent;
    
    // Find top 3 trending topics
    const top3Topics = topicBubbles
      .sort((a, b) => b.volume - a.volume)
      .slice(0, 3)
      .map(t => t.topic);
    
    // Calculate virality index (simulated from engagement metrics)
    const viralityIndex = Math.max(1, Math.min(10, Math.round((mentions7d / 1000) * 0.5 + (top3Topics.length * 1.5))));
    
    // Calculate emotion mix (calm, frustrated, delighted)
    const totalVolume = topicBubbles.reduce((sum, t) => sum + t.volume, 0);
    const calmVolume = topicBubbles.filter(t => t.sentiment > 0.3).reduce((sum, t) => sum + t.volume, 0);
    const frustratedVolume = topicBubbles.filter(t => t.sentiment < -0.3).reduce((sum, t) => sum + t.volume, 0);
    const neutralVolume = totalVolume - calmVolume - frustratedVolume;
    const emotionMix = {
      calm: totalVolume > 0 ? Math.round((calmVolume / totalVolume) * 100) : 45,
      frustrated: totalVolume > 0 ? Math.round((frustratedVolume / totalVolume) * 100) : 25,
      delighted: totalVolume > 0 ? Math.round((neutralVolume / totalVolume) * 100) : 30,
    };
    
    return {
      totalMentions7d: Math.max(1, mentions7d),
      totalMentions30d: Math.max(1, mentions30d),
      avgSentimentScore: sentimentScore === 0 ? 52 : sentimentScore,
      negativitySpikePercent: Math.round(negativitySpikePercent * 10) / 10,
      platformWithHighestNegativity: 'Reddit', // Would come from cross-platform analysis
      top3TrendingTopics: top3Topics.length >= 3 ? top3Topics : [...top3Topics, 'Payment Processing', 'Login Issues'].slice(0, 3),
      viralityIndex: viralityIndex,
      emotionMix,
      platformHealth: {
        x: { sentiment: 62, negativePercent: 38, rating: null, engagement: 'High', volume: 'High', virality: 2 },
        reddit: { sentiment: 54, negativePercent: 46, rating: null, engagement: 'Medium', volume: 'Medium', virality: 1 },
        trustpilot: { sentiment: Math.round(sentimentScore), negativePercent: kpis.negativeReviewsPercent, rating: kpis.avgRating, engagement: 'Low', volume: 'Low', virality: 0 },
        appstore: { sentiment: 68, negativePercent: 32, rating: 4.6, engagement: 'Medium', volume: 'Medium', virality: 0 },
        playstore: { sentiment: 58, negativePercent: 42, rating: 3.4, engagement: 'High', volume: 'High', virality: 3 },
      },
    };
  }, [trustpilotData, activeTab]);

  const socialKPIItems = useMemo(() => {
    const sentimentScore = Math.round(calculateBrandHealthKPIs.avgSentimentScore || 0);
    const sentimentBand = sentimentScore >= 70 ? 'Positive' : sentimentScore >= 50 ? 'Neutral' : 'Negative';
    const negativitySpike = calculateBrandHealthKPIs.negativitySpikePercent || 0;

    const sentimentTrend = (() => {
      if (!trustpilotData?.trendData?.length) {
        const base = Math.max(0, sentimentScore - 4);
        return Array.from({ length: 7 }, (_, idx) => ({
          index: idx,
          value: Math.min(100, Number((base + Math.sin(idx * 0.6) * 2.5 + idx * 1.4).toFixed(2))),
        }));
      }
      const raw = trustpilotData.trendData.slice(-14);
      if (!raw.length) return null;
      const mean = raw.reduce((acc, point) => acc + point.sentiment, 0) / raw.length;
      return raw.map((point, idx) => ({
        index: idx,
        value: Math.min(100, Math.max(0, Math.round((point.sentiment + 1) * 50 + Math.sin(idx * 0.5) * 3))),
        deviation: point.sentiment - mean,
      }));
    })();

    const negativityTrend = (() => {
      if (!trustpilotData?.trendData?.length) {
        const base = Math.max(0, negativitySpike * 0.3);
        return Array.from({ length: 7 }, (_, idx) => ({
          index: idx,
          value: Number((base + Math.sin(idx * 0.8 + 0.4) * 0.6 + idx * (negativitySpike / 6)).toFixed(3)),
        }));
      }
      const raw = trustpilotData.trendData.slice(-14);
      if (!raw.length) return null;
      const volumes = raw.map(point => (point.sentiment < 0 ? Math.abs(point.reviewVolume) : 0));
      const max = Math.max(...volumes, 1);
      return raw.map((point, idx) => ({
        index: idx,
        value: Number((((point.sentiment < 0 ? Math.abs(point.reviewVolume) : 0) / max) * (negativitySpike || 1) + Math.sin(idx * 0.7) * 0.3).toFixed(3)),
      }));
    })();

    const renderMiniTrend = (
      data: Array<{ index: number; value: number }>,
      colorClass: string
    ) => (
      <ResponsiveContainer width="100%" height={32}>
        <LineChart data={data} margin={{ top: 2, right: 0, left: 0, bottom: 0 }}>
          <CartesianGrid vertical={false} stroke="#1f2937" strokeDasharray="1 3" />
          <Line
            type="monotone"
            dataKey="value"
            strokeWidth={2}
            stroke={colorClass}
            dot={false}
            isAnimationActive={false}
          />
          <XAxis dataKey="index" hide />
          <YAxis hide domain={['auto', 'auto']} />
        </LineChart>
      </ResponsiveContainer>
    );

    const renderMiniNegativity = (
      data: Array<{ index: number; value: number }>,
      colorClass: string
    ) => (
      <ResponsiveContainer width="100%" height={32}>
        <LineChart data={data} margin={{ top: 2, right: 0, left: 0, bottom: 0 }}>
          <CartesianGrid vertical={false} stroke="#1f2937" strokeDasharray="1 3" />
          <Line
            type="monotone"
            dataKey="value"
            strokeWidth={2}
            stroke={colorClass}
            dot={false}
            isAnimationActive={false}
          />
          <XAxis dataKey="index" hide />
          <YAxis hide domain={['auto', 'auto']} />
        </LineChart>
      </ResponsiveContainer>
    );

    return [
      {
        title: 'Total Mentions (7d)',
        value: calculateBrandHealthKPIs.totalMentions7d.toLocaleString(),
        subtext: `${calculateBrandHealthKPIs.totalMentions30d.toLocaleString()} in 30d`,
        icon: MessageSquare,
        color: 'text-purple-400',
        bgColor: 'bg-purple-500/10',
      },
      {
        title: 'Avg Sentiment',
        value: `${sentimentScore}%`,
        subtext: sentimentBand,
        icon: Heart,
        color: sentimentScore >= 70 ? 'text-green-400' : sentimentScore >= 50 ? 'text-yellow-400' : 'text-red-400',
        bgColor: sentimentScore >= 70 ? 'bg-green-500/10' : sentimentScore >= 50 ? 'bg-yellow-500/10' : 'bg-red-500/10',
        customContent:
          sentimentTrend && sentimentTrend.length > 1 ? (
            <div className="mt-3 w-full">{renderMiniTrend(sentimentTrend, sentimentScore >= 70 ? '#22c55e' : sentimentScore >= 50 ? '#fbbf24' : '#ef4444')}</div>
          ) : null,
      },
      {
        title: 'Negativity Spike',
        value: `${Math.abs(negativitySpike).toFixed(1)}%`,
        subtext: negativitySpike > 0 ? 'Week-over-week increase' : 'Week-over-week relief',
        icon: AlertTriangle,
        color: negativitySpike > 0 ? 'text-red-400' : 'text-green-400',
        bgColor: negativitySpike > 0 ? 'bg-red-500/10' : 'bg-green-500/10',
        customContent:
          negativityTrend && negativityTrend.length > 1 ? (
            <div className="mt-3 w-full">{renderMiniNegativity(negativityTrend, negativitySpike > 0 ? '#ef4444' : '#22c55e')}</div>
          ) : null,
      },
      {
        title: 'Highest Negativity Platform',
        value: calculateBrandHealthKPIs.platformWithHighestNegativity,
        subtext: 'Requires priority response',
        icon: Flag,
        color: 'text-orange-400',
        bgColor: 'bg-orange-500/10',
      },
      {
        title: 'Virality Index',
        value: `${calculateBrandHealthKPIs.viralityIndex}/10`,
        subtext: 'Amplification potential',
        icon: Activity,
        color: calculateBrandHealthKPIs.viralityIndex >= 6 ? 'text-orange-400' : 'text-blue-400',
        bgColor: calculateBrandHealthKPIs.viralityIndex >= 6 ? 'bg-orange-500/10' : 'bg-blue-500/10',
      },
    ];
  }, [calculateBrandHealthKPIs, trustpilotData]);

  const channelMetadata: Array<{ key: DisplayChannel; label: string; color: string }> = [
    { key: 'appstore', label: 'App Store', color: '#22c55e' },
    { key: 'playstore', label: 'Play Store', color: '#3b82f6' },
    { key: 'reddit', label: 'Reddit', color: '#9CA3AF' },
    { key: 'trustpilot', label: 'Trustpilot', color: '#f97316' },
    { key: 'x', label: 'X (Twitter)', color: '#ef4444' },
  ];

  const topicChannelAffinity: Record<string, DisplayChannel[]> = {
    'Payment Processing Failure': ['trustpilot', 'x', 'reddit'],
    'Mobile App Crashes': ['x', 'appstore', 'playstore'],
    'Regulatory Compliance Questions': ['trustpilot', 'x'],
    'System Outage Frustration': ['x', 'reddit'],
    'Cross Border Issues': ['trustpilot', 'x'],
    'Customer Service Disappointment': ['trustpilot', 'reddit'],
    'Fee Structure Criticism': ['trustpilot', 'reddit'],
    'Account Access Problems': ['trustpilot', 'x', 'reddit'],
    'Unified Account Dashboard': ['trustpilot', 'appstore'],
    'Instant Fund Transfers': ['trustpilot', 'x'],
    'Card Management Hub': ['trustpilot', 'x', 'appstore'],
    'Smart Loan Assistant': ['trustpilot', 'playstore'],
    'Digital Innovation Appreciation': ['trustpilot', 'appstore'],
    'Trade Finance Satisfaction': ['trustpilot', 'x'],
    'Regulatory Compliance Support': ['trustpilot', 'reddit'],
    'Customer Loyalty Rewards': ['trustpilot', 'appstore', 'playstore'],
    'In-App Messaging': ['x', 'appstore'],
  };

  const channelTopicBreakdown = useMemo(() => {
    const fallbackTopics: Array<{ topic: string; volume: number }> = [
      { topic: 'Payment Processing Failure', volume: 391 },
      { topic: 'Mobile App Crashes', volume: 222 },
      { topic: 'Regulatory Compliance Questions', volume: 149 },
      { topic: 'System Outage Frustration', volume: 130 },
      { topic: 'Cross Border Issues', volume: 118 },
      { topic: 'Customer Service Disappointment', volume: 117 },
      { topic: 'Fee Structure Criticism', volume: 112 },
      { topic: 'Account Access Problems', volume: 96 },
      { topic: 'Unified Account Dashboard', volume: 58 },
      { topic: 'Instant Fund Transfers', volume: 52 },
      { topic: 'Card Management Hub', volume: 47 },
      { topic: 'Smart Loan Assistant', volume: 44 },
      { topic: 'Digital Innovation Appreciation', volume: 33 },
      { topic: 'Trade Finance Satisfaction', volume: 29 },
      { topic: 'Customer Loyalty Rewards', volume: 25 },
      { topic: 'In-App Messaging', volume: 22 },
    ];

    const seededChance = (seed: number) => {
      const x = Math.sin(seed) * 10000;
      return x - Math.floor(x);
    };

    const baseTopics = (() => {
      if (!trustpilotData) {
        return fallbackTopics;
      }
      const merged = new Map<string, { topic: string; volume: number }>();
      [...trustpilotData.topicBubbles]
        .sort((a, b) => b.volume - a.volume)
        .forEach((bubble) => {
          merged.set(bubble.topic, { topic: bubble.topic, volume: Math.max(bubble.volume, 35) });
        });
      fallbackTopics.forEach((fallback) => {
        if (!merged.has(fallback.topic)) {
          merged.set(fallback.topic, fallback);
        }
      });
      return Array.from(merged.values());
    })();

    const matrix = baseTopics
      .map((topic, idx) => {
        const preferredChannels = topicChannelAffinity[topic.topic] ?? [];

        const potentialChannels = channelMetadata
          .map(meta => meta.key)
          .filter(key => preferredChannels.includes(key));

        if (potentialChannels.length === 0) {
          potentialChannels.push(...channelMetadata.map(meta => meta.key));
        }

        const minChannels = Math.min(2, potentialChannels.length);
        const desiredChannelCount = Math.max(minChannels, Math.min(5, Math.round(3 + (seededChance(idx + 1) - 0.5) * 4)));

        const selectedChannels = new Set<DisplayChannel>();
        selectedChannels.add(potentialChannels[0]);

        const available = channelMetadata.map(meta => meta.key).filter(key => !selectedChannels.has(key));
        while (selectedChannels.size < desiredChannelCount && available.length > 0) {
          const nextIndex = Math.floor(seededChance((idx + 1) * (selectedChannels.size + 7)) * available.length);
          selectedChannels.add(available.splice(nextIndex, 1)[0]);
        }

        const row: Record<string, any> = {
          topic: topic.topic,
          totalVolume: topic.volume,
        };

        const weightEntries = Array.from(selectedChannels).map((channelKey, position) => {
          const isPreferred = preferredChannels.includes(channelKey);
          const baseWeight = isPreferred ? 1.35 : 0.75;
          const randomFactor = seededChance((idx + 3) * (position + 11));
          const weight = baseWeight + randomFactor * (isPreferred ? 1.2 : 0.4);
          return { key: channelKey, weight };
        });

        const weightSum = weightEntries.reduce((sum, entry) => sum + entry.weight, 0) || 1;
        const rawCounts = weightEntries.map(entry => ({
          key: entry.key,
          value: Math.max(1, Math.round((entry.weight / weightSum) * topic.volume)),
        }));

        let allocated = rawCounts.reduce((sum, entry) => sum + entry.value, 0);
        if (allocated !== topic.volume) {
          let diff = allocated - topic.volume;
          if (diff > 0) {
            while (diff > 0) {
              const biggestIndex = rawCounts.reduce(
                (maxIdx, entry, index, array) => (entry.value > array[maxIdx].value ? index : maxIdx),
                0
              );
              if (rawCounts[biggestIndex].value <= 1) {
                break;
              }
              rawCounts[biggestIndex].value -= 1;
              diff -= 1;
            }
          } else {
            diff = Math.abs(diff);
            while (diff > 0) {
              const biggestIndex = rawCounts.reduce(
                (maxIdx, entry, index, array) => (entry.value > array[maxIdx].value ? index : maxIdx),
                0
              );
              rawCounts[biggestIndex].value += 1;
              diff -= 1;
            }
          }
        }

        channelMetadata.forEach(meta => {
          const match = rawCounts.find(entry => entry.key === meta.key);
          row[meta.key] = match?.value ?? 0;
        });

        row.activeChannels = Array.from(selectedChannels).length;
        row.__counts = channelMetadata.reduce((acc, meta) => {
          acc[meta.key] = row[meta.key] ?? 0;
          return acc;
        }, {} as Record<DisplayChannel, number>);

        const palette = ['#10b981', '#f59e0b', '#f97316', '#ef4444', '#b91c1c'];
        const sortedCounts = rawCounts
          .map(entry => entry.value)
          .sort((a, b) => b - a);

        const totalForGradient = Math.max(1, sortedCounts.reduce((sum, value) => sum + value, 0));
        const gradientShares = sortedCounts.map(value => value / totalForGradient);
        while (gradientShares.length < palette.length) {
          gradientShares.push(0);
        }

        let cumulative = 0;
        const gradientStops: Array<{ offset: number; color: string }> = [];
        gradientShares.slice(0, palette.length).forEach((share, index) => {
          const adjustedShare = Math.max(share, 0.06);
          const color = palette[index];
          if (index === 0) {
            gradientStops.push({ offset: 0, color });
          }
          cumulative = Math.min(1, cumulative + adjustedShare);
          gradientStops.push({ offset: cumulative, color });
        });
        if (gradientStops.length === 0 || gradientStops[gradientStops.length - 1].offset < 1) {
          gradientStops.push({ offset: 1, color: palette[palette.length - 1] });
        }

        row.gradientStops = gradientStops;
        row.totalPercent = 100;

        return row;
      })
      .sort((a, b) => (b.totalVolume || 0) - (a.totalVolume || 0))
      .slice(0, 10);

    return {
      data: matrix,
      channels: channelMetadata,
    };
  }, [trustpilotData]);

  const positiveChampionTopics = useMemo(() => {
    const LIMIT = 10;
    const fallbackPositive = [
      { topic: 'Customer Support', volume: 320, sentiment: 0.7 },
      { topic: 'Security Features', volume: 190, sentiment: 0.8 },
      { topic: 'User Interface', volume: 160, sentiment: 0.6 },
      { topic: 'Fast Processing', volume: 140, sentiment: 0.7 },
      { topic: 'Easy Setup', volume: 120, sentiment: 0.65 },
      { topic: 'Reliable Service', volume: 110, sentiment: 0.75 },
      { topic: 'Great Features', volume: 95, sentiment: 0.6 },
      { topic: 'Helpful Documentation', volume: 85, sentiment: 0.7 },
    ].slice(0, LIMIT);

    if (!trustpilotData?.topicBubbles?.length) {
      return fallbackPositive.slice(0, LIMIT);
    }

    const derived = trustpilotData.topicBubbles
      .filter(topic => topic.sentiment !== undefined && topic.sentiment > 0.2)
      .map(topic => ({
        topic: topic.topic,
        volume: topic.volume,
        sentiment: Math.max(-1, Math.min(1, topic.sentiment)),
      }))
      .sort((a, b) => b.volume - a.volume);

    const seen = new Set(derived.map(entry => entry.topic));
    fallbackPositive.forEach(entry => {
      if (!seen.has(entry.topic)) {
        derived.push(entry);
      }
    });

    return derived.slice(0, LIMIT);
  }, [trustpilotData]);

  const renderChannelTopicTooltip = useCallback(
    ({ active, payload, label }: any) => {
      if (!active || !payload || payload.length === 0) {
        return null;
      }
      const row = payload[0].payload as Record<string, any>;
      const total = row.totalVolume || 0;

      return (
        <div className="min-w-[260px] rounded-xl border border-white/10 bg-[#090f1f]/95 px-4 py-3 text-xs text-slate-100 shadow-2xl">
          <div className="flex items-start justify-between gap-4">
            <div>
              <div className="text-sm font-semibold text-white">{label}</div>
              <div className="text-[11px] text-slate-400">
                Shared topic across {row.activeChannels} channels
              </div>
            </div>
            <div className="text-[11px] font-semibold text-emerald-300">
              🔥 {total.toLocaleString()} posts
            </div>
          </div>
          <div className="mt-3 space-y-2">
            {channelMetadata.map((meta, idx) => {
              const count = row[meta.key] ?? 0;
              const percent = total > 0 ? ((count / total) * 100).toFixed(1) : '0.0';
              return (
                <div
                  key={meta.key}
                  className="flex items-center justify-between gap-3 rounded-md border border-white/5 bg-white/5 px-3 py-2"
                  style={{
                    background: idx % 2 === 0 ? 'rgba(148, 163, 184, 0.08)' : 'rgba(30, 41, 59, 0.45)',
                    borderColor: 'rgba(148, 163, 184, 0.15)',
                  }}
                >
                  <div className="flex items-center gap-2">
                    <span className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: meta.color }} />
                    <span className="text-[11px] text-slate-200 font-medium">{meta.label}</span>
                  </div>
                  <div className="text-[11px] font-semibold" style={{ color: meta.color }}>
                    {count.toLocaleString()} ({percent}%)
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      );
    },
    [channelMetadata]
  );

  const renderAllTopicsLegend = () => {
    const palette = [
      '#10b981',
      '#f59e0b',
      '#f97316',
      '#ef4444',
      '#b91c1c',
    ];

    const legendEntries = channelMetadata.slice(0, palette.length).map((meta, index) => ({
      label: meta.label,
      color: palette[index],
    }));

    return (
      <div className="flex flex-wrap items-center justify-center gap-x-6 gap-y-3 text-[11px] text-slate-300 pt-3">
        {legendEntries.map(entry => (
          <div key={entry.label} className="flex items-center gap-2">
            <span className="inline-block h-3 w-8 rounded-full" style={{ background: entry.color }} />
            <span>{entry.label}</span>
          </div>
        ))}
      </div>
    );
  };

  const renderChannelTotalLabel = useCallback((props: any) => {
    const { x = 0, y = 0, width = 0, height = 0, value } = props;
    if (!value || isNaN(value)) return null;
    const textX = x + width + 14;
    const textY = y + height / 2 + 4;
    return (
      <g>
        <text
          x={textX}
          y={textY}
          fill="#fb923c"
          fontSize={12}
          fontWeight={600}
        >
          🔥 {Number(value).toLocaleString()}
        </text>
      </g>
    );
  }, []);

  const renderChannelContent = (channel: Channel) => {
    if (channel === 'all') {
      return (
        <div className="space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-5 gap-4">
            {socialKPIItems.map((item, index) => {
              const Icon = item.icon;
              return (
                <Card
                  key={index}
                  className="relative flex h-full flex-col overflow-hidden border border-white/10 bg-app-black/60 shadow-xl transition-all duration-300 hover:-translate-y-1 hover:scale-[1.02] hover:shadow-2xl"
                >
                  <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none bg-gradient-to-br from-purple-500/5 via-purple-500/0 to-transparent" />
                  <CardHeader className="flex flex-row items-start justify-between space-y-0 pb-2 relative z-10 min-h-[72px]">
                    <div>
                      <CardTitle className="text-sm font-medium text-foreground">
                        {item.title}
                      </CardTitle>
                      <CardDescription className="text-xs text-muted-foreground">
                        {item.subtext}
                      </CardDescription>
                    </div>
                    <div className={`p-2 rounded-lg ${item.bgColor} group-hover:scale-110 transition-transform duration-200`}>
                      <Icon className={`h-4 w-4 ${item.color}`} />
                    </div>
                  </CardHeader>
                  <CardContent className="relative z-10 flex-1 flex flex-col gap-3 pt-0">
                    <div className="text-2xl font-bold text-white">{item.value}</div>
                    {item.customContent && (
                      <div className="mt-auto">
                        {item.customContent}
                      </div>
                    )}
                  </CardContent>
                </Card>
              );
            })}
          </div>

          {/* Cross-Platform Comparative Health - Phase 1 Spec */}
            <Card className="bg-app-black/60 border border-white/10 shadow-xl">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-white">
                <BarChart3 className="h-5 w-5 text-purple-400" />
                Cross-Platform Comparative Health
              </CardTitle>
              <CardDescription className="text-muted-foreground">
                Side-by-side comparison to identify healthiest or most problematic platforms
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto text-foreground">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-gray-700">
                      <th className="text-left py-3 px-4 text-muted-foreground font-semibold">Platform</th>
                      <th className="text-center py-3 px-4 text-muted-foreground font-semibold">Positive %</th>
                      <th className="text-center py-3 px-4 text-muted-foreground font-semibold">Negative %</th>
                      <th className="text-center py-3 px-4 text-muted-foreground font-semibold">Engagement Level</th>
                      <th className="text-center py-3 px-4 text-muted-foreground font-semibold">Volume</th>
                      <th className="text-center py-3 px-4 text-muted-foreground font-semibold">Virality Score</th>
                    </tr>
                  </thead>
                  <tbody>
                    {Object.entries(calculateBrandHealthKPIs.platformHealth).map(([platform, health]: [string, any]) => {
                      // Calculate heatmap color based on overall health
                      const getHealthClasses = () => {
                        const sentimentScore = health.sentiment || 50;
                        const negativePercent = health.negativePercent || 50;
                        const avgScore = (sentimentScore + (100 - negativePercent)) / 2;
                        if (avgScore >= 70) return 'border-green-500/30';
                        if (avgScore >= 50) return 'border-yellow-500/30';
                        return 'border-red-500/30';
      };

      return (
                        <tr key={platform} className={`border-b border-white/10 hover:bg-app-black/60 transition-colors bg-app-black/40 border-l-4 ${getHealthClasses()}`}>
                          <td className="py-3 px-4 text-white font-medium capitalize">{platform === 'x' ? 'X (Twitter)' : platform === 'appstore' ? 'App Store' : platform === 'playstore' ? 'Play Store' : platform}</td>
                          <td className="py-3 px-4 text-center">
                            {health.sentiment !== undefined ? (
                              <span className={`px-2 py-1 rounded text-xs font-semibold ${
                                health.sentiment >= 70 ? 'bg-green-500/20 text-green-400' :
                                health.sentiment >= 50 ? 'bg-yellow-500/20 text-yellow-400' :
                                'bg-red-500/20 text-red-400'
                              }`}>
                                {health.sentiment}%
                              </span>
                            ) : (
                              <span className="text-muted-foreground">-</span>
                            )}
                          </td>
                          <td className="py-3 px-4 text-center">
                            <span className={`px-2 py-1 rounded text-xs font-semibold ${
                              health.negativePercent >= 40 ? 'bg-red-500/20 text-red-400' :
                              health.negativePercent >= 30 ? 'bg-orange-500/20 text-orange-400' :
                              'bg-green-500/20 text-green-400'
                            }`}>
                              {health.negativePercent}%
                            </span>
                          </td>
                          <td className="py-3 px-4 text-center">
                            <span className={`px-2 py-1 rounded text-xs font-semibold ${
                              health.engagement === 'High' ? 'bg-purple-500/20 text-purple-400' :
                              health.engagement === 'Medium' ? 'bg-blue-500/20 text-blue-400' :
                              'bg-white/10 text-muted-foreground'
                            }`}>
                              {health.engagement}
                            </span>
                          </td>
                          <td className="py-3 px-4 text-center">
                            <span className={`px-2 py-1 rounded text-xs font-semibold ${
                              health.volume === 'High' ? 'bg-purple-500/20 text-purple-400' :
                              health.volume === 'Medium' ? 'bg-blue-500/20 text-blue-400' :
                              'bg-white/10 text-muted-foreground'
                            }`}>
                              {health.volume}
                            </span>
                          </td>
                          <td className="py-3 px-4 text-center">
                            {typeof health.virality === 'number' ? (
                              <span className={`px-2 py-1 rounded text-xs font-semibold ${
                                health.virality >= 3 ? 'bg-orange-500/20 text-orange-400' :
                                health.virality >= 1 ? 'bg-yellow-500/20 text-yellow-400' :
                                'bg-white/10 text-muted-foreground'
                              }`}>
                                {health.virality}
                              </span>
                            ) : (
                              <span className="text-muted-foreground">-</span>
                            )}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
                </div>
              </CardContent>
            </Card>

          {/* Topic Intelligence Layer */}
          {(trustpilotData || activeTab === 'all') && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Topic Trend Map */}
            <Card className="bg-app-black/60 border border-white/10 shadow-xl">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-white">
                    <TrendingUp className="h-5 w-5 text-purple-400" />
                    Top 10 Topics by Virality
                  </CardTitle>
                  <CardDescription className="text-muted-foreground">
                    Most viral cross-channel topics
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {channelTopicBreakdown.data.length > 0 ? (
                    <ResponsiveContainer width="100%" height={420}>
                      <BarChart
                        data={channelTopicBreakdown.data}
                        layout="vertical"
                        barCategoryGap="28%"
                        barGap={8}
                        barSize={18}
                        margin={{ top: 12, right: 115, left: 16, bottom: 8 }}
                      >
                        <defs>
                          {channelTopicBreakdown.data.map((row, index) => (
                            <linearGradient
                              key={row.topic}
                              id={`all-topic-gradient-${index}`}
                              x1="0"
                              y1="0"
                              x2="1"
                              y2="0"
                            >
                              {row.gradientStops.map((stop: { offset: number; color: string }, stopIdx: number) => (
                                <stop
                                  key={`${row.topic}-stop-${stopIdx}`}
                                  offset={`${stop.offset * 100}%`}
                                  stopColor={stop.color}
                                />
                              ))}
                            </linearGradient>
                          ))}
                        </defs>
                        <CartesianGrid stroke="#1e293b" strokeDasharray="3 6" horizontal vertical={false} />
                        <XAxis
                          type="number"
                          tickFormatter={(value) => `${Math.round((value || 0))}%`}
                          tick={{ fill: '#94a3b8', fontSize: 11 }}
                          axisLine={false}
                          tickLine={false}
                          allowDecimals
                          domain={[0, 100]}
                        />
                        <YAxis
                          dataKey="topic"
                          type="category"
                          width={240}
                          tick={{ fill: '#cbd5f5', fontSize: 12 }}
                          axisLine={false}
                          tickLine={false}
                        />
                        <Tooltip content={renderChannelTopicTooltip} />
                        <Legend
                          verticalAlign="bottom"
                          align="center"
                          content={renderAllTopicsLegend}
                          wrapperStyle={{ paddingTop: 8 }}
                        />
                        <Bar dataKey="totalPercent" isAnimationActive={false} radius={[14, 14, 14, 14]}>
                          {channelTopicBreakdown.data.map((row, index) => (
                            <Cell key={`${row.topic}-cell`} fill={`url(#all-topic-gradient-${index})`} />
                          ))}
                          <LabelList dataKey="totalVolume" content={renderChannelTotalLabel} />
                        </Bar>
                      </BarChart>
                  </ResponsiveContainer>
                  ) : (
                    <div className="rounded-lg border border-white/10 bg-app-black/60 px-4 py-12 text-center text-sm text-muted-foreground">
                      Not enough cross-channel topics to display yet.
                    </div>
                  )}
              </CardContent>
            </Card>

              {/* Positive Champion Drivers */}
              <Card className="bg-app-black/60 border border-white/10 shadow-xl">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-white">
                    <ThumbsUp className="h-5 w-5 text-green-400" />
                    Positive Champion Drivers
                  </CardTitle>
                  <CardDescription className="text-muted-foreground">
                    What people love about your brand
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3 max-h-[360px] overflow-y-auto pr-1">
                    {positiveChampionTopics.length === 0 ? (
                      <div className="text-center py-8 text-muted-foreground">
                        No positive topics found
                      </div>
                    ) : (
                      positiveChampionTopics.map(topic => (
                        <div
                          key={topic.topic}
                          className="flex items-center justify-between rounded-lg border border-green-500/30 bg-app-black/60 p-2.5"
                        >
                          <div className="flex items-center gap-3 flex-1">
                            <div className="w-2 h-2 rounded-full bg-green-400" />
                            <span className="text-[13px] text-white font-medium">{topic.topic}</span>
                          </div>
                          <div className="flex items-center gap-4">
                            <span className="text-[11px] text-green-400 font-semibold">
                              {Math.round((topic.sentiment + 1) * 50)}% positive
                            </span>
                            <span className="text-[11px] text-muted-foreground w-16 text-right">
                              {topic.volume.toLocaleString()} posts
                            </span>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>
          )}

          {/* Early Warning System */}
          <Card className="border-2 border-orange-500/50 bg-app-black/60">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-white">
                <AlertTriangle className="h-5 w-5 text-orange-400" />
                Early Warning System (AI Forecasting)
              </CardTitle>
              <CardDescription className="text-muted-foreground">
                AI-powered predictions for emerging issues and potential crises
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {[
                  {
                    type: 'warning',
                    title: 'Payment Failures Predicted to Increase',
                    description: 'Payment failures predicted to increase by 35% this week based on current trend patterns.',
                    impact: 'High',
                    timeframe: 'Next 7 days',
                    confidence: 87,
                  },
                  {
                    type: 'critical',
                    title: 'X Platform Negativity Rising',
                    description: 'X platform negativity rising at 2× normal rate — check for possible outage or service disruption.',
                    impact: 'Critical',
                    timeframe: 'Next 24 hours',
                    confidence: 92,
                  },
                  {
                    type: 'warning',
                    title: 'App Store Reviews Dropping',
                    description: 'AppStore reviews dropping — possibly crash in latest update. Current trend suggests 15% drop in rating.',
                    impact: 'High',
                    timeframe: 'Next 3 days',
                    confidence: 78,
                  },
                  {
                    type: 'info',
                    title: 'Positive Sentiment Spike Expected',
                    description: 'Positive sentiment spike expected due to new feature launch. Predicted 25% increase in positive mentions.',
                    impact: 'Low',
                    timeframe: 'Next 5 days',
                    confidence: 65,
                  },
                ].map((alert, idx) => (
                  <div
                    key={idx}
                    className={`p-4 rounded-lg border ${
                      alert.type === 'critical' ? 'bg-red-500/10 border-red-500/50' :
                      alert.type === 'warning' ? 'bg-orange-500/10 border-orange-500/50' :
                      'bg-blue-500/10 border-blue-500/50'
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <h4 className="text-sm font-bold text-white">{alert.title}</h4>
                          <span className={`px-2 py-0.5 rounded text-xs font-semibold ${
                            alert.impact === 'Critical' ? 'bg-red-500/30 text-red-300' :
                            alert.impact === 'High' ? 'bg-orange-500/30 text-orange-300' :
                            'bg-blue-500/30 text-blue-300'
                          }`}>
                            {alert.impact} Impact
                          </span>
                        </div>
                        <p className="text-xs text-white/80 mb-2">{alert.description}</p>
                        <div className="flex items-center gap-4 text-xs text-muted-foreground">
                          <span>⏱ {alert.timeframe}</span>
                          <span>📊 {alert.confidence}% confidence</span>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Sentiment Chart for All Channels */}
          {trustpilotData ? (
            (() => {
              // Expand Trustpilot trendData to daily dates if needed
              const expandToDailyDates = (data: Array<{ date: string; sentiment: number; reviewVolume: number }>) => {
                if (data.length === 0) return data;
                
                // Check if data is already daily (more than 20 data points likely means daily)
                if (data.length > 20) {
                  // Already daily, just ensure dates are properly formatted
                  return data.map(d => ({
                    ...d,
                    date: new Date(d.date).toISOString().split('T')[0] // Ensure YYYY-MM-DD format
                  }));
                }
                
                // If not daily, expand to daily dates
                const sortedData = [...data].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
                const firstDate = new Date(sortedData[0].date);
                const lastDate = new Date(sortedData[sortedData.length - 1].date);
                const dailyData: Array<{ date: string; sentiment: number; reviewVolume: number }> = [];
                
                // Create a map of existing data points
                const dataMap = new Map<string, { sentiment: number; reviewVolume: number }>();
                sortedData.forEach(d => {
                  const dateKey = new Date(d.date).toISOString().split('T')[0];
                  dataMap.set(dateKey, { sentiment: d.sentiment, reviewVolume: d.reviewVolume });
                });
                
                // Generate daily dates
                const currentDate = new Date(firstDate);
                let lastKnownData: { date: string; sentiment: number; reviewVolume: number } = sortedData[0];
                
                while (currentDate <= lastDate) {
                  const dateKey = currentDate.toISOString().split('T')[0];
                  const existingData = dataMap.get(dateKey);
                  
                  if (existingData) {
                    const dataPoint = {
                      date: dateKey,
                      sentiment: existingData.sentiment,
                      reviewVolume: existingData.reviewVolume
                    };
                    dailyData.push(dataPoint);
                    lastKnownData = dataPoint;
                  } else {
                    // Interpolate or use last known value for missing days
                    dailyData.push({
                      date: dateKey,
                      sentiment: lastKnownData.sentiment,
                      reviewVolume: Math.round(lastKnownData.reviewVolume * 0.8) // Slightly lower for missing days
                    });
                  }
                  
                  currentDate.setDate(currentDate.getDate() + 1);
                }
                
                return dailyData;
              };
              
              const dailyTrendData = expandToDailyDates(trustpilotData.trendData);
              return renderSentimentChart(dailyTrendData, 'all');
            })()
          ) : (
            (() => {
              // Generate mock trend data for all channels
              const today = new Date();
              const mockData: Array<{ date: string; sentiment: number; reviewVolume: number }> = [];
              
              for (let i = 29; i >= 0; i--) {
                const date = new Date(today);
                date.setDate(date.getDate() - i);
                const dateStr = date.toISOString().split('T')[0];
                const baseSentiment = Math.sin(i * 0.2) * 0.5;
                const baseVolume = 50 + Math.sin(i * 0.3) * 30;
                
                mockData.push({
                  date: dateStr,
                  sentiment: baseSentiment,
                  reviewVolume: Math.round(baseVolume),
                });
              }
              
              return renderSentimentChart(mockData, 'all');
            })()
          )}
        </div>
      );
    }

    if (channel === 'trustpilot') {
      return (
        <TrustpilotDashboard
          trustpilotEnhancedData={trustpilotEnhancedData}
          trustpilotData={trustpilotData}
          selectedCluster={selectedCluster}
          setSelectedCluster={setSelectedCluster}
          selectedSubcluster={selectedSubcluster}
          setSelectedSubcluster={setSelectedSubcluster}
          reviewFilters={reviewFilters}
          setReviewFilters={setReviewFilters}
          reviewSortBy={reviewSortBy}
          setReviewSortBy={setReviewSortBy}
          filteredAndSortedReviews={filteredAndSortedReviews}
          getReviewsForSelection={getReviewsForSelection}
          renderSentimentChart={renderSentimentChart}
        />
      );
    }

    if (channel === 'x') {
      return <XDashboard />;
    }

    if (channel === 'reddit') {
      return <RedditDashboard />;
    }

    if (channel === 'appstore') {
      return <AppStoreDashboard />;
    }

    if (channel === 'playstore') {
      return <PlayStoreDashboard />;
    }

    // Other channels - use mock trend data
    // Generate mock trend data for the last 30 days
    const generateMockTrendData = () => {
      const today = new Date();
      const mockData: Array<{ date: string; sentiment: number; reviewVolume: number }> = [];
      
      for (let i = 29; i >= 0; i--) {
        const date = new Date(today);
        date.setDate(date.getDate() - i);
        const dateStr = date.toISOString().split('T')[0];
        
        // Generate varied sentiment and volume based on channel
        const baseSentiment = Math.sin(i * 0.2) * 0.5; // Wave pattern
        const channelVariation: Record<Channel, number> = {
          'all': 0,
          'trustpilot': 0,
          'x': 0.1,
          'reddit': -0.1,
          'appstore': 0.2,
          'playstore': 0.15,
        };
        
        const sentiment = baseSentiment + (channelVariation[channel] || 0);
        const baseVolume = 50 + Math.sin(i * 0.3) * 30;
        const volumeMultiplier: Record<Channel, number> = {
          'all': 1,
          'trustpilot': 1,
          'x': 1.2,
          'reddit': 0.9,
          'appstore': 0.7,
          'playstore': 0.7,
        };
        
        mockData.push({
          date: dateStr,
          sentiment: sentiment,
          reviewVolume: Math.round(baseVolume * (volumeMultiplier[channel] || 1)),
        });
      }
      
      return mockData;
    };
    
    const mockTrendData = generateMockTrendData();
    
    return (
      <div className="space-y-6">
        {/* Sentiment Chart for other channels */}
        {renderSentimentChart(mockTrendData, channel)}
      </div>
    );
  };

  if (isLoading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="flex items-center gap-3">
          <RefreshCw className="h-6 w-6 animate-spin text-purple-400" />
          <span className="text-lg text-muted-foreground">Loading dashboard...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fade-in pb-6">
      {/* Header */}
      <div className="space-y-4 animate-slide-down">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="mb-2 text-4xl font-bold text-foreground">Social Media Dashboard</h1>
            <p className="flex items-center gap-2 text-lg text-muted-foreground">
              <span className="text-xl">✨</span>
              Multi-channel insights and trends across key channels
            </p>
          </div>
          <div className="flex flex-col gap-3">
            <div className="flex justify-end">
              <Button
                onClick={() => console.log('Social AI assistant coming soon')}
                className="bg-gradient-to-r from-[#b90abd] to-[#5332ff] hover:from-[#a009b3] hover:to-[#4a2ae6] text-white transition-all duration-200 group h-[38px] px-6"
              >
                <span className="text-lg mr-2 group-hover:rotate-180 transition-transform duration-500 inline-block">✨</span>
                Generate your day in 2 minutes
              </Button>
            </div>
            <div className="flex items-center gap-2 justify-end">
              <label className="text-xs text-muted-foreground whitespace-nowrap">Filters:</label>
              <div className="relative z-50">
                <Select value={dateFilterPreset} onValueChange={handlePresetChange}>
                  <SelectTrigger className="h-[38px] w-[180px] border border-white/10 bg-app-black/60 text-sm text-foreground">
                    <SelectValue placeholder="Select period" />
                  </SelectTrigger>
                  <SelectContent className="z-[9999] border border-white/10 bg-app-black/80 text-foreground">
                    <SelectItem value="All">All</SelectItem>
                    <SelectItem value="Current day">Current day</SelectItem>
                    <SelectItem value="One Week">One Week</SelectItem>
                    <SelectItem value="One Month">One Month</SelectItem>
                    <SelectItem value="6 Months">6 Months</SelectItem>
                    <SelectItem value="Custom">Custom</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {dateFilterPreset === 'Custom' && (
                <>
                  <label className="text-xs text-muted-foreground whitespace-nowrap">Start Date:</label>
                  <input
                    type="date"
                    value={dateRange.start}
                    onChange={(e) => setDateRange(prev => ({ ...prev, start: e.target.value }))}
                    className="h-[38px] rounded-md border border-white/10 bg-app-black/60 px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-purple-500"
                  />
                  <label className="text-xs text-muted-foreground whitespace-nowrap">End Date:</label>
                  <input
                    type="date"
                    value={dateRange.end}
                    onChange={(e) => setDateRange(prev => ({ ...prev, end: e.target.value }))}
                    className="h-[38px] rounded-md border border-white/10 bg-app-black/60 px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-purple-500"
                  />
                </>
              )}

              <Button
                size="sm"
                onClick={loadDashboardData}
                className="bg-gradient-to-r from-[#b90abd] to-[#5332ff] hover:from-[#a009b3] hover:to-[#4a2ae6] text-white shadow-lg hover:shadow-[#b90abd]/30 transition-all duration-200 h-[38px]"
              >
                Apply
                <RefreshCw className="h-4 w-4 ml-2" />
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as Channel)} className="w-full">
          <TabsList className="h-auto border border-white/10 bg-app-black/60 p-1 shadow-lg">
            <TabsTrigger 
              value="all" 
              className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-[#b90abd] data-[state=active]:to-[#5332ff] data-[state=active]:text-white text-muted-foreground hover:text-white"
            >
              {getChannelIcon('all')}
              <span className="ml-2">All</span>
            </TabsTrigger>
            <TabsTrigger 
              value="trustpilot" 
              className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-[#b90abd] data-[state=active]:to-[#5332ff] data-[state=active]:text-white text-muted-foreground hover:text-white"
            >
              {getChannelIcon('trustpilot')}
              <span className="ml-2">Trustpilot</span>
            </TabsTrigger>
            <TabsTrigger 
              value="x" 
              className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-[#b90abd] data-[state=active]:to-[#5332ff] data-[state=active]:text-white text-muted-foreground hover:text-white"
            >
              {getChannelIcon('x')}
              <span className="ml-2">X</span>
            </TabsTrigger>
            <TabsTrigger 
              value="reddit" 
              className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-[#b90abd] data-[state=active]:to-[#5332ff] data-[state=active]:text-white text-muted-foreground hover:text-white"
            >
              {getChannelIcon('reddit')}
              <span className="ml-2">Reddit</span>
            </TabsTrigger>
            <TabsTrigger 
              value="appstore" 
              className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-[#b90abd] data-[state=active]:to-[#5332ff] data-[state=active]:text-white text-muted-foreground hover:text-white"
            >
              {getChannelIcon('appstore')}
              <span className="ml-2">App Store</span>
            </TabsTrigger>
            <TabsTrigger 
              value="playstore" 
              className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-[#b90abd] data-[state=active]:to-[#5332ff] data-[state=active]:text-white text-muted-foreground hover:text-white"
            >
              {getChannelIcon('playstore')}
              <span className="ml-2">Play Store</span>
            </TabsTrigger>
          </TabsList>

          {/* Tab Contents */}
          <TabsContent value="all" className="mt-6">
            {renderChannelContent('all')}
          </TabsContent>
          <TabsContent value="trustpilot" className="mt-6">
            {renderChannelContent('trustpilot')}
          </TabsContent>
          <TabsContent value="x" className="mt-6">
            {renderChannelContent('x')}
          </TabsContent>
          <TabsContent value="reddit" className="mt-6">
            {renderChannelContent('reddit')}
          </TabsContent>
          <TabsContent value="appstore" className="mt-6">
            {renderChannelContent('appstore')}
          </TabsContent>
        <TabsContent value="playstore" className="mt-6">
          {renderChannelContent('playstore')}
        </TabsContent>
      </Tabs>
    </div>
  );
}
