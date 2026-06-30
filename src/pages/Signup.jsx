// src/pages/Signup.jsx
import { useSignup } from '../hooks/useSignup';
import SignupLayout from '../components/signup/SignupLayout';
import StepWrapper from '../components/ui/StepWrapper';
import StepBusinessInfo from '../components/signup/StepBusinessInfo';
import StepProfile from '../components/signup/StepProfile';
import StepBranding from '../components/signup/StepBranding';
import StepServicesSocial from '../components/signup/StepServicesSocial';
import StepPayout from '../components/signup/StepPayout';

export default function Signup() {
  const {
    formValues,
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
    nextStep,
    prevStep,
    handleSubmit,
    openUploadWidget,
  } = useSignup();

  const inputBase =
    'w-full bg-zinc-800 border border-zinc-700 text-white text-sm rounded-xl px-4 py-3 placeholder-zinc-400 focus:outline-none focus:border-zinc-500 focus:ring-2 focus:ring-zinc-500 transition-all duration-200';
  const selectBase =
    'w-full appearance-none bg-zinc-800 border border-zinc-700 text-white text-sm rounded-xl px-4 py-3 pr-10 focus:outline-none focus:border-zinc-500 focus:ring-2 focus:ring-zinc-500 transition-all duration-200 cursor-pointer';
  const labelBase = 'block text-sm font-medium text-zinc-200 mb-1.5';
  const sectionTitle = 'text-xs font-semibold text-zinc-300 uppercase tracking-wider mb-2 mt-1';
  const sectionDesc = 'text-xs text-zinc-400 mb-3 -mt-1';

  const renderStep = () => {
    const stepProps = { inputBase, selectBase, labelBase, sectionTitle, sectionDesc };

    switch (currentStep) {
      case 1:
        return (
          <StepBusinessInfo
            {...stepProps}
            formValues={formValues}
            handleChange={handleChange}
            currentTypeFeatures={currentTypeFeatures}
          />
        );
      case 2:
        return (
          <StepProfile
            {...stepProps}
            formValues={formValues}
            handleChange={handleChange}
          />
        );
      case 3:
        return (
          <StepBranding
            {...stepProps}
            logoUrl={logoUrl}
            openUploadWidget={openUploadWidget}
            brandColor={brandColor}
            setBrandColor={setBrandColor}
            setLogoUrl={setLogoUrl}
          />
        );
      case 4:
        return (
          <StepServicesSocial
            {...stepProps}
            formValues={formValues}
            handleChange={handleChange}
            currentTypeFeatures={currentTypeFeatures}
          />
        );
      case 5:
        return (
          <StepPayout
            {...stepProps}
            formValues={formValues}
            handleChange={handleChange}
            consent={consent}
            setConsent={setConsent}
            banks={banks}
            banksLoading={banksLoading}
            error={error}
          />
        );
      default:
        return null;
    }
  };

  const currentStepData = steps.find((s) => s.id === currentStep) || steps[0];

  return (
    <SignupLayout steps={steps} currentStep={currentStep}>
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
        submitLabel="Pay ₦2,500 to Get Started"
      >
        {renderStep()}
      </StepWrapper>
    </SignupLayout>
  );
}