'use client'
import { useState, useRef } from 'react'

const FINANZIERUNGSARTEN = {
  de: ['Privatkredit', 'Autofinanzierung', 'Immobilienfinanzierung', 'Umschuldung', 'Rahmenkredit', 'Geschäftskredit', 'Sonstige Finanzierung'],
  sq: ['Kredi personale', 'Financim automjeti', 'Financim prone', 'Rifinancim', 'Kredi hapësinore', 'Kredi biznesi', 'Financim tjetër'],
  en: ['Personal loan', 'Car financing', 'Real estate financing', 'Debt restructuring', 'Revolving credit', 'Business loan', 'Other financing'],
}

const ARBEITSVERHÄLTNIS = {
  de: ['Angestellt (unbefristet)', 'Angestellt (befristet)', 'Selbstständig / Freiberuflich', 'Beamter', 'Rentner / Pensionär', 'Sonstiges'],
  sq: ['I punësuar (pa afat)', 'I punësuar (me afat)', 'Vetëpunësuar / Freelancer', 'Nëpunës civil', 'Pensionist', 'Tjetër'],
  en: ['Employed (permanent)', 'Employed (fixed-term)', 'Self-employed / Freelance', 'Civil servant', 'Retired', 'Other'],
}

const TEXT = {
  de: {
    title: '🏦 Finanzierungsanfrage',
    subtitle: 'Kostenlose Anfrage – Weiterleitung an unseren Partner',
    partner: 'Partner: Allianz Versicherung Mentor Dzemaili, Monheim am Rhein',
    sectionPersonal: 'Ihre Kontaktdaten',
    sectionFinancing: 'Finanzierungsdetails',
    sectionEconomic: 'Wirtschaftliche Verhältnisse (optional)',
    vorname: 'Vorname', nachname: 'Nachname',
    email: 'E-Mail', telefon: 'Telefon',
    finanzierungsart: 'Finanzierungsart', finanzierungsartP: '– Bitte wählen –',
    kreditsumme: 'Gewünschte Kreditsumme (€)', kreditsummeP: 'z.B. 15000',
    laufzeit: 'Gewünschte Laufzeit (Monate)', laufzeitP: 'z.B. 60',
    verwendungszweck: 'Verwendungszweck', verwendungszweckP: 'z.B. Gebrauchtwagenkauf, Renovierung...',
    anzahlKreditnehmer: 'Anzahl Kreditnehmer', anzahlKreditnehmerP: '– Bitte wählen –',
    arbeitsverhältnis: 'Arbeitsverhältnis', arbeitsverhältnisP: '– Bitte wählen –',
    beschaeftigtSeit: 'Beschäftigt seit', nettoEinkommen: 'Monatl. Nettoeinkommen (€)',
    nettoEinkommenP: 'z.B. 2500', arbeitgeber: 'Arbeitgeber', arbeitgeberP: 'z.B. Mustermann GmbH',
    nachricht: 'Weitere Informationen (optional)', nachrichtP: 'Weitere relevante Informationen zu Ihrer Anfrage...',
    sprache: 'Bevorzugte Sprache',
    sprachen: ['Deutsch', 'Albanisch (Shqip)', 'Englisch'],
    required: '*', submit: 'Anfrage kostenlos senden →', sending: '⏳ Wird gesendet...',
    success: '✅ Vielen Dank! Ihre Finanzierungsanfrage wurde eingegangen und direkt an unseren Partner weitergeleitet. Sie erhalten in Kürze eine Bestätigung per E-Mail.',
    errorRequired: 'Bitte füllen Sie alle Pflichtfelder (*) aus.',
    kreditnehmerOptions: ['1 Person', '2 Personen'],
    disclaimer: 'Ihre Anfrage wird kostenlos und unverbindlich an unseren Partner weitergeleitet. AntragshelferPro übernimmt keine Haftung für die Kreditentscheidung.',
    consentLabel: 'Ich bin damit einverstanden, dass meine Daten zur Bearbeitung meiner Finanzierungsanfrage an die Allianz Versicherung Mentor Dzemaili Hauptvertretung (Monheim am Rhein) weitergeleitet werden. *',
    errorConsent: 'Bitte stimmen Sie der Datenweitergabe zu.',
  },
  sq: {
    title: '🏦 Kërkesë financimi',
    subtitle: 'Kërkesë falas – Dërgim tek partneri ynë',
    partner: 'Partner: Allianz Versicherung Mentor Dzemaili, Monheim am Rhein',
    sectionPersonal: 'Të dhënat tuaja',
    sectionFinancing: 'Detajet e financimit',
    sectionEconomic: 'Gjendja ekonomike (fakultative)',
    vorname: 'Emri', nachname: 'Mbiemri',
    email: 'E-mail', telefon: 'Telefon',
    finanzierungsart: 'Lloji i financimit', finanzierungsartP: '– Ju lutem zgjidhni –',
    kreditsumme: 'Shuma e dëshiruar e kredisë (€)', kreditsummeP: 'p.sh. 15000',
    laufzeit: 'Kohëzgjatja e dëshiruar (muaj)', laufzeitP: 'p.sh. 60',
    verwendungszweck: 'Qëllimi i përdorimit', verwendungszweckP: 'p.sh. blerje makine, rinovim...',
    anzahlKreditnehmer: 'Numri i huamarrësve', anzahlKreditnehmerP: '– Ju lutem zgjidhni –',
    arbeitsverhältnis: 'Marrëdhënia e punës', arbeitsverhältnisP: '– Ju lutem zgjidhni –',
    beschaeftigtSeit: 'I punësuar që nga', nettoEinkommen: 'Të ardhura neto mujore (€)',
    nettoEinkommenP: 'p.sh. 2500', arbeitgeber: 'Punëdhënësi', arbeitgeberP: 'p.sh. Mustermann GmbH',
    nachricht: 'Informacione të tjera (fakultative)', nachrichtP: 'Informacione të tjera relevante...',
    sprache: 'Gjuha e preferuar',
    sprachen: ['Gjermanisht', 'Shqip', 'Anglisht'],
    required: '*', submit: 'Dërgoni kërkesën falas →', sending: '⏳ Duke dërguar...',
    success: '✅ Faleminderit! Kërkesa juaj e financimit është marrë dhe dërguar tek partneri ynë. Do të merrni një konfirmim me e-mail.',
    errorRequired: 'Ju lutem plotësoni të gjitha fushat e detyrueshme (*).',
    kreditnehmerOptions: ['1 person', '2 persona'],
    disclaimer: 'Kërkesa juaj dërgohet falas dhe pa detyrime tek partneri ynë.',
    consentLabel: 'Jam dakord që të dhënat e mia të dërgohen tek Allianz Versicherung Mentor Dzemaili (Monheim am Rhein) për përpunimin e kërkesës sime të financimit. *',
    errorConsent: 'Ju lutem pranoni dërgimin e të dhënave.',
  },
  en: {
    title: '🏦 Financing Request',
    subtitle: 'Free request – forwarded to our partner',
    partner: 'Partner: Allianz Versicherung Mentor Dzemaili, Monheim am Rhein',
    sectionPersonal: 'Your contact details',
    sectionFinancing: 'Financing details',
    sectionEconomic: 'Financial situation (optional)',
    vorname: 'First name', nachname: 'Last name',
    email: 'Email', telefon: 'Phone',
    finanzierungsart: 'Type of financing', finanzierungsartP: '– Please select –',
    kreditsumme: 'Desired loan amount (€)', kreditsummeP: 'e.g. 15000',
    laufzeit: 'Desired term (months)', laufzeitP: 'e.g. 60',
    verwendungszweck: 'Purpose', verwendungszweckP: 'e.g. used car purchase, renovation...',
    anzahlKreditnehmer: 'Number of borrowers', anzahlKreditnehmerP: '– Please select –',
    arbeitsverhältnis: 'Employment status', arbeitsverhältnisP: '– Please select –',
    beschaeftigtSeit: 'Employed since', nettoEinkommen: 'Monthly net income (€)',
    nettoEinkommenP: 'e.g. 2500', arbeitgeber: 'Employer', arbeitgeberP: 'e.g. Mustermann GmbH',
    nachricht: 'Additional information (optional)', nachrichtP: 'Any other relevant information...',
    sprache: 'Preferred language',
    sprachen: ['German', 'Albanian (Shqip)', 'English'],
    required: '*', submit: 'Send request for free →', sending: '⏳ Sending...',
    success: '✅ Thank you! Your financing request has been received and forwarded to our partner. You will receive a confirmation email shortly.',
    errorRequired: 'Please fill in all required fields (*).',
    kreditnehmerOptions: ['1 person', '2 persons'],
    disclaimer: 'Your request will be forwarded free of charge and without obligation to our partner.',
    consentLabel: 'I agree that my data will be forwarded to Allianz Versicherung Mentor Dzemaili Hauptvertretung (Monheim am Rhein) for the processing of my financing request. *',
    errorConsent: 'Please agree to the data transfer.',
  },
}

