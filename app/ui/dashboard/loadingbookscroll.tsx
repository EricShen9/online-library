import React from 'react';

export default function LoadingBookScroll() {
  return (
    <div className="overflow-x-hidden select-none scrollbar-hide overflow-y-visible flex gap-1 w-max px-2 py-6">
      {Array.from({ length: 10 }).map((_, i) => (
        <div key={`load-book-${i}`}
          className="min-w-[125px] max-w-[125px] min-h-[532px] max-h-[532px] bg-gray-300 rounded-xl shadow-md overflow-hidden relative shimmer">
        </div>
      ))}
    </div>
  );
}