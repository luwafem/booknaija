export default function EditBusinessModal({ show, onClose, business, editForm, setEditForm, onSave, saving }) {
  if (!show || !business) return null;

  const handleChange = (field, value) => {
    setEditForm(prev => ({ ...prev, [field]: value }));
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-zinc-900 border border-zinc-800 rounded-2xl w-full max-w-md p-6">
        <h3 className="text-lg font-bold text-white mb-4">Edit Business</h3>
        <div className="space-y-3">
          <input
            type="text"
            placeholder="Name"
            value={editForm.name || ''}
            onChange={e => handleChange('name', e.target.value)}
            className="w-full bg-zinc-800 border border-zinc-700 text-white text-sm rounded-xl px-4 py-2.5 focus:outline-none focus:border-zinc-500"
          />
          <input
            type="email"
            placeholder="Email"
            value={editForm.email || ''}
            onChange={e => handleChange('email', e.target.value)}
            className="w-full bg-zinc-800 border border-zinc-700 text-white text-sm rounded-xl px-4 py-2.5"
          />
          <input
            type="text"
            placeholder="Phone"
            value={editForm.phone || ''}
            onChange={e => handleChange('phone', e.target.value)}
            className="w-full bg-zinc-800 border border-zinc-700 text-white text-sm rounded-xl px-4 py-2.5"
          />
          <input
            type="text"
            placeholder="Location"
            value={editForm.location || ''}
            onChange={e => handleChange('location', e.target.value)}
            className="w-full bg-zinc-800 border border-zinc-700 text-white text-sm rounded-xl px-4 py-2.5"
          />
          <input
            type="text"
            placeholder="Tagline"
            value={editForm.tagline || ''}
            onChange={e => handleChange('tagline', e.target.value)}
            className="w-full bg-zinc-800 border border-zinc-700 text-white text-sm rounded-xl px-4 py-2.5"
          />
          <textarea
            placeholder="Bio"
            value={editForm.bio || ''}
            onChange={e => handleChange('bio', e.target.value)}
            rows="3"
            className="w-full bg-zinc-800 border border-zinc-700 text-white text-sm rounded-xl px-4 py-2.5 resize-none"
          />
          <select
            value={editForm.business_type || ''}
            onChange={e => handleChange('business_type', e.target.value)}
            className="w-full bg-zinc-800 border border-zinc-700 text-white text-sm rounded-xl px-4 py-2.5"
          >
            <option value="">Select Business Type</option>
            <option value="Lash Artist">Lash Artist</option>
            <option value="Hair Stylist">Hair Stylist</option>
            <option value="Makeup Artist">Makeup Artist</option>
            <option value="Nail Technician">Nail Technician</option>
            <option value="Skin Care">Skin Care</option>
            <option value="Fashion">Fashion</option>
            <option value="Restaurant">Restaurant</option>
            <option value="Auto">Auto</option>
            <option value="Real Estate">Real Estate</option>
            <option value="Shortlet">Shortlet</option>
            <option value="Cleaner">Cleaner</option>
            <option value="Tutor">Tutor</option>
            <option value="Other">Other</option>
          </select>
        </div>
        <div className="flex gap-3 mt-6">
          <button
            onClick={onClose}
            className="flex-1 bg-zinc-800 hover:bg-zinc-700 text-white py-2.5 rounded-xl text-sm font-semibold transition-all"
          >
            Cancel
          </button>
          <button
            onClick={onSave}
            disabled={saving}
            className="flex-1 bg-white text-zinc-900 py-2.5 rounded-xl text-sm font-semibold hover:bg-zinc-200 transition-all disabled:opacity-50"
          >
            {saving ? 'Saving...' : 'Save'}
          </button>
        </div>
      </div>
    </div>
  );
}