# Foosball ELO Tracker - API Standards & Documentation

## API Design Principles

### RESTful Design
- Use HTTP methods semantically (GET, POST, PUT, DELETE)
- Resource-based URLs (nouns, not verbs)
- Consistent naming conventions
- Stateless design
- Proper HTTP status codes

### URL Structure
```
Base URL: https://api.foosball.company.com/api/v1

Resources:
/players              # Player collection
/players/{id}         # Specific player
/players/{id}/games   # Player's games
/games               # Game collection
/games/{id}          # Specific game
/teams               # Team collection (Phase 2)
/tournaments         # Tournament collection (Phase 3)
```

## Request/Response Standards

### Content Type
- Request: `application/json`
- Response: `application/json`
- Character encoding: `UTF-8`

### Request Headers
```http
Content-Type: application/json
Accept: application/json
Authorization: Bearer {token}  # When auth is implemented
X-Request-ID: {uuid}          # For request tracing
```

### Response Headers
```http
Content-Type: application/json; charset=utf-8
X-Request-ID: {uuid}          # Echo request ID
X-Response-Time: {ms}         # Response time in milliseconds
```

## HTTP Status Codes

### Success Codes
- `200 OK` - Successful GET, PUT requests
- `201 Created` - Successful POST requests
- `204 No Content` - Successful DELETE requests

### Client Error Codes
- `400 Bad Request` - Invalid request data
- `401 Unauthorized` - Authentication required
- `403 Forbidden` - Access denied
- `404 Not Found` - Resource not found
- `409 Conflict` - Resource conflict (e.g., duplicate name)
- `422 Unprocessable Entity` - Validation errors

### Server Error Codes
- `500 Internal Server Error` - Unexpected server error
- `502 Bad Gateway` - External service error
- `503 Service Unavailable` - Service temporarily unavailable

## Response Formats

### Success Response Structure
```json
{
  "data": {
    // Actual response data
  },
  "meta": {
    "request_id": "uuid",
    "timestamp": "2024-01-01T00:00:00Z",
    "version": "1.0.0"
  }
}
```

### Collection Response Structure
```json
{
  "data": [
    // Array of resources
  ],
  "meta": {
    "total": 100,
    "page": 1,
    "per_page": 20,
    "total_pages": 5,
    "request_id": "uuid",
    "timestamp": "2024-01-01T00:00:00Z"
  },
  "links": {
    "self": "/api/v1/players?page=1",
    "next": "/api/v1/players?page=2",
    "prev": null,
    "first": "/api/v1/players?page=1",
    "last": "/api/v1/players?page=5"
  }
}
```

### Error Response Structure
```json
{
  "error": {
    "code": "validation_error",
    "message": "The request contains invalid data",
    "details": [
      {
        "field": "name",
        "message": "This field is required",
        "code": "required"
      },
      {
        "field": "email",
        "message": "Invalid email format",
        "code": "invalid_format"
      }
    ]
  },
  "meta": {
    "request_id": "uuid",
    "timestamp": "2024-01-01T00:00:00Z"
  }
}
```

## Pydantic Models

### Base Models
```python
# app/api/models/base.py
from pydantic import BaseModel, Field
from typing import Optional, Dict, Any
from datetime import datetime

class BaseResponse(BaseModel):
    """Base response model with metadata"""
    meta: Dict[str, Any] = Field(
        default_factory=lambda: {
            "timestamp": datetime.utcnow().isoformat() + "Z",
            "version": "1.0.0"
        }
    )

class ErrorDetail(BaseModel):
    field: str
    message: str
    code: str

class ErrorResponse(BaseModel):
    error: Dict[str, Any]
    meta: Dict[str, Any]

class PaginationMeta(BaseModel):
    total: int
    page: int
    per_page: int
    total_pages: int

class PaginatedResponse(BaseResponse):
    data: list
    meta: Dict[str, Any]
    links: Optional[Dict[str, Optional[str]]] = None
```

