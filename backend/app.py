"""
Streaming RAG-Based Environmental Intelligence System - Backend
FastAPI server providing real-time environmental data and AI-assisted validation
"""

from fastapi import FastAPI, File, UploadFile, HTTPException, Query
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List, Optional, Dict
from datetime import datetime, timedelta
import uvicorn
import json
import os
import base64

# Import our modules
from yolo.detector import YOLODetector
from aqi.stream import AQIStreamSimulator
from reports.processor import ReportProcessor

# Initialize FastAPI
app = FastAPI(
    title="Environmental Intelligence API",
    description="Real-time environmental data and AI-assisted citizen reporting",
    version="1.0.0"
)

# CORS Configuration - Allow frontend to connect
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # In production, specify your frontend URL
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Initialize services
yolo_detector = YOLODetector()
aqi_simulator = AQIStreamSimulator()
report_processor = ReportProcessor()

# ============================================================================
# MODELS
# ============================================================================

class ImageAnalysisResponse(BaseModel):
    detected_category: str
    confidence: float
    scores: Dict[str, float]
    detected_objects: List[str]
    explanation: str

class AQICurrentResponse(BaseModel):
    city: str
    aqi: int
    pm25: float
    pm10: float
    timestamp: str
    severity: str
    description: str

class AQIHistoryPoint(BaseModel):
    time: str
    aqi: int

class CityAQIResponse(BaseModel):
    name: str
    lat: float
    lng: float
    aqi: int
    severity: str

class ReportSubmission(BaseModel):
    image_data: Optional[str] = None  # Base64 encoded
    category: str
    latitude: float
    longitude: float
    location_name: str
    yolo_result: Optional[Dict] = None
    timestamp: str

class ReportSubmissionResponse(BaseModel):
    report_id: str
    status: str
    validation_status: str
    estimated_verification_time: int
    message: str

# ============================================================================
# ENDPOINTS
# ============================================================================

@app.get("/")
async def root():
    """Health check endpoint"""
    return {
        "status": "online",
        "service": "Environmental Intelligence API",
        "version": "1.0.0",
        "timestamp": datetime.utcnow().isoformat()
    }

# ----------------------------------------------------------------------------
# 1️⃣ YOLO IMAGE ANALYSIS
# ----------------------------------------------------------------------------

@app.post("/api/report/analyze-image", response_model=ImageAnalysisResponse)
async def analyze_image(file: UploadFile = File(...)):
    """
    AI-assisted image analysis using YOLO object detection.
    
    Returns:
    - Detected category with confidence scores
    - Object detection results
    - Explainable reasoning
    
    NOTE: This is assistive intelligence, not authoritative measurement.
    """
    try:
        # Read image file
        image_data = await file.read()
        
        # Run YOLO detection
        result = yolo_detector.analyze(image_data)
        
        return ImageAnalysisResponse(**result)
    
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Image analysis failed: {str(e)}")

# ----------------------------------------------------------------------------
# 2️⃣ AQI CURRENT DATA
# ----------------------------------------------------------------------------

@app.get("/api/aqi/current", response_model=AQICurrentResponse)
async def get_current_aqi(city: str = Query(..., description="City name (e.g., Delhi)")):
    """
    Get current AQI data for a city.
    
    In production, this would connect to official government APIs (CPCB).
    For demo, this simulates realistic streaming data.
    """
    try:
        aqi_data = aqi_simulator.get_current(city)
        return AQICurrentResponse(**aqi_data)
    
    except ValueError as e:
        raise HTTPException(status_code=404, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to fetch AQI: {str(e)}")

# ----------------------------------------------------------------------------
# 3️⃣ AQI HISTORY
# ----------------------------------------------------------------------------

@app.get("/api/aqi/history", response_model=List[AQIHistoryPoint])
async def get_aqi_history(
    city: str = Query(..., description="City name"),
    range: str = Query("24h", description="Time range: 24h or 7d")
):
    """
    Get historical AQI data for time-series visualization.
    
    Supports:
    - 24h: Hourly data points
    - 7d: Daily data points
    """
    try:
        history = aqi_simulator.get_history(city, range)
        return [AQIHistoryPoint(**point) for point in history]
    
    except ValueError as e:
        raise HTTPException(status_code=404, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to fetch history: {str(e)}")

# ----------------------------------------------------------------------------
# 4️⃣ CITY AQI MAP DATA
# ----------------------------------------------------------------------------

@app.get("/api/cities", response_model=List[CityAQIResponse])
async def get_cities_aqi():
    """
    Get AQI data for all major Indian cities.
    Used for heatmap and leaderboard visualization.
    """
    try:
        cities = aqi_simulator.get_all_cities()
        return [CityAQIResponse(**city) for city in cities]
    
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to fetch cities: {str(e)}")

# ----------------------------------------------------------------------------
# 5️⃣ REPORT SUBMISSION
# ----------------------------------------------------------------------------

@app.post("/api/report/submit", response_model=ReportSubmissionResponse)
async def submit_report(report: ReportSubmission):
    """
    Submit a citizen environmental report.
    
    Process:
    1. Store report data
    2. Queue for AI-assisted validation
    3. Return tracking information
    
    Validation considers:
    - YOLO detection results
    - Location context
    - Historical patterns
    - Community consensus (future)
    """
    try:
        result = report_processor.process_submission(report.dict())
        return ReportSubmissionResponse(**result)
    
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Report submission failed: {str(e)}")

# ----------------------------------------------------------------------------
# 6️⃣ AI INSIGHTS
# ----------------------------------------------------------------------------

@app.get("/api/insights/aqi")
async def get_aqi_insights(city: str = Query(...)):
    """
    Get AI-generated natural language insights about AQI trends.
    Explains patterns, comparisons, and context.
    """
    try:
        insights = aqi_simulator.get_insights(city)
        return insights
    
    except ValueError as e:
        raise HTTPException(status_code=404, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to generate insights: {str(e)}")

# ----------------------------------------------------------------------------
# 7️⃣ VALIDATION STATUS
# ----------------------------------------------------------------------------

@app.get("/api/report/status/{report_id}")
async def get_report_status(report_id: str):
    """
    Check validation status of a submitted report.
    
    States:
    - validating: AI analysis in progress
    - verified: Report confirmed as authentic
    - needs-review: Requires human review
    - rejected: Could not verify
    """
    try:
        status = report_processor.get_status(report_id)
        return status
    
    except ValueError as e:
        raise HTTPException(status_code=404, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to fetch status: {str(e)}")

# ============================================================================
# STREAMING ENDPOINT (FUTURE ENHANCEMENT)
# ============================================================================

@app.get("/api/stream/aqi")
async def stream_aqi(city: str = Query(...)):
    """
    WebSocket endpoint for real-time AQI streaming (future implementation).
    Would use Server-Sent Events or WebSocket for live updates.
    """
    return {
        "message": "Streaming endpoint - implement with WebSockets for production",
        "city": city
    }

# ============================================================================
# MAIN
# ============================================================================

if __name__ == "__main__":
    print("🌍 Starting Environmental Intelligence API...")
    print("📡 Endpoints available at http://localhost:8000")
    print("📚 API Documentation: http://localhost:8000/docs")
    
    uvicorn.run(
        "app:app",
        host="0.0.0.0",
        port=8000,
        reload=True,
        log_level="info"
    )
