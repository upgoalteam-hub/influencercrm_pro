import React, { useState, useEffect } from 'react';
import { useLocation, useParams, useNavigate } from 'react-router-dom';
import Sidebar from '../../components/ui/Sidebar';
import Header from '../../components/ui/Header';
import ProfileHeader from './components/ProfileHeader';
import TabNavigation from './components/TabNavigation';
import OverviewTab from './components/OverviewTab';
import CampaignHistoryTab from './components/CampaignHistoryTab';
import PaymentHistoryTab from './components/PaymentHistoryTab';
import PriceHistoryTab from './components/PriceHistoryTab';
import NotesTab from './components/NotesTab';
import QuickStatsWidget from './components/QuickStatsWidget';
import RecentActivityFeed from './components/RecentActivityFeed';
import RelatedCreatorsWidget from './components/RelatedCreatorsWidget';
import { realtimeService } from '../../services/realtimeService';
import { creatorService } from '../../services/creatorService';
import { campaignService } from '../../services/campaignService';
import { calculatePerformanceScore } from '../../utils/performanceUtils';
import Icon from '../../components/AppIcon';

const CreatorProfileDetails = () => {
  const location = useLocation();
  const { id } = useParams();
  const navigate = useNavigate();
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [activeTab, setActiveTab] = useState('overview');
  const [creator, setCreator] = useState(null);
  const [campaigns, setCampaigns] = useState([]);
  const [payments, setPayments] = useState([]);
  const [priceHistory, setPriceHistory] = useState([]);
  const [notes, setNotes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Helper function to format creator data for UI
  const formatCreatorData = (dbCreator) => {
    if (!dbCreator) return null;

    // Extract Instagram handle from link or username
    const getInstagramHandle = () => {
      if (dbCreator?.username) {
        return `@${dbCreator.username.replace('@', '')}`;
      }
      if (dbCreator?.instagram_link) {
        const match = dbCreator.instagram_link.match(/instagram\.com\/([^\/\?]+)/);
        if (match) return `@${match[1]}`;
      }
      return 'N/A';
    };

    // Format followers count
    const formatFollowers = (followersTier) => {
      if (!followersTier || followersTier === 'N/A') return '0';
      // If it's a number string, format it
      const num = parseInt(followersTier);
      if (!isNaN(num)) {
        if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`;
        if (num >= 1000) return `${(num / 1000).toFixed(1)}K`;
        return num.toString();
      }
      return followersTier;
    };

    return {
      id: dbCreator?.id || null,
      name: dbCreator?.name || 'Unknown Creator',
      profileImage: dbCreator?.profile_image || dbCreator?.profile_picture || null,
      profileImageAlt: `${dbCreator?.name || 'Creator'} profile picture`,
      instagramHandle: getInstagramHandle(),
      instagramUrl: dbCreator?.instagram_link || null,
      isVerified: dbCreator?.is_verified || false,
      isPremium: dbCreator?.is_premium || false,
      status: dbCreator?.status || 'Active',
      city: dbCreator?.city || 'N/A',
      state: dbCreator?.state || 'N/A',
      followersCount: formatFollowers(dbCreator?.followers_tier || dbCreator?.followers_count),
      engagementRate: dbCreator?.engagement_rate ? `${dbCreator.engagement_rate}%` : 'N/A',
      avgLikes: dbCreator?.avg_likes ? dbCreator.avg_likes.toLocaleString() : '0',
      avgComments: dbCreator?.avg_comments ? dbCreator.avg_comments.toLocaleString() : '0',
      lastSynced: dbCreator?.last_synced ? new Date(dbCreator.last_synced).toLocaleString() : 'Never',
      email: dbCreator?.email || 'N/A',
      phone: dbCreator?.whatsapp || dbCreator?.phone || 'N/A',
      manager: dbCreator?.manager_name || 'N/A',
      managerPhone: dbCreator?.manager_phone || 'N/A',
      gender: dbCreator?.gender || 'N/A',
      age: dbCreator?.age ? `${dbCreator.age} years` : 'N/A',
      language: dbCreator?.language || 'N/A',
      categories: dbCreator?.categories ? (Array.isArray(dbCreator.categories) ? dbCreator.categories : [dbCreator.categories]) : [],
      tags: dbCreator?.tags ? (Array.isArray(dbCreator.tags) ? dbCreator.tags : [dbCreator.tags]) : [],
      // Database fields (snake_case)
      sr_no: dbCreator?.sr_no || 'N/A',
      username: dbCreator?.username || 'N/A',
      sheet_source: dbCreator?.sheet_source || 'N/A',
      created_at: dbCreator?.created_at || null,
      updated_at: dbCreator?.updated_at || null,
      manual_performance_score: dbCreator?.manual_performance_score || null
    };
  };

  // Fetch creator data
  useEffect(() => {
    const fetchCreatorData = async () => {
      // Get creatorId from URL param or location state
      const creatorId = id || location?.state?.creatorId;
      
      if (!creatorId) {
        console.error('❌ No creator ID provided');
        setError('Creator ID is missing. Please select a creator from the database.');
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError(null);
        
        console.log('🔵 Fetching creator data for ID:', creatorId);
        
        // Fetch creator details
        const creatorData = await creatorService?.getById(creatorId);
        
        if (!creatorData) {
          throw new Error('Creator not found');
        }

        console.log('✅ Creator data fetched:', creatorData);
        const formattedCreator = formatCreatorData(creatorData);
        setCreator(formattedCreator);

        // Fetch campaigns for this creator
        try {
          const allCampaigns = await campaignService?.getAll();
          const creatorCampaigns = allCampaigns?.filter(c => 
            c?.creator_id === creatorId || 
            c?.creators?.id === creatorId ||
            c?.creator?.id === creatorId
          ) || [];
          
          console.log('✅ Campaigns fetched:', creatorCampaigns.length);
          setCampaigns(creatorCampaigns);
          
          // Extract payments from campaigns
          const campaignPayments = creatorCampaigns
            ?.filter(c => c?.amount || c?.agreed_amount)
            ?.map((campaign, index) => ({
              id: campaign?.id || `payment-${index}`,
              date: campaign?.created_at ? new Date(campaign.created_at).toLocaleDateString('en-IN') : 'N/A',
              time: campaign?.created_at ? new Date(campaign.created_at).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' }) : 'N/A',
              campaignName: campaign?.name || 'Unnamed Campaign',
              brandName: campaign?.brand_name || campaign?.brand || 'N/A',
              amount: campaign?.amount || campaign?.agreed_amount || 0,
              mode: campaign?.payment_method || 'Bank Transfer',
              modeIcon: 'Building2',
              reference: campaign?.id ? `TXN-${campaign.id.slice(0, 8)}` : 'N/A',
              utrNumber: campaign?.utr_number || null,
              status: campaign?.payment_status || 'Pending',
              delayDays: campaign?.end_date ? Math.max(0, Math.floor((new Date() - new Date(campaign.end_date)) / (1000 * 60 * 60 * 24))) : 0
            })) || [];
          
          setPayments(campaignPayments);
        } catch (campaignError) {
          console.error('Error fetching campaigns:', campaignError);
          setCampaigns([]);
          setPayments([]);
        }

        // Price history and notes would come from separate tables if they exist
        // For now, set empty arrays
        setPriceHistory([]);
        setNotes([]);

      } catch (err) {
        console.error('❌ Error fetching creator:', err);
        setError(err?.message || 'Failed to load creator profile');
      } finally {
        setLoading(false);
      }
    };

    fetchCreatorData();
  }, [id, location?.state?.creatorId]);

  // Calculate quick stats from real data
  const quickStats = {
    totalCampaigns: campaigns?.length || 0,
    completedCampaigns: campaigns?.filter(c => c?.status === 'completed' || c?.payment_status === 'paid')?.length || 0,
    activeCampaigns: campaigns?.filter(c => c?.status === 'active' || c?.payment_status === 'pending')?.length || 0,
    totalEarned: payments?.filter(p => p?.status === 'Paid')?.reduce((sum, p) => sum + (p?.amount || 0), 0) || 0,
    avgPerCampaign: campaigns?.length > 0 
      ? Math.round((payments?.filter(p => p?.status === 'Paid')?.reduce((sum, p) => sum + (p?.amount || 0), 0) || 0) / campaigns.length)
      : 0,
    performanceScore: (() => {
      // Get creator data with engagement metrics
      const creatorData = {
        engagement_rate: creator?.engagementRate ? parseFloat(creator.engagementRate.replace('%', '')) : 0,
        avg_likes: parseFloat(creator?.avgLikes?.replace(/,/g, '')) || 0,
        avg_comments: parseFloat(creator?.avgComments?.replace(/,/g, '')) || 0,
        manual_performance_score: creator?.manual_performance_score
      };
      
      const result = calculatePerformanceScore(creatorData, campaigns, payments);
      return result.score;
    })(),
    isManualScore: (() => {
      const creatorData = {
        manual_performance_score: creator?.manual_performance_score
      };
      const result = calculatePerformanceScore(creatorData, campaigns, payments);
      return result.isManual;
    })(),
    memberSince: creator?.created_at ? new Date(creator.created_at).toLocaleDateString('en-IN', { month: 'short', year: 'numeric' }) : 'N/A'
  };

  const tabs = [
    { id: 'overview', label: 'Overview', icon: 'LayoutDashboard', badge: null },
    { id: 'campaigns', label: 'Campaign History', icon: 'Megaphone', badge: campaigns?.length || 0 },
    { id: 'payments', label: 'Payment History', icon: 'CreditCard', badge: null },
    { id: 'pricing', label: 'Price History', icon: 'TrendingUp', badge: null },
    { id: 'notes', label: 'Notes', icon: 'MessageSquare', badge: notes?.length || 0 }
  ];

  const handleEdit = () => {
    console.log('Edit creator profile');
  };

  const handleArchive = () => {
    console.log('Archive creator');
  };

  const handleAddToCampaign = () => {
    console.log('Add to campaign');
  };

  const handleAddNote = (noteContent) => {
    console.log('Add note:', noteContent);
  };

  // Real-time subscriptions
  useEffect(() => {
    const creatorId = id || location?.state?.creatorId;
    if (!creatorId) return;

    // Subscribe to real-time creator changes
    const creatorSubscription = realtimeService?.subscribeToCreators(
      null,
      (updatedCreator) => {
        if (updatedCreator?.id === creatorId) {
          const formattedCreator = formatCreatorData(updatedCreator);
          setCreator(formattedCreator);
        }
      },
      (deletedId) => {
        if (deletedId === creatorId) {
          navigate('/creator-database-management');
        }
      }
    );

    // Subscribe to campaign changes for this creator
    const campaignSubscription = realtimeService?.subscribeToCampaigns(
      (newCampaign) => {
        if (newCampaign?.creator_id === creatorId || newCampaign?.creators?.id === creatorId) {
          setCampaigns((prev) => [newCampaign, ...prev]);
        }
      },
      (updatedCampaign) => {
        if (updatedCampaign?.creator_id === creatorId || updatedCampaign?.creators?.id === creatorId) {
          setCampaigns((prev) =>
            prev?.map((campaign) =>
              campaign?.id === updatedCampaign?.id ? updatedCampaign : campaign
            )
          );
        }
      },
      (deletedId) => {
        setCampaigns((prev) => prev?.filter((campaign) => campaign?.id !== deletedId));
      }
    );

    return () => {
      creatorSubscription?.unsubscribe();
      campaignSubscription?.unsubscribe();
    };
  }, [id, location?.state?.creatorId, navigate]);

  useEffect(() => {
    const handleKeyPress = (e) => {
      if (e?.key >= '1' && e?.key <= '5') {
        const tabIndex = parseInt(e?.key) - 1;
        if (tabs?.[tabIndex]) {
          setActiveTab(tabs?.[tabIndex]?.id);
        }
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, []);

  // Loading state
  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <Sidebar
          isCollapsed={isSidebarCollapsed}
          onToggleCollapse={() => setIsSidebarCollapsed(!isSidebarCollapsed)} />
        <Header isCollapsed={isSidebarCollapsed} />
        <main className={`main-content ${isSidebarCollapsed ? 'sidebar-collapsed' : ''}`}>
          <div className="flex items-center justify-center h-[calc(100vh-4rem)]">
            <div className="text-center">
              <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
              <p className="text-muted-foreground">Loading creator profile...</p>
            </div>
          </div>
        </main>
      </div>
    );
  }

  // Error state
  if (error || !creator) {
    return (
      <div className="min-h-screen bg-background">
        <Sidebar
          isCollapsed={isSidebarCollapsed}
          onToggleCollapse={() => setIsSidebarCollapsed(!isSidebarCollapsed)} />
        <Header isCollapsed={isSidebarCollapsed} />
        <main className={`main-content ${isSidebarCollapsed ? 'sidebar-collapsed' : ''}`}>
          <div className="flex items-center justify-center h-[calc(100vh-4rem)]">
            <div className="text-center max-w-md">
              <div className="w-16 h-16 bg-destructive/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <Icon name="AlertTriangle" size={32} color="var(--color-destructive)" />
              </div>
              <h2 className="text-xl font-semibold text-foreground mb-2">Creator Not Found</h2>
              <p className="text-muted-foreground mb-4">{error || 'The creator profile could not be loaded.'}</p>
              <button
                onClick={() => navigate('/creator-database-management')}
                className="px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition-colors"
              >
                Back to Creator Database
              </button>
            </div>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Sidebar
        isCollapsed={isSidebarCollapsed}
        onToggleCollapse={() => setIsSidebarCollapsed(!isSidebarCollapsed)} />

      <Header isCollapsed={isSidebarCollapsed} />

      <main className={`main-content ${isSidebarCollapsed ? 'sidebar-collapsed' : ''}`}>
        <ProfileHeader
          creator={creator}
          onEdit={handleEdit}
          onArchive={handleArchive}
          onAddToCampaign={handleAddToCampaign} />

        <TabNavigation
          activeTab={activeTab}
          onTabChange={setActiveTab}
          tabs={tabs} />

        <div className="p-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2">
              {activeTab === 'overview' && <OverviewTab creator={creator} />}
              {activeTab === 'campaigns' && <CampaignHistoryTab campaigns={campaigns} />}
              {activeTab === 'payments' && <PaymentHistoryTab payments={payments} />}
              {activeTab === 'pricing' && <PriceHistoryTab priceHistory={priceHistory} />}
              {activeTab === 'notes' && <NotesTab notes={notes} onAddNote={handleAddNote} />}
            </div>

            <div className="space-y-6">
              <QuickStatsWidget 
          stats={quickStats} 
          creatorId={creator?.id}
          onScoreUpdate={(newScore) => {
            // Refresh creator data to get updated score
            const fetchCreatorData = async () => {
              try {
                const creatorData = await creatorService?.getById(creator.id);
                if (creatorData) {
                  const formattedCreator = formatCreatorData(creatorData);
                  setCreator(formattedCreator);
                }
              } catch (err) {
                console.error('Error refreshing creator data:', err);
              }
            };
            fetchCreatorData();
          }}
        />
              {/* RecentActivityFeed and RelatedCreatorsWidget can be added later with real data */}
            </div>
          </div>
        </div>
      </main>
    </div>);
};

export default CreatorProfileDetails;