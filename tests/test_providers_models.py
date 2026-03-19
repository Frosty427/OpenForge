"""Tests for openforge.providers.models module."""

import pytest
from openforge.providers.models import Role, ToolCall, Message, ToolDefinition, CompletionResponse


class TestRole:
    """Test the Role enum."""

    def test_values(self):
        assert Role.SYSTEM.value == "system"
        assert Role.USER.value == "user"
        assert Role.ASSISTANT.value == "assistant"
        assert Role.TOOL.value == "tool"


class TestToolCall:
    """Test the ToolCall dataclass."""

    def test_creation(self):
        tc = ToolCall(id="123", name="test_tool", arguments={"arg": "value"})
        assert tc.id == "123"
        assert tc.name == "test_tool"
        assert tc.arguments == {"arg": "value"}

    def test_defaults(self):
        tc = ToolCall(id="123", name="test_tool")
        assert tc.arguments == {}

    def test_frozen(self):
        tc = ToolCall(id="123", name="test_tool")
        with pytest.raises(AttributeError):
            tc.name = "new_name"


class TestMessage:
    """Test the Message dataclass."""

    def test_system(self):
        msg = Message.system("You are a helpful assistant.")
        assert msg.role == Role.SYSTEM
        assert msg.content == "You are a helpful assistant."

    def test_user(self):
        msg = Message.user("Hello!")
        assert msg.role == Role.USER
        assert msg.content == "Hello!"

    def test_assistant(self):
        msg = Message.assistant("Hi there!")
        assert msg.role == Role.ASSISTANT
        assert msg.content == "Hi there!"

    def test_assistant_with_tool_calls(self):
        tc = ToolCall(id="123", name="test", arguments={})
        msg = Message.assistant(tool_calls=[tc])
        assert msg.role == Role.ASSISTANT
        assert len(msg.tool_calls) == 1
        assert msg.tool_calls[0].id == "123"

    def test_tool_result(self):
        msg = Message.tool_result("123", "result data", name="test_tool")
        assert msg.role == Role.TOOL
        assert msg.content == "result data"
        assert msg.tool_call_id == "123"
        assert msg.name == "test_tool"

    def test_tool_result_no_name(self):
        msg = Message.tool_result("123", "result data")
        assert msg.name is None

    def test_frozen(self):
        msg = Message.user("test")
        with pytest.raises(AttributeError):
            msg.content = "new content"


class TestToolDefinition:
    """Test the ToolDefinition dataclass."""

    def test_creation(self):
        td = ToolDefinition(
            name="greet",
            description="Greet someone",
            parameters={
                "type": "object",
                "properties": {"name": {"type": "string"}},
                "required": ["name"],
            },
        )
        assert td.name == "greet"
        assert td.description == "Greet someone"
        assert td.parameters["type"] == "object"

    def test_defaults(self):
        td = ToolDefinition(name="test")
        assert td.description == ""
        assert td.parameters == {"type": "object", "properties": {}}


class TestCompletionResponse:
    """Test the CompletionResponse dataclass."""

    def test_has_tool_calls(self):
        tc = ToolCall(id="123", name="test", arguments={})
        msg = Message.assistant(tool_calls=[tc])
        response = CompletionResponse(message=msg)
        assert response.has_tool_calls is True

    def test_no_tool_calls(self):
        msg = Message.assistant("Just text")
        response = CompletionResponse(message=msg)
        assert response.has_tool_calls is False

    def test_text_property(self):
        msg = Message.assistant("Hello!")
        response = CompletionResponse(message=msg)
        assert response.text == "Hello!"

    def test_usage(self):
        msg = Message.assistant("test")
        response = CompletionResponse(
            message=msg,
            usage={"prompt_tokens": 10, "completion_tokens": 5, "total_tokens": 15},
        )
        assert response.usage["total_tokens"] == 15
