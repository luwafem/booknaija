// src/pages/AdminDashboard.jsx
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { getCsrfToken } from '../lib/csrf';
import { useAdminState } from '../hooks/useAdminState';
import AdminLayout from '../components/admin/AdminLayout';
import OverviewTab from '../components/admin/OverviewTab';
import RevenueTab from '../components/admin/RevenueTab';
import GrowthTab from '../components/admin/GrowthTab';
import GeoTab from '../components/admin/GeoTab';
import ChurnTab from '../components/admin/ChurnTab';
import BusinessesTab from '../components/admin/BusinessesTab';
import AffiliatesTab from '../components/admin/AffiliatesTab';
import PayoutsTab from '../components/admin/PayoutsTab';
import TransactionsTab from '../components/admin/TransactionsTab';
import SettingsTab from '../components/admin/SettingsTab';
import SystemTab from '../components/admin/SystemTab';
import ReportsTab from '../components/admin/ReportsTab';
import SupportTab from '../components/admin/SupportTab'; // 👈 NEW IMPORT
import EditBusinessModal from '../components/admin/EditBusinessModal';

export default function AdminDashboard() {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(true);
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  
  // 👇 Only enable data fetching after authentication is confirmed
  const state = useAdminState(!isLoading);
  
  const {
    activeTab,
    setActiveTab,
    stats,
    showEditModal,
    setShowEditModal,
    selectedBusiness,
    editForm,
    setEditForm,
    handleSaveEdit,
    actionLoading,
    handleAffiliateVerify,
    handleDomainAction,
  } = state;

  // ─── CSRF Token ──────────────────────────────────────────
  useEffect(() => {
    getCsrfToken();
  }, []);

  // ─── VERIFY ADMIN SESSION ──────────────────────────────
  useEffect(() => {
    const verifySession = async () => {
      try {
        const res = await fetch('/.netlify/functions/admin-verify');
        if (!res.ok) {
          navigate('/admin/login');
          return;
        }
        setIsLoading(false);
      } catch (err) {
        navigate('/admin/login');
      }
    };

    verifySession();
  }, [navigate]);

  // ─── LOGOUT ─────────────────────────────────────────────
  const handleLogout = async () => {
    if (isLoggingOut) return;
    setIsLoggingOut(true);
    try {
      await fetch('/.netlify/functions/admin-logout', {
        method: 'POST',
        credentials: 'same-origin',
      });
    } catch (err) {
      console.error('Logout error:', err);
    } finally {
      setIsLoggingOut(false);
      navigate('/admin/login');
    }
  };

  // ─── RENDER TAB ──────────────────────────────────────────
  const renderTab = () => {
    const props = {
      ...state,
      exportCSV: state.exportCSV || (() => {}),
    };
    switch (activeTab) {
      case 'overview':
        return <OverviewTab {...props} />;
      case 'revenue':
        return <RevenueTab {...props} />;
      case 'growth':
        return <GrowthTab {...props} />;
      case 'geo':
        return <GeoTab {...props} />;
      case 'churn':
        return <ChurnTab {...props} />;
      case 'businesses':
        return <BusinessesTab {...props} />;
      case 'affiliates':
        return <AffiliatesTab {...props} />;
      case 'payouts':
        return <PayoutsTab {...props} />;
      case 'transactions':
        return <TransactionsTab {...props} />;
      case 'settings':
        return <SettingsTab {...props} />;
      case 'system':
        return <SystemTab {...props} />;
      case 'reports':
        return <ReportsTab {...props} />;
      case 'support': // 👈 NEW SUPPORT TAB
        return <SupportTab />;
      default:
        return <div className="text-zinc-400">Tab not implemented.</div>;
    }
  };

  // ─── LOADING STATE ──────────────────────────────────────
  if (isLoading) {
    return (
      <div className="min-h-screen bg-zinc-950 flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-2 border-white/20 border-t-white rounded-full animate-spin mx-auto mb-4" />
          <p className="text-sm text-zinc-400">Verifying session...</p>
        </div>
      </div>
    );
  }

  // ─── MAIN RENDER ────────────────────────────────────────
  return (
    <AdminLayout activeTab={activeTab} setActiveTab={setActiveTab} stats={stats} onLogout={handleLogout}>
      {renderTab()}

      <EditBusinessModal
        show={showEditModal}
        onClose={() => setShowEditModal(false)}
        business={selectedBusiness}
        editForm={editForm}
        setEditForm={setEditForm}
        onSave={handleSaveEdit}
        saving={actionLoading['edit-' + selectedBusiness?.slug]}
      />
    </AdminLayout>
  );
}