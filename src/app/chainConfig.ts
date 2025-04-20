import { defineChain } from "thirdweb/chains";

// Define the blockchain network to use (using Sepolia testnet for development)
export const blogChain = defineChain(11155111); // Sepolia testnet

// Contract address from the SimpleBlog contract
export const contractAddress = "0x692A7FaF5e1e9b90A96786F26567e4eC40A0653f"; // Replace with your deployed contract address