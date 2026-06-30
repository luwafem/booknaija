// src/components/onboarding/StepSecurity.jsx
export default function StepSecurity({
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
  inputBase,
  selectBase,
  labelBase,
}) {
  return (
    <div className="space-y-5">
      <div>
        <label className={labelBase}>4-Digit Security Code *</label>
        <input
          className={inputBase + " font-mono tracking-widest text-center text-xl"}
          placeholder="••••"
          type="password"
          maxLength={4}
          inputMode="numeric"
          value={securityCode}
          onChange={e => setSecurityCode(e.target.value.replace(/\D/g, ''))}
          autoFocus
        />
        <p className="text-xs text-zinc-500 mt-1.5">You'll use this to access your dashboard</p>
      </div>

      <div className="border-t border-zinc-800 pt-5">
        <label className={labelBase}>Security Question 1 *</label>
        <select className={selectBase} value={securityQuestion1} onChange={e => setSecurityQuestion1(e.target.value)}>
          <option value="" disabled className="bg-zinc-800">Select a question...</option>
          <option value="What is your pet's name?" className="bg-zinc-800">What is your pet's name?</option>
          <option value="What city were you born in?" className="bg-zinc-800">What city were you born in?</option>
          <option value="What is your mother's maiden name?" className="bg-zinc-800">What is your mother's maiden name?</option>
          <option value="What was the name of your first school?" className="bg-zinc-800">What was the name of your first school?</option>
        </select>
        <input
          className={inputBase + " mt-2"}
          placeholder="Your answer"
          value={securityAnswer1}
          onChange={e => setSecurityAnswer1(e.target.value)}
        />
      </div>

      <div>
        <label className={labelBase}>Security Question 2 *</label>
        <select className={selectBase} value={securityQuestion2} onChange={e => setSecurityQuestion2(e.target.value)}>
          <option value="" disabled className="bg-zinc-800">Select a question...</option>
          <option value="What is your favorite childhood movie?" className="bg-zinc-800">What is your favorite childhood movie?</option>
          <option value="What street did you grow up on?" className="bg-zinc-800">What street did you grow up on?</option>
          <option value="What is the name of your best friend?" className="bg-zinc-800">What is the name of your best friend?</option>
          <option value="What was your first car?" className="bg-zinc-800">What was your first car?</option>
        </select>
        <input
          className={inputBase + " mt-2"}
          placeholder="Your answer"
          value={securityAnswer2}
          onChange={e => setSecurityAnswer2(e.target.value)}
        />
      </div>

      <div className="border-t border-zinc-800 pt-5 mt-6">
        <p className="text-sm font-bold text-zinc-200 mb-4">Banking Details (for Offline Transfers)</p>
        <div className="space-y-3">
          <div>
            <label className={labelBase}>Bank Name</label>
            <input
              className={inputBase}
              placeholder="e.g. Zenith Bank"
              value={settlementBankName}
              onChange={e => setSettlementBankName(e.target.value)}
            />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div>
              <label className={labelBase}>Account Name</label>
              <input
                className={inputBase}
                placeholder="Business Account Name"
                value={accountName}
                onChange={e => setAccountName(e.target.value)}
              />
            </div>
            <div>
              <label className={labelBase}>Account Number</label>
              <input
                className={inputBase}
                placeholder="10 Digit Number"
                maxLength={10}
                value={accountNumber}
                onChange={e => setAccountNumber(e.target.value.replace(/\D/g, ''))}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}