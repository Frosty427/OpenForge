"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Search, ArrowRight, BookOpen, Rocket, HelpCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { GlassCard } from "@/components/ui/card";
import {
  Accordion,
  AccordionItem,
  AccordionTrigger,
  AccordionContent,
} from "@/components/ui/accordion";
import Link from "next/link";

const fadeUp = {
  hidden: { opacity: 0, y: 20 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.1, duration: 0.5, ease: [0.25, 0.46, 0.45, 0.94] },
  }),
};

const stagger = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.08 } },
};

const faqs = [
  {
    question: "What is OpenForge?",
    answer:
      "OpenForge is an advanced AI orchestration system that can execute commands, automate workflows, and use local and remote AI models to operate your computer through natural language. It bridges the gap between AI capabilities and real-world computing tasks, enabling you to delegate complex operations to AI with full transparency and control.",
  },
  {
    question: "How is it different from other AI tools?",
    answer:
      "Unlike simple chat interfaces, OpenForge acts as a real computer operator. It can navigate your filesystem, execute terminal commands, manage deployments, orchestrate multi-step workflows, and coordinate multiple AI providers simultaneously. It's not just a chatbot — it's a full orchestration platform with safety controls, isolated environments, and intelligent provider routing.",
  },
  {
    question: "Does it support local AI models?",
    answer:
      "Yes! OpenForge supports running models locally through Ollama, llama.cpp, and other local inference frameworks. This means you can use AI completely offline, keep your data private, and avoid API costs. Simply install Ollama, pull a model, and configure OpenForge to use it as a provider.",
  },
  {
    question: "Is it open source?",
    answer:
      "Yes, OpenForge is fully open source under the MIT license. You can view, modify, and contribute to every line of code on GitHub. We believe that tools this powerful should be transparent, auditable, and community-driven. There are no hidden features behind paywalls — the entire platform is available to everyone.",
  },
  {
    question: "How do I install it?",
    answer:
      "Simply run `npm install -g openforge` to install globally. After installation, run `openforge doctor` to verify your system meets the requirements, then configure your preferred AI provider with `openforge config set-provider`. You can be up and running in under a minute. See our Getting Started guide for detailed instructions.",
  },
  {
    question: "Which AI providers are supported?",
    answer:
      "OpenForge supports OpenAI (GPT-4o, o3-mini), Anthropic (Claude 4, Claude 3.5), Groq (Llama 3, Mixtral), OpenRouter (100+ models), DeepSeek (V3, R1), Z.ai, and any local model through Ollama. The intelligent gateway automatically routes requests to the best available provider based on task complexity, cost, and availability.",
  },
  {
    question: "Can I create isolated environments?",
    answer:
      "Yes, through the Subspaces feature you can create fully isolated environments with their own filesystem sandbox, environment variables, process trees, and provider configurations. This is perfect for running untrusted code, parallel tasks, or multi-agent workflows without interfering with your main workspace.",
  },
  {
    question: "Is there a free tier?",
    answer:
      "OpenForge is free and open source — there are no tiers or plans. You only pay for the AI provider API calls you make (OpenAI, Anthropic, etc.), or use local models for completely free inference. The platform itself, including all features like Subspaces, gateway routing, and the CLI, is completely free.",
  },
  {
    question: "How do I report bugs?",
    answer:
      "Use our GitHub Issues page at github.com/openforge/openforge/issues to report bugs, request features, or start discussions. You can also reach out through our Discord community for real-time help. When reporting bugs, please include your OS, Node.js version, OpenForge version, and steps to reproduce the issue.",
  },
  {
    question: "Can I contribute?",
    answer:
      "Absolutely! We welcome contributions of all kinds — code, documentation, bug reports, feature suggestions, and community support. Check out our Contributing Guide on GitHub for guidelines on submitting pull requests, coding standards, and the development setup process. We especially welcome help with new provider integrations and plugin development.",
  },
  {
    question: "What operating systems are supported?",
    answer:
      "OpenForge runs on macOS, Linux, and Windows. It requires Node.js 18 or higher. On Windows, we recommend using Windows Terminal or PowerShell. Some features like local model execution may require additional system dependencies which are documented in our setup guides.",
  },
  {
    question: "How does the gateway routing work?",
    answer:
      "The gateway sits between you and all configured AI providers. It uses a weighted scoring algorithm that considers task complexity, context length requirements, provider latency, cost, and availability. If a provider goes down, the gateway automatically fails over to the next best option. You can configure routing strategies like cost-optimized, performance-first, or balanced.",
  },
];

