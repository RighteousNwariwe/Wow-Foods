import React, { createContext, useContext, useEffect, useState } from 'react';
import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  sendPasswordResetEmail,
  GoogleAuthProvider,
  signInWithPopup
} from 'firebase/auth';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { auth, storage } from '../config/firebase';
import { usersService } from '../services/databaseService';

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [userRole, setUserRole] = useState(null);

  // Function to upload profile image to Firebase Storage
  async function uploadProfileImage(userId, imageFile) {
    try {
      if (!imageFile) return null;

      const imageRef = ref(storage, `profile-images/${userId}/${Date.now()}_${imageFile.name}`);
      const snapshot = await uploadBytes(imageRef, imageFile);
      const downloadURL = await getDownloadURL(snapshot.ref);
      return downloadURL;
    } catch (error) {
      console.error('Error uploading profile image:', error);
      throw error;
    }
  }

  // Function to save user details to Firebase Realtime Database
  async function saveUserDetails(user, additionalData = {}) {
    try {
      if (!user || !user.uid) {
        throw new Error('Invalid user data');
      }

      let photoURL = user.photoURL || '';

      // Upload profile image if provided
      if (additionalData.profileImage) {
        photoURL = await uploadProfileImage(user.uid, additionalData.profileImage);
      }

      const userData = {
        uid: user.uid,
        email: user.email,
        displayName: user.displayName || additionalData.displayName || user.email.split('@')[0],
        phoneNumber: user.phoneNumber || additionalData.phoneNumber || '',
        location: additionalData.location || '',
        userType: additionalData.userType || 'customer', // customer, student, staff
        lastLogin: new Date().toISOString(),
        createdAt: additionalData.createdAt || new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        photoURL: photoURL,
        provider: user.providerData[0]?.providerId || 'password'
      };

      // Save to Firebase Realtime Database
      await usersService.createUser(userData);

      return userData;
    } catch (error) {
      console.error('Error saving user details:', error);
      throw error;
    }
  }

  // Sign up function
  async function signup(email, password, additionalData = {}) {
    try {
      const result = await createUserWithEmailAndPassword(auth, email, password);
      await saveUserDetails(result.user, additionalData);
      return result.user;
    } catch (error) {
      console.error('Signup error:', error);
      throw error;
    }
  }

  // Login function
  async function login(email, password) {
    try {
      const result = await signInWithEmailAndPassword(auth, email, password);
      await saveUserDetails(result.user);
      return result.user;
    } catch (error) {
      console.error('Login error:', error);
      throw error;
    }
  }

  // Google sign-in function
  async function signInWithGoogle() {
    try {
      const provider = new GoogleAuthProvider();
      const result = await signInWithPopup(auth, provider);

      // Automatically save Google users as customers
      await saveUserDetails(result.user, {
        userType: 'customer',
        displayName: result.user.displayName,
        photoURL: result.user.photoURL
      });

      return result.user;
    } catch (error) {
      console.error('Google sign-in error:', error);
      throw error;
    }
  }

  // Logout function
  async function logout() {
    try {
      await signOut(auth);
    } catch (error) {
      console.error('Logout error:', error);
      throw error;
    }
  }

  // Reset password function
  async function resetPassword(email) {
    try {
      await sendPasswordResetEmail(auth, email);
    } catch (error) {
      console.error('Reset password error:', error);
      throw error;
    }
  }

  // Function to check if user is admin
  function isAdmin() {
    return userRole === 'admin';
  }

  // Function to get user role
  async function getUserRole(uid) {
    try {
      const user = await usersService.getUser(uid);
      return user?.userType || 'customer';
    } catch (error) {
      console.error('Error fetching user role:', error);
      return 'customer';
    }
  }

  // Function to update user profile
  async function updateUserProfile(userData) {
    try {
      if (!currentUser) {
        throw new Error('No user logged in');
      }

      await usersService.updateUser(currentUser.uid, userData);

      // Update the current user state with new data
      setCurrentUser(prev => ({
        ...prev,
        displayName: userData.displayName || prev.displayName,
        photoURL: userData.profileImage || prev.photoURL
      }));

    } catch (error) {
      console.error('Error updating user profile:', error);
      throw error;
    }
  }

  // Listen for auth state changes
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      setCurrentUser(user);

      if (user) {
        try {
          // Get user role from Realtime Database
          const role = await getUserRole(user.uid);
          setUserRole(role);
        } catch (error) {
          console.error('Error fetching user role:', error);
          setUserRole('customer');
        }
      } else {
        setUserRole(null);
      }

      setLoading(false);
    });

    return unsubscribe;
  }, []);

  const value = {
    currentUser,
    loading,
    userRole,
    signup,
    login,
    logout,
    resetPassword,
    signInWithGoogle,
    uploadProfileImage,
    saveUserDetails,
    updateUserProfile,
    isAdmin,
    getUserRole
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
};
