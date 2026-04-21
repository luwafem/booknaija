import { Link } from 'react-router-dom';

export default function Legal({ type }) {
  const isTerms = type === 'terms';

  return (
    <div className="min-h-screen bg-stone-50 px-6 py-8 max-w-lg mx-auto text-stone-800">
      <Link to="/" className="text-purple-700 text-sm">← Home</Link>
      
      <h1 className="text-xl font-bold mt-6">
        {isTerms ? 'Terms of Service' : 'Privacy Policy'}
      </h1>

      <div className="mt-4 text-sm text-stone-500 space-y-3">
        {isTerms ? (
          <>
            <p>By using BookNaija, you agree to these terms.</p>
            <p>Businesses are responsible for their own services and schedules. BookNaija only provides the booking infrastructure.</p>
            <p>Payments are processed directly by Paystack and go straight to the business. BookNaija never holds or touches your money.</p>
            <p>We reserve the right to remove any business listing that violates our platform rules or engages in fraudulent activity.</p>
          </>
        ) : (
          <>
            <p>Your privacy is important to us.</p>
            <p>When you book a service, we collect only the info necessary for the booking (name, email, phone). This data is shared directly with the business you booked with.</p>
            <p>We do not sell your personal data to third parties.</p>
            <p>Booking details are securely added to the business's Google Calendar and are not stored on our servers.</p>
          </>
        )}
      </div>
    </div>
  );
}