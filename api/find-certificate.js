// Cerca il certificato più recente per una data email, generato dal webhook
// negli ultimi minuti. Usato dal client per recuperare il proprio numero al
// ritorno da Stripe, senza dipendere da sessionStorage (che su alcuni browser
// mobile non sopravvive sempre a un redirect cross-domain).
//
// Sicurezza: questo endpoint NON permette di leggere il certificato di
// qualcun altro a caso — richiede di conoscere l'email esatta, e restituisce
// solo un risultato se il record è stato creato negli ultimi 10 minuti
// (quindi è utile solo nella finestra immediatamente successiva a un vero
// pagamento, non per esplorare dati storici di altri utenti).

export default async function handler(req, res) {
  if (req.method !== "GET") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const { email } = req.query;
  if (!email) {
    return res.status(400).json({ error: "Missing email" });
  }

  const SUPABASE_URL = process.env.SUPABASE_URL;
  const SUPABASE_KEY = process.env.SUPABASE_SERVICE_KEY;

  try {
    const tenMinutesAgo = new Date(Date.now() - 10 * 60 * 1000).toISOString();
    const url = `${SUPABASE_URL}/rest/v1/participants?email=eq.${encodeURIComponent(email)}&created_at=gte.${encodeURIComponent(tenMinutesAgo)}&select=number,nickname,created_at&order=created_at.desc&limit=1`;

    const r = await fetch(url, {
      headers: {
        apikey: SUPABASE_KEY,
        Authorization: `Bearer ${SUPABASE_KEY}`,
      },
    });
    const rows = await r.json();

    if (Array.isArray(rows) && rows.length > 0) {
      return res.status(200).json({ found: true, ...rows[0] });
    }
    return res.status(200).json({ found: false });
  } catch (err) {
    console.error("find-certificate error:", err);
    return res.status(200).json({ found: false });
  }
}
