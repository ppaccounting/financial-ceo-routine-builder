# Financial CEO 30-Minute Routine Builder — VIP MVP

Static, browser-based prototype. Open `index.html` in a modern browser or deploy folder to Cloudflare Workers static assets through a GitHub repo.

## Included
- Review (5), Approve (10), Understand (10), Act (5)
- Guided questions, checkboxes, and editable notes
- Question / issue list with critical, watch, and normal status
- Carry forward unresolved items to the next weekly check-in
- Saved weekly summaries in this browser using localStorage
- Print / Save as PDF via browser's native print dialog
- Contact email, phone, scheduling link

## IMPORTANT limitations before organizer testing
- `localStorage` means saved weeks stay only on one browser/device and can disappear if cache/site data is cleared; Incognito sessions will lose data.
- No Supabase database persistence yet; no accounts, secure cross-device sync, or GoHighLevel email collection.
- No QuickBooks account connection, AI inference, reconciliation, or automated accuracy checks. This is an AI-supported workflow organizer, not bookkeeping automation itself.
- Validate in Chrome / Safari / mobile; test without private/incognito mode for saved history.
- No participant contact collection; optional permission-based integration after summit rules confirmed.
