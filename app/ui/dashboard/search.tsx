'use client';

import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import BookScroll from '@/app/ui/dashboard/bookscroll';
import LoadingBookScroll from '@/app/ui/dashboard/loadingbookscroll';
import { GoogleBook } from '@/app/ui/dashboard/googlebooks';

const GOOGLE_BOOKS_API = 'https://www.googleapis.com/books/v1/volumes';
const PAGE_SIZE = 20;

function useDebounce<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = useState(value);

  useEffect(() => {
    const timer = setTimeout(() => setDebouncedValue(value), delay);
    return () => clearTimeout(timer);
  }, [value, delay]);

  return debouncedValue;
}

export default function SearchBar() {
  const router = useRouter();
  const searchParams = useSearchParams();

  // Initialize from URL params or defaults
  const initialQuery = searchParams.get('q') || '';
  const initialPage = Number(searchParams.get('page')) || 1;

  const [searchQuery, setSearchQuery] = useState(initialQuery);
  const debouncedQuery = useDebounce(searchQuery.trim(), 400);

  const [loadedPages, setLoadedPages] = useState<Record<number, GoogleBook[]>>({});
  const [isSearching, setIsSearching] = useState(false);
  const [searchPage, setSearchPage] = useState(initialPage);
  const [pendingPage, setPendingPage] = useState<number | null>(null);
  const [noNewResultsPages, setNoNewResultsPages] = useState<Set<number>>(new Set());

  const fetchBooks = useCallback(async (query: string, startIndex = 0): Promise<{ items: GoogleBook[] }> => {
    const res = await fetch(
      `${GOOGLE_BOOKS_API}?q=${encodeURIComponent(query)}&startIndex=${startIndex}&maxResults=${PAGE_SIZE}&orderBy=relevance`
    );
    const data = await res.json();
    return {
      items: (data.items || []).map((book: GoogleBook, index: number) => ({
        ...book,
        fid: `${book.id}`,
        id: `${book.id}-search-${startIndex + index}`,
      })),
    };
  }, []);

  useEffect(() => {
    if (!debouncedQuery) {
      setLoadedPages({});
      setIsSearching(false);
      setSearchPage(1);
      setPendingPage(null);
      setNoNewResultsPages(new Set());
      return;
    }

    const pageToLoad = pendingPage ?? searchPage;
    const startIndex = (pageToLoad - 1) * PAGE_SIZE;

    setIsSearching(true);

    fetchBooks(debouncedQuery, startIndex).then((res) => {
      setIsSearching(false);

      setLoadedPages((prev) => {
        const updated = { ...prev, [pageToLoad]: res.items };

        const pagesToKeep = new Set([1, pageToLoad - 1, pageToLoad, pageToLoad + 1].filter(p => p >= 1));
        for (const key of Object.keys(updated)) {
          if (!pagesToKeep.has(Number(key))) {
            delete updated[Number(key)];
          }
        }

        return updated;
      });

      setNoNewResultsPages((prev) => {
        const newSet = new Set(prev);
        if (res.items.length === 0) {
          newSet.add(pageToLoad);
        } else {
          newSet.delete(pageToLoad);
        }
        return newSet;
      });

      setSearchPage(pageToLoad);
      setPendingPage(null);

      // Update URL params
      const params = new URLSearchParams();
      if (debouncedQuery) params.set('q', debouncedQuery);
      params.set('page', pageToLoad.toString());
      router.replace(`?${params.toString()}`);
    });
  }, [debouncedQuery, pendingPage, searchPage, fetchBooks, router]);

  const currentPageResults = useMemo(() => loadedPages[searchPage] || [], [loadedPages, searchPage]);
  const currentPageHasNoResults = noNewResultsPages.has(searchPage);

  const handleSearchChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
  }, []);

  const handlePageClick = useCallback(
    (page: number) => {
      if (page < 1 || page === searchPage || isSearching) return;
      setPendingPage(page);
    },
    [searchPage, isSearching]
  );

  const paginationButtons = useMemo(() => {
    const current = searchPage;
    const range: (number | string)[] = [1];

    if (current > 3) range.push('...');

    const windowStart = Math.max(2, current - 1);
    const windowEnd = current + 1;

    for (let i = windowStart; i <= windowEnd; i++) {
      if (i !== 1) range.push(i);
    }

    return range;
  }, [searchPage]);

  return (
    <div className="mb-8">
      <input
        type="text"
        value={searchQuery}
        onChange={handleSearchChange}
        placeholder="Search for books, authors, topics..."
        className="w-1/3 px-4 py-3 mb-4 rounded-lg border border-gray-300 shadow-sm shadow-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
      />

      {debouncedQuery && (
        <section>
          <h2 className="text-2xl font-bold mb-2">
            Search Results {isSearching && <span className="text-sm text-gray-500">(Searching...)</span>}
          </h2>

          <div className="transition-all duration-200">
            {isSearching ? (
              <LoadingBookScroll />
            ) : currentPageHasNoResults ? (
              <LoadingBookScroll />
            ) : (
              <BookScroll books={currentPageResults} />
            )}
          </div>

          {!isSearching && currentPageHasNoResults && (
            <h2 className="mt-2 text-gray-500 italic text-center">No new results found for this page.</h2>
          )}

          <div className="flex justify-center mt-4 flex-wrap gap-2 items-center">
            <button
              onClick={() => handlePageClick(searchPage - 1)}
              disabled={searchPage === 1}
              className="px-3 py-1 text-sm rounded-md border bg-white text-gray-700 hover:bg-gray-100 disabled:opacity-50"
            >
              Prev
            </button>

            {paginationButtons.map((page, idx) =>
              typeof page === 'number' ? (
                <button
                  key={`search-page-${page}`}
                  onClick={() => handlePageClick(page)}
                  disabled={isSearching}
                  className={`px-3 py-1 text-sm rounded-md border ${
                    page === searchPage ? 'bg-blue-600 text-white' : 'bg-white text-gray-700 hover:bg-gray-100'
                  }`}
                >
                  {page}
                </button>
              ) : (
                <span key={`ellipsis-${idx}`} className="px-2 text-gray-500">
                  ...
                </span>
              )
            )}

            {!currentPageHasNoResults && (
              <button
                onClick={() => handlePageClick(searchPage + 1)}
                disabled={isSearching}
                className="px-3 py-1 text-sm rounded-md border bg-white text-gray-700 hover:bg-gray-100 disabled:opacity-50"
              >
                Next
              </button>
            )}
          </div>
        </section>
      )}
    </div>
  );
}
