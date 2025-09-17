import React, { useState } from 'react'
import './UserGuide.css'

const UserGuide = () => {
  const [activeSection, setActiveSection] = useState('ios')

  const sections = [
    { id: 'ios', title: '🍎 iOS Devices', icon: '📱' },
    { id: 'android', title: '🤖 Android Devices', icon: '📱' },
    { id: 'troubleshooting', title: '🔧 Troubleshooting', icon: '🛠️' },
    { id: 'benefits', title: '✨ Benefits', icon: '🎯' },
    { id: 'verification', title: '📋 Verification', icon: '✅' }
  ]

  const renderIOSGuide = () => (
    <div className="guide-section">
      <h3>🍎 FOR iOS DEVICES (iPhone/iPad)</h3>
      <div className="step-list">
        <div className="step">
          <div className="step-number">1</div>
          <div className="step-content">
            <h4>Open Safari Browser</h4>
            <p><strong>⚠️ Important:</strong> Must use Safari browser (not Chrome or other browsers)</p>
            <p>Tap Safari app icon on your home screen</p>
          </div>
        </div>

        <div className="step">
          <div className="step-number">2</div>
          <div className="step-content">
            <h4>Visit the Calculator</h4>
            <p>Enter the website URL or click the provided link</p>
            <p>Wait for the page to fully load</p>
          </div>
        </div>

        <div className="step">
          <div className="step-number">3</div>
          <div className="step-content">
            <h4>Access Share Menu</h4>
            <p>Tap the Share button at the bottom of Safari</p>
            <p>Look for the square with an arrow pointing upward ⬆️</p>
          </div>
        </div>

        <div className="step">
          <div className="step-number">4</div>
          <div className="step-content">
            <h4>Find "Add to Home Screen"</h4>
            <p>Scroll down in the share menu options</p>
            <p>Tap "Add to Home Screen" 📱</p>
            <p><em>(If you don't see it, scroll down further in the options)</em></p>
          </div>
        </div>

        <div className="step">
          <div className="step-number">5</div>
          <div className="step-content">
            <h4>Customize App Name</h4>
            <p>Default name: "Singapore Financial Calculator"</p>
            <p>You can shorten it to "SG Calculator" or "Financial Calc"</p>
            <p>Tap "Add" in the top right corner</p>
          </div>
        </div>

        <div className="step">
          <div className="step-number">6</div>
          <div className="step-content">
            <h4>Confirmation</h4>
            <p>The app icon will appear on your home screen</p>
            <p>It will look and function like a native app</p>
            <p><strong>No App Store download required!</strong></p>
          </div>
        </div>
      </div>
    </div>
  )

  const renderAndroidGuide = () => (
    <div className="guide-section">
      <h3>🤖 FOR ANDROID DEVICES</h3>
      
      <div className="method-section">
        <h4>Method 1: Chrome Browser (Recommended)</h4>
        <div className="step-list">
          <div className="step">
            <div className="step-number">1</div>
            <div className="step-content">
              <h5>Open Chrome Browser</h5>
              <p>Launch Google Chrome app</p>
              <p>Visit the calculator website link</p>
            </div>
          </div>

          <div className="step">
            <div className="step-number">2</div>
            <div className="step-content">
              <h5>Access Menu</h5>
              <p>Tap the three dots menu (⋮) in the top right corner</p>
              <p>Look for browser menu options</p>
            </div>
          </div>

          <div className="step">
            <div className="step-number">3</div>
            <div className="step-content">
              <h5>Add to Home Screen</h5>
              <p>Tap "Add to Home screen" or "Install app"</p>
              <p>Some devices may show "Create shortcut"</p>
            </div>
          </div>

          <div className="step">
            <div className="step-number">4</div>
            <div className="step-content">
              <h5>Confirm Installation</h5>
              <p>Customize the app name if desired</p>
              <p>Tap "Add" or "Install"</p>
              <p>The app icon appears on your home screen</p>
            </div>
          </div>
        </div>
      </div>

      <div className="method-section">
        <h4>Method 2: Samsung Internet Browser</h4>
        <div className="step-list">
          <div className="step">
            <div className="step-number">1</div>
            <div className="step-content">
              <h5>Open Samsung Internet</h5>
              <p>Use Samsung's default browser</p>
              <p>Navigate to the calculator website</p>
            </div>
          </div>

          <div className="step">
            <div className="step-number">2</div>
            <div className="step-content">
              <h5>Access Menu</h5>
              <p>Tap the menu button (three lines or dots)</p>
              <p>Look for "Add page to" options</p>
            </div>
          </div>

          <div className="step">
            <div className="step-number">3</div>
            <div className="step-content">
              <h5>Add to Home Screen</h5>
              <p>Select "Add page to Home screen"</p>
              <p>Confirm the installation</p>
            </div>
          </div>
        </div>
      </div>

      <div className="method-section">
        <h4>Method 3: Alternative for Other Browsers</h4>
        <p>If other browsers don't show the option:</p>
        <ul>
          <li>Switch to Chrome browser</li>
          <li>Follow Method 1 above</li>
          <li>Chrome has the best PWA support on Android</li>
        </ul>
      </div>
    </div>
  )

  const renderTroubleshooting = () => (
    <div className="guide-section">
      <h3>🔧 TROUBLESHOOTING GUIDE</h3>
      
      <div className="troubleshooting-section">
        <h4>iOS Issues:</h4>
        <div className="issue">
          <p><strong>❌ "Add to Home Screen" not visible:</strong></p>
          <ul>
            <li>Ensure you're using Safari browser only</li>
            <li>Check that JavaScript is enabled in Safari settings</li>
            <li>Try refreshing the page and waiting for full load</li>
          </ul>
        </div>

        <div className="issue">
          <p><strong>❌ App doesn't work offline:</strong></p>
          <ul>
            <li>Open the app once while connected to internet</li>
            <li>Let it fully load all components</li>
            <li>Offline functionality will activate automatically</li>
          </ul>
        </div>
      </div>

      <div className="troubleshooting-section">
        <h4>Android Issues:</h4>
        <div className="issue">
          <p><strong>❌ No install option in menu:</strong></p>
          <ul>
            <li>Try using Chrome browser instead</li>
            <li>Clear browser cache and try again</li>
            <li>Ensure the website fully loads before attempting installation</li>
          </ul>
        </div>

        <div className="issue">
          <p><strong>❌ App icon doesn't appear:</strong></p>
          <ul>
            <li>Check if it was added to app drawer instead of home screen</li>
            <li>Look in "Recent apps" or search for "Singapore Calculator"</li>
          </ul>
        </div>
      </div>
    </div>
  )

  const renderBenefits = () => (
    <div className="guide-section">
      <h3>✨ BENEFITS OF INSTALLING AS APP</h3>
      
      <div className="benefits-grid">
        <div className="benefit-card">
          <h4>📱 Native App Experience</h4>
          <ul>
            <li>Faster loading - No browser overhead</li>
            <li>Offline functionality - Works without internet</li>
            <li>Full screen view - No browser address bar</li>
            <li>Smoother performance - Optimized app behavior</li>
          </ul>
        </div>

        <div className="benefit-card">
          <h4>🎯 Convenience Features</h4>
          <ul>
            <li>Home screen access - One tap to open</li>
            <li>App switching - Appears in recent apps list</li>
            <li>Notifications - Get updates about rate changes</li>
            <li>Data persistence - Saves your calculations locally</li>
          </ul>
        </div>

        <div className="benefit-card">
          <h4>🔒 Privacy & Security</h4>
          <ul>
            <li>No app store permissions - No data collection</li>
            <li>Local storage only - Calculations stay on your device</li>
            <li>No tracking - Private financial planning tool</li>
          </ul>
        </div>
      </div>
    </div>
  )

  const renderVerification = () => (
    <div className="guide-section">
      <h3>📋 VERIFICATION CHECKLIST</h3>
      
      <div className="verification-section">
        <h4>✅ Installation Successful When:</h4>
        <div className="checklist">
          <div className="checklist-item">
            <span className="check-icon">✅</span>
            <span>App icon appears on home screen with calculator symbol</span>
          </div>
          <div className="checklist-item">
            <span className="check-icon">✅</span>
            <span>Tapping icon opens full-screen app (no browser bars)</span>
          </div>
          <div className="checklist-item">
            <span className="check-icon">✅</span>
            <span>App works smoothly without internet connection</span>
          </div>
          <div className="checklist-item">
            <span className="check-icon">✅</span>
            <span>All 10 calculator modules load properly</span>
          </div>
          <div className="checklist-item">
            <span className="check-icon">✅</span>
            <span>Results save between app sessions</span>
          </div>
        </div>
      </div>

      <div className="help-section">
        <h4>📞 Need Help?</h4>
        <div className="contact-info">
          <p><strong>Contact:</strong> #thepeoplesagency</p>
          <p><strong>Powered by:</strong> Team Mindlink 2025</p>
        </div>
      </div>
    </div>
  )

  const renderContent = () => {
    switch (activeSection) {
      case 'ios':
        return renderIOSGuide()
      case 'android':
        return renderAndroidGuide()
      case 'troubleshooting':
        return renderTroubleshooting()
      case 'benefits':
        return renderBenefits()
      case 'verification':
        return renderVerification()
      default:
        return renderIOSGuide()
    }
  }

  return (
    <div className="user-guide">
      <div className="guide-header">
        <h2>📱 USER GUIDE: Installing Singapore Financial Calculator on Your Phone</h2>
        <p>Follow these step-by-step instructions to install our PWA on your mobile device</p>
      </div>

      <div className="guide-navigation">
        {sections.map(section => (
          <button
            key={section.id}
            className={`nav-button ${activeSection === section.id ? 'active' : ''}`}
            onClick={() => setActiveSection(section.id)}
          >
            <span className="nav-icon">{section.icon}</span>
            <span className="nav-title">{section.title}</span>
          </button>
        ))}
      </div>

      <div className="guide-content">
        {renderContent()}
      </div>
    </div>
  )
}

export default UserGuide
