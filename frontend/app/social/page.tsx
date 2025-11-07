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
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend, LineChart, Line, ScatterChart, Scatter, Cell, PieChart, Pie, AreaChart, Area, ComposedChart } from 'recharts';
import TrustpilotDashboard from './trustpilot/page';
import XDashboard from './x/page';
import RedditDashboard from './reddit/page';
import AppStoreDashboard from './appstore/page';
import PlayStoreDashboard from './playstore/page';

type Channel = 'all' | 'trustpilot' | 'x' | 'reddit' | 'appstore' | 'playstore';

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
      <Card className="bg-app-black/60 border border-white/10 shadow-xl">
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
                  <Card className="bg-app-black/60 border border-white/10 shadow-xl h-full">
                    <CardHeader className="relative">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setClickedPoint(null)}
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
                        {clickedPoint.date}
                      </CardTitle>
                      <CardDescription className="text-muted-foreground">
                        Sentiment Level {sentimentLevel}: {sentimentLevelLabels[sentimentLevel - 1]}
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="p-4 rounded-lg border border-white/10 bg-app-black/60" style={{ borderColor: `${sentimentColor}30` }}>
                        <div className="flex justify-between items-center">
                          <span className="text-sm text-muted-foreground">Total Posts:</span>
                          <span className="text-lg font-bold" style={{ color: sentimentColor }}>
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
                              <div key={idx} className="p-3 rounded-lg border border-white/10 bg-app-black/60">
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
  }, [trustpilotData]);

  const socialKPIItems = useMemo(() => {
    const sentimentScore = Math.round(calculateBrandHealthKPIs.avgSentimentScore || 0);
    const sentimentBand = sentimentScore >= 70 ? 'Positive' : sentimentScore >= 50 ? 'Neutral' : 'Negative';
    const negativitySpike = calculateBrandHealthKPIs.negativitySpikePercent || 0;
    const emotionMix = calculateBrandHealthKPIs.emotionMix || { calm: 0, frustrated: 0, delighted: 0 };

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
      },
      {
        title: 'Negativity Spike',
        value: `${Math.abs(negativitySpike).toFixed(1)}%`,
        subtext: negativitySpike > 0 ? 'Week-over-week increase' : 'Week-over-week relief',
        icon: AlertTriangle,
        color: negativitySpike > 0 ? 'text-red-400' : 'text-green-400',
        bgColor: negativitySpike > 0 ? 'bg-red-500/10' : 'bg-green-500/10',
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
      {
        title: 'Emotion Mix',
        value: `${emotionMix.calm}% Calm`,
        subtext: `${emotionMix.frustrated}% Frustrated • ${emotionMix.delighted}% Delighted`,
        icon: Users,
        color: 'text-purple-300',
        bgColor: 'bg-purple-500/10',
        customContent: (
          <div className="mt-2 space-y-2">
            {[
              { label: 'Calm', value: emotionMix.calm, bar: 'bg-green-500' },
              { label: 'Frustrated', value: emotionMix.frustrated, bar: 'bg-red-500' },
              { label: 'Delighted', value: emotionMix.delighted, bar: 'bg-blue-500' },
            ].map(({ label, value, bar }) => (
              <div key={label} className="flex items-center gap-2 text-xs text-muted-foreground">
                <span className="w-20">{label}</span>
                <div className="flex-1 h-1.5 overflow-hidden rounded-full bg-app-black/60">
                  <div className={`h-full ${bar}`} style={{ width: `${Math.min(100, Math.max(0, value))}%` }}></div>
                </div>
                <span className="w-10 text-right">{Math.round(value)}%</span>
              </div>
            ))}
          </div>
        ),
      },
    ];
  }, [calculateBrandHealthKPIs]);

  const renderChannelContent = (channel: Channel) => {
    if (channel === 'all') {
      return (
        <div className="space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-6 gap-4">
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
          {trustpilotData && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Topic Trend Map */}
            <Card className="bg-app-black/60 border border-white/10 shadow-xl">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-white">
                    <TrendingUp className="h-5 w-5 text-purple-400" />
                    Topic Trend Map (Top 12 Topics)
                  </CardTitle>
                  <CardDescription className="text-muted-foreground">
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
            <Card className="bg-app-black/60 border border-white/10 shadow-xl">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-white">
                    <Grid3x3 className="h-5 w-5 text-purple-400" />
                    Topic Sentiment Matrix
                  </CardTitle>
                  <CardDescription className="text-muted-foreground">
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
                          <div key={topic.topic} className="flex items-center justify-between rounded border border-white/10 bg-app-black/60 p-2">
                            <span className="text-sm text-white flex-1 truncate">{topic.topic}</span>
                            <div className="flex items-center gap-3">
                              <span className={`px-2 py-1 rounded text-xs font-semibold ${
                                sentimentLevel === 'positive' ? 'bg-green-500/20 text-green-400' :
                                sentimentLevel === 'negative' ? 'bg-red-500/20 text-red-400' :
                                'bg-white/10 text-muted-foreground'
                              }`}>
                                {sentimentLevel}
                              </span>
                              <span className="text-xs text-muted-foreground w-16 text-right">{topic.volume} posts</span>
                            </div>
                          </div>
                        );
                      })}
                </div>
              </CardContent>
            </Card>
          </div>
          )}

          {/* Negative Complaint Anatomy & Positive Champions */}
          {trustpilotData && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Negative Complaint Anatomy */}
              <Card className="bg-app-black/60 border border-white/10 shadow-xl">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-white">
                    <AlertTriangle className="h-5 w-5 text-red-400" />
                    Negative Complaint Anatomy
                  </CardTitle>
                  <CardDescription className="text-muted-foreground">
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
                  <div className="space-y-3">
                    {trustpilotData.topicBubbles
                      .filter(t => t.sentiment > 0.3)
                      .sort((a, b) => b.volume - a.volume)
                      .slice(0, 8)
                      .map((topic) => (
                        <div key={topic.topic} className="flex items-center justify-between rounded-lg border border-green-500/30 bg-app-black/60 p-3">
                          <div className="flex items-center gap-3 flex-1">
                            <div className="w-2 h-2 rounded-full bg-green-400"></div>
                            <span className="text-sm text-white font-medium">{topic.topic}</span>
                    </div>
                          <div className="flex items-center gap-4">
                            <span className="text-xs text-green-400 font-semibold">
                              {Math.round((topic.sentiment + 1) * 50)}% positive
                            </span>
                            <span className="text-xs text-muted-foreground w-16 text-right">{topic.volume} posts</span>
                  </div>
                        </div>
                      ))}
                    {trustpilotData.topicBubbles.filter(t => t.sentiment > 0.3).length === 0 && (
                      <div className="text-center py-8 text-muted-foreground">
                        No positive topics found
                    </div>
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
                        <p className="text-xs text-white/80 mb-2">{alert.description}</p>
                        <div className="flex items-center gap-4 text-xs text-muted-foreground">
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
