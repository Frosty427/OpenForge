#!/usr/bin/env python
"""Example: Using OpenAIProvider with tool calling.

Run::

    export OPENAI_API_KEY="sk-..."
    python examples/tool_calling.py

This script demonstrates a single turn where the model can call a
``get_weather`` tool, and the agent feeds the tool result back to get a
final natural-language answer.
"""

from __future__ import annotations

import asyncio
import json
import os

from openforge.providers.models import Message, ToolDefinition
from openforge.providers.openai import OpenAIProvider


# ---------------------------------------------------------------------------
# 1. Define a tool schema
# ---------------------------------------------------------------------------

weather_tool = ToolDefinition(
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
# 2. Fake tool implementation (replace with real logic)
# ---------------------------------------------------------------------------

def get_weather(city: str) -> str:
    """Simulated weather lookup."""
    fake_data = {
        "san francisco": "62°F, foggy",
        "new york": "45°F, cloudy",
        "london": "50°F, rainy",
    }
    return fake_data.get(city.lower(), f"72°F, sunny in {city}")


# ---------------------------------------------------------------------------
# 3. Agent loop
# ---------------------------------------------------------------------------

async def main() -> None:
    api_key = os.environ.get("OPENAI_API_KEY", "")
    if not api_key:
        print("⚠  Set OPENAI_API_KEY to run this example.")
        return

    provider = OpenAIProvider(api_key=api_key, model="gpt-4o")

    # Initial conversation
    messages: list[Message] = [
        Message.system("You are a helpful assistant. Use tools when appropriate."),
        Message.user("What's the weather like in San Francisco and London?"),
    ]

    print("📤 Sending initial request …")
    response = await provider.complete(messages, tools=[weather_tool])

    # If the model wants to call tools, execute them and send results back
    if response.has_tool_calls:
        print(f"🔧 Model requested {len(response.message.tool_calls)} tool call(s):")
        messages.append(response.message)  # add assistant message with tool_calls

        for tc in response.message.tool_calls:
            print(f"   → {tc.name}({json.dumps(tc.arguments)})")
            result = get_weather(tc.arguments.get("city", ""))
            messages.append(Message.tool_result(tc.id, result, name=tc.name))

        # Second round — model incorporates tool results
        print("📤 Sending tool results back …")
        response = await provider.complete(messages)

    # Final answer
    print(f"\n🤖 Assistant: {response.text}")
    if response.usage:
        print(f"📊 Tokens: {response.usage}")


if __name__ == "__main__":
    asyncio.run(main())
