import React, { useState, useEffect } from 'react';
import { useCart } from '../context/CartContext';
import './AdminOrders.css';

const AdminOrders = () => {
  const { orders, updateOrderStatus } = useCart();
  const [filteredOrders, setFilteredOrders] = useState([]);
  const [statusFilter, setStatusFilter] = useState('all');
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [showProofModal, setShowProofModal] = useState(false);

  const [orderCounts, setOrderCounts] = useState({
    all: 0,
    pending: 0,
    verified: 0,
    in_preparation: 0,
    delivered: 0
  });

  // Get all orders from localStorage
  const getAllOrders = () => {
    try {
      return JSON.parse(localStorage.getItem('woowFoodsOrders') || '[]');
    } catch {
      return [];
    }
  };

  // Load and sync orders from localStorage to ensure we have the latest data
  useEffect(() => {
    const storedOrders = getAllOrders();
    // Sort orders by date (newest first)
    const sortedOrders = [...storedOrders].sort((a, b) => {
      const dateA = new Date(a.date || 0);
      const dateB = new Date(b.date || 0);
      return dateB - dateA;
    });
    
    // Update counts
    setOrderCounts({
      all: sortedOrders.length,
      pending: sortedOrders.filter(o => o.status === 'pending').length,
      verified: sortedOrders.filter(o => o.status === 'verified').length,
      in_preparation: sortedOrders.filter(o => o.status === 'in_preparation').length,
      delivered: sortedOrders.filter(o => o.status === 'delivered').length
    });
    
    // Update filtered orders
    if (statusFilter === 'all') {
      setFilteredOrders(sortedOrders);
    } else {
      setFilteredOrders(sortedOrders.filter(order => order.status === statusFilter));
    }
  }, [statusFilter, orders]);

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-ZA', {
      weekday: 'short',
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const handleStatusChange = (orderId, newStatus) => {
    let verified = null;
    if (newStatus === 'verified') {
      verified = true;
    }
    
    // Update via context (which also updates localStorage)
    updateOrderStatus(orderId, newStatus, verified);
    
    // Force refresh by updating filtered orders
    setTimeout(() => {
      const storedOrders = getAllOrders();
      const sortedOrders = [...storedOrders].sort((a, b) => {
        const dateA = new Date(a.date || 0);
        const dateB = new Date(b.date || 0);
        return dateB - dateA;
      });
      
      setOrderCounts({
        all: sortedOrders.length,
        pending: sortedOrders.filter(o => o.status === 'pending').length,
        verified: sortedOrders.filter(o => o.status === 'verified').length,
        in_preparation: sortedOrders.filter(o => o.status === 'in_preparation').length,
        delivered: sortedOrders.filter(o => o.status === 'delivered').length
      });
      
      if (statusFilter === 'all') {
        setFilteredOrders(sortedOrders);
      } else {
        setFilteredOrders(sortedOrders.filter(order => order.status === statusFilter));
      }
    }, 100);
  };

  const handleViewProof = (order) => {
    setSelectedOrder(order);
    setShowProofModal(true);
  };

  const getStatusClass = (status) => {
    switch (status) {
      case 'verified':
        return 'status-verified';
      case 'in_preparation':
        return 'status-preparation';
      case 'delivered':
        return 'status-delivered';
      case 'pending':
      default:
        return 'status-pending';
    }
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'verified':
        return '✅ Verified';
      case 'in_preparation':
        return '👨‍🍳 In Preparation';
      case 'delivered':
        return '🚚 Delivered';
      case 'pending':
      default:
        return '⏳ Pending';
    }
  };

  return (
    <div className="admin-orders-page">
      <div className="container">
        <div className="admin-header">
          <h1>📋 Order Management</h1>
          <p className="admin-subtitle">View and verify customer orders</p>
        </div>

        <div className="filter-section">
          <div className="filter-tabs">
            <button
              className={`filter-tab ${statusFilter === 'all' ? 'active' : ''}`}
              onClick={() => setStatusFilter('all')}
            >
              All Orders ({orderCounts.all})
            </button>
            <button
              className={`filter-tab ${statusFilter === 'pending' ? 'active' : ''}`}
              onClick={() => setStatusFilter('pending')}
            >
              Pending ({orderCounts.pending})
            </button>
            <button
              className={`filter-tab ${statusFilter === 'verified' ? 'active' : ''}`}
              onClick={() => setStatusFilter('verified')}
            >
              Verified ({orderCounts.verified})
            </button>
            <button
              className={`filter-tab ${statusFilter === 'in_preparation' ? 'active' : ''}`}
              onClick={() => setStatusFilter('in_preparation')}
            >
              In Preparation ({orderCounts.in_preparation})
            </button>
            <button
              className={`filter-tab ${statusFilter === 'delivered' ? 'active' : ''}`}
              onClick={() => setStatusFilter('delivered')}
            >
              Delivered ({orderCounts.delivered})
            </button>
          </div>
        </div>

        {filteredOrders.length === 0 ? (
          <div className="no-orders">
            <p>No orders found.</p>
          </div>
        ) : (
          <div className="orders-grid">
            {filteredOrders.map(order => (
              <div key={order.id} className="order-card">
                <div className="order-card-header">
                  <div className="order-number-section">
                    <h3>Order #{order.id}</h3>
                    <span className={`status-badge ${getStatusClass(order.status)}`}>
                      {getStatusBadge(order.status)}
                    </span>
                  </div>
                  <div className="order-date">
                    {formatDate(order.date)}
                  </div>
                </div>

                <div className="order-card-body">
                  <div className="customer-info">
                    <h4>👤 Customer Details</h4>
                    <p><strong>Name:</strong> {order.name}</p>
                    <p><strong>Email:</strong> {order.email}</p>
                    <p><strong>Phone:</strong> {order.phone}</p>
                    <p><strong>Campus:</strong> {order.campus}</p>
                    <p><strong>Address:</strong> {order.address}</p>
                  </div>

                  <div className="order-items-summary">
                    <h4>🛒 Order Items</h4>
                    <div className="items-list">
                      {order.items && order.items.map((item, index) => (
                        <div key={index} className="order-item-row">
                          <span>{item.name} x{item.quantity}</span>
                          <span>R{(item.price * item.quantity).toFixed(2)}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="order-totals">
                    {order.subtotal !== undefined && (
                      <div className="total-row">
                        <span>Subtotal:</span>
                        <span>R{order.subtotal.toFixed(2)}</span>
                      </div>
                    )}
                    {order.deliveryFee !== undefined && (
                      <div className="total-row">
                        <span>Delivery Fee:</span>
                        <span>
                          {order.deliveryFee === 0 ? 'Free' : `R${order.deliveryFee.toFixed(2)}`}
                        </span>
                      </div>
                    )}
                    <div className="total-row final-total">
                      <span><strong>Total:</strong></span>
                      <span><strong>R{order.total.toFixed(2)}</strong></span>
                    </div>
                  </div>

                  {order.specialInstructions && (
                    <div className="special-instructions">
                      <h4>📝 Special Instructions</h4>
                      <p>{order.specialInstructions}</p>
                    </div>
                  )}

                  <div className="payment-info">
                    <h4>💳 Payment Reference</h4>
                    <p className="payment-ref">#{order.id}</p>
                  </div>

                  <div className="proof-section">
                    {order.proofOfPayment || order.proofSubmitted ? (
                      <button
                        className="btn-view-proof"
                        onClick={() => handleViewProof(order)}
                      >
                        📸 View Proof of Payment
                      </button>
                    ) : (
                      <p className="no-proof">⚠️ No proof of payment submitted yet</p>
                    )}
                  </div>
                </div>

                <div className="order-card-actions">
                  <select
                    className="status-select"
                    value={order.status}
                    onChange={(e) => handleStatusChange(order.id, e.target.value)}
                  >
                    <option value="pending">⏳ Pending</option>
                    <option value="verified">✅ Verified</option>
                    <option value="in_preparation">👨‍🍳 In Preparation</option>
                    <option value="delivered">🚚 Delivered</option>
                  </select>
                </div>

                {order.verified && order.verifiedAt && (
                  <div className="verification-info">
                    <p>✅ Verified on {formatDate(order.verifiedAt)}</p>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {showProofModal && selectedOrder && (
        <div className="modal-overlay" onClick={() => setShowProofModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Proof of Payment - Order #{selectedOrder.id}</h2>
              <button
                className="modal-close"
                onClick={() => setShowProofModal(false)}
              >
                ✕
              </button>
            </div>
            <div className="modal-body">
              {selectedOrder.proofOfPayment ? (
                <div className="proof-image-container">
                  <img
                    src={selectedOrder.proofOfPayment}
                    alt="Proof of payment"
                    className="proof-image"
                  />
                </div>
              ) : (
                <p>No proof of payment image available.</p>
              )}
              <div className="payment-details-modal">
                <p><strong>Expected Payment Reference:</strong> #{selectedOrder.id}</p>
                <p><strong>Expected Amount:</strong> R{selectedOrder.total.toFixed(2)}</p>
                <p><strong>Bank:</strong> TYMEBANK</p>
                <p><strong>Account:</strong> 51041664159</p>
              </div>
            </div>
            <div className="modal-footer">
              <button
                className="btn btn-primary"
                onClick={() => {
                  if (selectedOrder.status !== 'verified') {
                    handleStatusChange(selectedOrder.id, 'verified');
                  }
                  setShowProofModal(false);
                }}
              >
                ✅ Verify Payment
              </button>
              <button
                className="btn btn-secondary"
                onClick={() => setShowProofModal(false)}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminOrders;
