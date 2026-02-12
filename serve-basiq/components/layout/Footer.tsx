import React from 'react';
import Link from 'next/link';
import { Facebook, Instagram, Linkedin } from 'lucide-react';

const Footer = () => {
  return (
    <footer id="main-footer" className="bg-gradient-to-br from-slate-900 via-slate-950 to-black text-gray-300">      <div className="max-w-7xl mx-auto px-6 py-12 md:py-16">

      <div className="grid grid-cols-2 md:grid-cols-3 gap-8 md:gap-12">


        <div className="col-span-2 md:col-span-1 text-center md:text-left">
          <h2 className="text-2xl font-bold text-white">
            Serve<span className="text-indigo-500">basic</span>
          </h2>

          <p className="mt-4 text-gray-400 leading-relaxed text-sm md:text-base mx-auto md:mx-0 max-w-sm">
            A trusted platform to find nearby services and products from
            verified local providers.
          </p>

          {/* Social Icons - Centered on mobile, Left on desktop */}
          <div className="flex gap-4 mt-6 justify-center md:justify-start">
            <a
              href="#"
              aria-label="Facebook"
              className="w-10 h-10 rounded-full bg-slate-800 flex items-center justify-center hover:bg-indigo-600 hover:text-white transition-all duration-300"
            >
              <Facebook size={18} />
            </a>

            <a
              href="#"
              aria-label="Instagram"
              className="w-10 h-10 rounded-full bg-slate-800 flex items-center justify-center hover:bg-indigo-600 hover:text-white transition-all duration-300"
            >
              <Instagram size={18} />
            </a>

            <a
              href="#"
              aria-label="LinkedIn"
              className="w-10 h-10 rounded-full bg-slate-800 flex items-center justify-center hover:bg-indigo-600 hover:text-white transition-all duration-300"
            >
              <Linkedin size={18} />
            </a>
          </div>
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
      <div className="border-t border-slate-800 mt-10 md:mt-14 pt-6 flex flex-col md:flex-row justify-between items-center gap-4 text-center md:text-left">
        <p className="text-sm text-gray-500">
          © 2026 ServeMate. All rights reserved.
        </p>

        {/* Optional: Mobile-friendly bottom links */}
        <div className="flex gap-6 text-sm text-gray-500">
          <Link href="/privacy" className="hover:text-gray-300">Privacy</Link>
          <Link href="/terms" className="hover:text-gray-300">Terms</Link>
        </div>
      </div>

    </div>
    </footer>
  );
};

export default Footer;