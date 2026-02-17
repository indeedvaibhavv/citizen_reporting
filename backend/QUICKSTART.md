# 🚀 Quick Start Guide

Get the Environmental Intelligence API running in 5 minutes.

## Prerequisites

- Python 3.9+ installed
- pip installed
- (Optional) Git installed

## Step 1: Get the Code

Option A - If you have the files:
```bash
cd streaming-rag-backend
```

Option B - If using Git:
```bash
git clone <your-repo-url>
cd streaming-rag-backend
```

## Step 2: Setup Python Environment

### On Windows:
```bash
python -m venv venv
venv\Scripts\activate
```

### On macOS/Linux:
```bash
python3 -m venv venv
source venv/bin/activate
```

You should see `(venv)` in your terminal prompt.

## Step 3: Install Dependencies

```bash
pip install -r requirements.txt
```

This will install:
- FastAPI - Web framework
- Uvicorn - Server
- Pillow - Image processing
- NumPy - Numerical operations
- Other utilities

Wait for installation to complete (~2 minutes).

## Step 4: Start the Server

```bash
python app.py
```

You should see:
```
🌍 Starting Environmental Intelligence API...
📡 Endpoints available at http://localhost:8000
📚 API Documentation: http://localhost:8000/docs
INFO:     Started server process
INFO:     Uvicorn running on http://0.0.0.0:8000
```

## Step 5: Verify It's Working

### Option A: Open in Browser
Visit: http://localhost:8000

You should see:
```json
{
  "status": "online",
  "service": "Environmental Intelligence API",
  "version": "1.0.0",
  "timestamp": "..."
}
```

### Option B: Use curl (in new terminal)
```bash
curl http://localhost:8000
```

### Option C: Interactive Docs
Visit: http://localhost:8000/docs

You'll see a beautiful interactive API documentation where you can test all endpoints!

## Step 6: Test an Endpoint

Try getting AQI for Delhi:

### Using Browser:
http://localhost:8000/api/aqi/current?city=Delhi

### Using curl:
```bash
curl "http://localhost:8000/api/aqi/current?city=Delhi"
```

### Expected Response:
```json
{
  "city": "Delhi",
  "aqi": 287,
  "pm25": 185.2,
  "pm10": 245.8,
  "timestamp": "2026-02-16T...",
  "severity": "unhealthy",
  "description": "Everyone may begin to experience health effects..."
}
```

## 🎉 You're Done!

Your backend is now running and ready to connect to your frontend.

## Next Steps

### 1. Explore the API
Visit http://localhost:8000/docs and try different endpoints:
- Get AQI for different cities
- Upload test images for analysis
- Submit test reports
- View city leaderboard

### 2. Run Tests
In a new terminal (keep server running):
```bash
python test_api.py
```

### 3. Connect Frontend
Follow the [FRONTEND_INTEGRATION.md](FRONTEND_INTEGRATION.md) guide.

## Common Issues & Solutions

### Issue: `ModuleNotFoundError`
**Solution:** Make sure virtual environment is activated and dependencies installed:
```bash
pip install -r requirements.txt
```

### Issue: Port 8000 already in use
**Solution:** Kill the process or use a different port:
```bash
# Find and kill process using port 8000
# On Windows:
netstat -ano | findstr :8000
taskkill /PID <PID> /F

# On macOS/Linux:
lsof -ti:8000 | xargs kill

# Or run on different port:
uvicorn app:app --port 8001
```

### Issue: `ImportError: No module named 'app'`
**Solution:** Make sure you're in the correct directory:
```bash
cd streaming-rag-backend
python app.py
```

### Issue: Virtual environment not activating
**Solution:**
```bash
# Delete and recreate
rm -rf venv
python -m venv venv

# On Windows:
venv\Scripts\activate

# On macOS/Linux:
source venv/bin/activate
```

## Development Tips

### Auto-reload on Code Changes
The server automatically reloads when you edit code files!

### View Logs
All requests are logged in the terminal where server is running.

### Stop the Server
Press `Ctrl+C` in the terminal.

### Deactivate Virtual Environment
```bash
deactivate
```

## API Testing Tools

### 1. Built-in Swagger UI
http://localhost:8000/docs
- Interactive testing
- See request/response schemas
- No additional tools needed

### 2. Postman (Optional)
Import the API endpoints and test with a nice GUI.

### 3. Thunder Client (VS Code Extension)
REST API testing directly in VS Code.

### 4. curl (Command Line)
Quick testing from terminal.

## Production Deployment

See [README.md](README.md) for:
- Docker deployment
- Cloud hosting (Railway, Render, AWS, etc.)
- Environment variables
- HTTPS setup

## Need Help?

1. Check [README.md](README.md) for detailed documentation
2. Check [FRONTEND_INTEGRATION.md](FRONTEND_INTEGRATION.md) for frontend setup
3. Visit http://localhost:8000/docs for API reference
4. Check server logs for error messages

---

**Happy Coding! 🚀**
