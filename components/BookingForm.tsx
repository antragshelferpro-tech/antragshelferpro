'use client'
import { useState, useEffect, useRef } from 'react'

const SERVICES = {
  de: [
    'Basis-Paket',
    'Komplett-Service',
    'Anerkennung ausländischer Qualifikationen',
    'Übersetzung Albanisch ↔ Deutsch',
    'Versicherungsberatung & Finanzierung',
  ],
  sq: [
    'Paketa Bazë',
    'Shërbim i Plotë',
    'Njohja e Kualifikimeve të Huaja',
    'Përkthim Shqip ↔ Gjermanisht',
    'Sigurim & Financim',
  ],
  en: [
    'Basic Package',
    'Full Service',
    'Recognition of Foreign Qualifications',
    'Translation Albanian ↔ German',
    'Insurance & Financing',
  ],
}

const TEXT = {
  de: {
    title: 'Buchungsanfrage',
    vorname: 'Vorname', nachname: 'Nachname',
    email: 'E-Mail', telefon: 'Telefon',
    leistung: 'Gewünschte Leistung', leistungPlaceholder: '– Bitte wählen –',
    sprache: 'Bevorzugte Sprache',
    nachricht: 'Ihr Anliegen (optional)',
    nachrichtPlaceholder: 'Beschreiben Sie kurz, womit wir Ihnen helfen können...',
    required: '*',
    submit: 'Anfrage absenden →',
    sending: '⏳ Wird gesendet...',
    success: '✅ Vielen Dank! Wir haben Ihre Anfrage erhalten und melden uns innerhalb von 24 Stunden. Eine Bestätigung wurde an Ihre E-Mail-Adresse gesendet.',
    errorRequired: 'Bitte füllen Sie alle Pflichtfelder (*) aus.',
    errorCaptcha: 'Bitte bestätigen Sie, dass Sie kein Roboter sind.',
    vornameP: 'z.B. Anna', nachnameP: 'z.B. Müller',
    emailP: 'ihre@email.de', telefonP: '+49 ...',
    sprachen: ['Deutsch', 'Albanisch (Shqip)', 'Englisch'],
    captchaLabel: 'Sicherheitscheck',
  },
  sq: {
    title: 'Kërkesë Rezervimi',
    vorname: 'Emri', nachname: 'Mbiemri',
    email: 'E-mail', telefon: 'Telefon',
    leistung: 'Shërbimi i dëshiruar', leistungPlaceholder: '– Ju lutem zgjidhni –',
    sprache: 'Gjuha e preferuar',
    nachricht: 'Kërkesa juaj (fakultative)',
    nachrichtPlaceholder: 'Përshkruani shkurtimisht me çfarë mund t\'ju ndihmojmë...',
    required: '*',
    submit: 'Dërgoni kërkesën →',
    sending: '⏳ Duke dërguar...',
    success: '✅ Faleminderit! Kemi marrë kërkesën tuaj dhe do të kontaktojmë brenda 24 orëve.',
    errorRequired: 'Ju lutem plotësoni të gjitha fushat e detyrueshme (*).',
    errorCaptcha: 'Ju lutem konfirmoni që nuk jeni robot.',
    vornameP: 'p.sh. Besa', nachnameP: 'p.sh. Krasniqi',
    emailP: 'emaili@juaj.com', telefonP: '+49 ...',
    sprachen: ['Gjermanisht', 'Shqip', 'Anglisht'],
    captchaLabel: 'Kontroll sigurie',
  },
  en: {
    title: 'Booking Request',
    vorname: 'First name', nachname: 'Last name',
    email: 'Email', telefon: 'Phone',
    leistung: 'Requested service', leistungPlaceholder: '– Please select –',
    sprache: 'Preferred language',
    nachricht: 'Your request (optional)',
    nachrichtPlaceholder: 'Briefly describe how we can help you...',
    required: '*',
    submit: 'Send request →',
    sending: '⏳ Sending...',
    success: '✅ Thank you! We have received your request and will get back to you within 24 hours.',
    errorRequired: 'Please fill in all required fields (*).',
    errorCaptcha: 'Please confirm that you are not a robot.',
    vornameP: 'e.g. Anna', nachnameP: 'e.g. Smith',
    emailP: 'your@email.com', telefonP: '+49 ...',
    sprachen: ['German', 'Albanian (Shqip)', 'English'],
    captchaLabel: 'Security check',
  },
}

