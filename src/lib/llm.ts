import Groq from "groq-sdk";

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

export async function getKeywords(content : string) {
  const chatCompletions = await groq.chat.completions.create({
    messages: [
      {
        role : "system",
        content : "You are a highly efficient language model specialized in generating concise and relevant tags for tech-related articles. Given a title and its content, extract exactly 2 tags that best represent the technological domain or topic discussed. The tags should be accurate, technology-specific, and in uppercase (e.g., AI/ML, BLOCKCHAIN, NFT, DAPP, DL, CLOUD, IOT, DEVOPS, CYBERSECURITY, QUANTUM COMPUTING, etc.). Avoid generic terms like 'Technology', 'Software', or 'Programming'."
      },
      {
        role: "user",
        content : `Title: Understanding Decentralized Applications in Web Example- Content: Decentralized Applications or DApps are digital applications that run on a blockchain or peer-to-peer network of computers instead of a single computer. These applications are outside the purview and control of a single authority...Generate exactly 2 relevant tech-specific tags (in uppercase) for the above title and content. Expected Output:DAPP, BLOCKCHAIN. User provided Content : ${content}. Provide the tags`
      },
    ],
    model: "llama-3.3-70b-versatile",
  });

  return chatCompletions?.choices[0]?.message?.content || ""
}
