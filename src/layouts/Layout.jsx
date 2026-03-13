import React, { useState, useEffect } from 'react';
import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom';
import { Home, PlusCircle, Map, User, LogOut, Menu, X } from 'lucide-react';
import { base44 } from '../api/base44Client';
import NotificationBell from '../components/NotificationBell';

const Layout = ({ children }) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [user, setUser] = useState(null);
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    const fetchUser = async () => {
      const me = await base44.auth.me();
      if (!me) {
        navigate('/');
      } else {
        setUser(me);
      }
    };
    fetchUser();
  }, [navigate]);

  const handleLogout = async () => {
    await base44.auth.logout();
    navigate('/');
  };

  const navItems = [
    { name: 'Dashboard', path: '/Home', icon: Home },
    { name: 'Report Issue', path: '/ReportIssue', icon: PlusCircle },
    { name: 'Issues Map', path: '/IssuesMap', icon: Map },
    { name: 'Profile', path: '/Profile', icon: User },
  ];

  if (!user) return null; // or loading spinner

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      {/* Top Navigation */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-30">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            
            {/* Logo */}
            <div className="flex items-center">
              <Link to="/Home" className="flex items-center space-x-2">
                <div className="w-8 h-8 bg-blue-600 text-white rounded-lg flex items-center justify-center font-bold text-xl leading-none">C</div>
                <span className="text-xl font-bold tracking-tight text-slate-900 hidden sm:block">CivicReport</span>
              </Link>
            </div>

            {/* Desktop Navigation */}
            <nav className="hidden md:flex items-center space-x-8">
              {navItems.map((item) => {
                const isActive = location.pathname.startsWith(item.path);
                return (
                  <Link
                    key={item.name}
                    to={item.path}
                    className={`flex items-center space-x-1.5 text-sm font-medium transition-colors ${
                      isActive ? 'text-blue-600' : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    <item.icon className="w-4 h-4" />
                    <span>{item.name}</span>
                  </Link>
                );
              })}
            </nav>

            {/* User Actions */}
            <div className="flex items-center space-x-4">
              <NotificationBell />
              
              <div className="hidden md:flex items-center space-x-3 border-l pl-4 border-slate-200">
                <span className="text-sm font-medium text-slate-700">{user.full_name || 'Citizen'}</span>
                <button 
                  onClick={handleLogout}
                  className="p-1.5 text-slate-500 hover:text-red-600 transition-colors tooltip"
                  title="Logout"
                >
                  <LogOut className="w-5 h-5" />
                </button>
              </div>

              {/* Mobile menu button */}
              <button
                className="md:hidden p-2 text-slate-600"
                onClick={() => setIsMenuOpen(!isMenuOpen)}
              >
                {isMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Mobile Navigation Menu */}
      {isMenuOpen && (
        <div className="md:hidden bg-white border-b border-slate-200 absolute w-full z-20 shadow-lg">
          <div className="px-4 pt-2 pb-4 space-y-1">
            {navItems.map((item) => (
              <Link
                key={item.name}
                to={item.path}
                onClick={() => setIsMenuOpen(false)}
                className={`flex items-center space-x-3 px-3 py-3 rounded-lg text-base font-medium ${
                  location.pathname === item.path 
                    ? 'bg-blue-50 text-blue-600' 
                    : 'text-slate-700 hover:bg-slate-50'
                }`}
              >
                <item.icon className="w-5 h-5" />
                <span>{item.name}</span>
              </Link>
            ))}
            <button
              onClick={() => { setIsMenuOpen(false); handleLogout(); }}
              className="w-full flex items-center space-x-3 px-3 py-3 rounded-lg text-base font-medium text-red-600 hover:bg-red-50"
            >
              <LogOut className="w-5 h-5" />
              <span>Log out</span>
            </button>
          </div>
        </div>
      )}

      {/* Main Content Area */}
      <main className="flex-1 w-full max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 h-full">
        {children || <Outlet />}
      </main>

    </div>
  );
};

export default Layout;
