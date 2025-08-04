import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const q = searchParams.get('q') || '';

  const res = await fetch(`https://openlibrary.org/search.json?q=${encodeURIComponent(q)}`);
  const data = await res.json();

  const books = data.docs.slice(0, 20).map((book: any) => ({
    title: book.title,
    author: book.author_name?.[0] || 'Unknown',
    coverId: book.cover_i,
    imageUrl: book.cover_i
      ? `https://covers.openlibrary.org/b/id/${book.cover_i}-L.jpg`
      : null,
  }));

  return NextResponse.json(books);
}