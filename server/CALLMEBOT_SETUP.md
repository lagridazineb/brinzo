# WhatsApp notifications via CallMeBot (quick setup)

This is the **easy** way to get a WhatsApp message every time a new
delivery comes in — no Facebook Business account, no app review,
just one WhatsApp message to activate it. Takes about 2 minutes.

It's a free third-party service (not run by WhatsApp or Meta), so
keep in mind:
- It only sends **plain text** — no photo. (The item photo is still
  visible in the admin dashboard, and goes out by email too if you
  set that up.)
- It's meant for personal/low-volume use, not guaranteed uptime.
- It can only message the one number that activated it — yours.

If you later want the officially-supported option instead (or as
well — both can run at the same time), see `WHATSAPP_SETUP.md`.

## Steps

1. Open **[callmebot.com/whatsapp](https://www.callmebot.com/blog/free-api-whatsapp-messages/)**
   and copy the current bot phone number shown there under "Add the
   bot phone number ... into your Phone Contacts." (It changes from
   time to time, so always grab it fresh from that page rather than
   from an old screenshot or tutorial.)

2. On the phone that should receive delivery notifications
   (**+91 80891 18428**), save that number as a new contact — any
   name you like.

3. Open WhatsApp and send that contact exactly this message:

   ```
   I allow callmebot to send me messages
   ```

4. Within a couple of minutes you'll get a reply back like:

   ```
   API Activated for your phone number. Your APIKEY is 123456
   ```

   (If nothing arrives after 2 minutes, wait 24 hours and try again —
   that's a CallMeBot rate-limit thing, not something wrong on your end.)

5. Open `server/.env` and fill in:

   ```
   CALLMEBOT_PHONE=+918746888188
   CALLMEBOT_APIKEY=123456
   ```

   (use the real API key you received, not `123456`)

6. Restart the backend (`npm run dev` in `/server`). You should see:

   ```
   WhatsApp (CallMeBot, quick setup): configured ✅
   ```

That's it — every new order will now WhatsApp you the order details
automatically.
