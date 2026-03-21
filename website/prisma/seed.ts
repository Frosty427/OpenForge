import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  // Create demo user
  const hashedPassword = await bcrypt.hash("demo123", 10);
  const user = await prisma.user.upsert({
    where: { email: "demo@openforge.dev" },
    update: {},
    create: {
      email: "demo@openforge.dev",
      name: "Demo User",
      password: hashedPassword,
    },
  });

  // Create sample blog posts
  const posts = [
    {
      title: "Introducing OpenForge: The AI That Can Use Computer",
      slug: "introducing-openforge",
      excerpt:
        "Today we're launching OpenForge, an advanced AI orchestration system that can execute commands, automate workflows, and use local and remote AI models.",
      content:
        "OpenForge is a revolutionary AI orchestration platform that bridges the gap between AI capabilities and real-world computer operations. Unlike traditional chatbots, OpenForge can actually interact with your system, execute commands, and automate complex workflows.\n\n## Why OpenForge?\n\nWe built OpenForge because we believe AI should do more than just answer questions. It should be able to take action, run commands, and operate your computer like a real assistant.\n\n## Key Features\n\n- **Multi-AI Support**: Connect to OpenAI, Anthropic, Groq, and more\n- **Command System**: Execute powerful commands through natural language\n- **Gateway Architecture**: Intelligent routing between AI providers\n- **Subspace Environments**: Isolated environments for parallel tasks\n- **Local AI Execution**: Run models locally without cloud dependency\n- **TypeScript Native**: Built with TypeScript for type-safe development\n\nGet started today with `npm install -g openforge`",
      category: "Announcements",
      tags: "launch,announcement,ai",
      published: true,
      author: "OpenForge Team",
    },
    {
      title: "Getting Started with OpenForge CLI",
      slug: "getting-started-cli",
      excerpt:
        "A comprehensive guide to installing and using the OpenForge CLI tool for AI-powered automation.",
      content:
        "Getting started with OpenForge is easy. In this guide, we'll walk you through installation, configuration, and your first AI-powered command.\n\n## Installation\n\n```bash\nnpm install -g openforge\n```\n\n## Initialize\n\n```bash\nopenforge init\n```\n\nThis creates a configuration file in your current directory.\n\n## Your First Command\n\n```bash\nopenforge run \"list all files in the current directory\"\n```\n\nOpenForge will interpret your natural language command and execute it using the appropriate system commands.",
      category: "Tutorials",
      tags: "tutorial,getting-started,cli",
      published: true,
      author: "OpenForge Team",
    },
    {
      title: "Connecting Multiple AI Providers",
      slug: "connecting-ai-providers",
      excerpt:
        "Learn how to configure and switch between different AI providers in OpenForge.",
      content:
        "OpenForge supports multiple AI providers out of the box. This guide shows you how to configure each provider and switch between them seamlessly.\n\n## Supported Providers\n\n- OpenAI (GPT-4, GPT-3.5)\n- Anthropic (Claude)\n- Groq\n- OpenRouter\n- DeepSeek\n- Z.ai\n- Local Models (Ollama)\n\n## Configuration\n\nSet your API keys as environment variables:\n\n```bash\nexport OPENAI_API_KEY=your-key\nexport ANTHROPIC_API_KEY=your-key\n```\n\n## Switching Providers\n\n```bash\nopenforge run --provider anthropic \"your command\"\n```",
      category: "Tutorials",
      tags: "ai,providers,configuration",
      published: true,
      author: "OpenForge Team",
    },
  ];

  for (const post of posts) {
    await prisma.blogPost.upsert({
      where: { slug: post.slug },
      update: {},
      create: post,
    });
  }

  console.log("Seed data created successfully!");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
