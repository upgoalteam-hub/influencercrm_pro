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

  const mockCreator = {
    id: 1,
    name: "Sarah Johnson",
    profileImage: "https://img.rocket.new/generatedImages/rocket_gen_img_103b528db-1763293982935.png",
    profileImageAlt: "Professional headshot of young woman with long brown hair wearing white blouse against neutral background",
    instagramHandle: "@fashionista_sarah",
    instagramUrl: "https://instagram.com/fashionista_sarah",
    isVerified: true,
    isPremium: true,
    status: "Active",
    city: "Mumbai",
    state: "Maharashtra",
    followersCount: "125K",
    engagementRate: "4.8%",
    avgLikes: "6,000",
    avgComments: "450",
    lastSynced: "2 hours ago",
    email: "sarah.johnson@email.com",
    phone: "+91 98765 43210",
    manager: "Priya Sharma",
    managerPhone: "+91 98765 43211",
    gender: "Female",
    age: "26 years",
    language: "Hindi, English",
    categories: ["Fashion", "Lifestyle", "Beauty"],
    tags: ["Fashion Influencer", "Brand Collaborations", "Product Reviews", "Style Tips", "Makeup Tutorials"],
    pricingMatrix: [
    { type: "Instagram Post", basePrice: 15000, currentPrice: 18000, lastUpdated: "15/12/2025" },
    { type: "Instagram Reel", basePrice: 25000, currentPrice: 30000, lastUpdated: "15/12/2025" },
    { type: "Instagram Story", basePrice: 8000, currentPrice: 10000, lastUpdated: "15/12/2025" },
    { type: "Instagram Carousel", basePrice: 20000, currentPrice: 22000, lastUpdated: "10/12/2025" }]

  };

  const mockCampaigns = [
  {
    id: 1,
    campaignId: "CMP-2847",
    campaignName: "Summer Fashion Campaign",
    brandName: "Fashion Hub",
    startDate: "01/11/2025",
    endDate: "30/11/2025",
    deliverables: ["2 Posts", "3 Reels", "5 Stories"],
    totalReach: "2.5M",
    engagement: "4.2%",
    amount: 85000,
    status: "Completed",
    paymentStatus: "Paid"
  },
  {
    id: 2,
    campaignId: "CMP-2901",
    campaignName: "Winter Collection Launch",
    brandName: "Style Studio",
    startDate: "10/12/2025",
    endDate: "25/12/2025",
    deliverables: ["1 Post", "2 Reels"],
    totalReach: "1.8M",
    engagement: "5.1%",
    amount: 55000,
    status: "Active",
    paymentStatus: "Pending"
  },
  {
    id: 3,
    campaignId: "CMP-2756",
    campaignName: "Festive Beauty Campaign",
    brandName: "Glow Cosmetics",
    startDate: "15/10/2025",
    endDate: "31/10/2025",
    deliverables: ["3 Posts", "4 Stories"],
    totalReach: "3.2M",
    engagement: "4.8%",
    amount: 72000,
    status: "Completed",
    paymentStatus: "Paid"
  }];


  const mockPayments = [
  {
    id: 1,
    date: "05/12/2025",
    time: "02:30 PM",
    campaignName: "Summer Fashion Campaign",
    brandName: "Fashion Hub",
    amount: 85000,
    mode: "Bank Transfer",
    modeIcon: "Building2",
    reference: "TXN-2847-001",
    utrNumber: "UTR123456789012",
    status: "Paid",
    delayDays: 0
  },
  {
    id: 2,
    date: "15/12/2025",
    time: "11:00 AM",
    campaignName: "Winter Collection Launch",
    brandName: "Style Studio",
    amount: 55000,
    mode: "UPI",
    modeIcon: "Smartphone",
    reference: "TXN-2901-001",
    utrNumber: null,
    status: "Pending",
    delayDays: 3
  },
  {
    id: 3,
    date: "25/10/2025",
    time: "04:15 PM",
    campaignName: "Festive Beauty Campaign",
    brandName: "Glow Cosmetics",
    amount: 72000,
    mode: "NEFT",
    modeIcon: "Building2",
    reference: "TXN-2756-001",
    utrNumber: "UTR987654321098",
    status: "Paid",
    delayDays: 0
  }];


  const mockPriceHistory = [
  {
    date: "01/01/2025",
    instagramPost: 15000,
    instagramReel: 25000,
    instagramStory: 8000,
    reason: "Initial Pricing",
    updatedBy: "Admin",
    notes: "Base pricing set during onboarding based on follower count and engagement metrics."
  },
  {
    date: "15/06/2025",
    instagramPost: 16500,
    instagramReel: 27000,
    instagramStory: 9000,
    reason: "Performance Review",
    updatedBy: "Priya Sharma",
    notes: "Price increased after consistent high engagement rates and successful campaign completions."
  },
  {
    date: "15/12/2025",
    instagramPost: 18000,
    instagramReel: 30000,
    instagramStory: 10000,
    reason: "Market Adjustment",
    updatedBy: "Admin",
    notes: "Pricing updated to reflect current market rates and increased follower base (125K followers)."
  }];


  const mockNotes = [
  {
    id: 1,
    author: "Priya Sharma",
    role: "Campaign Manager",
    date: "16/12/2025",
    time: "03:45 PM",
    content: "Sarah has been extremely professional in all campaigns. Her content quality is consistently high and she delivers on time. Recommended for premium brand collaborations.",
    tags: ["Professional", "High Quality"]
  },
  {
    id: 2,
    author: "Rahul Verma",
    role: "Super Admin",
    date: "10/12/2025",
    time: "11:20 AM",
    content: "Negotiated pricing for Winter Collection campaign. Sarah agreed to ₹55,000 for 1 post + 2 reels package. Payment terms: 50% advance, 50% on completion.",
    tags: ["Negotiation", "Payment Terms"]
  },
  {
    id: 3,
    author: "Anjali Patel",
    role: "Manager",
    date: "05/12/2025",
    time: "09:15 AM",
    content: "Payment for Summer Fashion Campaign processed successfully. Sarah confirmed receipt and provided excellent feedback about the collaboration experience.",
    tags: ["Payment", "Feedback"]
  }];


  const mockQuickStats = {
    totalCampaigns: 12,
    completedCampaigns: 10,
    activeCampaigns: 2,
    totalEarned: 850000,
    avgPerCampaign: 70833,
    performanceScore: 9.2,
    memberSince: "Jan 2025"
  };

  const mockRecentActivities = [
  {
    id: 1,
    type: "campaign",
    description: "Added to Winter Collection Launch campaign",
    timestamp: "2 hours ago",
    author: "Priya Sharma"
  },
  {
    id: 2,
    type: "payment",
    description: "Payment of ₹85,000 processed for Summer Fashion Campaign",
    timestamp: "1 day ago",
    author: "Finance Team"
  },
  {
    id: 3,
    type: "profile",
    description: "Pricing updated for Instagram Reel to ₹30,000",
    timestamp: "3 days ago",
    author: "Admin"
  },
  {
    id: 4,
    type: "note",
    description: "New note added by Priya Sharma",
    timestamp: "5 days ago",
    author: "Priya Sharma"
  }];


  const mockRelatedCreators = [
  {
    id: 2,
    name: "Priya Kapoor",
    profileImage: "https://img.rocket.new/generatedImages/rocket_gen_img_110d8ebca-1763293372651.png",
    profileImageAlt: "Professional portrait of Indian woman with shoulder-length black hair wearing traditional ethnic wear",
    instagramHandle: "@priya_style",
    followersCount: "110K",
    category: "Fashion"
  },
  {
    id: 3,
    name: "Neha Sharma",
    profileImage: "https://img.rocket.new/generatedImages/rocket_gen_img_115c78a62-1763299199397.png",
    profileImageAlt: "Headshot of young woman with long wavy hair in casual denim jacket smiling at camera",
    instagramHandle: "@neha_lifestyle",
    followersCount: "95K",
    category: "Lifestyle"
  },
  {
    id: 4,
    name: "Riya Patel",
    profileImage: "https://img.rocket.new/generatedImages/rocket_gen_img_1fb567cf5-1763298323954.png",
    profileImageAlt: "Professional photo of woman with straight hair wearing business casual attire against white background",
    instagramHandle: "@riya_beauty",
    followersCount: "130K",
    category: "Beauty"
  }];


  const tabs = [
  { id: 'overview', label: 'Overview', icon: 'LayoutDashboard', badge: null },
  { id: 'campaigns', label: 'Campaign History', icon: 'Megaphone', badge: campaigns?.length },
  { id: 'payments', label: 'Payment History', icon: 'CreditCard', badge: null },
  { id: 'pricing', label: 'Price History', icon: 'TrendingUp', badge: null },
  { id: 'notes', label: 'Notes', icon: 'MessageSquare', badge: notes?.length }];


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

  useEffect(() => {
    if (!id) return;

    // Subscribe to real-time creator changes
    const creatorSubscription = realtimeService?.subscribeToCreators(
      null,
      (updatedCreator) => {
        // Handle UPDATE - refresh creator profile if it's the current one
        if (updatedCreator?.id === id) {
          setCreator(updatedCreator);
        }
      },
      (deletedId) => {
        // Handle DELETE - navigate away if current creator is deleted
        if (deletedId === id) {
          navigate('/creator-database-management');
        }
      }
    );

    // Subscribe to campaign changes for this creator
    const campaignSubscription = realtimeService?.subscribeToCampaigns(
      (newCampaign) => {
        // Add new campaign if it belongs to this creator
        if (newCampaign?.creatorId === id) {
          setCampaigns((prev) => [newCampaign, ...prev]);
        }
      },
      (updatedCampaign) => {
        // Update campaign if it belongs to this creator
        if (updatedCampaign?.creatorId === id) {
          setCampaigns((prev) =>
            prev?.map((campaign) =>
              campaign?.id === updatedCampaign?.id ? updatedCampaign : campaign
            )
          );
        }
      },
      (deletedId) => {
        // Remove campaign from list
        setCampaigns((prev) => prev?.filter((campaign) => campaign?.id !== deletedId));
      }
    );

    // Cleanup subscriptions on unmount
    return () => {
      creatorSubscription?.unsubscribe();
      campaignSubscription?.unsubscribe();
    };
  }, [id, navigate]);

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

  return (
    <div className="min-h-screen bg-background">
      <Sidebar
        isCollapsed={isSidebarCollapsed}
        onToggleCollapse={() => setIsSidebarCollapsed(!isSidebarCollapsed)} />

      <Header isCollapsed={isSidebarCollapsed} />

      <main className={`main-content ${isSidebarCollapsed ? 'sidebar-collapsed' : ''}`}>
        <ProfileHeader
          creator={creator || mockCreator}
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
              {activeTab === 'overview' && <OverviewTab creator={creator || mockCreator} />}
              {activeTab === 'campaigns' && <CampaignHistoryTab campaigns={campaigns} />}
              {activeTab === 'payments' && <PaymentHistoryTab payments={mockPayments} />}
              {activeTab === 'pricing' && <PriceHistoryTab priceHistory={mockPriceHistory} />}
              {activeTab === 'notes' && <NotesTab notes={mockNotes} onAddNote={handleAddNote} />}
            </div>

            <div className="space-y-6">
              <QuickStatsWidget stats={mockQuickStats} />
              <RecentActivityFeed activities={mockRecentActivities} />
              <RelatedCreatorsWidget creators={mockRelatedCreators} />
            </div>
          </div>
        </div>
      </main>
    </div>);

};

export default CreatorProfileDetails;