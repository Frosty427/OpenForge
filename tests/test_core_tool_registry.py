"""Tests for openforge.core.tool_registry module."""

import json
import pytest
from openforge.core.tool_registry import (
    PluginToolSpec,
    ToolRegistry,
    parse_tool_specs_from_manifest,
)
from openforge.plugins.base import BasePlugin, PluginMetadata, ToolResult
from openforge.providers.models import ToolCall, ToolDefinition


class MockPlugin(BasePlugin):
    """Mock plugin for testing."""

    def __init__(self, name="mock_plugin", version="1.0.0"):
        self._name = name
        self._version = version

    @property
    def metadata(self):
        return PluginMetadata(name=self._name, version=self._version)

    def execute(self, tool_name: str, **kwargs):
        if tool_name == "test_tool":
            return ToolResult.ok(data={"result": "success"})
        return ToolResult.fail(error=f"Unknown tool: {tool_name}")


class TestPluginToolSpec:
    """Test the PluginToolSpec dataclass."""

    def test_from_dict(self):
        raw = {
            "name": "greet",
            "description": "Greet someone",
            "parameters": {
                "type": "object",
                "properties": {"name": {"type": "string"}},
                "required": ["name"],
            },
        }
        spec = PluginToolSpec.from_dict(raw, plugin_name="hello_world")
        assert spec.name == "greet"
        assert spec.description == "Greet someone"
        assert spec.parameters["type"] == "object"
        assert spec.plugin_name == "hello_world"

    def test_from_dict_defaults(self):
        spec = PluginToolSpec.from_dict({})
        assert spec.name == ""
        assert spec.description == ""
        assert spec.parameters == {"type": "object", "properties": {}}
        assert spec.plugin_name == ""

    def test_frozen(self):
        spec = PluginToolSpec(name="test")
        with pytest.raises(AttributeError):
            spec.name = "new_name"


class TestToolRegistry:
    """Test the ToolRegistry class."""

    def test_register_plugin(self):
        registry = ToolRegistry()
        plugin = MockPlugin()
        spec = PluginToolSpec(
            name="test_tool",
            description="A test tool",
            parameters={"type": "object", "properties": {}},
        )
        registry.register(plugin, [spec])
        assert len(registry) == 1
        assert "test_tool" in registry.tool_names

    def test_register_auto_generates_tool(self):
        registry = ToolRegistry()
        plugin = MockPlugin()
        registry.register(plugin)
        assert len(registry) == 1
        assert "mock_plugin" in registry.tool_names

    def test_register_duplicate_raises(self):
        registry = ToolRegistry()
        plugin1 = MockPlugin(name="plugin1")
        plugin2 = MockPlugin(name="plugin2")
        spec = PluginToolSpec(name="same_name")
        registry.register(plugin1, [spec])
        with pytest.raises(ValueError, match="already registered"):
            registry.register(plugin2, [spec])

    def test_unregister_plugin(self):
        registry = ToolRegistry()
        plugin = MockPlugin()
        spec = PluginToolSpec(name="tool1")
        registry.register(plugin, [spec])
        count = registry.unregister_plugin("mock_plugin")
        assert count == 1
        assert len(registry) == 0

    def test_get_definitions(self):
        registry = ToolRegistry()
        plugin = MockPlugin()
        spec = PluginToolSpec(
            name="tool1",
            description="Tool 1",
            parameters={"type": "object", "properties": {"arg": {"type": "string"}}},
        )
        registry.register(plugin, [spec])
        definitions = registry.get_definitions()
        assert len(definitions) == 1
        assert definitions[0].name == "tool1"
        assert definitions[0].description == "Tool 1"

    def test_get_plugin_for_tool(self):
        registry = ToolRegistry()
        plugin = MockPlugin()
        spec = PluginToolSpec(name="my_tool")
        registry.register(plugin, [spec])
        found = registry.get_plugin_for_tool("my_tool")
        assert found is plugin
        assert registry.get_plugin_for_tool("nonexistent") is None

    def test_execute_success(self):
        registry = ToolRegistry()
        plugin = MockPlugin()
        spec = PluginToolSpec(name="test_tool")
        registry.register(plugin, [spec])
        tc = ToolCall(id="123", name="test_tool", arguments={})
        result = registry.execute(tc)
        assert result.is_success
        assert result.data["result"] == "success"

    def test_execute_unknown_tool(self):
        registry = ToolRegistry()
        tc = ToolCall(id="123", name="unknown", arguments={})
        result = registry.execute(tc)
        assert not result.is_success
        assert "Unknown tool" in result.error

    def test_execute_to_json(self):
        registry = ToolRegistry()
        plugin = MockPlugin()
        spec = PluginToolSpec(name="test_tool")
        registry.register(plugin, [spec])
        tc = ToolCall(id="123", name="test_tool", arguments={})
        json_str = registry.execute_to_json(tc)
        data = json.loads(json_str)
        assert data["status"] == "success"
        assert data["data"]["result"] == "success"

    def test_execute_to_json_error(self):
        registry = ToolRegistry()
        tc = ToolCall(id="123", name="unknown", arguments={})
        json_str = registry.execute_to_json(tc)
        data = json.loads(json_str)
        assert data["status"] == "error"
        assert "Unknown tool" in data["error"]


class TestParseToolSpecsFromManifest:
    """Test the parse_tool_specs_from_manifest function."""

    def test_parse_with_tools(self):
        manifest = {
            "name": "test_plugin",
            "version": "1.0.0",
            "tools": [
                {"name": "tool1", "description": "First tool"},
                {"name": "tool2", "description": "Second tool"},
            ],
        }
        specs = parse_tool_specs_from_manifest(manifest)
        assert len(specs) == 2
        assert specs[0].name == "tool1"
        assert specs[0].plugin_name == "test_plugin"
        assert specs[1].name == "tool2"

    def test_parse_without_tools(self):
        manifest = {"name": "test_plugin", "version": "1.0.0"}
        specs = parse_tool_specs_from_manifest(manifest)
        assert specs == []

    def test_parse_empty_manifest(self):
        specs = parse_tool_specs_from_manifest({})
        assert specs == []
