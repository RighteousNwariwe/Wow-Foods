import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { usersService } from '../services/databaseService';
import { onValue, ref } from 'firebase/database';
import { database } from '../config/firebase';
import './Profile.css';

const Profile = () => {
  const { currentUser, updateUserProfile } = useAuth();
  const [userProfile, setUserProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [formData, setFormData] = useState({
    displayName: '',
    phoneNumber: '',
    location: '',
    userType: 'customer'
  });
  const [message, setMessage] = useState('');
  const [profileImage, setProfileImage] = useState(null);
  const [profileImagePreview, setProfileImagePreview] = useState(null);

  useEffect(() => {
    fetchUserProfile();

    // Set up real-time listener for profile changes
    if (currentUser) {
      const userRef = ref(database, `users/${currentUser.uid}`);
      const unsubscribe = onValue(userRef, (snapshot) => {
        if (snapshot.exists()) {
          const data = snapshot.val();
          setUserProfile(data);
          setFormData({
            displayName: data.displayName || currentUser.displayName || '',
            phoneNumber: data.phoneNumber || '',
            location: data.location || '',
            userType: data.userType || 'customer'
          });
          setProfileImagePreview(data.profileImage || currentUser.photoURL || null);
        }
      });

      return () => unsubscribe();
    }
  }, [currentUser]);

  const fetchUserProfile = async () => {
    if (!currentUser) return;

    try {
      setLoading(true);
      const userData = await usersService.getUser(currentUser.uid);
      if (userData) {
        setUserProfile(userData);
        setFormData({
          displayName: userData.displayName || currentUser.displayName || '',
          phoneNumber: userData.phoneNumber || '',
          location: userData.location || '',
          userType: userData.userType || 'customer'
        });
        setProfileImagePreview(userData.profileImage || currentUser.photoURL || null);
      } else {
        // If no profile data exists, create one with basic auth data
        const initialData = {
          displayName: currentUser.displayName || '',
          email: currentUser.email,
          phoneNumber: '',
          location: '',
          userType: 'customer',
          profileImage: currentUser.photoURL || null,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        };

        await usersService.updateUser(currentUser.uid, initialData);
        setUserProfile(initialData);
        setFormData({
          displayName: initialData.displayName,
          phoneNumber: initialData.phoneNumber,
          location: initialData.location,
          userType: initialData.userType
        });
        setProfileImagePreview(initialData.profileImage);
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

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        setMessage('File size must be less than 5MB');
        return;
      }

      const reader = new FileReader();
      reader.onloadend = () => {
        setProfileImage(file);
        setProfileImagePreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage('');
    setLoading(true);

    try {
      // Update the existing user profile
      const updatedData = {
        ...formData,
        profileImage: profileImagePreview,
        email: currentUser.email,
        updatedAt: new Date().toISOString()
      };

      await usersService.updateUser(currentUser.uid, updatedData);

      // Update the auth context
      await updateUserProfile(updatedData);

      // Update local state
      const newProfileData = { ...userProfile, ...updatedData };
      setUserProfile(newProfileData);
      setEditing(false);
      setMessage('Profile updated successfully!');

      // Refresh the profile data to ensure consistency
      setTimeout(() => {
        fetchUserProfile();
        setMessage('');
      }, 1000);
    } catch (error) {
      console.error('Error updating profile:', error);
      setMessage('Error updating profile');
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    setEditing(false);
    // Reset form to current profile data
    if (userProfile) {
      setFormData({
        displayName: userProfile.displayName || '',
        phoneNumber: userProfile.phoneNumber || '',
        location: userProfile.location || '',
        userType: userProfile.userType || 'customer'
      });
      setProfileImagePreview(userProfile.profileImage || null);
      setProfileImage(null);
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'Unknown';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  if (loading) {
    return (
      <div className="profile-page">
        <div className="loading">Loading profile...</div>
      </div>
    );
  }

  return (
    <div className="profile-page">
      <div className="container">
        <div className="profile-header">
          <h1>My Profile</h1>
          {!editing && (
            <button
              onClick={() => setEditing(true)}
              className="edit-profile-btn"
            >
              Edit Profile
            </button>
          )}
        </div>

        {message && (
          <div className={`message ${message.includes('success') ? 'success' : 'error'}`}>
            {message}
          </div>
        )}

        <div className="profile-content">
          <div className="profile-card">
            <div className="profile-avatar-section">
              <div className="avatar-container">
                <img
                  src={profileImagePreview || currentUser?.photoURL || '/default-avatar.png'}
                  alt="Profile"
                  className="profile-avatar"
                />
                {editing && (
                  <label htmlFor="profileImage" className="image-upload-btn">
                    📷
                  </label>
                )}
                <input
                  type="file"
                  id="profileImage"
                  accept="image/*"
                  onChange={handleImageChange}
                  style={{ display: 'none' }}
                />
              </div>
              <div className="profile-info">
                <h2>{formData.displayName || currentUser?.displayName || 'User'}</h2>
                <p className="user-email">{currentUser?.email}</p>
                <p className="user-type">{formData.userType}</p>
                {userProfile?.createdAt && (
                  <p className="joined-date">
                    Member since: {formatDate(userProfile.createdAt)}
                  </p>
                )}
              </div>
            </div>

            {editing ? (
              <form onSubmit={handleSubmit} className="profile-form">
                <div className="form-row">
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
                    />
                  </div>
                </div>

                <div className="form-group">
                  <label htmlFor="location">Location</label>
                  <input
                    type="text"
                    id="location"
                    name="location"
                    value={formData.location}
                    onChange={handleInputChange}
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="userType">User Type</label>
                  <select
                    id="userType"
                    name="userType"
                    value={formData.userType}
                    onChange={handleInputChange}
                  >
                    <option value="customer">Customer</option>
                    <option value="student">Student</option>
                    <option value="staff">Staff</option>
                  </select>
                </div>

                <div className="form-actions">
                  <button
                    type="button"
                    onClick={handleCancel}
                    className="cancel-btn"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="save-btn"
                    disabled={loading}
                  >
                    {loading ? 'Saving...' : 'Save Changes'}
                  </button>
                </div>
              </form>
            ) : (
              <div className="profile-details">
                <div className="detail-row">
                  <span className="label">Full Name:</span>
                  <span className="value">{formData.displayName || 'Not set'}</span>
                </div>
                <div className="detail-row">
                  <span className="label">Email:</span>
                  <span className="value">{currentUser?.email}</span>
                </div>
                <div className="detail-row">
                  <span className="label">Phone:</span>
                  <span className="value">{formData.phoneNumber || 'Not set'}</span>
                </div>
                <div className="detail-row">
                  <span className="label">Location:</span>
                  <span className="value">{formData.location || 'Not set'}</span>
                </div>
                <div className="detail-row">
                  <span className="label">User Type:</span>
                  <span className="value">{formData.userType}</span>
                </div>
                {userProfile?.createdAt && (
                  <div className="detail-row">
                    <span className="label">Member Since:</span>
                    <span className="value">{formatDate(userProfile.createdAt)}</span>
                  </div>
                )}
                {userProfile?.updatedAt && (
                  <div className="detail-row">
                    <span className="label">Last Updated:</span>
                    <span className="value">{formatDate(userProfile.updatedAt)}</span>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;
