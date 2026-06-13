export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const { email, nick, number, date, prize } = req.body;

  if (!email || !nick || !number) {
    return res.status(400).json({ error: "Missing fields" });
  }

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
      
      <div style="display:flex;justify-content:space-between;padding:10px 0;border-bottom:1px solid #1A1A2E;">
        <span style="color:#64648A;font-size:13px;">Data e ora</span>
        <span style="font-weight:600;font-size:13px;">${date}</span>
      </div>
      
    </div>
    
    <p style="color:#64648A;font-size:12px;text-align:center;margin-top:32px;">
      CountOne · Progetto collettivo globale · 2026
    </p>
    
  </div>
</body>
</html>
  `;

  try {
    const response = await fetch("https://api.resend.com/emails", {
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

    if (!response.ok) {
      const err = await response.json();
      return res.status(500).json({ error: err });
    }

    return res.status(200).json({ success: true });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
}
