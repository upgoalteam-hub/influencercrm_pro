import React, { useState, useEffect } from 'react';
import Sidebar from '../../components/ui/Sidebar';
import Header from '../../components/ui/Header';
import Icon from '../../components/AppIcon';
import Button from '../../components/ui/Button';
import Input from '../../components/ui/Input';
import FilterSidebar from './components/FilterSidebar';
import CreatorTable from './components/CreatorTable';
import BulkActionsToolbar from './components/BulkActionsToolbar';
import SavedFiltersPanel from './components/SavedFiltersPanel';
import ExportDialog from './components/ExportDialog';
import Select from '../../components/ui/Select';
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
  const [sortConfig, setSortConfig] = useState({ column: 'name', direction: 'asc' });
  const [showExportDialog, setShowExportDialog] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(25);
  const userRole = 'Super Admin';

  // Replace mock data with Supabase state
  const [allCreators, setAllCreators] = useState([]);
  const [filteredCreators, setFilteredCreators] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Add this block - Define fetchCreators function before it's used
  const fetchCreators = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await creatorService?.getAll();
      
      // Use exact database column names (no transformation)
      const transformedData = data?.map(creator => ({
        id: creator?.id,
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

      setAllCreators(transformedData);
      setFilteredCreators(transformedData);
    } catch (err) {
      console.error('Error fetching creators:', err);
      setError(err?.message || 'Failed to load creators from database');
    } finally {
      setLoading(false);
    }
  };

  // Load creators and setup real-time subscription
  useEffect(() => {
    fetchCreators(); // Changed from loadCreators to fetchCreators

    // Subscribe to real-time changes
    const subscription = realtimeService?.subscribeToCreators(
      (newCreator) => {
        // Handle INSERT
        setAllCreators((prev) => [newCreator, ...prev]); // Changed from setCreators to setAllCreators
      },
      (updatedCreator) => {
        // Handle UPDATE
        setAllCreators((prev) =>
          prev?.map((creator) =>
            creator?.id === updatedCreator?.id ? updatedCreator : creator
          )
        );
      },
      (deletedId) => {
        // Handle DELETE
        setAllCreators((prev) => prev?.filter((creator) => creator?.id !== deletedId)); // Changed from setCreators to setAllCreators
      }
    );

    // Cleanup subscription on unmount
    return () => {
      subscription?.unsubscribe();
    };
  }, []);

  useEffect(() => {
    applyFilters();
  }, [filters, searchQuery, sortConfig, allCreators]);

  const applyFilters = () => {
    let result = [...allCreators];

    if (searchQuery) {
      result = result?.filter((creator) =>
        creator?.name?.toLowerCase()?.includes(searchQuery?.toLowerCase()) ||
        creator?.username?.toLowerCase()?.includes(searchQuery?.toLowerCase()) ||
        creator?.email?.toLowerCase()?.includes(searchQuery?.toLowerCase())
      );
    }

    Object.entries(filters)?.forEach(([key, values]) => {
      if (values?.length > 0) {
        result = result?.filter((creator) => {
          if (key === 'city') {
            return values?.some((v) => creator?.city?.toLowerCase()?.includes(v?.toLowerCase()));
          } else if (key === 'state') {
            return values?.some((v) => creator?.state?.toLowerCase()?.includes(v?.toLowerCase()));
          } else if (key === 'followers') {
            return values?.some((tier) => creator?.followers_tier?.toLowerCase()?.includes(tier?.toLowerCase()));
          }
          return true;
        });
      }
    });

    if (sortConfig?.column) {
      result?.sort((a, b) => {
        let aValue = a?.[sortConfig?.column];
        let bValue = b?.[sortConfig?.column];

        if (aValue < bValue) return sortConfig?.direction === 'asc' ? -1 : 1;
        if (aValue > bValue) return sortConfig?.direction === 'asc' ? 1 : -1;
        return 0;
      });
    }

    setFilteredCreators(result);
  };

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

  const paginatedCreators = filteredCreators?.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const totalPages = Math.ceil(filteredCreators?.length / itemsPerPage);

  // Show loading state
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
              <p className="text-muted-foreground">Loading creators from database...</p>
            </div>
          </div>
        </main>
      </div>
    );
  }

  // Show error state
  if (error) {
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
                  total: allCreators?.length,
                  filtered: filteredCreators?.length
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
                      Manage and track {filteredCreators?.length} of {allCreators?.length} creators
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
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
                    onChange={(e) => setSearchQuery(e?.target?.value)}
                  />
                </div>
                <Select
                  options={[
                    { value: '25', label: '25 per page' },
                    { value: '50', label: '50 per page' },
                    { value: '100', label: '100 per page' }
                  ]}
                  value={itemsPerPage?.toString()}
                  onChange={(value) => setItemsPerPage(parseInt(value))}
                />
              </div>
            </div>

            <div className="flex-1 overflow-hidden">
              <div className="h-full overflow-y-auto custom-scrollbar">
                <CreatorTable
                  creators={paginatedCreators}
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
                  {Math.min(currentPage * itemsPerPage, filteredCreators?.length)} of{' '}
                  {filteredCreators?.length} creators
                </div>
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setCurrentPage((prev) => Math.max(1, prev - 1))}
                    disabled={currentPage === 1}
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
                          onClick={() => setCurrentPage(pageNum)}
                          className={`w-8 h-8 rounded-md text-sm font-medium transition-colors duration-200 ${
                            currentPage === pageNum
                              ? 'bg-primary text-primary-foreground'
                              : 'hover:bg-muted text-foreground'
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
                    disabled={currentPage === totalPages}
                    iconName="ChevronRight"
                    iconSize={16}
                  />
                </div>
              </div>
            </div>
          </div>

          <div className="w-80 flex-shrink-0 overflow-y-auto custom-scrollbar p-4 bg-muted/30 border-l border-border">
            <SavedFiltersPanel onApplyFilter={handleApplySavedFilter} currentFilters={filters} />
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
        totalCount={allCreators?.length}
        creators={selectedCreators?.length > 0 
          ? allCreators?.filter(c => selectedCreators?.includes(c?.id))
          : filteredCreators
        }
      />
    </div>
  );
}