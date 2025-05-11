"use client";

import { useState } from "react";
import { useActiveAccount } from "thirdweb/react";
import { useRouter } from "next/navigation";
import Header from "@/app/components/Header";
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

    // Validate form
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

      // Validate price is a valid number
      const price = parseFloat(formData.price);
      if (isNaN(price) || price < 0) {
        setError("Price must be a valid number greater than or equal to 0");
        return;
      }

      const transaction = await prepareContractCall({
        contract,
        method:
          "function publishArticle(string _title, string _previewContent, string _fullContent, uint256 _price)",
        params: [title, previewContent, fullContent, BigInt(Math.floor(price * 1e18))],
      });
      const { transactionHash } = await sendTransaction({
        transaction,
        account,
      });

      console.log(transactionHash);
      console.log("Transaction successful!! Article published successfully!!")

      // Simulate successful transaction
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
      <div className="min-h-screen bg-zinc-950 text-white">
        <Header />
        <main className="container mx-auto px-4 py-16">
          <div className="max-w-2xl mx-auto bg-zinc-900 border border-green-800 p-8 rounded-lg">
            <h2 className="text-2xl font-bold text-green-500 mb-4">
              Article Published Successfully!
            </h2>
            <p className="text-zinc-300 mb-6">
              Your article has been published and is now
              available for readers.
            </p>
            <div className="flex flex-col sm:flex-row gap-4">
              <Link
                href="/"
                className="bg-blue-600 text-white font-medium py-2 px-4 rounded-md hover:bg-blue-700 transition-colors text-center"
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
                className="bg-zinc-800 text-white font-medium py-2 px-4 rounded-md hover:bg-zinc-700 transition-colors"
              >
                Publish Another Article
              </button>
            </div>
          </div>
        </main>
      </div>
    );
  }

  if (!account) {
    return (
      <div className="min-h-screen bg-zinc-950 text-white">
        <Header />
        <main className="container mx-auto px-4 py-16">
          <div className="max-w-2xl mx-auto bg-zinc-900 border border-zinc-800 p-8 rounded-lg text-center">
            <h2 className="text-2xl font-bold mb-4">
              Connect Wallet to Publish
            </h2>
            <p className="text-zinc-400 mb-6">
              Please connect your wallet to publish an article on the
              blockchain.
            </p>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-zinc-950 text-white">
      <Header />
      <main className="container mx-auto px-4 py-10">
        <div className="max-w-2xl mx-auto">
          <h1 className="text-3xl font-bold mb-8">Publish New Article</h1>

          {error && (
            <div className="bg-red-900/30 border border-red-800 text-red-200 p-4 rounded-md mb-6">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label
                htmlFor="title"
                className="block text-sm font-medium text-zinc-300 mb-1"
              >
                Title
              </label>
              <input
                type="text"
                id="title"
                name="title"
                value={formData.title}
                onChange={handleInputChange}
                placeholder="Enter article title"
                className="w-full px-4 py-2 bg-zinc-900 border border-zinc-700 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                required
              />
            </div>

            <div>
              <label
                htmlFor="previewContent"
                className="block text-sm font-medium text-zinc-300 mb-1"
              >
                Preview Content{" "}
                <span className="text-zinc-500">(visible to all users)</span>
              </label>
              <textarea
                id="previewContent"
                name="previewContent"
                value={formData.previewContent}
                onChange={handleInputChange}
                placeholder="Enter a preview or summary of your article (visible to all users)"
                rows={4}
                className="w-full px-4 py-2 bg-zinc-900 border border-zinc-700 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                required
              />
              <p className="mt-1 text-sm text-zinc-500">
                This content will be visible to all users without payment
              </p>
            </div>

            <div>
              <label
                htmlFor="fullContent"
                className="block text-sm font-medium text-zinc-300 mb-1"
              >
                Full Content{" "}
                <span className="text-zinc-500">
                  (premium content, requires payment)
                </span>
              </label>
              <textarea
                id="fullContent"
                name="fullContent"
                value={formData.fullContent}
                onChange={handleInputChange}
                placeholder="Enter the full content of your article (only visible to users who pay)"
                rows={8}
                className="w-full px-4 py-2 bg-zinc-900 border border-zinc-700 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                required
              />
              <p className="mt-1 text-sm text-zinc-500">
                This content will only be visible to users who pay for access
              </p>
            </div>

            <div>
              <label
                htmlFor="price"
                className="block text-sm font-medium text-zinc-300 mb-1"
              >
                Price (ETH)
              </label>
              <input
                type="number"
                id="price"
                name="price"
                value={formData.price}
                onChange={handleInputChange}
                placeholder="0.01"
                min="0"
                step="0.000000001"
                className="w-full px-4 py-2 bg-zinc-900 border border-zinc-700 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                required
              />
              <p className="mt-1 text-sm text-zinc-500">
                Amount in ETH that users must pay to access the full content
                (set to 0 for free articles)
              </p>
            </div>

            <div className="pt-4">
              <button
                type="submit"
                disabled={isSubmitting}
                className={`w-full py-3 px-4 rounded-md font-medium transition-colors ${
                  isSubmitting
                    ? "bg-zinc-700 text-zinc-300 cursor-not-allowed"
                    : "bg-blue-600 hover:bg-blue-700 text-white"
                }`}
              >
                {isSubmitting ? "Publishing..." : "Publish Article"}
              </button>
            </div>
          </form>
        </div>
      </main>
    </div>
  );
}
