import { useParams, Link } from 'react-router-dom';
import SEO from '../hooks/useSEO';

const blogData = [
  {
    slug: 'how-to-maintain-knotless-braids-in-lagos',
    title: 'How to Maintain Knotless Braids in Lagos Humidity',
    category: 'Beauty',
    content: `Lagos humidity is notorious for frizzing up even the most perfectly installed protective styles. Knotless braids are a favorite because they put less tension on the scalp, but they require specific maintenance to last. Here is your complete guide to keeping them fresh.

First, your nighttime routine is everything. Never sleep on a cotton pillowcase; it absorbs moisture and creates friction. Wrap your braids in a silk or satin scarf, or use a satin bonnet. If your braids are long, loosely tie them up in a high ponytail before wrapping to prevent tangling at the nape of your neck.

Second, washing requires a gentle touch. Mix a sulfate-free shampoo with water in an applicator bottle and apply directly to your scalp. Massage gently with your fingertips—never your nails. Let the suds run down the length of the braids when rinsing; avoid rough scrubbing which causes frizz.

Finally, combat the humidity with mousse. A good alcohol-free styling mousse applied to the length of the braids will smooth down flyaways and provide a light hold against the moist Lagos air. Do this twice a week for the best results.`
  },
  {
    slug: '5-best-local-ingredients-every-nigerian-restaurant-needs',
    title: '5 Best Local Ingredients Every Nigerian Restaurant Needs',
    category: 'Food',
    content: `The secret to authentic, profitable Nigerian cuisine lies in the quality of your base ingredients. If you are running a restaurant or a cloud kitchen, sourcing these five local staples fresh will set your food apart from the competition.

1. Scent Leaves (Nchuanwu/Efirin): This aromatic herb is irreplaceable in pepper soup, yam porridge, and local stews. Fresh scent leaves add a depth of flavor that dried herbs simply cannot match.

2. Crayfish: The backbone of Nigerian seasoning. High-quality, stone-dried crayfish ground fresh gives jollof rice, egusi, and ogbono soup their signature umami flavor. Never compromise on your crayfish supplier.

3. Ofada Rice: While imported rice is standard, serving properly washed and seasoned Ofada rice with a rich Ayamase sauce is a premium offering that customers will pay a premium price for.

4. Locust Beans (Iru/Dawadawa): Whether used in traditional soups like Gbegiri or modern fusion dishes, fermented locust beans provide a unique, savory depth. Rinse them slightly before use to mellow the pungent aroma for modern palates.

5. Palm Oil: Not all palm oil is created equal. Unbleached, locally extracted palm oil gives your Banga soup and native jollof the rich color and authentic taste that keeps customers coming back.`
  },
  {
    slug: 'what-to-check-before-renting-a-car-in-lagos',
    title: 'What to Check Before Renting a Car in Lagos',
    category: 'Cars',
    content: `Renting a car in Lagos gives you the freedom to navigate the city on your own schedule, but the process is fraught with potential pitfalls. Before you hand over your money, ensure you check these vital boxes.

Inspect the Exterior and Interior Thoroughly: Take out your phone and record a video walkthrough of the entire car. Note every scratch, dent, and interior stain. Ensure the rental company logs these damages before you sign the agreement, otherwise, you might be paying for damage you didn't cause.

Check the Tires and Brakes: Lagos roads can be unforgiving. Check the tire tread depth. Bald tires on wet roads during the rainy season are a death trap. During your test drive, listen for any grinding noises when you brake.

Verify the Insurance: Do not just assume the car is insured. Ask for the insurance certificate. Is it comprehensive or third-party? If you get into an accident, who pays the excess? Get this in writing.

Emergency Tools: Ensure the vehicle comes with a spare tire (in good condition), a jack, and a hazard triangle. Breaking down on the Third Mainland Bridge without these is a nightmare you want to avoid.`
  },
  {
    slug: 'why-every-nigerian-small-business-needs-a-bio-link',
    title: 'Why Every Nigerian Small Business Needs a Bio Link',
    category: 'Business',
    content: `If you are running a business in Nigeria using only Instagram DMs, you are leaving money on the table. The "DM to book" cycle is broken. Messages get lost, clients forget to follow up, and you spend hours coordinating instead of doing the actual work.

A bio link—like a BookNaija storefront—solves this. Instead of telling a customer "DM me for price," you direct them to a single link in your bio where all your services, prices, and availability are clearly listed.

The biggest advantage is upfront payment. By integrating a secure payment gateway like Paystack directly into your bio link, clients pay at the point of booking. This eliminates the problem of "no-shows" and time-wasters. When a customer has paid even a token fee, their commitment level skyrockets.

Furthermore, a bio link looks professional. It builds immediate trust. When a client sees a clean, well-organized page with your business hours, location, and secure checkout, they perceive your business as legitimate and reliable. Stop chasing DMs. Put your business in your bio.`
  },
  {
    slug: 'the-rise-of-cloud-kitchens-in-nigeria',
    title: 'The Rise of Cloud Kitchens in Nigeria: How to Start One',
    category: 'Food',
    content: `The food delivery boom in cities like Lagos and Abuja has given rise to a new, highly profitable business model: the Cloud Kitchen. Unlike traditional restaurants, cloud kitchens exist solely for delivery. There are no tables, no waiters, and no expensive interior decor—just a kitchen focused entirely on food production.

The primary advantage is the low startup cost. Renting a small, functional kitchen space in a high-demand area costs a fraction of what you'd pay for a storefront. You also save massively on staffing and utility bills.

To start, you need a niche. Cloud kitchens thrive on focused menus. Instead of offering 50 different meals, focus on doing one thing exceptionally well—whether that's gourmet shawarma, healthy meal prep, or authentic local soups. A focused menu reduces prep time and errors.

Next, partner with delivery platforms like Chowdeck, Gokada, or Glovo. But don't rely solely on them. Set up your own BookNaija storefront so your loyal customers can order directly from you without paying high platform commissions. You get paid upfront, and the delivery riders handle the logistics.`
  },
  {
    slug: 'complete-guide-to-buying-a-used-car-in-nigeria',
    title: 'A Complete Guide to Buying a Used Car in Nigeria',
    category: 'Cars',
    content: `Buying a used (Tokunbo) car in Nigeria can be a great investment, but it requires diligence to ensure you aren't buying a refurbished wreck. Follow this guide to make a smart purchase.

Check the Vehicle Identification Number (VIN): Always ask for the VIN and run a history check using online services. This will reveal if the car has been in a major accident, flooded, or has a salvage title. Many cars shipped into Nigeria have hidden pasts.

Inspect the Engine and Fluids: Open the hood and check the oil. If it looks milky, it could mean a blown head gasket—a very expensive fix. Check the transmission fluid; it should be pinkish and not smell burnt.

The Test Drive is Non-Negotiable: Drive the car on both smooth highways and bumpy roads. Listen for clunks from the suspension. Ensure the steering is tight and the gears shift smoothly. A test drive reveals problems you can never see standing still.

Verify Customs Papers: This is strictly a Nigerian concern. Ensure the vehicle's customs duty is fully paid and the documents are authentic. Buying a car with dubious customs papers can lead to seizure by the Nigeria Customs Service, leaving you with zero recourse.`
  },
  {
    slug: 'setting-the-right-prices-for-your-beauty-services',
    title: 'Setting the Right Prices for Your Beauty Services in 2024',
    category: 'Beauty',
    content: `One of the biggest mistakes beauty professionals make is pricing based on what their competitors charge. If you do this, you are assuming your competitor's business is healthy—which is often not the case.

To price correctly, you must know your numbers. Calculate the cost of the products used per service (hair extensions, lash glue, nail acrylic). Then, calculate your overhead: rent, electricity, water, and the depreciation of your equipment. Finally, assign a value to your time.

If a service takes 4 hours, and you want to earn ₦5,000 per hour, your labor cost is ₦20,000. Add product costs (say, ₦10,000) and a percentage for overhead (₦3,000). The baseline cost is ₦33,000. Your price must be above this to survive.

Do not be afraid to price premium. Clients who pay more are generally more respectful of your time and show up for appointments. Consider offering tiered pricing—a basic package for budget clients and a VIP package with premium products for those willing to pay more.`
  },
  {
    slug: 'how-paystack-is-changing-online-payments-for-creatives',
    title: 'How Paystack is Changing Online Payments for Nigerian Creatives',
    category: 'Business',
    content: `For years, Nigerian creatives and freelancers struggled with receiving payments. Bank transfers required sending account numbers via DM, leading to mix-ups, delayed payments, and the constant fear of "fake alerts." Paystack has fundamentally changed this landscape.

With Paystack integrated into platforms like BookNaija, payments happen in real-time. When a client books your service, they pay securely via card, bank transfer, or USSD. You get an instant notification, and the funds settle directly into your bank account. No more chasing clients for money.

This instant payment builds trust on both sides. The client feels secure because they are paying through a verified gateway, and you are guaranteed your fee before the service is rendered.

For freelancers selling digital products or physical merchandise, Paystack provides payment links that you can share anywhere. This democratizes e-commerce, allowing a graphic designer in Surulere to sell templates globally, or a fashion designer in Lekki to sell outfits nationwide without needing a complex website.`
  },
  {
    slug: 'how-to-package-food-for-delivery-in-nigeria',
    title: 'How to Package Food for Delivery in Nigeria (Tips & Tricks)',
    category: 'Food',
    content: `The quality of your food means nothing if it arrives looking like a disaster. In the competitive Nigerian food delivery space, packaging is just as important as taste. Here is how to ensure your meals arrive looking and tasting perfect.

Separate Wet and Dry: Never pack soup and swallow in the same container. Use sturdy, leak-proof plastic containers with tight lids for soups. Pack swallow (fufu, amala, eba) separately in foil or its own container. The steam from hot soup will turn swallow into a mushy mess if packed together.

Mind the Temperature: Food should be as hot as possible when handed to the rider. Use insulated bags (coolers) to retain heat. If you are delivering cold items like smoothies or salads, ensure they are in sealed, chilled containers to prevent sweating and sogginess.

Seal for Trust: Always seal your bags with a branded sticker or tape. This serves two purposes: it prevents tampering during transit (a major concern for customers), and it builds brand recognition. A simple "Thank you" sticker over the bag's zip tie increases the perceived value of the meal.`
  },
  {
    slug: 'building-client-trust-why-online-booking-beats-dms',
    title: 'Building Client Trust: Why Online Booking Beats DMs',
    category: 'Business',
    content: `In the modern Nigerian business landscape, trust is currency. When a client reaches out via DM, they are taking a risk. They don't know if you will respond promptly, if your prices are standard, or if you will actually deliver the service. 

An online booking page eliminates this uncertainty. It acts as your digital storefront. When a client sees a clean, well-structured page with your services clearly listed, your prices transparent, and your business hours displayed, their anxiety drops significantly.

Automated Reminders Build Reliability: Life is busy, and clients forget appointments. An online booking system sends automated WhatsApp or email reminders before the appointment. This shows professionalism and drastically reduces no-shows.

The Psychology of Upfront Payment: When a client pays upfront via a secure platform, they are making a psychological commitment. They are far more likely to show up and respect your time. It shifts the dynamic from "I hope they show up" to "They are guaranteed to show up." If you want to be taken seriously as a business owner, move out of the DMs and onto a professional booking platform.`
  }
];

