import React, { useState, useEffect } from 'react'
import { useCalculator } from '../context/CalculatorContext'
import { 
  calculateEMI, 
  calculateBSDOnly,
  calculateABSDOnly,
  calculateSSDOnly,
  calculateTDSR, 
  calculateCPF, 
  calculateIncomeTax, 
  calculateCorporateTax, 
  calculateInvestmentROI, 
  calculateHDBUpgrade, 
  calculateAffordability,
  validateInput 
} from '../utils/calculations'
import { exportCalculationPDF } from '../utils/exportUtils'
import { exportModernCalculationPDF } from '../utils/modernExportUtils'
import './InputPanel.css'

const InputPanel = ({ module, moduleId }) => {
  const { state, actions } = useCalculator()
  const [inputs, setInputs] = useState({})
  const [errors, setErrors] = useState({})
  const [isCalculating, setIsCalculating] = useState(false)

  // No automatic summary updates - users will manually compile

  const handleInputChange = (field, value) => {
    // Handle different input types
    let processedValue = value
    
    // Only parse as number for numeric fields
    const numericFields = ['propertyValue', 'loanAmount', 'interestRate', 'tenure', 'monthlyIncome', 
                          'existingDebts', 'newLoanEMI', 'age', 'monthlySalary', 'annualIncome', 
                          'taxableIncome', 'initialInvestment', 'monthlyContribution', 'expectedReturn', 
                          'investmentPeriod', 'hdbValue', 'outstandingLoan', 'cpfUsed', 'accruedInterest', 
                          'targetDownPayment', 'availableDownPayment', 'monthlyExpenses', 'monthlyDebts', 
                          'holdingPeriod', 'voluntaryContribution', 'taxReliefs']
    
    // Handle boolean and string fields separately
    const booleanFields = ['isPR', 'isResident']
    const stringFields = ['prYear', 'buyerType', 'companyType', 'paymentType']
    
    if (booleanFields.includes(field)) {
      processedValue = value === 'true' || value === true ? true : value === 'false' || value === false ? false : value
    } else if (stringFields.includes(field)) {
      processedValue = value // Keep as string
    } else if (numericFields.includes(field)) {
      processedValue = value === '' ? '' : parseFloat(value)
    }
    
    setInputs(prev => ({ ...prev, [field]: processedValue }))
    
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: null }))
    }
  }

  const validateInputs = () => {
    const newErrors = {}
    
    // Common validations
    if (inputs.propertyValue !== undefined && !validateInput('propertyPrice', inputs.propertyValue)) {
      newErrors.propertyValue = 'Property value must be between $1 and $50M'
    }
    if (inputs.interestRate !== undefined && !validateInput('interestRate', inputs.interestRate)) {
      newErrors.interestRate = 'Interest rate must be between 0% and 20%'
    }
    if (inputs.monthlyIncome !== undefined && !validateInput('income', inputs.monthlyIncome)) {
      newErrors.monthlyIncome = 'Monthly income must be between $1 and $1M'
    }
    if (inputs.age !== undefined && !validateInput('age', inputs.age)) {
      newErrors.age = 'Age must be between 16 and 100'
    }
    if (inputs.tenure !== undefined && !validateInput('tenure', inputs.tenure)) {
      newErrors.tenure = 'Tenure must be between 1 and 35 years'
    }
    
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleCalculate = async () => {
    console.log('🔍 Calculate button clicked for module:', moduleId)
    console.log('🔍 Current inputs:', inputs)
    
    if (!validateInputs()) {
      console.log('❌ Input validation failed')
      return
    }
    
    setIsCalculating(true)
    
    try {
      let result = null
      
      switch (moduleId) {
        case 'mortgage':
          result = calculateEMI(inputs.loanAmount, inputs.interestRate, inputs.tenure)
          if (result && inputs.propertyValue) {
            result.ltvRatio = (inputs.loanAmount / inputs.propertyValue) * 100
          }
          break
          
        case 'bsd':
          result = calculateBSDOnly(inputs.propertyValue)
          break
          
        case 'absd':
          result = calculateABSDOnly(inputs.propertyValue, inputs.buyerType)
          break
          
        case 'ssd':
          result = calculateSSDOnly(inputs.propertyValue, inputs.holdingPeriod)
          break
          
        case 'tdsr':
          result = calculateTDSR(inputs.monthlyIncome, inputs.existingDebts, inputs.newLoanEMI)
          break
          
        case 'cpf':
          result = calculateCPF(inputs.monthlySalary, inputs.age, inputs.isPR, inputs.prYear, inputs.voluntaryContribution)
          break
          
        case 'income-tax':
          result = calculateIncomeTax(inputs.annualIncome, inputs.isResident, inputs.taxReliefs)
          break
          
        case 'corporate-tax':
          result = calculateCorporateTax(inputs.taxableIncome, inputs.companyType)
          break
          
        case 'investment':
          result = calculateInvestmentROI(inputs.initialInvestment, inputs.monthlyContribution, inputs.expectedReturn, inputs.investmentPeriod)
          break
          
        case 'hdb-upgrade':
          result = calculateHDBUpgrade(inputs.hdbValue, inputs.outstandingLoan, inputs.cpfUsed, inputs.accruedInterest, inputs.targetDownPayment)
          break
          
        case 'affordability':
          result = calculateAffordability(inputs.monthlyIncome, inputs.monthlyExpenses, inputs.monthlyDebts, inputs.availableDownPayment, inputs.interestRate, inputs.tenure)
          break
          
          
        default:
          throw new Error('Unknown module')
      }
      
      if (result) {
        // For summary, we don't need inputs
        const calculationData = moduleId === 'summary' ? { result } : { inputs, result }
        actions.setCalculation(moduleId, calculationData)
        console.log(`✅ ${module.name} calculation completed:`, result)
        console.log('🔍 Updated state:', { moduleId, calculationData })
      } else {
        console.error(`❌ ${module.name} calculation failed - no result returned`)
      }
    } catch (error) {
      console.error('Calculation error:', error)
      actions.setError(error.message)
    } finally {
      setIsCalculating(false)
    }
  }

  const handleReset = () => {
    setInputs({})
    setErrors({})
    actions.setCalculation(moduleId, {})
  }

  const handleExportPDF = async () => {
    console.log('🔍 Export PDF button clicked for module:', moduleId)
    
    // Ask for client name before export
    const clientName = prompt('Enter client name for this report (optional):')
    if (clientName === null) return // User cancelled
    
    // Proceed with export
    await performExport(clientName)
  }

  const performExport = async (clientName = '') => {
    try {
      console.log('🚀 Starting modern PDF export...', { moduleId, moduleName: module.name, clientName })
      
      // Export individual calculation with modern design
      const calculation = state.calculations[moduleId]
      console.log('📋 Calculation data:', { calculation, inputs })
      if (calculation?.result) {
        await exportModernCalculationPDF(moduleId, module.name, calculation.result, inputs, clientName)
        alert('✅ Modern PDF exported successfully!')
      } else {
        alert('⚠️ No calculation results available to export. Run a calculation first.')
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

  const renderInputField = (field, label, type = 'number', options = {}) => (
    <div className="input-group">
      <label htmlFor={field}>{label}</label>
      {type === 'select' ? (
        <select
          id={field}
          value={inputs[field] || ''}
          onChange={(e) => handleInputChange(field, e.target.value)}
          className={errors[field] ? 'error' : ''}
        >
          <option value="">Select {label}</option>
          {options.choices?.map(choice => (
            <option key={choice.value} value={choice.value}>
              {choice.label}
            </option>
          ))}
        </select>
      ) : (
        <input
          type={type}
          id={field}
          value={inputs[field] || ''}
          onChange={(e) => handleInputChange(field, e.target.value)}
          placeholder={options.placeholder || `Enter ${label.toLowerCase()}`}
          className={errors[field] ? 'error' : ''}
          min={options.min}
          max={options.max}
          step={options.step}
        />
      )}
      {errors[field] && <span className="error-message">{errors[field]}</span>}
    </div>
  )

  const renderModuleInputs = () => {
    switch (moduleId) {
      case 'mortgage':
        return (
          <>
            {renderInputField('propertyValue', 'Property Value (SGD)', 'number', { placeholder: '800,000' })}
            {renderInputField('loanAmount', 'Loan Amount (SGD)', 'number', { placeholder: '640,000' })}
            {renderInputField('interestRate', 'Interest Rate (% p.a.)', 'number', { placeholder: '3.5', step: '0.01' })}
            {renderInputField('tenure', 'Loan Tenure (years)', 'number', { placeholder: '25' })}
            {renderInputField('paymentType', 'Payment Type', 'select', {
              choices: [
                { value: 'monthly', label: 'Monthly' },
                { value: 'quarterly', label: 'Quarterly' },
                { value: 'semi-annual', label: 'Semi-Annual' },
                { value: 'annual', label: 'Annual' }
              ]
            })}
          </>
        )
        
      case 'bsd':
        return (
          <>
            {renderInputField('propertyValue', 'Property Value (SGD)', 'number', { placeholder: '800,000' })}
          </>
        )
        
      case 'absd':
        return (
          <>
            {renderInputField('propertyValue', 'Property Value (SGD)', 'number', { placeholder: '800,000' })}
            {renderInputField('buyerType', 'Buyer Type', 'select', {
              choices: [
                { value: 'citizen_first', label: 'Singapore Citizen (1st Property)' },
                { value: 'citizen_second', label: 'Singapore Citizen (2nd Property)' },
                { value: 'citizen_third', label: 'Singapore Citizen (3rd+ Property)' },
                { value: 'pr_first', label: 'PR (1st Property)' },
                { value: 'pr_subsequent', label: 'PR (2nd+ Property)' },
                { value: 'foreigner', label: 'Foreigner' }
              ]
            })}
          </>
        )
        
      case 'ssd':
        return (
          <>
            {renderInputField('propertyValue', 'Property Value (SGD)', 'number', { placeholder: '800,000' })}
            {renderInputField('holdingPeriod', 'Holding Period (years)', 'number', { placeholder: '2', min: '0', max: '4' })}
          </>
        )
        
      case 'tdsr':
        return (
          <>
            {renderInputField('monthlyIncome', 'Gross Monthly Income (SGD)', 'number', { placeholder: '8,000' })}
            {renderInputField('existingDebts', 'Existing Monthly Debts (SGD)', 'number', { placeholder: '1,500' })}
            {renderInputField('newLoanEMI', 'New Loan EMI (SGD)', 'number', { placeholder: '2,500' })}
          </>
        )
        
      case 'cpf':
        return (
          <>
            {renderInputField('monthlySalary', 'Monthly Salary (SGD)', 'number', { placeholder: '6,000' })}
            {renderInputField('age', 'Age', 'number', { placeholder: '30', min: '16', max: '100' })}
            {renderInputField('isPR', 'Resident Status', 'select', {
              choices: [
                { value: 'false', label: 'Singapore Citizen' },
                { value: 'true', label: 'Permanent Resident' }
              ]
            })}
            {inputs.isPR && renderInputField('prYear', 'PR Year', 'select', {
              choices: [
                { value: '1', label: 'First Year' },
                { value: '2', label: 'Second Year' }
              ]
            })}
            {renderInputField('voluntaryContribution', 'Voluntary Contribution (SGD)', 'number', { placeholder: '0' })}
          </>
        )
        
      case 'income-tax':
        return (
          <>
            {renderInputField('annualIncome', 'Annual Income (SGD)', 'number', { placeholder: '80,000' })}
            {renderInputField('isResident', 'Tax Resident Status', 'select', {
              choices: [
                { value: 'true', label: 'Singapore Resident' },
                { value: 'false', label: 'Non-Resident' }
              ]
            })}
            {renderInputField('taxReliefs', 'Tax Reliefs (SGD)', 'number', { placeholder: '5,000' })}
          </>
        )
        
      case 'corporate-tax':
        return (
          <>
            {renderInputField('taxableIncome', 'Taxable Income (SGD)', 'number', { placeholder: '100,000' })}
            {renderInputField('companyType', 'Company Type', 'select', {
              choices: [
                { value: 'startup', label: 'Startup (Tax Exemption)' },
                { value: 'sme', label: 'SME (Partial Exemption)' },
                { value: 'regular', label: 'Regular Company' }
              ]
            })}
          </>
        )
        
      case 'investment':
        return (
          <>
            {renderInputField('initialInvestment', 'Initial Investment (SGD)', 'number', { placeholder: '10,000' })}
            {renderInputField('monthlyContribution', 'Monthly Contribution (SGD)', 'number', { placeholder: '500' })}
            {renderInputField('expectedReturn', 'Expected Annual Return (%)', 'number', { placeholder: '7', step: '0.01' })}
            {renderInputField('investmentPeriod', 'Investment Period (years)', 'number', { placeholder: '10' })}
          </>
        )
        
      case 'hdb-upgrade':
        return (
          <>
            {renderInputField('hdbValue', 'Current HDB Value (SGD)', 'number', { placeholder: '400,000' })}
            {renderInputField('outstandingLoan', 'Outstanding HDB Loan (SGD)', 'number', { placeholder: '200,000' })}
            {renderInputField('cpfUsed', 'CPF Used (SGD)', 'number', { placeholder: '50,000' })}
            {renderInputField('accruedInterest', 'Accrued Interest (SGD)', 'number', { placeholder: '5,000' })}
            {renderInputField('targetDownPayment', 'Target Down Payment (SGD)', 'number', { placeholder: '300,000' })}
          </>
        )
        
      case 'affordability':
        return (
          <>
            {renderInputField('monthlyIncome', 'Monthly Income (SGD)', 'number', { placeholder: '8,000' })}
            {renderInputField('monthlyExpenses', 'Monthly Expenses (SGD)', 'number', { placeholder: '3,000' })}
            {renderInputField('monthlyDebts', 'Monthly Debts (SGD)', 'number', { placeholder: '1,000' })}
            {renderInputField('availableDownPayment', 'Available Down Payment (SGD)', 'number', { placeholder: '200,000' })}
            {renderInputField('interestRate', 'Interest Rate (%)', 'number', { placeholder: '3.5', step: '0.01' })}
            {renderInputField('tenure', 'Loan Tenure (years)', 'number', { placeholder: '25' })}
          </>
        )
        
        
      default:
        return <div>Unknown module</div>
    }
  }

  return (
    <div className="input-panel">
      <div className="panel-header">
        <h2>{module?.name} Calculator</h2>
        <p>{module?.description}</p>
      </div>
      
      <div className="module-content">
        {renderModuleInputs()}
      </div>

      {moduleId !== 'summary' && (
        <div className="calculate-section">
          <button 
            className="primary-button" 
            onClick={handleCalculate}
            disabled={isCalculating}
          >
            {isCalculating ? 'Calculating...' : 'Calculate'}
          </button>
          <button className="secondary-button" onClick={handleReset}>
            Reset
          </button>
          {state.calculations[moduleId]?.result && (
            <>
              <button 
                className="export-button" 
                onClick={handleExportPDF}
                style={{
                  background: 'var(--accent-primary)',
                  color: 'var(--button-text)',
                  border: 'none',
                  padding: 'var(--spacing-md) var(--spacing-lg)',
                  borderRadius: 'var(--radius-md)',
                  fontSize: 'var(--font-size-base)',
                  fontWeight: '600',
                  cursor: 'pointer',
                  transition: 'all 0.3s ease',
                  boxShadow: '0 2px 4px var(--shadow-accent)',
                  marginLeft: 'var(--spacing-sm)'
                }}
              >
                📄 Export PDF
              </button>
            </>
          )}
        </div>
      )}

    </div>
  )
}

export default InputPanel
