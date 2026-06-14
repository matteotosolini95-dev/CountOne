import { useState, useEffect } from "react";

// ─── Supabase config ───────────────────────────────────────────────────────
const SUPABASE_URL = "https://kfybbwbttecfxgynnvfd.supabase.co";
const SUPABASE_KEY = "sb_publishable_m-fhY_capVVGqiWZVh5lgQ_VgKA4_gA";

async function getCount() {
  const res = await fetch(`${SUPABASE_URL}/rest/v1/Counter?id=eq.1&select=Count`, {
    headers: {
      apikey: SUPABASE_KEY,
      Authorization: `Bearer ${SUPABASE_KEY}`,
    },
  });
  const data = await res.json();
  return data[0]?.Count ?? 47;
}

async function sendCertificateEmail(email, nick, number, date, prize) {
  try {
    await fetch("/api/send-certificate", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, nick, number, date, prize }),
    });
  } catch (e) {
    console.error("Email error:", e);
  }
}

async function incrementCount(current) {
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
  try {
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
  } catch (e) {
    console.error("Save participant error:", e);
  }
}

// ─── i18n ──────────────────────────────────────────────────────────────────
const T = {
  it: {
    switchLang: "English",
    heroEyebrow: "C'è un numero che cresce. In questo momento. Il tuo posto è ancora libero.",
    heroNum: "???",
    heroSub: "Centinaia di persone hanno già il loro numero. Tu ancora no.\nCosta solo 1€ — e potresti essere il prossimo a vincere 15€.",
    cta: "Ottieni il tuo numero — 1€",
    prizeHeadline: "🏆 Premio in palio",
    prizeDesc: "Ogni 100° persona che paga riceve un",
    prizeAmount: "Buono Amazon da 15€",
    prizeSmall: "Non sai se mancano 2 o 80 pagamenti. Potresti essere tu.",
    howTitle: "Come funziona",
    steps: [
      { n: "1", t: "Il numero è segreto", d: "Non puoi vedere a che punto è arrivato finché non partecipi." },
      { n: "2", t: "Paghi 1€", d: "Un solo euro. Niente abbonamenti, niente trucchi." },
      { n: "3", t: "Ottieni il tuo numero", d: "Il contatore si rivela. Vedi il numero reale in questo momento." },
      { n: "4", t: "Il tuo numero, per sempre", d: "Ricevi il certificato digitale con il tuo nickname e data — un posto nella storia di CountOne." },
    ],
    formTitle: "Inserisci i tuoi dati",
    formSub: "Dopo il pagamento ricevi subito il certificato via email.",
    nick: "Nickname",
    nickPlaceholder: "es. MarioRossi92",
    email: "Email",
    emailPlaceholder: "mario@email.com",
    pay: "Ottieni il tuo numero — 1€",
    back: "← Indietro",
    certNumLabel: "Il tuo numero",
    certNickLabel: "Partecipante",
    certDateLabel: "Data e ora",
    certVerified: "✓ Verificato",
    certPrize: "🎉 Hai vinto! Sei il partecipante #100 (o multiplo). Ti contatteremo via email per il buono Amazon da 15€.",
    shareTitle: "Condividi il tuo certificato",
    shareCopy: "Copia link",
    shareCopied: "Copiato! ✓",
    backHome: "← Torna alla home",
    loading: "Caricamento...",
    paying: "Elaborazione...",
    errorLoad: "Errore di connessione. Riprova.",
    footer: "CountOne · Progetto collettivo globale · 2026",
  },
  en: {
    switchLang: "Italiano",
    heroEyebrow: "There's a number growing. Right now. Your spot is still available.",
    heroNum: "???",
    heroSub: "Hundreds of people already have their number. You don't yet.\nIt costs just €1 — and you could be the next to win €15.",
    cta: "Get your number — €1",
    prizeHeadline: "🏆 Prize up for grabs",
    prizeDesc: "Every 100th person who pays receives a",
    prizeAmount: "€15 Amazon voucher",
    prizeSmall: "You don't know if 2 or 80 payments are left. It could be you.",
    howTitle: "How it works",
    steps: [
      { n: "1", t: "The number is secret", d: "You can't see where it's reached until you participate." },
      { n: "2", t: "Pay €1", d: "One euro. No subscriptions, no tricks." },
      { n: "3", t: "Get your number", d: "The counter is revealed. You see the real number right now." },
      { n: "4", t: "Yours forever", d: "Receive your digital certificate with nickname and date — a permanent place in CountOne history." },
    ],
    formTitle: "Enter your details",
    formSub: "After payment you receive your certificate instantly by email.",
    nick: "Nickname",
    nickPlaceholder: "e.g. JohnDoe92",
    email: "Email",
    emailPlaceholder: "john@email.com",
    pay: "Get your number — €1",
    back: "← Back",
    certNumLabel: "Your number",
    certNickLabel: "Participant",
    certDateLabel: "Date & time",
    certVerified: "✓ Verified",
    certPrize: "🎉 You won! You are participant #100 (or a multiple). We will contact you by email for your €15 Amazon voucher.",
    shareTitle: "Share your certificate",
    shareCopy: "Copy link",
    shareCopied: "Copied! ✓",
    backHome: "← Back to home",
    loading: "Loading...",
    paying: "Processing...",
    errorLoad: "Connection error. Please try again.",
    footer: "CountOne · Global collective project · 2026",
  },
};

