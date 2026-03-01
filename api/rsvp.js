const parseJson = async (req) => {
  if (typeof req.body === "string") return JSON.parse(req.body || "{}");
  return req.body || {};
};

module.exports = async function handler(req, res) {
  if (req.method !== "POST") {
    res.setHeader("Allow", "POST");
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const payload = await parseJson(req);
    const webhookUrl = process.env.RSVP_WEBHOOK_URL;

    if (!webhookUrl) {
      return res.status(500).json({ error: "RSVP_WEBHOOK_URL is not set in Vercel." });
    }

    const upstream = await fetch(webhookUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload)
    });

    if (!upstream.ok) {
      return res.status(502).json({ error: "Failed to sync RSVP to spreadsheet." });
    }

    return res.status(200).json({ ok: true });
  } catch (error) {
    return res.status(500).json({ error: "Unexpected server error", details: error.message });
  }
};
