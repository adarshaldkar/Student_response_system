#!/usr/bin/env python3
"""
Comprehensive Backend API Test Suite
Tests the Node.js backend API endpoints for the Teacher Feedback Collection System
"""

import requests
import json
import sys
from typing import Dict, Any, Optional
import uuid

class BackendAPITester:
    def __init__(self, base_url: str):
        self.base_url = base_url.rstrip('/')
        self.session = requests.Session()
        self.admin_token = None
        self.admin_user_id = None
        self.form_id = None
        
        # Test data with unique identifiers
        unique_id = str(uuid.uuid4())[:8]
        self.admin_user_data = {
            "username": f"prof_johnson_{unique_id}",
            "email": f"prof.johnson.{unique_id}@university.edu",
            "password": "SecurePassword123!",
            "role": "admin"
        }
        
        self.feedback_form_data = {
            "title": "Computer Science Department - Fall 2024 Feedback",
            "year": "2024",
            "section": "CS-A",
            "department": "Computer Science",
            "subjects": ["Data Structures", "Algorithms", "Database Systems"],
            "evaluation_criteria": ["Teaching Quality", "Course Content", "Communication", "Availability"]
        }
        
        self.student_feedback_data = {
            "student_id": "CS2024001",
            "student_name": "Alice Smith",
            "ratings": {
                "Data Structures": {
                    "Teaching Quality": 5,
                    "Course Content": 4,
                    "Communication": 5,
                    "Availability": 4
                },
                "Algorithms": {
                    "Teaching Quality": 4,
                    "Course Content": 5,
                    "Communication": 4,
                    "Availability": 5
                },
                "Database Systems": {
                    "Teaching Quality": 5,
                    "Course Content": 5,
                    "Communication": 5,
                    "Availability": 4
                }
            },
            "comments": "Excellent teaching methods and very helpful during office hours."
        }

    def log_test(self, test_name: str, success: bool, details: str = ""):
        status = "✅ PASS" if success else "❌ FAIL"
        print(f"{status} {test_name}")
        if details:
            print(f"   Details: {details}")
        if not success:
            print()

    def make_request(self, method: str, endpoint: str, data: Optional[Dict] = None, 
                    headers: Optional[Dict] = None, auth_required: bool = False) -> requests.Response:
        """Make HTTP request with optional authentication"""
        url = f"{self.base_url}{endpoint}"
        
        request_headers = {"Content-Type": "application/json"}
        if headers:
            request_headers.update(headers)
            
        if auth_required and self.admin_token:
            request_headers["Authorization"] = f"Bearer {self.admin_token}"
        
        try:
            if method.upper() == "GET":
                response = self.session.get(url, headers=request_headers)
            elif method.upper() == "POST":
                response = self.session.post(url, json=data, headers=request_headers)
            elif method.upper() == "PUT":
                response = self.session.put(url, json=data, headers=request_headers)
            elif method.upper() == "DELETE":
                response = self.session.delete(url, headers=request_headers)
            else:
                raise ValueError(f"Unsupported HTTP method: {method}")
                
            return response
        except requests.exceptions.RequestException as e:
            print(f"Request failed: {e}")
            raise

    def test_health_check(self) -> bool:
        """Test health check endpoint"""
        try:
            # Try both /health and /api/health endpoints
            response = self.make_request("GET", "/health")
            if response.status_code != 200:
                # If /health doesn't work, try /api/health
                response = self.make_request("GET", "/api/health")
            
            success = response.status_code == 200
            
            if success:
                try:
                    data = response.json()
                    success = data.get("status") == "ok" and "timestamp" in data
                    self.log_test("Health Check", success, f"Status: {data.get('status')}")
                except:
                    # If it's not JSON, it might be HTML (frontend routing issue)
                    self.log_test("Health Check", False, "Health endpoint returns HTML instead of JSON (routing issue)")
            else:
                self.log_test("Health Check", False, f"Status code: {response.status_code}")
                
            return success
        except Exception as e:
            self.log_test("Health Check", False, f"Exception: {str(e)}")
            return False

    def test_root_api(self) -> bool:
        """Test root API endpoint"""
        try:
            response = self.make_request("GET", "/api/")
            success = response.status_code == 200
            
            if success:
                data = response.json()
                success = "message" in data
                self.log_test("Root API Endpoint", success, f"Message: {data.get('message')}")
            else:
                self.log_test("Root API Endpoint", False, f"Status code: {response.status_code}")
                
            return success
        except Exception as e:
            self.log_test("Root API Endpoint", False, f"Exception: {str(e)}")
            return False

    def test_user_registration(self) -> bool:
        """Test user registration"""
        try:
            response = self.make_request("POST", "/api/auth/register", self.admin_user_data)
            success = response.status_code == 200
            
            if success:
                data = response.json()
                success = all(key in data for key in ["access_token", "role", "user_id"])
                if success:
                    self.admin_token = data["access_token"]
                    self.admin_user_id = data["user_id"]
                    self.log_test("User Registration", True, f"Role: {data.get('role')}, User ID: {data.get('user_id')}")
                else:
                    self.log_test("User Registration", False, "Missing required fields in response")
            else:
                error_detail = response.json().get("detail", "Unknown error") if response.content else "No response content"
                self.log_test("User Registration", False, f"Status code: {response.status_code}, Error: {error_detail}")
                
            return success
        except Exception as e:
            self.log_test("User Registration", False, f"Exception: {str(e)}")
            return False

    def test_user_login(self) -> bool:
        """Test user login"""
        try:
            login_data = {
                "username": self.admin_user_data["username"],
                "password": self.admin_user_data["password"]
            }
            
            response = self.make_request("POST", "/api/auth/login", login_data)
            success = response.status_code == 200
            
            if success:
                data = response.json()
                success = all(key in data for key in ["access_token", "role", "user_id"])
                if success:
                    # Update token in case it's different
                    self.admin_token = data["access_token"]
                    self.log_test("User Login", True, f"Role: {data.get('role')}")
                else:
                    self.log_test("User Login", False, "Missing required fields in response")
            else:
                error_detail = response.json().get("detail", "Unknown error") if response.content else "No response content"
                self.log_test("User Login", False, f"Status code: {response.status_code}, Error: {error_detail}")
                
            return success
        except Exception as e:
            self.log_test("User Login", False, f"Exception: {str(e)}")
            return False

    def test_get_user_info(self) -> bool:
        """Test get current user info"""
        try:
            response = self.make_request("GET", "/api/auth/me", auth_required=True)
            success = response.status_code == 200
            
            if success:
                data = response.json()
                expected_fields = ["id", "username", "email", "role"]
                success = all(key in data for key in expected_fields)
                if success:
                    self.log_test("Get User Info", True, f"Username: {data.get('username')}, Role: {data.get('role')}")
                else:
                    self.log_test("Get User Info", False, f"Missing fields. Got: {list(data.keys())}")
            else:
                error_detail = response.json().get("detail", "Unknown error") if response.content else "No response content"
                self.log_test("Get User Info", False, f"Status code: {response.status_code}, Error: {error_detail}")
                
            return success
        except Exception as e:
            self.log_test("Get User Info", False, f"Exception: {str(e)}")
            return False

    def test_create_feedback_form(self) -> bool:
        """Test create feedback form (admin only)"""
        try:
            response = self.make_request("POST", "/api/forms", self.feedback_form_data, auth_required=True)
            success = response.status_code == 200
            
            if success:
                data = response.json()
                required_fields = ["id", "title", "year", "section", "department", "subjects", "evaluation_criteria"]
                success = all(key in data for key in required_fields)
                if success:
                    self.form_id = data["id"]
                    self.log_test("Create Feedback Form", True, f"Form ID: {self.form_id}, Title: {data.get('title')}")
                else:
                    self.log_test("Create Feedback Form", False, f"Missing fields. Got: {list(data.keys())}")
            else:
                error_detail = response.json().get("detail", "Unknown error") if response.content else "No response content"
                self.log_test("Create Feedback Form", False, f"Status code: {response.status_code}, Error: {error_detail}")
                
            return success
        except Exception as e:
            self.log_test("Create Feedback Form", False, f"Exception: {str(e)}")
            return False

    def test_get_feedback_forms(self) -> bool:
        """Test get feedback forms (admin only)"""
        try:
            response = self.make_request("GET", "/api/forms", auth_required=True)
            success = response.status_code == 200
            
            if success:
                data = response.json()
                success = isinstance(data, list)
                if success and len(data) > 0:
                    form = data[0]
                    required_fields = ["id", "title", "year", "section", "department"]
                    success = all(key in form for key in required_fields)
                    self.log_test("Get Feedback Forms", success, f"Found {len(data)} forms")
                else:
                    self.log_test("Get Feedback Forms", success, "No forms found (empty list)")
            else:
                error_detail = response.json().get("detail", "Unknown error") if response.content else "No response content"
                self.log_test("Get Feedback Forms", False, f"Status code: {response.status_code}, Error: {error_detail}")
                
            return success
        except Exception as e:
            self.log_test("Get Feedback Forms", False, f"Exception: {str(e)}")
            return False

    def test_get_feedback_form_by_id(self) -> bool:
        """Test get feedback form by ID (public endpoint)"""
        if not self.form_id:
            self.log_test("Get Feedback Form by ID", False, "No form ID available from previous test")
            return False
            
        try:
            response = self.make_request("GET", f"/api/forms/{self.form_id}")
            success = response.status_code == 200
            
            if success:
                data = response.json()
                required_fields = ["id", "title", "year", "section", "department", "subjects", "evaluation_criteria"]
                success = all(key in data for key in required_fields)
                if success:
                    self.log_test("Get Feedback Form by ID", True, f"Form: {data.get('title')}")
                else:
                    self.log_test("Get Feedback Form by ID", False, f"Missing fields. Got: {list(data.keys())}")
            else:
                error_detail = response.json().get("detail", "Unknown error") if response.content else "No response content"
                self.log_test("Get Feedback Form by ID", False, f"Status code: {response.status_code}, Error: {error_detail}")
                
            return success
        except Exception as e:
            self.log_test("Get Feedback Form by ID", False, f"Exception: {str(e)}")
            return False

    def test_submit_student_feedback(self) -> bool:
        """Test submit student feedback"""
        if not self.form_id:
            self.log_test("Submit Student Feedback", False, "No form ID available from previous test")
            return False
            
        try:
            # Add form_id to the feedback data
            feedback_data = self.student_feedback_data.copy()
            feedback_data["form_id"] = self.form_id
            
            response = self.make_request("POST", "/api/feedback", feedback_data)
            success = response.status_code == 200
            
            if success:
                data = response.json()
                required_fields = ["id", "form_id", "student_id", "ratings"]
                success = all(key in data for key in required_fields)
                if success:
                    self.log_test("Submit Student Feedback", True, f"Feedback ID: {data.get('id')}")
                else:
                    self.log_test("Submit Student Feedback", False, f"Missing fields. Got: {list(data.keys())}")
            else:
                error_detail = response.json().get("detail", "Unknown error") if response.content else "No response content"
                self.log_test("Submit Student Feedback", False, f"Status code: {response.status_code}, Error: {error_detail}")
                
            return success
        except Exception as e:
            self.log_test("Submit Student Feedback", False, f"Exception: {str(e)}")
            return False

    def test_get_feedback_summary(self) -> bool:
        """Test get feedback summary (admin only)"""
        if not self.form_id:
            self.log_test("Get Feedback Summary", False, "No form ID available from previous test")
            return False
            
        try:
            response = self.make_request("GET", f"/api/forms/{self.form_id}/feedback", auth_required=True)
            success = response.status_code == 200
            
            if success:
                data = response.json()
                required_fields = ["form_id", "form_title", "total_responses", "average_ratings_per_subject", "feedbacks"]
                success = all(key in data for key in required_fields)
                if success:
                    self.log_test("Get Feedback Summary", True, f"Total responses: {data.get('total_responses')}")
                else:
                    self.log_test("Get Feedback Summary", False, f"Missing fields. Got: {list(data.keys())}")
            else:
                error_detail = response.json().get("detail", "Unknown error") if response.content else "No response content"
                self.log_test("Get Feedback Summary", False, f"Status code: {response.status_code}, Error: {error_detail}")
                
            return success
        except Exception as e:
            self.log_test("Get Feedback Summary", False, f"Exception: {str(e)}")
            return False

    def run_all_tests(self) -> Dict[str, bool]:
        """Run all tests and return results"""
        print("🚀 Starting Backend API Tests")
        print(f"Testing against: {self.base_url}")
        print("=" * 60)
        
        results = {}
        
        # Test sequence
        test_methods = [
            ("Health Check", self.test_health_check),
            ("Root API Endpoint", self.test_root_api),
            ("User Registration", self.test_user_registration),
            ("User Login", self.test_user_login),
            ("Get User Info", self.test_get_user_info),
            ("Create Feedback Form", self.test_create_feedback_form),
            ("Get Feedback Forms", self.test_get_feedback_forms),
            ("Get Feedback Form by ID", self.test_get_feedback_form_by_id),
            ("Submit Student Feedback", self.test_submit_student_feedback),
            ("Get Feedback Summary", self.test_get_feedback_summary),
        ]
        
        for test_name, test_method in test_methods:
            try:
                results[test_name] = test_method()
            except Exception as e:
                print(f"❌ FAIL {test_name} - Unexpected error: {str(e)}")
                results[test_name] = False
            print()
        
        # Summary
        print("=" * 60)
        print("📊 TEST SUMMARY")
        print("=" * 60)
        
        passed = sum(1 for result in results.values() if result)
        total = len(results)
        
        for test_name, result in results.items():
            status = "✅ PASS" if result else "❌ FAIL"
            print(f"{status} {test_name}")
        
        print(f"\nOverall: {passed}/{total} tests passed ({passed/total*100:.1f}%)")
        
        if passed == total:
            print("🎉 All tests passed! Backend API is working correctly.")
        else:
            print(f"⚠️  {total - passed} test(s) failed. Please check the issues above.")
        
        return results


def main():
    # Get backend URL from environment or use default
    backend_url = "https://37229bc6-49d3-44df-9f81-66ed275eb5ea.preview.emergentagent.com"
    
    print(f"Backend API Test Suite")
    print(f"Target URL: {backend_url}")
    print()
    
    tester = BackendAPITester(backend_url)
    results = tester.run_all_tests()
    
    # Exit with appropriate code
    all_passed = all(results.values())
    sys.exit(0 if all_passed else 1)


if __name__ == "__main__":
    main()