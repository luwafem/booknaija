import { useState } from 'react';
import { Link } from 'react-router-dom';

export default function Signup() {
  const [done, setDone] = useState(false);

  if (done) {
    return (
      <div className="min-h-screen bg-stone-50 flex items-center justify-center px-6">
        <div className="text-center max-w-md">
          <p className="text-4xl mb-4">✅</p>
          <h2 className="text-xl font-bold">You're on the list!</h2>
          <p className="text-stone-500 mt-2">We'll reach out within 24 hours to set up your page.</p>
          <Link to="/" className="inline-block mt-6 text-purple-700 text-sm">← Home</Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-stone-50 flex items-center justify-center px-6">
      <form onSubmit={(e) => { e.preventDefault(); setDone(true); }}
        className="w-full max-w-sm">
        <h2 className="text-xl font-bold mb-6">List your business</h2>
        <div className="space-y-4">
          <input required placeholder="Business name"
            className="w-full border border-stone-300 rounded px-3 py-2 text-sm" />
          <input required type="email" placeholder="Email"
            className="w-full border border-stone-300 rounded px-3 py-2 text-sm" />
          <input required placeholder="Phone number"
            className="w-full border border-stone-300 rounded px-3 py-2 text-sm" />
          <select required
            className="w-full border border-stone-300 rounded px-3 py-2 text-sm text-stone-600">
            <option value="">Business type</option>
            <option>Lash Artist</option>
            <option>Cleaner</option>
            <option>Tutor</option>
            <option>Hair Stylist</option>
            <option>Makeup Artist</option>
            <option>Other</option>
          </select>
          <button type="submit"
            className="w-full bg-purple-700 text-white py-2 rounded text-sm font-medium">
            Submit
          </button>
        </div>
        <Link to="/" className="inline-block mt-4 text-purple-700 text-sm">← Back</Link>
      </form>
    </div>
  );
}