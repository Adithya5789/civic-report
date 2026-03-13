import React, { useState } from 'react';
import { Settings as SettingsIcon, Save, Key, Bell, Shield } from 'lucide-react';

const Settings = () => {
    const [settings, setSettings] = useState({
        general: {
          city_name: "Metropolis City",
          portal_name: "CivicReport",
          admin_email: "admin@civicreport.gov",
          auto_assign: false,
          auto_prioritize: true
        },
        notifications: {
          email_new_issue: true,
          email_status_update: true,
          email_assignment: true,
          sms_critical_only: false
        },
        sla: {
          critical_hours: 24,
          high_hours: 72,
          medium_hours: 168,
          low_hours: 336
        }
    });

    const [isSaving, setIsSaving] = useState(false);

    const handleSave = (e) => {
        e.preventDefault();
        setIsSaving(true);
        // Simulate API save
        setTimeout(() => {
            setIsSaving(false);
            alert("System settings updated successfully.");
        }, 800);
    }

    return (
        <div className="max-w-4xl mx-auto space-y-6 animate-in fade-in">
             <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4 mb-2">
                <div>
                   <h1 className="text-3xl font-bold text-slate-900 tracking-tight">System Settings</h1>
                   <p className="text-slate-500 mt-1">Configure global application parameters and defaults.</p>
                </div>
                <button 
                  onClick={handleSave}
                  disabled={isSaving}
                  className="bg-slate-900 hover:bg-slate-800 text-white font-medium py-2.5 px-6 rounded-lg transition-colors flex items-center shadow-sm"
                >
                   <Save className="w-4 h-4 mr-2" />
                   {isSaving ? 'Saving...' : 'Save All Changes'}
                </button>
             </div>

             <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                 {/* Lateral Navigation (mock presentation) */}
                 <div className="md:col-span-1 space-y-1">
                     <button className="w-full text-left px-4 py-3 bg-blue-50 text-blue-700 font-semibold rounded-lg border border-blue-100 flex items-center">
                        <SettingsIcon className="w-4 h-4 mr-2" /> General
                     </button>
                     <button className="w-full text-left px-4 py-3 bg-transparent text-slate-600 font-medium hover:bg-slate-100 rounded-lg flex items-center transition">
                        <Bell className="w-4 h-4 mr-2" /> Notifications
                     </button>
                     <button className="w-full text-left px-4 py-3 bg-transparent text-slate-600 font-medium hover:bg-slate-100 rounded-lg flex items-center transition">
                        <Shield className="w-4 h-4 mr-2" /> Workflow & SLA
                     </button>
                     <button className="w-full text-left px-4 py-3 bg-transparent text-slate-600 font-medium hover:bg-slate-100 rounded-lg flex items-center transition">
                        <Key className="w-4 h-4 mr-2" /> Access Tokens
                     </button>
                 </div>

                 {/* Main Settings Form */}
                 <div className="md:col-span-3 space-y-6">
                     <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
                         <h3 className="text-lg font-bold text-slate-900 mb-6 border-b border-slate-100 pb-4">General Configuration</h3>
                         
                         <div className="space-y-5">
                             <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                                 <div>
                                     <label className="block text-sm font-medium text-slate-700 mb-1">City/Municipality Name</label>
                                     <input 
                                         type="text" 
                                         value={settings.general.city_name}
                                         onChange={e => setSettings({...settings, general: {...settings.general, city_name: e.target.value}})}
                                         className="w-full p-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none block" 
                                     />
                                 </div>
                                 <div>
                                     <label className="block text-sm font-medium text-slate-700 mb-1">Portal Application Name</label>
                                     <input 
                                         type="text" 
                                         value={settings.general.portal_name}
                                         onChange={e => setSettings({...settings, general: {...settings.general, portal_name: e.target.value}})}
                                         className="w-full p-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none block" 
                                     />
                                 </div>
                             </div>

                             <div>
                                 <label className="block text-sm font-medium text-slate-700 mb-1">System Admin Email Address</label>
                                 <input 
                                     type="email" 
                                     value={settings.general.admin_email}
                                     onChange={e => setSettings({...settings, general: {...settings.general, admin_email: e.target.value}})}
                                     className="w-full p-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none block bg-slate-50 text-slate-500" 
                                     disabled
                                 />
                                 <p className="text-xs text-slate-500 mt-1">Global recipient for new critical issue alerts.</p>
                             </div>

                             <div className="pt-4 border-t border-slate-100 space-y-4">
                                 <label className="flex items-center cursor-pointer">
                                     <input 
                                         type="checkbox" 
                                         checked={settings.general.auto_prioritize}
                                         onChange={e => setSettings({...settings, general: {...settings.general, auto_prioritize: e.target.checked}})}
                                         className="w-5 h-5 text-blue-600 rounded border-slate-300 focus:ring-blue-500" 
                                     />
                                     <span className="ml-3 text-sm font-medium text-slate-700">Enable AI Keyword Priority Inference</span>
                                 </label>
                                 
                                 <label className="flex items-center cursor-pointer">
                                     <input 
                                         type="checkbox" 
                                         checked={settings.general.auto_assign}
                                         onChange={e => setSettings({...settings, general: {...settings.general, auto_assign: e.target.checked}})}
                                         className="w-5 h-5 text-blue-600 rounded border-slate-300 focus:ring-blue-500" 
                                     />
                                     <span className="ml-3 text-sm font-medium text-slate-700">Auto-assign issues to available Field Workers by Department</span>
                                 </label>
                             </div>
                         </div>
                     </div>

                     <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
                         <h3 className="text-lg font-bold text-slate-900 mb-6 border-b border-slate-100 pb-4">Service Level Agreements (Hours)</h3>
                         <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                             <div>
                                <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wide mb-1">Critical</label>
                                <div className="flex bg-slate-50 rounded border border-slate-300 overflow-hidden focus-within:ring-2 focus-within:ring-blue-500 focus-within:border-blue-500">
                                  <input type="number" className="w-full p-2 bg-transparent outline-none text-red-600 font-bold" value={settings.sla.critical_hours} onChange={e => setSettings({...settings, sla: {...settings.sla, critical_hours: Number(e.target.value)}})} />
                                  <span className="bg-slate-200 text-slate-600 px-3 py-2 text-sm font-medium border-l border-slate-300">hrs</span>
                                </div>
                             </div>
                             <div>
                                <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wide mb-1">High</label>
                                <div className="flex bg-slate-50 rounded border border-slate-300 overflow-hidden focus-within:ring-2 focus-within:ring-blue-500 focus-within:border-blue-500">
                                  <input type="number" className="w-full p-2 bg-transparent outline-none text-orange-600 font-bold" value={settings.sla.high_hours} onChange={e => setSettings({...settings, sla: {...settings.sla, high_hours: Number(e.target.value)}})} />
                                  <span className="bg-slate-200 text-slate-600 px-3 py-2 text-sm font-medium border-l border-slate-300">hrs</span>
                                </div>
                             </div>
                             <div>
                                <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wide mb-1">Medium</label>
                                <div className="flex bg-slate-50 rounded border border-slate-300 overflow-hidden focus-within:ring-2 focus-within:ring-blue-500 focus-within:border-blue-500">
                                  <input type="number" className="w-full p-2 bg-transparent outline-none text-blue-600 font-bold" value={settings.sla.medium_hours} onChange={e => setSettings({...settings, sla: {...settings.sla, medium_hours: Number(e.target.value)}})} />
                                  <span className="bg-slate-200 text-slate-600 px-3 py-2 text-sm font-medium border-l border-slate-300">hrs</span>
                                </div>
                             </div>
                             <div>
                                <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wide mb-1">Low</label>
                                <div className="flex bg-slate-50 rounded border border-slate-300 overflow-hidden focus-within:ring-2 focus-within:ring-blue-500 focus-within:border-blue-500">
                                  <input type="number" className="w-full p-2 bg-transparent outline-none text-slate-600 font-bold" value={settings.sla.low_hours} onChange={e => setSettings({...settings, sla: {...settings.sla, low_hours: Number(e.target.value)}})} />
                                  <span className="bg-slate-200 text-slate-600 px-3 py-2 text-sm font-medium border-l border-slate-300">hrs</span>
                                </div>
                             </div>
                         </div>
                     </div>
                 </div>
             </div>
        </div>
    );
};

export default Settings;
