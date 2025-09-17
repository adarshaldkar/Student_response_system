import React from 'react';
import { Users, Linkedin, Heart, Phone } from 'lucide-react';

const Footer = () => {
  return (
    <footer className="mt-16 pt-8 border-t border-gray-200 bg-white rounded-lg shadow-sm">
      <div className="max-w-4xl mx-auto px-6">
        {/* Company Logo and Info */}
        <div className="text-center mb-8">
          <div className="mb-6">
            <img 
              src="/Company_logo.png" 
              alt="Company Logo" 
              className="h-20 w-auto mx-auto mb-4"
              onError={(e) => {
                e.target.style.display = 'none';
                e.target.nextSibling.style.display = 'block';
              }}
            />
            
          </div>
          
          <p className="text-sm text-gray-600 mb-4 max-w-2xl mx-auto">
            Secure • Easy to use • Comprehensive feedback collection platform
          </p>
          <div className="text-sm text-gray-600 mb-6">
            <p className="mb-2 flex items-center justify-center gap-2">
              <Phone className="h-4 w-4 text-blue-600" />
              Contact Support: <a href="tel:+918248622746" className="text-blue-600 hover:text-blue-800 font-medium transition-colors">+91 82486 22746</a>
            </p>
            <p className="text-xs text-gray-500">Available Monday to Friday, 9:00 AM - 6:00 PM</p>
          </div>
        </div>

        {/* Developers Section */}
        <div className="grid grid-cols-2 gap-3 sm:gap-4 md:gap-6 mb-8">
          <div className="text-center p-4 bg-gray-50 rounded-lg">
            <div className="w-12 h-12 bg-blue-600 rounded-full flex items-center justify-center mx-auto mb-3">
              <Users className="h-6 w-6 text-white" />
            </div>
            <h4 className="font-semibold text-gray-900 mb-2">Adarsh Patel</h4>
            <p className="text-sm text-gray-600 mb-3">Full Stack Developer</p>
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
            <h4 className="font-semibold text-gray-900 mb-2">Praveen Kumar</h4>
            <p className="text-sm text-gray-600 mb-3">Full Stack Developer</p>
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
                Made with <Heart className="h-4 w-4 text-red-500 fill-current" /> by our development team
              </p>
            </div>
            <div className="flex items-center gap-4">
              <span>© {new Date().getFullYear()} All rights reserved</span>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
