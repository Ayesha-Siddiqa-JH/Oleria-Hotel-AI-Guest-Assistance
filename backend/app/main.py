from fastapi import FastAPI, Request, status
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from fastapi.exceptions import RequestValidationError
from datetime import datetime

from .routes import chat, availability
from .services.hotel_service import hotel_service
from .utils.logging_config import logger

app = FastAPI(
    title="StayAI — Hotel Guest Assistant API",
    description="Backend API powering StayAI guest-facing concierge for StayAI Grand Hotel Bengaluru.",
    version="1.0.0",
    docs_url="/docs",
    redoc_url="/redoc"
)

# CORS Configuration for local frontend integration
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include API Routers
app.include_router(chat.router)
app.include_router(availability.router)

@app.exception_handler(RequestValidationError)
async def validation_exception_handler(request: Request, exc: RequestValidationError):
    """Clean JSON response for request schema validation errors."""
    error_messages = []
    for err in exc.errors():
        field = " -> ".join(str(loc) for loc in err.get("loc", []))
        msg = err.get("msg", "Invalid value")
        error_messages.append(f"{field}: {msg}")
    
    combined_msg = "; ".join(error_messages)
    logger.warning(f"Request validation error on {request.url.path}: {combined_msg}")
    
    return JSONResponse(
        status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
        content={
            "success": False,
            "error": {
                "code": "VALIDATION_ERROR",
                "message": combined_msg
            }
        }
    )

@app.exception_handler(Exception)
async def global_exception_handler(request: Request, exc: Exception):
    """Catches all unhandled exceptions without leaking stack traces."""
    logger.exception(f"Unhandled server error on {request.url.path}: {exc}")
    return JSONResponse(
        status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
        content={
            "success": False,
            "error": {
                "code": "INTERNAL_SERVER_ERROR",
                "message": "An unexpected server error occurred. Please try again later."
            }
        }
    )

@app.get("/health", tags=["System"])
async def health_check():
    """Health check endpoint to verify backend operational readiness."""
    return {
        "status": "healthy",
        "service": "StayAI — Hotel Guest Assistant",
        "timestamp": datetime.now().isoformat()
    }

@app.get("/api/hotel", tags=["Hotel"])
async def get_hotel_info():
    """Returns hotel property details and room configurations."""
    return {
        "success": True,
        "hotel": hotel_service.get_hotel_data()
    }

# Mount built React frontend so that navigating to http://127.0.0.1:8000/ serves the full UI
import os
from fastapi.staticfiles import StaticFiles

frontend_dist = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "..", "frontend", "dist"))
if os.path.exists(frontend_dist):
    logger.info(f"Serving compiled frontend from: {frontend_dist}")
    app.mount("/", StaticFiles(directory=frontend_dist, html=True), name="frontend")

