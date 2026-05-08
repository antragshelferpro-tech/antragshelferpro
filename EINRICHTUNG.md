# 🚀 AntragsHilfe Pro – Einrichtungsanleitung

Dieses Dokument führt Sie **Schritt für Schritt** durch die komplette Einrichtung.
Gesamtdauer: ca. **30–45 Minuten** (kein Vorwissen nötig).

---

## Übersicht: Was wird eingerichtet?

| Dienst | Zweck | Kosten |
|---|---|---|
| **GitHub** | Speicherort für den Code | Kostenlos |
| **Supabase** | Datenbank für alle Buchungen | Kostenlos (bis 500 MB) |
| **Resend** | E-Mail-Versand (Bestätigungen) | Kostenlos (3.000/Monat) |
| **Vercel** | Webseite online stellen | Kostenlos |

---

## SCHRITT 1 – GitHub Repository anlegen

1. Gehen Sie zu [github.com](https://github.com) und registrieren Sie sich (falls noch kein Konto)
2. Klicken Sie oben rechts auf **„New repository"** (das grüne Plus-Symbol)
3. Name: `antragshilfe-pro`
4. Sichtbarkeit: **Private** (empfohlen)
5. Klicken Sie auf **„Create repository"**

### Code hochladen (per Drag & Drop):
1. Öffnen Sie das neue Repository
2. Klicken Sie auf **„uploading an existing file"**
3. Laden Sie alle Projektdateien hoch (den gesamten `antragshilfe`-Ordner)
4. Klicken Sie auf **„Commit changes"**

> 💡 **Tipp**: Wenn Sie technischer sind, können Sie auch `git push` nutzen.

---

## SCHRITT 2 – Supabase Datenbank einrichten

### 2.1 Account erstellen
1. Gehen Sie zu [supabase.com](https://supabase.com)
2. Klicken Sie auf **„Start your project"**
3. Melden Sie sich mit Ihrem GitHub-Account an (einfachste Option)

### 2.2 Neues Projekt anlegen
1. Klicken Sie auf **„New Project"**
2. Wählen Sie Ihre Organisation (Ihr Name)
3. Füllen Sie aus:
   - **Name**: `antragshilfe-pro`
   - **Database Password**: Sicheres Passwort erstellen & **notieren!**
   - **Region**: `EU Central (Frankfurt)` ← wichtig für DSGVO
4. Klicken Sie auf **„Create new project"**
5. Warten Sie ca. 2 Minuten bis das Projekt bereit ist

### 2.3 Datenbank-Tabelle anlegen
1. Im Supabase Dashboard: Linkes Menü → **„SQL Editor"**
2. Klicken Sie auf **„New query"**
3. Fügen Sie folgenden Code ein und klicken Sie auf **„Run"** (▶️):

```sql
-- Buchungen-Tabelle erstellen
CREATE TABLE bookings (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  vorname TEXT NOT NULL,
  nachname TEXT NOT NULL,
  email TEXT NOT NULL,
  telefon TEXT,
  leistung TEXT NOT NULL,
  sprache TEXT DEFAULT 'Deutsch',
  nachricht TEXT,
  status TEXT DEFAULT 'neu' CHECK (status IN ('neu', 'bestätigt', 'abgeschlossen', 'storniert'))
);

-- Sicherheitsregel: Nur Einfügen erlaubt (kein öffentliches Lesen/Löschen)
ALTER TABLE bookings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Buchungen einfügen" ON bookings
  FOR INSERT WITH CHECK (true);

-- Index für schnelle Abfragen
CREATE INDEX bookings_status_idx ON bookings(status);
CREATE INDEX bookings_created_at_idx ON bookings(created_at DESC);
```

✅ Sie sehen „Success. No rows returned" – das ist korrekt!

### 2.4 API-Schlüssel kopieren
1. Linkes Menü → **„Project Settings"** (Zahnrad-Symbol)
2. Klicken Sie auf **„API"**
3. Kopieren Sie diese zwei Werte und **bewahren Sie sie sicher auf**:
   - **Project URL**: `https://xxxxxxxxxx.supabase.co`
   - **anon public** Key: `eyJhbGciOiJIUzI1NiIs...` (langer Code)

---

## SCHRITT 3 – Resend E-Mail einrichten

### 3.1 Account erstellen
1. Gehen Sie zu [resend.com](https://resend.com)
2. Klicken Sie auf **„Get Started"** und registrieren Sie sich

### 3.2 Domain verifizieren (für professionelle Absenderadresse)
1. Dashboard → **„Domains"** → **„Add Domain"**
2. Geben Sie Ihre Domain ein (z.B. `antragshilfe-pro.de`)
3. Fügen Sie die angezeigten DNS-Einträge bei Ihrem Domain-Anbieter ein
4. Klicken Sie auf **„Verify"**

> ⚡ **Noch keine Domain?** Kein Problem! Resend gibt Ihnen eine Test-Adresse (`onboarding@resend.dev`). Ändern Sie in `app/api/bookings/route.ts` die `from`-Adresse auf `onboarding@resend.dev`.

### 3.3 API-Key erstellen
1. Dashboard → **„API Keys"** → **„Create API Key"**
2. Name: `antragshilfe-prod`
3. Permission: **„Sending access"**
4. Klicken Sie auf **„Add"**
5. **Kopieren Sie den Key sofort** – er wird nur einmal angezeigt! `re_xxxxxxxxx`

---

## SCHRITT 4 – Vercel einrichten & deployen

### 4.1 Account erstellen
1. Gehen Sie zu [vercel.com](https://vercel.com)
2. Klicken Sie auf **„Start Deploying"**
3. Melden Sie sich mit Ihrem **GitHub-Account** an

### 4.2 Projekt importieren
1. Klicken Sie auf **„Add New Project"**
2. Wählen Sie Ihr Repository `antragshilfe-pro` aus der Liste
3. Klicken Sie auf **„Import"**
4. Framework: Vercel erkennt **Next.js** automatisch ✅
5. Noch **NICHT** auf Deploy klicken – erst Umgebungsvariablen setzen!

### 4.3 Umgebungsvariablen eintragen
Klicken Sie auf **„Environment Variables"** und fügen Sie diese ein:

| Name | Wert | Wo finden? |
|---|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` | `https://xxx.supabase.co` | Supabase → Settings → API |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | `eyJhbGci...` | Supabase → Settings → API |
| `RESEND_API_KEY` | `re_xxxxxxxxx` | Resend → API Keys |
| `ADMIN_PASSWORD` | `IhrSicheresPasswort!` | Selbst festlegen (min. 12 Zeichen) |
| `BUSINESS_EMAIL` | `info@ihredomain.de` | Ihre E-Mail-Adresse |

Klicken Sie nach jeder Variable auf **„Add"**.

### 4.4 Deployen
1. Klicken Sie auf **„Deploy"**
2. Warten Sie ca. 2–3 Minuten
3. ✅ Fertig! Vercel zeigt Ihnen die URL: `antragshilfe-pro.vercel.app`

---

## SCHRITT 5 – Testen

### Buchungsformular testen:
1. Öffnen Sie Ihre Vercel-URL
2. Scrollen Sie zum Buchungsformular
3. Füllen Sie es aus und senden Sie es ab
4. Prüfen Sie:
   - ✅ Bestätigungs-E-Mail an Kunden gesendet?
   - ✅ Benachrichtigungs-E-Mail an Sie gesendet?
   - ✅ Buchung in Supabase gespeichert?

### Admin-Bereich testen:
1. Gehen Sie zu `ihreurl.vercel.app/admin`
2. Geben Sie Ihr Admin-Passwort ein
3. Die Buchung sollte erscheinen
4. Testen Sie die Statusänderung

---

## SCHRITT 6 – Eigene Domain verbinden (optional)

Falls Sie eine eigene Domain haben (z.B. `antragshilfe-pro.de`):

1. Vercel Dashboard → Ihr Projekt → **„Settings"** → **„Domains"**
2. Klicken Sie auf **„Add"** und geben Sie Ihre Domain ein
3. Folgen Sie den Anweisungen (DNS-Einträge bei Ihrem Domain-Anbieter setzen)
4. Nach 5–15 Minuten ist Ihre Domain aktiv

**Domain kaufen** (falls noch keine):
- [Namecheap.com](https://namecheap.com) – ca. 10–15 €/Jahr
- [Hetzner.com](https://hetzner.com) – deutsche Option, ca. 10 €/Jahr

---

## Inhalte anpassen

### Kontaktdaten ändern:
Öffnen Sie `app/page.tsx` und suchen Sie nach:
```
tel:+49XXXXXXXXXX  →  Ihre echte Telefonnummer
wa.me/49XXXXXXXXXX →  Ihre WhatsApp-Nummer  
info@antragshilfe-pro.de → Ihre E-Mail
```

### Firmenname ändern:
Suchen Sie in `app/page.tsx` nach `AntragsHilfe Pro` und ersetzen Sie es.

### Preise anpassen:
In `app/page.tsx` die `pricing-grid`-Section und in `components/BookingForm.tsx` das `SERVICES`-Array anpassen.

### Testimonials ersetzen:
In `app/page.tsx` die `testimonials-grid`-Section mit echten Kundenstimmen füllen.

---

## Updates deployen

Nach jeder Änderung am Code:
1. Datei auf GitHub hochladen/aktualisieren
2. Vercel erkennt die Änderung **automatisch** und deployed neu
3. In ca. 1–2 Minuten ist die Änderung live

---

## Admin-Bereich: Buchungen verwalten

URL: `ihreurl.vercel.app/admin`

**Funktionen:**
- 🔵 **Neu** – Neue, unbearbeitete Anfragen
- ✅ **Bestätigt** – Sie haben den Termin bestätigt
- ⬛ **Abgeschlossen** – Leistung wurde erbracht
- ❌ **Storniert** – Buchung wurde storniert

**Suche:** Nach Name, E-Mail oder Leistung filtern

**Tipp:** Bookmarken Sie die Admin-URL auf Ihrem Handy!

---

## Kosten-Zusammenfassung

| Phase | Kosten |
|---|---|
| Einrichtung | 0 € |
| Laufend (bis ~300 Buchungen/Monat) | 0 € |
| Domain (optional) | ~10 €/Jahr |
| **Gesamt erstes Jahr** | **max. 10 €** |

---

## Hilfe & Support

Bei Problemen prüfen Sie:
1. **Vercel Logs**: Dashboard → Ihr Projekt → „Functions" → Logs
2. **Supabase Logs**: Dashboard → „Logs" → „API"
3. **E-Mail nicht angekommen?** Resend Dashboard → „Logs" prüfen

---

*Erstellt mit AntragsHilfe Pro Buchungssystem v1.0*
