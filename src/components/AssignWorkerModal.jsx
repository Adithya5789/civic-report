import React, { useState, useEffect } from 'react';
import './AssignWorkerModal.css';

const AssignWorkerModal = ({ issue, isOpen, onClose, onAssignSuccess }) => {
  const [workers, setWorkers] = useState([]);
  const [selectedWorker, setSelectedWorker] = useState(null);
  const [priority, setPriority] = useState(issue?.priority || 'medium');
  const [notes, setNotes] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (isOpen) {
      fetchWorkers();
    }
  }, [isOpen]);

  const fetchWorkers = async () => {
    try {
      const response = await fetch('/api/workers');
      const data = await response.json();
      setWorkers(data || []);
    } catch (err) {
      console.error('Error fetching workers:', err);
      setError('Failed to load workers');
    }
  };

  const handleAssign = async (e) => {
    e.preventDefault();
    if (!selectedWorker) {
      setError('Please select a worker');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const response = await fetch(`/api/issues/${issue.id}/assign`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          workerId: selectedWorker.id,
          workerEmail: selectedWorker.email,
          workerName: selectedWorker.full_name,
          priority,
          notes
        })
      });

      const data = await response.json();

      if (data.success) {
        if (onAssignSuccess) onAssignSuccess(data.data);
        onClose();
      } else {
        setError(data.error || 'Assignment failed');
      }
    } catch (err) {
      console.error('Assignment error:', err);
      setError('Failed to assign worker. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2 className="text-xl font-bold">Assign Field Worker</h2>
          <button className="close-btn" onClick={onClose}>×</button>
        </div>

        <div className="p-6">
          <div className="mb-4">
            <h3 className="font-semibold">{issue?.title}</h3>
            <p className="text-sm text-gray-500">📍 {issue?.location}</p>
          </div>

          <form onSubmit={handleAssign}>
            <div className="mb-4">
              <label className="block text-sm font-medium mb-1">Select Worker</label>
              <select
                className="w-full p-2 border rounded"
                value={selectedWorker?.id || ''}
                onChange={(e) => {
                  const worker = workers.find(w => w.id === e.target.value);
                  setSelectedWorker(worker);
                }}
                required
              >
                <option value="">-- Choose a worker --</option>
                {workers.map(worker => (
                  <option key={worker.id} value={worker.id}>
                    {worker.full_name} ({worker.department || 'Field'})
                  </option>
                ))}
              </select>
            </div>

            <div className="mb-4">
              <label className="block text-sm font-medium mb-1">Priority</label>
              <select
                className="w-full p-2 border rounded"
                value={priority}
                onChange={(e) => setPriority(e.target.value)}
              >
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
                <option value="urgent">Urgent</option>
              </select>
            </div>

            <div className="mb-4">
              <label className="block text-sm font-medium mb-1">Notes</label>
              <textarea
                className="w-full p-2 border rounded"
                rows="3"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
              />
            </div>

            {error && <div className="text-red-500 text-sm mb-4">{error}</div>}

            <div className="flex justify-end gap-2">
              <button type="button" className="px-4 py-2 border rounded" onClick={onClose}>Cancel</button>
              <button
                type="submit"
                className="px-4 py-2 bg-indigo-600 text-white rounded hover:bg-indigo-700 disabled:opacity-50"
                disabled={loading || !selectedWorker}
              >
                {loading ? 'Assigning...' : 'Assign & Notify'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default AssignWorkerModal;
