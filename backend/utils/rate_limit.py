import time
from fastapi import Request
from fastapi.responses import JSONResponse
from starlette.middleware.base import BaseHTTPMiddleware
from collections import defaultdict

class RateLimitingMiddleware(BaseHTTPMiddleware):
    def __init__(self, app, limit: int = 60, window: int = 60):
        super().__init__(app)
        self.limit = limit
        self.window = window
        self.requests = defaultdict(list)

    async def dispatch(self, request: Request, call_next):
        # Exclude static/docs/favicon paths if necessary
        path = request.url.path
        if path.startswith("/static") or path == "/favicon.ico" or path == "/":
            return await call_next(request)
            
        client_ip = request.client.host if request.client else "unknown"
        current_time = time.time()
        
        # Filter request timestamps in the current window
        self.requests[client_ip] = [
            t for t in self.requests[client_ip] if current_time - t < self.window
        ]
        
        if len(self.requests[client_ip]) >= self.limit:
            return JSONResponse(
                status_code=429,
                content={"detail": "Rate limit exceeded. Please try again later."}
            )
            
        self.requests[client_ip].append(current_time)
        return await call_next(request)
