import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import Icon from '../../../components/AppIcon';
import Button from '../../../components/ui/Button';
import EditCreatorModal from './EditCreatorModal';

const CreatorTable = ({ creators, selectedCreators, onSelectionChange, onSort, sortConfig, userRole, onCreatorUpdated }) => {
  const navigate = useNavigate();
  const [editingCell, setEditingCell] = useState(null);
  const [editingCreator, setEditingCreator] = useState(null);
  const [showEditModal, setShowEditModal] = useState(false);

  // Define sticky column configuration for consistency
  const STICKY_COLUMNS = {
    checkbox: { width: '48px', left: '0px' },
    sr_no: { width: '80px', left: '48px' },
    name: { width: '200px', left: '128px' },
    actions: { width: '120px', right: '0px' }
  };

  // Memoize creators to prevent unnecessary re-renders
  const stableCreators = useMemo(() => {
    if (!creators || !Array.isArray(creators)) return [];
    return creators.filter(creator => creator && creator.id); // Filter out invalid entries
  }, [creators]);

  const handleSelectAll = (e) => {
    if (e?.target?.checked) {
      onSelectionChange(stableCreators?.map(c => c?.id));
    } else {
      onSelectionChange([]);
    }
  };

  const handleSelectCreator = (creatorId) => {
    if (selectedCreators?.includes(creatorId)) {
      onSelectionChange(selectedCreators?.filter(id => id !== creatorId));
    } else {
      onSelectionChange([...selectedCreators, creatorId]);
    }
  };

  const handleSort = (column) => {
    onSort(column);
  };

  const handleViewDetails = (creatorId) => {
    if (!creatorId) {
      console.error('❌ Cannot view details: creator ID is missing');
      return;
    }
    // Navigate with ID in URL for better shareability and browser history
    navigate(`/creator-profile-details/${creatorId}`);
  };

  const handleEditCreator = (creator) => {
    setEditingCreator(creator);
    setShowEditModal(true);
  };

  const handleCreatorUpdated = (updatedCreator) => {
    // Notify parent component to update the data
    onCreatorUpdated?.(updatedCreator);
    setShowEditModal(false);
    setEditingCreator(null);
  };

  const formatNumber = (num) => {
    if (num >= 1000000) {
      return `${(num / 1000000)?.toFixed(1)}M`;
    } else if (num >= 1000) {
      return `${(num / 1000)?.toFixed(1)}K`;
    }
    return num?.toString();
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'Never';
    const date = new Date(dateString);
    const day = date?.getDate()?.toString()?.padStart(2, '0');
    const month = (date?.getMonth() + 1)?.toString()?.padStart(2, '0');
    const year = date?.getFullYear();
    return `${day}/${month}/${year}`;
  };

  const getStatusColor = (status) => {
    const colors = {
      active: 'bg-success/10 text-success border-success/20',
      inactive: 'bg-muted text-muted-foreground border-border',
      pending: 'bg-warning/10 text-warning border-warning/20',
      blacklisted: 'bg-error/10 text-error border-error/20'
    };
    return colors?.[status] || colors?.active;
  };

  const getSyncStatusIcon = (syncStatus) => {
    if (syncStatus === 'synced') {
      return <Icon name="CheckCircle2" size={14} color="var(--color-success)" />;
    } else if (syncStatus === 'syncing') {
      return <Icon name="RefreshCw" size={14} color="var(--color-warning)" className="animate-spin" />;
    } else {
      return <Icon name="AlertCircle" size={14} color="var(--color-error)" />;
    }
  };

  const SortableHeader = ({ column, label }) => (
    <th className="px-4 py-3 text-left whitespace-nowrap">
      <button
        onClick={() => handleSort(column)}
        className="flex items-center gap-2 text-xs font-medium text-muted-foreground hover:text-foreground transition-colors duration-200"
      >
        {label}
        {sortConfig?.column === column && (
          <Icon
            name={sortConfig?.direction === 'asc' ? 'ChevronUp' : 'ChevronDown'}
            size={14}
          />
        )}
      </button>
    </th>
  );

  // Empty state
  if (!stableCreators || stableCreators.length === 0) {
    return (
      <div className="overflow-x-auto table-container">
        <table className="w-full" style={{ tableLayout: 'fixed', minWidth: '1400px' }}>
          <colgroup>
            <col style={{ width: STICKY_COLUMNS.checkbox.width, minWidth: STICKY_COLUMNS.checkbox.width, position: 'sticky', left: STICKY_COLUMNS.checkbox.left, zIndex: 25 }} /> {/* Checkbox */}
            <col style={{ width: STICKY_COLUMNS.sr_no.width, minWidth: STICKY_COLUMNS.sr_no.width, position: 'sticky', left: STICKY_COLUMNS.sr_no.left, zIndex: 25 }} /> {/* sr_no */}
            <col style={{ width: STICKY_COLUMNS.name.width, minWidth: '150px', position: 'sticky', left: STICKY_COLUMNS.name.left, zIndex: 25 }} /> {/* name */}
            <col style={{ width: '250px', minWidth: '200px' }} /> {/* instagram_link */}
            <col style={{ width: '120px', minWidth: '100px' }} /> {/* followers_tier */}
            <col style={{ width: '150px', minWidth: '120px' }} /> {/* state */}
            <col style={{ width: '150px', minWidth: '120px' }} /> {/* city */}
            <col style={{ width: '150px', minWidth: '120px' }} /> {/* whatsapp */}
            <col style={{ width: '200px', minWidth: '150px' }} /> {/* email */}
            <col style={{ width: '100px', minWidth: '80px' }} /> {/* gender */}
            <col style={{ width: '150px', minWidth: '120px' }} /> {/* username */}
            <col style={{ width: '150px', minWidth: '120px' }} /> {/* sheet_source */}
            <col style={{ width: STICKY_COLUMNS.actions.width, minWidth: STICKY_COLUMNS.actions.width, position: 'sticky', right: STICKY_COLUMNS.actions.right, zIndex: 25 }} /> {/* Actions */}
          </colgroup>
          <thead className="bg-muted/50 border-b border-border sticky top-0 z-10">
            <tr>
              <th className="px-4 py-3 w-12 sticky left-0 z-30 bg-card border-r border-border/50 shadow-sm">
                <input
                  type="checkbox"
                  disabled
                  className="w-4 h-4 rounded border-input text-primary"
                  aria-label="Select all creators"
                />
              </th>
              <th className="px-4 py-3 sticky left-12 z-30 bg-card border-r border-border/50 shadow-sm">
                <SortableHeader column="sr_no" label="sr_no" />
              </th>
              <th className="px-4 py-3 sticky left-20 z-30 bg-card border-r border-border/50 shadow-sm">
                <SortableHeader column="name" label="name" />
              </th>
              <SortableHeader column="instagram_link" label="instagram_link" />
              <SortableHeader column="followers_tier" label="followers_tier" />
              <SortableHeader column="state" label="state" />
              <SortableHeader column="city" label="city" />
              <SortableHeader column="whatsapp" label="whatsapp" />
              <SortableHeader column="email" label="email" />
              <SortableHeader column="gender" label="gender" />
              <SortableHeader column="username" label="username" />
              <SortableHeader column="sheet_source" label="sheet_source" />
              <th className="px-4 py-3 sticky right-0 z-30 bg-card border-l border-border/50 shadow-sm">
                <span className="text-xs font-medium text-muted-foreground">Actions</span>
              </th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td colSpan={13} className="px-4 py-12 text-center">
                <div className="flex flex-col items-center gap-2">
                  <Icon name="Users" size={32} color="var(--color-muted-foreground)" />
                  <p className="text-sm text-muted-foreground">No creators found</p>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto table-container">
      <table className="w-full" style={{ tableLayout: 'fixed', minWidth: '1400px' }}>
        <colgroup>
          <col style={{ width: STICKY_COLUMNS.checkbox.width, minWidth: STICKY_COLUMNS.checkbox.width, position: 'sticky', left: STICKY_COLUMNS.checkbox.left, zIndex: 25 }} /> {/* Checkbox */}
          <col style={{ width: STICKY_COLUMNS.sr_no.width, minWidth: STICKY_COLUMNS.sr_no.width, position: 'sticky', left: STICKY_COLUMNS.sr_no.left, zIndex: 25 }} /> {/* sr_no */}
          <col style={{ width: STICKY_COLUMNS.name.width, minWidth: '150px', position: 'sticky', left: STICKY_COLUMNS.name.left, zIndex: 25 }} /> {/* name */}
          <col style={{ width: '250px', minWidth: '200px' }} /> {/* instagram_link */}
          <col style={{ width: '120px', minWidth: '100px' }} /> {/* followers_tier */}
          <col style={{ width: '150px', minWidth: '120px' }} /> {/* state */}
          <col style={{ width: '150px', minWidth: '120px' }} /> {/* city */}
          <col style={{ width: '150px', minWidth: '120px' }} /> {/* whatsapp */}
          <col style={{ width: '200px', minWidth: '150px' }} /> {/* email */}
          <col style={{ width: '100px', minWidth: '80px' }} /> {/* gender */}
          <col style={{ width: '150px', minWidth: '120px' }} /> {/* username */}
          <col style={{ width: '150px', minWidth: '120px' }} /> {/* sheet_source */}
          <col style={{ width: STICKY_COLUMNS.actions.width, minWidth: STICKY_COLUMNS.actions.width, position: 'sticky', right: STICKY_COLUMNS.actions.right, zIndex: 25 }} /> {/* Actions */}
        </colgroup>
        <thead className="bg-muted/50 border-b border-border sticky top-0 z-10">
          <tr>
            <th className="px-4 py-3 w-12 sticky left-0 z-30 bg-card border-r border-border/50 shadow-sm">
              <input
                type="checkbox"
                checked={selectedCreators?.length === stableCreators?.length && stableCreators?.length > 0}
                onChange={handleSelectAll}
                className="w-4 h-4 rounded border-input text-primary focus:ring-2 focus:ring-ring"
                aria-label="Select all creators"
              />
            </th>
            <th className="px-4 py-3 sticky left-12 z-30 bg-card border-r border-border/50 shadow-sm">
              <SortableHeader column="sr_no" label="sr_no" />
            </th>
            <th className="px-4 py-3 sticky left-20 z-30 bg-card border-r border-border/50 shadow-sm">
              <SortableHeader column="name" label="name" />
            </th>
            <SortableHeader column="instagram_link" label="instagram_link" />
            <SortableHeader column="followers_tier" label="followers_tier" />
            <SortableHeader column="state" label="state" />
            <SortableHeader column="city" label="city" />
            <SortableHeader column="whatsapp" label="whatsapp" />
            <SortableHeader column="email" label="email" />
            <SortableHeader column="gender" label="gender" />
            <SortableHeader column="username" label="username" />
            <SortableHeader column="sheet_source" label="sheet_source" />
            <th className="px-4 py-3 sticky right-0 z-30 bg-card border-l border-border/50 shadow-sm">
              <span className="text-xs font-medium text-muted-foreground">Actions</span>
            </th>
          </tr>
        </thead>
        <tbody className="divide-y divide-border">
          {stableCreators?.map((creator, index) => {
            // Ensure stable key - use index as fallback only if id is missing
            const rowKey = creator?.id || `creator-${index}`;
            
            return (
              <tr
                key={rowKey}
                className="hover:bg-muted/30 transition-colors duration-200"
              >
                <td className="px-4 py-3 sticky left-0 z-30 bg-card border-r border-border/50 shadow-sm">
                  <input
                    type="checkbox"
                    checked={selectedCreators?.includes(creator?.id)}
                    onChange={() => handleSelectCreator(creator?.id)}
                    className="w-4 h-4 rounded border-input text-primary focus:ring-2 focus:ring-ring"
                    aria-label={`Select ${creator?.name}`}
                  />
                </td>
                <td className="px-4 py-3 sticky left-12 z-30 bg-card border-r border-border/50 shadow-sm">
                  <div className="text-sm text-foreground truncate">{creator?.sr_no || 'N/A'}</div>
                </td>
                <td className="px-4 py-3 sticky left-20 z-30 bg-card border-r border-border/50 shadow-sm">
                  <div className="text-sm font-medium text-foreground truncate" title={creator?.name}>
                    {creator?.name || 'N/A'}
                  </div>
                </td>
                <td className="px-4 py-3">
                  {creator?.instagram_link && creator?.instagram_link !== 'N/A' ? (
                    <a
                      href={creator?.instagram_link}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-sm text-primary hover:underline flex items-center gap-1 truncate"
                      title={creator?.instagram_link}
                    >
                      <span className="truncate">{creator?.instagram_link}</span>
                      <Icon name="ExternalLink" size={12} className="flex-shrink-0" />
                    </a>
                  ) : (
                    <span className="text-sm text-muted-foreground">N/A</span>
                  )}
                </td>
                <td className="px-4 py-3">
                  <div className="text-sm text-foreground truncate">{creator?.followers_tier || 'N/A'}</div>
                </td>
                <td className="px-4 py-3">
                  <div className="text-sm text-foreground truncate">{creator?.state || 'N/A'}</div>
                </td>
                <td className="px-4 py-3">
                  <div className="text-sm text-foreground truncate">{creator?.city || 'N/A'}</div>
                </td>
                <td className="px-4 py-3">
                  <div className="text-sm text-foreground truncate">{creator?.whatsapp || 'N/A'}</div>
                </td>
                <td className="px-4 py-3">
                  <div className="text-sm text-muted-foreground truncate" title={creator?.email}>
                    {creator?.email || 'N/A'}
                  </div>
                </td>
                <td className="px-4 py-3">
                  <div className="text-sm text-foreground capitalize truncate">{creator?.gender || 'N/A'}</div>
                </td>
                <td className="px-4 py-3">
                  <div className="text-sm text-foreground truncate">@{creator?.username || 'N/A'}</div>
                </td>
                <td className="px-4 py-3">
                  <div className="text-sm text-muted-foreground truncate">{creator?.sheet_source || 'N/A'}</div>
                </td>
                <td className="px-4 py-3 sticky right-0 z-30 bg-card border-l border-border/50 shadow-sm">
                  <div className="flex items-center gap-2">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleViewDetails(creator?.id)}
                      iconName="Eye"
                      iconSize={16}
                    />
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleEditCreator(creator)}
                      iconName="Edit"
                      iconSize={16}
                    />
                  </div>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
      
      <EditCreatorModal
        isOpen={showEditModal}
        onClose={() => setShowEditModal(false)}
        creator={editingCreator}
        onCreatorUpdated={handleCreatorUpdated}
      />
    </div>
  );
};

export default CreatorTable;