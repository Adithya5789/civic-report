import React, { useState, useEffect } from 'react';
import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom';
import { 
  LayoutDashboard, 
  ListTodo, 
  Users, 
  BarChart3, 
  Settings, 
  LogOut, 
  Menu, 
  X,
  Map,
  Database
} from 'lucide-react';
import { base44 } from '../api/base44Client';
import NotificationBell from '../components/NotificationBell';

const GovernmentLayout = ({ children }) => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [user, setUser] = useState(null);
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    const fetchUser = async () => {
      const me = await base44.auth.me();
      if (!me || !['admin', 'field_worker'].includes(me.role)) {
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

  if (!user) return null;

  const isAdmin = user.role === 'admin';

  const navItems = [
    { name: 'Dashboard', path: '/GovernmentDashboard', icon: LayoutDashboard },
    { name: 'Issues Viewer', path: '/IssueManagement', icon: ListTodo },
    { name: 'Issues Map', path: '/IssuesMap', icon: Map }
  ];

  if (isAdmin) {
    navItems.push(
      { name: 'Field Workers', path: '/FieldWorkerManagement', icon: Users },
      { name: 'Analytics', path: '/Analytics', icon: BarChart3 },
      { name: 'Database Inspector', path: '/DatabaseInspector', icon: Database },
      { name: 'Settings', path: '/Settings', icon: Settings }
    );
  }

  return (
    <div className="min-h-screen bg-slate-100 flex flex-col md:flex-row">
      
      {/* Mobile Header (visible only on md:hidden) */}
      <div className="md:hidden bg-[#0f172a] text-white flex justify-between items-center p-4 z-30">
        <div className="flex items-center space-x-2">
           <div className="w-8 h-8 bg-blue-500 rounded flex items-center justify-center font-bold">CR</div>
           <span className="font-semibold tracking-wide">GovPortal</span>
        </div>
        <div className="flex items-center space-x-3">
          <NotificationBell />
          <button onClick={() => setIsSidebarOpen(!isSidebarOpen)}>
            {isSidebarOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>

      {/* Sidebar Navigation */}
      <aside className={`
        fixed md:sticky top-0 h-screen w-64 bg-[#0f172a] text-slate-300 z-20
        transition-transform duration-300 ease-in-out shrink-0
        flex flex-col
        ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}
      `}>
        <div className="p-6 hidden md:flex items-center space-x-3 mb-2">
           <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center text-white font-bold text-xl">CR</div>
           <div>
             <h1 className="text-white font-bold text-lg leading-tight tracking-wide">CivicReport</h1>
             <p className="text-xs text-blue-400 font-medium tracking-wider uppercase">Admin Portal</p>
           </div>
        </div>

        <div className="px-6 py-4 border-b border-slate-700 md:hidden">
            <p className="text-sm font-medium text-white">{user.full_name}</p>
            <p className="text-xs text-slate-400 capitalize">{user.role.replace('_', ' ')}</p>
        </div>

        <nav className="flex-1 px-4 py-6 space-y-1 overflow-y-auto">
          {navItems.map((item) => {
            const isActive = location.pathname.startsWith(item.path);
            return (
              <Link
                key={item.name}
                to={item.path}
                onClick={() => setIsSidebarOpen(false)}
                className={`flex items-center space-x-3 px-3 py-2.5 rounded-lg font-medium transition-all ${
                  isActive 
                    ? 'bg-blue-600 text-white shadow-md' 
                    : 'hover:bg-slate-800 hover:text-white'
                }`}
              >
                <item.icon className={`w-5 h-5 ${isActive ? 'text-white' : 'text-slate-400'}`} />
                <span>{item.name}</span>
              </Link>
            );
          })}
        </nav>

        <div className="p-4 border-t border-slate-700/50">
          <div className="hidden md:flex items-center mb-4 px-2">
            <div className="w-8 h-8 rounded-full bg-slate-700 flex items-center justify-center text-white text-sm font-bold mr-3">
              {user.full_name?.charAt(0) || 'U'}
            </div>
            <div className="overflow-hidden">
              <p className="text-sm font-medium text-white truncate">{user.full_name}</p>
              <p className="text-xs text-slate-400 capitalize">{user.role.replace('_', ' ')}</p>
            </div>
          </div>
          <button 
            onClick={handleLogout}
            className="flex items-center space-x-3 px-3 py-2.5 rounded-lg w-full text-left font-medium text-slate-300 hover:bg-slate-800 hover:text-red-400 transition-colors"
          >
            <LogOut className="w-5 h-5 text-slate-400" />
            <span>Sign out</span>
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 w-full min-h-screen bg-slate-100 p-4 sm:p-6 lg:p-8">
         {/* Desktop Top Bar (Notification and quick actions) */}
         <div className="hidden md:flex justify-end mb-6">
            <div className="bg-white rounded-full shadow-sm px-4 py-2 flex items-center space-x-4 border border-slate-200">
               <NotificationBell />
            </div>
         </div>
         {children || <Outlet />}
      </main>

      {/* Overlay for mobile sidebar */}
      {isSidebarOpen && (
        <div 
          className="fixed inset-0 bg-slate-900/50 z-10 md:hidden backdrop-blur-sm"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}
    </div>
  );
};

export default GovernmentLayout;
