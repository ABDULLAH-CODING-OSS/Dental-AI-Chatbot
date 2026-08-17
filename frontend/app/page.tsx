"use client";

import React, { useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { 
  Stethoscope, 
  Sparkles, 
  ShieldCheck, 
  Clock, 
  Calendar, 
  ArrowRight, 
  CheckCircle2, 
  MessageSquare, 
  HeartPulse, 
  Smile, 
  Award,
  ChevronRight,
  BookOpen
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

const faqs = [
  {
    question: "How does Denova provide dental guidance?",
    answer: "Denova uses advanced clinical artificial intelligence grounded directly in verified medical and dental literature. This ensures the information you receive is medically sound, relevant, and trustworthy."
  },
  {
    question: "Is Denova a replacement for an in-person dentist?",
    answer: "No. Denova provides preliminary triage, symptom analysis, home care tips, and emergency escalation guidance. It does not replace comprehensive in-person dental examinations, professional cleanings, or radiographic diagnosis."
  },
  {
    question: "How do emergency clinic referrals work?",
    answer: "If your symptoms suggest an acute issue like a spreading infection, severe swelling, or trauma, Denova immediately highlights local partner clinics open for emergency walk-ins and assists with booking."
  },
  {
    question: "Is my personal health data private?",
    answer: "Yes. All conversational interactions are encrypted and handled under strict healthcare data security standards. Your records are never sold or shared with unauthorized third parties."
  }
];

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 font-sans selection:bg-emerald-200 selection:text-emerald-900">
      {/* Navigation */}
      <nav className="sticky top-0 z-40 w-full border-b border-slate-200/80 bg-white/80 backdrop-blur-md">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 h-18 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-3 group">
            <div className="w-10 h-10 rounded-2xl bg-emerald-600 flex items-center justify-center text-white shadow-md shadow-emerald-600/30 transition-transform group-hover:scale-105">
              <Stethoscope size={22} />
            </div>
            <span className="text-2xl font-extrabold tracking-tight text-slate-900">Denova</span>
          </Link>

          <div className="hidden md:flex items-center gap-8 text-sm font-semibold text-slate-600">
            <a href="#features" className="hover:text-emerald-600 transition-colors">Features</a>
            <a href="#how-it-works" className="hover:text-emerald-600 transition-colors">How It Works</a>
            <a href="#faq" className="hover:text-emerald-600 transition-colors">FAQ</a>
          </div>

          <div className="flex items-center gap-3">
            <Link href="/login">
              <Button variant="ghost" className="text-sm font-bold text-slate-700 hover:text-emerald-700 hover:bg-emerald-50 rounded-xl">
                Log In
              </Button>
            </Link>
            <Link href="/signup">
              <Button className="h-10 px-5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-bold shadow-sm transition-all">
                Get Started Free
              </Button>
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative pt-16 pb-24 lg:pt-24 lg:pb-32 overflow-hidden">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="max-w-3xl mx-auto text-center space-y-6">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-emerald-50 text-emerald-800 text-sm font-bold border border-emerald-200/80 shadow-2xs">
              <Sparkles size={16} className="text-emerald-600 animate-pulse" />
              <span>Evidence-Grounded Dental Health Platform</span>
            </div>

            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-slate-900 tracking-tight leading-[1.12]">
              Instant, intelligent dental guidance for your smile.
            </h1>

            <p className="text-lg sm:text-xl text-slate-600 font-medium leading-relaxed max-w-2xl mx-auto">
              Get immediate, medically grounded answers for toothaches, oral symptoms, and aesthetic questions, with automated emergency triage and clinic booking.
            </p>

            <div className="pt-4 flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link href="/signup" className="w-full sm:w-auto">
                <Button className="w-full sm:w-auto h-13 px-8 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white text-base font-bold shadow-lg shadow-emerald-600/25 transition-all">
                  Start Consultation Now
                  <ArrowRight size={18} className="ml-2" />
                </Button>
              </Link>
              <Link href="/login" className="w-full sm:w-auto">
                <Button variant="outline" className="w-full sm:w-auto h-13 px-8 rounded-2xl border-slate-300 text-slate-700 hover:bg-slate-100 text-base font-bold">
                  Explore Demo
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section id="features" className="py-20 bg-white border-y border-slate-200/80">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-16 space-y-2">
            <h2 className="text-3xl font-extrabold text-slate-900 tracking-tight">
              Clinical intelligence built for oral healthcare
            </h2>
            <p className="text-base text-slate-600 font-medium">
              Designed in collaboration with dental practitioners to deliver dependable patient triage.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="p-8 rounded-3xl bg-slate-50 border border-slate-200/80 space-y-4 hover:shadow-md transition-all">
              <div className="w-12 h-12 rounded-2xl bg-emerald-100 text-emerald-700 flex items-center justify-center font-bold">
                <BookOpen size={24} />
              </div>
              <h3 className="text-xl font-bold text-slate-900">Evidence-Grounded Answers</h3>
              <p className="text-sm text-slate-600 leading-relaxed font-medium">
                Denova cross-references questions directly with a curated database of verified medical and dental literature, drastically reducing errors and ensuring accuracy.
              </p>
            </div>

            <div className="p-8 rounded-3xl bg-slate-50 border border-slate-200/80 space-y-4 hover:shadow-md transition-all">
              <div className="w-12 h-12 rounded-2xl bg-indigo-100 text-indigo-700 flex items-center justify-center font-bold">
                <HeartPulse size={24} />
              </div>
              <h3 className="text-xl font-bold text-slate-900">Automated Symptom Triage</h3>
              <p className="text-sm text-slate-600 leading-relaxed font-medium">
                Detects urgent symptoms like spreading infections, acute abscesses, or facial swelling and directs you to emergency clinics immediately.
              </p>
            </div>

            <div className="p-8 rounded-3xl bg-slate-50 border border-slate-200/80 space-y-4 hover:shadow-md transition-all">
              <div className="w-12 h-12 rounded-2xl bg-purple-100 text-purple-700 flex items-center justify-center font-bold">
                <Calendar size={24} />
              </div>
              <h3 className="text-xl font-bold text-slate-900">Seamless Clinic Coordination</h3>
              <p className="text-sm text-slate-600 leading-relaxed font-medium">
                Direct referral pipelines to verified partner dental practices for checkups, cleanings, and specialized procedures.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section id="faq" className="py-20 bg-slate-50">
        <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 space-y-10">
          <div className="text-center space-y-2">
            <h2 className="text-3xl font-extrabold text-slate-900 tracking-tight">
              Frequently Asked Questions
            </h2>
            <p className="text-base text-slate-600 font-medium">
              Everything you need to know about Denova's clinical AI assistant.
            </p>
          </div>

          <Accordion type="single" collapsible className="w-full space-y-4">
            {faqs.map((faq, i) => (
              <AccordionItem key={i} value={`item-${i}`} className="rounded-2xl border border-slate-200 bg-white px-6 shadow-xs">
                <AccordionTrigger className="text-base font-bold text-slate-900 hover:text-emerald-700 py-5">
                  {faq.question}
                </AccordionTrigger>
                <AccordionContent className="text-sm text-slate-600 leading-relaxed font-medium pb-5">
                  {faq.answer}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-slate-200 bg-white py-12 text-slate-600 text-sm">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <Stethoscope size={18} className="text-emerald-600" />
            <span className="font-bold text-slate-900">Denova Dental Platform</span>
            <span className="text-xs text-slate-400">© 2026</span>
          </div>
          <p className="text-xs text-slate-500">
            For informational and preliminary guidance purposes only. In emergencies, call local emergency services immediately.
          </p>
        </div>
      </footer>
    </div>
  );
}
