'use client'
import { useState, useEffect } from 'react'

const SESSION_KEY = 'ahp_admin_pwd'

const PREISLISTE = [
  { leistung: 'Basis-Paket', beschreibung: 'Antragsprüfung (1 Antrag), Online-Beratung 30 Min., E-Mail-Support', preis: '100 €', einheit: '/ Leistung' },
  { leistung: 'Komplett-Service', beschreibung: 'Vollständige Antragsstellung, Prüfung & Korrektur, Einreichung & Nachverfolgung, Telefonbegleitung', preis: '239 €', einheit: '/ Vorgang' },
  { leistung: 'Anerkennung ausländ. Qualifikationen', beschreibung: 'Vollständige Verfahrensbegleitung, Dokumentenprüfung, Behördenkommunikation', preis: '469 €', einheit: '/ Vorgang' },
  { leistung: 'Übersetzung', beschreibung: 'Albanisch ↔ Deutsch, beglaubigte Übersetzung, Urkunden & Verträge', preis: '35 €', einheit: '/ Seite' },
  { leistung: 'Übersetzung Express', beschreibung: 'Wie Übersetzung, jedoch mit Expressbearbeitung (+50%)', preis: '52,50 €', einheit: '/ Seite' },
  { leistung: 'Online-Beratung', beschreibung: 'Video oder Telefon, kein Vor-Ort-Termin nötig', preis: '29 €', einheit: '/ Sitzung' },
  { leistung: 'Versicherungsberatung', beschreibung: 'KV, Haftpflicht, Hausrat, Kfz – unabhängig, Tarif-Vergleich, Wechselservice', preis: 'Kostenlos', einheit: '' },
  { leistung: 'Finanzierungsberatung', beschreibung: 'Alle Finanzierungsarten, Weiterleitung an Allianz Versicherung Mentor Dzemaili, Monheim am Rhein', preis: 'Kostenlos', einheit: '' },
]

const styles: Record<string, React.CSSProperties> = {
  center:      { minHeight:'100vh', display:'flex', alignItems:'center', justifyContent:'center', background:'#f3f4f6', fontFamily:"'DM Sans',sans-serif" },
  loginCard:   { background:'#fff', borderRadius:20, padding:'40px 36px', width:'100%', maxWidth:400, boxShadow:'0 20px 60px rgba(0,0,0,0.12)' },
  loginTitle:  { fontFamily:"'Playfair Display',serif", fontSize:'1.5rem', color:'#0f1f3d', marginBottom:6 },
  label:       { display:'block', fontSize:'0.82rem', fontWeight:600, color:'#1a2540', marginBottom:6 },
  input:       { width:'100%', border:'1.5px solid #e5e7eb', borderRadius:10, padding:'12px 14px', fontSize:'0.95rem', fontFamily:"'DM Sans',sans-serif", outline:'none', boxSizing:'border-box' as const, marginBottom:12 },
  loginBtn:    { width:'100%', background:'#0f1f3d', color:'#c9a84c', border:'none', borderRadius:10, padding:14, fontSize:'1rem', fontWeight:700, cursor:'pointer', fontFamily:"'DM Sans',sans-serif" },
  error:       { background:'#fef2f2', border:'1px solid #fecaca', borderRadius:8, padding:'10px 14px', color:'#dc2626', fontSize:'0.88rem', marginBottom:12 },
  header:      { background:'#0f1f3d', padding:'18px 28px', display:'flex', alignItems:'center', gap:20 },
  headerTitle: { fontFamily:"'Playfair Display',serif", fontSize:'1.3rem', color:'#c9a84c', margin:0 },
  headerSub:   { color:'rgba(255,255,255,0.45)', fontSize:'0.8rem', marginTop:2 },
  backLink:    { color:'rgba(255,255,255,0.5)', textDecoration:'none', fontSize:'0.85rem' },
}

