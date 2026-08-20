const { createClient } = require('@supabase/supabase-js');
const { verifyAdmin } = require('./_utils/admin-utils.cjs');
const { validateCsrf } = require('./_utils/csrf.cjs');
const { Resend } = require('resend');

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

// ─── Helper to log actions to system_logs ────────────────
async function logSystemEvent(level, source, message, metadata = {}) {
  try {
    await supabase.from('system_logs').insert({
      level,
      source,
      message,
      metadata,
    });
  } catch (err) {
    console.error('Failed to log system event:', err.message);
  }
}

// ─── Helper to send email to business ─────────────────────
async function notifyBusiness(email, name, subject, html, text) {
  try {
    const resend = new Resend(process.env.RESEND_API_KEY);
    await resend.emails.send({
      from: process.env.EMAIL_FROM || 'Five9 <noreply@five9.com.ng>',
      to: email,
      subject,
      html,
      text: text || undefined, // fallback if text not provided
    });
  } catch (err) {
    console.error('Failed to send notification email:', err.message);
  }
}

exports.handler = async (event) => {
  console.log('📨 admin-businesses called with method:', event.httpMethod);
  try {
    const auth = verifyAdmin(event);
    if (!auth.valid) {
      return { statusCode: 401, body: JSON.stringify({ error: auth.error }) };
    }

    // ─── GET: List businesses ──────────────────────────────
    if (event.httpMethod === 'GET') {
      console.log('✅ Handling GET request');
      const params = event.queryStringParameters || {};
      const page = Math.max(1, parseInt(params.page) || 1);
      const limit = Math.min(100, Math.max(1, parseInt(params.limit) || 20));
      const search = params.search || '';
      const filterActive = params.active; // 'true' or 'false'
      const businessType = params.businessType; // filter by business_type

      let query = supabase
        .from('businesses')
        .select('*', { count: 'exact' })
        .order('created_at', { ascending: false });

      if (search) {
        query = query.or(`name.ilike.%${search}%,slug.ilike.%${search}%,email.ilike.%${search}%`);
      }

      if (filterActive === 'true') query = query.eq('active', true);
      else if (filterActive === 'false') query = query.eq('active', false);

      if (businessType) {
        query = query.eq('business_type', businessType);
      }

      const from = (page - 1) * limit;
      const to = from + limit - 1;
      query = query.range(from, to);

      const { data, error, count } = await query;
      if (error) throw error;

      return {
        statusCode: 200,
        body: JSON.stringify({
          businesses: data || [],
          total: count || 0,
          page,
          limit,
          totalPages: Math.ceil((count || 0) / limit),
        }),
      };
    }

    // ─── POST: Perform actions ─────────────────────────────
    if (event.httpMethod === 'POST') {
      console.log('✅ Handling POST request');
      // 🔒 CSRF protection
      if (!validateCsrf(event)) {
        return {
          statusCode: 403,
          body: JSON.stringify({ error: 'Invalid security token. Please refresh and try again.' }),
        };
      }

      const body = JSON.parse(event.body);
      const { slug, action } = body;

      if (!slug || !action) {
        return { statusCode: 400, body: JSON.stringify({ error: 'Missing slug or action' }) };
      }

      let updatePayload = {};
      let logMessage = '';

      // ── toggle_active ──
      if (action === 'toggle_active') {
        const { data: biz } = await supabase
          .from('businesses')
          .select('active')
          .eq('slug', slug)
          .single();
        if (!biz) return { statusCode: 404, body: JSON.stringify({ error: 'Business not found' }) };
        updatePayload.active = !biz.active;
        logMessage = `Toggled active status for ${slug} → ${updatePayload.active}`;
      }

      // ── extend ── (30 days)
      else if (action === 'extend') {
        const { data: biz } = await supabase
          .from('businesses')
          .select('subscription_ends_at')
          .eq('slug', slug)
          .single();
        if (!biz) return { statusCode: 404, body: JSON.stringify({ error: 'Business not found' }) };
        const currentEnd = biz.subscription_ends_at ? new Date(biz.subscription_ends_at) : new Date();
        const newEnd = new Date(currentEnd.getTime() + 30 * 24 * 60 * 60 * 1000);
        updatePayload.subscription_ends_at = newEnd.toISOString();
        updatePayload.active = true;
        logMessage = `Extended subscription for ${slug} until ${newEnd.toISOString()}`;
      }

      // ── extend_custom ── (custom days)
      else if (action === 'extend_custom') {
        const { days } = body;
        if (!days || days <= 0) {
          return { statusCode: 400, body: JSON.stringify({ error: 'Missing or invalid days' }) };
        }
        const { data: biz } = await supabase
          .from('businesses')
          .select('subscription_ends_at')
          .eq('slug', slug)
          .single();
        if (!biz) return { statusCode: 404, body: JSON.stringify({ error: 'Business not found' }) };
        const currentEnd = biz.subscription_ends_at ? new Date(biz.subscription_ends_at) : new Date();
        const newEnd = new Date(currentEnd.getTime() + days * 24 * 60 * 60 * 1000);
        updatePayload.subscription_ends_at = newEnd.toISOString();
        updatePayload.active = true;
        logMessage = `Extended subscription for ${slug} by ${days} days until ${newEnd.toISOString()}`;
      }

      // ── override_end_date ── (specific date)
      else if (action === 'override_end_date') {
        const { endDate } = body;
        if (!endDate) {
          return { statusCode: 400, body: JSON.stringify({ error: 'Missing endDate' }) };
        }
        const parsedDate = new Date(endDate);
        if (isNaN(parsedDate.getTime())) {
          return { statusCode: 400, body: JSON.stringify({ error: 'Invalid endDate format' }) };
        }
        updatePayload.subscription_ends_at = parsedDate.toISOString();
        updatePayload.active = true;
        logMessage = `Overrode end date for ${slug} to ${parsedDate.toISOString()}`;
      }

      // ── update (edit business fields) ──
      else if (action === 'update') {
        const { data: fields } = body;
        if (!fields || typeof fields !== 'object') {
          return { statusCode: 400, body: JSON.stringify({ error: 'Missing update data' }) };
        }
        const allowedFields = ['name', 'email', 'phone', 'location', 'tagline', 'bio', 'logo', 'business_type'];
        const updateData = {};
        for (const field of allowedFields) {
          if (fields[field] !== undefined) {
            updateData[field] = fields[field];
          }
        }
        if (Object.keys(updateData).length === 0) {
          return { statusCode: 400, body: JSON.stringify({ error: 'No valid fields to update' }) };
        }
        updatePayload = updateData;
        logMessage = `Updated business ${slug}: ${Object.keys(updateData).join(', ')}`;
      }

      // ── domain_action ──
      else if (action === 'domain_action') {
        const { domainAction, dnsRecords, notes } = body;
        if (!domainAction) {
          return { statusCode: 400, body: JSON.stringify({ error: 'Missing domainAction' }) };
        }

        if (domainAction === 'approve') {
          updatePayload.custom_domain_status = 'approved';
          if (dnsRecords) {
            updatePayload.dns_records = dnsRecords;
          }
          if (notes) updatePayload.custom_domain_notes = notes;
          logMessage = `Approved custom domain for ${slug}`;
        } else if (domainAction === 'reject') {
          updatePayload.custom_domain_status = 'rejected';
          if (notes) updatePayload.custom_domain_notes = notes;
          logMessage = `Rejected custom domain for ${slug}`;
        } else if (domainAction === 'verify') {
          updatePayload.custom_domain_status = 'verified';
          logMessage = `Verified custom domain for ${slug}`;
        } else {
          return { statusCode: 400, body: JSON.stringify({ error: 'Invalid domainAction' }) };
        }

        // Execute the update
        const { error } = await supabase
          .from('businesses')
          .update(updatePayload)
          .eq('slug', slug);
        if (error) throw error;

        // ─── Notify the business via email ──────────────────
        try {
          const { data: biz } = await supabase
            .from('businesses')
            .select('email, name')
            .eq('slug', slug)
            .single();

          if (biz?.email) {
            const subject = domainAction === 'approve' ? 'Custom domain approved' : 'Custom domain request update';
            
            // Build HTML and plain text versions
            let html = `<p>Hi ${biz.name},</p><p>Your custom domain request has been <strong>${domainAction}d</strong>.</p>`;
            let text = `Hi ${biz.name},\n\nYour custom domain request has been ${domainAction}d.\n\n`;

            if (domainAction === 'approve') {
              const records = dnsRecords ? JSON.stringify(dnsRecords, null, 2) : '';
              html += `<p>Here are the DNS records to add to your domain registrar:</p><pre>${records}</pre>`;
              text += `Here are the DNS records to add to your domain registrar:\n${records}\n\n`;
            }
            if (notes) {
              html += `<p>Admin note: ${notes}</p>`;
              text += `Admin note: ${notes}\n\n`;
            }
            if (domainAction === 'verify') {
              html += `<p>Your domain is now live and routing to Five9. 🎉</p>`;
              text += `Your domain is now live and routing to Five9. 🎉\n\n`;
            }
            html += `<p>If you have any questions, reply to this email.</p>`;
            text += `If you have any questions, reply to this email.\n\n— Five9 Team`;

            await notifyBusiness(biz.email, biz.name, subject, html, text);
          }
        } catch (notifyErr) {
          console.error('Failed to send domain action notification:', notifyErr.message);
          // Non‑critical – continue
        }

        // Log the action
        await logSystemEvent('info', 'admin-businesses', logMessage, { slug, domainAction, notes });
        return {
          statusCode: 200,
          body: JSON.stringify({ success: true, updated: updatePayload }),
        };
      }

      // ── Unknown action ──
      else {
        return { statusCode: 400, body: JSON.stringify({ error: 'Invalid action' }) };
      }

      // ─── Execute the update (for non-domain actions) ──────
      const { error } = await supabase
        .from('businesses')
        .update(updatePayload)
        .eq('slug', slug);
      if (error) throw error;

      // ─── Log the action ──────────────────────────────────
      await logSystemEvent('info', 'admin-businesses', logMessage, { slug, action, updatePayload });

      return {
        statusCode: 200,
        body: JSON.stringify({ success: true, updated: updatePayload }),
      };
    }

    // ─── Method not allowed ──────────────────────────────
    console.warn('⚠️ Method not allowed:', event.httpMethod);
    return { statusCode: 405, body: JSON.stringify({ error: 'Method Not Allowed' }) };
  } catch (err) {
    console.error('🔥 Admin businesses error:', err);
    await logSystemEvent('error', 'admin-businesses', err.message, { event });
    return { statusCode: 500, body: JSON.stringify({ error: err.message }) };
  }
};