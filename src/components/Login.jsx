import React, { useState } from 'react';
import { signIn, signUp } from '../firebase.js';

export default function Login() {
  const [mode, setMode] = useState('signin'); // 'signin' | 'signup'
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    setBusy(true);
    try {
      if (mode === 'signin') await signIn(email, password);
      else await signUp(email, password);
    } catch (err) {
      setError(err.message.replace('Firebase: ', ''));
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-paper px-6">
      <form onSubmit={handleSubmit} className="w-full max-w-sm bg-white/60 border border-ink/10 rounded p-6 flex flex-col gap-4">
        <h1 className="font-slab text-xl text-ink">Bill Register</h1>
        <p className="text-sm text-inksoft -mt-2">
          {mode === 'signin' ? 'Sign in to your register.' : 'Create your account (do this once).'}
        </p>
        <div className="flex flex-col gap-1">
          <label className="text-xs text-inksoft">Email</label>
          <input
            type="email" required value={email} onChange={(e) => setEmail(e.target.value)}
            className="border border-ink/15 rounded px-3 py-2 text-sm"
          />
        </div>
        <div className="flex flex-col gap-1">
          <label className="text-xs text-inksoft">Password</label>
          <input
            type="password" required minLength={6} value={password} onChange={(e) => setPassword(e.target.value)}
            className="border border-ink/15 rounded px-3 py-2 text-sm"
          />
        </div>
        {error && <p className="text-xs text-overdue">{error}</p>}
        <button disabled={busy} type="submit" className="bg-cover text-cream rounded py-2 text-sm font-medium">
          {busy ? 'Please wait…' : mode === 'signin' ? 'Sign in' : 'Create account'}
        </button>
        <button
          type="button"
          onClick={() => setMode(mode === 'signin' ? 'signup' : 'signin')}
          className="text-xs text-inksoft underline"
        >
          {mode === 'signin' ? "Don't have an account? Create one" : 'Already have an account? Sign in'}
        </button>
      </form>
    </div>
  );
}
