const express = require('express');
const mysql = require('mysql');
const cors = require('cors');
const csv = require('csv-express');

const app = express();
const port = 3000;

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

app.use(cors());
app.use(express.json());

// --- API Routes ---

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
    const logAction = `Added new '${transaction_type}' record for item: ${barcode_tag_number} (Qty: ${quantity})`;
    db.query('INSERT INTO activity_logs (action) VALUES (?)', [logAction]);
    
    res.status(201).send({ message: 'Record added successfully!', id: result.insertId });
  });
});

// Updated API route to get all IN transactions
app.get('/api/transactions/in', (req, res) => {
  const sql = "SELECT * FROM transmittals WHERE transaction_type = 'In' ORDER BY transaction_date DESC";
  db.query(sql, (err, results) => {
    if (err) {
      return res.status(500).send({ message: 'Error fetching IN transactions.' });
    }
    res.json(results);
  });
});

// Updated API route to get all OUT transactions
app.get('/api/transactions/out', (req, res) => {
  const sql = "SELECT * FROM transmittals WHERE transaction_type = 'Out' ORDER BY transaction_date DESC";
  db.query(sql, (err, results) => {
    if (err) {
      return res.status(500).send({ message: 'Error fetching OUT transactions.' });
    }
    res.json(results);
  });
});

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

app.get('/api/search/download', (req, res) => {
  const { query } = req.query;
  const searchTerm = `%${query}%`;
  const sql = `
    SELECT transaction_date, transaction_type, to_entity, from_entity, item_description, barcode_tag_number, signature_id, quantity 
    FROM transmittals
    WHERE to_entity LIKE ? OR from_entity LIKE ? OR item_description LIKE ? OR barcode_tag_number LIKE ? OR signature_id LIKE ? OR quantity LIKE ?
    ORDER BY transaction_date DESC
  `;
  
  db.query(sql, [searchTerm, searchTerm, searchTerm, searchTerm, searchTerm, searchTerm], (err, results) => {
    if (err) {
      return res.status(500).send({ message: 'Error fetching data for CSV.' });
    }
    if (results.length === 0) {
      return res.status(404).send({ message: 'No transactions found for this search.' });
    }
    
    res.csv(results, true);
  });
});

app.get('/api/transmittals/download/all', (req, res) => {
  const sql = 'SELECT * FROM transmittals ORDER BY transaction_date DESC';
  
  db.query(sql, (err, results) => {
    if (err) {
      return res.status(500).send({ message: 'Error fetching all data for CSV.' });
    }
    if (results.length === 0) {
      return res.status(404).send({ message: 'No records found in the database.' });
    }
    
    res.csv(results, true);
  });
});

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

app.get('/api/activity-logs', (req, res) => {
  const sql = 'SELECT * FROM activity_logs ORDER BY timestamp DESC';
  db.query(sql, (err, results) => {
    if (err) {
      return res.status(500).send({ message: 'Error fetching activity logs.' });
    }
    res.json(results);
  });
});

app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});