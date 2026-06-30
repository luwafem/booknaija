// src/components/dashboard/SecurityTab.jsx
export default function SecurityTab({ accent, inp, lbl, card }) {
  return (
    <div className="space-y-6">
      <div className={card}>
        <h3 className="text-sm font-bold text-white tracking-tight mb-4">Change Password</h3>
        <div className="space-y-3">
          <div>
            <label className={lbl}>Current Password</label>
            <input className={inp} type="password" placeholder="Enter current password" />
          </div>
          <div>
            <label className={lbl}>New Password</label>
            <input className={inp} type="password" placeholder="Enter new password" />
          </div>
          <div>
            <label className={lbl}>Confirm New Password</label>
            <input className={inp} type="password" placeholder="Confirm new password" />
          </div>
          <button
            className="w-full text-white font-bold py-3 rounded-full text-[11px] tracking-[0.15em] uppercase transition-all duration-300 hover:brightness-110 active:scale-[0.98]"
            style={{ backgroundColor: accent }}
          >
            Update Password
          </button>
        </div>
      </div>
    </div>
  );
}