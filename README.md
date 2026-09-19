# Bill Register — setup guide

This is the real app: React + Tailwind frontend, Firebase (Auth + Firestore + Cloud
Messaging + a scheduled Cloud Function) for data sync and background push notifications,
wrapped with Capacitor so it can become an Android APK.

I built and tested this in a sandboxed environment that has no access to the Android SDK,
Gradle, or the Google Play services repositories — so everything up through "the app runs
and syncs to the cloud" is verified working. The Android packaging and the home-screen
widget need Android Studio, which only exists on your machine, so those steps are written
for you to run yourself. I've made them as close to copy-paste as I can.

---

## What you get

- All 39 bills you described (EMI ×7, Mobile ×2, Wife's Bill, Health Insurance ×6, Term
  Insurance, SIP ×4, Credit Card ×2, Gold Loan, EB Bill ×7, GST Filing ×18) pre-seeded on
  first sign-in, same as the browser version.
- Hard / Medium / Soft priority tiers with the same "start arranging 6 days before / keep
  balance ready 2 days before / overdue = CIBIL risk" logic for EMI, Credit Card, Gold Loan
  and GST Filing.
- EMI / Gold Loan tracking fields: total loan amount, outstanding balance, interest rate,
  tenure left, lender.
- Daily tasks checklist.
- Data lives in Firestore, so it's the same data on your phone and any browser — not stuck
  on one device like the earlier artifact version.
- A scheduled Cloud Function that runs once a day and sends a real push notification
  (via Firebase Cloud Messaging) listing whatever's urgent — this is the part that fixes
  "no proper notification," because it fires whether or not the app is open.

---

## Part 1 — Create your Firebase project (one-time, ~10 minutes)

1. Go to https://console.firebase.google.com → **Add project** → name it (e.g.
   `bill-register`) → you can skip Google Analytics.
2. **Build → Authentication → Get started → Sign-in method → Email/Password → Enable.**
3. **Build → Firestore Database → Create database** → start in production mode → pick a
   region close to India (e.g. `asia-south1`).
4. **Build → Cloud Messaging.** Under "Web configuration," generate a **Web Push
   certificate (VAPID key)** — copy it, you'll need it below.
5. **Project settings (gear icon) → General → Your apps → Add app → Web (`</>`).**
   Register it, and copy the `firebaseConfig` values shown (apiKey, authDomain,
   projectId, storageBucket, messagingSenderId, appId).
6. **Project settings → Usage and billing → upgrade to the Blaze (pay-as-you-go) plan.**
   Scheduled Cloud Functions require Blaze, but the free monthly quota is large enough
   that a single-user app like this will cost effectively nothing.

---

## Part 2 — Run it locally

```bash
npm install
cp .env.example .env
# open .env and paste in the 6 values + the VAPID key from Part 1
npm run dev
```

Open the printed `localhost` URL, create your account (email + password — this is your
account, not shared with anyone), and confirm your bills show up.

Also paste the same 6 config values (not the VAPID key) into
`public/firebase-messaging-sw.js`, replacing the `PASTE_SAME_VALUE_AS_.env` placeholders —
this file can't read `.env` because it's served as-is, not built by Vite.

---

## Part 3 — Deploy Firestore rules and the notification function

```bash
npm install -g firebase-tools     # one-time
firebase login
firebase use --add                # pick the project you created in Part 1
firebase deploy --only firestore:rules,functions
```

This deploys:
- **firestore.rules** — locks every user's data to their own account.
- **functions/dailyBillReminder** — runs every day at 8:00 AM IST, checks every user's
  bills, and pushes a notification if anything is overdue or needs arranging. Change the
  time by editing the `schedule: '0 8 * * *'` line in `functions/index.js` and redeploying.

In the running app, tap **🔔 Reminders off** once — this asks for notification permission
and saves your device's push token to Firestore so the function can reach you.

---

## Part 4 — Build the Android APK

You'll need **Android Studio** installed (free, from developer.android.com/studio) — this
step can't be done in a browser or in this chat.

```bash
npm run build
npx cap add android
npx cap sync android
npx cap open android
```

The last command opens the generated `android/` folder in Android Studio. From there:

1. Let Gradle sync finish (first time takes a few minutes, downloads the Android build
   tools).
2. **Build → Generate Signed Bundle / APK → APK** → create a new keystore (save it
   somewhere safe — you'll need the same one for every future update) → Build.
3. The APK lands in `android/app/release/app-release.apk`. Copy it to your phone and
   install it (you'll need to allow "install unknown apps" once).

App icons: drop `icon-192.png` and `icon-512.png` (square PNGs) into `public/` for the
installable-web-app icon, and use Android Studio's **Image Asset** tool (right-click `res`
folder → New → Image Asset) to generate the actual launcher icon from your own image.

---

## Part 5 — The home-screen widget (the advanced part)

This is the one piece that's genuinely native Android work — there's no way to generate a
real home-screen widget from web code, Capacitor or not. Two honest paths:

**A. Skip the native widget, use "Add to Home Screen."** Once you're using the installed
APK, Android's own "push notification + app icon with badge" already covers most of what
a widget gives you, since the Cloud Function above pushes to your phone directly. This is
the pragmatic choice for a one-person tool.

**B. Build the real widget.** In the `android/` project Android Studio opened, add a
standard Android App Widget:
- Right-click `app/src/main` → New → Widget → App Widget, which scaffolds an
  `AppWidgetProvider` class and a layout XML for you.
- In `onUpdate()`, read the same Firestore data (add the Firebase Android SDK to
  `android/app/build.gradle`) and render today's urgent bills as text in the widget layout.
- This is a few hours of native Android/Kotlin work even for someone experienced with it —
  Android Studio's built-in widget template plus its own documentation
  (developer.android.com/develop/ui/views/appwidgets) is the right next step, since this
  part is outside what a web-based build (mine included) can generate correctly without a
  real device to test on.

---

## Data model (for reference)

```
users/{uid}/bills/{billId}          — one doc per bill
users/{uid}/payments/{monthKey}     — { entries: { billId: { paid, paidAt } } }
users/{uid}/tasks/{taskId}          — daily tasks
users/{uid}/fcmTokens/{token}       — push notification device tokens
users/{uid}/meta/seeded             — marks that the 39 starter bills were created
```

## Adding more later

New GST return types, new bills, new companies — none of that needs code changes. Use
**+ Add bill** in the app, same as the browser version. The GST Filing category is
open-ended by design.
