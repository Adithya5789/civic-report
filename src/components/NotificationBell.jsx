import React, { useEffect, useState } from 'react';
import { Bell } from 'lucide-react';
import { getUnreadNotifications } from '../api/notifications';
import { base44 } from '../api/base44Client';
import { Link } from 'react-router-dom';

const NotificationBell = () => {
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    const fetchCount = async () => {
      const user = await base44.auth.me();
      if (!user) return;
      const notifications = await getUnreadNotifications(user.id);
      setUnreadCount(notifications.length);
    };

    fetchCount();
    // Poll every 30s
    const int = setInterval(fetchCount, 30000);
    return () => clearInterval(int);
  }, []);

  return (
    <Link to="/Notifications" className="relative p-2 text-slate-600 hover:text-slate-900 transition-colors">
      <Bell className="w-6 h-6" />
      {unreadCount > 0 && (
        <span className="absolute top-1 right-1 bg-red-500 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full min-w-[18px] text-center">
          {unreadCount > 99 ? '99+' : unreadCount}
        </span>
      )}
    </Link>
  );
};

export default NotificationBell;
