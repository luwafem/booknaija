import { useEffect } from 'react';
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
import EditBusinessModal from '../components/admin/EditBusinessModal';

export default function AdminDashboard() {
  const navigate = useNavigate();
  const state = useAdminState();
  const {
    activeTab, setActiveTab,
    stats, error, setError,
    showEditModal, setShowEditModal,
    selectedBusiness, editForm, setEditForm,
    handleSaveEdit, actionLoading,
    // we need to pass all state to tabs, so we'll spread state
  } = state;

  useEffect(() => {
    getCsrfToken();
  }, []);

  const handleLogout = () => {
    document.cookie = 'admin_token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 UTC;';
    navigate('/admin/login');
  };

  const renderTab = () => {
    const props = { ...state, exportCSV: state.exportCSV || (() => {}) };
    switch (activeTab) {
      case 'overview': return <OverviewTab {...props} />;
      case 'revenue': return <RevenueTab {...props} />;
      case 'growth': return <GrowthTab {...props} />;
      case 'geo': return <GeoTab {...props} />;
      case 'churn': return <ChurnTab {...props} />;
      case 'businesses': return <BusinessesTab {...props} />;
      case 'affiliates': return <AffiliatesTab {...props} />;
      case 'payouts': return <PayoutsTab {...props} />;
      case 'transactions': return <TransactionsTab {...props} />;
      case 'settings': return <SettingsTab {...props} />;
      case 'system': return <SystemTab {...props} />;
      case 'reports': return <ReportsTab {...props} />;
      default: return <div className="text-zinc-400">Tab not implemented.</div>;
    }
  };

  return (
    <AdminLayout activeTab={activeTab} setActiveTab={setActiveTab} stats={stats} onLogout={handleLogout}>
      {error && (
        <div className="bg-red-900/20 border border-red-700 rounded-xl p-4 mb-6 text-center">
          <p className="text-red-400 font-medium">{error}</p>
          <button onClick={() => setError('')} className="mt-2 text-sm text-red-300 hover:text-red-200">Dismiss</button>
        </div>
      )}
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