const { createClient } = require('@supabase/supabase-js');
const { verifyAdmin } = require('./_utils/admin-utils.cjs');

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

// Nigerian states list for filtering
const NIGERIAN_STATES = [
  'Abia', 'Adamawa', 'Akwa Ibom', 'Anambra', 'Bauchi', 'Bayelsa', 'Benue', 'Borno',
  'Cross River', 'Delta', 'Ebonyi', 'Edo', 'Ekiti', 'Enugu', 'Federal Capital Territory',
  'Gombe', 'Imo', 'Jigawa', 'Kaduna', 'Kano', 'Katsina', 'Kebbi', 'Kogi', 'Kwara',
  'Lagos', 'Nasarawa', 'Niger', 'Ogun', 'Ondo', 'Osun', 'Oyo', 'Plateau', 'Rivers',
  'Sokoto', 'Taraba', 'Yobe', 'Zamfara'
];

exports.handler = async (event) => {
  try {
    const auth = verifyAdmin(event);
    if (!auth.valid) return { statusCode: 401, body: JSON.stringify({ error: auth.error }) };

    if (event.httpMethod !== 'GET') {
      return { statusCode: 405, body: JSON.stringify({ error: 'Method Not Allowed' }) };
    }

    const { data, error } = await supabase
      .from('businesses')
      .select('location');

    if (error) throw error;

    // Extract state from location string
    const stateCounts = {};
    data.forEach((row) => {
      const loc = row.location || '';
      // Try to find a state name in the location
      let found = false;
      for (const state of NIGERIAN_STATES) {
        if (loc.toLowerCase().includes(state.toLowerCase())) {
          stateCounts[state] = (stateCounts[state] || 0) + 1;
          found = true;
          break;
        }
      }
      if (!found) {
        stateCounts['Other'] = (stateCounts['Other'] || 0) + 1;
      }
    });

    // Convert to array for chart
    const geoData = Object.entries(stateCounts).map(([state, count]) => ({ state, count }));
    geoData.sort((a, b) => b.count - a.count);

    return {
      statusCode: 200,
      body: JSON.stringify({ geoData }),
    };
  } catch (err) {
    console.error('Geo error:', err);
    return { statusCode: 500, body: JSON.stringify({ error: err.message }) };
  }
};