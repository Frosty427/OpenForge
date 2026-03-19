"""Hello World plugin — minimal example of an OpenForge plugin."""

from __future__ import annotations

from typing import Any

from openforge.plugins.base import BasePlugin, PluginMetadata, ToolResult


class HelloWorldPlugin(BasePlugin):
    """A simple greeting plugin used as a reference implementation."""

    @property
    def metadata(self) -> PluginMetadata:
        return PluginMetadata(
            name="hello_world",
            version="0.1.0",
            description="A minimal example plugin that greets the user.",
            author="OpenForge Contributors",
        )

    def execute(self, tool_name: str, **kwargs: Any) -> ToolResult:
        """Execute the plugin. 
        
        Since this plugin only has one tool ('greet'), we don't strictly 
        need to check tool_name, but we accept it to fulfil the abstract method.
        """
        name = kwargs.get("name", "World")
        greeting = f"Hello, {name}! 👋 This is the hello_world plugin."
        return ToolResult.ok(data={"greeting": greeting}, message=greeting)

    def on_load(self) -> None:
        """Log that the plugin has been loaded."""
        # In a real plugin you might initialise resources here.
        pass


def register() -> BasePlugin:
    """Entry-point called by the plugin loader.

    Must return a :class:`BasePlugin` instance.
    """
    return HelloWorldPlugin()
