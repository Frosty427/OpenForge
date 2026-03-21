"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import {
  BookOpen,
  Github,
  MessageCircle,
  Send,
  CheckCircle,
  AlertCircle,
  ArrowRight,
  HelpCircle,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { GlassCard } from "@/components/ui/card";
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

const supportChannels = [
  {
    icon: BookOpen,
    title: "Documentation",
    description:
      "Browse comprehensive guides, API references, and tutorials to find answers quickly.",
    href: "/docs",
    external: false,
    gradient: "from-neon-blue to-cyan-400",
  },
  {
    icon: Github,
    title: "GitHub Issues",
    description:
      "Report bugs, request features, or start discussions with the community and maintainers.",
    href: "https://github.com/openforge/openforge/issues",
    external: true,
    gradient: "from-white/80 to-white/60",
  },
  {
    icon: MessageCircle,
    title: "Community Discord",
    description:
      "Join our Discord server for real-time help, discussions, and to connect with other users.",
    href: "https://discord.gg/openforge",
    external: true,
    gradient: "from-neon-purple to-pink-400",
  },
];

const faqLinks = [
  {
    question: "How do I install OpenForge?",
    href: "/faq",
  },
  {
    question: "Which AI providers are supported?",
    href: "/faq",
  },
  {
    question: "Can I run local AI models?",
    href: "/faq",
  },
  {
    question: "Is OpenForge free to use?",
    href: "/faq",
  },
];

