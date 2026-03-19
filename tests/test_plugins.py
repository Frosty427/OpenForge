"""Tests for the built-in plugins."""

import json
import pytest
from pathlib import Path
from openforge.plugin_manager.loader import PluginLoader
from openforge.plugin_manager.manifest import PluginManifest


class TestHelloWorldPlugin:
    """Test the hello_world plugin."""

    def test_load(self):
        loader = PluginLoader(Path("plugins"))
        manifest = PluginManifest.from_file(Path("plugins/hello_world/plugin.json"))
        plugin = loader.load(manifest)
        assert plugin.metadata.name == "hello_world"
        assert plugin.metadata.version == "0.1.0"

    def test_greet_default(self):
        loader = PluginLoader(Path("plugins"))
        manifest = PluginManifest.from_file(Path("plugins/hello_world/plugin.json"))
        plugin = loader.load(manifest)
        result = plugin.execute("greet")
        assert result.is_success
        assert "Hello, World!" in result.data["greeting"]

    def test_greet_with_name(self):
        loader = PluginLoader(Path("plugins"))
        manifest = PluginManifest.from_file(Path("plugins/hello_world/plugin.json"))
        plugin = loader.load(manifest)
        result = plugin.execute("greet", name="Alice")
        assert result.is_success
        assert "Hello, Alice!" in result.data["greeting"]


class TestFileOpsPlugin:
    """Test the file_ops plugin."""

    def test_load(self):
        loader = PluginLoader(Path("plugins"))
        manifest = PluginManifest.from_file(Path("plugins/file_ops/plugin.json"))
        plugin = loader.load(manifest)
        assert plugin.metadata.name == "file_ops"
        assert plugin.metadata.version == "0.1.0"

    def test_list_files(self):
        loader = PluginLoader(Path("plugins"))
        manifest = PluginManifest.from_file(Path("plugins/file_ops/plugin.json"))
        plugin = loader.load(manifest)
        result = plugin.execute("list_files", path=".")
        assert result.is_success
        assert "items" in result.data
        assert isinstance(result.data["items"], list)

    def test_read_file(self):
        loader = PluginLoader(Path("plugins"))
        manifest = PluginManifest.from_file(Path("plugins/file_ops/plugin.json"))
        plugin = loader.load(manifest)
        result = plugin.execute("read_file", path="pyproject.toml")
        assert result.is_success
        assert "content" in result.data
        assert len(result.data["content"]) > 0

    def test_missing_path(self):
        loader = PluginLoader(Path("plugins"))
        manifest = PluginManifest.from_file(Path("plugins/file_ops/plugin.json"))
        plugin = loader.load(manifest)
        result = plugin.execute("list_files")
        assert not result.is_success
        assert "Missing required argument" in result.error

    def test_directory_traversal(self):
        loader = PluginLoader(Path("plugins"))
        manifest = PluginManifest.from_file(Path("plugins/file_ops/plugin.json"))
        plugin = loader.load(manifest)
        result = plugin.execute("read_file", path="../secrets.txt")
        assert not result.is_success
        assert "Directory traversal" in result.error

    def test_absolute_path(self):
        loader = PluginLoader(Path("plugins"))
        manifest = PluginManifest.from_file(Path("plugins/file_ops/plugin.json"))
        plugin = loader.load(manifest)
        result = plugin.execute("read_file", path="C:/secrets.txt")
        assert not result.is_success
        assert "Absolute paths not allowed" in result.error

    def test_nonexistent_file(self):
        loader = PluginLoader(Path("plugins"))
        manifest = PluginManifest.from_file(Path("plugins/file_ops/plugin.json"))
        plugin = loader.load(manifest)
        result = plugin.execute("read_file", path="nonexistent.txt")
        assert not result.is_success
        assert "File not found" in result.error

    def test_unknown_tool(self):
        loader = PluginLoader(Path("plugins"))
        manifest = PluginManifest.from_file(Path("plugins/file_ops/plugin.json"))
        plugin = loader.load(manifest)
        result = plugin.execute("unknown_tool", path=".")
        assert not result.is_success
        assert "Unknown tool" in result.error
