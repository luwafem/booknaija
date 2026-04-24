// PUBLIC business configs — NO secrets here
const PLATFORM_PAYSTACK_KEY = 'pk_test_129628160c0fdb0e1e837751e5ff0233872676b8';

const businesses = {
  'glamour-lash': {
    name: 'Glamour Lash Studio',
    slug: 'glamour-lash',
    logo:'',
    tagline: 'Premium lash extensions in Lagos',
    bio: 'Certified lash artist with 5+ years experience. Specialising in classic, volume & mega volume techniques for a natural, fluttery look.',
    phone: '+234 812 345 6789',
    whatsapp: '2348123456789',
    email: 'glamourlashlagos@gmail.com', // <--- NEW: Used as Calendar ID
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
    paystackPublicKey: PLATFORM_PAYSTACK_KEY,
    subaccountCode: 'ACCT_xytowrok4iymzgs',
    calendarId: 'glamourlashlagos@gmail.com', // <--- SIMPLIFIED: Using Email as ID
    active: true,
    adsEnabled: true,
    servicesEnabled: true,
    productsEnabled: true,
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
        showDetails: true,
        description: 'Safe and gentle removal of existing lash extensions without damaging your natural lashes.'
      },
    ],
    products: [
      {
        id: 'serum', name: 'Lash Growth Serum', price: 5000, image: 'https://picsum.photos/seed/serum-prod/400/400',
        showDetails: true,
        description: 'Peptide-infused serum to nourish follicles and promote natural lash growth. Apply daily to clean lash lines.'
      },
      {
        id: 'glue', name: 'Lash Adhesive (5g)', price: 3500, image: 'https://picsum.photos/seed/glue-prod/400/400',
        showDetails: true,
        description: 'Professional-grade, low-fume adhesive designed for long-lasting retention. Latex-free and waterproof.'
      },
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
    email: 'velvetnailslekki@gmail.com', // <--- NEW
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
    paystackPublicKey: PLATFORM_PAYSTACK_KEY,
    subaccountCode: 'ACCT_velvetnails_code',
    calendarId: 'velvetnailslekki@gmail.com', // <--- SIMPLIFIED
    active: true,
    adsEnabled: true,
    servicesEnabled: true,
    productsEnabled: true,
    services: [
      {
        id: 'gel-manicure', name: 'Gel Manicure', duration: '1 hr', price: 8000, image: 'https://picsum.photos/seed/gel-thumb/200/200',
        images: ['https://picsum.photos/seed/gel-1/400/400'],
        showDetails: true,
        description: 'Classic gel polish application with cuticle care. Long-lasting, chip-resistant shine for up to 3 weeks.'
      },
      {
        id: 'acrylic-full', name: 'Acrylic Full Set', duration: '2 hrs', price: 18000, image: 'https://picsum.photos/seed/acrylic-thumb/200/200',
        images: ['https://picsum.photos/seed/acrylic-1/400/400','https://picsum.photos/seed/acrylic-2/400/400'],
        showDetails: true,
        description: 'Full coverage using liquid monomer and polymer powder. Sculpted to your desired shape and length.'
      },
      {
        id: 'acrylic-fill', name: 'Acrylic Fill', duration: '1.5 hrs', price: 12000, image: 'https://picsum.photos/seed/fill-thumb/200/200',
        images: [],
        showDetails: true,
        description: 'Infills to cover of growth gap of your existing acrylics. Includes reshaping, buffing, and polish.'
      },
      {
        id: 'nail-art', name: 'Custom Nail Art (per hand)', duration: '45 min', price: 5000, image: 'https://picsum.photos/seed/art-thumb/200/200',
        images: ['https://picsum.photos/seed/art-1/400/400','https://picsum.photos/seed/art-2/400/400','https://picsum.photos/seed/art-3/400/400'],
        showDetails: true,
        description: 'Hand-painted designs, chrome finishes, or encapsulated charms. Price is per hand; added to any base service.'
      },
      {
        id: 'pedicure', name: 'Luxury Pedicure', duration: '1.5 hrs', price: 10000, image: '',
        showDetails: true,
        description: 'Relaxing foot soak, callus removal, cuticle care, exfoliation, massage, and polish application.'
      },
      {
        id: 'removal', name: 'Acrylic/Gel Removal', duration: '30 min', price: 2500, image: '',
        showDetails: true,
        description: 'Safe and gentle removal of gel polish or acrylics to prepare your natural nails for a fresh set.'
      },
    ],
    products: [
      {
        id: 'top-coat', name: 'No-Wipe Top Coat (15ml)', price: 4500, image: 'https://picsum.photos/seed/topcoat/400/400',
        showDetails: true,
        description: 'High-gloss, non-sticky finish top coat. Cures in 60 seconds under UV/LED lamp.'
      },
      {
        id: 'nail-oil', name: 'Cuticle Oil Pen', price: 2000, image: 'https://picsum.photos/seed/cuticle/400/400',
        showDetails: true,
        description: 'Nourishing oil blend with jojoba and vitamin E to hydrate cuticles and promote healthy nail growth.'
      },
      {
        id: 'nail-art-kit', name: 'Rhinestone & Charm Kit', price: 3500, image: 'https://picsum.photos/seed/rhinestone/400/400',
        showDetails: true,
        description: 'Assortment of high-quality rhinestones, pearls, and metal charms for customizing your nail art at home.'
      },
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
    email: 'glowskinclinic@gmail.com', // <--- NEW
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
    paystackPublicKey: PLATFORM_PAYSTACK_KEY,
    subaccountCode: 'ACCT_glowskin_code',
    calendarId: 'glowskinclinic@gmail.com', // <--- SIMPLIFIED
    active: true,
    adsEnabled: false, // Ads are OFF (Premium)
    servicesEnabled: true,
    productsEnabled: false,
    services: [
      {
        id: 'deep-cleanse', name: 'Deep Cleanse Facial', duration: '1 hr', price: 12000, image: 'https://picsum.photos/seed/cleanse-thumb/200/200',
        images: ['https://picsum.photos/seed/cleanse-1/400/400'],
        showDetails: true,
        description: 'Thorough cleansing and exfoliation to remove impurities and unclog pores. Leaves skin feeling fresh and breathing.'
      },
      {
        id: 'hydrating', name: 'Hydrating Facial', duration: '1.5 hrs', price: 18000, image: 'https://picsum.photos/seed/hydrate-thumb/200/200',
        images: ['https://picsum.photos/seed/hydrate-1/400/400'],
        showDetails: true,
        description: 'Intense moisture infusion using hyaluronic acid masks. Ideal for dry, dehydrated, or sun-exposed skin.'
      },
      {
        id: 'chemical-peel', name: 'Chemical Peel (Mild)', duration: '45 min', price: 20000, image: 'https://picsum.photos/seed/peel-thumb/200/200',
        images: [],
        showDetails: true,
        description: 'A mild chemical peel to improve skin texture, tone, and clarity. Reduces the appearance of fine lines and mild acne scars.'
      },
      {
        id: 'microderm', name: 'Microdermabrasion', duration: '1 hr', price: 25000, image: 'https://picsum.photos/seed/micro-thumb/200/200',
        images: ['https://picsum.photos/seed/micro-1/400/400'],
        showDetails: true,
        description: 'Non-invasive exfoliation treatment that removes dead skin cells, promoting new cell growth and a smoother complexion.'
      },
      {
        id: 'led-therapy', name: 'LED Light Therapy', duration: '30 min', price: 8000, image: '',
        showDetails: true,
        description: 'Uses specific wavelengths of light to treat acne, reduce inflammation, and stimulate collagen production.'
      },
      {
        id: 'consultation', name: 'Skin Consultation', duration: '20 min', price: 3000, image: '',
        showDetails: true,
        description: 'Professional skin analysis to determine your skin type and concerns. Includes a recommended treatment plan.'
      },
    ],
    products: [],
  },

  'lagos-luxe': {
    name: 'Lagos Luxe Boutique',
    slug: 'lagos-luxe',
    logo:'',
    tagline: 'Contemporary African Fashion & Luxe Wear',
    bio: 'Where modern style meets African heritage. We offer curated pieces from top designers, perfect for weddings, galas, and red carpet events.',
    phone: '+234 701 234 5678',
    whatsapp: '2347012345678',
    email: 'lagosluxe@gmail.com', // <--- NEW
    location: 'The Palms Shopping Mall, Lekki, Lagos',
    hours: 'Mon–Sun, 10 AM – 9 PM',
    accent: '#b76e79', // Rose Gold
    avatar: '',
    hero: 'https://picsum.photos/seed/lagos-hero/800/600',
    gallery: [
      { group: 'Store Lookbook', images: ['https://picsum.photos/seed/store-1/600/600','https://picsum.photos/seed/store-2/600/600','https://picsum.photos/seed/store-3/600/600'] },
      { group: 'Customer Fit', images: ['https://picsum.photos/seed/fit-1/600/600','https://picsum.photos/seed/fit-2/600/600','https://picsum.photos/seed/fit-3/600/600'] },
    ],
    socials: { instagram: 'https://instagram.com/lagosluxe', tiktok: 'https://tiktok.com/@lagosluxe' },
    paystackPublicKey: PLATFORM_PAYSTACK_KEY,
    subaccountCode: 'ACCT_lagosluxe_code',
    calendarId: 'lagosluxe@gmail.com', // <--- SIMPLIFIED
    active: true,
    adsEnabled: true,
    servicesEnabled: false, // Retail only (no bookings)
    productsEnabled: true,
    products: [
      {
        id: 'silk-dress',
        name: 'Crimson Silk Gown',
        layout: 'wide',
        price: 45000,
        sizes: ['US 4', 'US 6', 'US 8', 'US 10'],
        colors: ['#C8102E', '#1a1a1a', '#00563B'],
        images: [
          'https://picsum.photos/seed/dress-front/800/450',
          'https://picsum.photos/seed/dress-side/800/450',
          'https://picsum.photos/seed/dress-back/800/450'
        ],
        showDetails: true,
        description: 'A stunning floor-length gown made from 100% raw silk. Features intricate beadwork along the neckline and a high slit.'
      },
      {
        id: 'gold-heels',
        name: 'Gold Block Heels',
        price: 18000,
        sizes: ['36', '37', '38', '39', '40', '41'],
        colors: ['#FFD700'],
        image: 'https://picsum.photos/seed/heels-thumb/400/400',
        showDetails: true,
        description: 'Comfortable yet elegant 4-inch block heels. Gold plated finish with cushioned insole for all-day wear.'
      },
      {
        id: 'turquoise-set',
        name: 'Turquoise Agbada Set',
        layout: 'wide',
        price: 85000,
        sizes: ['S', 'M', 'L', 'XL', 'XXL'],
        colors: ['#40E0D0'],
        images: [
          'https://picsum.photos/seed/agbada-1/800/450',
          'https://picsum.photos/seed/agbada-2/800/450'
        ],
        showDetails: true,
        description: 'Luxury Agbada set for men featuring traditional embroidery with a modern twist. Made from premium Swiss voile. Includes top, trousers, and matching cap.'
      },
      {
        id: 'clutch',
        name: 'Beaded Evening Clutch',
        price: 12000,
        image: 'https://picsum.photos/seed/clutch-thumb/400/400',
        showDetails: true,
        description: 'Hand-beaded clutch purse perfect for holding your phone, keys, and lipstick. Comes with a detachable gold chain.'
      },
      {
        id: 'summer-maxi',
        name: 'Floral Maxi Dress',
        layout: 'wide',
        price: 35000,
        sizes: ['XS', 'S', 'M', 'L', 'XL'],
        colors: ['#E9967A', '#F4C2C2', '#FFDAB9'],
        images: [
          'https://picsum.photos/seed/maxi-1/800/450',
          'https://picsum.photos/seed/maxi-2/800/450'
        ],
        showDetails: true,
        description: 'Lightweight cotton maxi dress with a flattering V-neckline. Perfect for weekend brunches or beach getaways.'
      }
    ],
  },

  // --- NEW FOOD BUSINESS EXAMPLE ---
  'tasty-bites': {
    name: 'Tasty Bites Kitchen',
    slug: 'tasty-bites',
    logo:'',
    tagline: 'Best burgers & grills in Ikeja',
    bio: 'Fresh, juicy burgers made with 100% beef patties and secret sauces. Add as many toppings as you like!',
    phone: '+234 810 555 1234',
    whatsapp: '2348105551234',
    email: 'tastybiteskitchen@gmail.com', // <--- NEW
    location: 'Ikeja City Mall, Lagos',
    hours: 'Mon–Sun, 11 AM – 10 PM',
    accent: '#e67e22', // Carrot Orange
    avatar: '',
    hero: 'https://picsum.photos/seed/burger-hero/800/600',
    gallery: [
      { group: 'Our Kitchen', images: ['https://picsum.photos/seed/kitchen1/600/600','https://picsum.photos/seed/kitchen2/600/600'] },
      { group: 'Happy Customers', images: ['https://picsum.photos/seed/customer1/600/600','https://picsum.photos/seed/customer2/600/600'] },
    ],
    socials: { instagram: 'https://instagram.com/tastybites', tiktok: 'https://tiktok.com/@tastybites' },
    paystackPublicKey: PLATFORM_PAYSTACK_KEY,
    subaccountCode: 'ACCT_xytowrok4iymzgs',
    calendarId: 'tastybiteskitchen@gmail.com', // <--- SIMPLIFIED
    active: true,
    adsEnabled: true,
    servicesEnabled: false,
    productsEnabled: false,
    foodEnabled: true, 
    
    food: [
      {
        id: 'classic-burger',
        name: 'The Classic Burger',
        price: 4500,
        image: 'https://picsum.photos/seed/burger1/400/400',
        description: 'Juicy beef patty, lettuce, tomato, and our house sauce on a brioche bun.',
        
        // Addons configuration
        addons: [
          {
            id: 'patty',
            label: 'Extra Protein',
            type: 'multi', 
            options: [
              { name: 'Extra Beef Patty', price: 1500 },
              { name: 'Grilled Chicken', price: 1200 }
            ]
          },
          {
            id: 'toppings',
            label: 'Toppings',
            type: 'multi', 
            options: [
              { name: 'Caramelized Onions', price: 200 },
              { name: 'Pickles', price: 0 },
              { name: 'Jalapeños', price: 200 },
              { name: 'Extra Cheese', price: 500 },
              { name: 'Bacon Strips', price: 800 }
            ]
          },
          {
            id: 'sides',
            label: 'Choose One Side',
            type: 'single', 
            options: [
              { name: 'No Side', price: 0 },
              { name: 'Crispy Chips', price: 500 },
              { name: 'Coleslaw', price: 700 },
              { name: 'Onion Rings', price: 800 }
            ]
          }
        ]
      },
      {
        id: 'chicken-wings',
        name: 'Spicy Wings (6 pcs)',
        price: 3500,
        image: 'https://picsum.photos/seed/wings/400/400',
        description: 'Crispy fried wings tossed in our signature hot sauce. Served with ranch dip.',
        addons: [
          {
            id: 'spice',
            label: 'Heat Level',
            type: 'single', 
            options: [
              { name: 'Mild', price: 0 },
              { name: 'Hot', price: 0 },
              { name: 'Suicidal (Extra Hot)', price: 100 }
            ]
          }
        ]
      },
      {
        id: 'margherita-pizza',
        name: 'Margherita Pizza',
        price: 6000,
        image: 'https://picsum.photos/seed/pizza1/400/400',
        description: 'Classic tomato base, fresh mozzarella, and basil leaves.',
        addons: [
          {
            id: 'size',
            label: 'Size',
            type: 'single',
            options: [
              { name: 'Small (9")', price: 0 },
              { name: 'Medium (12")', price: 2000 },
              { name: 'Large (15")', price: 4000 }
            ]
          },
          {
            id: 'extra',
            label: 'Extra Toppings',
            type: 'multi',
            options: [
              { name: 'Mushrooms', price: 500 },
              { name: 'Pepperoni', price: 800 },
              { name: 'Sausage', price: 800 },
              { name: 'Bell Peppers', price: 300 }
            ]
          }
        ]
      }
    ],
  },
};

export default businesses;