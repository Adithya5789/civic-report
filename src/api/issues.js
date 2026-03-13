import { base44 } from './base44Client';
import { notifyAdmins, notifyIssueReporter, notifyFieldWorker } from './notifications';

// CREATE — citizen reports new issue
export const createIssue = async (issueData) => {
  const user = await base44.auth.me();
  const issue = await base44.tables.issues.create({
    ...issueData,
    status: "pending",
    reported_by: user ? user.id : null,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  });
  
  // Notify all admins
  await notifyAdmins("new_issue", issue);
  
  return issue;
};

// READ — list issues with filters
export const listIssues = async (filters = {}) => {
  const queryFilters = [];
  
  if (filters.status) queryFilters.push({ column: "status", operator: "eq", value: filters.status });
  if (filters.category) queryFilters.push({ column: "category", operator: "eq", value: filters.category });
  if (filters.priority) queryFilters.push({ column: "priority", operator: "eq", value: filters.priority });
  if (filters.assigned_to) queryFilters.push({ column: "assigned_to", operator: "eq", value: filters.assigned_to });
  if (filters.reported_by) queryFilters.push({ column: "reported_by", operator: "eq", value: filters.reported_by });
  
  const { data } = await base44.tables.issues.list({
    filters: queryFilters,
    sort: [{ column: "created_at", direction: "desc" }]
  });
  
  return data;
};

// UPDATE — admin updates issue
export const updateIssue = async (id, updates) => {
  const updated = await base44.tables.issues.update({
    id,
    ...updates,
    updated_at: new Date().toISOString()
  });
  
  // If status changed, notify the reporter
  if (updates.status) {
    await notifyIssueReporter(id, updates.status);
  }
  
  // If assigned_to changed, notify the field worker
  if (updates.assigned_to) {
    await notifyFieldWorker(updates.assigned_to, id);
  }
  
  return updated;
};

// DELETE — admin deletes issue
export const deleteIssue = async (id) => {
  await base44.tables.issues.delete({ id });
};
