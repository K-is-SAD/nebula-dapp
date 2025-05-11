"use client";

import { useActiveAccount } from "thirdweb/react";
import Header from "./components/Header";
import Link from "next/link";

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
    <div className="min-h-screen bg-gradient-to-br from-[#18192a] via-[#181926] to-[#1a1b2f] text-white font-sans">
      <Header />

      <main className="container mx-auto px-4 py-10">
        {/* Hero Section */}
        <section className="mb-14 text-center">
          <h1 className="text-5xl md:text-6xl font-extrabold bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 bg-clip-text text-transparent drop-shadow-lg mb-4">
            Nebula Blog Platform
          </h1>
          <p className="text-xl text-zinc-300 max-w-2xl mx-auto mb-8">
            Explore the future of blockchain, DeFi, and crypto culture with
            visually stunning demo articles.
          </p>
          {account ? (
            <div className="flex justify-center mb-8">
              <Link
                href="/publish"
                className="bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 hover:from-blue-600 hover:to-pink-600 text-white font-bold py-3 px-8 rounded-full shadow-lg transition-all duration-200"
              >
                <span className="drop-shadow">Publish Your Article</span>
              </Link>
            </div>
          ) : (
            <div className="bg-zinc-900/80 border border-zinc-800 rounded-xl p-6 max-w-lg mx-auto text-center mb-8 shadow-lg backdrop-blur-md">
              <h2 className="text-xl font-semibold mb-2 text-blue-400">
                Connect Your Wallet
              </h2>
              <p className="text-zinc-400 mb-2">
                Connect your wallet to publish articles or access premium
                content.
              </p>
            </div>
          )}
        </section>

        {/* Demo Articles Section */}
        <section>
          <h2 className="text-2xl font-bold mb-8 text-gradient bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 bg-clip-text text-transparent text-center">
            Demo Articles
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {demoArticles.map((article) => (
              <div
                key={article.id}
                className="rounded-2xl bg-zinc-900/80 border border-zinc-800 hover:border-purple-500 transition-all shadow-lg p-6 flex flex-col gap-3 group"
              >
                <div className="flex items-center gap-2 mb-1">
                  <span className="bg-gradient-to-r from-blue-500 to-purple-500 text-white text-xs font-semibold px-3 py-1 rounded-full shadow">
                    {article.tag}
                  </span>
                  <span className="text-xs text-zinc-400">
                    {new Date(article.timestamp * 1000).toLocaleDateString()}
                  </span>
                </div>
                <h3 className="text-xl font-bold group-hover:text-purple-300 transition drop-shadow mb-1">
                  {article.title}
                </h3>
                <p className="text-zinc-300 mb-2 line-clamp-3">
                  {article.previewContent}
                </p>
                <div className="flex items-center justify-between mt-auto">
                  <span className="bg-blue-900 text-blue-300 text-xs font-semibold px-3 py-1 rounded-full">
                    {Number(article.price)} ETH
                  </span>
                  <span className="text-xs text-zinc-400 font-mono">
                    {article.author.slice(0, 6)}...{article.author.slice(-4)}
                  </span>
                </div>
                <div className="absolute top-3 left-3 bg-pink-600/80 text-xs text-white px-2 py-1 rounded shadow z-20 hidden">
                  Demo
                </div>
              </div>
            ))}
          </div>
        </section>
      </main>
      <footer className="mt-20 py-8 border-t border-zinc-800 text-center text-zinc-500 text-sm">
        &copy; {new Date().getFullYear()} Nebula Blog Platform. Powered by
        Blockchain.
      </footer>
    </div>
  );
}
