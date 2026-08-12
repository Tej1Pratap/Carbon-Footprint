import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { GoogleOAuthProvider } from '@react-oauth/google';
import Landing from './pages/Landing';
import Login from './pages/Login';
import Register from './pages/Register';
import ForgotPassword from './pages/ForgotPassword';
import ResetPassword from './pages/ResetPassword';
import VerifyEmail from './pages/VerifyEmail';
import DashboardLayout from './components/DashboardLayout';
import Dashboard from './pages/Dashboard';
import ActivityLogging from './pages/ActivityLogging';
import Analytics from './pages/Analytics';
import ActivityHistory from './pages/ActivityHistory';
import SustainabilityGoals from './pages/SustainabilityGoals';
import Leaderboard from './pages/Leaderboard';
import Settings from './pages/Settings';
import Badges from './pages/Badges';
import Recommendations from './pages/Recommendations';
import Support from './pages/Support';
import './index.css';

import AdminLayout from './layouts/AdminLayout';
import AdminRoute from './components/AdminRoute';
import AdminDashboard from './pages/admin/AdminDashboard';
import AdminUsers from './pages/admin/AdminUsers';
import AdminActivity from './pages/admin/AdminActivity';
import AdminEmissionFactors from './pages/admin/AdminEmissionFactors';
import AdminReports from './pages/admin/AdminReports';
import AdminSettings from './pages/admin/AdminSettings';
import AdminLeaderboard from './pages/admin/AdminLeaderboard';
import AdminBadges from './pages/admin/AdminBadges';
import AdminSupport from './pages/admin/AdminSupport';
import AdminGoals from './pages/admin/AdminGoals';
import AdminRecommendations from './pages/admin/AdminRecommendations';

// Corporate
import CorporateLayout from './layouts/CorporateLayout';
import CorporateRoute from './components/CorporateRoute';
import CorporateOnboard from './pages/corporate/CorporateOnboard';
import CorporateDashboard from './pages/corporate/CorporateDashboard';
import Departments from './pages/corporate/Departments';
import Employees from './pages/corporate/Employees';
import CorporateGoals from './pages/corporate/CorporateGoals';
import CorporateCSRWrapper from './pages/corporate/CorporateCSRWrapper';
import CorporateLeaderboard from './pages/corporate/CorporateLeaderboard';
import CorporateReports from './pages/corporate/CorporateReports';
import CorporateActivity from './pages/corporate/CorporateActivity';
import CorporateBadges from './pages/corporate/CorporateBadges';
import CorporateSupport from './pages/corporate/CorporateSupport';
import CorporateEmissionFactors from './pages/corporate/CorporateEmissionFactors';
import CorporateRecommendations from './pages/corporate/CorporateRecommendations';

