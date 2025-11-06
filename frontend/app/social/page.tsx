'use client';

import { useState, useEffect, useCallback, useMemo, Fragment } from 'react';
import {
  getExecutiveAlerts,
  getTrustpilotDashboard,
  getTrustpilotEnhancedDashboard,
  ExecutiveAlert,
  TrustpilotDashboardData,
  TrustpilotEnhancedDashboardData,
  TrustpilotFilters,
  TrustpilotActionFunnel,
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
  DollarSign,
  Users,
  Zap,
  X,
  ExternalLink,
  Play,
  Clock,
  AlertCircle,
  MessageSquare,
  Star,
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
} from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend, LineChart, Line, ScatterChart, Scatter, Cell, PieChart, Pie, AreaChart, Area, ComposedChart } from 'recharts';
import TrustpilotDashboard from './trustpilot/page';
import XDashboard from './x/page';
import RedditDashboard from './reddit/page';
import AppStoreDashboard from './appstore/page';
import PlayStoreDashboard from './playstore/page';

type Channel = 'all' | 'trustpilot' | 'x' | 'reddit' | 'appstore' | 'playstore';

export default function SocialMediaDashboard() {
  // Data states
  const [alerts, setAlerts] = useState<ExecutiveAlert[]>([]);
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
  const [dismissedAlerts, setDismissedAlerts] = useState<Set<string>>(new Set());
  const [activeTab, setActiveTab] = useState<Channel>('all');
  const [dateFilterPreset, setDateFilterPreset] = useState<string>('One Month');
  const [dateRange, setDateRange] = useState<{ start: string; end: string }>({ start: '', end: '' });
  
  // Track clicked point for tooltip
  const [clickedPoint, setClickedPoint] = useState<{ date: string; sentimentLevel: number } | null>(null);
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
      const alertsData = await getExecutiveAlerts();
      setAlerts(alertsData);
      
      // Load Trustpilot data if that tab is active
      if (activeTab === 'trustpilot') {
        const tpData = await getTrustpilotDashboard(trustpilotFilters);
        setTrustpilotData(tpData);
        // Also load enhanced dashboard data
        const enhancedData = await getTrustpilotEnhancedDashboard(trustpilotFilters);
        setTrustpilotEnhancedData(enhancedData);
      }
      
      // Load channel-specific data (placeholder for now)
      setChannelData({
        all: alertsData,
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

  const handleDismissAlert = useCallback((alertId: string) => {
    setDismissedAlerts(prev => new Set(prev).add(alertId));
  }, []);

  const handleAlertAction = useCallback((alert: ExecutiveAlert, action: string) => {
    console.log('Alert action:', action, alert.id);
    // Handle different actions: assign, escalate, view, etc.
  }, []);

  const visibleAlerts = useMemo(
    () => alerts.filter(alert => !dismissedAlerts.has(alert.id)),
    [alerts, dismissedAlerts]
  );

  const getAlertColor = (type: string) => {
    switch (type) {
      case 'critical':
        return 'bg-red-500/10 border-red-500/50';
      case 'urgent':
        return 'bg-orange-500/10 border-orange-500/50';
      default:
        return 'bg-yellow-500/10 border-yellow-500/50';
    }
  };

  const getAlertIcon = (type: string) => {
    switch (type) {
      case 'critical':
        return <AlertTriangle className="h-5 w-5 text-red-400" />;
      case 'urgent':
        return <Clock className="h-5 w-5 text-orange-400" />;
      default:
        return <AlertCircle className="h-5 w-5 text-yellow-400" />;
    }
  };

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
  const renderSentimentChart = (trendData: Array<{ date: string; sentiment: number; reviewVolume: number }>, channel: Channel) => {
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

    // Create time-based data structure: for each day, simulate daily social media posts
    const seededRandom = (seed: number, min: number, max: number) => {
      const x = Math.sin(seed) * 10000;
      return Math.floor((x - Math.floor(x)) * (max - min + 1)) + min;
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
      const topicsBySentiment: Record<number, Array<{ topic: string; volume: number; postCount: number }>> = {
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
          postCount: Math.round(calmBasePosts * 0.3)
        });
        topicsBySentiment[1].push({ 
          topic: 'Digital Innovation Appreciation', 
          volume: Math.round(calmBasePosts * 0.35),
          postCount: Math.round(calmBasePosts * 0.25)
        });
        topicsBySentiment[1].push({ 
          topic: 'Trade Finance Satisfaction', 
          volume: Math.round(calmBasePosts * 0.25),
          postCount: Math.round(calmBasePosts * 0.2)
        });
      } else {
        topicsBySentiment[1].push({ 
          topic: 'Excellent Call Support', 
          volume: calmBasePosts,
          postCount: Math.round(calmBasePosts * 0.7)
        });
      }

      // Level 2 (Satisfied)
      const satisfiedPosts = Math.round(30 + seededRandom(dateSeed + 2, 0, 40) + (Math.max(0, dailySentiment) * 30));
      topicsBySentiment[2].push({ 
        topic: 'Service Information Request', 
        volume: Math.round(satisfiedPosts * 0.5),
        postCount: Math.round(satisfiedPosts * 0.4)
      });
      topicsBySentiment[2].push({ 
        topic: 'Trade Finance Satisfaction', 
        volume: Math.round(satisfiedPosts * 0.5),
        postCount: Math.round(satisfiedPosts * 0.35)
      });

      // Level 3 (Neutral)
      const neutralPosts = Math.round(35 + seededRandom(dateSeed + 3, 0, 25));
      topicsBySentiment[3].push({ 
        topic: 'Mobile App Crashes', 
        volume: Math.round(neutralPosts * 0.6),
        postCount: Math.round(neutralPosts * 0.5)
      });
      topicsBySentiment[3].push({ 
        topic: 'Service Information Request', 
        volume: Math.round(neutralPosts * 0.4),
        postCount: Math.round(neutralPosts * 0.4)
      });

      // Level 4 (Frustrated)
      const frustratedBasePosts = dailySentiment < -0.1
        ? Math.round(40 + seededRandom(dateSeed + 4, 0, 50) + (Math.abs(dailySentiment) * 40))
        : Math.round(15 + seededRandom(dateSeed + 4, 0, 20));
      
      if (frustratedBasePosts > 25) {
        topicsBySentiment[4].push({ 
          topic: 'Payment Processing Failure', 
          volume: Math.round(frustratedBasePosts * 0.4),
          postCount: Math.round(frustratedBasePosts * 0.35)
        });
        topicsBySentiment[4].push({ 
          topic: 'Account Access Problems', 
          volume: Math.round(frustratedBasePosts * 0.35),
          postCount: Math.round(frustratedBasePosts * 0.3)
        });
        topicsBySentiment[4].push({ 
          topic: 'Fee Structure Criticism', 
          volume: Math.round(frustratedBasePosts * 0.25),
          postCount: Math.round(frustratedBasePosts * 0.25)
        });
      } else {
        topicsBySentiment[4].push({ 
          topic: 'Account Access Problems', 
          volume: frustratedBasePosts,
          postCount: Math.round(frustratedBasePosts * 0.8)
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
          postCount: Math.round(veryFrustratedBasePosts * 0.35)
        });
        topicsBySentiment[5].push({ 
          topic: 'System Outage Frustration', 
          volume: Math.round(veryFrustratedBasePosts * 0.35),
          postCount: Math.round(veryFrustratedBasePosts * 0.3)
        });
        topicsBySentiment[5].push({ 
          topic: 'Mobile App Crashes', 
          volume: Math.round(veryFrustratedBasePosts * 0.25),
          postCount: Math.round(veryFrustratedBasePosts * 0.25)
        });
      } else {
        topicsBySentiment[5].push({ 
          topic: 'System Outage Frustration', 
          volume: veryFrustratedBasePosts,
          postCount: Math.round(veryFrustratedBasePosts * 0.9)
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
      
      const multiplier = channelMultipliers[channel] || 1;
      const channelSeed = channelIndex * 100 + timePoint.date.length;
      
      const channelTopicsBySentiment: Record<number, Array<{ topic: string; volume: number; postCount: number }>> = {
        1: [], 2: [], 3: [], 4: [], 5: []
      };
      
      sentimentLevels.forEach((level) => {
        const baseTopics = timePoint.topicsBySentiment[level];
        baseTopics.forEach((topic) => {
          const channelVariation = seededRandom(channelSeed + level, -10, 10);
          const scaledVolume = Math.max(1, Math.round(topic.volume * multiplier + channelVariation));
          const scaledPostCount = Math.max(1, Math.round((topic.postCount || 0) * multiplier + channelVariation * 0.7));
          
          channelTopicsBySentiment[level].push({
            topic: topic.topic,
            volume: scaledVolume,
            postCount: scaledPostCount,
          });
        });
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
      
      const channelDataMap: Record<Channel, Record<number, Array<{ topic: string; volume: number; postCount: number }>>> = {
        'all': timePoint.topicsBySentiment,
        'trustpilot': timePoint.topicsBySentiment,
      } as any;
      
      sentimentChannels.forEach((ch) => {
        channelDataMap[ch] = createChannelData(timePoint, ch, timeIndex);
      });
      
      dataPoint.channelData = channelDataMap;
      
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
          const allTopics: Array<{ topic: string; volume: number; postCount: number }> = [];
          const topicMap = new Map<string, { volume: number; postCount: number }>();
          
          (Object.values(dataPoint.channelData || {}) as Array<Record<number, Array<{ topic: string; volume: number; postCount: number }>>>).forEach((channelTopics) => {
            const levelTopics = channelTopics[level] || [];
            levelTopics.forEach((topic: { topic: string; volume: number; postCount: number }) => {
              const existing = topicMap.get(topic.topic);
              if (existing) {
                existing.volume += topic.volume;
                existing.postCount += topic.postCount;
              } else {
                topicMap.set(topic.topic, { volume: topic.volume, postCount: topic.postCount });
              }
              totalVolume += topic.volume;
              totalPosts += topic.postCount;
            });
          });
          
          // Add channel-specific variation
          const variation = getChannelVariation(channel, dataIndex, level);
          totalVolume = Math.max(1, Math.round(totalVolume * (1 + variation)));
          
          topicMap.forEach((value, key) => {
            allTopics.push({ topic: key, ...value });
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
          const topics: Array<{ topic: string; volume: number; postCount: number }> = channelData[level] || [];
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
      <Card className="bg-gray-900 border-gray-700">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-white">
            <BarChart3 className="h-5 w-5 text-purple-400" />
            Daily Social Media Posts by Sentiment Level
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex gap-4">
            <div className={`transition-all duration-300 ${clickedPoint ? 'w-2/3' : 'w-full'}`}>
              <ResponsiveContainer width="100%" height={500}>
                <LineChart data={filteredSentimentTimeLineData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                  <XAxis 
                    dataKey="date" 
                    stroke="#9CA3AF" 
                    fontSize={12}
                    label={{ value: 'Time Frame', position: 'insideBottom', offset: -5, style: { fill: '#9CA3AF' } }}
                  />
                  <YAxis 
                    domain={yAxisDomain}
                    stroke="#9CA3AF" 
                    fontSize={12}
                    label={{ value: 'Number of Posts (Volume)', angle: -90, position: 'insideLeft', style: { fill: '#9CA3AF' } }}
                  />
                  <Legend 
                    wrapperStyle={{ 
                      paddingTop: '20px',
                      display: 'flex',
                      flexWrap: 'wrap',
                      justifyContent: 'center',
                      gap: '16px',
                      alignItems: 'center'
                    }}
                    iconType="circle"
                    formatter={(value: string) => {
                      const levelMatch = value.match(/Level (\d)/);
                      if (levelMatch) {
                        const level = parseInt(levelMatch[1]);
                        return `Level ${level}: ${sentimentLevelLabels[level - 1]}`;
                      }
                      return value;
                    }}
                    content={({ payload }) => {
                      if (!payload || payload.length === 0) return null;
                      
                      return (
                        <div style={{
                          display: 'flex',
                          flexWrap: 'wrap',
                          justifyContent: 'center',
                          gap: '20px',
                          alignItems: 'center',
                          paddingTop: '20px',
                          width: '100%'
                        }}>
                          {payload.map((entry: any, index: number) => {
                            if (!entry || !entry.dataKey) return null;
                            const levelMatch = entry.dataKey.toString().match(/Level (\d)/);
                            if (!levelMatch) return null;
                            
                            const level = parseInt(levelMatch[1]);
                            const colors = [
                              '#10b981', '#3b82f6', '#9CA3AF', '#f59e0b', '#ef4444',
                            ];
                            const color = colors[level - 1];
                            
                            return (
                              <div key={index} style={{ display: 'flex', alignItems: 'center', gap: '6px', margin: '4px 0' }}>
                                <div style={{ width: '12px', height: '12px', borderRadius: '50%', backgroundColor: color, flexShrink: 0 }} />
                                <span style={{ color: '#9CA3AF', fontSize: '12px', whiteSpace: 'nowrap' }}>
                                  Level {level}: {sentimentLevelLabels[level - 1]}
                                </span>
                              </div>
                            );
                          })}
                        </div>
                      );
                    }}
                  />
                  {sentimentLevels.map((level) => {
                    const colors = ['#10b981', '#3b82f6', '#9CA3AF', '#f59e0b', '#ef4444'];
                    const lineColor = colors[level - 1];
                    
                    const CustomDot = (props: any) => {
                      const { cx, cy, payload } = props;
                      if (!cx || !cy || !payload) return null;
                      
                      const dateValue = payload.date || payload.fullDate;
                      if (!dateValue) return null;
                      
                      const isClicked = clickedPoint?.date === dateValue && clickedPoint?.sentimentLevel === level;
                      const levelValue = payload[`Level ${level}`];
                      if (levelValue === null || levelValue === undefined || (typeof levelValue === 'number' && levelValue < 1)) {
                        return null;
                      }
                      
                      return (
                        <circle
                          cx={cx}
                          cy={cy}
                          r={isClicked ? 6 : 4}
                          fill={lineColor}
                          stroke="#fff"
                          strokeWidth={isClicked ? 2 : 1.5}
                          cursor="pointer"
                          style={{
                            filter: isClicked ? `drop-shadow(0 0 4px ${lineColor})` : 'none',
                            transition: 'all 0.2s'
                          }}
                          onClick={(e) => {
                            e.stopPropagation();
                            e.preventDefault();
                            const formattedDate = payload.date || dateValue;
                            setClickedPoint({ date: formattedDate, sentimentLevel: level });
                          }}
                        />
                      );
                    };
                    
                    return (
                      <Line
                        key={`sentiment-level-${level}`}
                        type="monotone"
                        dataKey={`Level ${level}`}
                        stroke={lineColor}
                        strokeWidth={2.5}
                        strokeOpacity={0.7}
                        dot={<CustomDot />}
                        activeDot={false}
                        name={`Level ${level}`}
                        connectNulls={false}
                        isAnimationActive={false}
                      />
                    );
                  })}
                </LineChart>
              </ResponsiveContainer>
            </div>
            
            {clickedPoint && (() => {
              const dataPoint = filteredSentimentTimeLineData.find(d => d.date === clickedPoint.date);
              if (!dataPoint) return null;
              
              const sentimentLevel = clickedPoint.sentimentLevel;
              const dataPointValue = dataPoint[`Level ${sentimentLevel}`] as number;
              
              if (dataPointValue === null || dataPointValue === undefined || dataPointValue < 1) {
                return null;
              }
              
              const topics = dataPoint[`topics_${sentimentLevel}`] as Array<{ topic: string; volume: number; postCount?: number }> || [];
              const totalPosts = dataPoint[`postCount_${sentimentLevel}`] as number || 0;
              const sortedTopics = [...topics].sort((a, b) => b.volume - a.volume);
              
              const sentimentColors = ['#10b981', '#3b82f6', '#9CA3AF', '#f59e0b', '#ef4444'];
              const sentimentColor = sentimentColors[sentimentLevel - 1];
              
              return (
                <div className="w-1/3 transition-all duration-300">
                  <Card className="bg-gray-900 border-gray-700 h-full">
                    <CardHeader className="relative">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setClickedPoint(null)}
                        className="absolute top-2 right-2 h-8 w-8 p-0 text-gray-400 hover:text-white"
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
                        {clickedPoint.date}
                      </CardTitle>
                      <CardDescription className="text-gray-400">
                        Sentiment Level {sentimentLevel}: {sentimentLevelLabels[sentimentLevel - 1]}
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="p-4 bg-gray-800 rounded-lg border" style={{ borderColor: `${sentimentColor}30` }}>
                        <div className="flex justify-between items-center">
                          <span className="text-sm text-gray-400">Total Posts:</span>
                          <span className="text-lg font-bold" style={{ color: sentimentColor }}>
                            {totalPosts} posts
                          </span>
                        </div>
                      </div>
                      
                      {sortedTopics.length > 0 ? (
                        <div>
                          <h4 className="text-sm font-semibold text-gray-400 mb-3 uppercase tracking-wide">
                            Topics for {sentimentLevelLabels[sentimentLevel - 1]} ({sortedTopics.length})
                          </h4>
                          <div className="space-y-3 max-h-[400px] overflow-y-auto pr-2">
                            {sortedTopics.map((topic, idx) => (
                              <div key={idx} className="p-3 bg-gray-800 rounded-lg border border-gray-700">
                                <div className="flex justify-between items-start gap-3">
                                  <span className="text-sm font-medium text-white flex-1">
                                    {topic.topic}
                                  </span>
                                  <div className="flex flex-col items-end gap-2 min-w-[100px]">
                                    {topic.postCount !== undefined && topic.postCount > 0 && (
                                      <span className="text-xs font-bold text-green-400 bg-green-900/30 px-2 py-1 rounded">
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
                        <div className="text-center py-8 text-gray-400">
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
    if (!trustpilotData) {
      // Return mock KPIs when no data
      return {
        totalMentions7d: 8923,
        totalMentions30d: 34256,
        avgSentimentScore: 72.5,
        negativitySpikePercent: 22.3,
        platformWithHighestNegativity: 'Reddit',
        top3TrendingTopics: ['Payment Processing', 'Login Issues', 'Customer Support'],
        viralityIndex: 8.5,
        emotionMix: { calm: 45, frustrated: 25, delighted: 30 },
        platformHealth: {
          x: { sentiment: 62, negativePercent: 38, rating: null, engagement: 'High', volume: 'High', virality: 2 },
          reddit: { sentiment: 54, negativePercent: 46, rating: null, engagement: 'Medium', volume: 'Medium', virality: 1 },
          trustpilot: { sentiment: 72, negativePercent: 28, rating: 4.2, engagement: 'Low', volume: 'Low', virality: 0 },
          appstore: { sentiment: 68, negativePercent: 32, rating: 4.6, engagement: 'Medium', volume: 'Medium', virality: 0 },
          playstore: { sentiment: 58, negativePercent: 42, rating: 3.4, engagement: 'High', volume: 'High', virality: 3 },
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
    const negativitySpikePercent = prev7dNegative > 0 
      ? ((current7dNegative - prev7dNegative) / prev7dNegative * 100)
      : 0;
    
    // Find top 3 trending topics
    const top3Topics = topicBubbles
      .sort((a, b) => b.volume - a.volume)
      .slice(0, 3)
      .map(t => t.topic);
    
    // Calculate virality index (simulated from engagement metrics)
    const viralityIndex = Math.min(10, Math.round((mentions7d / 1000) * 0.5 + (top3Topics.length * 1.5)));
    
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
      totalMentions7d: mentions7d,
      totalMentions30d: mentions30d,
      avgSentimentScore: sentimentScore,
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
  }, [trustpilotData, alerts]);

  const renderChannelContent = (channel: Channel) => {
    if (channel === 'all') {
  return (
            <div className="space-y-6">
          {/* Brand Health KPI Zone - Phase 1 Spec */}
          <Card className="bg-gray-900 border-gray-700">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-white">
                <BarChart3 className="h-5 w-5 text-purple-400" />
                Brand Health KPI Zone
              </CardTitle>
              <CardDescription className="text-gray-400">
                Overall brand health at a glance
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-4">
                {/* Total Mentions */}
                <div className="bg-gray-800 rounded-lg p-4 border border-gray-700">
                  <div className="text-xs text-gray-400 mb-1">Total Mentions</div>
                  <div className="text-2xl font-bold text-white mb-1">{calculateBrandHealthKPIs.totalMentions7d.toLocaleString()}</div>
                  <div className="text-xs text-gray-500">7d / {calculateBrandHealthKPIs.totalMentions30d.toLocaleString()} 30d</div>
                  <div className="mt-2 h-1 bg-gray-700 rounded-full overflow-hidden">
                    <div className="h-full bg-purple-500 rounded-full" style={{ width: '70%' }}></div>
                  </div>
                </div>

                {/* Average Sentiment Score */}
                <div className="bg-gray-800 rounded-lg p-4 border border-gray-700">
                  <div className="text-xs text-gray-400 mb-1">Avg Sentiment</div>
                  <div className="flex items-center gap-2 mb-1">
                    <div className="text-2xl font-bold text-white">{calculateBrandHealthKPIs.avgSentimentScore}%</div>
                    <div className={`text-xs px-2 py-0.5 rounded ${
                      calculateBrandHealthKPIs.avgSentimentScore >= 70 ? 'bg-green-500/20 text-green-400' :
                      calculateBrandHealthKPIs.avgSentimentScore >= 50 ? 'bg-yellow-500/20 text-yellow-400' :
                      'bg-red-500/20 text-red-400'
                    }`}>
                      {calculateBrandHealthKPIs.avgSentimentScore >= 70 ? 'Good' : calculateBrandHealthKPIs.avgSentimentScore >= 50 ? 'Fair' : 'Poor'}
                    </div>
                  </div>
                  <div className="h-1 bg-gray-700 rounded-full overflow-hidden">
                    <div 
                      className={`h-full rounded-full ${
                        calculateBrandHealthKPIs.avgSentimentScore >= 70 ? 'bg-green-500' :
                        calculateBrandHealthKPIs.avgSentimentScore >= 50 ? 'bg-yellow-500' :
                        'bg-red-500'
                      }`}
                      style={{ width: `${calculateBrandHealthKPIs.avgSentimentScore}%` }}
                    ></div>
                  </div>
                </div>

                {/* Negativity Spike */}
                <div className="bg-gray-800 rounded-lg p-4 border border-gray-700">
                  <div className="text-xs text-gray-400 mb-1">Negativity Spike</div>
                  <div className={`text-2xl font-bold flex items-center gap-1 ${
                    calculateBrandHealthKPIs.negativitySpikePercent > 0 ? 'text-red-400' : 'text-green-400'
                  }`}>
                    {calculateBrandHealthKPIs.negativitySpikePercent > 0 ? <TrendingUp className="h-5 w-5" /> : <TrendingDown className="h-5 w-5" />}
                    {Math.abs(calculateBrandHealthKPIs.negativitySpikePercent).toFixed(1)}%
                  </div>
                  <div className="text-xs text-gray-500 mt-1">Early warning indicator</div>
                </div>

                {/* Platform with Highest Negativity */}
                <div className="bg-gray-800 rounded-lg p-4 border border-red-500/50">
                  <div className="text-xs text-gray-400 mb-1">Highest Negativity</div>
                  <div className="text-xl font-bold text-red-400">{calculateBrandHealthKPIs.platformWithHighestNegativity}</div>
                  <div className="text-xs text-gray-500 mt-1">Priority platform</div>
                </div>

                {/* Top 3 Trending Topics */}
                <div className="bg-gray-800 rounded-lg p-4 border border-gray-700">
                  <div className="text-xs text-gray-400 mb-2">Top 3 Trending</div>
                  <div className="space-y-1">
                    {calculateBrandHealthKPIs.top3TrendingTopics.map((topic, idx) => (
                      <div key={idx} className="text-xs text-white truncate" title={topic}>
                        {idx + 1}. {topic}
                      </div>
                    ))}
                  </div>
                </div>

                {/* Virality Index */}
                <div className="bg-gray-800 rounded-lg p-4 border border-gray-700">
                  <div className="text-xs text-gray-400 mb-1">Virality Index</div>
                  <div className="text-2xl font-bold text-orange-400">{calculateBrandHealthKPIs.viralityIndex}/10</div>
                  <div className="flex gap-1 mt-2">
                    {Array.from({ length: 10 }).map((_, i) => (
                      <div
                        key={i}
                        className={`h-1 flex-1 rounded ${
                          i < calculateBrandHealthKPIs.viralityIndex ? 'bg-orange-500' : 'bg-gray-700'
                        }`}
                      ></div>
                    ))}
                  </div>
                </div>

                {/* Customer Emotion Mix - Donut Chart */}
                <div className="bg-gray-800 rounded-lg p-4 border border-gray-700">
                  <div className="text-xs text-gray-400 mb-2">Emotion Mix</div>
                  <ResponsiveContainer width="100%" height={80}>
                    <PieChart>
                      <Pie
                        data={[
                          { name: 'Calm', value: calculateBrandHealthKPIs.emotionMix.calm, fill: '#10b981' },
                          { name: 'Frustrated', value: calculateBrandHealthKPIs.emotionMix.frustrated, fill: '#ef4444' },
                          { name: 'Delighted', value: calculateBrandHealthKPIs.emotionMix.delighted, fill: '#3b82f6' },
                        ]}
                        cx="50%"
                        cy="50%"
                        innerRadius={20}
                        outerRadius={35}
                        dataKey="value"
                      >
                        {[
                          { name: 'Calm', value: calculateBrandHealthKPIs.emotionMix.calm, fill: '#10b981' },
                          { name: 'Frustrated', value: calculateBrandHealthKPIs.emotionMix.frustrated, fill: '#ef4444' },
                          { name: 'Delighted', value: calculateBrandHealthKPIs.emotionMix.delighted, fill: '#3b82f6' },
                        ].map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.fill} />
                        ))}
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                  <div className="flex gap-2 mt-2 text-[10px] justify-center">
                    <div className="flex items-center gap-1">
                      <div className="w-2 h-2 rounded-full bg-green-500"></div>
                      <span className="text-gray-400">{calculateBrandHealthKPIs.emotionMix.calm}%</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <div className="w-2 h-2 rounded-full bg-red-500"></div>
                      <span className="text-gray-400">{calculateBrandHealthKPIs.emotionMix.frustrated}%</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <div className="w-2 h-2 rounded-full bg-blue-500"></div>
                      <span className="text-gray-400">{calculateBrandHealthKPIs.emotionMix.delighted}%</span>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {visibleAlerts.length > 0 ? (
                    <Card className="bg-gray-900 border-gray-700">
                      <CardHeader className="pb-3">
                        <div className="flex items-center justify-between mb-2">
                          <CardTitle className="flex items-center gap-2 text-white">
                            <AlertTriangle className="h-5 w-5 text-red-400" />
                            Executive Alerts
                          </CardTitle>
                          <div className="flex items-center gap-1">
                            <span className="px-2 py-0.5 rounded-full bg-red-500/20 text-red-400 text-xs font-medium">
                              {visibleAlerts.filter(a => a.type === 'critical').length}
                            </span>
                            <span className="px-2 py-0.5 rounded-full bg-orange-500/20 text-orange-400 text-xs font-medium">
                              {visibleAlerts.filter(a => a.type === 'urgent').length}
                            </span>
                          </div>
                        </div>
                        <CardDescription className="text-gray-400 text-xs">
                          {visibleAlerts.length} critical issues requiring immediate attention
                        </CardDescription>
                      </CardHeader>
                      <CardContent>
                <div className="max-h-[calc(100vh-350px)] overflow-y-auto space-y-3 pr-2">
                          {visibleAlerts.map((alert) => (
                            <div
                              key={alert.id}
                              className={`p-4 rounded-lg border ${getAlertColor(alert.type)} transition-all`}
                            >
                              <div className="space-y-3">
                                <div className="flex items-start justify-between gap-2">
                                  <div className="flex items-start gap-2 flex-1">
                                    <div className="p-1.5 rounded bg-black/30 mt-0.5">
                                      {getAlertIcon(alert.type)}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                      <div className="flex items-center gap-2 flex-wrap mb-1">
                                        <h4 className="text-sm font-bold text-white leading-tight">{alert.title}</h4>
                                        <span className={`px-2 py-0.5 rounded-full text-xs font-semibold flex-shrink-0 ${
                                          alert.type === 'critical' ? 'bg-red-500/30 text-red-300' :
                                          alert.type === 'urgent' ? 'bg-orange-500/30 text-orange-300' :
                                          'bg-yellow-500/30 text-yellow-300'
                                        }`}>
                                          {alert.urgency}
                                        </span>
                                      </div>
                                      <p className="text-xs text-gray-300 leading-relaxed mb-2">{alert.description}</p>
                                      <div className="space-y-1 mb-2">
                                        <div className="flex items-center gap-1.5">
                                          <DollarSign className="h-3 w-3 text-yellow-400 flex-shrink-0" />
                                          <span className="font-bold text-yellow-400 text-xs">{alert.impact}</span>
                                        </div>
                                        {alert.affectedUsers && (
                                          <div className="flex items-center gap-1.5 text-xs text-gray-400">
                                            <Users className="h-3 w-3 flex-shrink-0" />
                                            <span>{alert.affectedUsers.toLocaleString()} users</span>
                                          </div>
                                        )}
                                        {alert.revenueImpact && (
                                          <div className="flex items-center gap-1.5 text-xs text-red-400">
                                            <TrendingDown className="h-3 w-3 flex-shrink-0" />
                                            <span>${(alert.revenueImpact / 1000).toFixed(0)}K at risk</span>
                                          </div>
                                        )}
                                      </div>
                                      <div className="p-2 rounded bg-blue-500/10 border border-blue-500/30 mb-2">
                                        <div className="flex items-start gap-1.5">
                                          <Zap className="h-3 w-3 text-blue-400 mt-0.5 flex-shrink-0" />
                                          <div>
                                            <p className="text-xs font-semibold text-blue-300 mb-0.5">Action:</p>
                                            <p className="text-xs text-blue-200 leading-relaxed">{alert.recommendedAction}</p>
                                          </div>
                                        </div>
                                      </div>
                                    </div>
                                  </div>
                                </div>
                                <div className="flex gap-2">
                                  <Button
                                    size="sm"
                                    onClick={() => handleAlertAction(alert, 'view')}
                                    className="bg-purple-600 hover:bg-purple-500 text-white text-xs flex-1"
                                  >
                                    <ExternalLink className="h-3 w-3 mr-1" />
                                    View
                                  </Button>
                                  <Button
                                    size="sm"
                                    onClick={() => handleAlertAction(alert, 'assign')}
                                    className="bg-blue-600 hover:bg-blue-500 text-white text-xs flex-1"
                                  >
                                    <Play className="h-3 w-3 mr-1" />
                                    Act
                                  </Button>
                                  <Button
                                    size="sm"
                                    variant="outline"
                                    onClick={() => handleDismissAlert(alert.id)}
                                    className="border-gray-600 text-gray-400 hover:text-white hover:bg-gray-800 px-2"
                                  >
                                    <X className="h-3 w-3" />
                                  </Button>
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      </CardContent>
                    </Card>
          ) : (
            <Card className="bg-gray-900 border-gray-700">
              <CardContent className="py-12 text-center">
                <AlertCircle className="h-12 w-12 text-gray-500 mx-auto mb-4" />
                <p className="text-gray-400">No alerts at this time</p>
                        </CardContent>
                      </Card>
          )}

          {/* Cross-Platform Comparative Health - Phase 1 Spec */}
            <Card className="bg-gray-900 border-gray-700">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-white">
                <BarChart3 className="h-5 w-5 text-purple-400" />
                Cross-Platform Comparative Health
              </CardTitle>
              <CardDescription className="text-gray-400">
                Side-by-side comparison to identify healthiest or most problematic platforms
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-gray-700">
                      <th className="text-left py-3 px-4 text-gray-400 font-semibold">Platform</th>
                      <th className="text-center py-3 px-4 text-gray-400 font-semibold">Sentiment Score</th>
                      <th className="text-center py-3 px-4 text-gray-400 font-semibold">Negative %</th>
                      <th className="text-center py-3 px-4 text-gray-400 font-semibold">Avg Rating</th>
                      <th className="text-center py-3 px-4 text-gray-400 font-semibold">Engagement Level</th>
                      <th className="text-center py-3 px-4 text-gray-400 font-semibold">Volume</th>
                      <th className="text-center py-3 px-4 text-gray-400 font-semibold">Virality Score</th>
                    </tr>
                  </thead>
                  <tbody>
                    {Object.entries(calculateBrandHealthKPIs.platformHealth).map(([platform, health]: [string, any]) => {
                      // Calculate heatmap color based on overall health
                      const getHealthColor = () => {
                        const sentimentScore = health.sentiment || 50;
                        const negativePercent = health.negativePercent || 50;
                        const avgScore = (sentimentScore + (100 - negativePercent)) / 2;
                        if (avgScore >= 70) return 'bg-green-500/30 border-green-500/50';
                        if (avgScore >= 50) return 'bg-yellow-500/30 border-yellow-500/50';
                        return 'bg-red-500/30 border-red-500/50';
      };

      return (
                        <tr key={platform} className={`border-b border-gray-800 hover:bg-gray-800/50 transition-colors ${getHealthColor()}`}>
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
                              <span className="text-gray-500">-</span>
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
                            {health.rating ? (
                              <div className="flex items-center justify-center gap-1">
                                <span className="text-white font-semibold">{health.rating}</span>
                                <Star className="h-3 w-3 text-yellow-400 fill-yellow-400" />
                              </div>
                            ) : (
                              <span className="text-gray-500">-</span>
                            )}
                          </td>
                          <td className="py-3 px-4 text-center">
                            <span className={`px-2 py-1 rounded text-xs font-semibold ${
                              health.engagement === 'High' ? 'bg-purple-500/20 text-purple-400' :
                              health.engagement === 'Medium' ? 'bg-blue-500/20 text-blue-400' :
                              'bg-gray-500/20 text-gray-400'
                            }`}>
                              {health.engagement}
                            </span>
                          </td>
                          <td className="py-3 px-4 text-center">
                            <span className={`px-2 py-1 rounded text-xs font-semibold ${
                              health.volume === 'High' ? 'bg-purple-500/20 text-purple-400' :
                              health.volume === 'Medium' ? 'bg-blue-500/20 text-blue-400' :
                              'bg-gray-500/20 text-gray-400'
                            }`}>
                              {health.volume}
                            </span>
                          </td>
                          <td className="py-3 px-4 text-center">
                            <div className="flex items-center justify-center gap-1">
                              {health.virality > 0 ? (
                                Array.from({ length: health.virality }).map((_, i) => (
                                  <span key={i} className="text-orange-400 text-lg">🔥</span>
                                ))
                              ) : (
                                <span className="text-gray-500">-</span>
                              )}
                            </div>
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
          {trustpilotData && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Topic Trend Map */}
            <Card className="bg-gray-900 border-gray-700">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-white">
                    <TrendingUp className="h-5 w-5 text-purple-400" />
                    Topic Trend Map (Top 12 Topics)
                  </CardTitle>
                  <CardDescription className="text-gray-400">
                    Track which themes are rising or falling
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <LineChart data={(() => {
                      // Generate topic trend data from topicBubbles
                      const topTopics = [...trustpilotData.topicBubbles]
                        .sort((a, b) => b.volume - a.volume)
                        .slice(0, 12);
                      
                      // Create time series data for each topic
                      const dates = trustpilotData.trendData.map(d => 
                        new Date(d.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
                      );
                      
                      return dates.map((date, idx) => {
                        const dataPoint: any = { date };
                        topTopics.forEach((topic, topicIdx) => {
                          // Simulate topic volume over time with variation
                          const baseVolume = topic.volume;
                          const variation = Math.sin(idx * 0.3 + topicIdx) * 0.3;
                          dataPoint[topic.topic] = Math.max(1, Math.round(baseVolume * (1 + variation)));
                        });
                        return dataPoint;
                      });
                    })()}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                      <XAxis dataKey="date" stroke="#9CA3AF" fontSize={10} angle={-45} textAnchor="end" height={60} />
                      <YAxis stroke="#9CA3AF" fontSize={10} />
                      <Tooltip
                        contentStyle={{
                          backgroundColor: '#1F2937',
                          border: '1px solid #374151',
                          borderRadius: '8px',
                        }}
                      />
                      <Legend wrapperStyle={{ fontSize: '10px' }} />
                      {trustpilotData.topicBubbles
                        .sort((a, b) => b.volume - a.volume)
                        .slice(0, 6)
                        .map((topic, idx) => {
                          const colors = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899'];
                          return (
                            <Line
                              key={topic.topic}
                              type="monotone"
                              dataKey={topic.topic}
                              stroke={colors[idx % colors.length]}
                              strokeWidth={2}
                              dot={false}
                              name={topic.topic.length > 20 ? topic.topic.substring(0, 20) + '...' : topic.topic}
                            />
                          );
                        })}
                    </LineChart>
                  </ResponsiveContainer>
              </CardContent>
            </Card>

              {/* Topic Sentiment Matrix */}
            <Card className="bg-gray-900 border-gray-700">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-white">
                    <Grid3x3 className="h-5 w-5 text-purple-400" />
                    Topic Sentiment Matrix
                  </CardTitle>
                  <CardDescription className="text-gray-400">
                    Identify negative-heavy themes vs positive-high praise topics
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2 max-h-[300px] overflow-y-auto">
                    {trustpilotData.topicBubbles
                      .sort((a, b) => b.volume - a.volume)
                      .slice(0, 10)
                      .map((topic) => {
                        const sentimentLevel = topic.sentiment > 0.3 ? 'positive' : topic.sentiment < -0.3 ? 'negative' : 'neutral';
                        return (
                          <div key={topic.topic} className="flex items-center justify-between p-2 bg-gray-800 rounded border border-gray-700">
                            <span className="text-sm text-white flex-1 truncate">{topic.topic}</span>
                            <div className="flex items-center gap-3">
                              <span className={`px-2 py-1 rounded text-xs font-semibold ${
                                sentimentLevel === 'positive' ? 'bg-green-500/20 text-green-400' :
                                sentimentLevel === 'negative' ? 'bg-red-500/20 text-red-400' :
                                'bg-gray-500/20 text-gray-400'
                              }`}>
                                {sentimentLevel}
                              </span>
                              <span className="text-xs text-gray-400 w-16 text-right">{topic.volume} posts</span>
                            </div>
                          </div>
                        );
                      })}
                </div>
              </CardContent>
            </Card>
          </div>
          )}

          {/* AI-Generated Narratives for Emerging Topics */}
          {trustpilotData && (
            <Card className="bg-gray-900 border-gray-700">
                <CardHeader>
                <CardTitle className="flex items-center gap-2 text-white">
                  <Sparkles className="h-5 w-5 text-purple-400" />
                  AI-Generated Topic Narratives
                  </CardTitle>
                <CardDescription className="text-gray-400">
                  What's happening, why it's happening, and what to do about it
                </CardDescription>
                </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {trustpilotData.topicBubbles
                    .sort((a, b) => b.volume - a.volume)
                    .slice(0, 5)
                    .map((topic, idx) => {
                      // Generate AI narrative based on topic data
                      const isNegative = topic.sentiment < -0.3;
                      const isPositive = topic.sentiment > 0.3;
                      const narrative = isNegative
                        ? `Complaints around ${topic.topic.toLowerCase()} have ${topic.volume > 100 ? 'doubled' : 'increased'} this week, driven mainly by ${calculateBrandHealthKPIs.platformWithHighestNegativity} discussions.`
                        : isPositive
                        ? `${topic.topic} is receiving positive feedback, with ${topic.volume} mentions showing appreciation for this aspect.`
                        : `${topic.topic} shows neutral sentiment with ${topic.volume} mentions, indicating stable discussion levels.`;
                      
                      const action = isNegative
                        ? `Escalate to product team, investigate root cause, prepare response strategy for ${calculateBrandHealthKPIs.platformWithHighestNegativity}.`
                        : isPositive
                        ? `Amplify positive feedback, consider featuring in marketing campaigns, share success story internally.`
                        : `Monitor trend, gather more data to understand user sentiment shifts.`;

                      return (
                        <div key={idx} className={`p-4 rounded-lg border ${
                          isNegative ? 'bg-red-500/10 border-red-500/30' :
                          isPositive ? 'bg-green-500/10 border-green-500/30' :
                          'bg-gray-800 border-gray-700'
                        }`}>
                          <div className="flex items-start justify-between gap-3 mb-2">
                            <h4 className="text-sm font-bold text-white">{topic.topic}</h4>
                            <span className={`px-2 py-0.5 rounded text-xs font-semibold ${
                              isNegative ? 'bg-red-500/20 text-red-400' :
                              isPositive ? 'bg-green-500/20 text-green-400' :
                              'bg-gray-500/20 text-gray-400'
                            }`}>
                              {topic.volume} mentions
                            </span>
                          </div>
                    <div className="space-y-2">
                            <div>
                              <p className="text-xs font-semibold text-blue-300 mb-1">What happened?</p>
                              <p className="text-xs text-gray-300">{narrative}</p>
                          </div>
                            <div>
                              <p className="text-xs font-semibold text-purple-300 mb-1">What to do next?</p>
                              <p className="text-xs text-gray-300">{action}</p>
                    </div>
                  </div>
                    </div>
                      );
                    })}
                  </div>
              </CardContent>
            </Card>
          )}

          {/* Negative Complaint Anatomy & Positive Champions */}
          {trustpilotData && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Negative Complaint Anatomy */}
              <Card className="bg-gray-900 border-gray-700">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-white">
                    <AlertTriangle className="h-5 w-5 text-red-400" />
                    Negative Complaint Anatomy
                  </CardTitle>
                  <CardDescription className="text-gray-400">
                    Root-cause analysis of what drives negativity
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <BarChart
                      data={(() => {
                        // Categorize negative topics
                        const categories: Record<string, number> = {
                          'Payment Issues': 0,
                          'App Crashes': 0,
                          'Login Problems': 0,
                          'Customer Support': 0,
                          'Pricing Concerns': 0,
                          'Delivery Issues': 0,
                          'Missing Features': 0,
                          'Performance': 0,
                        };
                        
                        trustpilotData.topicBubbles
                          .filter(t => t.sentiment < 0)
                          .forEach(topic => {
                            const topicLower = topic.topic.toLowerCase();
                            if (topicLower.includes('payment') || topicLower.includes('transaction')) {
                              categories['Payment Issues'] += topic.volume;
                            } else if (topicLower.includes('crash') || topicLower.includes('bug')) {
                              categories['App Crashes'] += topic.volume;
                            } else if (topicLower.includes('login') || topicLower.includes('access')) {
                              categories['Login Problems'] += topic.volume;
                            } else if (topicLower.includes('support') || topicLower.includes('service')) {
                              categories['Customer Support'] += topic.volume;
                            } else if (topicLower.includes('fee') || topicLower.includes('price') || topicLower.includes('cost')) {
                              categories['Pricing Concerns'] += topic.volume;
                            } else if (topicLower.includes('delivery') || topicLower.includes('shipping')) {
                              categories['Delivery Issues'] += topic.volume;
                            } else if (topicLower.includes('feature') || topicLower.includes('request')) {
                              categories['Missing Features'] += topic.volume;
                              } else {
                              categories['Performance'] += topic.volume;
                            }
                          });
                        
                        return Object.entries(categories)
                          .filter(([_, volume]) => volume > 0)
                          .map(([name, volume]) => ({ name, volume }))
                          .sort((a, b) => b.volume - a.volume);
                      })()}
                      layout="vertical"
                    >
                      <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                      <XAxis type="number" stroke="#9CA3AF" fontSize={10} />
                      <YAxis dataKey="name" type="category" stroke="#9CA3AF" fontSize={10} width={120} />
                      <Tooltip
                        contentStyle={{
                          backgroundColor: '#1F2937',
                          border: '1px solid #374151',
                          borderRadius: '8px',
                        }}
                      />
                      <Bar dataKey="volume" fill="#ef4444" radius={[0, 4, 4, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>

              {/* Positive Champion Drivers */}
              <Card className="bg-gray-900 border-gray-700">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-white">
                    <ThumbsUp className="h-5 w-5 text-green-400" />
                    Positive Champion Drivers
                  </CardTitle>
                  <CardDescription className="text-gray-400">
                    What people love about your brand
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {trustpilotData.topicBubbles
                      .filter(t => t.sentiment > 0.3)
                      .sort((a, b) => b.volume - a.volume)
                      .slice(0, 8)
                      .map((topic) => (
                        <div key={topic.topic} className="flex items-center justify-between p-3 bg-gray-800 rounded-lg border border-green-500/30">
                          <div className="flex items-center gap-3 flex-1">
                            <div className="w-2 h-2 rounded-full bg-green-400"></div>
                            <span className="text-sm text-white font-medium">{topic.topic}</span>
                    </div>
                          <div className="flex items-center gap-4">
                            <span className="text-xs text-green-400 font-semibold">
                              {Math.round((topic.sentiment + 1) * 50)}% positive
                            </span>
                            <span className="text-xs text-gray-400 w-16 text-right">{topic.volume} posts</span>
                  </div>
                        </div>
                      ))}
                    {trustpilotData.topicBubbles.filter(t => t.sentiment > 0.3).length === 0 && (
                      <div className="text-center py-8 text-gray-400">
                        No positive topics found
                    </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>
          )}

          {/* Feature Request Analysis */}
          {trustpilotData && (
              <Card className="bg-gray-900 border-gray-700">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-white">
                  <MessageSquare className="h-5 w-5 text-purple-400" />
                  Feature Request Analysis
                  </CardTitle>
                  <CardDescription className="text-gray-400">
                  Top feature requests sorted by volume
                  </CardDescription>
                </CardHeader>
                <CardContent>
                <ResponsiveContainer width="100%" height={250}>
                  <BarChart
                    data={(() => {
                      const featureRequests = [
                        { name: 'Dark Mode', volume: 234 },
                        { name: 'Faster Checkout', volume: 189 },
                        { name: 'Cancel Order', volume: 156 },
                        { name: 'Cashback Program', volume: 142 },
                        { name: 'Better Notifications', volume: 128 },
                        { name: 'Multi-language', volume: 98 },
                        { name: 'Biometric Login', volume: 87 },
                        { name: 'Export Transactions', volume: 76 },
                      ];
                      return featureRequests.sort((a, b) => b.volume - a.volume);
                    })()}
                  >
                      <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                    <XAxis dataKey="name" stroke="#9CA3AF" fontSize={10} angle={-45} textAnchor="end" height={80} />
                    <YAxis stroke="#9CA3AF" fontSize={10} />
                      <Tooltip
                        contentStyle={{
                          backgroundColor: '#1F2937',
                          border: '1px solid #374151',
                          borderRadius: '8px',
                        }}
                      />
                    <Bar dataKey="volume" fill="#8b5cf6" radius={[4, 4, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
          )}

          {/* Action Center */}
          <Card className="bg-gray-900 border-gray-700">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-white">
                <Zap className="h-5 w-5 text-yellow-400" />
                Action Center
              </CardTitle>
              <CardDescription className="text-gray-400">
                Immediate next steps requiring attention
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {[
                  { action: 'Respond to viral Reddit complaint about payment failures', priority: 'High', platform: 'Reddit' },
                  { action: 'Fix login crash on Play Store build (rating dropped to 3.4)', priority: 'Critical', platform: 'Play Store' },
                  { action: 'Investigate payment gateway downtime reports', priority: 'High', platform: 'X' },
                  { action: 'Push campaign around "easy onboarding" feature', priority: 'Medium', platform: 'All' },
                  { action: 'Assign Trustpilot negative reviews to support team', priority: 'Medium', platform: 'Trustpilot' },
                ].map((item, idx) => (
                  <div key={idx} className="flex items-start justify-between p-3 bg-gray-800 rounded-lg border border-gray-700 hover:border-purple-500/50 transition-colors">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <span className={`px-2 py-0.5 rounded text-xs font-semibold ${
                          item.priority === 'Critical' ? 'bg-red-500/20 text-red-400' :
                          item.priority === 'High' ? 'bg-orange-500/20 text-orange-400' :
                          'bg-yellow-500/20 text-yellow-400'
                        }`}>
                          {item.priority}
                        </span>
                        <span className="text-xs text-gray-400">{item.platform}</span>
                      </div>
                      <p className="text-sm text-white">{item.action}</p>
                    </div>
                    <Button size="sm" className="bg-purple-600 hover:bg-purple-500 text-white ml-4">
                      <Play className="h-3 w-3 mr-1" />
                      Act
                    </Button>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Enhanced Topic Bubble Map */}
          {trustpilotData && (
              <Card className="bg-gray-900 border-gray-700">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-white">
                    <Sparkles className="h-5 w-5 text-purple-400" />
                  Enhanced Topic Bubble Map
                  </CardTitle>
                  <CardDescription className="text-gray-400">
                  Size = volume, Color = sentiment, Trend arrows show rising/falling topics
                  </CardDescription>
                </CardHeader>
                <CardContent>
                <div className="h-80 flex items-center justify-center">
                  <div className="flex flex-wrap gap-6 justify-center items-center">
                    {trustpilotData.topicBubbles
                      .sort((a, b) => b.volume - a.volume)
                      .slice(0, 15)
                      .map((bubble, idx) => {
                        const size = Math.max(70, Math.min(180, (bubble.volume / 5)));
                        const getSentimentColor = (sentiment: number) => {
                          if (sentiment > 0.5) return '#10b981'; // green
                          if (sentiment > 0) return '#3b82f6'; // blue
                          if (sentiment > -0.5) return '#f59e0b'; // orange
                          return '#ef4444'; // red
                        };
                        const color = getSentimentColor(bubble.sentiment);
                        const isTrending = idx < 3; // Top 3 are trending
                        const isFalling = idx > 10; // Bottom ones are falling
                        
                        return (
                          <div
                            key={idx}
                            className="relative group cursor-pointer"
                            style={{
                              width: `${size}px`,
                              height: `${size}px`,
                            }}
                            title={bubble.aiSummary || bubble.topic}
                          >
                            <div
                              className="rounded-full flex flex-col items-center justify-center text-white font-semibold text-xs transition-all hover:scale-110 relative"
                              style={{
                                backgroundColor: color,
                                width: '100%',
                                height: '100%',
                                opacity: 0.85,
                                boxShadow: `0 0 20px ${color}40`,
                              }}
                            >
                              {/* Trend Arrow */}
                              {isTrending && (
                                <div className="absolute -top-2 left-1/2 transform -translate-x-1/2 text-green-400 text-lg">
                                  ↑
                            </div>
                              )}
                              {isFalling && (
                                <div className="absolute -top-2 left-1/2 transform -translate-x-1/2 text-red-400 text-lg">
                                  ↓
                                </div>
                              )}
                              
                              <div className="text-center px-2">
                                <div className="font-bold text-[10px] leading-tight mb-1">
                                  {bubble.topic.length > 15 ? bubble.topic.substring(0, 15) + '...' : bubble.topic}
                                </div>
                                <div className="text-[9px] opacity-90">{bubble.volume} posts</div>
                              </div>
                            </div>
                            
                            {/* AI Summary Tooltip */}
                            {bubble.aiSummary && (
                              <div className="absolute -top-12 left-1/2 transform -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity bg-gray-800 text-white text-xs p-2 rounded shadow-lg z-10 whitespace-nowrap max-w-xs">
                              {bubble.aiSummary}
                              </div>
                            )}
                            
                            {/* Platform Leader Badge */}
                            <div className="absolute -bottom-2 right-0 bg-purple-600 text-white text-[8px] px-1.5 py-0.5 rounded">
                              {idx < 5 ? 'Top' : 'Trending'}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </CardContent>
              </Card>
          )}

          {/* Early Warning System */}
          <Card className="bg-gray-900 border-2 border-orange-500/50">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-white">
                <AlertTriangle className="h-5 w-5 text-orange-400" />
                Early Warning System (AI Forecasting)
              </CardTitle>
              <CardDescription className="text-gray-400">
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
                    <div className="flex items-start justify-between gap-3">
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
                        <p className="text-xs text-gray-300 mb-2">{alert.description}</p>
                        <div className="flex items-center gap-4 text-xs text-gray-400">
                          <span>⏱ {alert.timeframe}</span>
                          <span>📊 {alert.confidence}% confidence</span>
                        </div>
                      </div>
                      <Button size="sm" className="bg-purple-600 hover:bg-purple-500 text-white">
                        Investigate
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Audience Emotion Intelligence */}
          {trustpilotData && (
              <Card className="bg-gray-900 border-gray-700">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-white">
                  <Users className="h-5 w-5 text-purple-400" />
                  Audience Emotion Intelligence
                  </CardTitle>
                  <CardDescription className="text-gray-400">
                  Emotional shifts across platforms and topics
                  </CardDescription>
                </CardHeader>
                <CardContent>
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {/* Emotion Timeline */}
                  <div>
                    <h4 className="text-sm font-semibold text-white mb-3">Emotion Timeline</h4>
                    <ResponsiveContainer width="100%" height={200}>
                      <LineChart data={(() => {
                        const emotions = ['Anger', 'Frustration', 'Joy', 'Confusion', 'Satisfaction'];
                        return trustpilotData.trendData.slice(-14).map((d, idx) => {
                          const dataPoint: any = { date: new Date(d.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) };
                          emotions.forEach((emotion, eIdx) => {
                            // Simulate emotion distribution based on sentiment
                            const baseValue = d.sentiment < -0.3 ? (emotion === 'Anger' ? 40 : emotion === 'Frustration' ? 35 : 10) :
                                            d.sentiment > 0.3 ? (emotion === 'Joy' ? 45 : emotion === 'Satisfaction' ? 40 : 10) :
                                            (emotion === 'Confusion' ? 30 : 15);
                            dataPoint[emotion] = Math.round(baseValue + Math.sin(idx * 0.5 + eIdx) * 10);
                          });
                          return dataPoint;
                        });
                      })()}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                        <XAxis dataKey="date" stroke="#9CA3AF" fontSize={9} angle={-45} textAnchor="end" height={50} />
                        <YAxis stroke="#9CA3AF" fontSize={9} />
                      <Tooltip
                        contentStyle={{
                          backgroundColor: '#1F2937',
                          border: '1px solid #374151',
                          borderRadius: '8px',
                        }}
                      />
                        <Legend wrapperStyle={{ fontSize: '9px' }} />
                        <Line type="monotone" dataKey="Anger" stroke="#ef4444" strokeWidth={2} dot={false} />
                        <Line type="monotone" dataKey="Frustration" stroke="#f59e0b" strokeWidth={2} dot={false} />
                        <Line type="monotone" dataKey="Joy" stroke="#10b981" strokeWidth={2} dot={false} />
                        <Line type="monotone" dataKey="Confusion" stroke="#9CA3AF" strokeWidth={2} dot={false} />
                        <Line type="monotone" dataKey="Satisfaction" stroke="#3b82f6" strokeWidth={2} dot={false} />
                    </LineChart>
                  </ResponsiveContainer>
                  </div>

                  {/* Emotion by Platform */}
                  <div>
                    <h4 className="text-sm font-semibold text-white mb-3">Emotion by Platform</h4>
                    <div className="space-y-2">
                      {[
                        { platform: 'X (Twitter)', anger: 15, frustration: 20, joy: 35, confusion: 10, satisfaction: 20 },
                        { platform: 'Reddit', anger: 30, frustration: 35, joy: 15, confusion: 10, satisfaction: 10 },
                        { platform: 'Trustpilot', anger: 10, frustration: 15, joy: 40, confusion: 5, satisfaction: 30 },
                        { platform: 'App Store', anger: 20, frustration: 25, joy: 25, confusion: 15, satisfaction: 15 },
                        { platform: 'Play Store', anger: 35, frustration: 30, joy: 10, confusion: 15, satisfaction: 10 },
                      ].map((platform) => (
                        <div key={platform.platform} className="p-2 bg-gray-800 rounded border border-gray-700">
                          <div className="text-xs font-semibold text-white mb-2">{platform.platform}</div>
                          <div className="flex gap-1">
                            <div className="flex-1 h-2 bg-red-500/30 rounded" style={{ width: `${platform.anger}%` }} title={`Anger: ${platform.anger}%`}></div>
                            <div className="flex-1 h-2 bg-orange-500/30 rounded" style={{ width: `${platform.frustration}%` }} title={`Frustration: ${platform.frustration}%`}></div>
                            <div className="flex-1 h-2 bg-green-500/30 rounded" style={{ width: `${platform.joy}%` }} title={`Joy: ${platform.joy}%`}></div>
                            <div className="flex-1 h-2 bg-gray-500/30 rounded" style={{ width: `${platform.confusion}%` }} title={`Confusion: ${platform.confusion}%`}></div>
                            <div className="flex-1 h-2 bg-blue-500/30 rounded" style={{ width: `${platform.satisfaction}%` }} title={`Satisfaction: ${platform.satisfaction}%`}></div>
                        </div>
                        </div>
                  ))}
                </div>
              </div>
                </div>
                </CardContent>
              </Card>
          )}

          {/* Viral Content Intelligence */}
              <Card className="bg-gray-900 border-gray-700">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-white">
                <TrendingUp className="h-5 w-5 text-orange-400" />
                Viral Content Intelligence
                  </CardTitle>
                  <CardDescription className="text-gray-400">
                Posts gaining traction and influencer impact
                  </CardDescription>
                </CardHeader>
                <CardContent>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Top Viral Posts */}
                <div>
                  <h4 className="text-sm font-semibold text-white mb-3">Top Viral Posts</h4>
                  <div className="space-y-3 max-h-[300px] overflow-y-auto">
                    {[
                      { platform: 'Reddit', content: 'Payment failures are getting worse...', impressions: 2100000, retweets: 0, comments: 1240, sentiment: 'negative' },
                      { platform: 'X', content: 'Just tried the new onboarding feature - amazing!', impressions: 1560000, retweets: 234, comments: 89, sentiment: 'positive' },
                      { platform: 'X', content: 'Why is the app crashing on login?', impressions: 980000, retweets: 156, comments: 234, sentiment: 'negative' },
                      { platform: 'Reddit', content: 'Customer support actually helped me today', impressions: 670000, retweets: 0, comments: 456, sentiment: 'positive' },
                    ].map((post, idx) => (
                      <div key={idx} className="p-3 bg-gray-800 rounded-lg border border-gray-700 hover:border-purple-500/50 transition-colors">
                        <div className="flex items-start justify-between gap-2 mb-2">
                          <span className={`px-2 py-0.5 rounded text-xs font-semibold ${
                            post.platform === 'X' ? 'bg-blue-500/20 text-blue-400' :
                            post.platform === 'Reddit' ? 'bg-orange-500/20 text-orange-400' :
                            'bg-gray-500/20 text-gray-400'
                            }`}>
                            {post.platform}
                            </span>
                          <span className={`px-2 py-0.5 rounded text-xs font-semibold ${
                            post.sentiment === 'positive' ? 'bg-green-500/20 text-green-400' :
                              'bg-red-500/20 text-red-400'
                            }`}>
                            {post.sentiment}
                          </span>
                        </div>
                        <p className="text-sm text-white mb-2">{post.content}</p>
                        <div className="flex items-center gap-4 text-xs text-gray-400">
                          <span>👁 {(post.impressions / 1000).toFixed(0)}K</span>
                          {post.retweets > 0 && <span>🔄 {post.retweets}</span>}
                          <span>💬 {post.comments}</span>
                          </div>
                        </div>
                    ))}
                  </div>
                </div>

                {/* Viral Hours Heatmap */}
                <div>
                  <h4 className="text-sm font-semibold text-white mb-3">Viral Activity Heatmap</h4>
                  <div className="grid grid-cols-7 gap-1">
                    {Array.from({ length: 24 }).map((_, hour) => {
                      const intensity = Math.floor(Math.random() * 5) + 1; // 1-5 intensity
                      return (
                        <div key={hour} className="text-center">
                          <div
                            className={`h-8 rounded mb-1 ${
                              intensity >= 4 ? 'bg-orange-500' :
                              intensity >= 3 ? 'bg-orange-400' :
                              intensity >= 2 ? 'bg-orange-300' :
                              'bg-gray-700'
                            }`}
                            title={`${hour}:00 - ${intensity}/5 intensity`}
                          ></div>
                          <div className="text-[8px] text-gray-400">{hour}</div>
                        </div>
                      );
                    })}
                      </div>
                  <div className="mt-3 flex items-center justify-between text-xs text-gray-400">
                    <span>Low</span>
                    <div className="flex gap-1">
                      <div className="w-3 h-3 bg-gray-700 rounded"></div>
                      <div className="w-3 h-3 bg-orange-300 rounded"></div>
                      <div className="w-3 h-3 bg-orange-400 rounded"></div>
                      <div className="w-3 h-3 bg-orange-500 rounded"></div>
                    </div>
                    <span>High</span>
                  </div>
                </div>
                  </div>
                      </CardContent>
                    </Card>

          {/* Cross-Platform Storytelling Layer */}
          <Card className="bg-gray-900 border-gray-700">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-white">
                <MessageSquare className="h-5 w-5 text-purple-400" />
                Cross-Platform Storytelling
              </CardTitle>
              <CardDescription className="text-gray-400">
                Unified narrative across all platforms
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="p-4 bg-gray-800 rounded-lg border-l-4 border-red-500">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="px-2 py-1 bg-red-500/20 text-red-400 rounded text-xs font-semibold">Reddit</span>
                    <span className="text-xs text-gray-400">Negative</span>
                </div>
                  <p className="text-sm text-white">
                    Users on Reddit complain about payment failures, with 234 posts in the last 24 hours discussing transaction issues.
                  </p>
              </div>
                <div className="p-4 bg-gray-800 rounded-lg border-l-4 border-green-500">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="px-2 py-1 bg-green-500/20 text-green-400 rounded text-xs font-semibold">X (Twitter)</span>
                    <span className="text-xs text-gray-400">Positive</span>
                  </div>
                  <p className="text-sm text-white">
                    Twitter users are discussing your brand positively due to the new "easy onboarding" feature, generating 156 positive mentions.
                  </p>
                </div>
                <div className="p-4 bg-gray-800 rounded-lg border-l-4 border-orange-500">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="px-2 py-1 bg-orange-500/20 text-orange-400 rounded text-xs font-semibold">App Store</span>
                    <span className="text-xs text-gray-400">Warning</span>
                  </div>
                  <p className="text-sm text-white">
                    App Store users reporting crashes after the latest release, with rating concerns mentioned in 89 reviews.
                  </p>
                </div>
                <div className="p-4 bg-gray-800 rounded-lg border-l-4 border-blue-500">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="px-2 py-1 bg-blue-500/20 text-blue-400 rounded text-xs font-semibold">Trustpilot</span>
                    <span className="text-xs text-gray-400">Mixed</span>
                  </div>
                  <p className="text-sm text-white">
                    Trustpilot praises support quality (4.5 rating) but criticizes refund delays, with 67% positive sentiment overall.
                  </p>
                </div>
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
      return <XDashboard renderSentimentChart={renderSentimentChart} />;
    }

    if (channel === 'reddit') {
      return <RedditDashboard renderSentimentChart={renderSentimentChart} />;
    }

    if (channel === 'appstore') {
      return <AppStoreDashboard renderSentimentChart={renderSentimentChart} />;
    }

    if (channel === 'playstore') {
      return <PlayStoreDashboard renderSentimentChart={renderSentimentChart} />;
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
      <div className="min-h-screen bg-gray-950 p-6 flex items-center justify-center">
        <div className="flex items-center gap-3">
          <RefreshCw className="h-6 w-6 animate-spin text-purple-400" />
          <span className="text-white text-lg">Loading dashboard...</span>
                          </div>
                        </div>
    );
  }

  return (
    <div className="min-h-screen p-6" style={{ backgroundColor: 'var(--sidebar)' }}>
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-white mb-2">
              Social Media Dashboard
            </h1>
            <p className="text-gray-400">
              Multi-channel insights and executive alerts
            </p>
                                    </div>
          <div className="flex flex-col gap-3">
            {/* Date Filters */}
            <div className="flex items-center gap-2 justify-end">
              <label className="text-xs text-gray-400 whitespace-nowrap">Filters:</label>
              <div className="relative z-50">
                <Select value={dateFilterPreset} onValueChange={handlePresetChange}>
                  <SelectTrigger className="w-[180px] bg-gray-800 border-gray-600 text-white text-sm h-[38px]">
                    <SelectValue placeholder="Select period" />
                  </SelectTrigger>
                  <SelectContent className="bg-gray-800 border-gray-600 text-white z-[9999]">
                    <SelectItem value="All">All</SelectItem>
                    <SelectItem value="Current day">Current day</SelectItem>
                    <SelectItem value="One Week">One Week</SelectItem>
                    <SelectItem value="One Month">One Month</SelectItem>
                    <SelectItem value="6 Months">6 Months</SelectItem>
                    <SelectItem value="Custom">Custom</SelectItem>
                  </SelectContent>
                </Select>
                                      </div>
              
              {/* Custom Date Pickers - Only show when Custom is selected */}
              {dateFilterPreset === 'Custom' && (
                <>
                  <label className="text-xs text-gray-400 whitespace-nowrap">Start Date:</label>
                  <input
                    type="date"
                    value={dateRange.start}
                    onChange={(e) => setDateRange(prev => ({ ...prev, start: e.target.value }))}
                    className="bg-gray-800 border border-gray-600 text-white text-sm px-3 py-2 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500 h-[38px]"
                  />
                  <label className="text-xs text-gray-400 whitespace-nowrap">End Date:</label>
                  <input
                    type="date"
                    value={dateRange.end}
                    onChange={(e) => setDateRange(prev => ({ ...prev, end: e.target.value }))}
                    className="bg-gray-800 border border-gray-600 text-white text-sm px-3 py-2 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500 h-[38px]"
                  />
                </>
              )}
              
                                  <Button
                                    size="sm"
                onClick={loadDashboardData}
                className="bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-500 hover:to-purple-600 text-white shadow-lg hover:shadow-purple-500/30 transition-all duration-200 h-[38px]"
              >
                Apply
                <RefreshCw className="h-4 w-4 ml-2" />
                                  </Button>
                                </div>
                              </div>
                            </div>

        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as Channel)} className="w-full">
          <TabsList className="bg-gray-900 border border-gray-700 p-1 h-auto">
            <TabsTrigger 
              value="all" 
              className="data-[state=active]:bg-purple-600 data-[state=active]:text-white text-gray-400"
            >
              {getChannelIcon('all')}
              <span className="ml-2">All</span>
            </TabsTrigger>
            <TabsTrigger 
              value="trustpilot" 
              className="data-[state=active]:bg-purple-600 data-[state=active]:text-white text-gray-400"
            >
              {getChannelIcon('trustpilot')}
              <span className="ml-2">Trustpilot</span>
            </TabsTrigger>
            <TabsTrigger 
              value="x" 
              className="data-[state=active]:bg-purple-600 data-[state=active]:text-white text-gray-400"
            >
              {getChannelIcon('x')}
              <span className="ml-2">X</span>
            </TabsTrigger>
            <TabsTrigger 
              value="reddit" 
              className="data-[state=active]:bg-purple-600 data-[state=active]:text-white text-gray-400"
            >
              {getChannelIcon('reddit')}
              <span className="ml-2">Reddit</span>
            </TabsTrigger>
            <TabsTrigger 
              value="appstore" 
              className="data-[state=active]:bg-purple-600 data-[state=active]:text-white text-gray-400"
            >
              {getChannelIcon('appstore')}
              <span className="ml-2">App Store</span>
            </TabsTrigger>
            <TabsTrigger 
              value="playstore" 
              className="data-[state=active]:bg-purple-600 data-[state=active]:text-white text-gray-400"
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
    </div>
  );
}