function formatDate(iso) {
  const d = new Date(iso);
  return d.toLocaleString("it-IT", {
    day: "2-digit", month: "2-digit", year: "numeric",
    hour: "2-digit", minute: "2-digit", second: "2-digit",
  });
}

function detectLang() {
  const l = (navigator.language || "en").toLowerCase();
  return l.startsWith("it") ? "it" : "en";
}

export default function App() {
  const [lang, setLang] = useState(() => detectLang());
  const [phase, setPhase] = useState("home");
  const [count, setCount] = useState(null);
  const [nick, setNick] = useState("");
  const [email, setEmail] = useState("");
  const [cert, setCert] = useState(null);
  const [copied, setCopied] = useState(false);
  const [paying, setPaying] = useState(false);
  const [error, setError] = useState(null);

  const t = T[lang];

  useEffect(() => {
    getCount().then(setCount).catch(() => setError(true));
  }, []);

  useEffect(() => {
    // Handle success redirect from Stripe
    const params = new URLSearchParams(window.location.search);
    if (window.location.pathname === "/success" || params.get("payment") === "success") {
      const savedNick = sessionStorage.getItem("countone_nick");
      const savedEmail = sessionStorage.getItem("countone_email");
      if (savedNick && savedEmail) {
        sessionStorage.removeItem("countone_nick");
        sessionStorage.removeItem("countone_email");
        setPaying(true);
        getCount().then(freshCount => incrementCount(freshCount)).then(async (newCount) => {
          const certDate = new Date().toISOString();
          const isPrize = newCount % 100 === 0;
          setCount(newCount);
          setCert({
            number: newCount,
            nick: savedNick,
            email: savedEmail,
            date: certDate,
            prize: isPrize,
          });
          await saveParticipant(newCount, savedNick, savedEmail);
          await sendCertificateEmail(savedEmail, savedNick, newCount, certDate, isPrize);
          setPhase("cert");
          setPaying(false);
          // Clean URL
          window.history.replaceState({}, "", "/");
        }).catch(() => setPaying(false));
      }
    }
  }, []);

  async function handlePay() {
    if (!nick.trim() || !email.trim() || paying) return;
    setPaying(true);
    setError(null);
    try {
      // Save nick and email in sessionStorage, then redirect to Stripe
      sessionStorage.setItem("countone_nick", nick.trim());
      sessionStorage.setItem("countone_email", email.trim());
      const stripeUrl = `https://buy.stripe.com/dRm00jciSfpD50429m9IQ01?prefilled_email=${encodeURIComponent(email.trim())}`;
      window.location.href = stripeUrl;
    } catch {
      setError(true);
      setPaying(false);
    }
  }

  function handleCopy() {
    navigator.clipboard.writeText(`${window.location.origin}#cert-${cert?.number}`);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  }

  function reset() {
    setNick("");
    setEmail("");
    setCert(null);
    setError(null);
    setPhase("home");
  }

  return (
    <div style={s.root}>
      {/* NAV */}
      <nav style={s.nav}>
        <span style={s.logo} onClick={reset}>CountOne</span>
        <button style={s.langBtn} onClick={() => setLang(l => l === "it" ? "en" : "it")}>
          {t.switchLang}
        </button>
      </nav>

      {/* HOME */}
      {phase === "home" && (
        <main style={s.main}>
          <section style={s.hero}>
            <p style={s.eyebrow}>{t.heroEyebrow}</p>
            <div style={s.mysteryWrap}>
              <div style={s.mysteryGlow} />
              <span style={s.mysteryNum}>{t.heroNum}</span>
            </div>
            <p style={s.heroSub}>{t.heroSub}</p>
            <button style={s.ctaBtn} onClick={() => setPhase("form")}>{t.cta}</button>
          </section>

          <section style={s.prizeBanner}>
            <div style={s.prizeInner}>
              <div style={s.prizeTrophy}>🏆</div>
              <div style={s.prizeText}>
                <span style={s.prizeHeadline}>{t.prizeHeadline}</span>
                <span style={s.prizeDesc}>{t.prizeDesc}</span>
                <span style={s.prizeAmount}>{t.prizeAmount}</span>
                <span style={s.prizeSmall}>{t.prizeSmall}</span>
              </div>
            </div>
          </section>

          <section style={s.howSection}>
            <h2 style={s.sectionTitle}>{t.howTitle}</h2>
            <div style={s.stepsGrid}>
              {t.steps.map((step, i) => (
                <div key={i} style={s.stepCard}>
                  <div style={s.stepNum}>{step.n}</div>
                  <div style={s.stepTitle}>{step.t}</div>
                  <div style={s.stepDesc}>{step.d}</div>
                </div>
              ))}
            </div>
          </section>

          <button style={{...s.ctaBtn, marginBottom: 64}} onClick={() => setPhase("form")}>{t.cta}</button>
        </main>
      )}

      {/* FORM */}
      {phase === "form" && (
        <main style={s.main}>
          <section style={s.formSection}>
            <h2 style={s.formTitle}>{t.formTitle}</h2>
            <p style={s.formSub}>{t.formSub}</p>
            <div style={s.formCard}>
              <label style={s.label}>{t.nick}</label>
              <input
                style={s.input}
                value={nick}
                onChange={e => setNick(e.target.value)}
                placeholder={t.nickPlaceholder}
                maxLength={30}
              />
              <label style={{...s.label, marginTop: 20}}>{t.email}</label>
              <input
                style={s.input}
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder={t.emailPlaceholder}
              />
              {error && <p style={s.errorMsg}>{t.errorLoad}</p>}
              <button
                style={{
                  ...s.ctaBtn,
                  marginTop: 28,
                  width: "100%",
                  opacity: (!nick.trim() || !email.trim() || paying) ? 0.4 : 1,
                }}
                onClick={handlePay}
                disabled={!nick.trim() || !email.trim() || paying}
              >
                {paying ? t.paying : t.pay}
              </button>
            </div>
            <p style={s.backLink} onClick={reset}>{t.back}</p>
          </section>
        </main>
      )}

      {/* CERTIFICATE */}
      {phase === "cert" && cert && (
        <main style={s.main}>
          <section style={s.certSection}>
            {cert.prize && <div style={s.prizeWinBanner}>{t.certPrize}</div>}
            <div style={s.certCard}>
              <div style={s.certCardHeader}>
                <span style={s.certCardLogo}>CountOne</span>
                <span style={s.certVerifiedBadge}>{t.certVerified}</span>
              </div>
              <div style={s.certReveal}>
                <p style={s.certRevealLabel}>{t.certNumLabel}</p>
                <div style={s.certBigNum}>#{cert.number}</div>
              </div>
              <div style={s.certDivider} />
              <div style={s.certRow}>
                <span style={s.certKey}>{t.certNickLabel}</span>
                <span style={s.certVal}>{cert.nick}</span>
              </div>
              <div style={s.certRow}>
                <span style={s.certKey}>{t.certDateLabel}</span>
                <span style={s.certVal}>{formatDate(cert.date)}</span>
              </div>
            </div>
            <p style={s.shareLabel}>{t.shareTitle}</p>
            <button style={s.shareBtn} onClick={handleCopy}>
              {copied ? t.shareCopied : t.shareCopy}
            </button>
            <p style={s.backLink} onClick={reset}>{t.backHome}</p>
          </section>
        </main>
      )}

      <footer style={s.footer}>{t.footer}</footer>
    </div>
  );
}

