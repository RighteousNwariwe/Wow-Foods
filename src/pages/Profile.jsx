import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { doc, getDoc, updateDoc } from 'firebase/firestore';
import { firestore } from '../config/firebase';
import './Profile.css';

const Profile = () => {
  const { currentUser, saveUserDetails } = useAuth();
  const [userProfile, setUserProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [formData, setFormData] = useState({
    displayName: '',
    phoneNumber: '',
    location: '',
    userType: ''
  });
  const [message, setMessage] = useState('');

  useEffect(() => {
    fetchUserProfile();
  }, [currentUser]);

  const fetchUserProfile = async () => {
    if (!currentUser) return;

    try {
      const userDoc = await getDoc(doc(firestore, 'users', currentUser.uid));
      if (userDoc.exists()) {
        const data = userDoc.data();
        setUserProfile(data);
        setFormData({
          displayName: data.displayName || '',
          phoneNumber: data.phoneNumber || '',
          location: data.location || '',
          userType: data.userType || 'customer'
        });
      }
    } catch (error) {
      console.error('Error fetching user profile:', error);
      setMessage('Error loading profile');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');

    try {
      await saveUserDetails(currentUser, {
        displayName: formData.displayName,
        phoneNumber: formData.phoneNumber,
        location: formData.location,
        userType: formData.userType
      });

      setUserProfile(prev => ({
        ...prev,
        ...formData
      }));

      setEditing(false);
      setMessage('Profile updated successfully!');
    } catch (error) {
      console.error('Error updating profile:', error);
      setMessage('Error updating profile');
    } finally {
      setLoading(false);
    }
  };

  const getUserTypeLabel = (userType) => {
    switch (userType) {
      case 'student':
        return 'Student';
      case 'staff':
        return 'Staff Member';
      case 'customer':
        return 'Regular Customer';
      default:
        return 'Customer';
    }
  };

  if (loading && !userProfile) {
    return <div className="profile-loading">Loading profile...</div>;
  }

  return (
    <div className="profile-container">
      <div className="profile-card">
        <div className="profile-header">
          <div className="profile-avatar-section">
            <img 
              src={currentUser?.photoURL || '/default-avatar.png'} 
              alt="Profile" 
              className="profile-avatar"
            />
            <div className="profile-info">
              <h1>{userProfile?.displayName || 'User'}</h1>
              <p className="user-type">{getUserTypeLabel(userProfile?.userType)}</p>
              <p className="user-email">{currentUser?.email}</p>
            </div>
          </div>
          <button 
            onClick={() => setEditing(!editing)}
            className="edit-button"
          >
            {editing ? 'Cancel' : 'Edit Profile'}
          </button>
        </div>

        {message && (
          <div className={`message ${message.includes('success') ? 'success' : 'error'}`}>
            {message}
          </div>
        )}

        {editing ? (
          <form onSubmit={handleSubmit} className="profile-form">
            <div className="form-group">
              <label htmlFor="displayName">Full Name</label>
              <input
                type="text"
                id="displayName"
                name="displayName"
                value={formData.displayName}
                onChange={handleInputChange}
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="phoneNumber">Phone Number</label>
              <input
                type="tel"
                id="phoneNumber"
                name="phoneNumber"
                value={formData.phoneNumber}
                onChange={handleInputChange}
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="location">Delivery Address</label>
              <input
                type="text"
                id="location"
                name="location"
                value={formData.location}
                onChange={handleInputChange}
                placeholder="Your delivery address"
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="userType">User Type</label>
              <select
                id="userType"
                name="userType"
                value={formData.userType}
                onChange={handleInputChange}
                required
              >
                <option value="customer">Regular Customer</option>
                <option value="student">Student</option>
                <option value="staff">Staff Member</option>
              </select>
            </div>

            <button type="submit" className="save-button" disabled={loading}>
              {loading ? 'Saving...' : 'Save Changes'}
            </button>
          </form>
        ) : (
          <div className="profile-details">
            <div className="detail-section">
              <h3>Contact Information</h3>
              <div className="detail-item">
                <label>Email:</label>
                <span>{currentUser?.email}</span>
              </div>
              <div className="detail-item">
                <label>Phone:</label>
                <span>{userProfile?.phoneNumber || 'Not provided'}</span>
              </div>
              <div className="detail-item">
                <label>Address:</label>
                <span>{userProfile?.location || 'Not provided'}</span>
              </div>
            </div>

            <div className="detail-section">
              <h3>Account Information</h3>
              <div className="detail-item">
                <label>User Type:</label>
                <span>{getUserTypeLabel(userProfile?.userType)}</span>
              </div>
              <div className="detail-item">
                <label>Member Since:</label>
                <span>
                  {userProfile?.createdAt 
                    ? new Date(userProfile.createdAt).toLocaleDateString()
                    : 'Unknown'
                  }
                </span>
              </div>
              <div className="detail-item">
                <label>Last Login:</label>
                <span>
                  {userProfile?.lastLogin 
                    ? new Date(userProfile.lastLogin).toLocaleDateString()
                    : 'Unknown'
                  }
                </span>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Profile;
