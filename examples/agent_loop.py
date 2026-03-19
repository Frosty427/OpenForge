#!/usr/bin/env python
"""Example: Full agent loop with tool calling.

Run::

    export OPENAI_API_KEY="sk-..."
    python examples/agent_loop.py

Demonstrates the complete flow:
  user prompt → Agent → OpenAI → tool call → plugin execution → OpenAI → final answer
"""

from __future__ import annotations

import asyncio
import os
from pathlib import Path

from openforge.core.agent import Agent, AgentConfig
from openforge.core.tool_registry import ToolRegistry, PluginToolSpec
from openforge.plugins.base import BasePlugin, PluginMetadata, ToolResult
from typing import Any


# ---------------------------------------------------------------------------
# 1. Inline plugin (no need for a file-based plugin for this demo)
# ---------------------------------------------------------------------------

class WeatherPlugin(BasePlugin):
    """Demo plugin that reports fake weather data."""

    @property
    def metadata(self) -> PluginMetadata:
        return PluginMetadata(
            name="weather",
            version="0.1.0",
            description="Get current weather for a city.",
        )

    def execute(self, tool_name: str, *args: Any, **kwargs: Any) -> ToolResult:
        city = kwargs.get("city", "unknown")
        fake = {
            "san francisco": "62°F, foggy 🌁",
            "london": "50°F, rainy 🌧️",
            "tokyo": "75°F, sunny ☀️",
        }
        weather = fake.get(city.lower(), f"72°F, pleasant in {city}")
        return ToolResult.ok(
            data={"city": city, "weather": weather},
            message=weather,
        )


# ---------------------------------------------------------------------------
# 2. Set up the ToolRegistry
# ---------------------------------------------------------------------------

weather_spec = PluginToolSpec(
    name="get_weather",
    description="Get the current weather for a given city.",
    parameters={
        "type": "object",
        "properties": {
            "city": {
                "type": "string",
                "description": "City name, e.g. 'San Francisco'.",
            },
        },
        "required": ["city"],
    },
)


# ---------------------------------------------------------------------------
# 3. Run the agent
# ---------------------------------------------------------------------------

async def main() -> None:
    api_key = os.environ.get("OPENAI_API_KEY", "")
    if not api_key:
        print("⚠  Set OPENAI_API_KEY to run this example with a real provider.")
        print("   Running in echo mode instead.\n")
        provider = None
    else:
        from openforge.providers.openai import OpenAIProvider
        provider = OpenAIProvider(api_key=api_key, model="gpt-4o")

    # Build registry
    registry = ToolRegistry()
    plugin = WeatherPlugin()
    registry.register(plugin, [weather_spec])

    # Build agent
    agent = Agent(
        config=AgentConfig(verbose=True),
        provider=provider,
        tool_registry=registry,
    )

    # Run
    prompt = "What's the weather like in San Francisco and Tokyo?"
    print(f"👤 User: {prompt}\n")

    response = await agent.run(prompt)

    print(f"\n🤖 Agent: {response.text}")
    print(f"\n📊 Stats: {response.iterations} iteration(s), {response.tool_calls_made} tool call(s)")


if __name__ == "__main__":
    asyncio.run(main())
