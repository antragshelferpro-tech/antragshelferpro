'use client'
import BookingForm from '../components/BookingForm'
import FinancingForm from '../components/FinancingForm'
import { useState, useEffect } from 'react'

// ── Übersetzungen ──────────────────────────────────────────
const T = {
  de: {
    badge: 'Ihr Experte für Anträge & Formulare',
    h1a: 'Wir helfen bei allen',
    h1b: 'Anträgen & Formularen',
    h1c: '– schnell & zuverlässig',
    sub: 'Antragsstellung, Übersetzungen (Albanisch ↔ Deutsch) und Versicherungsberatung – alles aus einer Hand. Persönlich, kompetent, vertrauenswürdig.',
    cta1: 'Termin vereinbaren →',
    cta2: 'Leistungen ansehen',
    stat1: 'Erfolgreiche Anträge', stat2: 'Zufriedene Kunden', stat3: 'Sprachen',
    langLabel: 'Wir sprechen Ihre Sprache:',
    navLeistungen: 'Leistungen', navPreise: 'Preise', navAblauf: 'Ablauf', navBewertungen: 'Bewertungen', navBuchen: 'Jetzt buchen →',
    secLeistungenLabel: 'Unsere Leistungen', secLeistungenTitle: 'Was wir für Sie tun',
    secLeistungenSub: 'Wir helfen bei allen Arten von Anträgen und Formularen – ob bei Behörden, Versicherungen, Vereinen oder privaten Stellen.',
    services: [
      {icon:'📋', title:'Antragsstellung', desc:'Ausfüllen, prüfen und einreichen von Anträgen jeder Art – bei Behörden, Versicherungen, Vermietern und mehr. Korrekt und fristgerecht.'},
      {icon:'🔍', title:'Antragsprüfung', desc:'Sie haben bereits einen Antrag ausgefüllt? Wir prüfen ihn auf Vollständigkeit, Fehler und Optimierungsmöglichkeiten.', tag:'Beliebt'},
      {icon:'🌐', title:'Übersetzungen', desc:'Professionelle Übersetzungen Albanisch ↔ Deutsch für Dokumente, Behördenpost, Verträge und Formulare.'},
      {icon:'🛡️', title:'Versicherungsberatung', desc:'Unabhängige Beratung für Kranken-, Haftpflicht-, Hausrat- und Kfz-Versicherung. Bester Tarif für Sie.'},
      {icon:'📞', title:'Online-Beratung', desc:'Schnelle Hilfe per Video oder Telefon. Kein Termin vor Ort nötig – bequem von zu Hause aus beraten werden.'},
      {icon:'🎓', title:'Anerkennung ausländischer Qualifikationen', desc:'Wir begleiten Sie vollständig durch den Anerkennungsprozess Ihrer im Ausland erworbenen Berufsabschlüsse und Zeugnisse in Deutschland.', tag:'Neu'},
    ],
    secAblaufLabel: 'Wie es funktioniert', secAblaufTitle: 'In 4 Schritten zum Ziel',
    secAblaufSub: 'Unkompliziert, transparent und effizient – so läuft die Zusammenarbeit ab.',
    steps: [
      ['1','Anfrage senden','Füllen Sie das Buchungsformular aus oder rufen Sie uns an.'],
      ['2','Erstgespräch','Wir melden uns innerhalb von 24 Stunden – kostenlos und unverbindlich.'],
      ['3','Bearbeitung','Wir kümmern uns um alle Schritte und halten Sie informiert.'],
      ['4','Erledigt ✓','Sie erhalten das Ergebnis und alle Unterlagen – ohne Stress.'],
    ],
    secPreiseLabel: 'Transparente Preise', secPreiseTitle: 'Klare Kosten, kein Kleingedrucktes',
    secPreiseSub: 'Faire, nachvollziehbare Preise – keine versteckten Gebühren.',
    pricing: [
      {title:'Basis', desc:'Für einfache Anliegen', price:'99', period:'/ Leistung', features:['Antragsprüfung (1 Antrag)','Online-Beratung (30 Min.)','E-Mail-Support','Rückmeldung in 48h']},
      {title:'Übersetzung', desc:'Albanisch ↔ Deutsch', price:'35', period:'/ Seite', features:['Beglaubigte Übersetzung','Urkunden & Verträge','Behördenpost','Express möglich (+50%)','Lieferung PDF & Original']},
      {title:'Komplett-Service', desc:'Für vollständige Begleitung', price:'239', period:'/ Vorgang', featured:true, features:['Vollständige Antragsstellung','Prüfung & Korrektur','Einreichung & Nachverfolgung','Telefonische Begleitung','Unbegrenzte Nachfragen','Rückmeldung in 24h']},
      {title:'Anerkennung', desc:'Ausländische Qualifikationen', price:'469', period:'/ Vorgang', features:['Vollständige Verfahrensbegleitung','Prüfung der Unterlagen','Kommunikation mit Behörden','Anerkennungsberatung','Statusverfolgung']},
      {title:'Versicherung', desc:'Unabhängige Beratung', price:'Gratis', period:'', features:['Unabhängige Beratung','Tarif-Vergleich','KV, Haftpflicht, Hausrat, Kfz','Wechselservice','Ohne Verpflichtung']},
    ],
    btnBuchen: 'Buchen →',
    secBewLabel: 'Kundenstimmen', secBewTitle: 'Was unsere Kunden sagen',
    secBewSub: 'Echte Erfahrungen von Menschen, denen wir helfen durften.',
    testimonials: [
      {init:'B', name:'Besa K.', sub:'Aufenthaltserlaubnis – Berlin', text:'Endlich jemand, der uns wirklich hilft! Die Übersetzung war perfekt und der Antrag wurde beim ersten Versuch genehmigt. Danke für die geduldige Beratung auf Albanisch!'},
      {init:'M', name:'Miri S.', sub:'Wohngeldantrag – München', text:'Ich wusste nicht mehr weiter mit meinem Wohngeldantrag. Das Team hat alles übernommen. Sehr professionell und schnell!'},
      {init:'A', name:'Arben D.', sub:'Versicherungsberatung – Hamburg', text:'Die Versicherungsberatung war kostenlos und hat mir wirklich Geld gespart. Ehrlich, kompetent und ohne Druck zu verkaufen.'},
    ],
    secBuchenLabel: 'Jetzt buchen', secBuchenTitle: 'Ihren Termin sichern',
    secBuchenSub: 'Füllen Sie das Formular aus – wir melden uns innerhalb von 24 Stunden.',
    buchenList: ['Kostenlose Ersteinschätzung Ihres Anliegens','Flexibel: vor Ort, telefonisch oder per Video','Beratung auf Deutsch, Albanisch oder Englisch','Diskret und datenschutzkonform','Keine versteckten Kosten'],
    secFinanzLabel: 'Finanzierungsanfrage', secFinanzTitle: 'Jetzt Finanzierung anfragen', secFinanzSub: 'Wir leiten Ihre Anfrage direkt und kostenlos an unseren Partner weiter – schnell, diskret und unverbindlich.',
    footerDesc: 'Ihr vertrauensvoller Partner für Anträge, Formulare, Übersetzungen, Versicherungsberatung und Finanzierungen. Büro in Monheim am Rhein, bundesweit tätig.',
    footerLeistungen: 'Leistungen', footerRechtliches: 'Rechtliches',
    footerLinks: ['Antragsstellung','Antragsprüfung','Übersetzungen','Versicherung','Anerkennung'],
    impressum: 'Impressum', datenschutz: 'Datenschutz', kontakt: 'Kontakt',
    copyright: '© 2026 AntragshelferPro – Mentor Berisha, Monheim am Rhein. Alle Rechte vorbehalten.',
    floatingCta: '📅 Jetzt buchen',
    empfohlen: 'Empfohlen',
    impTitle: 'Impressum',
    impAngaben: 'Angaben gemäß § 5 TMG',
    impKontakt: 'Kontakt',
    impVerantwortlich: 'Verantwortlich für den Inhalt nach § 55 Abs. 2 RStV',
    impHaftung: 'Haftungsausschluss',
    impHaftungText: 'Die Inhalte dieser Webseite wurden mit größter Sorgfalt erstellt. Für die Richtigkeit, Vollständigkeit und Aktualität der Inhalte kann jedoch keine Gewähr übernommen werden.',
    impHinweis: 'Hinweis zur Beratung',
    impHinweisText: 'Die auf dieser Webseite angebotenen Leistungen stellen keine Rechtsberatung im Sinne des Rechtsdienstleistungsgesetzes (RDG) dar.',
    impAdresseHinweis: 'Hinweis: Dies ist die Büroadresse der Allianz Versicherung Mentor Dzemaili. Besuche nur für Finanzierungs- und Versicherungsanfragen nach vorheriger Terminvereinbarung. Ansprechpartner: Mentor Berisha. Bitte kontaktieren Sie uns vorab per Telefon, WhatsApp oder E-Mail.',
    dsTitle: 'Datenschutzerklärung',
    ds1: '1. Verantwortlicher', ds2: '2. Erhebung personenbezogener Daten', ds3: '3. Datenspeicherung & Löschung',
    ds4: '4. Kontaktformular & E-Mail-Kommunikation', ds5: '5. Ihre Rechte', ds6: '6. Beschwerderecht', ds7: '7. Cookies',
    ds2text: 'Wenn Sie unser Kontaktformular nutzen, erheben wir folgende personenbezogene Daten: Vorname, Nachname, E-Mail-Adresse, Telefonnummer (freiwillig) sowie den Inhalt Ihrer Anfrage. Die Erhebung dieser Daten erfolgt auf Grundlage von Art. 6 Abs. 1 lit. b DSGVO (Vertragsanbahnung) sowie Art. 6 Abs. 1 lit. f DSGVO (berechtigtes Interesse an der Bearbeitung von Kundenanfragen). Die Daten werden ausschließlich zur Bearbeitung Ihrer Anfrage verwendet und nicht an Dritte weitergegeben.',
    ds3text: 'Ihre über das Kontaktformular übermittelten Daten werden in einer gesicherten Datenbank (Supabase, EU-Rechenzentrum Frankfurt, Deutschland) gespeichert. Die Daten werden gelöscht, sobald sie für den Zweck ihrer Erhebung nicht mehr erforderlich sind, spätestens jedoch nach Ablauf der gesetzlichen Aufbewahrungsfristen (§ 147 AO, § 257 HGB). Sie können jederzeit die Löschung Ihrer Daten verlangen.',
    ds4text: 'Nach Eingang Ihrer Anfrage erhalten Sie automatisch eine Bestätigungs-E-Mail. Für den Versand nutzen wir den Dienst Resend (Resend Inc., DSGVO-konform, Datenverarbeitung in der EU). Die übermittelten E-Mail-Adressen werden ausschließlich zur Bearbeitung Ihrer Anfrage genutzt und nicht für Werbezwecke verwendet oder an Dritte weitergegeben. Rechtsgrundlage ist Art. 6 Abs. 1 lit. b DSGVO.',
    ds5list: ['Auskunft über Ihre gespeicherten Daten (Art. 15 DSGVO)','Berichtigung unrichtiger Daten (Art. 16 DSGVO)','Löschung Ihrer Daten (Art. 17 DSGVO)','Einschränkung der Verarbeitung (Art. 18 DSGVO)','Datenübertragbarkeit (Art. 20 DSGVO)','Widerspruch gegen die Verarbeitung (Art. 21 DSGVO)'],
    ds5after: 'Zur Ausübung Ihrer Rechte:',
    ds6text: 'Zuständige Aufsichtsbehörde: Landesbeauftragte für Datenschutz und Informationsfreiheit NRW (LDI NRW),',
    ds7text: 'Diese Webseite verwendet keine Tracking-Cookies, Analyse-Tools oder Werbe-Cookies. Es werden ausschließlich technisch notwendige Cookies eingesetzt (z.B. für den sicheren Betrieb der Webanwendung). Für technisch notwendige Cookies ist keine Einwilligung erforderlich (§ 25 Abs. 2 TTDSG).',
    dsStand: 'Stand: Januar 2025',
  },
  sq: {
    badge: 'Eksperti juaj për kërkesa & formularë',
    h1a: 'Ne ndihmojmë me të gjitha',
    h1b: 'Kërkesat & Formularët',
    h1c: '– shpejt & me besueshmëri',
    sub: 'Plotësim kërkesash, përkthime (Shqip ↔ Gjermanisht) dhe këshilla sigurimi – gjithçka nga një dorë. Personalisht, me kompetencë, me besim.',
    cta1: 'Rezervo takim →',
    cta2: 'Shiko shërbimet',
    stat1: 'Kërkesa të suksesshme', stat2: 'Klientë të kënaqur', stat3: 'Gjuhë',
    langLabel: 'Flasim gjuhën tuaj:',
    navLeistungen: 'Shërbime', navPreise: 'Çmimet', navAblauf: 'Procesi', navBewertungen: 'Vlerësimet', navBuchen: 'Rezervo →',
    secLeistungenLabel: 'Shërbimet tona', secLeistungenTitle: 'Çfarë bëjmë për ju',
    secLeistungenSub: 'Ndihmojmë me çdo lloj kërkese dhe formulari – në zyra, sigurime, shoqata ose organizata private.',
    services: [
      {icon:'📋', title:'Plotësim kërkesash', desc:'Plotësojmë, kontrollojmë dhe dorëzojmë kërkesa të çdo lloji – në zyra, sigurime, qiradhënës dhe më shumë.'},
      {icon:'🔍', title:'Kontroll kërkesash', desc:'Keni plotësuar tashmë një kërkesë? Ne e kontrollojmë për plotësi, gabime dhe mundësi optimizimi.', tag:'Popullar'},
      {icon:'🌐', title:'Përkthime', desc:'Përkthime profesionale Shqip ↔ Gjermanisht për dokumente, letra zyrtare, kontrata dhe formularë.'},
      {icon:'🛡️', title:'Këshilla sigurimi', desc:'Këshilla të pavarura për sigurim shëndetësor, civil, shtëpie dhe automjeti. Tarifa më e mirë për ju.'},
      {icon:'📞', title:'Këshilla online', desc:'Ndihmë e shpejtë me video ose telefon. Nuk nevojitet takim fizik – këshillohuni rehat nga shtëpia.'},
      {icon:'🎓', title:'Njohja e kualifikimeve të huaja', desc:'Ju shoqërojmë plotësisht nëpër procesin e njohjes së diplomave dhe dëshmive tuaja të marra jashtë vendit në Gjermani.', tag:'E re'},
    ],
    secAblaufLabel: 'Si funksionon', secAblaufTitle: 'Deri te qëllimi në 4 hapa',
    secAblaufSub: 'I thjeshtë, transparent dhe efikas – kështu funksionon bashkëpunimi ynë.',
    steps: [
      ['1','Dërgoni kërkesën','Plotësoni formularin e rezervimit ose na telefononi.'],
      ['2','Bisedë fillestare','Na kontaktojmë brenda 24 orëve – falas dhe pa detyrime.'],
      ['3','Përpunim','Ne kujdesemi për të gjitha hapat dhe ju informojmë rregullisht.'],
      ['4','Përfunduar ✓','Merrni rezultatin dhe të gjitha dokumentet – pa stres.'],
    ],
    secPreiseLabel: 'Çmime transparente', secPreiseTitle: 'Kosto të qarta, pa shkronja të vogla',
    secPreiseSub: 'Çmime të drejta dhe të kuptueshme – pa tarifa të fshehura.',
    pricing: [
      {title:'Bazë', desc:'Për nevoja të thjeshta', price:'99', period:'/ shërbim', features:['Kontroll kërkese (1 kërkesë)','Këshilla online (30 min.)','Mbështetje me e-mail','Përgjigje brenda 48h']},
      {title:'Përkthim', desc:'Shqip ↔ Gjermanisht', price:'35', period:'/ faqe', features:['Përkthim i vërtetuar','Dokumente & kontrata','Letra zyrtare','Express i mundshëm (+50%)','Dorëzim PDF & origjinal']},
      {title:'Shërbim i plotë', desc:'Për shoqërim të plotë', price:'239', period:'/ rast', featured:true, features:['Plotësim i plotë i kërkesës','Kontroll & korrigjim','Dorëzim & ndjekje','Shoqërim telefonik','Pyetje të pakufizuara','Përgjigje brenda 24h']},
      {title:'Njohja', desc:'Kualifikime të huaja', price:'469', period:'/ rast', features:['Shoqërim i plotë i procedurës','Kontroll dokumentesh','Komunikim me autoritetet','Këshillim për njohje','Ndjekja e statusit']},
      {title:'Sigurim', desc:'Këshilla të pavarura', price:'Falas', period:'', features:['Këshilla të pavarura','Krahasim tarifash','Shëndetësor, civil, shtëpie, auto','Shërbim ndërrimi','Pa detyrime']},
    ],
    btnBuchen: 'Rezervo →',
    secBewLabel: 'Vlerësimet e klientëve', secBewTitle: 'Çfarë thonë klientët tanë',
    secBewSub: 'Përvoja reale nga njerëzit që kemi ndihmuar.',
    testimonials: [
      {init:'B', name:'Besa K.', sub:'Leje qëndrimi – Berlin', text:'Finalmente dikush që vërtet ndihmon! Përkthimi ishte perfekt dhe kërkesa u aprovua herën e parë. Faleminderit për këshillimin e durueshëm në shqip!'},
      {init:'M', name:'Miri S.', sub:'Kërkesë strehimi – München', text:'Nuk dija më çfarë të bëja me kërkesën time. Ekipi mori gjithçka përsipër. Shumë profesional dhe i shpejtë!'},
      {init:'A', name:'Arben D.', sub:'Këshilla sigurimi – Hamburg', text:'Këshilla e sigurimit ishte falas dhe vërtet kurseu para. E ndershëm, kompetente dhe pa presion për të blerë.'},
    ],
    secBuchenLabel: 'Rezervo tani', secBuchenTitle: 'Siguro takimin tënd',
    secBuchenSub: 'Plotësoni formularin – ne kontaktojmë brenda 24 orëve.',
    buchenList: ['Vlerësim fillestar falas i nevojës suaj','Fleksibël: fizikisht, telefonikisht ose me video','Këshillim në Gjermanisht, Shqip ose Anglisht','Diskret dhe konform GDPR','Pa kosto të fshehura'],
    secFinanzLabel: 'Kërkesë financimi', secFinanzTitle: 'Kërkoni financim tani', secFinanzSub: 'Ne e dërgojmë kërkesën tuaj direkt dhe falas tek partneri ynë – shpejt, diskret dhe pa detyrime.',
    footerDesc: 'Partneri juaj i besuar për kërkesa, formularë, përkthime, këshilla sigurimi dhe financime. Zyrë në Monheim am Rhein, aktiv në të gjithë Gjermaninë.',
    footerLeistungen: 'Shërbime', footerRechtliches: 'Juridike',
    footerLinks: ['Plotësim kërkesash','Kontroll kërkesash','Përkthime','Sigurim','Njohja e kualifikimeve'],
    impressum: 'Impressum', datenschutz: 'Mbrojtja e të dhënave', kontakt: 'Kontakt',
    copyright: '© 2026 AntragshelferPro – Mentor Berisha, Monheim am Rhein. Të gjitha të drejtat të rezervuara.',
    floatingCta: '📅 Rezervo tani',
    empfohlen: 'Rekomanduar',
    impTitle: 'Impressum',
    impAngaben: 'Të dhëna sipas § 5 TMG',
    impKontakt: 'Kontakt',
    impVerantwortlich: 'Përgjegjës për përmbajtjen sipas § 55 Abs. 2 RStV',
    impHaftung: 'Mohim përgjegjësie',
    impHaftungText: 'Përmbajtja e kësaj faqeje interneti është krijuar me kujdes të madh. Megjithatë, nuk mund të garantohet saktësia, plotësia dhe aktualiteti i përmbajtjes.',
    impHinweis: 'Shënim mbi këshillimin',
    impHinweisText: 'Shërbimet e ofruara në këtë faqe nuk përbëjnë këshillim juridik në kuptimin e RDG.',
    impAdresseHinweis: 'Shënim: Kjo është adresa e zyrës së Allianz Versicherung Mentor Dzemaili. Vizita vetëm për kërkesa financimi dhe sigurimesh pas marrëveshjes paraprake. Person kontakti: Mentor Berisha.',
    dsTitle: 'Politika e privatësisë',
    ds1: '1. Kontrollori', ds2: '2. Mbledhja e të dhënave personale', ds3: '3. Ruajtja e të dhënave',
    ds4: '4. Komunikimi me e-mail', ds5: '5. Të drejtat tuaja', ds6: '6. E drejta për ankim', ds7: '7. Cookies',
    ds2text: 'Kur përdorni formularin e rezervimit, mbledhim: emrin, mbiemrin, adresën e e-mailit, numrin e telefonit (fakultativ) dhe kërkesën tuaj. Këto të dhëna përdoren vetëm për trajtimin e kërkesës suaj.',
    ds3text: 'Të dhënat tuaja ruhen në një bazë të dhënash të sigurt (Supabase, server EU Frankfurt) dhe fshihen pas skadimit të afateve ligjore.',
    ds4text: 'Për dërgimin e emaileve konfirmuese përdorim shërbimin Resend (konform GDPR). Adresat e emailit nuk përdoren për qëllime reklamimi.',
    ds5list: ['E drejta e informimit (Art. 15 GDPR)','E drejta e korrigjimit (Art. 16 GDPR)','E drejta e fshirjes (Art. 17 GDPR)','E drejta e kufizimit të përpunimit (Art. 18 GDPR)','E drejta e transportueshmërisë (Art. 20 GDPR)','E drejta e kundërshtimit (Art. 21 GDPR)'],
    ds5after: 'Për të ushtruar të drejtat tuaja:',
    ds6text: 'Autoriteti mbikëqyrës kompetent: LDI NRW,',
    ds7text: 'Kjo faqe interneti nuk përdor cookies gjurmimi, mjete analizash ose cookies reklamimi. Përdoren vetëm cookies teknikisht të nevojshme (p.sh. për funksionimin e sigurt të aplikacionit web). Për cookies teknikisht të nevojshme nuk kërkohet pëlqimi.',
    dsStand: 'Janar 2025',
  },
  en: {
    badge: 'Your Expert for Applications & Forms',
    h1a: 'We help with all your',
    h1b: 'Applications & Forms',
    h1c: '– fast & reliable',
    sub: 'Application assistance, translations (Albanian ↔ German) and insurance consulting – everything from one source. Personal, competent, trustworthy.',
    cta1: 'Book appointment →',
    cta2: 'View services',
    stat1: 'Successful applications', stat2: 'Satisfied clients', stat3: 'Languages',
    langLabel: 'We speak your language:',
    navLeistungen: 'Services', navPreise: 'Pricing', navAblauf: 'Process', navBewertungen: 'Reviews', navBuchen: 'Book now →',
    secLeistungenLabel: 'Our Services', secLeistungenTitle: 'What we do for you',
    secLeistungenSub: 'We help with all kinds of applications and forms – whether for authorities, insurance companies, landlords or private institutions.',
    services: [
      {icon:'📋', title:'Application Assistance', desc:'We fill out, review and submit applications of any kind – for authorities, insurances, landlords and more. Correctly and on time.'},
      {icon:'🔍', title:'Application Review', desc:'Already filled out an application? We check it for completeness, errors and optimization opportunities.', tag:'Popular'},
      {icon:'🌐', title:'Translations', desc:'Professional translations Albanian ↔ German for documents, official letters, contracts and forms.'},
      {icon:'🛡️', title:'Insurance Consulting', desc:'Independent advice for health, liability, household and car insurance. Best rates for you.'},
      {icon:'📞', title:'Online Consulting', desc:'Quick help via video or phone. No in-person appointment needed – get advice from home.'},
      {icon:'🎓', title:'Recognition of Foreign Qualifications', desc:'We guide you completely through the process of having your foreign professional degrees and certificates recognised in Germany.', tag:'New'},
    ],
    secAblaufLabel: 'How it works', secAblaufTitle: '4 steps to success',
    secAblaufSub: 'Simple, transparent and efficient – this is how our collaboration works.',
    steps: [
      ['1','Send inquiry','Fill out the booking form or give us a call.'],
      ['2','Initial consultation','We get back to you within 24 hours – free and without obligation.'],
      ['3','Processing','We handle all the steps and keep you informed.'],
      ['4','Done ✓','You receive the result and all documents – stress-free.'],
    ],
    secPreiseLabel: 'Transparent pricing', secPreiseTitle: 'Clear costs, no fine print',
    secPreiseSub: 'Fair, transparent pricing – no hidden fees.',
    pricing: [
      {title:'Basic', desc:'For simple requests', price:'99', period:'/ service', features:['Application review (1 application)','Online consultation (30 min.)','Email support','Response within 48h']},
      {title:'Translation', desc:'Albanian ↔ German', price:'35', period:'/ page', features:['Certified translation','Documents & contracts','Official letters','Express available (+50%)','Delivery PDF & original']},
      {title:'Full Service', desc:'For complete assistance', price:'239', period:'/ case', featured:true, features:['Complete application filing','Review & correction','Submission & follow-up','Phone support','Unlimited questions','Response within 24h']},
      {title:'Recognition', desc:'Foreign qualifications', price:'469', period:'/ case', features:['Full process guidance','Document review','Communication with authorities','Recognition consulting','Status tracking']},
      {title:'Insurance', desc:'Independent consulting', price:'Free', period:'', features:['Independent consulting','Rate comparison','Health, liability, home, car','Switching service','No obligation']},
    ],
    btnBuchen: 'Book →',
    secBewLabel: 'Testimonials', secBewTitle: 'What our clients say',
    secBewSub: 'Real experiences from people we have helped.',
    testimonials: [
      {init:'B', name:'Besa K.', sub:'Residence permit – Berlin', text:'Finally someone who really helps! The translation was perfect and the application was approved on the first attempt. Thank you for the patient consultation in Albanian!'},
      {init:'M', name:'Miri S.', sub:'Housing allowance – Munich', text:'I did not know what to do with my housing application anymore. The team took care of everything. Very professional and fast!'},
      {init:'A', name:'Arben D.', sub:'Insurance consulting – Hamburg', text:'The insurance consultation was free and really saved me money. Honest, competent and without pressure to buy.'},
    ],
    secBuchenLabel: 'Book now', secBuchenTitle: 'Secure your appointment',
    secBuchenSub: 'Fill out the form – we will get back to you within 24 hours.',
    buchenList: ['Free initial assessment of your request','Flexible: in person, by phone or video','Consultation in German, Albanian or English','Discreet and GDPR-compliant','No hidden costs'],
    secFinanzLabel: 'Financing request', secFinanzTitle: 'Apply for financing now', secFinanzSub: 'We forward your request directly and free of charge to our partner – fast, discreet and without obligation.',
    footerDesc: 'Your trusted partner for applications, forms, translations, insurance consulting and financing. Office in Monheim am Rhein, nationwide.',
    footerLeistungen: 'Services', footerRechtliches: 'Legal',
    footerLinks: ['Application Assistance','Application Review','Translations','Insurance','Qualification Recognition'],
    impressum: 'Legal Notice', datenschutz: 'Privacy Policy', kontakt: 'Contact',
    copyright: '© 2026 AntragshelferPro – Mentor Berisha, Monheim am Rhein. All rights reserved.',
    floatingCta: '📅 Book now',
    empfohlen: 'Recommended',
    impTitle: 'Legal Notice',
    impAngaben: 'Information according to § 5 TMG',
    impKontakt: 'Contact',
    impVerantwortlich: 'Responsible for content according to § 55 Abs. 2 RStV',
    impHaftung: 'Disclaimer',
    impHaftungText: 'The contents of this website have been created with the greatest care. However, no guarantee can be given for the accuracy, completeness and topicality of the content.',
    impHinweis: 'Note on consulting',
    impHinweisText: 'The services offered on this website do not constitute legal advice within the meaning of the RDG (Legal Services Act).',
    impAdresseHinweis: 'Note: This is the office address of Allianz Versicherung Mentor Dzemaili. Visits only for financing and insurance enquiries by prior appointment. Contact person: Mentor Berisha.',
    dsTitle: 'Privacy Policy',
    ds1: '1. Controller', ds2: '2. Collection of personal data', ds3: '3. Data storage',
    ds4: '4. Contact form & email communication', ds5: '5. Your rights', ds6: '6. Right to complain', ds7: '7. Cookies',
    ds2text: 'When using our contact form, we collect the following personal data: first name, last name, email address, phone number (optional) and the content of your request. The collection of this data is based on Art. 6 para. 1 lit. b GDPR (pre-contractual measures) and Art. 6 para. 1 lit. f GDPR (legitimate interest in processing customer enquiries). The data is used exclusively for processing your request and is not passed on to third parties.',
    ds3text: 'Your data submitted via the contact form is stored in a secure database (Supabase, EU data centre Frankfurt, Germany). The data will be deleted as soon as it is no longer required for the purpose for which it was collected, at the latest after the statutory retention periods have expired. You can request the deletion of your data at any time.',
    ds4text: 'After receiving your enquiry, you will automatically receive a confirmation email. For sending, we use the Resend service (Resend Inc., GDPR-compliant, data processing in the EU). The email addresses provided are used exclusively for processing your enquiry and are not used for advertising purposes or passed on to third parties. The legal basis is Art. 6 para. 1 lit. b GDPR.',
    ds5list: ['Right to information (Art. 15 GDPR)','Right to rectification (Art. 16 GDPR)','Right to erasure (Art. 17 GDPR)','Right to restriction of processing (Art. 18 GDPR)','Right to data portability (Art. 20 GDPR)','Right to object (Art. 21 GDPR)'],
    ds5after: 'To exercise your rights:',
    ds6text: 'Competent supervisory authority: LDI NRW,',
    ds7text: 'This website does not use tracking cookies, analytics tools or advertising cookies. Only technically necessary cookies are used (e.g. for the secure operation of the web application). No consent is required for technically necessary cookies (§ 25 para. 2 TTDSG).',
    dsStand: 'January 2025',
  },
} as const
type Lang = keyof typeof T