export default function FAQPage() {
  const [searchQuery, setSearchQuery] = useState("");

  const filteredFaqs = faqs.filter(
    (faq) =>
      searchQuery === "" ||
      faq.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
      faq.answer.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="relative min-h-screen">
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <motion.div
          animate={{ scale: [1, 1.2, 1], opacity: [0.1, 0.2, 0.1] }}
          transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }}
          className="absolute -top-40 -right-40 w-[500px] h-[500px] rounded-full bg-neon-purple/15 blur-[120px]"
        />
        <motion.div
          animate={{ scale: [1.2, 1, 1.2], opacity: [0.08, 0.15, 0.08] }}
          transition={{ duration: 12, repeat: Infinity, ease: "easeInOut" }}
          className="absolute bottom-0 -left-40 w-[400px] h-[400px] rounded-full bg-neon-blue/15 blur-[100px]"
        />
      </div>

      <div className="relative z-10 max-w-4xl mx-auto px-6 pt-28 pb-20">
        <motion.div
          initial="hidden"
          animate="visible"
          variants={stagger}
          className="text-center mb-12"
        >
          <motion.div
            variants={fadeUp}
            custom={0}
            className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full glass text-sm text-white/60 border border-white/10 mb-6"
          >
            <HelpCircle className="h-4 w-4 text-neon-blue" />
            Help Center
          </motion.div>

          <motion.h1
            variants={fadeUp}
            custom={1}
            className="text-4xl sm:text-5xl font-bold mb-4"
          >
            <span className="gradient-text">Frequently Asked Questions</span>
          </motion.h1>

          <motion.p
            variants={fadeUp}
            custom={2}
            className="text-lg text-white/40 max-w-xl mx-auto"
          >
            Everything you need to know about OpenForge. Can't find an answer?
            Reach out on Discord.
          </motion.p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="max-w-2xl mx-auto mb-12"
        >
          <div className="relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-white/30" />
            <Input
              placeholder="Search questions..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-11 h-12 bg-white/5 border-white/10 text-white placeholder:text-white/30 rounded-xl"
            />
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
        >
          <GlassCard glow className="mb-12">
            <Accordion type="single" collapsible className="w-full">
              {filteredFaqs.map((faq, index) => (
                <AccordionItem
                  key={index}
                  value={`item-${index}`}
                  className="border-white/10"
                >
                  <AccordionTrigger className="text-left text-white hover:text-neon-blue py-5 text-base font-medium">
                    {faq.question}
                  </AccordionTrigger>
                  <AccordionContent className="text-white/50 leading-relaxed text-sm pb-5">
                    {faq.answer}
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>

            {filteredFaqs.length === 0 && (
              <div className="text-center py-12">
                <HelpCircle className="h-12 w-12 text-white/20 mx-auto mb-4" />
                <p className="text-white/40">
                  No questions found matching your search.
                </p>
                <button
                  onClick={() => setSearchQuery("")}
                  className="text-neon-blue text-sm mt-2 hover:underline"
                >
                  Clear search
                </button>
              </div>
            )}
          </GlassCard>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="grid grid-cols-1 md:grid-cols-2 gap-6"
        >
          <GlassCard className="group hover:border-white/20 transition-all duration-300">
            <div className="flex items-start gap-4">
              <div className="p-3 rounded-xl bg-neon-blue/10 border border-neon-blue/20">
                <BookOpen className="h-5 w-5 text-neon-blue" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-white mb-2">
                  Read the Docs
                </h3>
                <p className="text-sm text-white/40 mb-4">
                  Comprehensive guides, API references, and tutorials to help
                  you get the most out of OpenForge.
                </p>
                <Button variant="glass" size="sm" asChild>
                  <Link href="/docs" className="gap-2">
                    Browse Docs <ArrowRight className="h-3.5 w-3.5" />
                  </Link>
                </Button>
              </div>
            </div>
          </GlassCard>

          <GlassCard className="group hover:border-white/20 transition-all duration-300">
            <div className="flex items-start gap-4">
              <div className="p-3 rounded-xl bg-neon-purple/10 border border-neon-purple/20">
                <Rocket className="h-5 w-5 text-neon-purple" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-white mb-2">
                  Get Started
                </h3>
                <p className="text-sm text-white/40 mb-4">
                  Install OpenForge in under a minute and run your first
                  AI-powered command today.
                </p>
                <Button variant="glow" size="sm" asChild>
                  <Link href="/docs/getting-started" className="gap-2">
                    Quick Start <ArrowRight className="h-3.5 w-3.5" />
                  </Link>
                </Button>
              </div>
            </div>
          </GlassCard>
        </motion.div>
      </div>
    </div>
  );
}
