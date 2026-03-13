import React, { useState, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import { Link } from 'react-router-dom';
import L from 'leaflet';
import { base44 } from '../api/base44Client';
import { Filter, X } from 'lucide-react';
import StatusBadge from '../components/StatusBadge';

// Leaflet marker icons fix for React
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
});

// Custom colored markers based on status
const createMarkerIcon = (color) => {
  return new L.Icon({
    iconUrl: `https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-${color}.png`,
    shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png',
    iconSize: [25, 41],
    iconAnchor: [12, 41],
    popupAnchor: [1, -34],
    shadowSize: [41, 41]
  });
};

const iconsData = {
  pending: createMarkerIcon('orange'),
  in_progress: createMarkerIcon('blue'),
  resolved: createMarkerIcon('green'),
  rejected: createMarkerIcon('red')
};

const IssuesMap = () => {
  const [issues, setIssues] = useState([]);
  const [filteredIssues, setFilteredIssues] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showFilters, setShowFilters] = useState(false);
  
  const [filters, setFilters] = useState({
    status: '',
    category: '',
    priority: ''
  });

  useEffect(() => {
    const fetchMapData = async () => {
      try {
        const { data } = await base44.tables.issues.list();
        // Filter out issues that do not have valid lat/long
        const withLocation = data.filter(i => i.latitude && i.longitude);
        setIssues(withLocation);
        setFilteredIssues(withLocation);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchMapData();
  }, []);

  useEffect(() => {
    let result = issues;
    if (filters.status) result = result.filter(i => i.status === filters.status);
    if (filters.category) result = result.filter(i => i.category === filters.category);
    if (filters.priority) result = result.filter(i => i.priority === filters.priority);
    setFilteredIssues(result);
  }, [filters, issues]);

  // Center on New York by default or first issue
  const defaultCenter = [40.7128, -74.0060];
  const center = filteredIssues.length > 0 ? [filteredIssues[0].latitude, filteredIssues[0].longitude] : defaultCenter;

  if (loading) return <div className="flex justify-center py-20"><div className="animate-spin w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full"></div></div>;

  return (
    <div className="h-[calc(100vh-140px)] flex flex-col md:flex-row gap-4">
      
      {/* Mobile filter toggle */}
      <div className="md:hidden flex justify-end">
        <button 
          onClick={() => setShowFilters(!showFilters)}
          className="flex items-center text-sm bg-white p-2 rounded-lg border shadow-sm"
        >
          <Filter className="w-4 h-4 mr-2" />
          {showFilters ? 'Hide Filters' : 'Show Filters'}
        </button>
      </div>

      {/* Filter Panel */}
      <div className={`md:w-64 shrink-0 bg-white rounded-xl border border-slate-200 shadow-sm p-4 ${showFilters ? 'block' : 'hidden md:block'}`}>
        <div className="flex justify-between items-center mb-6">
          <h2 className="font-bold text-slate-900 flex items-center">
            <Filter className="w-4 h-4 mr-2" />
            Filters
          </h2>
        </div>

        <div className="space-y-5">
          <div>
            <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2 block">Status</label>
            <select 
              value={filters.status} 
              onChange={e => setFilters({...filters, status: e.target.value})}
              className="w-full text-sm p-2 border border-slate-200 rounded text-slate-700 bg-slate-50 focus:outline-none focus:border-blue-500"
            >
              <option value="">All Statuses</option>
              <option value="pending">Pending</option>
              <option value="in_progress">In Progress</option>
              <option value="resolved">Resolved</option>
              <option value="rejected">Rejected</option>
            </select>
          </div>

          <div>
            <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2 block">Priority</label>
            <select 
              value={filters.priority} 
              onChange={e => setFilters({...filters, priority: e.target.value})}
              className="w-full text-sm p-2 border border-slate-200 rounded text-slate-700 bg-slate-50 focus:outline-none focus:border-blue-500"
            >
              <option value="">All Priorities</option>
              <option value="low">Low</option>
              <option value="medium">Medium</option>
              <option value="high">High</option>
              <option value="critical">Critical</option>
            </select>
          </div>

          <div>
            <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2 block">Category</label>
            <select 
              value={filters.category} 
              onChange={e => setFilters({...filters, category: e.target.value})}
              className="w-full text-sm p-2 border border-slate-200 rounded text-slate-700 bg-slate-50 focus:outline-none focus:border-blue-500"
            >
              <option value="">All Categories</option>
              <option value="pothole">Pothole</option>
              <option value="garbage_dumping">Garbage Dumping</option>
              <option value="water_leakage">Water Leakage</option>
              <option value="street_light_failure">Street Light</option>
              <option value="road_damage">Road Damage</option>
            </select>
          </div>

          <button 
            onClick={() => setFilters({status: '', category: '', priority: ''})}
            className="w-full text-sm text-slate-500 hover:text-slate-800 transition py-2"
          >
            Clear Filters
          </button>

          <div className="pt-4 border-t border-slate-100">
             <h3 className="text-xs font-medium text-slate-500 mb-2">Legend</h3>
             <ul className="text-xs space-y-1">
               <li className="flex items-center"><span className="w-3 h-3 rounded-full bg-orange-500 mr-2 inline-block"></span> Pending</li>
               <li className="flex items-center"><span className="w-3 h-3 rounded-full bg-blue-500 mr-2 inline-block"></span> In Progress</li>
               <li className="flex items-center"><span className="w-3 h-3 rounded-full bg-green-500 mr-2 inline-block"></span> Resolved</li>
               <li className="flex items-center"><span className="w-3 h-3 rounded-full bg-red-500 mr-2 inline-block"></span> Rejected</li>
             </ul>
          </div>
        </div>
      </div>

      {/* Map Area */}
      <div className="flex-1 bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden relative z-0">
        <MapContainer center={center} zoom={13} style={{ height: '100%', width: '100%' }}>
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            url="https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png"
          />
          {filteredIssues.map(issue => (
            <Marker 
              key={issue.id} 
              position={[issue.latitude, issue.longitude]}
              icon={iconsData[issue.status] || iconsData.pending}
            >
              <Popup>
                <div className="min-w-[200px]">
                  <h3 className="font-bold text-sm mb-1 leading-tight">{issue.title}</h3>
                  <div className="mb-2"><StatusBadge status={issue.status} /></div>
                  <p className="text-xs text-slate-500 mb-3 truncate">{issue.location}</p>
                  <Link 
                    to={`/IssueDetails?id=${issue.id}`}
                    className="text-xs text-white bg-blue-600 hover:bg-blue-700 px-3 py-1.5 rounded font-medium block text-center"
                  >
                    View Details
                  </Link>
                </div>
              </Popup>
            </Marker>
          ))}
        </MapContainer>
      </div>

    </div>
  );
};

export default IssuesMap;
