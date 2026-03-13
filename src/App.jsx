import { BrowserRouter, Routes, Route, Navigate, useLocation, useNavigate } from 'react-router-dom';
import React, { useState, useEffect } from 'react';

// Layouts
import Layout from './layouts/Layout';
import GovernmentLayout from './layouts/GovernmentLayout';

// Logic
import { base44 } from './api/base44Client';

// Pages - Public/Citizen
import Home from './pages/Home';
import ReportIssue from './pages/ReportIssue';
import IssueDetails from './pages/IssueDetails';
import IssuesMap from './pages/IssuesMap';
import Profile from './pages/Profile';

// Pages - Admin/Worker
import AdminDashboard from './pages/GovernmentDashboard';
import DatabaseInspector from './pages/DatabaseInspector';
import IssueManagement from './pages/IssueManagement';
import FieldWorkerManagement from './pages/FieldWorkerManagement';
import Analytics from './pages/Analytics';
import Settings from './pages/Settings';

// Mock Login Components
const CitizenLogin = ({ onLogin }) => {
  const [email, setEmail] = useState('');
  return (
    <div className="min-h-screen bg-white flex flex-col justify-center items-center p-4">
      <div className="w-full max-w-md bg-white p-8 rounded-2xl shadow-xl border border-slate-100">
        <div className="w-16 h-16 bg-blue-600 rounded-2xl flex items-center justify-center text-white font-bold text-3xl mx-auto mb-6 shadow-lg">C</div>
        <h1 className="text-2xl font-bold text-center text-slate-900 mb-2">Citizen Portal</h1>
        <p className="text-center text-slate-500 mb-8">Login to report and track civic issues</p>
        <form onSubmit={e => { e.preventDefault(); onLogin(email); }}>
          <label className="block text-sm font-medium text-slate-700 mb-1">Email Address</label>
          <input 
            type="email" required placeholder="name@example.com"
            className="w-full p-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none mb-6 text-lg"
            onChange={e => setEmail(e.target.value)}
          />
          <button type="submit" className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-4 rounded-xl shadow-md transition-colors text-lg">
            Login as Citizen
          </button>
        </form>
      </div>
    </div>
  );
};

const AdminLogin = ({ onLogin }) => {
  const [email, setEmail] = useState('');
  return (
    <div className="min-h-screen bg-[#0f172a] flex flex-col justify-center items-center p-4">
      <div className="w-full max-w-md bg-slate-800 p-8 rounded-2xl shadow-2xl border border-slate-700">
        <div className="w-16 h-16 bg-blue-500 rounded-2xl flex items-center justify-center text-white font-bold text-3xl mx-auto mb-6 shadow-lg">A</div>
        <h1 className="text-2xl font-bold text-center text-white mb-2">Admin Portal</h1>
        <p className="text-center text-slate-400 mb-8">Role-based Access Control</p>
        <form onSubmit={e => { e.preventDefault(); onLogin(email); }}>
          <label className="block text-sm font-medium text-slate-300 mb-1">Admin Email</label>
          <input 
            type="email" required placeholder="admin@gmail.com"
            className="w-full p-3 bg-slate-900 border border-slate-700 text-white rounded-xl focus:ring-2 focus:ring-blue-500 outline-none mb-6 text-lg"
            onChange={e => setEmail(e.target.value)}
          />
          <button type="submit" className="w-full bg-blue-500 hover:bg-blue-600 text-white font-bold py-3 px-4 rounded-xl shadow-md transition-colors text-lg">
            Admin Login
          </button>
        </form>
      </div>
    </div>
  );
};

// Role-based redirect for root and other entry points
const RootRedirect = () => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkUser = async () => {
      const me = await base44.auth.me();
      setUser(me);
      setLoading(false);
    };
    checkUser();
  }, []);

  if (loading) return null;
  if (!user) return <Navigate to="/login" replace />;
  
  return user.role === 'admin' || user.role === 'field_worker' 
    ? <Navigate to="/GovernmentDashboard" replace /> 
    : <Navigate to="/Home" replace />;
};

// Route Protection
const AuthGuard = ({ children, type }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const location = useLocation();

  useEffect(() => {
    const checkAuth = async () => {
      const me = await base44.auth.me();
      setUser(me);
      setLoading(false);
    };
    checkAuth();
  }, []);

  if (loading) return null;

  if (!user) {
    return <Navigate to={location.pathname.startsWith('/admin') ? '/login/admin' : '/login'} state={{ from: location }} replace />;
  }

  // Admin access check for Govt routes
  if (type === 'admin' && !['admin', 'field_worker'].includes(user.role)) {
    return <Navigate to="/Home" replace />;
  }

  // Citizen access check for Citizen routes - Admin should NOT see "Report Issue" or citizen dashboard
  if (type === 'citizen' && (user.role === 'admin' || user.role === 'field_worker')) {
     return <Navigate to="/GovernmentDashboard" replace />;
  }

  return children;
};

