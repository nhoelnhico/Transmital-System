import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Dashboard from './components/Dashboard';
import TransactionForm from './components/TransactionForm';
import Search from './components/Search';
import ActivityLog from './components/ActivityLog';
import './App.css';

function App() {
  const [inCount, setInCount] = useState(0);
  const [outCount, setOutCount] = useState(0);
  const [refreshLogs, setRefreshLogs] = useState(0);
  const [refreshTransmittals, setRefreshTransmittals] = useState(0); // <-- ADDED: New state for the Transmittal list

  const fetchDashboardCounts = async () => {
    try {
      const response = await axios.get('/api/dashboard');
      setInCount(response.data.count_in);
      setOutCount(response.data.count_out);
    } catch (error) {
      console.error('Error fetching dashboard counts:', error);
    }
  };

  const handleTransactionAdded = () => {
    fetchDashboardCounts();
    setRefreshLogs(prev => prev + 1);
    setRefreshTransmittals(prev => prev + 1); // <-- ADDED: Increment to trigger Search refresh
  };

  useEffect(() => {
    fetchDashboardCounts();
  }, []);

  return (
    <div id="root">
      <header>
        <h1> IT Department - Transmittal Record System</h1>
      </header>
      <div className="main-container">
        <main>
          <Dashboard inCount={inCount} outCount={outCount} />
          <TransactionForm onTransactionAdded={handleTransactionAdded} />
          <Search refreshSignal={refreshTransmittals} /> {/* <-- UPDATED: Pass the new signal */}
          <ActivityLog refreshSignal={refreshLogs} />
        </main>
      </div>
    </div>
  );
}

export default App;