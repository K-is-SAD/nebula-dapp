"use client";

import Link from "next/link";
import { ArticlePreview, formatDate } from "../app/contractUtils";
import { useActiveAccount } from "thirdweb/react";

export default function ArticleCard({ article }: { article: ArticlePreview }) {
  const account = useActiveAccount();
  const isAuthor = account?.address === article.author;
  const shortenedAddress = `${article.author.slice(
    0,
    6
  )}...${article.author.slice(-4)}`;

  return (
    <div className="border border-zinc-800 rounded-lg p-6 bg-zinc-900 hover:bg-zinc-800 transition-colors">
      <div className="mb-4 flex justify-between items-start">
        <h2 className="text-xl font-bold text-white mb-2">{article.title}</h2>
        <div className="text-sm bg-blue-900 text-blue-300 px-2 py-1 rounded">
          {article.price === "0" ? "Free" : `${article.price} ETH`}
        </div>
      </div>

      <div className="text-zinc-400 text-sm mb-4">
        <span>By: {isAuthor ? "You" : shortenedAddress}</span>
        <span className="mx-2">•</span>
        <span>{formatDate(article.timestamp)}</span>
      </div>

      <p className="text-zinc-300 mb-4 line-clamp-3">
        {article.previewContent}
      </p>

      <Link
        href={`/article/${article.author}/${article.id}`}
        className="inline-block bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors"
      >
        Read {article.price === "0" || isAuthor ? "Article" : "Preview"}
      </Link>
    </div>
  );
}
