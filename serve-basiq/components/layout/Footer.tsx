import Link from 'next/link';
import { FaFacebookF, FaTwitter, FaLinkedinIn, FaInstagram, FaApple, FaGooglePlay } from 'react-icons/fa6';

export default function Footer() {
  return (
    <footer className="bg-slate-900 text-white pt-16 pb-8 hidden md:block mt-auto border-t border-gray-800">
      <div className="max-w-7xl mx-auto px-4 grid grid-cols-4 gap-12 mb-12">
        {/* Brand Column */}
        <div>
          <span className="font-extrabold text-2xl tracking-tight">
            Serve<span className="text-brand-500">Mate</span>
          </span>
          <p className="text-slate-400 text-sm mt-4 leading-relaxed">
            The trusted global marketplace for services and B2B sourcing. Connecting you with experts and suppliers since 2025.
          </p>
          <div className="flex gap-4 mt-6">
            {[FaFacebookF, FaTwitter, FaLinkedinIn, FaInstagram].map((Icon, i) => (
              <a key={i} href="#" className="w-9 h-9 rounded-full bg-white/10 flex items-center justify-center hover:bg-brand-500 transition text-sm">
                <Icon />
              </a>
            ))}
          </div>
        </div>
        
        {/* Company Column */}
        <div>
          <h4 className="font-bold text-lg mb-6 text-white">Company</h4>
          <ul className="space-y-3 text-slate-400 text-sm">
            <li><Link href="#" className="hover:text-brand-400 transition">About Us</Link></li>
            <li><Link href="#" className="hover:text-brand-400 transition">Careers</Link></li>
            <li><Link href="#" className="hover:text-brand-400 transition">Blog</Link></li>
            <li><Link href="#" className="hover:text-brand-400 transition">Press</Link></li>
          </ul>
        </div>

        {/* Support Column */}
        <div>
           <h4 className="font-bold text-lg mb-6 text-white">Support</h4>
           <ul className="space-y-3 text-slate-400 text-sm">
             <li><Link href="#" className="hover:text-brand-400 transition">Help Center</Link></li>
             <li><Link href="#" className="hover:text-brand-400 transition">Trust & Safety</Link></li>
             <li><Link href="#" className="hover:text-brand-400 transition">Terms of Service</Link></li>
             <li><Link href="#" className="hover:text-brand-400 transition">Privacy Policy</Link></li>
           </ul>
        </div>

        {/* Get App Column */}
        <div>
          <h4 className="font-bold text-lg mb-6 text-white">Get the App</h4>
          <p className="text-slate-400 text-sm mb-4">Book services on the go.</p>
          <div className="flex flex-col gap-3">
            <button className="bg-white/10 border border-white/10 px-4 py-2.5 rounded-xl flex items-center gap-3 hover:bg-white/20 transition text-left w-full max-w-[180px]">
              <FaApple className="text-2xl" />
              <div><div className="text-[9px] uppercase font-bold text-slate-400">Download on the</div><div className="font-bold text-sm">App Store</div></div>
            </button>
            <button className="bg-white/10 border border-white/10 px-4 py-2.5 rounded-xl flex items-center gap-3 hover:bg-white/20 transition text-left w-full max-w-[180px]">
              <FaGooglePlay className="text-xl" />
              <div><div className="text-[9px] uppercase font-bold text-slate-400">Get it on</div><div className="font-bold text-sm">Google Play</div></div>
            </button>
          </div>
        </div>
      </div>
      
      {/* Bottom Bar */}
      <div className="border-t border-white/10 pt-8 text-center text-slate-500 text-sm flex flex-col md:flex-row justify-between items-center max-w-7xl mx-auto px-4">
        <span>&copy; 2025 Servebasiq Inc. All rights reserved.</span>
        <div className="flex gap-6 mt-4 md:mt-0">
            <Link href="#" className="hover:text-white transition">Privacy</Link>
            <Link href="#" className="hover:text-white transition">Terms</Link>
            <Link href="#" className="hover:text-white transition">Sitemap</Link>
        </div>
      </div>
    </footer>
  );
}