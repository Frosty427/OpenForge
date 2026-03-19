"""Tests for openforge.plugin_manager module."""

import json
import pytest
from pathlib import Path
from openforge.plugin_manager.manifest import PluginManifest
from openforge.plugin_manager.loader import PluginLoader, PluginLoadError
from openforge.plugin_manager.manager import PluginManager
from openforge.plugins.base import BasePlugin, PluginMetadata, ToolResult


class TestPluginManifest:
    """Test the PluginManifest class."""

    def test_from_file(self, tmp_path):
        manifest_file = tmp_path / "plugin.json"
        manifest_file.write_text(
            json.dumps(
                {
                    "name": "test_plugin",
                    "version": "1.0.0",
                    "description": "A test plugin",
                    "author": "Test Author",
                    "enabled": True,
                    "entry_point": "main.py",
                    "permissions": ["read_files"],
                    "tools": [{"name": "tool1"}],
                }
            )
        )
        manifest = PluginManifest.from_file(manifest_file)
        assert manifest.name == "test_plugin"
        assert manifest.version == "1.0.0"
        assert manifest.description == "A test plugin"
        assert manifest.author == "Test Author"
        assert manifest.enabled is True
        assert manifest.entry_point == "main.py"
        assert manifest.permissions == ["read_files"]
        assert len(manifest.tools) == 1
        assert manifest.plugin_dir == tmp_path

    def test_from_file_missing_required_fields(self, tmp_path):
        manifest_file = tmp_path / "plugin.json"
        manifest_file.write_text(json.dumps({"name": "test"}))
        with pytest.raises(ValueError, match="missing required fields"):
            PluginManifest.from_file(manifest_file)

    def test_from_file_invalid_json(self, tmp_path):
        manifest_file = tmp_path / "plugin.json"
        manifest_file.write_text("not valid json")
        with pytest.raises(ValueError, match="Invalid JSON"):
            PluginManifest.from_file(manifest_file)

    def test_from_file_not_found(self, tmp_path):
        manifest_file = tmp_path / "nonexistent.json"
        with pytest.raises(FileNotFoundError):
            PluginManifest.from_file(manifest_file)

    def test_defaults(self, tmp_path):
        manifest_file = tmp_path / "plugin.json"
        manifest_file.write_text(
            json.dumps(
                {
                    "name": "test",
                    "version": "0.1.0",
                }
            )
        )
        manifest = PluginManifest.from_file(manifest_file)
        assert manifest.description == ""
        assert manifest.author == ""
        assert manifest.enabled is True
        assert manifest.entry_point == "main.py"
        assert manifest.permissions == []
        assert manifest.tools == []


class ConcretePlugin(BasePlugin):
    """Concrete plugin for testing."""

    @property
    def metadata(self):
        return PluginMetadata(name="test", version="1.0.0")

    def execute(self, tool_name: str, **kwargs):
        return ToolResult.ok()


class TestPluginManager:
    """Test the PluginManager class."""

    def test_register(self):
        manager = PluginManager()
        plugin = ConcretePlugin()
        manager.register(plugin)
        assert len(manager) == 1
        assert manager.get("test") is plugin

    def test_register_duplicate_raises(self):
        manager = PluginManager()
        plugin = ConcretePlugin()
        manager.register(plugin)
        with pytest.raises(ValueError, match="already registered"):
            manager.register(plugin)

    def test_unregister(self):
        manager = PluginManager()
        plugin = ConcretePlugin()
        manager.register(plugin)
        manager.unregister("test")
        assert len(manager) == 0
        assert manager.get("test") is None

    def test_unregister_nonexistent_raises(self):
        manager = PluginManager()
        with pytest.raises(KeyError, match="not registered"):
            manager.unregister("nonexistent")

    def test_get_nonexistent(self):
        manager = PluginManager()
        assert manager.get("nonexistent") is None

    def test_iter(self):
        manager = PluginManager()
        plugin1 = ConcretePlugin()
        manager.register(plugin1)
        plugins = list(manager)
        assert len(plugins) == 1
        assert plugins[0] is plugin1

    def test_plugin_names(self):
        manager = PluginManager()
        plugin = ConcretePlugin()
        manager.register(plugin)
        assert manager.plugin_names == ["test"]


class TestPluginLoader:
    """Test the PluginLoader class."""

    def test_discover(self, tmp_path):
        # Create a plugin directory structure
        plugin_dir = tmp_path / "test_plugin"
        plugin_dir.mkdir()
        manifest_file = plugin_dir / "plugin.json"
        manifest_file.write_text(
            json.dumps(
                {
                    "name": "test_plugin",
                    "version": "1.0.0",
                }
            )
        )
        loader = PluginLoader(tmp_path)
        manifests = loader.discover()
        assert len(manifests) == 1
        assert manifests[0].name == "test_plugin"

    def test_discover_disabled_skipped(self, tmp_path):
        plugin_dir = tmp_path / "disabled_plugin"
        plugin_dir.mkdir()
        manifest_file = plugin_dir / "plugin.json"
        manifest_file.write_text(
            json.dumps(
                {
                    "name": "disabled_plugin",
                    "version": "1.0.0",
                    "enabled": False,
                }
            )
        )
        loader = PluginLoader(tmp_path)
        manifests = loader.discover()
        assert len(manifests) == 0

    def test_discover_nonexistent_dir(self, tmp_path):
        loader = PluginLoader(tmp_path / "nonexistent")
        manifests = loader.discover()
        assert manifests == []

    def test_load(self, tmp_path):
        plugin_dir = tmp_path / "test_plugin"
        plugin_dir.mkdir()
        manifest_file = plugin_dir / "plugin.json"
        manifest_file.write_text(
            json.dumps(
                {
                    "name": "test_plugin",
                    "version": "1.0.0",
                }
            )
        )
        # Create a simple plugin module
        main_file = plugin_dir / "main.py"
        main_file.write_text("""
from openforge.plugins.base import BasePlugin, PluginMetadata, ToolResult

class TestPlugin(BasePlugin):
    @property
    def metadata(self):
        return PluginMetadata(name="test_plugin", version="1.0.0")

    def execute(self, tool_name, **kwargs):
        return ToolResult.ok()

def register():
    return TestPlugin()
""")
        loader = PluginLoader(tmp_path)
        manifest = PluginManifest.from_file(manifest_file)
        plugin = loader.load(manifest)
        assert plugin.metadata.name == "test_plugin"

    def test_load_missing_entry_point(self, tmp_path):
        plugin_dir = tmp_path / "test_plugin"
        plugin_dir.mkdir()
        manifest_file = plugin_dir / "plugin.json"
        manifest_file.write_text(
            json.dumps(
                {
                    "name": "test_plugin",
                    "version": "1.0.0",
                }
            )
        )
        loader = PluginLoader(tmp_path)
        manifest = PluginManifest.from_file(manifest_file)
        with pytest.raises(PluginLoadError, match="Entry point not found"):
            loader.load(manifest)

    def test_load_missing_register(self, tmp_path):
        plugin_dir = tmp_path / "test_plugin"
        plugin_dir.mkdir()
        manifest_file = plugin_dir / "plugin.json"
        manifest_file.write_text(
            json.dumps(
                {
                    "name": "test_plugin",
                    "version": "1.0.0",
                }
            )
        )
        main_file = plugin_dir / "main.py"
        main_file.write_text("# No register function")
        loader = PluginLoader(tmp_path)
        manifest = PluginManifest.from_file(manifest_file)
        with pytest.raises(PluginLoadError, match="must expose a callable 'register"):
            loader.load(manifest)
