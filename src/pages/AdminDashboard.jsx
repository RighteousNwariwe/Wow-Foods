import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { collection, getDocs, doc, updateDoc, deleteDoc, query, orderBy, where } from 'firebase/firestore';
import { firestore } from '../config/firebase';
import './AdminDashboard.css';

const AdminDashboard = () => {
  const { currentUser, logout } = useAuth();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('orders');
  const [orders, setOrders] = useState([]);
  const [users, setUsers] = useState([]);
  const [stats, setStats] = useState({
    totalOrders: 0,
    totalRevenue: 0,
    totalUsers: 0,
    pendingOrders: 0
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!currentUser || currentUser.email !== 'wowfoods@gmail.com') {
      navigate('/login');
      return;
    }

    fetchDashboardData();
  }, [currentUser, navigate]);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      
      // Fetch orders
      const ordersQuery = query(collection(firestore, 'orders'), orderBy('orderDate', 'desc'));
      const ordersSnapshot = await getDocs(ordersQuery);
      const ordersData = ordersSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setOrders(ordersData);

      // Fetch users
      const usersSnapshot = await getDocs(collection(firestore, 'users'));
      const usersData = usersSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setUsers(usersData);

      // Calculate stats
      const totalOrders = ordersData.length;
      const totalRevenue = ordersData.reduce((sum, order) => sum + (order.total || 0), 0);
      const totalUsers = usersData.length;
      const pendingOrders = ordersData.filter(order => order.status === 'pending' || order.status === 'pending_payment').length;

      setStats({
        totalOrders,
        totalRevenue,
        totalUsers,
        pendingOrders
      });

    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const updateOrderStatus = async (orderId, newStatus) => {
    try {
      const orderRef = doc(firestore, 'orders', orderId);
      await updateDoc(orderRef, {
        status: newStatus,
        updatedAt: new Date().toISOString()
      });
      
      // Refresh orders
      fetchDashboardData();
    } catch (error) {
      console.error('Error updating order status:', error);
    }
  };

  const deleteOrder = async (orderId) => {
    if (window.confirm('Are you sure you want to delete this order?')) {
      try {
        await deleteDoc(doc(firestore, 'orders', orderId));
        fetchDashboardData();
      } catch (error) {
        console.error('Error deleting order:', error);
      }
    }
  };

  const handleLogout = async () => {
    try {
      await logout();
      navigate('/login');
    } catch (error) {
      console.error('Error logging out:', error);
    }
  };

  if (loading) {
    return (
      <div className="admin-dashboard">
        <div className="loading">
          <h1>Loading Admin Dashboard...</h1>
        </div>
      </div>
    );
  }

  return (
    <div className="admin-dashboard">
      <header className="admin-header">
        <div className="admin-header-content">
          <div className="admin-logo">
            <img src="/logo.jpeg" alt="Wow Foods Admin" />
            <h1>Admin Dashboard</h1>
          </div>
          <div className="admin-user-info">
            <span>{currentUser?.email}</span>
            <button onClick={handleLogout} className="logout-btn">
              Logout
            </button>
          </div>
        </div>
      </header>

      <div className="admin-content">
        <nav className="admin-sidebar">
          <ul className="admin-nav">
            <li className={`nav-item ${activeTab === 'overview' ? 'active' : ''}`}>
              <button onClick={() => setActiveTab('overview')}>
                📊 Overview
              </button>
            </li>
            <li className={`nav-item ${activeTab === 'orders' ? 'active' : ''}`}>
              <button onClick={() => setActiveTab('orders')}>
                📦 Orders ({stats.pendingOrders})
              </button>
            </li>
            <li className={`nav-item ${activeTab === 'users' ? 'active' : ''}`}>
              <button onClick={() => setActiveTab('users')}>
                👥 Users
              </button>
            </li>
            <li className={`nav-item ${activeTab === 'products' ? 'active' : ''}`}>
              <button onClick={() => setActiveTab('products')}>
                🍔 Products
              </button>
            </li>
          </ul>
        </nav>

        <main className="admin-main">
          {activeTab === 'overview' && (
            <div className="overview-section">
              <h2>Dashboard Overview</h2>
              <div className="stats-grid">
                <div className="stat-card">
                  <div className="stat-icon">📦</div>
                  <div className="stat-info">
                    <h3>{stats.totalOrders}</h3>
                    <p>Total Orders</p>
                  </div>
                </div>
                <div className="stat-card">
                  <div className="stat-icon">💰</div>
                  <div className="stat-info">
                    <h3>R{stats.totalRevenue.toFixed(2)}</h3>
                    <p>Total Revenue</p>
                  </div>
                </div>
                <div className="stat-card">
                  <div className="stat-icon">👥</div>
                  <div className="stat-info">
                    <h3>{stats.totalUsers}</h3>
                    <p>Total Users</p>
                  </div>
                </div>
                <div className="stat-card">
                  <div className="stat-icon">⏳</div>
                  <div className="stat-info">
                    <h3>{stats.pendingOrders}</h3>
                    <p>Pending Orders</p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'orders' && (
            <div className="orders-section">
              <h2>Orders Management</h2>
              <div className="orders-table">
                <table>
                  <thead>
                    <tr>
                      <th>Order ID</th>
                      <th>Customer</th>
                      <th>Email</th>
                      <th>Total</th>
                      <th>Status</th>
                      <th>Date</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {orders.map(order => (
                      <tr key={order.id}>
                        <td>{order.orderId || order.id}</td>
                        <td>{order.userName || 'N/A'}</td>
                        <td>{order.userEmail || 'N/A'}</td>
                        <td>R{(order.total || 0).toFixed(2)}</td>
                        <td>
                          <select 
                            value={order.status || 'pending'} 
                            onChange={(e) => updateOrderStatus(order.id, e.target.value)}
                            className="status-select"
                          >
                            <option value="pending_payment">Pending Payment</option>
                            <option value="pending">Pending</option>
                            <option value="confirmed">Confirmed</option>
                            <option value="preparing">Preparing</option>
                            <option value="ready">Ready</option>
                            <option value="delivered">Delivered</option>
                            <option value="cancelled">Cancelled</option>
                          </select>
                        </td>
                        <td>{new Date(order.orderDate?.toDate?.() || order.createdAt).toLocaleDateString()}</td>
                        <td>
                          <button 
                            onClick={() => deleteOrder(order.id)}
                            className="delete-btn"
                          >
                            Delete
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {activeTab === 'users' && (
            <div className="users-section">
              <h2>Users Management</h2>
              <div className="users-table">
                <table>
                  <thead>
                    <tr>
                      <th>Name</th>
                      <th>Email</th>
                      <th>Phone</th>
                      <th>User Type</th>
                      <th>Joined</th>
                    </tr>
                  </thead>
                  <tbody>
                    {users.map(user => (
                      <tr key={user.id}>
                        <td>{user.displayName}</td>
                        <td>{user.email}</td>
                        <td>{user.phoneNumber || 'N/A'}</td>
                        <td>
                          <span className={`user-type ${user.userType}`}>
                            {user.userType}
                          </span>
                        </td>
                        <td>{new Date(user.createdAt).toLocaleDateString()}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {activeTab === 'products' && (
            <div className="products-section">
              <h2>Products Management</h2>
              <div className="products-placeholder">
                <p>Product management features coming soon...</p>
                <button className="btn btn-primary">
                  Add New Product
                </button>
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  );
};

export default AdminDashboard;
