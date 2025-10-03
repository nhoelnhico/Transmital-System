const express = require('express');
const mysql = require('mysql');
const cors = require('cors');

const app = express();
const port = 5000; // NOTE: Port updated from 3000 to 5000

// Database connection setup (Use your actual credentials)
const db = mysql.createConnection({
host: 'localhost', 
 user: 'root', 
password: '', // Correct for XAMPP (no password)
database: 'transmittal_db'  // Correct Database Name
});

db.connect(err => {
  if (err) {
    console.error('Error connecting to MySQL:', err);
    return;
  }
  console.log('Connected to MySQL Database.');
});

// Middleware
app.use(cors());
app.use(express.json());

// Route to handle new transmittal records
app.post('/api/transmittals', (req, res) => {
  // 1. UPDATED: Destructure 'remarks' from the request body
  const { transaction_type, to, from, item_description, barcode_tag_number, signature_id, quantity, remarks } = req.body;
  
  // Basic validation (Remarks is optional)
  if (!transaction_type || !to || !from || !item_description || !barcode_tag_number || !signature_id || !quantity) {
    return res.status(400).send({ message: 'All required fields are missing.' });
  }

  // 2. UPDATED: Insert query to include the 'remarks' column
  const query = `
    INSERT INTO transmittals 
    (transaction_type, to_entity, from_entity, item_description, barcode_tag_number, signature_id, quantity, remarks) 
    VALUES (?, ?, ?, ?, ?, ?, ?, ?)
  `;
  
  // 3. UPDATED: Values array includes 'remarks'
  db.query(query, [transaction_type, to, from, item_description, barcode_tag_number, signature_id, quantity, remarks], (err, result) => {
    if (err) {
      console.error('Error adding record:', err);
      return res.status(500).send({ message: 'Internal Server Error' });
    }

    // 4. UPDATED: Activity Logging to include remarks
    let logAction = `Added new '${transaction_type}' record for item: ${barcode_tag_number} (Qty: ${quantity})`;
    
    // Conditionally add remarks to the log entry
    if (remarks && remarks.trim() !== '') {
        logAction += ` | Remarks: "${remarks.trim()}"`;
    }
    
    db.query('INSERT INTO activity_logs (action) VALUES (?)', [logAction], (logErr) => {
      if (logErr) {
        console.error('Error logging activity:', logErr);
        // Do not fail the main request because of a log error
      }
    });
    
    res.status(201).send({ message: 'Record added successfully!', id: result.insertId });
  });
});

// Example GET route for transmittals (Add other routes as needed)
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