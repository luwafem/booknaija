const { createClient } = require("@supabase/supabase-js");
const { verifyAdmin } = require("./_utils/admin-utils.cjs");
const { validateCsrf } = require("./_utils/csrf.cjs"); // 👈 CSRF validation

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY,
);

// ─── Helper to log actions to system_logs ────────────────
async function logSystemEvent(level, source, message, metadata = {}) {
  try {
    await supabase.from("system_logs").insert({
      level,
      source,
      message,
      metadata,
    });
  } catch (err) {
    console.error("Failed to log system event:", err.message);
  }
}

async function sendTransfer(recipientCode, amountKobo, reason) {
  const secretKey = process.env.PAYSTACK_SECRET_KEY;
  if (!secretKey) throw new Error("PAYSTACK_SECRET_KEY not set");

  const res = await fetch("https://api.paystack.co/transfer", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${secretKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      source: "balance",
      amount: amountKobo,
      recipient: recipientCode,
      reason,
      currency: "NGN",
    }),
  });

  const data = await res.json();
  if (!data.status) {
    throw new Error(data.message || "Transfer failed");
  }
  return data.data;
}

exports.handler = async (event) => {
  try {
    const auth = verifyAdmin(event);
    if (!auth.valid) {
      return { statusCode: 401, body: JSON.stringify({ error: auth.error }) };
    }

    if (event.httpMethod !== "POST") {
      return {
        statusCode: 405,
        body: JSON.stringify({ error: "Method Not Allowed" }),
      };
    }

    // 🔒 CSRF protection
    if (!validateCsrf(event)) {
      return {
        statusCode: 403,
        body: JSON.stringify({
          error: "Invalid security token. Please refresh and try again.",
        }),
      };
    }

    let body;
    try {
      body = JSON.parse(event.body);
    } catch (_) {
      return {
        statusCode: 400,
        body: JSON.stringify({ error: "Invalid JSON body" }),
      };
    }

    const { payoutId } = body;
    if (!payoutId) {
      return {
        statusCode: 400,
        body: JSON.stringify({ error: "Missing payoutId" }),
      };
    }

    // Fetch the failed payout
    const { data: payout, error: fetchErr } = await supabase
      .from("failed_payouts")
      .select("*")
      .eq("id", payoutId)
      .eq("status", "pending")
      .single();

    if (fetchErr || !payout) {
      return {
        statusCode: 404,
        body: JSON.stringify({
          error: "Failed payout not found or already resolved",
        }),
      };
    }

    // Fetch affiliate's transfer recipient code
    const { data: affiliate, error: affErr } = await supabase
      .from("affiliates")
      .select("transfer_recipient_code")
      .eq("id", payout.affiliate_id)
      .single();

    if (affErr || !affiliate || !affiliate.transfer_recipient_code) {
      await supabase
        .from("failed_payouts")
        .update({
          reason: `${payout.reason} - RETRY FAILED: Missing transfer recipient code`,
          status: "failed",
        })
        .eq("id", payoutId);

      await logSystemEvent(
        "error",
        "admin-retry-payout",
        `Retry failed for payout ${payoutId}: Affiliate ${payout.affiliate_id} missing transfer recipient code`,
        { payoutId, affiliateId: payout.affiliate_id },
      );

      return {
        statusCode: 400,
        body: JSON.stringify({
          error:
            "Affiliate has no transfer recipient code. Manual intervention required.",
        }),
      };
    }

    // Retry the transfer
    const amountKobo = payout.amount * 100;
    const reason = `Admin retry: ${payout.reason} (Original: ${payout.business_slug})`;

    let transferResult;
    try {
      transferResult = await sendTransfer(
        affiliate.transfer_recipient_code,
        amountKobo,
        reason,
      );
    } catch (transferErr) {
      await supabase
        .from("failed_payouts")
        .update({
          reason: `${payout.reason} - RETRY FAILED: ${transferErr.message}`,
          status: "failed",
        })
        .eq("id", payoutId);

      await logSystemEvent(
        "error",
        "admin-retry-payout",
        `Transfer failed for payout ${payoutId}: ${transferErr.message}`,
        { payoutId, error: transferErr.message },
      );

      return {
        statusCode: 400,
        body: JSON.stringify({
          error: `Transfer failed: ${transferErr.message}`,
        }),
      };
    }

    // Mark payout as resolved
    await supabase
      .from("failed_payouts")
      .update({
        status: "resolved",
        reason: `${payout.reason} - RETRY SUCCESS. Transfer ref: ${transferResult.reference || "N/A"}`,
      })
      .eq("id", payoutId);

    // Log success
    await logSystemEvent(
      "info",
      "admin-retry-payout",
      `Payout ${payoutId} retried successfully. Transfer ref: ${transferResult.reference || "N/A"}`,
      { payoutId, transferRef: transferResult.reference },
    );

    // Optional: update affiliate_commission_month on the business
    if (payout.business_slug) {
      let monthToSet = null;
      try {
        const details =
          typeof payout.details === "string"
            ? JSON.parse(payout.details)
            : payout.details;
        if (details && details.newMonth !== undefined) {
          monthToSet = details.newMonth;
        }
      } catch (_) {}

      if (monthToSet !== null) {
        await supabase
          .from("businesses")
          .update({ affiliate_commission_month: monthToSet })
          .eq("slug", payout.business_slug)
          .lt("affiliate_commission_month", monthToSet);
      }
    }

    return {
      statusCode: 200,
      body: JSON.stringify({
        success: true,
        message: "Payout retried successfully",
        transfer: transferResult,
      }),
    };
  } catch (err) {
    console.error("Admin retry payout error:", err);
    await logSystemEvent("error", "admin-retry-payout", err.message, { event });
    return { statusCode: 500, body: JSON.stringify({ error: err.message }) };
  }
};
