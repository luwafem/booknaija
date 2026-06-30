// src/components/onboarding/StepReview.jsx
export default function StepReview({
  businessName,
  businessSlug,
  businessType,
  gallery,
  totalGalleryImages,
  services,
  products,
  cars,
  foods,
  properties,
  servicesEnabled,
  productsEnabled,
  carsEnabled,
  foodEnabled,
  propertiesEnabled,
  error,
}) {
  const filteredServices = services.filter(s => s.name);
  const filteredProducts = products.filter(p => p.name);
  const filteredCars = cars.filter(c => c.name);
  const filteredFoods = foods.filter(f => f.name);
  const filteredProperties = properties.filter(p => p.name);

  return (
    <div className="space-y-5">
      <div className="bg-zinc-800/50 rounded-xl p-4 border border-zinc-700">
        <h3 className="text-sm font-semibold text-white mb-3">Review Your Setup</h3>
        <div className="space-y-2 text-sm">
          <div className="flex justify-between py-2 border-b border-zinc-700">
            <span className="text-zinc-400">Business</span>
            <span className="text-white font-medium">{businessName}</span>
          </div>
          <div className="flex justify-between py-2 border-b border-zinc-700">
            <span className="text-zinc-400">Slug</span>
            <span className="text-white font-mono text-xs">{businessSlug}</span>
          </div>
          <div className="flex justify-between py-2 border-b border-zinc-700">
            <span className="text-zinc-400">Type</span>
            <span className="text-white font-medium">{businessType}</span>
          </div>
          <div className="flex justify-between py-2 border-b border-zinc-700">
            <span className="text-zinc-400">Gallery Groups</span>
            <span className="text-white font-medium">{gallery.length} groups ({totalGalleryImages} photos)</span>
          </div>

          {servicesEnabled && (
            <div className="flex justify-between py-2 border-b border-zinc-700">
              <span className="text-zinc-400">Services</span>
              <span className="text-white font-medium">{filteredServices.length} items</span>
            </div>
          )}
          {productsEnabled && (
            <div className="flex justify-between py-2 border-b border-zinc-700">
              <span className="text-zinc-400">Products</span>
              <span className="text-white font-medium">{filteredProducts.length} items</span>
            </div>
          )}
          {carsEnabled && (
            <div className="flex justify-between py-2 border-b border-zinc-700">
              <span className="text-zinc-400">Cars</span>
              <span className="text-white font-medium">{filteredCars.length} vehicles</span>
            </div>
          )}
          {foodEnabled && (
            <div className="flex justify-between py-2 border-b border-zinc-700">
              <span className="text-zinc-400">Menu Items</span>
              <span className="text-white font-medium">{filteredFoods.length} items</span>
            </div>
          )}
          {propertiesEnabled && (
            <div className="flex justify-between py-2 border-b border-zinc-700">
              <span className="text-zinc-400">Properties</span>
              <span className="text-white font-medium">{filteredProperties.length} listings</span>
            </div>
          )}

          <div className="flex justify-between py-2">
            <span className="text-zinc-400">Security</span>
            <span className="text-green-400 font-medium">✓ Configured</span>
          </div>
        </div>
      </div>

      {error && (
        <div className="bg-red-900/40 border border-red-700 rounded-xl p-3">
          <p className="text-xs text-red-300">{error}</p>
        </div>
      )}

      <div className="bg-zinc-800/30 border border-zinc-700 rounded-xl p-4">
        <p className="text-xs text-zinc-400 leading-relaxed">
          By clicking "Finish Setup", you confirm that all information is accurate. Your business will be live within 24 hours after payment verification.
        </p>
      </div>
    </div>
  );
}