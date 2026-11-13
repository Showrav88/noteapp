import { Button } from './Button';

export function Pagination({ page, hasNextPage, onPageChange }) {
  return (
    <div className="flex items-center justify-between gap-3 border-t border-brand-border pt-4">
      <span className="text-sm text-brand-ink">Page {page}</span>
      <div className="flex gap-2">
        <Button variant="secondary" disabled={page <= 1} onClick={() => onPageChange(page - 1)}>
          Previous
        </Button>
        <Button variant="secondary" disabled={!hasNextPage} onClick={() => onPageChange(page + 1)}>
          Next
        </Button>
      </div>
    </div>
  );
}
