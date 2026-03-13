import React, { useState, useEffect } from 'react';
import { listIssues } from '../api/issues';
import { getFieldWorkers } from '../api/users';
import { Link } from 'react-router-dom';
import { Search, Filter, AlertCircle, FileSpreadsheet } from 'lucide-react';
import StatusBadge from '../components/StatusBadge';
import PriorityBadge from '../components/PriorityBadge';
import CategoryIcon from '../components/CategoryIcon';

const IssueManagement = () => {
  const [issues, setIssues] = useState([]);
  const [workers, setWorkers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  
  const [filters, setFilters] = useState({
      status: '',
      priority: '',
      assigned_to: ''
  });

  useEffect(() => {
    const init = async () => {
        try {
            const rawIssues = await listIssues();
            setIssues(rawIssues);
            
            const wks = await getFieldWorkers();
            setWorkers(wks);
        } catch (e) {
            console.error(e);
        } finally {
            setLoading(false);
        }
    };
    init();
  }, []);

  const sortedAndFilteredIssues = issues.filter(issue => {
      if (filters.status && issue.status !== filters.status) return false;
      if (filters.priority && issue.priority !== filters.priority) return false;
      if (filters.assigned_to && issue.assigned_to !== filters.assigned_to) return false;
      
      if (searchTerm) {
          const lower = searchTerm.toLowerCase();
          return (
              issue.title.toLowerCase().includes(lower) || 
              issue.location.toLowerCase().includes(lower) ||
              issue.id.includes(lower)
          );
      }
      return true;
  });

  if (loading) return <div className="flex justify-center py-20"><div className="animate-spin w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full"></div></div>;

  return (
    <div className="space-y-6">
        <div className="flex flex-col md:flex-row justify-between md:items-center gap-4">
            <div>
               <h1 className="text-3xl font-bold text-slate-900 tracking-tight">Issue Viewer</h1>
               <p className="text-slate-500 mt-1">Review, assign, and track all reported civic issues.</p>
            </div>
            {/* Download CSV placeholder for UX, actual implementation in analytics */}
            <Link to="/Analytics" className="inline-flex items-center px-4 py-2 bg-white border border-slate-300 rounded-lg text-sm font-medium text-slate-700 hover:bg-slate-50 shadow-sm transition">
                <FileSpreadsheet className="w-4 h-4 mr-2 text-emerald-600" />
                Go to Export
            </Link>
        </div>

        {/* Filters Top Bar */}
        <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-200 flex flex-col lg:flex-row gap-4">
            <div className="relative flex-1">
                <Search className="w-5 h-5 absolute left-3 top-2.5 text-slate-400" />
                <input 
                   type="text" 
                   value={searchTerm}
                   onChange={e => setSearchTerm(e.target.value)}
                   placeholder="Search ID, title, or location..." 
                   className="w-full pl-10 pr-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                />
            </div>
            
            <div className="flex gap-2 w-full lg:w-auto overflow-x-auto pb-2 lg:pb-0">
                <select 
                    value={filters.status} 
                    onChange={e => setFilters({...filters, status: e.target.value})}
                    className="p-2 border border-slate-300 rounded-lg bg-white text-sm focus:ring-2 focus:ring-blue-500 pr-8 min-w-[130px]"
                >
                    <option value="">All Statuses</option>
                    <option value="pending">Pending</option>
                    <option value="in_progress">In Progress</option>
                    <option value="resolved">Resolved</option>
                    <option value="rejected">Rejected</option>
                </select>
                
                <select 
                    value={filters.priority} 
                    onChange={e => setFilters({...filters, priority: e.target.value})}
                    className="p-2 border border-slate-300 rounded-lg bg-white text-sm focus:ring-2 focus:ring-blue-500 pr-8 min-w-[130px]"
                >
                    <option value="">All Priorities</option>
                    <option value="low">Low</option>
                    <option value="medium">Medium</option>
                    <option value="high">High</option>
                    <option value="critical">Critical</option>
                </select>

                <select 
                    value={filters.assigned_to} 
                    onChange={e => setFilters({...filters, assigned_to: e.target.value})}
                    className="p-2 border border-slate-300 rounded-lg bg-white text-sm focus:ring-2 focus:ring-blue-500 pr-8 min-w-[140px]"
                >
                    <option value="">All Workers</option>
                    <option value="unassigned">-- Unassigned --</option>
                    {workers.map(w => (
                        <option key={w.id} value={w.id}>{w.full_name}</option>
                    ))}
                </select>
            </div>
        </div>

        {/* Data Table */}
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
            <div className="overflow-x-auto min-h-[400px]">
                <table className="w-full text-sm text-left whitespace-nowrap">
                    <thead className="text-xs text-slate-500 uppercase bg-slate-50 border-b border-slate-200">
                        <tr>
                            <th className="px-6 py-4">ID</th>
                            <th className="px-6 py-4">Title & Category</th>
                            <th className="px-6 py-4">Status & Priority</th>
                            <th className="px-6 py-4">Location</th>
                            <th className="px-6 py-4">Reported Date</th>
                            <th className="px-6 py-4">Assigned To</th>
                            <th className="px-6 py-4 text-right">Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {sortedAndFilteredIssues.length === 0 ? (
                            <tr>
                                <td colSpan="7" className="px-6 py-12 text-center text-slate-500">
                                    <div className="flex flex-col items-center justify-center">
                                        <Filter className="w-10 h-10 text-slate-300 mb-2" />
                                        <p className="text-base font-medium">No results found.</p>
                                        <p className="text-sm">Try adjusting your filters or search terms.</p>
                                    </div>
                                </td>
                            </tr>
                        ) : (
                            sortedAndFilteredIssues.map(issue => {
                                const worker = workers.find(w => w.id === issue.assigned_to);
                                return (
                                <tr key={issue.id} className="border-b border-slate-100 hover:bg-slate-50/80 transition-colors">
                                    <td className="px-6 py-4 text-xs font-mono text-slate-500">
                                        {issue.id.substring(0,8)}...
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="flex items-center space-x-3">
                                            <div className="bg-slate-100 p-2 rounded shrink-0">
                                                <CategoryIcon category={issue.category} className="w-4 h-4 text-slate-600" />
                                            </div>
                                            <div>
                                                <p className="font-semibold text-slate-900 max-w-[200px] truncate" title={issue.title}>{issue.title}</p>
                                                <p className="text-xs text-slate-500 uppercase tracking-wide">{issue.category.replace(/_/g, ' ')}</p>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 space-y-2">
                                        <div><StatusBadge status={issue.status} /></div>
                                        <div><PriorityBadge priority={issue.priority} /></div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <p className="text-slate-700 max-w-[150px] truncate" title={issue.location}>{issue.location}</p>
                                    </td>
                                    <td className="px-6 py-4 text-slate-600">
                                        {new Date(issue.created_at).toLocaleDateString()}
                                    </td>
                                    <td className="px-6 py-4">
                                        {worker ? (
                                            <span className="inline-flex items-center px-2 py-1 bg-indigo-50 text-indigo-700 text-xs font-medium rounded border border-indigo-100">
                                                {worker.full_name}
                                            </span>
                                        ) : (
                                            <span className="text-xs text-slate-400 italic flex items-center">
                                                <AlertCircle className="w-3 h-3 mr-1" /> Unassigned
                                            </span>
                                        )}
                                    </td>
                                    <td className="px-6 py-4 text-right">
                                        <Link 
                                            to={`/IssueDetails?id=${issue.id}`}
                                            className="text-blue-600 hover:text-blue-800 font-medium bg-blue-50 hover:bg-blue-100 px-3 py-1.5 rounded transition"
                                        >
                                            Review
                                        </Link>
                                    </td>
                                </tr>
                            )})
                        )}
                    </tbody>
                </table>
            </div>
            
            <div className="px-6 py-4 border-t border-slate-200 bg-slate-50 text-sm text-slate-500">
                Showing {sortedAndFilteredIssues.length} of {issues.length} total issues.
            </div>
        </div>

    </div>
  );
};

export default IssueManagement;
