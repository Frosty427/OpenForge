"""Plugin manager — discovers, loads, and manages plugin lifecycles."""

from __future__ import annotations

import logging
from typing import Iterator

from openforge.plugins.base import BasePlugin

logger = logging.getLogger(__name__)


class PluginManager:
    """Registry that manages the lifecycle of :class:`BasePlugin` instances."""

    def __init__(self) -> None:
        self._plugins: dict[str, BasePlugin] = {}

    # -- registration -----------------------------------------------------

    def register(self, plugin: BasePlugin) -> None:
        """Register and load a plugin."""
        name = plugin.metadata.name
        if name in self._plugins:
            msg = f"Plugin '{name}' is already registered."
            raise ValueError(msg)
        plugin.on_load()
        self._plugins[name] = plugin
        logger.info("Registered plugin: %s v%s", name, plugin.metadata.version)

    def unregister(self, name: str) -> None:
        """Unload and remove a plugin by name."""
        plugin = self._plugins.pop(name, None)
        if plugin is None:
            msg = f"Plugin '{name}' is not registered."
            raise KeyError(msg)
        plugin.on_unload()
        logger.info("Unregistered plugin: %s", name)

    # -- access -----------------------------------------------------------

    def get(self, name: str) -> BasePlugin | None:
        """Return a plugin by name, or ``None`` if not found."""
        return self._plugins.get(name)

    def __iter__(self) -> Iterator[BasePlugin]:
        """Iterate over all registered plugins."""
        return iter(self._plugins.values())

    def __len__(self) -> int:
        return len(self._plugins)

    @property
    def plugin_names(self) -> list[str]:
        """Return a sorted list of registered plugin names."""
        return sorted(self._plugins.keys())
