import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Sidebar from '../../components/ui/Sidebar';
import Header from '../../components/ui/Header';

import Button from '../../components/ui/Button';
import PaymentStatusTabs from './components/PaymentStatusTabs';
import PaymentFilterSidebar from './components/PaymentFilterSidebar';
import BulkOperationsToolbar from './components/BulkOperationsToolbar';
import PaymentTable from './components/PaymentTable';
import ExportReportModal from './components/ExportReportModal';
import KeyboardShortcutsHelper from './components/KeyboardShortcutsHelper';
import { realtimeService } from '../../services/realtimeService';

const PaymentProcessingCenter = () => {
  const navigate = useNavigate();
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [activeTab, setActiveTab] = useState('pending');
  const [selectedPayments, setSelectedPayments] = useState([]);
  const [showExportModal, setShowExportModal] = useState(false);
  const [sortConfig, setSortConfig] = useState({ key: 'dueDate', direction: 'asc' });
  const [payments, setPayments] = useState([]);
  const [filters, setFilters] = useState({
    amountRange: 'all',
    paymentMethod: 'all',
    creator: 'all',
    dateFrom: '',
    dateTo: ''
  });
  const [savedPresets, setSavedPresets] = useState([
    { name: 'High Value Pending', filters: { amountRange: '50000+', status: 'pending' } },
    { name: 'This Month Overdue', filters: { status: 'overdue', dateFrom: '2025-12-01' } }
  ]);

  const userRole = 'Super Admin';

  const mockPayments = [
    {
      id: 1,
      creatorName: 'Sarah Johnson',
      instagramHandle: '@fashionista_sarah',
      campaignName: 'Summer Fashion Campaign',
      campaignId: 'CAMP-2847',
      amount: 25000,
      dueDate: '2025-12-15',
      delayDays: 3,
      paymentMethod: 'Bank Transfer',
      status: 'overdue',
      referenceNumber: 'REF-2847-001',
      gatewaySync: true,
      bankReconciled: false
    },
    {
      id: 2,
      creatorName: 'Priya Sharma',
      instagramHandle: '@priya_lifestyle',
      campaignName: 'Beauty Product Launch',
      campaignId: 'CAMP-2851',
      amount: 15000,
      dueDate: '2025-12-20',
      delayDays: 0,
      paymentMethod: 'UPI',
      status: 'pending',
      referenceNumber: '',
      gatewaySync: false,
      bankReconciled: false
    },
    {
      id: 3,
      creatorName: 'Rahul Verma',
      instagramHandle: '@rahul_tech',
      campaignName: 'Tech Gadget Review',
      campaignId: 'CAMP-2849',
      amount: 35000,
      dueDate: '2025-12-18',
      delayDays: 0,
      paymentMethod: 'Bank Transfer',
      status: 'processing',
      referenceNumber: 'REF-2849-001',
      gatewaySync: true,
      bankReconciled: true
    },
    {
      id: 4,
      creatorName: 'Ananya Patel',
      instagramHandle: '@ananya_fitness',
      campaignName: 'Fitness Equipment Promo',
      campaignId: 'CAMP-2845',
      amount: 20000,
      dueDate: '2025-12-10',
      delayDays: 8,
      paymentMethod: 'Cheque',
      status: 'overdue',
      referenceNumber: 'CHQ-2845-001',
      gatewaySync: false,
      bankReconciled: false
    },
    {
      id: 5,
      creatorName: 'Vikram Singh',
      instagramHandle: '@vikram_travel',
      campaignName: 'Travel Destination Campaign',
      campaignId: 'CAMP-2843',
      amount: 45000,
      dueDate: '2025-11-30',
      delayDays: 0,
      paymentMethod: 'Bank Transfer',
      status: 'paid',
      referenceNumber: 'REF-2843-001',
      gatewaySync: true,
      bankReconciled: true
    },
    {
      id: 6,
      creatorName: 'Meera Reddy',
      instagramHandle: '@meera_food',
      campaignName: 'Restaurant Review Series',
      campaignId: 'CAMP-2852',
      amount: 18000,
      dueDate: '2025-12-22',
      delayDays: 0,
      paymentMethod: 'UPI',
      status: 'pending',
      referenceNumber: '',
      gatewaySync: false,
      bankReconciled: false
    },
    {
      id: 7,
      creatorName: 'Arjun Kapoor',
      instagramHandle: '@arjun_gaming',
      campaignName: 'Gaming Console Launch',
      campaignId: 'CAMP-2848',
      amount: 55000,
      dueDate: '2025-12-19',
      delayDays: 0,
      paymentMethod: 'Bank Transfer',
      status: 'processing',
      referenceNumber: 'REF-2848-001',
      gatewaySync: true,
      bankReconciled: false
    },
    {
      id: 8,
      creatorName: 'Divya Nair',
      instagramHandle: '@divya_beauty',
      campaignName: 'Skincare Product Review',
      campaignId: 'CAMP-2850',
      amount: 22000,
      dueDate: '2025-12-12',
      delayDays: 6,
      paymentMethod: 'Digital Wallet',
      status: 'overdue',
      referenceNumber: '',
      gatewaySync: false,
      bankReconciled: false
    },
    {
      id: 9,
      creatorName: 'Karan Malhotra',
      instagramHandle: '@karan_auto',
      campaignName: 'Car Accessories Campaign',
      campaignId: 'CAMP-2846',
      amount: 30000,
      dueDate: '2025-11-28',
      delayDays: 0,
      paymentMethod: 'Bank Transfer',
      status: 'paid',
      referenceNumber: 'REF-2846-001',
      gatewaySync: true,
      bankReconciled: true
    },
    {
      id: 10,
      creatorName: 'Sneha Gupta',
      instagramHandle: '@sneha_home',
      campaignName: 'Home Decor Collection',
      campaignId: 'CAMP-2853',
      amount: 28000,
      dueDate: '2025-12-25',
      delayDays: 0,
      paymentMethod: 'UPI',
      status: 'pending',
      referenceNumber: '',
      gatewaySync: false,
      bankReconciled: false
    }
  ];

  const getFilteredPayments = () => {
    return mockPayments?.filter(payment => {
      if (activeTab !== 'all' && payment?.status !== activeTab) return false;
      if (filters?.amountRange !== 'all') {
        const [min, max] = filters?.amountRange?.split('-')?.map(v => parseInt(v?.replace('+', '')));
        if (max) {
          if (payment?.amount < min || payment?.amount > max) return false;
        } else {
          if (payment?.amount < min) return false;
        }
      }
      if (filters?.paymentMethod !== 'all' && payment?.paymentMethod?.toLowerCase()?.replace(' ', '_') !== filters?.paymentMethod) return false;
      if (filters?.creator !== 'all' && payment?.instagramHandle?.replace('@', '')?.replace('_', '') !== filters?.creator?.replace('_', '')) return false;
      if (filters?.dateFrom && new Date(payment.dueDate) < new Date(filters.dateFrom)) return false;
      if (filters?.dateTo && new Date(payment.dueDate) > new Date(filters.dateTo)) return false;
      return true;
    });
  };

  const getSortedPayments = (payments) => {
    return [...payments]?.sort((a, b) => {
      let aValue = a?.[sortConfig?.key];
      let bValue = b?.[sortConfig?.key];

      if (sortConfig?.key === 'amount') {
        aValue = parseFloat(aValue);
        bValue = parseFloat(bValue);
      } else if (sortConfig?.key === 'dueDate') {
        aValue = new Date(aValue);
        bValue = new Date(bValue);
      }

      if (aValue < bValue) return sortConfig?.direction === 'asc' ? -1 : 1;
      if (aValue > bValue) return sortConfig?.direction === 'asc' ? 1 : -1;
      return 0;
    });
  };

  const filteredPayments = getFilteredPayments();
  const sortedPayments = getSortedPayments(filteredPayments);

  const statusCounts = {
    pending: mockPayments?.filter(p => p?.status === 'pending')?.length,
    processing: mockPayments?.filter(p => p?.status === 'processing')?.length,
    paid: mockPayments?.filter(p => p?.status === 'paid')?.length,
    overdue: mockPayments?.filter(p => p?.status === 'overdue')?.length
  };

  const statusTotals = {
    pending: mockPayments?.filter(p => p?.status === 'pending')?.reduce((sum, p) => sum + p?.amount, 0),
    processing: mockPayments?.filter(p => p?.status === 'processing')?.reduce((sum, p) => sum + p?.amount, 0),
    paid: mockPayments?.filter(p => p?.status === 'paid')?.reduce((sum, p) => sum + p?.amount, 0),
    overdue: mockPayments?.filter(p => p?.status === 'overdue')?.reduce((sum, p) => sum + p?.amount, 0)
  };

  const handleSelectAll = (checked) => {
    if (checked) {
      const visibleIds = sortedPayments?.slice(0, 100)?.map(p => p?.id);
      setSelectedPayments(visibleIds);
    } else {
      setSelectedPayments([]);
    }
  };

  const handleSelectPayment = (id, checked) => {
    if (checked) {
      setSelectedPayments([...selectedPayments, id]);
    } else {
      setSelectedPayments(selectedPayments?.filter(pid => pid !== id));
    }
  };

  const handleUpdatePayment = (id, updates) => {
    console.log('Update payment:', id, updates);
  };

  const handleBulkAction = (action) => {
    console.log('Bulk action:', action, 'on payments:', selectedPayments);
    setSelectedPayments([]);
  };

  const handleSort = (key) => {
    setSortConfig(prev => ({
      key,
      direction: prev?.key === key && prev?.direction === 'asc' ? 'desc' : 'asc'
    }));
  };

  const handleFilterChange = (key, value) => {
    if (key === 'preset') {
      setFilters(value?.filters);
    } else {
      setFilters(prev => ({ ...prev, [key]: value }));
    }
  };

  const handleClearFilters = () => {
    setFilters({
      amountRange: 'all',
      paymentMethod: 'all',
      creator: 'all',
      dateFrom: '',
      dateTo: ''
    });
  };

  const handleSavePreset = (name, filterConfig) => {
    setSavedPresets([...savedPresets, { name, filters: filterConfig }]);
  };

  const handleExport = (config) => {
    console.log('Export report with config:', config);
  };

  useEffect(() => {
    // Subscribe to real-time campaign changes (for payment status updates)
    const campaignSubscription = realtimeService?.subscribeToCampaigns(
      (newCampaign) => {
        // Handle INSERT - add new campaign payment
        setPayments((prev) => [newCampaign, ...prev]);
      },
      (updatedCampaign) => {
        // Handle UPDATE - update payment status
        setPayments((prev) =>
          prev?.map((payment) =>
            payment?.id === updatedCampaign?.id ? updatedCampaign : payment
          )
        );
      },
      (deletedId) => {
        // Handle DELETE - remove payment
        setPayments((prev) => prev?.filter((payment) => payment?.id !== deletedId));
      }
    );

    // Cleanup subscription on unmount
    return () => {
      campaignSubscription?.unsubscribe();
    };
  }, []);

  useEffect(() => {
    const handleKeyPress = (e) => {
      if (e?.target?.tagName === 'INPUT' || e?.target?.tagName === 'TEXTAREA') return;

      if (e?.key === 'p' && selectedPayments?.length > 0) {
        e?.preventDefault();
        handleBulkAction('mark_processing');
      } else if (e?.key === 'm' && selectedPayments?.length > 0) {
        e?.preventDefault();
        handleBulkAction('mark_paid');
      } else if (e?.key === 'e') {
        e?.preventDefault();
        setShowExportModal(true);
      } else if (e?.key === 'Escape' && selectedPayments?.length > 0) {
        setSelectedPayments([]);
      }
    };

    document.addEventListener('keydown', handleKeyPress);
    return () => document.removeEventListener('keydown', handleKeyPress);
  }, [selectedPayments]);

  return (
    <div className="min-h-screen bg-background">
      <Sidebar
        isCollapsed={isSidebarCollapsed}
        onToggleCollapse={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
      />
      <Header isCollapsed={isSidebarCollapsed} />
      <main className={`main-content ${isSidebarCollapsed ? 'sidebar-collapsed' : ''}`}>
        <div className="flex h-[calc(100vh-4rem)]">
          <PaymentFilterSidebar
            filters={filters}
            onFilterChange={handleFilterChange}
            onClearFilters={handleClearFilters}
            savedPresets={savedPresets}
            onSavePreset={handleSavePreset}
          />

          <div className="flex-1 flex flex-col overflow-hidden">
            <div className="bg-card border-b border-border px-6 py-4">
              <div className="flex items-center justify-between">
                <div>
                  <h1 className="text-2xl font-bold text-foreground">Payment Processing Center</h1>
                  <p className="text-sm text-muted-foreground mt-1">
                    Manage influencer payments and track financial operations
                  </p>
                </div>
                <div className="flex items-center gap-3">
                  <Button
                    variant="outline"
                    size="sm"
                    iconName="Download"
                    iconPosition="left"
                    onClick={() => setShowExportModal(true)}
                  >
                    Export Report
                  </Button>
                  <Button
                    variant="default"
                    size="sm"
                    iconName="Plus"
                    iconPosition="left"
                    onClick={() => navigate('/campaign-management-center')}
                  >
                    New Payment
                  </Button>
                </div>
              </div>
            </div>

            <PaymentStatusTabs
              activeTab={activeTab}
              onTabChange={setActiveTab}
              statusCounts={statusCounts}
              statusTotals={statusTotals}
            />

            {selectedPayments?.length > 0 && (
              <BulkOperationsToolbar
                selectedCount={selectedPayments?.length}
                onBulkAction={handleBulkAction}
                userRole={userRole}
              />
            )}

            <div className="flex-1 overflow-auto">
              <PaymentTable
                payments={sortedPayments}
                selectedPayments={selectedPayments}
                onSelectAll={handleSelectAll}
                onSelectPayment={handleSelectPayment}
                onUpdatePayment={handleUpdatePayment}
                sortConfig={sortConfig}
                onSort={handleSort}
                userRole={userRole}
              />
            </div>

            <div className="bg-card border-t border-border px-6 py-3">
              <div className="flex items-center justify-between text-sm text-muted-foreground">
                <span>
                  Showing {sortedPayments?.length} of {mockPayments?.length} payments
                </span>
                <span>
                  Total: {new Intl.NumberFormat('en-IN', {
                    style: 'currency',
                    currency: 'INR',
                    maximumFractionDigits: 0
                  })?.format(sortedPayments?.reduce((sum, p) => sum + p?.amount, 0))}
                </span>
              </div>
            </div>
          </div>
        </div>
      </main>
      <ExportReportModal
        isOpen={showExportModal}
        onClose={() => setShowExportModal(false)}
        onExport={handleExport}
      />
      <KeyboardShortcutsHelper />
    </div>
  );
};

export default PaymentProcessingCenter;