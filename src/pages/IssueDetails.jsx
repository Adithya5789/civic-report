import React, { useState, useEffect } from 'react';
import { useSearchParams, Link, useNavigate } from 'react-router-dom';
import { MapPin, Calendar, User as UserIcon, MessageSquare, ArrowLeft, Save, Briefcase } from 'lucide-react';
import { base44 } from '../api/base44Client';
import { updateIssue } from '../api/issues';
import StatusBadge from '../components/StatusBadge';
import PriorityBadge from '../components/PriorityBadge';
import CategoryIcon from '../components/CategoryIcon';

const IssueDetails = () => {
  const [searchParams] = useSearchParams();
  const id = searchParams.get('id');
  const navigate = useNavigate();
  
  const [issue, setIssue] = useState(null);
  const [comments, setComments] = useState([]);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  
  const [newComment, setNewComment] = useState('');
  const [isUpdatingStatus, setIsUpdatingStatus] = useState(false);
  const [adminNotes, setAdminNotes] = useState('');
  
  const [workers, setWorkers] = useState([]);
  const [selectedWorker, setSelectedWorker] = useState('');

  useEffect(() => {
    const fetchData = async () => {
      try {
        const me = await base44.auth.me();
        setUser(me);
        
        // Fetch Issue Details
        const { data: issues } = await base44.tables.issues.list({
          filters: [{ column: 'id', operator: 'eq', value: id }]
        });
        
        if (issues.length === 0) {
          navigate('/Home');
          return;
        }
        
        const currentIssue = issues[0];
        setIssue(currentIssue);
        setAdminNotes(currentIssue.admin_notes || '');
        setSelectedWorker(currentIssue.assigned_to || '');

        // Fetch Comments
        const { data: dbComments } = await base44.tables.issue_comments.list({
          filters: [{ column: 'issue_id', operator: 'eq', value: id }],
          sort: [{ column: 'created_at', direction: 'asc' }]
        });
        setComments(dbComments);

        // Fetch workers if Admin
        if (me?.role === 'admin') {
           const { data: fw } = await base44.tables.users.list({
             filters: [{ column: 'role', operator: 'eq', value: 'field_worker' }]
           });
           setWorkers(fw);
        }
        
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    if (id) fetchData();
  }, [id, navigate]);

  const handleAddComment = async (e) => {
    e.preventDefault();
    if (!newComment.trim()) return;
    
    try {
      const commentData = {
        issue_id: id,
        user_id: user.id,
        user_name: user.full_name || user.email,
        user_role: user.role,
        content: newComment.trim(),
        created_at: new Date().toISOString()
      };
      
      const saved = await base44.tables.issue_comments.create(commentData);
      setComments([...comments, saved]);
      setNewComment('');
    } catch (err) {
      console.error(err);
      alert('Failed to post comment');
    }
  };

  const handleStatusUpdate = async (newStatus) => {
    setIsUpdatingStatus(true);
    try {
      const updated = await updateIssue(id, { status: newStatus });
      setIssue(updated);
    } catch (err) {
      console.error(err);
      alert('Failed to update status');
    } finally {
      setIsUpdatingStatus(false);
    }
  };

  const handleAdminUpdate = async () => {
    setIsUpdatingStatus(true);
    try {
      const updates = { admin_notes: adminNotes };
      if (selectedWorker !== issue.assigned_to) {
         updates.assigned_to = selectedWorker;
      }
      const updated = await updateIssue(id, updates);
      setIssue(updated);
      alert('Issue updated successfully');
    } catch (err) {
      console.error(err);
      alert('Update failed');
    } finally {
      setIsUpdatingStatus(false);
    }
  };

  if (loading) return <div className="flex justify-center py-20"><div className="animate-spin w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full"></div></div>;
  if (!issue) return null;

  const isAdmin = user?.role === 'admin';
  const isAssignedWorker = user?.role === 'field_worker' && issue.assigned_to === user?.id;
  const isOwner = user?.id === issue.reported_by;

  const assignedWorkerName = workers.find(w => w.id === issue.assigned_to)?.full_name || issue.assigned_to;

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      
      {/* Header Back Button */}
      <button 
        onClick={() => navigate(-1)} 
        className="flex items-center text-sm font-medium text-slate-500 hover:text-slate-800 transition-colors mb-2"
      >
        <ArrowLeft className="w-4 h-4 mr-1" />
        Back to List
      </button>

      {/* Main Issue Card */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
        {issue.photo_url && (
            <img 
               src={issue.photo_url} 
               alt="Issue Evidence" 
               className="w-full h-64 object-cover"
            />
        )}
        
        <div className="p-6 md:p-8">
          <div className="flex flex-col md:flex-row md:items-start justify-between gap-4 mb-6">
            <div>
              <div className="flex items-center space-x-3 mb-2">
                <CategoryIcon category={issue.category} className="text-slate-500" />
                <span className="text-sm font-semibold text-slate-500 uppercase tracking-wider">{issue.category.replace(/_/g, ' ')}</span>
              </div>
              <h1 className="text-3xl font-bold text-slate-900 mb-2">{issue.title}</h1>
              <div className="flex flex-wrap items-center gap-4 text-sm text-slate-600">
                <span className="flex items-center"><MapPin className="w-4 h-4 mr-1"/> {issue.location}</span>
                <span className="flex items-center"><Calendar className="w-4 h-4 mr-1"/> {new Date(issue.created_at).toLocaleDateString()}</span>
                <span className="flex items-center"><UserIcon className="w-4 h-4 mr-1"/> By {issue.reporter_name || 'Anonymous'}</span>
                {isAdmin && issue.reporter_phone && (
                  <span className="flex items-center bg-blue-50 text-blue-700 px-2 py-0.5 rounded-full text-xs font-semibold">
                    📞 {issue.reporter_phone}
                  </span>
                )}
              </div>
            </div>
            
            <div className="flex flex-col items-end space-y-3">
              <StatusBadge status={issue.status} />
              <div className="flex items-center space-x-2 text-sm">
                <span className="text-slate-500">Priority:</span>
                <PriorityBadge priority={issue.priority} />
              </div>
            </div>
          </div>

          <div className="prose prose-slate max-w-none mb-8">
            <h3 className="text-lg font-semibold text-slate-900 mb-2">Description</h3>
            <p className="text-slate-700 leading-relaxed whitespace-pre-wrap">{issue.description}</p>
          </div>

          {/* Action Buttons for Worker */}
          {isAssignedWorker && issue.status !== 'resolved' && (
            <div className="bg-blue-50 border border-blue-100 rounded-xl p-4 flex items-center justify-between mb-8 mt-6">
              <div>
                <h4 className="font-semibold text-blue-900">Worker Actions</h4>
                <p className="text-sm text-blue-700">Update the progress on this issue.</p>
              </div>
              <div className="flex space-x-3">
                {issue.status === 'pending' && (
                  <button onClick={() => handleStatusUpdate('in_progress')} disabled={isUpdatingStatus} className="bg-white border border-blue-200 text-blue-700 font-medium px-4 py-2 rounded-lg hover:bg-blue-100 transition">
                    Mark In Progress
                  </button>
                )}
                {issue.status === 'in_progress' && (
                  <button onClick={() => handleStatusUpdate('resolved')} disabled={isUpdatingStatus} className="bg-emerald-600 text-white font-medium px-4 py-2 rounded-lg hover:bg-emerald-700 transition">
                    Mark Resolved
                  </button>
                )}
              </div>
            </div>
          )}

          {/* Admin Controls Area */}
          {isAdmin && (
            <div className="bg-slate-50 border border-slate-200 rounded-xl p-5 mb-8">
              <h3 className="text-lg font-semibold text-slate-900 mb-4 flex items-center"><Briefcase className="w-5 h-5 mr-2"/> Admin Controls</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Status</label>
                  <select 
                    value={issue.status} 
                    onChange={(e) => handleStatusUpdate(e.target.value)}
                    disabled={isUpdatingStatus}
                    className="w-full p-2.5 bg-white border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  >
                    <option value="pending">Pending</option>
                    <option value="in_progress">In Progress</option>
                    <option value="resolved">Resolved</option>
                    <option value="rejected">Rejected</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Assign Field Worker</label>
                  <select 
                    value={selectedWorker} 
                    onChange={(e) => setSelectedWorker(e.target.value)}
                    className="w-full p-2.5 bg-white border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  >
                    <option value="">-- Unassigned --</option>
                    {workers.map(w => (
                      <option key={w.id} value={w.id}>{w.full_name} ({w.department || 'General'})</option>
                    ))}
                  </select>
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-slate-700 mb-1">Internal Admin Notes</label>
                  <textarea 
                    value={adminNotes}
                    onChange={(e) => setAdminNotes(e.target.value)}
                    placeholder="Notes visible only to admins and workers..."
                    className="w-full p-3 bg-white border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none h-24 resize-y"
                  />
                </div>

                <div className="md:col-span-2 flex justify-end">
                  <button onClick={handleAdminUpdate} disabled={isUpdatingStatus} className="bg-slate-900 hover:bg-slate-800 text-white px-5 py-2.5 rounded-lg font-medium flex items-center transition-colors">
                    <Save className="w-4 h-4 mr-2" />
                    Save Admin Updates
                  </button>
                </div>
                
              </div>
            </div>
          )}

          {/* Issue Assignments Info for Citizen */}
          {!isAdmin && issue.assigned_to && (
             <div className="bg-slate-50 rounded-lg p-4 border border-slate-100 flex items-center mb-8">
               <Briefcase className="text-slate-400 w-5 h-5 mr-3" />
               <p className="text-sm text-slate-700">This issue has been assigned to a field worker and is currently being monitored.</p>
             </div>
          )}

        </div>
      </div>

      {/* Comments Section */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-100 bg-slate-50">
          <h3 className="font-semibold text-slate-900 flex items-center">
            <MessageSquare className="w-5 h-5 mr-2 text-slate-500" />
            Discussion & Updates ({comments.length})
          </h3>
        </div>
        
        <div className="p-6">
          <div className="space-y-6 mb-8">
            {comments.length === 0 ? (
              <p className="text-center text-slate-500 text-sm py-4">No comments yet. Be the first to add an update!</p>
            ) : (
              comments.map((comment) => (
                <div key={comment.id} className="flex space-x-4">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm shrink-0 ${
                    comment.user_role === 'admin' ? 'bg-indigo-100 text-indigo-700' :
                    comment.user_role === 'field_worker' ? 'bg-amber-100 text-amber-700' :
                    'bg-slate-100 text-slate-700'
                  }`}>
                    {comment.user_name.charAt(0).toUpperCase()}
                  </div>
                  <div className="flex-1 bg-slate-50 rounded-2xl rounded-tl-none p-4">
                    <div className="flex items-baseline justify-between mb-1">
                      <div className="flex items-center space-x-2">
                        <span className="font-semibold text-slate-900 text-sm">{comment.user_name}</span>
                        {comment.user_role !== 'citizen' && (
                          <span className={`text-[10px] px-2 py-0.5 rounded-full font-medium ${
                            comment.user_role === 'admin' ? 'bg-indigo-600 text-white' : 'bg-amber-500 text-white'
                          }`}>
                            {comment.user_role.replace('_', ' ').toUpperCase()}
                          </span>
                        )}
                      </div>
                      <span className="text-xs text-slate-400">
                        {new Date(comment.created_at).toLocaleString()}
                      </span>
                    </div>
                    <p className="text-sm text-slate-700 whitespace-pre-wrap">{comment.content}</p>
                  </div>
                </div>
              ))
            )}
          </div>

          <form onSubmit={handleAddComment} className="flex space-x-4 items-start border-t border-slate-100 pt-6">
            <div className="w-10 h-10 bg-slate-100 text-slate-700 rounded-full flex items-center justify-center font-bold text-sm shrink-0">
              {user.full_name?.charAt(0).toUpperCase() || 'U'}
            </div>
            <div className="flex-1">
              <textarea
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                placeholder="Add a comment or status update..."
                className="w-full p-3 bg-white border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:outline-none resize-y min-h-[100px] text-sm"
              />
              <div className="mt-2 flex justify-end">
                <button 
                  type="submit" 
                  disabled={!newComment.trim()}
                  className="bg-blue-600 hover:bg-blue-700 disabled:bg-blue-300 text-white px-5 py-2 rounded-lg font-medium text-sm transition-colors"
                >
                  Post Comment
                </button>
              </div>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default IssueDetails;
