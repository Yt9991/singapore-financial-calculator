import React, { useState, useEffect } from 'react'
import './UserDetailsInput.css'

const UserDetailsInput = ({ onSave, onCancel, isOpen }) => {
  const [userDetails, setUserDetails] = useState({
    name: '',
    ceaNumber: '',
    mobile: '',
    email: ''
  })
  const [errors, setErrors] = useState({})
  const [isSaving, setIsSaving] = useState(false)

  // Load saved details if available
  useEffect(() => {
    try {
      const saved = localStorage.getItem('sg-finance-user-details')
      if (saved) {
        const parsed = JSON.parse(saved)
        setUserDetails(parsed)
      }
    } catch (error) {
      console.error('Error loading user details:', error)
    }
  }, [])

  const handleInputChange = (field, value) => {
    setUserDetails(prev => ({ ...prev, [field]: value }))
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }))
    }
  }

  const validateForm = () => {
    const newErrors = {}
    
    if (!userDetails.name.trim()) {
      newErrors.name = 'Name is required'
    }
    
    if (!userDetails.ceaNumber.trim()) {
      newErrors.ceaNumber = 'CEA Number is required'
    } else if (!/^R\d{5,7}[A-Z]?$/i.test(userDetails.ceaNumber.trim())) {
      newErrors.ceaNumber = 'Invalid CEA format (e.g., R123456A or R12345)'
    }
    
    if (!userDetails.mobile.trim()) {
      newErrors.mobile = 'Mobile number is required'
    } else if (!/^(\+65|65)?[689]\d{7}$/.test(userDetails.mobile.replace(/\s/g, ''))) {
      newErrors.mobile = 'Invalid Singapore mobile number'
    }
    
    if (!userDetails.email.trim()) {
      newErrors.email = 'Email is required'
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(userDetails.email.trim())) {
      newErrors.email = 'Invalid email format'
    }
    
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSave = () => {
    if (validateForm()) {
      setIsSaving(true)
      try {
        // Save to localStorage
        localStorage.setItem('sg-finance-user-details', JSON.stringify(userDetails))
        onSave(userDetails)
        
        // Show success message and redirect
        setTimeout(() => {
          window.location.href = '/'
        }, 1500) // 1.5 second delay to show success message
      } catch (error) {
        console.error('Error saving user details:', error)
        alert('Error saving details. Please try again.')
        setIsSaving(false)
      }
    }
  }

  if (!isOpen) return null

  return (
    <div className="user-details-overlay">
      <div className="user-details-modal">
        <div className="modal-header">
          <h3>👤 Your Professional Details</h3>
          <p>Enter your details to include in the report</p>
        </div>

        <div className="form-grid">
          <div className="form-field">
            <label htmlFor="user-name">Full Name *</label>
            <input
              type="text"
              id="user-name"
              value={userDetails.name}
              onChange={(e) => handleInputChange('name', e.target.value)}
              placeholder="Your Full Name"
              className={errors.name ? 'error' : ''}
            />
            {errors.name && <span className="error-message">{errors.name}</span>}
          </div>

          <div className="form-field">
            <label htmlFor="user-cea">CEA Registration Number *</label>
            <input
              type="text"
              id="user-cea"
              value={userDetails.ceaNumber}
              onChange={(e) => handleInputChange('ceaNumber', e.target.value.toUpperCase())}
              placeholder="e.g., R123456A or R12345"
              className={errors.ceaNumber ? 'error' : ''}
            />
            {errors.ceaNumber && <span className="error-message">{errors.ceaNumber}</span>}
          </div>

          <div className="form-field">
            <label htmlFor="user-mobile">Mobile Contact *</label>
            <input
              type="tel"
              id="user-mobile"
              value={userDetails.mobile}
              onChange={(e) => handleInputChange('mobile', e.target.value)}
              placeholder="+65 9123 4567"
              className={errors.mobile ? 'error' : ''}
            />
            {errors.mobile && <span className="error-message">{errors.mobile}</span>}
          </div>

          <div className="form-field">
            <label htmlFor="user-email">Email Address *</label>
            <input
              type="email"
              id="user-email"
              value={userDetails.email}
              onChange={(e) => handleInputChange('email', e.target.value)}
              placeholder="your.email@example.com"
              className={errors.email ? 'error' : ''}
            />
            {errors.email && <span className="error-message">{errors.email}</span>}
          </div>
        </div>

        <div className="modal-actions">
          <button className="cancel-button" onClick={onCancel} disabled={isSaving}>
            Cancel
          </button>
          <button className="save-button" onClick={handleSave} disabled={isSaving}>
            {isSaving ? '💾 Saving...' : '💾 Save & Continue'}
          </button>
        </div>
        
        {isSaving && (
          <div className="success-message">
            ✅ Details saved successfully! Redirecting to dashboard...
          </div>
        )}
      </div>
    </div>
  )
}

export default UserDetailsInput
