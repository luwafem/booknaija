import { InstagramIcon, TikTokIcon } from '../Icons';

const links = [
  { key: 'instagram', Icon: InstagramIcon },
  { key: 'tiktok', Icon: TikTokIcon },
];

export default function SocialLinks({ socials, accent }) {
  const visible = links.filter(({ key }) => socials?.[key]);
  if (!visible.length) return null;

  return (
    <div className="px-6 mt-5 flex gap-2.5">
      {visible.map(({ key, Icon }) => (
        <a
          key={key}
          href={socials[key]}
          target="_blank"
          rel="noreferrer"
          className="w-10 h-10 rounded-xl border border-stone-800/60 bg-stone-900/50 flex items-center justify-center text-stone-500 hover:text-white hover:border-stone-700 transition-all duration-200"
        >
          <Icon />
        </a>
      ))}
    </div>
  );
}