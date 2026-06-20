import { useState, useEffect } from "react";

// ─── Supabase config ───────────────────────────────────────────────────────
// NOTE: only used here to READ the public counter. All WRITES (incrementing
// the counter, saving participants, sending certificate emails) now happen
// exclusively server-side in /api/webhook.js, after Stripe verifies payment.
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

// ─── i18n ──────────────────────────────────────────────────────────────────
const T = {
  it: {
    switchLang: "English",
    heroEyebrow: "C'è un numero che cresce. In questo momento. Il tuo posto è ancora libero.",
    heroNum: "???",
    heroSub: "Costa solo 1€ — e diventa per sempre tuo.\nNumero assegnato in ordine cronologico, certificato digitale incluso.",
    cta: "Ottieni il tuo numero — 1€",
    reassure1: "✓ Certificato digitale incluso",
    reassure2: "✓ Numero assegnato in ordine cronologico",
    reassure3: "✓ Nessun abbonamento, pagamento unico",
    pioneerNote: "🥇 I primi 100 partecipanti ricevono il badge Pioniere",
    tiersTitle: "I traguardi",
    howTitle: "Come funziona",
    steps: [
      { n: "1", t: "Il numero è segreto", d: "Non puoi vedere a che punto è arrivato finché non partecipi." },
      { n: "2", t: "Paghi 1€", d: "Un solo euro. Niente abbonamenti, niente trucchi." },
      { n: "3", t: "Ottieni il tuo numero", d: "Il contatore si rivela. Vedi il numero reale in questo momento." },
      { n: "4", t: "Il tuo numero, per sempre", d: "Ricevi il certificato digitale con il tuo nickname e data — un posto nella storia di CountOne." },
    ],
    formTitle: "Inserisci i tuoi dati",
    thanksTitle: "Pagamento ricevuto ✓",
    thanksText: "Il tuo certificato con il numero ufficiale è in arrivo via email entro pochi minuti. Controlla anche lo spam, nel dubbio.",
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
    badgePioneer: "Pioniere",
    badgeVeteran: "Veterano",
    badgeMember: "Membro",
    badgeParticipant: "Partecipante",
    shareTitle: "Condividi il tuo certificato",
    shareCopy: "Copia link",
    shareCopied: "Copiato! ✓",
    backHome: "← Torna alla home",
    loading: "Caricamento...",
    paying: "Elaborazione...",
    errorLoad: "Errore di connessione. Riprova.",
    footer: "CountOne · Progetto collettivo globale · 2026",
    footerTerms: "Termini e Condizioni",
    footerPrivacy: "Privacy Policy",
    legalBack: "← Torna alla home",
    legalUpdated: "Ultimo aggiornamento: 18 giugno 2026",
    legalTermsTitle: "Termini e Condizioni",
    legalPrivacyTitle: "Privacy Policy",
    legalTerms: [
      ["1. Chi siamo", "CountOne è un progetto gestito da Matteo Tosolini, persona fisica privata, con sede in Italia. Per qualsiasi comunicazione: tosolinipge@gmail.com."],
      ["2. Cosa offriamo", "Pagando un contributo di 1,00€ tramite carta, l'utente riceve un certificato digitale numerato via email, generato dopo la conferma del pagamento. Il numero corrisponde alla posizione cronologica di partecipazione."],
      ["3. Natura del servizio", "Il certificato digitale non rappresenta un bene fisico, un titolo finanziario o uno strumento di investimento. È contenuto digitale a scopo ludico e collezionistico, fornito \"così com'è\"."],
      ["4. Valore del certificato", "Il certificato digitale non ha valore di rivendita garantito, non costituisce un investimento e non rappresenta una promessa di rendimento futuro. Tutti i certificati hanno lo stesso prezzo fisso (1,00€) indipendentemente dal numero assegnato: nessun numero ha un valore intrinseco maggiore di un altro."],
      ["5. Pagamenti", "I pagamenti sono elaborati da Stripe. Non memorizziamo dati della carta. Non sono previsti rimborsi dopo la generazione del certificato, salvo errori tecnici verificati."],
      ["6. Diritto di recesso", "Trattandosi di contenuto digitale fornito immediatamente con consenso esplicito, ai sensi dell'art. 59 del Codice del Consumo il diritto di recesso non si applica una volta generato il certificato."],
      ["7. Età minima", "Il servizio è riservato a persone maggiorenni secondo la legge del proprio paese di residenza."],
      ["8. Limitazione di responsabilità", "CountOne è gestito da un privato a scopo amatoriale. Non si garantisce continuità del servizio né si risponde di interruzioni dovute a fornitori terzi (Stripe, Vercel, Supabase, Resend) o forza maggiore."],
      ["9. Modifiche", "Questi Termini possono essere aggiornati in qualsiasi momento; vige sempre la versione pubblicata su questa pagina."],
      ["10. Legge applicabile", "Questi Termini sono regolati dalla legge italiana, foro competente quello del consumatore."],
    ],
    legalPrivacy: [
      ["1. Titolare del trattamento", "Matteo Tosolini, contattabile a tosolinipge@gmail.com."],
      ["2. Dati raccolti", "Solo: nickname scelto dall'utente, email per ricevere il certificato, numero progressivo assegnato. I dati della carta sono gestiti esclusivamente da Stripe."],
      ["3. Finalità", "I dati servono a generare e inviare il certificato e a mantenere un registro interno per finalità organizzative e antifrode."],
      ["4. Base giuridica", "Esecuzione di un contratto (art. 6.1.b GDPR — Regolamento UE 2016/679)."],
      ["5. Conservazione", "I dati sono conservati per il tempo necessario a gestire il rapporto contrattuale e per eventuali obblighi di legge."],
      ["6. Fornitori terzi", "Stripe (pagamenti), Supabase (database), Resend (email), Vercel (hosting del sito), ciascuno conforme al GDPR."],
      ["7. Diritti dell'utente", "Accesso, rettifica, cancellazione, limitazione, portabilità e opposizione al trattamento. Scrivi a tosolinipge@gmail.com per esercitarli."],
      ["8. Sicurezza", "Comunicazioni cifrate (HTTPS), controllo accessi al database (Row Level Security), verifica crittografica dei pagamenti."],
      ["9. Cookie", "Solo cookie tecnici necessari al funzionamento. Nessun tracciamento pubblicitario o analytics di terze parti al momento."],
      ["10. Modifiche", "Questa Privacy Policy può essere aggiornata periodicamente."],
    ],
  },
  en: {
    switchLang: "Italiano",
    heroEyebrow: "There's a number growing. Right now. Your spot is still available.",
    heroNum: "???",
    heroSub: "It costs just €1 — and it becomes yours forever.\nNumber assigned in chronological order, digital certificate included.",
    cta: "Get your number — €1",
    reassure1: "✓ Digital certificate included",
    reassure2: "✓ Number assigned in chronological order",
    reassure3: "✓ No subscription, one-time payment",
    pioneerNote: "🥇 The first 100 participants get the Pioneer badge",
    tiersTitle: "The milestones",
    howTitle: "How it works",
    steps: [
      { n: "1", t: "The number is secret", d: "You can't see where it's reached until you participate." },
      { n: "2", t: "Pay €1", d: "One euro. No subscriptions, no tricks." },
      { n: "3", t: "Get your number", d: "The counter is revealed. You see the real number right now." },
      { n: "4", t: "Yours forever", d: "Receive your digital certificate with nickname and date — a permanent place in CountOne history." },
    ],
    formTitle: "Enter your details",
    thanksTitle: "Payment received ✓",
    thanksText: "Your certificate with your official number is on its way by email within a few minutes. Check spam too, just in case.",
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
    badgePioneer: "Pioneer",
    badgeVeteran: "Veteran",
    badgeMember: "Member",
    badgeParticipant: "Participant",
    shareTitle: "Share your certificate",
    shareCopy: "Copy link",
    shareCopied: "Copied! ✓",
    backHome: "← Back to home",
    loading: "Loading...",
    paying: "Processing...",
    errorLoad: "Connection error. Please try again.",
    footer: "CountOne · Global collective project · 2026",
    footerTerms: "Terms and Conditions",
    footerPrivacy: "Privacy Policy",
    legalBack: "← Back to home",
    legalUpdated: "Last updated: June 18, 2026",
    legalTermsTitle: "Terms and Conditions",
    legalPrivacyTitle: "Privacy Policy",
    legalTerms: [
      ["1. Who we are", "CountOne is a project run by Matteo Tosolini, a private individual based in Italy. Contact: tosolinipge@gmail.com."],
      ["2. What we offer", "By paying a €1.00 contribution by card, the user receives a numbered digital certificate by email, generated after payment confirmation. The number reflects chronological order of participation."],
      ["3. Nature of the service", "The digital certificate is not a physical good, financial security, or investment instrument. It is digital content for entertainment/collecting purposes, provided \"as is\"."],
      ["4. Certificate value", "The digital certificate has no guaranteed resale value, does not constitute an investment, and does not represent a promise of future return. All certificates have the same fixed price (€1.00) regardless of the assigned number: no number has greater intrinsic value than another."],
      ["5. Payments", "Payments are processed by Stripe. We do not store card data. No refunds after certificate generation, except for verified technical errors."],
      ["6. Right of withdrawal", "As this is digital content delivered immediately with explicit consent, the 14-day withdrawal right does not apply once the certificate is generated."],
      ["7. Minimum age", "The service is reserved for adults under the law of their country of residence."],
      ["8. Limitation of liability", "CountOne is run by a private individual for amateur purposes. No guarantee of continuity or liability for interruptions caused by third-party providers (Stripe, Vercel, Supabase, Resend) or force majeure."],
      ["9. Changes", "These Terms may be updated at any time; the version published here always applies."],
      ["10. Applicable law", "Governed by Italian law; consumer's competent court applies."],
    ],
    legalPrivacy: [
      ["1. Data controller", "Matteo Tosolini, reachable at tosolinipge@gmail.com."],
      ["2. Data collected", "Only: nickname chosen by the user, email to receive the certificate, assigned sequential number. Card data is handled exclusively by Stripe."],
      ["3. Purpose", "Data is used to generate and send the certificate, and to maintain an internal record for organizational and anti-fraud purposes."],
      ["4. Legal basis", "Performance of a contract (Art. 6.1.b GDPR — EU Regulation 2016/679)."],
      ["5. Retention", "Data is kept as long as necessary to manage the contractual relationship and for legal obligations."],
      ["6. Third parties", "Stripe (payments), Supabase (database), Resend (email), Vercel (hosting), each GDPR-compliant."],
      ["7. User rights", "Access, rectification, deletion, restriction, portability, and objection. Write to tosolinipge@gmail.com to exercise them."],
      ["8. Security", "Encrypted communications (HTTPS), database access control (Row Level Security), cryptographic payment verification."],
      ["9. Cookies", "Only strictly necessary technical cookies. No advertising tracking or third-party analytics currently."],
      ["10. Changes", "This Privacy Policy may be updated periodically."],
    ],
  },
};

