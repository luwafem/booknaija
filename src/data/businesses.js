// PUBLIC business configs — NO secrets here
const businesses = {
  'glamour-lash': {
    name: 'Glamour Lash Studio',
    slug: 'glamour-lash',
    logo:'',
    tagline: 'Premium lash extensions in Lagos',
    bio: 'Certified lash artist with 5+ years experience. Specialising in classic, volume & mega volume techniques for a natural, fluttery look.',
    phone: '+234 812 345 6789',
    whatsapp: '2348123456789',
    location: 'Lekki Phase 1, Lagos',
    hours: 'Mon–Sat, 9 AM – 6 PM',
    accent: '#c8a97e',
    avatar: '',
    hero: 'https://picsum.photos/seed/glamour-hero/800/600',
    gallery: [
      { group: 'Classic Lashes', images: ['https://picsum.photos/seed/lash-cl-1/600/600','https://picsum.photos/seed/lash-cl-2/600/600','https://picsum.photos/seed/lash-cl-3/600/600'] },
      { group: 'Volume & Mega', images: ['https://picsum.photos/seed/lash-vol-1/600/600','https://picsum.photos/seed/lash-vol-2/600/600','https://picsum.photos/seed/lash-vol-3/600/600'] },
    ],
    socials: { instagram: 'https://instagram.com/glamourlashlagos', tiktok: 'https://tiktok.com/@glamourlashlagos' },
    paystackPublicKey: 'pk_test_129628160c0fdb0e1e837751e5ff0233872676b8',
    calendarId: 'd1863c6bf333e670957c47e53bdbc60b77303177fdcefce487cbd05e6d14edfc@group.calendar.google.com',
    active: true, servicesEnabled: true, productsEnabled: true,
    services: [
      { 
        id: 'classic', name: 'Classic Lash Set', duration: '2 hrs', price: 15000, image: 'https://picsum.photos/seed/classic-thumb/200/200', 
        images: ['https://picsum.photos/seed/classic-1/400/400','https://picsum.photos/seed/classic-2/400/400','https://picsum.photos/seed/classic-3/400/400'],
        showDetails: true,
        description: 'A natural, polished look using a single extension applied to each isolated natural lash. Perfect for a subtle enhancement or clients new to lashes.'
      },
      { 
        id: 'volume', name: 'Volume Lash Set', duration: '2.5 hrs', price: 25000, image: 'https://picsum.photos/seed/volume-thumb/200/200', 
        images: ['https://picsum.photos/seed/vol-1/400/400','https://picsum.photos/seed/vol-2/400/400','https://picsum.photos/seed/vol-3/400/400'],
        showDetails: true,
        description: 'Handmade fans of ultra-fine lashes attached to each natural lash for a fluffy, fuller appearance. Lightweight and dramatic.'
      },
      { 
        id: 'mega', name: 'Mega Volume Set', duration: '3 hrs', price: 35000, image: 'https://picsum.photos/seed/mega-thumb/200/200', 
        images: ['https://picsum.photos/seed/mega-1/400/400','https://picsum.photos/seed/mega-2/400/400'],
        showDetails: true,
        description: 'The ultimate statement look. Ultra-fine lashes are fanned out densely to create extreme volume and a bold, glamorous finish.'
      },
      { 
        id: 'removal', name: 'Lash Removal', duration: '30 min', price: 3000, image: '', 
        showDetails: false // Details disabled for this service
      },
    ],
    products: [
      { 
        id: 'serum', name: 'Lash Growth Serum', price: 5000, image: 'https://picsum.photos/seed/serum-prod/400/400',
        showDetails: true,
        description: 'Peptide-infused serum to nourish follicles and promote natural lash growth. Apply daily to clean lash lines.'
      },
      { id: 'glue', name: 'Lash Adhesive (5g)', price: 3500, image: 'https://picsum.photos/seed/glue-prod/400/400', showDetails: false },
    ],
  },

  'velvet-nails': {
    name: 'Velvet Nail Bar',
    slug: 'velvet-nails',
    logo:'',
    tagline: 'Luxury nail art & manicures in Lekki',
    bio: 'Your go-to nail studio for flawless acrylics, gel extensions, and hand-painted nail art. Walk in fierce, walk out flawless.',
    phone: '+234 809 876 5432',
    whatsapp: '2348098765432',
    location: 'Admiralty Way, Lekki Phase 1, Lagos',
    hours: 'Tue–Sun, 10 AM – 7 PM',
    accent: '#c97b8b',
    avatar: '',
    hero: 'https://picsum.photos/seed/velvet-hero/800/600',
    gallery: [
      { group: 'Acrylics & Gels', images: ['https://picsum.photos/seed/nail-ac-1/600/600','https://picsum.photos/seed/nail-ac-2/600/600','https://picsum.photos/seed/nail-ac-3/600/600'] },
      { group: 'Custom Art', images: ['https://picsum.photos/seed/nail-art-1/600/600','https://picsum.photos/seed/nail-art-2/600/600','https://picsum.photos/seed/nail-art-3/600/600'] },
    ],
    socials: { instagram: 'https://instagram.com/velvetnailslekki', tiktok: 'https://tiktok.com/@velvetnailslekki' },
    paystackPublicKey: 'pk_test_a4b8c2d0e6f18294a7b3c5d6e8f0a1b2c4d6e8f0',
    calendarId: 'e2f4a6c8d0b2a4e6f8a0c2e4b6d8f0a2c4e6b8d0f2a4c6e8b0d2f4a6c8e0b2d4@group.calendar.google.com',
    active: true, servicesEnabled: true, productsEnabled: true,
    services: [
      { id: 'gel-manicure', name: 'Gel Manicure', duration: '1 hr', price: 8000, image: 'https://picsum.photos/seed/gel-thumb/200/200', images: ['https://picsum.photos/seed/gel-1/400/400'], showDetails: false },
      { id: 'acrylic-full', name: 'Acrylic Full Set', duration: '2 hrs', price: 18000, image: 'https://picsum.photos/seed/acrylic-thumb/200/200', images: ['https://picsum.photos/seed/acrylic-1/400/400','https://picsum.photos/seed/acrylic-2/400/400'], showDetails: true, description: 'Full coverage using liquid monomer and polymer powder. Sculpted to your desired shape and length.' },
      { id: 'acrylic-fill', name: 'Acrylic Fill', duration: '1.5 hrs', price: 12000, image: 'https://picsum.photos/seed/fill-thumb/200/200', images: [], showDetails: false },
      { id: 'nail-art', name: 'Custom Nail Art (per hand)', duration: '45 min', price: 5000, image: 'https://picsum.photos/seed/art-thumb/200/200', images: ['https://picsum.photos/seed/art-1/400/400','https://picsum.photos/seed/art-2/400/400','https://picsum.photos/seed/art-3/400/400'], showDetails: true, description: 'Hand-painted designs, chrome finishes, or encapsulated charms. Price is per hand; added to any base service.' },
      { id: 'pedicure', name: 'Luxury Pedicure', duration: '1.5 hrs', price: 10000, image: '', showDetails: false },
      { id: 'removal', name: 'Acrylic/Gel Removal', duration: '30 min', price: 2500, image: '', showDetails: false },
    ],
    products: [
      { id: 'top-coat', name: 'No-Wipe Top Coat (15ml)', price: 4500, image: 'https://picsum.photos/seed/topcoat/400/400', showDetails: true, description: 'High-gloss, non-sticky finish top coat. Cures in 60 seconds under UV/LED lamp.' },
      { id: 'nail-oil', name: 'Cuticle Oil Pen', price: 2000, image: 'https://picsum.photos/seed/cuticle/400/400', showDetails: false },
      { id: 'nail-art-kit', name: 'Rhinestone & Charm Kit', price: 3500, image: 'https://picsum.photos/seed/rhinestone/400/400', showDetails: false },
    ],
  },

  'glow-skin': {
    name: 'Glow Skin Clinic',
    slug: 'glow-skin',
    logo:'',
    tagline: 'Expert facials & skincare in Victoria Island',
    bio: 'Medical-grade facials and advanced skincare treatments tailored to Nigerian skin. Consultation-based approach — no guesswork.',
    phone: '+234 803 456 7890',
    whatsapp: '2348034567890',
    location: 'Akin Adesola St, Victoria Island, Lagos',
    hours: 'Mon–Fri, 9 AM – 5 PM',
    accent: '#8baf8b',
    avatar: '',
    hero: 'https://picsum.photos/seed/glow-hero/800/600',
    gallery: [
      { group: 'Facials', images: ['https://picsum.photos/seed/skin-fac-1/600/600','https://picsum.photos/seed/skin-fac-2/600/600','https://picsum.photos/seed/skin-fac-3/600/600'] },
      { group: 'Treatments', images: ['https://picsum.photos/seed/skin-trt-1/600/600','https://picsum.photos/seed/skin-trt-2/600/600','https://picsum.photos/seed/skin-trt-3/600/600'] },
    ],
    socials: { instagram: 'https://instagram.com/glowskinclinic' },
    paystackPublicKey: 'pk_test_f1e2d3c4b5a697886950413223344556677889900',
    calendarId: 'a1b2c3d4e5f6a7b8c9d0e1f2a3b4c5d6e7f8a9b0c1d2e3f4a5b6c7d8e9f0a1b2@group.calendar.google.com',
    active: true, servicesEnabled: true, productsEnabled: false,
    services: [
      { id: 'deep-cleanse', name: 'Deep Cleanse Facial', duration: '1 hr', price: 12000, image: 'https://picsum.photos/seed/cleanse-thumb/200/200', images: ['https://picsum.photos/seed/cleanse-1/400/400'], showDetails: false },
      { id: 'hydrating', name: 'Hydrating Facial', duration: '1.5 hrs', price: 18000, image: 'https://picsum.photos/seed/hydrate-thumb/200/200', images: ['https://picsum.photos/seed/hydrate-1/400/400'], showDetails: true, description: 'Intense moisture infusion using hyaluronic acid masks. Ideal for dry, dehydrated, or sun-exposed skin.' },
      { id: 'chemical-peel', name: 'Chemical Peel (Mild)', duration: '45 min', price: 20000, image: 'https://picsum.photos/seed/peel-thumb/200/200', images: [], showDetails: false },
      { id: 'microderm', name: 'Microdermabrasion', duration: '1 hr', price: 25000, image: 'https://picsum.photos/seed/micro-thumb/200/200', images: ['https://picsum.photos/seed/micro-1/400/400'], showDetails: false },
      { id: 'led-therapy', name: 'LED Light Therapy', duration: '30 min', price: 8000, image: '', showDetails: false },
      { id: 'consultation', name: 'Skin Consultation', duration: '20 min', price: 3000, image: '', showDetails: false },
    ],
    products: [],
  },
};

export default businesses;