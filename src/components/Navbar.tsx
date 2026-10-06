import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Calendar, User, LogOut, LayoutDashboard, PlusCircle, ShieldCheck, Ticket, Menu, X, FileText } from 'lucide-react';

const Navbar = () => {
  const { user, logout } = useAuth();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <nav className="bg-white/80 backdrop-blur-md shadow-sm border-b border-slate-100 sticky top-0 z-50">
      <div className="container mx-auto px-4">
        <div className="flex justify-between h-20 items-center">
          <Link to="/" className="flex items-center space-x-3 text-slate-900 font-display font-extrabold text-2xl tracking-tighter">
            <div className="bg-slate-900 p-2 rounded-xl text-white shadow-lg shadow-slate-200">
              <Calendar className="w-6 h-6" />
            </div>
            <span>CampusEvent <span className="text-emerald-500">Pro</span></span>
          </Link>

          <div className="hidden md:flex items-center space-x-8">
            <Link to="/" className="text-slate-600 hover:text-slate-900 font-medium transition-colors text-sm uppercase tracking-wider">Events</Link>
            
            {user ? (
              <>
                {user.role === 'admin' && (
                  <Link to="/admin" className="flex items-center space-x-2 text-slate-600 hover:text-emerald-600 transition-all font-medium text-sm">
                    <ShieldCheck className="w-4 h-4" />
                    <span>Admin</span>
                  </Link>
                )}
                
                {(user.role === 'organizer' || user.role === 'admin') && (
                  <div className="flex items-center space-x-2">
                    <Link to="/create-event" className="flex items-center space-x-2 bg-slate-900 text-white px-5 py-2.5 rounded-xl hover:bg-slate-800 transition-all shadow-md shadow-slate-200 font-bold text-sm">
                      <PlusCircle className="w-4 h-4" />
                      <span>Create Event</span>
                    </Link>
                    {user.role === 'organizer' && (
                      <>
                        <Link to="/generate-report" className="flex items-center space-x-2 text-slate-600 hover:text-emerald-600 transition-all font-medium text-sm">
                          <FileText className="w-4 h-4" />
                          <span>Report Generator</span>
                        </Link>
                      </>
                    )}
                  </div>
                )}

                {user.role === 'student' && (
                  <Link to="/my-registrations" className="flex items-center space-x-2 text-slate-600 hover:text-emerald-600 transition-all font-medium text-sm">
                    <Ticket className="w-4 h-4" />
                    <span>My Passes</span>
                  </Link>
                )}

                <Link to="/dashboard" className="flex items-center space-x-2 text-slate-600 hover:text-emerald-600 transition-all font-medium text-sm">
                  <LayoutDashboard className="w-4 h-4" />
                  <span>Dashboard</span>
                </Link>

                <div className="flex items-center space-x-5 border-l border-slate-200 pl-8 ml-2">
                  <div className="flex items-center space-x-3 group cursor-pointer">
                    <div className="w-10 h-10 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-center text-slate-600 group-hover:bg-slate-900 group-hover:text-white transition-all shadow-sm">
                      <User className="w-5 h-5" />
                    </div>
                    <div className="flex flex-col">
                      <span className="text-xs font-bold text-slate-900 leading-none">{user.name}</span>
                      <span className="text-[10px] text-slate-400 uppercase tracking-tighter mt-1">{user.role}</span>
                    </div>
                  </div>
                  <button 
                    onClick={handleLogout}
                    className="text-slate-300 hover:text-rose-500 transition-colors p-2 hover:bg-rose-50 rounded-lg"
                    title="Logout"
                  >
                    <LogOut className="w-5 h-5" />
                  </button>
                </div>
              </>
            ) : (
              <div className="flex items-center space-x-6">
                <Link to="/login" className="text-slate-600 hover:text-slate-900 font-bold text-sm uppercase tracking-wider">Login</Link>
                <Link to="/register" className="bg-emerald-600 text-white px-6 py-3 rounded-xl hover:bg-emerald-700 transition-all font-bold text-sm shadow-lg shadow-emerald-100">
                  Join Portal
                </Link>
              </div>
            )}
          </div>

          {/* Mobile Menu Button */}
          <div className="md:hidden flex items-center">
            <button 
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="text-gray-600 hover:text-indigo-600 p-2"
            >
              {isMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>

        {/* Mobile Menu Drawer */}
        {isMenuOpen && (
          <div className="md:hidden py-4 border-t space-y-4 pb-6">
            <Link 
              to="/" 
              onClick={() => setIsMenuOpen(false)}
              className="block text-gray-600 hover:text-indigo-600 font-medium px-2"
            >
              Events
            </Link>
            
            {user ? (
              <>
                <div className="pt-2 border-t mt-4">
                  <div className="flex items-center space-x-3 mb-4 px-2">
                    <div className="w-10 h-10 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-600">
                      <User className="w-6 h-6" />
                    </div>
                    <div className="flex flex-col">
                      <span className="font-bold text-gray-900 leading-none">{user.name}</span>
                      <span className="text-xs text-gray-500 capitalize mt-1">{user.role}</span>
                    </div>
                  </div>
                </div>

                <Link 
                  to="/dashboard" 
                  onClick={() => setIsMenuOpen(false)}
                  className="flex items-center space-x-2 text-gray-600 hover:text-indigo-600 font-medium px-2"
                >
                  <LayoutDashboard className="w-4 h-4" />
                  <span>Dashboard</span>
                </Link>

                {(user.role === 'organizer' || user.role === 'admin') && (
                  <>
                    <Link 
                      to="/create-event" 
                      onClick={() => setIsMenuOpen(false)}
                      className="flex items-center space-x-2 text-gray-600 hover:text-indigo-600 font-medium px-2"
                    >
                      <PlusCircle className="w-4 h-4" />
                      <span>Create Event</span>
                    </Link>
                    {user.role === 'organizer' && (
                      <Link 
                        to="/generate-report" 
                        onClick={() => setIsMenuOpen(false)}
                        className="flex items-center space-x-2 text-gray-600 hover:text-indigo-600 font-medium px-2"
                      >
                        <FileText className="w-4 h-4" />
                        <span>Report Generator</span>
                      </Link>
                    )}
                  </>
                )}

                {user.role === 'student' && (
                  <Link 
                    to="/my-registrations" 
                    onClick={() => setIsMenuOpen(false)}
                    className="flex items-center space-x-2 text-gray-600 hover:text-indigo-600 font-medium px-2"
                  >
                    <Ticket className="w-4 h-4" />
                    <span>My Passes</span>
                  </Link>
                )}

                {user.role === 'admin' && (
                  <Link 
                    to="/admin" 
                    onClick={() => setIsMenuOpen(false)}
                    className="flex items-center space-x-2 text-gray-600 hover:text-indigo-600 font-medium px-2"
                  >
                    <ShieldCheck className="w-4 h-4" />
                    <span>Admin Panel</span>
                  </Link>
                )}

                <button 
                  onClick={() => {
                    handleLogout();
                    setIsMenuOpen(false);
                  }}
                  className="flex items-center space-x-2 text-red-500 hover:text-red-700 font-medium px-2 pt-4 border-t w-full text-left"
                >
                  <LogOut className="w-4 h-4" />
                  <span>Logout</span>
                </button>
              </>
            ) : (
              <div className="flex flex-col space-y-3 pt-2 px-2">
                <Link 
                  to="/login" 
                  onClick={() => setIsMenuOpen(false)}
                  className="text-gray-600 hover:text-indigo-600 font-medium text-center py-2"
                >
                  Login
                </Link>
                <Link 
                  to="/register" 
                  onClick={() => setIsMenuOpen(false)}
                  className="bg-indigo-600 text-white px-4 py-3 rounded-xl hover:bg-indigo-700 transition-colors font-bold text-center"
                >
                  Register
                </Link>
              </div>
            )}
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
