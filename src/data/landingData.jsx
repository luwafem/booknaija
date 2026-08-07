// src/data/landingData.jsx
export const features = [
  {
    t: 'Always Online',
    d: 'Your page never goes down. Even if social media bans you, your business stays live.',
    icon: <path d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
  },
  {
    t: 'Instant Payments',
    d: 'Clients pay via card or bank transfer upfront. No more chasing DMs for money.',
    icon: <path d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
  },
  {
    t: 'Google Maps Ready',
    d: 'Get found by customers searching "near me". Claim your Google Business Profile in minutes.',
    icon: <path d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
  },
  {
    t: 'No Commissions',
    d: 'Keep 100% of what you earn. ₦2,500/month flat fee. Cancel anytime.',
    icon: <path d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
  },
];

export const steps = [
  { n: '01', t: 'Set up your page', d: 'Add your business name, services, and products. No tech skills needed.' },
  { n: '02', t: 'Customize & verify', d: 'Choose your colors, upload photos, and verify your bank details.' },
  { n: '03', t: 'Share your link', d: 'Paste your unique URL in your bio and start getting paid instantly.' },
];

export const metrics = [
  { value: '500+', label: 'Businesses' },
  { value: '₦2.5M+', label: 'Processed' },
  { value: '24/7', label: 'Uptime' },
  { value: '0%', label: 'Commission' },
];

export const businessCategories = [
  'Lash Artist', 'Hair Stylist', 'Makeup Artist', 'Nail Technician',
  'Skin Care', 'Fashion', 'Restaurant', 'Auto Dealer',
  'Real Estate', 'Shortlet', 'Cleaner', 'Tutor'
];

export const testimonials = [
  {
    name: 'Tolu A.',
    role: 'Lash Artist, Lagos',
    text: 'I used to chase clients for payment. Now they pay instantly before I even pick up my tweezers. Game changer.'
  },
  {
    name: 'Emeka O.',
    role: 'Car Dealer, Abuja',
    text: 'My page is always live. Even when Instagram took down my account, my customers could still book and pay.'
  },
  {
    name: 'Chioma N.',
    role: 'Restaurant Owner, Port Harcourt',
    text: 'I get orders while I sleep. The Google Maps listing brought in customers I never would have reached.'
  }
];

// For editorial look, we can add a featured quote
export const featuredQuote = {
  text: 'Your business shouldn\'t disappear when social media glitches.',
  author: '— Five9, 2025'
};