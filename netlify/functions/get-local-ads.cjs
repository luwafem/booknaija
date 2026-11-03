// netlify/functions/get-local-ads.cjs
const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

exports.handler = async (event) => {
  if (event.httpMethod !== 'GET') {
    return { statusCode: 405, body: JSON.stringify({ error: 'Method Not Allowed' }) };
  }

  try {
    const params = event.queryStringParameters || {};
    const businessType = (params.businessType || '').trim();

    // Fetch every active ad in its time window, then filter in JS.
    //
    // Why not filter in SQL:
    //   • targeting_type='all' needs no check
    //   • targeting_type='business_type' needs a JSONB containment
    //     check that's easier to express in JS than to keep in a
    //     Supabase query builder string. With our volume (10s of
    //     ads) a full-table fetch + JS filter is fine.
    //   • The alternative — .or('targeting_type.eq.all,targeting_values.cs.["X"]')
    //     — is possible but produces a fragile query string that
    //     breaks on business types containing quotes/commas.
    const { data: allAds, error } = await supabase
      .from('local_ads')
      .select(`
        id, title, body, image_url, cta_text, cta_url,
        targeting_type, targeting_values, priority, starts_at, ends_at,
        advertiser_id,
        advertisers ( name, logo_url )
      `)
      .eq('active', true)
      .lte('starts_at', new Date().toISOString())
      .order('priority', { ascending: false });

    if (error) {
      console.error('Failed to fetch local ads:', error.message);
      return { statusCode: 500, body: JSON.stringify({ error: 'Fetch failed' }) };
    }

    const now = new Date();

    const matchingAds = (allAds || []).filter((ad) => {
      // Null end date = never expires
      if (ad.ends_at && new Date(ad.ends_at) <= now) return false;

      // Null targeting_type defaults to 'all'
      const type = ad.targeting_type || 'all';
      if (type === 'all') return true;

      if (type === 'business_type') {
        if (!businessType) return false;
        const targets = Array.isArray(ad.targeting_values)
          ? ad.targeting_values
          : [];
        return targets.includes(businessType);
      }

      return false;
    });

    // Strip the joined advertiser object into a flat shape the frontend
    // expects, so the UI doesn't have to know about Supabase's join shape.
    const shaped = matchingAds.map((ad) => ({
      id: ad.id,
      title: ad.title,
      body: ad.body || '',
      imageUrl: ad.image_url || '',
      ctaText: ad.cta_text || 'Learn More',
      ctaUrl: ad.cta_url,
      advertiserName: ad.advertisers?.name || 'Partner',
      advertiserLogo: ad.advertisers?.logo_url || '',
      priority: ad.priority || 0,
    }));

    // Cache for 5 minutes. Local ads are slow-moving — a stale ad
    // for 5 minutes is fine. Keeps the request off Netlify's function
    // bill on high-traffic business pages.
    return {
      statusCode: 200,
      headers: {
        'Content-Type': 'application/json',
        'Cache-Control': 'public, max-age=300',
      },
      body: JSON.stringify({ ads: shaped }),
    };
  } catch (err) {
    console.error('get-local-ads error:', err.message);
    return { statusCode: 500, body: JSON.stringify({ error: err.message }) };
  }
};