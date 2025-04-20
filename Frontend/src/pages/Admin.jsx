import React, { useEffect, useState } from "react";
import axios from "axios";

const Admin = () => {
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Fetch all payments
  useEffect(() => {
    const fetchPayments = async () => {
      try {
        const response = await axios.get("http://localhost:5005/api/payment/payments");
        setPayments(response.data.payments); // Adjusted to match API response
      } catch (err) {
        setError("Failed to fetch payments");
      } finally {
        setLoading(false);
      }
    };
    fetchPayments();
  }, []);

  // Update payment status
  const updatePaymentStatus = async (id, status) => {
    try {
      await axios.put(`http://localhost:5005/api/payment/${id}`, { status });
      setPayments(payments.map(p => (p._id === id ? { ...p, status } : p)));
    } catch (err) {
      alert("Failed to update payment status");
    }
  };

  // Delete a payment
  const deletePayment = async (id) => {
    try {
      await axios.delete(`http://localhost:5005/api/payment/${id}`);
      setPayments(payments.filter(p => p._id !== id));
    } catch (err) {
      alert("Failed to delete payment");
    }
  };

  if (loading) return <p>Loading...</p>;
  if (error) return <p>{error}</p>;

  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-4">Admin Payment Dashboard</h1>
      <table className="w-full border-collapse border border-gray-300">
        <thead>
          <tr className="bg-gray-100">
            <th className="border p-2">Amount (USD)</th>
            <th className="border p-2">Payment Method</th>
            <th className="border p-2">Status</th>
            <th className="border p-2">Customer</th>
            <th className="border p-2">Created At</th>
            <th className="border p-2">Actions</th>
          </tr>
        </thead>
        <tbody>
          {payments.map((payment, index) => (
            <tr key={index} className="text-center border-b">
              <td className="border p-2">${(payment.amount / 100).toFixed(2)}</td>
              <td className="border p-2">{payment.paymentMethod}</td>
              <td className="border p-2">
                <select
                  value={payment.status}
                  onChange={(e) => updatePaymentStatus(payment._id, e.target.value)}
                  className="border p-1 rounded"
                >
                  <option value="succeeded">Succeeded</option>
                  <option value="pending">Pending</option>
                  <option value="failed">Failed</option>
                  <option value="requires_payment_method">Requires Payment Method</option>
                </select>
              </td>
              <td className="border p-2">{payment.customer}</td>
              <td className="border p-2">{payment.createdAt}</td>
              <td className="border p-2">
                <button
                  onClick={() => deletePayment(payment._id)}
                  className="bg-red-500 text-white px-2 py-1 rounded"
                >
                  Delete
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default Admin;
