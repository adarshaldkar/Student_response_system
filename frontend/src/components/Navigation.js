import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { User, Shield, LogOut, Home, Menu, X } from 'lucide-react';

// College logo is served from public folder
const Navigation = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, logout, isAuthenticated, isAdmin } = useAuth();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  
  const isAdminView = location.pathname.includes('/admin');
  const isStudentView = location.pathname.includes('/student');

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  const closeMobileMenu = () => {
    setIsMobileMenuOpen(false);
  };

  return (
    <nav className="bg-white shadow-lg border-b sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-3 sm:px-4 lg:px-6">
        <div className="flex items-center py-3 sm:py-4">
          {/* Logo/Brand */}
          <div className="cursor-pointer flex-1 flex items-center gap-3">
            <div className="flex items-center gap-3">
              <img 
                src="/college_logo_1.jpg" 
                alt="College Logo" 
                className="h-12 sm:h-14 lg:h-16 xl:h-20 w-auto object-contain max-w-[200px] sm:max-w-[250px] lg:max-w-[300px] xl:max-w-[350px]"
                onError={(e) => {
                  e.target.style.display = 'none';
                  e.target.nextSibling.style.display = 'block';
                }}
              />
              
            </div>
          </div>

          {/* Centered Department Section */}
          <div className="hidden md:flex flex-col items-center justify-center flex-1">
            <h2 className="text-lg lg:text-xl xl:text-2xl font-bold text-gray-800 tracking-wide">
              Department of 
            </h2>
            <p className="text-xs lg:text-sm text-blue-600 font-medium uppercase tracking-wider">
              Electronics & Communication Engineering
            </p>
          </div>
          
          {/* Desktop Navigation */}
          <div className="hidden md:flex gap-2 lg:gap-3 items-center justify-end flex-1">
            {isAuthenticated ? (
              <>
                <span className="text-sm text-gray-600 mr-2 max-w-32 truncate">
                  Welcome, <span className="font-medium text-blue-600">{user?.username}</span>
                </span>
                
                {!isAdmin && (
                  <Button
                    variant="outline"
                    onClick={() => navigate('/')}
                    className="flex items-center gap-2 text-sm"
                    size="sm"
                  >
                    <Home className="h-4 w-4" />
                    Forms
                  </Button>
                )}
                
                {isAdmin && (
                  <Button
                    variant={isAdminView ? "default" : "outline"}
                    onClick={() => navigate('/admin')}
                    className="flex items-center gap-2 text-sm"
                    size="sm"
                  >
                    <Shield className="h-4 w-4" />
                    Dashboard
                  </Button>
                )}
                
                <Button
                  variant="outline"
                  onClick={logout}
                  className="flex items-center gap-2 text-red-600 hover:text-red-700 text-sm"
                  size="sm"
                >
                  <LogOut className="h-4 w-4" />
                  Logout
                </Button>
              </>
            ) : (
              <>
                {!isStudentView && (
                  <Button
                    variant="default"
                    onClick={() => navigate('/admin-login')}
                    className="flex items-center gap-2 text-sm"
                    size="sm"
                  >
                    <Shield className="h-4 w-4" />
                    Admin
                  </Button>
                )}
              </>
            )}
          </div>

          {/* Mobile Menu Button */}
          <div className="md:hidden shrink-0">
            <Button
              variant="outline"
              size="sm"
              onClick={toggleMobileMenu}
              className="p-2"
            >
              {isMobileMenuOpen ? (
                <X className="h-5 w-5" />
              ) : (
                <Menu className="h-5 w-5" />
              )}
            </Button>
          </div>
        </div>

        {/* Mobile Menu */}
        {isMobileMenuOpen && (
          <div className="md:hidden border-t bg-white">
            <div className="px-2 pt-2 pb-3 space-y-2">
              {isAuthenticated ? (
                <>
                  <div className="px-3 py-2 text-sm text-gray-600 border-b">
                    Welcome, <span className="font-medium text-blue-600">{user?.username}</span>
                  </div>
                  
                  {!isAdmin && (
                    <Button
                      variant="outline"
                      onClick={() => { navigate('/'); closeMobileMenu(); }}
                      className="w-full justify-start gap-2"
                      size="sm"
                    >
                      <Home className="h-4 w-4" />
                      Forms
                    </Button>
                  )}
                  
                  {isAdmin && (
                    <Button
                      variant={isAdminView ? "default" : "outline"}
                      onClick={() => { navigate('/admin'); closeMobileMenu(); }}
                      className="w-full justify-start gap-2"
                      size="sm"
                    >
                      <Shield className="h-4 w-4" />
                      Admin Dashboard
                    </Button>
                  )}
                  
                  <Button
                    variant="outline"
                    onClick={() => { logout(); closeMobileMenu(); }}
                    className="w-full justify-start gap-2 text-red-600 hover:text-red-700"
                    size="sm"
                  >
                    <LogOut className="h-4 w-4" />
                    Logout
                  </Button>
                </>
              ) : (
                <>
                  {!isStudentView && (
                    <Button
                      variant="default"
                      onClick={() => { navigate('/admin-login'); closeMobileMenu(); }}
                      className="w-full justify-start gap-2"
                      size="sm"
                    >
                      <Shield className="h-4 w-4" />
                      Admin Login
                    </Button>
                  )}
                </>
              )}
            </div>
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navigation;