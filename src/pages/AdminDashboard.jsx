import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import MenuManagement from '../components/MenuManagement';
import OrderManagement from '../components/OrderManagement';
import { ordersService, usersService } from '../services/databaseService';
import './AdminDashboard.css';

const AdminDashboard = () => {
  const { currentUser, logout, isOfflineMode } = useAuth();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('overview');
  const [loading, setLoading] = useState(true);
  const [orders, setOrders] = useState([]);
  const [users, setUsers] = useState([]);
  const [stats, setStats] = useState({
    totalOrders: 0,
    totalRevenue: 0,
    totalUsers: 0,
    pendingOrders: 0,
    todayOrders: 0,
    weeklyRevenue: 0
  });

  useEffect(() => {
    if (!currentUser || currentUser.email !== 'wowfoods@gmail.com') {
      navigate('/login');
      return;
    }

    fetchDashboardData();

    // Set up real-time listeners
    const ordersUnsubscribe = ordersService.onOrdersChange((ordersData) => {
      setOrders(ordersData);
      updateStats(ordersData, users);
    });

    const usersUnsubscribe = usersService.onUsersChange((usersData) => {
      setUsers(usersData);
      updateStats(orders, usersData);
    });

    return () => {
      ordersUnsubscribe();
      usersUnsubscribe();
    };
  }, [currentUser, navigate]);

  const updateStats = (ordersData, usersData) => {
    // Calculate real stats
    const totalOrders = ordersData.length;
    const totalRevenue = ordersData.reduce((sum, order) => sum + (order.total || 0), 0);
    const totalUsers = usersData.length;
    const pendingOrders = ordersData.filter(order =>
      order.status === 'pending' || order.status === 'pending_payment'
    ).length;

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const todayOrders = ordersData.filter(order => {
      const orderDate = new Date(order.createdAt || order.date);
      return orderDate >= today;
    }).length;

    const weekAgo = new Date();
    weekAgo.setDate(weekAgo.getDate() - 7);
    const weeklyRevenue = ordersData
      .filter(order => {
        const orderDate = new Date(order.createdAt || order.date);
        return orderDate >= weekAgo;
      })
      .reduce((sum, order) => sum + (order.total || 0), 0);

    setStats({
      totalOrders,
      totalRevenue,
      totalUsers,
      pendingOrders,
      todayOrders,
      weeklyRevenue
    });
  };

  const fetchDashboardData = async () => {
    try {
      setLoading(true);

      // Fetch real data from Firebase Realtime Database
      const [ordersData, usersData] = await Promise.all([
        ordersService.getAllOrders(),
        usersService.getAllUsers()
      ]);

      setOrders(ordersData);
      setUsers(usersData);
      updateStats(ordersData, usersData);
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const updateOrderStatus = async (orderId, newStatus) => {
    try {
      await ordersService.updateOrderStatus(orderId, newStatus);
    } catch (error) {
      console.error('Error updating order status:', error);
    }
  };

  const deleteOrder = async (orderId) => {
    if (window.confirm('Are you sure you want to delete this order?')) {
      try {
        await ordersService.deleteOrder(orderId);
      } catch (error) {
        console.error('Error deleting order:', error);
      }
    }
  };

  const deleteUser = async (userId) => {
    if (window.confirm('Are you sure you want to delete this user? This action cannot be undone.')) {
      try {
        await usersService.deleteUser(userId);
      } catch (error) {
        console.error('Error deleting user:', error);
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
      <div className="admin-dashboard-loading">
        <div className="loading-spinner"></div>
        <p>Loading Admin Dashboard...</p>
      </div>
    );
  }

  return (
    <div className="admin-dashboard">
      <header className="admin-header">
        <div className="admin-header-content">
          <div className="admin-logo">
            <img src="/logo.jpeg" alt="Wow Foods Admin" />
            <div>
              <h1>Admin Dashboard</h1>
              <p>Wow Foods Management System</p>
            </div>
          </div>
          <div className="admin-user-info">
            <div className="user-details">
              <span className="user-email">{currentUser?.email}</span>
              <span className="user-role">Administrator</span>
              {isOfflineMode && (
                <span className="offline-badge">🔌 Offline Mode</span>
              )}
            </div>
            <button onClick={handleLogout} className="logout-btn">
              <span>🚪</span> Logout
            </button>
          </div>
        </div>
      </header>

      <div className="admin-content">
        <nav className="admin-sidebar">
          <ul className="admin-nav">
            <li className={`nav-item ${activeTab === 'overview' ? 'active' : ''}`}>
              <button onClick={() => setActiveTab('overview')}>
                <span>📊</span> Overview
              </button>
            </li>
            <li className={`nav-item ${activeTab === 'orders' ? 'active' : ''}`}>
              <button onClick={() => setActiveTab('orders')}>
                <span>📦</span> Orders ({stats.pendingOrders})
              </button>
            </li>
            <li className={`nav-item ${activeTab === 'users' ? 'active' : ''}`}>
              <button onClick={() => setActiveTab('users')}>
                <span>👥</span> Users
              </button>
            </li>
            <li className={`nav-item ${activeTab === 'menu' ? 'active' : ''}`}>
              <button onClick={() => setActiveTab('menu')}>
                <span>🍔</span> Menu Management
              </button>
            </li>
            <li className={`nav-item ${activeTab === 'analytics' ? 'active' : ''}`}>
              <button onClick={() => setActiveTab('analytics')}>
                <span>📈</span> Analytics
              </button>
            </li>
          </ul>
        </nav>

        <main className="admin-main">
          {activeTab === 'overview' && (
            <div className="overview-section">
              <h2>Dashboard Overview</h2>
              <div className="stats-grid">
                <div className="stat-card primary">
                  <div className="stat-icon">📦</div>
                  <div className="stat-info">
                    <h3>{stats.totalOrders}</h3>
                    <p>Total Orders</p>
                    <span className="stat-change">Real-time tracking</span>
                  </div>
                </div>
                <div className="stat-card success">
                  <div className="stat-icon">💰</div>
                  <div className="stat-info">
                    <h3>R{stats.totalRevenue.toFixed(2)}</h3>
                    <p>Total Revenue</p>
                    <span className="stat-change">Live updates</span>
                  </div>
                </div>
                <div className="stat-card info">
                  <div className="stat-icon">👥</div>
                  <div className="stat-info">
                    <h3>{stats.totalUsers}</h3>
                    <p>Total Users</p>
                    <span className="stat-change">User analytics</span>
                  </div>
                </div>
                <div className="stat-card warning">
                  <div className="stat-icon">⏳</div>
                  <div className="stat-info">
                    <h3>{stats.pendingOrders}</h3>
                    <p>Pending Orders</p>
                    <span className="stat-change">Requires attention</span>
                  </div>
                </div>
              </div>
              <div className="welcome-message">
                <h3>Welcome to Wow Foods Admin Dashboard</h3>
                <p>Firebase Realtime Database and Supabase integration active</p>
                <p>Current status: {isOfflineMode ? 'Offline Mode' : 'Online Mode'}</p>
              </div>
            </div>
          )}

          {activeTab === 'orders' && (
            <OrderManagement
              orders={orders}
              updateOrderStatus={updateOrderStatus}
              deleteOrder={deleteOrder}
            />
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
                      <th>Location</th>
                      <th>Joined</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {users.map(user => (
                      <tr key={user.id}>
                        <td>{user.displayName || user.name}</td>
                        <td>{user.email}</td>
                        <td>{user.phoneNumber || user.phone}</td>
                        <td>
                          <span className={`user-type-badge ${user.userType}`}>
                            {user.userType || 'customer'}
                          </span>
                        </td>
                        <td>{user.location}</td>
                        <td>{new Date(user.createdAt).toLocaleDateString()}</td>
                        <td>
                          <button
                            onClick={() => deleteUser(user.id)}
                            className="delete-user-btn"
                            title="Delete user"
                          >
                            🗑️
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                {users.length === 0 && (
                  <div className="no-data">
                    <p>No users found</p>
                  </div>
                )}
              </div>
            </div>
          )}

          {activeTab === 'menu' && (
            <MenuManagement />
          )}

          {activeTab === 'analytics' && (
            <div className="analytics-section">
              <h2>Analytics & Reports</h2>
              <div className="analytics-grid">
                <div className="analytics-card">
                  <h3>📊 Sales Analytics</h3>
                  <div className="analytics-content">
                    <div className="metric">
                      <span className="label">Today's Orders:</span>
                      <span className="value">{stats.todayOrders}</span>
                    </div>
                    <div className="metric">
                      <span className="label">Weekly Revenue:</span>
                      <span className="value">R{stats.weeklyRevenue.toFixed(2)}</span>
                    </div>
                    <div className="metric">
                      <span className="label">Average Order Value:</span>
                      <span className="value">
                        R{stats.totalOrders > 0 ? (stats.totalRevenue / stats.totalOrders).toFixed(2) : '0.00'}
                      </span>
                    </div>
                  </div>
                </div>
                <div className="analytics-card">
                  <h3>🍔 Popular Products</h3>
                  <div className="analytics-content">
                    <p>Product analytics coming soon...</p>
                  </div>
                </div>
                <div className="analytics-card">
                  <h3>📍 Delivery Analytics</h3>
                  <div className="analytics-content">
                    <p>Delivery analytics coming soon...</p>
                  </div>
                </div>
                <div className="analytics-card">
                  <h3>👥 Customer Analytics</h3>
                  <div className="analytics-content">
                    <div className="metric">
                      <span className="label">Total Customers:</span>
                      <span className="value">{stats.totalUsers}</span>
                    </div>
                    <div className="metric">
                      <span className="label">Students:</span>
                      <span className="value">
                        {users.filter(u => u.userType === 'student').length}
                      </span>
                    </div>
                    <div className="metric">
                      <span className="label">Staff:</span>
                      <span className="value">
                        {users.filter(u => u.userType === 'staff').length}
                      </span>
                    </div>
                    <div className="metric">
                      <span className="label">Regular Customers:</span>
                      <span className="value">
                        {users.filter(u => u.userType === 'customer').length}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  );
};

export default AdminDashboard;
