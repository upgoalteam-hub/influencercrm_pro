import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Sidebar from '../../components/ui/Sidebar';
import Header from '../../components/ui/Header';
import Icon from '../../components/AppIcon';
import Button from '../../components/ui/Button';
import MetricCard from './components/MetricCard';
import ActivityFeedItem from './components/ActivityFeedItem';
import CampaignStatusCard from './components/CampaignStatusCard';
import PaymentAlertItem from './components/PaymentAlertItem';
import ChartSection from './components/ChartSection';
import IntegrationStatusBadge from './components/IntegrationStatusBadge';
import { realtimeService } from '../../services/realtimeService';

const ExecutiveDashboard = () => {
  const navigate = useNavigate();
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [userRole] = useState('Super Admin');
  const [lastUpdated, setLastUpdated] = useState(new Date());
  const [isRefreshing, setIsRefreshing] = useState(false);

  const loadDashboardData = () => {
    setLastUpdated(new Date());
  };

  const metricsData = [
    {
      title: 'Total Creators',
      value: '1,247',
      change: '+12.5%',
      changeType: 'increase',
      trend: 'vs last month',
      icon: 'Users',
      iconColor: 'var(--color-primary)'
    },
    {
      title: 'Active Campaigns',
      value: '23',
      change: '+3',
      changeType: 'increase',
      trend: 'from last week',
      icon: 'Megaphone',
      iconColor: 'var(--color-accent)'
    },
    {
      title: 'Pending Payments',
      value: '₹2,45,000',
      change: '-8.2%',
      changeType: 'decrease',
      trend: 'vs last month',
      icon: 'CreditCard',
      iconColor: 'var(--color-warning)'
    },
    {
      title: 'Top Performers',
      value: '156',
      change: '+18.3%',
      changeType: 'increase',
      trend: 'engagement rate',
      icon: 'TrendingUp',
      iconColor: 'var(--color-success)'
    }
  ];

  const recentActivities = [
    {
      type: 'creator_added',
      title: 'New Creator Added',
      description: 'Sarah Johnson (@fashionista_sarah) added to database',
      user: 'Priya Sharma',
      timestamp: '5 minutes ago'
    },
    {
      type: 'campaign_created',
      title: 'Campaign Created',
      description: 'Winter Fashion Collection 2025 campaign launched',
      user: 'Rahul Verma',
      timestamp: '15 minutes ago'
    },
    {
      type: 'payment_processed',
      title: 'Payment Completed',
      description: '₹15,000 paid to Ananya Desai for Summer Campaign',
      user: 'System',
      timestamp: '1 hour ago'
    },
    {
      type: 'payment_overdue',
      title: 'Payment Overdue Alert',
      description: 'Payment for Campaign #2847 is 3 days overdue',
      user: 'System',
      timestamp: '2 hours ago'
    },
    {
      type: 'creator_updated',
      title: 'Creator Profile Updated',
      description: 'Vikram Singh updated follower count to 250K',
      user: 'Neha Patel',
      timestamp: '3 hours ago'
    }
  ];

  const activeCampaigns = [
    {
      name: 'Summer Fashion Campaign',
      brand: 'FashionHub India',
      status: 'Active',
      progress: 75,
      creators: 15,
      deadline: 'Dec 25, 2025'
    },
    {
      name: 'Tech Product Launch',
      brand: 'TechGear Pro',
      status: 'Active',
      progress: 45,
      creators: 8,
      deadline: 'Dec 30, 2025'
    },
    {
      name: 'Fitness Challenge 2025',
      brand: 'HealthFirst',
      status: 'Planning',
      progress: 20,
      creators: 12,
      deadline: 'Jan 15, 2026'
    },
    {
      name: 'Beauty Product Review',
      brand: 'GlowBeauty',
      status: 'Active',
      progress: 90,
      creators: 20,
      deadline: 'Dec 20, 2025'
    }
  ];

  const paymentAlerts = [
    {
      creator: 'Sarah Johnson',
      campaign: 'Summer Fashion Campaign',
      amount: '₹25,000',
      daysOverdue: 5,
      dueDate: 'Dec 13, 2025',
      severity: 'critical'
    },
    {
      creator: 'Vikram Singh',
      campaign: 'Tech Product Launch',
      amount: '₹18,500',
      daysOverdue: 3,
      dueDate: 'Dec 15, 2025',
      severity: 'high'
    },
    {
      creator: 'Ananya Desai',
      campaign: 'Fitness Challenge',
      amount: '₹12,000',
      daysOverdue: 1,
      dueDate: 'Dec 17, 2025',
      severity: 'medium'
    },
    {
      creator: 'Priya Sharma',
      campaign: 'Beauty Product Review',
      amount: '₹30,000',
      daysOverdue: 7,
      dueDate: 'Dec 11, 2025',
      severity: 'critical'
    },
    {
      creator: 'Rahul Verma',
      campaign: 'Winter Collection',
      amount: '₹22,500',
      daysOverdue: 2,
      dueDate: 'Dec 16, 2025',
      severity: 'high'
    }
  ];

  const campaignVolumeData = [
    { name: 'Jan', value: 12 },
    { name: 'Feb', value: 15 },
    { name: 'Mar', value: 18 },
    { name: 'Apr', value: 14 },
    { name: 'May', value: 22 },
    { name: 'Jun', value: 25 },
    { name: 'Jul', value: 28 },
    { name: 'Aug', value: 24 },
    { name: 'Sep', value: 30 },
    { name: 'Oct', value: 27 },
    { name: 'Nov', value: 32 },
    { name: 'Dec', value: 23 }
  ];

  const creatorAcquisitionData = [
    { name: 'Jan', value: 85 },
    { name: 'Feb', value: 92 },
    { name: 'Mar', value: 105 },
    { name: 'Apr', value: 98 },
    { name: 'May', value: 125 },
    { name: 'Jun', value: 142 },
    { name: 'Jul', value: 158 },
    { name: 'Aug', value: 135 },
    { name: 'Sep', value: 165 },
    { name: 'Oct', value: 178 },
    { name: 'Nov', value: 195 },
    { name: 'Dec', value: 147 }
  ];

  const integrationStatus = [
    {
      name: 'Instagram API',
      status: 'active',
      lastSync: '2 minutes ago'
    },
    {
      name: 'Payment Gateway',
      status: 'active',
      lastSync: '5 minutes ago'
    },
    {
      name: 'Google Sheets Migration',
      status: 'syncing',
      lastSync: 'In progress'
    }
  ];

  useEffect(() => {
    // Subscribe to all relevant real-time changes for dashboard
    const creatorSubscription = realtimeService?.subscribeToCreators(
      () => loadDashboardData(),
      () => loadDashboardData(),
      () => loadDashboardData()
    );

    const campaignSubscription = realtimeService?.subscribeToCampaigns(
      () => loadDashboardData(),
      () => loadDashboardData(),
      () => loadDashboardData()
    );

    const deliverableSubscription = realtimeService?.subscribeToDeliverables(
      () => loadDashboardData(),
      () => loadDashboardData(),
      () => loadDashboardData()
    );

    // Cleanup subscriptions on unmount
    return () => {
      creatorSubscription?.unsubscribe();
      campaignSubscription?.unsubscribe();
      deliverableSubscription?.unsubscribe();
    };
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      setLastUpdated(new Date());
    }, 30000);

    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const handleKeyPress = (e) => {
      if (e?.ctrlKey || e?.metaKey) {
        switch (e?.key?.toLowerCase()) {
          case 'c':
            e?.preventDefault();
            navigate('/campaign-management-center');
            break;
          case 'p':
            e?.preventDefault();
            navigate('/payment-processing-center');
            break;
          case 's':
            e?.preventDefault();
            document.querySelector('input[type="text"]')?.focus();
            break;
          default:
            break;
        }
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [navigate]);

  const handleRefresh = () => {
    setIsRefreshing(true);
    setTimeout(() => {
      setLastUpdated(new Date());
      setIsRefreshing(false);
    }, 1000);
  };

  const handleExportReport = () => {
    console.log('Exporting executive report...');
  };

  const formatLastUpdated = () => {
    const now = new Date();
    const diff = Math.floor((now - lastUpdated) / 1000);
    
    if (diff < 60) return 'Just now';
    if (diff < 3600) return `${Math.floor(diff / 60)} minutes ago`;
    return lastUpdated?.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <div className="min-h-screen bg-background">
      <Sidebar 
        isCollapsed={isSidebarCollapsed} 
        onToggleCollapse={() => setIsSidebarCollapsed(!isSidebarCollapsed)} 
      />
      <Header isCollapsed={isSidebarCollapsed} />
      <main className={`main-content ${isSidebarCollapsed ? 'sidebar-collapsed' : ''}`}>
        <div className="p-6 max-w-[1600px] mx-auto">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-2xl font-bold text-foreground mb-1">Executive Dashboard</h1>
              <p className="text-sm text-muted-foreground">
                Real-time business intelligence • Last updated: {formatLastUpdated()}
              </p>
            </div>
            <div className="flex items-center gap-3">
              <Button
                variant="outline"
                iconName={isRefreshing ? 'Loader2' : 'RefreshCw'}
                iconPosition="left"
                onClick={handleRefresh}
                disabled={isRefreshing}
              >
                Refresh
              </Button>
              <Button
                variant="default"
                iconName="Download"
                iconPosition="left"
                onClick={handleExportReport}
              >
                Export Report
              </Button>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
            {metricsData?.map((metric, index) => (
              <MetricCard key={index} {...metric} loading={isRefreshing} />
            ))}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 mb-6">
            <div className="lg:col-span-3 bg-card border border-border rounded-lg p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold text-foreground">Recent Activity</h2>
                <Icon name="Activity" size={20} color="var(--color-primary)" />
              </div>
              <div className="space-y-2 max-h-[500px] overflow-y-auto custom-scrollbar">
                {recentActivities?.map((activity, index) => (
                  <ActivityFeedItem key={index} activity={activity} />
                ))}
              </div>
            </div>

            <div className="lg:col-span-5 bg-card border border-border rounded-lg p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold text-foreground">Campaign Status</h2>
                <Button
                  variant="ghost"
                  size="sm"
                  iconName="ArrowRight"
                  iconPosition="right"
                  onClick={() => navigate('/campaign-management-center')}
                >
                  View All
                </Button>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {activeCampaigns?.map((campaign, index) => (
                  <CampaignStatusCard key={index} campaign={campaign} />
                ))}
              </div>
            </div>

            <div className="lg:col-span-4 bg-card border border-border rounded-lg p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold text-foreground">Payment Alerts</h2>
                <Button
                  variant="ghost"
                  size="sm"
                  iconName="ArrowRight"
                  iconPosition="right"
                  onClick={() => navigate('/payment-processing-center')}
                >
                  View All
                </Button>
              </div>
              <div className="space-y-3 max-h-[500px] overflow-y-auto custom-scrollbar">
                {paymentAlerts?.map((payment, index) => (
                  <PaymentAlertItem key={index} payment={payment} />
                ))}
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
            <ChartSection
              type="bar"
              title="Monthly Campaign Volume"
              data={campaignVolumeData}
              loading={isRefreshing}
            />
            <ChartSection
              type="line"
              title="Creator Acquisition Trends"
              data={creatorAcquisitionData}
              loading={isRefreshing}
            />
          </div>

          <div className="bg-card border border-border rounded-lg p-6">
            <h2 className="text-lg font-semibold text-foreground mb-4">Integration Status</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {integrationStatus?.map((integration, index) => (
                <IntegrationStatusBadge key={index} {...integration} />
              ))}
            </div>
          </div>

          <div className="mt-6 p-4 bg-muted border border-border rounded-lg">
            <div className="flex items-start gap-3">
              <Icon name="Keyboard" size={20} color="var(--color-primary)" />
              <div className="flex-1">
                <p className="text-sm font-medium text-foreground mb-2">Keyboard Shortcuts</p>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-2 text-xs text-muted-foreground">
                  <div><kbd className="px-2 py-1 bg-background rounded border border-border">Ctrl+C</kbd> Create Campaign</div>
                  <div><kbd className="px-2 py-1 bg-background rounded border border-border">Ctrl+P</kbd> Payments</div>
                  <div><kbd className="px-2 py-1 bg-background rounded border border-border">Ctrl+S</kbd> Search</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default ExecutiveDashboard;