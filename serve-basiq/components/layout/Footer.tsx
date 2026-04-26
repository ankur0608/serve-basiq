import React from 'react';
import Link from 'next/link';
import { Facebook, Instagram, Linkedin } from 'lucide-react';

// Custom Pinterest Icon since it is not natively included in standard lucide-react
const PinterestIcon = ({ size = 24, className = "" }) => (
  <svg 
    xmlns="http://www.w3.org/2000/svg" 
    width={size} 
    height={size} 
    viewBox="0 0 24 24" 
    fill="currentColor" 
    className={className}
  >
    <path d="M12.017 0C5.396 0 .029 5.367.029 11.987c0 5.079 3.158 9.417 7.618 11.162-.105-.949-.199-2.403.041-3.439.219-.937 1.406-5.957 1.406-5.957s-.359-.72-.359-1.781c0-1.663.967-2.911 2.168-2.911 1.024 0 1.518.769 1.518 1.688 0 1.029-.653 2.567-.992 3.992-.285 1.193.6 2.165 1.775 2.165 2.128 0 3.768-2.245 3.768-5.487 0-2.861-2.063-4.869-5.008-4.869-3.41 0-5.409 2.562-5.409 5.199 0 1.033.394 2.143.889 2.741.099.12.112.225.085.345-.09.375-.293 1.199-.334 1.363-.053.225-.172.271-.401.165-1.495-.69-2.433-2.878-2.433-4.646 0-3.776 2.748-7.252 7.951-7.252 4.168 0 7.41 2.967 7.41 6.923 0 4.135-2.607 7.462-6.233 7.462-1.214 0-2.354-.629-2.758-1.379l-.749 2.848c-.269 1.045-1.004 2.352-1.498 3.146 1.123.345 2.306.535 3.55.535 6.607 0 11.985-5.365 11.985-11.987C23.97 5.367 18.592 0 12.017 0z"/>
  </svg>
);

const Footer = () => {
  return (
    <footer id="main-footer" className="bg-gradient-to-br from-slate-900 via-slate-950 to-black text-gray-300">
      <div className="max-w-7xl mx-auto px-6 py-12 md:py-16">

        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 md:gap-12">

          {/* Brand & Social Section - Aligned Left */}
          <div className="col-span-2 md:col-span-1 text-left">
            <h2 className="text-2xl font-bold text-white">
              Serve<span className="text-indigo-500">Basiq</span>
            </h2>

            <p className="mt-4 text-gray-400 leading-relaxed text-sm md:text-base max-w-sm">
              A trusted platform to find nearby services and products from
              verified local providers.
            </p>

            {/* Social Icons - Aligned Left */}
            <div className="flex gap-4 mt-6 justify-start">
              <a
                href="https://www.facebook.com/share/1CRARanWzj/"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Facebook"
                className="w-10 h-10 rounded-full bg-slate-800 flex items-center justify-center hover:bg-indigo-600 hover:text-white transition-all duration-300"
              >
                <Facebook size={18} />
              </a>

              <a
                href="https://www.instagram.com/servebasiq?igsh=MWg0cG9zcHA5YWk4MA=="
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Instagram"
                className="w-10 h-10 rounded-full bg-slate-800 flex items-center justify-center hover:bg-indigo-600 hover:text-white transition-all duration-300"
              >
                <Instagram size={18} />
              </a>

              <a
                href="https://in.pinterest.com/servebasiq"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Pinterest"
                className="w-10 h-10 rounded-full bg-slate-800 flex items-center justify-center hover:bg-indigo-600 hover:text-white transition-all duration-300"
              >
                <PinterestIcon size={18} />
              </a>

              {/* <a
                href="#"
                aria-label="LinkedIn"
                className="w-10 h-10 rounded-full bg-slate-800 flex items-center justify-center hover:bg-indigo-600 hover:text-white transition-all duration-300"
              >
                <Linkedin size={18} />
              </a> */}
            </div>
          </div>

          {/* Explore / Core Offerings Links */}
          <div className="pt-2 md:pt-0">
            <h3 className="text-white font-semibold mb-4 md:mb-5 text-lg">Explore</h3>
            <ul className="space-y-3 md:space-y-4 text-sm md:text-base">
              <li><Link href="/products" className="hover:text-white transition-colors">Products</Link></li>
              <li><Link href="/services" className="hover:text-white transition-colors">Services</Link></li>
              <li><Link href="/rentals" className="hover:text-white transition-colors">Rentals</Link></li>
              <li><Link href="/post-requirement" className="hover:text-white transition-colors">Post Requirement</Link></li>
            </ul>
          </div>

          {/* Company Links */}
          <div className="pt-2 md:pt-0">
            <h3 className="text-white font-semibold mb-4 md:mb-5 text-lg">Company</h3>
            <ul className="space-y-3 md:space-y-4 text-sm md:text-base">
              <li><Link href="/about" className="hover:text-white transition-colors">About Us</Link></li>
              <li><Link href="/contact" className="hover:text-white transition-colors">Contact</Link></li>
              <li><Link href="/careers" className="hover:text-white transition-colors">Careers</Link></li>
            </ul>
          </div>

          {/* Support Links */}
          <div className="pt-2 md:pt-0">
            <h3 className="text-white font-semibold mb-4 md:mb-5 text-lg">Support</h3>
            <ul className="space-y-3 md:space-y-4 text-sm md:text-base">
              <li><Link href="/privacy" className="hover:text-white transition-colors">Privacy Policy</Link></li>
              <li><Link href="/terms" className="hover:text-white transition-colors">Terms & Conditions</Link></li>
              <li><Link href="/faq" className="hover:text-white transition-colors">FAQs</Link></li>
            </ul>
          </div>

        </div>

        {/* Divider & Copyright */}
        <div className="border-t border-slate-800 mt-10 md:mt-14 pt-6 flex flex-col md:flex-row justify-between items-center gap-4 text-left">
          <p className="text-sm text-gray-500 w-full md:w-auto">
            © 2026 Servebasiq. All rights reserved.
          </p>
        </div>

      </div>
    </footer>
  );
};

export default Footer;