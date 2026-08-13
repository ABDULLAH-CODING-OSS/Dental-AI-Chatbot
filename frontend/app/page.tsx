"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { 
  Menu,
  X,
  Stethoscope,
  Clock,
  ShieldCheck,
  BrainCircuit,
  MessageSquare,
  Activity,
  ArrowRight,
  Calendar,
  ChevronDown
} from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";

const faqs = [
  {
    question: "Is Denova a replacement for my dentist?",
    answer: "No, Denova is not a replacement for professional dental care. Denova is designed to provide general education, answer common questions, and help you understand potential symptoms. You should always consult a licensed dentist for diagnosis and treatment."
  },
  {
    question: "How accurate is the AI?",
    answer: "Denova uses Retrieval-Augmented Generation (RAG) to source its answers directly from a curated database of verified medical and dental literature. This drastically reduces hallucinations and ensures the information you receive is highly accurate and trustworthy."
  },
  {
    question: "Is my data secure and private?",
    answer: "Yes. We take your privacy seriously. All interactions are encrypted, and we adhere to strict data protection standards to ensure your health inquiries remain completely confidential."
  },
  {
    question: "How much does it cost to use Denova?",
    answer: "Denova's basic AI consultation features are completely free to use. We may offer premium features for advanced tracking or priority booking in the future."
  }
];

function FAQItem({ question, answer }: { question: string, answer: string }) {
  const [isOpen, setIsOpen] = useState(false);
  
  return (
    <div className="border-b border-gray-100 last:border-0">
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className="flex w-full items-center justify-between py-6 text-left text-xl font-semibold text-gray-900 hover:text-emerald-600 transition-colors"
      >
        {question}
        <ChevronDown className={`w-6 h-6 text-gray-400 transition-transform duration-300 ${isOpen ? 'rotate-180' : ''}`} />
      </button>
      <motion.div
        initial={false}
        animate={{ height: isOpen ? 'auto' : 0, opacity: isOpen ? 1 : 0 }}
        className="overflow-hidden"
        transition={{ duration: 0.3, ease: 'easeInOut' }}
      >
        <p className="pb-6 text-gray-600 text-lg leading-relaxed">
          {answer}
        </p>
      </motion.div>
    </div>
  );
}

