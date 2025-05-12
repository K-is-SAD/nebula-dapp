"use client";

import Link from "next/link";
import { ConnectButton } from "thirdweb/react";
import { client } from "../app/client";
import { useActiveAccount } from "thirdweb/react";
import { ModeToggle } from "./Toggle";
import { useState, useRef, useEffect } from "react";
import { Menu, X } from "lucide-react";

export default function Header() {
  const account = useActiveAccount();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setMobileMenuOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <header className="fixed top-0 z-[100] w-full border-b border-zinc-300 dark:border-zinc-800 backdrop-blur-md shadow-sm dark:shadow-zinc-800">
      <div className="container mx-auto px-4">
        <div className="flex h-16 items-center justify-between">
          <div className="flex items-center gap-10">
            <Link href="/" className="flex items-center">
              <span className="md:text-2xl text-lg font-bold bg-gradient-to-r from-blue-500 to-purple-600 bg-clip-text text-transparent">
                Nebula Blog
              </span>
            </Link>

            <nav className="hidden md:flex items-center gap-6">
              <Link
                href="/"
                className="text-sm font-medium text-zinc-700 hover:text-black dark:text-zinc-300 dark:hover:text-white transition-colors px-3 py-2 rounded-lg hover:bg-zinc-100 dark:hover:bg-zinc-800"
              >
                Home
              </Link>
              <Link
                href="/publish"
                className="text-sm font-medium text-zinc-700 hover:text-black dark:text-zinc-300 dark:hover:text-white transition-colors px-3 py-2 rounded-lg hover:bg-zinc-100 dark:hover:bg-zinc-800"
              >
                Publish Article
              </Link>
              {account && (
                <Link
                  href={`/profile/${account.address}`}
                  className="text-sm font-medium text-zinc-700 hover:text-black dark:text-zinc-300 dark:hover:text-white transition-colors px-3 py-2 rounded-lg hover:bg-zinc-100 dark:hover:bg-zinc-800"
                >
                  My Articles
                </Link>
              )}
            </nav>
          </div>

          <div className="flex items-center gap-4">
            
              <ModeToggle />
            
            <ConnectButton
              client={client}
              appMetadata={{
                name: "Web3 Blog",
                url: "https://web3blog.example.com",
              }}
            />

            <button
              className="md:hidden p-2 rounded-lg text-zinc-700 hover:bg-zinc-100 dark:text-zinc-300 dark:hover:bg-zinc-800"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
              {mobileMenuOpen ? (
                <X className="h-5 w-5" />
              ) : (
                <Menu className="h-5 w-5" />
              )}
            </button>
          </div>
        </div>
      </div>


      {mobileMenuOpen && (
        <div 
          ref={menuRef}
          className="md:hidden absolute top-16 left-0 right-0 bg-white dark:bg-zinc-900 border-t border-zinc-200 dark:border-zinc-800 shadow-lg animate-in fade-in slide-in-from-top-5"
        >
          <div className="container px-4 py-3 space-y-2">
            <Link
              href="/"
              className="block px-4 py-3 rounded-lg text-zinc-700 hover:bg-zinc-100 dark:text-zinc-300 dark:hover:bg-zinc-800 font-medium"
              onClick={() => setMobileMenuOpen(false)}
            >
              Home
            </Link>
            <Link
              href="/publish"
              className="block px-4 py-3 rounded-lg text-zinc-700 hover:bg-zinc-100 dark:text-zinc-300 dark:hover:bg-zinc-800 font-medium"
              onClick={() => setMobileMenuOpen(false)}
            >
              Publish Article
            </Link>
            {account && (
              <Link
                href={`/profile/${account.address}`}
                className="block px-4 py-3 rounded-lg text-zinc-700 hover:bg-zinc-100 dark:text-zinc-300 dark:hover:bg-zinc-800 font-medium"
                onClick={() => setMobileMenuOpen(false)}
              >
                My Articles
              </Link>
            )}
          </div>
        </div>
      )}
    </header>
  );
}