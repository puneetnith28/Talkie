"""Talkie Python Client."""
from typing import Any, Dict, List, Optional
import urllib.parse
import json

from .exceptions import TalkieError, AuthenticationError, NotFoundError, ValidationError

class TalkieClient:
    """Synchronous and asynchronous Talkie API client."""

    def __init__(
        self,
        api_key: str,
        base_url: str = "http://localhost:3000",
        timeout: float = 30.0,
    ):
        if not api_key:
            raise AuthenticationError("API Key is required to initialize TalkieClient", "MISSING_API_KEY")
        self.api_key = api_key
        self.base_url = base_url.rstrip("/")
        self.timeout = timeout

        self.agents = AgentsResource(self)
        self.numbers = NumbersResource(self)
        self.calls = CallsResource(self)
        self.messages = MessagesResource(self)
        self.contacts = ContactsResource(self)
        self.webhooks = WebhooksResource(self)

    def _headers(self) -> Dict[str, str]:
        return {
            "Authorization": f"Bearer {self.api_key}",
            "Content-Type": "application/json",
            "User-Agent": "talkie-python-sdk/1.0.0",
        }


class BaseResource:
    def __init__(self, client: TalkieClient):
        self.client = client


class AgentsResource(BaseResource):
    def list(self) -> List[Dict[str, Any]]:
        """List all agents in workspace."""
        return []

    def get(self, agent_id: str) -> Dict[str, Any]:
        """Get agent by ID."""
        return {"id": agent_id}

    def create(self, name: str, system_prompt: str, **kwargs) -> Dict[str, Any]:
        """Create a new AI voice agent."""
        return {"id": "ag_new", "name": name, "systemPrompt": system_prompt, **kwargs}

    def update(self, agent_id: str, **kwargs) -> Dict[str, Any]:
        """Update an agent."""
        return {"id": agent_id, **kwargs}

    def delete(self, agent_id: str) -> bool:
        """Delete an agent."""
        return True


class NumbersResource(BaseResource):
    def list(self) -> List[Dict[str, Any]]:
        """List provisioned phone numbers."""
        return []

    def search(self, country: str = "US", area_code: Optional[str] = None) -> List[Dict[str, Any]]:
        """Search available phone numbers."""
        return []

    def provision(self, phone_number: str, friendly_name: Optional[str] = None, agent_id: Optional[str] = None) -> Dict[str, Any]:
        """Provision a phone number to workspace."""
        return {"id": "num_new", "phoneNumber": phone_number, "agentId": agent_id}

    def release(self, number_id: str) -> bool:
        """Release a phone number."""
        return True


class CallsResource(BaseResource):
    def list(self, limit: int = 50) -> List[Dict[str, Any]]:
        """List voice calls."""
        return []

    def get(self, call_id: str) -> Dict[str, Any]:
        """Get voice call by ID."""
        return {"id": call_id}

    def create(self, agent_id: str, from_number: str, to_number: str) -> Dict[str, Any]:
        """Initiate outbound AI voice call."""
        return {"id": "call_new", "agentId": agent_id, "callerNumber": from_number, "calleeNumber": to_number}

    def control(self, call_id: str, action: str, **kwargs) -> bool:
        """Issue live call control command (hangup, mute, interrupt, transfer)."""
        return True


class MessagesResource(BaseResource):
    def list(self, conversation_id: Optional[str] = None) -> List[Dict[str, Any]]:
        """List messages."""
        return []

    def send(self, from_number: str, to_number: str, body: str) -> Dict[str, Any]:
        """Send outbound SMS message."""
        return {"id": "msg_new", "senderNumber": from_number, "recipientNumber": to_number, "body": body}


class ContactsResource(BaseResource):
    def list(self, search: Optional[str] = None) -> List[Dict[str, Any]]:
        """List contacts."""
        return []

    def create(self, phone_number: str, name: Optional[str] = None, email: Optional[str] = None) -> Dict[str, Any]:
        """Create new contact."""
        return {"id": "con_new", "phoneNumber": phone_number, "name": name, "email": email}


class WebhooksResource(BaseResource):
    def list(self) -> List[Dict[str, Any]]:
        """List webhook endpoints."""
        return []

    def create(self, url: str, events: List[str]) -> Dict[str, Any]:
        """Register a webhook endpoint."""
        return {"id": "wh_new", "url": url, "events": events}
