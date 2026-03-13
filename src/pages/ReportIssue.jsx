import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { MapPin, Navigation, Map, AlertCircle, Camera, TextCursorInput } from 'lucide-react';
import { base44 } from '../api/base44Client';
import { createIssue } from '../api/issues';
import PhotoUpload from '../components/PhotoUpload';

const categories = [
  { id: 'pothole', label: 'Pothole' },
  { id: 'garbage_dumping', label: 'Garbage Dumping' },
  { id: 'water_leakage', label: 'Water Leakage' },
  { id: 'street_light_failure', label: 'Street Light Failure' },
  { id: 'road_damage', label: 'Road Damage' },
  { id: 'drainage_problem', label: 'Drainage Problem' },
  { id: 'other', label: 'Other/General' },
];

const ReportIssue = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [successData, setSuccessData] = useState(null);
  
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: '',
    priority: 'medium',
    location: '',
    latitude: null,
    longitude: null,
    photo_url: '',
    reporter_name: '',
    reporter_phone: '',
  });

  React.useEffect(() => {
    const checkRole = async () => {
      const user = await base44.auth.me();
      if (user && (user.role === 'admin' || user.role === 'field_worker')) {
        navigate('/GovernmentDashboard');
      }
    };
    checkRole();
  }, [navigate]);

  const [errors, setErrors] = useState({});

  const validate = () => {
    const errs = {};
    if (!formData.title || formData.title.trim().length < 5) errs.title = "Title must be at least 5 characters";
    if (!formData.description || formData.description.trim().length < 10) errs.description = "Description too short";
    if (!formData.category) errs.category = "Please select a category";
    if (!formData.location) errs.location = "Location is required";
    if (!formData.reporter_name || formData.reporter_name.trim().length < 2) errs.reporter_name = "Name is required";
    if (!formData.reporter_phone || formData.reporter_phone.trim().length < 10) errs.reporter_phone = "Valid mobile number is required";
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleLocationDetection = () => {
    if (!navigator.geolocation) {
      alert("Geolocation is not supported by your browser");
      return;
    }

    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        const { latitude, longitude } = pos.coords;
        try {
          const response = await fetch(
            `https://nominatim.openstreetmap.org/reverse?lat=${latitude}&lon=${longitude}&format=json`
          );
          const data = await response.json();
          setFormData(prev => ({
            ...prev,
            latitude,
            longitude,
            location: data.display_name || `${latitude.toFixed(4)}, ${longitude.toFixed(4)}`
          }));
        } catch (err) {
          console.error('Reverse geocode failed', err);
        }
      },
      (err) => {
        alert(`Error getting location: ${err.message}`);
      }
    );
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;
    
    setLoading(true);
    try {
      const issue = await createIssue(formData);
      setSuccessData(issue);
    } catch (err) {
      console.error(err);
      alert(`Failed to submit issue: ${err.message || 'Please try again.'}`);
    } finally {
      setLoading(false);
    }
  };

  if (successData) {
    return (
      <div className="max-w-2xl mx-auto py-12 px-4 shadow-lg rounded-2xl bg-white border border-slate-100 text-center animate-in zoom-in-95 duration-500">
        <div className="w-20 h-20 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto mb-6">
          <svg className="w-10 h-10" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
        </div>
        <h2 className="text-3xl font-bold text-slate-900 mb-2">Report Submitted!</h2>
        <p className="text-slate-500 mb-8 max-w-md mx-auto">
          Thank you for reporting. Your issue has been successfully recorded and will be reviewed by city administration shortly.
        </p>
        <div className="bg-slate-50 border border-slate-100 p-4 rounded-lg mb-8 inline-block shadow-inner">
          <span className="text-sm font-medium text-slate-500 uppercase tracking-wide">Tracking ID</span>
          <p className="text-xl font-mono text-slate-900 font-bold mt-1 tracking-wider">{(successData.id || 'N/A').split('-')[0]}</p>
        </div>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <button 
            onClick={() => navigate(`/IssueDetails?id=${successData.id}`)}
            className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-3 px-6 rounded-lg transition-colors shadow-sm"
          >
            Track Status
          </button>
          <button 
            onClick={() => { setSuccessData(null); setFormData({ title: '', description: '', category: '', location: '', latitude: null, longitude: null, photo_url: '' }); }}
            className="bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 font-medium py-3 px-6 rounded-lg transition-colors"
          >
            Report Another
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-slate-900 mb-2">Report a Civic Issue</h1>
        <p className="text-slate-500 text-lg">Help us locate and resolve issues in the city by providing the details below.</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6 bg-white p-6 sm:p-8 rounded-2xl shadow-sm border border-slate-100">
        
        {/* Reporter Info */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-1">Your Name <span className="text-red-500">*</span></label>
            <input
              type="text"
              className={`w-full p-3 bg-slate-50 border ${errors.reporter_name ? 'border-red-300' : 'border-slate-200'} rounded-lg focus:outline-none focus:ring-4 transition-all`}
              placeholder="Enter your full name"
              value={formData.reporter_name}
              onChange={(e) => setFormData({...formData, reporter_name: e.target.value})}
            />
            {errors.reporter_name && <p className="text-red-500 text-sm mt-1">{errors.reporter_name}</p>}
          </div>
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-1">Mobile Number <span className="text-red-500">*</span></label>
            <input
              type="tel"
              className={`w-full p-3 bg-slate-50 border ${errors.reporter_phone ? 'border-red-300' : 'border-slate-200'} rounded-lg focus:outline-none focus:ring-4 transition-all`}
              placeholder="e.g. +91 9876543210"
              value={formData.reporter_phone}
              onChange={(e) => setFormData({...formData, reporter_phone: e.target.value})}
            />
            {errors.reporter_phone && <p className="text-red-500 text-sm mt-1">{errors.reporter_phone}</p>}
          </div>
        </div>

        {/* Title */}
        <div>
          <label className="block text-sm font-semibold text-slate-700 mb-1">Issue Title <span className="text-red-500">*</span></label>
          <input
            type="text"
            className={`w-full p-3 bg-slate-50 border ${errors.title ? 'border-red-300 ring-red-100' : 'border-slate-200 focus:border-blue-500 focus:ring-blue-100'} rounded-lg focus:outline-none focus:ring-4 transition-all`}
            placeholder="e.g. Large Pothole on Main St."
            value={formData.title}
            onChange={(e) => setFormData({...formData, title: e.target.value})}
          />
          {errors.title && <p className="text-red-500 text-sm mt-1 flex items-center"><AlertCircle className="w-4 h-4 mr-1"/>{errors.title}</p>}
        </div>

        {/* Category & Priority */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-1">Category <span className="text-red-500">*</span></label>
            <select
              className={`w-full p-3 bg-slate-50 border ${errors.category ? 'border-red-300' : 'border-slate-200'} rounded-lg focus:outline-none transition-all`}
              value={formData.category}
              onChange={(e) => setFormData({...formData, category: e.target.value})}
            >
              <option value="">Select Category</option>
              {categories.map(cat => <option key={cat.id} value={cat.id}>{cat.label}</option>)}
            </select>
            {errors.category && <p className="text-red-500 text-sm mt-1">{errors.category}</p>}
          </div>

          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-1">Priority <span className="text-red-500">*</span></label>
            <div className="flex gap-2">
              {['low', 'medium', 'high', 'critical'].map((p) => (
                <button
                  key={p}
                  type="button"
                  onClick={() => setFormData({...formData, priority: p})}
                  className={`flex-1 py-2 px-1 border rounded-lg text-xs font-bold uppercase transition-all ${
                    formData.priority === p 
                      ? 'bg-blue-600 border-blue-600 text-white' 
                      : 'bg-white border-slate-200 text-slate-500 hover:border-slate-300'
                  }`}
                >
                  {p}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Location */}
        <div>
          <label className="block text-sm font-semibold text-slate-700 mb-1">Location Details <span className="text-red-500">*</span></label>
          <div className="flex gap-2 mb-2">
            <button
              type="button"
              onClick={handleLocationDetection}
              className="md:flex-shrink-0 flex items-center justify-center px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-sm font-medium rounded-lg transition-colors"
            >
              <Navigation className="w-4 h-4 mr-2 text-blue-600" />
              Use My Location
            </button>
          </div>
          <div className="relative">
            <MapPin className="w-5 h-5 absolute left-3 top-3.5 text-slate-400" />
            <input
              type="text"
              className={`w-full pl-10 p-3 bg-slate-50 border ${errors.location ? 'border-red-300 ring-red-100' : 'border-slate-200 focus:border-blue-500 focus:ring-blue-100'} rounded-lg focus:outline-none focus:ring-4 transition-all`}
              placeholder="Enter exact address or landmark"
              value={formData.location}
              onChange={(e) => setFormData({...formData, location: e.target.value})}
            />
          </div>
          {errors.location && <p className="text-red-500 text-sm mt-1 flex items-center"><AlertCircle className="w-4 h-4 mr-1"/>{errors.location}</p>}
        </div>

        {/* Description */}
        <div>
          <label className="block text-sm font-semibold text-slate-700 mb-1">Detailed Description <span className="text-red-500">*</span></label>
          <textarea
            className={`w-full p-3 bg-slate-50 border ${errors.description ? 'border-red-300 ring-red-100' : 'border-slate-200 focus:border-blue-500 focus:ring-blue-100'} rounded-lg focus:outline-none focus:ring-4 transition-all min-h-[120px] resize-y`}
            placeholder="Please detail the issue here. Be as specific as possible to help us assess the severity."
            value={formData.description}
            onChange={(e) => setFormData({...formData, description: e.target.value})}
          />
          {errors.description && <p className="text-red-500 text-sm mt-1 flex items-center"><AlertCircle className="w-4 h-4 mr-1"/>{errors.description}</p>}
        </div>

        {/* Photo Upload */}
        <div>
          <label className="block text-sm font-semibold text-slate-700 mb-1">Photo Evidence <span className="text-slate-400 font-normal">(Optional)</span></label>
          <PhotoUpload 
            onUploadSuccess={(url) => setFormData({...formData, photo_url: url})} 
            onUploadError={() => alert("Upload failed, please try again.")}
          />
        </div>

        {/* Submit */}
        <div className="pt-6 border-t border-slate-100">
          <button 
            type="submit" 
            disabled={loading}
            className="w-full flex items-center justify-center p-4 bg-blue-600 hover:bg-blue-700 disabled:bg-slate-300 disabled:text-slate-500 text-white rounded-xl font-bold text-lg shadow-md transition-all active:scale-[0.98]"
          >
            {loading ? (
              <span className="flex items-center space-x-2">
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                <span>Submitting report...</span>
              </span>
            ) : (
              <span>Submit Report</span>
            )}
          </button>
        </div>

      </form>
    </div>
  );
};

export default ReportIssue;
