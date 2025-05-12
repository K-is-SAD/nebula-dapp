"use client";

import { useState } from "react";
import { useActiveAccount } from "thirdweb/react";
import { useRouter } from "next/navigation";
import { getBlogContract } from "@/app/contractUtils";
import Link from "next/link";
import { prepareContractCall, sendTransaction } from "thirdweb";

export default function PublishPage() {
  const router = useRouter();
  const account = useActiveAccount();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const [formData, setFormData] = useState({
    title: "",
    previewContent: "",
    fullContent: "",
    price: "0.01",
  });

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!account) {
      setError("Please connect your wallet to publish an article");
      return;
    }

    if (!formData.title.trim()) {
      setError("Title is required");
      return;
    }

    if (!formData.previewContent.trim()) {
      setError("Preview content is required");
      return;
    }

    if (!formData.fullContent.trim()) {
      setError("Full content is required");
      return;
    }

    try {
      setIsSubmitting(true);
      setError(null);

      const contract = getBlogContract();
      const { title, previewContent, fullContent } = formData;

      const price = parseFloat(formData.price);
      if (isNaN(price) || price < 0) {
        setError("Price must be a valid number greater than or equal to 0");
        return;
      }

      const transaction = await prepareContractCall({
        contract,
        method:
          "function publishArticle(string _title, string _previewContent, string _fullContent, uint256 _price)",
        params: [
          title,
          previewContent,
          fullContent,
          BigInt(Math.floor(price * 1e18)),
        ],
      });
      const { transactionHash } = await sendTransaction({
        transaction,
        account,
      });

      console.log(transactionHash);
      console.log("Transaction successful!! Article published successfully!!");

      await new Promise((resolve) => setTimeout(resolve, 2000));

      setSuccess(true);

      router.push(`/profile/${account?.address}`);
    } catch (error) {
      console.error("Error publishing article:", error);
      setError("Failed to publish article. Please try again.");
      setIsSubmitting(false);
    }
  };

  if (success) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-zinc-950 to-zinc-900 text-white flex items-center justify-center p-4">
        <div className="w-full max-w-7xl bg-zinc-900 border border-green-500/30 rounded-2xl p-8 shadow-2xl shadow-green-500/10 relative overflow-hidden">
          <div className="absolute inset-0 bg-green-500/5 z-0"></div>
          <div className="relative z-10">
            <div className="flex justify-center mb-6">
              <div className="w-16 h-16 bg-green-500/10 rounded-full flex items-center justify-center">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-8 w-8 text-green-500"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M5 13l4 4L19 7"
                  />
                </svg>
              </div>
            </div>
            <h2 className="text-2xl font-bold text-center text-green-500 mb-2">
              Article Published!
            </h2>
            <p className="text-zinc-400 text-center mb-8">
              Your article is now available for readers.
            </p>
            <div className="flex flex-col space-y-3">
              <Link
                href="/"
                className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-3 px-6 rounded-lg transition-all duration-200 text-center"
              >
                View All Articles
              </Link>
              <button
                onClick={() => {
                  setSuccess(false);
                  setIsSubmitting(false);
                  setFormData({
                    title: "",
                    previewContent: "",
                    fullContent: "",
                    price: "0.01",
                  });
                }}
                className="bg-zinc-800 hover:bg-zinc-700 text-white font-medium py-3 px-6 rounded-lg transition-all duration-200"
              >
                Publish Another
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!account) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-zinc-950 to-zinc-900 text-white flex items-center justify-center p-4">
        <div className="w-full max-w-md bg-zinc-900 border border-zinc-800 rounded-2xl p-8 shadow-xl">
          <div className="text-center">
            <div className="w-16 h-16 bg-blue-500/10 rounded-full flex items-center justify-center mx-auto mb-6">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-8 w-8 text-blue-500"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
                />
              </svg>
            </div>
            <h2 className="text-2xl font-bold mb-3">Connect Your Wallet</h2>
            <p className="text-zinc-400 mb-6">
              Please connect your wallet to publish articles on the blockchain.
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-zinc-50 to-white dark:from-zinc-950 dark:to-zinc-900 text-zinc-900 dark:text-white transition-colors duration-300 pt-20">
      <main className="container mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
        <div className="max-w-7xl mx-auto">
          <div className="relative group">
            <div className="absolute -inset-1 bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl opacity-20 group-hover:opacity-30 transition-all duration-500 blur-sm"></div>
            <div className="relative bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl shadow-lg overflow-hidden">
              <div className="p-6 sm:p-8">
                <div className="text-center mb-8">
                  <h1 className="text-3xl sm:text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                    Publish New Article
                  </h1>
                  <p className="mt-2 text-zinc-500 dark:text-zinc-400">
                    Share your knowledge with the community
                  </p>
                </div>

                {error && (
                  <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-200 p-4 rounded-lg mb-6 flex items-start">
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
                    <span>{error}</span>
                  </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-6">
                  <div>
                    <label
                      htmlFor="title"
                      className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-2"
                    >
                      Article Title
                    </label>
                    <input
                      type="text"
                      id="title"
                      name="title"
                      value={formData.title}
                      onChange={handleInputChange}
                      placeholder="Your compelling title here..."
                      className="w-full px-4 py-3 bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                      required
                    />
                  </div>
                  <div>
                    <label
                      htmlFor="previewContent"
                      className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-2"
                    >
                      Preview Content
                      <span className="ml-2 text-xs text-zinc-500 dark:text-zinc-400">
                        (visible to all users)
                      </span>
                    </label>
                    <textarea
                      id="previewContent"
                      name="previewContent"
                      value={formData.previewContent}
                      onChange={handleInputChange}
                      placeholder="Write a teaser that makes readers want more..."
                      rows={4}
                      className="w-full px-4 py-3 bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                      required
                    />
                    <p className="mt-2 text-xs text-zinc-500 dark:text-zinc-400">
                      This preview will be visible to everyone
                    </p>
                  </div>

                  <div>
                    <label
                      htmlFor="fullContent"
                      className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-2"
                    >
                      Full Content
                      <span className="ml-2 text-xs text-zinc-500 dark:text-zinc-400">
                        (requires payment)
                      </span>
                    </label>
                    <textarea
                      id="fullContent"
                      name="fullContent"
                      value={formData.fullContent}
                      onChange={handleInputChange}
                      placeholder="The valuable content that readers will pay for..."
                      rows={8}
                      className="w-full px-4 py-3 bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                      required
                    />
                    <p className="mt-2 text-xs text-zinc-500 dark:text-zinc-400">
                      Only paying readers will see this content
                    </p>
                  </div>

                  <div>
                    <label
                      htmlFor="price"
                      className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-2"
                    >
                      Price (ETH)
                    </label>
                    <div className="relative">
                      <input
                        type="number"
                        id="price"
                        name="price"
                        value={formData.price}
                        onChange={handleInputChange}
                        placeholder="0.01"
                        min="0"
                        step="0.000000001"
                        className="w-full px-4 py-3 bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 pr-12"
                        required
                      />
                      <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                        <span className="text-zinc-500 dark:text-zinc-400 text-sm">
                          ETH
                        </span>
                      </div>
                    </div>
                    <p className="mt-2 text-xs text-zinc-500 dark:text-zinc-400">
                      Set to 0 for free articles
                    </p>
                  </div>

                  <div className="pt-2">
                    <button
                      type="submit"
                      disabled={isSubmitting}
                      className={`w-full py-3 px-6 rounded-lg font-medium transition-all duration-200 flex items-center justify-center ${
                        isSubmitting
                          ? "bg-zinc-200 dark:bg-zinc-700 text-zinc-400 cursor-not-allowed"
                          : "bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white shadow-lg hover:shadow-xl"
                      }`}
                    >
                      {isSubmitting ? (
                        <>
                          <svg
                            className="animate-spin -ml-1 mr-3 h-5 w-5 text-white"
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
                          Publishing...
                        </>
                      ) : (
                        "Publish Article"
                      )}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}