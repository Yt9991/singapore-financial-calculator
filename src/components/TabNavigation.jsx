import React from 'react'
import './TabNavigation.css'

const TabNavigation = ({ modules, activeModule, onModuleChange }) => {
  return (
    <nav className="tab-navigation">
      <div className="tab-container">
        {modules.map((module) => (
          <button
            key={module.id}
            className={`tab-button ${activeModule === module.id ? 'active' : ''}`}
            onClick={() => onModuleChange(module.id)}
            aria-label={`Switch to ${module.name} calculator`}
          >
            <span className="tab-icon">{module.icon}</span>
            <span className="tab-name">{module.name}</span>
          </button>
        ))}
      </div>
    </nav>
  )
}

export default TabNavigation