function formatDate(iso) {
  const d = new Date(iso);
  return d.toLocaleString("it-IT", {
    day: "2-digit", month: "2-digit", year: "numeric",
    hour: "2-digit", minute: "2-digit", second: "2-digit",
  });
}

function getBadge(number) {
  if (number <= 100) return { key: "pioneer", emoji: "🥇", color: "#F5A623" };
  if (number <= 1000) return { key: "veteran", emoji: "🥈", color: "#C9CDD6" };
  if (number <= 10000) return { key: "member", emoji: "🥉", color: "#C8895A" };
  return { key: "participant", emoji: "⚪", color: "#7A7A92" };
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
    const path = window.location.pathname;
    if (path === "/termini" || path === "/terms") setPhase("terms");
    else if (path === "/privacy") setPhase("privacy");
  }, []);

  useEffect(() => {
    getCount().then(setCount).catch(() => setError(true));
  }, []);

  useEffect(() => {
    // Handle return from Stripe. We deliberately do NOT rely on
    // sessionStorage/localStorage to remember who just paid: testing showed
    // that on some mobile browsers (Safari/iOS in particular) this data does
    // not survive the redirect to Stripe's domain and back. Instead of trying
    // to show the certificate inline (which required fragile client-side
    // lookups), we simply show a clean "thank you, check your email" screen.
    // The real certificate always arrives by email, generated securely by
    // the webhook — that's the reliable source of truth.
    if (window.location.pathname === "/success") {
      window.history.replaceState({}, "", "/");
      setPhase("thanks");
    }
  }, []);

  async function handlePay() {
    if (!nick.trim() || !email.trim() || paying) return;
    setPaying(true);
    setError(null);
    try {
      const stripeUrl = `https://buy.stripe.com/dRm00jciSfpD50429m9IQ01?prefilled_email=${encodeURIComponent(email.trim())}&client_reference_id=${encodeURIComponent(nick.trim())}`;
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
    if (window.location.pathname !== "/") {
      window.history.pushState({}, "", "/");
    }
  }

  return (
    <div style={s.root}>
      <style>{`
        @keyframes countoneBreathe {
          0%, 100% { transform: scale(1); opacity: 1; }
          50% { transform: scale(1.04); opacity: 0.85; }
        }
        @keyframes countoneGlowPulse {
          0%, 100% { transform: scale(1); opacity: 0.7; }
          50% { transform: scale(1.15); opacity: 1; }
        }
      `}</style>
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
            <p style={s.pioneerNote}>{t.pioneerNote}</p>
            <p style={s.eyebrow}>{t.heroEyebrow}</p>
            <div style={s.mysteryWrap}>
              <div style={s.mysteryGlow} />
              <span style={s.mysteryNum}>{t.heroNum}</span>
            </div>
            <p style={s.heroSub}>{t.heroSub}</p>
            <button style={s.ctaBtn} onClick={() => setPhase("form")}>{t.cta}</button>
            <ul style={s.reassureList}>
              <li style={s.reassureItem}>{t.reassure1}</li>
              <li style={s.reassureItem}>{t.reassure2}</li>
              <li style={s.reassureItem}>{t.reassure3}</li>
            </ul>
          </section>

          <section style={s.tiersSection}>
            <h2 style={s.sectionTitle}>{t.tiersTitle}</h2>
            <div style={s.tiersGrid}>
              <div style={s.tierCard}>
                <span style={s.tierEmoji}>🥇</span>
                <span style={{ ...s.tierName, color: GOLD }}>{t.badgePioneer}</span>
                <span style={s.tierRange}>1 – 100</span>
              </div>
              <div style={s.tierCard}>
                <span style={s.tierEmoji}>🥈</span>
                <span style={{ ...s.tierName, color: "#C9CDD6" }}>{t.badgeVeteran}</span>
                <span style={s.tierRange}>101 – 1.000</span>
              </div>
              <div style={s.tierCard}>
                <span style={s.tierEmoji}>🥉</span>
                <span style={{ ...s.tierName, color: "#C8895A" }}>{t.badgeMember}</span>
                <span style={s.tierRange}>1.001 – 10.000</span>
              </div>
              <div style={s.tierCard}>
                <span style={s.tierEmoji}>⚪</span>
                <span style={{ ...s.tierName, color: "#9A9AB5" }}>{t.badgeParticipant}</span>
                <span style={s.tierRange}>10.001+</span>
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

      {/* THANKS — simple confirmation after returning from Stripe */}
      {phase === "thanks" && (
        <main style={s.main}>
          <section style={s.certSection}>
            <div style={s.pendingBox}>
              <div style={s.pendingIcon}>✓</div>
              <h2 style={s.pendingTitle}>{t.thanksTitle}</h2>
              <p style={s.pendingText}>{t.thanksText}</p>
            </div>
            <p style={s.backLink} onClick={reset}>{t.backHome}</p>
          </section>
        </main>
      )}

      {/* CERTIFICATE */}
      {phase === "cert" && cert && (
        <main style={s.main}>
          <section style={s.certSection}>
            <div style={s.certCard}>
              <div style={s.certCardHeader}>
                <span style={s.certCardLogo}>CountOne</span>
                <span style={s.certVerifiedBadge}>{t.certVerified}</span>
              </div>
              <div style={s.certReveal}>
                <p style={s.certRevealLabel}>{t.certNumLabel}</p>
                <div style={s.certBigNum}>#{cert.number}</div>
                {(() => {
                  const badge = getBadge(cert.number);
                  const label =
                    badge.key === "pioneer" ? t.badgePioneer :
                    badge.key === "veteran" ? t.badgeVeteran :
                    badge.key === "member" ? t.badgeMember : t.badgeParticipant;
                  return (
                    <div style={{ ...s.certBadge, borderColor: `${badge.color}55`, background: `${badge.color}15`, color: badge.color }}>
                      <span>{badge.emoji}</span>
                      <span>{label}</span>
                    </div>
                  );
                })()}
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

      {/* TERMS / PRIVACY */}
      {(phase === "terms" || phase === "privacy") && (
        <main style={s.main}>
          <section style={s.legalSection}>
            <p style={s.backLink} onClick={reset}>{t.legalBack}</p>
            <h1 style={s.legalTitle}>
              {phase === "terms" ? t.legalTermsTitle : t.legalPrivacyTitle}
            </h1>
            <p style={s.legalUpdated}>{t.legalUpdated}</p>
            {(phase === "terms" ? t.legalTerms : t.legalPrivacy).map(([heading, body], i) => (
              <div key={i}>
                <h2 style={s.legalHeading}>{heading}</h2>
                <p style={s.legalBody}>{body}</p>
              </div>
            ))}
          </section>
        </main>
      )}

      <footer style={s.footer}>
        <div>{t.footer}</div>
        <div style={s.footerLinks}>
          <span style={s.footerLink} onClick={() => { window.history.pushState({}, "", "/termini"); setPhase("terms"); }}>
            {t.footerTerms}
          </span>
          <span style={s.footerDot}>·</span>
          <span style={s.footerLink} onClick={() => { window.history.pushState({}, "", "/privacy"); setPhase("privacy"); }}>
            {t.footerPrivacy}
          </span>
        </div>
      </footer>
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
  mysteryGlow: { position: "absolute", width: 200, height: 200, borderRadius: "50%", background: `radial-gradient(circle, ${GOLD}44 0%, transparent 70%)`, pointerEvents: "none", animation: "countoneGlowPulse 3.5s ease-in-out infinite" },
  mysteryNum: { fontSize: 130, fontWeight: 900, color: GOLD, letterSpacing: "-6px", lineHeight: 1, filter: "blur(12px)", userSelect: "none", position: "relative", zIndex: 1, WebkitFilter: "blur(12px)", animation: "countoneBreathe 3.5s ease-in-out infinite", display: "inline-block" },
  heroSub: { fontSize: 16, color: MUTED, lineHeight: 1.7, marginBottom: 32, whiteSpace: "pre-line" },
  ctaBtn: { background: GOLD, color: "#000", border: "none", borderRadius: 14, padding: "17px 44px", fontSize: 17, fontWeight: 800, cursor: "pointer", fontFamily: "inherit", letterSpacing: "-0.2px", marginBottom: 12, display: "block" },
  reassureList: { listStyle: "none", padding: 0, margin: "8px 0 0", display: "flex", flexDirection: "column", gap: 4, alignItems: "center" },
  reassureItem: { fontSize: 12.5, color: "#7DD3A0" },
  tiersSection: { width: "100%", marginBottom: 48 },
  tiersGrid: { display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginTop: 16 },
  tierCard: { background: "#0B0B14", border: "1px solid #1A1A2E", borderRadius: 14, padding: "18px 12px", display: "flex", flexDirection: "column", alignItems: "center", gap: 4 },
  tierEmoji: { fontSize: 26 },
  tierName: { fontSize: 13, fontWeight: 800 },
  tierRange: { fontSize: 11.5, color: "#64648A" },
  pioneerNote: { display: "inline-block", fontSize: 12.5, fontWeight: 700, color: GOLD, background: `${GOLD}15`, border: `1px solid ${GOLD}40`, borderRadius: 20, padding: "6px 16px", marginBottom: 18 },
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
  certCard: { background: CARD, border: `1px solid ${GOLD}55`, borderRadius: 20, padding: "32px 28px", marginBottom: 28, textAlign: "left", width: "100%", boxSizing: "border-box" },
  certCardHeader: { display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 32 },
  certCardLogo: { fontSize: 15, fontWeight: 900, color: GOLD },
  certVerifiedBadge: { fontSize: 12, color: GREEN, background: `${GREEN}18`, border: `1px solid ${GREEN}44`, borderRadius: 6, padding: "4px 10px" },
  certReveal: { textAlign: "center", marginBottom: 28 },
  certRevealLabel: { fontSize: 12, color: MUTED, textTransform: "uppercase", letterSpacing: "0.07em", marginBottom: 8 },
  certBigNum: { fontSize: 80, fontWeight: 900, color: GOLD, letterSpacing: "-4px", lineHeight: 1 },
  certBadge: { display: "inline-flex", alignItems: "center", gap: 6, marginTop: 16, padding: "6px 16px", borderRadius: 20, border: "1px solid", fontSize: 13, fontWeight: 700 },
  pendingBox: { background: CARD, border: `1px solid #22C55E55`, borderRadius: 20, padding: "40px 28px", marginBottom: 28, textAlign: "center" },
  pendingIcon: { width: 56, height: 56, borderRadius: "50%", background: "#22C55E18", border: "1px solid #22C55E55", color: "#4ADE80", fontSize: 26, fontWeight: 900, display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 18px" },
  pendingTitle: { fontSize: 18, fontWeight: 800, color: WHITE, marginBottom: 10 },
  pendingText: { fontSize: 14, color: MUTED, lineHeight: 1.6 },
  certDivider: { height: 1, background: BORDER, marginBottom: 20 },
  certRow: { display: "flex", justifyContent: "space-between", padding: "10px 0", borderBottom: `1px solid ${BORDER}` },
  certKey: { fontSize: 13, color: MUTED },
  certVal: { fontSize: 13, fontWeight: 600 },
  shareLabel: { fontSize: 14, color: MUTED, marginBottom: 12 },
  shareBtn: { background: PURPLE, color: "#fff", border: "none", borderRadius: 10, padding: "13px 36px", fontSize: 15, fontWeight: 700, cursor: "pointer", fontFamily: "inherit", marginBottom: 20, display: "inline-block" },
  footer: { textAlign: "center", padding: "20px", borderTop: `1px solid ${BORDER}`, fontSize: 12, color: MUTED, display: "flex", flexDirection: "column", gap: 8 },
  footerLinks: { display: "flex", justifyContent: "center", alignItems: "center", gap: 8, fontSize: 12 },
  footerLink: { color: MUTED, cursor: "pointer", textDecoration: "underline" },
  footerDot: { color: BORDER },
  legalSection: { paddingTop: 32, paddingBottom: 60, width: "100%" },
  legalTitle: { fontSize: 26, fontWeight: 900, color: GOLD, marginTop: 16, marginBottom: 4, letterSpacing: "-0.5px" },
  legalUpdated: { fontSize: 12, color: MUTED, marginBottom: 28 },
  legalHeading: { fontSize: 15, fontWeight: 700, color: GOLD, marginTop: 22, marginBottom: 8 },
  legalBody: { fontSize: 14, color: "#C5C5D8", lineHeight: 1.7 },
};
