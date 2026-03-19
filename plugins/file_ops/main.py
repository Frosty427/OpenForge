"""File Operations Plugin."""

import os
from pathlib import Path
from typing import Any

from openforge.plugins.base import BasePlugin, PluginMetadata, ToolResult


class FileOpsPlugin(BasePlugin):
    """Provides safe file reading and listing tools."""

    @property
    def metadata(self) -> PluginMetadata:
        return PluginMetadata(
            name="file_ops",
            version="0.1.0",
            description="Safe file operations plugin.",
            author="OpenForge Contributors",
            enabled=True,
        )

    def execute(self, tool_name: str, **kwargs: Any) -> ToolResult:
        """Dispatch to the correct tool implementation."""
        path_str = kwargs.get("path", "")
        if not path_str:
            return ToolResult.fail("Missing required argument: 'path'")

        # -- Safe path validation --
        # 1. Prevent absolute paths
        if Path(path_str).is_absolute():
            return ToolResult.fail(f"Absolute paths not allowed: {path_str}")

        # 2. Prevent directory traversal
        if ".." in Path(path_str).parts:
            return ToolResult.fail("Directory traversal ('..') is not allowed.")

        # Resolve against the current working directory
        target_path = Path.cwd() / path_str
        target_path = target_path.resolve()

        # Extra safety check: ensure the resolved path is still within cwd
        try:
            target_path.relative_to(Path.cwd())
        except ValueError:
            return ToolResult.fail("Path escapes the current working directory.")

        if tool_name == "list_files":
            return self._list_files(target_path)
        elif tool_name == "read_file":
            return self._read_file(target_path)
        else:
            return ToolResult.fail(
                error=f"Unknown tool: '{tool_name}'", 
                message=f"Tool {tool_name} not supported by file_ops."
            )

    def _list_files(self, path: Path) -> ToolResult:
        if not path.exists():
            return ToolResult.fail(f"Directory not found: {path.name}")
        if not path.is_dir():
            return ToolResult.fail(f"Not a directory: {path.name}")

        try:
            items = []
            for item in path.iterdir():
                items.append({
                    "name": item.name,
                    "type": "directory" if item.is_dir() else "file",
                    "size": item.stat().st_size if item.is_file() else None,
                })
            
            # Sort directories first, then alphabetically
            items.sort(key=lambda x: (x["type"] != "directory", x["name"]))
            
            try:
                rel_path = str(path.relative_to(Path.cwd()))
            except ValueError:
                rel_path = str(path)

            return ToolResult.ok(
                data={"path": rel_path, "items": items},
                message=f"Listed {len(items)} items in {path.name}",
            )
        except Exception as exc:  # noqa: BLE001
            return ToolResult.fail(f"Failed to list directory: {exc}")

    def _read_file(self, path: Path) -> ToolResult:
        if not path.exists():
            return ToolResult.fail(f"File not found: {path.name}")
        if not path.is_file():
            return ToolResult.fail(f"Not a regular file: {path.name}")

        try:
            content = path.read_text(encoding="utf-8")
            try:
                rel_path = str(path.relative_to(Path.cwd()))
            except ValueError:
                rel_path = str(path)

            return ToolResult.ok(
                data={"path": rel_path, "content": content},
                message=f"Successfully read {path.name} ({len(content)} chars)",
            )
        except UnicodeDecodeError:
            return ToolResult.fail("Cannot read binary files. Must be utf-8 text.")
        except Exception as exc:  # noqa: BLE001
            return ToolResult.fail(f"Failed to read file: {exc}")


def register() -> BasePlugin:
    """Plugin entry point."""
    return FileOpsPlugin()
