# Foosball ELO Tracker - Monitoring & Logging Strategy

## Logging Architecture

### Structured Logging with Pydantic

```python
# app/logging/models.py
from pydantic import BaseModel, Field
from typing import Optional, Dict, Any
from datetime import datetime
from enum import Enum

class LogLevel(str, Enum):
    DEBUG = "DEBUG"
    INFO = "INFO"
    WARNING = "WARNING"
    ERROR = "ERROR"
    CRITICAL = "CRITICAL"

class LogEntry(BaseModel):
    timestamp: datetime = Field(default_factory=datetime.utcnow)
    level: LogLevel
    message: str
    service: str = "foosball-api"
    version: str
    request_id: Optional[str] = None
    user_id: Optional[int] = None
    endpoint: Optional[str] = None
    method: Optional[str] = None
    status_code: Optional[int] = None
    duration_ms: Optional[float] = None
    context: Dict[str, Any] = Field(default_factory=dict)

class GameLogEntry(LogEntry):
    game_id: Optional[int] = None
    player1_id: Optional[int] = None
    player2_id: Optional[int] = None
    winner_id: Optional[int] = None
    rating_change: Optional[Dict[str, float]] = None

class ErrorLogEntry(LogEntry):
    error_type: str
    error_message: str
    stack_trace: Optional[str] = None
    user_agent: Optional[str] = None
    ip_address: Optional[str] = None
```

### Logging Configuration

```python
# app/logging/config.py
import logging
import json
from typing import Any, Dict
from pythonjsonlogger import jsonlogger
from app.config import config

class StructuredJSONFormatter(jsonlogger.JsonFormatter):
    def add_fields(self, log_record: Dict[str, Any], record: logging.LogRecord, message_dict: Dict[str, Any]) -> None:
        super().add_fields(log_record, record, message_dict)

        # Add standard fields
        log_record['timestamp'] = record.created
        log_record['level'] = record.levelname
        log_record['service'] = 'foosball-api'
        log_record['version'] = config.app.version

        # Add request context if available
        if hasattr(record, 'request_id'):
            log_record['request_id'] = record.request_id
        if hasattr(record, 'user_id'):
            log_record['user_id'] = record.user_id
        if hasattr(record, 'endpoint'):
            log_record['endpoint'] = record.endpoint

def setup_logging():
    root_logger = logging.getLogger()
    root_logger.setLevel(getattr(logging, config.log_level))

    # Remove default handlers
    for handler in root_logger.handlers[:]:
        root_logger.removeHandler(handler)

    # Create console handler
    console_handler = logging.StreamHandler()

    if config.log_format == "json":
        formatter = StructuredJSONFormatter(
            '%(timestamp)s %(level)s %(name)s %(message)s'
        )
    else:
        formatter = logging.Formatter(
            '%(asctime)s - %(name)s - %(levelname)s - %(message)s'
        )

    console_handler.setFormatter(formatter)
    root_logger.addHandler(console_handler)

    return root_logger
```

### Request Logging Middleware

```python
# app/middleware/logging.py
import time
import uuid
import logging
from contextvars import ContextVar
from fastapi import Request, Response
from starlette.middleware.base import BaseHTTPMiddleware

# Context variables for request tracking
request_id_var: ContextVar[str] = ContextVar('request_id')
user_id_var: ContextVar[int] = ContextVar('user_id', default=None)

logger = logging.getLogger(__name__)

class LoggingMiddleware(BaseHTTPMiddleware):
    async def dispatch(self, request: Request, call_next):
        # Generate request ID
        request_id = str(uuid.uuid4())
        request_id_var.set(request_id)

        # Start timing
        start_time = time.time()

        # Log request
        logger.info(
            "Request started",
            extra={
                'request_id': request_id,
                'method': request.method,
                'url': str(request.url),
                'endpoint': request.url.path,
                'user_agent': request.headers.get('user-agent'),
                'ip_address': request.client.host
            }
        )

        # Process request
        try:
            response = await call_next(request)
            duration_ms = (time.time() - start_time) * 1000

            # Log response
            logger.info(
                "Request completed",
                extra={
                    'request_id': request_id,
                    'method': request.method,
                    'endpoint': request.url.path,
                    'status_code': response.status_code,
                    'duration_ms': round(duration_ms, 2)
                }
            )

            return response

        except Exception as e:
            duration_ms = (time.time() - start_time) * 1000

            logger.error(
                "Request failed",
                extra={
                    'request_id': request_id,
                    'method': request.method,
                    'endpoint': request.url.path,
                    'duration_ms': round(duration_ms, 2),
                    'error_type': type(e).__name__,
                    'error_message': str(e)
                }
            )
            raise

# Helper function for business logic logging
def get_logger_with_context(name: str) -> logging.Logger:
    logger = logging.getLogger(name)

    class ContextLoggerAdapter(logging.LoggerAdapter):
        def process(self, msg, kwargs):
            extra = kwargs.get('extra', {})

            # Add context variables
            try:
                extra['request_id'] = request_id_var.get()
            except LookupError:
                pass

            try:
                extra['user_id'] = user_id_var.get()
            except LookupError:
                pass

            kwargs['extra'] = extra
            return msg, kwargs

    return ContextLoggerAdapter(logger, {})
```

