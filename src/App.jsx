import React, { useState, useEffect } from 'react'
import Header from './components/Header'
import TabNavigation from './components/TabNavigation'
import CalculatorLayout from './components/CalculatorLayout'
import SignupSection from './components/SignupSection'
import Footer from './components/Footer'
import { CalculatorProvider } from './context/CalculatorContext'
import './App.css'

const MODULES = [
  { id: 'mortgage', name: 'Mortgage', icon: '🏠', description: 'Calculate home loan payments and total interest' },
  { id: 'bsd', name: 'BSD Calculator', icon: '📄', description: 'Buyer\'s Stamp Duty for property purchase' },
  { id: 'absd', name: 'ABSD Calculator', icon: '📋', description: 'Additional Buyer\'s Stamp Duty for multiple properties' },
  { id: 'ssd', name: 'SSD Calculator', icon: '📊', description: 'Seller\'s Stamp Duty for property sale' },
  { id: 'tdsr', name: 'TDSR', icon: '📊', description: 'Total Debt Servicing Ratio calculator' },
  { id: 'cpf', name: 'CPF', icon: '💰', description: 'CPF contribution and retirement planning' },
  { id: 'income-tax', name: 'Income Tax', icon: '🏛️', description: 'Individual income tax calculator' },
  { id: 'corporate-tax', name: 'Corporate Tax', icon: '🏢', description: 'Corporate income tax calculator' },
  { id: 'investment', name: 'Investment ROI', icon: '📈', description: 'Investment returns and SIP calculator' },
  { id: 'hdb-upgrade', name: 'HDB Upgrade', icon: '🏘️', description: 'HDB to private property upgrade path' },
  { id: 'affordability', name: 'Affordability', icon: '💳', description: 'Property affordability calculator' },
  { id: 'user-guide', name: 'User Guide', icon: '📱', description: 'How to install the app on your phone' }
]

function App() {
  const [activeModule, setActiveModule] = useState('')

  useEffect(() => {
    // Listen for module change events from welcome screen
    const handleModuleChange = (event) => {
      setActiveModule(event.detail)
    }

    window.addEventListener('moduleChange', handleModuleChange)
    
    return () => {
      window.removeEventListener('moduleChange', handleModuleChange)
    }
  }, [])

  const handleModuleChange = (moduleId) => {
    setActiveModule(moduleId)
  }

  return (
    <CalculatorProvider>
      <div className="app-container">
        <Header />
        <main className="main-content">
          <div className="container">
            <CalculatorLayout 
              modules={MODULES}
              activeModule={activeModule}
            />
            {activeModule !== 'user-guide' && <SignupSection />}
          </div>
        </main>
        <Footer />
      </div>
    </CalculatorProvider>
  )
}

export default App
