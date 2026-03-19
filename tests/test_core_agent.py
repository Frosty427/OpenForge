"""Tests for openforge.core.agent module."""

import pytest
from openforge.core.agent import Agent, AgentConfig, AgentResponse
from openforge.providers.base import BaseProvider
from openforge.providers.models import CompletionResponse, Message, ToolCall, ToolDefinition
from openforge.core.tool_registry import ToolRegistry
from openforge.plugins.base import BasePlugin, PluginMetadata, ToolResult


class MockProvider(BaseProvider):
    """Mock provider for testing."""

    def __init__(self, responses=None):
        self._responses = responses or []
        self._call_count = 0

    async def complete(self, messages, **kwargs):
        if self._call_count < len(self._responses):
            response = self._responses[self._call_count]
            self._call_count += 1
            return response
        # Default: return a simple text response
        return CompletionResponse(message=Message.assistant("Default response"))

    @property
    def name(self):
        return "mock_provider"


class MockPlugin(BasePlugin):
    """Mock plugin for testing."""

    @property
    def metadata(self):
        return PluginMetadata(name="mock", version="1.0.0")

    def execute(self, tool_name: str, **kwargs):
        return ToolResult.ok(data={"result": "mock_result"})


class TestAgentConfig:
    """Test the AgentConfig dataclass."""

    def test_defaults(self):
        config = AgentConfig()
        assert config.name == "openforge"
        assert config.verbose is False
        assert config.max_iterations == 10
        assert config.temperature == 0.7
        assert config.max_tokens is None

    def test_custom(self):
        config = AgentConfig(
            name="custom_agent",
            verbose=True,
            max_iterations=5,
            temperature=0.5,
            max_tokens=1000,
        )
        assert config.name == "custom_agent"
        assert config.verbose is True
        assert config.max_iterations == 5
        assert config.temperature == 0.5
        assert config.max_tokens == 1000


class TestAgent:
    """Test the Agent class."""

    @pytest.mark.asyncio
    async def test_echo_mode(self):
        agent = Agent()
        response = await agent.run("Hello!")
        assert response.text == "[echo] Hello!  (no provider configured)"
        assert response.tool_calls_made == 0
        assert response.iterations == 0

    @pytest.mark.asyncio
    async def test_simple_response(self):
        provider = MockProvider([CompletionResponse(message=Message.assistant("Hello!"))])
        agent = Agent(provider=provider)
        response = await agent.run("Hi!")
        assert response.text == "Hello!"
        assert response.tool_calls_made == 0
        assert response.iterations == 1

    @pytest.mark.asyncio
    async def test_tool_call(self):
        # First response has a tool call, second response is final
        tc = ToolCall(id="123", name="mock", arguments={})
        provider = MockProvider(
            [
                CompletionResponse(message=Message.assistant(tool_calls=[tc])),
                CompletionResponse(message=Message.assistant("Tool result processed")),
            ]
        )
        registry = ToolRegistry()
        plugin = MockPlugin()
        registry.register(plugin)
        agent = Agent(provider=provider, tool_registry=registry)
        response = await agent.run("Use the tool")
        assert response.text == "Tool result processed"
        assert response.tool_calls_made == 1
        assert response.iterations == 2

    @pytest.mark.asyncio
    async def test_max_iterations(self):
        # Create a provider that always returns tool calls
        def make_tool_call(i):
            return ToolCall(id=str(i), name="mock", arguments={})

        provider = MockProvider(
            [
                CompletionResponse(message=Message.assistant(tool_calls=[make_tool_call(i)]))
                for i in range(15)  # More than max_iterations
            ]
        )
        registry = ToolRegistry()
        plugin = MockPlugin()
        registry.register(plugin)
        config = AgentConfig(max_iterations=5)
        agent = Agent(config=config, provider=provider, tool_registry=registry)
        response = await agent.run("Keep calling tools")
        assert "unable to produce a final answer" in response.text
        assert response.iterations == 5

    @pytest.mark.asyncio
    async def test_unknown_tool(self):
        tc = ToolCall(id="123", name="unknown_tool", arguments={})
        provider = MockProvider(
            [
                CompletionResponse(message=Message.assistant(tool_calls=[tc])),
                CompletionResponse(message=Message.assistant("Error handled")),
            ]
        )
        agent = Agent(provider=provider)
        response = await agent.run("Call unknown tool")
        assert response.text == "Error handled"
        assert response.tool_calls_made == 1

    @pytest.mark.asyncio
    async def test_verbose_logging(self):
        provider = MockProvider([CompletionResponse(message=Message.assistant("Response"))])
        config = AgentConfig(verbose=True)
        agent = Agent(config=config, provider=provider)
        response = await agent.run("Test verbose")
        assert response.text == "Response"
