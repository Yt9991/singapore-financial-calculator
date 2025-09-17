import React from 'react'
import './Footer.css'

const Footer = () => {
  return (
    <footer className="app-footer">
      <div className="container">
        <div className="footer-content">
          <div className="footer-section">
            <h4>Singapore Financial Calculator</h4>
            <p>Comprehensive financial planning tools for Singapore residents</p>
            <p className="version">Version 2025.1.0</p>
          </div>
          
          <div className="footer-section">
            <h5>Important Notice</h5>
            <p>This calculator is for indicative purposes only and does not constitute professional financial advice.</p>
            <p>Always consult with qualified financial advisors before making financial decisions.</p>
          </div>
          
          <div className="footer-section">
            <h5>Official Sources</h5>
            <div className="official-links">
              <a href="https://www.iras.gov.sg" target="_blank" rel="noopener noreferrer">IRAS</a>
              <a href="https://www.cpf.gov.sg" target="_blank" rel="noopener noreferrer">CPF Board</a>
              <a href="https://www.mas.gov.sg" target="_blank" rel="noopener noreferrer">MAS</a>
              <a href="https://www.hdb.gov.sg" target="_blank" rel="noopener noreferrer">HDB</a>
            </div>
          </div>
        </div>
        
        <div className="footer-bottom">
          <p>&copy; 2025 Singapore Financial Calculator. For educational purposes only.</p>
          <p>Powered by <strong>Team Mindlink</strong> | Courtesy of <strong>#thepeoplesagency</strong></p>
        </div>
      </div>
    </footer>
  )
}

export default Footer
