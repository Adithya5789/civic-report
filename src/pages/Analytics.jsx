import React, { useState, useEffect } from 'react';
import { getDashboardStats, exportIssuesToCSV } from '../api/analytics';
import { DownloadCloud, BarChart2, TrendingUp, PieChart as PieChartIcon } from 'lucide-react';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
  LineChart, Line, PieChart, Pie, Cell
} from 'recharts';

const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#64748b'];

const Analytics = () => {
   const [data, setData] = useState(null);
   const [loading, setLoading] = useState(true);

   useEffect(() => {
     const init = async () => {
         try {
            const res = await getDashboardStats();
            setData(res);
         } catch (e) {
            console.error(e);
         } finally {
            setLoading(false);
         }
     };
     init();
   }, []);

   const handleExport = () => {
       if(data && data.issues) {
           exportIssuesToCSV(data.issues);
       }
   }

   if (loading) return <div className="flex justify-center py-20"><div className="animate-spin w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full"></div></div>;

   const { stats } = data;

   return (
       <div className="space-y-6 max-w-7xl mx-auto">
           <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4 border-b border-slate-200 pb-6">
                <div>
                   <h1 className="text-3xl font-bold text-slate-900 tracking-tight flex items-center">
                       <BarChart2 className="w-8 h-8 mr-3 text-blue-600" /> Analytics Hub
                   </h1>
                   <p className="text-slate-500 mt-1">Deep dive into issue resolution metrics and trends.</p>
                </div>
                <button 
                   onClick={handleExport}
                   className="bg-emerald-50 text-emerald-700 border border-emerald-200 px-4 py-2.5 rounded-lg font-medium hover:bg-emerald-100 transition flex items-center shadow-sm"
                >
                    <DownloadCloud className="w-5 h-5 mr-2" />
                    Export Complete CSV
                </button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Trend Chart */}
                <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
                    <h3 className="text-lg font-bold text-slate-900 mb-6 flex items-center"><TrendingUp className="w-5 h-5 mr-2 text-blue-500" /> 30-Day Resolution Trend</h3>
                    <div className="h-80">
                        <ResponsiveContainer width="100%" height="100%">
                            <LineChart data={stats.trend_30d} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                                <XAxis dataKey="date" axisLine={false} tickLine={false} tick={{fill: '#64748b', fontSize: 12}} dy={10} />
                                <YAxis axisLine={false} tickLine={false} tick={{fill: '#64748b', fontSize: 12}} />
                                <Tooltip 
                                    contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                                />
                                <Legend wrapperStyle={{ paddingTop: '20px' }} />
                                <Line type="monotone" dataKey="reported" name="Reported" stroke="#f59e0b" strokeWidth={3} dot={false} activeDot={{ r: 6 }} />
                                <Line type="monotone" dataKey="resolved" name="Resolved" stroke="#10b981" strokeWidth={3} dot={false} activeDot={{ r: 6 }} />
                            </LineChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* Category Bar Chart */}
                <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
                    <h3 className="text-lg font-bold text-slate-900 mb-6 flex items-center"><BarChart2 className="w-5 h-5 mr-2 text-indigo-500" /> Issues by Category</h3>
                    <div className="h-80">
                         <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={stats.by_category} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#64748b', fontSize: 11}} dy={10} width={100} />
                                <YAxis axisLine={false} tickLine={false} tick={{fill: '#64748b', fontSize: 12}} />
                                <Tooltip
                                    cursor={{fill: '#f8fafc'}}
                                    contentStyle={{ borderRadius: '8px', border: '1px solid #e2e8f0', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                                />
                                <Bar dataKey="value" name="Volume" fill="#3b82f6" radius={[4, 4, 0, 0]} barSize={40} />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </div>
                
                {/* Priority Breakdown (Pie) */}
                <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
                    <h3 className="text-lg font-bold text-slate-900 mb-6 flex items-center"><PieChartIcon className="w-5 h-5 mr-2 text-amber-500" /> Priority Distribution</h3>
                    <div className="h-72 flex items-center justify-center">
                         <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                                <Pie
                                    data={stats.by_priority}
                                    cx="50%"
                                    cy="50%"
                                    innerRadius={70}
                                    outerRadius={100}
                                    paddingAngle={3}
                                    dataKey="value"
                                    nameKey="name"
                                    label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                                    labelLine={false}
                                >
                                    {stats.by_priority.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={
                                            entry.name === 'critical' ? '#ef4444' : 
                                            entry.name === 'high' ? '#f97316' : 
                                            entry.name === 'medium' ? '#3b82f6' : '#94a3b8'
                                        } />
                                    ))}
                                </Pie>
                                <Tooltip contentStyle={{ borderRadius: '8px', border: '1px solid #e2e8f0' }} />
                            </PieChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* KPI Summary Block */}
                <div className="bg-gradient-to-br from-slate-900 to-slate-800 p-8 rounded-xl border border-slate-700 shadow-lg text-white flex flex-col justify-center">
                    <h3 className="text-xl font-bold mb-8 text-slate-200">High-Level Impact</h3>
                    
                    <div className="space-y-8">
                        <div>
                            <p className="text-sm font-semibold text-slate-400 uppercase tracking-widest mb-1">Total Issues Processed</p>
                            <p className="text-5xl font-bold tracking-tight">{stats.total}</p>
                        </div>
                        
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <p className="text-sm font-semibold text-slate-400 uppercase tracking-widest mb-1">Global SLR%</p>
                                <p className="text-4xl font-bold text-emerald-400 tracking-tight">{stats.resolution_rate}%</p>
                            </div>
                            <div>
                                <p className="text-sm font-semibold text-slate-400 uppercase tracking-widest mb-1">Avg Turnaround</p>
                                <p className="text-4xl font-bold text-amber-400 tracking-tight">{stats.avg_resolution_days}d</p>
                            </div>
                        </div>
                    </div>
                </div>

            </div>
       </div>
   );
};

export default Analytics;
