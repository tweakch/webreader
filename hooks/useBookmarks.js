import { useCallback, useEffect, useState } from 'react';

const STORAGE_KEY = 'wr-bookmarks';

/**
 * Page-level bookmarks backed by localStorage. Returns `[bookmarks, toggle]`
 * where `bookmarks` is a Set of page numbers and `toggle(page)` adds/removes
 * a bookmark.
 */
export default function useBookmarks() {
  const [bookmarks, setBookmarks] = useState(() => {
    try { return new Set(JSON.parse(localStorage.getItem(STORAGE_KEY) ?? '[]')); }
    catch { return new Set(); }
  });
  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify([...bookmarks]));
  }, [bookmarks]);
  const toggle = useCallback((page) => {
    setBookmarks((prev) => {
      const next = new Set(prev);
      if (next.has(page)) next.delete(page); else next.add(page);
      return next;
    });
  }, []);
  return [bookmarks, toggle];
}