type Lang = 'de' | 'sq' | 'en'

export default function FinancingForm({ lang = 'de' }: { lang?: Lang }) {
  const t = TEXT[lang]
  const finanzierungsarten = FINANZIERUNGSARTEN[lang]
  const arbeitsverhältnisse = ARBEITSVERHÄLTNIS[lang]

  const [form, setForm] = useState({
    vorname: '', nachname: '', email: '', telefon: '',
    finanzierungsart: '', kreditsumme: '', laufzeit: '',
    verwendungszweck: '', anzahlKreditnehmer: '', arbeitsverhältnis: '',
    beschaeftigtSeit: '', nettoEinkommen: '', arbeitgeber: '',
    nachricht: '', sprache: t.sprachen[0],
  })
  const [state, setState] = useState<'idle' | 'loading' | 'success' | 'error'>('idle')
  const [errorMsg, setErrorMsg] = useState('')
  const [consent, setConsent] = useState(false)

  const set = (field: string) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) =>
    setForm(f => ({ ...f, [field]: e.target.value }))

  async function submit() {
    if (!form.vorname || !form.nachname || !form.email || !form.finanzierungsart || !form.kreditsumme || !form.laufzeit) {
      setErrorMsg(t.errorRequired); setState('error'); return
    }
    if (!consent) {
      setErrorMsg(t.errorConsent); setState('error'); return
    }
    setState('loading'); setErrorMsg('')
    try {
      const res = await fetch('/api/financing', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...form, sprache: form.sprache }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Fehler')
      setState('success')
      setConsent(false)
      setForm({ vorname: '', nachname: '', email: '', telefon: '', finanzierungsart: '', kreditsumme: '', laufzeit: '', verwendungszweck: '', anzahlKreditnehmer: '', arbeitsverhältnis: '', beschaeftigtSeit: '', nettoEinkommen: '', arbeitgeber: '', nachricht: '', sprache: t.sprachen[0] })
    } catch (e: any) {
      setErrorMsg(e.message); setState('error')
    }
  }

  return (
    <div style={s.card}>
      {/* Header */}
      <div style={s.cardHeader}>
        <h3 style={s.cardTitle}>{t.title}</h3>
        <p style={s.cardSub}>{t.subtitle}</p>
        <div style={s.partnerBadge}>🤝 {t.partner}</div>
      </div>

      {state === 'success' && <div style={s.success}>{t.success}</div>}
      {state === 'error' && <div style={s.errorBox}>⚠️ {errorMsg}</div>}

      {state !== 'success' && (
        <>
          {/* Personal */}
          <div style={s.section}>
            <div style={s.sectionTitle}>{t.sectionPersonal}</div>
            <div style={s.row}>
              <div style={s.group}>
                <label style={s.label}>{t.vorname} {t.required}</label>
                <input style={s.input} placeholder="z.B. Anna" value={form.vorname} onChange={set('vorname')} />
              </div>
              <div style={s.group}>
                <label style={s.label}>{t.nachname} {t.required}</label>
                <input style={s.input} placeholder="z.B. Müller" value={form.nachname} onChange={set('nachname')} />
              </div>
            </div>
            <div style={s.row}>
              <div style={s.group}>
                <label style={s.label}>{t.email} {t.required}</label>
                <input style={s.input} type="email" placeholder="ihre@email.de" value={form.email} onChange={set('email')} />
              </div>
              <div style={s.group}>
                <label style={s.label}>{t.telefon}</label>
                <input style={s.input} type="tel" placeholder="+49 ..." value={form.telefon} onChange={set('telefon')} />
              </div>
            </div>
          </div>

          {/* Financing */}
          <div style={s.section}>
            <div style={s.sectionTitle}>{t.sectionFinancing}</div>
            <div style={s.group}>
              <label style={s.label}>{t.finanzierungsart} {t.required}</label>
              <select style={s.input} value={form.finanzierungsart} onChange={set('finanzierungsart')}>
                <option value="">{t.finanzierungsartP}</option>
                {finanzierungsarten.map(f => <option key={f}>{f}</option>)}
              </select>
            </div>
            <div style={s.row}>
              <div style={s.group}>
                <label style={s.label}>{t.kreditsumme} {t.required}</label>
                <div style={{position:'relative'}}>
                  <input style={{...s.input, paddingRight:30}} type="number" min="1000" step="500" placeholder={t.kreditsummeP} value={form.kreditsumme} onChange={set('kreditsumme')} />
                  <span style={s.inputSuffix}>€</span>
                </div>
              </div>
              <div style={s.group}>
                <label style={s.label}>{t.laufzeit} {t.required}</label>
                <select style={s.input} value={form.laufzeit} onChange={set('laufzeit')}>
                  <option value="">{t.finanzierungsartP}</option>
                  {[12,24,36,48,60,72,84,96,108,120].map(m => <option key={m} value={m}>{m} {lang === 'de' ? 'Monate' : lang === 'sq' ? 'muaj' : 'months'}</option>)}
                </select>
              </div>
            </div>
            <div style={s.row}>
              <div style={{...s.group, flex:2}}>
                <label style={s.label}>{t.verwendungszweck}</label>
                <input style={s.input} placeholder={t.verwendungszweckP} value={form.verwendungszweck} onChange={set('verwendungszweck')} />
              </div>
              <div style={s.group}>
                <label style={s.label}>{t.anzahlKreditnehmer}</label>
                <select style={s.input} value={form.anzahlKreditnehmer} onChange={set('anzahlKreditnehmer')}>
                  <option value="">{t.anzahlKreditnehmerP}</option>
                  {t.kreditnehmerOptions.map(o => <option key={o}>{o}</option>)}
                </select>
              </div>
            </div>
          </div>

          {/* Economic */}
          <div style={s.section}>
            <div style={s.sectionTitle}>{t.sectionEconomic}</div>
            <div style={s.row}>
              <div style={s.group}>
                <label style={s.label}>{t.arbeitsverhältnis}</label>
                <select style={s.input} value={form.arbeitsverhältnis} onChange={set('arbeitsverhältnis')}>
                  <option value="">{t.arbeitsverhältnisP}</option>
                  {arbeitsverhältnisse.map(a => <option key={a}>{a}</option>)}
                </select>
              </div>
              <div style={s.group}>
                <label style={s.label}>{t.beschaeftigtSeit}</label>
                <input style={s.input} type="month" value={form.beschaeftigtSeit} onChange={set('beschaeftigtSeit')} />
              </div>
            </div>
            <div style={s.row}>
              <div style={s.group}>
                <label style={s.label}>{t.nettoEinkommen}</label>
                <div style={{position:'relative'}}>
                  <input style={{...s.input, paddingRight:30}} type="number" min="0" step="100" placeholder={t.nettoEinkommenP} value={form.nettoEinkommen} onChange={set('nettoEinkommen')} />
                  <span style={s.inputSuffix}>€</span>
                </div>
              </div>
              <div style={s.group}>
                <label style={s.label}>{t.arbeitgeber}</label>
                <input style={s.input} placeholder={t.arbeitgeberP} value={form.arbeitgeber} onChange={set('arbeitgeber')} />
              </div>
            </div>
          </div>

          {/* Notes & Language */}
          <div style={s.group}>
            <label style={s.label}>{t.nachricht}</label>
            <textarea style={{...s.input, minHeight:80, resize:'vertical'}} placeholder={t.nachrichtP} value={form.nachricht} onChange={set('nachricht')} />
          </div>
          <div style={{...s.group, marginBottom:20}}>
            <label style={s.label}>{t.sprache}</label>
            <select style={s.input} value={form.sprache} onChange={set('sprache')}>
              {t.sprachen.map(sp => <option key={sp}>{sp}</option>)}
            </select>
          </div>

          {/* Consent checkbox */}
          <div style={{...s.group, marginBottom:8}}>
            <label style={{display:'flex', alignItems:'flex-start', gap:10, cursor:'pointer'}}>
              <input
                type="checkbox"
                checked={consent}
                onChange={e => setConsent(e.target.checked)}
                style={{marginTop:3, width:18, height:18, accentColor:'#0f1f3d', cursor:'pointer', flexShrink:0}}
              />
              <span style={{fontSize:'0.85rem', color:'#1a2540', lineHeight:1.55}}>{t.consentLabel}</span>
            </label>
          </div>

          {/* Disclaimer */}
          <div style={s.disclaimer}>{t.disclaimer}</div>

          <button style={{...s.btn, opacity: state === 'loading' ? 0.7 : 1}} onClick={submit} disabled={state === 'loading'}>
            {state === 'loading' ? t.sending : t.submit}
          </button>
        </>
      )}
    </div>
  )
}

