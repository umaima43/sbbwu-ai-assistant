"use client";

import Link from "next/link";
import {
  ArrowLeft,
  MessageCircle,
  Send,
  HelpCircle,
  History,
  Plus,
  Moon,
  Sparkles,
  CheckCircle2,
  AlertCircle,
  Search,
} from "lucide-react";

export default function UserGuidePage() {
  return (
    <div className="min-h-full bg-[#F7F8FC] p-8 dark:bg-gray-950">
      <div className="mx-auto max-w-6xl">

        {/* Back Button */}
        <Link
          href="/chat"
          className="mb-6 inline-flex items-center gap-2 text-sm font-semibold text-[#A10D5A] transition-all hover:gap-3 dark:text-pink-300"
        >
          <ArrowLeft size={18} />
          Back
        </Link>

        {/* Page Header */}
        <div className="mb-8">
          <div className="mb-4 inline-flex items-center gap-2 rounded-full bg-pink-100 px-4 py-2 text-sm font-semibold text-[#A10D5A] dark:bg-pink-950/40 dark:text-pink-300">
            <Sparkles size={16} />
            SBBWU AI Assistant
          </div>

          <h1 className="text-4xl font-bold text-gray-900 dark:text-white">
            User Guide
          </h1>

          <p className="mt-3 max-w-3xl text-lg text-gray-600 dark:text-gray-300">
            Learn how to use the SBBWU AI Assistant, ask questions,
            and find university information quickly and easily.
          </p>
        </div>

        {/* Hero */}
        <section className="relative mb-10 overflow-hidden rounded-3xl bg-gradient-to-r from-[#A10D5A] to-[#C33C78] p-8 text-white shadow-lg">
          <div className="absolute -right-10 -top-10 h-40 w-40 rounded-full bg-white/10" />
          <div className="absolute -bottom-20 -right-20 h-60 w-60 rounded-full bg-white/10" />

          <div className="relative">
            <div className="mb-5 flex items-center gap-4">
              <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-white/15">
                <MessageCircle size={28} />
              </div>

              <div>
                <h2 className="text-2xl font-bold">
                  Your Virtual University Assistant
                </h2>

                <p className="mt-1 text-pink-100">
                  Ask questions and get university-related information.
                </p>
              </div>
            </div>

            <p className="max-w-4xl leading-7 text-pink-50">
              The SBBWU AI Assistant helps students find information
              about admissions, departments, fees, examinations,
              hostels, scholarships, and other university-related topics.
            </p>
          </div>
        </section>

        {/* How To Use */}
        <section className="mb-12">
          <div className="mb-6">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
              How to Use the Chatbot
            </h2>

            <p className="mt-2 text-gray-500 dark:text-gray-400">
              Follow these simple steps to start using the AI Assistant.
            </p>
          </div>

          <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
            <GuideStep
              number="01"
              icon={<MessageCircle size={24} />}
              title="Start a Conversation"
              description="Open the SBBWU AI Assistant and go to the chat screen."
            />

            <GuideStep
              number="02"
              icon={<Search size={24} />}
              title="Ask Your Question"
              description='Type your question in the "Ask anything about SBBWU..." box.'
            />

            <GuideStep
              number="03"
              icon={<Send size={24} />}
              title="Send Your Question"
              description="Click the send button to submit your question."
            />

            <GuideStep
              number="04"
              icon={<CheckCircle2 size={24} />}
              title="Read the Answer"
              description="The AI Assistant processes your question and displays a relevant response."
            />
          </div>
        </section>

        {/* Example */}
        <section className="mb-12">
          <div className="rounded-3xl border-2 border-pink-200 bg-white p-7 shadow-sm transition-all duration-300 hover:border-[#A10D5A] dark:border-pink-900 dark:bg-gray-900 dark:hover:border-pink-600">

            <div className="mb-6 flex items-center gap-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-pink-100 dark:bg-pink-950/40">
                <HelpCircle
                  size={24}
                  className="text-[#A10D5A] dark:text-pink-300"
                />
              </div>

              <div>
                <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                  Example Question
                </h2>

                <p className="text-sm text-gray-500 dark:text-gray-400">
                  You can ask questions naturally.
                </p>
              </div>
            </div>

            <div className="space-y-4">

              {/* User */}
              <div className="rounded-2xl bg-gray-50 p-5 dark:bg-gray-800">
                <p className="mb-2 text-xs font-semibold uppercase text-gray-400">
                  You
                </p>

                <p className="font-medium text-gray-800 dark:text-gray-200">
                  How do I apply for admission at SBBWU?
                </p>
              </div>

              {/* AI */}
              <div className="rounded-2xl border border-pink-200 bg-pink-50 p-5 dark:border-pink-900 dark:bg-pink-950/30">
                <p className="mb-2 text-xs font-semibold uppercase text-[#A10D5A] dark:text-pink-300">
                  AI Assistant
                </p>

                <p className="leading-7 text-gray-700 dark:text-gray-300">
                  The AI Assistant will provide relevant information
                  about the admission process based on the university
                  information available to the system.
                </p>
              </div>

            </div>
          </div>
        </section>

        {/* Features */}
        <section className="mb-12">
          <div className="mb-6">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
              Useful Features
            </h2>

            <p className="mt-2 text-gray-500 dark:text-gray-400">
              Use these features to make your chatbot experience easier.
            </p>
          </div>

          <div className="grid grid-cols-1 gap-5 md:grid-cols-2">

            <FeatureCard
              icon={<Plus size={22} />}
              title="New Conversation"
              description="Start a fresh conversation when you want to discuss a new topic."
            />

            <FeatureCard
              icon={<History size={22} />}
              title="Chat History"
              description="View previous conversations and review questions and answers."
            />

            <FeatureCard
              icon={<HelpCircle size={22} />}
              title="Suggested Questions"
              description="Use suggested questions on the home screen if you do not know what to ask."
            />

            <FeatureCard
              icon={<Moon size={22} />}
              title="Light & Dark Mode"
              description="Switch between light and dark mode using the theme button in the header."
            />

          </div>
        </section>

        {/* How It Works */}
        <section className="mb-12">

          <div className="mb-6">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
              How Does the AI Assistant Work?
            </h2>

            <p className="mt-2 text-gray-500 dark:text-gray-400">
              A simple overview of what happens when you ask a question.
            </p>
          </div>

          <div className="rounded-3xl border-2 border-pink-200 bg-white p-7 shadow-sm transition-all duration-300 hover:border-[#A10D5A] dark:border-pink-900 dark:bg-gray-900 dark:hover:border-pink-600">

            <div className="grid grid-cols-1 gap-6 md:grid-cols-4">

              <WorkStep
                number="1"
                title="Ask"
                text="You enter your question."
              />

              <WorkStep
                number="2"
                title="Process"
                text="The system processes your question."
              />

              <WorkStep
                number="3"
                title="Find Information"
                text="Relevant university information is retrieved."
              />

              <WorkStep
                number="4"
                title="Answer"
                text="The AI generates a helpful response."
              />

            </div>
          </div>
        </section>

        {/* Tips */}
        <section className="mb-12">

          <div className="rounded-3xl border-2 border-pink-200 bg-white p-7 shadow-sm transition-all duration-300 hover:border-[#A10D5A] dark:border-pink-900 dark:bg-gray-900 dark:hover:border-pink-600">

            <h2 className="mb-6 text-2xl font-bold text-gray-900 dark:text-white">
              Tips for Better Answers
            </h2>

            <div className="space-y-4">
              <Tip text="Ask clear and specific questions." />

              <Tip text="Mention the topic you need help with, such as admissions, fees, examinations, or hostels." />

              <Tip text="You can ask follow-up questions to continue the conversation." />

              <Tip text="Use suggested questions if you are unsure what to ask." />
            </div>

          </div>
        </section>

        {/* Important Notice */}
        <section className="mb-10">

          <div className="flex gap-4 rounded-3xl border-2 border-amber-200 bg-amber-50 p-6 dark:border-amber-900 dark:bg-amber-950/20">

            <AlertCircle
              size={24}
              className="shrink-0 text-amber-600 dark:text-amber-400"
            />

            <div>
              <h2 className="font-bold text-gray-900 dark:text-white">
                Important Information
              </h2>

              <p className="mt-2 leading-7 text-gray-600 dark:text-gray-300">
                The AI Assistant may occasionally provide incorrect or
                outdated information. For important matters such as
                admission deadlines, examination dates, fees, merit lists,
                and official policies, please verify the information
                through official university sources.
              </p>
            </div>

          </div>
        </section>

        {/* Contact */}
        <div className="py-6 text-center">

          <p className="text-sm text-gray-500 dark:text-gray-400">
            Need more help?
          </p>

          <Link
            href="/contact"
            className="mt-2 inline-flex items-center gap-2 font-semibold text-[#A10D5A] transition-all hover:gap-3 dark:text-pink-300"
          >
            Contact Us
            <span>→</span>
          </Link>

        </div>

      </div>
    </div>
  );
}


