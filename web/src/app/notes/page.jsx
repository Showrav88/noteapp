'use client';

import { useEffect, useState } from 'react';
import { Pencil, Plus, Trash2 } from 'lucide-react';
import { Button } from '../../components/Button';
import { Input, TextArea } from '../../components/Input';
import { PageHeader } from '../../components/PageHeader';
import { Pagination } from '../../components/Pagination';
import { api } from '../../lib/api';

export default function NotesPage() {
  const [page, setPage] = useState(1);
  const [data, setData] = useState({ items: [], hasNextPage: false });
  const [title, setTitle] = useState('');
  const [body, setBody] = useState('');
  const [error, setError] = useState('');
  const [editingId, setEditingId] = useState(null);
  const [loading, setLoading] = useState(true);

  async function load(p = page) {
    setLoading(true);
    setError('');
    try {
      const res = await api(`/notes?page=${p}&limit=10`);
      setData(res);
      setPage(res.page);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load(page);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page]);

  async function createNote(e) {
    e.preventDefault();
    try {
      await api('/notes', { method: 'POST', body: JSON.stringify({ title, body }) });
      setTitle('');
      setBody('');
      load(1);
      setPage(1);
    } catch (err) {
      setError(err.message);
    }
  }

  async function saveEdit(id, newTitle, newBody) {
    try {
      await api(`/notes/${id}`, {
        method: 'PATCH',
        body: JSON.stringify({ title: newTitle, body: newBody }),
      });
      setEditingId(null);
      load(page);
    } catch (err) {
      setError(err.message);
    }
  }

  async function removeNote(id) {
    if (!confirm('Delete this note?')) return;
    try {
      await api(`/notes/${id}`, { method: 'DELETE' });
      load(page);
    } catch (err) {
      setError(err.message);
    }
  }

  return (
    <div>
      <PageHeader title="My notes" description="Your private notes — only you can view and edit them." />
      <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_320px]">
        <section className="space-y-3">
          {loading ? (
            <p className="text-sm text-brand-ink/60">Loading notes…</p>
          ) : data.items.length === 0 ? (
            <p className="rounded-md border border-dashed border-brand-border bg-white p-8 text-center text-sm text-brand-ink/60">
              No notes yet. Add one on the right.
            </p>
          ) : (
            data.items.map((note) => (
              <article key={note._id} className="rounded-lg border border-brand-border bg-white p-4 shadow-card">
                {editingId === note._id ? (
                  <EditNoteForm
                    note={note}
                    onCancel={() => setEditingId(null)}
                    onSave={(t, b) => saveEdit(note._id, t, b)}
                  />
                ) : (
                  <>
                    <h2 className="font-semibold text-brand-navy">{note.title}</h2>
                    {note.body ? <p className="mt-2 text-sm text-brand-ink/80 whitespace-pre-wrap">{note.body}</p> : null}
                    <div className="mt-3 flex gap-2">
                      <Button variant="ghost" className="!px-2" onClick={() => setEditingId(note._id)}>
                        <Pencil size={16} /> Edit
                      </Button>
                      <Button variant="ghost" className="!px-2 text-brand-orange" onClick={() => removeNote(note._id)}>
                        <Trash2 size={16} /> Delete
                      </Button>
                    </div>
                  </>
                )}
              </article>
            ))
          )}
          <Pagination page={page} hasNextPage={data.hasNextPage} onPageChange={setPage} />
        </section>
        <aside className="h-fit rounded-lg border border-brand-border bg-white p-4 shadow-card lg:sticky lg:top-24">
          <h2 className="flex items-center gap-2 font-semibold text-brand-navy">
            <Plus size={18} /> New note
          </h2>
          <form onSubmit={createNote} className="mt-4 space-y-3">
            <Input label="Title" value={title} onChange={(e) => setTitle(e.target.value)} required />
            <TextArea label="Body" value={body} onChange={(e) => setBody(e.target.value)} />
            <Button type="submit" className="w-full">
              Save note
            </Button>
          </form>
          {error ? <p className="mt-3 text-sm text-brand-orange">{error}</p> : null}
        </aside>
      </div>
    </div>
  );
}

function EditNoteForm({ note, onCancel, onSave }) {
  const [title, setTitle] = useState(note.title);
  const [body, setBody] = useState(note.body || '');
  return (
    <div className="space-y-3">
      <Input label="Title" value={title} onChange={(e) => setTitle(e.target.value)} />
      <TextArea label="Body" value={body} onChange={(e) => setBody(e.target.value)} />
      <div className="flex gap-2">
        <Button type="button" onClick={() => onSave(title, body)}>
          Save
        </Button>
        <Button type="button" variant="secondary" onClick={onCancel}>
          Cancel
        </Button>
      </div>
    </div>
  );
}
