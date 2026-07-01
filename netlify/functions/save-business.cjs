// netlify/functions/save-business.cjs
const { createClient } = require('@supabase/supabase-js');
const bcrypt = require('bcryptjs');
const xss = require('xss');
const cookie = require('cookie');

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

// ─── FEATURE FLAGS ───
function getFeaturesForType(type) {
  switch (type) {
    case 'Fashion':
    case 'Lash Artist':
    case 'Hair Stylist':
    case 'Makeup Artist':
    case 'Nail Technician':
    case 'Skin Care':
      return { services_enabled: true, products_enabled: true, cars_enabled: false, food_enabled: false, properties_enabled: false, estates_enabled: false };
    case 'Cleaner':
    case 'Tutor':
      return { services_enabled: true, products_enabled: false, cars_enabled: false, food_enabled: false, properties_enabled: false, estates_enabled: false };
    case 'Restaurant':
      return { services_enabled: false, products_enabled: false, cars_enabled: false, food_enabled: true, properties_enabled: false, estates_enabled: false };
    case 'Auto':
      return { services_enabled: false, products_enabled: false, cars_enabled: true, food_enabled: false, properties_enabled: false, estates_enabled: false };
    case 'Real Estate':
    case 'Shortlet':
      return { services_enabled: false, products_enabled: false, cars_enabled: false, food_enabled: false, properties_enabled: true, estates_enabled: true };
    default:
      return { services_enabled: true, products_enabled: true, cars_enabled: false, food_enabled: false, properties_enabled: false, estates_enabled: false };
  }
}

// ─── HELPERS FOR GRANULAR SYNC ───
function toSnakeCase(str) {
  return str.replace(/[A-Z]/g, letter => `_${letter.toLowerCase()}`);
}

async function syncItems(table, idField, businessId, newItems) {
  if (!newItems || !Array.isArray(newItems)) return;

  // Fetch existing items to get allowed columns and existing data
  const { data: existing, error } = await supabase
    .from(table)
    .select('*')
    .eq('business_id', businessId);

  if (error) {
    console.error(`Error fetching existing ${table}:`, error);
    return;
  }

  const existingMap = new Map(existing.map(item => [item[idField], item]));
  const newMap = new Map(newItems.map(item => [item.id, item]));

  // Get allowed columns from existing (or fallback to common columns)
  const allowedColumns = existing.length > 0
    ? Object.keys(existing[0])
    : null;

  // Delete removed items
  for (const [id] of existingMap) {
    if (!newMap.has(id)) {
      const { error: delErr } = await supabase
        .from(table)
        .delete()
        .eq('business_id', businessId)
        .eq(idField, id);
      if (delErr) console.error(`Delete error ${table}:`, delErr);
      else console.log(`Deleted ${table} ${idField}: ${id}`);
    }
  }

  // Insert or update
  for (const [id, item] of newMap) {
    // Prepare db item: map `id` to `idField`
    const dbItem = { ...item };
    dbItem[idField] = dbItem.id;
    delete dbItem.id;
    dbItem.business_id = businessId;

    // Convert camelCase keys to snake_case and filter out auto timestamps
    const newDbItem = {};
    for (const [key, value] of Object.entries(dbItem)) {
      // Skip auto-managed timestamps
      if (['created_at', 'updated_at', 'createdAt', 'updatedAt'].includes(key)) {
        continue;
      }
      const snakeKey = toSnakeCase(key);
      // If allowedColumns is known, only include if in allowedColumns
      if (allowedColumns && !allowedColumns.includes(snakeKey)) {
        continue;
      }
      newDbItem[snakeKey] = value;
    }

    const existingItem = existingMap.get(id);
    if (existingItem) {
      // Compute diff using newDbItem
      const diff = {};
      for (const key of Object.keys(newDbItem)) {
        if (newDbItem[key] !== existingItem[key]) {
          diff[key] = newDbItem[key];
        }
      }
      if (Object.keys(diff).length > 0) {
        const { error: updErr } = await supabase
          .from(table)
          .update(diff)
          .eq('business_id', businessId)
          .eq(idField, id);
        if (updErr) console.error(`Update error ${table}:`, updErr);
        else console.log(`Updated ${table} ${idField}: ${id} (fields: ${Object.keys(diff).join(', ')})`);
      }
    } else {
      const { error: insErr } = await supabase
        .from(table)
        .insert(newDbItem);
      if (insErr) console.error(`Insert error ${table}:`, insErr);
      else console.log(`Inserted ${table} ${idField}: ${id}`);
    }
  }
}

