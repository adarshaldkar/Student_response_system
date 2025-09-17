import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { useAuth } from "../contexts/AuthContext";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Badge } from "./ui/badge";
import { Alert, AlertDescription } from "./ui/alert";
import {
  Loader2,
  ExternalLink,
  Calendar,
  Users,
  BookOpen,
  Github,
  Linkedin,
  Mail,
  Heart,
  Phone,
} from "lucide-react";

const BACKEND_URL =
  process.env.REACT_APP_BACKEND_URL ||
  "http://localhost:8001";
const API = `${BACKEND_URL}/api`;

const HomePage = () => {
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAuth();
  const [forms, setForms] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [directFormId, setDirectFormId] = useState("");

  useEffect(() => {
    if (isAuthenticated && user?.role === "admin") {
      navigate("/admin");
    }
  }, [isAuthenticated, user, navigate]);

  const fetchPublicForms = async () => {
    // This would be for publicly available forms if needed
    // For now, students access forms through direct links
  };

  const handleDirectAccess = () => {
    if (directFormId.trim()) {
      navigate(`/student/${directFormId.trim()}`);
    }
  };

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
        <div className="w-full max-w-6xl mx-auto px-3 sm:px-4 md:px-6 lg:px-8 py-6 sm:py-8 lg:py-12">
          {/* Hero Section */}
          <div className="text-center mb-8 sm:mb-10 lg:mb-12">
            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-900 mb-3 sm:mb-4 leading-tight">
              Teacher Feedback Collection System
            </h1>
            <p className="text-base sm:text-lg lg:text-xl text-gray-600 max-w-3xl mx-auto px-2">
              A comprehensive platform for collecting and managing student
              feedback on teaching effectiveness
            </p>
          </div>

          {/* Access Section */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6 lg:gap-8 max-w-4xl mx-auto mb-10">
            <Card>
              <CardHeader className="px-4 sm:px-6">
                <CardTitle className="flex items-center gap-2 text-base sm:text-lg">
                  <Users className="h-4 w-4 sm:h-5 sm:w-5 text-green-600" />
                  For Students
                </CardTitle>
              </CardHeader>
              <CardContent className="px-4 sm:px-6">
                <p className="text-sm sm:text-base text-gray-600 mb-4">
                  Access feedback forms through links shared by your teachers
                </p>
                <div className="space-y-3">
                  <Input
                    placeholder="Enter form ID or paste form link"
                    value={directFormId}
                    onChange={(e) => setDirectFormId(e.target.value)}
                    className="text-sm sm:text-base"
                  />
                  <Button
                    onClick={handleDirectAccess}
                    className="w-full text-sm sm:text-base py-2 sm:py-3"
                  >
                    <ExternalLink className="h-3 w-3 sm:h-4 sm:w-4 mr-2" />
                    Access Form
                  </Button>
                </div>
                {/* <div className="mt-4 pt-4 border-t">
                  <Button 
                    variant="outline" 
                    onClick={() => navigate('/student-login')}
                    className="w-full text-sm sm:text-base py-2 sm:py-3"
                  >
                    Student Login
                  </Button>
                </div> */}
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="px-4 sm:px-6">
                <CardTitle className="flex items-center gap-2 text-base sm:text-lg">
                  <BookOpen className="h-4 w-4 sm:h-5 sm:w-5 text-blue-600" />
                  For Teachers/Admins
                </CardTitle>
              </CardHeader>
              <CardContent className="px-4 sm:px-6">
                <p className="text-sm sm:text-base text-gray-600 mb-4">
                  Create and manage feedback forms, view responses and export
                  data
                </p>
                <div className="space-y-3">
                  <Button
                    onClick={() => navigate("/admin-login")}
                    className="w-full text-sm sm:text-base py-2 sm:py-3"
                  >
                    Admin Login
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => navigate("/register")}
                    className="w-full text-sm sm:text-base py-2 sm:py-3"
                  >
                    Register as Admin
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Features Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-8 mb-12">
            <Card className="text-center hover:shadow-lg transition-shadow duration-300 h-full">
              <CardContent className="pt-8 pb-6 px-6 h-full flex flex-col">
                <div className="flex-shrink-0 mb-4">
                  <BookOpen className="h-12 w-12 text-blue-600 mx-auto" />
                </div>
                <h3 className="text-xl font-semibold mb-3 text-gray-900">
                  Dynamic Forms
                </h3>
                <p className="text-gray-600 flex-grow">
                  Create customizable feedback forms with subjects and
                  evaluation criteria
                </p>
              </CardContent>
            </Card>

            <Card className="text-center hover:shadow-lg transition-shadow duration-300 h-full">
              <CardContent className="pt-8 pb-6 px-6 h-full flex flex-col">
                <div className="flex-shrink-0 mb-4">
                  <Users className="h-12 w-12 text-green-600 mx-auto" />
                </div>
                <h3 className="text-xl font-semibold mb-3 text-gray-900">
                  Easy Sharing
                </h3>
                <p className="text-gray-600 flex-grow">
                  Share feedback forms with students through secure shareable
                  links
                </p>
              </CardContent>
            </Card>

            <Card className="text-center hover:shadow-lg transition-shadow duration-300 h-full">
              <CardContent className="pt-8 pb-6 px-6 h-full flex flex-col">
                <div className="flex-shrink-0 mb-4">
                  <Calendar className="h-12 w-12 text-purple-600 mx-auto" />
                </div>
                <h3 className="text-xl font-semibold mb-3 text-gray-900">
                  Data Export
                </h3>
                <p className="text-gray-600 flex-grow">
                  Export feedback data in Excel format for analysis and
                  reporting
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Call to Action */}
          {/* <div className="text-center mt-12">
            <h2 className="text-2xl font-semibold mb-4">Get Started Today</h2>
            <p className="text-gray-600 mb-6">
              Sign up now to create your first feedback form and start collecting valuable insights!
            </p>
            <Button 
              onClick={() => navigate('/register')}
              className="w-full sm:w-auto text-sm sm:text-base py-2 sm:py-3"
            >
              Sign Up
            </Button>
          </div> */}

          {/* Footer */}
          <footer className="mt-16 pt-8 border-t border-gray-200 bg-white rounded-lg shadow-sm">
            <div className="max-w-4xl mx-auto px-6">
              {/* Company Logo and Info */}
              <div className="text-center mb-8">
                <div className="mb-6">
                  <img
                    src="/Company_logo.png"
                    alt="Company Logo"
                    className="h-32 w-auto mx-auto mb-4"
                    onError={(e) => {
                      e.target.style.display = "none";
                      e.target.nextSibling.style.display = "block";
                    }}
                  />
                </div>

                <p className="text-sm text-gray-600 mb-4 max-w-2xl mx-auto">
                  Secure • Easy to use • Comprehensive feedback collection
                  platform
                </p>
                <div className="text-sm text-gray-600 mb-6">
                  <p className="mb-2 flex items-center justify-center gap-2">
                    <Phone className="h-4 w-4 text-blue-600" />
                    Contact Support:{" "}
                    <a
                      href="tel:+918248622746"
                      className="text-blue-600 hover:text-blue-800 font-medium transition-colors"
                    >
                      +91 82486 22746
                    </a>
                    {/* Contact Support: <a href="tel:+91 7010664806" className="text-blue-600 hover:text-blue-800 font-medium transition-colors">+91 7010664806</a> */}
                  </p>
                  <p className="text-xs text-gray-500">
                    Available Monday to Friday, 9:00 AM - 6:00 PM
                  </p>
                </div>
                <div className="text-sm text-gray-600 mb-6">
                  <p className="mb-2 flex items-center justify-center gap-2">
                    <Phone className="h-4 w-4 text-blue-600" />
                    {/* Contact Support: <a href="tel:+918248622746" className="text-blue-600 hover:text-blue-800 font-medium transition-colors">+91 82486 22746</a> */}
                    Contact Support:{" "}
                    <a
                      href="tel:+91 7010664806"
                      className="text-blue-600 hover:text-blue-800 font-medium transition-colors"
                    >
                      +91 7010664806
                    </a>
                  </p>
                  <p className="text-xs text-gray-500">
                    Available Monday to Friday, 9:00 AM - 6:00 PM
                  </p>
                </div>
              </div>

              {/* Developers Section */}
              <div className="grid grid-cols-2 gap-3 sm:gap-4 md:gap-6 mb-8">
                <div className="text-center p-4 bg-gray-50 rounded-lg">
                  <div className="w-12 h-12 bg-blue-600 rounded-full flex items-center justify-center mx-auto mb-3">
                    <Users className="h-6 w-6 text-white" />
                  </div>
                  <h4 className="font-semibold text-gray-900 mb-2">
                    Adarsh Patel
                  </h4>
                  <p className="text-sm text-gray-600 mb-3">
                    Full Stack Developer
                  </p>
                  <a
                    href="https://www.linkedin.com/in/adarsh-patel14/"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 text-blue-600 hover:text-blue-800 transition-colors"
                  >
                    <Linkedin className="h-4 w-4" />
                    Connect on LinkedIn
                  </a>
                </div>

                <div className="text-center p-4 bg-gray-50 rounded-lg">
                  <div className="w-12 h-12 bg-green-600 rounded-full flex items-center justify-center mx-auto mb-3">
                    <Users className="h-6 w-6 text-white" />
                  </div>
                  <h4 className="font-semibold text-gray-900 mb-2">
                    Praveen Kumar
                  </h4>
                  <p className="text-sm text-gray-600 mb-3">
                    Full Stack Developer
                  </p>
                  <a
                    href="https://www.linkedin.com/in/praveenkumar-fullstackdeveloper/"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 text-green-600 hover:text-green-800 transition-colors"
                  >
                    <Linkedin className="h-4 w-4" />
                    Connect on LinkedIn
                  </a>
                </div>
              </div>

              {/* Bottom Footer */}
              <div className="border-t border-gray-200 pt-6 pb-6">
                <div className="flex flex-col md:flex-row justify-between items-center text-sm text-gray-500">
                  <div className="mb-4 md:mb-0">
                    <p className="flex items-center gap-1">
                      Made with{" "}
                      <Heart className="h-4 w-4 text-red-500 fill-current" /> by
                      our development team
                    </p>
                  </div>
                  <div className="flex items-center gap-4">
                    <span>
                      © {new Date().getFullYear()} All rights reserved
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </footer>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-4 sm:py-6 lg:py-8">
      <div className="w-full max-w-4xl mx-auto px-3 sm:px-4 md:px-6 lg:px-8">
        <Card>
          <CardHeader className="px-4 sm:px-6">
            <CardTitle className="text-lg sm:text-xl">
              Welcome, {user?.username}!
            </CardTitle>
          </CardHeader>
          <CardContent className="px-4 sm:px-6">
            <p className="text-sm sm:text-base text-gray-600">
              You can access feedback forms through links shared by your
              teachers.
            </p>

            <div className="mt-4 sm:mt-6 space-y-4">
              <div>
                <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-2">
                  Enter Form ID or Paste Form Link
                </label>
                <div className="flex flex-col sm:flex-row gap-2 sm:gap-3">
                  <Input
                    placeholder="Form ID or full form link"
                    value={directFormId}
                    onChange={(e) => setDirectFormId(e.target.value)}
                    className="flex-1 text-sm sm:text-base"
                  />
                  <Button
                    onClick={handleDirectAccess}
                    className="text-sm sm:text-base py-2 sm:py-3 sm:px-4"
                  >
                    <ExternalLink className="h-3 w-3 sm:h-4 sm:w-4 mr-1 sm:mr-2" />
                    Access
                  </Button>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default HomePage;
