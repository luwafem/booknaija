const { createClient } = require("@supabase/supabase-js");
const { verifyAdmin } = require("./_utils/admin-utils.cjs");

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY,
);

exports.handler = async (event) => {
  try {
    const auth = verifyAdmin(event);
    if (!auth.valid) {
      return { statusCode: 401, body: JSON.stringify({ error: auth.error }) };
    }

    if (event.httpMethod !== "GET") {
      return {
        statusCode: 405,
        body: JSON.stringify({ error: "Method Not Allowed" }),
      };
    }

    const params = event.queryStringParameters || {};
    const page = Math.max(1, parseInt(params.page) || 1);
    const limit = Math.min(100, Math.max(1, parseInt(params.limit) || 20));
    const search = params.search || "";

    let query = supabase
      .from("affiliates")
      .select("*", { count: "exact" })
      .order("created_at", { ascending: false });

    if (search) {
      query = query.or(`name.ilike.%${search}%,email.ilike.%${search}%`);
    }

    const from = (page - 1) * limit;
    const to = from + limit - 1;
    query = query.range(from, to);

    const { data, error, count } = await query;
    if (error) throw error;

    // Get referral counts and pending payouts per affiliate
    const affiliatesWithStats = await Promise.all(
      (data || []).map(async (aff) => {
        const { count: referralCount } = await supabase
          .from("businesses")
          .select("*", { count: "exact", head: true })
          .eq("referred_by_affiliate", aff.id);

        const { data: failedPayouts } = await supabase
          .from("failed_payouts")
          .select("id")
          .eq("affiliate_id", aff.id)
          .eq("status", "pending");

        return {
          ...aff,
          referral_count: referralCount || 0,
          pending_payouts: failedPayouts ? failedPayouts.length : 0,
        };
      }),
    );

    return {
      statusCode: 200,
      body: JSON.stringify({
        affiliates: affiliatesWithStats,
        total: count || 0,
        page,
        limit,
        totalPages: Math.ceil((count || 0) / limit),
      }),
    };
  } catch (err) {
    console.error("Admin affiliates error:", err);
    return { statusCode: 500, body: JSON.stringify({ error: err.message }) };
  }
};
