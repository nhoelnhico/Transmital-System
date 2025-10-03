import React, { useState } from 'react';
import axios from 'axios';

function TransactionForm({ onTransactionAdded }) {
  const [formData, setFormData] = useState({
    transaction_type: 'In',
    to: '',
    from: '',
    item_description: '',
    barcode_tag_number: '',
    signature_id: '',
    quantity: '',
    remarks: '' // <-- ADDED: Initial state for remarks
  });

  const handleChange = (e) => {
    const { id, value } = e.target;
    setFormData({ ...formData, [id]: value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.post('/api/transmittals', formData);
      alert(response.data.message);
      if (response.status === 201) {
        setFormData({
          transaction_type: 'In',
          to: '',
          from: '',
          item_description: '',
          barcode_tag_number: '',
          signature_id: '',
          quantity: '',
          remarks: '' // <-- ADDED: Reset remarks field
        });
        onTransactionAdded();
      }
    } catch (error) {
      alert('Error submitting transaction.');
      console.error(error);
    }
  };

  return (
    <section id="transaction-form-section">
      <h2>Record a Transaction</h2>
      <form onSubmit={handleSubmit}>
        <label htmlFor="transaction_type">Transaction Type:</label>
        <select id="transaction_type" value={formData.transaction_type} onChange={handleChange} required>
          <option value="In">In</option>
          <option value="Out">Out</option>
        </select>
        
        <label htmlFor="to">To:</label>
        <input type="text" id="to" value={formData.to} onChange={handleChange} required />
        
        <label htmlFor="from">From:</label>
        <input type="text" id="from" value={formData.from} onChange={handleChange} required />
        
        <label htmlFor="item_description">Item Description:</label>
        <textarea id="item_description" value={formData.item_description} onChange={handleChange} required></textarea>
        
        <label htmlFor="barcode_tag_number">Barcode / Tagging Number:</label>
        <input type="text" id="barcode_tag_number" value={formData.barcode_tag_number} onChange={handleChange} required />
        
        <label htmlFor="quantity">Quantity:</label>
        <input type="number" id="quantity" value={formData.quantity} onChange={handleChange} required />
        
        <label htmlFor="signature_id">Signature ID:</label>
        <input type="text" id="signature_id" value={formData.signature_id} onChange={handleChange} required />
        
        {/* <-- ADDED: Remarks Field --> */}
        <label htmlFor="remarks">Remarks (Optional):</label>
        <textarea 
            id="remarks" 
            value={formData.remarks} 
            onChange={handleChange}>
        </textarea>
        
        <button type="submit">Submit Record</button>
      </form>
    </section>
  );
}

export default TransactionForm;