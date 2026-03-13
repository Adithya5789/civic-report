import { base44 } from './base44Client';

// GET or CREATE user profile on login
export const getOrCreateUserProfile = async () => {
  const authUser = await base44.auth.me();
  
  const { data: existingUsers } = await base44.tables.users.list({
    filters: [{ column: "id", operator: "eq", value: authUser.id }]
  });
  
  if (existingUsers.length > 0) return existingUsers[0];
  
  // Create new profile
  const newUser = await base44.tables.users.create({
    id: authUser.id,
    email: authUser.email,
    full_name: authUser.full_name || "",
    role: "citizen",
    created_at: new Date().toISOString()
  });
  
  return newUser;
};

// GET all field workers
export const getFieldWorkers = async () => {
  const { data } = await base44.tables.users.list({
    filters: [{ column: "role", operator: "eq", value: "field_worker" }]
  });
  return data;
};

// CREATE field worker (admin only)
export const createFieldWorker = async (workerData) => {
  const worker = await base44.tables.users.create({
    ...workerData,
    role: "field_worker",
    created_at: new Date().toISOString()
  });
  
  // Send welcome email
  await base44.integrations.Core.SendEmail({
    to: workerData.email,
    subject: "Welcome to CivicReport — Field Worker Account",
    body: `Dear ${workerData.full_name},\n\nYour field worker account has been created.\nLogin at: https://civicreport.base44.app\nEmail: ${workerData.email}\n\nPlease set your password on first login.\n\nCivicReport Team`
  });
  
  return worker;
};

// UPDATE user profile
export const updateUserProfile = async (id, updates) => {
  return await base44.tables.users.update({ id, ...updates });
};

// GET field worker performance stats
export const getFieldWorkerStats = async (workerId) => {
  const { data: assigned } = await base44.tables.issues.list({
    filters: [{ column: "assigned_to", operator: "eq", value: workerId }]
  });
  
  return {
    total_assigned: assigned.length,
    resolved: assigned.filter(i => i.status === "resolved").length,
    in_progress: assigned.filter(i => i.status === "in_progress").length,
    pending: assigned.filter(i => i.status === "pending").length,
    resolution_rate: assigned.length > 0 
      ? Math.round((assigned.filter(i => i.status === "resolved").length / assigned.length) * 100)
      : 0,
    avg_resolution_days: calculateAvgResolutionDays(assigned)
  };
};

const calculateAvgResolutionDays = (issues) => {
  const resolved = issues.filter(i => i.status === "resolved" && i.updated_at && i.created_at);
  if (resolved.length === 0) return 0;
  const totalDays = resolved.reduce((sum, issue) => {
    const days = (new Date(issue.updated_at) - new Date(issue.created_at)) / (1000 * 60 * 60 * 24);
    return sum + days;
  }, 0);
  return Math.round(totalDays / resolved.length);
};
