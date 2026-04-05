# AJ Connect — ERP für Schweizer Kirchgemeinden

> Menschen, Glaube und Organisation verbinden.

## Live Demo
[aj-connect.vercel.app](https://aj-connect.vercel.app)

## Über das Projekt
AJ Connect ist eine moderne ERP-Lösung speziell für Schweizer Kirchgemeinden. Gebaut als Single Page Application (HTML/CSS/JavaScript) — kein Framework, keine Build-Tools, sofort deploybar.

## Aktueller Stand (Version 0.1 — MVP)

### Fertige Module
- **Dashboard** — Übersicht mit Stats, Gottesdienst-Widget, Spenden, Schnellzugriff
- **Mitglieder** — Vollständige Verwaltung mit:
  - Tabelle mit konfigurierbaren Spalten (Zahnrad-Symbol)
  - Spalten-Einstellungen werden in localStorage gespeichert
  - Filter nach Status, Gruppe, Rolle
  - Rollen-Verwaltung mit Untertabelle
  - Small Group-Verwaltung mit Untertabelle
  - CSV Export
  - Neues Mitglied erfassen

### Module in Planung
- Kontakte & DMS
- Small Groups
- Gottesdienste
- Worship (Liederbuch, Band, Setlists)
- Veranstaltungen
- Twint & Spenden
- Kreditoren / Debitoren
- Verkauf / Einkauf / Artikel
- Personal / HR
- Dokumente (DMS, Exoscale Genf)

## Deployment

### Auf Vercel deployen
1. Dieses Repo auf GitHub hochladen
2. Auf [vercel.com](https://vercel.com) einloggen
3. "New Project" → GitHub Repo auswählen
4. Deploy klicken — fertig!

### Lokal starten
Einfach `index.html` im Browser öffnen — keine Installation nötig.

## Technologie
- **Frontend**: Reines HTML/CSS/JavaScript (keine Frameworks)
- **Hosting**: Vercel
- **Datenbank (geplant)**: Exoscale Genf (Schweizer Datenhaltung)
- **Zahlungen (geplant)**: Payrexx (Twint-Partner, Schweiz)

## Lizenzmodelle
| Plan | Preis | Mitglieder |
|------|-------|------------|
| Starter | CHF 149/Mt. | bis 200 |
| Professional | CHF 299/Mt. | unbegrenzt |

## Datenschutz
- Datenhaltung ausschliesslich in der Schweiz (Genf)
- DSG-konform
- AVV für jede Kirchgemeinde

## Gründer
IT-Projektleiter mit Microsoft Business Central Erfahrung, gläubiger Christ, Schweiz.

---
*AJ Connect — Version 0.1 MVP*
