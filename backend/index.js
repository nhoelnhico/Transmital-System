const express = require('express');
const mysql = require('mysql');
const cors = require('cors');
const csv = require('csv-express');

const app = express();
const port = 3000;

// Database connection details
const db = mysql.createConnection({
  host: 'localhost',
  user: 'root',
  password: '',
  database: 'transmittal_db'
});

db.connect((err) => {
  if (err) {
    console.error('Error connecting to the database:', err);
    return;
  }
  console.log('Connected to MySQL database!');
});

// Middleware
app.use(cors());
app.use(express.json());

// --- API Routes ---

// 1. Route to add a new 'In' or 'Out' record
app.post('/api/transmittals', (req, res) => {
  const { transaction_type, to, from, item_description, barcode_tag_number, signature_id, quantity } = req.body;
  
  if (!transaction_type || !to || !from || !item_description || !barcode_tag_number || !signature_id || !quantity) {
    return res.status(400).send({ message: 'All fields are required.' });
  }

  const query = 'INSERT INTO transmittals (transaction_type, to_entity, from_entity, item_description, barcode_tag_number, signature_id, quantity) VALUES (?, ?, ?, ?, ?, ?, ?)';
  db.query(query, [transaction_type, to, from, item_description, barcode_tag_number, signature_id, quantity], (err, result) => {
    if (err) {
      console.error('Error adding record:', err);
      return res.status(500).send({ message: 'Internal Server Error' });
    }
    // Add to activity log with quantity
    const logAction = `Added new '${transaction_type}' record for item: ${barcode_tag_number} (Qty: ${quantity})`;
    db.query('INSERT INTO activity_logs (action) VALUES (?)', [logAction]);
    
    res.status(201).send({ message: 'Record added successfully!', id: result.insertId });
  });
});

// 2. Route for Dashboard Counts
app.get('/api/dashboard', (req, res) => {
  const sql = `
    SELECT
      COUNT(CASE WHEN transaction_type = 'In' THEN 1 END) AS count_in,
      COUNT(CASE WHEN transaction_type = 'Out' THEN 1 END) AS count_out
    FROM transmittals;
  `;
  db.query(sql, (err, results) => {
    if (err) {
      return res.status(500).send({ message: 'Error fetching dashboard data.' });
    }
    res.json(results[0]);
  });
});

// 3. Route for Global Search
app.get('/api/search', (req, res) => {
  const { query } = req.query;
  const searchTerm = `%${query}%`;
  const sql = `
    SELECT * FROM transmittals
    WHERE to_entity LIKE ? OR from_entity LIKE ? OR item_description LIKE ? OR barcode_tag_number LIKE ? OR signature_id LIKE ? OR quantity LIKE ?
  `;
  db.query(sql, [searchTerm, searchTerm, searchTerm, searchTerm, searchTerm, searchTerm], (err, results) => {
    if (err) {
      return res.status(500).send({ message: 'Error searching records.' });
    }
    res.json(results);
  });
});

// 4. Route to get transactions for a specific Barcode or Signature ID
app.get('/api/transactions/:id', (req, res) => {
  const identifier = req.params.id;
  const sql = 'SELECT * FROM transmittals WHERE barcode_tag_number = ? OR signature_id = ? ORDER BY transaction_date DESC';
  db.query(sql, [identifier, identifier], (err, results) => {
    if (err) {
      return res.status(500).send({ message: 'Error fetching transactions.' });
    }
    res.json(results);
  });
});

// 5. Route to download transactions as CSV
app.get('/api/transactions/:id/download', (req, res) => {
  const identifier = req.params.id;
  const sql = 'SELECT transaction_date, transaction_type, to_entity, from_entity, item_description, barcode_tag_number, signature_id, quantity FROM transmittals WHERE barcode_tag_number = ? OR signature_id = ? ORDER BY transaction_date DESC';
  
  db.query(sql, [identifier, identifier], (err, results) => {
    if (err) {
      return res.status(500).send({ message: 'Error fetching data for CSV.' });
    }
    if (results.length === 0) {
      return res.status(404).send({ message: 'No transactions found for this ID.' });
    }
    
    res.csv(results, true);
  });
});

// 6. Route for Activity Logs
app.get('/api/activity-logs', (req, res) => {
  const sql = 'SELECT * FROM activity_logs ORDER BY timestamp DESC';
  db.query(sql, (err, results) => {
    if (err) {
      return res.status(500).send({ message: 'Error fetching activity logs.' });
    }
    res.json(results);
  });
});

// Start the server
app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});