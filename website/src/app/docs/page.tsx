"use client";

import { useState, useEffect, useRef } from "react";
import {
  Search,
  Book,
  Terminal,
  Settings,
  Cloud,
  Layers,
  TestTube,
  HelpCircle,
  Copy,
  Check,
  ChevronRight,
  ThumbsUp,
  ThumbsDown,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";

interface DocSection {
  id: string;
  title: string;
  icon: React.ReactNode;
  children: { id: string; title: string }[];
}

const docSections: DocSection[] = [
  {
    id: "getting-started",
    title: "Getting Started",
    icon: <Book className="h-4 w-4" />,
    children: [
      { id: "overview", title: "Overview" },
      { id: "quick-start", title: "Quick Start" },
      { id: "installation", title: "Installation" },
    ],
  },
  {
    id: "configuration",
    title: "Configuration",
    icon: <Settings className="h-4 w-4" />,
    children: [
      { id: "environment-variables", title: "Environment Variables" },
      { id: "ai-providers-config", title: "AI Providers" },
    ],
  },
  {
    id: "cli-commands",
    title: "CLI Commands",
    icon: <Terminal className="h-4 w-4" />,
    children: [
      { id: "cmd-init", title: "openforge init" },
      { id: "cmd-run", title: "openforge run" },
      { id: "cmd-config", title: "openforge config" },
      { id: "cmd-providers", title: "openforge providers" },
      { id: "cmd-subspace", title: "openforge subspace" },
    ],
  },
  {
    id: "ai-providers",
    title: "AI Providers",
    icon: <Cloud className="h-4 w-4" />,
    children: [
      { id: "provider-openai", title: "OpenAI" },
      { id: "provider-anthropic", title: "Anthropic" },
      { id: "provider-groq", title: "Groq" },
      { id: "provider-openrouter", title: "OpenRouter" },
      { id: "provider-deepseek", title: "DeepSeek" },
      { id: "provider-zai", title: "Z.ai" },
      { id: "provider-local", title: "Local Models" },
    ],
  },
  {
    id: "subspaces",
    title: "Subspaces",
    icon: <Layers className="h-4 w-4" />,
    children: [
      { id: "subspace-create", title: "Create" },
      { id: "subspace-manage", title: "Manage" },
      { id: "subspace-isolate", title: "Isolate" },
    ],
  },
  {
    id: "testing",
    title: "Testing System",
    icon: <TestTube className="h-4 w-4" />,
    children: [
      { id: "test-runner", title: "Test Runner" },
      { id: "coverage", title: "Coverage" },
    ],
  },
  {
    id: "faq",
    title: "FAQ",
    icon: <HelpCircle className="h-4 w-4" />,
    children: [{ id: "faq-section", title: "Frequently Asked Questions" }],
  },
];

function CodeBlock({ code, language = "bash" }: { code: string; language?: string }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="relative group my-4">
      <div className="absolute top-0 left-3 px-2 py-1 text-[10px] font-mono text-zinc-500 bg-zinc-800 rounded-b-md uppercase tracking-wider">
        {language}
      </div>
      <Button
        variant="ghost"
        size="icon"
        className="absolute top-2 right-2 h-7 w-7 opacity-0 group-hover:opacity-100 transition-opacity text-zinc-400 hover:text-white hover:bg-zinc-700"
        onClick={handleCopy}
      >
        {copied ? <Check className="h-3.5 w-3.5 text-emerald-400" /> : <Copy className="h-3.5 w-3.5" />}
      </Button>
      <pre className="bg-zinc-900 border border-zinc-800 rounded-lg p-4 pt-8 overflow-x-auto">
        <code className="text-sm font-mono text-zinc-300 whitespace-pre">{code}</code>
      </pre>
    </div>
  );
}

