'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { Button } from '../../components/Button';
import { Input } from '../../components/Input';
import { api, setCachedUser, setToken } from '../../lib/api';

function parseInterests(text) {
  return text
    .split(',')
    .map((s) => s.trim())
    .filter(Boolean);
}

export default function RegisterPage() {
  const router = useRouter();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [interestsText, setInterestsText] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  async function onSubmit(e) {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const data = await api('/auth/register', {
        method: 'POST',
        body: JSON.stringify({
          name,
          email,
          password,
          interests: parseInterests(interestsText),
        }),
      });
      setToken(data.token);
      setCachedUser(data.user);
      router.push('/notes');
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center px-4 py-12">
      <div className="w-full max-w-md rounded-lg border border-brand-border bg-white p-8 shadow-card">
        <p className="text-xs font-semibold uppercase tracking-wider text-brand-cyan">Noteapp</p>
        <h1 className="mt-2 text-2xl font-bold text-brand-navy">Create account</h1>
        <p className="mt-1 text-sm text-brand-ink/70">Interests help demo Scenario 1. Comma-separated.</p>
        <form onSubmit={onSubmit} className="mt-6 space-y-4">
          <Input label="Name" value={name} onChange={(e) => setName(e.target.value)} required />
          <Input label="Email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
          <Input label="Password" type="password" autoComplete="new-password" value={password} onChange={(e) => setPassword(e.target.value)} required />
          <Input
            label="Interests (optional)"
            placeholder="chess, reading, music"
            value={interestsText}
            onChange={(e) => setInterestsText(e.target.value)}
          />
          {error ? <p className="text-sm text-brand-orange">{error}</p> : null}
          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? 'Creating…' : 'Register'}
          </Button>
        </form>
        <p className="mt-6 text-center text-sm text-brand-ink/70">
          Already have an account?{' '}
          <Link href="/login" className="font-semibold text-brand-cyan hover:underline">
            Sign in
          </Link>
        </p>
      </div>
    </div>
  );
}
