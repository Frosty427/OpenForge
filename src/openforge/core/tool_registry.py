"""ToolRegistry — bridges plugins and the AI provider's tool-calling layer.

Responsibilities:
  1. Accept loaded :class:`BasePlugin` instances and extract callable tools.
  2. Expose :class:`ToolDefinition` schemas to pass to the provider.
  3. Dispatch incoming :class:`ToolCall` objects to the correct plugin and
     return a serialised :class:`ToolResult`.
"""

from __future__ import annotations

import json
import logging
from dataclasses import dataclass, field
from typing import Any

from openforge.plugins.base import BasePlugin, ToolResult
from openforge.providers.models import ToolCall, ToolDefinition

logger = logging.getLogger(__name__)


# ---------------------------------------------------------------------------
# Tool descriptor loaded from plugin.json → "tools" array
# ---------------------------------------------------------------------------


@dataclass(frozen=True)
class PluginToolSpec:
    """A single tool specification declared inside a ``plugin.json``.

    This is the *manifest-level* description. The :class:`ToolRegistry`
    converts it into a provider-agnostic :class:`ToolDefinition`.

    Attributes:
        name: Tool function name (must be unique across all plugins).
        description: What the tool does — shown to the model.
        parameters: JSON-Schema object describing accepted arguments.
        plugin_name: The owning plugin's name (set at registration time).
    """

    name: str
    description: str = ""
    parameters: dict[str, Any] = field(
        default_factory=lambda: {"type": "object", "properties": {}},
    )
    plugin_name: str = ""

    @classmethod
    def from_dict(cls, raw: dict[str, Any], *, plugin_name: str = "") -> PluginToolSpec:
        """Parse a tool entry from a ``plugin.json`` ``"tools"`` array."""
        return cls(
            name=raw.get("name", ""),
            description=raw.get("description", ""),
            parameters=raw.get("parameters", {"type": "object", "properties": {}}),
            plugin_name=plugin_name,
        )


# ---------------------------------------------------------------------------
# Registry
# ---------------------------------------------------------------------------


@dataclass
class _RegisteredTool:
    """Internal bookkeeping for a registered tool."""

    spec: PluginToolSpec
    plugin: BasePlugin
    definition: ToolDefinition


class ToolRegistry:
    """Central registry that maps tool names → plugins.

    Usage::

        registry = ToolRegistry()

        # Register plugins with their tool specs
        registry.register(plugin, tool_specs)

        # Get schemas to send to the provider
        definitions = registry.get_definitions()

        # When the model returns tool calls, execute them
        results = registry.execute(tool_call)
    """

    def __init__(self) -> None:
        self._tools: dict[str, _RegisteredTool] = {}

    # -- registration -----------------------------------------------------

    def register(
        self,
        plugin: BasePlugin,
        tool_specs: list[PluginToolSpec] | None = None,
    ) -> None:
        """Register a plugin and its tool specifications.

        If *tool_specs* is ``None`` or empty, a **default tool** is created
        from the plugin's metadata so every plugin is callable by the model.

        Raises:
            ValueError: If a tool name collides with an already-registered tool.
        """
        meta = plugin.metadata

        if not tool_specs:
            # Auto-generate a single tool from plugin metadata.
            tool_specs = [
                PluginToolSpec(
                    name=meta.name,
                    description=meta.description or f"Run the {meta.name} plugin.",
                    plugin_name=meta.name,
                ),
            ]

        for spec in tool_specs:
            spec = PluginToolSpec(
                name=spec.name,
                description=spec.description,
                parameters=spec.parameters,
                plugin_name=meta.name,
            )
            if spec.name in self._tools:
                existing = self._tools[spec.name]
                msg = (
                    f"Tool '{spec.name}' is already registered by plugin "
                    f"'{existing.spec.plugin_name}'."
                )
                raise ValueError(msg)

            definition = ToolDefinition(
                name=spec.name,
                description=spec.description,
                parameters=spec.parameters,
            )

            self._tools[spec.name] = _RegisteredTool(
                spec=spec,
                plugin=plugin,
                definition=definition,
            )
            logger.info(
                "Registered tool '%s' (plugin: %s)",
                spec.name,
                meta.name,
            )

    def unregister_plugin(self, plugin_name: str) -> int:
        """Remove all tools owned by *plugin_name*. Returns count removed."""
        to_remove = [
            name
            for name, rt in self._tools.items()
            if rt.spec.plugin_name == plugin_name
        ]
        for name in to_remove:
            del self._tools[name]
        return len(to_remove)

    # -- querying ---------------------------------------------------------

    def get_definitions(self) -> list[ToolDefinition]:
        """Return all registered tool schemas, ready to pass to a provider."""
        return [rt.definition for rt in self._tools.values()]

    def get_plugin_for_tool(self, tool_name: str) -> BasePlugin | None:
        """Look up which plugin owns *tool_name*."""
        rt = self._tools.get(tool_name)
        return rt.plugin if rt else None

    @property
    def tool_names(self) -> list[str]:
        return sorted(self._tools.keys())

    def __len__(self) -> int:
        return len(self._tools)

    # -- execution --------------------------------------------------------

    def execute(self, tool_call: ToolCall) -> ToolResult:
        """Dispatch a :class:`ToolCall` to the owning plugin.

        Returns:
            A :class:`ToolResult` from the plugin, or a failure result if
            the tool is not found or execution raises.
        """
        rt = self._tools.get(tool_call.name)
        if rt is None:
            return ToolResult.fail(
                error=f"Unknown tool: '{tool_call.name}'",
                message="Tool not found in registry.",
            )

        try:
            return rt.plugin.execute(tool_call.name, **tool_call.arguments)
        except Exception as exc:  # noqa: BLE001
            logger.exception("Tool '%s' raised an exception", tool_call.name)
            return ToolResult.fail(
                error=str(exc),
                message=f"Plugin '{rt.spec.plugin_name}' failed.",
            )

    def execute_to_json(self, tool_call: ToolCall) -> str:
        """Execute a tool call and return the result as a JSON string.

        This is the format expected by the OpenAI tool-result message.
        """
        result = self.execute(tool_call)
        payload: dict[str, Any] = {"status": result.status.value}
        if result.is_success:
            payload["data"] = result.data
            if result.message:
                payload["message"] = result.message
        else:
            payload["error"] = result.error
        return json.dumps(payload, default=str)


# ---------------------------------------------------------------------------
# Manifest helpers
# ---------------------------------------------------------------------------


def parse_tool_specs_from_manifest(raw_manifest: dict[str, Any]) -> list[PluginToolSpec]:
    """Extract tool specs from a raw ``plugin.json`` dict.

    The manifest may contain a ``"tools"`` array::

        {
          "name": "hello_world",
          "version": "0.1.0",
          "tools": [
            {
              "name": "greet",
              "description": "Greet someone by name.",
              "parameters": {
                "type": "object",
                "properties": {
                  "name": {"type": "string", "description": "Name to greet."}
                },
                "required": ["name"]
              }
            }
          ]
        }

    If ``"tools"`` is absent, an empty list is returned and the registry
    will auto-generate a default tool from plugin metadata.
    """
    plugin_name = raw_manifest.get("name", "")
    raw_tools = raw_manifest.get("tools", [])

    return [
        PluginToolSpec.from_dict(t, plugin_name=plugin_name)
        for t in raw_tools
    ]
