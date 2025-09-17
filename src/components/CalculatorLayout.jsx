import React from 'react'
import InputPanel from './InputPanel'
import ResultsPanel from './ResultsPanel'
import UserGuide from './UserGuide'
import './CalculatorLayout.css'

const CalculatorLayout = ({ modules, activeModule }) => {
  const currentModule = modules.find(module => module.id === activeModule)

  // Show User Guide in full width when selected
  if (activeModule === 'user-guide') {
    return (
      <div className="user-guide-layout">
        <UserGuide />
      </div>
    )
  }

  // Show welcome screen when no module is selected
  if (!activeModule) {
    return (
      <div className="welcome-layout">
        <div className="welcome-screen">
          <div className="welcome-content">
            <h2>🇸🇬 Welcome to Singapore Financial Calculator</h2>
            <p>Choose a calculator below to get started with your financial planning.</p>
            
            <div className="quick-access-grid">
              {modules.map((module, index) => (
                <div 
                  key={module.id} 
                  className="quick-access-card"
                  onClick={() => window.dispatchEvent(new CustomEvent('moduleChange', { detail: module.id }))}
                  style={{ animationDelay: `${index * 50}ms` }}
                >
                  <div className="card-icon">{module.icon}</div>
                  <div className="card-title">{module.name}</div>
                  <div className="card-description">{module.description}</div>
                </div>
              ))}
            </div>
            
            <div className="welcome-features">
              <h3>✨ Key Features</h3>
              <div className="features-list">
                <div className="feature-item">
                  <span className="feature-icon">📊</span>
                  <span>10 Professional Calculators</span>
                </div>
                <div className="feature-item">
                  <span className="feature-icon">📱</span>
                  <span>Mobile-Friendly PWA</span>
                </div>
                <div className="feature-item">
                  <span className="feature-icon">💾</span>
                  <span>Save & Export Reports</span>
                </div>
                <div className="feature-item">
                  <span className="feature-icon">🔒</span>
                  <span>Privacy-First Design</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="calculator-layout">
      <div className="calculator-header">
        <button 
          className="back-to-home-button"
          onClick={() => window.dispatchEvent(new CustomEvent('moduleChange', { detail: '' }))}
        >
          ← Back to Home
        </button>
        <h3 className="current-calculator-title">
          {currentModule?.icon} {currentModule?.name} Calculator
        </h3>
      </div>
      <div className="calculator-grid">
        <InputPanel 
          module={currentModule}
          moduleId={activeModule}
        />
        <ResultsPanel 
          moduleId={activeModule}
        />
      </div>
    </div>
  )
}

export default CalculatorLayout
