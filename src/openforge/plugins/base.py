"""Base plugin interface and result types for the OpenForge plugin system."""

from __future__ import annotations

from abc import ABC, abstractmethod
from dataclasses import dataclass, field
from enum import Enum
from typing import Any


# ---------------------------------------------------------------------------
# Result types
# ---------------------------------------------------------------------------


class ToolStatus(Enum):
    """Outcome status of a plugin tool execution."""

    SUCCESS = "success"
    ERROR = "error"


@dataclass(frozen=True)
class ToolResult:
    """Structured result returned by every plugin execution.

    Attributes:
        status: Whether the tool call succeeded or failed.
        data: Arbitrary payload returned on success.
        message: Human-readable summary of what happened.
        error: Error detail string when *status* is ``ERROR``.
    """

    status: ToolStatus
    data: Any = None
    message: str = ""
    error: str | None = None

    # -- convenience constructors -----------------------------------------

    @classmethod
    def ok(cls, data: Any = None, *, message: str = "") -> ToolResult:
        """Create a successful result."""
        return cls(status=ToolStatus.SUCCESS, data=data, message=message)

    @classmethod
    def fail(cls, error: str, *, message: str = "") -> ToolResult:
        """Create a failed result."""
        return cls(status=ToolStatus.ERROR, error=error, message=message)

    @property
    def is_success(self) -> bool:
        return self.status is ToolStatus.SUCCESS


# ---------------------------------------------------------------------------
# Plugin metadata
# ---------------------------------------------------------------------------


@dataclass(frozen=True)
class PluginMetadata:
    """Descriptive metadata for a plugin, typically loaded from *plugin.json*."""

    name: str
    version: str
    description: str = ""
    author: str = ""
    enabled: bool = True
    permissions: list[str] = field(default_factory=list)


# ---------------------------------------------------------------------------
# Base plugin
# ---------------------------------------------------------------------------


class BasePlugin(ABC):
    """Abstract base class that every OpenForge plugin must extend.

    A concrete plugin only needs to implement :pymethod:`metadata` and
    :pymethod:`execute`.  The lifecycle hooks *on_load* / *on_unload* are
    optional override points.
    """

    @property
    @abstractmethod
    def metadata(self) -> PluginMetadata:
        """Return metadata describing this plugin."""
        pass

    @abstractmethod
    def execute(self, tool_name: str, **kwargs: Any) -> ToolResult:
        """Execute the plugin's primary action or a specific tool.

        Parameters:
            tool_name: The name of the tool being called (e.g. from plugin.json).
            **kwargs: The parsed arguments for the tool.
            
        Returns:
            A :class:`ToolResult` encapsulating the outcome.
        """
        pass

    # -- lifecycle hooks --------------------------------------------------

    def on_load(self) -> None:
        """Called once when the plugin is registered. Override if needed."""

    def on_unload(self) -> None:
        """Called once when the plugin is unregistered. Override if needed."""

    # -- dunder helpers ---------------------------------------------------

    def __repr__(self) -> str:
        meta = self.metadata
        return f"<{type(self).__name__} name={meta.name!r} v={meta.version}>"
