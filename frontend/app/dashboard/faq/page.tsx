"use client";

import { motion } from "framer-motion";
import { HelpCircle, Stethoscope, Calendar, ShieldCheck, DollarSign, AlertTriangle } from "lucide-react";
import { 
  Accordion, 
  AccordionContent, 
  AccordionItem, 
  AccordionTrigger 
} from "@/components/ui/accordion";
import Link from "next/link";
import { Button } from "@/components/ui/button";

const faqs = [
  {
    icon: Stethoscope,
    question: "How does the AI give dental advice?",
    answer: "Denova utilizes advanced clinical natural language processing paired with a curated, peer-reviewed database of medical and dental literature (including MedlinePlus and dental clinical manuals). When you describe symptoms, it analyzes clinical evidence to explain potential causes, suggest home care remedies, and recommend whether an in-person dental consultation is required."
  },
  {
    icon: Calendar,
    question: "How do I book an appointment with a dentist?",
    answer: "You can book directly inside your AI consultation dialogue. Simply mention that you would like to schedule an appointment with a dentist or select a recommended doctor. Denova will generate an appointment booking receipt and automatically add your booking to the My Appointments dashboard page."
  },
  {
    icon: ShieldCheck,
    question: "Is my personal and dental health data private?",
    answer: "Yes, absolutely. All consultation transcripts and appointment records are encrypted in transit and at rest. We adhere strictly to healthcare privacy guidelines. Your information is only accessible by you and authorized clinical administrators."
  },
  {
    icon: AlertTriangle,
    question: "What should I do if I have a dental emergency?",
    answer: "If you are experiencing severe facial swelling, difficulty swallowing or breathing, uncontrolled bleeding, or acute severe trauma, please seek immediate in-person emergency care or visit an urgent care hospital. Denova's AI will automatically detect emergency keywords and prioritize urgent triage alerts."
  },
  {
    icon: DollarSign,
    question: "How much do dental consultations cost?",
    answer: "Consultation fees are set transparently on a per-doctor basis. You will see the exact consultation rate before confirming your appointment, and it will be itemized clearly on your booking receipt in your dashboard."
  },
  {
    icon: HelpCircle,
    question: "Can I review or delete my past consultation history?",
    answer: "Yes. All previous consultations are preserved in the Consultation History page. You can click on any previous session to continue the discussion or use the delete button to permanently remove individual consultation records at any time."
  }
];

const containerVariants = {
  hidden: { opacity: 0 },
  visible: { transition: { staggerChildren: 0.08 } }
};

const itemVariants = {
  hidden: { opacity: 0, y: 12 },
  visible: { opacity: 1, y: 0, transition: { type: "spring" as const, stiffness: 300, damping: 24 } }
};

export default function FAQPage() {
  return (
    <div className="p-6 md:p-10 max-w-4xl mx-auto pb-24 space-y-8 font-sans" suppressHydrationWarning>
      {/* Header */}
      <div className="text-center max-w-2xl mx-auto space-y-2 mb-8">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-50 text-emerald-800 text-xs font-bold border border-emerald-200/60 mb-2">
          <HelpCircle size={14} className="text-emerald-600" />
          <span>Patient Knowledge Base</span>
        </div>
        <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
          Frequently Asked Questions
        </h1>
        <p className="text-sm sm:text-base text-slate-600 font-medium">
          Find answers to common questions about Denova's clinical AI consultation, dentist referrals, and data privacy.
        </p>
      </div>

      {/* Accordion FAQ list */}
      <motion.div variants={containerVariants} initial="hidden" animate="visible" className="bg-white rounded-3xl p-6 sm:p-8 shadow-xs border border-slate-200">
        <Accordion type="single" collapsible className="w-full space-y-2">
          {faqs.map((faq, index) => (
            <motion.div key={index} variants={itemVariants}>
              <AccordionItem value={`item-${index}`} className="border-b-slate-100 last:border-0 py-2">
                <AccordionTrigger className="text-base sm:text-lg font-bold text-slate-900 hover:text-emerald-600 hover:no-underline transition-colors text-left py-4">
                  <div className="flex items-center gap-3 pr-4">
                    <div className="w-8 h-8 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0 border border-emerald-100">
                      <faq.icon size={16} />
                    </div>
                    <span>{faq.question}</span>
                  </div>
                </AccordionTrigger>
                <AccordionContent className="text-slate-600 text-sm sm:text-base leading-relaxed font-normal pl-11 pr-4 pb-4">
                  {faq.answer}
                </AccordionContent>
              </AccordionItem>
            </motion.div>
          ))}
        </Accordion>
      </motion.div>

      {/* Help Banner */}
      <div className="p-6 sm:p-8 rounded-3xl bg-gradient-to-r from-emerald-600 to-teal-700 text-white shadow-md flex flex-col sm:flex-row sm:items-center justify-between gap-6">
        <div className="space-y-1.5">
          <h3 className="text-xl font-bold">Have more questions or specific symptoms?</h3>
          <p className="text-sm text-emerald-100 max-w-md">
            Start a new consultation with Denova AI to receive immediate personalized guidance.
          </p>
        </div>
        <Link href="/dashboard">
          <Button className="h-11 px-6 rounded-xl bg-white text-emerald-800 hover:bg-emerald-50 font-bold text-sm shadow-sm cursor-pointer shrink-0">
            Start AI Consultation
          </Button>
        </Link>
      </div>
    </div>
  );
}
