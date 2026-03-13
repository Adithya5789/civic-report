import React, { useState, useEffect } from 'react';
import { User, Phone, Mail, Award, CheckCircle2, Clock } from 'lucide-react';
import { base44 } from '../api/base44Client';
import { updateUserProfile, getOrCreateUserProfile } from '../api/users';
import { listIssues } from '../api/issues';
import IssueCard from '../components/IssueCard';

const Profile = () => {
  const [user, setUser] = useState(null);
  const [issues, setIssues] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  
  const [formData, setFormData] = useState({
    full_name: '',
    phone: '',
  });

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const u = await getOrCreateUserProfile();
        setUser(u);
        setFormData({
            full_name: u.full_name || '',
            phone: u.phone || ''
        });
        
        const myIssues = await listIssues({ reported_by: u.id });
        setIssues(myIssues);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchProfile();
  }, []);

  const handleSave = async () => {
    setIsSaving(true);
    try {
      const updated = await updateUserProfile(user.id, formData);
      setUser(updated);
      setIsEditing(false);
    } catch (err) {
      console.error(err);
      alert('Failed to update profile');
    } finally {
      setIsSaving(false);
    }
  };

  if (loading) return <div className="flex justify-center py-20"><div className="animate-spin w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full"></div></div>;

  const resolvedCount = issues.filter(i => i.status === 'resolved').length;

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <h1 className="text-3xl font-bold text-slate-900 mb-6">My Profile</h1>
      
      <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
        <div className="bg-gradient-to-r from-blue-600 to-indigo-700 h-32"></div>
        <div className="px-6 sm:px-10 pb-10 relative">
          
          <div className="flex justify-between items-end -mt-12 mb-6">
             <div className="w-24 h-24 bg-white rounded-full p-1 shadow-md">
                 <div className="w-full h-full bg-slate-100 rounded-full flex flex-col items-center justify-center text-blue-600 border-2 border-slate-100">
                     <User className="w-10 h-10 mb-0.5" />
                 </div>
             </div>
             {!isEditing ? (
               <button 
                 onClick={() => setIsEditing(true)}
                 className="bg-white border text-sm font-medium border-slate-200 text-slate-700 hover:bg-slate-50 px-4 py-2 rounded-lg transition"
               >
                 Edit Profile
               </button>
             ) : (
               <div className="space-x-2">
                 <button 
                   onClick={() => setIsEditing(false)}
                   className="text-sm font-medium text-slate-500 hover:text-slate-700 px-4 py-2 transition"
                 >
                   Cancel
                 </button>
                 <button 
                   onClick={handleSave}
                   disabled={isSaving}
                   className="bg-blue-600 text-white text-sm font-medium px-4 py-2 rounded-lg hover:bg-blue-700 transition"
                 >
                   {isSaving ? 'Saving...' : 'Save Changes'}
                 </button>
               </div>
             )}
          </div>

          <div className="space-y-6 max-w-2xl">
              <div>
                 <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider block mb-1">Full Name</label>
                 {isEditing ? (
                   <input 
                     type="text" 
                     value={formData.full_name}
                     onChange={(e) => setFormData({...formData, full_name: e.target.value})}
                     className="w-full p-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none" 
                   />
                 ) : (
                   <p className="text-xl font-bold text-slate-900">{user.full_name || 'Not provided'}</p>
                 )}
              </div>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div>
                   <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider block mb-1">Email Address</label>
                   <div className="flex items-center text-slate-700">
                      <Mail className="w-4 h-4 mr-2 text-slate-400" />
                      <span>{user.email}</span>
                   </div>
                </div>
                
                <div>
                   <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider block mb-1">Phone Number</label>
                   {isEditing ? (
                     <div className="relative">
                       <Phone className="w-4 h-4 absolute left-3 top-3.5 text-slate-400" />
                       <input 
                         type="tel" 
                         value={formData.phone}
                         onChange={(e) => setFormData({...formData, phone: e.target.value})}
                         className="w-full pl-9 p-2.5 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none" 
                         placeholder="e.g. 555-0123"
                       />
                     </div>
                   ) : (
                     <div className="flex items-center text-slate-700">
                        <Phone className="w-4 h-4 mr-2 text-slate-400" />
                        <span>{user.phone || 'Not provided'}</span>
                     </div>
                   )}
                </div>
              </div>

              <div>
                  <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider block mb-1">Account Role</label>
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-slate-100 text-slate-800 capitalize border border-slate-200">
                    {user.role.replace('_', ' ')}
                  </span>
              </div>
          </div>
        </div>
      </div>

      {user.role === 'citizen' && (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
             <div className="bg-white p-5 rounded-xl border border-emerald-100 shadow-sm flex items-center bg-gradient-to-br from-emerald-50 to-white">
                <div className="p-3 bg-white rounded-full text-emerald-500 shadow-sm mr-4 border border-emerald-100">
                   <Award className="w-6 h-6" />
                </div>
                <div>
                  <h4 className="font-semibold text-emerald-900 leading-tight">Civic Contributor</h4>
                  <p className="text-sm text-emerald-700 mt-1">You have helped resolve {resolvedCount} issues in the city.</p>
                </div>
             </div>
             
             <div className="bg-white p-5 rounded-xl border border-slate-100 shadow-sm flex items-center hover:bg-slate-50 transition cursor-pointer">
               <div className="w-full">
                  <h4 className="font-semibold text-slate-900 mb-2 border-b pb-2">Notification Preferences</h4>
                  <div className="flex items-center justify-between mt-3 text-sm">
                    <span className="text-slate-600">Email Updates for my Reports</span>
                    <div className="w-10 h-5 bg-blue-500 rounded-full relative cursor-pointer">
                       <div className="w-4 h-4 bg-white rounded-full absolute top-0.5 right-0.5 shadow-sm"></div>
                    </div>
                  </div>
               </div>
             </div>
          </div>

          <div>
             <h2 className="text-xl font-bold text-slate-900 mb-4 flex items-center">
                 <Clock className="w-5 h-5 mr-2" /> Recent Activity
             </h2>
             {issues.length === 0 ? (
                <div className="text-center py-8 bg-white rounded-xl border border-dashed border-slate-300">
                   <p className="text-slate-500">No issues reported yet.</p>
                </div>
             ) : (
                <div className="space-y-3">
                   {issues.slice(0, 5).map(issue => (
                       <IssueCard key={issue.id} issue={issue} />
                   ))}
                </div>
             )}
          </div>
        </>
      )}

    </div>
  );
};

export default Profile;
