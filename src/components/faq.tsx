import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

const FAQS = () => {
  return (
    <div
      className=" mt-4 md:py-10 bg-transparent w-full
        rounded-3xl
        
        "
    >
      <div className=" p-10 md:p-4 md:px-20">
        <div className="text-xl sm:text-2xl md:text-4xl lg:text-5xl font-bold dark:text-[#f6f5f4] text-black text-[1.4rem]">
          Have questions ?
        </div>
        <div className="  font-semibold text-lg sm:text-xl md:text-3xl text-green-500">
          Get answers.
        </div>
        <Accordion type="single" collapsible className="dark:text-[#f6f5f4] text-black text-xl">
          <AccordionItem value="item-1">
            <AccordionTrigger>What is KeyGEnCoders?</AccordionTrigger>
            <AccordionContent>
              KeyGEnCoders is the official coding club of Kalyani Government
              Engineering College.
            </AccordionContent>
          </AccordionItem>
          <AccordionItem value="item-2">
            <AccordionTrigger>Who is it for?</AccordionTrigger>
            <AccordionContent>
              It is for young coding enthusiasts
            </AccordionContent>
          </AccordionItem>
          <AccordionItem value="item-3">
            <AccordionTrigger>
              How many events we will conduct in Techtix&apos; 25?
            </AccordionTrigger>
            <AccordionContent>
              We will conduct four events in Techtix &apos;25: Code Buzz, Code
              Dictator, Puzzlify, and Code the Canvas.
            </AccordionContent>
          </AccordionItem>

          <AccordionItem value="item-4">
            <AccordionTrigger>How to join KeyGEnCoders?</AccordionTrigger>
            <AccordionContent>
              To join KeyGEnCoders, candidates must pass an interview to
              test their skills.
            </AccordionContent>
          </AccordionItem>
        </Accordion>
      </div>
    </div>
  );
};

export default FAQS;
