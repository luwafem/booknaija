// Static data for the landing page
export const businessCategories = [
  { name: 'Hair Stylist', icon: <path d="M12 3c-1.2 0-2.4.6-3 1.7A3.6 3.6 0 004.6 9c-1.2.7-2 2-2 3.4 0 1.3.7 2.5 1.8 3.2-.1.4-.1.8-.1 1.2 0 2.8 1.9 5.2 4.5 5.9.8.5 1.8.8 2.8.8h1.2c1 0 2-.3 2.8-.8 2.6-.7 4.5-3.1 4.5-5.9 0-.4 0-.8-.1-1.2 1.1-.7 1.8-1.9 1.8-3.2 0-1.4-.8-2.7-2-3.4-.2-1.8-1.4-3.3-3.1-3.9A3.7 3.7 0 0012 3z" />, example: 'booknaija.com/braid-gallery', items: ['Knotless Braids', 'Wig Install', 'Silk Bonnet'] },
  { name: 'Real Estate', icon: <path d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-4 0a1 1 0 01-1-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 01-1 1" />, example: 'booknaija.com/luxury-homes', items: ['Property Listings', 'Book Viewings', 'For Sale / Rent'] },
  { name: 'Lash Artist', icon: <path d="M15 12a3 3 0 11-6 0 3 3 0 016 0z M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />, example: 'booknaija.com/lash-luxe', items: ['Classic Lashes', 'Volume Set', 'Lash Serum'] },
  { name: 'Fashion / Boutique', icon: <path d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />, example: 'booknaija.com/ankara-royale', items: ['Ankara Gowns', 'Ready to Wear', 'Custom Orders'] },
];

export const moreCategories = ['Nail Technician', 'Makeup Artist', 'Skin Care', 'Cleaner', 'Tutor', 'Restaurant', 'Auto Dealer', 'Shortlet / Airbnb'];

export const features = [
  { t: 'Card & Bank Transfer', d: 'Stop chasing money. Clients pay securely via Paystack or Bank Transfer. Get paid upfront, every time.', icon: <path d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" /> },
  { t: 'Product Sales', d: 'Not just bookings. Sell wigs, care products, or merchandise directly from your page.', icon: <path d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" /> },
  { t: 'Google Calendar Sync', d: 'Avoid double-bookings. We automatically block slots when you have personal plans.', icon: <path d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" /> },
  { t: 'Automated Reminders', d: 'We send WhatsApp and Email reminders so your clients never miss an appointment.', icon: <path d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" /> },
  { t: 'Referral Rewards', d: 'Refer 3 friends and get a free month. Unlimited earnings potential.', icon: <path d="M12 8v13m0-13V6a2 2 0 112 2h-2zm0 0V5.5A2.5 2.5 0 109.5 8H12zm-7 4h14M5 12a2 2 0 110-4h14a2 2 0 110 4M5 12v7a2 2 0 002 2h10a2 2 0 002-2v-7" /> },
  { t: 'Bio-Link Ready', d: 'A beautiful, mobile first page designed to look perfect inside Instagram and TikTok.', icon: <path d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" /> },
];

export const steps = [
  { n: '1', t: 'Create Your Business Page', d: 'Add your business name, services, and products. Your professional link will be live within 30 minutes.' },
  { n: '2', t: 'Set Your Availability', d: 'Define your working hours for bookings and manage your product inventory.' },
  { n: '3', t: 'Add to Your Bio', d: 'Paste your unique booknaija.com/yourname link into your Instagram or TikTok bio.' },
];

export const metrics = [
  { value: '24/7', label: 'Bookings & Sales' },
  { value: '0%', label: 'Commission Fees' },
  { value: '₦', label: 'Instant Payments' },
  { value: '100%', label: 'Your Audience' },
];

export const mockItems = [
  { title: 'Knotless Braids', price: '₦25,000', tag: 'Book' },
  { title: 'Silk Bonnet', price: '₦5,000', tag: 'Buy' },
  { title: 'Wig Install', price: '₦10,000', tag: 'Full', disabled: true },
];

export const analyticsData = [
  ['₦1.2M', 'Monthly Revenue'],
  ['84%', 'Repeat Clients'],
  ['324', 'Bookings'],
  ['4.9★', 'Client Rating'],
];

export const paymentSteps = [
  'Client booked appointment',
  'Payment received instantly',
  'Calendar updated automatically',
  'Reminder sent via WhatsApp',
];

export const pricingFeatures = [
  'Sell Services & Products',
  'Card & Bank Transfer Payments',
  'Google Calendar Sync',
  'Listings for any business type',
  'Meta-proof page',
];