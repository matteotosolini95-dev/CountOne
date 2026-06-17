export const config = {
  api: {
    bodyParser: false,
  },
};

async function getRawBody(req) {
  return new Promise((resolve, reject) => {
    const chunks = [];
    req.on("data", (chunk) => chunks.push(chunk));
    req.on("end", () => resolve(Buffer.concat(chunks)));
    req.on("error", reject);
  });
}

async function verifyStripeSignature(rawBody, signature, secret) {
  const encoder = new TextEncoder();
  const parts = signature.split(",");
  let timestamp = "";
  let v1 = "";

  for (const part of parts) {
    if (part.startsWith("t=")) timestamp = part.slice(2);
    if (part.startsWith("v1=")) v1 = part.slice(3);
  }

  if (!timestamp || !v1) return false;

  const payload = `${timestamp}.${rawBody.toString()}`;
  const key = await crypto.subtle.importKey(
    "raw",
    encoder.encode(secret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"]
  );

  const sig = await crypto.subtle.sign("HMAC", key, encoder.encode(payload));
  const computed = Array.from(new Uint8Array(sig))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");

  return computed === v1;
}

async function getCount() {
  const SUPABASE_URL = process.env.SUPABASE_URL;
  const SUPABASE_KEY = process.env.SUPABASE_SERVICE_KEY;

  const res = await fetch(`${SUPABASE_URL}/rest/v1/Counter?id=eq.1&select=Count`, {
    headers: {
      apikey: SUPABASE_KEY,
      Authorization: `Bearer ${SUPABASE_KEY}`,
    },
  });
  const data = await res.json();
  return data[0]?.Count ?? 47;
}

async function incrementCount(current) {
  const SUPABASE_URL = process.env.SUPABASE_URL;
  const SUPABASE_KEY = process.env.SUPABASE_SERVICE_KEY;
  const newCount = current + 1;

  await fetch(`${SUPABASE_URL}/rest/v1/Counter?id=eq.1`, {
    method: "PATCH",
    headers: {
      apikey: SUPABASE_KEY,
      Authorization: `Bearer ${SUPABASE_KEY}`,
      "Content-Type": "application/json",
      Prefer: "return=minimal",
    },
    body: JSON.stringify({ Count: newCount }),
  });
  return newCount;
}

async function saveParticipant(number, nickname, email) {
  const SUPABASE_URL = process.env.SUPABASE_URL;
  const SUPABASE_KEY = process.env.SUPABASE_SERVICE_KEY;

  await fetch(`${SUPABASE_URL}/rest/v1/participants`, {
    method: "POST",
    headers: {
      apikey: SUPABASE_KEY,
      Authorization: `Bearer ${SUPABASE_KEY}`,
      "Content-Type": "application/json",
      Prefer: "return=minimal",
    },
    body: JSON.stringify({ number, nickname, email }),
  });
}

async function sendEmail(email, nick, number, date, prize) {
  const RESEND_KEY = process.env.RESEND_API_KEY;

  const prizeHtml = prize
    ? `<div style="background:#22C55E18;border:1px solid #22C55E55;border-radius:12px;padding:16px 20px;margin-bottom:24px;color:#22C55E;font-weight:600;">
        🎉 Hai vinto! Sei il partecipante #${number}. Ti contatteremo presto per il buono Amazon da 15€!
       </div>`
    : "";

  const html = `
<!DOCTYPE html>
<html>
<head><meta charset="UTF-8"></head>
<body style="background:#07070E;color:#EEEEF5;font-family:'Inter',sans-serif;margin:0;padding:40px 20px;">
  <div style="max-width:500px;margin:0 auto;">
    <h1 style="color:#F5A623;font-size:28px;font-weight:900;margin-bottom:8px;">CountOne</h1>
    <p style="color:#64648A;margin-bottom:32px;">Progetto collettivo globale</p>
    ${prizeHtml}
    <div style="background:#0F0F1A;border:1px solid #F5A62355;border-radius:20px;padding:32px 28px;margin-bottom:24px;">
      <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:32px;">
        <span style="font-weight:900;color:#F5A623;">CountOne</span>
        <span style="font-size:12px;color:#22C55E;background:#22C55E18;border:1px solid #22C55E44;border-radius:6px;padding:4px 10px;">✓ Verificato</span>
      </div>
      <div style="text-align:center;margin-bottom:28px;">
        <p style="font-size:12px;color:#64648A;text-transform:uppercase;letter-spacing:0.07em;margin-bottom:8px;">Il tuo numero</p>
        <div style="font-size:80px;font-weight:900;color:#F5A623;letter-spacing:-4px;line-height:1;">#${number}</div>
      </div>
      <hr style="border:none;border-top:1px solid #1A1A2E;margin-bottom:20px;">
      <div style="display:flex;justify-content:space-between;padding:10px 0;border-bottom:1px solid #1A1A2E;">
        <span style="color:#64648A;font-size:13px;">Partecipante</span>
        <span style="font-weight:600;font-size:13px;">${nick}</span>
      </div>
      <div style="display:flex;justify-content:space-between;padding:10px 0;">
        <span style="color:#64648A;font-size:13px;">Data e ora</span>
        <span style="font-weight:600;font-size:13px;">${date}</span>
      </div>
    </div>
    <p style="color:#64648A;font-size:12px;text-align:center;margin-top:32px;">CountOne · Progetto collettivo globale · 2026</p>
  </div>
</body>
</html>`;

  await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${RESEND_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      from: "CountOne <onboarding@resend.dev>",
      to: email,
      subject: `Il tuo certificato CountOne #${number}`,
      html,
    }),
  });
}

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const signature = req.headers["stripe-signature"];
  if (!signature) {
    return res.status(400).json({ error: "No signature" });
  }

  const rawBody = await getRawBody(req);
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

  const isValid = await verifyStripeSignature(rawBody, signature, webhookSecret);
  if (!isValid) {
    return res.status(400).json({ error: "Invalid signature" });
  }

  let event;
  try {
    event = JSON.parse(rawBody.toString());
  } catch {
    return res.status(400).json({ error: "Invalid JSON" });
  }

  if (event.type === "checkout.session.completed") {
    const session = event.data.object;
    const nick = session.metadata?.nick || session.customer_details?.name || "Anonimo";
    const email = session.customer_details?.email || session.metadata?.email || "";

    try {
      const currentCount = await getCount();
      const newCount = await incrementCount(currentCount);
      const date = new Date().toLocaleString("it-IT");
      const isPrize = newCount % 100 === 0;

      await saveParticipant(newCount, nick, email);
      if (email) {
        await sendEmail(email, nick, newCount, date, isPrize);
      }
    } catch (err) {
      console.error("Webhook processing error:", err);
      return res.status(500).json({ error: err.message });
    }
  }

  return res.status(200).json({ received: true });
}
