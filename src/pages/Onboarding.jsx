// src/pages/Onboarding.jsx
import { useState, useEffect, useCallback, useRef } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { useOnboarding } from '../hooks/useOnboarding';
import OnboardingLayout from '../components/onboarding/OnboardingLayout';
import StepWrapper from '../components/ui/StepWrapper';
import StepSecurity from '../components/onboarding/StepSecurity';
import StepGallery from '../components/onboarding/StepGallery';
import StepServices from '../components/onboarding/StepServices';
import StepProducts from '../components/onboarding/StepProducts';
import StepCars from '../components/onboarding/StepCars';
import StepFood from '../components/onboarding/StepFood';
import StepProperties from '../components/onboarding/StepProperties';
import StepReview from '../components/onboarding/StepReview';
import { getCsrfToken } from '../lib/csrf';

export default function Onboarding() {
  const [searchParams] = useSearchParams();
  const reference = searchParams.get('reference') || searchParams.get('trxref');
  const slugFromUrl = searchParams.get('slug');

  const [paymentVerified, setPaymentVerified] = useState(false);
  const [verifying, setVerifying] = useState(!!reference && !!slugFromUrl);
  const [verifyError, setVerifyError] = useState('');

  // Guard so a double-click on "Retry" (or StrictMode double-mount) can't
  // launch two verification requests simultaneously.
  const verifyInFlight = useRef(false);

  // ─── Run verification against the backend ───
  const runVerification = useCallback(async () => {
    if (verifyInFlight.current) return;         // already in flight
    if (!reference || !slugFromUrl) {
      setVerifying(false);
      setVerifyError('Missing payment reference or business slug. Please complete payment first.');
      return;
    }

    verifyInFlight.current = true;
    setVerifying(true);
    setVerifyError('');                          // clear stale error immediately

    try {
      const res = await fetch('/.netlify/functions/verify-subscription', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          // Sends the CSRF token when one exists. On the signup callback
          // the cookie hasn't been issued yet, so this is a no-op; on a
          // dashboard-return path it's validated. The endpoint itself
          // treats CSRF as optional (see verify-subscription.cjs).
          'X-CSRF-Token': getCsrfToken(),
        },
        body: JSON.stringify({ reference, slug: slugFromUrl }),
      });

      let data = {};
      try {
        data = await res.json();
      } catch {
        // Server returned non-JSON (rare, but possible on 5xx)
        data = { error: 'Unexpected response from server. Please try again.' };
      }

      if (res.ok && data.success) {
        setPaymentVerified(true);
        setVerifyError('');
      } else {
        setVerifyError(data.error || 'Payment verification failed. Please retry.');
      }
    } catch (err) {
      setVerifyError('Network error verifying payment. Please check your connection and retry.');
    } finally {
      setVerifying(false);
      verifyInFlight.current = false;
    }
  }, [reference, slugFromUrl]);

  useEffect(() => {
    runVerification();
  }, [runVerification]);

  const hook = useOnboarding();

  const {
    currentStep,
    steps,
    loading,
    error,
    nextStep,
    prevStep,
    handleSubmit,
    // StepSecurity props
    securityCode,
    setSecurityCode,
    securityQuestion1,
    setSecurityQuestion1,
    securityAnswer1,
    setSecurityAnswer1,
    securityQuestion2,
    setSecurityQuestion2,
    securityAnswer2,
    setSecurityAnswer2,
    accountName,
    setAccountName,
    accountNumber,
    setAccountNumber,
    settlementBankName,
    setSettlementBankName,
    // StepGallery props
    gallery,
    addGroup,
    removeGroup,
    updateGroupName,
    addGalleryImage,
    removeGalleryImage,
    uploadImage,
    // StepServices props
    services,
    addService,
    removeService,
    updateService,
    addServiceImage,
    removeServiceImage,
    // StepProducts props
    products,
    addProduct,
    removeProduct,
    updateProduct,
    updateProductSizes,
    updateProductColors,
    addProductImage,
    removeProductImage,
    // StepCars props
    cars,
    addCar,
    removeCar,
    updateCar,
    setCarImages,
    addCarImage,
    // StepFood props
    foods,
    addFood,
    removeFood,
    updateFood,
    addFoodImage,
    removeFoodImage,
    addAddonGroup,
    removeAddonGroup,
    updateAddonGroup,
    addAddonOption,
    removeAddonOption,
    updateAddonOption,
    // StepProperties props
    properties,
    businessType,
    addProperty,
    removeProperty,
    updateProperty,
    addPropertyImage,
    removePropertyImage,
    // StepReview props
    totalGalleryImages,
    servicesEnabled,
    productsEnabled,
    carsEnabled,
    foodEnabled,
    propertiesEnabled,
    businessName,
    businessSlug,
  } = hook;

  // UI tokens
  const inputBase =
    'w-full bg-zinc-800 border border-zinc-700 text-white text-sm rounded-xl px-4 py-3 placeholder-zinc-400 focus:outline-none focus:border-zinc-500 focus:ring-2 focus:ring-zinc-500 transition-all duration-200';
  const selectBase =
    'w-full appearance-none bg-zinc-800 border border-zinc-700 text-white text-sm rounded-xl px-4 py-3 pr-10 focus:outline-none focus:border-zinc-500 focus:ring-2 focus:ring-zinc-500 transition-all duration-200 cursor-pointer';
  const labelBase = 'block text-sm font-medium text-zinc-200 mb-1.5';
  const sectionTitle = 'text-xs font-semibold text-zinc-300 uppercase tracking-wider mb-2 mt-1';
  const sectionDesc = 'text-xs text-zinc-400 mb-3 -mt-1';

  // ─── Render step content ───
  const renderStepContent = () => {
    const stepProps = {
      inputBase,
      selectBase,
      labelBase,
      sectionTitle,
      sectionDesc,
    };

    switch (currentStep) {
      case 1:
        return (
          <StepSecurity
            {...stepProps}
            securityCode={securityCode}
            setSecurityCode={setSecurityCode}
            securityQuestion1={securityQuestion1}
            setSecurityQuestion1={setSecurityQuestion1}
            securityAnswer1={securityAnswer1}
            setSecurityAnswer1={setSecurityAnswer1}
            securityQuestion2={securityQuestion2}
            setSecurityQuestion2={setSecurityQuestion2}
            securityAnswer2={securityAnswer2}
            setSecurityAnswer2={setSecurityAnswer2}
            accountName={accountName}
            setAccountName={setAccountName}
            accountNumber={accountNumber}
            setAccountNumber={setAccountNumber}
            settlementBankName={settlementBankName}
            setSettlementBankName={setSettlementBankName}
          />
        );
      case 2:
        return (
          <StepGallery
            {...stepProps}
            gallery={gallery}
            addGroup={addGroup}
            removeGroup={removeGroup}
            updateGroupName={updateGroupName}
            addGalleryImage={addGalleryImage}
            removeGalleryImage={removeGalleryImage}
            handleGalleryUpload={(groupId) =>
              uploadImage((url) => addGalleryImage(groupId, url), true, 10)
            }
          />
        );
      case 3:
        if (propertiesEnabled) {
          return (
            <StepProperties
              {...stepProps}
              properties={properties}
              businessType={businessType}
              addProperty={addProperty}
              removeProperty={removeProperty}
              updateProperty={updateProperty}
              addPropertyImage={addPropertyImage}
              removePropertyImage={removePropertyImage}
            />
          );
        }
        if (carsEnabled) {
          return (
            <StepCars
              {...stepProps}
              cars={cars}
              addCar={addCar}
              removeCar={removeCar}
              updateCar={updateCar}
              setCarImages={setCarImages}
              addCarImage={addCarImage}
            />
          );
        }
        if (foodEnabled) {
          return (
            <StepFood
              {...stepProps}
              foods={foods}
              addFood={addFood}
              removeFood={removeFood}
              updateFood={updateFood}
              addFoodImage={addFoodImage}
              removeFoodImage={removeFoodImage}
              addAddonGroup={addAddonGroup}
              removeAddonGroup={removeAddonGroup}
              updateAddonGroup={updateAddonGroup}
              addAddonOption={addAddonOption}
              removeAddonOption={removeAddonOption}
              updateAddonOption={updateAddonOption}
            />
          );
        }
        return (
          <StepServices
            {...stepProps}
            services={services}
            addService={addService}
            removeService={removeService}
            updateService={updateService}
            addServiceImage={addServiceImage}
            removeServiceImage={removeServiceImage}
          />
        );
      case 4:
        if (hook.hasProductsStep) {
          return (
            <StepProducts
              {...stepProps}
              products={products}
              addProduct={addProduct}
              removeProduct={removeProduct}
              updateProduct={updateProduct}
              updateProductSizes={updateProductSizes}
              updateProductColors={updateProductColors}
              addProductImage={addProductImage}
              removeProductImage={removeProductImage}
            />
          );
        }
        return (
          <StepReview
            {...stepProps}
            businessName={businessName}
            businessSlug={businessSlug}
            businessType={businessType}
            gallery={gallery}
            totalGalleryImages={totalGalleryImages}
            services={services}
            products={products}
            cars={cars}
            foods={foods}
            properties={properties}
            servicesEnabled={servicesEnabled}
            productsEnabled={productsEnabled}
            carsEnabled={carsEnabled}
            foodEnabled={foodEnabled}
            propertiesEnabled={propertiesEnabled}
            error={error}
          />
        );
      case 5:
        return (
          <StepReview
            {...stepProps}
            businessName={businessName}
            businessSlug={businessSlug}
            businessType={businessType}
            gallery={gallery}
            totalGalleryImages={totalGalleryImages}
            services={services}
            products={products}
            cars={cars}
            foods={foods}
            properties={properties}
            servicesEnabled={servicesEnabled}
            productsEnabled={productsEnabled}
            carsEnabled={carsEnabled}
            foodEnabled={foodEnabled}
            propertiesEnabled={propertiesEnabled}
            error={error}
          />
        );
      default:
        return null;
    }
  };

  const currentStepData = steps.find((s) => s.id === currentStep) || steps[0];

  // Disable submit if payment not verified, still verifying, or loading
  const isSubmitDisabled = !paymentVerified || verifying || loading;

  // ─── Hard block: no reference/slug at all → don't show a form they can't submit ───
  const missingReference = !reference || !slugFromUrl;

  if (missingReference) {
    return (
      <OnboardingLayout steps={steps} currentStep={currentStep}>
        <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6 text-center">
          <div className="w-14 h-14 mx-auto mb-4 rounded-full bg-zinc-800 flex items-center justify-center">
            <svg className="w-6 h-6 text-zinc-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126z" />
            </svg>
          </div>
          <h2 className="text-lg font-bold text-white mb-2">Payment required</h2>
          <p className="text-sm text-zinc-400 mb-5 leading-relaxed">
            We couldn't find a payment reference in the URL. Please complete the signup
            payment first, then you'll be redirected back here automatically.
          </p>
          <Link
            to="/signup"
            className="inline-block w-full bg-white text-zinc-900 py-3 rounded-xl text-sm font-semibold hover:bg-zinc-200 transition-colors"
          >
            Back to Signup
          </Link>
        </div>
      </OnboardingLayout>
    );
  }

  return (
    <OnboardingLayout steps={steps} currentStep={currentStep}>
      <form onSubmit={handleSubmit}>
        {/* ─── Payment verification error banner ─── */}
        {verifyError && (
          <div className="bg-zinc-800/80 border border-zinc-700 rounded-xl p-4 mb-4">
            <div className="flex items-start gap-3">
              <svg className="w-4 h-4 text-zinc-400 flex-shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126z" />
              </svg>
              <div className="flex-1 min-w-0">
                <p className="text-xs text-zinc-200 leading-relaxed">{verifyError}</p>
                <button
                  type="button"
                  onClick={runVerification}
                  disabled={verifying}
                  className="mt-2 text-[11px] font-semibold text-white underline underline-offset-2 hover:no-underline disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {verifying ? 'Retrying…' : 'Retry verification'}
                </button>
              </div>
            </div>
          </div>
        )}

        <StepWrapper
          title={currentStepData.title}
          description={currentStepData.desc}
          step={currentStep}
          totalSteps={steps.length}
          onPrev={prevStep}
          onNext={nextStep}
          onFinish={handleSubmit}
          loading={loading}
          error={error}
          disabled={isSubmitDisabled}
          submitLabel={
            verifying
              ? 'Verifying payment...'
              : !paymentVerified && verifyError
              ? 'Payment not verified'
              : 'Finish Setup'
          }
        >
          {renderStepContent()}
        </StepWrapper>
      </form>
    </OnboardingLayout>
  );
}