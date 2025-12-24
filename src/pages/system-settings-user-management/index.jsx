import React, { useState, useEffect } from 'react';
import { Settings, Users, Activity, Shield } from 'lucide-react';
import Header from '../../components/ui/Header';
import Sidebar from '../../components/ui/Sidebar';
import SystemSettingsPanel from './components/SystemSettingsPanel';
import UserManagementPanel from './components/UserManagementPanel';
import AuditLogsPanel from './components/AuditLogsPanel';
import Icon from '../../components/AppIcon';



const SystemSettingsUserManagement = () => {
  const [activeTab, setActiveTab] = useState('settings');
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);

  const tabs = [
    { id: 'settings', label: 'System Settings', icon: Settings },
    { id: 'users', label: 'User Management', icon: Users },
    { id: 'audit', label: 'Audit Logs', icon: Activity }
  ];

  return (
    <div className="flex h-screen bg-gray-50">
      <Sidebar onToggleCollapse={() => setIsSidebarCollapsed(!isSidebarCollapsed)} />
      <div className="flex-1 flex flex-col overflow-hidden">
        <Header />
        
        <main className="flex-1 overflow-y-auto p-6">
          {/* Page Header */}
          <div className="mb-6">
            <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
              <Shield className="w-8 h-8 text-purple-600" />
              System Settings & User Management
            </h1>
            <p className="text-gray-600 mt-2">
              Configure system settings and manage user access controls
            </p>
          </div>

          {/* Tab Navigation */}
          <div className="bg-white rounded-lg shadow-sm mb-6">
            <div className="border-b border-gray-200">
              <nav className="flex space-x-8 px-6" aria-label="Tabs">
                {tabs?.map((tab) => {
                  const Icon = tab?.icon;
                  return (
                    <button
                      key={tab?.id}
                      onClick={() => setActiveTab(tab?.id)}
                      className={`
                        flex items-center gap-2 py-4 px-1 border-b-2 font-medium text-sm transition-colors
                        ${activeTab === tab?.id
                          ? 'border-purple-600 text-purple-600' :'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                        }
                      `}
                    >
                      <Icon className="w-5 h-5" />
                      {tab?.label}
                    </button>
                  );
                })}
              </nav>
            </div>
          </div>

          {/* Tab Content */}
          <div className="bg-white rounded-lg shadow-sm">
            {activeTab === 'settings' && <SystemSettingsPanel />}
            {activeTab === 'users' && <UserManagementPanel />}
            {activeTab === 'audit' && <AuditLogsPanel />}
          </div>
        </main>
      </div>
    </div>
  );
};

export default SystemSettingsUserManagement;