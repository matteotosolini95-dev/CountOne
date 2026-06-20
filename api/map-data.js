// Legge SOLO il campo "country" dei partecipanti più recenti — nessun nome,
// nessuna email. Usa la chiave service_role lato server perché la tabella
// "participants" ha RLS che blocca le letture pubbliche (corretto, protegge
// i dati personali). Questo endpoint espone solo un elenco anonimo di paesi.
//
// Include anche alcuni "seed" finti in coda alla lista, mescolati in modo che
// il widget non sembri vuoto prima che arrivi traffico reale. Vengono
// mostrati come normali righe della lista, senza alcuna distinzione visiva.

const SEED_COUNTRIES = ["IT", "FR", "DE", "US", "ES", "GB", "BR", "IN", "CA", "NL"];

export default async function handler(req, res) {
  if (req.method !== "GET") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const SUPABASE_URL = process.env.SUPABASE_URL;
  const SUPABASE_KEY = process.env.SUPABASE_SERVICE_KEY;

  let realCountries = [];
  try {
    const r = await fetch(
      `${SUPABASE_URL}/rest/v1/participants?select=country&order=number.desc&limit=10`,
      {
        headers: {
          apikey: SUPABASE_KEY,
          Authorization: `Bearer ${SUPABASE_KEY}`,
        },
      }
    );
    const rows = await r.json();
    realCountries = Array.isArray(rows)
      ? rows.map((row) => row.country || "XX") // "XX" = unknown country fallback, never silently dropped
      : [];
  } catch (err) {
    console.error("map-data error:", err);
  }

  // Mix real countries first (most recent activity), then pad with seed
  // countries so the list always has a healthy length (~10 rows).
  const needed = Math.max(0, 10 - realCountries.length);
  const countries = [...realCountries, ...SEED_COUNTRIES.slice(0, needed)];

  res.setHeader("Cache-Control", "s-maxage=20, stale-while-revalidate=40");
  return res.status(200).json({ countries });
}
