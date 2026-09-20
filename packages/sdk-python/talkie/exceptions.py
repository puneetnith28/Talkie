"""Talkie SDK Exception Classes."""

class TalkieError(Exception):
    """Base exception for all Talkie SDK errors."""
    def __init__(self, message: str, code: str = "TALKIE_ERROR", details: dict = None):
        super().__init__(message)
        self.message = message
        self.code = code
        self.details = details or {}

class AuthenticationError(TalkieError):
    """Raised when authentication fails (invalid API key)."""
    pass

class NotFoundError(TalkieError):
    """Raised when a requested resource is not found."""
    pass

class ValidationError(TalkieError):
    """Raised when parameters fail validation."""
    pass
