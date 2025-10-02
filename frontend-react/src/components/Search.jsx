import React, { useState } from 'react';
import axios from 'axios';

function Search() {
  const [query, setQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [historyId, setHistoryId] = useState('');
  const [transactionHistory, setTransactionHistory] = useState([]);

  const createTable = (data) => {
    if (data.length === 0) return <p>No records found.</p>;

    const headers = Object.keys(data[0]);
    return (
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
    );
  };

  const handleSearch = async () => {
    try {
      const response = await axios.get(`/api/search?query=${query}`);
      setSearchResults(response.data);
    } catch (error) {
      console.error('Error searching:', error);
      setSearchResults([]);
    }
  };

  const showTransactions = async () => {
    if (!historyId) {
      setTransactionHistory([]);
      alert('Please enter a Barcode or Signature ID.');
      return;
    }
    try {
      const response = await axios.get(`/api/transactions/${historyId}`);
      setTransactionHistory(response.data);
    } catch (error) {
      console.error('Error fetching history:', error);
      setTransactionHistory([]);
    }
  };

  const handleDownload = () => {
    if (historyId) {
      window.location.href = `/api/transactions/${historyId}/download`;
    }
  };

  return (
    <>
      <section id="search">
        <h2>Global Search</h2>
        <div className="search-input-container">
          <input
            type="text"
            placeholder="Search by Barcode, Signature ID, or Description..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
          <button onClick={handleSearch}>Search</button>
        </div>
        <div id="search-results">{createTable(searchResults)}</div>
      </section>

      <section id="transaction-history">
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
          <button id="download-csv-btn" onClick={handleDownload}>
            Download CSV
          </button>
        )}
      </section>
    </>
  );
}

export default Search;