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
    ? `<div style="background:linear-gradient(135deg,#22C55E22,#22C55E11);border:1px solid #22C55E55;border-radius:14px;padding:18px 22px;margin-bottom:24px;color:#4ADE80;font-weight:600;font-size:14px;display:flex;align-items:center;gap:10px;">
        <span style="font-size:22px;">🎉</span>
        <span>Complimenti! Il numero ${number} vince un buono Amazon da 15€. Ti contatteremo a questa email per consegnartelo.</span>
       </div>`
    : "";

  const html = `
<!DOCTYPE html>
<html>
<head><meta charset="UTF-8"></head>
<body style="background:#07070E;color:#EEEEF5;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;margin:0;padding:48px 20px;">
  <div style="max-width:480px;margin:0 auto;">
    <div style="text-align:center;margin-bottom:28px;">
      <div style="font-size:22px;font-weight:900;color:#F5A623;letter-spacing:-0.5px;">CountOne</div>
      <div style="font-size:13px;color:#64648A;margin-top:4px;">Il tuo certificato è pronto</div>
    </div>

    ${prizeHtml}

    <div style="background:linear-gradient(160deg,#13131F,#0A0A12);border:1px solid #F5A62340;border-radius:24px;padding:36px 30px;box-shadow:0 20px 60px -20px #00000080;">
      <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:30px;">
        <span style="font-weight:900;color:#F5A623;font-size:15px;">CountOne</span>
        <span style="font-size:11px;color:#4ADE80;background:#22C55E18;border:1px solid #22C55E40;border-radius:20px;padding:5px 12px;font-weight:600;">✓ Pagamento verificato</span>
      </div>

      <div style="text-align:center;margin-bottom:30px;">
        <p style="font-size:11px;color:#64648A;text-transform:uppercase;letter-spacing:0.1em;margin:0 0 10px;">Numero ufficiale</p>
        <div style="font-size:84px;font-weight:900;color:#F5A623;letter-spacing:-4px;line-height:1;text-shadow:0 0 40px #F5A62355;">#${number}</div>
      </div>

      <div style="border-top:1px solid #1E1E2E;padding-top:20px;">
        <div style="display:flex;justify-content:space-between;padding:9px 0;">
          <span style="color:#64648A;font-size:13px;">Partecipante</span>
          <span style="font-weight:600;font-size:13px;color:#EEEEF5;">${nick}</span>
        </div>
        <div style="display:flex;justify-content:space-between;padding:9px 0;">
          <span style="color:#64648A;font-size:13px;">Data</span>
          <span style="font-weight:600;font-size:13px;color:#EEEEF5;">${date}</span>
        </div>
        <div style="display:flex;justify-content:space-between;padding:9px 0;">
          <span style="color:#64648A;font-size:13px;">Importo</span>
          <span style="font-weight:600;font-size:13px;color:#EEEEF5;">1,00 €</span>
        </div>
      </div>
    </div>

    <p style="color:#45455A;font-size:11px;text-align:center;margin-top:28px;line-height:1.6;">
      Questo certificato conferma la tua partecipazione al progetto collettivo CountOne.<br>
      countone.org
    </p>
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
      subject: `🎖️ Il tuo certificato CountOne — Numero #${number}`,
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
    const nick = session.client_reference_id || session.customer_details?.name || "Anonimo";
    const email = session.customer_details?.email || session.metadata?.email || "";

    try {
      const currentCount = await getCount();
      const newCount = await incrementCount(currentCount);
      const date = new Date().toLocaleString("it-IT", {
        day: "numeric",
        month: "long",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      });
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
