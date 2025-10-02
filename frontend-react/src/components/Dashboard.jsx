import React from 'react';

function Dashboard({ inCount, outCount }) {
  return (
    <section>
      <h2>Dashboard</h2>
      <div className="dashboard-stats">
        <div className="stat-card">
          <h3>Items "In"</h3>
          <p>{inCount}</p>
        </div>
        <div className="stat-card">
          <h3>Items "Out"</h3>
          <p>{outCount}</p>
        </div>
      </div>
    </section>
  );
}

export default Dashboard;