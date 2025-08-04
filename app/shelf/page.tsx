'use client';

import { useEffect, useState } from 'react';
import { onAuthStateChanged, User, signOut } from 'firebase/auth';
import { auth } from '@/lib/firebase/firebase';
import { getAllBooksFromLibrary } from '@/lib/firebase/getBooks';
import Book from '@/app/ui/dashboard/book';
import { GoogleBook } from '@/app/ui/dashboard/googlebooks';
import { useRouter } from "next/navigation";

export default function ShelfPage() {
  const [books, setBooks] = useState<GoogleBook[]>([]);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<User | null>(null);
  const [authChecked, setAuthChecked] = useState(false);
    const router = useRouter();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      setAuthChecked(true);
    });

    return () => unsubscribe();
  }, []);

  useEffect(() => {
    const fetchBooksFromLibrary = async () => {
      if (!user) return;

      try {
        const storedBooks = await getAllBooksFromLibrary(user.uid);
        const bookPromises = storedBooks.map(async (doc: any) => {
          const bookId = doc.id;
          if (!bookId) return null;

          try {
            const res = await fetch(`https://www.googleapis.com/books/v1/volumes/${bookId}`);
            if (!res.ok) throw new Error(`Book ${bookId} not found`);
            return await res.json();
          } catch (err) {
            console.error(`Error fetching book with ID ${bookId}:`, err);
            return null;
          }
        });

        const results = await Promise.all(bookPromises);
        const validBooks = results.filter((book): book is GoogleBook => !!book);
        setBooks(validBooks);
      } catch (error) {
        console.error('Failed to load books from library:', error);
      } finally {
        setLoading(false);
      }
    };

    if (user) fetchBooksFromLibrary();
  }, [user]);

  const handleSignOut = async () => {
    await signOut(auth);
  };

  if (!authChecked) {
    return <p className="p-4">Checking login status...</p>;
  }

  if (!user) {
    return <p className="p-4">Please <button onClick={() => router.push('/login')}
          className="text-blue-700 hover:text-blue-400 hover:underline">
          log in
        </button> to view your library.</p>;
  }

  if (loading) {
    return <p className="p-4">Loading books...</p>;
  }

  return (
    <div className="mx-auto py-13 w-4/5">
      <div className="flex items-center space-x-4 absolute top-18 right-57">
        <span className="text-gray-700">Hello, {user.email}</span>
        <button
          onClick={handleSignOut}
          className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600"
        >
          Sign Out
        </button>
      </div>

      <h1 className="text-2xl font-bold mb-15">My Library</h1>
      {books.length > 0 ? (
        <div className="flex flex-wrap gap-1">
          {books.map((book) => (
            <Book key={book.id} book={book} />
          ))}
        </div>
      ) : (
        <p>No books found in your library.</p>
      )}
    </div>
  );
}
