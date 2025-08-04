'use client';

import { useState } from 'react';
import NavLinks from './navlinks';
import { ArrowLeftIcon } from '@heroicons/react/24/outline';

export default function SideNav() {
  const [isOpen, setIsOpen] = useState(true);

  return (
    <div className="flex sticky h-screen scrollbar-hide">
      <div
        className={`
          bg-gray-800 text-white relative
          transition-all duration-400
          ${isOpen ? 'w-[220px]' : 'w-[60px]'}
          flex flex-col
        `}
      >
        {isOpen && <NavLinks />}

        <button
          onClick={() => setIsOpen(!isOpen)}
          className="relative mt-auto h-15 hover:bg-gray-900 transition-colors duration-400 flex items-center"
        >
          <ArrowLeftIcon
            className={`
              h-5 w-5 transform transition-transform duration-400
              absolute right-0 left-4
              ${!isOpen ? 'rotate-180 translate-x-[0px]' : 'translate-x-[160px]'}
            `}
          />
        </button>

      </div>
    </div>
  );
}
