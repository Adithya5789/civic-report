import React, { useState } from 'react';
import { X, UserPlus, Loader2 } from 'lucide-react';

const AssignWorkerModal = ({ isOpen, onClose, issueId, workers }) => {
    const [selectedWorkerId, setSelectedWorkerId] = useState('');
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState('');

    if (!isOpen) return null;

    const handleAssign = async () => {
          if (!selectedWorkerId) return;
          setLoading(true);
          try {
                  const resp = await fetch(`/api/issues/${issueId}/assign`, {
                            method: 'POST',
                            headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify({ workerId: selectedWorkerId }),
                  });
                  if (resp.ok) {
                            setMessage('Successfully assigned!');
                            setTimeout(() => { onClose(); setMessage(''); }, 1500);
                  } else {
                            setMessage('Failed to assign.');
                  }
          } catch (error) {
                  setMessage('Error assigning worker.');
          } finally {
                  setLoading(false);
          }
    };

    return (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
                <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md border border-slate-200">
                        <div className="p-4 border-b border-slate-100 flex justify-between items-center bg-slate-50">
                                  <h2 className="text-lg font-bold text-slate-800 flex items-center">
                                              <UserPlus className="w-5 h-4 mr-2 text-blue-600" />Assign Field Worker
                                  </h2>h2>
                                  <button onClick={onClose} className="p-1 hover:bg-slate-200 rounded-full transition-colors">
                                              <X className="w-5 h-5 text-slate-500" />
                                  </button>button>
                        </div>div>
                        <div className="p-6 space-y-4">
                                  <p className="text-sm text-slate-600">Select a worker for issue <span className="font-mono bg-slate-100 px-1 rounded">{issueId?.substring(0, 8)}</span>span>.</p>p>
                                  <select className="w-full p-3 border border-slate-300 rounded-xl outline-none focus:ring-2 focus:ring-blue-500" value={selectedWorkerId} onChange={(e) => setSelectedWorkerId(e.target.value)}>
                                              <option value="">Choose a worker...</option>option>
                                    {workers?.map(w => <option key={w.id} value={w.id}>{w.full_name}</option>option>)}
                                  </select>select>
                          {message && <div className={`p-3 rounded-lg text-sm ${message.includes('Success') ? 'bg-emerald-50 text-emerald-700' : 'bg-red-50 text-red-700'}`}>{message}</div>div>}
                                  <div className="pt-2 flex gap-3">
                                              <button onClick={onClose} className="flex-1 px-4 py-2.5 border border-slate-300 rounded-xl hover:bg-slate-50">Cancel</button>button>
                                              <button onClick={handleAssign} disabled={!selectedWorkerId || loading} className="flex-1 px-4 py-2.5 bg-blue-600 text-white rounded-xl hover:bg-blue-700 disabled:opacity-50 flex items-center justify-center">
                                                {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Assign Now'}</button>button>
                                  </div>div>
                        </div>div>
                </div>div>
          </div>div>
        );
};

export default AssignWorkerModal;
</div>
