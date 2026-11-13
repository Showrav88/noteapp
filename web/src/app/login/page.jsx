'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { Button } from '../../components/Button';
import { Input } from '../../components/Input';
import { api, setCachedUser, setToken } from '../../lib/api';

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  async function onSubmit(e) {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const data = await api('/auth/login', {
        method: 'POST',
        body: JSON.stringify({ email, password }),
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
        <h1 className="mt-2 text-2xl font-bold text-brand-navy">Sign in</h1>
        <p className="mt-1 text-sm text-brand-ink">Use the account you registered or the admin from seed.</p>
        <form onSubmit={onSubmit} className="mt-6 space-y-4">
          <Input label="Email" type="email" autoComplete="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
          <Input label="Password" type="password" autoComplete="current-password" value={password} onChange={(e) => setPassword(e.target.value)} required />
          {error ? <p className="text-sm text-brand-orange">{error}</p> : null}
          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? 'Signing in…' : 'Sign in'}
          </Button>
        </form>
        <p className="mt-6 text-center text-sm text-brand-ink">
          No account?{' '}
          <Link href="/register" className="font-semibold text-brand-cyan hover:underline">
            Register
          </Link>
        </p>
      </div>
    </div>
  );
}
