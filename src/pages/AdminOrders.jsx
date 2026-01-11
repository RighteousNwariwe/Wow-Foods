import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import './AdminOrders.css';

const AdminOrders = () => {
  const { orders, updateOrderStatus } = useCart();
  const navigate = useNavigate();
  const [filteredOrders, setFilteredOrders] = useState([]);
  const [statusFilter, setStatusFilter] = useState('all');
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [showProofModal, setShowProofModal] = useState(false);

  const [orderCounts, setOrderCounts] = useState({
    all: 0,
    pending: 0,
    verified: 0,
    in_preparation: 0,
    ready_for_collection: 0,
    out_for_delivery: 0,
    delivered: 0
  });

  // Load and sync orders from Firebase (via context which uses real-time listener)
  useEffect(() => {
    if (orders && orders.length >= 0) {
      // Orders are already sorted by date (newest first) from Firebase
      const sortedOrders = [...orders];
      
      // Update counts
      setOrderCounts({
        all: sortedOrders.length,
        pending: sortedOrders.filter(o => o.status === 'pending').length,
        verified: sortedOrders.filter(o => o.status === 'verified').length,
        in_preparation: sortedOrders.filter(o => o.status === 'in_preparation').length,
        ready_for_collection: sortedOrders.filter(o => o.status === 'ready_for_collection').length,
        out_for_delivery: sortedOrders.filter(o => o.status === 'out_for_delivery').length,
        delivered: sortedOrders.filter(o => o.status === 'delivered').length
      });
      
      // Update filtered orders
      if (statusFilter === 'all') {
        setFilteredOrders(sortedOrders);
      } else {
        setFilteredOrders(sortedOrders.filter(order => order.status === statusFilter));
      }
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

  const formatOrderSummary = (order) => {
    const itemsList = order.items.map(item => 
      `• ${item.name} x${item.quantity} - R${(item.price * item.quantity).toFixed(2)}`
    ).join('\n');

    const subtotalLine = order.subtotal !== undefined ? `Subtotal: R${order.subtotal.toFixed(2)}` : '';
    const deliveryLine = order.deliveryFee !== undefined 
      ? `Delivery Fee: ${order.deliveryFee === 0 ? 'Free!' : `R${order.deliveryFee.toFixed(2)}`}`
      : '';

    return `Order Number: #${order.id}
Date: ${formatDate(order.date)}

Customer: ${order.name}
Campus: ${order.campus}
Address: ${order.address}

Order Items:
${itemsList}

Order Summary:
${subtotalLine ? subtotalLine + '\n' : ''}${deliveryLine ? deliveryLine + '\n' : ''}Total: R${order.total.toFixed(2)}`;
  };

  const sendNotification = (order, status) => {
    const orderSummary = formatOrderSummary(order);
    let message = '';
    
    switch (status) {
      case 'verified':
        message = `✅ ORDER VERIFIED\n\nHello ${order.name},\n\nYour order has been received and payment verified!\n\n${orderSummary}\n\nWe are now preparing your order. You will be notified when it's ready.\n\nThank you for ordering from Wow Foods! 🍽️`;
        break;
      case 'ready_for_collection':
        message = `🎉 ORDER READY FOR COLLECTION\n\nHello ${order.name},\n\nYour order is ready for collection!\n\n${orderSummary}\n\nPlease come to collect your order at:\n📍 ${order.campus}\n\nWe look forward to serving you!\n\nThank you, Wow Foods 🍽️`;
        break;
      case 'out_for_delivery':
        message = `🚚 ORDER OUT FOR DELIVERY\n\nHello ${order.name},\n\nGreat news! Your order is out for delivery.\n\n${orderSummary}\n\nDelivery Address: ${order.address}\n\nOur delivery person will be arriving shortly. Please ensure someone is available to receive the order.\n\nThank you, Wow Foods 🍽️`;
        break;
      default:
        return;
    }

    // Send via WhatsApp
    if (order.phone) {
      // Clean phone number: remove spaces, dashes, parentheses, and + sign
      let cleanNumber = order.phone.replace(/\s|-|\(|\)|\+/g, '');
      
      // Convert to international format for South Africa
      if (cleanNumber.startsWith('0')) {
        // Replace leading 0 with 27
        cleanNumber = '27' + cleanNumber.substring(1);
      } else if (cleanNumber.startsWith('27')) {
        // Already in correct format (27XXXXXXXXX)
      } else {
        // Add 27 prefix if not present
        cleanNumber = '27' + cleanNumber;
      }
      
      // Ensure it's 11 digits (27 + 9 digits)
      if (cleanNumber.length === 11 && /^27\d{9}$/.test(cleanNumber)) {
        const whatsappUrl = `https://wa.me/${cleanNumber}?text=${encodeURIComponent(message)}`;
        // Use window.open with _blank for better compatibility
        const whatsappWindow = window.open(whatsappUrl, '_blank');
        if (!whatsappWindow) {
          // If popup blocked, try direct navigation
          window.location.href = whatsappUrl;
        }
      } else {
        console.warn('Invalid phone number format:', order.phone, 'Cleaned:', cleanNumber);
        alert(`Could not send WhatsApp notification. Invalid phone number format: ${order.phone}\nPlease verify the phone number is correct.`);
      }
    }

    // Send via Email
    if (order.email) {
      const emailSubject = encodeURIComponent(`Order #${order.id} Update - Wow Foods`);
      const emailBody = encodeURIComponent(message);
      const emailUrl = `mailto:${order.email}?subject=${emailSubject}&body=${emailBody}`;
      
      // Delay email to allow WhatsApp to open first
      setTimeout(() => {
        window.location.href = emailUrl;
      }, 1000);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('adminAuthenticated');
    localStorage.removeItem('adminLoginTime');
    navigate('/admin/login');
  };

  const handleStatusChange = async (orderId, newStatus) => {
    // Get the order before updating
    const order = orders.find(o => o.id === orderId);
    
    if (!order) {
      console.error('Order not found:', orderId);
      return;
    }

    let verified = null;
    if (newStatus === 'verified') {
      verified = true;
    }
    
    try {
      // Update via context (which updates Firebase)
      await updateOrderStatus(orderId, newStatus, verified);
      
      // Create updated order object for notification
      const updatedOrder = { 
        ...order, 
        status: newStatus,
        verified: verified !== null ? verified : order.verified,
        verifiedAt: verified ? new Date().toISOString() : order.verifiedAt
      };
      
      // Send notification for specific statuses
      if (newStatus === 'verified' || newStatus === 'ready_for_collection' || newStatus === 'out_for_delivery') {
        // Small delay to ensure Firebase update is processed
        setTimeout(() => {
          sendNotification(updatedOrder, newStatus);
        }, 500);
      }
    } catch (error) {
      console.error('Error updating order status:', error);
      alert('Failed to update order status. Please try again.');
    }
    
    // Orders will be updated automatically via real-time listener
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
      case 'ready_for_collection':
        return 'status-collection';
      case 'out_for_delivery':
        return 'status-delivery';
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
      case 'ready_for_collection':
        return '📦 Ready for Collection';
      case 'out_for_delivery':
        return '🚚 Out for Delivery';
      case 'delivered':
        return '🎉 Delivered';
      case 'pending':
      default:
        return '⏳ Pending';
    }
  };

  return (
    <div className="admin-orders-page">
      <div className="container">
        <div className="admin-header">
          <div>
            <h1>📋 Order Management</h1>
            <p className="admin-subtitle">View and verify customer orders</p>
          </div>
          <button className="btn-logout" onClick={handleLogout}>
            🚪 Logout
          </button>
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
              className={`filter-tab ${statusFilter === 'ready_for_collection' ? 'active' : ''}`}
              onClick={() => setStatusFilter('ready_for_collection')}
            >
              Ready for Collection ({orderCounts.ready_for_collection})
            </button>
            <button
              className={`filter-tab ${statusFilter === 'out_for_delivery' ? 'active' : ''}`}
              onClick={() => setStatusFilter('out_for_delivery')}
            >
              Out for Delivery ({orderCounts.out_for_delivery})
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
                    <option value="ready_for_collection">📦 Ready for Collection</option>
                    <option value="out_for_delivery">🚚 Out for Delivery</option>
                    <option value="delivered">🎉 Delivered</option>
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
                onClick={async () => {
                  if (selectedOrder.status !== 'verified') {
                    await handleStatusChange(selectedOrder.id, 'verified');
                    // Notification will be sent by handleStatusChange
                  }
                  setShowProofModal(false);
                }}
              >
                ✅ Verify Payment & Notify Customer
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
