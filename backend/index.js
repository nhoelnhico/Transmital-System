const express = require('express');
const mysql = require('mysql');
const cors = require('cors');

const app = express();
const port = 5000;

// =========================================================================
// !!! CORRECTED DATABASE CONNECTION !!!
// Using XAMPP default: user 'root', password '' (empty string), and confirmed database name.
// =========================================================================
const db = mysql.createConnection({
  host: 'localhost', 
  user: 'root',      
  password: '', // <--- CORRECTED: Empty string for XAMPP default
  database: 'transmittal_db' // <--- CORRECTED: Confirmed database name
});

db.connect(err => {
  if (err) {
    console.error('Error connecting to MySQL:', err);
    return;
  }
  console.log('Connected to MySQL Database.');
});
// =========================================================================

// Middleware
app.use(cors());
app.use(express.json());

// ROUTE 1: Handle new transmittal records (POST)
app.post('/api/transmittals', (req, res) => {
  // Destructure all fields, including the PLURAL 'remarks'
  const { transaction_type, to, from, item_description, barcode_tag_number, signature_id, quantity, remarks } = req.body;
  
  if (!transaction_type || !to || !from || !item_description || !barcode_tag_number || !signature_id || !quantity) {
    return res.status(400).send({ message: 'All required fields are missing.' });
  }

  // Insert query includes the 'remarks' column
  const query = `
    INSERT INTO transmittals 
    (transaction_type, to_entity, from_entity, item_description, barcode_tag_number, signature_id, quantity, remarks) 
    VALUES (?, ?, ?, ?, ?, ?, ?, ?)
  `;
  
  // Values array includes 'remarks'
  db.query(query, [transaction_type, to, from, item_description, barcode_tag_number, signature_id, quantity, remarks], (err, result) => {
    if (err) {
      console.error('Error adding record:', err);
      return res.status(500).send({ message: 'Internal Server Error' });
    }

    // Activity Logging now includes remarks
    let logAction = `Added new '${transaction_type}' record for item: ${barcode_tag_number} (Qty: ${quantity})`;
    
    if (remarks && remarks.trim() !== '') {
        logAction += ` | Remarks: "${remarks.trim()}"`;
    }
    
    db.query('INSERT INTO activity_logs (action) VALUES (?)', [logAction], (logErr) => {
      if (logErr) {
        console.error('Error logging activity:', logErr);
      }
    });
    
    res.status(201).send({ message: 'Record added successfully!', id: result.insertId });
  });
});

// ROUTE 2: Fetch Incoming Transactions (GET /api/transactions/in) - MISSING ROUTE FIX
app.get('/api/transactions/in', (req, res) => {
    // Selects only records where transaction_type is 'In'
    const query = "SELECT * FROM transmittals WHERE transaction_type = 'In'";
    db.query(query, (err, results) => {
        if (err) {
            console.error('Error fetching IN transactions:', err);
            return res.status(500).send({ message: 'Internal Server Error' });
        }
        res.json(results);
    });
});

// ROUTE 3: Fetch Outgoing Transactions (GET /api/transactions/out) - MISSING ROUTE FIX
app.get('/api/transactions/out', (req, res) => {
    // Selects only records where transaction_type is 'Out'
    const query = "SELECT * FROM transmittals WHERE transaction_type = 'Out'";
    db.query(query, (err, results) => {
        if (err) {
            console.error('Error fetching OUT transactions:', err);
            return res.status(500).send({ message: 'Internal Server Error' });
        }
        res.json(results);
    });
});

// ROUTE 4: Generic GET route (kept for completeness)
app.get('/api/transmittals', (req, res) => {
    db.query('SELECT * FROM transmittals', (err, results) => {
        if (err) {
            console.error('Error fetching transmittals:', err);
            return res.status(500).send({ message: 'Internal Server Error' });
        }
        res.json(results);
    });
});


// Server start
app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});