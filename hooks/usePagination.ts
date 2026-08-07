import { useEffect, useMemo, useState } from "react";

export const PAGE_SIZE = 8;

export function usePagination<T>(items: T[], pageSize = PAGE_SIZE) {
  const [page, setPage] = useState(1);

  const totalPages = Math.max(1, Math.ceil(items.length / pageSize));
  const shouldPaginate = items.length > pageSize;

  useEffect(() => {
    setPage(1);
  }, [items.length]);

  useEffect(() => {
    if (page > totalPages) {
      setPage(totalPages);
    }
  }, [page, totalPages]);

  const paginatedItems = useMemo(() => {
    if (!shouldPaginate) {
      return items;
    }

    const start = (page - 1) * pageSize;
    return items.slice(start, start + pageSize);
  }, [items, page, pageSize, shouldPaginate]);

  return {
    page,
    totalPages,
    shouldPaginate,
    paginatedItems,
    goToNext: () => setPage((current) => Math.min(current + 1, totalPages)),
    goToPrev: () => setPage((current) => Math.max(current - 1, 1)),
  };
}
