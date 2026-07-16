# Getting WhatsApp Cloud API access (free, official route)

This is Meta's own API — no third-party reseller, no markup. It's
free for the volume a small delivery business will send (Meta only
starts charging per-message once you're sending template/marketing
messages at scale; simple order notifications to your own number
stay within the free allowance).

## 1. Create a Meta Developer account + app

1. Go to https://developers.facebook.com and log in with a Facebook
   account (create one if you don't have one — it doesn't need to be
   your personal account, a dedicated business one is fine).
2. Click **My Apps** → **Create App**.
3. Choose app type **Business**, give it a name (e.g. "Brinzo
   Orders"), and create it.
4. On the app dashboard, click **Add Product**, find **WhatsApp**,
   click **Set up**.

## 2. Get your test credentials

You're dropped into **WhatsApp → API Setup**. This page shows you,
immediately, with no extra setup:

- A **test phone number** (Meta-provided, not your real number) and
  its **Phone Number ID** — copy this into `WHATSAPP_PHONE_NUMBER_ID`
  in your `.env`.
- A **temporary access token**, valid 24 hours — copy into
  `WHATSAPP_ACCESS_TOKEN`. (Good enough to test today; see step 4 for
  a token that doesn't expire.)

## 3. Add your own number as a test recipient

Still on that same API Setup page, find the **"To"** field and add
your own personal WhatsApp number. Meta will text you a verification
code — enter it to confirm.

Take that same number, strip it down to digits only with country
code and no `+` or spaces (e.g. `+91 98765 43210` → `919876543210`),
and put it in `WHATSAPP_RECIPIENT_NUMBER`. This is the number that
will **receive** every Brinzo order notification — i.e., your
business's WhatsApp.

At this point you can already test: restart the backend
(`npm run dev` inside `/server`) and place a test order on the site.
You should get a WhatsApp message on your phone.

## 4. Get a permanent access token (for real use)

The temporary token from step 2 expires in 24 hours — fine for a
first test, useless for an actual running service. To get one that
doesn't expire:

1. Go to **Meta Business Settings** (business.facebook.com/settings).
2. In the left sidebar, click **Users → System Users**.
3. Click **Add**, name it (e.g. "Brinzo Bot"), set role to **Admin**,
   create it.
4. Select the new system user → **Assign Assets**.
5. Under **Apps**, select your app, toggle **Full control**.
6. Under **WhatsApp Accounts**, select your WhatsApp Business
   Account, toggle **Full control**. Save.
7. Back on the system user, click **Generate new token**.
8. Choose your app, set expiration to **Never**, and under
   permissions select `whatsapp_business_messaging` and
   `whatsapp_business_management`.
9. Click **Generate token** and copy it immediately — Meta will not
   show it to you again. Put it in `WHATSAPP_ACCESS_TOKEN`.

## 5. Going fully live (optional, only if you outgrow the test number)

The test number from step 2 works fine for receiving order alerts on
your own phone indefinitely — you don't need to do this part unless
you want a real business-branded WhatsApp number.

To register a real number: in **WhatsApp → API Setup**, click **Add
phone number**, enter your business's actual number, verify it by SMS
or call, and add a payment method (required by Meta for any non-test
number, even though simple notification volume rarely gets billed).

## Troubleshooting

- **"Invalid OAuth access token"** → token expired (temporary tokens
  die after 24h) or copied with extra whitespace. Regenerate.
- **Message doesn't arrive but the API call returns 200** → check
  you added the recipient number as a verified test recipient (step
  3) — Meta's test mode will only deliver to numbers you've verified.
- **Image attaches but looks broken/corrupted** → the image file on
  disk got deleted or renamed before the backend tried to read it
  during the WhatsApp upload step. Check `server/uploads/` still has
  the file referenced by the booking's `item.imageUrl`.
- **"Unsupported post request"** → almost always means the Graph API
  version in the URL (`WHATSAPP_GRAPH_VERSION`) has been deprecated.
  Check developers.facebook.com/docs/graph-api/changelog for the
  current default version and update `.env`.
