"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import {
  Brain,
  Terminal,
  Network,
  Layers,
  Cpu,
  Code,
  Zap,
  CheckCircle,
  ArrowRight,
  Copy,
  Check,
  Sparkles,
  Shield,
  Rocket,
  Globe,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { GlassCard } from "@/components/ui/card";
import Link from "next/link";
import { cn } from "@/lib/utils";

const fadeUp = {
  hidden: { opacity: 0, y: 30 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.1, duration: 0.6, ease: [0.25, 0.46, 0.45, 0.94] },
  }),
};

const stagger = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.08 } },
};

const features = [
  {
    icon: Brain,
    title: "Multi-AI Support",
    description: "Connect to OpenAI, Anthropic, Groq, and more",
    gradient: "from-blue-500 to-cyan-500",
  },
  {
    icon: Terminal,
    title: "Command System",
    description: "Execute powerful commands through natural language",
    gradient: "from-cyan-500 to-teal-500",
  },
  {
    icon: Network,
    title: "Gateway Architecture",
    description: "Intelligent routing between AI providers",
    gradient: "from-purple-500 to-pink-500",
  },
  {
    icon: Layers,
    title: "Subspace Environments",
    description: "Isolated environments for parallel tasks",
    gradient: "from-orange-500 to-red-500",
  },
  {
    icon: Cpu,
    title: "Local AI Execution",
    description: "Run models locally without cloud dependency",
    gradient: "from-green-500 to-emerald-500",
  },
  {
    icon: Code,
    title: "TypeScript Native",
    description: "Built with TypeScript for type-safe development",
    gradient: "from-blue-600 to-indigo-500",
  },
];

const steps = [
  { icon: Terminal, label: "Command", description: "User input" },
  { icon: Brain, label: "AI", description: "Processing" },
  { icon: Zap, label: "Execution", description: "Action" },
  { icon: CheckCircle, label: "Result", description: "Output" },
];

const useCases = [
  {
    icon: Sparkles,
    title: "AI Agents",
    description:
      "Build autonomous agents that can browse, click, type, and interact with any application on your computer.",
  },
  {
    icon: Rocket,
    title: "Automation",
    description:
      "Automate repetitive workflows across any application. From data entry to complex multi-step processes.",
  },
  {
    icon: Cpu,
    title: "Local AI Systems",
    description:
      "Run AI models locally for privacy-first automation. No data leaves your machine.",
  },
  {
    icon: Code,
    title: "Developer Tools",
    description:
      "Integrate computer-use capabilities into your development workflow and CI/CD pipelines.",
  },
];

const providers = [
  { name: "OpenAI", icon: Brain },
  { name: "Anthropic", icon: Shield },
  { name: "Groq", icon: Zap },
  { name: "OpenRouter", icon: Network },
  { name: "DeepSeek", icon: Globe },
  { name: "Z.ai", icon: Sparkles },
  { name: "Local Models", icon: Cpu },
];

function TerminalDisplay({ children }: { children: React.ReactNode }) {
  return (
    <div className="glass rounded-xl overflow-hidden">
      <div className="flex items-center gap-2 px-4 py-3 border-b border-white/10">
        <div className="w-3 h-3 rounded-full bg-red-500/80" />
        <div className="w-3 h-3 rounded-full bg-yellow-500/80" />
        <div className="w-3 h-3 rounded-full bg-green-500/80" />
        <span className="ml-2 text-xs text-white/40 font-mono">terminal</span>
      </div>
      <div className="p-5 font-mono text-sm">{children}</div>
    </div>
  );
}