// ⚠️ MAKE SURE THIS LINE IS EXACTLY AS BELOW ⚠️
export default function BlogArticle() {
  const { slug } = useParams();
  const article = blogData.find(a => a.slug === slug);

  if (!article) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-zinc-900 mb-2">Article Not Found</h1>
          <Link to="/blog" className="text-purple-600 font-medium hover:underline">← Back to Blog</Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white text-zinc-900 font-sans selection:bg-zinc-100 selection:text-zinc-900">
      <SEO 
        title={article.title}
        description={article.content.substring(0, 150) + '...'}
      />

      {/* Header */}
      <nav className="bg-white sticky top-0 z-50 px-4 sm:px-6 border-b border-zinc-100">
        <div className="max-w-2xl mx-auto py-4 flex justify-between items-center">
          <Link to="/blog" className="text-sm font-medium text-zinc-600 hover:text-zinc-900 transition-colors">
            ← Blog
          </Link>
          <Link to="/" className="text-sm font-medium text-zinc-600 hover:text-zinc-900 transition-colors">
            BookNaija
          </Link>
        </div>
      </nav>

      <main className="max-w-2xl mx-auto px-6 pt-12 pb-24">
        <header className="mb-10">
          <span className="inline-block text-[10px] font-bold uppercase tracking-widest text-purple-600 bg-purple-50 px-2 py-1 rounded-md mb-4">
            {article.category}
          </span>
          <h1 className="text-3xl md:text-4xl font-bold tracking-tight text-zinc-900 leading-tight mb-4">
            {article.title}
          </h1>
          <div className="w-16 h-1 bg-purple-600 rounded-full"></div>
        </header>

        {/* Article Content */}
        <div className="prose prose-zinc prose-lg max-w-none">
          {article.content.split('\n\n').map((paragraph, index) => (
            <p key={index} className="text-zinc-600 leading-relaxed mb-6 text-base">
              {paragraph}
            </p>
          ))}
        </div>

        {/* CTA at the bottom */}
        <div className="mt-16 p-8 rounded-2xl bg-zinc-50 border border-zinc-200 text-center">
          <h3 className="text-xl font-bold text-zinc-900 mb-2">Ready to grow your business?</h3>
          <p className="text-zinc-500 text-sm mb-6">Stop the DM cycle. Get your professional storefront on BookNaija today.</p>
          <Link to="/signup" className="inline-block bg-zinc-900 text-white px-8 py-3 rounded-xl text-sm font-bold hover:bg-zinc-700 transition-all active:scale-95">
            Get Started for ₦500
          </Link>
        </div>
      </main>
    </div>
  );
}