### Business Logic Logging

```python
# app/services/game_service.py
from app.middleware.logging import get_logger_with_context

logger = get_logger_with_context(__name__)

class GameService:
    async def create_game(self, game_data: GameCreate) -> Game:
        logger.info(
            "Creating new game",
            extra={
                'player1_id': game_data.player1_id,
                'player2_id': game_data.player2_id,
                'winner_id': game_data.winner_id
            }
        )

        try:
            # Create game logic
            game = await self._create_game_record(game_data)

            # Calculate rating changes
            rating_changes = await self._update_ratings(game_data)

            logger.info(
                "Game created successfully",
                extra={
                    'game_id': game.id,
                    'player1_id': game_data.player1_id,
                    'player2_id': game_data.player2_id,
                    'winner_id': game_data.winner_id,
                    'rating_changes': rating_changes
                }
            )

            return game

        except Exception as e:
            logger.error(
                "Failed to create game",
                extra={
                    'player1_id': game_data.player1_id,
                    'player2_id': game_data.player2_id,
                    'winner_id': game_data.winner_id,
                    'error_type': type(e).__name__,
                    'error_message': str(e)
                }
            )
            raise
```

## Monitoring Architecture

### Health Checks

```python
# app/api/health.py
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.database import get_db
from app.config import config
import psutil
import time

router = APIRouter()

@router.get("/health")
async def health_check():
    """Basic health check endpoint"""
    return {
        "status": "healthy",
        "timestamp": time.time(),
        "service": "foosball-api",
        "version": config.app.version
    }

@router.get("/ready")
async def readiness_check(db: Session = Depends(get_db)):
    """Detailed readiness check"""
    try:
        # Check database connectivity
        db.execute("SELECT 1")

        # Check system resources
        memory_percent = psutil.virtual_memory().percent
        disk_percent = psutil.disk_usage('/').percent

        # Determine if system is ready
        is_ready = memory_percent < 90 and disk_percent < 90

        return {
            "status": "ready" if is_ready else "not_ready",
            "timestamp": time.time(),
            "checks": {
                "database": "healthy",
                "memory_usage_percent": memory_percent,
                "disk_usage_percent": disk_percent
            }
        }

    except Exception as e:
        raise HTTPException(
            status_code=503,
            detail={
                "status": "not_ready",
                "error": str(e),
                "timestamp": time.time()
            }
        )

@router.get("/metrics")
async def metrics_endpoint(db: Session = Depends(get_db)):
    """Prometheus-style metrics endpoint"""
    try:
        # Get basic metrics
        total_players = db.execute("SELECT COUNT(*) FROM players").scalar()
        total_games = db.execute("SELECT COUNT(*) FROM games").scalar()
        games_today = db.execute(
            "SELECT COUNT(*) FROM games WHERE created_at >= CURRENT_DATE"
        ).scalar()

        # System metrics
        memory_usage = psutil.virtual_memory().percent
        cpu_usage = psutil.cpu_percent()

        return {
            "business_metrics": {
                "total_players": total_players,
                "total_games": total_games,
                "games_today": games_today
            },
            "system_metrics": {
                "memory_usage_percent": memory_usage,
                "cpu_usage_percent": cpu_usage
            },
            "timestamp": time.time()
        }

    except Exception as e:
        logger.error("Failed to collect metrics", extra={'error': str(e)})
        raise HTTPException(status_code=500, detail="Failed to collect metrics")
```

### Performance Monitoring

