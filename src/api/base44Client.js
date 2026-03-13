const API_BASE = '/api';

export const base44 = {
  auth: {
    login: async (email, password) => {
      const res = await fetch(`${API_BASE}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      });
      if (!res.ok) throw new Error(await res.text());
      const user = await res.json();
      localStorage.setItem('base44_currentUser', JSON.stringify(user));
      return user;
    },
    logout: async () => {
      localStorage.removeItem('base44_currentUser');
    },
    me: async () => {
      const stored = localStorage.getItem('base44_currentUser');
      return stored ? JSON.parse(stored) : null;
    }
  },
  tables: {
    issues: {
      get: async (id) => {
        const res = await fetch(`${API_BASE}/issues/${id}`);
        if (!res.ok) throw new Error(await res.text());
        return res.json();
      },
      list: async (filters = {}) => {
        // Convert filters from Base44 filter format if necessary, 
        // or just pass as query params if handled by our Express server.
        // For simplicity, our server expects reported_by and status.
        const queryParams = new URLSearchParams();
        if (filters.filters) {
            filters.filters.forEach(f => {
                queryParams.append(f.column, f.value);
            });
        }

        const res = await fetch(`${API_BASE}/issues?${queryParams.toString()}`);
        if (!res.ok) throw new Error(await res.text());
        const result = await res.json();
        // Ensure we always return an array in the 'data' property
        return { data: Array.isArray(result) ? result : [] };
      },
      create: async (data) => {
        const res = await fetch(`${API_BASE}/issues`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(data)
        });
        if (!res.ok) throw new Error(await res.text());
        return res.json();
      },
      update: async (data) => {
        const { id, ...updates } = data;
        const res = await fetch(`${API_BASE}/issues/${id}`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(updates)
        });
        if (!res.ok) throw new Error(await res.text());
        return res.json();
      }
    },
    users: {
      list: async (filters = {}) => {
        const queryParams = new URLSearchParams();
        if (filters.filters) {
            filters.filters.forEach(f => queryParams.append(f.column, f.value));
        }
        const res = await fetch(`${API_BASE}/users?${queryParams.toString()}`);
        const data = await res.json();
        return { data: Array.isArray(data) ? data : [] };
      },
      get: async (id) => {
        const res = await fetch(`${API_BASE}/users/${id}`);
        if (!res.ok) return null;
        return res.json();
      },
      create: async (data) => {
        const res = await fetch(`${API_BASE}/users`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(data)
        });
        if (!res.ok) throw new Error(await res.text());
        return res.json();
      },
      update: async (data) => {
        const { id, ...updates } = data;
        const res = await fetch(`${API_BASE}/users/${id}`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(updates)
        });
        return res.json();
      }
    },
    issue_comments: {
        list: async (filters = {}) => {
            const issueId = filters.filters?.find(f => f.column === 'issue_id')?.value;
            if (!issueId) return { data: [] };
            const res = await fetch(`${API_BASE}/issues/${issueId}/comments`);
            const data = await res.json();
            return { data };
        },
        create: async (data) => {
            const res = await fetch(`${API_BASE}/issues/${data.issue_id}/comments`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(data)
            });
            return res.json();
        }
    },
    notifications: {
      list: async () => ({ data: [] }),
      create: async (data) => ({ data })
    }
  },
  integrations: {
    Core: {
      UploadFile: async ({ file }) => ({
        file_url: URL.createObjectURL(file) // Still mock file upload for UX
      }),
      SendEmail: async (data) => {
        console.log('Mock Email Sent:', data);
        return { success: true };
      }
    }
  }
};
