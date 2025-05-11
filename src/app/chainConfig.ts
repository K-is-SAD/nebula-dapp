import { defineChain } from "thirdweb/chains";

export const blogChain = defineChain(11155111); 

export const contractAddress = process.env.NEXT_PUBLIC_THIRDWEB_CONTRACT_ADDRESS!;