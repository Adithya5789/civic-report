import React from 'react';

const StatusBadge = ({ status }) => {
  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border status-${status}`}>
      {status.replace(/_/g, ' ').toUpperCase()}
    </span>
  );
};

export default StatusBadge;
