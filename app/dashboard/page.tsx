'use client';

import { useEffect, useState, useCallback } from 'react';
import BookScroll from '@/app/ui/dashboard/bookscroll';
import { GoogleBook } from '@/app/ui/dashboard/googlebooks';
import SearchBar from '@/app/ui/dashboard/search';
import { auth } from '@/lib/firebase/firebase';
import { onAuthStateChanged, signOut, User } from 'firebase/auth';
import { useRouter } from "next/navigation";

const GENRES = [
  { key: 'fiction', label: 'Fiction' },
  { key: 'nonfiction', label: 'Non-Fiction' },
  { key: 'fantasy', label: 'Fantasy' },
  { key: 'science fiction', label: 'Sci-Fi' },
];

const GOOGLE_BOOKS_API = 'https://www.googleapis.com/books/v1/volumes';

export default function Dashboard() {
  const [user, setUser] = useState<User | null>(null);
  const [booksByGenre, setBooksByGenre] = useState<Record<string, GoogleBook[]>>({});
  const [popularBooks, setPopularBooks] = useState<GoogleBook[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingAuth, setLoadingAuth] = useState(true);
  const router = useRouter();

  const fetchBooks = useCallback(async (query: string): Promise<GoogleBook[]> => {
    const res = await fetch(
      `${GOOGLE_BOOKS_API}?q=${encodeURIComponent(query)}&maxResults=20&orderBy=relevance`
    );
    const data = await res.json();
    return (data.items || []).map((book: GoogleBook, index: number) => ({
      ...book,
      fid: `${book.id}`,
      id: `${book.id}-genre-${index}`,
    }));
  }, []);

  useEffect(() => {
    async function loadGenres() {
      setLoading(true);
      const genreResults: Record<string, GoogleBook[]> = {};
      await Promise.all(
        GENRES.map(async (genre) => {
          const books = await fetchBooks(`subject:${genre.key}`);
          genreResults[genre.key] = books;
        })
      );
      const popular = await fetchBooks('best seller');
      setBooksByGenre(genreResults);
      setPopularBooks(popular);
      setLoading(false);
    }

    loadGenres();
  }, [fetchBooks]);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      setLoadingAuth(false);
    });
    return () => unsubscribe();
  }, []);

  const handleSignOut = async () => {
    await signOut(auth);
  };

  if (loading || loadingAuth) return <div className="p-8 text-center text-lg">Loading books...</div>;

  return (
    <div className="w-4/5 mx-auto px-4 py-8 space-y-16">

      {user ? (
        <div className="flex items-center space-x-4 absolute top-18 right-57">
          <span className="text-gray-700">Hello, {user.email}</span>
          <button
            onClick={handleSignOut}
            className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600"
          >
            Sign Out
          </button>
        </div>
      ) : (
        <button
          onClick={() => router.push('/login')}
          className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 absolute top-18 right-57"
        >
          Sign In
        </button>
      )}

      <SearchBar />

      {/* Popular Books */}
      <section className="m-0">
        <h2 className="text-2xl font-bold"> Popular Books</h2>
        <BookScroll books={popularBooks} />
      </section>

      {/* Genres */}
      {GENRES.map(({ key, label }) =>
        booksByGenre[key]?.length ? (
          <section key={key} className="m-0">
            <h2 className="text-2xl font-bold">{label}</h2>
            <BookScroll books={booksByGenre[key]} />
          </section>
        ) : null
      )}
    </div>
  );
}
