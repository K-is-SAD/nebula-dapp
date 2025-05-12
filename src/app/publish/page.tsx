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
    tag1: "",
    tag2: "",
    title: "",
    previewContent: "",
    fullContent: "",
    price: "0.01",
  });

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    // Enforce max length for tags
    if (name === "tag1" || name === "tag2") {
      if (value.length > 10) return;
    }
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

    // Validate tags
    if (
      formData.tag1.trim().length === 0 ||
      formData.tag2.trim().length === 0
    ) {
      setError("Both tags are required");
      return;
    }

    if (formData.tag1.length > 10 || formData.tag2.length > 10) {
      setError("Each tag can be maximum 10 characters");
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
      const { tag1, tag2, title, previewContent, fullContent } = formData;

      // Create formatted title
      const formattedTitle = `${tag1} || ${tag2} || ${title}`;

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
          formattedTitle,
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

  // Rest of the component remains the same until the return statement...

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
                    {/* Error message display remains same */}
                  </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label
                        htmlFor="tag1"
                        className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-2"
                      >
                        Tag 1 (max 10 chars)
                      </label>
                      <input
                        type="text"
                        id="tag1"
                        name="tag1"
                        value={formData.tag1}
                        onChange={handleInputChange}
                        placeholder="First tag"
                        className="w-full px-4 py-3 bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                        required
                        maxLength={10}
                      />
                    </div>
                    <div>
                      <label
                        htmlFor="tag2"
                        className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-2"
                      >
                        Tag 2 (max 10 chars)
                      </label>
                      <input
                        type="text"
                        id="tag2"
                        name="tag2"
                        value={formData.tag2}
                        onChange={handleInputChange}
                        placeholder="Second tag"
                        className="w-full px-4 py-3 bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                        required
                        maxLength={10}
                      />
                    </div>
                  </div>

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
                    <p className="mt-2 text-xs text-zinc-500 dark:text-zinc-400">
                      Final title will be: {formData.tag1 || "tag1"} ||{" "}
                      {formData.tag2 || "tag2"} || {formData.title || "title"}
                    </p>
                  </div>

                  {/* Rest of the form inputs (previewContent, fullContent, price) remain the same */}

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
                      {/* Button content remains same */}
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
