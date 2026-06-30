// src/components/ui/StepWrapper.jsx
export default function StepWrapper({
  children,
  title,
  description,
  step,
  totalSteps,
  onPrev,
  onNext,
  onFinish,
  loading,
  error,
  submitLabel = 'Finish Setup',
}) {
  return (
    <div>
      {/* Step content */}
      {children}

      {/* Error display */}
      {error && (
        <div className="bg-red-900/40 border border-red-700 rounded-xl p-3 mt-4">
          <p className="text-xs text-red-300">{error}</p>
        </div>
      )}

      {/* Navigation buttons */}
      <div className="flex gap-3 mt-6 pt-4 border-t border-zinc-800">
        {step > 1 && (
          <button
            type="button"
            onClick={onPrev}
            className="flex-1 bg-zinc-700 hover:bg-zinc-600 text-white py-3 rounded-xl text-sm font-semibold transition-all"
          >
            Back
          </button>
        )}

        {step < totalSteps ? (
          <button
            type="button"
            onClick={onNext}
            className="flex-1 bg-white hover:bg-zinc-200 text-zinc-900 py-3 rounded-xl text-sm font-semibold transition-all"
          >
            Continue
          </button>
        ) : (
          <button
            type="button"
            onClick={onFinish}
            disabled={loading}
            className="flex-1 bg-white hover:bg-zinc-200 text-zinc-900 py-3 rounded-xl text-sm font-semibold transition-all disabled:bg-zinc-700 disabled:text-zinc-400 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {loading ? (
              <>
                <svg className="w-4 h-4 animate-spin" viewBox="0 0 24 24" fill="none">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                </svg>
                {submitLabel === 'Finish Setup' ? 'Saving...' : 'Processing...'}
              </>
            ) : (
              submitLabel
            )}
          </button>
        )}
      </div>
    </div>
  );
}