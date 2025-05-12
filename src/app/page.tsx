"use client";

import { ConnectButton, useActiveAccount } from "thirdweb/react";
import { client } from "../app/client";
import Link from "next/link";
import FAQS from "@/components/faq";

const demoArticles = [
  {
    id: 1,
    author: "0xA1B2C3D4E5F6G7H8I9J0",
    title: "The Rise of Decentralized Finance",
    previewContent:
      "DeFi is transforming global finance by removing intermediaries and enabling peer-to-peer transactions. Explore the future of money.",
    timestamp: Math.floor(Date.now() / 1000) - 3600 * 24 * 1,
    price: "0.014",
    tag: "DeFi",
  },
  {
    id: 2,
    author: "0xB2C3D4E5F6G7H8I9J0A1",
    title: "NFTs: Beyond Digital Art",
    previewContent:
      "NFTs are revolutionizing not just art, but gaming, music, and intellectual property. Dive into the real-world use cases of NFTs.",
    timestamp: Math.floor(Date.now() / 1000) - 3600 * 24 * 2,
    price: "0.009",
    tag: "NFT",
  },
  {
    id: 3,
    author: "0xC3D4E5F6G7H8I9J0A1B2",
    title: "Smart Contracts: The Backbone of Web3",
    previewContent:
      "Discover how smart contracts automate trust, power DeFi, and enable new business models on the blockchain.",
    timestamp: Math.floor(Date.now() / 1000) - 3600 * 24 * 3,
    price: "0.012",
    tag: "Smart Contracts",
  },
  {
    id: 4,
    author: "0xD4E5F6G7H8I9J0A1B2C3",
    title: "Crypto Security: Protecting Your Wallet",
    previewContent:
      "Your crypto is only as safe as your security practices. Learn essential tips for safeguarding your digital assets from hacks and scams.",
    timestamp: Math.floor(Date.now() / 1000) - 3600 * 24 * 4,
    price: "0.011",
    tag: "Security",
  },
  {
    id: 5,
    author: "0xE5F6G7H8I9J0A1B2C3D4",
    title: "Web3: The Next Internet Revolution",
    previewContent:
      "Web3 is more than a buzzword. Explore how decentralized protocols are reshaping the fabric of the web.",
    timestamp: Math.floor(Date.now() / 1000) - 3600 * 24 * 5,
    price: "0.015",
    tag: "Web3",
  },
  {
    id: 6,
    author: "0xF6G7H8I9J0A1B2C3D4E5",
    title: "DAOs: The Future of Organization",
    previewContent:
      "Decentralized Autonomous Organizations are changing how people coordinate and govern projects on-chain.",
    timestamp: Math.floor(Date.now() / 1000) - 3600 * 24 * 6,
    price: "0.013",
    tag: "DAO",
  },
];

