'use client';

import Image from 'next/image';
import { useState, useEffect } from 'react';
import { GoogleBook } from '@/app/ui/dashboard/googlebooks';
import {
  XMarkIcon,
  StarIcon,
  CalendarIcon,
  BookOpenIcon,
  UserIcon,
  DocumentIcon,
} from '@heroicons/react/24/outline';
import { StarIcon as StarIconSolid } from '@heroicons/react/24/solid';
import { addBookToLibrary } from '@/lib/firebase/addBooks';

interface BookProps {
  book: GoogleBook;
}

type ImageLinks = {
  smallThumbnail?: string;
  thumbnail?: string;
};

const getBigThumbnail = (imageLinks?: ImageLinks): string => {
  const base = imageLinks?.thumbnail || imageLinks?.smallThumbnail;
  if (!base) return '/placeholder.png';

  // Force https and zoom=3
  return base.replace(/^http:/, 'https:').replace(/zoom=\d/, 'zoom=3');
};


export default function Book({ book }: BookProps) {
  const { volumeInfo } = book;
  const thumbnail = getBigThumbnail(volumeInfo.imageLinks);
  const [expanded, setExpanded] = useState(false);
  const [clickPos, setClickPos] = useState({ x: 0, y: 0 });
  const [animating, setAnimating] = useState(false);

  useEffect(() => {
    if (expanded || animating) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [expanded, animating]);

  const handleClick = (e: React.MouseEvent | React.KeyboardEvent) => {
    const target = e.currentTarget as HTMLElement;
    const rect = target.getBoundingClientRect();
    setClickPos({ x: rect.left + rect.width / 2, y: rect.top + rect.height / 2 });
    setAnimating(true);
    setTimeout(() => {
      setExpanded(true);
      setAnimating(false);
    }, 5);
  };

  const handleClose = () => {
    setAnimating(true);
    setExpanded(false);
    setTimeout(() => {
      setAnimating(false);
    }, 400);
  };

  useEffect(() => {
    let openTimeout: NodeJS.Timeout;
    let closeTimeout: NodeJS.Timeout;

    if (animating && !expanded) {
      closeTimeout = setTimeout(() => setAnimating(false), 300);
    }
    if (animating && expanded) {
      openTimeout = setTimeout(() => setAnimating(false), 10);
    }

    return () => {
      clearTimeout(openTimeout);
      clearTimeout(closeTimeout);
    };
  }, [animating, expanded]);

  const handleAdd = async () => {
    try {
      await addBookToLibrary(book);
      alert('Book added!');
    } catch (error) {
      console.error('Failed to add book:', error);
      alert('You need to be logged in to add books.');
    }
  };

  return (
    <>
      <div
        role="button"
        tabIndex={0}
        onClick={handleClick}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            handleClick(e);
          }
        }}
        aria-expanded={expanded}
        className={`min-w-[125px] max-w-[125px] min-h-[532px] max-h-[532px] bg-white rounded-xl shadow-md overflow-hidden hover:scale-105 hover:shadow-gray-400 transition-all
           duration-200 will-change-transform cursor-pointer focus:outline-none focus:ring-2 focus:ring-blue-500 ${
             expanded ? 'opacity-0 scale-0' : 'opacity-100 scale-100'
           }`}
      >
        {thumbnail ? (
          <Image
            src={thumbnail}
            alt={`${volumeInfo.title} cover`}
            width={125}
            height={400}
            className="object-cover w-full h-[400px]"
            draggable={false}
          />
        ) : (
          <div className="w-full h-[400px] bg-gray-200 flex items-center justify-center text-gray-500">
            No Cover
          </div>
        )}
        <div className="flex p-4">
          <div className="bg-white w-full">
            <h2 className="text-sm font-semibold line-clamp-3 break-words">{volumeInfo.title}</h2>
            <p className="text-sm text-gray-600 line-clamp-2">
              {volumeInfo.authors?.join(', ') || 'Unknown Author'}
            </p>
          </div>
        </div>
      </div>

      {(expanded || animating) && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-gray-600/80">
          <div
            className={`bg-white rounded-2xl shadow-2xl overflow-hidden transition-all duration-400 ease-in-out absolute max-w-4xl max-h-[90vh] ${
              animating && !expanded ? 'w-[125px] h-[532px]' : 'w-full h-full'
            } opacity-100 scale-100`}
            style={{
              transformOrigin: `${clickPos.x}px ${clickPos.y}px`,
              left: animating ? `${clickPos.x - 125 / 2}px` : '50%',
              top: animating ? `${clickPos.y - 532 / 2}px` : '50%',
              transform: animating ? 'none' : 'translate(-50%, -50%)',
            }}
          >
            <div className="flex h-full">
              <div className="w-1/3 bg-gradient-to-br from-amber-50 to-orange-100 flex items-center justify-center relative">
                <button
                  onClick={handleClose}
                  aria-label="Close book details"
                  className="absolute top-4 right-4 p-2 bg-white rounded-full shadow-lg hover:bg-gray-100 transition-colors z-10 focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <XMarkIcon className="w-5 h-5" />
                </button>
                <div className="text-center p-8 relative w-64 h-96">
                  {thumbnail ? (
                    <Image
                      src={thumbnail}
                      alt={`${volumeInfo.title} cover`}
                      layout="fill"
                      objectFit="cover"
                      className="rounded-lg shadow-2xl"
                      priority
                      draggable={false}
                    />
                  ) : (
                    <div className="w-full h-full bg-gray-200 flex items-center justify-center text-gray-500 rounded-lg shadow-2xl">
                      <BookOpenIcon className="w-12 h-12" aria-hidden="true" />
                    </div>
                  )}
                </div>
              </div>

              <div className="w-2/3 bg-white p-8 overflow-y-auto scrollbar-hide">
                <h1 className="text-4xl font-bold text-gray-800 mb-4">{volumeInfo.title}</h1>

                <div className="flex items-center gap-4 mb-6 text-gray-600">
                  <div className="flex items-center gap-2">
                    <UserIcon className="w-4 h-4" aria-hidden="true" />
                    <span>{volumeInfo.authors?.join(', ') || 'Unknown Author'}</span>
                  </div>
                  {volumeInfo.publishedDate && (
                    <div className="flex items-center gap-2">
                      <CalendarIcon className="w-4 h-4" aria-hidden="true" />
                      <span>{volumeInfo.publishedDate}</span>
                    </div>
                  )}
                </div>

                {volumeInfo.averageRating && (
                  <div className="flex items-center gap-2 mb-6">
                    <div className="flex">
                      {[...Array(5)].map((_, i) =>
                        i < Math.floor(volumeInfo.averageRating!) ? (
                          <StarIconSolid key={i} className="w-5 h-5 text-yellow-400" aria-hidden="true" />
                        ) : (
                          <StarIcon key={i} className="w-5 h-5 text-gray-300" aria-hidden="true" />
                        )
                      )}
                    </div>
                    <span className="text-gray-600">{volumeInfo.averageRating}/5</span>
                  </div>
                )}

                <div className="grid grid-cols-2 gap-4 mb-6">
                  {volumeInfo.pageCount && (
                    <div className="bg-gray-50 p-4 rounded-lg">
                      <div className="text-sm text-gray-600 flex items-center">
                        <DocumentIcon className="w-5 h-5" aria-hidden="true" /> &nbsp;Pages
                      </div>
                      <div className="text-xl font-semibold text-gray-800">{volumeInfo.pageCount}</div>
                    </div>
                  )}
                  {volumeInfo.categories && (
                    <div className="bg-gray-50 p-4 rounded-lg">
                      <div className="text-sm text-gray-600 flex items-center">
                        <BookOpenIcon className="w-5 h-5" aria-hidden="true" /> &nbsp;Genre
                      </div>
                      <div className="text-xl font-semibold text-gray-800">{volumeInfo.categories[0]}</div>
                    </div>
                  )}
                </div>

                {volumeInfo.categories && (
                  <div className="mb-6">
                    <h3 className="text-lg font-semibold text-gray-800 mb-3">Categories</h3>
                    <div className="flex flex-wrap gap-2">
                      {volumeInfo.categories.map((category, index) => (
                        <span
                          key={index}
                          className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm font-medium"
                        >
                          {category}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {volumeInfo.description && (
                  <div className="mb-6">
                    <h3 className="text-lg font-semibold text-gray-800 mb-3">Description</h3>
                    <p className="text-gray-700 leading-relaxed">{volumeInfo.description}</p>
                  </div>
                )}

                <div className="flex gap-4 mt-8">
                  <button className="flex-1 bg-blue-600 text-white py-3 px-6 rounded-lg hover:bg-blue-700 transition-colors font-semibold">
                    Read Now
                  </button>
                  <button 
                    onClick={handleAdd} 
                    className="flex-1 bg-gray-200 text-gray-800 py-3 px-6 rounded-lg hover:bg-gray-300 transition-colors font-semibold">
                    Add to Library
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
