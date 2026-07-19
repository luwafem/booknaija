const { createClient } = require('@supabase/supabase-js');
const xss = require('xss');

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

// ─── SANITISATION ───
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

exports.handler = async (event) => {
  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, body: JSON.stringify({ error: 'Method not allowed' }) };
  }

  try {
    // Parse and sanitise input
    let payload;
    try {
      payload = JSON.parse(event.body);
    } catch (parseErr) {
      return { statusCode: 400, body: JSON.stringify({ error: 'Invalid JSON payload' }) };
    }
    payload = sanitizeDeep(payload);

    const { affiliateId } = payload;

    if (!affiliateId) {
      return { statusCode: 400, body: JSON.stringify({ error: 'Missing affiliate ID' }) };
    }

    // ─── 1. Get Affiliate Details ───
    const { data: affiliate, error: affErr } = await supabase
      .from('affiliates')
      .select('id, name, email, phone, subaccount_code, transfer_recipient_code')
      .eq('id', affiliateId)
      .single();

    if (affErr || !affiliate) {
      console.error('Affiliate not found:', affErr?.message || 'No affiliate');
      return { statusCode: 404, body: JSON.stringify({ error: 'Affiliate not found' }) };
    }

    // ─── CHECK TRANSFER RECIPIENT STATUS ───
    // Determine if the affiliate has a valid transfer recipient code
    const hasValidTransferRecipient = !!(affiliate.transfer_recipient_code && affiliate.transfer_recipient_code.startsWith('RCP_'));

    // ─── 2. Get all businesses referred by this affiliate ───
    const { data: referrals, error: refErr } = await supabase
      .from('businesses')
      .select('slug, name, logo, created_at, active, affiliate_commission_month, affiliate_bounty_paid')
      .eq('referred_by_affiliate', affiliateId)
      .order('created_at', { ascending: false });

    if (refErr) {
      console.error('Error fetching referrals:', refErr.message);
      // Still return affiliate data with empty referrals
    }

    // ─── 3. Enrich referrals with human-readable commission status ───
    const enrichedReferrals = (referrals || []).map((ref) => {
      const month = ref.affiliate_commission_month || 0;
      let status = '';
      let statusColor = '';
      let earned = 0;
      let pending = 0;

      if (!ref.active) {
        status = 'Inactive';
        statusColor = 'gray';
        if (month === 0) {
          earned = 0;
          pending = 0;
        } else if (month === 1) {
          earned = 1500;
          pending = 0;
        } else {
          earned = 2500;
          pending = 0;
        }
      } else {
        if (month === 0) {
          status = 'Pending (₦1,500)';
          statusColor = 'yellow';
          earned = 0;
          pending = 1500;
        } else if (month === 1) {
          status = 'Pending (₦1,000)';
          statusColor = 'orange';
          earned = 1500;
          pending = 1000;
        } else {
          status = 'Paid in Full (₦2,500)';
          statusColor = 'green';
          earned = 2500;
          pending = 0;
        }
      }

      return {
        ...ref,
        commission: {
          month,
          status,
          statusColor,
          earned,
          pending,
          total: earned + pending,
        },
      };
    });

    // ─── 4. Calculate summary stats ───
    const totalReferrals = enrichedReferrals.length;
    const activeReferrals = enrichedReferrals.filter((r) => r.active).length;
    const totalEarned = enrichedReferrals.reduce((sum, r) => sum + r.commission.earned, 0);
    const totalPending = enrichedReferrals.reduce((sum, r) => sum + r.commission.pending, 0);
    const fullyPaid = enrichedReferrals.filter((r) => r.commission.month === 2).length;
    const month1Paid = enrichedReferrals.filter((r) => r.commission.month === 1).length;
    const unpaid = enrichedReferrals.filter((r) => r.commission.month === 0).length;

    // ─── 5. Build the affiliate link ───
    const baseUrl = process.env.SITE_URL || 'https://five9.com.ng';
    const affiliateLink = `${baseUrl}/signup?ref=${affiliate.id}`;

    // ─── 6. Check for any failed payouts for this affiliate ───
    const { data: failedPayouts, error: failedErr } = await supabase
      .from('failed_payouts')
      .select('id, business_slug, amount, reason, created_at, status')
      .eq('affiliate_id', affiliateId)
      .eq('status', 'pending')
      .order('created_at', { ascending: false })
      .limit(5);

    if (failedErr) {
      console.error('Error fetching failed payouts:', failedErr.message);
    }

    // ─── 7. Check if affiliate is missing transfer recipient but has referrals on month 1 ───
    // This is a critical check: if they have referrals with affiliate_commission_month = 1,
    // they need a transfer_recipient_code to receive their ₦1,000 bonus.
    const needsTransferRecipient = enrichedReferrals.some(
      (r) => r.active && r.affiliate_commission_month === 1
    );

    // ─── 8. Determine transfer recipient status for frontend ───
    let transferRecipientStatus = 'unknown';
    if (hasValidTransferRecipient) {
      transferRecipientStatus = 'connected';
    } else if (needsTransferRecipient) {
      transferRecipientStatus = 'missing_critical';
    } else if (!affiliate.transfer_recipient_code) {
      transferRecipientStatus = 'not_setup';
    } else {
      transferRecipientStatus = 'invalid';
    }

    return {
      statusCode: 200,
      body: JSON.stringify({
        affiliate: {
          id: affiliate.id,
          name: affiliate.name,
          email: affiliate.email,
          phone: affiliate.phone,
          link: affiliateLink,
          subaccount_code: affiliate.subaccount_code || null,
          transfer_recipient_code: affiliate.transfer_recipient_code || null,
          // ─── NEW: Transfer recipient status for frontend ───
          transfer_recipient_status: transferRecipientStatus,
          has_valid_transfer_recipient: hasValidTransferRecipient,
          // ─── NEW: Flag indicating if they need a transfer recipient urgently ───
          needs_transfer_recipient: needsTransferRecipient,
        },
        referrals: enrichedReferrals,
        summary: {
          total: totalReferrals,
          active: activeReferrals,
          inactive: totalReferrals - activeReferrals,
          fullyPaid,
          month1Paid,
          unpaid,
          totalEarned,
          totalPending,
          potentialEarnings: totalEarned + totalPending,
        },
        // ─── NEW: Failed payouts that need attention ───
        failed_payouts: failedPayouts || [],
        has_failed_payouts: (failedPayouts || []).length > 0,
      }),
    };
  } catch (err) {
    console.error('get-affiliate-data error:', err.message);
    return { statusCode: 500, body: JSON.stringify({ error: err.message }) };
  }
};