# BRINZO

A Kerala delivery-booking site. Customer fills pickup, drop, item
details (with photo), picks a service and payment method, and on
confirmation the order — full details and the item photo — lands
automatically on your WhatsApp, via the official Meta WhatsApp Cloud
API. No third-party app, no manual copy-paste, no "share" button the
customer has to tap.

## Quick start

You need two things running: the React frontend and the Node backend
that talks to WhatsApp.

```bash
npm install
npm run install:server

npm run dev
```

That last command starts both at once (frontend on
http://localhost:5173, backend on http://localhost:4000). To run them
separately instead: `npm run dev:frontend` and `npm run dev:backend`.

**The app works without WhatsApp configured** — bookings still save,
the UI still completes the whole flow, the backend just logs a
warning and skips the WhatsApp step. See below to actually wire it up.

## Setting up WhatsApp delivery (the part that matters)

Full step-by-step instructions, including screenshots-equivalent
descriptions of every Meta dashboard screen, are in
[`server/WHATSAPP_SETUP.md`](server/WHATSAPP_SETUP.md). Short version:

1. Copy `server/.env.example` to `server/.env`.
2. Create a free Meta developer app at developers.facebook.com, add
   the WhatsApp product.
3. Copy the **Phone Number ID** and **temporary access token** shown
   immediately on the WhatsApp API Setup page into your `.env`.
4. Add your own WhatsApp number as a verified test recipient on that
   same page, and put it in `WHATSAPP_RECIPIENT_NUMBER`.
5. Restart the backend. Place a test order — it should land on your
   WhatsApp within a couple seconds.

The temporary token expires in 24 hours; `WHATSAPP_SETUP.md` also
covers generating a permanent one for real use.

## Why the image wasn't sending before

If you've tried wiring up WhatsApp before and the text arrived but
not the photo: the official Cloud API can't just be handed a local
file path or a `data:` URL. Sending an image is a **two-step** call —
upload the binary to get a `media_id`, then send a message
referencing that ID. This backend (`server/whatsapp.js`) does both
steps automatically. The previous frontend-only approach
(`wa.me/...` links) couldn't have worked at all for images — that URL
scheme only supports pre-filled text, by design.

## Flow

1. **Landing** (`/`) — hero, quick pickup/drop entry
2. **Locations** (`/book/locations`) — pickup/drop autocomplete
3. **Item details** (`/book/item`) — item type, photo (uploads to the
   backend immediately, not kept as base64 in the browser), size,
   recipient name & phone, notes
4. **Service select** (`/book/service`) — Bike, distance-based fee,
   live map preview, cash/online toggle
5. **Login** (`/login`) → **OTP** (`/otp`) — phone verification
   (demo code shown on screen — see note below)
6. **Matching** (`/matching`) — on entry, sends the full booking to
   the backend, which formats it and forwards it to WhatsApp; shows
   a progress animation while that happens
7. **Tracking** (`/tracking`) — confirmation, route, price, item
   photo; shows a soft warning if the WhatsApp send failed (booking
   itself is never blocked by that)

OTP is still a UI-only demo (not a real SMS) — that's a separate,
unrelated piece from the WhatsApp work and hasn't been touched here.

## Project structure

```
src/
  components/   Logo, Button, LocationInput, RouteLine, FlowHeader, PageShell
  context/      BookingContext - shared state; confirmBooking() calls the backend
  pages/        One file + one CSS file per screen
  utils/api.js  Frontend client for image upload + booking creation

server/
  index.js          Express app - upload + booking endpoints
  whatsapp.js       Meta WhatsApp Cloud API client (media upload + send)
  formatMessage.js  Builds the order message text
  db.js             Tiny JSON-file datastore (no native deps)
  WHATSAPP_SETUP.md Full Meta dashboard walkthrough
  uploads/          Item photos land here, served at /uploads/<file>
  data/store.json   Saved bookings (gitignored)
```

## Notes for going to production

- The JSON-file datastore (`server/db.js`) is fine for getting
  started; swap for a real database if order volume grows.
- Uploaded images live on local disk — back them up or move to
  object storage (S3, etc.) if you redeploy the server, since a
  fresh deploy with an empty `uploads/` folder will break links to
  past bookings' photos.
- Use a permanent WhatsApp access token (see `WHATSAPP_SETUP.md`) —
  the temporary one expires daily and will silently stop working.
