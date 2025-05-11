import { getContract } from "thirdweb";
import { client } from "./client";
import { blogChain, contractAddress } from "./chainConfig";

export const getBlogContract = () => {
  return getContract({
    client,
    chain: blogChain,
    address: contractAddress,
  }); 
};

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

export const formatDate = (timestamp: number): string => {
  return new Date(timestamp * 1000).toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
};