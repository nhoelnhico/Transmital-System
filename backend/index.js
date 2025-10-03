app.post('/api/transmittals', (req, res) => {
  // Destructure the new 'remarks' field
  const { transaction_type, to, from, item_description, barcode_tag_number, signature_id, quantity, remarks } = req.body;
  
  // Keep the existing required field checks (Remarks is optional)
  if (!transaction_type || !to || !from || !item_description || !barcode_tag_number || !signature_id || !quantity) {
    return res.status(400).send({ message: 'All fields are required.' });
  }

  const query = 'INSERT INTO transmittals (transaction_type, to_entity, from_entity, item_description, barcode_tag_number, signature_id, quantity, remarks) VALUES (?, ?, ?, ?, ?, ?, ?, ?)';
  
  // Add 'remarks' to the array of values
  db.query(query, [transaction_type, to, from, item_description, barcode_tag_number, signature_id, quantity, remarks], (err, result) => {
    if (err) {
      console.error('Error adding record:', err);
      return res.status(500).send({ message: 'Internal Server Error' });
    }
    // Update the log action to reflect the new field if needed, otherwise leave it as is
    const logAction = `Added new '${transaction_type}' record for item: ${barcode_tag_number} (Qty: ${quantity})`;
    db.query('INSERT INTO activity_logs (action) VALUES (?)', [logAction]);
    
    res.status(201).send({ message: 'Record added successfully!', id: result.insertId });
  });
});