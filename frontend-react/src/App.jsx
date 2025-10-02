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

  const fetchDashboardCounts = async () => {
    try {
      const response = await axios.get('/api/dashboard');
      setInCount(response.data.count_in);
      setOutCount(response.data.count_out);
    } catch (error) {
      console.error('Error fetching dashboard counts:', error);
    }
  };

  useEffect(() => {
    fetchDashboardCounts();
  }, []);

  return (
    <div className="App">
      <header>
        <h1>Transmittal Record System</h1>
      </header>
      <main>
        <Dashboard inCount={inCount} outCount={outCount} />
        <TransactionForm onTransactionAdded={fetchDashboardCounts} />
        <Search />
        <ActivityLog />
      </main>
    </div>
  );
}

export default App;