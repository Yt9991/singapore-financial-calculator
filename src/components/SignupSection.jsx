import React, { useState } from 'react'
import './SignupSection.css'

const SignupSection = () => {
  const [showSignup, setShowSignup] = useState(false)
  const [email, setEmail] = useState('')

  const handleSubscribe = () => {
    if (email) {
      setShowSignup(true)
      // Here you would typically send the email to your backend
      console.log('Subscribed email:', email)
    }
  }

  return (
    <div className="signup-section">
      <div className="signup-content">
        <h4>🚀 Get More Professional Tools</h4>
        <p>Sign up for additional web applications designed for Singapore property professionals:</p>
        
        <div className="signup-features">
          <div className="feature-item">
            <span className="feature-icon">🏠</span>
            <span>Property Valuation Tools</span>
          </div>
          <div className="feature-item">
            <span className="feature-icon">📊</span>
            <span>Market Analysis Reports</span>
          </div>
          <div className="feature-item">
            <span className="feature-icon">📱</span>
            <span>Client Management System</span>
          </div>
          <div className="feature-item">
            <span className="feature-icon">📈</span>
            <span>Investment Analytics</span>
          </div>
        </div>

        <div className="signup-form">
          <input
            type="email"
            placeholder="Enter your email for updates"
            className="signup-email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
          <button className="signup-button" onClick={handleSubscribe}>
            {showSignup ? '✓ Subscribed!' : 'Subscribe for Updates'}
          </button>
        </div>

        <div className="signup-benefits">
          <p><strong>Benefits:</strong> Early access to new tools, exclusive training materials, and professional networking opportunities.</p>
        </div>
      </div>
    </div>
  )
}

export default SignupSection

