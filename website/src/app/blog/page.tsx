"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Calendar, Clock, User, Search, Tag, ArrowRight, BookOpen } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
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
    excerpt: "We're thrilled to announce OpenForge, an open-source AI orchestration platform that gives artificial intelligence the ability to control your computer through natural language commands.",
    category: "Announcements",
    tags: ["launch", "open-source", "ai", "automation"],
    author: "Alex Chen",
    date: "2026-03-15",
    readTime: "5 min read",
    content: "Today marks a significant milestone in AI-powered automation. We're introducing OpenForge, a platform designed to bridge the gap between artificial intelligence and computer interaction...",
  },
  {
    title: "Getting Started with OpenForge CLI",
    slug: "getting-started-cli",
    excerpt: "A step-by-step guide to installing and configuring the OpenForge CLI on your machine. Learn how to set up providers, configure environments, and run your first AI-powered command.",
    category: "Tutorials",
    tags: ["tutorial", "cli", "setup", "beginners"],
    author: "Maya Rodriguez",
    date: "2026-03-12",
    readTime: "8 min read",
    content: "Welcome to OpenForge! This tutorial will walk you through the installation process and help you run your first command...",
  },
  {
    title: "Connecting Multiple AI Providers",
    slug: "connecting-ai-providers",
    excerpt: "OpenForge supports a wide range of AI providers. Learn how to connect OpenAI, Anthropic, Groq, and local models, and switch between them seamlessly.",
    category: "Tutorials",
    tags: ["providers", "openai", "anthropic", "groq", "configuration"],
    author: "James Park",
    date: "2026-03-08",
    readTime: "10 min read",
    content: "One of OpenForge's core strengths is its ability to work with multiple AI providers. In this guide, we'll show you how to configure each provider...",
  },
  {
    title: "Building AI Agents with OpenSpaces",
    slug: "building-ai-agents-openspaces",
    excerpt: "Dive deep into the OpenSpaces architecture and learn how to build autonomous AI agents that can operate in isolated environments for complex multi-step tasks.",
    category: "Engineering",
    tags: ["agents", "openspaces", "architecture", "advanced"],
    author: "Sarah Kim",
    date: "2026-03-05",
    readTime: "12 min read",
    content: "OpenSpaces provide isolated environments where AI agents can execute tasks without interfering with your main workspace...",
  },
  {
    title: "OpenForge v1.2 Release Notes",
    slug: "v1-2-release-notes",
    excerpt: "Announcing OpenForge v1.2 with improved gateway routing, new provider integrations, enhanced security features, and a completely redesigned CLI experience.",
    category: "Announcements",
    tags: ["release", "v1.2", "changelog", "updates"],
    author: "Alex Chen",
    date: "2026-02-28",
    readTime: "4 min read",
    content: "We're excited to release OpenForge v1.2, packed with new features and improvements based on community feedback...",
  },
  {
    title: "How We Built the Gateway Architecture",
    slug: "gateway-architecture",
    excerpt: "A technical deep-dive into the intelligent routing system that powers OpenForge's multi-provider architecture, including failover logic and load balancing strategies.",
    category: "Engineering",
    tags: ["architecture", "gateway", "routing", "engineering"],
    author: "David Wu",
    date: "2026-02-20",
    readTime: "15 min read",
    content: "The gateway is the heart of OpenForge's provider management system. In this post, we'll explore the architectural decisions behind it...",
  },
];

const categories = ["All", "Announcements", "Tutorials", "Engineering", "Community"];

const categoryCounts = posts.reduce(
  (acc, post) => {
    acc[post.category] = (acc[post.category] || 0) + 1;
    return acc;
  },
  {} as Record<string, number>
);

const allTags = Array.from(new Set(posts.flatMap((p) => p.tags)));

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

