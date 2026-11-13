'use client';

import { useEffect, useState } from 'react';
import { Button } from '../../components/Button';
import { Input, TextArea } from '../../components/Input';
import { PageHeader } from '../../components/PageHeader';
import { Pagination } from '../../components/Pagination';
import { PostCard } from '../../components/PostCard';
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
        description="Recent posts from everyone. Use Their posts on the right to see only that author’s posts."
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
          <p className="text-sm text-brand-ink">Loading…</p>
        ) : (
          data.items.map((post) => (
            <PostCard
              key={post._id}
              title={post.title}
              body={post.body}
              author={post.author}
            />
          ))
        )}
        <Pagination page={page} hasNextPage={data.hasNextPage} onPageChange={setPage} />
      </section>
    </div>
  );
}
