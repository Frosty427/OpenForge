#!/usr/bin/env python
"""OpenForge — Main Entry Point

Provides a convenient script to launch the CLI without installing the package.

Usage:
    python main.py "List the files in this directory."
    python main.py repl
    python main.py plugins
"""

from openforge.interfaces.cli.app import main

if __name__ == "__main__":
    main()