### Player Models
```python
# app/api/models/player.py
from pydantic import BaseModel, Field, validator
from typing import Optional
from datetime import datetime

class PlayerBase(BaseModel):
    name: str = Field(..., min_length=1, max_length=100, description="Player name")
    email: Optional[str] = Field(None, description="Player email for notifications")

class PlayerCreate(PlayerBase):
    @validator('name')
    def name_must_not_be_empty(cls, v):
        if not v.strip():
            raise ValueError('Name cannot be empty')
        return v.strip()

class PlayerUpdate(BaseModel):
    name: Optional[str] = Field(None, min_length=1, max_length=100)
    email: Optional[str] = None
    is_active: Optional[bool] = None

class PlayerResponse(PlayerBase):
    id: int
    elo_rating: float = Field(..., description="Current ELO rating")
    trueskill_mu: float = Field(..., description="TrueSkill mu (skill estimate)")
    trueskill_sigma: float = Field(..., description="TrueSkill sigma (uncertainty)")
    games_played: int = Field(..., description="Total games played")
    wins: int = Field(..., description="Total wins")
    losses: int = Field(..., description="Total losses")
    win_percentage: float = Field(..., description="Win percentage (0-100)")
    created_at: datetime
    updated_at: Optional[datetime] = None
    is_active: bool

    class Config:
        from_attributes = True

class PlayerListResponse(BaseResponse):
    data: list[PlayerResponse]
    meta: Dict[str, Any]
    links: Optional[Dict[str, Optional[str]]] = None
```

### Game Models
```python
# app/api/models/game.py
from pydantic import BaseModel, Field, validator
from typing import Optional
from datetime import datetime

class GameBase(BaseModel):
    player1_id: int = Field(..., description="First player ID")
    player2_id: int = Field(..., description="Second player ID")
    winner_id: int = Field(..., description="Winner player ID")
    notes: Optional[str] = Field(None, max_length=500, description="Game notes")

class GameCreate(GameBase):
    @validator('winner_id')
    def winner_must_be_player(cls, v, values):
        if 'player1_id' in values and 'player2_id' in values:
            if v not in [values['player1_id'], values['player2_id']]:
                raise ValueError('Winner must be one of the players')
        return v

    @validator('player2_id')
    def players_must_be_different(cls, v, values):
        if 'player1_id' in values and v == values['player1_id']:
            raise ValueError('Players must be different')
        return v

class GameResponse(GameBase):
    id: int
    created_at: datetime
    # Include player details
    player1: dict = Field(..., description="First player details")
    player2: dict = Field(..., description="Second player details")
    winner: dict = Field(..., description="Winner details")
    # Rating changes
    rating_changes: Optional[dict] = Field(None, description="Rating changes for both players")

    class Config:
        from_attributes = True

class GameListResponse(BaseResponse):
    data: list[GameResponse]
    meta: Dict[str, Any]
    links: Optional[Dict[str, Optional[str]]] = None
```

## API Endpoints Specification

### Players Endpoints

#### GET /api/v1/players
```python
@router.get("/players", response_model=PlayerListResponse)
async def list_players(
    page: int = Query(1, ge=1, description="Page number"),
    per_page: int = Query(20, ge=1, le=100, description="Items per page"),
    sort_by: str = Query("elo_rating", description="Sort field"),
    sort_order: str = Query("desc", regex="^(asc|desc)$", description="Sort order"),
    search: Optional[str] = Query(None, description="Search by name"),
    active_only: bool = Query(True, description="Show only active players"),
    db: Session = Depends(get_db)
):
    """
    List all players with pagination and filtering.

    - **page**: Page number (default: 1)
    - **per_page**: Items per page (default: 20, max: 100)
    - **sort_by**: Sort field (elo_rating, name, games_played, created_at)
    - **sort_order**: Sort order (asc, desc)
    - **search**: Search players by name
    - **active_only**: Show only active players
    """
```

