'use client';

import { ChevronDown } from 'lucide-react';
import { useEffect, useState } from 'react';
import { PageHeader } from '../../components/PageHeader';
import { Pagination } from '../../components/Pagination';
import { api } from '../../lib/api';
import { formatInterestLabel } from '../../lib/interestLabel';

export default function InterestsPage() {
  const [page, setPage] = useState(1);
  const [data, setData] = useState({ items: [], hasNextPage: false });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);
  const [openGroups, setOpenGroups] = useState(() => new Set());

  useEffect(() => {
    setLoading(true);
    api(`/users/by-interest?page=${page}&limit=10`)
      .then((res) => {
        setData(res);
        setPage(res.page);
        const first = res.items?.[0]?.interest;
        setOpenGroups(first ? new Set([first]) : new Set());
      })
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, [page]);

  function toggleGroup(interestKey) {
    setOpenGroups((prev) => {
      const next = new Set(prev);
      if (next.has(interestKey)) {
        next.delete(interestKey);
      } else {
        next.add(interestKey);
      }
      return next;
    });
  }

  return (
    <div>
      <PageHeader
        title="Users by interest"
        description="Groups sorted by size. Expand a group to see member names."
      />
      {error ? <p className="text-sm text-brand-orange">{error}</p> : null}
      {loading ? (
        <p className="text-sm text-brand-ink/60">Loading…</p>
      ) : (
        <div className="space-y-3">
          {data.items.length === 0 ? (
            <p className="text-sm text-brand-ink/60">No interest groups yet.</p>
          ) : null}
          {data.items.map((group) => {
            const label = formatInterestLabel(group.interest);
            const isOpen = openGroups.has(group.interest);
            const panelId = `interest-panel-${group.interest}`;

            return (
              <section
                key={group.interest}
                className="overflow-hidden rounded-lg border border-brand-border bg-white shadow-card"
              >
                <button
                  type="button"
                  onClick={() => toggleGroup(group.interest)}
                  aria-expanded={isOpen}
                  aria-controls={panelId}
                  className="flex w-full items-center gap-3 px-4 py-3 text-left transition hover:bg-brand-muted/80"
                >
                  <ChevronDown
                    size={18}
                    className={`shrink-0 text-brand-cyan transition-transform ${isOpen ? '' : '-rotate-90'}`}
                    aria-hidden
                  />
                  <span className="min-w-0 flex-1">
                    <span className="block text-base font-bold text-brand-navy">{label}</span>
                    <span className="text-xs font-medium uppercase tracking-wide text-brand-ink/45">Interest group</span>
                  </span>
                  <span className="shrink-0 rounded-full bg-brand-cyan/15 px-3 py-1 text-sm font-semibold text-brand-navy">
                    {group.count} {group.count === 1 ? 'member' : 'members'}
                  </span>
                </button>
                {isOpen ? (
                  <div id={panelId} className="border-t border-brand-border bg-brand-muted/40 px-4 py-2">
                    <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-brand-ink/50">Members</p>
                    <ul className="divide-y divide-brand-border rounded-md border border-brand-border bg-white">
                      {group.users.map((u) => (
                        <li key={u._id} className="px-3 py-2.5 text-sm font-medium text-brand-ink">
                          {u.name}
                        </li>
                      ))}
                    </ul>
                  </div>
                ) : null}
              </section>
            );
          })}
          <Pagination page={page} hasNextPage={data.hasNextPage} onPageChange={setPage} />
        </div>
      )}
    </div>
  );
}
