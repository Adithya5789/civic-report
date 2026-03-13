import React from 'react';

const PriorityBadge = ({ priority }) => {
  return (
    <span className={`text-xs uppercase tracking-wider priority-${priority}`}>
      {priority}
    </span>
  );
};

export default PriorityBadge;
