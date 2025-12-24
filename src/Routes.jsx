import React from "react";
import { BrowserRouter, Routes as RouterRoutes, Route } from "react-router-dom";
import ScrollToTop from "components/ScrollToTop";
import ErrorBoundary from "components/ErrorBoundary";
import NotFound from "pages/NotFound";
import PaymentProcessingCenter from './pages/payment-processing-center';
import ExecutiveDashboard from './pages/executive-dashboard';
import LoginAndAuthentication from './pages/login-and-authentication';
import CreatorDatabaseManagement from './pages/creator-database-management';
import CreatorProfileDetails from './pages/creator-profile-details';
import CampaignManagementCenter from './pages/campaign-management-center';
import BrandContactManagement from './pages/brand-contact-management';
import BulkInstagramProcessor from './pages/bulk-instagram-processor';
import SystemSettingsUserManagement from './pages/system-settings-user-management';

const Routes = () => {
  return (
    <BrowserRouter>
      <ErrorBoundary>
      <ScrollToTop />
      <RouterRoutes>
        {/* Define your route here */}
        <Route path="/" element={<LoginAndAuthentication />} />
        <Route path="/executive-dashboard" element={<ExecutiveDashboard />} />
        <Route path="/brand-contact-management" element={<BrandContactManagement />} />
        <Route path="/payment-processing-center" element={<PaymentProcessingCenter />} />
        <Route path="/login-and-authentication" element={<LoginAndAuthentication />} />
        <Route path="/creator-database-management" element={<CreatorDatabaseManagement />} />
        <Route path="/creator-profile-details" element={<CreatorProfileDetails />} />
        <Route path="/campaign-management-center" element={<CampaignManagementCenter />} />
        <Route path="/bulk-instagram-processor" element={<BulkInstagramProcessor />} />
        <Route path="/system-settings-user-management" element={<SystemSettingsUserManagement />} />
        <Route path="*" element={<NotFound />} />
      </RouterRoutes>
      </ErrorBoundary>
    </BrowserRouter>
  );
};

export default Routes;