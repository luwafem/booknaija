// netlify/functions/admin-local-ads.cjs
const { createClient } = require('@supabase/supabase-js');
const { verifyAdmin } = require('./_utils/admin-utils.cjs');
const { validateCsrf } = require('./_utils/csrf.cjs');

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

exports.handler = async (event) => {
  const auth = verifyAdmin(event);
  if (!auth.valid) {
    return { statusCode: 401, body: JSON.stringify({ error: auth.error }) };
  }

  // ─── GET: list all advertisers + all ads ───
  if (event.httpMethod === 'GET') {
    try {
      const [advertisersRes, adsRes] = await Promise.all([
        supabase
          .from('advertisers')
          .select('*')
          .order('created_at', { ascending: false }),
        supabase
          .from('local_ads')
          .select(`
            id, advertiser_id, title, body, image_url, cta_text, cta_url,
            targeting_type, targeting_values, starts_at, ends_at,
            active, priority, created_at,
            advertisers ( name )
          `)
          .order('created_at', { ascending: false }),
      ]);

      if (advertisersRes.error) throw advertisersRes.error;
      if (adsRes.error) throw adsRes.error;

      return {
        statusCode: 200,
        body: JSON.stringify({
          advertisers: advertisersRes.data || [],
          ads: (adsRes.data || []).map((ad) => ({
            ...ad,
            advertiser_name: ad.advertisers?.name || 'Unknown',
          })),
        }),
      };
    } catch (err) {
      console.error('admin-local-ads GET error:', err);
      return { statusCode: 500, body: JSON.stringify({ error: err.message }) };
    }
  }

  // ─── POST: create/update/delete ───
  if (event.httpMethod === 'POST') {
    if (!validateCsrf(event)) {
      return { statusCode: 403, body: JSON.stringify({ error: 'Invalid CSRF token' }) };
    }

    try {
      const body = JSON.parse(event.body);
      const { action } = body;

      if (action === 'save_advertiser') {
        const { id, name, contact_email, contact_phone, logo_url, notes, active } = body;
        if (!name) {
          return { statusCode: 400, body: JSON.stringify({ error: 'Advertiser name required' }) };
        }
        const payload = {
          name,
          contact_email: contact_email || null,
          contact_phone: contact_phone || null,
          logo_url: logo_url || null,
          notes: notes || null,
          active: active !== false,
        };
        if (id) {
          const { error } = await supabase.from('advertisers').update(payload).eq('id', id);
          if (error) throw error;
          return { statusCode: 200, body: JSON.stringify({ success: true, id }) };
        }
        const { data, error } = await supabase.from('advertisers').insert(payload).select().single();
        if (error) throw error;
        return { statusCode: 200, body: JSON.stringify({ success: true, id: data.id }) };
      }

      if (action === 'save_ad') {
        const {
          id, advertiser_id, title, body: adBody, image_url,
          cta_text, cta_url, targeting_type, targeting_values,
          starts_at, ends_at, active, priority,
        } = body;

        if (!advertiser_id || !title || !cta_url) {
          return { statusCode: 400, body: JSON.stringify({ error: 'Missing advertiser_id, title, or cta_url' }) };
        }

        const payload = {
          advertiser_id,
          title,
          body: adBody || null,
          image_url: image_url || null,
          cta_text: cta_text || 'Learn More',
          cta_url,
          targeting_type: targeting_type === 'business_type' ? 'business_type' : 'all',
          targeting_values: Array.isArray(targeting_values) ? targeting_values : [],
          starts_at: starts_at || new Date().toISOString(),
          ends_at: ends_at || null,
          active: active !== false,
          priority: Number.isInteger(priority) ? priority : 0,
        };

        if (id) {
          const { error } = await supabase.from('local_ads').update(payload).eq('id', id);
          if (error) throw error;
          return { statusCode: 200, body: JSON.stringify({ success: true, id }) };
        }
        const { data, error } = await supabase.from('local_ads').insert(payload).select().single();
        if (error) throw error;
        return { statusCode: 200, body: JSON.stringify({ success: true, id: data.id }) };
      }

      if (action === 'delete_ad') {
        const { id } = body;
        if (!id) return { statusCode: 400, body: JSON.stringify({ error: 'Missing id' }) };
        const { error } = await supabase.from('local_ads').delete().eq('id', id);
        if (error) throw error;
        return { statusCode: 200, body: JSON.stringify({ success: true }) };
      }

      if (action === 'toggle_ad') {
        const { id, active } = body;
        if (!id) return { statusCode: 400, body: JSON.stringify({ error: 'Missing id' }) };
        const { error } = await supabase.from('local_ads').update({ active: !!active }).eq('id', id);
        if (error) throw error;
        return { statusCode: 200, body: JSON.stringify({ success: true }) };
      }

      return { statusCode: 400, body: JSON.stringify({ error: 'Unknown action' }) };
    } catch (err) {
      console.error('admin-local-ads POST error:', err);
      return { statusCode: 500, body: JSON.stringify({ error: err.message }) };
    }
  }

  return { statusCode: 405, body: JSON.stringify({ error: 'Method Not Allowed' }) };
};