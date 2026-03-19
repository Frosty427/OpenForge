"""Plugin manifest loader — reads and validates *plugin.json* files."""

from __future__ import annotations

import json
import logging
from dataclasses import dataclass, field
from pathlib import Path

logger = logging.getLogger(__name__)

_REQUIRED_FIELDS = {"name", "version"}


@dataclass(frozen=True)
class PluginManifest:
    """Parsed representation of a ``plugin.json`` manifest.

    Attributes:
        name: Unique identifier for the plugin (e.g. ``"hello_world"``).
        version: SemVer string (e.g. ``"0.1.0"``).
        description: Short human-readable description.
        author: Author or organisation name.
        enabled: Whether the plugin should be loaded at startup.
        entry_point: Python module file that exposes a ``register()`` function.
        permissions: List of permission strings the plugin requires.
        tools: Raw tool specifications declared in the manifest.
        plugin_dir: Absolute path to the plugin directory on disk.
    """

    name: str
    version: str
    description: str = ""
    author: str = ""
    enabled: bool = True
    entry_point: str = "main.py"
    permissions: list[str] = field(default_factory=list)
    tools: list[dict] = field(default_factory=list)
    plugin_dir: Path = field(default_factory=lambda: Path("."))

    # -- factory ----------------------------------------------------------

    @classmethod
    def from_file(cls, path: Path) -> PluginManifest:
        """Load and validate a manifest from a ``plugin.json`` file.

        Parameters:
            path: Path to the ``plugin.json`` file.

        Returns:
            A validated :class:`PluginManifest` instance.

        Raises:
            FileNotFoundError: If the manifest file does not exist.
            ValueError: If required fields are missing or the JSON is invalid.
        """
        if not path.is_file():
            msg = f"Manifest not found: {path}"
            raise FileNotFoundError(msg)

        text = path.read_text(encoding="utf-8")

        try:
            raw: dict = json.loads(text)
        except json.JSONDecodeError as exc:
            msg = f"Invalid JSON in {path}: {exc}"
            raise ValueError(msg) from exc

        missing = _REQUIRED_FIELDS - raw.keys()
        if missing:
            msg = f"Manifest {path} is missing required fields: {', '.join(sorted(missing))}"
            raise ValueError(msg)

        return cls(
            name=raw["name"],
            version=raw["version"],
            description=raw.get("description", ""),
            author=raw.get("author", ""),
            enabled=raw.get("enabled", True),
            entry_point=raw.get("entry_point", "main.py"),
            permissions=raw.get("permissions", []),
            tools=raw.get("tools", []),
            plugin_dir=path.parent.resolve(),
        )
