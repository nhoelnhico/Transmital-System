// frontend-react/src/components/ActivityLog.jsx

import React, { useState, useEffect } from 'react';
import axios from 'axios';

function ActivityLog({ refreshSignal }) {
  const [logs, setLogs] = useState([]);

  const fetchActivityLogs = async () => {
    try {
      const response = await axios.get('/api/activity-logs');
      setLogs(response.data);
    } catch (error) {
      console.error('Error fetching activity logs:', error);
    }
  };

  useEffect(() => {
    fetchActivityLogs();
  }, [refreshSignal]); // Now depends on the refreshSignal state

  return (
    <section id="activity-logs">
      <h2>Activity Logs</h2>
      <div id="logs-list">
        {logs.length > 0 ? (
          <ul>
            {logs.map((log) => (
              <li key={log.id}>
                {new Date(log.timestamp).toLocaleString()}: {log.action}
              </li>
            ))}
          </ul>
        ) : (
          <p>No activity logs found.</p>
        )}
      </div>
    </section>
  );
}

export default ActivityLog;