import React from 'react';
import Link from 'next/link';
// If you use lucide-react, import icons here. 
// Otherwise, you can keep the Font Awesome classes if you have the CDN in your layout.
import { Facebook, Instagram, Linkedin } from 'lucide-react'; 

const Footer = () => {
  return (
    <footer className="bg-gradient-to-br from-slate-900 via-slate-950 to-black text-gray-300">
      <div className="max-w-7xl mx-auto px-6 py-16">
        
        {/* Top Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
          
          {/* Brand */}
          <div>
            <h2 className="text-2xl font-bold text-white">
              Serve<span className="text-indigo-500">basic</span>
            </h2>

            <p className="mt-4 text-gray-400 max-w-sm leading-relaxed">
              A trusted platform to find nearby services and products from
              verified local providers.
            </p>

            {/* Social Icons */}
            <div className="flex gap-4 mt-6">
              <a 
                href="#" 
                aria-label="Facebook"
                className="w-10 h-10 rounded-full bg-slate-800 flex items-center justify-center hover:bg-indigo-600 transition-colors"
              >
                <Facebook size={18} />
              </a>

              <a 
                href="#" 
                aria-label="Instagram"
                className="w-10 h-10 rounded-full bg-slate-800 flex items-center justify-center hover:bg-indigo-600 transition-colors"
              >
                <Instagram size={18} />
              </a>

              <a 
                href="#" 
                aria-label="LinkedIn"
                className="w-10 h-10 rounded-full bg-slate-800 flex items-center justify-center hover:bg-indigo-600 transition-colors"
              >
                <Linkedin size={18} />
              </a>
            </div>
          </div>

          {/* Company */}
          <div>
            <h3 className="text-white font-semibold mb-5">Company</h3>
            <ul className="space-y-4">
              <li><Link href="/about" className="hover:text-white transition-colors">About Us</Link></li>
              <li><Link href="/contact" className="hover:text-white transition-colors">Contact</Link></li>
              <li><Link href="/careers" className="hover:text-white transition-colors">Careers</Link></li>
            </ul>
          </div>

          {/* Support */}
          <div>
            <h3 className="text-white font-semibold mb-5">Support</h3>
            <ul className="space-y-4">
              <li><Link href="/privacy" className="hover:text-white transition-colors">Privacy Policy</Link></li>
              <li><Link href="/terms" className="hover:text-white transition-colors">Terms & Conditions</Link></li>
            </ul>
          </div>

        </div>

        {/* Divider */}
        <div className="border-t border-slate-800 mt-14 pt-6">
          <p className="text-sm text-gray-400 text-center md:text-left">
            © 2026 ServeMate. All rights reserved.
          </p>
        </div>

      </div>
    </footer>
  );
};

export default Footer;