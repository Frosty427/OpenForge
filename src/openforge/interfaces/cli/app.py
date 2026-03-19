"""CLI entrypoint for OpenForge — built with Typer + Rich."""

from __future__ import annotations

import asyncio
import os
from pathlib import Path
from typing import Annotated, Optional

import typer
from rich.console import Console
from rich.markdown import Markdown
from rich.panel import Panel
from rich.table import Table

from openforge import __version__
from openforge.core.agent import Agent, AgentConfig
from openforge.core.tool_registry import ToolRegistry, parse_tool_specs_from_manifest
from openforge.plugin_manager.loader import PluginLoader
from openforge.plugin_manager.manager import PluginManager

console = Console()

# ---------------------------------------------------------------------------
# App
# ---------------------------------------------------------------------------

app = typer.Typer(
    name="openforge",
    help="🔥 OpenForge — A CLI-based AI agent with a plugin system.",
    no_args_is_help=False,
    rich_markup_mode="rich",
    add_completion=False,
)


# ---------------------------------------------------------------------------
# Shared state + helpers
# ---------------------------------------------------------------------------


def _find_project_root() -> Path:
    """Walk up from this file to find the directory containing pyproject.toml."""
    current = Path(__file__).resolve().parent
    for parent in [current, *current.parents]:
        if (parent / "pyproject.toml").is_file():
            return parent
    return Path(__file__).resolve().parents[4]


_DEFAULT_PLUGINS_DIR = _find_project_root() / "plugins"

# Mutable state shared between the callback and sub-commands.
_state: dict = {
    "verbose": False,
    "plugins_dir": _DEFAULT_PLUGINS_DIR,
}


def _build_components() -> tuple[PluginManager, ToolRegistry]:
    """Discover plugins and build a PluginManager + ToolRegistry."""
    plugins_dir: Path = _state["plugins_dir"]

    loader = PluginLoader(plugins_dir)
    manager = PluginManager()
    registry = ToolRegistry()

    for manifest in loader.discover():
        try:
            plugin = loader.load(manifest)
        except Exception:
            continue
        manager.register(plugin)
        specs = parse_tool_specs_from_manifest(
            {"name": manifest.name, "tools": manifest.tools}
        )
        registry.register(plugin, specs if specs else None)

    if _state["verbose"]:
        console.print(
            f"[dim]Loaded {len(manager)} plugin(s), "
            f"{len(registry)} tool(s) from {plugins_dir}[/dim]"
        )

    return manager, registry


def _make_provider(verbose: bool = False):
    """Try to create an OpenAI provider from env vars. Returns None on failure."""
    api_key = os.environ.get("OPENAI_API_KEY", "")
    if not api_key:
        if verbose:
            console.print("[dim]No OPENAI_API_KEY — running in echo mode[/dim]")
        return None

    try:
        from openforge.providers.openai import OpenAIProvider

        model = os.environ.get("OPENFORGE_MODEL", "gpt-4o")
        if verbose:
            console.print(f"[dim]Using provider: OpenAI ({model})[/dim]")
        return OpenAIProvider(api_key=api_key, model=model)
    except ImportError:
        if verbose:
            console.print("[dim]openai not installed — echo mode[/dim]")
        return None


def _build_agent() -> Agent:
    """Build a fully-wired Agent."""
    verbose = _state["verbose"]
    _manager, registry = _build_components()
    provider = _make_provider(verbose)
    config = AgentConfig(verbose=verbose)
    return Agent(config=config, provider=provider, tool_registry=registry)


def _run_prompt(agent: Agent, prompt: str) -> None:
    """Run a prompt through the agent and print the result."""
    with console.status("[bold cyan]Thinking…[/bold cyan]"):
        response = asyncio.run(agent.run(prompt))

    console.print()
    console.print(Markdown(response.text))

    if _state["verbose"]:
        console.print(
            f"\n[dim]({response.iterations} iteration(s), "
            f"{response.tool_calls_made} tool call(s))[/dim]"
        )


def _version_callback(value: bool) -> None:
    if value:
        console.print(f"[bold cyan]openforge[/bold cyan] [dim]v{__version__}[/dim]")
        raise typer.Exit()


# ---------------------------------------------------------------------------
# Root callback + default command
# ---------------------------------------------------------------------------


@app.callback(invoke_without_command=True)
def root(
    ctx: typer.Context,
    verbose: Annotated[
        bool,
        typer.Option("--verbose", "-v", help="Enable verbose output."),
    ] = False,
    plugins_dir: Annotated[
        Optional[Path],
        typer.Option("--plugins-dir", help="Plugin directory path."),
    ] = None,
    version: Annotated[
        Optional[bool],
        typer.Option("--version", help="Show version and exit.", callback=_version_callback,
                     is_eager=True),
    ] = None,
) -> None:
    """🔥 OpenForge — A CLI-based AI agent with a plugin system."""
    _state["verbose"] = verbose
    _state["plugins_dir"] = (plugins_dir or _DEFAULT_PLUGINS_DIR).resolve()

    # No sub-command → show banner
    if ctx.invoked_subcommand is None:
        console.print(
            Panel.fit(
                f"[bold cyan]OpenForge[/bold cyan] [dim]v{__version__}[/dim]\n"
                "[green]A CLI-based AI agent with a plugin system.[/green]\n\n"
                "[bold]Usage:[/bold]\n"
                '  openforge [green]"your prompt here"[/green]\n'
                "  openforge [green]repl[/green]\n"
                "  openforge [green]plugins[/green]\n"
                "  openforge [green]--help[/green]",
                border_style="bright_blue",
                title="Welcome",
            )
        )

