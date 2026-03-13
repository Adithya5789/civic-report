import React, { useState, useEffect } from 'react';
import { getFieldWorkers, createFieldWorker, getFieldWorkerStats } from '../api/users';
import { UserPlus, Briefcase, Activity, CheckCircle, Clock } from 'lucide-react';

const FieldWorkerManagement = () => {
    const [workers, setWorkers] = useState([]);
    const [stats, setStats] = useState({});
    const [loading, setLoading] = useState(true);
    const [isAdding, setIsAdding] = useState(false);
    
    const [formData, setFormData] = useState({
        full_name: '',
        email: '',
        phone: '',
        department: 'General'
    });

    const loadData = async () => {
        try {
            const data = await getFieldWorkers();
            setWorkers(data);

            const statsMap = {};
            for (const worker of data) {
                statsMap[worker.id] = await getFieldWorkerStats(worker.id);
            }
            setStats(statsMap);
        } catch (e) {
            console.error(e);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadData();
    }, []);

    const handleAdd = async (e) => {
        e.preventDefault();
        if (!formData.email || !formData.full_name) return alert("Name and Email required");
        
        try {
            await createFieldWorker(formData);
            setFormData({ full_name: '', email: '', phone: '', department: 'General' });
            setIsAdding(false);
            loadData();
        } catch (err) {
            console.error(err);
            alert("Failed to add worker");
        }
    };

    if (loading) return <div className="flex justify-center py-20"><div className="animate-spin w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full"></div></div>;

    return (
        <div className="space-y-6 max-w-6xl mx-auto">
            <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4">
                <div>
                   <h1 className="text-3xl font-bold text-slate-900 tracking-tight">Field Workers</h1>
                   <p className="text-slate-500 mt-1">Manage personnel and monitor their resolution performance.</p>
                </div>
                <button 
                   onClick={() => setIsAdding(!isAdding)}
                   className="bg-blue-600 text-white px-4 py-2.5 rounded-lg font-medium hover:bg-blue-700 transition flex items-center justify-center shadow-sm"
                >
                    <UserPlus className="w-5 h-5 mr-2" />
                    {isAdding ? 'Cancel Adding' : 'Add New Worker'}
                </button>
            </div>

            {isAdding && (
                <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm animate-in fade-in slide-in-from-top-4">
                    <h2 className="text-lg font-bold text-slate-900 mb-4 border-b border-slate-100 pb-2">Create Worker Account</h2>
                    <form onSubmit={handleAdd} className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1">Full Name *</label>
                            <input 
                               type="text" required
                               value={formData.full_name} onChange={e => setFormData({...formData, full_name: e.target.value})}
                               className="w-full p-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1">Email Address *</label>
                            <input 
                               type="email" required
                               value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})}
                               className="w-full p-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1">Phone Number</label>
                            <input 
                               type="tel" 
                               value={formData.phone} onChange={e => setFormData({...formData, phone: e.target.value})}
                               className="w-full p-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1">Department / Team</label>
                            <select 
                               value={formData.department} onChange={e => setFormData({...formData, department: e.target.value})}
                               className="w-full p-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none bg-white"
                            >
                                <option value="General">General</option>
                                <option value="Roads & Infrastructure">Roads & Infrastructure</option>
                                <option value="Sanitation">Sanitation</option>
                                <option value="Utilities">Utilities</option>
                            </select>
                        </div>
                        <div className="md:col-span-2 pt-2 flex justify-end">
                            <button type="submit" className="bg-slate-900 text-white px-6 py-2.5 rounded-lg font-medium hover:bg-slate-800 transition">
                                Create Account & Send Invite
                            </button>
                        </div>
                    </form>
                </div>
            )}

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {workers.map(worker => {
                    const ws = stats[worker.id] || { total_assigned: 0, resolved: 0, in_progress: 0, pending: 0, resolution_rate: 0, avg_resolution_days: 0 };
                    return (
                        <div key={worker.id} className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden hover:shadow-md transition">
                            <div className="p-6 border-b border-slate-100 flex items-start justify-between">
                                <div className="flex items-center space-x-4">
                                    <div className="w-14 h-14 bg-indigo-100 text-indigo-700 rounded-full flex items-center justify-center font-bold text-xl border-2 border-white shadow-sm ring-1 ring-slate-100">
                                        {worker.full_name.charAt(0).toUpperCase()}
                                    </div>
                                    <div>
                                        <h3 className="font-bold text-lg text-slate-900">{worker.full_name}</h3>
                                        <div className="flex items-center text-sm text-slate-500 space-x-3 mt-1">
                                            <span className="flex items-center"><Briefcase className="w-3.5 h-3.5 mr-1"/> {worker.department || 'General'}</span>
                                        </div>
                                    </div>
                                </div>
                                <span className="text-xs bg-slate-100 text-slate-600 px-2.5 py-1 rounded-full border font-medium">
                                    ID: {worker.id.substring(0,6)}
                                </span>
                            </div>
                            
                            <div className="bg-slate-50 p-6 grid grid-cols-2 sm:grid-cols-4 gap-4 divide-x divide-slate-200 text-center">
                                <div>
                                    <p className="text-xs font-semibold text-slate-500 uppercase flex items-center justify-center mb-1"><Activity className="w-3.5 h-3.5 mr-1 text-blue-500" /> Active</p>
                                    <p className="text-xl font-bold text-slate-900">{ws.in_progress + ws.pending}</p>
                                </div>
                                <div className="pl-4">
                                    <p className="text-xs font-semibold text-slate-500 uppercase flex items-center justify-center mb-1"><CheckCircle className="w-3.5 h-3.5 mr-1 text-emerald-500" /> Resolved</p>
                                    <p className="text-xl font-bold text-slate-900">{ws.resolved}</p>
                                </div>
                                <div className="pl-4">
                                    <p className="text-xs font-semibold text-slate-500 uppercase mb-1">Win Rate</p>
                                    <p className="text-xl font-bold text-slate-900">{ws.resolution_rate}%</p>
                                </div>
                                <div className="pl-4">
                                    <p className="text-xs font-semibold text-slate-500 uppercase flex items-center justify-center mb-1"><Clock className="w-3.5 h-3.5 mr-1 text-amber-500" /> Avg. Time</p>
                                    <p className="text-xl font-bold text-slate-900">{ws.avg_resolution_days}d</p>
                                </div>
                            </div>
                        </div>
                    );
                })}

                {workers.length === 0 && (
                     <div className="md:col-span-2 text-center py-16 bg-white border border-dashed border-slate-300 rounded-xl">
                         <Briefcase className="w-12 h-12 text-slate-300 mx-auto mb-3" />
                         <p className="text-lg font-medium text-slate-900">No field workers found.</p>
                         <p className="text-slate-500">Add personnel to start assigning issues.</p>
                     </div>
                )}
            </div>
        </div>
    );
};

export default FieldWorkerManagement;