/* ---------------- Guide Step ---------------- */

function GuideStep({
  number,
  icon,
  title,
  description,
}) {
  return (
    <div className="rounded-3xl border-2 border-pink-200 bg-white p-6 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:border-[#A10D5A] hover:shadow-lg dark:border-pink-900 dark:bg-gray-900 dark:hover:border-pink-600">

      <div className="flex items-start gap-5">

        <div className="relative shrink-0">

          <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-pink-100 text-[#A10D5A] dark:bg-pink-950/40 dark:text-pink-300">
            {icon}
          </div>

          <span className="absolute -right-2 -top-2 flex h-7 w-7 items-center justify-center rounded-full bg-[#A10D5A] text-xs font-bold text-white">
            {number}
          </span>

        </div>

        <div>
          <h3 className="text-lg font-bold text-gray-900 dark:text-white">
            {title}
          </h3>

          <p className="mt-2 leading-6 text-gray-500 dark:text-gray-400">
            {description}
          </p>
        </div>

      </div>
    </div>
  );
}


/* ---------------- Feature Card ---------------- */

function FeatureCard({
  icon,
  title,
  description,
}) {
  return (
    <div className="flex gap-4 rounded-2xl border-2 border-pink-200 bg-white p-6 shadow-sm transition-all duration-300 hover:border-[#A10D5A] hover:shadow-lg dark:border-pink-900 dark:bg-gray-900 dark:hover:border-pink-600">

      <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-pink-100 text-[#A10D5A] dark:bg-pink-950/40 dark:text-pink-300">
        {icon}
      </div>

      <div>
        <h3 className="font-bold text-gray-900 dark:text-white">
          {title}
        </h3>

        <p className="mt-1 text-sm leading-6 text-gray-500 dark:text-gray-400">
          {description}
        </p>
      </div>

    </div>
  );
}


/* ---------------- Work Step ---------------- */

function WorkStep({
  number,
  title,
  text,
}) {
  return (
    <div className="text-center">

      <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-[#A10D5A] text-lg font-bold text-white">
        {number}
      </div>

      <h3 className="mt-4 font-bold text-gray-900 dark:text-white">
        {title}
      </h3>

      <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
        {text}
      </p>

    </div>
  );
}


/* ---------------- Tip ---------------- */

function Tip({ text }) {
  return (
    <div className="flex items-start gap-3">

      <CheckCircle2
        size={20}
        className="mt-0.5 shrink-0 text-[#A10D5A] dark:text-pink-300"
      />

      <p className="text-gray-600 dark:text-gray-300">
        {text}
      </p>

    </div>
  );
}