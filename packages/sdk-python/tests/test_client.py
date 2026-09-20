"""Tests for Talkie Python SDK."""
from talkie import TalkieClient, AuthenticationError

def test_client_init():
    client = TalkieClient(api_key="tk_live_test_key_12345")
    assert client.api_key == "tk_live_test_key_12345"
    assert client.base_url == "http://localhost:3000"
    assert client.agents is not None
    assert client.numbers is not None
    assert client.calls is not None
    assert client.messages is not None

def test_client_missing_key():
    try:
        TalkieClient(api_key="")
        assert False, "Should have raised AuthenticationError"
    except AuthenticationError as e:
        assert e.code == "MISSING_API_KEY"

def test_client_headers():
    client = TalkieClient(api_key="tk_live_abc")
    headers = client._headers()
    assert headers["Authorization"] == "Bearer tk_live_abc"
    assert headers["Content-Type"] == "application/json"
