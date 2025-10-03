import React, { useState, useEffect } from 'react';
import axios from 'axios';

// NOTE: Ensure your App.jsx passes the refreshSignal prop to this component
function Search({ refreshSignal }) { 
  const [inTransactions, setInTransactions] = useState([]);
  const [outTransactions, setOutTransactions] = useState([]);
  const [filteredIn, setFilteredIn] = useState([]);
  const [filteredOut, setFilteredOut] = useState([]);
  const [query, setQuery] = useState('');
  const [historyId, setHistoryId] = useState('');
  const [transactionHistory, setTransactionHistory] = useState([]);

  // Function to fetch data from the backend
  const fetchTransactions = async () => {
    try {
      const [inResponse, outResponse] = await Promise.all([
        axios.get('/api/transactions/in'),
        axios.get('/api/transactions/out')
      ]);
      
      const newIn = inResponse.data;
      const newOut = outResponse.data;

      setInTransactions(newIn);
      setOutTransactions(newOut);

      // Re-apply current search filter to the new data set
      const searchString = query.toLowerCase();
      
      const newFilteredIn = newIn.filter(transaction => 
        transaction.to_entity.toLowerCase().includes(searchString) ||
        transaction.from_entity.toLowerCase().includes(searchString) ||
        transaction.item_description.toLowerCase().includes(searchString) ||
        transaction.barcode_tag_number.toLowerCase().includes(searchString) ||
        transaction.signature_id.toLowerCase().includes(searchString) ||
        String(transaction.quantity).includes(searchString)
      );

      const newFilteredOut = newOut.filter(transaction => 
        transaction.to_entity.toLowerCase().includes(searchString) ||
        transaction.from_entity.toLowerCase().includes(searchString) ||
        transaction.item_description.toLowerCase().includes(searchString) ||
        transaction.barcode_tag_number.toLowerCase().includes(searchString) ||
        transaction.signature_id.toLowerCase().includes(searchString) ||
        String(transaction.quantity).includes(searchString)
      );

      setFilteredIn(newFilteredIn);
      setFilteredOut(newFilteredOut);
    } catch (error) {
      console.error('Error fetching transactions:', error);
      setInTransactions([]);
      setOutTransactions([]);
      setFilteredIn([]);
      setFilteredOut([]);
    }
  };

  // Runs on initial load AND whenever refreshSignal changes
  useEffect(() => {
    fetchTransactions();
  }, [refreshSignal]);


  // Modified search handler to filter both sets of transactions locally
  const handleSearch = () => {
    // This logic is now redundant if filtering is handled in fetchTransactions, 
    // but we keep it here to allow filtering without triggering a full re-fetch.
    const searchString = query.toLowerCase();
    
    const newFilteredIn = inTransactions.filter(transaction => {
      return (
        transaction.to_entity.toLowerCase().includes(searchString) ||
        transaction.from_entity.toLowerCase().includes(searchString) ||
        transaction.item_description.toLowerCase().includes(searchString) ||
        transaction.barcode_tag_number.toLowerCase().includes(searchString) ||
        transaction.signature_id.toLowerCase().includes(searchString) ||
        String(transaction.quantity).includes(searchString)
      );
    });
    setFilteredIn(newFilteredIn);
    
    const newFilteredOut = outTransactions.filter(transaction => {
      return (
        transaction.to_entity.toLowerCase().includes(searchString) ||
        transaction.from_entity.toLowerCase().includes(searchString) ||
        transaction.item_description.toLowerCase().includes(searchString) ||
        transaction.barcode_tag_number.toLowerCase().includes(searchString) ||
        transaction.signature_id.toLowerCase().includes(searchString) ||
        String(transaction.quantity).includes(searchString)
      );
    });
    setFilteredOut(newFilteredOut);
  };
  
  const createTable = (data) => {
    if (data.length === 0) return <p>No records found.</p>;

    const headers = Object.keys(data[0]);
    return (
      <div className="table-container">
        <table className="data-table">
          <thead>
            <tr>
              {headers.map((header) => (
                <th key={header}>{header.replace(/_/g, ' ')}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {data.map((item, index) => (
              <tr key={index}>
                {headers.map((header) => (
                  <td key={header}>{item[header]}</td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  };

  const showTransactions = async () => {
    if (!historyId) {
      setTransactionHistory([]);
      alert('Please enter a Barcode or Signature ID.');
      return;
    }
    try {
      const response = await axios.get(`/api/transactions/${historyId}`);
      if (response.data.length === 0) {
        alert('No transaction history found for that ID.');
        setTransactionHistory([]);
      } else {
        setTransactionHistory(response.data);
      }
    } catch (error) {
      console.error('Error fetching history:', error);
      alert('An error occurred while fetching the transaction history.');
      setTransactionHistory([]);
    }
  };

  // FIX: Simplified to use window.location.href for direct file download
  const handleDownloadHistory = () => {
    if (historyId) {
      window.location.href = `/api/transactions/${historyId}/download`;
    } else {
      alert('Please enter a Barcode or Signature ID to download its history.');
    }
  };

  // FIX: Simplified to use window.location.href for direct file download
  const handleDownloadCSV = () => {
    let downloadUrl = '';
    
    if (query.trim() === '') {
      downloadUrl = '/api/transmittals/download/all';
    } else {
      // Use encodeURIComponent to correctly handle spaces/special characters in the search query
      downloadUrl = `/api/search/download?query=${encodeURIComponent(query)}`;
    }

    // Trigger the download directly
    window.location.href = downloadUrl;
  };

  return (
    <>
      <section id="search-section">
        <h2>Transactions Overview</h2>
        <div className="search-input-container">
          <input
            type="text"
            placeholder="Search all records..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
          <button onClick={handleSearch}>Search</button>
        </div>
        
        <div className="download-btn-container">
            <button id="download-csv-btn" onClick={handleDownloadCSV}>
              Download All Records
            </button>
        </div>

        <h3>Incoming Records (IN)</h3>
        <div id="in-records">
          {createTable(filteredIn)}
        </div>
        
        <h3>Outgoing Records (OUT)</h3>
        <div id="out-records">
          {createTable(filteredOut)}
          </div>
      </section>

      <section id="history-section">
        <h2>Transaction History by ID</h2>
        <div className="search-input-container">
          <input
            type="text"
            placeholder="Enter Barcode or Signature ID..."
            value={historyId}
            onChange={(e) => setHistoryId(e.target.value)}
          />
          <button onClick={showTransactions}>Show History</button>
        </div>
        <div id="history-results">
          {createTable(transactionHistory)}
        </div>
        {transactionHistory.length > 0 && (
          <div className="download-btn-container">
            <button id="download-history-csv-btn" onClick={handleDownloadHistory}>
              Download History CSV
            </button>
          </div>
        )}
      </section>
    </>
  );
}

export default Search;