#### POST /api/v1/players
```python
@router.post("/players", response_model=PlayerResponse, status_code=201)
async def create_player(
    player: PlayerCreate,
    db: Session = Depends(get_db)
):
    """
    Create a new player.

    - **name**: Player name (required, 1-100 characters)
    - **email**: Player email (optional, for notifications)
    """
```

#### GET /api/v1/players/{player_id}
```python
@router.get("/players/{player_id}", response_model=PlayerResponse)
async def get_player(
    player_id: int = Path(..., description="Player ID"),
    db: Session = Depends(get_db)
):
    """Get a specific player by ID."""
```

#### PUT /api/v1/players/{player_id}
```python
@router.put("/players/{player_id}", response_model=PlayerResponse)
async def update_player(
    player_id: int = Path(..., description="Player ID"),
    player_update: PlayerUpdate,
    db: Session = Depends(get_db)
):
    """Update a player's information."""
```

#### DELETE /api/v1/players/{player_id}
```python
@router.delete("/players/{player_id}", status_code=204)
async def delete_player(
    player_id: int = Path(..., description="Player ID"),
    db: Session = Depends(get_db)
):
    """Delete a player (soft delete)."""
```

#### GET /api/v1/players/{player_id}/games
```python
@router.get("/players/{player_id}/games", response_model=GameListResponse)
async def get_player_games(
    player_id: int = Path(..., description="Player ID"),
    page: int = Query(1, ge=1),
    per_page: int = Query(20, ge=1, le=100),
    db: Session = Depends(get_db)
):
    """Get all games for a specific player."""
```

### Games Endpoints

#### GET /api/v1/games
```python
@router.get("/games", response_model=GameListResponse)
async def list_games(
    page: int = Query(1, ge=1),
    per_page: int = Query(20, ge=1, le=100),
    player_id: Optional[int] = Query(None, description="Filter by player ID"),
    from_date: Optional[datetime] = Query(None, description="Filter from date"),
    to_date: Optional[datetime] = Query(None, description="Filter to date"),
    db: Session = Depends(get_db)
):
    """List all games with filtering options."""
```

#### POST /api/v1/games
```python
@router.post("/games", response_model=GameResponse, status_code=201)
async def create_game(
    game: GameCreate,
    db: Session = Depends(get_db)
):
    """
    Record a new game and update player ratings.

    - **player1_id**: First player ID
    - **player2_id**: Second player ID
    - **winner_id**: Winner player ID (must be player1_id or player2_id)
    - **notes**: Optional game notes
    """
```

#### GET /api/v1/games/{game_id}
```python
@router.get("/games/{game_id}", response_model=GameResponse)
async def get_game(
    game_id: int = Path(..., description="Game ID"),
    db: Session = Depends(get_db)
):
    """Get a specific game by ID."""
```

## Error Handling

### Custom Exception Classes
```python
# app/api/exceptions.py
from fastapi import HTTPException
from typing import List, Dict, Any

class ValidationError(HTTPException):
    def __init__(self, details: List[Dict[str, Any]]):
        super().__init__(
            status_code=422,
            detail={
                "code": "validation_error",
                "message": "The request contains invalid data",
                "details": details
            }
        )

class NotFoundError(HTTPException):
    def __init__(self, resource: str, identifier: Any):
        super().__init__(
            status_code=404,
            detail={
                "code": "not_found",
                "message": f"{resource} not found",
                "resource": resource,
                "identifier": str(identifier)
            }
        )

class ConflictError(HTTPException):
    def __init__(self, message: str, details: Dict[str, Any] = None):
        super().__init__(
            status_code=409,
            detail={
                "code": "conflict",
                "message": message,
                "details": details or {}
            }
        )
```

