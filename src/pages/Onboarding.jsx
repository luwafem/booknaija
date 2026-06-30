// src/pages/Onboarding.jsx
import { useOnboarding } from '../hooks/useOnboarding';
import OnboardingLayout from '../components/onboarding/OnboardingLayout';
import StepWrapper from '../components/ui/StepWrapper'; // ✅ shared component
import StepSecurity from '../components/onboarding/StepSecurity';
import StepGallery from '../components/onboarding/StepGallery';
import StepServices from '../components/onboarding/StepServices';
import StepProducts from '../components/onboarding/StepProducts';
import StepCars from '../components/onboarding/StepCars';
import StepFood from '../components/onboarding/StepFood';
import StepProperties from '../components/onboarding/StepProperties';
import StepReview from '../components/onboarding/StepReview';

export default function Onboarding() {
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

  // UI tokens (moved to a separate file in practice, but kept here for clarity)
  const inputBase =
    'w-full bg-zinc-800 border border-zinc-700 text-white text-sm rounded-xl px-4 py-3 placeholder-zinc-400 focus:outline-none focus:border-zinc-500 focus:ring-2 focus:ring-zinc-500 transition-all duration-200';
  const selectBase =
    'w-full appearance-none bg-zinc-800 border border-zinc-700 text-white text-sm rounded-xl px-4 py-3 pr-10 focus:outline-none focus:border-zinc-500 focus:ring-2 focus:ring-zinc-500 transition-all duration-200 cursor-pointer';
  const labelBase = 'block text-sm font-medium text-zinc-200 mb-1.5';
  const sectionTitle = 'text-xs font-semibold text-zinc-300 uppercase tracking-wider mb-2 mt-1';
  const sectionDesc = 'text-xs text-zinc-400 mb-3 -mt-1';

  // Determine which step content to render
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

  return (
    <OnboardingLayout steps={steps} currentStep={currentStep}>
      <form onSubmit={handleSubmit}>
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
          // submitLabel defaults to "Finish Setup" – we can leave it out
        >
          {renderStepContent()}
        </StepWrapper>
      </form>
    </OnboardingLayout>
  );
}