@app.command(hidden=True)
def ask(
    prompt: Annotated[str, typer.Argument(help="Send a prompt directly to the agent.")],
) -> None:
    agent = _build_agent()
    _run_prompt(agent, prompt)


# ---------------------------------------------------------------------------
# REPL
# ---------------------------------------------------------------------------


@app.command()
def repl(
    system: Annotated[
        Optional[str],
        typer.Option("--system", "-s", help="Custom system prompt for the session."),
    ] = None,
) -> None:
    """Start an interactive REPL session with the agent."""
    agent = _build_agent()

    if system:
        agent.config.system_prompt = system

    console.print(
        Panel.fit(
            "[bold cyan]OpenForge REPL[/bold cyan]\n"
            "[dim]Type your prompts below. Commands:[/dim]\n"
            "  [green]/quit[/green]    — exit the REPL\n"
            "  [green]/clear[/green]   — reset conversation\n"
            "  [green]/verbose[/green] — toggle verbose mode\n"
            "  [green]/plugins[/green] — list loaded plugins",
            border_style="bright_blue",
        )
    )

    # Persistent conversation history for multi-turn
    history: list = []

    while True:
        try:
            user_input = console.input("\n[bold green]❯[/bold green] ").strip()
        except (KeyboardInterrupt, EOFError):
            console.print("\n[dim]Goodbye! 👋[/dim]")
            break

        if not user_input:
            continue

        # -- REPL meta-commands -------------------------------------------
        if user_input.lower() in ("/quit", "/exit", "/q"):
            console.print("[dim]Goodbye! 👋[/dim]")
            break

        if user_input.lower() == "/clear":
            history.clear()
            console.print("[yellow]Conversation cleared.[/yellow]")
            continue

        if user_input.lower() == "/verbose":
            _state["verbose"] = not _state["verbose"]
            agent.config.verbose = _state["verbose"]
            status = "on" if _state["verbose"] else "off"
            console.print(f"[yellow]Verbose mode: {status}[/yellow]")
            continue

        if user_input.lower() == "/plugins":
            _show_plugins()
            continue

        # -- Send to agent ------------------------------------------------
        try:
            with console.status("[bold cyan]Thinking…[/bold cyan]"):
                response = asyncio.run(agent.run(user_input))

            console.print()
            console.print(Markdown(response.text))

            if _state["verbose"]:
                console.print(
                    f"\n[dim]({response.iterations} iteration(s), "
                    f"{response.tool_calls_made} tool call(s))[/dim]"
                )
        except Exception as exc:
            console.print(f"[red]Error: {exc}[/red]")


# ---------------------------------------------------------------------------
# Plugins
# ---------------------------------------------------------------------------


@app.command()
def plugins() -> None:
    """List all discovered plugins and their tools."""
    _show_plugins()


def _show_plugins() -> None:
    """Shared implementation for the plugins command and /plugins REPL command."""
    manager, registry = _build_components()

    if not len(manager):
        console.print("[yellow]No plugins discovered.[/yellow]")
        return

    table = Table(title="Registered Plugins", border_style="bright_blue")
    table.add_column("Plugin", style="bold cyan")
    table.add_column("Version", style="green")
    table.add_column("Tools", style="magenta")
    table.add_column("Description")

    for plugin in manager:
        meta = plugin.metadata
        tools = [
            name for name in registry.tool_names
            if registry.get_plugin_for_tool(name) is plugin
        ]
        table.add_row(
            meta.name,
            meta.version,
            ", ".join(tools) if tools else "—",
            meta.description,
        )

    console.print(table)


# ---------------------------------------------------------------------------
# Run Plugin
# ---------------------------------------------------------------------------


@app.command(name="run-plugin")
def run_plugin(
    plugin_name: Annotated[str, typer.Argument(help="Name of the plugin to execute.")],
    name: Annotated[str, typer.Option("--name", help="Name argument (for hello_world).")] = "World",
) -> None:
    """Execute a specific plugin by name."""
    manager, _ = _build_components()
    plugin = manager.get(plugin_name)

    if plugin is None:
        console.print(f"[red]Plugin '{plugin_name}' not found.[/red]")
        raise typer.Exit(code=1)

    # For manual CLI runs, default the tool_name to the plugin's name.
    result = plugin.execute(plugin.metadata.name, name=name)
    if result.is_success:
        console.print(f"[green]✔ {result.message}[/green]")
    else:
        console.print(f"[red]✘ {result.error}[/red]")


# ---------------------------------------------------------------------------
# Entrypoint
# ---------------------------------------------------------------------------


def main() -> None:
    """Entrypoint called by the console_scripts entry point."""
    import sys
    
    # Typer doesn't natively support default positional commands alongside subcommands.
    # To support `openforge "prompt"`, we inject a hidden `ask` command into sys.argv
    # if the first argument isn't a known command or flag.
    known_commands = {"repl", "plugins", "run-plugin"}
    if len(sys.argv) > 1 and sys.argv[1] not in known_commands and not sys.argv[1].startswith("-"):
        sys.argv.insert(1, "ask")

    app()


if __name__ == "__main__":
    main()
