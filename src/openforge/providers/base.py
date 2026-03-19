"""Abstract base provider interface for LLM / AI backends."""

from __future__ import annotations

from abc import ABC, abstractmethod

from openforge.providers.models import CompletionResponse, Message, ToolDefinition


class BaseProvider(ABC):
    """Async interface that every AI provider must implement.

    Subclasses only need to implement :meth:`complete` and :attr:`name`.
    """

    @abstractmethod
    async def complete(
        self,
        messages: list[Message],
        *,
        tools: list[ToolDefinition] | None = None,
        temperature: float = 0.7,
        max_tokens: int | None = None,
    ) -> CompletionResponse:
        """Send a conversation to the model and return a completion.

        Parameters:
            messages: Ordered conversation history.
            tools: Optional tool schemas the model may invoke.
            temperature: Sampling temperature.
            max_tokens: Maximum tokens in the response.

        Returns:
            A normalised :class:`CompletionResponse`.
        """

    @property
    @abstractmethod
    def name(self) -> str:
        """Human-readable name of this provider (e.g. ``'openai'``)."""