type Lang = 'de' | 'sq' | 'en'

// Load Turnstile script once
function useTurnstile(siteKey: string, containerRef: React.RefObject<HTMLDivElement>, onSuccess: (token: string) => void, onExpire: () => void) {
  useEffect(() => {
    if (!siteKey || typeof window === 'undefined') return

    const scriptId = 'cf-turnstile-script'
    if (!document.getElementById(scriptId)) {
      const script = document.createElement('script')
      script.id = scriptId
      script.src = 'https://challenges.cloudflare.com/turnstile/v0/api.js'
      script.async = true
      script.defer = true
      document.head.appendChild(script)
    }

    const render = () => {
      if (!containerRef.current || !(window as any).turnstile) return
      if (containerRef.current.querySelector('iframe')) return // already rendered
      ;(window as any).turnstile.render(containerRef.current, {
        sitekey: siteKey,
        callback: onSuccess,
        'expired-callback': onExpire,
        theme: 'light',
        language: 'auto',
      })
    }

    const interval = setInterval(() => {
      if ((window as any).turnstile) { render(); clearInterval(interval) }
    }, 200)
    return () => clearInterval(interval)
  }, [siteKey])
}

export default function BookingForm({ lang = 'de' }: { lang?: Lang }) {
  const t = TEXT[lang]
  const services = SERVICES[lang]
  const siteKey = process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY ?? ''

  const [form, setForm] = useState({
    vorname: '', nachname: '', email: '', telefon: '',
    leistung: '', sprache: t.sprachen[0], nachricht: '',
  })
  const [state, setState] = useState<'idle' | 'loading' | 'success' | 'error'>('idle')
  const [errorMsg, setErrorMsg] = useState('')
  const [captchaToken, setCaptchaToken] = useState('')
  const captchaRef = useRef<HTMLDivElement>(null)

  useTurnstile(
    siteKey,
    captchaRef,
    (token) => setCaptchaToken(token),
    () => setCaptchaToken('')
  )

  const currentSprache = t.sprachen.includes(form.sprache) ? form.sprache : t.sprachen[0]
  const set = (field: string) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) =>
    setForm(f => ({ ...f, [field]: e.target.value }))

  async function submit() {
    if (!form.vorname || !form.nachname || !form.email || !form.leistung) {
      setErrorMsg(t.errorRequired); setState('error'); return
    }
    if (siteKey && !captchaToken) {
      setErrorMsg(t.errorCaptcha); setState('error'); return
    }
    setState('loading')
    setErrorMsg('')
    try {
      const res = await fetch('/api/bookings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...form, sprache: currentSprache, captchaToken }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Fehler')
      setState('success')
      setForm({ vorname: '', nachname: '', email: '', telefon: '', leistung: '', sprache: t.sprachen[0], nachricht: '' })
      setCaptchaToken('')
      // Reset Turnstile widget
      if ((window as any).turnstile && captchaRef.current) {
        (window as any).turnstile.reset(captchaRef.current)
      }
    } catch (e: any) {
      setErrorMsg(e.message); setState('error')
    }
  }

  return (
    <div style={styles.card}>
      <h3 style={styles.cardTitle}>{t.title}</h3>
      {state === 'success' && <div style={styles.success}>{t.success}</div>}
      {state === 'error' && <div style={styles.errorBox}>⚠️ {errorMsg}</div>}

      <div style={styles.row}>
        <div style={styles.group}>
          <label style={styles.label}>{t.vorname} {t.required}</label>
          <input style={styles.input} placeholder={t.vornameP} value={form.vorname} onChange={set('vorname')} />
        </div>
        <div style={styles.group}>
          <label style={styles.label}>{t.nachname} {t.required}</label>
          <input style={styles.input} placeholder={t.nachnameP} value={form.nachname} onChange={set('nachname')} />
        </div>
      </div>
      <div style={styles.group}>
        <label style={styles.label}>{t.email} {t.required}</label>
        <input style={styles.input} type="email" placeholder={t.emailP} value={form.email} onChange={set('email')} />
      </div>
      <div style={styles.group}>
        <label style={styles.label}>{t.telefon}</label>
        <input style={styles.input} type="tel" placeholder={t.telefonP} value={form.telefon} onChange={set('telefon')} />
      </div>
      <div style={styles.group}>
        <label style={styles.label}>{t.leistung} {t.required}</label>
        <select style={styles.input} value={form.leistung} onChange={set('leistung')}>
          <option value="">{t.leistungPlaceholder}</option>
          {services.map(s => <option key={s}>{s}</option>)}
        </select>
      </div>
      <div style={styles.group}>
        <label style={styles.label}>{t.sprache}</label>
        <select style={styles.input} value={currentSprache} onChange={set('sprache')}>
          {t.sprachen.map(s => <option key={s}>{s}</option>)}
        </select>
      </div>
      <div style={styles.group}>
        <label style={styles.label}>{t.nachricht}</label>
        <textarea
          style={{ ...styles.input, minHeight: 88, resize: 'vertical' }}
          placeholder={t.nachrichtPlaceholder}
          value={form.nachricht}
          onChange={set('nachricht')}
        />
      </div>

      {/* Turnstile CAPTCHA */}
      {siteKey && (
        <div style={styles.group}>
          <label style={styles.label}>{t.captchaLabel}</label>
          <div ref={captchaRef} />
        </div>
      )}

      <button
        style={{ ...styles.btn, opacity: state === 'loading' ? 0.7 : 1 }}
        onClick={submit}
        disabled={state === 'loading'}
      >
        {state === 'loading' ? t.sending : t.submit}
      </button>
    </div>
  )
}