```python
# app/middleware/metrics.py
import time
from typing import Dict, Any
from fastapi import Request
from starlette.middleware.base import BaseHTTPMiddleware
from collections import defaultdict, deque
from threading import Lock

class MetricsCollector:
    def __init__(self):
        self._request_times: Dict[str, deque] = defaultdict(lambda: deque(maxlen=1000))
        self._request_counts: Dict[str, int] = defaultdict(int)
        self._error_counts: Dict[str, int] = defaultdict(int)
        self._lock = Lock()

    def record_request(self, endpoint: str, duration_ms: float, status_code: int):
        with self._lock:
            self._request_times[endpoint].append(duration_ms)
            self._request_counts[endpoint] += 1

            if status_code >= 400:
                self._error_counts[endpoint] += 1

    def get_metrics(self) -> Dict[str, Any]:
        with self._lock:
            metrics = {}

            for endpoint in self._request_times:
                times = list(self._request_times[endpoint])
                if times:
                    metrics[endpoint] = {
                        'count': self._request_counts[endpoint],
                        'errors': self._error_counts[endpoint],
                        'avg_duration_ms': sum(times) / len(times),
                        'p95_duration_ms': sorted(times)[int(len(times) * 0.95)] if times else 0,
                        'error_rate': self._error_counts[endpoint] / self._request_counts[endpoint]
                    }

            return metrics

# Global metrics collector
metrics_collector = MetricsCollector()

class MetricsMiddleware(BaseHTTPMiddleware):
    async def dispatch(self, request: Request, call_next):
        start_time = time.time()

        response = await call_next(request)

        duration_ms = (time.time() - start_time) * 1000
        endpoint = request.url.path

        metrics_collector.record_request(endpoint, duration_ms, response.status_code)

        return response
```

### Error Tracking Integration

```python
# app/utils/error_tracking.py
import sentry_sdk
from sentry_sdk.integrations.fastapi import FastApiIntegration
from sentry_sdk.integrations.sqlalchemy import SqlalchemyIntegration
from app.config import config

def setup_error_tracking():
    if config.sentry_dsn:
        sentry_sdk.init(
            dsn=config.sentry_dsn,
            environment=config.environment,
            integrations=[
                FastApiIntegration(auto_enabling_integrations=False),
                SqlalchemyIntegration(),
            ],
            traces_sample_rate=0.1 if config.environment == "production" else 1.0,
            profiles_sample_rate=0.1 if config.environment == "production" else 1.0,
        )

def capture_business_event(event_name: str, extra_data: dict = None):
    """Capture custom business events"""
    with sentry_sdk.configure_scope() as scope:
        if extra_data:
            for key, value in extra_data.items():
                scope.set_extra(key, value)

        sentry_sdk.capture_message(event_name, level='info')
```

## Frontend Monitoring

### Error Boundary with Logging

```typescript
// src/components/ErrorBoundary.tsx
import React, { Component, ErrorInfo, ReactNode } from 'react';
import * as Sentry from '@sentry/react';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
}

class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false
  };

  public static getDerivedStateFromError(_: Error): State {
    return { hasError: true };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Uncaught error:', error, errorInfo);

    // Send to Sentry
    Sentry.captureException(error, {
      contexts: {
        react: {
          componentStack: errorInfo.componentStack
        }
      }
    });
  }

  public render() {
    if (this.state.hasError) {
      return (
        <div className="error-boundary">
          <h2>Something went wrong</h2>
          <p>We've been notified and are working on a fix.</p>
          <button onClick={() => this.setState({ hasError: false })}>
            Try again
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
```

### Performance Monitoring

```typescript
// src/utils/performance.ts
interface PerformanceMetric {
  name: string;
  value: number;
  timestamp: number;
}

class PerformanceMonitor {
  private metrics: PerformanceMetric[] = [];

  startTimer(name: string): () => void {
    const startTime = performance.now();

    return () => {
      const duration = performance.now() - startTime;
      this.recordMetric(name, duration);
    };
  }

  recordMetric(name: string, value: number) {
    this.metrics.push({
      name,
      value,
      timestamp: Date.now()
    });

    // Send to analytics service
    if (window.gtag) {
      window.gtag('event', 'timing_complete', {
        name: name,
        value: Math.round(value)
      });
    }
  }

  getMetrics(): PerformanceMetric[] {
    return [...this.metrics];
  }
}

export const performanceMonitor = new PerformanceMonitor();

// Hook for component performance monitoring
export const usePerformanceTimer = (name: string) => {
  React.useEffect(() => {
    const stopTimer = performanceMonitor.startTimer(name);
    return stopTimer;
  }, [name]);
};
```

