import React from 'react';
import { fmtMoney } from '../lib/billLogic.js';

export function Summary({ total, paid, pending, overdueCount }) {
  return (
    <section className="grid grid-cols-4 bg-cream border-b border-ink/10">
      <Cell value={fmtMoney(total)} label="total due" />
      <Cell value={fmtMoney(paid)} label="paid" className="text-paidcol" />
      <Cell value={fmtMoney(pending)} label="pending" className="text-amber" />
      <Cell value={overdueCount} label="overdue" className="text-overdue" last />
    </section>
  );
}

function Cell({ value, label, className = '', last = false }) {
  return (
    <div className={`text-center py-4 px-2 ${last ? '' : 'border-r border-ink/10'}`}>
      <span className={`block font-mono-num font-semibold ${className}`}>{value}</span>
      <span className="block text-[0.7rem] text-inksoft mt-1">{label}</span>
    </div>
  );
}

export function AttentionBanner({ items }) {
  if (!items || items.length === 0) return null;
  const overdueCount = items.filter((i) => i.stage.key === 'overdue').length;
  const names = items.slice(0, 3).map((i) => i.bill.name).join(', ');
  const more = items.length > 3 ? ` +${items.length - 3} more` : '';
  return (
    <div className="mx-6 mt-4 bg-overdue/10 border border-overdue/30 rounded px-4 py-3 text-sm text-overdue">
      <strong className="block text-[0.9rem] mb-0.5">
        {items.length} bill{items.length > 1 ? 's' : ''} need attention{overdueCount ? ` (${overdueCount} overdue)` : ''}
      </strong>
      {names}{more}
    </div>
  );
}
