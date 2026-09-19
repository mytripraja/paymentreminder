const { onSchedule } = require('firebase-functions/v2/scheduler');
const admin = require('firebase-admin');
admin.initializeApp();
const db = admin.firestore();
const messaging = admin.messaging();

// Keep these thresholds identical to src/lib/billLogic.js getStage() on the client.
function getStage(bill, isPaid, today) {
  const p = bill.priority || 'medium';
  if (isPaid) return { key: 'paid', label: 'Paid' };
  const daysUntil = bill.dueDay - today;
  if (daysUntil < 0) {
    return { key: 'overdue', label: p === 'hard' ? 'Overdue — pay now, CIBIL risk' : 'Overdue' };
  }
  if (p === 'hard') {
    if (daysUntil <= 2) return { key: 'urgent', label: daysUntil === 0 ? 'Due today — keep balance ready' : `Keep balance ready — ${daysUntil}d left` };
    if (daysUntil <= 6) return { key: 'arrange', label: `Start arranging — due in ${daysUntil}d` };
    return { key: 'upcoming', label: `Due on ${bill.dueDay}` };
  }
  if (p === 'medium') {
    if (daysUntil <= 3) return { key: 'soon', label: daysUntil === 0 ? 'Due today' : `Due in ${daysUntil}d` };
    return { key: 'upcoming', label: `Due on ${bill.dueDay}` };
  }
  if (daysUntil <= 1) return { key: 'soon', label: daysUntil === 0 ? 'Due today' : 'Due tomorrow' };
  return { key: 'upcoming', label: `Due on ${bill.dueDay}` };
}

const URGENT_KEYS = new Set(['overdue', 'urgent', 'arrange', 'soon']);

function monthKey(d) {
  return d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0');
}

// Runs once a day at 8:00 AM India time. Change the schedule string below to adjust.
exports.dailyBillReminder = onSchedule(
  { schedule: '0 8 * * *', timeZone: 'Asia/Kolkata' },
  async () => {
    const now = new Date();
    const mKey = monthKey(now);
    const today = now.getDate();

    const usersSnap = await db.collection('users').get();

    for (const userDoc of usersSnap.docs) {
      const uid = userDoc.id;
      const [billsSnap, paymentsSnap, tokensSnap] = await Promise.all([
        db.collection('users').doc(uid).collection('bills').get(),
        db.collection('users').doc(uid).collection('payments').doc(mKey).get(),
        db.collection('users').doc(uid).collection('fcmTokens').get()
      ]);

      const tokens = tokensSnap.docs.map((d) => d.id);
      if (tokens.length === 0) continue;

      const paidMap = paymentsSnap.exists ? (paymentsSnap.data().entries || {}) : {};

      const urgent = [];
      billsSnap.forEach((doc) => {
        const bill = { id: doc.id, ...doc.data() };
        const isPaid = !!(paidMap[bill.id] && paidMap[bill.id].paid);
        const stage = getStage(bill, isPaid, today);
        if (URGENT_KEYS.has(stage.key)) urgent.push({ bill, stage });
      });

      if (urgent.length === 0) continue;

      const overdueCount = urgent.filter((u) => u.stage.key === 'overdue').length;
      const title = overdueCount
        ? `${overdueCount} bill${overdueCount > 1 ? 's' : ''} overdue`
        : `${urgent.length} bill${urgent.length > 1 ? 's' : ''} need attention today`;
      const body = urgent.slice(0, 4).map((u) => `${u.bill.name}: ${u.stage.label}`).join('\n');

      try {
        await messaging.sendEachForMulticast({
          tokens,
          notification: { title, body }
        });
      } catch (err) {
        console.error(`Push failed for user ${uid}`, err);
      }
    }
  }
);