## Alerting Strategy

### Alert Definitions

```python
# monitoring/alerts.py
from dataclasses import dataclass
from typing import List, Optional
from enum import Enum

class AlertSeverity(Enum):
    LOW = "low"
    MEDIUM = "medium"
    HIGH = "high"
    CRITICAL = "critical"

@dataclass
class AlertRule:
    name: str
    description: str
    severity: AlertSeverity
    threshold: float
    duration: str  # e.g., "5m", "1h"
    channels: List[str]  # e.g., ["slack", "email", "pagerduty"]

# Alert rules configuration
ALERT_RULES = [
    AlertRule(
        name="high_response_time",
        description="API response time is too high",
        severity=AlertSeverity.HIGH,
        threshold=2000,  # 2 seconds
        duration="5m",
        channels=["slack"]
    ),
    AlertRule(
        name="high_error_rate",
        description="Error rate is above threshold",
        severity=AlertSeverity.CRITICAL,
        threshold=0.05,  # 5%
        duration="1m",
        channels=["slack", "pagerduty"]
    ),
    AlertRule(
        name="database_connection_failure",
        description="Cannot connect to database",
        severity=AlertSeverity.CRITICAL,
        threshold=1,
        duration="0s",
        channels=["slack", "pagerduty", "email"]
    ),
    AlertRule(
        name="low_disk_space",
        description="Disk space is running low",
        severity=AlertSeverity.MEDIUM,
        threshold=0.8,  # 80%
        duration="10m",
        channels=["slack"]
    )
]
```

### Notification System

```python
# app/utils/notifications.py
import requests
import smtplib
from email.mime.text import MIMEText
from typing import Dict, Any
from app.config import config

class NotificationService:
    def __init__(self):
        self.slack_webhook = config.slack_webhook_url
        self.email_config = config.email

    async def send_alert(self, alert_type: str, message: str, severity: str, data: Dict[str, Any] = None):
        """Send alert through configured channels"""

        if self.slack_webhook:
            await self._send_slack_alert(alert_type, message, severity, data)

        if severity in ["high", "critical"] and self.email_config:
            await self._send_email_alert(alert_type, message, severity, data)

    async def _send_slack_alert(self, alert_type: str, message: str, severity: str, data: Dict[str, Any]):
        color_map = {
            "low": "#36a64f",
            "medium": "#ff9500",
            "high": "#ff0000",
            "critical": "#8B0000"
        }

        payload = {
            "attachments": [
                {
                    "color": color_map.get(severity, "#36a64f"),
                    "title": f"{severity.upper()}: {alert_type}",
                    "text": message,
                    "fields": [
                        {"title": key, "value": str(value), "short": True}
                        for key, value in (data or {}).items()
                    ],
                    "ts": int(time.time())
                }
            ]
        }

        async with httpx.AsyncClient() as client:
            await client.post(self.slack_webhook, json=payload)

    async def _send_email_alert(self, alert_type: str, message: str, severity: str, data: Dict[str, Any]):
        # Email implementation
        pass
```

## Phase 0 Integration

Add these monitoring tasks to Phase 0:

### 0.1 Backend Foundation
- [ ] 0.1.15 Set up structured logging with Pydantic models
- [ ] 0.1.16 Configure logging middleware and context tracking
- [ ] 0.1.17 Implement health check and metrics endpoints
- [ ] 0.1.18 Set up error tracking with Sentry

### 0.2 Frontend Foundation
- [ ] 0.2.13 Set up error boundary with logging
- [ ] 0.2.14 Implement performance monitoring
- [ ] 0.2.15 Configure frontend error tracking

### 0.3 Integration Testing
- [ ] 0.3.12 Test logging pipeline end-to-end
- [ ] 0.3.13 Verify monitoring and alerting systems
- [ ] 0.3.14 Test error tracking and notification flows

## Log Retention & Storage

### Development
- Console output only
- 7-day retention for debugging

### Staging
- Structured JSON logs
- 30-day retention
- Centralized logging (ELK stack or cloud equivalent)

### Production
- Structured JSON logs
- 90-day retention for operational logs
- 1-year retention for audit logs
- Centralized logging with search capabilities
- Log aggregation and analysis tools
