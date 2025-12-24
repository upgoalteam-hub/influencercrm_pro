import React from 'react';
import Icon from '../../../components/AppIcon';

const QuickStatsWidget = ({ stats }) => {
  return (
    <div className="bg-card border border-border rounded-lg p-6">
      <h3 className="text-lg font-semibold text-foreground mb-4">Quick Stats</h3>
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Icon name="Megaphone" size={18} color="var(--color-primary)" />
            <span className="text-sm text-muted-foreground">Total Campaigns</span>
          </div>
          <span className="text-lg font-semibold text-foreground">{stats?.totalCampaigns}</span>
        </div>

        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Icon name="CheckCircle" size={18} color="var(--color-success)" />
            <span className="text-sm text-muted-foreground">Completed</span>
          </div>
          <span className="text-lg font-semibold text-success">{stats?.completedCampaigns}</span>
        </div>

        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Icon name="Clock" size={18} color="var(--color-warning)" />
            <span className="text-sm text-muted-foreground">Active</span>
          </div>
          <span className="text-lg font-semibold text-warning">{stats?.activeCampaigns}</span>
        </div>

        <div className="h-px bg-border my-3" />

        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Icon name="IndianRupee" size={18} color="var(--color-primary)" />
            <span className="text-sm text-muted-foreground">Total Earned</span>
          </div>
          <span className="text-lg font-semibold text-foreground">
            ₹{stats?.totalEarned?.toLocaleString('en-IN')}
          </span>
        </div>

        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Icon name="TrendingUp" size={18} color="var(--color-success)" />
            <span className="text-sm text-muted-foreground">Avg. Per Campaign</span>
          </div>
          <span className="text-lg font-semibold text-foreground">
            ₹{stats?.avgPerCampaign?.toLocaleString('en-IN')}
          </span>
        </div>

        <div className="h-px bg-border my-3" />

        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Icon name="Star" size={18} color="var(--color-accent)" />
            <span className="text-sm text-muted-foreground">Performance Score</span>
          </div>
          <span className="text-lg font-semibold text-accent">{stats?.performanceScore}/10</span>
        </div>

        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Icon name="Calendar" size={18} color="var(--color-primary)" />
            <span className="text-sm text-muted-foreground">Member Since</span>
          </div>
          <span className="text-sm text-foreground">{stats?.memberSince}</span>
        </div>
      </div>
    </div>
  );
};

export default QuickStatsWidget;