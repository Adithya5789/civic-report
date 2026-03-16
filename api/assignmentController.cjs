const pool = require('../db.cjs');

const assignFieldWorker = async (req, res) => {
    const { issueId } = req.params;
    const { workerId, priority, status } = req.body;

    try {
          const [result] = await pool.execute(
                  'UPDATE issues SET assigned_to = ?, priority = ?, status = ? WHERE id = ?',
                  [workerId, priority || 'medium', status || 'assigned', issueId]
                );

      if (result.affectedRows === 0) {
              return res.status(404).json({ error: 'Issue not found' });
      }

      res.json({ message: 'Worker assigned successfully' });
    } catch (error) {
          console.error('Error assigning worker:', error);
          res.status(500).json({ error: 'Database error' });
    }
};

module.exports = { assignFieldWorker };
