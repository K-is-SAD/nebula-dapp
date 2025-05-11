"use client";

import { useState, useEffect } from "react";
import { useActiveAccount, useReadContract } from "thirdweb/react";
import Header from "@/app/components/Header";
import { formatDate } from "@/app/contractUtils";
import Link from "next/link";
import { prepareContractCall, sendTransaction, readContract } from "thirdweb";
import { createThirdwebClient, getContract } from "thirdweb";
import { defineChain } from "thirdweb/chains";

const client = createThirdwebClient({
  clientId: process.env.NEXT_PUBLIC_THIRDWEB_CLIENT_ID!,
  secretKey: process.env.NEXT_PUBLIC_THIRDWEB_SECRET_KEY!,
});

const contract = getContract({
  client,
  chain: defineChain(11155111),
  address: "0x692A7FaF5e1e9b90A96786F26567e4eC40A0653f",
});

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

  // For splitting articles
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

  // Split articles into bought and not bought
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
      // Check payment status for each article (paid only for paid articles)
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
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userArticles, account, isOwnProfile]);

  // Check if user has paid for the article when modal opens or selectedArticle changes
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
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedArticle, account]);

  // Update paid status after successful payment
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
        // Move this article to boughtArticles
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
      <div className="min-h-screen bg-zinc-950 text-white">
        <Header />
        <main className="container mx-auto px-4 py-16">
          <div className="flex justify-center items-center h-64">
            <p className="text-xl text-zinc-400">Loading profile...</p>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-zinc-950 text-white">
      <Header />
      <main className="container mx-auto px-4 py-10">
        <div className="max-w-4xl mx-auto">
          <header className="mb-12">
            <h1 className="text-3xl font-bold mb-4">
              {isOwnProfile ? "My Profile" : `${shortenedAddress}'s Profile`}
            </h1>
            {isOwnProfile && (
              <div className="bg-zinc-900 border border-zinc-800 rounded-lg p-6 mb-8">
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center">
                  <div>
                    <h2 className="text-xl font-semibold mb-2">
                      Author Earnings
                    </h2>
                    <p className="text-2xl font-bold text-blue-400 mb-2">
                      {formattedEarnings}
                    </p>
                    {withdrawSuccess && (
                      <p className="text-green-500 text-sm">
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
                    className={`mt-4 md:mt-0 py-2 px-6 rounded-md font-medium transition-colors ${
                      isWithdrawing ||
                      !earningsData ||
                      earningsData === BigInt(0)
                        ? "bg-zinc-700 text-zinc-300 cursor-not-allowed"
                        : "bg-blue-600 hover:bg-blue-700 text-white"
                    }`}
                  >
                    {isWithdrawing ? "Processing..." : "Withdraw Earnings"}
                  </button>
                </div>
                {error && (
                  <div className="mt-4 bg-red-900/30 border border-red-800 text-red-200 p-3 rounded-md">
                    {error}
                  </div>
                )}
              </div>
            )}
          </header>
          <section>
            <h2 className="text-2xl font-bold mb-6">
              {isOwnProfile ? "My Articles" : `${shortenedAddress}'s Articles`}
            </h2>
            {/* Not Bought Articles */}
            {notBoughtArticles && notBoughtArticles.length > 0 ? (
              <div>
                <div className="mb-3 text-lg font-semibold text-zinc-300">
                  Articles Not Bought
                </div>
                <div className="grid grid-cols-1 gap-6">
                  {notBoughtArticles.map((article: any) => (
                    <div
                      key={article.id}
                      className="bg-zinc-900 border border-zinc-800 rounded-lg p-6 hover:border-zinc-700 transition-colors"
                    >
                      <div className="mb-4">
                        <h3
                          onClick={() => handleOpenArticle(article)}
                          className="text-2xl font-bold mb-2 hover:text-blue-400 cursor-pointer"
                        >
                          {article.title}
                        </h3>
                        <div className="flex items-center gap-3 text-sm text-zinc-400">
                          <span>{formatDate(Number(article.timestamp))}</span>
                          <div className="w-1 h-1 rounded-full bg-zinc-700"></div>
                          <span className="bg-blue-900 text-blue-300 px-2 py-1 rounded-sm text-xs">
                            {Number(article.price) === 0
                              ? "Free"
                              : `${Number(article.price) / 1e18} ETH`}
                          </span>
                        </div>
                      </div>
                      <div className="prose prose-invert max-w-none mb-4">
                        <div className="whitespace-pre-line mb-4 line-clamp-4">
                          {article.previewContent}
                        </div>
                      </div>
                      <div className="flex justify-between items-center mt-4">
                        <div className="text-xs text-zinc-500">
                          {isOwnProfile
                            ? "This is your article"
                            : `Article by ${shortenedAddress}`}
                        </div>
                        <button
                          onClick={() => handleOpenArticle(article)}
                          className="inline-flex items-center gap-1 text-blue-400 hover:text-blue-300"
                        >
                          {isOwnProfile
                            ? "View full article"
                            : Number(article.price) > 0
                            ? "Pay to read more"
                            : "Read more"}
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
                          >
                            <path d="M5 12h14"></path>
                            <path d="m12 5 7 7-7 7"></path>
                          </svg>
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <div className="bg-zinc-900 border border-zinc-800 rounded-lg p-8 text-center">
                <h3 className="text-xl font-semibold mb-2">No articles yet</h3>
                <p className="text-zinc-400 mb-4">
                  {isOwnProfile
                    ? "You haven't published any articles yet."
                    : "This user hasn't published any articles yet."}
                </p>
                {isOwnProfile && (
                  <Link
                    href="/publish"
                    className="inline-block bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors"
                  >
                    Publish Your First Article
                  </Link>
                )}
              </div>
            )}

            {/* Bought Articles Section */}
            {boughtArticles && boughtArticles.length > 0 && (
              <div className="mt-12">
                <div className="mb-3 text-lg font-semibold text-green-400">
                  Bought Articles
                </div>
                <div className="grid grid-cols-1 gap-6">
                  {boughtArticles.map((article: any) => (
                    <div
                      key={article.id}
                      className="bg-zinc-900 border border-green-800 rounded-lg p-6 hover:border-green-700 transition-colors"
                    >
                      <div className="mb-4">
                        <h3
                          onClick={() => handleOpenArticle(article)}
                          className="text-2xl font-bold mb-2 hover:text-green-400 cursor-pointer"
                        >
                          {article.title}
                        </h3>
                        <div className="flex items-center gap-3 text-sm text-zinc-400">
                          <span>{formatDate(Number(article.timestamp))}</span>
                          <div className="w-1 h-1 rounded-full bg-zinc-700"></div>
                          <span className="bg-green-900 text-green-300 px-2 py-1 rounded-sm text-xs">
                            {Number(article.price) === 0
                              ? "Free"
                              : `${Number(article.price) / 1e18} ETH`}
                          </span>
                        </div>
                      </div>
                      <div className="prose prose-invert max-w-none mb-4">
                        <div className="whitespace-pre-line mb-4 line-clamp-4">
                          {article.previewContent}
                        </div>
                      </div>
                      <div className="flex justify-between items-center mt-4">
                        <div className="text-xs text-zinc-500">
                          {isOwnProfile
                            ? "This is your article"
                            : `Article by ${shortenedAddress}`}
                        </div>
                        <button
                          onClick={() => handleOpenArticle(article)}
                          className="inline-flex items-center gap-1 text-green-400 hover:text-green-300"
                        >
                          View full article
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
                          >
                            <path d="M5 12h14"></path>
                            <path d="m12 5 7 7-7 7"></path>
                          </svg>
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </section>
        </div>
      </main>
      {/* Article Modal */}
      {isModalOpen && selectedArticle && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center p-4 z-50">
          <div className="bg-zinc-900 rounded-lg max-w-3xl w-full max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-zinc-900 z-10 p-6 pb-4 border-b border-zinc-800 flex justify-between items-center">
              <h2 className="text-2xl font-bold">{selectedArticle.title}</h2>
              <button
                onClick={handleCloseModal}
                className="text-zinc-400 hover:text-white"
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
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </button>
            </div>
            <div className="p-6">
              <div className="flex items-center gap-3 text-sm text-zinc-400 mb-6">
                <span>By: {isOwnProfile ? "You" : shortenedAddress}</span>
                <div className="w-1 h-1 rounded-full bg-zinc-700"></div>
                <span>{formatDate(Number(selectedArticle.timestamp))}</span>
                <div className="w-1 h-1 rounded-full bg-zinc-700"></div>
                <span className="bg-blue-900 text-blue-300 px-2 py-1 rounded-sm text-xs">
                  {Number(selectedArticle.price) === 0
                    ? "Free"
                    : `${Number(selectedArticle.price) / 1e18} ETH`}
                </span>
              </div>
              <div className="prose prose-invert max-w-none whitespace-pre-line">
                {isOwnProfile ||
                Number(selectedArticle.price) === 0 ||
                hasPaid ? (
                  <div>{selectedArticle.fullContent}</div>
                ) : (
                  <div>
                    <div className="mb-6">{selectedArticle.previewContent}</div>
                    <div className="border-t border-zinc-800 pt-6 mt-6">
                      <div className="bg-zinc-800 p-6 rounded-lg">
                        <h3 className="text-xl font-semibold mb-3">
                          Premium Content
                        </h3>
                        <p className="text-zinc-400 mb-4">
                          Pay {Number(selectedArticle.price) / 1e18} ETH to read
                          the full article
                        </p>
                        {paymentSuccess ? (
                          <div className="p-4 bg-green-900/30 border border-green-800 text-green-200 rounded-md mb-4">
                            Payment successful! You now have access to the full
                            content.
                          </div>
                        ) : (
                          <button
                            onClick={handlePayForAccess}
                            disabled={isPaying}
                            className={`w-full py-3 px-4 rounded-md font-medium transition-colors ${
                              isPaying
                                ? "bg-zinc-700 text-zinc-300 cursor-not-allowed"
                                : "bg-blue-600 hover:bg-blue-700 text-white"
                            }`}
                          >
                            {isPaying
                              ? "Processing Payment..."
                              : `Pay ${
                                  Number(selectedArticle.price) / 1e18
                                } ETH for Full Access`}
                          </button>
                        )}
                        {paymentError && (
                          <div className="mt-4 bg-red-900/30 border border-red-800 text-red-200 p-3 rounded-md">
                            {paymentError}
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
