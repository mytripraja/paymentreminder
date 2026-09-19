import React from 'react';
import { fmtMoney } from '../lib/billLogic.js';

const tierBg = { hard: 'bg-[#F3D9C9]', medium: 'bg-[#F5E6BE]', soft: 'bg-[#DCE8D6]' };

export default function TodayView({ urgentItems, onTogglePaid }) {
  if (urgentItems.length === 0) {
    return <div className="text-center text-inksoft py-16">Nothing urgent right now. All caught up.</div>;
  }
  return (
    <div className="grid grid-cols-[repeat(auto-fill,minmax(150px,1fr))] gap-4 py-2">
      {urgentItems.map(({ bill, stage }) => (
        <div key={bill.id} className={`sticky-note rounded-sm p-3 flex flex-col gap-1.5 min-h-[110px] ${tierBg[bill.priority]}`}>
          <div className="font-sans font-semibold text-sm text-ink">{bill.name}</div>
          <div className="font-mono-num text-lg text-ink">{fmtMoney(bill.amount)}</div>
          <div className="font-sans text-xs text-overdue font-semibold">{stage.label}</div>
          <button
            onClick={() => onTogglePaid(bill, true)}
            className="mt-auto self-start border border-ink text-xs rounded px-2.5 py-1"
          >Mark paid</button>
        </div>
      ))}
    </div>
  );
}
