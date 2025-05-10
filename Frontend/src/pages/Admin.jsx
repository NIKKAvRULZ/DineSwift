import React, { useEffect, useState } from "react";
import axios from "axios";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const Admin = () => {
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [retryCount, setRetryCount] = useState(0);
  const [confirmModal, setConfirmModal] = useState({
    isOpen: false,
    title: "",
    message: "",
    action: null,
    type: "info", // info, warning, danger, success
  });
  const maxRetries = 3;

  // Fetch all payments
  useEffect(() => {
    const fetchPayments = async () => {
      try {
        const response = await axios.get("http://localhost:5005/api/payment/payments", {
          timeout: 5000,
        });
        console.log("Fetched payments:", response.data);
        setPayments(Array.isArray(response.data.data) ? response.data.data : []);
        setError(null);
      } catch (err) {
        const errorMessage = err.response
          ? `Failed to fetch payments: ${err.response.status} ${err.response.data.error || err.message}`
          : `Failed to fetch payments: ${err.message}`;
        console.error("Error fetching payments:", err);
        setError(errorMessage);
        if (retryCount < maxRetries) {
          setTimeout(() => {
            setRetryCount(retryCount + 1);
          }, 2000);
        }
      } finally {
        setLoading(false);
      }
    };
    fetchPayments();
  }, [retryCount]);

  // Show confirmation modal
  const showConfirmation = (title, message, action, type = "info") => {
    setConfirmModal({
      isOpen: true,
      title,
      message,
      action,
      type,
    });
  };

  // Update payment status with custom confirmation
  const updatePaymentStatus = async (id, status) => {
    showConfirmation(
      "Update Payment Status",
      `Are you sure you want to update this payment's status to ${status}?`,
      async () => {
        try {
          console.log(`Updating payment ${id} to status: ${status}`);
          const response = await axios.put(`http://localhost:5005/api/payment/payments/${id}`, { status });
          setPayments(payments.map(p => (p._id === id ? { ...p, status: status } : p)));
          toast.success("Payment status updated successfully!", {
            position: "top-right",
            autoClose: 3000,
            hideProgressBar: false,
            closeOnClick: true,
            pauseOnHover: true,
            draggable: true,
          });
        } catch (err) {
          const errorMessage = err.response
            ? `Failed to update payment: ${err.response.status} ${err.response.data.error || err.message}`
            : `Failed to update payment: ${err.message}`;
          toast.error(errorMessage, {
            position: "top-right",
            autoClose: 3000,
            hideProgressBar: false,
            closeOnClick: true,
            pauseOnHover: true,
            draggable: true,
          });
          console.error("Error updating payment:", err);
        }
      },
      "info"
    );
  };

  // Process refund with custom confirmation
  const processRefund = async (id) => {
    showConfirmation(
      "Process Refund",
      "Are you sure you want to refund this payment?",
      async () => {
        try {
          console.log(`Processing refund for payment ${id}`);
          await axios.post(`http://localhost:5005/api/payment/stripe/refund/${id}`);
          setPayments(payments.map(p => (p._id === id ? { ...p, status: "refunded" } : p)));
          toast.success("Payment refunded successfully!", {
            position: "top-right",
            autoClose: 3000,
            hideProgressBar: false,
            closeOnClick: true,
            pauseOnHover: true,
            draggable: true,
          });
        } catch (err) {
          const errorMessage = err.response
            ? `Failed to process refund: ${err.response.status} ${err.response.data.error || err.message}`
            : `Failed to process refund: ${err.message}`;
          toast.error(errorMessage, {
            position: "top-right",
            autoClose: 3000,
            hideProgressBar: false,
            closeOnClick: true,
            pauseOnHover: true,
            draggable: true,
          });
          console.error("Error processing refund:", err);
        }
      },
      "warning"
    );
  };

  // Delete a payment with custom confirmation
  const deletePayment = async (id) => {
    showConfirmation(
      "Delete Payment",
      "Are you sure you want to delete this payment? This action cannot be undone.",
      async () => {
        try {
          console.log(`Deleting payment ${id}`);
          await axios.delete(`http://localhost:5005/api/payment/payments/${id}`);
          setPayments(payments.filter(p => p._id !== id));
          toast.success("Payment deleted successfully!", {
            position: "top-right",
            autoClose: 3000,
            hideProgressBar: false,
            closeOnClick: true,
            pauseOnHover: true,
            draggable: true,
          });
        } catch (err) {
          const errorMessage = err.response
            ? `Failed to delete payment: ${err.response.status} ${err.response.data.error || err.message}`
            : `Failed to delete payment: ${err.message}`;
          toast.error(errorMessage, {
            position: "top-right",
            autoClose: 3000,
            hideProgressBar: false,
            closeOnClick: true,
            pauseOnHover: true,
            draggable: true,
          });
          console.error("Error deleting payment:", err);
        }
      },
      "danger"
    );
  };

  // Format date for display
  const formatDate = (dateString) => {
    if (!dateString) return "N/A";
    return new Date(dateString).toLocaleString();
  };

  // Custom Modal Component with improved styling
  const ConfirmationModal = () => {
    if (!confirmModal.isOpen) return null;

    const modalColors = {
      info: "border-blue-400 text-blue-700",
      warning: "border-yellow-400 text-yellow-700",
      danger: "border-red-400 text-red-700",
      success: "border-green-400 text-green-700",
    };

    const buttonColors = {
      info: "bg-blue-500 hover:bg-blue-600",
      warning: "bg-yellow-500 hover:bg-yellow-600",
      danger: "bg-red-500 hover:bg-red-600",
      success: "bg-green-500 hover:bg-green-600",
    };

    const headerColors = {
      info: "text-blue-600 border-blue-200 bg-blue-50",
      warning: "text-yellow-600 border-yellow-200 bg-yellow-50",
      danger: "text-red-600 border-red-200 bg-red-50",
      success: "text-green-600 border-green-200 bg-green-50",
    };

    const iconTypes = {
      info: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
        </svg>
      ),
      warning: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"></path>
        </svg>
      ),
      danger: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
        </svg>
      ),
      success: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path>
        </svg>
      ),
    };

    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center">
        <div className="fixed inset-0 bg-gray-600 bg-opacity-20" onClick={() => setConfirmModal({ ...confirmModal, isOpen: false })}></div>
        <div className={`relative w-full max-w-md bg-white rounded-lg shadow-xl border ${modalColors[confirmModal.type]} animate-fadeIn`}>
          <div className={`px-6 py-4 border-b ${headerColors[confirmModal.type]} rounded-t-lg flex items-center`}>
            <span className="mr-3">{iconTypes[confirmModal.type]}</span>
            <h3 className="text-lg font-semibold">{confirmModal.title}</h3>
          </div>
          <div className="p-6">
            <p className="mb-6 text-gray-700">{confirmModal.message}</p>
            <div className="flex justify-end space-x-3">
              <button
                onClick={() => setConfirmModal({ ...confirmModal, isOpen: false })}
                className="px-4 py-2 text-gray-600 bg-gray-100 rounded-md hover:bg-gray-200 transition duration-200 border border-gray-300"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  confirmModal.action();
                  setConfirmModal({ ...confirmModal, isOpen: false });
                }}
                className={`px-4 py-2 text-white rounded-md ${buttonColors[confirmModal.type]} transition duration-200`}
              >
                Confirm
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  };

  if (loading) return (
    <div className="flex justify-center items-center h-screen">
      <div className="animate-spin rounded-full h-12 w-12 border-t-4 border-blue-500"></div>
    </div>
  );

  if (error) return (
    <div className="p-6 max-w-4xl mx-auto text-center">
      <div className="text-red-500 text-lg font-semibold">{error}</div>
      <button
        onClick={() => {
          setLoading(true);
          setError(null);
          setRetryCount(retryCount + 1);
        }}
        className="mt-4 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition duration-300"
      >
        Retry
      </button>
    </div>
  );

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <div className="bg-gradient-to-r from-red-300 to-white-300 rounded-lg shadow-lg p-6 mb-8">
        <h1 className="text-3xl font-bold text-black">Admin</h1>
        <p className="text-white-100 mt-2">Payment Management System</p>
      </div>
      
      <ToastContainer />
      <ConfirmationModal />
      
      {payments.length === 0 ? (
        <div className="bg-white rounded-lg shadow-md p-12 text-center">
          <svg className="w-16 h-16 mx-auto text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01"></path>
          </svg>
          <p className="text-gray-500 text-lg mt-4">No payments found.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6">
          {payments.map(payment => (
            <div
              key={payment._id}
              className="bg-white rounded-lg shadow-md overflow-hidden border border-gray-200 hover:shadow-lg transition-shadow duration-300"
            >
              <div className="bg-gradient-to-r from-gray-50 to-blue-50 px-6 py-4 border-b border-gray-200">
                <div className="flex justify-between items-center">
                  <div className="font-semibold text-gray-700 truncate">
                    ID: {payment._id.substring(0, 10)}...
                  </div>
                  <div className={`px-3 py-1 rounded-full text-xs font-medium
                    ${payment.status === 'succeeded' ? 'bg-green-100 text-green-800' : 
                      payment.status === 'refunded' ? 'bg-gray-100 text-gray-800' :
                      payment.status === 'failed' ? 'bg-red-100 text-red-800' : 
                      'bg-yellow-100 text-yellow-800'}`}>
                    {payment.status || "pending"}
                  </div>
                </div>
              </div>
              
              <div className="p-6">
                <div className="space-y-4">
                  <div className="flex justify-between">
                    <div className="w-1/2">
                      <span className="text-xs font-semibold text-gray-500 uppercase">Amount</span>
                      <p className="text-lg font-bold text-gray-800">
                        {payment.amount ? Number(payment.amount).toFixed(2) : "0.00"} {payment.currency || "USD"}
                      </p>
                    </div>
                    <div className="w-1/2 text-right">
                      <span className="text-xs font-semibold text-gray-500 uppercase">Method</span>
                      <p className="text-gray-800">{payment.paymentMethod || "N/A"}</p>
                    </div>
                  </div>
                  
                  <div>
                    <span className="text-xs font-semibold text-gray-500 uppercase">Transaction ID</span>
                    <p className="text-gray-800 truncate">{payment.transactionId || "N/A"}</p>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <span className="text-xs font-semibold text-gray-500 uppercase">Customer ID</span>
                      <p className="text-gray-800 truncate">{payment.customerId || "N/A"}</p>
                    </div>
                    <div>
                      <span className="text-xs font-semibold text-gray-500 uppercase">Order ID</span>
                      <p className="text-gray-800 truncate">{payment.orderId || "N/A"}</p>
                    </div>
                  </div>
                  
                  <div>
                    <span className="text-xs font-semibold text-gray-500 uppercase">Restaurant ID</span>
                    <p className="text-gray-800 truncate">{payment.restaurantId || "N/A"}</p>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <span className="text-xs font-semibold text-gray-500 uppercase">Created</span>
                      <p className="text-sm text-gray-800">{formatDate(payment.createdAt)}</p>
                    </div>
                    <div>
                      <span className="text-xs font-semibold text-gray-500 uppercase">Updated</span>
                      <p className="text-sm text-gray-800">{formatDate(payment.updatedAt)}</p>
                    </div>
                  </div>
                  
                  <div>
                    <span className="text-xs font-semibold text-gray-500 uppercase">Status Control</span>
                    <select
                      onChange={(e) => {
                        if (e.target.value) updatePaymentStatus(payment._id, e.target.value);
                        e.target.value = "";
                      }}
                      className="mt-1 block w-full bg-gray-50 border border-gray-300 rounded-md py-2 px-3 shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 text-sm"
                      value=""
                    >
                      <option value="" disabled>Update Status...</option>
                      <option value="pending">Set Pending</option>
                      <option value="succeeded">Set Succeeded</option>
                      <option value="failed">Set Failed</option>
                    </select>
                  </div>
                </div>
                
                <div className="flex justify-between space-x-3 mt-6">
                  {payment.status === 'succeeded' && (
                    <button
                      onClick={() => processRefund(payment._id)}
                      className="flex-1 bg-yellow-500 text-white px-4 py-2 rounded-md hover:bg-yellow-600 transition duration-300 text-sm flex items-center justify-center"
                    >
                      <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 10h10a8 8 0 018 8v2M3 10l6 6m-6-6l6-6" />
                      </svg>
                      Refund
                    </button>
                  )}
                  <button
                    onClick={() => deletePayment(payment._id)}
                    className="flex-1 bg-red-500 text-white px-4 py-2 rounded-md hover:bg-red-600 transition duration-300 text-sm flex items-center justify-center"
                  >
                    <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                    Delete
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Admin;