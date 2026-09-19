import {
  collection, doc, setDoc, deleteDoc, onSnapshot, getDoc,
  serverTimestamp
} from 'firebase/firestore';
import { db } from '../firebase.js';
import { defaultBillSet, generateGstBills } from './billLogic.js';

const billsCol = (uid) => collection(db, 'users', uid, 'bills');
const paymentsDoc = (uid, monthKey) => doc(db, 'users', uid, 'payments', monthKey);
const tasksCol = (uid) => collection(db, 'users', uid, 'tasks');
const tokenDoc = (uid, token) => doc(db, 'users', uid, 'fcmTokens', token);

export function watchBills(uid, callback) {
  return onSnapshot(billsCol(uid), (snap) => {
    const bills = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
    callback(bills);
  });
}

export async function ensureSeeded(uid) {
  // Only seeds once: if the bills collection already has anything, do nothing.
  const snap = await getDoc(doc(db, 'users', uid, 'meta', 'seeded'));
  if (snap.exists()) return;
  const defaults = defaultBillSet();
  await Promise.all(defaults.map((b) => setDoc(doc(billsCol(uid)), b)));
  await setDoc(doc(db, 'users', uid, 'meta', 'seeded'), { seededAt: serverTimestamp() });
}

export async function addGstCompaniesIfMissing(uid, currentBills) {
  const hasGst = currentBills.some((b) => b.category === 'GST Filing');
  if (hasGst) return;
  const gstBills = generateGstBills(6);
  await Promise.all(gstBills.map((b) => setDoc(doc(billsCol(uid)), b)));
}

export function saveBill(uid, bill) {
  const id = bill.id || doc(billsCol(uid)).id;
  const { id: _drop, ...data } = bill;
  return setDoc(doc(billsCol(uid), id), data, { merge: true });
}

export function deleteBill(uid, billId) {
  return deleteDoc(doc(billsCol(uid), billId));
}

export function watchPayments(uid, monthKey, callback) {
  return onSnapshot(paymentsDoc(uid, monthKey), (snap) => {
    callback(snap.exists() ? (snap.data().entries || {}) : {});
  });
}

export async function setPaymentStatus(uid, monthKey, billId, paid) {
  const ref = paymentsDoc(uid, monthKey);
  const snap = await getDoc(ref);
  const entries = snap.exists() ? (snap.data().entries || {}) : {};
  if (paid) {
    entries[billId] = { paid: true, paidAt: new Date().toISOString() };
  } else {
    delete entries[billId];
  }
  await setDoc(ref, { entries }, { merge: true });
}

export function watchTasks(uid, callback) {
  return onSnapshot(tasksCol(uid), (snap) => {
    callback(snap.docs.map((d) => ({ id: d.id, ...d.data() })));
  });
}

export function addTask(uid, text) {
  return setDoc(doc(tasksCol(uid)), { text, done: false, createdAt: serverTimestamp() });
}

export function updateTask(uid, taskId, data) {
  return setDoc(doc(tasksCol(uid), taskId), data, { merge: true });
}

export function deleteTask(uid, taskId) {
  return deleteDoc(doc(tasksCol(uid), taskId));
}

export function saveFcmToken(uid, token) {
  return setDoc(tokenDoc(uid, token), { token, savedAt: serverTimestamp() });
}