export default function PreisePage() {
  const [authed, setAuthed]       = useState(false)
  const [password, setPassword]   = useState('')
  const [authError, setAuthError] = useState('')
  const [checking, setChecking]   = useState(true)

  useEffect(() => {
    const stored = sessionStorage.getItem(SESSION_KEY)
    if (stored) {
      fetch('/api/bookings/admin', { headers: { 'x-admin-password': stored } })
        .then(r => { if (r.ok) { setPassword(stored); setAuthed(true) } setChecking(false) })
        .catch(() => setChecking(false))
    } else setChecking(false)
  }, [])

  async function login() {
    const res = await fetch('/api/bookings/admin', { headers: { 'x-admin-password': password } })
    if (res.status === 401) { setAuthError('Falsches Passwort.'); return }
    sessionStorage.setItem(SESSION_KEY, password)
    setAuthed(true)
  }

  if (checking) return (
    <div style={styles.center}>
      <p style={{color:'#6b7280'}}>⏳ Wird geladen...</p>
    </div>
  )

  if (!authed) return (
    <div style={styles.center}>
      <div style={styles.loginCard}>
        <a href="/admin" style={{color:'#c9a84c', textDecoration:'none', fontSize:'0.88rem', display:'block', marginBottom:20}}>← Zurück zum Admin</a>
        <h1 style={styles.loginTitle}>🔐 Interne Preisliste</h1>
        <label style={styles.label}>Passwort</label>
        <input type="password" style={styles.input} value={password}
          onChange={e => setPassword(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && login()}
          placeholder="Admin-Passwort" />
        {authError && <div style={styles.error}>{authError}</div>}
        <button style={styles.loginBtn} onClick={login}>Einloggen →</button>
      </div>
    </div>
  )

  return (
    <div style={{minHeight:'100vh', background:'#f8fafc', fontFamily:"'DM Sans',sans-serif"}}>
      <div style={styles.header}>
        <a href="/admin" style={styles.backLink}>← Admin</a>
        <div>
          <h1 style={styles.headerTitle}>💶 Interne Preisliste</h1>
          <p style={styles.headerSub}>Nur intern sichtbar – nicht öffentlich auf der Webseite</p>
        </div>
      </div>

      <div style={{padding:'28px', maxWidth:960, margin:'0 auto'}}>
        <div style={{background:'#fef9ec', border:'1px solid #fde68a', borderRadius:10, padding:'12px 18px', marginBottom:24, fontSize:'0.88rem', color:'#92400e'}}>
          🔒 Diese Preise sind <strong>ausschließlich intern</strong> und werden auf der Webseite nicht angezeigt. Kunden erhalten Preisangaben nur auf direkte Anfrage.
        </div>

        <div style={{background:'#fff', borderRadius:16, border:'1px solid #e5e7eb', overflow:'hidden', boxShadow:'0 2px 8px rgba(0,0,0,0.04)'}}>
          <div style={{display:'grid', gridTemplateColumns:'2fr 3fr 1fr 1.2fr', gap:16, padding:'14px 20px', background:'#0f1f3d', fontSize:'0.78rem', fontWeight:700, color:'rgba(255,255,255,0.7)', textTransform:'uppercase' as const, letterSpacing:'0.08em'}}>
            <div>Leistung</div>
            <div>Beschreibung</div>
            <div>Preis</div>
            <div>Einheit</div>
          </div>
          {PREISLISTE.map((item, i) => (
            <div key={item.leistung} style={{display:'grid', gridTemplateColumns:'2fr 3fr 1fr 1.2fr', gap:16, padding:'16px 20px', background: i%2===0 ? '#fff' : '#f8fafc', borderBottom: i < PREISLISTE.length-1 ? '1px solid #f3f4f6' : 'none', alignItems:'center'}}>
              <div style={{fontWeight:700, color:'#0f1f3d', fontSize:'0.9rem'}}>{item.leistung}</div>
              <div style={{color:'#6b7280', fontSize:'0.85rem', lineHeight:1.55}}>{item.beschreibung}</div>
              <div style={{fontWeight:800, color: item.preis === 'Kostenlos' ? '#10b981' : '#c9a84c', fontSize:'1.05rem'}}>{item.preis}</div>
              <div style={{color:'#9ca3af', fontSize:'0.85rem'}}>{item.einheit}</div>
            </div>
          ))}
        </div>

        <p style={{marginTop:16, fontSize:'0.8rem', color:'#9ca3af', textAlign:'center' as const}}>
          Alle Preise inkl. MwSt. gemäß § 19 UStG (Kleinunternehmerregelung). Gültig ab Januar 2025.
        </p>
      </div>
    </div>
  )
}
