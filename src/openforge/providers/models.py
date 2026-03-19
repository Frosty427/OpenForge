"""Typed message and tool-call models used across the provider layer."""

from __future__ import annotations

from dataclasses import dataclass, field
from enum import Enum
from typing import Any


class Role(Enum):
    """Chat message roles."""

    SYSTEM = "system"
    USER = "user"
    ASSISTANT = "assistant"
    TOOL = "tool"


@dataclass(frozen=True)
class ToolCall:
    """A tool invocation requested by the model.

    Attributes:
        id: Opaque identifier assigned by the provider (used to correlate
            tool results back to the correct call).
        name: Name of the tool / function to invoke.
        arguments: Parsed argument dict (already deserialised from JSON).
    """

    id: str
    name: str
    arguments: dict[str, Any] = field(default_factory=dict)


@dataclass(frozen=True)
class Message:
    """A single message in a conversation.

    Attributes:
        role: Who authored this message.
        content: Text body (may be empty for assistant tool-call messages).
        tool_calls: Tool invocations attached to an assistant message.
        tool_call_id: When *role* is ``TOOL``, the id of the tool call this
            message responds to.
        name: Optional name qualifier (used with tool results).
    """

    role: Role
    content: str = ""
    tool_calls: list[ToolCall] = field(default_factory=list)
    tool_call_id: str | None = None
    name: str | None = None

    # -- convenience constructors -----------------------------------------

    @classmethod
    def system(cls, content: str) -> Message:
        return cls(role=Role.SYSTEM, content=content)

    @classmethod
    def user(cls, content: str) -> Message:
        return cls(role=Role.USER, content=content)

    @classmethod
    def assistant(
        cls,
        content: str = "",
        *,
        tool_calls: list[ToolCall] | None = None,
    ) -> Message:
        return cls(
            role=Role.ASSISTANT,
            content=content,
            tool_calls=tool_calls or [],
        )

    @classmethod
    def tool_result(cls, tool_call_id: str, content: str, *, name: str = "") -> Message:
        return cls(
            role=Role.TOOL,
            content=content,
            tool_call_id=tool_call_id,
            name=name or None,
        )


@dataclass(frozen=True)
class ToolDefinition:
    """Schema describing a tool the model may call.

    Follows the OpenAI function-calling JSON-Schema convention.

    Attributes:
        name: Unique function name.
        description: What the tool does (shown to the model).
        parameters: JSON-Schema ``object`` describing accepted arguments.
    """

    name: str
    description: str = ""
    parameters: dict[str, Any] = field(default_factory=lambda: {"type": "object", "properties": {}})


@dataclass
class CompletionResponse:
    """Normalised response from a provider completion call.

    Attributes:
        message: The assistant message (may contain text and/or tool calls).
        usage: Token-usage dict when the provider reports it.
        raw: The original, provider-specific response object for debugging.
    """

    message: Message
    usage: dict[str, int] = field(default_factory=dict)
    raw: Any = None

    @property
    def has_tool_calls(self) -> bool:
        return bool(self.message.tool_calls)

    @property
    def text(self) -> str:
        return self.message.content