function DataTable({ headers, rows }: { headers: string[]; rows: string[][] }) {
  return (
    <div className="my-4 overflow-x-auto rounded-lg border border-zinc-800">
      <table className="w-full text-sm">
        <thead>
          <tr className="bg-zinc-900/80">
            {headers.map((h, i) => (
              <th key={i} className="px-4 py-3 text-left font-semibold text-zinc-300 border-b border-zinc-800">
                {h}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row, ri) => (
            <tr key={ri} className={cn(ri % 2 === 0 ? "bg-zinc-950/50" : "bg-zinc-900/30")}>
              {row.map((cell, ci) => (
                <td key={ci} className="px-4 py-3 border-b border-zinc-800/50 text-zinc-400">
                  {ci === 0 ? <code className="text-emerald-400 text-xs bg-zinc-800 px-1.5 py-0.5 rounded">{cell}</code> : cell}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function Helpful({ sectionId }: { sectionId: string }) {
  const [feedback, setFeedback] = useState<"up" | "down" | null>(null);

  function handleFeedback(type: "up" | "down") {
    setFeedback(type);
    console.log(`Feedback for section "${sectionId}": ${type}`);
  }

  return (
    <div className="flex items-center gap-3 mt-8 pt-4 border-t border-zinc-800/50 text-sm text-zinc-500">
      <span>Was this helpful?</span>
      <Button
        variant="ghost"
        size="icon"
        className={cn("h-8 w-8", feedback === "up" && "text-emerald-400 bg-emerald-400/10")}
        onClick={() => handleFeedback("up")}
      >
        <ThumbsUp className="h-4 w-4" />
      </Button>
      <Button
        variant="ghost"
        size="icon"
        className={cn("h-8 w-8", feedback === "down" && "text-red-400 bg-red-400/10")}
        onClick={() => handleFeedback("down")}
      >
        <ThumbsDown className="h-4 w-4" />
      </Button>
      {feedback && <span className="text-xs text-zinc-600">Thanks for the feedback!</span>}
    </div>
  );
}

function H2({ id, children }: { id: string; children: React.ReactNode }) {
  return (
    <h2 id={id} className="scroll-mt-24 text-2xl font-bold text-white mt-12 mb-4 first:mt-0 group flex items-center gap-2">
      {children}
      <a href={`#${id}`} className="opacity-0 group-hover:opacity-50 hover:!opacity-100 transition-opacity text-zinc-500">
        #
      </a>
    </h2>
  );
}

function H3({ id, children }: { id: string; children: React.ReactNode }) {
  return (
    <h3 id={id} className="scroll-mt-24 text-lg font-semibold text-zinc-200 mt-8 mb-3 group flex items-center gap-2">
      {children}
      <a href={`#${id}`} className="opacity-0 group-hover:opacity-50 hover:!opacity-100 transition-opacity text-zinc-500 text-sm">
        #
      </a>
    </h3>
  );
}

function P({ children }: { children: React.ReactNode }) {
  return <p className="text-zinc-400 leading-relaxed mb-4">{children}</p>;
}

export default function DocsPage() {
  const [activeSection, setActiveSection] = useState("overview");
  const [search, setSearch] = useState("");
  const contentRef = useRef<HTMLDivElement>(null);

  const filteredSections = docSections
    .map((section) => ({
      ...section,
      children: section.children.filter(
        (child) =>
          child.title.toLowerCase().includes(search.toLowerCase()) ||
          section.title.toLowerCase().includes(search.toLowerCase())
      ),
    }))
    .filter((section) => section.children.length > 0);

  const scrollToSection = (id: string) => {
    setActiveSection(id);
    const el = document.getElementById(id);
    if (el) {
      el.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  };

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            setActiveSection(entry.target.id);
          }
        }
      },
      { rootMargin: "-100px 0px -60% 0px", threshold: 0 }
    );

    const ids = docSections.flatMap((s) => s.children.map((c) => c.id));
    ids.forEach((id) => {
      const el = document.getElementById(id);
      if (el) observer.observe(el);
    });

    return () => observer.disconnect();
  }, []);

  const breadcrumb = (() => {
    for (const section of docSections) {
      const child = section.children.find((c) => c.id === activeSection);
      if (child) return { section: section.title, child: child.title };
    }
    return { section: "Getting Started", child: "Overview" };
  })();

  return (
    <div className="min-h-screen bg-zinc-950">
      <div className="flex">
        {/* Sidebar */}
        <aside className="fixed left-0 top-0 bottom-0 w-72 border-r border-zinc-800/50 bg-zinc-950/80 backdrop-blur-xl z-40 flex flex-col">
          <div className="p-4 border-b border-zinc-800/50">
            <div className="flex items-center gap-2 mb-4">
              <Book className="h-5 w-5 text-emerald-400" />
              <h1 className="text-lg font-bold text-white">Documentation</h1>
            </div>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-500" />
              <Input
                placeholder="Search docs..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-9 bg-zinc-900 border-zinc-800 text-sm text-zinc-300 placeholder:text-zinc-600 focus-visible:ring-emerald-500/20"
              />
            </div>
          </div>

          <ScrollArea className="flex-1">
            <nav className="p-3 space-y-1">
              {filteredSections.map((section) => (
                <div key={section.id} className="mb-3">
                  <div className="flex items-center gap-2 px-3 py-1.5 text-xs font-semibold uppercase tracking-wider text-zinc-500">
                    {section.icon}
                    {section.title}
                  </div>
                  <div className="space-y-0.5 ml-2">
                    {section.children.map((child) => (
                      <button
                        key={child.id}
                        onClick={() => scrollToSection(child.id)}
                        className={cn(
                          "w-full text-left px-3 py-1.5 text-sm rounded-md transition-all block",
                          activeSection === child.id
                            ? "bg-emerald-500/10 text-emerald-400 font-medium"
                            : "text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800/50"
                        )}
                      >
                        {child.title}
                      </button>
                    ))}
                  </div>
                </div>
              ))}
            </nav>
          </ScrollArea>
        </aside>

        {/* Content */}
        <main className="ml-72 flex-1">
          <div className="max-w-4xl mx-auto px-8 py-8" ref={contentRef}>
            {/* Breadcrumb */}
            <div className="flex items-center gap-2 text-sm text-zinc-500 mb-8">
              <span className="hover:text-zinc-300 cursor-pointer transition-colors">Docs</span>
              <ChevronRight className="h-3 w-3" />
              <span className="hover:text-zinc-300 cursor-pointer transition-colors">{breadcrumb.section}</span>
              <ChevronRight className="h-3 w-3" />
              <span className="text-emerald-400">{breadcrumb.child}</span>
            </div>

            {/* Getting Started */}
            <section id="overview" className="scroll-mt-24">
              <H2 id="overview-heading">Overview</H2>
              <P>
                OpenForge is a powerful CLI tool for managing AI-powered development workflows. It provides a unified interface for configuring, running, and managing multiple AI providers, subspace environments, and automated testing pipelines.
              </P>
              <P>
                With OpenForge, you can seamlessly switch between AI providers like OpenAI, Anthropic, Groq, and more. Create isolated subspaces for different projects, run automated tests with coverage tracking, and manage your entire AI development lifecycle from a single command-line interface.
              </P>
              <div className="grid grid-cols-3 gap-4 my-6">
                {[
                  { label: "Unified CLI", desc: "Single interface for all AI providers" },
                  { label: "Subspaces", desc: "Isolated project environments" },
                  { label: "Testing", desc: "Built-in test runner and coverage" },
                ].map((f) => (
                  <div key={f.label} className="p-4 rounded-lg border border-zinc-800 bg-zinc-900/50">
                    <div className="text-sm font-semibold text-white mb-1">{f.label}</div>
                    <div className="text-xs text-zinc-500">{f.desc}</div>
                  </div>
                ))}
              </div>
              <Helpful sectionId="overview" />
            </section>

            <section id="quick-start" className="scroll-mt-24">
              <H2 id="quick-start-heading">Quick Start</H2>
              <P>
                Get up and running with OpenForge in under 5 minutes. Follow these steps to install, configure, and run your first AI workflow.
              </P>
              <H3 id="quick-start-step-1">Step 1: Install OpenForge</H3>
              <CodeBlock code="npm install -g openforge" language="bash" />
              <H3 id="quick-start-step-2">Step 2: Initialize Configuration</H3>
              <CodeBlock code="openforge init" language="bash" />
              <P>This creates a <code className="text-emerald-400 bg-zinc-800/50 px-1.5 py-0.5 rounded text-sm">.openforge</code> configuration directory in your project root.</P>
              <H3 id="quick-start-step-3">Step 3: Set Your API Key</H3>
              <CodeBlock code='openforge config set OPENAI_API_KEY="sk-your-key-here"' language="bash" />
              <H3 id="quick-start-step-4">Step 4: Run Your First Task</H3>
              <CodeBlock code='openforge run --prompt "Explain this codebase"' language="bash" />
              <Helpful sectionId="quick-start" />
            </section>

            <section id="installation" className="scroll-mt-24">
              <H2 id="installation-heading">Installation</H2>
              <P>OpenForge can be installed using any Node.js package manager.</P>
              <H3 id="install-npm">npm</H3>
              <CodeBlock code="npm install -g openforge" language="bash" />
              <H3 id="install-yarn">yarn</H3>
              <CodeBlock code="yarn global add openforge" language="bash" />
              <H3 id="install-pnpm">pnpm</H3>
              <CodeBlock code="pnpm add -g openforge" language="bash" />
              <H3 id="install-requirements">Requirements</H3>
              <ul className="list-disc list-inside text-zinc-400 space-y-1 mb-4 ml-2">
                <li>Node.js 18.0 or higher</li>
                <li>npm 9.0+ / yarn 1.22+ / pnpm 8.0+</li>
                <li>At least one AI provider API key</li>
              </ul>
              <Helpful sectionId="installation" />
            </section>

            <Separator className="my-8 bg-zinc-800/50" />

            {/* Configuration */}
            <section id="environment-variables" className="scroll-mt-24">
              <H2 id="env-vars-heading">Environment Variables</H2>
              <P>OpenForge uses environment variables for configuration. Set these in your <code className="text-emerald-400 bg-zinc-800/50 px-1.5 py-0.5 rounded text-sm">.env</code> file or system environment.</P>
              <DataTable
                headers={["Variable", "Description", "Required", "Default"]}
                rows={[
                  ["OPENAI_API_KEY", "OpenAI API key for GPT models", "No", "—"],
                  ["ANTHROPIC_API_KEY", "Anthropic API key for Claude models", "No", "—"],
                  ["GROQ_API_KEY", "Groq API key for Llama/Mixtral", "No", "—"],
                  ["OPENROUTER_API_KEY", "OpenRouter API key for multi-provider", "No", "—"],
                  ["DEEPSEEK_API_KEY", "DeepSeek API key", "No", "—"],
                  ["ZAI_API_KEY", "Z.ai API key", "No", "—"],
                  ["OPENFORGE_DEFAULT_PROVIDER", "Default AI provider to use", "No", "openai"],
                  ["OPENFORGE_MODEL", "Default model identifier", "No", "gpt-4"],
                  ["OPENFORGE_LOG_LEVEL", "Logging verbosity level", "No", "info"],
                  ["OPENFORGE_CONFIG_PATH", "Custom config directory path", "No", ".openforge"],
                ]}
              />
              <Helpful sectionId="environment-variables" />
            </section>

            <section id="ai-providers-config" className="scroll-mt-24">
              <H2 id="ai-providers-config-heading">AI Provider Setup</H2>
              <P>Configure your preferred AI providers through environment variables or the <code className="text-emerald-400 bg-zinc-800/50 px-1.5 py-0.5 rounded text-sm">openforge config</code> command.</P>
              <CodeBlock
                language="env"
                code={`# .env file
OPENAI_API_KEY=sk-...
ANTHROPIC_API_KEY=sk-ant-...
OPENFORGE_DEFAULT_PROVIDER=openai
OPENFORGE_MODEL=gpt-4`}
              />
              <P>Alternatively, use the interactive configuration wizard:</P>
              <CodeBlock code="openforge config set" language="bash" />
              <Helpful sectionId="ai-providers-config" />
            </section>

            <Separator className="my-8 bg-zinc-800/50" />

            {/* CLI Commands */}
            <section id="cmd-init" className="scroll-mt-24">
              <H2 id="cmd-init-heading">openforge init</H2>
              <P>Initialize a new OpenForge project with default configuration files and directory structure.</P>
              <CodeBlock code="openforge init [options]" language="bash" />
              <DataTable
                headers={["Option", "Description", "Default"]}
                rows={[
                  ["--force, -f", "Overwrite existing configuration", "false"],
                  ["--template, -t", "Use a specific template", "default"],
                  ["--dir, -d", "Target directory path", "."],
                ]}
              />
              <P>Creates the following structure:</P>
              <CodeBlock
                language="text"
                code={`.openforge/
  config.json       # Main configuration
  providers/        # Provider configurations
  subspaces/        # Subspace definitions
  logs/             # Runtime logs`}
              />
              <Helpful sectionId="cmd-init" />
            </section>

            <section id="cmd-run" className="scroll-mt-24">
              <H2 id="cmd-run-heading">openforge run</H2>
              <P>Execute an AI-powered task using the configured provider and model.</P>
              <CodeBlock code='openforge run [options] --prompt "Your task description"' language="bash" />
              <DataTable
                headers={["Option", "Description", "Default"]}
                rows={[
                  ["--prompt, -p", "The task prompt (required)", "—"],
                  ["--provider", "Override default provider", "config"],
                  ["--model, -m", "Override default model", "config"],
                  ["--context, -c", "Path to context files", "—"],
                  ["--output, -o", "Output file path", "stdout"],
                  ["--stream, -s", "Enable streaming output", "false"],
                ]}
              />
              <H3 id="cmd-run-examples">Examples</H3>
              <CodeBlock
                language="bash"
                code={`# Basic usage
openforge run --prompt "Review this pull request"

# With context files
openforge run --prompt "Refactor this module" --context ./src/utils.ts

# With specific provider
openforge run --prompt "Write tests" --provider anthropic --model claude-3-sonnet

# Streaming to file
openforge run --prompt "Document API" --stream --output docs/api.md`}
              />
              <Helpful sectionId="cmd-run" />
            </section>

            <section id="cmd-config" className="scroll-mt-24">
              <H2 id="cmd-config-heading">openforge config</H2>
              <P>Manage OpenForge configuration values and settings.</P>
              <CodeBlock code="openforge config <action> [key] [value]" language="bash" />
              <DataTable
                headers={["Action", "Description"]}
                rows={[
                  ["get [key]", "Get a configuration value"],
                  ["set [key] [value]", "Set a configuration value"],
                  ["list", "List all configuration values"],
                  ["reset", "Reset to default configuration"],
                  ["validate", "Validate current configuration"],
                ]}
              />
              <CodeBlock
                language="bash"
                code={`# List all config
openforge config list

# Get a value
openforge config get OPENFORGE_DEFAULT_PROVIDER

# Set a value
openforge config set OPENFORGE_MODEL="gpt-4-turbo"

# Validate config
openforge config validate`}
              />
              <Helpful sectionId="cmd-config" />
            </section>

            <section id="cmd-providers" className="scroll-mt-24">
              <H2 id="cmd-providers-heading">openforge providers</H2>
              <P>List, manage, and test configured AI providers.</P>
              <CodeBlock code="openforge providers <action>" language="bash" />
              <DataTable
                headers={["Action", "Description"]}
                rows={[
                  ["list", "List all available providers"],
                  ["test", "Test connectivity for a provider"],
                  ["models", "List available models per provider"],
                  ["status", "Show provider health status"],
                ]}
              />
              <CodeBlock
                language="bash"
                code={`# List providers
openforge providers list

# Test OpenAI connection
openforge providers test openai

# List Anthropic models
openforge providers models anthropic`}
              />
              <Helpful sectionId="cmd-providers" />
            </section>

            <section id="cmd-subspace" className="scroll-mt-24">
              <H2 id="cmd-subspace-heading">openforge subspace</H2>
              <P>Create and manage isolated subspaces for different projects or environments.</P>
              <CodeBlock code="openforge subspace <action> [name]" language="bash" />
              <DataTable
                headers={["Action", "Description"]}
                rows={[
                  ["create [name]", "Create a new subspace"],
                  ["delete [name]", "Delete a subspace"],
                  ["list", "List all subspaces"],
                  ["switch [name]", "Switch to a subspace"],
                  ["export [name]", "Export subspace config"],
                ]}
              />
              <Helpful sectionId="cmd-subspace" />
            </section>

            <Separator className="my-8 bg-zinc-800/50" />

            {/* AI Providers */}
            <section id="provider-openai" className="scroll-mt-24">
              <H2 id="provider-openai-heading">OpenAI Provider</H2>
              <P>Configure OpenAI as your AI provider. Supports GPT-4, GPT-4 Turbo, and GPT-3.5 models.</P>
              <CodeBlock
                language="bash"
                code={`# Set API key
openforge config set OPENAI_API_KEY="sk-..."

# Use as default provider
openforge config set OPENFORGE_DEFAULT_PROVIDER="openai"

# Run with OpenAI
openforge run --prompt "Hello" --provider openai --model gpt-4`}
              />
              <DataTable
                headers={["Model", "Context", "Best For"]}
                rows={[
                  ["gpt-4-turbo", "128K", "Complex reasoning, code generation"],
                  ["gpt-4", "8K", "High-quality analysis"],
                  ["gpt-3.5-turbo", "16K", "Fast responses, cost-effective"],
                ]}
              />
              <Helpful sectionId="provider-openai" />
            </section>

            <section id="provider-anthropic" className="scroll-mt-24">
              <H2 id="provider-anthropic-heading">Anthropic Provider</H2>
              <P>Use Anthropic Claude models for nuanced understanding and long-context tasks.</P>
              <CodeBlock
                language="bash"
                code={`# Set API key
openforge config set ANTHROPIC_API_KEY="sk-ant-..."

# Run with Claude
openforge run --prompt "Analyze this codebase" --provider anthropic --model claude-3-sonnet`}
              />
              <DataTable
                headers={["Model", "Context", "Best For"]}
                rows={[
                  ["claude-3-opus", "200K", "Most capable, complex analysis"],
                  ["claude-3-sonnet", "200K", "Balanced performance and speed"],
                  ["claude-3-haiku", "200K", "Fast, lightweight tasks"],
                ]}
              />
              <Helpful sectionId="provider-anthropic" />
            </section>

            <section id="provider-groq" className="scroll-mt-24">
              <H2 id="provider-groq-heading">Groq Provider</H2>
              <P>Leverage Groq ultra-fast inference with Llama and Mixtral models.</P>
              <CodeBlock
                language="bash"
                code={`# Set API key
openforge config set GROQ_API_KEY="gsk_..."

# Run with Groq
openforge run --prompt "Summarize" --provider groq --model llama-3-70b`}
              />
              <Helpful sectionId="provider-groq" />
            </section>

            <section id="provider-openrouter" className="scroll-mt-24">
              <H2 id="provider-openrouter-heading">OpenRouter Provider</H2>
              <P>Access multiple AI providers through a single OpenRouter API key.</P>
              <CodeBlock
                language="bash"
                code={`# Set API key
openforge config set OPENROUTER_API_KEY="sk-or-..."

# Run with OpenRouter
openforge run --prompt "Hello" --provider openrouter --model "meta-llama/llama-3-70b-instruct"`}
              />
              <Helpful sectionId="provider-openrouter" />
            </section>

            <section id="provider-deepseek" className="scroll-mt-24">
              <H2 id="provider-deepseek-heading">DeepSeek Provider</H2>
              <P>Use DeepSeek models optimized for coding and reasoning tasks.</P>
              <CodeBlock
                language="bash"
                code={`# Set API key
openforge config set DEEPSEEK_API_KEY="sk-..."

# Run with DeepSeek
openforge run --prompt "Write unit tests" --provider deepseek --model deepseek-coder`}
              />
              <Helpful sectionId="provider-deepseek" />
            </section>

            <section id="provider-zai" className="scroll-mt-24">
              <H2 id="provider-zai-heading">Z.ai Provider</H2>
              <P>Configure Z.ai for high-performance AI inference.</P>
              <CodeBlock
                language="bash"
                code={`# Set API key
openforge config set ZAI_API_KEY="zai-..."

# Run with Z.ai
openforge run --prompt "Optimize this function" --provider zai`}
              />
              <Helpful sectionId="provider-zai" />
            </section>

            <section id="provider-local" className="scroll-mt-24">
              <H2 id="provider-local-heading">Local Models</H2>
              <P>Run models locally using Ollama or compatible local inference servers.</P>
              <CodeBlock
                language="bash"
                code={`# Set local endpoint
openforge config set LOCAL_ENDPOINT="http://localhost:11434"

# Run with local model
openforge run --prompt "Hello" --provider local --model llama-3`}
              />
              <P>Requires a running Ollama instance with the desired model pulled.</P>
              <Helpful sectionId="provider-local" />
            </section>

            <Separator className="my-8 bg-zinc-800/50" />

            {/* Subspaces */}
            <section id="subspace-create" className="scroll-mt-24">
              <H2 id="subspace-create-heading">Create Subspace</H2>
              <P>Create isolated environments for different projects with independent configurations.</P>
              <CodeBlock code="openforge subspace create my-project" language="bash" />
              <P>Each subspace maintains its own:</P>
              <ul className="list-disc list-inside text-zinc-400 space-y-1 mb-4 ml-2">
                <li>Provider configuration</li>
                <li>Environment variables</li>
                <li>Context files and history</li>
                <li>Test configurations</li>
              </ul>
              <Helpful sectionId="subspace-create" />
            </section>

            <section id="subspace-manage" className="scroll-mt-24">
              <H2 id="subspace-manage-heading">Manage Subspaces</H2>
              <P>List, switch between, and configure your subspaces.</P>
              <CodeBlock
                language="bash"
                code={`# List all subspaces
openforge subspace list

# Switch active subspace
openforge subspace switch my-project

# Export subspace config
openforge subspace export my-project --output config.json`}
              />
              <Helpful sectionId="subspace-manage" />
            </section>

            <section id="subspace-isolate" className="scroll-mt-24">
              <H2 id="subspace-isolate-heading">Isolate Environments</H2>
              <P>Subspaces provide complete isolation between projects. Each subspace has its own configuration directory and cannot access other subspace data.</P>
              <CodeBlock
                language="bash"
                code={`# Create isolated dev environment
openforge subspace create dev-env --template development

# Create isolated prod environment
openforge subspace create prod-env --template production

# Switch between environments
openforge subspace switch dev-env`}
              />
              <Helpful sectionId="subspace-isolate" />
            </section>

            <Separator className="my-8 bg-zinc-800/50" />

            {/* Testing */}
            <section id="test-runner" className="scroll-mt-24">
              <H2 id="test-runner-heading">Test Runner</H2>
              <P>Run automated tests with AI-powered analysis and reporting.</P>
              <CodeBlock code="openforge test [options]" language="bash" />
              <DataTable
                headers={["Option", "Description", "Default"]}
                rows={[
                  ["--suite, -s", "Test suite to run", "all"],
                  ["--watch, -w", "Watch mode for changes", "false"],
                  ["--reporter, -r", "Output reporter format", "default"],
                  ["--bail, -b", "Stop on first failure", "false"],
                ]}
              />
              <CodeBlock
                language="bash"
                code={`# Run all tests
openforge test

# Run specific suite
openforge test --suite integration

# Watch mode
openforge test --watch`}
              />
              <Helpful sectionId="test-runner" />
            </section>

            <section id="coverage" className="scroll-mt-24">
              <H2 id="coverage-heading">Coverage</H2>
              <P>Generate and analyze code coverage reports with AI insights.</P>
              <CodeBlock code="openforge test --coverage" language="bash" />
              <DataTable
                headers={["Option", "Description", "Default"]}
                rows={[
                  ["--threshold, -t", "Minimum coverage percentage", "80"],
                  ["--output, -o", "Report output directory", "coverage"],
                  ["--format, -f", "Report format (html, json, text)", "html"],
                ]}
              />
              <Helpful sectionId="coverage" />
            </section>

            <Separator className="my-8 bg-zinc-800/50" />

            {/* FAQ */}
            <section id="faq-section" className="scroll-mt-24">
              <H2 id="faq-heading">Frequently Asked Questions</H2>

              <H3 id="faq-api-keys">Where do I get API keys?</H3>
              <P>Each provider has its own signup and API key generation process. Visit their respective developer portals to generate keys. OpenForge stores keys securely in your local configuration.</P>

              <H3 id="faq-multiple-providers">Can I use multiple providers at once?</H3>
              <P>Yes. OpenForge supports configuring multiple providers simultaneously. Use the <code className="text-emerald-400 bg-zinc-800/50 px-1.5 py-0.5 rounded text-sm">--provider</code> flag to select a specific provider for each run, or set a default with <code className="text-emerald-400 bg-zinc-800/50 px-1.5 py-0.5 rounded text-sm">OPENFORGE_DEFAULT_PROVIDER</code>.</P>

              <H3 id="faq-subspace-sharing">How do I share configs between subspaces?</H3>
              <P>Use <code className="text-emerald-400 bg-zinc-800/50 px-1.5 py-0.5 rounded text-sm">openforge subspace export</code> and <code className="text-emerald-400 bg-zinc-800/50 px-1.5 py-0.5 rounded text-sm">import</code> to share configurations. Global settings in the root <code className="text-emerald-400 bg-zinc-800/50 px-1.5 py-0.5 rounded text-sm">config.json</code> are inherited by all subspaces.</P>

              <H3 id="faq-error-handling">How does OpenForge handle errors?</H3>
              <P>OpenForge implements retry logic with exponential backoff for transient API errors. Failed runs are logged with full context in the <code className="text-emerald-400 bg-zinc-800/50 px-1.5 py-0.5 rounded text-sm">.openforge/logs/</code> directory. Use <code className="text-emerald-400 bg-zinc-800/50 px-1.5 py-0.5 rounded text-sm">OPENFORGE_LOG_LEVEL=debug</code> for verbose output.</P>

              <Helpful sectionId="faq-section" />
            </section>

            <div className="h-24" />
          </div>
        </main>
      </div>
    </div>
  );
}
