import React, { useState, useCallback } from 'react';
import { auth, db, getAppId } from '../../services/firebase';
import { updateProfile, deleteUser, EmailAuthProvider, reauthenticateWithCredential, updateEmail } from 'firebase/auth';
import { doc, setDoc, deleteDoc } from 'firebase/firestore';
import TierStatusIndicator from '../common/TierStatusIndicator';
import OTPVerification from '../auth/OTPVerification';

const MyProfilePage = ({ user, onBack, onSuccess, onError }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [profileData, setProfileData] = useState({
    displayName: user?.displayName || '',
    email: user?.email || '',
    photoURL: user?.photoURL || ''
  });
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deletePassword, setDeletePassword] = useState('');
  const [isDeleting, setIsDeleting] = useState(false);
  const [showOTPVerification, setShowOTPVerification] = useState(false);
  const [pendingEmailChange, setPendingEmailChange] = useState('');
  const [isOTPLoading, setIsOTPLoading] = useState(false);
  const [currentPassword, setCurrentPassword] = useState('');
  const [showPasswordInput, setShowPasswordInput] = useState(false);

  const validateProfileData = () => {
    if (!profileData.displayName.trim()) {
      setError('Display name is required');
      return false;
    }
    if (profileData.displayName.length < 2) {
      setError('Display name must be at least 2 characters');
      return false;
    }
    if (profileData.displayName.length > 50) {
      setError('Display name must be less than 50 characters');
      return false;
    }
    return true;
  };

const handleSave = useCallback(async () => {
    if (!validateProfileData()) {
      return;
    }

    setIsLoading(true);
    setMessage('');
    setError('');
    
    try {
      // Update Firebase Auth profile
      await updateProfile(auth.currentUser, {
        displayName: profileData.displayName,
        photoURL: profileData.photoURL
      });

      // Create or update Firestore user document using the utility function
      const appId = getAppId();
      const userRef = doc(db, `artifacts/${appId}/users/${user.uid}`);
      
      // Use setDoc with merge: true to create the document if it doesn't exist
      await setDoc(userRef, {
        uid: user.uid,
        email: user.email,
        displayName: profileData.displayName,
        photoURL: profileData.photoURL,
        updatedAt: new Date(),
        createdAt: new Date() // This will only be set if the document doesn't exist
      }, { merge: true });

      if (onSuccess) {
        onSuccess('Profile updated successfully!');
      } else {
        setMessage('Profile updated successfully!');
      }
      setIsEditing(false);
      
      // Clear success message after 3 seconds (only for local messages)
      if (!onSuccess) {
        setTimeout(() => setMessage(''), 3000);
      }
    } catch (err) {
      console.error('Error updating profile:', err);
      const errorMessage = 'Failed to update profile. Please try again.';
      if (onError) {
        onError(errorMessage);
      } else {
        setError(errorMessage);
      }
    } finally {
      setIsLoading(false);
    }
  }, [profileData, onSuccess, onError, user]);

  const handleCancel = () => {
    setProfileData({
      displayName: user?.displayName || '',
      email: user?.email || '',
      photoURL: user?.photoURL || ''
    });
    setIsEditing(false);
    setError('');
    setMessage('');
    setCurrentPassword('');
    setShowPasswordInput(false);
  };

