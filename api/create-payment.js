export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const STRIPE_SECRET = process.env.STRIPE_SECRET_KEY;

  try {
    const response = await fetch("https://api.stripe.com/v1/payment_intents", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${STRIPE_SECRET}`,
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: new URLSearchParams({
        amount: "100",
        currency: "eur",
        "metadata[nick]": req.body.nick || "",
        "metadata[email]": req.body.email || "",
        description: "Certificato digitale di partecipazione CountOne",
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      return res.status(500).json({ error: data.error?.message });
    }

    return res.status(200).json({ clientSecret: data.client_secret });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
}
