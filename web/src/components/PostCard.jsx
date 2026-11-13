import Link from 'next/link';
import { UserRound } from 'lucide-react';

const authorPostsBtn =
  'inline-flex shrink-0 items-center justify-center rounded-md border border-brand-border bg-white px-3 py-2 text-xs font-semibold text-brand-navy transition hover:border-brand-cyan hover:text-brand-cyan sm:text-sm';

export function PostCard({ title, body, author }) {
  return (
    <article className="overflow-hidden rounded-xl border-2 border-brand-border bg-white shadow-sm ring-1 ring-brand-border/30">
      {author ? (
        <header className="flex items-center gap-3 border-b border-brand-border bg-brand-muted/50 px-4 py-3 sm:px-5">
          <span
            className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-brand-navy text-brand-cyan"
            aria-hidden
          >
            <UserRound size={20} strokeWidth={2} />
          </span>
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-bold text-brand-navy">{author.name}</p>
            {author.email ? <p className="truncate text-xs font-medium text-brand-ink">{author.email}</p> : null}
          </div>
          <Link href={`/posts/user/${author._id}`} className={authorPostsBtn}>
            Their posts
          </Link>
        </header>
      ) : null}
      <div className="px-4 py-4 sm:px-5">
        <h2 className="text-lg font-bold text-brand-navy">{title}</h2>
        {body ? <p className="mt-2 text-sm font-normal leading-relaxed text-brand-ink whitespace-pre-wrap">{body}</p> : null}
      </div>
    </article>
  );
}

export function AuthorStrip({ name, subtitle }) {
  return (
    <div className="mb-4 flex items-center gap-3 rounded-xl border-2 border-brand-border bg-brand-muted/50 px-4 py-3 sm:px-5">
      <span
        className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-brand-navy text-brand-cyan"
        aria-hidden
      >
        <UserRound size={22} strokeWidth={2} />
      </span>
      <div className="min-w-0 flex-1">
        <p className="text-base font-bold text-brand-navy">{name}</p>
        {subtitle ? <p className="text-sm font-medium text-brand-ink">{subtitle}</p> : null}
      </div>
    </div>
  );
}
