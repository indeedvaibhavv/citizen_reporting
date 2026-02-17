"""
Citizen Report Processing Pipeline
Handles submission, validation, and status tracking of environmental reports.

Validation Process:
1. AI-assisted preliminary check (YOLO + context)
2. Location verification
3. Historical pattern analysis
4. Community consensus (future)
5. Expert review queue (when needed)
"""

import uuid
import json
import random
from datetime import datetime, timedelta
from typing import Dict, Optional
import hashlib

class ReportProcessor:
    """
    Processes citizen environmental reports through validation pipeline.
    """
    
    def __init__(self):
        """Initialize with in-memory storage (use database in production)"""
        self.reports = {}  # In production: use PostgreSQL/MongoDB
        self.validation_queue = []
        
        # Validation thresholds
        self.confidence_thresholds = {
            "high": 0.75,      # Auto-verify
            "medium": 0.50,    # Needs review
            "low": 0.30        # Likely reject
        }
    
    def process_submission(self, report_data: Dict) -> Dict:
        """
        Process a new report submission.
        
        Args:
            report_data: Dictionary containing:
                - image_data (optional): Base64 encoded image
                - category: User-selected category
                - latitude, longitude: Location coordinates
                - location_name: Human-readable location
                - yolo_result: YOLO detection output
                - timestamp: Submission time
        
        Returns:
            Dictionary with report ID, status, and validation info
        """
        # Generate unique report ID
        report_id = self._generate_report_id()
        
        # Extract YOLO confidence
        yolo_confidence = 0.0
        if report_data.get("yolo_result"):
            yolo_confidence = report_data["yolo_result"].get("confidence", 0.0)
        
        # Determine initial validation path
        validation_decision = self._make_validation_decision(
            category=report_data["category"],
            yolo_confidence=yolo_confidence,
            location=(report_data["latitude"], report_data["longitude"])
        )
        
        # Create report record
        report_record = {
            "report_id": report_id,
            "category": report_data["category"],
            "latitude": report_data["latitude"],
            "longitude": report_data["longitude"],
            "location_name": report_data["location_name"],
            "yolo_result": report_data.get("yolo_result"),
            "submitted_at": report_data["timestamp"],
            "validation_status": validation_decision["status"],
            "validation_reason": validation_decision["reason"],
            "confidence_score": validation_decision["confidence"],
            "verified_at": None,
            "reward_coins": 0
        }
        
        # Store report
        self.reports[report_id] = report_record
        
        # If needs review, add to queue
        if validation_decision["status"] == "needs-review":
            self.validation_queue.append(report_id)
        
        # Simulate async processing time
        estimated_time = self._estimate_verification_time(validation_decision["status"])
        
        return {
            "report_id": report_id,
            "status": "submitted",
            "validation_status": validation_decision["status"],
            "estimated_verification_time": estimated_time,
            "message": self._get_status_message(validation_decision["status"])
        }
    
    def get_status(self, report_id: str) -> Dict:
        """
        Get current validation status of a report.
        
        Args:
            report_id: Unique report identifier
            
        Returns:
            Dictionary with current status, progress, and reward info
        """
        if report_id not in self.reports:
            raise ValueError(f"Report {report_id} not found")
        
        report = self.reports[report_id]
        
        # Simulate validation progression
        # In production, this would track actual validation pipeline
        status = report["validation_status"]
        
        # If validating, randomly progress to final state (for demo)
        if status == "validating":
            status = self._simulate_validation_completion(report)
            report["validation_status"] = status
        
        # Calculate reward
        reward = 0
        if status == "verified":
            reward = self._calculate_reward(report)
            report["reward_coins"] = reward
            report["verified_at"] = datetime.now().isoformat()
        
        return {
            "report_id": report_id,
            "status": status,
            "category": report["category"],
            "location": report["location_name"],
            "submitted_at": report["submitted_at"],
            "verified_at": report.get("verified_at"),
            "confidence_score": report["confidence_score"],
            "validation_reason": report["validation_reason"],
            "reward_coins": reward,
            "message": self._get_status_message(status)
        }
    
    # ========================================================================
    # PRIVATE VALIDATION LOGIC
    # ========================================================================
    
    def _make_validation_decision(self, category: str, yolo_confidence: float, 
                                  location: tuple) -> Dict:
        """
        AI-assisted validation decision.
        
        Combines:
        - YOLO detection confidence
        - User category match
        - Location context
        - Historical patterns (simulated)
        
        Returns decision with status and reasoning.
        """
        # Check YOLO confidence
        if yolo_confidence >= self.confidence_thresholds["high"]:
            # High confidence - likely auto-verify
            decision = random.choice([
                "verified",    # 70%
                "needs-review" # 30% (edge cases)
            ]) if random.random() < 0.7 else "needs-review"
            
            reason = "High AI confidence. Visual indicators strongly match reported category."
            confidence = yolo_confidence
        
        elif yolo_confidence >= self.confidence_thresholds["medium"]:
            # Medium confidence - needs review
            decision = "needs-review"
            reason = "Moderate AI confidence. Requires additional verification for accuracy."
            confidence = yolo_confidence
        
        else:
            # Low confidence - needs careful review or reject
            decision = random.choice([
                "needs-review", # 60%
                "rejected"      # 40%
            ]) if random.random() < 0.6 else "rejected"
            
            reason = "Low AI confidence. Visual conditions unclear or ambiguous."
            confidence = yolo_confidence
        
        # Location context check (simulated)
        # In production: cross-reference with known pollution hotspots
        lat, lng = location
        if self._is_known_hotspot(lat, lng):
            reason += " Location matches known environmental concern area."
            confidence = min(1.0, confidence + 0.1)
        
        # Initial status is "validating" for demo UX
        if decision == "verified":
            initial_status = "validating"  # Will transition to verified
        else:
            initial_status = decision
        
        return {
            "status": initial_status,
            "reason": reason,
            "confidence": round(confidence, 2)
        }
    
    def _is_known_hotspot(self, lat: float, lng: float) -> bool:
        """Check if location is a known pollution hotspot (simulated)"""
        # In production: query geospatial database
        # For demo: random with 30% probability
        return random.random() < 0.3
    
    def _simulate_validation_completion(self, report: Dict) -> str:
        """
        Simulate validation pipeline completion.
        In production, this would be actual async processing.
        """
        # Based on confidence, decide final outcome
        confidence = report["confidence_score"]
        
        if confidence >= 0.75:
            return "verified"
        elif confidence >= 0.50:
            return random.choice(["verified", "needs-review"])
        else:
            return random.choice(["needs-review", "rejected"])
    
    def _calculate_reward(self, report: Dict) -> int:
        """
        Calculate reward coins for verified report.
        
        Factors:
        - Base reward: 10 coins
        - Confidence bonus: +5 for high confidence
        - Category bonus: +5 for high-priority categories
        - Location bonus: +5 for underreported areas
        """
        base_reward = 10
        
        # Confidence bonus
        confidence_bonus = 5 if report["confidence_score"] >= 0.8 else 0
        
        # High-priority category bonus
        priority_categories = ["water", "construction"]
        category_bonus = 5 if report["category"] in priority_categories else 0
        
        # Random location bonus (simulates underreported area)
        location_bonus = 5 if random.random() < 0.3 else 0
        
        total = base_reward + confidence_bonus + category_bonus + location_bonus
        
        return total
    
    def _estimate_verification_time(self, status: str) -> int:
        """Estimate verification time in seconds"""
        if status == "verified":
            return random.randint(3, 8)
        elif status == "needs-review":
            return random.randint(10, 30)
        else:
            return random.randint(5, 15)
    
    def _get_status_message(self, status: str) -> str:
        """Get user-friendly status message"""
        messages = {
            "validating": "🔍 AI validation in progress. This usually takes a few seconds.",
            "verified": "✅ Report verified! Your contribution helps monitor environmental conditions.",
            "needs-review": "⏳ Report queued for expert review. This may take a few minutes.",
            "rejected": "❌ Unable to verify this report. Consider resubmitting with clearer evidence."
        }
        return messages.get(status, "Processing your report...")
    
    def _generate_report_id(self) -> str:
        """Generate unique report ID"""
        # Combine timestamp and random UUID
        timestamp = datetime.now().strftime("%Y%m%d%H%M%S")
        unique_id = str(uuid.uuid4())[:8]
        return f"RPT-{timestamp}-{unique_id}"
    
    # ========================================================================
    # ANALYTICS HELPERS
    # ========================================================================
    
    def get_report_stats(self) -> Dict:
        """Get aggregate statistics on reports"""
        total = len(self.reports)
        if total == 0:
            return {"total": 0}
        
        verified = sum(1 for r in self.reports.values() if r["validation_status"] == "verified")
        pending = sum(1 for r in self.reports.values() if r["validation_status"] == "needs-review")
        rejected = sum(1 for r in self.reports.values() if r["validation_status"] == "rejected")
        
        # Category breakdown
        categories = {}
        for report in self.reports.values():
            cat = report["category"]
            categories[cat] = categories.get(cat, 0) + 1
        
        return {
            "total": total,
            "verified": verified,
            "pending": pending,
            "rejected": rejected,
            "verification_rate": round(verified / total * 100, 1) if total > 0 else 0,
            "categories": categories
        }
