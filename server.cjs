const express = require('express');
const cors = require('cors');
const { v4: uuidv4 } = require('uuid');
const pool = require('./db.cjs');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

const logDebug = (msg) => {
    const formatted = `[${new Date().toISOString()}] DEBUG: ${msg}\n`;
    console.log(formatted);
    try {
        fs.appendFileSync('C:\\Users\\Aditya\\.antigravity\\civic-report\\debug.log', formatted);
    } catch (e) {}
};

const logError = (type, err) => {
    const msg = `\n[${new Date().toISOString()}] ${type}: ${err.stack || err.message}\n`;
    console.error(msg);
    try {
        fs.appendFileSync('C:\\Users\\Aditya\\.antigravity\\civic-report\\debug.log', msg);
    } catch (e) {}
    return err.message;
};

const app = express();
app.use(cors());
app.use(express.json());

// Global Request Logger
app.use((req, res, next) => {
    logDebug(`${req.method} ${req.url}`);
    next();
});

const PORT = process.env.PORT || 3010;

// --- AUTH --- 
app.post('/api/auth/login', async (req, res) => {
    const { email } = req.body;
    console.log('[v0] Login attempt for email:', email);
    console.log('[v0] DB_HOST:', process.env.DB_HOST ? 'set' : 'NOT SET');
    console.log('[v0] DB_USER:', process.env.DB_USER ? 'set' : 'NOT SET');
    console.log('[v0] DB_NAME:', process.env.DB_NAME ? 'set' : 'NOT SET');
    
    if (!email) {
        return res.status(400).json({ error: 'Email is required' });
    }
    
    try {
        console.log('[v0] Querying database for user...');
        const [rows] = await pool.query('SELECT * FROM users WHERE email = ?', [email]);
        console.log('[v0] Query result rows:', rows?.length || 0);
        let user = rows[0];
        if (!user) {
            console.log('[v0] User not found, creating new user...');
            const id = uuidv4();
            const role = email === 'admin@gmail.com' ? 'admin' : 'citizen';
            const full_name = email.split('@')[0];
            await pool.query('INSERT INTO users (id, full_name, email, role) VALUES (?, ?, ?, ?)', [id, full_name, email, role]);
            const [newUser] = await pool.query('SELECT * FROM users WHERE id = ?', [id]);
            user = newUser[0];
            console.log('[v0] New user created:', user?.id);
        }
        console.log('[v0] Login successful for user:', user?.id);
        res.json(user);
    } catch (err) {
        console.error('[v0] Auth Error:', err.message);
        const message = logError('Auth Error', err);
        res.status(500).json({ error: 'Authentication failed', message, details: err.code || 'unknown' });
    }
});

// --- ISSUES ---
app.get('/api/issues', async (req, res) => {
    try {
        const { reported_by, status } = req.query;
        let query = 'SELECT * FROM issues';
        const params = [];
        if (reported_by || status) {
            query += ' WHERE';
            if (reported_by) {
                query += ' reported_by = ?';
                params.push(reported_by);
            }
            if (status) {
                query += reported_by ? ' AND status = ?' : ' status = ?';
                params.push(status);
            }
        }
        query += ' ORDER BY created_at DESC';
        const [rows] = await pool.query(query, params);
        res.json(rows);
    } catch (err) {
        const message = logError('Fetch Issues Error', err);
        res.status(500).json({ error: 'Failed to fetch issues', message });
    }
});

app.post('/api/issues', async (req, res) => {
    const { title, description, category, location, latitude, longitude, photo_url, reported_by, reporter_name, reporter_phone } = req.body;
    const priority = req.body.priority || 'medium';
    const status = 'pending';
    const id = uuidv4();
    const issue = { id, title, description, category, status, priority, location, latitude, longitude, photo_url, reported_by, reporter_name, reporter_phone };
    
    try {
        await pool.query(
            'INSERT INTO issues (id, title, description, category, status, priority, location, latitude, longitude, photo_url, reported_by, reporter_name, reporter_phone) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
            [id, title, description, category, status, priority, location, latitude, longitude, photo_url, reported_by, reporter_name, reporter_phone]
        );
        res.status(201).json(issue);
    } catch (err) {
        const message = logError('Create Issue Error', err);
        res.status(500).json({ error: 'Failed to create issue', message });
    }
});