### Global Exception Handler
```python
# app/api/exception_handlers.py
from fastapi import Request, HTTPException
from fastapi.responses import JSONResponse
from fastapi.exceptions import RequestValidationError
from starlette.exceptions import HTTPException as StarletteHTTPException
import logging

logger = logging.getLogger(__name__)

async def http_exception_handler(request: Request, exc: HTTPException):
    return JSONResponse(
        status_code=exc.status_code,
        content={
            "error": exc.detail if isinstance(exc.detail, dict) else {
                "code": "http_error",
                "message": str(exc.detail)
            },
            "meta": {
                "request_id": getattr(request.state, "request_id", None),
                "timestamp": datetime.utcnow().isoformat() + "Z"
            }
        }
    )

async def validation_exception_handler(request: Request, exc: RequestValidationError):
    errors = []
    for error in exc.errors():
        errors.append({
            "field": ".".join(str(x) for x in error["loc"][1:]),  # Skip 'body'
            "message": error["msg"],
            "code": error["type"]
        })

    return JSONResponse(
        status_code=422,
        content={
            "error": {
                "code": "validation_error",
                "message": "Request validation failed",
                "details": errors
            },
            "meta": {
                "request_id": getattr(request.state, "request_id", None),
                "timestamp": datetime.utcnow().isoformat() + "Z"
            }
        }
    )
```

## API Documentation

### FastAPI Auto-Documentation Enhancement
```python
# app/main.py
from fastapi import FastAPI
from fastapi.openapi.docs import get_swagger_ui_html
from fastapi.openapi.utils import get_openapi

app = FastAPI(
    title="Foosball ELO Tracker API",
    description="API for tracking foosball games and player ratings",
    version="1.0.0",
    contact={
        "name": "Foosball Team",
        "email": "foosball@company.com"
    },
    license_info={
        "name": "MIT"
    },
    docs_url=None,  # Disable default docs
    redoc_url=None  # Disable default redoc
)

@app.get("/docs", include_in_schema=False)
async def custom_swagger_ui_html():
    return get_swagger_ui_html(
        openapi_url=app.openapi_url,
        title=app.title + " - Swagger UI",
        oauth2_redirect_url=app.swagger_ui_oauth2_redirect_url,
        swagger_js_url="https://unpkg.com/swagger-ui-dist@4.15.5/swagger-ui-bundle.js",
        swagger_css_url="https://unpkg.com/swagger-ui-dist@4.15.5/swagger-ui.css",
    )

def custom_openapi():
    if app.openapi_schema:
        return app.openapi_schema

    openapi_schema = get_openapi(
        title="Foosball ELO Tracker API",
        version="1.0.0",
        description="A comprehensive API for tracking foosball games and managing player ratings using ELO and TrueSkill systems.",
        routes=app.routes,
    )

    # Add custom info
    openapi_schema["info"]["x-logo"] = {
        "url": "https://foosball.company.com/logo.png"
    }

    # Add server information
    openapi_schema["servers"] = [
        {"url": "https://api.foosball.company.com", "description": "Production server"},
        {"url": "https://api-staging.foosball.company.com", "description": "Staging server"},
        {"url": "http://localhost:8000", "description": "Development server"}
    ]

    app.openapi_schema = openapi_schema
    return app.openapi_schema

app.openapi = custom_openapi
```

## API Versioning Strategy

### URL-based Versioning
- Current: `/api/v1/`
- Future: `/api/v2/` when breaking changes needed

### Deprecation Policy
- 6-month notice for deprecation
- Support previous version for 12 months
- Clear migration guides

### Version Headers
```http
API-Version: 1.0
Deprecated-API-Warning: This API version will be deprecated on 2024-12-01
```

## Phase 0 Integration

Add these API standards tasks to Phase 0:

### 0.1 Backend Foundation
- [ ] 0.1.19 Set up Pydantic models for requests/responses
- [ ] 0.1.20 Implement error handling and exception classes
- [ ] 0.1.21 Create API documentation with custom OpenAPI schema
- [ ] 0.1.22 Set up response formatting middleware

### 0.3 Integration Testing
- [ ] 0.3.15 Test API documentation generation
- [ ] 0.3.16 Verify error response formats
- [ ] 0.3.17 Test API versioning strategy
