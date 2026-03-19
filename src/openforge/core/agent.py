"""Core Agent — the async loop that orchestrates providers, tools, and plugins."""

from __future__ import annotations

import logging
from dataclasses import dataclass, field
from typing import Any

from openforge.core.tool_registry import ToolRegistry
from openforge.providers.base import BaseProvider
from openforge.providers.models import CompletionResponse, Message

logger = logging.getLogger(__name__)

_DEFAULT_SYSTEM_PROMPT = (
    "You are OpenForge, a helpful AI assistant. "
    "Use the available tools when they can help answer the user's request. "
    "Always prefer using tools over guessing."
)


# ---------------------------------------------------------------------------
# Config
# ---------------------------------------------------------------------------


@dataclass
class AgentConfig:
    """Configuration for an Agent instance."""

    name: str = "openforge"
    system_prompt: str = _DEFAULT_SYSTEM_PROMPT
    verbose: bool = False
    max_iterations: int = 10
    temperature: float = 0.7
    max_tokens: int | None = None


# ---------------------------------------------------------------------------
# Agent result
# ---------------------------------------------------------------------------


@dataclass
class AgentResponse:
    """The final result of an agent run.

    Attributes:
        text: The assistant's final natural-language answer.
        tool_calls_made: Number of tool calls executed during the run.
        iterations: How many provider round-trips were needed.
        messages: The complete conversation history.
    """

    text: str
    tool_calls_made: int = 0
    iterations: int = 0
    messages: list[Message] = field(default_factory=list)


# ---------------------------------------------------------------------------
# Agent
# ---------------------------------------------------------------------------


class Agent:
    """The central AI agent that runs the *user → AI → tool → AI* loop.

    Usage::

        agent = Agent(
            config=AgentConfig(),
            provider=openai_provider,
            tool_registry=registry,
        )
        response = await agent.run("What's the weather in London?")
        print(response.text)
    """

    def __init__(
        self,
        *,
        config: AgentConfig | None = None,
        provider: BaseProvider | None = None,
        tool_registry: ToolRegistry | None = None,
    ) -> None:
        self.config = config or AgentConfig()
        self._provider = provider
        self._registry = tool_registry or ToolRegistry()

    # -- public API -------------------------------------------------------

    async def run(self, prompt: str) -> AgentResponse:
        """Execute the full agent loop for a single user prompt.

        Flow::

            1. Build the conversation: [system, user]
            2. Send to the provider (with tool definitions)
            3. If the model returns tool_calls:
               a. Execute each tool via ToolRegistry
               b. Append tool-result messages
               c. Go back to step 2
            4. Return the final text response

        The loop is bounded by :attr:`AgentConfig.max_iterations` to
        prevent infinite tool-call chains.
        """
        # -- no provider → echo mode -------------------------------------
        if self._provider is None:
            return AgentResponse(
                text=f"[echo] {prompt}  (no provider configured)",
                messages=[Message.user(prompt)],
            )

        # -- build initial conversation -----------------------------------
        messages: list[Message] = [
            Message.system(self.config.system_prompt),
            Message.user(prompt),
        ]

        tool_defs = self._registry.get_definitions() or None
        total_tool_calls = 0

        # -- agent loop ---------------------------------------------------
        for iteration in range(1, self.config.max_iterations + 1):
            if self.config.verbose:
                logger.info(
                    "Iteration %d — sending %d message(s), %d tool(s) available",
                    iteration,
                    len(messages),
                    len(tool_defs or []),
                )

            response: CompletionResponse = await self._provider.complete(
                messages,
                tools=tool_defs,
                temperature=self.config.temperature,
                max_tokens=self.config.max_tokens,
            )

            assistant_msg = response.message

            # No tool calls → we have the final answer
            if not response.has_tool_calls:
                messages.append(assistant_msg)
                return AgentResponse(
                    text=assistant_msg.content,
                    tool_calls_made=total_tool_calls,
                    iterations=iteration,
                    messages=messages,
                )

            # -- execute tool calls ---------------------------------------
            messages.append(assistant_msg)

            for tc in assistant_msg.tool_calls:
                total_tool_calls += 1
                if self.config.verbose:
                    logger.info("  → tool call: %s(%s)", tc.name, tc.arguments)

                result_json = self._registry.execute_to_json(tc)

                messages.append(
                    Message.tool_result(tc.id, result_json, name=tc.name)
                )

                if self.config.verbose:
                    logger.info("  ← result: %s", result_json[:200])

        # -- max iterations exceeded --------------------------------------
        logger.warning(
            "Agent hit max iterations (%d) without a final response.",
            self.config.max_iterations,
        )
        return AgentResponse(
            text="I was unable to produce a final answer within the allowed iterations.",
            tool_calls_made=total_tool_calls,
            iterations=self.config.max_iterations,
            messages=messages,
        )
