import { base44 } from './base44Client';

export const getDashboardStats = async () => {
    const res = await base44.tables.issues.list({
        sort: [{ column: "created_at", direction: "desc" }]
    });

    const issues = Array.isArray(res?.data) ? res.data : [];

    // Basic counts
    const stats = {
        total: issues.length,
        pending: issues.filter(i => i.status === "pending").length,
        in_progress: issues.filter(i => i.status === "in_progress").length,
        resolved: issues.filter(i => i.status === "resolved").length,
        rejected: issues.filter(i => i.status === "rejected").length,
        critical: issues.filter(i => i.priority === "critical").length
    };
  
  // Resolution rate
  stats.resolution_rate = stats.total > 0 
    ? Math.round((stats.resolved / stats.total) * 100) 
    : 0;
  
  // Category breakdown
  const categoryCount = {};
  issues.forEach(issue => {
    categoryCount[issue.category] = (categoryCount[issue.category] || 0) + 1;
  });
  stats.by_category = Object.entries(categoryCount).map(([name, value]) => ({
    name: name.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase()),
    value,
    key: name
  })).sort((a, b) => b.value - a.value);
  
  // Priority breakdown
  const priorityCount = { low: 0, medium: 0, high: 0, critical: 0 };
  issues.forEach(i => { priorityCount[i.priority] = (priorityCount[i.priority] || 0) + 1; });
  stats.by_priority = Object.entries(priorityCount).map(([name, value]) => ({ name, value }));
  
  // Trend — last N days
  const getTrend = (days) => {
    return Array.from({ length: days }, (_, i) => {
      const date = new Date();
      date.setDate(date.getDate() - (days - 1 - i));
      const dateStr = date.toISOString().split('T')[0];
      const dayIssues = issues.filter(issue => issue.created_at?.split('T')[0] === dateStr);
      return {
        date: date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
        reported: dayIssues.length,
        resolved: dayIssues.filter(i => i.status === 'resolved').length,
        in_progress: dayIssues.filter(i => i.status === 'in_progress').length
      };
    });
  };
  
  stats.trend_7d = getTrend(7);
  stats.trend_30d = getTrend(30);
  
  // Average resolution time (in days)
  const resolvedWithDates = issues.filter(i => 
    i.status === "resolved" && i.created_at && i.updated_at
  );
  if (resolvedWithDates.length > 0) {
    const totalMs = resolvedWithDates.reduce((sum, i) => 
      sum + (new Date(i.updated_at) - new Date(i.created_at)), 0
    );
    stats.avg_resolution_days = Math.round(totalMs / resolvedWithDates.length / (1000 * 60 * 60 * 24));
  } else {
    stats.avg_resolution_days = 0;
  }
  
  return { stats, issues };
};

export const exportIssuesToCSV = (issues) => {
  const headers = [
    "ID", "Title", "Category", "Status", "Priority", 
    "Location", "Reported By", "Assigned To", 
    "Created At", "Updated At", "Admin Notes"
  ];
  
  const rows = issues.map(issue => [
    issue.id,
    `"${issue.title}"`,
    issue.category,
    issue.status,
    issue.priority,
    `"${issue.location}"`,
    issue.reported_by_name || "",
    issue.assigned_to || "",
    issue.created_at ? new Date(issue.created_at).toLocaleDateString() : "",
    issue.updated_at ? new Date(issue.updated_at).toLocaleDateString() : "",
    `"${(issue.admin_notes || "").replace(/"/g, "'")}"` 
  ]);
  
  const csvContent = [headers, ...rows].map(r => r.join(",")).join("\n");
  
  const blob = new Blob([csvContent], { type: "text/csv" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `civic-issues-${new Date().toISOString().split('T')[0]}.csv`;
  a.click();
  URL.revokeObjectURL(url);
};
