'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { Button } from '../../components/Button';
import { Input } from '../../components/Input';
import { InterestPicker } from '../../components/InterestPicker';
import { api, setCachedUser, setToken } from '../../lib/api';

export default function RegisterPage() {
  const router = useRouter();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [interests, setInterests] = useState([]);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  async function onSubmit(e) {
    e.preventDefault();
    if (interests.length === 0) {
      setError('Choose at least one interest.');
      return;
    }
    setError('');
    setLoading(true);
    try {
      const data = await api('/auth/register', {
        method: 'POST',
        body: JSON.stringify({
          name,
          email,
          password,
          interests,
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
        <p className="mt-1 text-sm text-brand-ink">Choose at least one interest so others can find you by topic.</p>
        <form onSubmit={onSubmit} className="mt-6 space-y-4">
          <Input label="Name" value={name} onChange={(e) => setName(e.target.value)} required />
          <Input label="Email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
          <Input label="Password" type="password" autoComplete="new-password" value={password} onChange={(e) => setPassword(e.target.value)} required />
          <InterestPicker value={interests} onChange={setInterests} label="Interests (required)" required />
          {error ? <p className="text-sm text-brand-orange">{error}</p> : null}
          <Button type="submit" className="w-full" disabled={loading || interests.length === 0}>
            {loading ? 'Creating…' : 'Register'}
          </Button>
        </form>
        <p className="mt-6 text-center text-sm text-brand-ink">
          Already have an account?{' '}
          <Link href="/login" className="font-semibold text-brand-cyan hover:underline">
            Sign in
          </Link>
        </p>
      </div>
    </div>
  );
}
