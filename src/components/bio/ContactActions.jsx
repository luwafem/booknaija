import { PhoneIcon, WhatsAppIcon } from '../Icons';

export default function ContactActions({ phone, whatsapp, accent }) {
  const waLink = whatsapp
    ? `https://wa.me/${whatsapp}`
    : `https://wa.me/${phone.replace(/\D/g, '')}`;

  return (
    <div className="px-6 mt-5 flex gap-3">
      <a
        href={`tel:${phone}`}
        className="flex-1 flex items-center justify-center gap-2 py-3 rounded-xl border border-stone-800/60 bg-stone-900/30 text-sm text-stone-300 hover:bg-stone-800/50 transition-all duration-200"
      >
        <PhoneIcon /> Call
      </a>
      <a
        href={waLink}
        target="_blank"
        rel="noreferrer"
        className="flex-1 flex items-center justify-center gap-2 py-3 rounded-xl text-sm font-medium transition-all duration-200 hover:brightness-110"
        style={{ background: `${accent}15`, color: accent, border: `1px solid ${accent}30` }}
      >
        <WhatsAppIcon /> WhatsApp
      </a>
    </div>
  );
}