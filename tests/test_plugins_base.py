"""Tests for openforge.plugins.base module."""

import pytest
from openforge.plugins.base import ToolStatus, ToolResult, PluginMetadata, BasePlugin


class TestToolStatus:
    """Test the ToolStatus enum."""

    def test_success_value(self):
        assert ToolStatus.SUCCESS.value == "success"

    def test_error_value(self):
        assert ToolStatus.ERROR.value == "error"


class TestToolResult:
    """Test the ToolResult dataclass."""

    def test_ok_factory(self):
        result = ToolResult.ok(data={"key": "value"}, message="Success")
        assert result.status == ToolStatus.SUCCESS
        assert result.data == {"key": "value"}
        assert result.message == "Success"
        assert result.error is None
        assert result.is_success is True

    def test_fail_factory(self):
        result = ToolResult.fail(error="Something went wrong", message="Error occurred")
        assert result.status == ToolStatus.ERROR
        assert result.error == "Something went wrong"
        assert result.message == "Error occurred"
        assert result.data is None
        assert result.is_success is False

    def test_ok_defaults(self):
        result = ToolResult.ok()
        assert result.status == ToolStatus.SUCCESS
        assert result.data is None
        assert result.message == ""
        assert result.error is None

    def test_fail_defaults(self):
        result = ToolResult.fail(error="error")
        assert result.status == ToolStatus.ERROR
        assert result.data is None
        assert result.message == ""
        assert result.error == "error"

    def test_frozen(self):
        result = ToolResult.ok(data="test")
        with pytest.raises(AttributeError):
            result.data = "new value"


class TestPluginMetadata:
    """Test the PluginMetadata dataclass."""

    def test_creation(self):
        meta = PluginMetadata(
            name="test_plugin",
            version="1.0.0",
            description="A test plugin",
            author="Test Author",
        )
        assert meta.name == "test_plugin"
        assert meta.version == "1.0.0"
        assert meta.description == "A test plugin"
        assert meta.author == "Test Author"
        assert meta.enabled is True
        assert meta.permissions == []

    def test_defaults(self):
        meta = PluginMetadata(name="test", version="0.1.0")
        assert meta.description == ""
        assert meta.author == ""
        assert meta.enabled is True
        assert meta.permissions == []

    def test_frozen(self):
        meta = PluginMetadata(name="test", version="0.1.0")
        with pytest.raises(AttributeError):
            meta.name = "new_name"


class ConcretePlugin(BasePlugin):
    """Concrete implementation for testing BasePlugin."""

    @property
    def metadata(self):
        return PluginMetadata(name="concrete", version="1.0.0")

    def execute(self, tool_name: str, **kwargs):
        return ToolResult.ok(data={"tool": tool_name, "kwargs": kwargs})


class TestBasePlugin:
    """Test the BasePlugin abstract class."""

    def test_concrete_implementation(self):
        plugin = ConcretePlugin()
        assert plugin.metadata.name == "concrete"
        result = plugin.execute("test_tool", arg1="value1")
        assert result.is_success
        assert result.data["tool"] == "test_tool"
        assert result.data["kwargs"] == {"arg1": "value1"}

    def test_repr(self):
        plugin = ConcretePlugin()
        assert repr(plugin) == "<ConcretePlugin name='concrete' v=1.0.0>"

    def test_lifecycle_hooks(self):
        plugin = ConcretePlugin()
        # These should not raise
        plugin.on_load()
        plugin.on_unload()
