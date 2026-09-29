"""Per-client-IP sliding-window rate limits for the public forms and auth endpoints.

In-memory, so limits are per API process. Enough for one container; move to Redis if the API is scaled out.
Behind a reverse proxy run uvicorn with `--proxy-headers --forwarded-allow-ips=<proxy ip>` so request.client
is the visitor, not the proxy.
"""

import time
from collections import defaultdict, deque
from threading import Lock

from fastapi import Depends, HTTPException, Request, status

from app.core.config import settings

_hits: dict[tuple[str, str], deque[float]] = defaultdict(deque)
_lock = Lock()


def reset() -> None:
    with _lock:
        _hits.clear()


def rate_limit(scope: str, limit: int, window_seconds: int):
    """Route dependency: `dependencies=[rate_limit("subscribe", 10, 3600)]`."""

    def check(request: Request) -> None:
        if not settings.rate_limit_enabled:
            return
        key = (scope, request.client.host if request.client else "unknown")
        now = time.monotonic()
        with _lock:
            hits = _hits[key]
            while hits and hits[0] <= now - window_seconds:
                hits.popleft()
            if len(hits) >= limit:
                retry = int(hits[0] + window_seconds - now) + 1
                raise HTTPException(
                    status.HTTP_429_TOO_MANY_REQUESTS,
                    "Too many attempts. Please wait a few minutes and try again.",
                    headers={"Retry-After": str(retry)},
                )
            hits.append(now)

    return Depends(check)
