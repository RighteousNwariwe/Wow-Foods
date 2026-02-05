import React, { useState } from 'react';
import './OrderManagement.css';

const OrderManagement = ({ orders, updateOrderStatus, deleteOrder }) => {
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [filterStatus, setFilterStatus] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [showOrderDetails, setShowOrderDetails] = useState(false);

  const filteredOrders = orders.filter(order => {
    const matchesStatus = filterStatus === 'all' || order.status === filterStatus;
    const matchesSearch = searchTerm === '' ||
      (order.customerName && order.customerName.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (order.customerEmail && order.customerEmail.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (order.id && order.id.toLowerCase().includes(searchTerm.toLowerCase()));

    return matchesStatus && matchesSearch;
  });

  const getStatusColor = (status) => {
    switch (status) {
      case 'pending': return '#FFA500';
      case 'pending_payment': return '#FFD700';
      case 'confirmed': return '#4CAF50';
      case 'preparing': return '#2196F3';
      case 'ready': return '#9C27B0';
      case 'delivered': return '#8BC34A';
      case 'cancelled': return '#F44336';
      default: return '#666';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'pending': return '⏳';
      case 'pending_payment': return '💳';
      case 'confirmed': return '✅';
      case 'preparing': return '👨‍🍳';
      case 'ready': return '🍱';
      case 'delivered': return '🚚';
      case 'cancelled': return '❌';
      default: return '📋';
    }
  };

  const handleOrderClick = (order) => {
    setSelectedOrder(order);
    setShowOrderDetails(true);
  };

  const handleStatusUpdate = async (orderId, newStatus) => {
    try {
      await updateOrderStatus(orderId, newStatus);
    } catch (error) {
      console.error('Error updating order status:', error);
    }
  };

  const handleApprovePayment = async (order) => {
    try {
      // Generate proper order number
      const today = new Date();
      const dateStr = today.getFullYear().toString() +
        (today.getMonth() + 1).toString().padStart(2, '0') +
        today.getDate().toString().padStart(2, '0');
      const randomNum = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
      const orderNumber = `WF${dateStr}${randomNum}`;

      // Update order with proper order number and status
      await updateOrderStatus(order.id, 'confirmed', { orderNumber });
    } catch (error) {
      console.error('Error approving payment:', error);
    }
  };

  const handleDeleteOrder = async (orderId) => {
    if (window.confirm('Are you sure you want to delete this order?')) {
      try {
        await deleteOrder(orderId);
      } catch (error) {
        console.error('Error deleting order:', error);
      }
    }
  };

  const formatCurrency = (amount) => {
    return `R${parseFloat(amount || 0).toFixed(2)}`;
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleString();
  };

  const statusCounts = orders.reduce((acc, order) => {
    acc[order.status || 'pending'] = (acc[order.status || 'pending'] || 0) + 1;
    return acc;
  }, {});

  return (
    <div className="order-management">
      <div className="order-header">
        <h2>Order Management</h2>
        <div className="order-stats">
          {Object.entries(statusCounts).map(([status, count]) => (
            <div key={status} className="stat-card">
              <span className="stat-icon">{getStatusIcon(status)}</span>
              <div className="stat-info">
                <span className="stat-count">{count}</span>
                <span className="stat-label">{status.replace('_', ' ')}</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="order-controls">
        <div className="search-box">
          <input
            type="text"
            placeholder="Search orders..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="search-input"
          />
        </div>
        <div className="filter-controls">
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="filter-select"
          >
            <option value="all">All Orders</option>
            <option value="pending">Pending</option>
            <option value="pending_payment">Pending Payment</option>
            <option value="confirmed">Confirmed</option>
            <option value="preparing">Preparing</option>
            <option value="ready">Ready</option>
            <option value="delivered">Delivered</option>
            <option value="cancelled">Cancelled</option>
          </select>
        </div>
      </div>

      <div className="orders-grid">
        {filteredOrders.map(order => (
          <div key={order.id} className="order-card">
            <div className="order-card-header">
              <div className="order-info">
                <h3>#{order.id?.slice(-6) || order.orderNumber}</h3>
                <p className="customer-name">{order.customerName || order.name}</p>
                <p className="customer-email">{order.customerEmail || order.email}</p>
              </div>
              <div className="order-status">
                <span
                  className="status-badge"
                  style={{ backgroundColor: getStatusColor(order.status) }}
                >
                  {getStatusIcon(order.status)} {order.status?.replace('_', ' ') || 'pending'}
                </span>
              </div>
            </div>

            <div className="order-details">
              <div className="order-total">
                <span>Total: </span>
                <strong>{formatCurrency(order.total)}</strong>
              </div>
              <div className="order-date">
                <span>{formatDate(order.createdAt || order.date)}</span>
              </div>
              {order.paymentProof && (
                <div className="payment-proof">
                  <button
                    onClick={() => window.open(order.paymentProof, '_blank')}
                    className="proof-btn"
                  >
                    📄 View Payment Proof
                  </button>
                </div>
              )}
            </div>

            <div className="order-items-preview">
              <h4>Items:</h4>
              {order.items?.slice(0, 3).map((item, index) => (
                <div key={index} className="item-preview">
                  <span>{item.name} x {item.quantity}</span>
                  <span>{formatCurrency(item.price * item.quantity)}</span>
                </div>
              ))}
              {order.items?.length > 3 && (
                <div className="more-items">
                  +{order.items.length - 3} more items
                </div>
              )}
            </div>

            <div className="order-actions">
              <button
                onClick={() => handleOrderClick(order)}
                className="view-details-btn"
              >
                📋 View Details
              </button>
              {order.status === 'pending_payment' && (
                <button
                  onClick={() => handleApprovePayment(order)}
                  className="approve-payment-btn"
                >
                  ✅ Approve Payment
                </button>
              )}
              <select
                value={order.status || 'pending'}
                onChange={(e) => handleStatusUpdate(order.id, e.target.value)}
                className="status-select"
              >
                <option value="pending">Pending</option>
                <option value="pending_payment">Pending Payment</option>
                <option value="confirmed">Confirmed</option>
                <option value="preparing">Preparing</option>
                <option value="ready">Ready</option>
                <option value="delivered">Delivered</option>
                <option value="cancelled">Cancelled</option>
              </select>
              <button
                onClick={() => handleDeleteOrder(order.id)}
                className="delete-btn"
              >
                🗑️ Delete
              </button>
            </div>
          </div>
        ))}
      </div>

      {filteredOrders.length === 0 && (
        <div className="no-orders">
          <h3>No orders found</h3>
          <p>Try adjusting your search or filter criteria</p>
        </div>
      )}

      {/* Order Details Modal */}
      {showOrderDetails && selectedOrder && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="modal-header">
              <h3>Order Details - #{selectedOrder.id?.slice(-6) || selectedOrder.orderNumber}</h3>
              <button
                onClick={() => setShowOrderDetails(false)}
                className="close-btn"
              >
                ×
              </button>
            </div>
            <div className="modal-body">
              <div className="order-info-grid">
                <div className="info-section">
                  <h4>Customer Information</h4>
                  <p><strong>Name:</strong> {selectedOrder.customerName || selectedOrder.name}</p>
                  <p><strong>Email:</strong> {selectedOrder.customerEmail || selectedOrder.email}</p>
                  <p><strong>Phone:</strong> {selectedOrder.phoneNumber || 'Not provided'}</p>
                  <p><strong>Location:</strong> {selectedOrder.location || 'Not provided'}</p>
                </div>
                <div className="info-section">
                  <h4>Order Information</h4>
                  <p><strong>Status:</strong> {selectedOrder.status?.replace('_', ' ') || 'pending'}</p>
                  <p><strong>Total:</strong> {formatCurrency(selectedOrder.total)}</p>
                  <p><strong>Date:</strong> {formatDate(selectedOrder.createdAt || selectedOrder.date)}</p>
                  <p><strong>Payment Method:</strong> {selectedOrder.paymentMethod || 'Not specified'}</p>
                </div>
              </div>

              <div className="order-items-full">
                <h4>Order Items</h4>
                {selectedOrder.items?.map((item, index) => (
                  <div key={index} className="item-row">
                    <div className="item-info">
                      <span className="item-name">{item.name}</span>
                      <span className="item-quantity">x {item.quantity}</span>
                    </div>
                    <span className="item-price">{formatCurrency(item.price * item.quantity)}</span>
                  </div>
                ))}
                <div className="order-total-row">
                  <strong>Total:</strong>
                  <strong>{formatCurrency(selectedOrder.total)}</strong>
                </div>
              </div>

              {selectedOrder.paymentProof && (
                <div className="payment-proof-section">
                  <h4>Payment Proof</h4>
                  <button
                    onClick={() => window.open(selectedOrder.paymentProof, '_blank')}
                    className="proof-btn-large"
                  >
                    📄 View Payment Proof
                  </button>
                </div>
              )}
            </div>
            <div className="modal-actions">
              <select
                value={selectedOrder.status || 'pending'}
                onChange={(e) => {
                  handleStatusUpdate(selectedOrder.id, e.target.value);
                  setSelectedOrder({ ...selectedOrder, status: e.target.value });
                }}
                className="status-select-large"
              >
                <option value="pending">Pending</option>
                <option value="pending_payment">Pending Payment</option>
                <option value="confirmed">Confirmed</option>
                <option value="preparing">Preparing</option>
                <option value="ready">Ready</option>
                <option value="delivered">Delivered</option>
                <option value="cancelled">Cancelled</option>
              </select>
              <button
                onClick={() => {
                  handleDeleteOrder(selectedOrder.id);
                  setShowOrderDetails(false);
                }}
                className="delete-btn-large"
              >
                🗑️ Delete Order
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default OrderManagement;
