import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { PlusCircle, FileText, CheckCircle2, Clock } from 'lucide-react';
import { base44 } from '../api/base44Client';
import { listIssues } from '../api/issues';
import { getOrCreateUserProfile } from '../api/users';
import StatsCard from '../components/StatsCard';
import IssueCard from '../components/IssueCard';

const Home = () => {
  const [user, setUser] = useState(null);
  const [issues, setIssues] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');

  useEffect(() => {
    const fetchData = async () => {
      try {
        const userProfile = await getOrCreateUserProfile();
        setUser(userProfile);
        
        const myIssues = await listIssues({ reported_by: userProfile.id });
        setIssues(myIssues);
      } catch (err) {
        console.error("Failed to load user data", err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const stats = {
    total: issues.length,
    resolved: issues.filter(i => i.status === 'resolved').length,
    inProgress: issues.filter(i => i.status === 'in_progress').length,
  };

  const filteredIssues = filter === 'all' 
    ? issues 
    : issues.filter(i => i.status === filter);

  if (loading) return <div className="flex justify-center py-20"><div className="animate-spin w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full"></div></div>;

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      
      {/* Greeting & CTA */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-gradient-to-r from-blue-600 to-indigo-700 rounded-2xl p-8 text-white shadow-lg">
        <div>
          <h1 className="text-3xl font-bold mb-2">Hello, {user?.full_name?.split(' ')[0] || 'Citizen'}! 👋</h1>
          <p className="text-blue-100 max-w-lg text-lg">Help us keep the city beautiful and safe. Report an issue in your neighborhood today.</p>
        </div>
        <Link 
          to="/ReportIssue" 
          className="bg-white text-blue-700 hover:bg-blue-50 transition-colors font-semibold px-6 py-3 rounded-lg flex items-center justify-center space-x-2 shadow-sm"
        >
          <PlusCircle className="w-5 h-5" />
          <span>Report New Issue</span>
        </Link>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <StatsCard title="My Reports" value={stats.total} icon={FileText} color="primary" />
        <StatsCard title="In Progress" value={stats.inProgress} icon={Clock} color="warning" />
        <StatsCard title="Resolved" value={stats.resolved} icon={CheckCircle2} color="success" />
      </div>

      {/* Issues List */}
      <div>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
          <h2 className="text-2xl font-bold text-slate-900">Recent Reports</h2>
          <div className="flex bg-white rounded-lg p-1 border border-slate-200 shadow-sm max-w-full overflow-x-auto">
            {['all', 'pending', 'in_progress', 'resolved'].map((f) => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                className={`px-4 py-1.5 rounded-md text-sm font-medium transition-colors capitalize whitespace-nowrap ${
                  filter === f 
                    ? 'bg-blue-100 text-blue-700' 
                    : 'text-slate-600 hover:bg-slate-50'
                }`}
              >
                {f.replace('_', ' ')}
              </button>
            ))}
          </div>
        </div>

        {filteredIssues.length === 0 ? (
          <div className="bg-white border border-dashed border-slate-300 rounded-xl p-12 text-center">
            <div className="w-16 h-16 bg-slate-100 text-slate-400 rounded-full flex items-center justify-center mx-auto mb-4">
              <FileText className="w-8 h-8" />
            </div>
            <h3 className="text-lg font-semibold text-slate-900 mb-2">No reports found</h3>
            <p className="text-slate-500 max-w-sm mx-auto">
              {filter === 'all' 
                ? "You haven't reported any issues yet. Click the 'Report New Issue' button to get started."
                : `You don't have any issues with status '${filter.replace('_', ' ')}'.`}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {filteredIssues.map(issue => (
              <IssueCard key={issue.id} issue={issue} />
            ))}
          </div>
        )}
      </div>

    </div>
  );
};

export default Home;
