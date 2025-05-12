"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export function AddressSearch() {
  const [address, setAddress] = useState("");
  const router = useRouter();

  const handleViewProfile = () => {
    if (address.trim()) {
      router.push(`/profile/${address.trim()}`);
    }
  };

  return (
    <div className="flex flex-col w-full max-w-3xl mb-8">
      <span className="mb-2 text-sm text-slate-600 dark:text-slate-300 font-medium">
        Enter the wallet address of a user to view his articles
      </span>
      <div className="flex flex-col sm:flex-row gap-4 w-full">
        <div className="relative flex-1 w-full">
          <input
            type="text"
            placeholder="Enter wallet address (0x...)"
            value={address}
            onChange={(e) => setAddress(e.target.value)}
            className="w-full py-3 px-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/80 text-slate-800 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-200 shadow-sm"
          />
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-5 w-5 absolute right-3 top-3.5 text-slate-400 dark:text-slate-500"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
            />
          </svg>
        </div>
        <button
          onClick={handleViewProfile}
          disabled={!address.trim()}
          className="py-3 px-6 rounded-xl bg-gradient-to-r from-blue-500 to-purple-500 text-white font-medium shadow-md hover:shadow-lg hover:from-blue-600 hover:to-purple-600 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          View
        </button>
      </div>
    </div>
  );
}
