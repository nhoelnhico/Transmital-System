const express = require('express');
const mysql = require('mysql');
const cors = require('cors');
const { Parser } = require('json2csv'); 

const app = express();
const port = 5000;

// =========================================================================
// DATABASE CONNECTION (XAMPP Default)
// =========================================================================
const db = mysql.createConnection({
  host: 'localhost', 
  user: 'root',      
  password: '', 
  database: 'transmittal_db'
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

// Helper function to convert DB results to CSV response
const generateCsvResponse = (res, results, filename) => {
    if (results.length === 0) {
        return res.status(404).send('No records found to download.');
    }
    try {
        const fields = Object.keys(results[0]);
        const json2csv = new Parser({ fields });
        const csv = json2csv.parse(results);

        res.header('Content-Type', 'text/csv');
        res.attachment(filename);
        res.send(csv);
    } catch (error) {
        console.error('Error converting to CSV:', error);
        res.status(500).send('Error generating CSV file.');
    }
};

// =========================================================================
// CORE DATA ROUTES
// =========================================================================

// ROUTE 1: Handle new transmittal records (POST)
app.post('/api/transmittals', (req, res) => {
  const { transaction_type, to, from, item_description, barcode_tag_number, signature_id, quantity, remarks } = req.body;
  
  if (!transaction_type || !to || !from || !item_description || !barcode_tag_number || !signature_id || !quantity) {
    return res.status(400).send({ message: 'All required fields are missing.' });
  }

  const query = `
    INSERT INTO transmittals 
    (transaction_type, to_entity, from_entity, item_description, barcode_tag_number, signature_id, quantity, remarks) 
    VALUES (?, ?, ?, ?, ?, ?, ?, ?)
  `;
  
  db.query(query, [transaction_type, to, from, item_description, barcode_tag_number, signature_id, quantity, remarks], (err, result) => {
    if (err) {
      console.error('Error adding record:', err);
      return res.status(500).send({ message: 'Internal Server Error' });
    }

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

// ROUTE 2: Fetch Incoming Transactions (GET /api/transactions/in)
app.get('/api/transactions/in', (req, res) => {
    const query = "SELECT * FROM transmittals WHERE transaction_type = 'In'";
    db.query(query, (err, results) => {
        if (err) {
            console.error('Error fetching IN transactions:', err);
            return res.status(500).send({ message: 'Internal Server Error' });
        }
        res.json(results);
    });
});

// ROUTE 3: Fetch Outgoing Transactions (GET /api/transactions/out)
app.get('/api/transactions/out', (req, res) => {
    const query = "SELECT * FROM transmittals WHERE transaction_type = 'Out'";
    db.query(query, (err, results) => {
        if (err) {
            console.error('Error fetching OUT transactions:', err);
            return res.status(500).send({ message: 'Internal Server Error' });
        }
        res.json(results);
    });
});

// ROUTE 4: Fetch All Activity Logs
app.get('/api/activity-logs', (req, res) => {
    const query = 'SELECT * FROM activity_logs ORDER BY timestamp DESC';
    db.query(query, (err, results) => {
        if (err) {
            console.error('Error fetching activity logs:', err);
            return res.status(500).send({ message: 'Internal Server Error' });
        }
        res.json(results);
    });
});

// ROUTE 5: Fetch Transaction History by ID 
app.get('/api/transactions/:id', (req, res) => {
    const historyId = req.params.id;
    const query = `
        SELECT * FROM transmittals 
        WHERE barcode_tag_number = ? OR signature_id = ?
    `;
    db.query(query, [historyId, historyId], (err, results) => {
        if (err) {
            console.error('Error fetching transaction history:', err);
            return res.status(500).send({ message: 'Internal Server Error' });
        }
        res.json(results);
    });
});

// ROUTE 6: Fetch Dashboard Counts (FIXES DASHBOARD)
app.get('/api/dashboard', async (req, res) => {
    const countInQuery = "SELECT COUNT(*) AS count_in FROM transmittals WHERE transaction_type = 'In'";
    const countOutQuery = "SELECT COUNT(*) AS count_out FROM transmittals WHERE transaction_type = 'Out'";

    const getCount = (query) => {
        return new Promise((resolve, reject) => {
            db.query(query, (err, results) => {
                if (err) return reject(err);
                resolve(results[0]);
            });
        });
    };

    try {
        const [inResult, outResult] = await Promise.all([
            getCount(countInQuery),
            getCount(countOutQuery)
        ]);

        res.json({
            count_in: inResult.count_in,
            count_out: outResult.count_out
        });

    } catch (error) {
        console.error('Error fetching dashboard counts:', error);
        res.status(500).send({ message: 'Internal Server Error fetching counts.' });
    }
});


// =========================================================================
// CSV DOWNLOAD ROUTES
// =========================================================================

// ROUTE 7: Download ALL Transmittals as CSV
app.get('/api/transmittals/download/all', (req, res) => {
    const query = 'SELECT * FROM transmittals';
    db.query(query, (err, results) => {
        if (err) {
            console.error('Error fetching data for CSV:', err);
            return res.status(500).send('Database error.');
        }
        generateCsvResponse(res, results, 'all_records.csv');
    });
});

// ROUTE 8: Download Transaction History by ID as CSV
app.get('/api/transactions/:id/download', (req, res) => {
    const historyId = req.params.id;
    const query = `
        SELECT * FROM transmittals 
        WHERE barcode_tag_number = ? OR signature_id = ?
    `;
    
    db.query(query, [historyId, historyId], (err, results) => {
        if (err) {
            console.error('Error fetching data for history CSV:', err);
            return res.status(500).send('Database error.');
        }
        generateCsvResponse(res, results, `history_${historyId}.csv`);
    });
});

// ROUTE 9: Download Search Results as CSV
app.get('/api/search/download', (req, res) => {
    const searchQuery = req.query.query || '';
    
    if (searchQuery.trim() === '') {
        return res.redirect('/api/transmittals/download/all');
    }

    const searchPattern = `%${searchQuery}%`;
    const query = `
        SELECT * FROM transmittals 
        WHERE 
            to_entity LIKE ? OR 
            from_entity LIKE ? OR 
            item_description LIKE ? OR 
            barcode_tag_number LIKE ? OR 
            signature_id LIKE ? OR 
            quantity LIKE ?
    `;
    const params = [searchPattern, searchPattern, searchPattern, searchPattern, searchPattern, searchPattern];

    db.query(query, params, (err, results) => {
        if (err) {
            console.error('Error fetching search data for CSV:', err);
            return res.status(500).send('Database error.');
        }
        generateCsvResponse(res, results, 'search_results.csv');
    });
});


// Server start
app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});