app.get('/api/issues/:id', async (req, res) => {
    try {
        const [rows] = await pool.query('SELECT * FROM issues WHERE id = ?', [req.params.id]);
        if (rows.length === 0) return res.status(404).send('Not found');
        res.json(rows[0]);
    } catch (err) {
        logError('Get Issue Error', err);
        res.status(500).json({ error: err.message });
    }
});

app.patch('/api/issues/:id', async (req, res) => {
    const updates = req.body;
    const allowed = ['status', 'priority', 'assigned_to', 'admin_notes'];
    const filtered = Object.keys(updates).filter(k => allowed.includes(k));
    if (filtered.length === 0) return res.status(400).send('No valid updates');
    const setClause = filtered.map(k => `${k} = ?`).join(', ');
    const params = [...filtered.map(k => updates[k]), req.params.id];
    try {
        await pool.query(`UPDATE issues SET ${setClause}, updated_at = CURRENT_TIMESTAMP WHERE id = ?`, params);
        const [rows] = await pool.query('SELECT * FROM issues WHERE id = ?', [req.params.id]);
        res.json(rows[0]);
    } catch (err) {
        const message = logError('Update Issue Error', err);
        res.status(500).json({ error: 'Failed to update issue', message });
    }
});

// --- COMMENTS ---
app.get('/api/issues/:id/comments', async (req, res) => {
    try {
        const [rows] = await pool.query(
            'SELECT c.*, u.full_name FROM issue_comments c JOIN users u ON c.user_id = u.id WHERE c.issue_id = ? ORDER BY c.created_at ASC', 
            [req.params.id]
        );
        res.json(rows);
    } catch (err) {
        logError('Fetch Comments Error', err);
        res.status(500).json({ error: err.message });
    }
});

app.post('/api/issues/:id/comments', async (req, res) => {
    const comment = { id: uuidv4(), issue_id: req.params.id, ...req.body };
    try {
        await pool.query('INSERT INTO issue_comments (id, issue_id, user_id, content) VALUES (?, ?, ?, ?)', [comment.id, comment.issue_id, comment.user_id, comment.content]);
        res.status(201).json(comment);
    } catch (err) {
        logError('Post Comment Error', err);
        res.status(500).json({ error: err.message });
    }
});

// --- ANALYTICS ---
app.get('/api/analytics/stats', async (req, res) => {
    try {
        const [rows] = await pool.query('SELECT status, COUNT(*) as count FROM issues GROUP BY status');
        const stats = { total: 0, pending: 0, in_progress: 0, resolved: 0, rejected: 0 };
        rows.forEach(r => {
            stats[r.status] = r.count;
            stats.total += r.count;
        });
        const [recent] = await pool.query('SELECT * FROM issues ORDER BY created_at DESC LIMIT 10');
        res.json({ stats, issues: recent });
    } catch (err) {
        logError('Analytics Error', err);
        res.status(500).json({ error: err.message });
    }
});

// --- USERS ---
app.get('/api/users', async (req, res) => {
    try {
        const { id, role } = req.query;
        let query = 'SELECT * FROM users';
        const params = [];
        if (id || role) {
            query += ' WHERE';
            if (id) {
                query += ' id = ?';
                params.push(id);
            }
            if (role) {
                query += id ? ' AND role = ?' : ' role = ?';
                params.push(role);
            }
        }
        const [rows] = await pool.query(query, params);
        res.json(rows);
    } catch (err) {
        logError('Fetch Users Error', err);
        res.status(500).json({ error: err.message });
    }
});

app.get('/api/users/:id', async (req, res) => {
    try {
        const [rows] = await pool.query('SELECT * FROM users WHERE id = ?', [req.params.id]);
        if (rows.length === 0) return res.status(404).send('Not found');
        res.json(rows[0]);
    } catch (err) {
        logError('Get User Error', err);
        res.status(500).json({ error: err.message });
    }
});

