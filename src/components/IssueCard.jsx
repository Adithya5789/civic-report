import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { MapPin, Clock } from 'lucide-react';
import StatusBadge from './StatusBadge';
import PriorityBadge from './PriorityBadge';
import CategoryIcon from './CategoryIcon';

const IssueCard = ({ issue }) => {
  return (
    <div className="bg-white rounded-xl shadow-sm border border-slate-100 p-5 hover:shadow-md transition-shadow">
      <div className="flex justify-between items-start mb-4">
        <div className="flex items-center space-x-3">
          <div className="bg-slate-50 p-2 rounded-lg">
            <CategoryIcon category={issue.category} className="w-6 h-6 text-slate-600" />
          </div>
          <div>
            <h3 className="font-semibold text-slate-900 line-clamp-1">{issue.title}</h3>
            <p className="text-sm text-slate-500 capitalize">{issue.category.replace(/_/g, ' ')}</p>
          </div>
        </div>
        <StatusBadge status={issue.status} />
      </div>

      <div className="space-y-2 mb-4">
        <div className="flex items-center text-sm text-slate-600">
          <MapPin className="w-4 h-4 mr-2" />
          <span className="line-clamp-1">{issue.location}</span>
        </div>
        <div className="flex items-center text-sm text-slate-600">
          <Clock className="w-4 h-4 mr-2" />
          <span>{new Date(issue.created_at).toLocaleDateString()}</span>
        </div>
      </div>

      <div className="flex justify-between items-center pt-4 border-t border-slate-100">
        <div className="flex items-center space-x-2">
          <span className="text-xs text-slate-500">Priority:</span>
          <PriorityBadge priority={issue.priority} />
        </div>
        <Link 
          to={`/IssueDetails?id=${issue.id}`}
          className="text-sm font-medium text-blue-600 hover:text-blue-700"
        >
          View Details &rarr;
        </Link>
      </div>
    </div>
  );
};

export default IssueCard;