const s: Record<string, React.CSSProperties> = {
  card:        { background:'#faf7f0', border:'1px solid rgba(15,31,61,0.08)', borderRadius:20, overflow:'hidden', boxShadow:'0 8px 32px rgba(15,31,61,0.10)' },
  cardHeader:  { background:'linear-gradient(135deg,#0f1f3d,#2d3f5f)', padding:'28px 32px 24px' },
  cardTitle:   { fontFamily:"'Playfair Display',serif", fontSize:'1.35rem', color:'#c9a84c', margin:'0 0 6px' },
  cardSub:     { color:'rgba(255,255,255,0.6)', fontSize:'0.88rem', margin:'0 0 14px' },
  partnerBadge:{ background:'rgba(201,168,76,0.15)', border:'1px solid rgba(201,168,76,0.3)', borderRadius:8, padding:'8px 14px', fontSize:'0.82rem', color:'#c9a84c', display:'inline-block' },
  section:     { padding:'20px 32px 0', borderBottom:'1px solid rgba(15,31,61,0.06)', paddingBottom:16 },
  sectionTitle:{ fontSize:'0.72rem', fontWeight:700, letterSpacing:'0.12em', textTransform:'uppercase' as const, color:'#c9a84c', marginBottom:14 },
  row:         { display:'grid', gridTemplateColumns:'1fr 1fr', gap:14, marginBottom:0 },
  group:       { marginBottom:14, padding:'0 32px' },
  label:       { display:'block', fontSize:'0.8rem', fontWeight:600, color:'#1a2540', marginBottom:5 },
  input:       { width:'100%', background:'#fff', border:'1.5px solid rgba(15,31,61,0.12)', borderRadius:10, padding:'11px 14px', fontFamily:"'DM Sans',sans-serif", fontSize:'0.9rem', color:'#1a2540', outline:'none', boxSizing:'border-box' as const, WebkitAppearance:'none' as const },
  inputSuffix: { position:'absolute' as const, right:10, top:'50%', transform:'translateY(-50%)', color:'#9ca3af', fontSize:'0.85rem', pointerEvents:'none' as const },
  btn:         { display:'block', width:'calc(100% - 64px)', margin:'0 32px 28px', background:'linear-gradient(135deg,#0f1f3d,#2d3f5f)', color:'#c9a84c', border:'none', cursor:'pointer', padding:15, borderRadius:10, fontFamily:"'DM Sans',sans-serif", fontSize:'1rem', fontWeight:700, transition:'all 0.2s' },
  success:     { margin:'20px 32px', background:'#d4edda', border:'1px solid #c3e6cb', borderRadius:10, padding:16, color:'#155724', fontWeight:600, fontSize:'0.92rem', lineHeight:1.55 },
  errorBox:    { margin:'20px 32px 0', background:'#f8d7da', border:'1px solid #f5c6cb', borderRadius:10, padding:14, color:'#721c24', fontSize:'0.9rem' },
  disclaimer:  { margin:'0 32px 16px', background:'rgba(15,31,61,0.04)', borderRadius:8, padding:'10px 14px', fontSize:'0.78rem', color:'#6b7280', lineHeight:1.5 },
}