export default function SupportPage() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    subject: "",
    message: "",
  });
  const [submitState, setSubmitState] = useState<
    "idle" | "loading" | "success" | "error"
  >("idle");
  const [errorMessage, setErrorMessage] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitState("loading");

    try {
      const res = await fetch("/api/support/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error || "Failed to send message");
      }

      setSubmitState("success");
      setFormData({ name: "", email: "", subject: "", message: "" });
    } catch (err) {
      setSubmitState("error");
      setErrorMessage(
        err instanceof Error ? err.message : "Something went wrong"
      );
    }
  };

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

      <div className="relative z-10 max-w-5xl mx-auto px-6 pt-28 pb-20">
        <motion.div
          initial="hidden"
          animate="visible"
          variants={stagger}
          className="text-center mb-14"
        >
          <motion.h1
            variants={fadeUp}
            custom={0}
            className="text-4xl sm:text-5xl font-bold mb-4"
          >
            <span className="gradient-text">Support</span>
          </motion.h1>
          <motion.p
            variants={fadeUp}
            custom={1}
            className="text-lg text-white/40 max-w-xl mx-auto"
          >
            We're here to help. Choose a channel below or send us a message.
          </motion.p>
        </motion.div>

        <motion.div
          initial="hidden"
          animate="visible"
          variants={stagger}
          className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-16"
        >
          {supportChannels.map((channel, i) => (
            <motion.div key={channel.title} variants={fadeUp} custom={i + 2}>
              <a
                href={channel.href}
                target={channel.external ? "_blank" : undefined}
                rel={channel.external ? "noopener noreferrer" : undefined}
              >
                <GlassCard className="h-full group hover:border-white/20 transition-all duration-300 cursor-pointer">
                  <div
                    className={`inline-flex p-3 rounded-xl bg-gradient-to-br ${channel.gradient} bg-opacity-10 mb-4`}
                    style={{
                      background: `linear-gradient(135deg, ${
                        channel.gradient.includes("neon-blue")
                          ? "rgba(0,191,255,0.1)"
                          : channel.gradient.includes("neon-purple")
                          ? "rgba(139,92,246,0.1)"
                          : "rgba(255,255,255,0.08)"
                      }, transparent)`,
                    }}
                  >
                    <channel.icon
                      className={`h-6 w-6 ${
                        channel.gradient.includes("neon-blue")
                          ? "text-neon-blue"
                          : channel.gradient.includes("neon-purple")
                          ? "text-neon-purple"
                          : "text-white/70"
                      }`}
                    />
                  </div>
                  <h3 className="text-lg font-semibold text-white mb-2 group-hover:text-neon-blue transition-colors">
                    {channel.title}
                  </h3>
                  <p className="text-sm text-white/40 leading-relaxed mb-4">
                    {channel.description}
                  </p>
                  <span className="inline-flex items-center gap-1.5 text-sm text-neon-blue group-hover:gap-2.5 transition-all">
                    {channel.external ? "Visit" : "Browse"}
                    <ArrowRight className="h-3.5 w-3.5" />
                  </span>
                </GlassCard>
              </a>
            </motion.div>
          ))}
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="max-w-2xl mx-auto mb-16"
        >
          <GlassCard glow>
            <h2 className="text-2xl font-bold text-white mb-1">
              Contact Us
            </h2>
            <p className="text-sm text-white/40 mb-6">
              Fill out the form below and we'll get back to you as soon as
              possible.
            </p>

            {submitState === "success" ? (
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="text-center py-10"
              >
                <div className="inline-flex p-4 rounded-full bg-green-500/10 border border-green-500/20 mb-4">
                  <CheckCircle className="h-8 w-8 text-green-400" />
                </div>
                <h3 className="text-xl font-semibold text-white mb-2">
                  Message Sent
                </h3>
                <p className="text-white/40 text-sm mb-6">
                  Thank you for reaching out. We'll respond to your inquiry
                  shortly.
                </p>
                <Button
                  variant="glass"
                  onClick={() => setSubmitState("idle")}
                >
                  Send Another Message
                </Button>
              </motion.div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm text-white/60 mb-1.5">
                      Name
                    </label>
                    <Input
                      placeholder="Your name"
                      value={formData.name}
                      onChange={(e) =>
                        setFormData((f) => ({ ...f, name: e.target.value }))
                      }
                      required
                      className="bg-white/5 border-white/10 text-white placeholder:text-white/30"
                    />
                  </div>
                  <div>
                    <label className="block text-sm text-white/60 mb-1.5">
                      Email
                    </label>
                    <Input
                      type="email"
                      placeholder="you@example.com"
                      value={formData.email}
                      onChange={(e) =>
                        setFormData((f) => ({ ...f, email: e.target.value }))
                      }
                      required
                      className="bg-white/5 border-white/10 text-white placeholder:text-white/30"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm text-white/60 mb-1.5">
                    Subject
                  </label>
                  <Input
                    placeholder="How can we help?"
                    value={formData.subject}
                    onChange={(e) =>
                      setFormData((f) => ({ ...f, subject: e.target.value }))
                    }
                    required
                    className="bg-white/5 border-white/10 text-white placeholder:text-white/30"
                  />
                </div>
                <div>
                  <label className="block text-sm text-white/60 mb-1.5">
                    Message
                  </label>
                  <Textarea
                    placeholder="Describe your issue or question in detail..."
                    rows={5}
                    value={formData.message}
                    onChange={(e) =>
                      setFormData((f) => ({ ...f, message: e.target.value }))
                    }
                    required
                    className="bg-white/5 border-white/10 text-white placeholder:text-white/30 resize-none"
                  />
                </div>

                {submitState === "error" && (
                  <div className="flex items-center gap-2 text-sm text-red-400 bg-red-500/10 border border-red-500/20 rounded-lg px-4 py-3">
                    <AlertCircle className="h-4 w-4 shrink-0" />
                    {errorMessage}
                  </div>
                )}

                <Button
                  type="submit"
                  variant="glow"
                  size="lg"
                  disabled={submitState === "loading"}
                  className="w-full gap-2"
                >
                  {submitState === "loading" ? (
                    "Sending..."
                  ) : (
                    <>
                      Send Message <Send className="h-4 w-4" />
                    </>
                  )}
                </Button>
              </form>
            )}
          </GlassCard>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.7 }}
        >
          <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
            <HelpCircle className="h-5 w-5 text-neon-blue" />
            Quick Answers
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {faqLinks.map((link, i) => (
              <Link key={i} href={link.href}>
                <GlassCard className="group py-4 px-5 hover:border-white/20 transition-all duration-300 cursor-pointer">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-white/60 group-hover:text-white transition-colors">
                      {link.question}
                    </span>
                    <ArrowRight className="h-4 w-4 text-white/20 group-hover:text-neon-blue transition-all" />
                  </div>
                </GlassCard>
              </Link>
            ))}
          </div>
        </motion.div>
      </div>
    </div>
  );
}