function CopyTerminal() {
  const [copied, setCopied] = useState(false);
  const commands = [
    "npm install -g openforge",
    "openforge init",
    'openforge run "your command"',
  ];

  const copyAll = () => {
    navigator.clipboard.writeText(commands.join("\n"));
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="relative">
      <TerminalDisplay>
        <div className="space-y-3">
          {commands.map((cmd, i) => (
            <motion.div
              key={cmd}
              initial={{ opacity: 0, x: -10 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.15 }}
              viewport={{ once: true }}
              className="flex items-center gap-3"
            >
              <span className="text-neon-blue">❯</span>
              <span className="text-white/90">{cmd}</span>
            </motion.div>
          ))}
        </div>
      </TerminalDisplay>
      <Button
        variant="glass"
        size="icon"
        onClick={copyAll}
        className="absolute top-3 right-3 h-8 w-8"
      >
        {copied ? (
          <Check className="h-4 w-4 text-green-400" />
        ) : (
          <Copy className="h-4 w-4" />
        )}
      </Button>
    </div>
  );
}

function BackgroundOrbs() {
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      <motion.div
        animate={{ scale: [1, 1.2, 1], opacity: [0.15, 0.25, 0.15] }}
        transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
        className="absolute -top-40 -left-40 w-[600px] h-[600px] rounded-full bg-neon-blue/20 blur-[120px]"
      />
      <motion.div
        animate={{ scale: [1.2, 1, 1.2], opacity: [0.1, 0.2, 0.1] }}
        transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }}
        className="absolute top-1/3 -right-40 w-[500px] h-[500px] rounded-full bg-neon-purple/20 blur-[120px]"
      />
      <motion.div
        animate={{ scale: [1, 1.3, 1], opacity: [0.1, 0.18, 0.1] }}
        transition={{ duration: 12, repeat: Infinity, ease: "easeInOut" }}
        className="absolute bottom-0 left-1/3 w-[400px] h-[400px] rounded-full bg-neon-cyan/15 blur-[100px]"
      />
    </div>
  );
}

function GridBackground() {
  return (
    <div className="absolute inset-0 pointer-events-none">
      <div
        className="absolute inset-0 opacity-[0.04]"
        style={{
          backgroundImage:
            "linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)",
          backgroundSize: "60px 60px",
        }}
      />
    </div>
  );
}

function FloatingParticles() {
  const particles = Array.from({ length: 30 }, (_, i) => ({
    id: i,
    x: Math.random() * 100,
    y: Math.random() * 100,
    size: Math.random() * 3 + 1,
    duration: Math.random() * 10 + 10,
    delay: Math.random() * 5,
  }));

  return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden">
      {particles.map((p) => (
        <motion.div
          key={p.id}
          className="absolute rounded-full bg-neon-blue/30"
          style={{
            left: `${p.x}%`,
            top: `${p.y}%`,
            width: p.size,
            height: p.size,
          }}
          animate={{
            y: [0, -80, 0],
            opacity: [0, 0.6, 0],
          }}
          transition={{
            duration: p.duration,
            repeat: Infinity,
            delay: p.delay,
            ease: "easeInOut",
          }}
        />
      ))}
    </div>
  );
}

