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
  });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.id]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.post('/api/transmittals', formData);
      alert(response.data.message);
      setFormData({
        transaction_type: 'In',
        to: '',
        from: '',
        item_description: '',
        barcode_tag_number: '',
        signature_id: '',
      });
      onTransactionAdded(); // Call a function passed from parent to refresh data
    } catch (error) {
      alert('Error submitting transaction.');
      console.error(error);
    }
  };

  return (
    <section id="forms">
      <h2>Record a Transaction</h2>
      <form onSubmit={handleSubmit}>
        {/* ... form inputs with value={formData.field} and onChange={handleChange} */}
        <button type="submit">Submit Record</button>
      </form>
    </section>
  );
}

export default TransactionForm;