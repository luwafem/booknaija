import { Link } from 'react-router-dom';
import SEO from '../hooks/useSEO';

const articles = [
  {
    slug: 'how-to-maintain-knotless-braids-in-lagos',
    title: 'How to Maintain Knotless Braids in Lagos Humidity',
    excerpt: 'Lagos humidity can be brutal on protective styles. Learn the essential nighttime routines and products you need to keep your knotless braids looking fresh for weeks.',
    category: 'Beauty'
  },
  {
    slug: '5-best-local-ingredients-every-nigerian-restaurant-needs',
    title: '5 Best Local Ingredients Every Nigerian Restaurant Needs',
    excerpt: 'From scent leaves to ofada rice, sourcing the right local ingredients is key to authentic Nigerian cuisine. Here are the top 5 you should never run out of.',
    category: 'Food'
  },
  {
    slug: 'what-to-check-before-renting-a-car-in-lagos',
    title: 'What to Check Before Renting a Car in Lagos',
    excerpt: 'Before you pay for that car rental, make sure you check these 7 crucial things — from tire condition to insurance coverage — to avoid getting scammed or stranded.',
    category: 'Cars'
  },
  {
    slug: 'why-every-nigerian-small-business-needs-a-bio-link',
    title: 'Why Every Nigerian Small Business Needs a Bio Link',
    excerpt: 'Stop losing customers to broken DMs. A bio link turns your social media profile into a complete storefront where customers can book and pay instantly.',
    category: 'Business'
  },
  {
    slug: 'the-rise-of-cloud-kitchens-in-nigeria',
    title: 'The Rise of Cloud Kitchens in Nigeria: How to Start One',
    excerpt: 'With the boom in food delivery, cloud kitchens are becoming incredibly profitable. Learn the startup costs, licensing, and logistics of running a cloud kitchen in Nigeria.',
    category: 'Food'
  },
  {
    slug: 'complete-guide-to-buying-a-used-car-in-nigeria',
    title: 'A Complete Guide to Buying a Used Car in Nigeria',
    excerpt: 'Buying a tokunbo car? Read this first. We cover everything from checking the VIN to negotiating with dealers, and how to avoid " refurbished" accident cars.',
    category: 'Cars'
  },
  {
    slug: 'setting-the-right-prices-for-your-beauty-services',
    title: 'Setting the Right Prices for Your Beauty Services in 2024',
    excerpt: 'Are you charging too little? Learn how to calculate your costs, factor in your time, and set competitive prices for your hair, nail, or lash business.',
    category: 'Beauty'
  },
  {
    slug: 'how-paystack-is-changing-online-payments-for-creatives',
    title: 'How Paystack is Changing Online Payments for Nigerian Creatives',
    excerpt: 'Gone are the days of " please send your account number." Discover how integrating Paystack can streamline your business and guarantee your payments.',
    category: 'Business'
  },
  {
    slug: 'how-to-package-food-for-delivery-in-nigeria',
    title: 'How to Package Food for Delivery in Nigeria (Tips & Tricks)',
    excerpt: 'Soggy swallow and spilled soup? Never again. Here is how professional food vendors package their meals to arrive looking and tasting perfect.',
    category: 'Food'
  },
  {
    slug: 'building-client-trust-why-online-booking-beats-dms',
    title: 'Building Client Trust: Why Online Booking Beats DMs',
    excerpt: 'When clients book through a secure platform instead of DMs, they are 80% more likely to show up. Learn the psychology behind automated booking trust.',
    category: 'Business'
  }
];

export default function Blog() {
  return (
    <div className="min-h-screen bg-white text-zinc-900 font-sans selection:bg-zinc-100 selection:text-zinc-900">
      <SEO 
        title="Blog - Tips for Nigerian Businesses" 
        description="Expert advice, guides, and tips for beauty professionals, restaurants, car dealers, and small businesses in Nigeria." 
      />

      {/* Header */}
      <nav className="bg-white sticky top-0 z-50 px-4 sm:px-6 border-b border-zinc-100">
        <div className="max-w-4xl mx-auto py-4 flex justify-between items-center">
          <Link to="/" className="text-lg font-bold tracking-tight text-zinc-900">
            Five9 <span className="text-purple-600">Blog</span>
          </Link>
          <Link to="/" className="text-sm font-medium text-zinc-600 hover:text-zinc-900 transition-colors">
            ← Home
          </Link>
        </div>
      </nav>

      <main className="max-w-4xl mx-auto px-6 pt-16 pb-24">
        <header className="mb-16">
          <h1 className="text-4xl md:text-5xl font-bold tracking-tight text-zinc-900 mb-4">
            Insights for <span className="text-purple-600">Nigerian Businesses</span>
          </h1>
          <p className="text-zinc-500 text-lg max-w-2xl leading-relaxed">
            Practical advice, expert guides, and industry trends for beauty professionals, restaurants, car dealerships, and freelancers.
          </p>
        </header>

        <div className="grid md:grid-cols-2 gap-8">
          {articles.map((article) => (
            <Link 
              key={article.slug} 
              to={`/blog/${article.slug}`}
              className="group block p-6 rounded-2xl border border-zinc-200 hover:border-purple-300 transition-all hover:shadow-lg"
            >
              <span className="inline-block text-[10px] font-bold uppercase tracking-widest text-purple-600 bg-purple-50 px-2 py-1 rounded-md mb-3">
                {article.category}
              </span>
              <h2 className="text-xl font-bold text-zinc-900 mb-2 group-hover:text-purple-600 transition-colors leading-tight">
                {article.title}
              </h2>
              <p className="text-zinc-500 text-sm leading-relaxed">
                {article.excerpt}
              </p>
              <span className="inline-block mt-4 text-sm font-semibold text-purple-600 group-hover:underline">
                Read article →
              </span>
            </Link>
          ))}
        </div>
      </main>
    </div>
  );
}