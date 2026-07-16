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

    const from = (page - 1) * limit;
    const to = from + limit - 1;

    const { data, error, count } = await supabase
      .from("failed_payouts")
      .select("*", { count: "exact" })
      .eq("status", "pending")
      .order("created_at", { ascending: false })
      .range(from, to);

    if (error) throw error;

    return {
      statusCode: 200,
      body: JSON.stringify({
        payouts: data || [],
        total: count || 0,
        page,
        limit,
        totalPages: Math.ceil((count || 0) / limit),
      }),
    };
  } catch (err) {
    console.error("Admin failed payouts error:", err);
    return { statusCode: 500, body: JSON.stringify({ error: err.message }) };
  }
};
