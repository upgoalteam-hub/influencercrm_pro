import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import Sidebar from '../../components/ui/Sidebar';
import Header from '../../components/ui/Header';
import Icon from '../../components/AppIcon';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';
import FilterSidebar from './components/FilterSidebar';
import CreatorTable from './components/CreatorTable';
import BulkActionsToolbar from './components/BulkActionsToolbar';
import SavedFiltersDrawer from './components/SavedFiltersDrawer';
import ExportDialog from './components/ExportDialog';
import Select from '../../components/ui/Select';
import AddCreatorModal from './components/AddCreatorModal';
import { creatorService } from '../../services/creatorService';
import { realtimeService } from '../../services/realtimeService';


export default function CreatorDatabaseManagement() {
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [isFilterSidebarVisible, setIsFilterSidebarVisible] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [filters, setFilters] = useState({
    category: [],
    city: [],
    followers: [],
    engagement: [],
    tags: [],
    status: []
  });
  const [selectedCreators, setSelectedCreators] = useState([]);
  const [sortConfig, setSortConfig] = useState({ column: 'created_at', direction: 'desc' });
  const [showExportDialog, setShowExportDialog] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(25);
  const [showAddCreatorModal, setShowAddCreatorModal] = useState(false);
  const { userProfile } = useAuth();
  const userRole = userProfile?.role || 'Super Admin';

  // Updated state - no longer storing all creators
  const [creators, setCreators] = useState([]);
  const [totalCreatorsCount, setTotalCreatorsCount] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isInitialLoad, setIsInitialLoad] = useState(true);

  // Fetch paginated creators with server-side filtering
  const fetchCreators = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Convert filters to match API format
      const apiFilters = {
        city: filters?.city || [],
        state: filters?.state || [],
        followers_tier: filters?.followers || [],
        sheet_source: filters?.sheet_source || []
      };

      const result = await creatorService?.getPaginated({
        page: currentPage,
        pageSize: itemsPerPage,
        searchQuery: searchQuery || '',
        filters: apiFilters,
        sortColumn: sortConfig?.column || 'created_at',
        sortDirection: sortConfig?.direction || 'desc'
      });

      // Transform data for display - ensure all fields are present
      const transformedData = (result?.data || []).map(creator => ({
        id: creator?.id || `temp-${Date.now()}-${Math.random()}`,
        sr_no: creator?.sr_no || 'N/A',
        name: creator?.name || 'N/A',
        instagram_link: creator?.instagram_link || 'N/A',
        followers_tier: creator?.followers_tier || 'N/A',
        state: creator?.state || 'N/A',
        city: creator?.city || 'N/A',
        whatsapp: creator?.whatsapp || 'N/A',
        email: creator?.email || 'N/A',
        gender: creator?.gender || 'N/A',
        username: creator?.username || 'N/A',
        sheet_source: creator?.sheet_source || 'N/A'
      }));

      // Only update state if data is valid
      setCreators(transformedData);
      setTotalCreatorsCount(result?.total || 0);
      setTotalPages(result?.totalPages || 0);
      setIsInitialLoad(false);
    } catch (err) {
      console.error('Error fetching creators:', err);
      setError(err?.message || 'Failed to load creators from database');
      setCreators([]); // Ensure empty array on error
    } finally {
      setLoading(false);
    }
  };

  // Fetch total count separately (fast query)
  const fetchTotalCount = async () => {
    try {
      const count = await creatorService?.getCount();
      setTotalCreatorsCount(count || 0);
    } catch (err) {
      console.error('Error fetching total count:', err);
    }
  };

  // Load initial data
  useEffect(() => {
    // Fetch total count immediately (fast)
    fetchTotalCount();
    // Then fetch first page
    fetchCreators();
  }, []);

  // Refetch when pagination, filters, search, or sort changes
  useEffect(() => {
    if (!isInitialLoad) {
      setCurrentPage(1); // Reset to first page when filters change
    }
  }, [filters, searchQuery, sortConfig, itemsPerPage]);

  useEffect(() => {
    fetchCreators();
  }, [currentPage, itemsPerPage, filters, searchQuery, sortConfig]);

  // Real-time subscription for updates (only for current page)
  useEffect(() => {
    const subscription = realtimeService?.subscribeToCreators(
      (newCreator) => {
        // Only refresh if we're on page 1
        if (currentPage === 1) {
          fetchCreators();
        } else {
          // Just update count
          fetchTotalCount();
        }
      },
      (updatedCreator) => {
        // Refresh current page if updated creator is visible
        if (creators?.some(c => c?.id === updatedCreator?.id)) {
          fetchCreators();
        }
      },
      (deletedId) => {
        // Refresh if deleted creator was visible
        if (creators?.some(c => c?.id === deletedId)) {
          fetchCreators();
          fetchTotalCount();
        }
      }
    );

    return () => {
      subscription?.unsubscribe();
    };
  }, [currentPage, creators]);

  // Remove client-side filtering - now handled server-side
  // Remove applyFilters function

  const handleFilterChange = (filterType, values) => {
    if (filterType === 'clearAll') {
      setFilters({
        category: [],
        city: [],
        followers: [],
        engagement: [],
        tags: [],
        status: []
      });
    } else {
      setFilters((prev) => ({
        ...prev,
        [filterType]: values
      }));
    }
  };

  const handleSort = (column) => {
    setSortConfig((prev) => ({
      column,
      direction: prev?.column === column && prev?.direction === 'asc' ? 'desc' : 'asc'
    }));
  };

  const handleBulkAction = (action) => {
    console.log('Bulk action:', action, 'for creators:', selectedCreators);
    if (action === 'export') {
      setShowExportDialog(true);
    }
  };

  const handleApplySavedFilter = (savedFilters) => {
    setFilters(savedFilters);
  };

  const handleCreatorAdded = (newCreator) => {
    // Refresh first page
    setCurrentPage(1);
    fetchCreators();
    fetchTotalCount();
  };

  // Debounced search handler
  const [debouncedSearchQuery, setDebouncedSearchQuery] = useState('');
  
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearchQuery(searchQuery);
    }, 300); // 300ms debounce

    return () => clearTimeout(timer);
  }, [searchQuery]);

  useEffect(() => {
    if (debouncedSearchQuery !== searchQuery) {
      // This will trigger fetchCreators via the useEffect above
    }
  }, [debouncedSearchQuery]);

  // Update search handler
  const handleSearchChange = (e) => {
    setSearchQuery(e?.target?.value);
  };

  // Show skeleton loading instead of blocking spinner
  if (isInitialLoad && loading) {
    return (
      <div className="min-h-screen bg-background">
        <Sidebar
          isCollapsed={isSidebarCollapsed}
          onToggleCollapse={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
        />
        <Header isCollapsed={isSidebarCollapsed} />
        <main className={`main-content ${isSidebarCollapsed ? 'sidebar-collapsed' : ''}`}>
          <div className="flex h-[calc(100vh-4rem)]">
            <div className="flex-1 flex flex-col overflow-hidden">
              <div className="bg-card border-b border-border px-6 py-4">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <div className="h-8 w-48 bg-muted animate-pulse rounded mb-2"></div>
                    <div className="h-4 w-64 bg-muted animate-pulse rounded"></div>
                  </div>
                </div>
              </div>
              <div className="flex-1 overflow-hidden p-6">
                <div className="space-y-3">
                  {[...Array(10)].map((_, i) => (
                    <div key={i} className="h-16 bg-muted animate-pulse rounded"></div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>
    );
  }

  // Show error state
  if (error && isInitialLoad) {
    return (
      <div className="min-h-screen bg-background">
        <Sidebar
          isCollapsed={isSidebarCollapsed}
          onToggleCollapse={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
        />
        <Header isCollapsed={isSidebarCollapsed} />
        <main className={`main-content ${isSidebarCollapsed ? 'sidebar-collapsed' : ''}`}>
          <div className="flex items-center justify-center h-[calc(100vh-4rem)]">
            <div className="text-center max-w-md">
              <div className="w-16 h-16 bg-destructive/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <Icon name="AlertTriangle" size={32} color="var(--color-destructive)" />
              </div>
              <h2 className="text-xl font-semibold text-foreground mb-2">Failed to Load Creators</h2>
              <p className="text-muted-foreground mb-4">{error}</p>
              <Button onClick={fetchCreators} variant="default">
                Try Again
              </Button>
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
        <div className="flex h-[calc(100vh-4rem)]">
          {isFilterSidebarVisible && (
            <div className="w-80 flex-shrink-0 overflow-hidden">
              <FilterSidebar
                filters={filters}
                onFilterChange={handleFilterChange}
                creatorCounts={{
                  total: totalCreatorsCount,
                  filtered: totalCreatorsCount // Server-side filtering, so filtered = total for display
                }}
              />
            </div>
          )}

          <div className="flex-1 flex flex-col overflow-hidden">
            <div className="bg-card border-b border-border px-6 py-4">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <button
                    onClick={() => setIsFilterSidebarVisible(!isFilterSidebarVisible)}
                    className="p-2 hover:bg-muted rounded-md transition-colors duration-200"
                    aria-label="Toggle filters"
                  >
                    <Icon name={isFilterSidebarVisible ? 'PanelLeftClose' : 'PanelLeftOpen'} size={20} />
                  </button>
                  <div>
                    <h1 className="text-2xl font-bold text-foreground">Creator Database</h1>
                    <p className="text-sm text-muted-foreground">
                      Manage and track {creators?.length} of {totalCreatorsCount} creators
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <SavedFiltersDrawer onApplyFilter={handleApplySavedFilter} currentFilters={filters} />
                  <Button
                    variant="outline"
                    onClick={() => setShowExportDialog(true)}
                    iconName="Download"
                    iconPosition="left"
                    iconSize={16}
                  >
                    Export
                  </Button>
                  <Button
                    variant="default"
                    iconName="UserPlus"
                    iconPosition="left"
                    iconSize={16}
                    onClick={() => setShowAddCreatorModal(true)}
                  >
                    Add Creator
                  </Button>
                </div>
              </div>

              <div className="flex items-center gap-4">
                <div className="flex-1">
                  <Input
                    type="search"
                    placeholder="Search by name, Instagram handle, or email..."
                    value={searchQuery}
                    onChange={handleSearchChange}
                  />
                </div>
                <Select
                  options={[
                    { value: '25', label: '25 per page' },
                    { value: '50', label: '50 per page' },
                    { value: '100', label: '100 per page' }
                  ]}
                  value={itemsPerPage?.toString()}
                  onChange={(value) => {
                    setItemsPerPage(parseInt(value));
                    setCurrentPage(1);
                  }}
                />
              </div>
            </div>

            <div className="flex-1 overflow-hidden relative">
              {loading && !isInitialLoad && (
                <div className="absolute inset-0 bg-background/50 backdrop-blur-sm z-10 flex items-center justify-center">
                  <div className="text-center">
                    <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-2"></div>
                    <p className="text-sm text-muted-foreground">Loading...</p>
                  </div>
                </div>
              )}
              <div className="h-full overflow-y-auto custom-scrollbar">
                <CreatorTable
                  creators={creators}
                  selectedCreators={selectedCreators}
                  onSelectionChange={setSelectedCreators}
                  onSort={handleSort}
                  sortConfig={sortConfig}
                  userRole={userRole}
                />
              </div>
            </div>

            <div className="bg-card border-t border-border px-6 py-4">
              <div className="flex items-center justify-between">
                <div className="text-sm text-muted-foreground">
                  Showing {(currentPage - 1) * itemsPerPage + 1} to{' '}
                  {Math.min(currentPage * itemsPerPage, totalCreatorsCount)} of{' '}
                  {totalCreatorsCount} creators
                </div>
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setCurrentPage((prev) => Math.max(1, prev - 1))}
                    disabled={currentPage === 1 || loading}
                    iconName="ChevronLeft"
                    iconSize={16}
                  />
                  <div className="flex items-center gap-1">
                    {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                      let pageNum;
                      if (totalPages <= 5) {
                        pageNum = i + 1;
                      } else if (currentPage <= 3) {
                        pageNum = i + 1;
                      } else if (currentPage >= totalPages - 2) {
                        pageNum = totalPages - 4 + i;
                      } else {
                        pageNum = currentPage - 2 + i;
                      }
                      return (
                        <button
                          key={pageNum}
                          onClick={() => !loading && setCurrentPage(pageNum)}
                          disabled={loading}
                          className={`w-8 h-8 rounded-md text-sm font-medium transition-colors duration-200 ${
                            currentPage === pageNum
                              ? 'bg-primary text-primary-foreground'
                              : 'hover:bg-muted text-foreground disabled:opacity-50'
                          }`}
                        >
                          {pageNum}
                        </button>
                      );
                    })}
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setCurrentPage((prev) => Math.min(totalPages, prev + 1))}
                    disabled={currentPage === totalPages || loading}
                    iconName="ChevronRight"
                    iconSize={16}
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
      <BulkActionsToolbar
        selectedCount={selectedCreators?.length}
        onBulkAction={handleBulkAction}
        onClearSelection={() => setSelectedCreators([])}
      />
      <ExportDialog
        isOpen={showExportDialog}
        onClose={() => setShowExportDialog(false)}
        selectedCount={selectedCreators?.length}
        totalCount={totalCreatorsCount}
        creators={selectedCreators?.length > 0 
          ? creators?.filter(c => selectedCreators?.includes(c?.id))
          : creators
        }
      />
      <AddCreatorModal
        isOpen={showAddCreatorModal}
        onClose={() => setShowAddCreatorModal(false)}
        onCreatorAdded={handleCreatorAdded}
      />
    </div>
  );
}