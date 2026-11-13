'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { PageHeader } from '../../components/PageHeader';
import { Pagination } from '../../components/Pagination';
import { api } from '../../lib/api';

export default function InterestsPage() {
  const [page, setPage] = useState(1);
  const [data, setData] = useState({ items: [], hasNextPage: false });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    api(`/users/by-interest?page=${page}&limit=10`)
      .then((res) => {
        setData(res);
        setPage(res.page);
      })
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, [page]);

  return (
    <div>
      <PageHeader
        title="Users by interest"
        description="See who shares each interest and how many people chose it."
      />
      {error ? <p className="text-sm text-brand-orange">{error}</p> : null}
      {loading ? (
        <p className="text-sm text-brand-ink/60">Loading…</p>
      ) : (
        <div className="space-y-4">
          {data.items.map((group) => (
            <section key={group.interest} className="rounded-lg border border-brand-border bg-white p-4 shadow-card">
              <div className="flex items-baseline justify-between gap-2">
                <h2 className="text-lg font-bold text-brand-navy">{group.interest}</h2>
                <span className="text-sm text-brand-ink/60">{group.count} members</span>
              </div>
              <ul className="mt-3 divide-y divide-brand-border">
                {group.users.map((u) => (
                  <li key={u._id} className="flex items-center justify-between py-2 text-sm">
                    <span>{u.name}</span>
                    <Link href={`/posts/user/${u._id}`} className="font-semibold text-brand-cyan hover:underline">
                      View posts
                    </Link>
                  </li>
                ))}
              </ul>
            </section>
          ))}
          <Pagination page={page} hasNextPage={data.hasNextPage} onPageChange={setPage} />
        </div>
      )}
    </div>
  );
}
