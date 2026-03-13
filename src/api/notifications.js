import { base44 } from './base44Client';

export const notifyAdmins = async (type, issue) => {
  const { data: admins } = await base44.tables.users.list({
    filters: [{ column: "role", operator: "eq", value: "admin" }]
  });
  
  for (const admin of admins) {
    await base44.tables.notifications.create({
      user_id: admin.id,
      title: "New Issue Reported",
      message: `${issue.title} reported at ${issue.location}`,
      type: "new_issue",
      issue_id: issue.id,
      is_read: false,
      created_at: new Date().toISOString()
    });
  }
};

export const notifyIssueReporter = async (issueId, newStatus) => {
  const { data: issues } = await base44.tables.issues.list({
    filters: [{ column: "id", operator: "eq", value: issueId }]
  });
  const issue = issues[0];
  if (!issue?.reported_by) return;
  
  const statusMessages = {
    in_progress: "Your issue is now being worked on",
    resolved: "Your issue has been resolved! ✅",
    rejected: "Your issue report has been reviewed"
  };
  
  await base44.tables.notifications.create({
    user_id: issue.reported_by,
    title: `Issue Status Updated: ${newStatus.replace(/_/g, ' ').toUpperCase()}`,
    message: statusMessages[newStatus] || `Status changed to ${newStatus}`,
    type: "status_updated",
    issue_id: issueId,
    is_read: false,
    created_at: new Date().toISOString()
  });

  // Optional string matching email service
  const userList = await base44.tables.users.list();
  const reportedByRecord = userList.data.find(u => u.id === issue.reported_by);
  if (reportedByRecord && reportedByRecord.email) {
      await base44.integrations.Core.SendEmail({
        to: reportedByRecord.email,
        subject: `Your CivicReport Issue: ${newStatus.toUpperCase()}`,
        body: `
          Issue: ${issue.title}
          Status: ${newStatus.replace(/_/g, ' ')}
          Location: ${issue.location}
          ${newStatus === 'resolved' ? 'Thank you for helping improve our city! ✅' : ''}
        `
      });
  }
};

export const notifyFieldWorker = async (workerId, issueId) => {
  const { data: issues } = await base44.tables.issues.list({
    filters: [{ column: "id", operator: "eq", value: issueId }]
  });
  const issue = issues[0];
  
  await base44.tables.notifications.create({
    user_id: workerId,
    title: "New Issue Assigned",
    message: `You have been assigned: ${issue?.title}`,
    type: "issue_assigned",
    issue_id: issueId,
    is_read: false,
    created_at: new Date().toISOString()
  });

  const userList = await base44.tables.users.list();
  const assignedWorkerRecord = userList.data.find(u => u.id === workerId);
  if (assignedWorkerRecord && assignedWorkerRecord.email) {
      await base44.integrations.Core.SendEmail({
        to: assignedWorkerRecord.email,
        subject: `New CivicReport Issue Assigned`,
        body: `You have been assigned to: ${issue?.title} at ${issue.location}`
      });
  }
};

export const getUnreadNotifications = async (userId) => {
  const { data } = await base44.tables.notifications.list({
    filters: [
      { column: "user_id", operator: "eq", value: userId },
      { column: "is_read", operator: "eq", value: false }
    ],
    sort: [{ column: "created_at", direction: "desc" }]
  });
  return data;
};

export const markNotificationRead = async (notificationId) => {
  await base44.tables.notifications.update({ id: notificationId, is_read: true });
};
