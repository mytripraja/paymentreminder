export const CATEGORIES = [
  'EMI', 'Mobile Bill', "Wife's Bill", 'Health Insurance', 'Term Insurance',
  'Mutual Fund SIP', 'Credit Card', 'Gold Loan', 'EB Bill', 'GST Filing'
];

export const DEFAULT_PRIORITY = {
  EMI: 'hard', 'Credit Card': 'hard', 'Gold Loan': 'hard', 'GST Filing': 'hard',
  'Mobile Bill': 'medium', "Wife's Bill": 'medium', 'Health Insurance': 'medium',
  'Term Insurance': 'medium', 'Mutual Fund SIP': 'medium', 'EB Bill': 'medium'
};

export const LOAN_CATEGORIES = ['EMI', 'Gold Loan'];

export const GST_RETURN_TYPES = [
  { code: 'GSTR-1', dueDay: 10 },
  { code: 'GSTR-2', dueDay: 15 },
  { code: 'GSTR-3B', dueDay: 20 }
];

export function currentMonthKey(d = new Date()) {
  return d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0');
}

export function shiftMonthKey(key, delta) {
  let [y, m] = key.split('-').map(Number);
  m += delta;
  while (m > 12) { m -= 12; y += 1; }
  while (m < 1) { m += 12; y -= 1; }
  return y + '-' + String(m).padStart(2, '0');
}

export function monthKeyLabel(key) {
  const [y, m] = key.split('-').map(Number);
  return new Date(y, m - 1, 1).toLocaleString('en-IN', { month: 'long', year: 'numeric' });
}

export function fmtMoney(n) {
  return '\u20B9' + Number(n || 0).toLocaleString('en-IN');
}

/**
 * Computes the reminder stage for a bill in the currently-viewed month.
 * Mirrors the logic used server-side in functions/index.js for push notifications —
 * keep the two in sync if you change the thresholds.
 */
export function getStage(bill, { isPaid, isActualCurrentMonth, todayDate }) {
  const p = bill.priority || 'medium';
  if (isPaid) return { key: 'paid', label: 'Paid', cls: '' };
  if (!isActualCurrentMonth) return { key: 'scheduled', label: `Due on ${bill.dueDay}`, cls: '' };

  const daysUntil = bill.dueDay - todayDate;
  if (daysUntil < 0) {
    return {
      key: 'overdue',
      label: p === 'hard' ? 'Overdue \u2014 pay now, CIBIL risk' : 'Overdue',
      cls: 'overdue'
    };
  }
  if (p === 'hard') {
    if (daysUntil <= 2) return { key: 'urgent', label: daysUntil === 0 ? 'Due today \u2014 keep balance ready' : `Keep balance ready \u2014 ${daysUntil}d left`, cls: 'overdue' };
    if (daysUntil <= 6) return { key: 'arrange', label: `Start arranging \u2014 due in ${daysUntil}d`, cls: 'soon' };
    return { key: 'upcoming', label: `Due on ${bill.dueDay}`, cls: '' };
  }
  if (p === 'medium') {
    if (daysUntil <= 3) return { key: 'soon', label: daysUntil === 0 ? 'Due today' : `Due in ${daysUntil}d`, cls: 'soon' };
    return { key: 'upcoming', label: `Due on ${bill.dueDay}`, cls: '' };
  }
  // soft
  if (daysUntil <= 1) return { key: 'soon', label: daysUntil === 0 ? 'Due today' : 'Due tomorrow', cls: 'soon' };
  return { key: 'upcoming', label: `Due on ${bill.dueDay}`, cls: '' };
}

export const SEVERITY_RANK = { overdue: 0, urgent: 1, arrange: 2, soon: 3 };

export function blankBill(overrides = {}) {
  return {
    name: '', category: CATEGORIES[0], amount: 0, dueDay: 15, notes: '',
    priority: 'medium',
    loanAmount: null, outstandingBalance: null, interestRate: null, tenureMonths: null, lender: '',
    ...overrides
  };
}

export function defaultBillSet() {
  const spec = [
    ['EMI', 7, [3, 5, 7, 8, 10, 12, 15]],
    ['Mobile Bill', 2, [1, 15]],
    ["Wife's Bill", 1, [5]],
    ['Health Insurance', 6, [2, 6, 9, 14, 18, 22]],
    ['Term Insurance', 1, [10]],
    ['Mutual Fund SIP', 4, [1, 5, 10, 15]],
    ['Credit Card', 2, [18, 22]],
    ['Gold Loan', 1, [7]],
    ['EB Bill', 7, [2, 4, 6, 8, 10, 12, 14]]
  ];
  let bills = [];
  spec.forEach(([cat, count, days]) => {
    for (let i = 0; i < count; i++) {
      bills.push(blankBill({
        name: count > 1 ? `${cat} ${i + 1}` : cat,
        category: cat,
        dueDay: days[i] || 15,
        priority: DEFAULT_PRIORITY[cat] || 'medium'
      }));
    }
  });
  bills = bills.concat(generateGstBills(6));
  return bills;
}

export function generateGstBills(companyCount) {
  let bills = [];
  for (let c = 1; c <= companyCount; c++) {
    GST_RETURN_TYPES.forEach((rt) => {
      bills.push(blankBill({
        name: `Company ${c} \u2013 ${rt.code}`,
        category: 'GST Filing',
        dueDay: rt.dueDay,
        priority: DEFAULT_PRIORITY['GST Filing'] || 'hard'
      }));
    });
  }
  return bills;
}