const LoginSelection = () => {
  const navigate = useNavigate();
  return (
    <div className="min-h-screen bg-slate-50 flex flex-col justify-center items-center p-4">
      <div className="w-full max-w-4xl grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Citizen Card */}
        <div 
          onClick={() => navigate('/login/citizen')}
          className="bg-white p-8 rounded-3xl shadow-xl border border-slate-100 cursor-pointer hover:shadow-2xl transition-all hover:scale-[1.02] group"
        >
          <div className="w-20 h-20 bg-blue-600 rounded-2xl flex items-center justify-center text-white font-bold text-4xl mb-6 shadow-lg group-hover:rotate-3 transition-transform">C</div>
          <h2 className="text-3xl font-bold text-slate-900 mb-4">Citizen Portal</h2>
          <p className="text-slate-500 text-lg mb-8">Report potholes, garbage, or street light issues and track their progress in real-time.</p>
          <div className="inline-flex items-center text-blue-600 font-bold text-lg">
            Start Reporting <span className="ml-2 group-hover:translate-x-1 transition-transform">→</span>
          </div>
        </div>

        {/* Admin Card */}
        <div 
          onClick={() => navigate('/login/admin')}
          className="bg-slate-900 p-8 rounded-3xl shadow-xl border border-slate-800 cursor-pointer hover:shadow-2xl transition-all hover:scale-[1.02] group"
        >
          <div className="w-20 h-20 bg-emerald-500 rounded-2xl flex items-center justify-center text-white font-bold text-4xl mb-6 shadow-lg group-hover:-rotate-3 transition-transform">A</div>
          <h2 className="text-3xl font-bold text-white mb-4">Admin Portal</h2>
          <p className="text-slate-400 text-lg mb-8">Access for city administrators and field workers to manage and resolve reports.</p>
          <div className="inline-flex items-center text-emerald-400 font-bold text-lg">
            Admin Login <span className="ml-2 group-hover:translate-x-1 transition-transform">→</span>
          </div>
        </div>
      </div>
      <p className="mt-12 text-slate-400 font-medium">CivicReport v2.0 • Transforming City Governance</p>
    </div>
  );
};

function App() {
  const [loading, setLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    const checkAuth = async () => {
      const user = await base44.auth.me();
      setIsAuthenticated(!!user);
      setLoading(false);
    };
    checkAuth();
  }, []);

  const handleLogin = async (email) => {
    setLoading(true);
    try {
      await base44.auth.login(email, 'password123');
      setIsAuthenticated(true);
    } catch (err) {
      console.error('Login failed:', err);
      alert(`Login failed: ${err.message || 'Please check your connection and try again.'}`);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center bg-slate-50"><div className="w-10 h-10 border-4 border-blue-600 border-t-transparent animate-spin rounded-full"></div></div>;
  }

  return (
    <BrowserRouter>
      <Routes>
        {/* Public Login Routes */}
        <Route path="/login" element={isAuthenticated ? <Navigate to="/" replace /> : <LoginSelection />} />
        <Route path="/login/citizen" element={isAuthenticated ? <Navigate to="/Home" replace /> : <CitizenLogin onLogin={handleLogin} />} />
        <Route path="/login/admin" element={isAuthenticated ? <Navigate to="/GovernmentDashboard" replace /> : <AdminLogin onLogin={handleLogin} />} />

        {/* Redirect Root based on authentication and role */}
        <Route path="/" element={<RootRedirect />} />

        {/* Citizen Routes - Protected from Admins */}
        <Route element={<AuthGuard type="citizen"><Layout /></AuthGuard>}>
          <Route path="/Home" element={<Home />} />
          <Route path="/ReportIssue" element={<ReportIssue />} />
          <Route path="/Profile" element={<Profile />} />
        </Route>

        {/* Shared Routes that admins and citizens can both see */}
        <Route path="/IssueDetails" element={
           isAuthenticated ? (
             ['admin', 'field_worker'].includes(JSON.parse(localStorage.getItem('base44_currentUser'))?.role)
             ? <AuthGuard type="admin"><GovernmentLayout><IssueDetails /></GovernmentLayout></AuthGuard>
             : <AuthGuard type="citizen"><Layout><IssueDetails /></Layout></AuthGuard>
           ) : <Navigate to="/login" />
        } />

        <Route path="/IssuesMap" element={
           isAuthenticated ? (
             ['admin', 'field_worker'].includes(JSON.parse(localStorage.getItem('base44_currentUser'))?.role)
             ? <AuthGuard type="admin"><GovernmentLayout><IssuesMap /></GovernmentLayout></AuthGuard>
             : <AuthGuard type="citizen"><Layout><IssuesMap /></Layout></AuthGuard>
           ) : <Navigate to="/login" />
        } />

        {/* Admin Routes - Protected from Citizens */}
        <Route element={<AuthGuard type="admin"><GovernmentLayout /></AuthGuard>}>
          <Route path="/GovernmentDashboard" element={<AdminDashboard />} />
          <Route path="/IssueManagement" element={<IssueManagement />} />
          <Route path="/DatabaseInspector" element={<DatabaseInspector />} />
          <Route path="/FieldWorkerManagement" element={<FieldWorkerManagement />} />
          <Route path="/Analytics" element={<Analytics />} />
          <Route path="/Settings" element={<Settings />} />
        </Route>

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
