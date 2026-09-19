import React, { useState } from 'react';
import { CATEGORIES, LOAN_CATEGORIES, fmtMoney } from '../lib/billLogic.js';

const priorityTagClass = {
  hard: 'bg-overdue/10 text-overdue',
  medium: 'bg-amber/10 text-amber',
  soft: 'bg-paidcol/10 text-paidcol'
};

export default function BillList({ bills, getStageFor, onTogglePaid, onEdit, onDelete }) {
  const [confirmingId, setConfirmingId] = useState(null);
  const [openLoanId, setOpenLoanId] = useState(null);

  if (bills.length === 0) {
    return <div className="text-center text-inksoft py-16">No bills yet. Add your first one above.</div>;
  }

  return (
    <div>
      {CATEGORIES.map((cat) => {
        const catBills = bills.filter((b) => b.category === cat);
        if (catBills.length === 0) return null;
        const catTotal = catBills.reduce((sum, b) => sum + Number(b.amount || 0), 0);

        return (
          <div key={cat} className="mt-7">
            <div className="font-slab font-semibold text-[0.96rem] border-b-2 border-ink pb-2 flex justify-between items-baseline">
              <span>{cat}</span>
              <span className="font-mono-num font-normal text-sm text-inksoft">{fmtMoney(catTotal)}</span>
            </div>
            {catBills.map((bill) => {
              const stage = getStageFor(bill);
              const isLoan = LOAN_CATEGORIES.includes(bill.category) &&
                (bill.loanAmount || bill.outstandingBalance || bill.interestRate || bill.tenureMonths || bill.lender);

              return (
                <div key={bill.id} className="border-b border-ink/10 py-3 last:border-0">
                  <div className="grid grid-cols-[1fr,auto,auto,auto] items-center gap-3 max-[480px]:grid-cols-1 max-[480px]:gap-2">
                    <div>
                      <div className="flex items-center flex-wrap gap-1.5">
                        <span className="text-sm">{bill.name}</span>
                        <span className={`text-[0.65rem] px-2 py-0.5 rounded-full font-medium ${priorityTagClass[bill.priority]}`}>
                          {bill.priority[0].toUpperCase() + bill.priority.slice(1)}
                        </span>
                      </div>
                      {bill.notes && <span className="block text-xs text-inksoft mt-0.5">{bill.notes}</span>}
                      {stage.key === 'paid' && (
                        <span className="block text-xs text-paidcol mt-0.5">Paid</span>
                      )}
                      {isLoan && (
                        <button
                          onClick={() => setOpenLoanId(openLoanId === bill.id ? null : bill.id)}
                          className="text-xs text-inksoft underline mt-1"
                        >Loan details</button>
                      )}
                    </div>
                    <div className={`text-xs whitespace-nowrap text-right max-[480px]:text-left ${stage.cls === 'overdue' ? 'text-overdue font-semibold' : stage.cls === 'soon' ? 'text-amber font-semibold' : 'text-inksoft'}`}>
                      {stage.label}
                    </div>
                    <div className="font-mono-num text-sm text-right min-w-[78px] max-[480px]:text-left">
                      {fmtMoney(bill.amount)}
                    </div>
                    <div className="flex items-center gap-1.5">
                      <button
                        onClick={() => onTogglePaid(bill, stage.key !== 'paid')}
                        className={`text-xs border rounded px-2.5 py-1.5 whitespace-nowrap ${stage.key === 'paid' ? 'bg-paidcol border-paidcol text-cream' : 'border-ink text-ink'}`}
                      >{stage.key === 'paid' ? 'Paid' : 'Mark paid'}</button>
                      <button onClick={() => onEdit(bill)} className="text-inksoft px-1.5 py-1 text-sm">✎</button>
                      <button
                        onClick={() => {
                          if (confirmingId === bill.id) { onDelete(bill); setConfirmingId(null); }
                          else {
                            setConfirmingId(bill.id);
                            setTimeout(() => setConfirmingId((id) => (id === bill.id ? null : id)), 2500);
                          }
                        }}
                        className={`px-1.5 py-1 text-sm ${confirmingId === bill.id ? 'text-overdue font-semibold' : 'text-inksoft'}`}
                      >{confirmingId === bill.id ? 'Confirm?' : '✕'}</button>
                    </div>
                  </div>

                  {isLoan && openLoanId === bill.id && (
                    <div className="mt-2 bg-ink/5 rounded p-3 text-sm grid grid-cols-2 gap-x-4 gap-y-1.5">
                      <Detail label="Total loan" value={bill.loanAmount ? fmtMoney(bill.loanAmount) : '—'} />
                      <Detail label="Outstanding balance" value={bill.outstandingBalance ? fmtMoney(bill.outstandingBalance) : '—'} />
                      <Detail label="Interest rate" value={bill.interestRate ? `${bill.interestRate}%` : '—'} />
                      <Detail label="Tenure left" value={bill.tenureMonths ? `${bill.tenureMonths} months` : '—'} />
                      <Detail label="Lender" value={bill.lender || '—'} />
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        );
      })}
    </div>
  );
}

function Detail({ label, value }) {
  return (
    <div>
      <span className="block text-[0.68rem] text-inksoft">{label}</span>
      {value}
    </div>
  );
}
