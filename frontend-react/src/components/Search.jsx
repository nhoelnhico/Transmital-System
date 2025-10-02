import React, { useState, useEffect } from 'react';
import axios from 'axios';

function Search() {
  const [inTransactions, setInTransactions] = useState([]);
  const [outTransactions, setOutTransactions] = useState([]);
  const [filteredIn, setFilteredIn] = useState([]);
  const [filteredOut, setFilteredOut] = useState([]);
  const [query, setQuery] = useState('');
  const [historyId, setHistoryId] = useState('');
  const [transactionHistory, setTransactionHistory] = useState([]);

  // Use useEffect to fetch both sets of transactions on component load
  useEffect(() => {
    const fetchTransactions = async () => {
      try {
        const [inResponse, outResponse] = await Promise.all([
          axios.get('/api/transactions/in'),
          axios.get('/api/transactions/out')
        ]);
        
        setInTransactions(inResponse.data);
        setOutTransactions(outResponse.data);
        
        setFilteredIn(inResponse.data);
        setFilteredOut(outResponse.data);
        
      } catch (error) {
        console.error('Error fetching transactions:', error);
        setInTransactions([]);
        setOutTransactions([]);
        setFilteredIn([]);
        setFilteredOut([]);
      }
    };
    fetchTransactions();
  }, []);

  // Modified search handler to filter both sets of transactions locally
  const handleSearch = () => {
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

  const handleDownloadHistory = () => {
    if (historyId) {
      window.location.href = `/api/transactions/${historyId}/download`;
    }
  };

  const handleDownloadCSV = async () => {
    try {
      let downloadUrl = '';
      let fileName = '';

      if (query.trim() === '') {
        downloadUrl = '/api/transmittals/download/all';
        fileName = 'all_records.csv';
      } else {
        downloadUrl = `/api/search/download?query=${query}`;
        fileName = 'search_results.csv';
      }

      const response = await axios.get(downloadUrl, {
        responseType: 'blob',
      });

      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', fileName);
      document.body.appendChild(link);
      link.click();
      link.parentNode.removeChild(link);
    } catch (error) {
      console.error('Error downloading CSV:', error);
      alert('Could not download the file. Please check your search or the database.');
    }
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