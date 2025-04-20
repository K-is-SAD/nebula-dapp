"use client";

import { useState, useEffect } from "react";
import { useActiveAccount } from "thirdweb/react";
import Header from "./components/Header";
import ArticleCard from "./components/ArticleCard";
import { ArticlePreview, getBlogContract } from "./contractUtils";
import Link from "next/link";

export default function Home() {
  const account = useActiveAccount();
  const [recentArticles, setRecentArticles] = useState<ArticlePreview[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Dummy data for initial UI development
  useEffect(() => {
    // In a real application, you would fetch articles from the blockchain
    // This is a simplified implementation for demonstration
    const fetchRecentArticles = async () => {
      try {
        setIsLoading(true);

        // For demo purposes only - replace with actual contract calls in production
        const dummyArticles: ArticlePreview[] = [
          {
            id: 0,
            author: "0x1234567890123456789012345678901234567890",
            title: "Introduction to Web3 and Blockchain",
            previewContent:
              "Web3 represents the next iteration of the internet, built on blockchain technology. In this article, we explore the fundamentals of Web3 and how it differs from traditional web technologies...",
            timestamp: Math.floor(Date.now() / 1000) - 86400,
            price: "0.01",
          },
          {
            id: 1,
            author: "0x2345678901234567890123456789012345678901",
            title: "Smart Contracts Explained",
            previewContent:
              "Smart contracts are self-executing contracts with the terms directly written into code. They automatically enforce and execute agreements when predetermined conditions are met...",
            timestamp: Math.floor(Date.now() / 1000) - 172800,
            price: "0.005",
          },
          {
            id: 2,
            author: "0x3456789012345678901234567890123456789012",
            title: "The Future of Decentralized Finance",
            previewContent:
              "Decentralized Finance (DeFi) is revolutionizing traditional financial systems by removing intermediaries and enabling peer-to-peer transactions...",
            timestamp: Math.floor(Date.now() / 1000) - 259200,
            price: "0.02",
          },
        ];

        setRecentArticles(dummyArticles);
        setIsLoading(false);
      } catch (error) {
        console.error("Error fetching recent articles:", error);
        setIsLoading(false);
      }
    };

    fetchRecentArticles();
  }, []);

  return (
    <div className="min-h-screen bg-zinc-950 text-white">
      <Header />

      <main className="container mx-auto px-4 py-8">
        <section className="mb-12">
          <div className="text-center mb-12">
            <h1 className="text-4xl md:text-5xl font-bold mb-4">
              Nebula Blog Platform
            </h1>
            <p className="text-xl text-zinc-400 max-w-2xl mx-auto">
              Read and publish articles on the blockchain. Pay with crypto to
              access premium content.
            </p>
          </div>

          {account ? (
            <div className="flex justify-center mb-12">
              <Link
                href="/publish"
                className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-6 rounded-lg transition-colors"
              >
                Publish Your Article
              </Link>
            </div>
          ) : (
            <div className="bg-zinc-900 border border-zinc-800 rounded-lg p-6 max-w-lg mx-auto text-center mb-12">
              <h2 className="text-xl font-semibold mb-3">
                Connect Your Wallet
              </h2>
              <p className="text-zinc-400 mb-4">
                Connect your wallet to publish articles or access premium
                content.
              </p>
            </div>
          )}
        </section>

        <section>
          <h2 className="text-2xl font-bold mb-6">Recent Articles</h2>

          {isLoading ? (
            <div className="grid place-items-center h-64">
              <div className="text-xl text-zinc-400">Loading articles...</div>
            </div>
          ) : recentArticles.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {recentArticles.map((article) => (
                <ArticleCard
                  key={`${article.author}-${article.id}`}
                  article={article}
                />
              ))}
            </div>
          ) : (
            <div className="bg-zinc-900 border border-zinc-800 rounded-lg p-8 text-center">
              <h3 className="text-xl font-semibold mb-2">No articles yet</h3>
              <p className="text-zinc-400 mb-4">
                Be the first to publish an article on this platform!
              </p>
              {account && (
                <Link
                  href="/publish"
                  className="inline-block bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors"
                >
                  Create New Article
                </Link>
              )}
            </div>
          )}
        </section>
      </main>
    </div>
  );
}