function App() {
  return (
    <GoogleOAuthProvider clientId="799325987673-f5p5sarodajfm14f9iduhbqr2naeis3s.apps.googleusercontent.com">
      <Router>
        <Routes>
          <Route path="/" element={<Landing />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/reset-password" element={<ResetPassword />} />
          <Route path="/verify-email" element={<VerifyEmail />} />
          
          {/* User Routes */}
          <Route path="/dashboard" element={<DashboardLayout><Dashboard /></DashboardLayout>} />
          <Route path="/activity" element={<DashboardLayout><ActivityLogging /></DashboardLayout>} />
          <Route path="/analytics" element={<DashboardLayout><Analytics /></DashboardLayout>} />
          <Route path="/goals" element={<DashboardLayout><SustainabilityGoals /></DashboardLayout>} />
          <Route path="/recommendations" element={<DashboardLayout><Recommendations /></DashboardLayout>} />
          <Route path="/leaderboard" element={<DashboardLayout><Leaderboard /></DashboardLayout>} />
          <Route path="/badges" element={<DashboardLayout><Badges /></DashboardLayout>} />
          <Route path="/history" element={<DashboardLayout><ActivityHistory /></DashboardLayout>} />
          <Route path="/settings" element={<DashboardLayout><Settings /></DashboardLayout>} />
          <Route path="/profile" element={<DashboardLayout><Settings /></DashboardLayout>} />
          <Route path="/support" element={<DashboardLayout><Support /></DashboardLayout>} />

          {/* Admin Routes */}
          <Route path="/admin" element={
            <AdminRoute>
              <AdminLayout>
                <AdminDashboard />
              </AdminLayout>
            </AdminRoute>
          } />
          <Route path="/admin/users" element={
            <AdminRoute>
              <AdminLayout>
                <AdminUsers />
              </AdminLayout>
            </AdminRoute>
          } />
          <Route path="/admin/activity" element={
            <AdminRoute>
              <AdminLayout>
                <AdminActivity />
              </AdminLayout>
            </AdminRoute>
          } />
          <Route path="/admin/emission-factors" element={
            <AdminRoute>
              <AdminLayout>
                <AdminEmissionFactors />
              </AdminLayout>
            </AdminRoute>
          } />
          <Route path="/admin/reports" element={
            <AdminRoute>
              <AdminLayout>
                <AdminReports />
              </AdminLayout>
            </AdminRoute>
          } />
          <Route path="/admin/badges" element={
            <AdminRoute>
              <AdminLayout>
                <AdminBadges />
              </AdminLayout>
            </AdminRoute>
          } />
          <Route path="/admin/goals" element={
            <AdminRoute>
              <AdminLayout>
                <AdminGoals />
              </AdminLayout>
            </AdminRoute>
          } />
          <Route path="/admin/recommendations" element={
            <AdminRoute>
              <AdminLayout>
                <AdminRecommendations />
              </AdminLayout>
            </AdminRoute>
          } />
          <Route path="/admin/settings" element={

            <AdminRoute>
              <AdminLayout>
                <AdminSettings />
              </AdminLayout>
            </AdminRoute>
          } />
          <Route path="/admin/profile" element={
            <AdminRoute>
              <AdminLayout>
                <Settings />
              </AdminLayout>
            </AdminRoute>
          } />
          <Route path="/admin/leaderboard" element={
            <AdminRoute>
              <AdminLayout>
                <AdminLeaderboard />
              </AdminLayout>
            </AdminRoute>
          } />
          <Route path="/admin/support" element={
            <AdminRoute>
              <AdminLayout>
                <AdminSupport />
              </AdminLayout>
            </AdminRoute>
          } />
          
          {/* Corporate Routes */}
          <Route path="/corporate/onboard" element={<CorporateOnboard />} />
          <Route path="/corporate" element={
            <CorporateRoute>
              <CorporateLayout>
                <CorporateDashboard />
              </CorporateLayout>
            </CorporateRoute>
          } />
          <Route path="/corporate/departments" element={
            <CorporateRoute>
              <CorporateLayout>
                <Departments />
              </CorporateLayout>
            </CorporateRoute>
          } />
          <Route path="/corporate/employees" element={
            <CorporateRoute>
              <CorporateLayout>
                <Employees />
              </CorporateLayout>
            </CorporateRoute>
          } />
          <Route path="/corporate/employee-activity" element={
            <CorporateRoute>
              <CorporateLayout>
                <CorporateActivity />
              </CorporateLayout>
            </CorporateRoute>
          } />
          <Route path="/corporate/goals" element={
            <CorporateRoute>
              <CorporateLayout>
                <CorporateGoals />
              </CorporateLayout>
            </CorporateRoute>
          } />
          <Route path="/corporate/csr" element={
            <CorporateRoute>
              <CorporateLayout>
                <CorporateCSRWrapper />
              </CorporateLayout>
            </CorporateRoute>
          } />
          <Route path="/corporate/benchmarking" element={
            <CorporateRoute>
              <CorporateLayout>
                <CorporateLeaderboard />
              </CorporateLayout>
            </CorporateRoute>
          } />
          <Route path="/corporate/reports" element={
            <CorporateRoute>
              <CorporateLayout>
                <CorporateReports />
              </CorporateLayout>
            </CorporateRoute>
          } />
          <Route path="/corporate/badges" element={
            <CorporateRoute>
              <CorporateLayout>
                <CorporateBadges />
              </CorporateLayout>
            </CorporateRoute>
          } />
          <Route path="/corporate/support" element={
            <CorporateRoute>
              <CorporateLayout>
                <CorporateSupport />
              </CorporateLayout>
            </CorporateRoute>
          } />
          <Route path="/corporate/emission-factors" element={
            <CorporateRoute>
              <CorporateLayout>
                <CorporateEmissionFactors />
              </CorporateLayout>
            </CorporateRoute>
          } />
          <Route path="/corporate/recommendations" element={
            <CorporateRoute>
              <CorporateLayout>
                <CorporateRecommendations />
              </CorporateLayout>
            </CorporateRoute>
          } />
          <Route path="/corporate/emissions" element={
            <CorporateRoute>
              <CorporateLayout>
                <CorporateDashboard />
              </CorporateLayout>
            </CorporateRoute>
          } />
          <Route path="/corporate/scopes" element={
            <CorporateRoute>
              <CorporateLayout>
                <CorporateDashboard />
              </CorporateLayout>
            </CorporateRoute>
          } />
          
          <Route path="/corporate/settings" element={
            <CorporateRoute>
              <CorporateLayout>
                <Settings />
              </CorporateLayout>
            </CorporateRoute>
          } />
          
          {/* Corporate Personal Tracking Routes */}
          <Route path="/corporate/personal/dashboard" element={<CorporateRoute><CorporateLayout><Dashboard /></CorporateLayout></CorporateRoute>} />
          <Route path="/corporate/personal/activity" element={<CorporateRoute><CorporateLayout><ActivityLogging /></CorporateLayout></CorporateRoute>} />
          <Route path="/corporate/personal/analytics" element={<CorporateRoute><CorporateLayout><Analytics /></CorporateLayout></CorporateRoute>} />
          <Route path="/corporate/personal/goals" element={<CorporateRoute><CorporateLayout><SustainabilityGoals /></CorporateLayout></CorporateRoute>} />
          <Route path="/corporate/personal/recommendations" element={<CorporateRoute><CorporateLayout><Recommendations /></CorporateLayout></CorporateRoute>} />
          <Route path="/corporate/personal/leaderboard" element={<CorporateRoute><CorporateLayout><Leaderboard /></CorporateLayout></CorporateRoute>} />
          <Route path="/corporate/personal/badges" element={<CorporateRoute><CorporateLayout><Badges /></CorporateLayout></CorporateRoute>} />
          <Route path="/corporate/personal/history" element={<CorporateRoute><CorporateLayout><ActivityHistory /></CorporateLayout></CorporateRoute>} />
          <Route path="/corporate/personal/settings" element={<CorporateRoute><CorporateLayout><Settings /></CorporateLayout></CorporateRoute>} />
          <Route path="/corporate/personal/profile" element={<CorporateRoute><CorporateLayout><Settings /></CorporateLayout></CorporateRoute>} />
          <Route path="/corporate/personal/support" element={<CorporateRoute><CorporateLayout><Support /></CorporateLayout></CorporateRoute>} />
          
        </Routes>
      </Router>
    </GoogleOAuthProvider>
  );
}

export default App;
