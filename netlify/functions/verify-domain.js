import { createClient } from '@supabase/supabase-js';
import dns from 'dns';
import { promisify } from 'util';

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);
const resolveTxt = promisify(dns.resolveTxt);

export const handler = async (event) => {
  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, body: 'Method Not Allowed' };
  }

  try {
    const { domain, slug } = JSON.parse(event.body);
    if (!domain || !slug) {
      return { statusCode: 400, body: JSON.stringify({ error: 'Domain and slug required' }) };
    }

    // Normalize domain (lowercase, trim, remove trailing slash)
    const normalizedDomain = domain.trim().toLowerCase().replace(/\/$/, '');

    // Check if domain already belongs to another business
    const { data: existing, error: checkErr } = await supabase
      .from('domains')
      .select('slug, verified')
      .eq('domain', normalizedDomain)
      .single();

    if (existing) {
      // If already verified for this slug, return success early (idempotent)
      if (existing.slug === slug && existing.verified === true) {
        return {
          statusCode: 200,
          body: JSON.stringify({ success: true, message: 'Domain already verified.' }),
        };
      }
      // If it's a different slug, conflict
      if (existing.slug !== slug) {
        return { statusCode: 409, body: JSON.stringify({ error: 'Domain is already in use by another business.' }) };
      }
      // If same slug but not verified, proceed to verify
    }

    // Verify ownership: check DNS TXT record
    const verificationToken = `booknaija-verify=${slug}`;
    try {
      const records = await resolveTxt(normalizedDomain);
      // Flatten all arrays (DNS responses may return multiple arrays)
      const flatRecords = records.flat();
      const hasToken = flatRecords.includes(verificationToken);
      if (!hasToken) {
        return { statusCode: 400, body: JSON.stringify({ error: 'TXT record not found. Please add the record and try again.' }) };
      }
    } catch (dnsError) {
      // Provide more specific error messages
      let errorMsg = 'DNS lookup failed. Ensure your domain is correctly set up.';
      if (dnsError.code === 'ENOTFOUND' || dnsError.code === 'ENODATA') {
        errorMsg = 'Domain not found or no TXT records. Please add the TXT record and try again.';
      } else if (dnsError.code === 'ETIMEOUT') {
        errorMsg = 'DNS lookup timed out. Please try again in a few minutes.';
      }
      return { statusCode: 400, body: JSON.stringify({ error: errorMsg }) };
    }

    // Insert/update domain as verified
    const { error: upsertErr } = await supabase
      .from('domains')
      .upsert(
        { domain: normalizedDomain, slug, verified: true, updated_at: new Date().toISOString() },
        { onConflict: 'domain' }
      );

    if (upsertErr) {
      return { statusCode: 500, body: JSON.stringify({ error: upsertErr.message }) };
    }

    return {
      statusCode: 200,
      body: JSON.stringify({ success: true, message: 'Domain verified successfully!' }),
    };
  } catch (err) {
    return { statusCode: 500, body: JSON.stringify({ error: err.message }) };
  }
};