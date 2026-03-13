import React, { useState, useEffect } from 'react';
import { getDashboardStats } from '../api/analytics';
import StatsCard from '../components/StatsCard';
import { AlertCircle, CheckCircle2, Clock, XCircle, Users } from 'lucide-react';
import { Link } from 'react-router-dom';

const GovernmentDashboard = () => {
   const [dashboardData, setDashboardData] = useState(null);
   const [loading, setLoading] = useState(true);

   useEffect(() => {
     const init = async () => {
         try {
            const data = await getDashboardStats();
            setDashboardData(data);
         } catch (e) {
            console.error(e);
         } finally {
            setLoading(false);
         }
     };
     init();
   }, []);

   if (loading) return <div className="flex justify-center py-20"><div className="animate-spin w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full"></div></div>;

   const { stats, issues } = dashboardData;
   const recentIssues = issues.slice(0, 5);

   return (
       <div className="max-w-7xl mx-auto space-y-6 animate-in fade-in">
           <div className="flex justify-between items-center mb-8">
               <div>
                  <h1 className="text-3xl font-bold text-slate-900 tracking-tight">Admin Dashboard</h1>
                  <p className="text-slate-500 mt-1 text-lg">Overview of city civic issues and resolution metrics.</p>
               </div>
               <Link to="/IssueManagement" className="bg-slate-900 text-white px-4 py-2 rounded-lg font-medium hover:bg-slate-800 transition">
                   Manage All Issues
               </Link>
           </div>

           <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <StatsCard title="Total Reported" value={stats.total} icon={AlertCircle} color="primary" />
              <StatsCard title="Pending Review" value={stats.pending} icon={Clock} color="warning" />
              <StatsCard title="In Progress" value={stats.in_progress} icon={Users} color="primary" />
              <StatsCard title="Resolved" value={stats.resolved} icon={CheckCircle2} color="success" />
           </div>

           <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              
              <div className="lg:col-span-2 bg-white rounded-xl shadow-sm border border-slate-200 p-6 overflow-hidden">
                 <div className="flex justify-between items-center mb-4">
                     <h2 className="text-lg font-bold text-slate-900">Recent Critical Issues</h2>
                 </div>
                 <div className="overflow-x-auto">
                    <table className="w-full text-sm text-left">
                       <thead className="text-xs text-slate-500 uppercase bg-slate-50">
                           <tr>
                               <th className="px-4 py-3 rounded-tl-lg rounded-bl-lg">Title & Location</th>
                               <th className="px-4 py-3">Status</th>
                               <th className="px-4 py-3">Reported</th>
                               <th className="px-4 py-3 rounded-tr-lg rounded-br-lg text-right">Action</th>
                           </tr>
                       </thead>
                       <tbody>
                           {recentIssues.length === 0 ? (
                               <tr><td colSpan="4" className="text-center py-10 text-slate-500">No issues found.</td></tr>
                           ) : (
                               recentIssues.map(issue => (
                               <tr key={issue.id} className="border-b last:border-0 border-slate-100 hover:bg-slate-50 transition">
                                   <td className="px-4 py-4">
                                      <p className="font-semibold text-slate-900 truncate max-w-[250px]">{issue.title}</p>
                                      <p className="text-xs text-slate-500 truncate max-w-[250px]">{issue.location}</p>
                                   </td>
                                   <td className="px-4 py-3">
                                       <span className={`inline-block px-2 py-1 text-[10px] font-bold uppercase rounded-full status-${issue.status}`}>
                                           {issue.status.replace('_', ' ')}
                                       </span>
                                   </td>
                                   <td className="px-4 py-3 text-slate-600">
                                       {new Date(issue.created_at).toLocaleDateString()}
                                   </td>
                                   <td className="px-4 py-3 text-right">
                                       <Link to={`/IssueDetails?id=${issue.id}`} className="text-blue-600 font-medium hover:underline">Review</Link>
                                   </td>
                               </tr>
                               ))
                           )}
                       </tbody>
                    </table>
                 </div>
              </div>

              <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
                 <h2 className="text-lg font-bold text-slate-900 mb-6 border-b pb-4">Performance KPI</h2>
                 
                 <div className="space-y-6">
                    <div>
                       <div className="flex justify-between text-sm mb-1">
                          <span className="font-medium text-slate-700">Resolution Rate</span>
                          <span className="font-bold text-emerald-600">{stats.resolution_rate}%</span>
                       </div>
                       <div className="w-full bg-slate-100 rounded-full h-2">
                           <div className="bg-emerald-500 h-2 rounded-full" style={{ width: `${stats.resolution_rate}%` }}></div>
                       </div>
                    </div>

                    <div>
                        <div className="flex justify-between items-end mb-2">
                            <div>
                                <p className="text-sm font-medium text-slate-500">Avg. Resolution Time</p>
                                <p className="text-2xl font-bold text-slate-900 mt-1">{stats.avg_resolution_days} <span className="text-lg text-slate-500 font-normal">days</span></p>
                            </div>
                            <div className="h-10 w-10 bg-indigo-50 text-indigo-600 rounded-full flex items-center justify-center">
                                <Clock className="w-5 h-5"/>
                            </div>
                        </div>
                    </div>

                    <div className="pt-4 border-t border-slate-100">
                        <p className="text-sm font-medium text-slate-500 uppercase tracking-wider mb-3">Critical Pending</p>
                        <div className="flex items-center text-red-600 bg-red-50 p-3 rounded-lg border border-red-100">
                            <AlertCircle className="w-6 h-6 mr-3 shrink-0" />
                            <span className="font-bold text-2xl leading-none">{stats.critical}</span>
                            <span className="ml-2 text-sm text-red-800 font-medium">unresolved critical issues</span>
                        </div>
                    </div>

                 </div>
              </div>

           </div>
       </div>
   );
};

export default GovernmentDashboard;