const handleDeleteAccount = useCallback(async () => {
    if (!deletePassword) {
      const errorMessage = 'Please enter your password to confirm account deletion.';
      if (onError) {
        onError(errorMessage);
      } else {
        setError(errorMessage);
      }
      return;
    }

    setIsDeleting(true);
    setMessage('');
    setError('');
    
    try {
      const currentUser = auth.currentUser;
      
      // Re-authenticate user before deletion for security
      const credential = EmailAuthProvider.credential(currentUser.email, deletePassword);
      await reauthenticateWithCredential(currentUser, credential);
      
      // Delete user data from Firestore
      const appId = getAppId();
      const userRef = doc(db, `artifacts/${appId}/users/${currentUser.uid}`);
      await deleteDoc(userRef);
      
      // Delete the user account
      await deleteUser(currentUser);
      
      const successMessage = 'Account deleted successfully. You will be redirected shortly.';
      if (onSuccess) {
        onSuccess(successMessage);
      } else {
        setMessage(successMessage);
      }
      setShowDeleteModal(false);
      
      // Redirect after successful deletion
      setTimeout(() => {
        window.location.href = '/';
      }, 2000);
    } catch (err) {
      console.error('Error deleting account:', err);
      let errorMessage;
      if (err.code === 'auth/wrong-password') {
        errorMessage = 'Incorrect password. Please try again.';
      } else if (err.code === 'auth/requires-recent-login') {
        errorMessage = 'Please log out and log back in before deleting your account.';
      } else {
        errorMessage = 'Failed to delete account. Please try again.';
      }
      
      if (onError) {
        onError(errorMessage);
      } else {
        setError(errorMessage);
      }
    } finally {
      setIsDeleting(false);
    }
  }, [deletePassword, onError, onSuccess, user]);

  const handleCloseDeleteModal = () => {
    setShowDeleteModal(false);
    setDeletePassword('');
    setError('');
  };

  // Email change password verification
  const verifyCurrentPasswordForEmailChange = async (newEmail) => {
    if (!currentPassword) {
      const errorMessage = 'Please enter your current password to change email.';
      if (onError) {
        onError(errorMessage);
      } else {
        setError(errorMessage);
      }
      return false;
    }

    setIsOTPLoading(true);
    try {
      // Re-authenticate user with current password
      const credential = EmailAuthProvider.credential(user.email, currentPassword);
      await reauthenticateWithCredential(auth.currentUser, credential);
      
      // If re-authentication succeeds, proceed with OTP
      return await sendOTPForEmailChange(newEmail);
    } catch (error) {
      console.error('Error verifying current password:', error);
      let errorMessage;
      if (error.code === 'auth/wrong-password') {
        errorMessage = 'Current password is incorrect. Please try again.';
      } else if (error.code === 'auth/too-many-requests') {
        errorMessage = 'Too many failed attempts. Please try again later.';
      } else {
        errorMessage = 'Failed to verify current password. Please try again.';
      }
      
      if (onError) {
        onError(errorMessage);
      } else {
        setError(errorMessage);
      }
      return false;
    } finally {
      setIsOTPLoading(false);
    }
  };

  // OTP verification functions
  const sendOTPForEmailChange = async (newEmail) => {
    try {
      const response = await fetch('/.netlify/functions/send-otp', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email: newEmail }),
      });
      
      if (!response.ok) {
        throw new Error('Failed to send OTP');
      }
      
      setPendingEmailChange(newEmail);
      setShowOTPVerification(true);
      setShowPasswordInput(false); // Hide password input after successful verification
      return true;
    } catch (error) {
      console.error('Error sending OTP:', error);
      const errorMessage = 'Failed to send OTP. Please try again.';
      if (onError) {
        onError(errorMessage);
      } else {
        setError(errorMessage);
      }
      return false;
    }
  };

  const handleOTPVerified = async () => {
    setIsOTPLoading(true);
    try {
      // Update email in Firebase Auth
      await updateEmail(auth.currentUser, pendingEmailChange);
      
      // Update profile data
      setProfileData(prev => ({ ...prev, email: pendingEmailChange }));
      
      // Update Firestore
      const appId = getAppId();
      const userRef = doc(db, `artifacts/${appId}/users/${user.uid}`);
      await setDoc(userRef, {
        email: pendingEmailChange,
        updatedAt: new Date(),
      }, { merge: true });
      
      const successMessage = 'Email updated successfully! Your new email address has been verified.';
      if (onSuccess) {
        onSuccess(successMessage);
      } else {
        setMessage(successMessage);
      }
      setShowOTPVerification(false);
      setPendingEmailChange('');
      setCurrentPassword('');
      setShowPasswordInput(false);
      setIsEditing(false);
      
      // Clear success message after 3 seconds (only for local messages)
      if (!onSuccess) {
        setTimeout(() => setMessage(''), 3000);
      }
    } catch (error) {
      console.error('Error updating email:', error);
      const errorMessage = 'Failed to update email. Please try again.';
      if (onError) {
        onError(errorMessage);
      } else {
        setError(errorMessage);
      }
    } finally {
      setIsOTPLoading(false);
    }
  };

  const handleOTPError = (errorMessage) => {
    if (onError) {
      onError(errorMessage);
    } else {
      setError(errorMessage);
    }
  };

  const handleOTPBack = () => {
    setShowOTPVerification(false);
    setPendingEmailChange('');
    setShowPasswordInput(true); // Show password input again when going back
  };

  const handleResendOTP = async () => {
    return sendOTPForEmailChange(pendingEmailChange);
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="w-full px-8 py-8">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
          <div className="flex items-center justify-between mb-6">
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">My Profile</h1>
            <button
              onClick={onBack}
              className="px-4 py-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors"
            >
              ← Back
            </button>
          </div>


          {/* Success/Error Messages */}
          {message && (
            <div className="bg-green-100 dark:bg-green-900/20 border border-green-400 dark:border-green-800 text-green-700 dark:text-green-300 px-4 py-3 rounded mb-6">
              {message}
            </div>
          )}
          {error && (
            <div className="bg-red-100 dark:bg-red-900/20 border border-red-400 dark:border-red-800 text-red-700 dark:text-red-300 px-4 py-3 rounded mb-6">
              {error}
            </div>
          )}

          <div className="space-y-6">
            <div className="flex items-center space-x-4">
              <div className="w-16 h-16 bg-gray-300 dark:bg-gray-600 rounded-full flex items-center justify-center">
                {user?.photoURL ? (
                  <img 
                    src={user.photoURL} 
                    alt="Profile" 
                    className="w-16 h-16 rounded-full"
                  />
                ) : (
                  <svg className="w-8 h-8 text-gray-600 dark:text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                )}
              </div>
              <div className="flex-1">
                <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                  {user?.displayName || 'User'}
                </h2>
                <p className="text-gray-600 dark:text-gray-400">{user?.email}</p>
                <div className="flex items-center mt-2">
                  <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">
                    <svg className="w-3 h-3 mr-1" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                    Email Verified
                  </span>
                </div>
              </div>
            </div>

            {/* Edit Profile Button - positioned in front of profile and near email box */}
            <div className="flex justify-end mb-4">
              {!isEditing && (
                <button
                  onClick={() => setIsEditing(true)}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center space-x-2"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                  </svg>
                  <span>Edit Profile</span>
                </button>
              )}
              {isEditing && (
                <div className="flex items-center space-x-2">
                  <button
                    onClick={handleSave}
                    disabled={isLoading}
                    className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
                  >
                    {isLoading && (
                      <svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                    )}
                    <span>{isLoading ? 'Saving...' : 'Save'}</span>
                  </button>
                  <button
                    onClick={handleCancel}
                    disabled={isLoading}
                    className="px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Cancel
                  </button>
                </div>
              )}
            </div>

            {/* Tier Management Section */}
            <div className="bg-gray-50 dark:bg-gray-900 rounded-lg p-6 border border-gray-200 dark:border-gray-700">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Account Tier</h3>
              <TierStatusIndicator showUpgradePrompt={true} />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Display Name
                </label>
                <input
                  type="text"
                  value={profileData.displayName}
                  onChange={(e) => setProfileData({...profileData, displayName: e.target.value})}
                  disabled={!isEditing}
                  className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white disabled:opacity-50"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Email
                </label>
                <div className="flex space-x-2">
                  <input
                    type="email"
                    value={profileData.email}
                    onChange={(e) => setProfileData({...profileData, email: e.target.value})}
                    disabled={!isEditing}
                    className="flex-1 p-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white disabled:opacity-50"
                  />
                  {isEditing && profileData.email !== user?.email && (
                    <button
                      onClick={() => {
                        if (showPasswordInput) {
                          verifyCurrentPasswordForEmailChange(profileData.email);
                        } else {
                          setShowPasswordInput(true);
                        }
                      }}
                      disabled={isOTPLoading || !profileData.email}
                      className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
                    >
                      {isOTPLoading && (
                        <svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                      )}
                      <span>
                        {isOTPLoading ? 'Verifying...' : (showPasswordInput ? 'Send OTP' : 'Change Email')}
                      </span>
                    </button>
                  )}
                </div>
                {isEditing && profileData.email !== user?.email && !showPasswordInput && (
                  <p className="text-sm text-amber-600 dark:text-amber-400 mt-2">
                    📧 Email change requires current password and OTP verification
                  </p>
                )}
                {isEditing && profileData.email !== user?.email && showPasswordInput && (
                  <div className="mt-3 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
                    <label className="block text-sm font-medium text-blue-900 dark:text-blue-300 mb-2">
                      🔒 Enter current password to verify email change
                    </label>
                    <input
                      type="password"
                      value={currentPassword}
                      onChange={(e) => setCurrentPassword(e.target.value)}
                      placeholder="Enter your current password"
                      className="w-full p-2 border border-blue-300 dark:border-blue-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' && currentPassword) {
                          verifyCurrentPasswordForEmailChange(profileData.email);
                        }
                      }}
                    />
                    <div className="flex justify-end space-x-2 mt-2">
                      <button
                        onClick={() => {
                          setShowPasswordInput(false);
                          setCurrentPassword('');
                        }}
                        className="px-3 py-1 text-sm text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200 transition-colors"
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Security Section */}
            <div className="border-t border-gray-200 dark:border-gray-700 pt-6">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Security</h3>
              
              {/* Two-Factor Authentication */}
              <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="text-sm font-medium text-gray-900 dark:text-white">Two-Factor Authentication</h4>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                      Add an extra layer of security to your account
                    </p>
                  </div>
                  <div className="flex items-center space-x-3">
                    <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200">
                      Coming Soon
                    </span>
                    <button
                      disabled
                      className="px-3 py-1 text-sm bg-gray-300 dark:bg-gray-600 text-gray-500 dark:text-gray-400 rounded cursor-not-allowed"
                    >
                      Enable 2FA
                    </button>
                  </div>
                </div>
              </div>
              
              {/* Password Change */}
              <div className="mt-4 bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="text-sm font-medium text-gray-900 dark:text-white">Password</h4>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                      Last changed: Unknown
                    </p>
                  </div>
                  <button
                    disabled
                    className="px-3 py-1 text-sm bg-gray-300 dark:bg-gray-600 text-gray-500 dark:text-gray-400 rounded cursor-not-allowed"
                  >
                    Change Password
                  </button>
                </div>
              </div>
            </div>

            {/* Account Deletion Section */}
            <div className="border-t border-red-200 dark:border-red-700 pt-6">
              <h3 className="text-lg font-semibold text-red-900 dark:text-white mb-4">Delete Account</h3>
              <div className="bg-red-50 dark:bg-red-900/20 rounded-lg p-4 mb-4">
                <div className="flex items-start space-x-3">
                  <svg className="w-5 h-5 text-red-500 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                  </svg>
                  <div>
                    <h4 className="text-red-800 dark:text-red-200 font-medium">Danger Zone</h4>
                    <p className="text-red-700 dark:text-red-300 text-sm mt-1">
                      Once you delete your account, there is no going back. Please be certain.
                    </p>
                  </div>
                </div>
              </div>
              <button
                onClick={() => setShowDeleteModal(true)}
                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors flex items-center space-x-2"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
                <span>Delete Account</span>
              </button>
            </div>

            {/* Account Statistics */}
            <div className="border-t border-gray-200 dark:border-gray-700 pt-6">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Account Statistics</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4">
                  <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">--</div>
                  <div className="text-sm text-blue-800 dark:text-blue-200">Content Generated</div>
                </div>
                <div className="bg-green-50 dark:bg-green-900/20 rounded-lg p-4">
                  <div className="text-2xl font-bold text-green-600 dark:text-green-400">--</div>
                  <div className="text-sm text-green-800 dark:text-green-200">Days Active</div>
                </div>
                <div className="bg-purple-50 dark:bg-purple-900/20 rounded-lg p-4">
                  <div className="text-2xl font-bold text-purple-600 dark:text-purple-400">Basic</div>
                  <div className="text-sm text-purple-800 dark:text-purple-200">Account Tier</div>
                </div>
              </div>
            </div>

          </div>
        </div>
      </div>
      
      {/* OTP Verification Modal */}
      {showOTPVerification && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-lg max-w-md w-full">
            <OTPVerification
              email={pendingEmailChange}
              onVerified={handleOTPVerified}
              onBack={handleOTPBack}
              onError={handleOTPError}
              onResendOTP={handleResendOTP}
            />
          </div>
        </div>
      )}

      {/* Delete Account Confirmation Modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 max-w-md w-full mx-4">
            <div className="flex items-center space-x-3 mb-4">
              <svg className="w-6 h-6 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.988-.833-2.728 0L4.086 16.5c-.77.833.192 2.5 1.732 2.5z" />
              </svg>
              <h3 className="text-lg font-semibold text-red-900 dark:text-white">Confirm Account Deletion</h3>
            </div>
            
            <div className="mb-6">
              <p className="text-gray-700 dark:text-gray-300 mb-4">
                This action cannot be undone. This will permanently delete your account and remove all your data from our servers.
              </p>
              
              <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-700 rounded-lg p-3 mb-4">
                <h4 className="font-medium text-red-800 dark:text-red-200 mb-2">This will delete:</h4>
                <ul className="text-sm text-red-700 dark:text-red-300 space-y-1">
                  <li>• Your profile and account settings</li>
                  <li>• All your generated content</li>
                  <li>• Chat history and conversations</li>
                  <li>• Preferences and customizations</li>
                </ul>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Please enter your password to confirm:
                </label>
                <input
                  type="password"
                  value={deletePassword}
                  onChange={(e) => setDeletePassword(e.target.value)}
                  className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  placeholder="Enter your password"
                />
              </div>
            </div>
            
            <div className="flex justify-end space-x-3">
              <button
                onClick={handleCloseDeleteModal}
                disabled={isDeleting}
                className="px-4 py-2 text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200 transition-colors disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                onClick={handleDeleteAccount}
                disabled={isDeleting || !deletePassword}
                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
              >
                {isDeleting && (
                  <svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                )}
                <span>{isDeleting ? 'Deleting...' : 'Delete Account'}</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MyProfilePage;
