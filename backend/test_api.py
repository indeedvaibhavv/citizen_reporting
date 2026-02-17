"""
Test script to verify all API endpoints
Run this after starting the server to ensure everything works
"""

import requests
import json
from io import BytesIO
from PIL import Image
import base64

# Configuration
BASE_URL = "http://localhost:8000"

def test_health_check():
    """Test 1: Health check endpoint"""
    print("\n🔍 Test 1: Health Check")
    response = requests.get(f"{BASE_URL}/")
    print(f"Status: {response.status_code}")
    print(f"Response: {json.dumps(response.json(), indent=2)}")
    assert response.status_code == 200
    print("✅ Health check passed")

def test_current_aqi():
    """Test 2: Current AQI data"""
    print("\n🔍 Test 2: Current AQI")
    response = requests.get(f"{BASE_URL}/api/aqi/current?city=Delhi")
    print(f"Status: {response.status_code}")
    data = response.json()
    print(f"Response: {json.dumps(data, indent=2)}")
    assert response.status_code == 200
    assert data["city"] == "Delhi"
    assert "aqi" in data
    print("✅ Current AQI passed")

def test_aqi_history():
    """Test 3: AQI history"""
    print("\n🔍 Test 3: AQI History (24h)")
    response = requests.get(f"{BASE_URL}/api/aqi/history?city=Delhi&range=24h")
    print(f"Status: {response.status_code}")
    data = response.json()
    print(f"Number of data points: {len(data)}")
    print(f"First point: {data[0]}")
    print(f"Last point: {data[-1]}")
    assert response.status_code == 200
    assert len(data) > 0
    print("✅ AQI history passed")

def test_cities_aqi():
    """Test 4: All cities AQI"""
    print("\n🔍 Test 4: All Cities AQI")
    response = requests.get(f"{BASE_URL}/api/cities")
    print(f"Status: {response.status_code}")
    data = response.json()
    print(f"Number of cities: {len(data)}")
    print(f"Top 3 cities by AQI:")
    for i, city in enumerate(data[:3], 1):
        print(f"  {i}. {city['name']}: {city['aqi']} ({city['severity']})")
    assert response.status_code == 200
    assert len(data) >= 10
    print("✅ Cities AQI passed")

def test_image_analysis():
    """Test 5: Image analysis (YOLO)"""
    print("\n🔍 Test 5: Image Analysis")
    
    # Create a simple test image
    img = Image.new('RGB', (640, 480), color=(73, 109, 137))
    img_buffer = BytesIO()
    img.save(img_buffer, format='JPEG')
    img_buffer.seek(0)
    
    # Upload image
    files = {'file': ('test.jpg', img_buffer, 'image/jpeg')}
    response = requests.post(f"{BASE_URL}/api/report/analyze-image", files=files)
    
    print(f"Status: {response.status_code}")
    data = response.json()
    print(f"Detected Category: {data['detected_category']}")
    print(f"Confidence: {data['confidence']}")
    print(f"Scores: {json.dumps(data['scores'], indent=2)}")
    print(f"Objects: {data['detected_objects']}")
    print(f"Explanation: {data['explanation'][:100]}...")
    
    assert response.status_code == 200
    assert "detected_category" in data
    print("✅ Image analysis passed")

def test_report_submission():
    """Test 6: Report submission"""
    print("\n🔍 Test 6: Report Submission")
    
    report = {
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
    
    response = requests.post(
        f"{BASE_URL}/api/report/submit",
        json=report
    )
    
    print(f"Status: {response.status_code}")
    data = response.json()
    print(f"Response: {json.dumps(data, indent=2)}")
    
    assert response.status_code == 200
    assert "report_id" in data
    
    # Store report_id for next test
    return data["report_id"]

def test_report_status(report_id):
    """Test 7: Report status check"""
    print("\n🔍 Test 7: Report Status")
    
    response = requests.get(f"{BASE_URL}/api/report/status/{report_id}")
    print(f"Status: {response.status_code}")
    data = response.json()
    print(f"Response: {json.dumps(data, indent=2)}")
    
    assert response.status_code == 200
    assert data["report_id"] == report_id
    print("✅ Report status passed")

def test_insights():
    """Test 8: AI insights"""
    print("\n🔍 Test 8: AI Insights")
    
    response = requests.get(f"{BASE_URL}/api/insights/aqi?city=Delhi")
    print(f"Status: {response.status_code}")
    data = response.json()
    print(f"Insight: {data['insight']}")
    print(f"Trend: {data['trend']}")
    print(f"Rank: {data['rank']}/{data['total_cities']}")
    
    assert response.status_code == 200
    assert "insight" in data
    print("✅ AI insights passed")

def run_all_tests():
    """Run all tests in sequence"""
    print("="*60)
    print("🧪 RUNNING API ENDPOINT TESTS")
    print("="*60)
    
    try:
        # Basic tests
        test_health_check()
        test_current_aqi()
        test_aqi_history()
        test_cities_aqi()
        
        # Image and report tests
        test_image_analysis()
        report_id = test_report_submission()
        test_report_status(report_id)
        
        # Insights
        test_insights()
        
        print("\n" + "="*60)
        print("✅ ALL TESTS PASSED!")
        print("="*60)
        print("\n🎉 Backend is ready for frontend integration!")
        
    except requests.exceptions.ConnectionError:
        print("\n❌ ERROR: Cannot connect to server")
        print("Make sure the server is running:")
        print("  python app.py")
        
    except AssertionError as e:
        print(f"\n❌ TEST FAILED: {e}")
        
    except Exception as e:
        print(f"\n❌ UNEXPECTED ERROR: {e}")

if __name__ == "__main__":
    run_all_tests()
