import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Icon from '../../../components/AppIcon';
import Image from '../../../components/AppImage';
import Button from '../../../components/ui/Button';

const CreatorTable = ({ creators, selectedCreators, onSelectionChange, onSort, sortConfig, userRole }) => {
  const navigate = useNavigate();
  const [editingCell, setEditingCell] = useState(null);

  const handleSelectAll = (e) => {
    if (e?.target?.checked) {
      onSelectionChange(creators?.map(c => c?.id));
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
    navigate('/creator-profile-details', { state: { creatorId } });
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
    <th className="px-4 py-3 text-left">
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

  return (
    <div className="overflow-x-auto custom-scrollbar">
      <table className="w-full">
        <thead className="bg-muted/50 border-b border-border sticky top-0 z-10">
          <tr>
            <th className="px-4 py-3 w-12">
              <input
                type="checkbox"
                checked={selectedCreators?.length === creators?.length && creators?.length > 0}
                onChange={handleSelectAll}
                className="w-4 h-4 rounded border-input text-primary focus:ring-2 focus:ring-ring"
                aria-label="Select all creators"
              />
            </th>
            <th className="px-4 py-3 text-left">
              <span className="text-xs font-medium text-muted-foreground">Sync</span>
            </th>
            <SortableHeader column="name" label="Creator" />
            <SortableHeader column="instagram" label="Instagram" />
            <SortableHeader column="followers" label="Followers" />
            <SortableHeader column="engagement" label="Engagement" />
            <th className="px-4 py-3 text-left">
              <span className="text-xs font-medium text-muted-foreground">Category</span>
            </th>
            <th className="px-4 py-3 text-left">
              <span className="text-xs font-medium text-muted-foreground">Location</span>
            </th>
            {userRole === 'Super Admin' && (
              <SortableHeader column="lastPrice" label="Last Price" />
            )}
            <SortableHeader column="lastCampaign" label="Last Campaign" />
            <th className="px-4 py-3 text-left">
              <span className="text-xs font-medium text-muted-foreground">Status</span>
            </th>
            <th className="px-4 py-3 text-left">
              <span className="text-xs font-medium text-muted-foreground">Actions</span>
            </th>
          </tr>
        </thead>
        <tbody className="divide-y divide-border">
          {creators?.map((creator) => (
            <tr
              key={creator?.id}
              className="hover:bg-muted/30 transition-colors duration-200"
            >
              <td className="px-4 py-3">
                <input
                  type="checkbox"
                  checked={selectedCreators?.includes(creator?.id)}
                  onChange={() => handleSelectCreator(creator?.id)}
                  className="w-4 h-4 rounded border-input text-primary focus:ring-2 focus:ring-ring"
                  aria-label={`Select ${creator?.name}`}
                />
              </td>
              <td className="px-4 py-3">
                <div className="flex items-center justify-center">
                  {getSyncStatusIcon(creator?.syncStatus)}
                </div>
              </td>
              <td className="px-4 py-3">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full overflow-hidden flex-shrink-0 bg-muted">
                    <Image
                      src={creator?.profileImage}
                      alt={creator?.profileImageAlt}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className="min-w-0">
                    <div className="text-sm font-medium text-foreground truncate">
                      {creator?.name}
                    </div>
                    <div className="text-xs text-muted-foreground truncate">
                      {creator?.email}
                    </div>
                  </div>
                </div>
              </td>
              <td className="px-4 py-3">
                <a
                  href={`https://instagram.com/${creator?.instagramHandle}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm text-primary hover:underline flex items-center gap-1"
                >
                  @{creator?.instagramHandle}
                  <Icon name="ExternalLink" size={12} />
                </a>
              </td>
              <td className="px-4 py-3">
                <div className="text-sm text-foreground font-medium">
                  {formatNumber(creator?.followers)}
                </div>
              </td>
              <td className="px-4 py-3">
                <div className="text-sm text-foreground">
                  {creator?.engagementRate}%
                </div>
              </td>
              <td className="px-4 py-3">
                <span className="inline-flex items-center px-2 py-1 rounded-md text-xs font-medium bg-primary/10 text-primary border border-primary/20">
                  {creator?.category}
                </span>
              </td>
              <td className="px-4 py-3">
                <div className="flex items-center gap-1 text-sm text-muted-foreground">
                  <Icon name="MapPin" size={14} />
                  {creator?.city}
                </div>
              </td>
              {userRole === 'Super Admin' && (
                <td className="px-4 py-3">
                  <div className="text-sm text-foreground font-medium">
                    ₹{creator?.lastPrice?.toLocaleString('en-IN')}
                  </div>
                </td>
              )}
              <td className="px-4 py-3">
                <div className="text-sm text-muted-foreground">
                  {formatDate(creator?.lastCampaignDate)}
                </div>
              </td>
              <td className="px-4 py-3">
                <span className={`inline-flex items-center px-2 py-1 rounded-md text-xs font-medium border ${getStatusColor(creator?.status)}`}>
                  {creator?.status}
                </span>
              </td>
              <td className="px-4 py-3">
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
                    iconName="Edit"
                    iconSize={16}
                  />
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default CreatorTable;