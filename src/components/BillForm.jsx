import React, { useEffect, useState } from 'react';
import { CATEGORIES, LOAN_CATEGORIES, DEFAULT_PRIORITY, blankBill } from '../lib/billLogic.js';

export default function BillForm({ bill, onSave, onClose }) {
  const [form, setForm] = useState(() => bill || blankBill({ priority: DEFAULT_PRIORITY[CATEGORIES[0]] || 'medium' }));

  useEffect(() => {
    setForm(bill || blankBill({ priority: DEFAULT_PRIORITY[CATEGORIES[0]] || 'medium' }));
  }, [bill]);

  const isLoanCategory = LOAN_CATEGORIES.includes(form.category);

  function update(field, value) {
    setForm((f) => ({ ...f, [field]: value }));
  }

  function submit(e) {
    e.preventDefault();
    onSave({
      ...form,
      amount: Number(form.amount) || 0,
      dueDay: Number(form.dueDay) || 1,
      loanAmount: form.loanAmount ? Number(form.loanAmount) : null,
      outstandingBalance: form.outstandingBalance ? Number(form.outstandingBalance) : null,
      interestRate: form.interestRate ? Number(form.interestRate) : null,
      tenureMonths: form.tenureMonths ? Number(form.tenureMonths) : null
    });
  }

  return (
    <div className="fixed inset-0 bg-cover/60 flex items-center justify-center p-5 z-20 overflow-y-auto" onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}>
      <form onSubmit={submit} className="bg-paper rounded p-6 w-full max-w-sm flex flex-col gap-3 max-h-[88vh] overflow-y-auto">
        <h2 className="font-slab text-lg">{bill ? 'Edit bill' : 'Add bill'}</h2>

        <Field label="Name">
          <input required value={form.name} onChange={(e) => update('name', e.target.value)} placeholder="e.g. EMI - Bike loan (HDFC)" />
        </Field>

        <div className="grid grid-cols-2 gap-2.5">
          <Field label="Category">
            <select value={form.category} onChange={(e) => update('category', e.target.value)}>
              {CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
            </select>
          </Field>
          <Field label="Due day (1–31)">
            <input type="number" min={1} max={31} required value={form.dueDay} onChange={(e) => update('dueDay', e.target.value)} />
          </Field>
        </div>

        <Field label="Amount due each month (₹)">
          <input type="number" min={0} required value={form.amount} onChange={(e) => update('amount', e.target.value)} />
        </Field>

        <div>
          <label className="text-xs text-inksoft">How strict should reminders be?</label>
          <div className="flex gap-2 mt-1">
            {['soft', 'medium', 'hard'].map((p) => (
              <label
                key={p}
                className={`flex-1 text-center border rounded px-1 py-2 text-xs cursor-pointer ${form.priority === p ? 'border-ink bg-ink/5 font-semibold' : 'border-ink/15 text-inksoft'}`}
              >
                <input type="radio" name="priority" value={p} checked={form.priority === p} onChange={() => update('priority', p)} className="hidden" />
                {p[0].toUpperCase() + p.slice(1)}
              </label>
            ))}
          </div>
        </div>

        <Field label="Notes — optional">
          <input value={form.notes} onChange={(e) => update('notes', e.target.value)} placeholder="e.g. A/c ending 4417" />
        </Field>

        {isLoanCategory && (
          <div className="border-t border-dashed border-ink/20 pt-2.5 flex flex-col gap-2.5">
            <div className="text-xs text-inksoft">Loan details (for EMI / Gold Loan tracking)</div>
            <div className="grid grid-cols-2 gap-2.5">
              <Field label="Total loan amount (₹)">
                <input type="number" min={0} value={form.loanAmount || ''} onChange={(e) => update('loanAmount', e.target.value)} />
              </Field>
              <Field label="Outstanding balance (₹)">
                <input type="number" min={0} value={form.outstandingBalance || ''} onChange={(e) => update('outstandingBalance', e.target.value)} />
              </Field>
            </div>
            <div className="grid grid-cols-2 gap-2.5">
              <Field label="Interest rate (%)">
                <input type="number" min={0} step={0.1} value={form.interestRate || ''} onChange={(e) => update('interestRate', e.target.value)} />
              </Field>
              <Field label="Tenure left (months)">
                <input type="number" min={0} value={form.tenureMonths || ''} onChange={(e) => update('tenureMonths', e.target.value)} />
              </Field>
            </div>
            <Field label="Lender / bank">
              <input value={form.lender || ''} onChange={(e) => update('lender', e.target.value)} placeholder="e.g. HDFC Bank" />
            </Field>
          </div>
        )}

        <div className="flex justify-end gap-2.5 mt-1.5">
          <button type="button" onClick={onClose} className="border border-ink/15 text-inksoft rounded px-3.5 py-2 text-sm">Cancel</button>
          <button type="submit" className="bg-cover text-cream rounded px-4 py-2 text-sm">Save</button>
        </div>
      </form>
    </div>
  );
}

function Field({ label, children }) {
  return (
    <div className="flex flex-col gap-1">
      <label className="text-xs text-inksoft">{label}</label>
      {React.cloneElement(children, {
        className: 'border border-ink/15 rounded px-2.5 py-2 text-sm bg-white text-ink'
      })}
    </div>
  );
}