export default function HomePage() {
  return (
    <div className="relative min-h-screen">
      <BackgroundOrbs />
      <GridBackground />
      <FloatingParticles />

      {/* ========== HERO ========== */}
      <section className="relative z-10 flex flex-col items-center justify-center min-h-screen px-6 pt-20">
        <motion.div
          initial="hidden"
          animate="visible"
          variants={stagger}
          className="max-w-5xl mx-auto text-center"
        >
          <motion.div variants={fadeUp} custom={0}>
            <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full glass text-sm text-white/70 mb-8">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-neon-blue opacity-75" />
                <span className="relative inline-flex rounded-full h-2 w-2 bg-neon-blue" />
              </span>
              Open Source &middot; TypeScript &middot; Local AI
            </span>
          </motion.div>

          <motion.h1
            variants={fadeUp}
            custom={1}
            className="text-5xl sm:text-6xl md:text-7xl lg:text-8xl font-bold tracking-tight leading-[1.05] mb-6"
          >
            <span className="gradient-text">The AI That Can</span>
            <br />
            <span className="gradient-text">Use Computer</span>
          </motion.h1>

          <motion.p
            variants={fadeUp}
            custom={2}
            className="text-lg sm:text-xl text-white/50 max-w-2xl mx-auto mb-10 leading-relaxed"
          >
            The open-source AI orchestration platform that lets artificial
            intelligence control your computer. Automate anything through
            natural language.
          </motion.p>

          <motion.div
            variants={fadeUp}
            custom={3}
            className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-14"
          >
            <Button variant="glow" size="xl" asChild>
              <Link href="/docs" className="gap-2">
                Get Started <ArrowRight className="h-5 w-5" />
              </Link>
            </Button>
            <Button variant="glass" size="xl" asChild>
              <Link href="https://www.npmjs.com/package/openforge" className="gap-2">
                Install via NPM <Terminal className="h-5 w-5" />
              </Link>
            </Button>
          </motion.div>

          <motion.div variants={fadeUp} custom={4} className="max-w-lg mx-auto">
            <TerminalDisplay>
              <div className="flex items-center gap-3">
                <span className="text-neon-blue">❯</span>
                <span className="text-white/90 typing-effect">
                  npm install -g openforge
                </span>
                <span className="inline-block w-2 h-5 bg-neon-blue/70 animate-terminal-blink" />
              </div>
            </TerminalDisplay>
          </motion.div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.5, duration: 1 }}
          className="absolute bottom-10"
        >
          <motion.div
            animate={{ y: [0, 8, 0] }}
            transition={{ duration: 2, repeat: Infinity }}
            className="w-6 h-10 rounded-full border-2 border-white/20 flex items-start justify-center p-1.5"
          >
            <div className="w-1.5 h-3 rounded-full bg-neon-blue/60" />
          </motion.div>
        </motion.div>
      </section>

      {/* ========== FEATURES ========== */}
      <section className="relative z-10 py-32 px-6">
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
          variants={stagger}
          className="max-w-6xl mx-auto"
        >
          <motion.div variants={fadeUp} custom={0} className="text-center mb-16">
            <span className="text-neon-blue text-sm font-semibold tracking-wider uppercase">
              Features
            </span>
            <h2 className="text-4xl sm:text-5xl font-bold mt-3 mb-4">
              Everything you need
            </h2>
            <p className="text-white/40 text-lg max-w-xl mx-auto">
              A complete toolkit for AI-powered computer automation
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {features.map((f, i) => (
              <motion.div
                key={f.title}
                variants={fadeUp}
                custom={i + 1}
              >
                <GlassCard className="h-full group hover:border-white/20 transition-all duration-300 cursor-default">
                  <div
                    className={cn(
                      "w-11 h-11 rounded-lg flex items-center justify-center mb-4 bg-gradient-to-br",
                      f.gradient,
                      "opacity-80 group-hover:opacity-100 transition-opacity"
                    )}
                  >
                    <f.icon className="h-5 w-5 text-white" />
                  </div>
                  <h3 className="text-lg font-semibold text-white mb-2">
                    {f.title}
                  </h3>
                  <p className="text-sm text-white/40 leading-relaxed">
                    {f.description}
                  </p>
                </GlassCard>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </section>

      {/* ========== HOW IT WORKS ========== */}
      <section className="relative z-10 py-32 px-6">
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
          variants={stagger}
          className="max-w-5xl mx-auto"
        >
          <motion.div variants={fadeUp} custom={0} className="text-center mb-16">
            <span className="text-neon-blue text-sm font-semibold tracking-wider uppercase">
              How It Works
            </span>
            <h2 className="text-4xl sm:text-5xl font-bold mt-3 mb-4">
              Simple. Powerful. Fast.
            </h2>
            <p className="text-white/40 text-lg max-w-xl mx-auto">
              From natural language to computer action in milliseconds
            </p>
          </motion.div>

          <div className="flex flex-col md:flex-row items-center justify-center gap-4 md:gap-0">
            {steps.map((step, i) => (
              <motion.div
                key={step.label}
                variants={fadeUp}
                custom={i + 1}
                className="flex items-center"
              >
                <GlassCard className="text-center px-8 py-6 w-44 group hover:border-neon-blue/30 transition-all duration-300">
                  <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-neon-blue/20 to-neon-purple/20 flex items-center justify-center mx-auto mb-3 group-hover:from-neon-blue/30 group-hover:to-neon-purple/30 transition-all">
                    <step.icon className="h-6 w-6 text-neon-blue" />
                  </div>
                  <p className="font-semibold text-white mb-1">{step.label}</p>
                  <p className="text-xs text-white/30">{step.description}</p>
                </GlassCard>
                {i < steps.length - 1 && (
                  <div className="hidden md:flex items-center px-2">
                    <ArrowRight className="h-5 w-5 text-neon-blue/30" />
                  </div>
                )}
              </motion.div>
            ))}
          </div>
        </motion.div>
      </section>

      {/* ========== USE CASES ========== */}
      <section className="relative z-10 py-32 px-6">
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
          variants={stagger}
          className="max-w-6xl mx-auto"
        >
          <motion.div variants={fadeUp} custom={0} className="text-center mb-16">
            <span className="text-neon-blue text-sm font-semibold tracking-wider uppercase">
              Use Cases
            </span>
            <h2 className="text-4xl sm:text-5xl font-bold mt-3 mb-4">
              Endless possibilities
            </h2>
            <p className="text-white/40 text-lg max-w-xl mx-auto">
              From autonomous agents to developer workflows
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {useCases.map((uc, i) => (
              <motion.div key={uc.title} variants={fadeUp} custom={i + 1}>
                <GlassCard className="h-full group hover:border-white/20 transition-all duration-300">
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-neon-blue/20 to-neon-purple/20 flex items-center justify-center shrink-0 group-hover:from-neon-blue/30 group-hover:to-neon-purple/30 transition-all">
                      <uc.icon className="h-6 w-6 text-neon-blue" />
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-white mb-1.5">
                        {uc.title}
                      </h3>
                      <p className="text-sm text-white/40 leading-relaxed">
                        {uc.description}
                      </p>
                    </div>
                  </div>
                </GlassCard>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </section>

      {/* ========== AI PROVIDERS ========== */}
      <section className="relative z-10 py-32 px-6">
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
          variants={stagger}
          className="max-w-5xl mx-auto"
        >
          <motion.div variants={fadeUp} custom={0} className="text-center mb-16">
            <span className="text-neon-blue text-sm font-semibold tracking-wider uppercase">
              AI Providers
            </span>
            <h2 className="text-4xl sm:text-5xl font-bold mt-3 mb-4">
              Works with your favorites
            </h2>
            <p className="text-white/40 text-lg max-w-xl mx-auto">
              Seamless integration with leading AI providers and local models
            </p>
          </motion.div>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
            {providers.map((p, i) => (
              <motion.div key={p.name} variants={fadeUp} custom={i + 1}>
                <GlassCard className="text-center py-8 group hover:border-neon-blue/20 transition-all duration-300 cursor-default">
                  <p.icon className="h-8 w-8 text-neon-blue mx-auto mb-3 group-hover:scale-110 transition-transform" />
                  <p className="font-medium text-white/80 text-sm">
                    {p.name}
                  </p>
                </GlassCard>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </section>

      {/* ========== INSTALL ========== */}
      <section className="relative z-10 py-32 px-6">
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
          variants={stagger}
          className="max-w-3xl mx-auto"
        >
          <motion.div variants={fadeUp} custom={0} className="text-center mb-12">
            <span className="text-neon-blue text-sm font-semibold tracking-wider uppercase">
              Installation
            </span>
            <h2 className="text-4xl sm:text-5xl font-bold mt-3 mb-4">
              Get started in seconds
            </h2>
            <p className="text-white/40 text-lg max-w-xl mx-auto">
              Three commands. That&apos;s all it takes.
            </p>
          </motion.div>

          <motion.div variants={fadeUp} custom={1}>
            <CopyTerminal />
          </motion.div>

          <motion.div
            variants={fadeUp}
            custom={2}
            className="text-center mt-10"
          >
            <Button variant="glow" size="xl" asChild>
              <Link href="/docs" className="gap-2">
                Read the Docs <ArrowRight className="h-5 w-5" />
              </Link>
            </Button>
          </motion.div>
        </motion.div>
      </section>
    </div>
  );
}