app.post('/api/users', async (req, res) => {
    const { id, full_name, email, role, phone, department } = req.body;
    try {
        await pool.query(
            'INSERT INTO users (id, full_name, email, role, phone, department) VALUES (?, ?, ?, ?, ?, ?)',
            [id || uuidv4(), full_name, email, role || 'citizen', phone, department]
        );
        res.status(201).json({ id, full_name, email, role });
    } catch (err) {
        logError('Create User Error', err);
        res.status(500).json({ error: err.message });
    }
});

app.patch('/api/users/:id', async (req, res) => {
    const updates = req.body;
    const allowed = ['full_name', 'phone', 'department', 'role'];
    const filtered = Object.keys(updates).filter(k => allowed.includes(k));
    if (filtered.length === 0) return res.status(400).send('No valid updates');
    const setClause = filtered.map(k => `${k} = ?`).join(', ');
    const params = [...filtered.map(k => updates[k]), req.params.id];
    try {
        await pool.query(`UPDATE users SET ${setClause} WHERE id = ?`, params);
        const [rows] = await pool.query('SELECT * FROM users WHERE id = ?', [req.params.id]);
        res.json(rows[0]);
    } catch (err) {
        logError('Update User Error', err);
        res.status(500).json({ error: err.message });
    }
});

// --- DATABASE INSPECTOR (ADMIN ONLY) ---
app.get('/api/admin/tables', async (req, res) => {
    try {
        const [rows] = await pool.query('SHOW TABLES');
        if (rows.length === 0) return res.json([]);
        
        // Dynamically find the key (e.g. Tables_in_civic_report)
        const key = Object.keys(rows[0])[0];
        const tableNames = rows.map(r => r[key]);
        
        logDebug(`Found tables: ${tableNames.join(', ')}`);
        
        const counts = await Promise.all(tableNames.map(async name => {
            const [c] = await pool.query(`SELECT COUNT(*) as count FROM ??`, [name]);
            return { name, count: c[0].count };
        }));
        
        res.json(counts);
    } catch (err) {
        logError('Fetch Tables Error', err);
        res.status(500).json({ error: err.message });
    }
});

app.get('/api/admin/tables/:tableName', async (req, res) => {
    try {
        const { tableName } = req.params;
        // Basic SQL injection protection for table names via whitelist
        const [showTables] = await pool.query('SHOW TABLES');
        const dbName = process.env.DB_NAME || 'civic_report';
        const validTables = showTables.map(r => r[`Tables_in_${dbName}`]);
        
        if (!validTables.includes(tableName)) {
            return res.status(400).json({ error: 'Invalid table name' });
        }

        const [rows] = await pool.query(`SELECT * FROM ??`, [tableName]);
        res.json(rows);
    } catch (err) {
        logError(`Fetch Table ${req.params.tableName} Error`, err);
        res.status(500).json({ error: err.message });
    }
});

// Backward compatibility for workers
app.get('/api/workers', async (req, res) => {
    try {
        const [rows] = await pool.query('SELECT * FROM users WHERE role = "field_worker" OR role = "admin"');
        res.json(rows);
    } catch (err) {
        logError('Fetch Workers Error', err);
        res.status(500).json({ error: err.message });
    }
});

// Serve static files from the 'dist' directory
app.use(express.static(path.join(__dirname, 'dist')));

// Wildcard route to serve index.html for SPA
app.get(/^(?!\/api).*/, (req, res) => {
    res.sendFile(path.join(__dirname, 'dist', 'index.html'));
});

// Global Error Handler
app.use((err, req, res, next) => {
    logError('Global Server Error', err);
    res.status(500).json({ error: 'Internal Server Error', message: err.message });
});

// Export the app for Vercel serverless functions
module.exports = app;

// Only start the server if not running in a Vercel/Serverless environment
if (process.env.NODE_ENV !== 'production' || !process.env.VERCEL) {
    app.listen(PORT, '0.0.0.0', () => {
        console.log(`Unified Server running on port ${PORT}`);
        logDebug(`Server started on port ${PORT}`);
    });
}
