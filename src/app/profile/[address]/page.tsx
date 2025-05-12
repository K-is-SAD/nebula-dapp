"use client";

import { useState, useEffect } from "react";
import { useActiveAccount, useReadContract } from "thirdweb/react";
import { formatDate } from "@/app/contractUtils";
import Link from "next/link";
import { prepareContractCall, sendTransaction, readContract } from "thirdweb";
import { createThirdwebClient, getContract } from "thirdweb";
import { defineChain } from "thirdweb/chains";
import { AddressSearch } from "@/components/SearchField";

const client = createThirdwebClient({
  clientId: process.env.NEXT_PUBLIC_THIRDWEB_CLIENT_ID!,
  secretKey: process.env.NEXT_PUBLIC_THIRDWEB_SECRET_KEY!,
});

const contract = getContract({
  client,
  chain: defineChain(11155111),
  address: process.env.NEXT_PUBLIC_THIRDWEB_CONTRACT_ADDRESS!,
});

// Helper to parse the title into tags and actual title
function parseTitle(title: string) {
  const parts = title.split("||").map((p) => p.trim());
  return {
    tag1: parts[0] || "",
    tag2: parts[1] || "",
    actualTitle: parts.slice(2).join(" ") || title,
  };
}

export default function ProfilePage({
  params,
}: {
  params: { address: string };
}) {
  const account = useActiveAccount();
  const [withdrawSuccess, setWithdrawSuccess] = useState(false);
  const [isWithdrawing, setIsWithdrawing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedArticle, setSelectedArticle] = useState<any>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isPaying, setIsPaying] = useState(false);
  const [paymentSuccess, setPaymentSuccess] = useState(false);
  const [paymentError, setPaymentError] = useState<string | null>(null);
  const [hasPaid, setHasPaid] = useState(false);

  const [boughtArticles, setBoughtArticles] = useState<any[]>([]);
  const [notBoughtArticles, setNotBoughtArticles] = useState<any[]>([]);
  const [checkingPaid, setCheckingPaid] = useState(false);

  const isOwnProfile =
    account && account.address.toLowerCase() === params.address.toLowerCase();
  const profileAddress = params.address;
  const shortenedAddress = `${profileAddress.slice(
    0,
    6
  )}...${profileAddress.slice(-4)}`;

  const { data: userArticles, isPending: isLoadingArticles } = useReadContract({
    contract,
    method:
      "function getAllArticlesForUser(address user) view returns ((uint256 id, address author, string title, string previewContent, string fullContent, uint256 timestamp, uint256 price)[])",
    params: [profileAddress],
  });

  const { data: earningsData, isPending: isLoadingEarnings } = useReadContract({
    contract,
    method: "function authorEarnings(address) view returns (uint256)",
    params: [params.address],
  });

  useEffect(() => {
    const checkBoughtArticles = async () => {
      if (
        !userArticles ||
        !Array.isArray(userArticles) ||
        !account ||
        isOwnProfile
      ) {
        setBoughtArticles([]);
        setNotBoughtArticles(userArticles ? [...userArticles] : []);
        return;
      }
      setCheckingPaid(true);
      const bought: any[] = [];
      const notBought: any[] = [];
      await Promise.all(
        userArticles.map(async (article: any) => {
          if (Number(article.price) === 0) {
            notBought.push(article);
            return;
          }
          try {
            const paid = await readContract({
              contract,
              method:
                "function hasUserPaidForArticle(address author, uint256 id, address reader) view returns (bool)",
              params: [params.address, article.id, account.address],
            });
            if (paid) {
              bought.push(article);
            } else {
              notBought.push(article);
            }
          } catch {
            notBought.push(article);
          }
        })
      );
      setBoughtArticles(bought);
      setNotBoughtArticles(notBought);
      setCheckingPaid(false);
    };
    checkBoughtArticles();
  }, [userArticles, account, isOwnProfile, params.address]);

  useEffect(() => {
    const checkPaidStatus = async () => {
      if (
        account &&
        selectedArticle &&
        !isOwnProfile &&
        Number(selectedArticle.price) > 0
      ) {
        const paid = await hasUserPaidForArticle();
        setHasPaid(!!paid);
      } else {
        setHasPaid(false);
      }
    };
    checkPaidStatus();
  }, [selectedArticle, account, isOwnProfile]);

  useEffect(() => {
    if (paymentSuccess) setHasPaid(true);
  }, [paymentSuccess]);

  const handleWithdrawEarnings = async () => {
    if (!account) {
      setError("Please connect your wallet first");
      return;
    }
    if (!earningsData || earningsData === BigInt(0)) {
      setError("No earnings to withdraw");
      return;
    }
    try {
      setError(null);
      setIsWithdrawing(true);
      const transaction = await prepareContractCall({
        contract,
        method: "function withdrawEarnings()",
        params: [],
      });
      await sendTransaction({
        transaction,
        account,
      });
      setWithdrawSuccess(true);
      setTimeout(() => setWithdrawSuccess(false), 2500);
    } catch (error) {
      setError("Failed to withdraw earnings. Please try again.");
    } finally {
      setIsWithdrawing(false);
    }
  };

  const handleOpenArticle = (article: any) => {
    setSelectedArticle(article);
    setIsModalOpen(true);
    setPaymentSuccess(false);
    setPaymentError(null);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedArticle(null);
    setPaymentSuccess(false);
    setPaymentError(null);
    setHasPaid(false);
  };

  const handlePayForAccess = async () => {
    if (!account || !selectedArticle) {
      setPaymentError("Please connect your wallet first");
      return;
    }
    try {
      setIsPaying(true);
      setPaymentError(null);
      const transaction = await prepareContractCall({
        contract,
        method: "function viewArticle(address author, uint256 id) payable",
        params: [profileAddress, selectedArticle.id],
        value: selectedArticle.price,
      });
      const { transactionHash } = await sendTransaction({
        transaction,
        account,
      });
      if (!transactionHash) {
        setPaymentError("Transaction failed. Please try again.");
      } else {
        setPaymentSuccess(true);
        setHasPaid(true);
        setBoughtArticles((prev) => [...prev, selectedArticle]);
        setNotBoughtArticles((prev) =>
          prev.filter((a) => a.id !== selectedArticle.id)
        );
      }
    } catch (error) {
      setPaymentError("Transaction failed. Please try again.");
    } finally {
      setIsPaying(false);
    }
  };

  const hasUserPaidForArticle = async () => {
    if (!account || !selectedArticle) return false;
    try {
      const data = await readContract({
        contract,
        method:
          "function hasUserPaidForArticle(address author, uint256 id, address reader) view returns (bool)",
        params: [params.address, selectedArticle.id, account.address],
      });
      return !!data;
    } catch {
      return false;
    }
  };

  const formattedEarnings = earningsData
    ? `${Number(earningsData) / 1e18} ETH`
    : "0 ETH";

  if (
    isLoadingArticles ||
    (isOwnProfile && isLoadingEarnings) ||
    checkingPaid
  ) {
    return (
      <div className="min-h-screen bg-white dark:bg-zinc-950 text-zinc-900 dark:text-white">
        <main className="container mx-auto px-4 py-16">
          <div className="flex justify-center items-center h-64">
            <div className="animate-pulse flex flex-col items-center">
              <div className="h-12 w-12 bg-zinc-200 dark:bg-zinc-800 rounded-full mb-4"></div>
              <p className="text-lg text-zinc-500 dark:text-zinc-400">
                Loading profile...
              </p>
            </div>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white dark:bg-zinc-950 text-zinc-900 dark:text-white pt-20 transition-colors duration-200">
      <main className="container mx-auto px-4 sm:px-6 py-8 md:py-12">
        <div className="max-w-5xl mx-auto">
          <header className="mb-12">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 mb-8">
              <div>
                <h1 className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                  {isOwnProfile
                    ? "My Profile"
                    : `${shortenedAddress}'s Profile`}
                </h1>
                <p className="text-zinc-500 dark:text-zinc-400 mt-2">
                  {isOwnProfile
                    ? "Manage your published articles and earnings"
                    : `Viewing articles by ${shortenedAddress}`}
                </p>
              </div>
              {isOwnProfile && (
                <div className="w-full md:w-auto bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl shadow-sm p-6">
                  <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                    <div>
                      <h2 className="text-lg font-semibold text-zinc-700 dark:text-zinc-300 mb-1">
                        Author Earnings
                      </h2>
                      <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                        {formattedEarnings}
                      </p>
                      {withdrawSuccess && (
                        <p className="text-green-600 dark:text-green-400 text-sm mt-1">
                          Earnings successfully withdrawn!
                        </p>
                      )}
                    </div>
                    <button
                      onClick={handleWithdrawEarnings}
                      disabled={
                        isWithdrawing ||
                        !earningsData ||
                        earningsData === BigInt(0)
                      }
                      className={`px-6 py-2.5 rounded-lg font-medium transition-all duration-200 ${
                        isWithdrawing ||
                        !earningsData ||
                        earningsData === BigInt(0)
                          ? "bg-zinc-100 dark:bg-zinc-800 text-zinc-400 dark:text-zinc-500 cursor-not-allowed"
                          : "bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white shadow-md hover:shadow-lg"
                      }`}
                    >
                      {isWithdrawing ? (
                        <span className="flex items-center gap-2">
                          <svg
                            className="animate-spin h-4 w-4 text-white"
                            xmlns="http://www.w3.org/2000/svg"
                            fill="none"
                            viewBox="0 0 24 24"
                          >
                            <circle
                              className="opacity-25"
                              cx="12"
                              cy="12"
                              r="10"
                              stroke="currentColor"
                              strokeWidth="4"
                            ></circle>
                            <path
                              className="opacity-75"
                              fill="currentColor"
                              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                            ></path>
                          </svg>
                          Processing...
                        </span>
                      ) : (
                        "Withdraw Earnings"
                      )}
                    </button>
                  </div>
                  {error && (
                    <div className="mt-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-300 p-3 rounded-md flex items-start">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-5 w-5 mr-2 flex-shrink-0"
                        viewBox="0 0 20 20"
                        fill="currentColor"
                      >
                        <path
                          fillRule="evenodd"
                          d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                          clipRule="evenodd"
                        />
                      </svg>
                      <span>{error}</span>
                    </div>
                  )}
                </div>
              )}
            </div>
          </header>
          <AddressSearch />
          <section>
            <h2 className="text-2xl font-bold mb-6 text-zinc-800 dark:text-zinc-200">
              {isOwnProfile ? "My Articles" : `${shortenedAddress}'s Articles`}
            </h2>

            {/* Not Bought Articles */}
            {notBoughtArticles && notBoughtArticles.length > 0 ? (
              <div>
                <div className="mb-4 text-lg font-semibold text-zinc-700 dark:text-zinc-300">
                  Available Articles
                </div>
                <div className="grid md:grid-cols-2 grid-cols-1 gap-6">
                  {notBoughtArticles.map((article: any) => {
                    const { tag1, tag2, actualTitle } = parseTitle(
                      article.title
                    );
                    return (
                      <div
                        key={article.id}
                        className="rounded-2xl bg-white dark:bg-slate-900/80 border border-slate-200 dark:border-slate-800 hover:border-purple-400 dark:hover:border-purple-500 transition-all duration-300 shadow-md hover:shadow-xl p-6 flex flex-col gap-3 group relative overflow-hidden"
                      >
                        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-blue-500 to-purple-500 transform scale-x-0 group-hover:scale-x-100 transition-transform duration-300 origin-left"></div>

                        <div className="flex items-center gap-2">
                          <span className="bg-gradient-to-r from-blue-500 to-purple-500 text-white text-xs font-semibold px-3 py-1 rounded-full shadow">
                            {Number(article.price) === 0 ? "Free" : "Premium"}
                          </span>
                          <span className="text-xs text-slate-500 dark:text-zinc-400">
                            {formatDate(Number(article.timestamp))}
                          </span>
                        </div>

                        <h3
                          onClick={() => handleOpenArticle(article)}
                          className="text-xl font-bold text-slate-800 dark:text-white group-hover:text-purple-700 dark:group-hover:text-purple-300 transition-colors duration-300 cursor-pointer"
                        >
                          <div className="flex gap-2 mb-1">
                            <span className="text-sm text-blue-600 dark:text-blue-400">
                              {tag1}
                            </span>
                            <span className="text-sm text-purple-600 dark:text-purple-400">
                              {tag2}
                            </span>
                          </div>
                          {actualTitle}
                        </h3>

                        <p className="text-slate-600 dark:text-zinc-300 line-clamp-3">
                          {article.previewContent}
                        </p>

                        <div className="flex items-center justify-between mt-auto pt-3 border-t border-slate-100 dark:border-slate-800">
                          <span
                            className={`text-xs font-semibold px-3 py-1 rounded-full ${
                              Number(article.price) === 0
                                ? "bg-green-100 dark:bg-green-900/50 text-green-700 dark:text-green-300"
                                : "bg-blue-100 dark:bg-blue-900/50 text-blue-700 dark:text-blue-300"
                            }`}
                          >
                            {Number(article.price) === 0
                              ? "Free"
                              : `${Number(article.price) / 1e18} ETH`}
                          </span>
                          <span className="text-xs text-slate-500 dark:text-zinc-400 font-mono">
                            {isOwnProfile ? "You" : `${shortenedAddress}`}
                          </span>
                        </div>

                        <button
                          onClick={() => handleOpenArticle(article)}
                          className="mt-4 w-full py-2 rounded-lg bg-slate-100 dark:bg-slate-800 text-sm font-medium text-slate-700 dark:text-slate-300 hover:bg-purple-100 dark:hover:bg-purple-900/30 hover:text-purple-700 dark:hover:text-purple-300 transition-colors duration-200"
                        >
                          {isOwnProfile
                            ? "View article"
                            : Number(article.price) > 0
                            ? "Pay to read"
                            : "Read more"}
                        </button>
                      </div>
                    );
                  })}
                </div>
              </div>
            ) : (
              <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl shadow-sm p-8 text-center">
                <div className="mx-auto w-16 h-16 bg-zinc-100 dark:bg-zinc-800 rounded-full flex items-center justify-center mb-4">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-8 w-8 text-zinc-400"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                    />
                  </svg>
                </div>
                <h3 className="text-xl font-semibold text-zinc-800 dark:text-zinc-200 mb-2">
                  No articles yet
                </h3>
                <p className="text-zinc-500 dark:text-zinc-400 mb-6 max-w-md mx-auto">
                  {isOwnProfile
                    ? "You haven't published any articles yet. Start sharing your knowledge with the community!"
                    : "This user hasn't published any articles yet."}
                </p>
                {isOwnProfile && (
                  <Link
                    href="/publish"
                    className="inline-flex items-center gap-2 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white px-6 py-2.5 rounded-lg font-medium shadow-sm hover:shadow-md transition-all duration-200"
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-5 w-5"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M12 6v6m0 0v6m0-6h6m-6 0H6"
                      />
                    </svg>
                    Publish Your First Article
                  </Link>
                )}
              </div>
            )}

            {/* Bought Articles Section */}
            {boughtArticles && boughtArticles.length > 0 && (
              <div className="mt-12">
                <div className="mb-4 text-lg font-semibold text-green-600 dark:text-green-400">
                  Your Purchased Articles
                </div>
                <div className="grid grid-cols-1 gap-6">
                  {boughtArticles.map((article: any) => {
                    const { tag1, tag2, actualTitle } = parseTitle(
                      article.title
                    );
                    return (
                      <div
                        key={article.id}
                        className="group bg-white dark:bg-zinc-900 border border-green-200 dark:border-green-800/50 rounded-xl shadow-sm hover:shadow-md transition-all duration-200 overflow-hidden"
                      >
                        <div className="p-6">
                          <div className="mb-4">
                            <h3
                              onClick={() => handleOpenArticle(article)}
                              className="text-xl md:text-2xl font-bold mb-2 text-zinc-800 dark:text-zinc-100 group-hover:text-green-600 dark:group-hover:text-green-400 cursor-pointer transition-colors"
                            >
                              <div className="flex gap-2 mb-1">
                                <span className="text-sm text-blue-600 dark:text-blue-400">
                                  {tag1}
                                </span>
                                <span className="text-sm text-purple-600 dark:text-purple-400">
                                  {tag2}
                                </span>
                              </div>
                              {actualTitle}
                            </h3>
                            <div className="flex flex-wrap items-center gap-3 text-sm text-zinc-500 dark:text-zinc-400">
                              <span>
                                {formatDate(Number(article.timestamp))}
                              </span>
                              <div className="w-1 h-1 rounded-full bg-zinc-300 dark:bg-zinc-700"></div>
                              <span className="bg-green-100 dark:bg-green-900/50 text-green-800 dark:text-green-300 px-2 py-1 rounded-md text-xs font-medium">
                                {Number(article.price) === 0
                                  ? "Free"
                                  : `${Number(article.price) / 1e18} ETH`}
                              </span>
                            </div>
                          </div>
                          <div className="prose prose-zinc dark:prose-invert max-w-none mb-4">
                            <div className="whitespace-pre-line line-clamp-3">
                              {article.previewContent}
                            </div>
                          </div>
                          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mt-6">
                            <div className="text-xs text-zinc-500 dark:text-zinc-400">
                              {isOwnProfile
                                ? "Your article"
                                : `By ${shortenedAddress}`}
                            </div>
                            <button
                              onClick={() => handleOpenArticle(article)}
                              className="inline-flex items-center gap-1.5 text-green-600 dark:text-green-400 hover:text-green-800 dark:hover:text-green-300 font-medium transition-colors"
                            >
                              View article
                              <svg
                                xmlns="http://www.w3.org/2000/svg"
                                width="16"
                                height="16"
                                viewBox="0 0 24 24"
                                fill="none"
                                stroke="currentColor"
                                strokeWidth="2"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                className="inline"
                              >
                                <path d="M5 12h14"></path>
                                <path d="m12 5 7 7-7 7"></path>
                              </svg>
                            </button>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </section>
        </div>
      </main>

      {/* Article Modal */}
      {isModalOpen && selectedArticle && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white dark:bg-zinc-900 rounded-xl max-w-3xl w-full max-h-[90vh] overflow-y-auto shadow-2xl border border-zinc-200 dark:border-zinc-800">
            <div className="sticky top-0 bg-white dark:bg-zinc-900 z-10 p-6 pb-4 border-b border-zinc-200 dark:border-zinc-800 flex justify-between items-center">
              <h2 className="text-2xl font-bold text-zinc-800 dark:text-zinc-100">
                <div className="flex gap-2 mb-2">
                  <span className="text-base text-blue-600 dark:text-blue-400">
                    {parseTitle(selectedArticle.title).tag1}
                  </span>
                  <span className="text-base text-purple-600 dark:text-purple-400">
                    {parseTitle(selectedArticle.title).tag2}
                  </span>
                </div>
                {parseTitle(selectedArticle.title).actualTitle}
              </h2>
              <button
                onClick={handleCloseModal}
                className="text-zinc-400 hover:text-zinc-600 dark:hover:text-white transition-colors p-1 rounded-full"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-6 w-6"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </button>
            </div>
            <div className="p-6">
              <div className="flex flex-wrap items-center gap-3 text-sm text-zinc-500 dark:text-zinc-400 mb-6">
                <span>By: {isOwnProfile ? "You" : shortenedAddress}</span>
                <div className="w-1 h-1 rounded-full bg-zinc-300 dark:bg-zinc-700"></div>
                <span>{formatDate(Number(selectedArticle.timestamp))}</span>
                <div className="w-1 h-1 rounded-full bg-zinc-300 dark:bg-zinc-700"></div>
                <span
                  className={`px-2 py-1 rounded-md text-xs font-medium ${
                    Number(selectedArticle.price) === 0
                      ? "bg-green-100 dark:bg-green-900/50 text-green-800 dark:text-green-300"
                      : "bg-blue-100 dark:bg-blue-900/50 text-blue-800 dark:text-blue-300"
                  }`}
                >
                  {Number(selectedArticle.price) === 0
                    ? "Free"
                    : `${Number(selectedArticle.price) / 1e18} ETH`}
                </span>
              </div>
              <div className="prose prose-zinc dark:prose-invert max-w-none whitespace-pre-line">
                {isOwnProfile ||
                Number(selectedArticle.price) === 0 ||
                hasPaid ? (
                  <div>{selectedArticle.fullContent}</div>
                ) : (
                  <div>
                    <div className="mb-6">{selectedArticle.previewContent}</div>
                    <div className="border-t border-zinc-200 dark:border-zinc-800 pt-6 mt-6">
                      <div className="bg-zinc-100 dark:bg-zinc-800/50 p-6 rounded-lg">
                        <h3 className="text-xl font-semibold text-zinc-800 dark:text-zinc-200 mb-3">
                          Premium Content
                        </h3>
                        <p className="text-zinc-600 dark:text-zinc-400 mb-4">
                          Pay {Number(selectedArticle.price) / 1e18} ETH to
                          unlock the full article content
                        </p>
                        {paymentSuccess ? (
                          <div className="p-4 bg-green-100 dark:bg-green-900/30 border border-green-200 dark:border-green-800 text-green-800 dark:text-green-200 rounded-md mb-4 flex items-start">
                            <svg
                              xmlns="http://www.w3.org/2000/svg"
                              className="h-5 w-5 mr-2 mt-0.5 flex-shrink-0"
                              viewBox="0 0 20 20"
                              fill="currentColor"
                            >
                              <path
                                fillRule="evenodd"
                                d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                                clipRule="evenodd"
                              />
                            </svg>
                            <span>
                              Payment successful! You now have full access to
                              this content.
                            </span>
                          </div>
                        ) : (
                          <button
                            onClick={handlePayForAccess}
                            disabled={isPaying}
                            className={`w-full py-3 px-4 rounded-lg font-medium transition-all duration-200 flex items-center justify-center gap-2 ${
                              isPaying
                                ? "bg-zinc-200 dark:bg-zinc-700 text-zinc-400 dark:text-zinc-500 cursor-not-allowed"
                                : "bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white shadow-md hover:shadow-lg"
                            }`}
                          >
                            {isPaying ? (
                              <>
                                <svg
                                  className="animate-spin h-5 w-5 text-white"
                                  xmlns="http://www.w3.org/2000/svg"
                                  fill="none"
                                  viewBox="0 0 24 24"
                                >
                                  <circle
                                    className="opacity-25"
                                    cx="12"
                                    cy="12"
                                    r="10"
                                    stroke="currentColor"
                                    strokeWidth="4"
                                  ></circle>
                                  <path
                                    className="opacity-75"
                                    fill="currentColor"
                                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                                  ></path>
                                </svg>
                                Processing Payment...
                              </>
                            ) : (
                              `Pay ${
                                Number(selectedArticle.price) / 1e18
                              } ETH to Unlock`
                            )}
                          </button>
                        )}
                        {paymentError && (
                          <div className="mt-4 bg-red-100 dark:bg-red-900/30 border border-red-200 dark:border-red-800 text-red-800 dark:text-red-200 p-3 rounded-md flex items-start">
                            <svg
                              xmlns="http://www.w3.org/2000/svg"
                              className="h-5 w-5 mr-2 mt-0.5 flex-shrink-0"
                              viewBox="0 0 20 20"
                              fill="currentColor"
                            >
                              <path
                                fillRule="evenodd"
                                d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                                clipRule="evenodd"
                              />
                            </svg>
                            <span>{paymentError}</span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
