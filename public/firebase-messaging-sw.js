// This file CANNOT read your .env values (it's served as a static file, not built by Vite).
// Copy the same 6 values you put in .env into firebaseConfig below.
importScripts('https://www.gstatic.com/firebasejs/10.12.4/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/10.12.4/firebase-messaging-compat.js');

firebase.initializeApp({
  apiKey: 'PASTE_SAME_VALUE_AS_.env',
  authDomain: 'PASTE_SAME_VALUE_AS_.env',
  projectId: 'PASTE_SAME_VALUE_AS_.env',
  storageBucket: 'PASTE_SAME_VALUE_AS_.env',
  messagingSenderId: 'PASTE_SAME_VALUE_AS_.env',
  appId: 'PASTE_SAME_VALUE_AS_.env'
});

const messaging = firebase.messaging();

messaging.onBackgroundMessage((payload) => {
  const title = payload.notification?.title || 'Bill Register';
  const body = payload.notification?.body || 'You have bills that need attention.';
  self.registration.showNotification(title, {
    body,
    icon: './icon-192.png'
  });
});
