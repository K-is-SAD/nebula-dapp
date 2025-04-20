import { createThirdwebClient } from "thirdweb";

// Replace with your actual client ID
export const client = createThirdwebClient({ 
  clientId: process.env.NEXT_PUBLIC_THIRDWEB_CLIENT_ID!
});
