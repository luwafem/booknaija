// src/hooks/useSignup.js
import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';

export function useSignup() {
  const [params] = useSearchParams();
  const referralParam = params.get('ref');

  const [loading, setLoading] = useState(false);
  const [banks, setBanks] = useState([]);
  const [banksLoading, setBanksLoading] = useState(true);
  const [error, setError] = useState('');
  const [consent, setConsent] = useState(false);
  const [brandColor, setBrandColor] = useState('#c8a97e');
  const [logoUrl, setLogoUrl] = useState('');
  const [currentStep, setCurrentStep] = useState(1);

  const steps = [
    { id: 1, title: 'Business Info', desc: 'Basic details' },
    { id: 2, title: 'Profile', desc: 'About your business' },
    { id: 3, title: 'Branding', desc: 'Logo & colors' },
    { id: 4, title: 'Services', desc: 'What you offer' },
    { id: 5, title: 'Payout', desc: 'Get paid' },
  ];

  const [formValues, setFormValues] = useState({
    business_name: '',
    email: '',
    phone: '',
    business_type: '',
    business_description: '',
    business_address: '',
    whatsapp_number: '',
    num_services: '',
    has_products: '',
    instagram_link: '',
    tiktok_link: '',
    other_socials: '',
    referral_code: referralParam || '',
    account_name: '',
    settlement_bank: '',
    account_number: '',
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormValues((prev) => ({ ...prev, [name]: value }));
  };

  // ─── Derive feature flags ───
  const getFeaturesForType = (type) => {
    switch (type) {
      case 'Fashion':
        return { servicesEnabled: true, productsEnabled: true, carsEnabled: false, foodEnabled: false, propertiesEnabled: false };
      case 'Lash Artist':
      case 'Hair Stylist':
      case 'Makeup Artist':
      case 'Nail Technician':
      case 'Skin Care':
        return { servicesEnabled: true, productsEnabled: true, carsEnabled: false, foodEnabled: false, propertiesEnabled: false };
      case 'Cleaner':
      case 'Tutor':
        return { servicesEnabled: true, productsEnabled: false, carsEnabled: false, foodEnabled: false, propertiesEnabled: false };
      case 'Restaurant':
        return { servicesEnabled: false, productsEnabled: false, carsEnabled: false, foodEnabled: true, propertiesEnabled: false };
      case 'Auto':
        return { servicesEnabled: false, productsEnabled: false, carsEnabled: true, foodEnabled: false, propertiesEnabled: false };
      case 'Real Estate':
      case 'Shortlet':
        return { servicesEnabled: false, productsEnabled: false, carsEnabled: false, foodEnabled: false, propertiesEnabled: true };
      default:
        return { servicesEnabled: true, productsEnabled: true, carsEnabled: false, foodEnabled: false, propertiesEnabled: false };
    }
  };

  const currentTypeFeatures = formValues.business_type ? getFeaturesForType(formValues.business_type) : null;

  // ─── Load banks ───
  useEffect(() => {
    const fetchBanks = async () => {
      try {
        const res = await fetch('/.netlify/functions/list-banks');
        const data = await res.json();
        if (Array.isArray(data)) setBanks(data);
      } catch (err) {
        console.error('Failed to load banks:', err);
      } finally {
        setBanksLoading(false);
      }
    };
    fetchBanks();

    const script = document.createElement('script');
    script.src = 'https://widget.cloudinary.com/v2.0/global/all.js';
    script.async = true;
    document.body.appendChild(script);

    return () => {
      // Cleanup if needed
    };
  }, []);

  // ─── Helpers ───
  const generateSlug = (text) => {
    if (!text) return '';
    return text
      .toString()
      .toLowerCase()
      .trim()
      .replace(/\s+/g, '-')
      .replace(/[^\w-]+/g, '')
      .replace(/--+/g, '-');
  };

  const openUploadWidget = () => {
    if (!window.cloudinary) {
      alert('Image upload widget is still loading, please wait a moment.');
      return;
    }
    const widget = window.cloudinary.createUploadWidget(
      {
        cloudName: 'deexaiik4',
        uploadPreset: 'BizUploads',
        sources: ['local', 'url', 'camera'],
        multiple: false,
        maxFiles: 1,
      },
      (error, result) => {
        if (!error && result.event === 'success') {
          setLogoUrl(result.info.secure_url);
        }
      }
    );
    widget.open();
  };

  const validateStep = (step) => {
    setError('');
    if (step === 1) {
      if (!formValues.business_name.trim()) { setError('Business name is required.'); return false; }
      if (!formValues.email.trim()) { setError('Email is required.'); return false; }
      if (!formValues.phone.trim()) { setError('Phone number is required.'); return false; }
      if (!formValues.business_type) { setError('Please select a business type.'); return false; }
    }
    if (step === 2) {
      if (!formValues.business_description.trim()) { setError('Business description is required.'); return false; }
      if (!formValues.business_address.trim()) { setError('Business address is required.'); return false; }
      if (!formValues.whatsapp_number.trim()) { setError('WhatsApp number is required.'); return false; }
    }
    if (step === 5) {
      if (!formValues.account_name.trim()) { setError('Account name is required.'); return false; }
      if (!formValues.settlement_bank) { setError('Please select a bank.'); return false; }
      if (!/^[0-9]{10}$/.test(formValues.account_number)) { setError('Account number must be exactly 10 digits.'); return false; }
      if (!consent) { setError('Please accept the payment policy.'); return false; }
    }
    return true;
  };

  const nextStep = () => {
    if (!validateStep(currentStep)) return;
    if (currentStep < steps.length) setCurrentStep((c) => c + 1);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const prevStep = () => {
    setError('');
    if (currentStep > 1) setCurrentStep((c) => c - 1);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // ─── Fetch with timeout ───
  const fetchWithTimeout = async (url, options, timeout = 15000) => {
    const controller = new AbortController();
    const id = setTimeout(() => controller.abort(), timeout);
    try {
      const res = await fetch(url, { ...options, signal: controller.signal });
      clearTimeout(id);
      return res;
    } catch (err) {
      clearTimeout(id);
      throw err;
    }
  };

  // ─── Submit ───
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateStep(5)) return;

    setLoading(true);
    setError('');

    const {
      business_name,
      email,
      phone,
      business_type,
      settlement_bank,
      account_number,
      account_name,
      whatsapp_number,
      business_description,
      business_address,
      instagram_link,
      tiktok_link,
      has_products,
    } = formValues;

    const colorToUse = brandColor || '#c8a97e';
    const businessSlug = generateSlug(business_name);
    const signupAmount = 2500;

    if (!businessSlug) {
      setError('Business name is missing. Please go back to Step 1.');
      setLoading(false);
      return;
    }

    const typeFeatures = getFeaturesForType(business_type);
    if (has_products === 'No') {
      typeFeatures.productsEnabled = false;
    } else if (has_products === 'Yes') {
      typeFeatures.productsEnabled = true;
    }

    let finalSubaccountCode = null;

    try {
      // 1. Create subaccount
      const subaccountRes = await fetchWithTimeout(
        '/.netlify/functions/create-subaccount',
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            business_name,
            settlement_bank,
            account_number,
            percentage_charge: 5,
            primary_contact_name: account_name || business_name,
            primary_contact_email: email,
            primary_contact_phone: phone,
          }),
        },
        15000
      );

      if (!subaccountRes.ok) {
        const errData = await subaccountRes.json().catch(() => ({}));
        console.error('Subaccount creation failed:', errData.error || subaccountRes.statusText);
        finalSubaccountCode = 'ACCT_PENDING';
      } else {
        const subaccountData = await subaccountRes.json();
        finalSubaccountCode = subaccountData.subaccount_code || 'ACCT_PENDING';
      }
    } catch (err) {
      console.error('Error creating subaccount:', err.message);
      finalSubaccountCode = 'ACCT_PENDING';
    }

    const selectedBank = banks.find((b) => b.code === settlement_bank);
    const settlementBankName = selectedBank ? selectedBank.name : settlement_bank;

    const tempBusinessData = {
      businessName: business_name,
      businessSlug,
      email,
      phone,
      whatsapp: whatsapp_number,
      businessType: business_type,
      subaccountCode: finalSubaccountCode,
      brandColor: colorToUse,
      logoUrl,
      bio: business_description,
      location: business_address,
      instagram: instagram_link,
      tiktok: tiktok_link,
      referredBy: referralParam,
      initialPaymentAmount: signupAmount,
      accountName: account_name,
      accountNumber: account_number,
      settlementBank: settlementBankName,
      ...typeFeatures,
    };

    localStorage.setItem(`pending_signup_${businessSlug}`, JSON.stringify(tempBusinessData));

    // 2. Initialize payment
    try {
      const payRes = await fetchWithTimeout(
        '/.netlify/functions/initialize-payment',
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            email,
            amount: signupAmount,
            slug: businessSlug,
            referredBy: referralParam && referralParam.startsWith('aff_') ? referralParam : null,
            callback_url: `${window.location.origin}/onboarding?slug=${businessSlug}`,
          }),
        },
        20000
      );

      if (!payRes.ok) {
        const errData = await payRes.json().catch(() => ({}));
        throw new Error(errData.error || `Payment init failed: ${payRes.status}`);
      }

      const payData = await payRes.json();
      if (payData.authorization_url) {
        window.location.href = payData.authorization_url;
        return;
      } else {
        throw new Error(payData.error || 'No authorization URL returned from Paystack.');
      }
    } catch (err) {
      console.error('Payment initialization error:', err.message);
      setError(
        err.message.includes('aborted')
          ? 'Request timed out. Please check your connection and try again.'
          : err.message || 'Failed to start payment. Please try again.'
      );
      setLoading(false);
    }
  };

  return {
    // State
    formValues,
    setFormValues,
    handleChange,
    currentStep,
    steps,
    loading,
    error,
    consent,
    setConsent,
    brandColor,
    setBrandColor,
    logoUrl,
    setLogoUrl,
    banks,
    banksLoading,
    currentTypeFeatures,
    // Navigation
    nextStep,
    prevStep,
    // Submit
    handleSubmit,
    // Helpers
    openUploadWidget,
    generateSlug,
  };
}