import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import Icon from '../AppIcon';
import { Home, Users, FolderKanban, DollarSign, Database, Link as LinkIcon, Settings } from 'lucide-react';

const Sidebar = ({ isCollapsed = false, onToggleCollapse }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const [isMobileOpen, setIsMobileOpen] = useState(false);

  const navigation = [
    { name: 'Executive Dashboard', href: '/', icon: Home },
    { name: 'Creator Database', href: '/creator-database-management', icon: Database },
    { name: 'Campaign Management', href: '/campaign-management-center', icon: FolderKanban },
    { name: 'Payment Processing', href: '/payment-processing-center', icon: DollarSign },
    { name: 'Brand & Contact', href: '/brand-contact-management', icon: Users },
    { name: 'Bulk Instagram Processor', href: '/bulk-instagram-processor', icon: LinkIcon },
    { name: 'System Settings', href: '/system-settings-user-management', icon: Settings },
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
              <img src="/assets/images/upgoal-logo.svg" alt="Upgoal Media" className="w-8 h-6 object-contain" />
            </div>
            <span className="sidebar-logo-text">Upgoal Media</span>
        </div>

        <nav className="sidebar-nav" role="navigation" aria-label="Main navigation">
          {navigation?.map((item) => (
            <button
              key={item?.href}
              onClick={() => handleNavigation(item?.href)}
              className={`sidebar-nav-item ${isActive(item?.href) ? 'active' : ''}`}
              title={isCollapsed ? item?.name : ''}
              aria-label={item?.name}
              aria-current={isActive(item?.href) ? 'page' : undefined}
            >
              <Icon name={item?.icon} size={20} />
              <span className="sidebar-nav-item-text">{item?.name}</span>
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