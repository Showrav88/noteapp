'use client';

import Link from 'next/link';
import { Suspense, useEffect, useState } from 'react';
import { Trash2 } from 'lucide-react';
import { Button } from '../../components/Button';
import { Input } from '../../components/Input';
import { InterestPicker } from '../../components/InterestPicker';
import { NoteCard } from '../../components/NoteCard';
import { PageHeader } from '../../components/PageHeader';
import { Pagination } from '../../components/Pagination';
import { api, getCachedUser } from '../../lib/api';
import { useRouter, useSearchParams } from 'next/navigation';

const actionLink =
  'inline-flex items-center justify-center rounded-md border border-brand-border bg-white px-3 py-1.5 text-xs font-semibold text-brand-navy hover:border-brand-cyan hover:text-brand-cyan';

function AdminPageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const ownerFilter = searchParams.get('owner') ?? '';

  const [tab, setTab] = useState(() => (searchParams.get('tab') === 'notes' || ownerFilter ? 'notes' : 'users'));
  const [users, setUsers] = useState({ items: [], page: 1, hasNextPage: false });
  const [notes, setNotes] = useState({ items: [], page: 1, hasNextPage: false });
  const [userPage, setUserPage] = useState(1);
  const [notePage, setNotePage] = useState(1);
  const [form, setForm] = useState({ name: '', email: '', password: '', interests: [] });
  const [error, setError] = useState('');
  const [me, setMe] = useState(null);

  useEffect(() => {
    const urlTab = searchParams.get('tab');
    if (urlTab === 'notes' || ownerFilter) {
      setTab('notes');
    } else if (urlTab === 'users') {
      setTab('users');
    }
  }, [searchParams, ownerFilter]);

  useEffect(() => {
    const cached = getCachedUser();
    if (cached?.role !== 'admin') {
      router.replace('/notes');
      return;
    }
    setMe(cached);
    api('/users/me')
      .then(setMe)
      .catch(() => router.replace('/notes'));
  }, [router]);

  useEffect(() => {
    if (tab !== 'users') return;
    api(`/users?page=${userPage}&limit=10`)
      .then(setUsers)
      .catch((err) => setError(err.message));
  }, [tab, userPage]);

  useEffect(() => {
    if (tab !== 'notes') return;
    const ownerQ = ownerFilter ? `&owner=${encodeURIComponent(ownerFilter)}` : '';
    api(`/notes/all?page=${notePage}&limit=10${ownerQ}`)
      .then(setNotes)
      .catch((err) => setError(err.message));
  }, [tab, notePage, ownerFilter]);

  function switchTab(nextTab) {
    setTab(nextTab);
    if (nextTab === 'notes') {
      const path = ownerFilter ? `/admin?tab=notes&owner=${ownerFilter}` : '/admin?tab=notes';
      router.replace(path);
    } else {
      router.replace('/admin?tab=users');
    }
  }

  async function addUser(e) {
    e.preventDefault();
    if (form.interests.length === 0) {
      setError('Choose at least one interest for the new user.');
      return;
    }
    setError('');
    try {
      await api('/users', {
        method: 'POST',
        body: JSON.stringify(form),
      });
      setForm({ name: '', email: '', password: '', interests: [] });
      setUserPage(1);
      const res = await api('/users?page=1&limit=10');
      setUsers(res);
    } catch (err) {
      setError(err.message);
    }
  }

  async function removeUser(user) {
    if (me && String(user._id) === String(me._id)) return;
    if (
      !confirm(
        `Permanently delete ${user.name} (${user.email})? Their notes and posts will be removed.`,
      )
    ) {
      return;
    }
    try {
      await api(`/users/${user._id}`, { method: 'DELETE' });
      const res = await api(`/users?page=${userPage}&limit=10`);
      setUsers(res);
    } catch (err) {
      setError(err.message);
    }
  }

  const filterOwner = notes.items[0]?.owner;
  const tabs = [
    { id: 'users', label: 'Users' },
    { id: 'notes', label: 'All notes' },
  ];

  return (
    <div>
      <PageHeader
        title="Admin"
        description="Read every user’s private notes. Use Their notes to filter by one owner."
      />
      <div className="mb-6 flex gap-2">
        {tabs.map((t) => (
          <button
            key={t.id}
            type="button"
            onClick={() => switchTab(t.id)}
            className={`rounded-md px-4 py-2 text-sm font-semibold ${
              tab === t.id ? 'bg-brand-navy text-white' : 'bg-white border border-brand-border text-brand-ink'
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>
      {error ? <p className="mb-4 text-sm text-brand-orange">{error}</p> : null}

      {tab === 'users' ? (
        <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_300px]">
          <section className="space-y-3">
            {users.items.map((u) => {
              const isSelf = me && String(u._id) === String(me._id);
              return (
                <div key={u._id} className="flex items-center justify-between gap-2 rounded-lg border border-brand-border bg-white p-4 shadow-card">
                  <div className="min-w-0">
                    <p className="font-semibold text-brand-navy">{u.name}</p>
                    <p className="text-sm text-brand-ink">{u.email}</p>
                    <p className="text-xs text-brand-ink">
                      Role: {u.role}
                      {isSelf ? ' · you' : ''}
                    </p>
                  </div>
                  <div className="flex shrink-0 items-center gap-2">
                    <Link href={`/admin?tab=notes&owner=${u._id}`} className={actionLink}>
                      Their notes
                    </Link>
                    {isSelf ? (
                      <span className="text-xs text-brand-ink">Cannot delete yourself</span>
                    ) : (
                      <Button variant="ghost" className="text-brand-orange" onClick={() => removeUser(u)}>
                        <Trash2 size={16} />
                      </Button>
                    )}
                  </div>
                </div>
              );
            })}
            <Pagination page={userPage} hasNextPage={users.hasNextPage} onPageChange={setUserPage} />
          </section>
          <form
            onSubmit={addUser}
            autoComplete="off"
            className="h-fit rounded-lg border border-brand-border bg-white p-4 shadow-card space-y-3"
          >
            <h2 className="font-semibold text-brand-navy">Add user</h2>
            <Input label="Name" autoComplete="off" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required />
            <Input
              label="Email"
              type="email"
              autoComplete="off"
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
              required
            />
            <Input
              label="Password"
              type="password"
              autoComplete="new-password"
              value={form.password}
              onChange={(e) => setForm({ ...form, password: e.target.value })}
              required
            />
            <InterestPicker
              value={form.interests}
              onChange={(interests) => setForm({ ...form, interests })}
              label="Interests (required)"
              required
            />
            <Button type="submit" className="w-full" disabled={form.interests.length === 0}>
              Create user
            </Button>
          </form>
        </div>
      ) : (
        <section>
          {ownerFilter ? (
            <div className="mb-4 flex flex-wrap items-center justify-between gap-2 rounded-lg border-2 border-brand-border bg-white px-4 py-3">
              <p className="text-sm text-brand-ink">
                Showing notes by{' '}
                <span className="font-bold text-brand-navy">
                  {filterOwner?.name ?? 'this user'}
                </span>
              </p>
              <Link href="/admin?tab=notes" className="text-sm font-semibold text-brand-cyan hover:underline">
                Show all notes
              </Link>
            </div>
          ) : null}
          <div className="space-y-4">
            {notes.items.length === 0 ? (
              <p className="text-sm text-brand-ink">No notes found.</p>
            ) : (
              notes.items.map((note) => (
                <NoteCard
                  key={note._id}
                  title={note.title}
                  body={note.body}
                  owner={note.owner}
                />
              ))
            )}
          </div>
          <div className="mt-4">
            <Pagination page={notePage} hasNextPage={notes.hasNextPage} onPageChange={setNotePage} />
          </div>
        </section>
      )}
    </div>
  );
}

export default function AdminPage() {
  return (
    <Suspense fallback={<p className="text-sm text-brand-ink">Loading admin…</p>}>
      <AdminPageContent />
    </Suspense>
  );
}
