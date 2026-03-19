"""OpenAI provider — async completion with tool-calling support."""

from __future__ import annotations

import json
import logging
from dataclasses import dataclass, field
from typing import Any

from openforge.providers.base import BaseProvider
from openforge.providers.models import (
    CompletionResponse,
    Message,
    Role,
    ToolCall,
    ToolDefinition,
)

logger = logging.getLogger(__name__)

try:
    from openai import AsyncOpenAI
except ImportError as _exc:  # noqa: F841
    AsyncOpenAI = None  # type: ignore[assignment,misc]


# ---------------------------------------------------------------------------
# Helpers: OpenForge models  ⇄  OpenAI API dicts
# ---------------------------------------------------------------------------


def _messages_to_dicts(messages: list[Message]) -> list[dict[str, Any]]:
    """Convert internal Message objects to OpenAI-compatible dicts."""
    result: list[dict[str, Any]] = []
    for msg in messages:
        d: dict[str, Any] = {"role": msg.role.value, "content": msg.content}
        if msg.tool_calls:
            d["tool_calls"] = [
                {
                    "id": tc.id,
                    "type": "function",
                    "function": {
                        "name": tc.name,
                        "arguments": json.dumps(tc.arguments),
                    },
                }
                for tc in msg.tool_calls
            ]
        if msg.tool_call_id is not None:
            d["tool_call_id"] = msg.tool_call_id
        if msg.name is not None:
            d["name"] = msg.name
        result.append(d)
    return result


def _tools_to_dicts(tools: list[ToolDefinition]) -> list[dict[str, Any]]:
    """Convert ToolDefinition objects to OpenAI's function tool schema."""
    return [
        {
            "type": "function",
            "function": {
                "name": t.name,
                "description": t.description,
                "parameters": t.parameters,
            },
        }
        for t in tools
    ]


def _parse_tool_calls(raw_tool_calls: list[Any]) -> list[ToolCall]:
    """Parse tool calls from the OpenAI response."""
    calls: list[ToolCall] = []
    for tc in raw_tool_calls:
        try:
            arguments = json.loads(tc.function.arguments)
        except (json.JSONDecodeError, AttributeError):
            arguments = {}
        calls.append(
            ToolCall(
                id=tc.id,
                name=tc.function.name,
                arguments=arguments,
            )
        )
    return calls


# ---------------------------------------------------------------------------
# Provider
# ---------------------------------------------------------------------------


@dataclass
class OpenAIProvider(BaseProvider):
    """Async OpenAI provider with tool-calling support.

    Usage::

        provider = OpenAIProvider(api_key="sk-...")
        response = await provider.complete(
            messages=[Message.user("What is 2+2?")],
            tools=[calculator_tool],
        )
    """

    api_key: str = ""
    model: str = "gpt-4o"
    base_url: str | None = None
    default_temperature: float = 0.7
    default_max_tokens: int | None = None
    _client: Any = field(default=None, init=False, repr=False)

    def __post_init__(self) -> None:
        if AsyncOpenAI is None:
            msg = (
                "The 'openai' package is required for OpenAIProvider. "
                "Install it with: pip install openai"
            )
            raise ImportError(msg)
        client_kwargs: dict[str, Any] = {"api_key": self.api_key}
        if self.base_url:
            client_kwargs["base_url"] = self.base_url
        self._client = AsyncOpenAI(**client_kwargs)

    # -- BaseProvider interface -------------------------------------------

    @property
    def name(self) -> str:
        return "openai"

    async def complete(
        self,
        messages: list[Message],
        *,
        tools: list[ToolDefinition] | None = None,
        temperature: float | None = None,
        max_tokens: int | None = None,
    ) -> CompletionResponse:
        """Send messages to the OpenAI Chat Completions API.

        If *tools* are provided the model may respond with tool calls instead
        of (or alongside) text content.
        """
        kwargs: dict[str, Any] = {
            "model": self.model,
            "messages": _messages_to_dicts(messages),
            "temperature": temperature if temperature is not None else self.default_temperature,
        }

        effective_max_tokens = max_tokens or self.default_max_tokens
        if effective_max_tokens is not None:
            kwargs["max_tokens"] = effective_max_tokens

        if tools:
            kwargs["tools"] = _tools_to_dicts(tools)

        logger.debug("OpenAI request: model=%s, messages=%d, tools=%d",
                      self.model, len(messages), len(tools or []))

        response = await self._client.chat.completions.create(**kwargs)
        choice = response.choices[0]
        assistant_msg = choice.message

        # Parse tool calls (if any)
        tool_calls: list[ToolCall] = []
        if assistant_msg.tool_calls:
            tool_calls = _parse_tool_calls(assistant_msg.tool_calls)

        # Build normalised response
        message = Message(
            role=Role.ASSISTANT,
            content=assistant_msg.content or "",
            tool_calls=tool_calls,
        )

        usage: dict[str, int] = {}
        if response.usage:
            usage = {
                "prompt_tokens": response.usage.prompt_tokens,
                "completion_tokens": response.usage.completion_tokens,
                "total_tokens": response.usage.total_tokens,
            }

        return CompletionResponse(message=message, usage=usage, raw=response)
