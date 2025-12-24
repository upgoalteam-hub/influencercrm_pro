import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import Icon from '../AppIcon';

const Sidebar = ({ isCollapsed = false, onToggleCollapse }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const [isMobileOpen, setIsMobileOpen] = useState(false);

  const navigationItems = [
    {
      label: 'Dashboard',
      path: '/executive-dashboard',
      icon: 'LayoutDashboard',
      badge: null,
      tooltip: 'Executive Dashboard - Real-time business intelligence'
    },
    {
      label: 'Creators',
      path: '/creator-database-management',
      icon: 'Users',
      badge: null,
      tooltip: 'Creator Database - Manage influencer relationships'
    },
    {
      label: 'Campaigns',
      path: '/campaign-management-center',
      icon: 'Megaphone',
      badge: 3,
      tooltip: 'Campaign Management - Active campaigns and tracking'
    },
    {
      label: 'Payments',
      path: '/payment-processing-center',
      icon: 'CreditCard',
      badge: 5,
      tooltip: 'Payment Processing - Pending payments and transactions'
    }
  ];

  const handleNavigation = (path) => {
    navigate(path);
    setIsMobileOpen(false);
  };

  const handleMobileToggle = () => {
    setIsMobileOpen(!isMobileOpen);
  };

  const isActive = (path) => {
    return location?.pathname === path;
  };

  return (
    <>
      <button
        className="mobile-menu-button"
        onClick={handleMobileToggle}
        aria-label="Toggle mobile menu"
      >
        <Icon name={isMobileOpen ? 'X' : 'Menu'} size={24} />
      </button>
      {isMobileOpen && (
        <div
          className="mobile-overlay"
          onClick={handleMobileToggle}
          aria-hidden="true"
        />
      )}
      <aside
        className={`sidebar ${isCollapsed ? 'collapsed' : ''} ${
          isMobileOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        }`}
      >
        <div className="sidebar-header">
          <div className="sidebar-logo">
            <Icon name="Zap" size={24} color="var(--color-primary)" />
          </div>
          <span className="sidebar-logo-text">InfluencerCRM</span>
        </div>

        <nav className="sidebar-nav" role="navigation" aria-label="Main navigation">
          {navigationItems?.map((item) => (
            <button
              key={item?.path}
              onClick={() => handleNavigation(item?.path)}
              className={`sidebar-nav-item ${isActive(item?.path) ? 'active' : ''}`}
              title={isCollapsed ? item?.tooltip : ''}
              aria-label={item?.label}
              aria-current={isActive(item?.path) ? 'page' : undefined}
            >
              <Icon name={item?.icon} size={20} />
              <span className="sidebar-nav-item-text">{item?.label}</span>
              {item?.badge && (
                <span className="sidebar-nav-item-badge">{item?.badge}</span>
              )}
            </button>
          ))}
        </nav>

        {!isCollapsed && (
          <div className="absolute bottom-4 left-0 right-0 px-3">
            <button
              onClick={onToggleCollapse}
              className="sidebar-nav-item w-full"
              aria-label="Collapse sidebar"
            >
              <Icon name="ChevronsLeft" size={20} />
              <span className="sidebar-nav-item-text">Collapse</span>
            </button>
          </div>
        )}

        {isCollapsed && (
          <div className="absolute bottom-4 left-0 right-0 px-3">
            <button
              onClick={onToggleCollapse}
              className="sidebar-nav-item w-full justify-center"
              aria-label="Expand sidebar"
            >
              <Icon name="ChevronsRight" size={20} />
            </button>
          </div>
        )}
      </aside>
    </>
  );
};

export default Sidebar;