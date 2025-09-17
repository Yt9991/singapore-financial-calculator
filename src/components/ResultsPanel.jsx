import React, { useState } from 'react'
import { useCalculator } from '../context/CalculatorContext'
import { formatCurrency, formatPercentage, formatNumber } from '../utils/calculations'
import { exportToPDF } from '../utils/exportUtils'
import { exportModernCalculationPDF } from '../utils/modernExportUtils'
import './ResultsPanel.css'

const ResultsPanel = ({ moduleId }) => {
  const { state } = useCalculator()
  const calculation = state.calculations[moduleId]

  const handleExportResults = async () => {
    // Ask for client name before export
    const clientName = prompt('Enter client name for this report (optional):')
    if (clientName === null) return // User cancelled
    
    // Proceed with export
    await performExport(clientName)
  }

  const performExport = async (clientName = '') => {
    try {
      // Use modern PDF export instead of html2canvas
      const calculation = state.calculations[moduleId]
      if (calculation?.result) {
        const moduleName = moduleId.charAt(0).toUpperCase() + moduleId.slice(1).replace('-', ' ')
        await exportModernCalculationPDF(moduleId, moduleName, calculation.result, calculation.inputs || {}, clientName)
        alert('✅ Modern PDF exported successfully!')
      } else {
        alert('⚠️ No calculation results available to export.')
      }
    } catch (error) {
      console.error('Export error:', error)
      alert('❌ Export failed: ' + error.message)
    }
  }

  const handleUserDetailsSave = (userDetails) => {
    setShowUserDetails(false)
    // Proceed with the pending export
    if (pendingExport) {
      performExport()
      setPendingExport(null)
    }
  }

  const handleUserDetailsCancel = () => {
    setShowUserDetails(false)
    setPendingExport(null)
  }

  const renderResultItem = (label, value, type = 'currency', className = '') => (
    <div className={`result-item ${className}`}>
      <span className="result-label">{label}</span>
      <span className={`result-value ${className}`}>
        {type === 'currency' ? formatCurrency(value) :
         type === 'percentage' ? formatPercentage(value) :
         type === 'number' ? formatNumber(value) :
         value}
      </span>
    </div>
  )

  const renderMortgageResults = (result) => (
    <div className="result-card">
      <h4>🏠 Mortgage Calculation Results</h4>
      {renderResultItem('Monthly EMI', result.monthlyEMI, 'currency', 'large')}
      {renderResultItem('Total Payment', result.totalPayment, 'currency')}
      {renderResultItem('Total Interest', result.totalInterest, 'currency')}
      {result.ltvRatio && renderResultItem('LTV Ratio', result.ltvRatio, 'percentage')}
    </div>
  )

  const renderBSDResults = (result) => (
    <div className="result-card">
      <h4>📄 BSD Calculation Results</h4>
      {renderResultItem('Property Value', result.propertyValue, 'currency')}
      {renderResultItem('Buyer Stamp Duty (BSD)', result.bsd, 'currency', 'large')}
      {result.breakdown && (
        <div className="breakdown-section">
          <h5>BSD Breakdown by Bracket:</h5>
          {result.breakdown.map((bracket, index) => (
            <div key={index} className="breakdown-item">
              <span className="breakdown-range">{bracket.range}</span>
              <span className="breakdown-amount">${bracket.amount.toLocaleString()}</span>
              <span className="breakdown-rate">{bracket.rate}%</span>
              <span className="breakdown-tax">${bracket.tax.toLocaleString()}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  )

  const renderABSDResults = (result) => (
    <div className="result-card">
      <h4>📋 ABSD Calculation Results</h4>
      {renderResultItem('Property Value', result.propertyValue, 'currency')}
      {renderResultItem('Buyer Type', result.buyerType.replace('_', ' ').toUpperCase())}
      {renderResultItem('ABSD Rate', result.absdRate, 'percentage')}
      {renderResultItem('Additional Buyer Stamp Duty (ABSD)', result.absd, 'currency', 'large')}
      <div className="explanation-section">
        <p><strong>Explanation:</strong> {result.explanation}</p>
      </div>
    </div>
  )

  const renderSSDResults = (result) => (
    <div className="result-card">
      <h4>📊 SSD Calculation Results</h4>
      {renderResultItem('Property Value', result.propertyValue, 'currency')}
      {renderResultItem('Holding Period', result.holdingPeriod, 'number')}
      {renderResultItem('SSD Rate', result.ssdRate, 'percentage')}
      {renderResultItem('Seller Stamp Duty (SSD)', result.ssd, 'currency', 'large')}
      <div className="explanation-section">
        <p><strong>Explanation:</strong> {result.explanation}</p>
      </div>
    </div>
  )

  const renderTDSRResults = (result) => (
    <div className="result-card">
      <h4>📊 TDSR Calculation Results</h4>
      {renderResultItem('TDSR Percentage', result.tdsrPercentage, 'percentage', result.isWithinLimit ? 'success' : 'error')}
      {renderResultItem('Total Monthly Debts', result.totalDebts, 'currency')}
      {renderResultItem('Maximum Allowed Debts', result.maxAllowedDebts, 'currency')}
      <div className={`status-indicator ${result.isWithinLimit ? 'success' : 'error'}`}>
        {result.isWithinLimit ? '✅ Within TDSR Limit (55%)' : '❌ Exceeds TDSR Limit (55%)'}
      </div>
    </div>
  )

  const renderCPFResults = (result) => (
    <div className="result-card">
      <h4>💰 CPF Calculation Results</h4>
      {renderResultItem('Employee Contribution', result.employeeContribution, 'currency')}
      {renderResultItem('Employer Contribution', result.employerContribution, 'currency')}
      {result.voluntaryContribution > 0 && renderResultItem('Voluntary Contribution', result.voluntaryContribution, 'currency')}
      {renderResultItem('Total Monthly Contribution', result.totalContribution, 'currency', 'large')}
      {renderResultItem('Annual Contribution', result.annualContribution, 'currency')}
      {renderResultItem('Contributable Salary', result.contributableSalary, 'currency')}
    </div>
  )

  const renderIncomeTaxResults = (result) => (
    <div className="result-card">
      <h4>🏛️ Income Tax Calculation Results</h4>
      {renderResultItem('Tax Payable', result.taxPayable, 'currency', 'large')}
      {result.rebate > 0 && renderResultItem('Tax Rebate', result.rebate, 'currency')}
      {renderResultItem('Effective Tax Rate', result.effectiveRate, 'percentage')}
      {renderResultItem('Marginal Tax Rate', result.marginalRate, 'percentage')}
    </div>
  )

  const renderCorporateTaxResults = (result) => (
    <div className="result-card">
      <h4>🏢 Corporate Tax Calculation Results</h4>
      {renderResultItem('Tax Payable', result.taxPayable, 'currency', 'large')}
      {result.exemptions > 0 && renderResultItem('Tax Exemptions', result.exemptions, 'currency')}
      {result.rebate > 0 && renderResultItem('Tax Rebate', result.rebate, 'currency')}
      {renderResultItem('Effective Tax Rate', result.effectiveRate, 'percentage')}
    </div>
  )

  const renderInvestmentResults = (result) => (
    <div className="result-card">
      <h4>📈 Investment ROI Calculation Results</h4>
      {renderResultItem('Total Investment Value', result.totalValue, 'currency', 'large')}
      {renderResultItem('Total Amount Invested', result.totalInvested, 'currency')}
      {renderResultItem('Total Gains', result.totalGains, 'currency')}
      {renderResultItem('ROI', result.roi, 'percentage')}
      {renderResultItem('Annualized Return', result.annualizedReturn * 100, 'percentage')}
    </div>
  )

  const renderHDBUpgradeResults = (result) => (
    <div className="result-card">
      <h4>🏘️ HDB Upgrade Path Results</h4>
      {renderResultItem('Net Proceeds from HDB Sale', result.netProceeds, 'currency')}
      {renderResultItem('Available for Upgrade', result.availableForUpgrade, 'currency', 'large')}
      {renderResultItem('Additional Cash Needed', result.additionalCashNeeded, 'currency', result.additionalCashNeeded > 0 ? 'error' : 'success')}
      <div className={`status-indicator ${result.canAffordUpgrade ? 'success' : 'warning'}`}>
        {result.canAffordUpgrade ? '✅ Can afford upgrade' : '⚠️ Additional cash required'}
      </div>
    </div>
  )

  const renderAffordabilityResults = (result) => (
    <div className="result-card">
      <h4>💳 Affordability Calculation Results</h4>
      {renderResultItem('Maximum Loan Amount', result.maxLoanAmount, 'currency', 'large')}
      {renderResultItem('Maximum Property Value', result.maxPropertyValue, 'currency')}
      {renderResultItem('Monthly EMI', result.monthlyEMI, 'currency')}
      {renderResultItem('Available Down Payment', result.availableDownPayment, 'currency')}
      {renderResultItem('Remaining Monthly Income', result.remainingIncome, 'currency', result.remainingIncome > 0 ? 'success' : 'error')}
    </div>
  )

  const renderSummaryResults = (result) => {
    if (!result || result.totalCalculations === 0) {
      return (
        <div className="result-card">
          <h4>📊 Summary Report</h4>
          <p>Complete calculations in other modules to see them reflected in this comprehensive financial report.</p>
        </div>
      )
    }

    return (
      <div className="result-card">
        <h4>📊 Financial Summary Report</h4>
        <p>Based on {result.totalCalculations} completed calculation{result.totalCalculations > 1 ? 's' : ''}:</p>
        <div style={{fontSize: '12px', color: 'var(--text-secondary)', marginBottom: 'var(--spacing-md)'}}>
          Last updated: {new Date().toLocaleTimeString()}
        </div>
        
        {/* Financial Health Score */}
        <div className="summary-section">
          <h5>🏆 Financial Health Score</h5>
          <div className="health-score">
            <div className={`score-circle ${result.financialHealth.overall.toLowerCase()}`}>
              <span className="score-number">{result.financialHealth.score}</span>
              <span className="score-label">/100</span>
            </div>
            <div className="health-details">
              <h6>Overall Rating: {result.financialHealth.overall}</h6>
              {result.financialHealth.factors.map((factor, index) => (
                <div key={index} className="health-factor">
                  <span className="factor-name">{factor.factor}</span>
                  <span className={`factor-status ${factor.status.toLowerCase()}`}>{factor.status}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Monthly Commitments */}
        {result.monthlyCommitments.total > 0 && (
          <div className="summary-section">
            <h5>💰 Monthly Commitments</h5>
            {Object.entries(result.monthlyCommitments).map(([key, amount]) => (
              key !== 'total' && amount > 0 && (
                <div key={key} className="commitment-item">
                  <span className="commitment-label">{key.charAt(0).toUpperCase() + key.slice(1)}</span>
                  <span className="commitment-amount">{formatCurrency(amount)}</span>
                </div>
              )
            ))}
            <div className="commitment-total">
              <span className="total-label">Total Monthly Commitments</span>
              <span className="total-amount">{formatCurrency(result.monthlyCommitments.total)}</span>
            </div>
          </div>
        )}

        {/* Annual Obligations */}
        {result.annualObligations.total > 0 && (
          <div className="summary-section">
            <h5>📅 Annual Obligations</h5>
            {Object.entries(result.annualObligations).map(([key, amount]) => (
              key !== 'total' && amount > 0 && (
                <div key={key} className="obligation-item">
                  <span className="obligation-label">{key.charAt(0).toUpperCase() + key.slice(1)}</span>
                  <span className="obligation-amount">{formatCurrency(amount)}</span>
                </div>
              )
            ))}
            <div className="obligation-total">
              <span className="total-label">Total Annual Obligations</span>
              <span className="total-amount">{formatCurrency(result.annualObligations.total)}</span>
            </div>
          </div>
        )}

        {/* Property Summary */}
        {Object.keys(result.propertyCalculations).length > 0 && (
          <div className="summary-section">
            <h5>🏠 Property Summary</h5>
            {result.propertyCalculations.mortgage && (
              <div className="property-item">
                <span className="property-label">Monthly EMI</span>
                <span className="property-amount">{formatCurrency(result.propertyCalculations.mortgage.monthlyEMI)}</span>
              </div>
            )}
            {result.propertyCalculations.tdsr && (
              <div className="property-item">
                <span className="property-label">TDSR</span>
                <span className={`property-amount ${result.propertyCalculations.tdsr.isWithinLimit ? 'success' : 'error'}`}>
                  {formatPercentage(result.propertyCalculations.tdsr.percentage)}
                </span>
              </div>
            )}
            {result.totalCosts.stampDuties > 0 && (
              <div className="property-item">
                <span className="property-label">Total Stamp Duties</span>
                <span className="property-amount">{formatCurrency(result.totalCosts.stampDuties)}</span>
              </div>
            )}
          </div>
        )}

        {/* Investment Summary */}
        {result.investmentCalculations && (
          <div className="summary-section">
            <h5>📈 Investment Summary</h5>
            <div className="investment-item">
              <span className="investment-label">Total Investment Value</span>
              <span className="investment-amount">{formatCurrency(result.investmentCalculations.totalValue)}</span>
            </div>
            <div className="investment-item">
              <span className="investment-label">Total Gains</span>
              <span className="investment-amount">{formatCurrency(result.investmentCalculations.totalGains)}</span>
            </div>
            <div className="investment-item">
              <span className="investment-label">ROI</span>
              <span className="investment-amount">{formatPercentage(result.investmentCalculations.roi)}</span>
            </div>
          </div>
        )}

        {/* Recommendations */}
        {result.recommendations.length > 0 && (
          <div className="summary-section">
            <h5>💡 Recommendations</h5>
            {result.recommendations.map((rec, index) => (
              <div key={index} className={`recommendation-item ${rec.type}`}>
                <div className="recommendation-header">
                  <span className="recommendation-title">{rec.title}</span>
                  <span className={`recommendation-priority ${rec.priority.toLowerCase()}`}>{rec.priority}</span>
                </div>
                <p className="recommendation-message">{rec.message}</p>
                <span className="recommendation-category">{rec.category}</span>
              </div>
            ))}
          </div>
        )}
      </div>
    )
  }

  const renderResults = () => {
    if (!calculation?.result) {
      return (
        <div className="welcome-message">
          <h4>Welcome to Singapore Financial Calculator</h4>
          <p>Select a calculator module and enter your details to get started with your financial planning.</p>
          <div className="feature-highlights">
            <div className="feature-item">
              <span className="feature-icon">🏠</span>
              <span>Property & Mortgage</span>
            </div>
            <div className="feature-item">
              <span className="feature-icon">💰</span>
              <span>Tax & CPF</span>
            </div>
            <div className="feature-item">
              <span className="feature-icon">📈</span>
              <span>Investment Planning</span>
            </div>
            <div className="feature-item">
              <span className="feature-icon">📊</span>
              <span>Comprehensive Analysis</span>
            </div>
          </div>
        </div>
      )
    }

    switch (moduleId) {
      case 'mortgage':
        return renderMortgageResults(calculation.result)
      case 'bsd':
        return renderBSDResults(calculation.result)
      case 'absd':
        return renderABSDResults(calculation.result)
      case 'ssd':
        return renderSSDResults(calculation.result)
      case 'tdsr':
        return renderTDSRResults(calculation.result)
      case 'cpf':
        return renderCPFResults(calculation.result)
      case 'income-tax':
        return renderIncomeTaxResults(calculation.result)
      case 'corporate-tax':
        return renderCorporateTaxResults(calculation.result)
      case 'investment':
        return renderInvestmentResults(calculation.result)
      case 'hdb-upgrade':
        return renderHDBUpgradeResults(calculation.result)
      case 'affordability':
        return renderAffordabilityResults(calculation.result)
      default:
        return <div>No results available</div>
    }
  }

  return (
    <div className="results-panel">
      <div className="panel-header">
        <h3>Results</h3>
        {calculation?.result && (
          <button 
            className="export-results-button" 
            onClick={handleExportResults}
            title="Export results to PDF"
            style={{
              background: 'var(--accent-primary)',
              color: 'var(--button-text)',
              border: 'none',
              padding: 'var(--spacing-sm) var(--spacing-md)',
              borderRadius: 'var(--radius-md)',
              fontSize: 'var(--font-size-sm)',
              fontWeight: '600',
              cursor: 'pointer',
              transition: 'all 0.3s ease',
              boxShadow: '0 2px 4px var(--shadow-accent)'
            }}
          >
            📄 Export
          </button>
        )}
      </div>
      
      <div className="results-content">
        <div className="results-display" id={`results-${moduleId}`}>
          {renderResults()}
        </div>
      </div>

    </div>
  )
}

export default ResultsPanel
