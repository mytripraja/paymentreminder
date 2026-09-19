import React, { useEffect, useMemo, useState } from 'react';
import { watchAuth, auth, getMessagingIfSupported } from './firebase.js';
import { getToken } from 'firebase/messaging';
import Login from './components/Login.jsx';
import Header from './components/Header.jsx';
import { Summary, AttentionBanner } from './components/Summary.jsx';
import BillList from './components/BillList.jsx';
import TodayView from './components/TodayView.jsx';
import TaskList from './components/TaskList.jsx';
import BillForm from './components/BillForm.jsx';
import {
  currentMonthKey, shiftMonthKey, getStage, SEVERITY_RANK
} from './lib/billLogic.js';
import {
  watchBills, watchPayments, watchTasks, ensureSeeded, addGstCompaniesIfMissing,
  saveBill, deleteBill, setPaymentStatus, addTask, updateTask, deleteTask, saveFcmToken
} from './lib/firestoreApi.js';

export default function App() {
  const [user, setUser] = useState(undefined); // undefined = loading, null = signed out
  const [bills, setBills] = useState([]);
  const [payments, setPayments] = useState({});
  const [tasks, setTasks] = useState([]);
  const [monthKey, setMonthKey] = useState(currentMonthKey());
  const [view, setView] = useState('all');
  const [notifEnabled, setNotifEnabled] = useState(false);
  const [editingBill, setEditingBill] = useState(null); // null = closed, {} = new, bill = editing
  const [note, setNote] = useState('');

  useEffect(() => watchAuth(setUser), []);

  useEffect(() => {
    if (!user) return;
    ensureSeeded(user.uid).catch(() => setNote('Could not load your bills — check your connection.'));
    const unsubBills = watchBills(user.uid, (list) => {
      setBills(list);
      addGstCompaniesIfMissing(user.uid, list).catch(() => {});
    });
    const unsubTasks = watchTasks(user.uid, setTasks);
    return () => { unsubBills(); unsubTasks(); };
  }, [user]);

  useEffect(() => {
    if (!user) return;
    const unsub = watchPayments(user.uid, monthKey, setPayments);
    return () => unsub();
  }, [user, monthKey]);

  useEffect(() => {
    setNotifEnabled(typeof Notification !== 'undefined' && Notification.permission === 'granted');
  }, []);

  const isActualCurrentMonth = monthKey === currentMonthKey();
  const today = new Date().getDate();

  function stageFor(bill) {
    return getStage(bill, {
      isPaid: !!(payments[bill.id] && payments[bill.id].paid),
      isActualCurrentMonth,
      todayDate: today
    });
  }

  const totals = useMemo(() => {
    let total = 0, paid = 0, pending = 0, overdueCount = 0;
    bills.forEach((b) => {
      const stage = stageFor(b);
      total += Number(b.amount || 0);
      if (stage.key === 'paid') paid += Number(b.amount || 0);
      else { pending += Number(b.amount || 0); if (stage.key === 'overdue') overdueCount += 1; }
    });
    return { total, paid, pending, overdueCount };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [bills, payments, monthKey]);

  const urgentItems = useMemo(() => {
    if (!isActualCurrentMonth) return [];
    return bills
      .map((bill) => ({ bill, stage: stageFor(bill) }))
      .filter((x) => ['overdue', 'urgent', 'arrange', 'soon'].includes(x.stage.key))
      .sort((a, b) => (SEVERITY_RANK[a.stage.key] ?? 4) - (SEVERITY_RANK[b.stage.key] ?? 4));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [bills, payments, monthKey]);

  async function handleTogglePaid(bill, paid) {
    await setPaymentStatus(user.uid, monthKey, bill.id, paid);
  }
  async function handleSaveBill(data) {
    await saveBill(user.uid, data);
    setEditingBill(null);
  }
  async function handleDeleteBill(bill) {
    await deleteBill(user.uid, bill.id);
  }

  async function enableNotifications() {
    if (typeof Notification === 'undefined') { setNote('Notifications are not supported here.'); return; }
    const perm = await Notification.requestPermission();
    if (perm !== 'granted') { setNote('Notification permission was not granted.'); return; }
    setNotifEnabled(true);
    try {
      const messaging = await getMessagingIfSupported();
      if (messaging) {
        const token = await getToken(messaging, { vapidKey: import.meta.env.VITE_FIREBASE_VAPID_KEY });
        if (token) await saveFcmToken(user.uid, token);
      }
    } catch (err) {
      console.warn('FCM token setup failed (fine on plain browsers, needed for Android push)', err);
    }
  }

  if (user === undefined) return <div className="min-h-screen flex items-center justify-center text-inksoft">Loading…</div>;
  if (user === null) return <Login />;

  return (
    <div className="max-w-3xl mx-auto min-h-screen bg-paper">
      <Header
        monthKey={monthKey}
        onPrevMonth={() => setMonthKey(shiftMonthKey(monthKey, -1))}
        onNextMonth={() => setMonthKey(shiftMonthKey(monthKey, 1))}
        view={view} onSetView={setView}
        notifEnabled={notifEnabled} onToggleNotif={enableNotifications}
      />

      <AttentionBanner items={isActualCurrentMonth ? urgentItems : []} />

      <Summary total={totals.total} paid={totals.paid} pending={totals.pending} overdueCount={totals.overdueCount} />

      <div className="px-6 pt-4 flex justify-end">
        <button onClick={() => setEditingBill({})} className="bg-cover text-cream rounded px-4 py-2 text-sm font-medium">+ Add bill</button>
      </div>

      <main className="px-6 pb-6">
        {view === 'all' ? (
          <BillList
            bills={bills}
            getStageFor={stageFor}
            onTogglePaid={handleTogglePaid}
            onEdit={setEditingBill}
            onDelete={handleDeleteBill}
          />
        ) : (
          <TodayView urgentItems={urgentItems} onTogglePaid={handleTogglePaid} />
        )}

        <TaskList
          tasks={tasks}
          onAdd={(text) => addTask(user.uid, text)}
          onToggle={(task, done) => updateTask(user.uid, task.id, { done })}
          onDelete={(task) => deleteTask(user.uid, task.id)}
          onClearDone={() => tasks.filter((t) => t.done).forEach((t) => deleteTask(user.uid, t.id))}
        />
      </main>

      {note && <p className="text-center text-xs text-inksoft pb-4">{note}</p>}

      {editingBill !== null && (
        <BillForm
          bill={editingBill.id ? editingBill : null}
          onSave={handleSaveBill}
          onClose={() => setEditingBill(null)}
        />
      )}
    </div>
  );
}
