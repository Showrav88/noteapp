'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { UserRound } from 'lucide-react';
import { Button } from '../../components/Button';
import { Input, TextArea } from '../../components/Input';
import { PageHeader } from '../../components/PageHeader';
import { Pagination } from '../../components/Pagination';
import { api } from '../../lib/api';

export default function PostsFeedPage() {
  const [page, setPage] = useState(1);
  const [data, setData] = useState({ items: [], hasNextPage: false });
  const [title, setTitle] = useState('');
  const [body, setBody] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);

  async function load(p = page) {
    setLoading(true);
    try {
      const res = await api(`/posts?page=${p}&limit=10`);
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

  async function createPost(e) {
    e.preventDefault();
    try {
      await api('/posts', { method: 'POST', body: JSON.stringify({ title, body }) });
      setTitle('');
      setBody('');
      load(1);
      setPage(1);
    } catch (err) {
      setError(err.message);
    }
  }

  return (
    <div>
      <PageHeader
        title="Post feed"
        description="Recent posts from everyone. Open an author’s name to view their posts."
      />
      <form
        onSubmit={createPost}
        className="mb-8 rounded-xl border-2 border-brand-border bg-white p-4 shadow-sm sm:p-5"
      >
        <h2 className="text-sm font-semibold text-brand-navy">Write a post</h2>
        <div className="mt-3 grid gap-3 sm:grid-cols-2">
          <Input label="Title" value={title} onChange={(e) => setTitle(e.target.value)} required />
          <TextArea label="Body" value={body} onChange={(e) => setBody(e.target.value)} />
        </div>
        <Button type="submit" className="mt-3">
          Publish
        </Button>
      </form>
      {error ? <p className="mb-4 text-sm text-brand-orange">{error}</p> : null}
      <section className="space-y-4">
        {loading ? (
          <p className="text-sm text-brand-ink/60">Loading…</p>
        ) : (
          data.items.map((post) => (
            <article
              key={post._id}
              className="overflow-hidden rounded-xl border-2 border-brand-border bg-white shadow-sm ring-1 ring-brand-border/30"
            >
              <header className="flex items-start gap-3 border-b border-brand-border bg-brand-muted/50 px-4 py-3 sm:px-5">
                <span
                  className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-brand-navy text-brand-cyan"
                  aria-hidden
                >
                  <UserRound size={20} strokeWidth={2} />
                </span>
                <div className="min-w-0 flex-1">
                  <Link
                    href={`/posts/user/${post.author._id}`}
                    className="block truncate text-sm font-bold text-brand-navy hover:text-brand-cyan"
                  >
                    {post.author.name}
                  </Link>
                  <p className="truncate text-xs text-brand-ink/55">{post.author.email}</p>
                </div>
              </header>
              <div className="px-4 py-4 sm:px-5">
                <h2 className="text-lg font-bold text-brand-navy">{post.title}</h2>
                {post.body ? (
                  <p className="mt-2 text-sm leading-relaxed text-brand-ink/85 whitespace-pre-wrap">{post.body}</p>
                ) : null}
              </div>
            </article>
          ))
        )}
        <Pagination page={page} hasNextPage={data.hasNextPage} onPageChange={setPage} />
      </section>
    </div>
  );
}