export default function Home() {
  const account = useActiveAccount();

  return (
    <div className="absolute min-h-screen bg-slate-50 dark:bg-gradient-to-br dark:from-[#18192a] dark:via-[#181926] dark:to-[#1a1b2f] text-slate-800 dark:text-white font-sans">
      <main className="relative top-28 container mx-auto px-4 py-12">
        <div className="text-center max-w-3xl mx-auto mb-12">
         <h1 className="text-5xl md:text-6xl font-extrabold mb-8 bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 dark:from-blue-400 dark:via-purple-400 dark:to-pink-400 bg-clip-text text-transparent">
  Nebula Blog Platform
</h1>
          <p className="text-xl text-slate-600 dark:text-zinc-300 mb-6">
            Explore the future of blockchain, DeFi, and crypto culture with
            visually stunning demo articles.
          </p>
          
          {account ? (
            <div className="flex justify-center mb-6">
              <Link
                href="/publish"
                className="bg-gradient-to-r from-blue-600 to-purple-700 dark:from-blue-500 dark:to-purple-600 text-white font-bold py-3 px-8 rounded-full shadow-lg transition-all duration-200 hover:scale-105 hover:shadow-xl"
              >
                <span className="drop-shadow flex items-center gap-2">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clipRule="evenodd" />
                  </svg>
                  Publish Your Article
                </span>
              </Link>
            </div>
          ) : (
            <div className="bg-white dark:bg-slate-900/80 border border-slate-200 dark:border-slate-800 rounded-xl p-6 max-w-lg mx-auto text-center mb-6 shadow-lg backdrop-blur-md">
              <h2 className="text-xl font-semibold mb-2 text-blue-600 dark:text-blue-400">
                Connect Your Wallet
              </h2>
              <p className="text-slate-600 dark:text-zinc-400 mb-4">
                Connect your wallet to publish articles or access premium
                content.
              </p>
                          <ConnectButton
                            client={client}
                            appMetadata={{
                              name: "Web3 Blog",
                              url: "https://web3blog.example.com",
                            }}
                          />
            </div>
          )}
        </div>


        <section className="py-10">
          <h2 className="text-2xl font-bold mb-8 bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 dark:from-blue-400 dark:via-purple-400 dark:to-pink-400 bg-clip-text text-transparent text-center">
            Featured Articles
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {demoArticles.map((article) => (
              <div
                key={article.id}
                className="rounded-2xl bg-white dark:bg-slate-900/80 border border-slate-200 dark:border-slate-800 hover:border-purple-400 dark:hover:border-purple-500 transition-all duration-300 shadow-md hover:shadow-xl p-6 flex flex-col gap-3 group relative overflow-hidden"
              >
        
                <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-blue-500 to-purple-500 transform scale-x-0 group-hover:scale-x-100 transition-transform duration-300 origin-left"></div>
                
                <div className="flex items-center gap-2">
                  <span className="bg-gradient-to-r from-blue-500 to-purple-500 text-white text-xs font-semibold px-3 py-1 rounded-full shadow">
                    {article.tag}
                  </span>
                  <span className="text-xs text-slate-500 dark:text-zinc-400">
                    {new Date(article.timestamp * 1000).toLocaleDateString()}
                  </span>
                </div>
                
                <h3 className="text-xl font-bold text-slate-800 dark:text-white group-hover:text-purple-700 dark:group-hover:text-purple-300 transition-colors duration-300">
                  {article.title}
                </h3>
                
                <p className="text-slate-600 dark:text-zinc-300 line-clamp-3">
                  {article.previewContent}
                </p>
                
                <div className="flex items-center justify-between mt-auto pt-3 border-t border-slate-100 dark:border-slate-800">
                  <span className="bg-blue-100 dark:bg-blue-900/50 text-blue-700 dark:text-blue-300 text-xs font-semibold px-3 py-1 rounded-full">
                    {Number(article.price)} ETH
                  </span>
                  <span className="text-xs text-slate-500 dark:text-zinc-400 font-mono">
                    {article.author.slice(0, 6)}...{article.author.slice(-4)}
                  </span>
                </div>
                
                <button className="mt-4 w-full py-2 rounded-lg bg-slate-100 dark:bg-slate-800 text-sm font-medium text-slate-700 dark:text-slate-300 hover:bg-purple-100 dark:hover:bg-purple-900/30 hover:text-purple-700 dark:hover:text-purple-300 transition-colors duration-200">
                  Read Article
                </button>
              </div>
            ))}
          </div>
        </section>
      </main>
      <FAQS/>
      <footer className="mt-16 py-6 border-t border-slate-200 dark:border-slate-800 text-center text-slate-500 dark:text-zinc-500 text-sm">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <div className="flex items-center gap-2">
              <span className="font-bold bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 dark:from-blue-400 dark:via-purple-400 dark:to-pink-400 bg-clip-text text-transparent">
                Nebula
              </span>
              <span>&copy; {new Date().getFullYear()}</span>
            </div>
            <div className="flex gap-6">
              <Link href="#" className="text-slate-500 dark:text-zinc-500 hover:text-purple-600 dark:hover:text-purple-400 transition-colors">About</Link>
              <Link href="#" className="text-slate-500 dark:text-zinc-500 hover:text-purple-600 dark:hover:text-purple-400 transition-colors">Terms</Link>
              <Link href="#" className="text-slate-500 dark:text-zinc-500 hover:text-purple-600 dark:hover:text-purple-400 transition-colors">Privacy</Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}