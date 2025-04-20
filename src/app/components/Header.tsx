"use client";

import Link from "next/link";
import { ConnectButton } from "thirdweb/react";
import { client } from "../client";
import { useActiveAccount } from "thirdweb/react";

export default function Header() {
  const account = useActiveAccount();

  return (
    <header className="bg-zinc-900 border-b border-zinc-800 py-4 px-6">
      <div className="container mx-auto flex justify-between items-center">
        <div className="flex items-center space-x-8">
          <Link
            href="/"
            className="text-2xl font-bold text-blue-500 hover:text-blue-400"
          >
            Web3 Blog
          </Link>
          <nav className="hidden md:flex space-x-6">
            <Link href="/" className="text-zinc-300 hover:text-white">
              Home
            </Link>
            <Link href="/publish" className="text-zinc-300 hover:text-white">
              Publish Article
            </Link>
            {account && (
              <Link
                href={`/profile/${account.address}`}
                className="text-zinc-300 hover:text-white"
              >
                My Articles
              </Link>
            )}
          </nav>
        </div>

        <ConnectButton
          client={client}
          appMetadata={{
            name: "Web3 Blog",
            url: "https://web3blog.example.com",
          }}
        />
      </div>
    </header>
  );
}
