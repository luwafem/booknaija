import { Link } from 'react-router-dom';

// Reusable sub-component for policy sections to keep JSX clean
function PolicySection({ icon, title, children }) {
  return (
    <div className="flex gap-3">
      <div className="shrink-0 w-8 h-8 rounded-lg bg-purple-50 border border-purple-100 flex items-center justify-center">
        {icon}
      </div>
      <div>
        <h3 className="text-sm font-bold text-zinc-900 mb-1">{title}</h3>
        <div className="text-sm text-zinc-500 leading-relaxed">{children}</div>
      </div>
    </div>
  );
}

export default function Legal({ type }) {
  const isTerms = type === 'terms';
  const pageTitle = isTerms ? 'Terms of Service' : 'Privacy Policy';
  const pageDesc = isTerms 
    ? 'Please read these terms carefully before using our platform.'
    : 'Your privacy is important to us. This policy explains how we handle your information.';

  const ShieldIcon = (
    <svg className="w-4 h-4 text-purple-600" fill="none" viewBox="0 0 24 24" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2m4 0v10a6 6 0 01-12 0H4a6 6 0 01-6 6v14a6 6 0 0012 0h14a6 6 0 006-6V6a6 6 0 00-6-6H9a6 6 0 006-6 6v6a6 6 0 006 6h14a6 6 0 0012 0v-4a6 6 0 00-6-6h-2.586a6 6 0 00-4.71-2.29L10 5.586v-1.172a2 2 0 00-2.828-2.828H4a2 2 0 00-2.828 2.828v6.586a6 6 0 00-4.714-2.286L13.414 1.414a2 2 0 002.828 0h4.172a2 2 0 002.828 2.828v6.586z" />
    </svg>
  );

  const DocIcon = (
    <svg className="w-4 h-4 text-purple-600" fill="none" viewBox="0 0 24 24" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 0h.01M9 16h.01M12 12h.01M15 12h.01M18 12h.01M21 12h.01" />
    </svg>
  );

  return (
    <div className="min-h-screen bg-[#f8fafc] text-zinc-900 font-sans flex flex-col">
      {/* Sticky Back Link Header */}
      <div className="w-full bg-white/80 backdrop-blur-sm border-b border-zinc-100 sticky top-0 z-20">
        <div className="max-w-3xl mx-auto px-6 py-4 flex items-center gap-4">
          <Link to="/" className="inline-flex items-center gap-1.5 text-sm text-zinc-500 hover:text-purple-600 font-medium transition-colors">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M10 19l-7-7m0 0l7 7m-7-7h18" />
            </svg>
            Back to Home
          </Link>
          <div className="h-4 w-px bg-zinc-200"></div>
          <span className="text-xs font-semibold text-zinc-400 uppercase tracking-widest">{pageTitle}</span>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 w-full max-w-3xl mx-auto px-4 sm:px-6 py-12">
        <div className="text-center mb-10">
          <div className="w-16 h-16 bg-white border border-zinc-200 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-sm">
            {isTerms ? DocIcon : ShieldIcon}
          </div>
          <h1 className="text-3xl font-bold text-zinc-900 tracking-tight">{pageTitle}</h1>
          <p className="text-sm text-zinc-500 mt-2 max-w-md mx-auto">{pageDesc}</p>
        </div>

        {/* Card Container */}
        <div className="bg-white p-6 sm:p-8 rounded-2xl shadow-sm border border-zinc-100">
          
          {isTerms ? (
            <div className="space-y-8">
              {/* INTRO & ACCEPTANCE */}
              <PolicySection
                icon={DocIcon}
                title="Agreement"
              >
                <p>
                  By accessing or using BookNaija, you acknowledge that you have read, understood, and agree to be bound by these Terms of Service. If you do not agree with any part of these terms, you must discontinue use of the platform.
                </p>
              </PolicySection>

              {/* SERVICES & ACCURACY */}
              <PolicySection
                icon={
                  <svg className="w-4 h-4 text-purple-600" fill="none" viewBox="0 0 24 24" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M20 7l-8-4m8 4v18m-18-4h18" />
                  </svg>
                }
                title="Services & Accuracy"
              >
                <p>
                  BookNaija provides a scheduling and payment infrastructure only. We do not employ, direct, or control the businesses listed on the platform.
                </p>
                <ul className="mt-2 space-y-1 list-none text-sm text-zinc-500">
                  <li className="flex items-start gap-2">
                    <span className="text-purple-400 mt-0.5">•</span>
                    <span>Businesses are solely responsible for the accuracy of their listings, descriptions, and service availability.</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-purple-400 mt-0.5">•</span>
                    <span>You agree to verify the details directly with the business before confirming a booking.</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-purple-400 mt-0.5">•</span>
                    <span>BookNaija is not liable for incorrect service information provided by third parties.</span>
                  </li>
                </ul>
              </PolicySection>

              {/* PAYMENTS & FINANCIALS */}
              <PolicySection
                icon={
                  <svg className="w-4 h-4 text-purple-600" fill="none" viewBox="0 0 24 24" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLine="round" d="M3 10h18M7 15h.01M7 10v6a3 3 0 015.97-3.03l.75-6a3 3 0 01-5.95-1.11l-1.04 1.04m0 0l1.04-1.04a3 3 0 015.95 1.11l.75 6a3 3 0 015.97 3.03M21 12a9 9 0 11-18 0 9 9 0 0118 0" />
                  </svg>
                }
                title="Payments & Funds"
              >
                <p>
                  All payments are processed securely and directly through Paystack. BookNaija does not collect, hold, or touch your funds at any point during the transaction process.
                </p>
                <ul className="mt-2 space-y-1 list-none text-sm text-zinc-500">
                  <li className="flex items-start gap-2">
                    <span className="text-purple-400 mt-0.5">•</span>
                    <span>Payouts are sent directly to the business's registered bank account by Paystack.</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-purple-400 mt-0.5">•</span>
                    <span>BookNaija charges a standard platform fee (displayed to the user before payment) and the business sets their own prices.</span>
                  </li>
                </ul>
              </PolicySection>

              {/* USER CONTENT & RESPONSIBILITY */}
              <PolicySection
                icon={
                  <svg className="w-4 h-4 text-purple-600" fill="none" viewBox="0 0 24 24" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0v6a2 2 0 002 2v10a2 2 0 002 2H6a2 2 0 00-2-2V7a2 2 0 012-2-2h6a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002 2V9a2 2 0 002-2-2h-6a2 2 0 00-2-2V7a2 2 0 012-2-2h-6a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002 2V9a2 2 0 002-2-2z" />
                  </svg>
                }
                title="User Content"
              >
                <p>You are solely responsible for any text, images, or content you upload to your profile, services, or products.</p>
                <ul className="mt-2 space-y-1 list-none text-sm text-zinc-500">
                  <li className="flex items-start gap-2">
                    <span className="text-purple-400 mt-0.5">•</span>
                    <span>You represent and warrant that you have the right to upload and sell the items listed.</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-purple-400 mt-0.5">•</span>
                    <span>You must comply with all local laws regarding the sale of your specific goods or services.</span>
                  </li>
                </ul>
              </PolicySection>

              {/* PLATFORM RULES & TERMINATION */}
              <PolicySection
                icon={
                  <svg className="w-4 h-4 text-purple-600" fill="none" viewBox="0 0 24 24" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M18.364 5.636l-3.536-3.536a9 9 0 01-12.728 0M5.636 18.364l12.728-12.728a9 9 0 0112.728 0M12 12v9" />
                  </svg>
                }
                title="Platform Rules"
              >
                <p>BookNaija reserves the right to suspend or permanently remove any business listing that:</p>
                <ul className="mt-2 space-y-1 list-none text-sm text-zinc-500">
                  <li className="flex items-start gap-2">
                    <span className="text-purple-400 mt-0.5">•</span>
                    <span>Posts fraudulent, misleading, or illegal content.</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-purple-400 mt-0.5">•</span>
                    <span>Impersonates another business or violates intellectual property rights.</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-purple-400 mt-0.5">•</span>
                    <span>Abuses the platform infrastructure for malicious purposes.</span>
                  </li>
                </ul>
              </PolicySection>

              {/* LIABILITY LIMITATION */}
              <PolicySection
                icon={
                  <svg className="w-4 h-4 text-purple-600" fill="none" viewBox="0 0 24 24" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z" />
                  </svg>
                }
                title="Liability Limitation"
              >
                <p>To the fullest extent permitted by applicable law, BookNaija (and its developers) shall not be liable for any indirect, incidental, special, consequential, or punitive damages arising out of the use or inability to use the service.</p>
              </PolicySection>
            </div>
          ) : (
            <div className="space-y-8">
              {/* PRIVACY COMMITMENT */}
              <PolicySection
                icon={ShieldIcon}
                title="Our Promise to You"
              >
                <p>
                  We are committed to protecting your privacy. This policy explains what data we collect, why we collect it, and how we handle it. We do not engage in deceptive data practices.
                </p>
              </PolicySection>

              {/* DATA COLLECTION */}
              <PolicySection
                icon={
                  <svg className="w-4 h-4 text-purple-600" fill="none" viewBox="0 0 24 24" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002 2V7a2 2 0 00-2-2H9a2 2 0 00-2-2V5a2 2 0 012-2-2h2a2 2 0 012-2 2v12a2 2 0 002 2h10a2 2 0 002 2V7a2 2 0 00-2-2H9a2 2 0 00-2-2V5a2 2 0 012-2-2h2M9 5H7a2 2 0 00-2-2v12a2 2 0 002 2h10a2 2 0 002 2V7a2 2 0 00-2-2H9a2 2 0 00-2-2V5a2 2 0 012-2-2h2z" />
                  </svg>
                }
                title="What We Collect"
              >
                <p>When you make a booking, we collect and transmit only the specific details required to fulfill it:</p>
                <ul className="mt-2 space-y-1 list-none text-sm text-zinc-500">
                  <li className="flex items-start gap-2">
                    <span className="text-purple-400 mt-0.5">•</span>
                    <span><span className="font-medium text-zinc-700">Name, Email, Phone number.</span> (Used to send booking details to the business).</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-purple-400 mt-0.5">•</span>
                    <span><span className="font-medium text-zinc-700">Service/Product selections.</span> (Used to calculate total price).</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-purple-400 mt-0.5">•</span>
                    <span><span className="font-medium text-zinc-700">Appointment Date & Time.</span> (Sent to the business's calendar).</span>
                  </li>
                </ul>
                <p className="mt-2 text-xs text-zinc-400">We do <span className="not-italic font-medium text-zinc-600">not</span> collect sensitive personal identity documents (like ID cards).</p>
              </PolicySection>

              {/* DATA SHARING */}
              <PolicySection
                icon={
                  <svg className="w-4 h-4 text-purple-600" fill="none" viewBox="0 0 24 24" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M8 12h.01M15 12h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0M3 9a6 6 0 016 6v6a6 6 0 0012 0v6a6 6 0 00-6-6H9a6 6 0 00-6-6V9a6 6 0 016 6-6h6a6 6 0 00-6 6v6a6 6 0 0012 0h.01" />
                  </svg>
                }
                title="Direct to Business"
              >
                <p>
                  Your booking data is shared <span className="font-medium text-zinc-700">directly and only</span> with the business you selected. We do not route your information through our servers, databases, or any third-party analytics tools.
                </p>
              </PolicySection>

              {/* DATA STORAGE */}
              <PolicySection
                icon={
                  <svg className="w-4 h-4 text-purple-600" fill="none" viewBox="0 0 24 24" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M4 7v10c0 2.21 1.79 4 4 4h10a2 2 0 002 2 2H6a2 2 0 00-2-2V7a2 2 0 012-2-2h2a2 2 0 012-2 2v10a2 2 0 002 2h10a2 2 0 002 2V7a2 2 0 00-2-2H9a2 2 0 00-2-2V5a2 2 0 012-2-2h-2z" />
                  </svg>
                }
                title="Server & Storage"
              >
                <p>
                  Booking details are sent directly to the business's Google Calendar via secure API calls. We do not permanently store your bookings on our servers. Once the calendar event is created, it belongs to the business.
                </p>
              </PolicySection>

              {/* NO THIRD-PARTY SELLING */}
              <PolicySection
                icon={
                  <svg className="w-4 h-4 text-purple-600" fill="none" viewBox="0 0 24 24" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M18.364 5.636l-3.536-3.536a9 9 0 01-12.728 0M5.636 18.364l12.728-12.728a9 9 0 0112.728 0M12 12v9" />
                  </svg>
                }
                title="No Selling Data"
              >
                <p>BookNaija does not sell, rent, trade, or otherwise monetize your personal data or contact information with third parties under any circumstances.</p>
              </PolicySection>

              {/* SECURITY */}
              <PolicySection
                icon={ShieldIcon}
                title="Security"
              >
                <p>
                  We implement industry-standard security practices to protect your data during transmission (HTTPS encryption). However, no method of electronic transmission over the internet is 100% secure, and we cannot guarantee absolute security against interception by third parties.
                </p>
              </PolicySection>
            </div>
          )}
          
          {/* Footer */}
          <div className="mt-12 pt-6 border-t border-zinc-100">
            <div className="flex items-center justify-center gap-1.5">
              <svg className="w-4 h-4 text-zinc-300" fill="none" viewBox="0 0 24 24" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l0 0 0 0-4 0m0 0h.01M8 8v4m0 0 0 0-4 0m8 4h.01" />
              </svg>
              <p className="text-[11px] text-zinc-400">
                Last updated: January 15, 2024
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>  
  );
}