import React from 'react';
import { Heart } from 'lucide-react';

const Footer = () => {
  return (
    <footer className="bg-slate-900 text-slate-300 py-8 text-center mt-auto">
      <div className="max-w-7xl mx-auto px-4 flex flex-col items-center">
        <p className="flex items-center gap-2 mb-2">
          Made with <Heart className="text-rose-500 h-4 w-4" fill="currentColor" /> for your special day
        </p>
        <p className="text-sm text-slate-500">&copy; {new Date().getFullYear()} Smart Wedding Booking. All rights reserved.</p>
      </div>
    </footer>
  );
};

export default Footer;
