# 🌍 Environmental Intelligence System - Backend

FastAPI backend for the Streaming RAG-Based Environmental Intelligence System focused on Indian cities.

## 🏗️ Architecture

```
streaming-rag-backend/
├── app.py                 # Main FastAPI application
├── requirements.txt       # Python dependencies
├── yolo/
│   ├── __init__.py
│   └── detector.py       # AI-assisted image classification
├── aqi/
│   ├── __init__.py
│   └── stream.py         # AQI data streaming simulator
├── reports/
│   ├── __init__.py
│   └── processor.py      # Report validation pipeline
└── README.md
```

## 🚀 Quick Start

### Prerequisites

- Python 3.9 or higher
- pip (Python package manager)

### Installation

1. **Clone or navigate to the backend directory:**
```bash
cd streaming-rag-backend
```

2. **Create a virtual environment (recommended):**
```bash
python -m venv venv

# On Windows:
venv\Scripts\activate

# On macOS/Linux:
source venv/bin/activate
```

3. **Install dependencies:**
```bash
pip install -r requirements.txt
```

### Running the Server

**Development mode with auto-reload:**
```bash
python app.py
```

**Or using uvicorn directly:**
```bash
uvicorn app:app --reload --host 0.0.0.0 --port 8000
```

The server will start at: `http://localhost:8000`

### API Documentation

Once running, visit:
- **Interactive API Docs:** http://localhost:8000/docs
- **Alternative Docs:** http://localhost:8000/redoc

## 📡 API Endpoints

### 1. Health Check
```http
GET /
```
Returns server status and timestamp.

### 2. Image Analysis (YOLO)
```http
POST /api/report/analyze-image
Content-Type: multipart/form-data
```
**Body:** Image file

**Response:**
```json
{
  "detected_category": "construction",
  "confidence": 0.87,
  "scores": {
    "air": 0.62,
    "garbage": 0.21,
    "construction": 0.87,
    "water": 0.05
  },
  "detected_objects": ["construction_equipment", "dust_cloud", "building"],
  "explanation": "High confidence detection of construction-related pollution..."
}
```

### 3. Current AQI Data
```http
GET /api/aqi/current?city=Delhi
```

**Response:**
```json
{
  "city": "Delhi",
  "aqi": 287,
  "pm25": 185.2,
  "pm10": 245.8,
  "timestamp": "2026-02-16T10:30:00",
  "severity": "unhealthy",
  "description": "Everyone may begin to experience health effects..."
}
```

### 4. AQI History
```http
GET /api/aqi/history?city=Delhi&range=24h
```

**Parameters:**
- `city`: City name (Delhi, Mumbai, Bangalore, etc.)
- `range`: `24h` for hourly data or `7d` for daily data

**Response:**
```json
[
  {"time": "01:00", "aqi": 260},
  {"time": "02:00", "aqi": 268},
  ...
]
```

### 5. All Cities AQI
```http
GET /api/cities
```

**Response:**
```json
[
  {
    "name": "Delhi",
    "lat": 28.6139,
    "lng": 77.2090,
    "aqi": 287,
    "severity": "unhealthy"
  },
  ...
]
```

### 6. Submit Report
```http
POST /api/report/submit
Content-Type: application/json
```

**Body:**
```json
{
  "image_data": "base64_encoded_image_optional",
  "category": "construction",
  "latitude": 28.6139,
  "longitude": 77.2090,
  "location_name": "Connaught Place, Delhi",
  "yolo_result": {
    "detected_category": "construction",
    "confidence": 0.87
  },
  "timestamp": "2026-02-16T10:30:00"
}
```

**Response:**
```json
{
  "report_id": "RPT-20260216103000-abc123",
  "status": "submitted",
  "validation_status": "validating",
  "estimated_verification_time": 5,
  "message": "🔍 AI validation in progress..."
}
```

### 7. Check Report Status
```http
GET /api/report/status/{report_id}
```

**Response:**
```json
{
  "report_id": "RPT-20260216103000-abc123",
  "status": "verified",
  "category": "construction",
  "location": "Connaught Place, Delhi",
  "submitted_at": "2026-02-16T10:30:00",
  "verified_at": "2026-02-16T10:30:08",
  "confidence_score": 0.87,
  "validation_reason": "High AI confidence. Visual indicators strongly match...",
  "reward_coins": 15,
  "message": "✅ Report verified! Your contribution helps..."
}
```

### 8. AI Insights
```http
GET /api/insights/aqi?city=Delhi
```

**Response:**
```json
{
  "city": "Delhi",
  "insight": "Delhi is currently experiencing unhealthy air quality with an AQI of 287...",
  "trend": "increasing",
  "rank": 1,
  "total_cities": 10,
  "avg_24h": 275.5
}
```

## 🔌 Frontend Integration

### Replacing Mock Data

In your React frontend, replace the mock data imports with API calls:

**Before (using mockData.ts):**
```typescript
import { getCityStats } from './utils/mockData';
const stats = getCityStats('Delhi');
```

**After (using real API):**
```typescript
const stats = await fetch('http://localhost:8000/api/aqi/current?city=Delhi')
  .then(res => res.json());
```

### Example React Integration

