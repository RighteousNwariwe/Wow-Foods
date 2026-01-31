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
import { doc, setDoc, getDoc } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { auth, firestore, storage } from '../config/firebase';

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

  // Function to save user details to Firestore
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

      const userRef = doc(firestore, 'users', user.uid);
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

      // Check if user already exists
      const userDoc = await getDoc(userRef);
      if (userDoc.exists()) {
        // Update existing user
        await setDoc(userRef, {
          ...userData,
          createdAt: userDoc.data().createdAt // Preserve original creation date
        }, { merge: true });
      } else {
        // Create new user
        await setDoc(userRef, userData);
      }

      return userData;
    } catch (error) {
      console.error('Error saving user details:', error);
      throw error;
    }
  }

  // Sign up function
  async function signup(email, password, additionalData) {
    try {
      const result = await createUserWithEmailAndPassword(auth, email, password);
      const user = result.user;

      // Save additional user data to Firestore
      await saveUserDetails(user, {
        ...additionalData,
        createdAt: new Date().toISOString()
      });

      return user;
    } catch (error) {
      console.error('Signup error:', error);
      throw error;
    }
  }

  // Login function
  async function login(email, password) {
    try {
      const result = await signInWithEmailAndPassword(auth, email, password);

      // Check if user exists in Firestore
      const userDocRef = doc(firestore, 'users', result.user.uid);
      const userDoc = await getDoc(userDocRef);
      if (!userDoc.exists()) {
        await signOut(auth);
        throw new Error('Account not registered. Please sign up first.');
      }

      // Update last login
      await saveUserDetails(result.user, { lastLogin: new Date().toISOString() });

      return result.user;
    } catch (error) {
      console.error('Login error:', error);
      throw error;
    }
  }

  // Google sign in function
  async function signInWithGoogle() {
    try {
      const provider = new GoogleAuthProvider();
      const result = await signInWithPopup(auth, provider);

      // Save user details if new user
      const userDocRef = doc(firestore, 'users', result.user.uid);
      const userDoc = await getDoc(userDocRef);
      if (!userDoc.exists()) {
        await saveUserDetails(result.user, {
          provider: 'google.com',
          displayName: result.user.displayName,
          photoURL: result.user.photoURL
        });
      }

      return result.user;
    } catch (error) {
      console.error('Google sign in error:', error);
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

  // Password reset function
  async function resetPassword(email) {
    try {
      await sendPasswordResetEmail(auth, email);
    } catch (error) {
      console.error('Password reset error:', error);
      throw error;
    }
  }

  // Check if user is admin
  const isAdmin = currentUser?.email === 'wowfoods@gmail.com';

  // Get user role from Firestore
  useEffect(() => {
    const fetchUserRole = async () => {
      if (currentUser) {
        try {
          const userDocRef = doc(firestore, 'users', currentUser.uid);
          const userDoc = await getDoc(userDocRef);
          if (userDoc.exists()) {
            setUserRole(userDoc.data().userType || 'customer');
          }
        } catch (error) {
          console.error('Error fetching user role:', error);
        }
      } else {
        setUserRole(null);
      }
    };

    fetchUserRole();
  }, [currentUser]);

  // Listen for auth state changes
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setCurrentUser(user);
      setLoading(false);
    });

    return unsubscribe;
  }, []);

  const value = {
    currentUser,
    userRole,
    isAdmin,
    signup,
    login,
    logout,
    resetPassword,
    signInWithGoogle,
    saveUserDetails,
    loading
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
};
