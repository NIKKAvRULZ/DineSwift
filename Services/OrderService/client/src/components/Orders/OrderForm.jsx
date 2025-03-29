import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import styles from './OrderForm.module.css';

const OrderForm = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const isEditing = Boolean(id);

  const [formData, setFormData] = useState({
    customerId: '',
    restaurantId: '',
    items: [{ name: '', price: '', quantity: '' }],
    totalAmount: '',
    status: 'Pending'
  });

  const [error, setError] = useState(null);

  useEffect(() => {
    if (isEditing) {
      fetchOrder();
    }
  }, [id]);

  const fetchOrder = async () => {
    try {
      const response = await fetch(`http://localhost:5003/api/orders/${id}`);
      if (!response.ok) throw new Error('Failed to fetch order');
      const data = await response.json();
      setFormData(data);
    } catch (err) {
      setError(err.message);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleItemChange = (index, field, value) => {
    const newItems = [...formData.items];
    newItems[index] = {
      ...newItems[index],
      [field]: value
    };
    setFormData(prev => ({
      ...prev,
      items: newItems
    }));
  };

  const addItem = () => {
    setFormData(prev => ({
      ...prev,
      items: [...prev.items, { name: '', price: '', quantity: '' }]
    }));
  };

  const removeItem = (index) => {
    setFormData(prev => ({
      ...prev,
      items: prev.items.filter((_, i) => i !== index)
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const url = isEditing 
        ? `http://localhost:5003/api/orders/${id}`
        : 'http://localhost:5003/api/orders';
      
      const method = isEditing ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      if (!response.ok) throw new Error('Failed to save order');
      
      navigate('/orders');
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <div className={styles.container}>
      <h2>{isEditing ? 'Edit Order' : 'Create New Order'}</h2>
      
      {error && <div className={styles.error}>{error}</div>}
      
      <form onSubmit={handleSubmit} className={styles.form}>
        <div className={styles.formGroup}>
          <label htmlFor="customerId">Customer ID</label>
          <input
            type="text"
            id="customerId"
            name="customerId"
            value={formData.customerId}
            onChange={handleChange}
            required
          />
        </div>

        <div className={styles.formGroup}>
          <label htmlFor="restaurantId">Restaurant ID</label>
          <input
            type="text"
            id="restaurantId"
            name="restaurantId"
            value={formData.restaurantId}
            onChange={handleChange}
            required
          />
        </div>

        <div className={styles.itemsSection}>
          <h3>Order Items</h3>
          {formData.items.map((item, index) => (
            <div key={index} className={styles.itemRow}>
              <input
                type="text"
                placeholder="Item name"
                value={item.name}
                onChange={(e) => handleItemChange(index, 'name', e.target.value)}
              />
              <input
                type="number"
                placeholder="Price"
                value={item.price}
                onChange={(e) => handleItemChange(index, 'price', e.target.value)}
              />
              <input
                type="number"
                placeholder="Quantity"
                value={item.quantity}
                onChange={(e) => handleItemChange(index, 'quantity', e.target.value)}
              />
              <button
                type="button"
                onClick={() => removeItem(index)}
                className={styles.removeButton}
              >
                Remove
              </button>
            </div>
          ))}
          <button
            type="button"
            onClick={addItem}
            className={styles.addButton}
          >
            Add Item
          </button>
        </div>

        <div className={styles.formGroup}>
          <label htmlFor="totalAmount">Total Amount</label>
          <input
            type="number"
            id="totalAmount"
            name="totalAmount"
            value={formData.totalAmount}
            onChange={handleChange}
            required
          />
        </div>

        {isEditing && (
          <div className={styles.formGroup}>
            <label htmlFor="status">Status</label>
            <select
              id="status"
              name="status"
              value={formData.status}
              onChange={handleChange}
            >
              <option value="Pending">Pending</option>
              <option value="Accepted">Accepted</option>
              <option value="Preparing">Preparing</option>
              <option value="On the Way">On the Way</option>
              <option value="Delivered">Delivered</option>
            </select>
          </div>
        )}

        <div className={styles.actions}>
          <button type="submit" className={styles.submitButton}>
            {isEditing ? 'Update Order' : 'Create Order'}
          </button>
          <button
            type="button"
            onClick={() => navigate('/orders')}
            className={styles.cancelButton}
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
};

export default OrderForm; 