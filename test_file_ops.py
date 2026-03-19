"""Verify file_ops plugin."""

import json
from pathlib import Path

from openforge.plugin_manager.loader import PluginLoader
from openforge.plugin_manager.manifest import PluginManifest
from openforge.core.tool_registry import PluginToolSpec

loader = PluginLoader(Path("plugins"))
manifest = PluginManifest.from_file(Path("plugins/file_ops/plugin.json"))
plugin = loader.load(manifest)

print("--- Testing list_files (.) ---")
res1 = plugin.execute("list_files", path=".")
print(f"Status: {res1.status.value}")
print(f"File count: {len(res1.data['items']) if res1.data else 0}")
print(f"Message: {res1.message}")

print("\n--- Testing read_file (pyproject.toml) ---")
res2 = plugin.execute("read_file", path="pyproject.toml")
print(f"Status: {res2.status.value}")
print(f"Content length: {len(res2.data['content']) if res2.data else 0}")
print(f"Message: {res2.message}")

print("\n--- Testing directory traversal protection (../) ---")
res3 = plugin.execute("read_file", path="../secrets.txt")
print(f"Status: {res3.status.value}")
print(f"Error: {res3.error}")

print("\n--- Testing absolute path protection (C:/secrets.txt) ---")
res4 = plugin.execute("read_file", path="C:/secrets.txt")
print(f"Status: {res4.status.value}")
print(f"Error: {res4.error}")
