'use client';

import Link from "next/link";
import { useRouter } from "next/navigation";
import { getAuth, onAuthStateChanged } from "firebase/auth";
import { useEffect, useState } from "react";
import {
  HomeIcon,
  IdentificationIcon,
  QueueListIcon,
} from "@heroicons/react/24/outline";

const links = [
  { name: "Dashboard", href: "/dashboard", icon: HomeIcon },
  { name: "Profile", href: "/profile", icon: IdentificationIcon },
  { name: "Your Shelf", href: "/shelf", icon: QueueListIcon },
];

export default function NavLinks() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const auth = getAuth();
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setIsLoggedIn(!!user);
    });
    return () => unsubscribe();
  }, []);

  const handleProfileClick = (e: React.MouseEvent) => {
    e.preventDefault();
    if (isLoggedIn) {
      router.push("/profile");
    } else {
      router.push("/login?redirected=loggedout");
    }
  };

  return (
    <div className="flex flex-col gap-1 mt-2">
      {links.map((link) => {
        const Icon = link.icon;

        if (link.name === "Profile") {
          return (
            <button
              key={link.name}
              onClick={handleProfileClick}
              className="flex items-center gap-3 rounded-md px-3 py-2 text-md bg-gray-700 hover:bg-gray-600 mx-3 text-left transition-colors duration-300"
            >
              <div className="min-w-[20px] w-5 h-5 flex items-center justify-center">
                <Icon className="w-5 h-5 shrink-0" />
              </div>
              <span className="truncate">{link.name}</span>
            </button>
          );
        }

        return (
          <Link
            key={link.name}
            href={link.href}
            className="flex items-center gap-3 rounded-md px-3 py-2 text-md bg-gray-700 hover:bg-gray-600 mx-3 transition-colors duration-300"
          >
            <div className="min-w-[20px] w-5 h-5 flex items-center justify-center">
              <Icon className="w-5 h-5 shrink-0" />
            </div>
            <span className="truncate">{link.name}</span>
          </Link>
        );
      })}
    </div>
  );
}
