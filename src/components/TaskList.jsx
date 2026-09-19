import React, { useState } from 'react';

export default function TaskList({ tasks, onAdd, onToggle, onDelete, onClearDone }) {
  const [text, setText] = useState('');

  function submit(e) {
    e.preventDefault();
    const trimmed = text.trim();
    if (!trimmed) return;
    onAdd(trimmed);
    setText('');
  }

  return (
    <div className="mt-9 border-t-2 border-ink pt-4">
      <h2 className="font-slab font-semibold text-[0.96rem] mb-3">Daily tasks</h2>
      <form onSubmit={submit} className="flex gap-2 mb-3">
        <input
          value={text} onChange={(e) => setText(e.target.value)}
          placeholder="Add a task for today..."
          className="flex-1 border border-ink/15 rounded px-3 py-2 text-sm"
        />
        <button type="submit" className="bg-cover text-cream rounded px-4 py-2 text-sm">Add</button>
      </form>

      {tasks.length === 0 ? (
        <div className="text-inksoft text-sm py-4">No tasks yet.</div>
      ) : (
        tasks.map((task) => (
          <div key={task.id} className="flex items-center gap-2.5 py-2 border-b border-ink/10">
            <input
              type="checkbox" checked={!!task.done}
              onChange={(e) => onToggle(task, e.target.checked)}
              className="w-4 h-4 accent-paidcol"
            />
            <span className={`flex-1 text-sm ${task.done ? 'line-through text-inksoft' : ''}`}>{task.text}</span>
            <button onClick={() => onDelete(task)} className="text-inksoft text-sm px-1">✕</button>
          </div>
        ))
      )}

      <div className="flex justify-end mt-2">
        <button onClick={onClearDone} className="text-xs text-inksoft underline">Clear completed</button>
      </div>
    </div>
  );
}
