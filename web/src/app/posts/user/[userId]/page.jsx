'use client';

import { useParams } from 'next/navigation';
import { useEffect, useState } from 'react';
import { PageHeader } from '../../../../components/PageHeader';
import { Pagination } from '../../../../components/Pagination';
import { api } from '../../../../lib/api';

export default function UserPostsPage() {
  const { userId } = useParams();
  const [page, setPage] = useState(1);
  const [data, setData] = useState(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    setError('');
    api(`/users/${userId}/posts?page=${page}&limit=10`)
      .then((res) => {
        setData(res);
        setPage(res.page);
      })
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, [userId, page]);

  return (
    <div>
      <PageHeader
        title={data ? `${data.name}'s posts` : 'User posts'}
        description="All posts published by this author."
      />
      {error ? <p className="text-sm text-brand-orange">{error}</p> : null}
      {loading ? (
        <p className="text-sm text-brand-ink/60">Loading…</p>
      ) : (
        <section className="space-y-3">
          {data?.posts?.length ? (
            data.posts.map((post) => (
              <article key={post._id} className="rounded-lg border border-brand-border bg-white p-4 shadow-card">
                <h2 className="font-semibold text-brand-navy">{post.title}</h2>
                {post.body ? <p className="mt-2 text-sm text-brand-ink/80 whitespace-pre-wrap">{post.body}</p> : null}
              </article>
            ))
          ) : (
            <p className="text-sm text-brand-ink/60">No posts for this user.</p>
          )}
          <Pagination page={page} hasNextPage={data?.hasNextPage} onPageChange={setPage} />
        </section>
      )}
    </div>
  );
}
