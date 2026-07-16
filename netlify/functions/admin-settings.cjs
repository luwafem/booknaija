const { createClient } = require('@supabase/supabase-js');
const { verifyAdmin } = require('./_utils/admin-utils.cjs');
const { validateCsrf } = require('./_utils/csrf.cjs');

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function logSystemEvent(level, source, message, metadata = {}) {
  try {
    await supabase.from('system_logs').insert({ level, source, message, metadata });
  } catch (err) { console.error('Log error:', err.message); }
}

exports.handler = async (event) => {
  try {
    const auth = verifyAdmin(event);
    if (!auth.valid) return { statusCode: 401, body: JSON.stringify({ error: auth.error }) };

    // GET: fetch all settings
    if (event.httpMethod === 'GET') {
      const { data, error } = await supabase
        .from('platform_settings')
        .select('*');
      if (error) throw error;
      const settings = {};
      data.forEach(row => { settings[row.key] = row.value; });
      return { statusCode: 200, body: JSON.stringify(settings) };
    }

    // POST: update a setting
    if (event.httpMethod === 'POST') {
      if (!validateCsrf(event)) {
        return { statusCode: 403, body: JSON.stringify({ error: 'Invalid CSRF token' }) };
      }
      const { key, value } = JSON.parse(event.body);
      if (!key) {
        return { statusCode: 400, body: JSON.stringify({ error: 'Missing key' }) };
      }

      const { error } = await supabase
        .from('platform_settings')
        .upsert({ key, value, updated_at: new Date().toISOString() })
        .select();

      if (error) throw error;

      await logSystemEvent('info', 'admin-settings', `Updated setting ${key} = ${value}`);
      return { statusCode: 200, body: JSON.stringify({ success: true }) };
    }

    return { statusCode: 405, body: JSON.stringify({ error: 'Method Not Allowed' }) };
  } catch (err) {
    console.error('Settings error:', err);
    return { statusCode: 500, body: JSON.stringify({ error: err.message }) };
  }
};