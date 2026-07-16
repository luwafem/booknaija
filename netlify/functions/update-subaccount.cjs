const { createClient } = require('@supabase/supabase-js');
const xss = require('xss');
const cookie = require('cookie');
const jwt = require('jsonwebtoken');
const { validateCsrf } = require('./_utils/csrf'); // 👈 NEW

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

// ─── SANITISATION HELPER ───
function sanitizeDeep(input) {
  if (typeof input === 'string') {
    return xss(input, {
      whiteList: [],
      stripIgnoreTag: true,
      stripIgnoreTagBody: ['script', 'style'],
    });
  }
  if (Array.isArray(input)) {
    return input.map(sanitizeDeep);
  }
  if (input && typeof input === 'object') {
    const result = {};
    for (const [key, value] of Object.entries(input)) {
      result[key] = sanitizeDeep(value);
    }
    return result;
  }
  return input;
}

// ── Helper: Create a new subaccount ──
async function createNewSubaccount(secretKey, business_name, settlement_bank, account_number, account_name, email, phone) {
  const res = await fetch('https://api.paystack.co/subaccount', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${secretKey}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      business_name: business_name,
      settlement_bank: settlement_bank,
      account_number: account_number,
      percentage_charge: 5,
      primary_contact_name: account_name || business_name,
      primary_contact_email: email,
      primary_contact_phone: phone,
    })
  });

  const data = await res.json();

  if (!data.status || !data.data?.subaccount_code) {
    const msg = data.message || 'Failed to verify bank details';
    if (msg.toLowerCase().includes('already') || msg.toLowerCase().includes('duplicate')) {
      return { error: 'This bank account is already linked to another subaccount. Please contact support.' };
    }
    return { error: msg };
  }

  return { subaccount_code: data.data.subaccount_code };
}

exports.handler = async (event) => {
  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, body: JSON.stringify({ error: 'Method not allowed' }) };
  }

  try {
    const raw = JSON.parse(event.body);
    // ─── SANITISE ALL INPUT ───
    const d = sanitizeDeep(raw);

    const { slug, business_name, settlement_bank, account_number, account_name, email, phone } = d;

    if (!slug || !settlement_bank || !account_number) {
      return { statusCode: 400, body: JSON.stringify({ error: 'Missing required fields: slug, settlement_bank, account_number' }) };
    }

    // ─── CSRF PROTECTION ───
    if (!validateCsrf(event)) {
      return {
        statusCode: 403,
        body: JSON.stringify({ error: 'Invalid security token. Please refresh and try again.' }),
      };
    }

    // ─── JWT AUTHENTICATION ───
    const cookies = cookie.parse(event.headers.cookie || '');
    const token = cookies.dashboard_token;
    if (!token) {
      return {
        statusCode: 401,
        body: JSON.stringify({ error: 'Unauthorized: No session token provided.' }),
      };
    }

    const JWT_SECRET = process.env.JWT_SECRET;
    if (!JWT_SECRET) {
      console.error('JWT_SECRET not set in environment');
      return {
        statusCode: 500,
        body: JSON.stringify({ error: 'Server misconfiguration.' }),
      };
    }

    let decoded;
    try {
      decoded = jwt.verify(token, JWT_SECRET);
    } catch (err) {
      console.warn('JWT verification failed:', err.message);
      return {
        statusCode: 401,
        body: JSON.stringify({ error: 'Invalid or expired session. Please log in again.' }),
      };
    }

    // Ensure the JWT slug matches the requested slug
    if (decoded.slug !== slug) {
      console.warn(`JWT slug mismatch: ${decoded.slug} vs ${slug}`);
      return {
        statusCode: 403,
        body: JSON.stringify({ error: 'Forbidden: You do not have permission to modify this business.' }),
      };
    }

    // ─── Continue with existing logic ───
    const secretKey = process.env.PAYSTACK_SECRET_KEY;
    if (!secretKey) {
      return { statusCode: 500, body: JSON.stringify({ error: 'Payment not configured' }) };
    }

    // 1. Get the existing subaccount code from Supabase
    const { data: biz, error: bizErr } = await supabase
      .from('businesses')
      .select('subaccount_code')
      .eq('slug', slug)
      .single();

    if (bizErr || !biz) {
      return { statusCode: 404, body: JSON.stringify({ error: 'Business not found' }) };
    }

    const existingCode = biz.subaccount_code;
    const hasRealCode = existingCode && existingCode !== 'ACCT_PENDING' && existingCode.startsWith('ACCT_');

    let finalSubaccountCode = null;

    if (hasRealCode) {
      // ── UPDATE existing subaccount ──
      const updateRes = await fetch(`https://api.paystack.co/subaccount/${existingCode}`, {
        method: 'PUT',
        headers: {
          Authorization: `Bearer ${secretKey}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          business_name: business_name,
          settlement_bank: settlement_bank,
          account_number: account_number,
          primary_contact_name: account_name || business_name,
          primary_contact_email: email,
          primary_contact_phone: phone,
        })
      });

      const updateData = await updateRes.json();

      if (!updateData.status) {
        console.log('Update failed, trying create:', updateData.message);
        const createResult = await createNewSubaccount(secretKey, business_name, settlement_bank, account_number, account_name, email, phone);
        if (createResult.error) {
          return { statusCode: 400, body: JSON.stringify({ error: createResult.error }) };
        }
        finalSubaccountCode = createResult.subaccount_code;
      } else {
        finalSubaccountCode = updateData.data?.subaccount_code || existingCode;
      }
    } else {
      // ── CREATE new subaccount ──
      const createResult = await createNewSubaccount(secretKey, business_name, settlement_bank, account_number, account_name, email, phone);
      if (createResult.error) {
        return { statusCode: 400, body: JSON.stringify({ error: createResult.error }) };
      }
      finalSubaccountCode = createResult.subaccount_code;
    }

    if (!finalSubaccountCode) {
      return { statusCode: 400, body: JSON.stringify({ error: 'Failed to get subaccount code from Paystack' }) };
    }

    // 2. Update Supabase with the new subaccount code
    const { error: updateErr } = await supabase
      .from('businesses')
      .update({ subaccount_code: finalSubaccountCode })
      .eq('slug', slug);

    if (updateErr) {
      console.error('Supabase update error:', updateErr);
      return { statusCode: 500, body: JSON.stringify({ error: 'Verified, but failed to save. Please contact support.' }) };
    }

    return {
      statusCode: 200,
      body: JSON.stringify({ ok: true, subaccount_code: finalSubaccountCode })
    };

  } catch (err) {
    console.error('update-subaccount error:', err);
    return { statusCode: 500, body: JSON.stringify({ error: err.message }) };
  }
};