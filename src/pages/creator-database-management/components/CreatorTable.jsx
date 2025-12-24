import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Icon from '../../../components/AppIcon';
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
            <SortableHeader column="sr_no" label="sr_no" />
            <SortableHeader column="name" label="name" />
            <SortableHeader column="instagram_link" label="instagram_link" />
            <SortableHeader column="followers_tier" label="followers_tier" />
            <SortableHeader column="state" label="state" />
            <SortableHeader column="city" label="city" />
            <SortableHeader column="whatsapp" label="whatsapp" />
            <SortableHeader column="email" label="email" />
            <SortableHeader column="gender" label="gender" />
            <SortableHeader column="username" label="username" />
            <SortableHeader column="sheet_source" label="sheet_source" />
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
                <div className="text-sm text-foreground">{creator?.sr_no}</div>
              </td>
              <td className="px-4 py-3">
                <div className="text-sm font-medium text-foreground truncate max-w-[200px]">
                  {creator?.name}
                </div>
              </td>
              <td className="px-4 py-3">
                {creator?.instagram_link !== 'N/A' ? (
                  <a
                    href={creator?.instagram_link}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sm text-primary hover:underline flex items-center gap-1 truncate max-w-[200px]"
                  >
                    {creator?.instagram_link}
                    <Icon name="ExternalLink" size={12} />
                  </a>
                ) : (
                  <span className="text-sm text-muted-foreground">N/A</span>
                )}
              </td>
              <td className="px-4 py-3">
                <div className="text-sm text-foreground">{creator?.followers_tier}</div>
              </td>
              <td className="px-4 py-3">
                <div className="text-sm text-foreground">{creator?.state}</div>
              </td>
              <td className="px-4 py-3">
                <div className="text-sm text-foreground">{creator?.city}</div>
              </td>
              <td className="px-4 py-3">
                <div className="text-sm text-foreground">{creator?.whatsapp}</div>
              </td>
              <td className="px-4 py-3">
                <div className="text-sm text-muted-foreground truncate max-w-[200px]">
                  {creator?.email}
                </div>
              </td>
              <td className="px-4 py-3">
                <div className="text-sm text-foreground capitalize">{creator?.gender}</div>
              </td>
              <td className="px-4 py-3">
                <div className="text-sm text-foreground">@{creator?.username}</div>
              </td>
              <td className="px-4 py-3">
                <div className="text-sm text-muted-foreground">{creator?.sheet_source}</div>
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