const BG     = "#07070E";
const CARD   = "#0F0F1A";
const BORDER = "#1A1A2E";
const GOLD   = "#F5A623";
const WHITE  = "#EEEEF5";
const MUTED  = "#64648A";
const PURPLE = "#6C63FF";
const GREEN  = "#22C55E";
const RED    = "#EF4444";

const s = {
  root: { minHeight: "100vh", background: BG, color: WHITE, fontFamily: "'Inter', system-ui, sans-serif", display: "flex", flexDirection: "column" },
  nav: { display: "flex", justifyContent: "space-between", alignItems: "center", padding: "18px 28px", borderBottom: `1px solid ${BORDER}`, position: "sticky", top: 0, background: BG, zIndex: 10 },
  logo: { fontSize: 18, fontWeight: 900, color: GOLD, cursor: "pointer", letterSpacing: "-0.5px" },
  langBtn: { background: "transparent", border: `1px solid ${BORDER}`, color: MUTED, padding: "6px 14px", borderRadius: 8, cursor: "pointer", fontSize: 13, fontFamily: "inherit" },
  main: { flex: 1, maxWidth: 600, margin: "0 auto", width: "100%", padding: "0 20px", boxSizing: "border-box", display: "flex", flexDirection: "column", alignItems: "center" },
  hero: { paddingTop: 60, paddingBottom: 40, textAlign: "center", width: "100%", display: "flex", flexDirection: "column", alignItems: "center" },
  eyebrow: { fontSize: 15, color: WHITE, fontWeight: 600, lineHeight: 1.6, marginBottom: 36, maxWidth: 480 },
  mysteryWrap: { position: "relative", marginBottom: 36, display: "flex", alignItems: "center", justifyContent: "center" },
  mysteryGlow: { position: "absolute", width: 200, height: 200, borderRadius: "50%", background: `radial-gradient(circle, ${GOLD}44 0%, transparent 70%)`, pointerEvents: "none" },
  mysteryNum: { fontSize: 130, fontWeight: 900, color: GOLD, letterSpacing: "-6px", lineHeight: 1, filter: "blur(12px)", userSelect: "none", position: "relative", zIndex: 1, WebkitFilter: "blur(12px)" },
  heroSub: { fontSize: 16, color: MUTED, lineHeight: 1.7, marginBottom: 32, whiteSpace: "pre-line" },
  ctaBtn: { background: GOLD, color: "#000", border: "none", borderRadius: 14, padding: "17px 44px", fontSize: 17, fontWeight: 800, cursor: "pointer", fontFamily: "inherit", letterSpacing: "-0.2px", marginBottom: 12, display: "block" },
  prizeBanner: { width: "100%", background: `linear-gradient(135deg, ${GOLD}18 0%, ${GOLD}08 100%)`, border: `1px solid ${GOLD}55`, borderRadius: 20, padding: "28px 32px", marginBottom: 48, boxSizing: "border-box" },
  prizeInner: { display: "flex", alignItems: "center", gap: 20 },
  prizeTrophy: { fontSize: 56, flexShrink: 0 },
  prizeText: { display: "flex", flexDirection: "column", gap: 5 },
  prizeHeadline: { fontSize: 16, fontWeight: 800, color: GOLD },
  prizeDesc: { fontSize: 13, color: MUTED },
  prizeAmount: { fontSize: 28, fontWeight: 900, color: WHITE, letterSpacing: "-0.5px" },
  prizeSmall: { fontSize: 13, color: MUTED, fontStyle: "italic", lineHeight: 1.5 },
  howSection: { width: "100%", marginBottom: 40 },
  sectionTitle: { fontSize: 22, fontWeight: 800, marginBottom: 20, letterSpacing: "-0.4px" },
  stepsGrid: { display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 },
  stepCard: { background: CARD, border: `1px solid ${BORDER}`, borderRadius: 14, padding: "20px 18px" },
  stepNum: { width: 30, height: 30, borderRadius: "50%", background: PURPLE, color: "#fff", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 900, fontSize: 14, marginBottom: 12 },
  stepTitle: { fontSize: 14, fontWeight: 700, marginBottom: 6 },
  stepDesc: { fontSize: 13, color: MUTED, lineHeight: 1.5 },
  formSection: { paddingTop: 48, paddingBottom: 48, width: "100%" },
  formTitle: { fontSize: 26, fontWeight: 800, marginBottom: 8, letterSpacing: "-0.5px" },
  formSub: { fontSize: 14, color: MUTED, marginBottom: 28 },
  formCard: { background: CARD, border: `1px solid ${BORDER}`, borderRadius: 16, padding: "28px 24px", width: "100%", boxSizing: "border-box" },
  label: { display: "block", fontSize: 12, color: MUTED, letterSpacing: "0.07em", textTransform: "uppercase", marginBottom: 8 },
  input: { width: "100%", background: BG, border: `1px solid ${BORDER}`, borderRadius: 10, padding: "13px 16px", color: WHITE, fontSize: 15, fontFamily: "inherit", outline: "none", boxSizing: "border-box" },
  errorMsg: { color: RED, fontSize: 13, marginTop: 12 },
  backLink: { textAlign: "center", color: MUTED, fontSize: 13, marginTop: 20, cursor: "pointer" },
  certSection: { paddingTop: 48, paddingBottom: 48, width: "100%", textAlign: "center" },
  prizeWinBanner: { background: `${GREEN}18`, border: `1px solid ${GREEN}55`, borderRadius: 12, padding: "16px 20px", fontSize: 14, color: GREEN, marginBottom: 24, fontWeight: 600, lineHeight: 1.5 },
  certCard: { background: CARD, border: `1px solid ${GOLD}55`, borderRadius: 20, padding: "32px 28px", marginBottom: 28, textAlign: "left", width: "100%", boxSizing: "border-box" },
  certCardHeader: { display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 32 },
  certCardLogo: { fontSize: 15, fontWeight: 900, color: GOLD },
  certVerifiedBadge: { fontSize: 12, color: GREEN, background: `${GREEN}18`, border: `1px solid ${GREEN}44`, borderRadius: 6, padding: "4px 10px" },
  certReveal: { textAlign: "center", marginBottom: 28 },
  certRevealLabel: { fontSize: 12, color: MUTED, textTransform: "uppercase", letterSpacing: "0.07em", marginBottom: 8 },
  certBigNum: { fontSize: 80, fontWeight: 900, color: GOLD, letterSpacing: "-4px", lineHeight: 1 },
  certDivider: { height: 1, background: BORDER, marginBottom: 20 },
  certRow: { display: "flex", justifyContent: "space-between", padding: "10px 0", borderBottom: `1px solid ${BORDER}` },
  certKey: { fontSize: 13, color: MUTED },
  certVal: { fontSize: 13, fontWeight: 600 },
  shareLabel: { fontSize: 14, color: MUTED, marginBottom: 12 },
  shareBtn: { background: PURPLE, color: "#fff", border: "none", borderRadius: 10, padding: "13px 36px", fontSize: 15, fontWeight: 700, cursor: "pointer", fontFamily: "inherit", marginBottom: 20, display: "inline-block" },
  footer: { textAlign: "center", padding: "20px", borderTop: `1px solid ${BORDER}`, fontSize: 12, color: MUTED },
};
