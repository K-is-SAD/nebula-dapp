import { getContract } from "thirdweb";
import { client } from "./client";
import { blogChain, contractAddress } from "./chainConfig";

// Get the blog contract instance
export const getBlogContract = () => {
  return getContract({
    client,
    chain: blogChain,
    address: contractAddress,
  }); 
};

// Type definitions for our articles
export interface ArticlePreview {
  id: number;
  author: string;
  title: string;
  previewContent: string;
  timestamp: number;
  price: string;
}

export interface Article extends ArticlePreview {
  fullContent: string;
}

// Utility functions for contract interactions
export const publishArticle = async ({
  title,
  previewContent,
  fullContent,
  price,
  account,
}: {
  title: string;
  previewContent: string;
  fullContent: string;
  price: string;
  account: string;
}) => {
  try {
    const contract = getBlogContract();
    const { transaction } = await contract.prepare("publishArticle", [
      title,
      previewContent,
      fullContent,
      price,
    ]);
    
    const tx = await transaction.send();
    return await tx.wait();
  } catch (error) {
    console.error("Error publishing article:", error);
    throw error;
  }
};

export const viewArticle = async ({
  author,
  id,
  price,
}: {
  author: string;
  id: number;
  price: string;
}) => {
  try {
    const contract = getBlogContract();
    const { transaction } = await contract.prepare("viewArticle", [author, id], {
      value: price,
    });
    
    const tx = await transaction.send();
    return await tx.wait();
  } catch (error) {
    console.error("Error viewing article:", error);
    throw error;
  }
};

export const withdrawEarnings = async () => {
  try {
    const contract = getBlogContract();
    const { transaction } = await contract.prepare("withdrawEarnings", []);
    
    const tx = await transaction.send();
    return await tx.wait();
  } catch (error) {
    console.error("Error withdrawing earnings:", error);
    throw error;
  }
};

export const getArticlePreview = async (author: string, id: number): Promise<ArticlePreview> => {
  try {
    const contract = getBlogContract();
    const data = await contract.call("getArticlePreview", [author, id]);
    
    return {
      id: Number(data[0]),
      author: data[1],
      title: data[2],
      previewContent: data[3],
      timestamp: Number(data[4]),
      price: data[5].toString(),
    };
  } catch (error) {
    console.error("Error getting article preview:", error);
    throw error;
  }
};

export const getFullContent = async (author: string, id: number): Promise<string> => {
  try {
    const contract = getBlogContract();
    return await contract.call("getFullContent", [author, id]);
  } catch (error) {
    console.error("Error getting full content:", error);
    throw error;
  }
};

export const getUserArticlesCount = async (address: string): Promise<number> => {
  try {
    const contract = getBlogContract();
    const count = await contract.call("getUserArticlesCount", [address]);
    return Number(count);
  } catch (error) {
    console.error("Error getting user articles count:", error);
    throw error;
  }
};

export const hasUserPaidForArticle = async (
  author: string,
  id: number,
  reader: string
): Promise<boolean> => {
  try {
    const contract = getBlogContract();
    return await contract.call("hasUserPaidForArticle", [author, id, reader]);
  } catch (error) {
    console.error("Error checking if user paid for article:", error);
    throw error;
  }
};

export const formatDate = (timestamp: number): string => {
  return new Date(timestamp * 1000).toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
};