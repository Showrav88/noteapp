'use client';

import { useParams } from 'next/navigation';
import { useEffect, useState } from 'react';
import { AuthorStrip, PostCard } from '../../../../components/PostCard';
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

  const postCountOnPage = data?.posts?.length ?? 0;

  return (
    <div>
      <PageHeader
        title={data ? `${data.name}'s posts` : 'User posts'}
        description="All posts from this author, newest first."
      />
      {error ? <p className="text-sm text-brand-orange">{error}</p> : null}
      {loading ? (
        <p className="text-sm text-brand-ink">Loading…</p>
      ) : (
        <section>
          {data?.name ? (
            <AuthorStrip
              name={data.name}
              subtitle={
                postCountOnPage
                  ? `Showing ${postCountOnPage} post${postCountOnPage === 1 ? '' : 's'} on this page`
                  : 'No posts yet'
              }
            />
          ) : null}
          <div className="space-y-4">
            {postCountOnPage ? (
              data.posts.map((post) => (
                <PostCard key={post._id} title={post.title} body={post.body} />
              ))
            ) : (
              <p className="text-sm text-brand-ink">No posts for this user.</p>
            )}
          </div>
          <div className="mt-4">
            <Pagination page={page} hasNextPage={data?.hasNextPage} onPageChange={setPage} />
          </div>
        </section>
      )}
    </div>
  );
}
