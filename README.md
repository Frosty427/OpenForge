# 🔥 OpenForge

A CLI-based AI agent with a modular plugin system.

## Quick Start

```bash
# Install with uv
uv pip install -e .

# Or with pip
pip install -e .

# Run the CLI
openforge --help
```

## Project Structure

```
src/openforge/
├── core/             # Core agent logic and base abstractions
├── plugins/          # Built-in plugin implementations
├── plugin_manager/   # Plugin discovery, loading, and lifecycle
├── providers/        # AI provider integrations (LLM backends)
├── interfaces/
│   └── cli/          # CLI entrypoint and commands
```

## Development

```bash
# Install dev dependencies
uv pip install -e ".[dev]"

# Run linter
ruff check src/

# Run tests
pytest
```

# Note
This project is under development (BETA)

## License

GNU General Public License v3.0
