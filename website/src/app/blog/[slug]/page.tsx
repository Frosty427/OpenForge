"use client";

import { useState, use } from "react";
import { motion } from "framer-motion";
import {
  Calendar,
  Clock,
  User,
  ArrowLeft,
  Share2,
  Twitter,
  Linkedin,
  Link2,
  Check,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { GlassCard } from "@/components/ui/card";
import Link from "next/link";
import { cn } from "@/lib/utils";

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

interface BlogPost {
  title: string;
  slug: string;
  excerpt: string;
  category: string;
  tags: string[];
  author: string;
  date: string;
  readTime: string;
  content: string;
}

const posts: BlogPost[] = [
  {
    title: "Introducing OpenForge: The AI That Can Use Computer",
    slug: "introducing-openforge",
    excerpt:
      "We're thrilled to announce OpenForge, an open-source AI orchestration platform that gives artificial intelligence the ability to control your computer through natural language commands.",
    category: "Announcements",
    tags: ["launch", "open-source", "ai", "automation"],
    author: "Alex Chen",
    date: "2026-03-15",
    readTime: "5 min read",
    content: `Today marks a significant milestone in AI-powered automation. We're introducing OpenForge, a platform designed to bridge the gap between artificial intelligence and computer interaction.

## The Vision

For years, AI assistants have been confined to chat windows — answering questions, generating text, and offering suggestions. But what if AI could actually do things? What if it could navigate your filesystem, run commands, manage deployments, and orchestrate complex workflows?

That's exactly what OpenForge enables.

## What Makes OpenForge Different

OpenForge isn't just another chatbot wrapper. It's a full orchestration system that gives AI models the ability to:

- **Execute terminal commands** on your behalf with your explicit approval
- **Navigate and manage files** across your entire system
- **Connect to multiple AI providers** through an intelligent gateway
- **Run models locally** using Ollama, llama.cpp, and more
- **Create isolated environments** called Subspaces for parallel task execution

## Built for Developers

We built OpenForge with developers in mind. The CLI-first approach means you can integrate it into your existing workflows without friction. Whether you prefer OpenAI, Anthropic, Groq, or running models locally, OpenForge has you covered.

\`\`\`bash
# Get started in seconds
npm install -g openforge

# Configure your preferred AI provider
openforge config set-provider openai --key sk-xxx

# Start orchestrating
openforge ask "create a new React project with TypeScript and Tailwind"
\`\`\`

## Open Source from Day One

OpenForge is fully open source under the MIT license. We believe that tools this powerful should be transparent, auditable, and community-driven. Every line of code is available on GitHub.

## What's Next

This is just the beginning. We have a packed roadmap ahead including:

- Plugin architecture for community extensions
- Multi-agent collaboration workflows
- Enhanced security sandboxing
- Visual workflow builder

Join us on this journey. Star our GitHub repo, join the Discord community, and let's build the future of AI-powered computing together.`,
  },
  {
    title: "Getting Started with OpenForge CLI",
    slug: "getting-started-cli",
    excerpt:
      "A step-by-step guide to installing and configuring the OpenForge CLI on your machine. Learn how to set up providers, configure environments, and run your first AI-powered command.",
    category: "Tutorials",
    tags: ["tutorial", "cli", "setup", "beginners"],
    author: "Maya Rodriguez",
    date: "2026-03-12",
    readTime: "8 min read",
    content: `Welcome to OpenForge! This tutorial will walk you through the installation process and help you run your first command.

## Prerequisites

Before you begin, make sure you have:

- Node.js 18 or higher installed
- An API key from at least one supported AI provider
- A terminal emulator (Terminal, iTerm2, Windows Terminal, etc.)

## Installation

Install OpenForge globally using npm:

\`\`\`bash
npm install -g openforge
\`\`\`

Verify the installation:

\`\`\`bash
openforge --version
openforge doctor
\`\`\`

The \`doctor\` command will check your system for any missing dependencies and provide guidance on how to resolve them.

## Configuring Your First Provider

OpenForge supports multiple AI providers. Let's configure OpenAI:

\`\`\`bash
openforge config set-provider openai --key sk-your-api-key-here
openforge config set-default openai
\`\`\`

You can also configure multiple providers and let OpenForge intelligently route between them:

\`\`\`bash
openforge config set-provider anthropic --key sk-ant-xxx
openforge config set-provider groq --key gsk_xxx
\`\`\`

## Running Your First Command

Now let's test it out:

\`\`\`bash
openforge ask "list all TypeScript files in the current directory"
\`\`\`

OpenForge will interpret your request and propose a plan. You can approve the plan to execute it, or modify it first.

## Understanding Permissions

By default, OpenForge asks for your approval before executing commands. You can adjust this behavior:

\`\`\`bash
# Auto-approve safe commands
openforge config set-permissions auto-safe

# Full trust mode (use with caution)
openforge config set-permissions full-trust
\`\`\`

## Next Steps

Now that you have OpenForge running, explore these advanced features:

- Setting up local AI models with Ollama
- Creating Subspaces for isolated environments
- Building custom command aliases
- Integrating with your CI/CD pipeline`,
  },
  {
    title: "Connecting Multiple AI Providers",
    slug: "connecting-ai-providers",
    excerpt:
      "OpenForge supports a wide range of AI providers. Learn how to connect OpenAI, Anthropic, Groq, and local models, and switch between them seamlessly.",
    category: "Tutorials",
    tags: ["providers", "openai", "anthropic", "groq", "configuration"],
    author: "James Park",
    date: "2026-03-08",
    readTime: "10 min read",
    content: `One of OpenForge's core strengths is its ability to work with multiple AI providers. In this guide, we'll show you how to configure each provider and leverage the gateway's intelligent routing.

## Supported Providers

OpenForge currently supports the following providers:

| Provider | Models | Best For |
|----------|--------|----------|
| OpenAI | GPT-4o, o3-mini | General purpose, code generation |
| Anthropic | Claude 4, Claude 3.5 | Long context, nuanced reasoning |
| Groq | Llama 3, Mixtral | Ultra-fast inference |
| OpenRouter | 100+ models | Access to diverse models |
| DeepSeek | DeepSeek-V3, DeepSeek-R1 | Cost-effective, strong reasoning |
| Ollama | Any GGUF model | Local, private inference |

## Configuring Providers

Each provider is configured through the CLI:

\`\`\`bash
# OpenAI
openforge config set-provider openai --key sk-xxx

# Anthropic
openforge config set-provider anthropic --key sk-ant-xxx

# Groq (fastest for many tasks)
openforge config set-provider groq --key gsk_xxx
\`\`\`

## Intelligent Routing

The OpenForge Gateway automatically routes requests to the best provider based on:

- Task complexity
- Context length requirements
- Cost optimization
- Provider availability
- Fallback chains

\`\`\`bash
# View current routing configuration
openforge gateway status

# Set routing strategy
openforge gateway set-strategy cost-optimized
openforge gateway set-strategy performance-first
openforge gateway set-strategy balanced
\`\`\`

## Local Models with Ollama

For privacy-sensitive tasks or offline usage, run models locally:

\`\`\`bash
# Install and start Ollama
ollama pull llama3
openforge config set-provider ollama --url http://localhost:11434
\`\`\`

OpenForge will automatically detect available local models and include them in routing decisions.`,
  },
  {
    title: "Building AI Agents with OpenSpaces",
    slug: "building-ai-agents-openspaces",
    excerpt:
      "Dive deep into the OpenSpaces architecture and learn how to build autonomous AI agents that can operate in isolated environments for complex multi-step tasks.",
    category: "Engineering",
    tags: ["agents", "openspaces", "architecture", "advanced"],
    author: "Sarah Kim",
    date: "2026-03-05",
    readTime: "12 min read",
    content: `OpenSpaces provide isolated environments where AI agents can execute tasks without interfering with your main workspace. In this deep dive, we explore the architecture behind Subspaces and how to build sophisticated agent workflows.

## What Are OpenSpaces?

An OpenSpace is a fully isolated environment that includes:

- Its own filesystem sandbox
- Separate environment variables
- Independent process trees
- Custom provider configurations
- Resource limits and quotas

Think of it as a lightweight container specifically designed for AI agent execution.

## Creating Your First Subspace

\`\`\`bash
# Create a new subspace
openforge subspace create my-agent --provider openai

# Enter the subspace
openforge subspace enter my-agent

# Run tasks within the subspace
openforge ask "build a REST API with Express.js"
\`\`\`

## Agent Architecture

OpenForge agents follow a structured execution pattern:

1. **Parse** — Understand the user's intent
2. **Plan** — Break down into executable steps
3. **Execute** — Run commands in the subspace
4. **Verify** — Validate results against expectations
5. **Report** — Present findings to the user

Each step includes safety checks and can be configured for different trust levels.

## Multi-Agent Workflows

Create multiple subspecies that work together:

\`\`\`bash
# Create specialized agents
openforge subspace create code-writer --provider anthropic
openforge subspace create code-reviewer --provider openai
openforge subspace create test-runner --provider local

# Orchestrate them
openforge workflow run feature-development \\
  --agents code-writer,code-reviewer,test-runner
\`\`\`

## Best Practices

- Set appropriate resource limits for each subspace
- Use different providers for different agent roles
- Implement logging and monitoring for long-running agents
- Version control your agent configurations`,
  },
  {
    title: "OpenForge v1.2 Release Notes",
    slug: "v1-2-release-notes",
    excerpt:
      "Announcing OpenForge v1.2 with improved gateway routing, new provider integrations, enhanced security features, and a completely redesigned CLI experience.",
    category: "Announcements",
    tags: ["release", "v1.2", "changelog", "updates"],
    author: "Alex Chen",
    date: "2026-02-28",
    readTime: "4 min read",
    content: `We're excited to release OpenForge v1.2, packed with new features and improvements based on community feedback.

## What's New

### Enhanced Gateway Routing

The gateway now supports advanced routing strategies with automatic failover. If a provider goes down, OpenForge seamlessly switches to the next best option.

### New Provider Support

- **DeepSeek** — Access DeepSeek-V3 and DeepSeek-R1 models
- **OpenRouter** — Connect to 100+ models through a single API
- **Z.ai** — High-performance inference at competitive prices

### Security Improvements

- Sandboxed command execution with syscall filtering
- Enhanced permission system with granular controls
- Audit logging for all AI-initiated actions
- Encrypted credential storage using OS keychains

### CLI Redesign

The CLI has been completely redesigned with:

- Interactive TUI mode for complex workflows
- Syntax highlighting for code output
- Progress indicators for long-running tasks
- Shell completions for bash, zsh, and fish

## Breaking Changes

- \`openforge config set\` has been replaced with \`openforge config set-provider\`
- Minimum Node.js version is now 18
- Configuration file format has moved from JSON to YAML

## Upgrading

\`\`\`bash
npm update -g openforge
openforge migrate
\`\`\`

The migrate command will automatically update your configuration to the new format.`,
  },
  {
    title: "How We Built the Gateway Architecture",
    slug: "gateway-architecture",
    excerpt:
      "A technical deep-dive into the intelligent routing system that powers OpenForge's multi-provider architecture, including failover logic and load balancing strategies.",
    category: "Engineering",
    tags: ["architecture", "gateway", "routing", "engineering"],
    author: "David Wu",
    date: "2026-02-20",
    readTime: "15 min read",
    content: `The gateway is the heart of OpenForge's provider management system. In this post, we'll explore the architectural decisions behind it and how it handles the complexity of multi-provider routing.

## The Problem

With so many AI providers available, users face a difficult choice. Each provider has different strengths, pricing, latency characteristics, and availability. We needed a system that could:

- Route requests to the optimal provider
- Handle provider outages gracefully
- Balance cost and performance
- Support local and remote models simultaneously

## Architecture Overview

The gateway sits between the user and all AI providers:

\`\`\`
User Request → Gateway Router → Provider Selection → API Call → Response Processing → User
                     ↓
              Strategy Engine
              Health Monitor
              Cost Tracker
              Cache Layer
\`\`\`

## Provider Selection Algorithm

The gateway uses a weighted scoring system to select the best provider for each request:

\`\`\`typescript
function scoreProvider(provider: Provider, context: RequestContext): number {
  const latency = provider.avgLatency * WEIGHTS.latency;
  const cost = estimateCost(provider, context.tokens) * WEIGHTS.cost;
  const reliability = provider.uptime * WEIGHTS.reliability;
  const capability = matchCapabilities(provider, context.requirements);

  return capability - latency - cost + reliability;
}
\`\`\`

## Health Monitoring

Each provider is continuously monitored through:

- Periodic health check pings
- Response time tracking
- Error rate calculation
- Token usage monitoring

When a provider's health score drops below a threshold, it's temporarily removed from the routing pool.

## Caching Strategy

The gateway implements intelligent caching to reduce costs and latency:

- Semantic similarity matching for repeated queries
- Provider-specific cache invalidation
- Configurable TTL per request type
- Cache warming for predictable workloads

## Lessons Learned

Building this system taught us that reliability beats raw performance. Users would rather wait an extra 500ms than receive an error. Our failover chains ensure that there's always a provider available.`,
  },
];

function formatDate(dateStr: string) {
  return new Date(dateStr).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

function categoryColor(category: string) {
  switch (category) {
    case "Announcements":
      return "bg-neon-blue/20 text-neon-blue border-neon-blue/30";
    case "Tutorials":
      return "bg-green-500/20 text-green-400 border-green-500/30";
    case "Engineering":
      return "bg-neon-purple/20 text-neon-purple border-neon-purple/30";
    case "Community":
      return "bg-orange-500/20 text-orange-400 border-orange-500/30";
    default:
      return "bg-white/10 text-white/60 border-white/20";
  }
}

export default function BlogPostPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = use(params);
  const post = posts.find((p) => p.slug === slug);
  const [copied, setCopied] = useState(false);

  if (!post) {
    return (
      <div className="relative min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-4xl font-bold text-white mb-4">
            Post Not Found
          </h1>
          <p className="text-white/50 mb-8">
            The blog post you're looking for doesn't exist.
          </p>
          <Button variant="glow" asChild>
            <Link href="/blog" className="gap-2">
              <ArrowLeft className="h-4 w-4" /> Back to Blog
            </Link>
          </Button>
        </div>
      </div>
    );
  }

  const relatedPosts = posts
    .filter((p) => p.category === post.category && p.slug !== post.slug)
    .slice(0, 3);

  const handleCopyLink = () => {
    navigator.clipboard.writeText(window.location.href);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleShare = (platform: "twitter" | "linkedin") => {
    const url = encodeURIComponent(window.location.href);
    const text = encodeURIComponent(post.title);
    const shareUrl =
      platform === "twitter"
        ? `https://twitter.com/intent/tweet?url=${url}&text=${text}`
        : `https://www.linkedin.com/sharing/share-offsite/?url=${url}`;
    window.open(shareUrl, "_blank", "noopener,noreferrer,width=600,height=400");
  };

  const renderContent = (content: string) => {
    const lines = content.split("\n");
    const elements: React.ReactNode[] = [];
    let inCodeBlock = false;
    let codeBlockContent: string[] = [];
    let codeBlockLang = "";
    let inTable = false;
    let tableRows: string[] = [];

    const flushTable = () => {
      if (tableRows.length === 0) return;
      const header = tableRows[0]
        .split("|")
        .map((c) => c.trim())
        .filter(Boolean);
      const dataRows = tableRows
        .slice(2)
        .map((r) =>
          r
            .split("|")
            .map((c) => c.trim())
            .filter(Boolean)
        );

      elements.push(
        <div key={`table-${elements.length}`} className="my-6 overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-white/10">
                {header.map((h, i) => (
                  <th
                    key={i}
                    className="text-left py-3 px-4 text-white/70 font-semibold"
                  >
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {dataRows.map((row, ri) => (
                <tr key={ri} className="border-b border-white/5">
                  {row.map((cell, ci) => (
                    <td key={ci} className="py-2.5 px-4 text-white/50">
                      {cell}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      );
      tableRows = [];
    };

    lines.forEach((line, index) => {
      if (line.startsWith("```")) {
        if (inCodeBlock) {
          elements.push(
            <div
              key={`code-${index}`}
              className="my-6 rounded-xl overflow-hidden border border-white/10"
            >
              {codeBlockLang && (
                <div className="bg-white/5 px-4 py-2 text-xs text-white/40 font-mono border-b border-white/10">
                  {codeBlockLang}
                </div>
              )}
              <pre className="bg-white/5 p-4 overflow-x-auto">
                <code className="text-sm font-mono text-white/80 leading-relaxed">
                  {codeBlockContent.join("\n")}
                </code>
              </pre>
            </div>
          );
          codeBlockContent = [];
          codeBlockLang = "";
          inCodeBlock = false;
        } else {
          inCodeBlock = true;
          codeBlockLang = line.slice(3).trim();
        }
        return;
      }

      if (inCodeBlock) {
        codeBlockContent.push(line);
        return;
      }

      if (line.startsWith("|")) {
        if (!inTable) inTable = true;
        tableRows.push(line);
        return;
      } else if (inTable) {
        flushTable();
        inTable = false;
      }

      if (line.startsWith("## ")) {
        elements.push(
          <h2
            key={index}
            className="text-2xl font-bold text-white mt-10 mb-4"
          >
            {line.slice(3)}
          </h2>
        );
      } else if (line.startsWith("### ")) {
        elements.push(
          <h3
            key={index}
            className="text-xl font-semibold text-white mt-8 mb-3"
          >
            {line.slice(4)}
          </h3>
        );
      } else if (line.startsWith("- **") && line.includes("**")) {
        const boldMatch = line.match(/^- \*\*(.+?)\*\*\s*(.*)$/);
        if (boldMatch) {
          elements.push(
            <div key={index} className="flex gap-3 my-2 text-white/60">
              <span className="text-neon-blue mt-1.5">•</span>
              <span>
                <strong className="text-white/90">{boldMatch[1]}</strong>
                {boldMatch[2] && ` — ${boldMatch[2]}`}
              </span>
            </div>
          );
        } else {
          elements.push(
            <div key={index} className="flex gap-3 my-2 text-white/60">
              <span className="text-neon-blue mt-1.5">•</span>
              <span>{line.slice(2)}</span>
            </div>
          );
        }
      } else if (line.startsWith("- ")) {
        elements.push(
          <div key={index} className="flex gap-3 my-2 text-white/60">
            <span className="text-neon-blue mt-1.5">•</span>
            <span>{line.slice(2)}</span>
          </div>
        );
      } else if (/^\d+\.\s/.test(line)) {
        const match = line.match(/^(\d+)\.\s(.*)$/);
        if (match) {
          elements.push(
            <div key={index} className="flex gap-3 my-2 text-white/60">
              <span className="text-neon-blue font-semibold min-w-[1.5rem] text-right">
                {match[1]}.
              </span>
              <span>{match[2]}</span>
            </div>
          );
        }
      } else if (line.trim() === "") {
        elements.push(<div key={index} className="h-3" />);
      } else {
        const parts = line.split(/(\*\*[^*]+\*\*)/g);
        elements.push(
          <p key={index} className="text-white/60 leading-relaxed my-3">
            {parts.map((part, pi) => {
              if (part.startsWith("**") && part.endsWith("**")) {
                return (
                  <strong key={pi} className="text-white/90">
                    {part.slice(2, -2)}
                  </strong>
                );
              }
              return part;
            })}
          </p>
        );
      }
    });

    if (inTable) flushTable();

    return elements;
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

      <div className="relative z-10 max-w-4xl mx-auto px-6 pt-28 pb-20">
        <motion.div
          initial={{ opacity: 0, x: -10 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.2 }}
        >
          <Link
            href="/blog"
            className="inline-flex items-center gap-2 text-sm text-white/40 hover:text-white transition-colors mb-8"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Blog
          </Link>
        </motion.div>

        <motion.div
          initial="hidden"
          animate="visible"
          variants={stagger}
        >
          <motion.div variants={fadeUp} custom={0}>
            <span
              className={cn(
                "inline-block px-3 py-1 rounded-full text-xs font-medium border mb-6",
                categoryColor(post.category)
              )}
            >
              {post.category}
            </span>
          </motion.div>

          <motion.h1
            variants={fadeUp}
            custom={1}
            className="text-3xl sm:text-4xl lg:text-5xl font-bold text-white mb-6 leading-tight"
          >
            {post.title}
          </motion.h1>

          <motion.div
            variants={fadeUp}
            custom={2}
            className="flex flex-wrap items-center gap-6 text-sm text-white/40 mb-8"
          >
            <span className="flex items-center gap-1.5">
              <User className="h-4 w-4" />
              {post.author}
            </span>
            <span className="flex items-center gap-1.5">
              <Calendar className="h-4 w-4" />
              {formatDate(post.date)}
            </span>
            <span className="flex items-center gap-1.5">
              <Clock className="h-4 w-4" />
              {post.readTime}
            </span>
          </motion.div>

          <motion.div
            variants={fadeUp}
            custom={3}
            className="flex items-center gap-2 mb-10"
          >
            <Share2 className="h-4 w-4 text-white/30 mr-1" />
            <Button
              variant="glass"
              size="sm"
              className="gap-2"
              onClick={() => handleShare("twitter")}
            >
              <Twitter className="h-3.5 w-3.5" />
              Twitter
            </Button>
            <Button
              variant="glass"
              size="sm"
              className="gap-2"
              onClick={() => handleShare("linkedin")}
            >
              <Linkedin className="h-3.5 w-3.5" />
              LinkedIn
            </Button>
            <Button
              variant="glass"
              size="sm"
              className="gap-2"
              onClick={handleCopyLink}
            >
              {copied ? (
                <Check className="h-3.5 w-3.5 text-green-400" />
              ) : (
                <Link2 className="h-3.5 w-3.5" />
              )}
              {copied ? "Copied!" : "Copy Link"}
            </Button>
          </motion.div>

          <motion.div
            variants={fadeUp}
            custom={4}
            className="h-px bg-gradient-to-r from-transparent via-white/10 to-transparent mb-10"
          />

          <motion.article variants={fadeUp} custom={5}>
            {renderContent(post.content)}
          </motion.article>

          <motion.div
            variants={fadeUp}
            custom={6}
            className="flex flex-wrap gap-2 mt-10 pt-8 border-t border-white/10"
          >
            {post.tags.map((tag) => (
              <span
                key={tag}
                className="px-3 py-1 rounded-full text-xs glass text-white/50"
              >
                #{tag}
              </span>
            ))}
          </motion.div>
        </motion.div>

        {relatedPosts.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.8 }}
            className="mt-20"
          >
            <h2 className="text-2xl font-bold text-white mb-6">
              Related Posts
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
              {relatedPosts.map((relatedPost, i) => (
                <motion.div
                  key={relatedPost.slug}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.9 + i * 0.1 }}
                >
                  <Link href={`/blog/${relatedPost.slug}`}>
                    <GlassCard className="h-full group hover:border-white/20 transition-all duration-300 cursor-pointer">
                      <span
                        className={cn(
                          "inline-block px-3 py-1 rounded-full text-xs font-medium border mb-3",
                          categoryColor(relatedPost.category)
                        )}
                      >
                        {relatedPost.category}
                      </span>
                      <h3 className="text-base font-semibold text-white mb-2 group-hover:text-neon-blue transition-colors line-clamp-2">
                        {relatedPost.title}
                      </h3>
                      <p className="text-xs text-white/40 line-clamp-2">
                        {relatedPost.excerpt}
                      </p>
                      <div className="flex items-center gap-3 text-xs text-white/30 mt-3">
                        <span className="flex items-center gap-1">
                          <Calendar className="h-3 w-3" />
                          {formatDate(relatedPost.date)}
                        </span>
                        <span className="flex items-center gap-1">
                          <Clock className="h-3 w-3" />
                          {relatedPost.readTime}
                        </span>
                      </div>
                    </GlassCard>
                  </Link>
                </motion.div>
              ))}
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
}
