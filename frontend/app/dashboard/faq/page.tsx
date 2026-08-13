"use client";

import { motion } from "framer-motion";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";

const faqs = [
  { question: "How do I update my profile?", answer: "You can update your profile information in the Settings page accessible from the sidebar or top right dropdown." },
  { question: "Is my chat history private?", answer: "Yes, all your chat history is encrypted and private. We adhere strictly to data protection standards." },
  { question: "How accurate is the AI?", answer: "Denova uses a curated database of verified medical and dental literature to provide guidance, significantly reducing hallucinations." },
  { question: "Can I delete a specific chat session?", answer: "Yes, go to the Chat History page and click the trash icon next to any session you wish to delete." },
];

const containerVariants = {
  hidden: { opacity: 0 },
  visible: { transition: { staggerChildren: 0.1 } }
};

const itemVariants = {
  hidden: { opacity: 0, y: 15 },
  visible: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 300, damping: 24 } }
};

export default function FAQPage() {
  return (
    <div className="p-8 max-w-3xl mx-auto">
      <div className="mb-10 text-center">
        <h2 className="text-3xl font-bold text-slate-900 tracking-tight">Frequently Asked Questions</h2>
        <p className="text-slate-500 mt-3 text-lg font-medium">Have questions about Denova? We're here to help.</p>
      </div>

      <motion.div variants={containerVariants} initial="hidden" animate="visible" className="bg-white rounded-3xl p-8 shadow-sm border border-slate-200">
        <Accordion type="single" collapsible className="w-full">
          {faqs.map((faq, index) => (
            <motion.div key={index} variants={itemVariants}>
              <AccordionItem value={`item-${index}`} className="border-b-slate-100 last:border-0 py-2">
                <AccordionTrigger className="text-lg font-bold text-slate-900 hover:text-emerald-600 hover:no-underline transition-colors text-left">
                  {faq.question}
                </AccordionTrigger>
                <AccordionContent className="text-slate-600 text-base leading-relaxed font-medium pb-6 pt-2 pr-6">
                  {faq.answer}
                </AccordionContent>
              </AccordionItem>
            </motion.div>
          ))}
        </Accordion>
      </motion.div>
    </div>
  );
}
