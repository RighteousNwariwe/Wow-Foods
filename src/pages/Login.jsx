import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import './Login.css';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [isLogin, setIsLogin] = useState(true);
  const [authProgress, setAuthProgress] = useState('');
  const [showRedirectMessage, setShowRedirectMessage] = useState(false);

  const [signupData, setSignupData] = useState({
    displayName: '',
    phone: '',
    location: '',
    userType: 'customer', // customer, student, staff
    confirmPassword: '',
    profileImage: null,
    profileImagePreview: null
  });

  const { login, signup, signInWithGoogle, resetPassword } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  // Always redirect to shop after successful login
  const from = '/products';

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    setAuthProgress('Authenticating...');

    try {
      const result = await login(email, password);
      setAuthProgress('Login successful! Preparing your dashboard...');

      // Show redirect message and delay for better UX
      setShowRedirectMessage(true);
      setTimeout(() => {
        // Check if user is admin and redirect accordingly
        if (email === 'wowfoods@gmail.com') {
          setAuthProgress('Redirecting to admin dashboard...');
          navigate('/admin/orders', { replace: true });
        } else {
          setAuthProgress('Redirecting to shop...');
          navigate(from, { replace: true });
        }
      }, 1500);
    } catch (error) {
      setAuthProgress('');
      setError(getErrorMessage(error));
    } finally {
      setTimeout(() => {
        setLoading(false);
        setShowRedirectMessage(false);
        setAuthProgress('');
      }, 2000);
    }
  };

  const handleSignup = async (e) => {
    e.preventDefault();
    setError('');

    if (signupData.password !== signupData.confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    if (signupData.password.length < 6) {
      setError('Password should be at least 6 characters');
      return;
    }

    setLoading(true);
    setAuthProgress('Creating your account...');

    try {
      await signup(email, signupData.password, {
        displayName: signupData.displayName,
        phoneNumber: signupData.phone,
        location: signupData.location,
        userType: signupData.userType,
        profileImage: signupData.profileImage
      });

      setAuthProgress('Account created successfully! Redirecting to shop...');
      setShowRedirectMessage(true);

      setTimeout(() => {
        navigate(from, { replace: true });
      }, 1500);
    } catch (error) {
      setAuthProgress('');
      setError(getErrorMessage(error));
    } finally {
      setTimeout(() => {
        setLoading(false);
        setShowRedirectMessage(false);
        setAuthProgress('');
      }, 2000);
    }
  };

  const handleGoogleSignIn = async () => {
    try {
      setAuthProgress('Signing in with Google...');
      setLoading(true);

      const result = await signInWithGoogle();
      setAuthProgress('Google sign-in successful! Preparing your dashboard...');

      setShowRedirectMessage(true);
      setTimeout(() => {
        // Check if user is admin and redirect accordingly
        if (result.user.email === 'wowfoods@gmail.com') {
          setAuthProgress('Redirecting to admin dashboard...');
          navigate('/admin/orders', { replace: true });
        } else {
          setAuthProgress('Redirecting to shop...');
          navigate(from, { replace: true });
        }
      }, 1500);
    } catch (error) {
      setAuthProgress('');
      setError(getErrorMessage(error));
    } finally {
      setTimeout(() => {
        setLoading(false);
        setShowRedirectMessage(false);
        setAuthProgress('');
      }, 2000);
    }
  };

  const handlePasswordReset = async () => {
    if (!email) {
      setError('Please enter your email address first');
      return;
    }

    try {
      await resetPassword(email);
      setError('Password reset email sent! Please check your inbox.');
    } catch (error) {
      setError(getErrorMessage(error));
    }
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      // Validate file type
      if (!file.type.startsWith('image/')) {
        setError('Please select an image file (JPG, PNG, etc.)');
        return;
      }

      // Validate file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        setError('Image size should be less than 5MB');
        return;
      }

      // Create preview
      const reader = new FileReader();
      reader.onloadend = () => {
        setSignupData(prev => ({
          ...prev,
          profileImage: file,
          profileImagePreview: reader.result
        }));
      };
      reader.readAsDataURL(file);
    }
  };

  const removeProfileImage = () => {
    setSignupData(prev => ({
      ...prev,
      profileImage: null,
      profileImagePreview: null
    }));
  };

  const getErrorMessage = (error) => {
    switch (error.code) {
      case 'auth/user-not-found':
        return 'No account found with this email. Please sign up first.';
      case 'auth/wrong-password':
        return 'Incorrect password. Please try again.';
      case 'auth/invalid-email':
        return 'Invalid email address.';
      case 'auth/user-disabled':
        return 'This account has been disabled.';
      case 'auth/email-already-in-use':
        return 'An account already exists with this email.';
      case 'auth/weak-password':
        return 'Password should be at least 6 characters.';
      case 'auth/too-many-requests':
        return 'Too many attempts. Please try again later.';
      default:
        return error.message || 'An error occurred. Please try again.';
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-card">
        <div className="auth-header">
          <img src="/logo.jpeg" alt="Wow Foods" className="auth-logo" />
          <h2>{isLogin ? 'Welcome Back' : 'Create Account'}</h2>
          <p>{isLogin ? 'Sign in to your account' : 'Join Wow Foods today'}</p>
        </div>

        <div className="auth-tabs">
          <button
            className={`auth-tab ${isLogin ? 'active' : ''}`}
            onClick={() => setIsLogin(true)}
          >
            Login
          </button>
          <button
            className={`auth-tab ${!isLogin ? 'active' : ''}`}
            onClick={() => setIsLogin(false)}
          >
            Sign Up
          </button>
        </div>

        {error && <div className="error-message">{error}</div>}

        {loading && (
          <div className="loading-overlay">
            <div className="loading-content">
              <div className="spinner"></div>
              <p>{authProgress}</p>
              {showRedirectMessage && (
                <div className="redirect-message">
                  <p>✅ Authentication successful!</p>
                  <p>🔄 Redirecting you now...</p>
                </div>
              )}
            </div>
          </div>
        )}

        {isLogin ? (
          <form onSubmit={handleLogin} className="auth-form">
            <div className="form-group">
              <label htmlFor="email">Email</label>
              <input
                type="email"
                id="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
            <div className="form-group">
              <label htmlFor="password">Password</label>
              <input
                type="password"
                id="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>
            <button type="submit" className="auth-button" disabled={loading}>
              {loading ? 'Signing in...' : 'Sign In'}
            </button>
            <div className="forgot-password">
              <button type="button" onClick={handlePasswordReset}>
                Forgot Password?
              </button>
            </div>
          </form>
        ) : (
          <form onSubmit={handleSignup} className="auth-form">
            <div className="form-group">
              <label htmlFor="email">Email</label>
              <input
                type="email"
                id="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>

            {/* Profile Image Upload */}
            <div className="form-group">
              <label>Profile Picture (Optional)</label>
              <div className="profile-image-upload">
                {signupData.profileImagePreview ? (
                  <div className="image-preview">
                    <img
                      src={signupData.profileImagePreview}
                      alt="Profile preview"
                      className="preview-image"
                    />
                    <button
                      type="button"
                      onClick={removeProfileImage}
                      className="remove-image-btn"
                    >
                      ✕
                    </button>
                  </div>
                ) : (
                  <div className="upload-placeholder">
                    <div className="upload-icon">📷</div>
                    <p>Click to upload profile picture</p>
                    <input
                      type="file"
                      id="profileImage"
                      accept="image/*"
                      onChange={handleImageChange}
                      className="file-input"
                    />
                  </div>
                )}
              </div>
              <small className="form-hint">JPG, PNG, GIF up to 5MB</small>
            </div>

            <div className="form-group">
              <label htmlFor="displayName">Full Name</label>
              <input
                type="text"
                id="displayName"
                value={signupData.displayName}
                onChange={(e) => setSignupData({ ...signupData, displayName: e.target.value })}
                required
              />
            </div>
            <div className="form-group">
              <label htmlFor="phone">Phone Number</label>
              <input
                type="tel"
                id="phone"
                value={signupData.phone}
                onChange={(e) => setSignupData({ ...signupData, phone: e.target.value })}
                required
              />
            </div>
            <div className="form-group">
              <label htmlFor="location">Delivery Location</label>
              <input
                type="text"
                id="location"
                value={signupData.location}
                onChange={(e) => setSignupData({ ...signupData, location: e.target.value })}
                placeholder="School building or block (e.g., Engineering Block, Room 201)"
                required
              />
            </div>
            <div className="form-group">
              <label htmlFor="userType">I am a:</label>
              <select
                id="userType"
                value={signupData.userType}
                onChange={(e) => setSignupData({ ...signupData, userType: e.target.value })}
                required
              >
                <option value="customer">Regular Customer</option>
                <option value="student">Student</option>
                <option value="staff">Staff Member</option>
              </select>
            </div>
            <div className="form-group">
              <label htmlFor="password">Password</label>
              <input
                type="password"
                id="password"
                value={signupData.password}
                onChange={(e) => setSignupData({ ...signupData, password: e.target.value })}
                required
              />
            </div>
            <div className="form-group">
              <label htmlFor="confirmPassword">Confirm Password</label>
              <input
                type="password"
                id="confirmPassword"
                value={signupData.confirmPassword}
                onChange={(e) => setSignupData({ ...signupData, confirmPassword: e.target.value })}
                required
              />
            </div>
            <button type="submit" className="auth-button" disabled={loading}>
              {loading ? 'Creating Account...' : 'Sign Up'}
            </button>
          </form>
        )}

        <div className="auth-divider">
          <span>or</span>
        </div>

        <button onClick={handleGoogleSignIn} className="google-button">
          <svg width="20" height="20" viewBox="0 0 24 24">
            <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
            <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
            <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
            <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
          </svg>
          Continue with Google
        </button>

        <div className="auth-footer">
          <p>
            {isLogin ? "Don't have an account? " : "Already have an account? "}
            <button onClick={() => setIsLogin(!isLogin)}>
              {isLogin ? 'Sign Up' : 'Login'}
            </button>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;