// ─── HANDLER ───
exports.handler = async function (event) {
  console.log('=== SAVE-BUSINESS ===');

  try {
    // ─── CSRF PROTECTION ───
    const cookies = cookie.parse(event.headers.cookie || '');
    const csrfCookie = cookies.csrf_token;
    const csrfHeader = event.headers['x-csrf-token'];

    if (!csrfCookie || !csrfHeader || csrfCookie !== csrfHeader) {
      console.warn('CSRF validation failed');
      return {
        statusCode: 403,
        body: JSON.stringify({ error: 'Invalid security token. Please refresh and try again.' }),
      };
    }

    // ─── Parse and sanitise full payload ───
    let d = JSON.parse(event.body);
    d = sanitizeDeep(d);

    const { slug } = d;
    if (!slug) {
      return { statusCode: 400, body: JSON.stringify({ error: 'Missing slug' }) };
    }

    // ─── Fetch existing business ───
    const { data: existingBiz, error: fetchError } = await supabase
      .from('businesses')
      .select('*')
      .eq('slug', slug)
      .single();

    if (fetchError && fetchError.code !== 'PGRST116') {
      console.error('Fetch error:', fetchError);
      return { statusCode: 500, body: JSON.stringify({ error: fetchError.message }) };
    }

    const isNew = !existingBiz;

    // ─── Build business payload from full payload ───
    let bizPayload = {};
    const allowedFields = [
      'name', 'logo', 'tagline', 'bio', 'phone', 'whatsapp', 'email',
      'location', 'lat', 'lng', 'hours', 'accent', 'theme',
      'google_maps_claimed', 'hero', 'hero_slides', 'team',
      'subaccount_code', 'calendar_id', 'account_name', 'account_number',
      'settlement_bank', 'active', 'ads_enabled', 'business_type',
      'services_enabled', 'products_enabled', 'cars_enabled',
      'food_enabled', 'properties_enabled', 'estates_enabled',
      'socials', 'gallery', 'security_code', 'security_question_1',
      'security_answer_1', 'security_question_2', 'security_answer_2'
    ];

    if (isNew) {
      // New business – use derived defaults
      const businessType = d.businessType || d.business_type || '';
      const derived = getFeaturesForType(businessType);

      for (const field of allowedFields) {
        if (d[field] !== undefined) {
          bizPayload[field] = d[field];
        }
      }
      // Ensure required fields
      bizPayload.slug = d.slug;
      bizPayload.active = true;
      bizPayload.subscription_ends_at = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString();
      // Apply derived feature flags if not explicitly set
      if (bizPayload.services_enabled === undefined) bizPayload.services_enabled = derived.services_enabled;
      if (bizPayload.products_enabled === undefined) bizPayload.products_enabled = derived.products_enabled;
      if (bizPayload.cars_enabled === undefined) bizPayload.cars_enabled = derived.cars_enabled;
      if (bizPayload.food_enabled === undefined) bizPayload.food_enabled = derived.food_enabled;
      if (bizPayload.properties_enabled === undefined) bizPayload.properties_enabled = derived.properties_enabled;
      if (bizPayload.estates_enabled === undefined) bizPayload.estates_enabled = derived.estates_enabled;
      // Security hashing
      if (bizPayload.security_code) {
        bizPayload.security_code_hash = bcrypt.hashSync(bizPayload.security_code, 10);
      }
      if (bizPayload.security_answer_1) {
        const trimmed = bizPayload.security_answer_1.toLowerCase().trim();
        bizPayload.security_answer_1 = trimmed;
        bizPayload.security_answer_1_hash = bcrypt.hashSync(trimmed, 10);
      }
      if (bizPayload.security_answer_2) {
        const trimmed = bizPayload.security_answer_2.toLowerCase().trim();
        bizPayload.security_answer_2 = trimmed;
        bizPayload.security_answer_2_hash = bcrypt.hashSync(trimmed, 10);
      }
      // Affiliate
      if (d.referredBy && d.referredBy.startsWith('aff_')) {
        bizPayload.referred_by_affiliate = d.referredBy;
        bizPayload.affiliate_bounty_paid = true;
      }
      // Remove security plaintext if hash exists (optional)
      if (bizPayload.security_code_hash) delete bizPayload.security_code;
      if (bizPayload.security_answer_1_hash) delete bizPayload.security_answer_1;
      if (bizPayload.security_answer_2_hash) delete bizPayload.security_answer_2;
    } else {
      // Existing business – only changed fields (full payload diff)
      for (const field of allowedFields) {
        if (d[field] !== undefined && d[field] !== existingBiz[field]) {
          let value = d[field];
          // Handle security hashing
          if (field === 'security_code' && value) {
            bizPayload.security_code = value; // keep plaintext for backward compatibility
            bizPayload.security_code_hash = bcrypt.hashSync(value, 10);
          } else if (field === 'security_answer_1' && value) {
            const trimmed = value.toLowerCase().trim();
            bizPayload.security_answer_1 = trimmed;
            bizPayload.security_answer_1_hash = bcrypt.hashSync(trimmed, 10);
          } else if (field === 'security_answer_2' && value) {
            const trimmed = value.toLowerCase().trim();
            bizPayload.security_answer_2 = trimmed;
            bizPayload.security_answer_2_hash = bcrypt.hashSync(trimmed, 10);
          } else {
            bizPayload[field] = value;
          }
        }
      }
      // Remove undefined values
      for (const key of Object.keys(bizPayload)) {
        if (bizPayload[key] === undefined) {
          delete bizPayload[key];
        }
      }
    }

    // ─── Insert or update business ───
    let businessId;
    if (isNew) {
      const { data: newRow, error: insertErr } = await supabase
        .from('businesses')
        .insert(bizPayload)
        .select()
        .single();

      if (insertErr) {
        console.error('Insert error:', insertErr);
        throw insertErr;
      }
      businessId = newRow.id;
    } else {
      if (Object.keys(bizPayload).length > 0) {
        const { error: updateErr } = await supabase
          .from('businesses')
          .update(bizPayload)
          .eq('slug', slug);

        if (updateErr) {
          console.error('Update error:', updateErr);
          throw updateErr;
        }
      }
      // Fetch the row to get the ID
      const { data: updatedRow, error: fetchAfterUpdate } = await supabase
        .from('businesses')
        .select('id')
        .eq('slug', slug)
        .single();

      if (fetchAfterUpdate) {
        console.error('Fetch after update error:', fetchAfterUpdate);
        throw fetchAfterUpdate;
      }
      businessId = updatedRow.id;
    }

    // ─── Referral tracking (only for new businesses) ───
    if (isNew && d.referredBy && d.referredBy !== slug && !d.referredBy.startsWith('aff_')) {
      try {
        const { data: referrer, error: refErr } = await supabase
          .from('businesses')
          .select('id, referral_count, subscription_ends_at')
          .eq('slug', d.referredBy)
          .single();

        if (!refErr && referrer) {
          const newCount = (referrer.referral_count || 0) + 1;
          const updateData = { referral_count: newCount };
          if (newCount % 3 === 0) {
            updateData.subscription_ends_at = new Date(
              new Date(referrer.subscription_ends_at || Date.now()).getTime() + 30 * 24 * 60 * 60 * 1000
            ).toISOString();
          }
          await supabase.from('businesses').update(updateData).eq('id', referrer.id);
          console.log(`Referral count updated for ${d.referredBy} to ${newCount}`);
        }
      } catch (refErr) {
        console.error('Referral error:', refErr.message);
      }
    }

    // ─── Sync related tables using full arrays from payload ───
    if (d.services) await syncItems('business_services', 'service_id', businessId, d.services);
    if (d.products) await syncItems('business_products', 'product_id', businessId, d.products);
    if (d.cars) await syncItems('business_cars', 'car_id', businessId, d.cars);
    if (d.food) await syncItems('business_food', 'food_id', businessId, d.food);
    if (d.properties) await syncItems('business_properties', 'property_id', businessId, d.properties);
    if (d.estates) await syncItems('business_estates', 'estate_id', businessId, d.estates);

    console.log('=== DONE: ' + slug + ' ===');

    return {
      statusCode: 200,
      body: JSON.stringify({ ok: true, slug }),
    };

  } catch (err) {
    console.error('=== UNCAUGHT ERROR ===');
    console.error(err.message);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: err.message }),
    };
  }
};