const styles: Record<string, React.CSSProperties> = {
  card: { background:'#faf7f0', border:'1px solid rgba(15,31,61,0.08)', borderRadius:20, padding:'36px 32px', boxShadow:'0 8px 32px rgba(15,31,61,0.10)' },
  cardTitle: { fontFamily:"'Playfair Display',serif", fontSize:'1.4rem', color:'#0f1f3d', marginBottom:24 },
  row: { display:'grid', gridTemplateColumns:'1fr 1fr', gap:16, marginBottom:0 },
  group: { marginBottom:18 },
  label: { display:'block', fontSize:'0.82rem', fontWeight:600, color:'#1a2540', marginBottom:6 },
  input: { width:'100%', background:'#fff', border:'1.5px solid rgba(15,31,61,0.12)', borderRadius:10, padding:'12px 14px', fontFamily:"'DM Sans',sans-serif", fontSize:'0.93rem', color:'#1a2540', outline:'none', boxSizing:'border-box', WebkitAppearance:'none' },
  btn: { width:'100%', background:'#0f1f3d', color:'#fff', border:'none', cursor:'pointer', padding:15, borderRadius:10, fontFamily:"'DM Sans',sans-serif", fontSize:'1rem', fontWeight:700, marginTop:8, transition:'all 0.2s' },
  success: { background:'#d4edda', border:'1px solid #c3e6cb', borderRadius:10, padding:16, marginBottom:20, color:'#155724', fontWeight:600, fontSize:'0.92rem', lineHeight:1.55 },
  errorBox: { background:'#f8d7da', border:'1px solid #f5c6cb', borderRadius:10, padding:14, marginBottom:20, color:'#721c24', fontSize:'0.9rem' },
}
