import React from 'react'
import './Logo.css'

const Logo = ({ size = 'medium', showText = true, className = '' }) => {
  const sizeClasses = {
    small: 'logo-small',
    medium: 'logo-medium',
    large: 'logo-large'
  }

  return (
    <div className={`logo-container ${sizeClasses[size]} ${className}`}>
      <div className="logo-icon">
        <svg width="40" height="40" viewBox="0 0 40 40" xmlns="http://www.w3.org/2000/svg">
          {/* Calculator icon */}
          <rect x="4" y="8" width="32" height="24" fill="#FFFFFF" rx="2"/>
          <rect x="6" y="10" width="28" height="4" fill="#2D2D2D" rx="1"/>
          
          {/* Calculator buttons */}
          <rect x="6" y="16" width="4" height="3" fill="#BC9E7B" rx="0.5"/>
          <rect x="12" y="16" width="4" height="3" fill="#BC9E7B" rx="0.5"/>
          <rect x="18" y="16" width="4" height="3" fill="#BC9E7B" rx="0.5"/>
          <rect x="24" y="16" width="4" height="3" fill="#BC9E7B" rx="0.5"/>
          
          <rect x="6" y="21" width="4" height="3" fill="#BC9E7B" rx="0.5"/>
          <rect x="12" y="21" width="4" height="3" fill="#BC9E7B" rx="0.5"/>
          <rect x="18" y="21" width="4" height="3" fill="#BC9E7B" rx="0.5"/>
          <rect x="24" y="21" width="4" height="3" fill="#BC9E7B" rx="0.5"/>
          
          <rect x="6" y="26" width="4" height="3" fill="#BC9E7B" rx="0.5"/>
          <rect x="12" y="26" width="4" height="3" fill="#BC9E7B" rx="0.5"/>
          <rect x="18" y="26" width="4" height="3" fill="#BC9E7B" rx="0.5"/>
          <rect x="24" y="26" width="4" height="3" fill="#BC9E7B" rx="0.5"/>
          
          {/* Singapore flag accent */}
          <circle cx="32" cy="32" r="4" fill="#FF0000"/>
          <circle cx="32" cy="32" r="2" fill="#FFFFFF"/>
        </svg>
      </div>
      
      {showText && (
        <div className="logo-text">
          <div className="logo-title">
            <span className="logo-main">SINGAPORE</span>
            <span className="logo-main">FINANCIAL</span>
            <span className="logo-accent">CALCULATOR</span>
          </div>
          <div className="logo-subtitle">Professional Financial Planning Tools</div>
        </div>
      )}
    </div>
  )
}

export default Logo