export default function Home() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const fadeIn = {
    hidden: { opacity: 0, y: 20 },
    visible: { 
      opacity: 1, 
      y: 0, 
      transition: { duration: 0.6, ease: [0.42, 0, 0.58, 1] as const } 
    }
  };

  const staggerContainer = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.2
      }
    }
  };

  return (
    <div className="min-h-screen bg-white text-gray-900 font-sans selection:bg-emerald-200 selection:text-emerald-900 overflow-x-hidden">
      {/* Sticky Navigation */}
      <motion.nav 
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        transition={{ duration: 0.5, ease: "easeOut" }}
        className="fixed top-0 left-0 right-0 z-50 bg-white/80 backdrop-blur-md border-b border-gray-100"
      >
        <div className="max-w-350 mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-24">
            {/* Logo */}
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-xl bg-emerald-600 flex items-center justify-center text-white shadow-lg shadow-emerald-200">
                <Stethoscope size={32} />
              </div>
              <span className="text-3xl font-bold bg-clip-text text-transparent bg-linear-to-r from-emerald-600 to-emerald-400">
                Denova
              </span>
            </div>

            {/* Desktop Links */}
            <div className="hidden md:flex items-center space-x-10 text-lg">
              <Link href="#features" className="text-gray-600 hover:text-emerald-600 font-medium transition-colors">Features</Link>
              <Link href="#how-it-works" className="text-gray-600 hover:text-emerald-600 font-medium transition-colors">How it works</Link>
              <Link href="#faq" className="text-gray-600 hover:text-emerald-600 font-medium transition-colors">FAQ</Link>
            </div>

            {/* Desktop Actions */}
            <div className="hidden md:flex items-center space-x-4">
              <Button asChild variant="ghost" className="text-gray-600 hover:text-emerald-600 hover:bg-emerald-50 text-lg px-6 h-12">
                <Link href="/login">Log in</Link>
              </Button>
              <Button asChild className="bg-emerald-600 hover:bg-emerald-700 text-white shadow-lg shadow-emerald-200 border-none text-lg px-6 h-12">
                <Link href="/signup">Try Denova</Link>
              </Button>
            </div>

            {/* Mobile Menu Toggle */}
            <div className="md:hidden flex items-center">
              <button 
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                className="text-gray-600 hover:text-emerald-600"
              >
                {isMobileMenuOpen ? <X size={32} /> : <Menu size={32} />}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Menu */}
        {isMobileMenuOpen && (
          <div className="md:hidden bg-white border-t border-gray-100 px-4 pt-2 pb-6 space-y-2 shadow-lg absolute w-full">
            <Link href="#features" className="block px-4 py-3 rounded-md text-lg font-medium text-gray-700 hover:text-emerald-600 hover:bg-emerald-50">Features</Link>
            <Link href="#how-it-works" className="block px-4 py-3 rounded-md text-lg font-medium text-gray-700 hover:text-emerald-600 hover:bg-emerald-50">How it works</Link>
            <Link href="#faq" className="block px-4 py-3 rounded-md text-lg font-medium text-gray-700 hover:text-emerald-600 hover:bg-emerald-50">FAQ</Link>
            <div className="mt-6 pt-6 border-t border-gray-100 flex flex-col gap-3">
              <Button asChild variant="outline" className="w-full justify-center h-12 text-lg">
                <Link href="/login">Log in</Link>
              </Button>
              <Button asChild className="w-full justify-center bg-emerald-600 hover:bg-emerald-700 text-white h-12 text-lg">
                <Link href="/signup">Try Denova</Link>
              </Button>
            </div>
          </div>
        )}
      </motion.nav>

      {/* Hero Section */}
      <section className="relative pt-40 pb-24 lg:pt-56 lg:pb-40 overflow-hidden">
        {/* Animated Background Gradient placeholder to act like a video/gradient */}
        <div className="absolute inset-0 -z-10 bg-[radial-gradient(ellipse_at_top_right,var(--tw-gradient-stops))] from-emerald-100 via-white to-purple-50 opacity-70"></div>
        
        {/* Placeholder for real video */}
        {/* <video autoPlay loop muted playsInline className="absolute inset-0 w-full h-full object-cover -z-20 opacity-10">
          <source src="/placeholder-dental-video.mp4" type="video/mp4" />
        </video> */}

        <div className="max-w-350 mx-auto px-4 sm:px-6 lg:px-8 relative z-10 text-center">
          <motion.div
            initial="hidden"
            animate="visible"
            variants={staggerContainer}
            className="max-w-5xl mx-auto"
          >
            <motion.div variants={fadeIn} className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-purple-100 text-purple-700 font-medium text-base mb-10 border border-purple-200">
              <span className="flex h-2.5 w-2.5 rounded-full bg-purple-600"></span>
              Next-Gen AI Dental Guidance
            </motion.div>
            
            <motion.h1 variants={fadeIn} className="text-5xl md:text-7xl lg:text-8xl font-extrabold tracking-tight text-gray-900 mb-8 leading-tight">
              Smarter Care for Your <br className="hidden md:block"/>
              <span className="text-transparent bg-clip-text bg-linear-to-r from-emerald-600 to-emerald-400">Radiant Smile</span>
            </motion.h1>
            
            <motion.p variants={fadeIn} className="text-xl md:text-2xl text-gray-600 mb-12 max-w-3xl mx-auto leading-relaxed">
              Denova is your 24/7 AI-powered dental assistant. Get grounded, medically-sourced answers, assess your symptoms, and connect with trusted professionals instantly.
            </motion.p>
            
            <motion.div variants={fadeIn} className="flex flex-col sm:flex-row items-center justify-center gap-5">
              <Button asChild size="lg" className="h-16 px-10 text-xl bg-emerald-600 hover:bg-emerald-700 text-white rounded-full shadow-xl shadow-emerald-200/50 w-full sm:w-auto group">
                <Link href="/signup">
                  Try Denova Free
                  <ArrowRight className="ml-3 h-6 w-6 group-hover:translate-x-1 transition-transform" />
                </Link>
              </Button>
              <Button asChild size="lg" variant="outline" className="h-16 px-10 text-xl rounded-full w-full sm:w-auto border-gray-200 text-gray-700 hover:bg-gray-50">
                <Link href="#how-it-works">See How It Works</Link>
              </Button>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* How it Works Section */}
      <section id="how-it-works" className="py-24 lg:py-32 bg-gray-50 border-y border-gray-100">
        <div className="max-w-350 mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div 
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-100px" }}
            variants={fadeIn}
            className="text-center mb-20"
          >
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">How Denova Works</h2>
            <p className="text-xl md:text-2xl text-gray-600 max-w-3xl mx-auto">Get expert-backed dental guidance in three simple steps.</p>
          </motion.div>

          <motion.div 
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-50px" }}
            variants={staggerContainer}
            className="grid md:grid-cols-3 gap-16 relative max-w-6xl mx-auto"
          >
            {/* Step 1 */}
            <motion.div variants={fadeIn} className="relative flex flex-col items-center text-center group">
              <div className="w-24 h-24 bg-white rounded-3xl shadow-sm border border-gray-100 flex items-center justify-center mb-8 relative z-10 group-hover:scale-110 transition-transform duration-300">
                <MessageSquare className="w-12 h-12 text-emerald-600" />
                <div className="absolute -top-3 -right-3 w-10 h-10 bg-purple-600 text-white rounded-full flex items-center justify-center font-bold text-lg border-4 border-gray-50">1</div>
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-4">Ask Your Question</h3>
              <p className="text-lg text-gray-600 leading-relaxed">
                Describe your dental concern, symptoms, or simply ask a question about oral hygiene in plain language.
              </p>
            </motion.div>

            {/* Step 2 */}
            <motion.div variants={fadeIn} className="relative flex flex-col items-center text-center group">
              <div className="w-24 h-24 bg-white rounded-3xl shadow-sm border border-gray-100 flex items-center justify-center mb-8 relative z-10 group-hover:scale-110 transition-transform duration-300">
                <BrainCircuit className="w-12 h-12 text-emerald-600" />
                <div className="absolute -top-3 -right-3 w-10 h-10 bg-purple-600 text-white rounded-full flex items-center justify-center font-bold text-lg border-4 border-gray-50">2</div>
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-4">AI Analysis</h3>
              <p className="text-lg text-gray-600 leading-relaxed">
                Denova's RAG-powered engine instantly cross-references your query with trusted medical and dental literature.
              </p>
            </motion.div>

            {/* Step 3 */}
            <motion.div variants={fadeIn} className="relative flex flex-col items-center text-center group">
              <div className="w-24 h-24 bg-white rounded-3xl shadow-sm border border-gray-100 flex items-center justify-center mb-8 relative z-10 group-hover:scale-110 transition-transform duration-300">
                <Activity className="w-12 h-12 text-emerald-600" />
                <div className="absolute -top-3 -right-3 w-10 h-10 bg-purple-600 text-white rounded-full flex items-center justify-center font-bold text-lg border-4 border-gray-50">3</div>
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-4">Get Actionable Advice</h3>
              <p className="text-lg text-gray-600 leading-relaxed">
                Receive clear, actionable insights and, if needed, seamless booking options with local certified dentists.
              </p>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* Features Grid */}
      <section id="features" className="py-24 lg:py-32 bg-white">
        <div className="max-w-350 mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div 
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={fadeIn}
            className="text-center mb-20"
          >
            <div className="inline-block px-5 py-2 rounded-full bg-emerald-100 text-emerald-700 font-semibold text-base mb-6">
              Why Denova?
            </div>
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">Everything you need for a healthier smile</h2>
          </motion.div>

          <motion.div 
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-50px" }}
            variants={staggerContainer}
            className="grid lg:grid-cols-2 gap-10 max-w-6xl mx-auto"
          >
            {[
              {
                icon: <ShieldCheck className="w-10 h-10 text-emerald-600" />,
                title: "RAG-Grounded Answers",
                desc: "Responses are generated using Retrieval-Augmented Generation, ensuring advice is based solely on verified dental and medical literature."
              },
              {
                icon: <Clock className="w-10 h-10 text-emerald-600" />,
                title: "Available 24/7",
                desc: "Toothache at 3 AM? Denova is always awake. Get immediate guidance on managing pain or symptoms while you wait for a clinic to open."
              },
              {
                icon: <Calendar className="w-10 h-10 text-emerald-600" />,
                title: "Seamless Appointment Booking",
                desc: "If Denova detects a need for professional care, easily schedule an appointment with trusted local dentists directly through the platform."
              },
              {
                icon: <Stethoscope className="w-10 h-10 text-emerald-600" />,
                title: "Trusted Medical Sources",
                desc: "We don't hallucinate medical advice. Our dataset comprises peer-reviewed journals and official guidelines from dental associations."
              }
            ].map((feature, i) => (
              <motion.div 
                key={i} 
                variants={fadeIn}
                className="p-10 rounded-3xl border border-gray-100 bg-white shadow-sm hover:shadow-md transition-shadow duration-300 flex flex-col sm:flex-row gap-8 items-start"
              >
                <div className="shrink-0 w-20 h-20 rounded-2xl bg-emerald-50 flex items-center justify-center">
                  {feature.icon}
                </div>
                <div>
                  <h3 className="text-2xl font-bold text-gray-900 mb-3">{feature.title}</h3>
                  <p className="text-lg text-gray-600 leading-relaxed">{feature.desc}</p>
                </div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* FAQ Section */}
      <section id="faq" className="py-24 lg:py-32 bg-gray-50 border-t border-gray-100">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div 
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={fadeIn}
            className="text-center mb-16"
          >
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">Frequently Asked Questions</h2>
            <p className="text-xl md:text-2xl text-gray-600">Got questions? We've got answers.</p>
          </motion.div>

          <motion.div 
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={fadeIn}
            className="bg-white rounded-3xl p-8 md:p-12 shadow-sm border border-gray-100"
          >
            {faqs.map((faq, index) => (
              <FAQItem key={index} question={faq.question} answer={faq.answer} />
            ))}
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-white border-t border-gray-100 pt-20 pb-10">
        <div className="max-w-350 mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row justify-between items-center mb-16">
            <div className="flex items-center gap-3 mb-8 md:mb-0">
              <div className="w-10 h-10 rounded-lg bg-emerald-600 flex items-center justify-center text-white">
                <Stethoscope size={24} />
              </div>
              <span className="text-2xl font-bold text-gray-900">
                Denova
              </span>
            </div>
            
            <div className="flex flex-wrap justify-center gap-8 md:space-x-8">
              <Link href="#" className="text-lg text-gray-500 hover:text-emerald-600 transition-colors">Privacy Policy</Link>
              <Link href="#" className="text-lg text-gray-500 hover:text-emerald-600 transition-colors">Terms of Service</Link>
              <Link href="#" className="text-lg text-gray-500 hover:text-emerald-600 transition-colors">Contact</Link>
            </div>
          </div>
          
          <div className="pt-10 border-t border-gray-100 text-center">
            <p className="text-base text-gray-500 mb-4 font-medium px-4">
              Disclaimer: Denova provides general dental education, not medical diagnosis. Consult a licensed dentist for treatment.
            </p>
            <p className="text-base text-gray-400">
              &copy; {new Date().getFullYear()} Denova Health. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}