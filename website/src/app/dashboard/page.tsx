"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  Terminal,
  Layers,
  GitBranch,
  Activity,
  Send,
  Copy,
  Check,
  Plus,
  RefreshCw,
  LogOut,
  User,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { GlassCard } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";
import { toast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";

interface UserData {
  id: string;
  name: string;
  email: string;
  createdAt: string;
}

interface Command {
  id: string;
  prompt: string;
  provider: string;
  model: string | null;
  output: string | null;
  status: string;
  createdAt: string;
}

interface Subspace {
  id: string;
  name: string;
  description: string | null;
  config: string | null;
  status: string;
  createdAt: string;
}

interface Workflow {
  id: string;
  name: string;
  description: string | null;
  steps: string | null;
  status: string;
  subspaceId: string | null;
  createdAt: string;
}

interface ActivityItem {
  id: string;
  type: "command" | "workflow" | "subspace";
  description: string;
  timestamp: string;
}

const AI_PROVIDERS = [
  { value: "openai", label: "OpenAI" },
  { value: "anthropic", label: "Anthropic" },
  { value: "groq", label: "Groq" },
  { value: "openrouter", label: "OpenRouter" },
  { value: "deepseek", label: "DeepSeek" },
  { value: "zai", label: "Z.ai" },
  { value: "local", label: "Local" },
];

const NAV_ITEMS = [
  { id: "command-center", label: "Command Center", icon: Terminal },
  { id: "subspaces", label: "Subspaces", icon: Layers },
  { id: "workflows", label: "Workflows", icon: GitBranch },
  { id: "activity", label: "Activity Log", icon: Activity },
];

const panelVariants = {
  initial: { opacity: 0, x: 20 },
  animate: { opacity: 1, x: 0 },
  exit: { opacity: 0, x: -20 },
};

export default function DashboardPage() {
  const router = useRouter();
  const [user, setUser] = useState<UserData | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("command-center");

  // Command Center state
  const [provider, setProvider] = useState("openai");
  const [model, setModel] = useState("");
  const [prompt, setPrompt] = useState("");
  const [output, setOutput] = useState("");
  const [executing, setExecuting] = useState(false);
  const [copied, setCopied] = useState(false);
  const [commandHistory, setCommandHistory] = useState<Command[]>([]);

  // Subspaces state
  const [subspaces, setSubspaces] = useState<Subspace[]>([]);
  const [showSubspaceModal, setShowSubspaceModal] = useState(false);
  const [newSubspaceName, setNewSubspaceName] = useState("");
  const [newSubspaceDesc, setNewSubspaceDesc] = useState("");

  // Workflows state
  const [workflows, setWorkflows] = useState<Workflow[]>([]);
  const [showWorkflowModal, setShowWorkflowModal] = useState(false);
  const [newWorkflowName, setNewWorkflowName] = useState("");
  const [newWorkflowDesc, setNewWorkflowDesc] = useState("");

  // Activity state
  const [activities, setActivities] = useState<ActivityItem[]>([]);

  const outputRef = useRef<HTMLDivElement>(null);

  const authFetch = useCallback(
    async (url: string, options?: RequestInit) => {
      const token = localStorage.getItem("token");
      const res = await fetch(url, {
        ...options,
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
          ...options?.headers,
        },
      });
      if (res.status === 401) {
        localStorage.removeItem("token");
        router.push("/login");
        throw new Error("Unauthorized");
      }
      return res;
    },
    [router]
  );

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      router.push("/login");
      return;
    }

    async function loadUser() {
      try {
        const res = await authFetch("/api/auth/me");
        if (!res.ok) throw new Error("Failed to fetch user");
        const data = await res.json();
        setUser(data.user);
      } catch {
        router.push("/login");
      } finally {
        setLoading(false);
      }
    }

    loadUser();
  }, [router, authFetch]);

  const loadCommandHistory = useCallback(async () => {
    try {
      const res = await authFetch("/api/commands/history");
      if (res.ok) {
        const data = await res.json();
        setCommandHistory(data.commands);
      }
    } catch {
      /* silent */
    }
  }, [authFetch]);

  const loadSubspaces = useCallback(async () => {
    try {
      const res = await authFetch("/api/subspaces");
      if (res.ok) {
        const data = await res.json();
        setSubspaces(data.subspaces);
      }
    } catch {
      /* silent */
    }
  }, [authFetch]);

  const loadWorkflows = useCallback(async () => {
    try {
      const res = await authFetch("/api/workflows");
      if (res.ok) {
        const data = await res.json();
        setWorkflows(data.workflows);
      }
    } catch {
      /* silent */
    }
  }, [authFetch]);

  useEffect(() => {
    if (user) {
      loadCommandHistory();
      loadSubspaces();
      loadWorkflows();
    }
  }, [user, loadCommandHistory, loadSubspaces, loadWorkflows]);

  const buildActivities = useCallback(() => {
    const items: ActivityItem[] = [];
    commandHistory.forEach((cmd) => {
      items.push({
        id: cmd.id,
        type: "command",
        description: `Executed: "${cmd.prompt}" via ${cmd.provider}`,
        timestamp: cmd.createdAt,
      });
    });
    workflows.forEach((wf) => {
      items.push({
        id: wf.id,
        type: "workflow",
        description: `Workflow "${wf.name}" ${wf.status}`,
        timestamp: wf.createdAt,
      });
    });
    subspaces.forEach((sp) => {
      items.push({
        id: sp.id,
        type: "subspace",
        description: `Subspace "${sp.name}" created`,
        timestamp: sp.createdAt,
      });
    });
    items.sort(
      (a, b) =>
        new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
    );
    setActivities(items);
  }, [commandHistory, workflows, subspaces]);

  useEffect(() => {
    buildActivities();
  }, [buildActivities]);

  async function executeCommand() {
    if (!prompt.trim()) return;
    setExecuting(true);
    setOutput("");

    try {
      const res = await authFetch("/api/commands/execute", {
        method: "POST",
        body: JSON.stringify({
          prompt: prompt.trim(),
          provider,
          model: model.trim() || undefined,
        }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Execution failed");
      }

      const data = await res.json();
      setOutput(data.command.output || "No output");
      setPrompt("");
      toast({ title: "Command executed", variant: "success" });
      loadCommandHistory();
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Unknown error";
      setOutput(`Error: ${message}`);
      toast({ title: "Execution failed", description: message, variant: "error" });
    } finally {
      setExecuting(false);
    }
  }

  function copyOutput() {
    if (!output) return;
    navigator.clipboard.writeText(output);
    setCopied(true);
    toast({ title: "Copied to clipboard", variant: "success" });
    setTimeout(() => setCopied(false), 2000);
  }

  async function createSubspace() {
    if (!newSubspaceName.trim()) return;
    try {
      const res = await authFetch("/api/subspaces", {
        method: "POST",
        body: JSON.stringify({
          name: newSubspaceName.trim(),
          description: newSubspaceDesc.trim() || undefined,
        }),
      });
      if (!res.ok) throw new Error("Failed to create subspace");
      toast({ title: "Subspace created", variant: "success" });
      setNewSubspaceName("");
      setNewSubspaceDesc("");
      setShowSubspaceModal(false);
      loadSubspaces();
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Unknown error";
      toast({ title: "Error", description: message, variant: "error" });
    }
  }

  async function createWorkflow() {
    if (!newWorkflowName.trim()) return;
    try {
      const res = await authFetch("/api/workflows", {
        method: "POST",
        body: JSON.stringify({
          name: newWorkflowName.trim(),
          description: newWorkflowDesc.trim() || undefined,
        }),
      });
      if (!res.ok) throw new Error("Failed to create workflow");
      toast({ title: "Workflow created", variant: "success" });
      setNewWorkflowName("");
      setNewWorkflowDesc("");
      setShowWorkflowModal(false);
      loadWorkflows();
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Unknown error";
      toast({ title: "Error", description: message, variant: "error" });
    }
  }

  function handleLogout() {
    localStorage.removeItem("token");
    document.cookie = "token=; path=/; max-age=0";
    router.push("/login");
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="flex flex-col items-center gap-4">
          <RefreshCw className="h-8 w-8 text-primary animate-spin" />
          <p className="text-muted-foreground">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background flex">
      {/* Ambient background effects */}
      <div className="fixed inset-0 pointer-events-none -z-10">
        <div className="absolute top-0 left-0 w-[600px] h-[600px] rounded-full bg-primary/5 blur-[150px]" />
        <div className="absolute bottom-0 right-0 w-[500px] h-[500px] rounded-full bg-purple-500/5 blur-[150px]" />
      </div>

      {/* Sidebar */}
      <aside className="w-[250px] border-r border-white/10 bg-black/40 backdrop-blur-xl flex flex-col fixed top-0 left-0 h-screen z-30">
        {/* User area */}
        <div className="p-5 border-b border-white/10">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-full bg-gradient-to-br from-primary to-purple-500 flex items-center justify-center">
              <User className="h-5 w-5 text-white" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-white truncate">
                {user?.name || "User"}
              </p>
              <p className="text-xs text-muted-foreground truncate">
                {user?.email || ""}
              </p>
            </div>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-3 space-y-1">
          {NAV_ITEMS.map((item) => {
            const Icon = item.icon;
            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={cn(
                  "w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all",
                  activeTab === item.id
                    ? "bg-primary/15 text-primary shadow-[inset_0_0_20px_rgba(0,212,255,0.1)]"
                    : "text-muted-foreground hover:text-white hover:bg-white/5"
                )}
              >
                <Icon className="h-4 w-4" />
                {item.label}
              </button>
            );
          })}
        </nav>

        <Separator className="bg-white/10" />

        {/* Logout */}
        <div className="p-3">
          <Button
            variant="ghost"
            className="w-full justify-start gap-3 text-muted-foreground hover:text-red-400 hover:bg-red-500/10"
            onClick={handleLogout}
          >
            <LogOut className="h-4 w-4" />
            Sign Out
          </Button>
        </div>
      </aside>

      {/* Main content */}
      <main className="flex-1 ml-[250px] p-6">
        <AnimatePresence mode="wait">
          {/* Command Center */}
          {activeTab === "command-center" && (
            <motion.div
              key="command-center"
              variants={panelVariants}
              initial="initial"
              animate="animate"
              exit="exit"
              transition={{ duration: 0.2 }}
              className="space-y-6"
            >
              <div className="flex items-center justify-between">
                <div>
                  <h1 className="text-2xl font-bold gradient-text">
                    Command Center
                  </h1>
                  <p className="text-sm text-muted-foreground mt-1">
                    Execute commands through your AI provider
                  </p>
                </div>
                <Button
                  variant="glass"
                  size="sm"
                  onClick={loadCommandHistory}
                >
                  <RefreshCw className="h-3.5 w-3.5 mr-2" />
                  Refresh
                </Button>
              </div>

              <div className="flex gap-6">
                {/* Main command area */}
                <div className="flex-1 space-y-4">
                  {/* Provider & Model selectors */}
                  <div className="flex gap-4">
                    <div className="flex-1">
                      <label className="text-xs text-muted-foreground mb-1.5 block">
                        AI Provider
                      </label>
                      <Select value={provider} onValueChange={setProvider}>
                        <SelectTrigger className="bg-white/5 border-white/10">
                          <SelectValue placeholder="Select provider" />
                        </SelectTrigger>
                        <SelectContent>
                          {AI_PROVIDERS.map((p) => (
                            <SelectItem key={p.value} value={p.value}>
                              {p.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="flex-1">
                      <label className="text-xs text-muted-foreground mb-1.5 block">
                        Model (optional)
                      </label>
                      <Input
                        placeholder="e.g. gpt-4o, claude-3-5-sonnet"
                        value={model}
                        onChange={(e) => setModel(e.target.value)}
                        className="bg-white/5 border-white/10"
                      />
                    </div>
                  </div>

                  {/* Command input */}
                  <GlassCard className="p-0 overflow-hidden">
                    <Textarea
                      placeholder="Enter your command..."
                      value={prompt}
                      onChange={(e) => setPrompt(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) {
                          e.preventDefault();
                          executeCommand();
                        }
                      }}
                      className="min-h-[120px] bg-transparent border-0 focus-visible:ring-0 resize-none text-white placeholder:text-muted-foreground"
                    />
                    <div className="flex items-center justify-between px-4 py-3 border-t border-white/10 bg-white/[0.02]">
                      <span className="text-xs text-muted-foreground">
                        Ctrl+Enter to execute
                      </span>
                      <Button
                        variant="glow"
                        size="sm"
                        onClick={executeCommand}
                        disabled={executing || !prompt.trim()}
                      >
                        {executing ? (
                          <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                        ) : (
                          <Send className="h-4 w-4 mr-2" />
                        )}
                        Execute
                      </Button>
                    </div>
                  </GlassCard>

                  {/* Output panel */}
                  <GlassCard glow className="relative">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-2">
                        <Terminal className="h-4 w-4 text-primary" />
                        <span className="text-sm font-medium text-white">
                          Output
                        </span>
                      </div>
                      {output && (
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-7 w-7"
                          onClick={copyOutput}
                        >
                          {copied ? (
                            <Check className="h-3.5 w-3.5 text-green-400" />
                          ) : (
                            <Copy className="h-3.5 w-3.5 text-muted-foreground" />
                          )}
                        </Button>
                      )}
                    </div>
                    <div
                      ref={outputRef}
                      className="bg-black/60 rounded-lg border border-white/5 p-4 min-h-[200px] max-h-[400px] overflow-auto font-mono text-sm"
                    >
                      {executing ? (
                        <div className="flex items-center gap-1 text-muted-foreground">
                          <span>Executing</span>
                          <span className="flex gap-0.5">
                            <span className="animate-bounce [animation-delay:0ms]">
                              .
                            </span>
                            <span className="animate-bounce [animation-delay:150ms]">
                              .
                            </span>
                            <span className="animate-bounce [animation-delay:300ms]">
                              .
                            </span>
                          </span>
                        </div>
                      ) : output ? (
                        <pre className="text-green-400 whitespace-pre-wrap break-words">
                          {output}
                        </pre>
                      ) : (
                        <p className="text-muted-foreground text-sm">
                          Output will appear here after execution.
                        </p>
                      )}
                    </div>
                  </GlassCard>
                </div>

                {/* Command history sidebar */}
                <div className="w-[280px] shrink-0">
                  <GlassCard>
                    <h3 className="text-sm font-medium text-white mb-3">
                      Recent Commands
                    </h3>
                    <ScrollArea className="h-[500px]">
                      <div className="space-y-2 pr-2">
                        {commandHistory.length === 0 ? (
                          <p className="text-xs text-muted-foreground py-4 text-center">
                            No commands yet
                          </p>
                        ) : (
                          commandHistory.slice(0, 20).map((cmd) => (
                            <button
                              key={cmd.id}
                              onClick={() => {
                                setPrompt(cmd.prompt);
                                setProvider(cmd.provider);
                                if (cmd.model) setModel(cmd.model);
                              }}
                              className="w-full text-left p-3 rounded-lg bg-white/[0.03] hover:bg-white/[0.06] border border-white/5 transition-colors"
                            >
                              <p className="text-sm text-white truncate font-mono">
                                {cmd.prompt}
                              </p>
                              <div className="flex items-center gap-2 mt-1.5">
                                <span className="text-[10px] px-1.5 py-0.5 rounded bg-primary/20 text-primary">
                                  {cmd.provider}
                                </span>
                                <span className="text-[10px] text-muted-foreground">
                                  {new Date(cmd.createdAt).toLocaleTimeString()}
                                </span>
                              </div>
                            </button>
                          ))
                        )}
                      </div>
                    </ScrollArea>
                  </GlassCard>
                </div>
              </div>
            </motion.div>
          )}

          {/* Subspaces */}
          {activeTab === "subspaces" && (
            <motion.div
              key="subspaces"
              variants={panelVariants}
              initial="initial"
              animate="animate"
              exit="exit"
              transition={{ duration: 0.2 }}
              className="space-y-6"
            >
              <div className="flex items-center justify-between">
                <div>
                  <h1 className="text-2xl font-bold gradient-text">Subspaces</h1>
                  <p className="text-sm text-muted-foreground mt-1">
                    Manage your isolated workspaces
                  </p>
                </div>
                <div className="flex gap-2">
                  <Button variant="glass" size="sm" onClick={loadSubspaces}>
                    <RefreshCw className="h-3.5 w-3.5 mr-2" />
                    Refresh
                  </Button>
                  <Button
                    variant="glow"
                    size="sm"
                    onClick={() => setShowSubspaceModal(true)}
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    New Subspace
                  </Button>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {subspaces.length === 0 ? (
                  <GlassCard className="col-span-full flex flex-col items-center justify-center py-16">
                    <Layers className="h-12 w-12 text-muted-foreground mb-4" />
                    <p className="text-muted-foreground">No subspaces yet</p>
                    <Button
                      variant="outline"
                      size="sm"
                      className="mt-4"
                      onClick={() => setShowSubspaceModal(true)}
                    >
                      Create your first subspace
                    </Button>
                  </GlassCard>
                ) : (
                  subspaces.map((sp) => (
                    <GlassCard key={sp.id} className="hover:border-primary/30 transition-colors">
                      <div className="flex items-start justify-between">
                        <div className="flex-1 min-w-0">
                          <h3 className="text-sm font-medium text-white truncate">
                            {sp.name}
                          </h3>
                          {sp.description && (
                            <p className="text-xs text-muted-foreground mt-1 line-clamp-2">
                              {sp.description}
                            </p>
                          )}
                        </div>
                        <span
                          className={cn(
                            "text-[10px] px-2 py-0.5 rounded-full font-medium",
                            sp.status === "active"
                              ? "bg-emerald-500/20 text-emerald-400"
                              : "bg-zinc-500/20 text-zinc-400"
                          )}
                        >
                          {sp.status || "active"}
                        </span>
                      </div>
                      <p className="text-[10px] text-muted-foreground mt-3">
                        Created {new Date(sp.createdAt).toLocaleDateString()}
                      </p>
                    </GlassCard>
                  ))
                )}
              </div>

              {/* Create Subspace Modal */}
              <AnimatePresence>
                {showSubspaceModal && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm"
                    onClick={() => setShowSubspaceModal(false)}
                  >
                    <motion.div
                      initial={{ scale: 0.95, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      exit={{ scale: 0.95, opacity: 0 }}
                      onClick={(e) => e.stopPropagation()}
                      className="w-full max-w-md"
                    >
                      <GlassCard>
                        <h2 className="text-lg font-semibold text-white mb-4">
                          Create Subspace
                        </h2>
                        <div className="space-y-4">
                          <div>
                            <label className="text-xs text-muted-foreground mb-1.5 block">
                              Name
                            </label>
                            <Input
                              placeholder="My Subspace"
                              value={newSubspaceName}
                              onChange={(e) => setNewSubspaceName(e.target.value)}
                              className="bg-white/5 border-white/10"
                              autoFocus
                            />
                          </div>
                          <div>
                            <label className="text-xs text-muted-foreground mb-1.5 block">
                              Description
                            </label>
                            <Textarea
                              placeholder="Optional description..."
                              value={newSubspaceDesc}
                              onChange={(e) => setNewSubspaceDesc(e.target.value)}
                              className="bg-white/5 border-white/10 min-h-[80px]"
                            />
                          </div>
                          <div className="flex gap-3 justify-end">
                            <Button
                              variant="ghost"
                              onClick={() => setShowSubspaceModal(false)}
                            >
                              Cancel
                            </Button>
                            <Button
                              variant="glow"
                              onClick={createSubspace}
                              disabled={!newSubspaceName.trim()}
                            >
                              Create
                            </Button>
                          </div>
                        </div>
                      </GlassCard>
                    </motion.div>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          )}

          {/* Workflows */}
          {activeTab === "workflows" && (
            <motion.div
              key="workflows"
              variants={panelVariants}
              initial="initial"
              animate="animate"
              exit="exit"
              transition={{ duration: 0.2 }}
              className="space-y-6"
            >
              <div className="flex items-center justify-between">
                <div>
                  <h1 className="text-2xl font-bold gradient-text">Workflows</h1>
                  <p className="text-sm text-muted-foreground mt-1">
                    Automate multi-step processes
                  </p>
                </div>
                <div className="flex gap-2">
                  <Button variant="glass" size="sm" onClick={loadWorkflows}>
                    <RefreshCw className="h-3.5 w-3.5 mr-2" />
                    Refresh
                  </Button>
                  <Button
                    variant="glow"
                    size="sm"
                    onClick={() => setShowWorkflowModal(true)}
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    New Workflow
                  </Button>
                </div>
              </div>

              <div className="space-y-3">
                {workflows.length === 0 ? (
                  <GlassCard className="flex flex-col items-center justify-center py-16">
                    <GitBranch className="h-12 w-12 text-muted-foreground mb-4" />
                    <p className="text-muted-foreground">No workflows yet</p>
                    <Button
                      variant="outline"
                      size="sm"
                      className="mt-4"
                      onClick={() => setShowWorkflowModal(true)}
                    >
                      Create your first workflow
                    </Button>
                  </GlassCard>
                ) : (
                  workflows.map((wf) => (
                    <GlassCard
                      key={wf.id}
                      className="flex items-center gap-4 hover:border-primary/30 transition-colors"
                    >
                      <div className="h-10 w-10 rounded-lg bg-gradient-to-br from-purple-500/20 to-primary/20 flex items-center justify-center border border-white/10">
                        <GitBranch className="h-5 w-5 text-purple-400" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="text-sm font-medium text-white truncate">
                          {wf.name}
                        </h3>
                        {wf.description && (
                          <p className="text-xs text-muted-foreground truncate">
                            {wf.description}
                          </p>
                        )}
                      </div>
                      <span
                        className={cn(
                          "text-[10px] px-2 py-0.5 rounded-full font-medium",
                          wf.status === "active"
                            ? "bg-emerald-500/20 text-emerald-400"
                            : wf.status === "running"
                            ? "bg-blue-500/20 text-blue-400"
                            : "bg-zinc-500/20 text-zinc-400"
                        )}
                      >
                        {wf.status || "idle"}
                      </span>
                      <span className="text-[10px] text-muted-foreground">
                        {new Date(wf.createdAt).toLocaleDateString()}
                      </span>
                    </GlassCard>
                  ))
                )}
              </div>

              {/* Create Workflow Modal */}
              <AnimatePresence>
                {showWorkflowModal && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm"
                    onClick={() => setShowWorkflowModal(false)}
                  >
                    <motion.div
                      initial={{ scale: 0.95, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      exit={{ scale: 0.95, opacity: 0 }}
                      onClick={(e) => e.stopPropagation()}
                      className="w-full max-w-md"
                    >
                      <GlassCard>
                        <h2 className="text-lg font-semibold text-white mb-4">
                          Create Workflow
                        </h2>
                        <div className="space-y-4">
                          <div>
                            <label className="text-xs text-muted-foreground mb-1.5 block">
                              Name
                            </label>
                            <Input
                              placeholder="My Workflow"
                              value={newWorkflowName}
                              onChange={(e) => setNewWorkflowName(e.target.value)}
                              className="bg-white/5 border-white/10"
                              autoFocus
                            />
                          </div>
                          <div>
                            <label className="text-xs text-muted-foreground mb-1.5 block">
                              Description
                            </label>
                            <Textarea
                              placeholder="Optional description..."
                              value={newWorkflowDesc}
                              onChange={(e) => setNewWorkflowDesc(e.target.value)}
                              className="bg-white/5 border-white/10 min-h-[80px]"
                            />
                          </div>
                          <div className="flex gap-3 justify-end">
                            <Button
                              variant="ghost"
                              onClick={() => setShowWorkflowModal(false)}
                            >
                              Cancel
                            </Button>
                            <Button
                              variant="glow"
                              onClick={createWorkflow}
                              disabled={!newWorkflowName.trim()}
                            >
                              Create
                            </Button>
                          </div>
                        </div>
                      </GlassCard>
                    </motion.div>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          )}

          {/* Activity Log */}
          {activeTab === "activity" && (
            <motion.div
              key="activity"
              variants={panelVariants}
              initial="initial"
              animate="animate"
              exit="exit"
              transition={{ duration: 0.2 }}
              className="space-y-6"
            >
              <div className="flex items-center justify-between">
                <div>
                  <h1 className="text-2xl font-bold gradient-text">
                    Activity Log
                  </h1>
                  <p className="text-sm text-muted-foreground mt-1">
                    Timeline of recent actions
                  </p>
                </div>
              </div>

              <GlassCard>
                {activities.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-16">
                    <Activity className="h-12 w-12 text-muted-foreground mb-4" />
                    <p className="text-muted-foreground">No activity yet</p>
                  </div>
                ) : (
                  <div className="relative pl-6">
                    <div className="absolute left-2 top-0 bottom-0 w-px bg-gradient-to-b from-primary/50 via-purple-500/50 to-transparent" />
                    <div className="space-y-6">
                      {activities.map((item, i) => (
                        <motion.div
                          key={item.id + item.type + i}
                          initial={{ opacity: 0, x: -10 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: i * 0.03 }}
                          className="relative"
                        >
                          <div
                            className={cn(
                              "absolute -left-[18px] top-1 h-3 w-3 rounded-full border-2 border-background",
                              item.type === "command"
                                ? "bg-primary"
                                : item.type === "workflow"
                                ? "bg-purple-500"
                                : "bg-cyan-500"
                            )}
                          />
                          <div>
                            <p className="text-sm text-white">
                              {item.description}
                            </p>
                            <p className="text-[10px] text-muted-foreground mt-0.5">
                              {new Date(item.timestamp).toLocaleString()}
                            </p>
                          </div>
                        </motion.div>
                      ))}
                    </div>
                  </div>
                )}
              </GlassCard>
            </motion.div>
          )}
        </AnimatePresence>
      </main>
    </div>
  );
}
