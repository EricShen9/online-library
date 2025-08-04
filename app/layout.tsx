'use client'; // if using Next.js app router

import SideNav from './ui/layout/sidenav';
import "./globals.css"

export default function Layout({ children }: { children: React.ReactNode }) {

  return (
    <html lang="en" className="scrollbar-hide">
      <body className="">
        <div className="flex min-h-screen">
          <div className="sticky top-0 self-start h-screen">
            <SideNav />
          </div>
          <main className="flex-1 bg-gray-100 py-6 overflow-auto">
            {children}
          </main>
        </div>
      </body>
    </html>
  );
}