export default function BlogPage() {
  const [activeCategory, setActiveCategory] = useState("All");
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [email, setEmail] = useState("");

  const filteredPosts = posts.filter((post) => {
    const matchesCategory = activeCategory === "All" || post.category === activeCategory;
    const matchesSearch =
      searchQuery === "" ||
      post.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      post.excerpt.toLowerCase().includes(searchQuery.toLowerCase()) ||
      post.tags.some((t) => t.toLowerCase().includes(searchQuery.toLowerCase()));
    return matchesCategory && matchesSearch;
  });

  const featuredPost = filteredPosts[0];
  const gridPosts = filteredPosts.slice(1);
  const postsPerPage = 4;
  const totalPages = Math.ceil(gridPosts.length / postsPerPage);
  const paginatedPosts = gridPosts.slice(
    (currentPage - 1) * postsPerPage,
    currentPage * postsPerPage
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

      <div className="relative z-10 max-w-7xl mx-auto px-6 pt-28 pb-20">
        <motion.div
          initial="hidden"
          animate="visible"
          variants={stagger}
          className="text-center mb-12"
        >
          <motion.h1
            variants={fadeUp}
            custom={0}
            className="text-5xl sm:text-6xl font-bold mb-4"
          >
            <span className="gradient-text">Blog</span>
          </motion.h1>
          <motion.p
            variants={fadeUp}
            custom={1}
            className="text-lg text-white/40 max-w-xl mx-auto"
          >
            Latest updates, tutorials, and insights
          </motion.p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="flex flex-wrap items-center justify-center gap-3 mb-14"
        >
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => {
                setActiveCategory(cat);
                setCurrentPage(1);
              }}
              className={cn(
                "px-4 py-2 rounded-full text-sm font-medium transition-all duration-300 border",
                activeCategory === cat
                  ? "bg-neon-blue/20 text-neon-blue border-neon-blue/40 neon-glow"
                  : "glass text-white/60 border-white/10 hover:text-white hover:border-white/20"
              )}
            >
              {cat}
            </button>
          ))}
        </motion.div>

        <div className="flex flex-col lg:flex-row gap-10">
          <div className="flex-1 min-w-0">
            {featuredPost && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
                className="mb-10"
              >
                <GlassCard glow className="group relative overflow-hidden">
                  <div className="absolute inset-0 bg-gradient-to-br from-neon-blue/5 to-neon-purple/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                  <div className="relative">
                    <div className="flex items-center gap-3 mb-4">
                      <span
                        className={cn(
                          "px-3 py-1 rounded-full text-xs font-medium border",
                          categoryColor(featuredPost.category)
                        )}
                      >
                        {featuredPost.category}
                      </span>
                      <span className="text-xs text-white/30">Featured</span>
                    </div>
                    <h2 className="text-2xl sm:text-3xl font-bold text-white mb-3 group-hover:text-neon-blue transition-colors">
                      {featuredPost.title}
                    </h2>
                    <p className="text-white/50 leading-relaxed mb-5 max-w-2xl">
                      {featuredPost.excerpt}
                    </p>
                    <div className="flex items-center gap-6 text-sm text-white/40 mb-6">
                      <span className="flex items-center gap-1.5">
                        <User className="h-4 w-4" />
                        {featuredPost.author}
                      </span>
                      <span className="flex items-center gap-1.5">
                        <Calendar className="h-4 w-4" />
                        {formatDate(featuredPost.date)}
                      </span>
                      <span className="flex items-center gap-1.5">
                        <Clock className="h-4 w-4" />
                        {featuredPost.readTime}
                      </span>
                    </div>
                    <Button variant="glow" asChild>
                      <Link
                        href={`/blog/${featuredPost.slug}`}
                        className="gap-2"
                      >
                        Read More <ArrowRight className="h-4 w-4" />
                      </Link>
                    </Button>
                  </div>
                </GlassCard>
              </motion.div>
            )}

            <motion.div
              initial="hidden"
              animate="visible"
              variants={stagger}
              className="grid grid-cols-1 md:grid-cols-2 gap-5"
            >
              {paginatedPosts.map((post, i) => (
                <motion.div key={post.slug} variants={fadeUp} custom={i}>
                  <Link href={`/blog/${post.slug}`}>
                    <GlassCard className="h-full group hover:border-white/20 transition-all duration-300 cursor-pointer relative overflow-hidden">
                      <div className="absolute inset-0 bg-gradient-to-br from-neon-blue/0 to-neon-purple/0 group-hover:from-neon-blue/5 group-hover:to-neon-purple/5 transition-all duration-500" />
                      <div className="relative">
                        <span
                          className={cn(
                            "inline-block px-3 py-1 rounded-full text-xs font-medium border mb-3",
                            categoryColor(post.category)
                          )}
                        >
                          {post.category}
                        </span>
                        <h3 className="text-lg font-semibold text-white mb-2 group-hover:text-neon-blue transition-colors line-clamp-2">
                          {post.title}
                        </h3>
                        <p className="text-sm text-white/40 leading-relaxed mb-4 line-clamp-3">
                          {post.excerpt}
                        </p>
                        <div className="flex items-center gap-4 text-xs text-white/30">
                          <span className="flex items-center gap-1">
                            <User className="h-3.5 w-3.5" />
                            {post.author}
                          </span>
                          <span className="flex items-center gap-1">
                            <Calendar className="h-3.5 w-3.5" />
                            {formatDate(post.date)}
                          </span>
                          <span className="flex items-center gap-1">
                            <Clock className="h-3.5 w-3.5" />
                            {post.readTime}
                          </span>
                        </div>
                      </div>
                    </GlassCard>
                  </Link>
                </motion.div>
              ))}
            </motion.div>

            {totalPages > 1 && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.6 }}
                className="flex items-center justify-center gap-2 mt-10"
              >
                <Button
                  variant="glass"
                  size="sm"
                  disabled={currentPage === 1}
                  onClick={() => setCurrentPage((p) => p - 1)}
                >
                  Previous
                </Button>
                {Array.from({ length: totalPages }, (_, i) => (
                  <button
                    key={i}
                    onClick={() => setCurrentPage(i + 1)}
                    className={cn(
                      "w-9 h-9 rounded-lg text-sm font-medium transition-all",
                      currentPage === i + 1
                        ? "bg-neon-blue/20 text-neon-blue border border-neon-blue/40"
                        : "glass text-white/50 hover:text-white"
                    )}
                  >
                    {i + 1}
                  </button>
                ))}
                <Button
                  variant="glass"
                  size="sm"
                  disabled={currentPage === totalPages}
                  onClick={() => setCurrentPage((p) => p + 1)}
                >
                  Next
                </Button>
              </motion.div>
            )}
          </div>

          <motion.aside
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.5 }}
            className="w-full lg:w-80 shrink-0 space-y-6"
          >
            <GlassCard>
              <h3 className="text-sm font-semibold text-white/80 mb-3 flex items-center gap-2">
                <Search className="h-4 w-4 text-neon-blue" />
                Search
              </h3>
              <Input
                placeholder="Search posts..."
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  setCurrentPage(1);
                }}
                className="bg-white/5 border-white/10 text-white placeholder:text-white/30"
              />
            </GlassCard>

            <GlassCard>
              <h3 className="text-sm font-semibold text-white/80 mb-3 flex items-center gap-2">
                <BookOpen className="h-4 w-4 text-neon-blue" />
                Categories
              </h3>
              <ul className="space-y-2">
                {Object.entries(categoryCounts).map(([cat, count]) => (
                  <li key={cat}>
                    <button
                      onClick={() => {
                        setActiveCategory(cat);
                        setCurrentPage(1);
                      }}
                      className={cn(
                        "w-full flex items-center justify-between px-3 py-2 rounded-lg text-sm transition-all",
                        activeCategory === cat
                          ? "bg-neon-blue/10 text-neon-blue"
                          : "text-white/50 hover:text-white hover:bg-white/5"
                      )}
                    >
                      <span>{cat}</span>
                      <span className="text-xs text-white/30">{count}</span>
                    </button>
                  </li>
                ))}
              </ul>
            </GlassCard>

            <GlassCard>
              <h3 className="text-sm font-semibold text-white/80 mb-3">Newsletter</h3>
              <p className="text-xs text-white/40 mb-3">
                Get the latest posts delivered to your inbox.
              </p>
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  setEmail("");
                }}
                className="space-y-2"
              >
                <Input
                  type="email"
                  placeholder="your@email.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="bg-white/5 border-white/10 text-white placeholder:text-white/30"
                />
                <Button variant="glow" size="sm" className="w-full">
                  Subscribe
                </Button>
              </form>
            </GlassCard>

            <GlassCard>
              <h3 className="text-sm font-semibold text-white/80 mb-3 flex items-center gap-2">
                <Tag className="h-4 w-4 text-neon-blue" />
                Popular Tags
              </h3>
              <div className="flex flex-wrap gap-2">
                {allTags.map((tag) => (
                  <button
                    key={tag}
                    onClick={() => {
                      setSearchQuery(tag);
                      setActiveCategory("All");
                      setCurrentPage(1);
                    }}
                    className="px-3 py-1 rounded-full text-xs glass text-white/50 hover:text-neon-blue hover:border-neon-blue/30 transition-all border border-transparent"
                  >
                    #{tag}
                  </button>
                ))}
              </div>
            </GlassCard>
          </motion.aside>
        </div>
      </div>
    </div>
  );
}
