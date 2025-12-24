import React from 'react';
import Icon from '../../../components/AppIcon';

const BrandHeader = () => {
  return (
    <div className="text-center mb-8">
      <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-primary to-primary/70 shadow-lg mb-4">
        <Icon name="Zap" size={32} color="#FFFFFF" />
      </div>
      
      <h1 className="text-3xl font-bold text-foreground mb-2">
        InfluencerCRM Pro
      </h1>
      
      <p className="text-muted-foreground">
        Enterprise Influencer Relationship Management
      </p>
      
      <div className="flex items-center justify-center gap-2 mt-4">
        <div className="flex items-center gap-1.5 px-3 py-1.5 bg-success/10 border border-success/20 rounded-full">
          <Icon name="Shield" size={14} color="var(--color-success)" />
          <span className="text-xs font-medium text-success">Secure Login</span>
        </div>
        <div className="flex items-center gap-1.5 px-3 py-1.5 bg-primary/10 border border-primary/20 rounded-full">
          <Icon name="Users" size={14} color="var(--color-primary)" />
          <span className="text-xs font-medium text-primary">Team Access</span>
        </div>
      </div>
    </div>
  );
};

export default BrandHeader;