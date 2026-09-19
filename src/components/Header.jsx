import React from 'react';
import { monthKeyLabel } from '../lib/billLogic.js';

export default function Header({
  monthKey, onPrevMonth, onNextMonth, view, onSetView,
  notifEnabled, onToggleNotif
}) {
  return (
    <header className="bg-gradient-to-b from-cover to-cover2 text-cream px-6 pt-7 pb-5 flex flex-col gap-4">
      <div className="flex justify-between items-start gap-3">
        <div>
          <h1 className="font-slab font-bold text-2xl">Bill Register</h1>
          <p className="text-cream/70 text-sm">Bills, priorities and daily tasks — tracked in one place</p>
        </div>
        <button
          onClick={onToggleNotif}
          className={`text-xs border rounded px-3 py-2 whitespace-nowrap ${notifEnabled ? 'bg-cream/15 border-cream/50' : 'border-cream/40'}`}
        >
          🔔 {notifEnabled ? 'Reminders on' : 'Reminders off'}
        </button>
      </div>

      <div className="flex items-center justify-between border-t border-cream/20 pt-3">
        <button onClick={onPrevMonth} className="w-9 h-9 border border-cream/35 rounded">‹</button>
        <div className="font-slab">{monthKeyLabel(monthKey)}</div>
        <button onClick={onNextMonth} className="w-9 h-9 border border-cream/35 rounded">›</button>
      </div>

      <div className="flex border border-cream/40 rounded overflow-hidden text-sm">
        <button
          onClick={() => onSetView('all')}
          className={`flex-1 py-2 ${view === 'all' ? 'bg-cream text-cover font-semibold' : 'text-cream/75'}`}
        >All bills</button>
        <button
          onClick={() => onSetView('today')}
          className={`flex-1 py-2 ${view === 'today' ? 'bg-cream text-cover font-semibold' : 'text-cream/75'}`}
        >Today</button>
      </div>
    </header>
  );
}