export default function Home() {
  const [modal, setModal] = useState<null | 'impressum' | 'datenschutz'>(null)
  const [showFinancing, setShowFinancing] = useState(false)
  const [lang, setLang] = useState<Lang>('de')

  useEffect(() => {
    const browserLang = navigator.language?.toLowerCase() || ''
    if (browserLang.startsWith('sq') || browserLang.startsWith('sq-')) {
      setLang('sq')
    } else if (browserLang.startsWith('en') && !browserLang.startsWith('de')) {
      setLang('en')
    }
    // Default: 'de' stays
  }, [])
  const t = T[lang]

  return (
    <>
      <style>{`
        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
        html { scroll-behavior: smooth; }
        :root {
          --navy: #0f1f3d; --gold: #c9a84c; --gold-light: #e8c97a;
          --cream: #faf7f0; --slate: #2d3f5f; --mist: #eef2f8;
          --text: #1a2540; --text-light: #5a6a85; --white: #ffffff;
        }
        body { font-family: 'DM Sans', sans-serif; background: var(--cream); color: var(--text); overflow-x: hidden; }
        section { padding: 80px 5%; }
        @media(max-width:768px) { section { padding: 56px 4%; } }

        /* NAV */
        nav { position:fixed; top:0; left:0; right:0; z-index:100; background:rgba(15,31,61,0.97); backdrop-filter:blur(12px); display:flex; align-items:center; justify-content:space-between; padding:0 5%; height:64px; border-bottom:1px solid rgba(201,168,76,0.2); }
        .nav-logo { font-family:'Playfair Display',serif; font-size:1.2rem; color:var(--gold); text-decoration:none; }
        .nav-logo span { color:#fff; }
        .nav-links { display:flex; gap:20px; list-style:none; align-items:center; }
        .nav-links a { color:rgba(255,255,255,0.75); text-decoration:none; font-size:0.88rem; font-weight:500; transition:color .2s; }
        .nav-links a:hover { color:var(--gold); }
        .nav-cta { background:var(--gold) !important; color:var(--navy) !important; padding:8px 18px; border-radius:8px; font-weight:700 !important; }
        .lang-switcher { display:flex; gap:4px; }
        .lang-btn { background:rgba(255,255,255,0.08); border:1px solid rgba(255,255,255,0.15); color:rgba(255,255,255,0.6); padding:5px 10px; border-radius:6px; font-size:0.78rem; font-weight:700; cursor:pointer; transition:all .2s; font-family:'DM Sans',sans-serif; }
        .lang-btn:hover { border-color:var(--gold); color:var(--gold); }
        .lang-btn.active { background:var(--gold); border-color:var(--gold); color:var(--navy); }
        .hamburger { display:none; flex-direction:column; gap:5px; cursor:pointer; padding:4px; background:none; border:none; }
        .hamburger span { width:24px; height:2px; background:#fff; border-radius:2px; display:block; }
        @media(max-width:860px) { .nav-links { display:none; } .hamburger { display:flex; } }
        .mobile-menu { display:none; position:fixed; top:64px; left:0; right:0; background:rgba(15,31,61,0.99); padding:20px 5%; z-index:99; flex-direction:column; gap:14px; border-bottom:1px solid rgba(201,168,76,0.2); }
        .mobile-menu.open { display:flex; }
        .mobile-menu a { color:rgba(255,255,255,0.8); text-decoration:none; font-size:1rem; font-weight:500; padding:10px 0; border-bottom:1px solid rgba(255,255,255,0.06); }
        .mobile-menu a.gold { color:var(--gold); font-weight:700; }
        .mobile-lang { display:flex; gap:8px; padding:10px 0; }

        /* HERO */
        .hero { min-height:100svh; padding:100px 5% 60px; background:linear-gradient(145deg,var(--navy) 0%,var(--slate) 60%,#1a3a6e 100%); display:flex; align-items:center; position:relative; overflow:hidden; }
        .hero::before { content:''; position:absolute; inset:0; background:radial-gradient(ellipse 70% 60% at 80% 50%,rgba(201,168,76,0.07) 0%,transparent 70%); pointer-events:none; }
        .hero-content { max-width:640px; position:relative; z-index:1; }
        .hero-badge { display:inline-flex; align-items:center; gap:8px; background:rgba(201,168,76,0.15); border:1px solid rgba(201,168,76,0.35); padding:6px 14px; border-radius:100px; margin-bottom:28px; }
        .hero-badge-dot { width:7px; height:7px; background:var(--gold); border-radius:50%; animation:pulse 2s infinite; }
        @keyframes pulse { 0%,100%{opacity:1;transform:scale(1)} 50%{opacity:0.5;transform:scale(1.3)} }
        .hero-badge span { font-size:0.78rem; color:var(--gold); font-weight:700; letter-spacing:0.08em; text-transform:uppercase; }
        .hero h1 { font-family:'Playfair Display',serif; font-size:clamp(2.2rem,5.5vw,3.8rem); color:#fff; line-height:1.12; margin-bottom:20px; }
        .hero h1 em { color:var(--gold); font-style:normal; }
        .hero p { color:rgba(255,255,255,0.7); font-size:clamp(1rem,2.5vw,1.12rem); line-height:1.7; margin-bottom:36px; max-width:520px; }
        .hero-actions { display:flex; gap:14px; flex-wrap:wrap; }
        @media(max-width:480px){ .hero-actions { flex-direction:column; } }
        .btn-primary { background:var(--gold); color:var(--navy); padding:14px 28px; border-radius:10px; font-weight:700; font-size:0.95rem; text-decoration:none; border:none; cursor:pointer; transition:all .2s; display:inline-flex; align-items:center; gap:8px; }
        .btn-primary:hover { background:var(--gold-light); transform:translateY(-2px); }
        .btn-outline { background:transparent; color:#fff; padding:14px 28px; border-radius:10px; font-weight:600; font-size:0.95rem; text-decoration:none; border:1px solid rgba(255,255,255,0.3); transition:all .2s; display:inline-flex; align-items:center; gap:8px; }
        .btn-outline:hover { border-color:var(--gold); color:var(--gold); }
        .hero-stats { margin-top:52px; display:flex; gap:36px; flex-wrap:wrap; }
        .hero-stat-num { font-family:'Playfair Display',serif; font-size:1.9rem; color:var(--gold); font-weight:900; line-height:1; }
        .hero-stat-label { font-size:0.8rem; color:rgba(255,255,255,0.5); margin-top:4px; }

        /* LANG STRIP */
        .lang-strip { background:linear-gradient(135deg,var(--gold),var(--gold-light)); padding:24px 5%; display:flex; align-items:center; justify-content:center; gap:20px; flex-wrap:wrap; }
        .lang-strip p { font-weight:700; color:var(--navy); font-size:1rem; }
        .lang-flags { display:flex; gap:8px; font-size:1.5rem; }

        /* SECTIONS */
        .section-label { display:inline-flex; align-items:center; gap:8px; font-size:0.75rem; font-weight:700; letter-spacing:0.12em; text-transform:uppercase; color:var(--gold); margin-bottom:14px; }
        .section-label::before { content:''; width:22px; height:2px; background:var(--gold); }
        h2.section-title { font-family:'Playfair Display',serif; font-size:clamp(1.8rem,4.5vw,2.8rem); color:var(--navy); line-height:1.2; margin-bottom:14px; }
        .section-sub { color:var(--text-light); font-size:1.02rem; line-height:1.7; max-width:560px; margin-bottom:48px; }

        /* SERVICES */
        #leistungen { background:var(--white); }
        .services-grid { display:grid; grid-template-columns:repeat(3,1fr); gap:22px; }
        @media(max-width:900px){ .services-grid { grid-template-columns:repeat(2,1fr); } }
        @media(max-width:540px){ .services-grid { grid-template-columns:1fr; } }
        .service-card { background:var(--cream); border:1px solid rgba(15,31,61,0.07); border-radius:16px; padding:28px 24px; transition:all .25s; position:relative; overflow:hidden; display:flex; flex-direction:column; }
        .service-card::after { content:''; position:absolute; bottom:0; left:0; right:0; height:3px; background:linear-gradient(90deg,var(--gold),var(--gold-light)); transform:scaleX(0); transform-origin:left; transition:transform .3s; }
        .service-card:hover { box-shadow:0 20px 60px rgba(15,31,61,0.14); transform:translateY(-4px); }
        .service-card:hover::after { transform:scaleX(1); }
        .service-icon { width:48px; height:48px; background:linear-gradient(135deg,var(--navy),var(--slate)); border-radius:12px; display:flex; align-items:center; justify-content:center; font-size:1.4rem; margin-bottom:18px; flex-shrink:0; }
        .service-card h3 { font-family:'Playfair Display',serif; font-size:1.15rem; color:var(--navy); margin-bottom:9px; }
        .service-card p { color:var(--text-light); font-size:0.9rem; line-height:1.65; margin-bottom:16px; flex:1; }
        .service-price { display:inline-flex; align-items:center; gap:5px; background:rgba(15,31,61,0.06); padding:6px 12px; border-radius:8px; font-size:0.83rem; font-weight:700; color:var(--navy); align-self:flex-start; margin-top:auto; }
        .service-tag { position:absolute; top:14px; right:14px; background:var(--gold); color:var(--navy); font-size:0.65rem; font-weight:700; letter-spacing:0.06em; padding:3px 9px; border-radius:100px; text-transform:uppercase; }

        /* PROCESS */
        #ablauf { background:var(--mist); }
        .process-steps { display:grid; grid-template-columns:repeat(4,1fr); gap:0; }
        @media(max-width:640px){ .process-steps { grid-template-columns:repeat(2,1fr); } }
        .step { text-align:center; padding:16px 16px 28px; }
        .step-num { width:60px; height:60px; background:linear-gradient(135deg,var(--navy),var(--slate)); border:3px solid var(--gold); border-radius:50%; display:flex; align-items:center; justify-content:center; font-family:'Playfair Display',serif; font-size:1.35rem; font-weight:900; color:var(--gold); margin:0 auto 18px; }
        .step h3 { font-size:0.95rem; font-weight:700; color:var(--navy); margin-bottom:7px; }
        .step p { font-size:0.85rem; color:var(--text-light); line-height:1.6; }

        /* PRICING */
        #preise { background:var(--navy); }
        #preise h2.section-title { color:#fff; }
        #preise .section-sub { color:rgba(255,255,255,0.6); }
        .pricing-grid { display:grid; grid-template-columns:repeat(5,1fr); gap:18px; align-items:stretch; }
        @media(max-width:1100px){ .pricing-grid { grid-template-columns:repeat(3,1fr); } }
        @media(max-width:700px){ .pricing-grid { grid-template-columns:repeat(2,1fr); } }
        @media(max-width:480px){ .pricing-grid { grid-template-columns:1fr; } }
        .price-card { background:rgba(255,255,255,0.05); border:1px solid rgba(255,255,255,0.1); border-radius:20px; padding:28px 24px; transition:all .25s; position:relative; display:flex; flex-direction:column; }
        .price-card.featured { background:var(--gold); border-color:var(--gold); }
        .price-card:not(.featured):hover { border-color:rgba(201,168,76,0.4); }
        .price-badge { position:absolute; top:-12px; left:50%; transform:translateX(-50%); background:var(--navy); color:var(--gold); font-size:0.68rem; font-weight:700; letter-spacing:0.08em; padding:4px 14px; border-radius:100px; text-transform:uppercase; border:1px solid var(--gold); white-space:nowrap; }
        .price-card h3 { font-family:'Playfair Display',serif; font-size:1.1rem; color:#fff; margin-bottom:6px; }
        .price-card.featured h3 { color:var(--navy); }
        .price-desc { font-size:0.83rem; color:rgba(255,255,255,0.5); margin-bottom:22px; }
        .price-card.featured .price-desc { color:rgba(15,31,61,0.6); }
        .price-amount { display:flex; align-items:baseline; gap:3px; margin-bottom:22px; }
        .price-eur { font-size:1rem; font-weight:600; color:var(--gold); }
        .price-card.featured .price-eur { color:var(--navy); }
        .price-num { font-family:'Playfair Display',serif; font-size:2.4rem; font-weight:900; color:#fff; line-height:1; }
        .price-card.featured .price-num { color:var(--navy); }
        .price-period { font-size:0.82rem; color:rgba(255,255,255,0.45); }
        .price-card.featured .price-period { color:rgba(15,31,61,0.55); }
        .price-features { list-style:none; display:flex; flex-direction:column; gap:9px; margin-bottom:26px; flex:1; }
        .price-features li { font-size:0.86rem; color:rgba(255,255,255,0.75); display:flex; align-items:flex-start; gap:9px; }
        .price-features li::before { content:'→'; color:var(--gold); font-weight:700; flex-shrink:0; }
        .price-card.featured .price-features li { color:rgba(15,31,61,0.85); }
        .price-card.featured .price-features li::before { color:var(--navy); }
        .btn-price { display:block; width:100%; background:rgba(255,255,255,0.1); color:#fff; padding:13px; border-radius:10px; text-align:center; font-weight:700; font-size:0.9rem; text-decoration:none; border:1px solid rgba(255,255,255,0.2); transition:all .2s; margin-top:auto; }
        .btn-price:hover { background:var(--gold); color:var(--navy); border-color:var(--gold); }
        .price-card.featured .btn-price { background:var(--navy); color:var(--gold); border-color:var(--navy); }

        /* TESTIMONIALS */
        #bewertungen { background:var(--mist); }
        .testimonials-grid { display:grid; grid-template-columns:repeat(3,1fr); gap:18px; }
        @media(max-width:768px){ .testimonials-grid { grid-template-columns:1fr; } }
        .testimonial { background:#fff; border-radius:16px; padding:26px; box-shadow:0 8px 32px rgba(15,31,61,0.08); display:flex; flex-direction:column; }
        .t-stars { color:var(--gold); font-size:0.95rem; margin-bottom:12px; letter-spacing:2px; }
        .testimonial p { font-size:0.9rem; color:var(--text-light); line-height:1.65; margin-bottom:16px; flex:1; }
        .t-author { display:flex; align-items:center; gap:10px; margin-top:auto; }
        .t-avatar { width:38px; height:38px; border-radius:50%; background:linear-gradient(135deg,var(--navy),var(--slate)); display:flex; align-items:center; justify-content:center; font-family:'Playfair Display',serif; color:var(--gold); font-weight:700; font-size:0.95rem; flex-shrink:0; }
        .t-name { font-weight:700; font-size:0.88rem; color:var(--navy); }
        .t-sub { font-size:0.76rem; color:var(--text-light); }

        /* FINANCING */
        #finanzierung { background:var(--navy); }
        .financing-toggle {
          display:inline-flex; align-items:center; gap:10px;
          background:var(--gold); color:var(--navy);
          padding:15px 32px; border-radius:12px; border:none; cursor:pointer;
          font-family:'DM Sans',sans-serif; font-size:1rem; font-weight:700;
          transition:all .2s; margin-top:8px;
        }
        .financing-toggle:hover { background:var(--gold-light); transform:translateY(-2px); box-shadow:0 8px 24px rgba(201,168,76,0.4); }
        .financing-toggle .arrow { transition:transform .3s; display:inline-block; }
        .financing-toggle.open .arrow { transform:rotate(180deg); }
        .financing-collapse {
          max-height:0; overflow:hidden;
          transition:max-height .5s ease, opacity .3s ease;
          opacity:0;
        }
        .financing-collapse.open {
          max-height:2000px;
          opacity:1;
        }
        #finanzierung h2.section-title { color:#fff; }
        #finanzierung .section-sub { color:rgba(255,255,255,0.6); }
        .financing-wrapper { display:grid; grid-template-columns:1fr 1.2fr; gap:48px; align-items:start; flex-wrap:wrap; }
        @media(max-width:768px){ .financing-wrapper { grid-template-columns:1fr; gap:32px; } }
        .financing-info p { color:rgba(255,255,255,0.6); font-size:0.95rem; line-height:1.7; margin-bottom:20px; }
        .financing-perks { list-style:none; display:flex; flex-direction:column; gap:12px; margin-top:20px; }
        .financing-perks li { display:flex; align-items:flex-start; gap:10px; font-size:0.9rem; color:rgba(255,255,255,0.7); line-height:1.55; }
        .financing-perks li::before { content:'✓'; width:22px; height:22px; background:var(--gold); color:var(--navy); border-radius:50%; font-size:0.68rem; font-weight:800; display:flex; align-items:center; justify-content:center; flex-shrink:0; margin-top:1px; }

        /* BOOKING */
        #buchen { background:var(--white); }
        .booking-wrapper { display:grid; grid-template-columns:1fr 1fr; gap:48px; align-items:start; }
        @media(max-width:768px){ .booking-wrapper { grid-template-columns:1fr; gap:32px; } }
        .booking-info ul { list-style:none; margin-top:22px; display:flex; flex-direction:column; gap:12px; }
        .booking-info li { display:flex; align-items:flex-start; gap:10px; font-size:0.92rem; color:var(--text-light); line-height:1.55; }
        .booking-info li::before { content:'✓'; width:22px; height:22px; background:var(--gold); color:var(--navy); border-radius:50%; font-size:0.68rem; font-weight:800; display:flex; align-items:center; justify-content:center; flex-shrink:0; margin-top:1px; }
        .contact-links { margin-top:24px; display:flex; flex-direction:column; gap:10px; }
        .contact-links a { color:var(--text-light); text-decoration:none; font-size:0.92rem; display:flex; align-items:center; gap:8px; transition:color .2s; }
        .contact-links a:hover { color:var(--gold); }

        /* FOOTER */
        footer { background:#080e1e; padding:52px 5% 28px; }
        .footer-grid { display:grid; grid-template-columns:2fr 1fr 1fr; gap:36px; margin-bottom:36px; }
        @media(max-width:768px){ .footer-grid { grid-template-columns:1fr; gap:28px; } }
        .footer-brand p { color:rgba(255,255,255,0.4); font-size:0.87rem; line-height:1.7; margin-top:12px; max-width:280px; }
        .footer-col h4 { color:var(--gold); font-size:0.78rem; font-weight:700; letter-spacing:0.1em; text-transform:uppercase; margin-bottom:14px; }
        .footer-col ul { list-style:none; display:flex; flex-direction:column; gap:9px; }
        .footer-col ul li a { color:rgba(255,255,255,0.45); text-decoration:none; font-size:0.87rem; transition:color .2s; cursor:pointer; }
        .footer-col ul li a:hover { color:var(--gold); }
        .footer-bottom { border-top:1px solid rgba(255,255,255,0.07); padding-top:22px; display:flex; align-items:center; justify-content:space-between; flex-wrap:wrap; gap:10px; }
        .footer-bottom p { color:rgba(255,255,255,0.28); font-size:0.78rem; }
        .dev-credit { color:rgba(255,255,255,0.35); text-decoration:none; transition:color .2s; }
        .dev-credit:hover { color:#c9a84c; }

        /* FLOATING CTA */
        .floating-cta { position:fixed; bottom:80px; right:22px; z-index:99; background:var(--gold); color:var(--navy); padding:13px 20px; border-radius:50px; font-weight:700; font-size:0.88rem; text-decoration:none; box-shadow:0 8px 24px rgba(201,168,76,0.5); display:flex; align-items:center; gap:7px; transition:all .2s; animation:floatIn .8s 1.5s both; }
        @keyframes floatIn { from{opacity:0;transform:translateY(20px)} to{opacity:1;transform:translateY(0)} }
        .floating-cta:hover { transform:translateY(-3px); box-shadow:0 12px 32px rgba(201,168,76,0.6); }

        /* MODAL */
        .modal-overlay { position:fixed; inset:0; background:rgba(0,0,0,0.6); z-index:200; display:flex; align-items:center; justify-content:center; padding:20px; backdrop-filter:blur(4px); }
        .modal-box { background:#fff; border-radius:20px; padding:40px; max-width:680px; width:100%; max-height:85vh; overflow-y:auto; position:relative; }
        @media(max-width:540px){ .modal-box { padding:28px 20px; } }
        .modal-close { position:absolute; top:16px; right:16px; background:var(--mist); border:none; border-radius:50%; width:36px; height:36px; font-size:1.1rem; cursor:pointer; display:flex; align-items:center; justify-content:center; transition:background .2s; }
        .modal-close:hover { background:#e0e4ed; }
        .modal-box h2 { font-family:'Playfair Display',serif; font-size:1.6rem; color:var(--navy); margin-bottom:24px; }
        .modal-box h3 { font-size:0.95rem; font-weight:700; color:var(--navy); margin:20px 0 6px; }
        .modal-box p { font-size:0.92rem; color:var(--text-light); line-height:1.7; }
        .modal-box ul { padding-left:18px; margin-top:6px; display:flex; flex-direction:column; gap:4px; }
        .modal-box ul li { font-size:0.92rem; color:var(--text-light); line-height:1.6; }
        .modal-box a { color:var(--gold); }
      `}</style>

      {/* NAV */}
      <nav>
        <a className="nav-logo" href="#"><span>Antrags</span>helfer<span>Pro</span></a>
        <ul className="nav-links">
          <li><a href="#leistungen">{t.navLeistungen}</a></li>
          <li><a href="#preise">{t.navPreise}</a></li>
          <li><a href="#ablauf">{t.navAblauf}</a></li>
          <li><a href="#bewertungen">{t.navBewertungen}</a></li>
          <li><a href="#finanzierung">{lang === 'de' ? 'Finanzierung' : lang === 'sq' ? 'Financim' : 'Financing'}</a></li>
          <li>
            <div className="lang-switcher">
              {(['de','sq','en'] as Lang[]).map(l => (
                <button key={l} className={`lang-btn ${lang === l ? 'active' : ''}`} onClick={() => setLang(l)}>
                  {l === 'de' ? '🇩🇪' : l === 'sq' ? '🇦🇱' : '🇬🇧'}
                </button>
              ))}
            </div>
          </li>
          <li><a href="#buchen" className="nav-cta">{t.navBuchen}</a></li>
        </ul>
        <button className="hamburger" onClick={() => { const m = document.getElementById('mob'); if(m) m.classList.toggle('open'); }}>
          <span/><span/><span/>
        </button>
      </nav>
      <div className="mobile-menu" id="mob">
        <div className="mobile-lang">
          {(['de','sq','en'] as Lang[]).map(l => (
            <button key={l} className={`lang-btn ${lang === l ? 'active' : ''}`}
              onClick={() => { setLang(l); document.getElementById('mob')?.classList.remove('open'); }}>
              {l === 'de' ? '🇩🇪 DE' : l === 'sq' ? '🇦🇱 SQ' : '🇬🇧 EN'}
            </button>
          ))}
        </div>
        <a href="#leistungen" onClick={() => document.getElementById('mob')?.classList.remove('open')}>{t.navLeistungen}</a>
        <a href="#preise" onClick={() => document.getElementById('mob')?.classList.remove('open')}>{t.navPreise}</a>
        <a href="#ablauf" onClick={() => document.getElementById('mob')?.classList.remove('open')}>{t.navAblauf}</a>
        <a href="#bewertungen" onClick={() => document.getElementById('mob')?.classList.remove('open')}>{t.navBewertungen}</a>
        <a href="#finanzierung" onClick={() => document.getElementById('mob')?.classList.remove('open')}>{lang === 'de' ? 'Finanzierung' : lang === 'sq' ? 'Financim' : 'Financing'}</a>
        <a href="#buchen" className="gold" onClick={() => document.getElementById('mob')?.classList.remove('open')}>→ {t.navBuchen}</a>
      </div>

      {/* HERO */}
      <section className="hero" id="home">
        <div className="hero-content">
          <div className="hero-badge"><div className="hero-badge-dot" /><span>{t.badge}</span></div>
          <h1>{t.h1a} <em>{t.h1b}</em> {t.h1c}</h1>
          <p>{t.sub}</p>
          <div className="hero-actions">
            <a href="#buchen" className="btn-primary">{t.cta1}</a>
            <a href="#leistungen" className="btn-outline">{t.cta2}</a>
          </div>
          <div className="hero-stats">
            {([['500+', t.stat1],['98%', t.stat2],['3', t.stat3]] as [string,string][]).map(([n,l]) => (
              <div key={l}><div className="hero-stat-num">{n}</div><div className="hero-stat-label">{l}</div></div>
            ))}
          </div>
        </div>
      </section>

      {/* LANG STRIP */}
      <div className="lang-strip">
        <p>{t.langLabel}</p>
        <div className="lang-flags">🇩🇪 🇦🇱 🇬🇧</div>
        <p>Deutsch · Shqip · English</p>
      </div>

      {/* SERVICES */}
      <section id="leistungen">
        <div className="section-label">{t.secLeistungenLabel}</div>
        <h2 className="section-title">{t.secLeistungenTitle}</h2>
        <p className="section-sub">{t.secLeistungenSub}</p>
        <div className="services-grid">
          {t.services.map((s: any) => (
            <div className="service-card" key={s.title}>
              {s.tag && <div className="service-tag">{s.tag}</div>}
              <div className="service-icon">{s.icon}</div>
              <h3>{s.title}</h3>
              <p>{s.desc}</p>

            </div>
          ))}
        </div>
      </section>

      {/* PROCESS */}
      <section id="ablauf">
        <div className="section-label">{t.secAblaufLabel}</div>
        <h2 className="section-title">{t.secAblaufTitle}</h2>
        <p className="section-sub">{t.secAblaufSub}</p>
        <div className="process-steps">
          {t.steps.map(([n,h,p]: readonly string[]) => (
            <div className="step" key={n}>
              <div className="step-num">{n}</div>
              <h3>{h}</h3>
              <p>{p}</p>
            </div>
          ))}
        </div>
      </section>

      {/* PRICING */}
      <section id="preise">
        <div className="section-label">{t.secPreiseLabel}</div>
        <h2 className="section-title">{t.secPreiseTitle}</h2>
        <p className="section-sub">{t.secPreiseSub}</p>
        <div className="pricing-grid">
          {t.pricing.map((p: any) => (
            <div className={`price-card ${p.featured ? 'featured' : ''}`} key={p.title}>
              {p.featured && <div className="price-badge">{t.empfohlen}</div>}
              <h3>{p.title}</h3>
              <div className="price-desc">{p.desc}</div>
              <div className="price-amount">
                {p.price !== 'Gratis' && p.price !== 'Free' && p.price !== 'Falas' && <span className="price-eur">€</span>}
                <span className="price-num" style={['Gratis','Free','Falas'].includes(p.price) ? {fontSize:'1.8rem'} : {}}>{p.price}</span>
                {p.period && <span className="price-period">{p.period}</span>}
              </div>
              <ul className="price-features">{p.features.map((f: string) => <li key={f}>{f}</li>)}</ul>
              <a href="#buchen" className="btn-price">{t.btnBuchen}</a>
            </div>
          ))}
        </div>
      </section>

      {/* TESTIMONIALS */}
      <section id="bewertungen">
        <div className="section-label">{t.secBewLabel}</div>
        <h2 className="section-title">{t.secBewTitle}</h2>
        <p className="section-sub">{t.secBewSub}</p>
        <div className="testimonials-grid">
          {t.testimonials.map((tv: any) => (
            <div className="testimonial" key={tv.name}>
              <div className="t-stars">★★★★★</div>
              <p>„{tv.text}"</p>
              <div className="t-author">
                <div className="t-avatar">{tv.init}</div>
                <div><div className="t-name">{tv.name}</div><div className="t-sub">{tv.sub}</div></div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* FINANCING */}
      <section id="finanzierung">
        <div className="financing-wrapper">
          <div className="financing-info">
            <div className="section-label">{t.secFinanzLabel}</div>
            <h2 className="section-title">{t.secFinanzTitle}</h2>
            <p className="section-sub">{t.secFinanzSub}</p>
            <ul className="financing-perks">
              {[
                lang==='sq' ? 'Falas dhe pa detyrime' : lang==='en' ? 'Free and without obligation' : 'Kostenlos und unverbindlich',
                lang==='sq' ? 'Dërgim i menjëhershëm tek partneri' : lang==='en' ? 'Immediate forwarding to partner' : 'Sofortige Weiterleitung an den Partner',
                lang==='sq' ? 'Të gjitha llojet e financimit' : lang==='en' ? 'All types of financing' : 'Alle Finanzierungsarten möglich',
                lang==='sq' ? 'Përgjigje brenda 24–48 orëve' : lang==='en' ? 'Response within 24–48 hours' : 'Rückmeldung innerhalb von 24–48 Stunden',
              ].map((item: string) => <li key={item}>{item}</li>)}
            </ul>
            <button
              className={`financing-toggle ${showFinancing ? 'open' : ''}`}
              onClick={() => setShowFinancing(v => !v)}
            >
              {showFinancing
                ? (lang==='sq' ? 'Mbyll formularin' : lang==='en' ? 'Close form' : 'Formular schließen')
                : (lang==='sq' ? '🏦 Financim kërkoni tani' : lang==='en' ? '🏦 Apply for financing' : '🏦 Jetzt Finanzierung anfragen')}
              <span className="arrow">▼</span>
            </button>
          </div>
          <div className={`financing-collapse ${showFinancing ? 'open' : ''}`}
            style={{gridColumn:'1 / -1', marginTop: showFinancing ? 24 : 0}}>
            <FinancingForm lang={lang} />
          </div>
        </div>
      </section>

      {/* BOOKING */}
      <section id="buchen" style={{background:'#fff'}}>
        <div className="booking-wrapper">
          <div className="booking-info">
            <div className="section-label">{t.secBuchenLabel}</div>
            <h2 className="section-title">{t.secBuchenTitle}</h2>
            <p className="section-sub" style={{marginBottom:0}}>{t.secBuchenSub}</p>
            <ul>{t.buchenList.map((i: string) => <li key={i}>{i}</li>)}</ul>
            <div className="contact-links">
              <a href="tel:+4917451560330">📞 +49 174 5156030</a>
              <a href="mailto:antragshelferpro@gmail.com">✉️ antragshelferpro@gmail.com</a>
              <a href="https://wa.me/4917451560330">💬 WhatsApp</a>
            </div>
          </div>
          <BookingForm lang={lang} />
        </div>
      </section>

      {/* FOOTER */}
      <footer>
        <div className="footer-grid">
          <div className="footer-brand">
            <a className="nav-logo" href="#"><span>Antrags</span>helfer<span>Pro</span></a>
            <p>{t.footerDesc}</p>
          </div>
          <div className="footer-col">
            <h4>{t.footerLeistungen}</h4>
            <ul>{t.footerLinks.map((l: string) => <li key={l}><a href="#leistungen">{l}</a></li>)}</ul>
          </div>
          <div className="footer-col">
            <h4>{t.footerRechtliches}</h4>
            <ul>
              <li><a onClick={() => setModal('impressum')}>{t.impressum}</a></li>
              <li><a onClick={() => setModal('datenschutz')}>{t.datenschutz}</a></li>
              <li><a href="#buchen">{t.kontakt}</a></li>
            </ul>
          </div>
        </div>
        <div className="footer-bottom">
          <p>{t.copyright}</p>
          <p>Preise inkl. MwSt.</p>
          <p>Entwickelt von <a href="https://lr-vitality.de" target="_blank" rel="noreferrer" className="dev-credit">LR-vitality.de</a></p>
        </div>
      </footer>

      <a href="#buchen" className="floating-cta">{t.floatingCta}</a>

      {/* IMPRESSUM MODAL */}
      {modal === 'impressum' && (
        <div className="modal-overlay" onClick={() => setModal(null)}>
          <div className="modal-box" onClick={e => e.stopPropagation()}>
            <button className="modal-close" onClick={() => setModal(null)}>✕</button>
            <h2>{t.impTitle}</h2>
            <h3>{t.impAngaben}</h3>
            <p>Mentor Berisha<br/>Krischerstraße 6b<br/>40789 Monheim am Rhein<br/><span style={{fontSize:'0.82rem',color:'#9ca3af',fontStyle:'italic'}}>{t.impAdresseHinweis}</span></p>
            <h3>{t.impKontakt}</h3>
            <p>Tel: <a href="tel:+4917451560330">+49 174 5156030</a><br/>E-Mail: <a href="mailto:antragshelferpro@gmail.com">antragshelferpro@gmail.com</a></p>
            <h3>{t.impVerantwortlich}</h3>
            <p>Mentor Berisha · Krischerstraße 6b · 40789 Monheim am Rhein</p>
            <h3>{t.impHaftung}</h3>
            <p>{t.impHaftungText}</p>
            <h3>{t.impHinweis}</h3>
            <p>{t.impHinweisText}</p>
          </div>
        </div>
      )}

      {/* DATENSCHUTZ MODAL */}
      {modal === 'datenschutz' && (
        <div className="modal-overlay" onClick={() => setModal(null)}>
          <div className="modal-box" onClick={e => e.stopPropagation()}>
            <button className="modal-close" onClick={() => setModal(null)}>✕</button>
            <h2>{t.dsTitle}</h2>
            <h3>{t.ds1}</h3>
            <p>Mentor Berisha · Krischerstraße 6b · 40789 Monheim am Rhein<br/>
              E-Mail: <a href="mailto:antragshelferpro@gmail.com">antragshelferpro@gmail.com</a><br/>
              Tel: <a href="tel:+4917451560330">+49 174 5156030</a></p>
            <h3>{t.ds2}</h3><p>{t.ds2text}</p>
            <h3>{t.ds3}</h3><p>{t.ds3text}</p>
            <h3>{t.ds4}</h3><p>{t.ds4text}</p>
            <h3>{t.ds5}</h3>
            <ul>{t.ds5list.map((i: string) => <li key={i}>{i}</li>)}</ul>
            <p style={{marginTop:10}}>{t.ds5after} <a href="mailto:antragshelferpro@gmail.com">antragshelferpro@gmail.com</a></p>
            <h3>{t.ds6}</h3>
            <p>{t.ds6text} <a href="https://www.ldi.nrw.de" target="_blank" rel="noreferrer">www.ldi.nrw.de</a></p>
            <h3>{t.ds7}</h3><p>{t.ds7text}</p>
            <p style={{marginTop:20, fontSize:'0.8rem', color:'#9ca3af'}}>{t.dsStand}</p>
          </div>
        </div>
      )}
    </>
  )
}
