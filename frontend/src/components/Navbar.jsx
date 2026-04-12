import React, { useContext } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { Home, User, LogOut, Menu } from 'lucide-react';

const Navbar = () => {
  const { user, logout } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <nav className="bg-white/80 backdrop-blur-md border-b border-slate-100 sticky top-0 z-50 transition-all">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16 items-center">
          <div className="flex shrink-0">
            <Link to="/" className="flex items-center gap-2">
              <Home className="h-6 w-6 text-rose-600" />
              <span className="font-bold text-xl text-slate-900 hidden sm:block">
                Wedding Booking
              </span>
            </Link>
          </div>
          
          <div className="flex items-center gap-4">
            {user ? (
              <div className="flex items-center gap-4">
                <Link to="/dashboard?tab=add-hall" className="text-sm font-bold text-rose-600 hover:text-rose-700 transition hidden sm:block">
                  Host a Venue
                </Link>
                <Link to="/dashboard" className="text-sm font-medium hover:text-rose-600 transition flex items-center gap-1">
                  <User size={16} /> Dashboard
                </Link>
                <button
                  onClick={handleLogout}
                  className="flex items-center gap-1 bg-slate-100 hover:bg-slate-200 text-slate-700 px-3 py-2 rounded-md text-sm font-medium transition"
                >
                  <LogOut size={16} /> Logout
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <Link
                  to="/login"
                  className="text-slate-600 hover:text-slate-900 font-medium px-3 py-2 rounded-md text-sm transition"
                >
                  Login
                </Link>
                <Link
                  to="/register"
                  className="bg-rose-600 text-white hover:bg-rose-700 font-medium px-4 py-2 rounded-md text-sm transition shadow-sm"
                >
                  Sign Up
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
