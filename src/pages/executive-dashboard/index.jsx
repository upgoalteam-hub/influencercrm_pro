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
import { campaignService } from '../../services/campaignService';
import { creatorService } from '../../services/creatorService';
import { exportUtils } from '../../utils/exportUtils';
import { supabase } from '../../lib/supabase';

const ExecutiveDashboard = () => {
  const navigate = useNavigate();
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [userRole] = useState('Super Admin');
  const [lastUpdated, setLastUpdated] = useState(new Date());
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [dashboardData, setDashboardData] = useState(null);
  const [loading, setLoading] = useState(true);

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      
      // Fetch real data from Supabase
      // Use getCount() for accurate total count, and getAll() for other metrics
      const [campaignsData, topCreators, totalCreatorsCount] = await Promise.all([
        campaignService?.getAll(),
        // fetch a small page for top performers (avoid loading all creators)
        creatorService?.getAll({ limit: 6, offset: 0 }),
        creatorService?.getCount() // Get accurate total count
      ]);

      // Calculate real metrics
      const activeCampaigns = campaignsData?.filter(c => c?.status === 'active')?.length || 0;
      const totalCreators = totalCreatorsCount || 0; // Use the count from getCount()

      // Get pending payments sum from payments table
      let pendingPayments = 0;
      try {
        const { data: pendingRows, error: pendingErr } = await supabase
          .from('payments')
          .select('amount')
          .in('status', ['pending', 'overdue']);
        if (!pendingErr && pendingRows) pendingPayments = pendingRows.reduce((s, r) => s + (r?.amount || 0), 0);
      } catch (err) {
        console.error('Error fetching pending payments:', err);
      }

      const topPerformers = (topCreators || []).slice(0, 6) || [];

      const data = {
        metrics: {
          totalCreators,
          activeCampaigns,
          pendingPayments,
          topPerformers: Array.isArray(topPerformers) ? topPerformers.length : topPerformers
        },
        campaigns: campaignsData,
        creators: topPerformers
      };

      setDashboardData(data);
      setLastUpdated(new Date());
    } catch (err) {
      console.error('Error loading dashboard data:', err);
    } finally {
      setLoading(false);
    }
  };

  const metricsData = dashboardData ? [
    {
      title: 'Total Creators',
      value: (dashboardData?.metrics?.totalCreators ?? 0).toString(),
      change: '+12.5%',
      changeType: 'increase',
      trend: 'vs last month',
      icon: 'Users',
      iconColor: 'var(--color-primary)'
    },
    {
      title: 'Active Campaigns',
      value: (dashboardData?.metrics?.activeCampaigns ?? 0).toString(),
      change: '+3',
      changeType: 'increase',
      trend: 'from last week',
      icon: 'Megaphone',
      iconColor: 'var(--color-accent)'
    },
    {
      title: 'Pending Payments',
      value: new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 })?.format(dashboardData?.metrics?.pendingPayments ?? 0),
      change: '-8.2%',
      changeType: 'decrease',
      trend: 'vs last month',
      icon: 'CreditCard',
      iconColor: 'var(--color-warning)'
    },
    {
      title: 'Top Performers',
      value: (dashboardData?.metrics?.topPerformers ?? 0).toString(),
      change: '+18.3%',
      changeType: 'increase',
      trend: 'engagement rate',
      icon: 'TrendingUp',
      iconColor: 'var(--color-success)'
    }
  ] : [];

  const [recentActivities, setRecentActivities] = useState([]);

  // activeCampaigns will be derived from campaignsData

  const [paymentAlerts, setPaymentAlerts] = useState([]);

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
    loadDashboardData();

    // Load recent activities and payment alerts
    const loadExtras = async () => {
      try {
        const { data: activities } = await supabase
          .from('activity_log')
          .select('*')
          .order('created_at', { ascending: false })
          .limit(8);

        setRecentActivities(activities || []);
      } catch (err) {
        console.error('Error loading activities:', err);
        setRecentActivities([]);
      }

      try {
        const { data: overdue } = await supabase
          .from('payments')
          .select('id,creator_id,campaign_id,amount,due_date')
          .eq('status', 'overdue')
          .order('due_date', { ascending: false })
          .limit(6);

        setPaymentAlerts((overdue || []).map(p => ({
          creator: p.creator_id,
          campaign: p.campaign_id,
          amount: p.amount,
          dueDate: p.due_date,
          severity: 'high'
        })));
      } catch (err) {
        console.error('Error loading payment alerts:', err);
        setPaymentAlerts([]);
      }
    };

    loadExtras();

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

  const handleRefresh = async () => {
    setIsRefreshing(true);
    await loadDashboardData();
    setIsRefreshing(false);
  };

  const handleExportReport = () => {
    try {
      if (!dashboardData) {
        alert('No dashboard data available to export');
        return;
      }

      // Prepare export data
      const exportData = {
        campaigns: exportUtils?.formatCampaignData(
          dashboardData?.campaigns || [],
          ['creator', 'campaign', 'amount', 'dueDate', 'status']
        ),
        creators: exportUtils?.formatCreatorData(dashboardData?.creators || []),
        metrics: [
          { Metric: 'Total Creators', Value: dashboardData?.metrics?.totalCreators },
          { Metric: 'Active Campaigns', Value: dashboardData?.metrics?.activeCampaigns },
          { Metric: 'Pending Payments', Value: dashboardData?.metrics?.pendingPayments },
          { Metric: 'Top Performers', Value: dashboardData?.metrics?.topPerformers }
        ]
      };

      // Create summary report
      const summaryData = [
        { Section: 'Overview', Details: `${dashboardData?.metrics?.totalCreators} creators, ${dashboardData?.metrics?.activeCampaigns} active campaigns` },
        { Section: 'Financials', Details: `₹${dashboardData?.metrics?.pendingPayments?.toLocaleString('en-IN')} pending payments` },
        { Section: 'Performance', Details: `${dashboardData?.metrics?.topPerformers} top performing creators` },
        { Section: 'Generated', Details: new Date()?.toLocaleString('en-IN') }
      ];

      // Generate filename with timestamp
      const timestamp = new Date()?.toISOString()?.slice(0, 10);
      const filename = `executive-dashboard-${timestamp}`;

      // Export to Excel (includes all sheets)
      exportUtils?.exportToExcel(summaryData, filename);

      alert('Dashboard report exported successfully!');
    } catch (error) {
      console.error('Export failed:', error);
      alert(`Failed to export dashboard report: ${error?.message}`);
    }
  };

  const formatLastUpdated = () => {
    const now = new Date();
    const diff = Math.floor((now - lastUpdated) / 1000);
    
    if (diff < 60) return 'Just now';
    if (diff < 3600) return `${Math.floor(diff / 60)} minutes ago`;
    return lastUpdated?.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' });
  };

  // Add loading state
  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <Sidebar 
          isCollapsed={isSidebarCollapsed} 
          onToggleCollapse={() => setIsSidebarCollapsed(!isSidebarCollapsed)} 
        />
        <Header isCollapsed={isSidebarCollapsed} />
        <main className={`main-content ${isSidebarCollapsed ? 'sidebar-collapsed' : ''}`}>
          <div className="flex items-center justify-center h-[calc(100vh-4rem)]">
            <div className="text-center">
              <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
              <p className="text-muted-foreground">Loading dashboard data...</p>
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
                {(dashboardData?.campaigns || []).filter(c => c?.status === 'active').map((campaign, index) => (
                  <CampaignStatusCard key={campaign?.id ?? index} campaign={campaign} />
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