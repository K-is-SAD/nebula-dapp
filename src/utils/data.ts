
export interface NebuleFAQ {
  question: string;
  answer: string;
}

export const NEBULA_FAQS: NebuleFAQ[] = [
  {
    question: "What is Nebula?",
    answer: "Nebula is an AI-powered tool that generates project READMEs, LinkedIn articles, Twitter posts, pitch presentations, and more from a GitHub repository URL."
  },
  {
    question: "How do I use Nebula?",
    answer: "Simply enter your public GitHub repository link into the input field. Nebula will analyze the files and generate documentation, posts, and suggestions accordingly."
  },
  {
    question: "What kind of repositories does Nebula support?",
    answer: "Currently, Nebula supports public GitHub repositories written in any languages like JavaScript, Python, Java, and more. Support for private repos is coming soon."
  },
  {
    question: "Does Nebula store my code?",
    answer: "No, Nebula does not permanently store your code. It fetches and processes content temporarily to generate outputs, ensuring your data stays secure."
  },
  {
    question: "Can Nebula generate a pitch deck or presentation?",
    answer: "Yes! Nebula uses your repo's content to generate a pitch presentation in slide format, including features, use cases, and architecture."
  },
  {
    question: "Can I customize the README or presentation content?",
    answer: "Yes, after generation, you can edit, fine-tune, or regenerate specific sections of the README, article, or presentation."
  },
  {
    question: "What is the 'chat about your project' feature?",
    answer: "This feature allows users to interact with an AI or community to explore possible improvements, features, vulnerabilities, and optimizations for the project."
  },
  {
    question: "Does Nebula detect security vulnerabilities?",
    answer: "Nebula provides suggestions about potential vulnerabilities based on static code analysis, but it's not a full security scanner."
  },
  {
    question: "Can I share the generated LinkedIn or Twitter posts directly?",
    answer: "Yes, Nebula formats posts optimized for LinkedIn and Twitter and provides shareable links or download options."
  },
  {
    question: "Is Nebula free to use?",
    answer: "Nebula offers a free tier with basic features. Premium features like saving to IPFS, version tracking, and team collaboration may be part of a paid plan."
  }
];