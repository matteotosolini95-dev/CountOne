// Legge SOLO il campo "continent" dei partecipanti — nessun nome, nessuna email.
// Usa la chiave service_role lato server perché la tabella "participants" ha RLS
// che blocca completamente le letture pubbliche (corretto, protegge i dati personali).
// Questo endpoint espone in modo controllato solo l'aggregato anonimo dei continenti.

export default async function handler(req, res) {
  if (req.method !== "GET") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const SUPABASE_URL = process.env.SUPABASE_URL;
  const SUPABASE_KEY = process.env.SUPABASE_SERVICE_KEY;

  try {
    const r = await fetch(
      `${SUPABASE_URL}/rest/v1/participants?select=continent&order=number.desc&limit=300`,
      {
        headers: {
          apikey: SUPABASE_KEY,
          Authorization: `Bearer ${SUPABASE_KEY}`,
        },
      }
    );
    const rows = await r.json();
    const continents = Array.isArray(rows) ? rows.map((row) => row.continent || "unknown") : [];

    res.setHeader("Cache-Control", "s-maxage=30, stale-while-revalidate=60");
    return res.status(200).json({ continents });
  } catch (err) {
    console.error("map-data error:", err);
    return res.status(200).json({ continents: [] });
  }
}
