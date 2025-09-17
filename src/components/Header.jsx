import React, { useState, useEffect } from 'react'
import Logo from './Logo'
import UserDetailsInput from './UserDetailsInput'
import './Header.css'

const Header = () => {
  const [showInstallPrompt, setShowInstallPrompt] = useState(false)
  const [deferredPrompt, setDeferredPrompt] = useState(null)
  const [showUserDetails, setShowUserDetails] = useState(false)
  const [userDetails, setUserDetails] = useState(null)

  useEffect(() => {
    // Listen for the beforeinstallprompt event
    const handleBeforeInstallPrompt = (e) => {
      // Prevent the mini-infobar from appearing on mobile
      e.preventDefault()
      // Stash the event so it can be triggered later
      setDeferredPrompt(e)
      setShowInstallPrompt(true)
    }

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt)

    // Check for existing user details
    const savedDetails = localStorage.getItem('sg-finance-user-details')
    if (savedDetails) {
      try {
        setUserDetails(JSON.parse(savedDetails))
      } catch (error) {
        console.error('Error loading user details:', error)
      }
    }

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt)
    }
  }, [])


  const handleInstallClick = async () => {
    if (deferredPrompt) {
      // Show the install prompt
      deferredPrompt.prompt()
      // Wait for the user to respond to the prompt
      const { outcome } = await deferredPrompt.userChoice
      console.log(`User response to the install prompt: ${outcome}`)
      // Clear the deferredPrompt
      setDeferredPrompt(null)
      setShowInstallPrompt(false)
    }
  }

  const handleUserDetailsSave = (details) => {
    setUserDetails(details)
    setShowUserDetails(false)
  }

  const handleUserDetailsCancel = () => {
    setShowUserDetails(false)
  }


  return (
    <header className="app-header">
      <div className="header-content">
        <div className="header-logo">
          <Logo size="large" />
        </div>
        <p>Comprehensive financial planning tools for Singapore residents</p>
        <div className="header-badge">
          <span className="version-badge">v2025.1.0</span>
          <span className="powered-by">Powered by Team Mindlink</span>
        </div>
        
        {/* User Details Section */}
        <div className="header-user-section">
          {userDetails ? (
            <div className="user-info">
              <span className="user-name">👤 {userDetails.name}</span>
              <span className="user-cea">CEA: {userDetails.ceaNumber}</span>
              {userDetails.email && <span className="user-email">📧 {userDetails.email}</span>}
              <button 
                className="edit-user-button"
                onClick={() => setShowUserDetails(true)}
                title="Edit your details"
              >
                ✏️ Edit
              </button>
            </div>
          ) : (
            <button 
              className="add-user-button"
              onClick={() => setShowUserDetails(true)}
            >
              👤 Add Your Details for Personalized Reports
            </button>
          )}
        </div>
        {showInstallPrompt && (
          <div className="install-prompt">
            <p>📱 Install this app on your phone for a better experience!</p>
            <button className="install-button" onClick={handleInstallClick}>
              Install App
            </button>
            <button className="dismiss-button" onClick={() => setShowInstallPrompt(false)}>
              ×
            </button>
          </div>
        )}
      </div>
      
      {/* User Details Input Modal */}
      <UserDetailsInput
        isOpen={showUserDetails}
        onSave={handleUserDetailsSave}
        onCancel={handleUserDetailsCancel}
      />
    </header>
  )
}

export default Header
