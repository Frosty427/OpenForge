"""Dynamic plugin loader — discovers and imports plugins from disk."""

from __future__ import annotations

import importlib.util
import logging
import sys
from pathlib import Path
from types import ModuleType

from openforge.plugin_manager.manifest import PluginManifest
from openforge.plugins.base import BasePlugin

logger = logging.getLogger(__name__)

_MANIFEST_FILENAME = "plugin.json"


class PluginLoadError(Exception):
    """Raised when a plugin cannot be loaded."""


class PluginLoader:
    """Discovers plugin directories, reads manifests, and imports plugins.

    Usage::

        loader = PluginLoader(plugins_dir=Path("plugins"))
        for plugin in loader.load_all():
            plugin_manager.register(plugin)
    """

    def __init__(self, plugins_dir: Path) -> None:
        self._plugins_dir = plugins_dir.resolve()

    # -- public API -------------------------------------------------------

    def discover(self) -> list[PluginManifest]:
        """Scan *plugins_dir* for sub-directories containing a ``plugin.json``.

        Returns:
            A list of parsed :class:`PluginManifest` instances for every
            *enabled* plugin found.
        """
        if not self._plugins_dir.is_dir():
            logger.warning("Plugins directory does not exist: %s", self._plugins_dir)
            return []

        manifests: list[PluginManifest] = []
        for child in sorted(self._plugins_dir.iterdir()):
            manifest_path = child / _MANIFEST_FILENAME
            if not child.is_dir() or not manifest_path.exists():
                continue
            try:
                manifest = PluginManifest.from_file(manifest_path)
            except (FileNotFoundError, ValueError):
                logger.exception("Skipping invalid manifest in %s", child)
                continue

            if not manifest.enabled:
                logger.info("Plugin '%s' is disabled — skipping.", manifest.name)
                continue

            manifests.append(manifest)

        logger.info("Discovered %d plugin(s) in %s", len(manifests), self._plugins_dir)
        return manifests

    def load(self, manifest: PluginManifest) -> BasePlugin:
        """Import a single plugin from its *manifest* and return an instance.

        The entry-point module (default ``main.py``) must expose a
        ``register()`` callable that returns a :class:`BasePlugin` instance.

        Raises:
            PluginLoadError: On any import or contract violation.
        """
        entry_path = manifest.plugin_dir / manifest.entry_point
        if not entry_path.is_file():
            msg = f"Entry point not found for '{manifest.name}': {entry_path}"
            raise PluginLoadError(msg)

        module = self._import_module(
            module_name=f"openforge_plugin_{manifest.name}",
            file_path=entry_path,
        )

        register_fn = getattr(module, "register", None)
        if register_fn is None or not callable(register_fn):
            msg = (
                f"Plugin '{manifest.name}' entry point ({manifest.entry_point}) "
                "must expose a callable 'register()' function."
            )
            raise PluginLoadError(msg)

        plugin = register_fn()

        if not isinstance(plugin, BasePlugin):
            msg = (
                f"'register()' in plugin '{manifest.name}' must return a "
                f"BasePlugin instance, got {type(plugin).__name__}."
            )
            raise PluginLoadError(msg)

        logger.info("Loaded plugin: %s v%s", manifest.name, manifest.version)
        return plugin

    def load_all(self) -> list[BasePlugin]:
        """Discover and load all enabled plugins.

        Plugins that fail to load are logged and skipped.
        """
        loaded: list[BasePlugin] = []
        for manifest in self.discover():
            try:
                plugin = self.load(manifest)
            except PluginLoadError:
                logger.exception("Failed to load plugin '%s'", manifest.name)
                continue
            loaded.append(plugin)
        return loaded

    # -- internals --------------------------------------------------------

    @staticmethod
    def _import_module(module_name: str, file_path: Path) -> ModuleType:
        """Import a Python module from an absolute file path."""
        spec = importlib.util.spec_from_file_location(module_name, file_path)
        if spec is None or spec.loader is None:
            msg = f"Cannot create module spec for {file_path}"
            raise PluginLoadError(msg)

        module = importlib.util.module_from_spec(spec)
        sys.modules[module_name] = module
        spec.loader.exec_module(module)
        return module
