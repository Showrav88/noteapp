'use client';

import { useEffect, useState } from 'react';
import { Trash2 } from 'lucide-react';
import { Button } from '../../components/Button';
import { Input } from '../../components/Input';
import { InterestPicker } from '../../components/InterestPicker';
import { PageHeader } from '../../components/PageHeader';
import { Pagination } from '../../components/Pagination';
import { api, getCachedUser } from '../../lib/api';
import { useRouter } from 'next/navigation';

export default function AdminPage() {
  const router = useRouter();
  const [tab, setTab] = useState('users');
  const [users, setUsers] = useState({ items: [], page: 1, hasNextPage: false });
  const [notes, setNotes] = useState({ items: [], page: 1, hasNextPage: false });
  const [userPage, setUserPage] = useState(1);
  const [notePage, setNotePage] = useState(1);
  const [form, setForm] = useState({ name: '', email: '', password: '', interests: [] });
  const [error, setError] = useState('');
  const [me, setMe] = useState(null);

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
    api(`/notes/all?page=${notePage}&limit=10`)
      .then(setNotes)
      .catch((err) => setError(err.message));
  }, [tab, notePage]);

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

  const tabs = [
    { id: 'users', label: 'Users' },
    { id: 'notes', label: 'All notes' },
  ];

  return (
    <div>
      <PageHeader title="Admin" description="Manage users and read every note. Server enforces admin role." />
      <div className="mb-6 flex gap-2">
        {tabs.map((t) => (
          <button
            key={t.id}
            type="button"
            onClick={() => setTab(t.id)}
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
                <div key={u._id} className="flex items-center justify-between rounded-lg border border-brand-border bg-white p-4 shadow-card">
                  <div>
                    <p className="font-semibold text-brand-navy">{u.name}</p>
                    <p className="text-sm text-brand-ink/60">{u.email}</p>
                    <p className="text-xs text-brand-ink/50">
                      Role: {u.role}
                      {isSelf ? ' · you' : ''}
                    </p>
                  </div>
                  {isSelf ? (
                    <span className="text-xs text-brand-ink/50">Cannot delete yourself</span>
                  ) : (
                    <Button variant="ghost" className="text-brand-orange" onClick={() => removeUser(u)}>
                      <Trash2 size={16} />
                    </Button>
                  )}
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
        <section className="space-y-3">
          {notes.items.map((note) => (
            <article key={note._id} className="rounded-lg border border-brand-border bg-white p-4 shadow-card">
              <h2 className="font-semibold text-brand-navy">{note.title}</h2>
              <p className="mt-1 text-xs text-brand-ink/60">
                Owner: {note.owner?.name} ({note.owner?.email})
              </p>
              {note.body ? <p className="mt-2 text-sm text-brand-ink/80">{note.body}</p> : null}
            </article>
          ))}
          <Pagination page={notePage} hasNextPage={notes.hasNextPage} onPageChange={setNotePage} />
        </section>
      )}
    </div>
  );
}
