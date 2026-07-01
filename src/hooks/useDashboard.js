// src/hooks/useDashboard.js
import { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useBusiness } from './useBusiness';
import { uid, optimizeCloudinaryUrl, CLOUD_NAME, UPLOAD_PRESET } from '../lib/dashboardHelpers';
import { getCsrfToken } from '../lib/csrf';
import { getDiff } from '../lib/diff';

export function useDashboard() {
  const { slug } = useParams();
  const navigate = useNavigate();
  const { business: initialBiz, loading } = useBusiness(slug);

  const [biz, setBiz] = useState(null);
  const [activeTab, setActiveTab] = useState('info');
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState('');
  const [showToggles, setShowToggles] = useState(false);
  const clickCount = useRef(0);
  const clickTimer = useRef(null);

  const [copied, setCopied] = useState(false);
  const [urlCopied, setUrlCopied] = useState(false);

  const [showMapPicker, setShowMapPicker] = useState(false);

  const [subLoading, setSubLoading] = useState(false);
  const [subMsg, setSubMsg] = useState('');

  const [bankUpdating, setBankUpdating] = useState(false);
  const [bankUpdateError, setBankUpdateError] = useState('');
  const [bankUpdateSuccess, setBankUpdateSuccess] = useState(false);
  const [bankName, setBankName] = useState('');
  const [bankCode, setBankCode] = useState('');
  const [bankAcc, setBankAcc] = useState('');
  const [banks, setBanks] = useState([]);

  const [offlineBookings, setOfflineBookings] = useState([]);
  const [offlineLoading, setOfflineLoading] = useState(false);

  // Load banks
  useEffect(() => {
    fetch('/.netlify/functions/list-banks')
      .then(res => res.json())
      .then(data => { if (Array.isArray(data)) setBanks(data); })
      .catch(console.error);
  }, []);

  // Auth check
  useEffect(() => {
    if (!loading && biz) {
      const authStatus = sessionStorage.getItem('biz_auth_' + slug);
      if (!authStatus) navigate('/dashboard');
    }
  }, [loading, biz, slug, navigate]);

  // Sync initial data
  useEffect(() => {
    if (initialBiz) {
      setBiz(JSON.parse(JSON.stringify(initialBiz)));
      setActiveTab('info');
      setShowToggles(false);
      clickCount.current = 0;
    }
  }, [initialBiz]);

  // Load offline bookings when tab is active
  useEffect(() => {
    if (activeTab === 'offline-payments' && biz) {
      setOfflineLoading(true);
      fetch(`/.netlify/functions/get-offline-bookings?slug=${biz.slug}`)
        .then(res => res.json())
        .then(data => setOfflineBookings(data.bookings || []))
        .catch(console.error)
        .finally(() => setOfflineLoading(false));
    }
  }, [activeTab, biz]);

  // Handle subscription payment return
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const subRef = params.get('sub_ref');
    if (subRef && biz) {
      setSubLoading(true);
      fetch('/.netlify/functions/verify-subscription', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ reference: subRef, slug })
      })
        .then(r => r.json())
        .then(data => {
          if (data.success) {
            setSubMsg('Payment successful! Subscription extended by 30 days.');
            setTimeout(() => window.location.reload(), 2000);
          } else {
            setSubMsg('Payment verification failed. Contact support.');
          }
        })
        .catch(() => setSubMsg('Network error verifying payment.'))
        .finally(() => setSubLoading(false));
      window.history.replaceState({}, '', window.location.pathname);
    }
  }, [biz, slug]);

  // Load Cloudinary widget
  useEffect(() => {
    if (!window.cloudinary) {
      const script = document.createElement('script');
      script.src = 'https://widget.cloudinary.com/v2.0/global/all.js';
      script.async = true;
      document.body.appendChild(script);
    }
  }, []);

  // ── Handlers ──
  const handleNameClick = () => {
    clickCount.current++;
    clearTimeout(clickTimer.current);
    clickTimer.current = setTimeout(() => { clickCount.current = 0; }, 500);
    if (clickCount.current >= 3) {
      clickCount.current = 0;
      setShowToggles(prev => !prev);
    }
  };

  const handleCopyReferralLink = () => {
    const url = window.location.origin + '/signup?ref=' + biz.slug;
    navigator.clipboard.writeText(url)
      .then(() => { setCopied(true); setTimeout(() => setCopied(false), 2500); })
      .catch(() => {
        const ta = document.createElement('textarea');
        ta.value = url;
        document.body.appendChild(ta);
        ta.select();
        document.execCommand('copy');
        document.body.removeChild(ta);
        setCopied(true);
        setTimeout(() => setCopied(false), 2500);
      });
  };

  const handleCopyPageUrl = () => {
    const url = window.location.origin + '/' + biz.slug;
    navigator.clipboard.writeText(url)
      .then(() => { setUrlCopied(true); setTimeout(() => setUrlCopied(false), 2500); })
      .catch(() => {
        const ta = document.createElement('textarea');
        ta.value = url;
        document.body.appendChild(ta);
        ta.select();
        document.execCommand('copy');
        document.body.removeChild(ta);
        setUrlCopied(true);
        setTimeout(() => setUrlCopied(false), 2500);
      });
  };

  const handlePaySubscription = async () => {
    setSubLoading(true);
    setSubMsg('');
    try {
      const res = await fetch('/.netlify/functions/initialize-subscription', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ slug, email: biz.email })
      });
      const data = await res.json();
      if (data.authorization_url) {
        window.location.href = data.authorization_url;
      } else {
        setSubMsg(data.error || 'Failed to initialize payment.');
        setSubLoading(false);
      }
    } catch {
      setSubMsg('Network error.');
      setSubLoading(false);
    }
  };

  const handleUpdateBank = async () => {
    if (!bankName.trim()) { setBankUpdateError('Enter account name.'); return; }
    if (!bankCode) { setBankUpdateError('Select a bank.'); return; }
    if (!/^[0-9]{10}$/.test(bankAcc)) { setBankUpdateError('Account number must be 10 digits.'); return; }

    setBankUpdating(true);
    setBankUpdateError('');
    setBankUpdateSuccess(false);
    try {
      const res = await fetch('/.netlify/functions/update-subaccount', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          slug: biz.slug,
          business_name: biz.name,
          settlement_bank: bankCode,
          account_number: bankAcc,
          account_name: bankName,
          email: biz.email || '',
          phone: biz.phone || ''
        })
      });
      const data = await res.json();
      if (res.ok && (data.ok || data.subaccount_code)) {
        setBankUpdateSuccess(true);
        setBiz(prev => ({ ...prev, subaccount_code: data.subaccount_code || prev.subaccount_code }));
        setTimeout(() => window.location.reload(), 1500);
      } else {
        setBankUpdateError(data.error || 'Verification failed.');
      }
    } catch {
      setBankUpdateError('Network error.');
    } finally {
      setBankUpdating(false);
    }
  };

  const handleVerifyOfflinePayment = async (bookingId) => {
    if (!confirm('Have you received this payment?')) return;
    setOfflineLoading(true);
    try {
      const res = await fetch('/.netlify/functions/verify-offline-booking', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: bookingId, slug: biz.slug })
      });
      if (res.ok) {
        setOfflineBookings(prev =>
          prev.map(b => b.id === bookingId ? { ...b, status: 'verified' } : b)
        );
        alert('Payment verified!');
      } else {
        alert('Verification failed.');
      }
    } catch {
      alert('Network error.');
    } finally {
      setOfflineLoading(false);
    }
  };

  // ── CRUD helpers ──
  const setField = (field, value) => setBiz(prev => ({ ...prev, [field]: value }));
  const setNested = (arrName, id, updates) => {
    setBiz(prev => ({
      ...prev,
      [arrName]: prev[arrName].map(item => item.id === id ? { ...item, ...updates } : item)
    }));
  };
  const addItem = (arrName, template) => {
    setBiz(prev => ({ ...prev, [arrName]: [...prev[arrName], template] }));
  };
  const removeItem = (arrName, id) => {
    setBiz(prev => ({ ...prev, [arrName]: prev[arrName].filter(i => i.id !== id) }));
  };

  // ── Image upload wrapper ──
  const uploadImage = (onSuccess, isMultiple = true, maxImages = 10) => {
    if (!window.cloudinary) { alert('Widget loading...'); return; }
    const urls = [];
    const widget = window.cloudinary.createUploadWidget(
      {
        cloudName: CLOUD_NAME,
        uploadPreset: UPLOAD_PRESET,
        sources: ['local', 'url', 'camera'],
        multiple: isMultiple,
        maxFiles: maxImages,
        maxImageFileSize: 10000000,
        clientAllowedFormats: ['jpg', 'jpeg', 'png', 'webp'],
        transformation: [{ width: 1200, crop: 'limit' }]
      },
      (err, res) => {
        if (err) return;
        if (!isMultiple && res.event === 'success' && res.info?.secure_url) {
          onSuccess(optimizeCloudinaryUrl(res.info.secure_url));
        }
        if (isMultiple && res.event === 'success') {
          const u = res.info?.secure_url;
          if (u && !urls.includes(u)) {
            urls.push(u);
            onSuccess(optimizeCloudinaryUrl(u));
          }
        }
        if (isMultiple && res.event === 'upload-finish' && res.info?.files) {
          res.info.files.forEach(f => {
            const u2 = f.uploadInfo?.secure_url;
            if (u2 && !urls.includes(u2)) {
              urls.push(u2);
              onSuccess(optimizeCloudinaryUrl(u2));
            }
          });
        }
      }
    );
    widget.open();
  };

  // ── Save changes with CSRF protection (full payload) ──
  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError('');
    setSaved(false);

    try {
      // Compute only changed fields to check if anything changed
      const changes = getDiff(initialBiz, biz);

      // If nothing changed, show saved state and return early
      if (Object.keys(changes).length === 0) {
        setSaved(true);
        setTimeout(() => setSaved(false), 3000);
        setSaving(false);
        return;
      }

      // Build full payload with consistent field names
      const payload = {
        ...biz,
        slug: biz.slug,
        account_name: biz.accountName || biz.account_name || '',
        account_number: biz.accountNumber || biz.account_number || '',
        settlement_bank: biz.settlementBank || biz.settlement_bank || ''
      };

      const res = await fetch('/.netlify/functions/save-business', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-CSRF-Token': getCsrfToken(),
        },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (res.ok && data.ok) {
        setSaved(true);
        setTimeout(() => setSaved(false), 3000);
      } else {
        throw new Error(data.error || 'Failed to save');
      }
    } catch (err) {
      setError(err.message || 'Failed to save changes.');
    } finally {
      setSaving(false);
    }
  };

  // ── Derived values ──
  const subEndsAt = biz?.subscription_ends_at ? new Date(biz.subscription_ends_at) : null;
  const now = new Date();
  const daysLeft = subEndsAt ? Math.ceil((subEndsAt - now) / (1000 * 60 * 60 * 24)) : null;
  const isExpired = daysLeft !== null && daysLeft <= 0;
  const isWarning = daysLeft !== null && daysLeft <= 5 && daysLeft > 0;

  const getMapsReadiness = () => {
    const issues = [];
    if (!biz?.name) issues.push('Business Name');
    if (!biz?.phone) issues.push('Phone Number');
    if (!biz?.location) issues.push('Location');
    if (!biz?.email) issues.push('Email');
    return { ready: issues.length === 0, issues };
  };

  const getVisibleTabs = () => {
    if (!biz) return [];
    const base = [
      { id: 'info', label: 'Info' },
      { id: 'security', label: 'Security' },
      { id: 'gallery', label: 'Gallery' },
      { id: 'offline-payments', label: 'Bank Payments' }
    ];
    if (biz.servicesEnabled) base.push({ id: 'services', label: 'Services' });
    if (biz.productsEnabled) base.push({ id: 'products', label: 'Products' });
    if (biz.carsEnabled) base.push({ id: 'cars', label: 'Cars' });
    if (biz.foodEnabled) base.push({ id: 'food', label: 'Food' });
    if (biz.propertiesEnabled) base.push({ id: 'properties', label: 'Properties' });
    if (biz.estatesEnabled) base.push({ id: 'estates', label: 'Estates' });
    return base;
  };

  const resolveBankName = (code) => {
    if (!code) return '';
    if (/^\d{2,6}$/.test(code)) {
      const found = banks.find(b => b.code === code);
      return found ? found.name : code;
    }
    return code;
  };

  const resolveBankCode = (name) => {
    if (!name) return '';
    if (/^\d{2,6}$/.test(name)) return name;
    const found = banks.find(b => b.name === name);
    return found ? found.code : '';
  };

  return {
    // State
    biz,
    setBiz,
    activeTab,
    setActiveTab,
    saving,
    saved,
    error,
    showToggles,
    copied,
    urlCopied,
    showMapPicker,
    setShowMapPicker,
    subLoading,
    subMsg,
    bankUpdating,
    bankUpdateError,
    bankUpdateSuccess,
    bankName,
    setBankName,
    bankCode,
    setBankCode,
    bankAcc,
    setBankAcc,
    banks,
    offlineBookings,
    offlineLoading,
    loading,
    slug,
    accent: biz?.accent || '#c8a97e',
    // Derived
    isExpired,
    isWarning,
    daysLeft,
    getMapsReadiness,
    getVisibleTabs,
    resolveBankName,
    resolveBankCode,
    // Handlers
    handleNameClick,
    handleCopyReferralLink,
    handleCopyPageUrl,
    handlePaySubscription,
    handleUpdateBank,
    handleVerifyOfflinePayment,
    handleSave, // now sends full payload with CSRF
    uploadImage,
    setField,
    setNested,
    addItem,
    removeItem,
    // Helpers
    uid,
    optimizeCloudinaryUrl,
  };
}