```typescript
// hooks/useAQI.ts
import { useState, useEffect } from 'react';

const API_BASE = 'http://localhost:8000/api';

export function useCurrentAQI(city: string) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    fetch(`${API_BASE}/aqi/current?city=${city}`)
      .then(res => res.json())
      .then(data => {
        setData(data);
        setLoading(false);
      });
  }, [city]);
  
  return { data, loading };
}

// In component:
const { data, loading } = useCurrentAQI('Delhi');
```

### CORS Configuration

The backend allows all origins by default for development. For production, update the CORS settings in `app.py`:

```python
app.add_middleware(
    CORSMiddleware,
    allow_origins=["https://your-frontend-domain.com"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
```

## 🧠 YOLO Integration (Production)

The current implementation simulates YOLO detection for demo purposes. For production:

### 1. Install YOLOv8
```bash
pip install ultralytics torch torchvision
```

### 2. Download Pre-trained Model
```python
from ultralytics import YOLO

# Download YOLOv8 model
model = YOLO('yolov8n.pt')  # Nano model for speed
# or
model = YOLO('yolov8m.pt')  # Medium model for accuracy
```

### 3. Update detector.py
```python
from ultralytics import YOLO

class YOLODetector:
    def __init__(self):
        self.model = YOLO('yolov8n.pt')
        # ... rest of initialization
    
    def analyze(self, image_data: bytes):
        image = Image.open(io.BytesIO(image_data))
        results = self.model(image)
        # Process results...
```

### 4. Fine-tune on Environmental Dataset
```python
# Train on custom environmental dataset
model.train(
    data='environmental_dataset.yaml',
    epochs=100,
    imgsz=640
)
```

## 🎯 Validation Logic

### Confidence Thresholds
- **High (≥0.75)**: Auto-verify with 70% probability
- **Medium (0.50-0.75)**: Queue for review
- **Low (<0.50)**: Likely reject or needs careful review

### Validation Factors
1. **YOLO Confidence**: Primary signal
2. **Location Context**: Known hotspots boost confidence
3. **Historical Patterns**: Cross-reference with past reports
4. **Community Consensus**: Multiple reports in same area (future)

### Reward System
- **Base**: 10 coins
- **High Confidence Bonus**: +5 coins (≥0.8 confidence)
- **Priority Category**: +5 coins (water, construction)
- **Underreported Area**: +5 coins (random 30%)

## 📊 AQI Data

### Data Sources (Production)
- **CPCB API**: Central Pollution Control Board (official)
- **OpenAQ**: Open air quality data
- **IQAir API**: Real-time air quality
- **State PCBs**: Regional pollution control boards

### Current Implementation
Simulates realistic data with:
- City-specific baselines
- Diurnal variation (morning/evening peaks)
- Weekend effects
- Seasonal factors
- Random variance

### Supported Cities
Delhi, Mumbai, Bangalore, Chennai, Kolkata, Hyderabad, Pune, Ahmedabad, Lucknow, Jaipur

## 🚢 Deployment

### Docker (Recommended)

**Dockerfile:**
```dockerfile
FROM python:3.11-slim

WORKDIR /app

COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

COPY . .

EXPOSE 8000

CMD ["uvicorn", "app:app", "--host", "0.0.0.0", "--port", "8000"]
```

**Build and run:**
```bash
docker build -t env-intel-backend .
docker run -p 8000:8000 env-intel-backend
```

### Cloud Deployment

**Railway / Render / Fly.io:**
1. Push code to GitHub
2. Connect repository
3. Set environment variables
4. Deploy

**AWS / GCP / Azure:**
1. Use container service (ECS, Cloud Run, Container Instances)
2. Deploy Docker image
3. Configure auto-scaling

## 🔧 Environment Variables

Create `.env` file:
```env
# API Configuration
API_HOST=0.0.0.0
API_PORT=8000

# CORS
ALLOWED_ORIGINS=https://your-frontend.com

# Database (Production)
DATABASE_URL=postgresql://user:pass@host:5432/db

# External APIs (Production)
CPCB_API_KEY=your_key_here
OPENAQ_API_KEY=your_key_here
```

## 📈 Monitoring

### Logging
Add logging to track:
- API request/response times
- YOLO inference times
- Validation decisions
- Error rates

### Metrics
- Reports per minute
- Validation accuracy
- API latency
- Cache hit rates

## 🤝 Contributing

1. Fork the repository
2. Create feature branch
3. Make changes
4. Test thoroughly
5. Submit pull request

## 📝 License

MIT License - See LICENSE file for details

## 🎉 Hackathon Demo Tips

### Before Demo
1. Start server: `python app.py`
2. Verify health: `curl http://localhost:8000`
3. Test one endpoint: `curl http://localhost:8000/api/aqi/current?city=Delhi`
4. Open API docs: http://localhost:8000/docs

### During Demo
1. Show real-time AQI updates
2. Upload test image for YOLO analysis
3. Submit report and show validation flow
4. Explain AI transparency (confidence scores, explanations)
5. Show insights generation

### Key Talking Points
- "AI-assisted, not AI-decided"
- "Explainable confidence scores"
- "Real-time streaming architecture (simulated for demo)"
- "Production-ready with clear migration path"
- "Scalable to real government API integration"

## 📞 Support

For issues or questions:
- Open GitHub issue
- Check API documentation at /docs
- Review error logs in console

---

**Built with ❤️ for environmental monitoring in India**
