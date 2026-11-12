export function parsePagination(query) {
  const page = Math.max(1, Number.parseInt(query.page, 10) || 1);
  const limit = Math.min(50, Math.max(1, Number.parseInt(query.limit, 10) || 10));
  const skip = (page - 1) * limit;
  return { page, limit, skip };
}

export function pageFromLength(totalFetched, limit, page) {
  const hasNextPage = totalFetched > limit;
  return {
    page,
    limit,
    hasNextPage,
  };
}

export function slicePage(rows, limit) {
  const hasNextPage = rows.length > limit;
  return {
    items: rows.slice(0, limit),
    hasNextPage,
  };
}
