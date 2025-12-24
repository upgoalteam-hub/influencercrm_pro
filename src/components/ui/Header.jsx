import React, { useState, useRef, useEffect } from 'react';

import UserProfileDropdown from './UserProfileDropdown';
import NotificationCenter from './NotificationCenter';
import QuickActionToolbar from './QuickActionToolbar';
import SearchGlobal from './SearchGlobal';

const Header = ({ isCollapsed = false }) => {
  return (
    <header className={`app-header with-sidebar ${isCollapsed ? 'collapsed' : ''}`}>
      <div className="header-content">
        <div className="header-search">
          <SearchGlobal />
        </div>

        <div className="header-actions">
          <QuickActionToolbar />
          <NotificationCenter />
          <UserProfileDropdown />
        </div>
      </div>
    </header>
  );
};

export default Header;