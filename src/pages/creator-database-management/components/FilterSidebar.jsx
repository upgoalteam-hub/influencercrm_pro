import React, { useState } from 'react';
import Icon from '../../../components/AppIcon';
import { Checkbox } from '../../../components/ui/Checkbox';

const FilterSidebar = ({ filters, onFilterChange, creatorCounts }) => {
  const [expandedSections, setExpandedSections] = useState({
    category: true,
    city: true,
    followers: true,
    engagement: true,
    tags: true,
    status: true
  });

  const toggleSection = (section) => {
    setExpandedSections(prev => ({
      ...prev,
      [section]: !prev?.[section]
    }));
  };

  const categories = [
    { value: 'fashion', label: 'Fashion & Lifestyle', count: 145 },
    { value: 'beauty', label: 'Beauty & Makeup', count: 98 },
    { value: 'fitness', label: 'Fitness & Health', count: 76 },
    { value: 'food', label: 'Food & Cooking', count: 54 },
    { value: 'travel', label: 'Travel & Adventure', count: 43 },
    { value: 'tech', label: 'Technology', count: 32 },
    { value: 'parenting', label: 'Parenting & Family', count: 28 },
    { value: 'entertainment', label: 'Entertainment', count: 21 }
  ];

  const cities = [
    { value: 'mumbai', label: 'Mumbai', count: 187 },
    { value: 'delhi', label: 'Delhi NCR', count: 156 },
    { value: 'bangalore', label: 'Bangalore', count: 134 },
    { value: 'pune', label: 'Pune', count: 89 },
    { value: 'hyderabad', label: 'Hyderabad', count: 67 },
    { value: 'chennai', label: 'Chennai', count: 54 },
    { value: 'kolkata', label: 'Kolkata', count: 43 },
    { value: 'ahmedabad', label: 'Ahmedabad', count: 38 }
  ];

  const followerRanges = [
    { value: '0-10k', label: '0 - 10K', count: 89 },
    { value: '10k-50k', label: '10K - 50K', count: 156 },
    { value: '50k-100k', label: '50K - 100K', count: 134 },
    { value: '100k-500k', label: '100K - 500K', count: 98 },
    { value: '500k-1m', label: '500K - 1M', count: 45 },
    { value: '1m+', label: '1M+', count: 23 }
  ];

  const engagementRates = [
    { value: '0-2', label: '0% - 2%', count: 67 },
    { value: '2-5', label: '2% - 5%', count: 189 },
    { value: '5-10', label: '5% - 10%', count: 234 },
    { value: '10+', label: '10%+', count: 56 }
  ];

  const tags = [
    { value: 'verified', label: 'Verified', count: 234 },
    { value: 'top-performer', label: 'Top Performer', count: 89 },
    { value: 'new', label: 'New Creator', count: 45 },
    { value: 'exclusive', label: 'Exclusive', count: 23 },
    { value: 'reliable', label: 'Reliable', count: 167 },
    { value: 'high-engagement', label: 'High Engagement', count: 98 }
  ];

  const statusOptions = [
    { value: 'active', label: 'Active', count: 423 },
    { value: 'inactive', label: 'Inactive', count: 78 },
    { value: 'pending', label: 'Pending Review', count: 34 },
    { value: 'blacklisted', label: 'Blacklisted', count: 12 }
  ];

  const handleCheckboxChange = (filterType, value) => {
    const currentValues = filters?.[filterType] || [];
    const newValues = currentValues?.includes(value)
      ? currentValues?.filter(v => v !== value)
      : [...currentValues, value];
    onFilterChange(filterType, newValues);
  };

  const handleClearAll = () => {
    onFilterChange('clearAll');
  };

  const activeFilterCount = Object.values(filters)?.reduce((acc, curr) => {
    return acc + (Array.isArray(curr) ? curr?.length : 0);
  }, 0);

  const FilterSection = ({ title, items, filterKey, icon }) => (
    <div className="border-b border-border">
      <button
        onClick={() => toggleSection(filterKey)}
        className="w-full flex items-center justify-between px-4 py-3 hover:bg-muted transition-colors duration-200"
      >
        <div className="flex items-center gap-2">
          <Icon name={icon} size={18} color="var(--color-primary)" />
          <span className="text-sm font-medium text-foreground">{title}</span>
          {filters?.[filterKey]?.length > 0 && (
            <span className="px-2 py-0.5 text-xs font-medium rounded-full bg-primary text-primary-foreground">
              {filters?.[filterKey]?.length}
            </span>
          )}
        </div>
        <Icon
          name={expandedSections?.[filterKey] ? 'ChevronUp' : 'ChevronDown'}
          size={16}
          className="text-muted-foreground"
        />
      </button>
      {expandedSections?.[filterKey] && (
        <div className="px-4 py-3 space-y-2 bg-muted/30">
          {items?.map((item) => (
            <div key={item?.value} className="flex items-center justify-between">
              <Checkbox
                label={item?.label}
                checked={filters?.[filterKey]?.includes(item?.value) || false}
                onChange={() => handleCheckboxChange(filterKey, item?.value)}
                size="sm"
              />
              <span className="text-xs text-muted-foreground">{item?.count}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );

  return (
    <div className="h-full flex flex-col bg-card border-r border-border">
      <div className="flex items-center justify-between px-4 py-4 border-b border-border">
        <div className="flex items-center gap-2">
          <Icon name="Filter" size={20} color="var(--color-primary)" />
          <h2 className="text-lg font-semibold text-foreground">Filters</h2>
          {activeFilterCount > 0 && (
            <span className="px-2 py-0.5 text-xs font-medium rounded-full bg-primary text-primary-foreground">
              {activeFilterCount}
            </span>
          )}
        </div>
        {activeFilterCount > 0 && (
          <button
            onClick={handleClearAll}
            className="text-xs text-primary hover:underline"
          >
            Clear All
          </button>
        )}
      </div>
      <div className="flex-1 overflow-y-auto custom-scrollbar">
        <FilterSection
          title="Category"
          items={categories}
          filterKey="category"
          icon="Tag"
        />
        <FilterSection
          title="City"
          items={cities}
          filterKey="city"
          icon="MapPin"
        />
        <FilterSection
          title="Followers"
          items={followerRanges}
          filterKey="followers"
          icon="Users"
        />
        <FilterSection
          title="Engagement Rate"
          items={engagementRates}
          filterKey="engagement"
          icon="TrendingUp"
        />
        <FilterSection
          title="Tags"
          items={tags}
          filterKey="tags"
          icon="Bookmark"
        />
        <FilterSection
          title="Status"
          items={statusOptions}
          filterKey="status"
          icon="Activity"
        />
      </div>
      <div className="px-4 py-3 border-t border-border bg-muted/30">
        <div className="text-xs text-muted-foreground">
          <div className="flex items-center justify-between mb-1">
            <span>Total Creators:</span>
            <span className="font-medium text-foreground">{creatorCounts?.total}</span>
          </div>
          <div className="flex items-center justify-between">
            <span>Filtered Results:</span>
            <span className="font-medium text-foreground">{creatorCounts?.filtered}</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FilterSidebar;