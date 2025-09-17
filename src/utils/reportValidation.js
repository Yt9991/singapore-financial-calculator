// Report Validation Utility - Ensures zero errors before client reports
export const validateReportForClient = (allCalculations) => {
  const validation = {
    isValid: true,
    errors: [],
    warnings: [],
    summary: {
      totalCalculations: 0,
      validCalculations: 0,
      invalidCalculations: 0,
      missingData: 0
    }
  }

  // Get compiled calculations from summary
  const compiledData = allCalculations.summary?.compiledCalculations || {}
  validation.summary.totalCalculations = Object.keys(compiledData).length

  if (validation.summary.totalCalculations === 0) {
    validation.isValid = false
    validation.errors.push('No calculations found in summary report')
    return validation
  }

  // Validate each calculation
  Object.entries(compiledData).forEach(([moduleId, data]) => {
    const calculationValidation = validateIndividualCalculation(moduleId, data)
    
    if (calculationValidation.isValid) {
      validation.summary.validCalculations++
    } else {
      validation.summary.invalidCalculations++
      validation.errors.push(...calculationValidation.errors)
      validation.warnings.push(...calculationValidation.warnings)
    }
  })

  // Check for data consistency
  const consistencyCheck = validateDataConsistency(compiledData)
  if (!consistencyCheck.isValid) {
    validation.isValid = false
    validation.errors.push(...consistencyCheck.errors)
  }
  validation.warnings.push(...consistencyCheck.warnings)

  // Check for missing critical calculations
  const criticalCheck = validateCriticalCalculations(compiledData)
  if (!criticalCheck.isValid) {
    validation.warnings.push(...criticalCheck.warnings)
  }

  // Final validation
  validation.isValid = validation.errors.length === 0

  return validation
}

// Validate individual calculation
const validateIndividualCalculation = (moduleId, data) => {
  const validation = {
    isValid: true,
    errors: [],
    warnings: []
  }

  // Check if data exists
  if (!data) {
    validation.isValid = false
    validation.errors.push(`${moduleId}: No calculation data found`)
    return validation
  }

  // Check if result exists
  if (!data.result) {
    validation.isValid = false
    validation.errors.push(`${moduleId}: No calculation result found`)
    return validation
  }

  // Check if inputs exist
  if (!data.inputs || Object.keys(data.inputs).length === 0) {
    validation.warnings.push(`${moduleId}: No input parameters found`)
  }

  // Check if timestamp exists
  if (!data.timestamp) {
    validation.warnings.push(`${moduleId}: No timestamp found`)
  }

  // Module-specific validation
  switch (moduleId) {
    case 'mortgage':
      validateMortgageCalculation(data, validation)
      break
    case 'bsd':
    case 'absd':
    case 'ssd':
      validateStampDutyCalculation(moduleId, data, validation)
      break
    case 'tdsr':
      validateTDSRCalculation(data, validation)
      break
    case 'cpf':
      validateCPFCalculation(data, validation)
      break
    case 'income-tax':
    case 'corporate-tax':
      validateTaxCalculation(moduleId, data, validation)
      break
    case 'investment':
      validateInvestmentCalculation(data, validation)
      break
    case 'hdb-upgrade':
      validateHDBUpgradeCalculation(data, validation)
      break
    case 'affordability':
      validateAffordabilityCalculation(data, validation)
      break
  }

  return validation
}

// Validate mortgage calculation
const validateMortgageCalculation = (data, validation) => {
  const result = data.result
  const inputs = data.inputs

  // Check required result fields
  const requiredFields = ['monthlyEMI', 'totalPayment', 'totalInterest']
  requiredFields.forEach(field => {
    if (!result[field] || result[field] <= 0) {
      validation.isValid = false
      validation.errors.push(`Mortgage: Invalid ${field} (${result[field]})`)
    }
  })

  // Check required input fields
  const requiredInputs = ['loanAmount', 'interestRate', 'tenure']
  requiredInputs.forEach(field => {
    if (!inputs[field] || inputs[field] <= 0) {
      validation.isValid = false
      validation.errors.push(`Mortgage: Missing or invalid ${field}`)
    }
  })

  // Validate interest rate
  if (inputs.interestRate && (inputs.interestRate < 0 || inputs.interestRate > 20)) {
    validation.warnings.push('Mortgage: Interest rate seems unusually high or low')
  }

  // Validate loan amount
  if (inputs.loanAmount && (inputs.loanAmount < 10000 || inputs.loanAmount > 10000000)) {
    validation.warnings.push('Mortgage: Loan amount seems unusually high or low')
  }
}

// Validate stamp duty calculation
const validateStampDutyCalculation = (moduleId, data, validation) => {
  const result = data.result
  const inputs = data.inputs

  // Check required result fields
  const dutyField = moduleId === 'bsd' ? 'bsd' : moduleId === 'absd' ? 'absd' : 'ssd'
  if (!result[dutyField] || result[dutyField] < 0) {
    validation.isValid = false
    validation.errors.push(`${moduleId.toUpperCase()}: Invalid stamp duty amount (${result[dutyField]})`)
  }

  // Check property value
  if (!inputs.propertyValue || inputs.propertyValue <= 0) {
    validation.isValid = false
    validation.errors.push(`${moduleId.toUpperCase()}: Missing or invalid property value`)
  }

  // Validate property value range
  if (inputs.propertyValue && (inputs.propertyValue < 10000 || inputs.propertyValue > 100000000)) {
    validation.warnings.push(`${moduleId.toUpperCase()}: Property value seems unusually high or low`)
  }

  // ABSD specific validation
  if (moduleId === 'absd' && !inputs.buyerType) {
    validation.isValid = false
    validation.errors.push('ABSD: Missing buyer type')
  }

  // SSD specific validation
  if (moduleId === 'ssd' && (!inputs.holdingPeriod || inputs.holdingPeriod < 0 || inputs.holdingPeriod > 4)) {
    validation.isValid = false
    validation.errors.push('SSD: Invalid holding period (must be 0-4 years)')
  }
}

// Validate TDSR calculation
const validateTDSRCalculation = (data, validation) => {
  const result = data.result
  const inputs = data.inputs

  // Check required result fields
  if (typeof result.tdsrPercentage !== 'number' || result.tdsrPercentage < 0) {
    validation.isValid = false
    validation.errors.push('TDSR: Invalid TDSR percentage')
  }

  // Check required input fields
  const requiredInputs = ['monthlyIncome', 'existingDebts', 'newLoanEMI']
  requiredInputs.forEach(field => {
    if (!inputs[field] || inputs[field] < 0) {
      validation.isValid = false
      validation.errors.push(`TDSR: Missing or invalid ${field}`)
    }
  })

  // Validate TDSR limit
  if (result.tdsrPercentage > 60) {
    validation.warnings.push('TDSR: TDSR exceeds 60% - may not be approved by banks')
  }
}

// Validate CPF calculation
const validateCPFCalculation = (data, validation) => {
  const result = data.result
  const inputs = data.inputs

  // Check required result fields
  const requiredFields = ['employeeContribution', 'employerContribution', 'totalContribution']
  requiredFields.forEach(field => {
    if (!result[field] || result[field] < 0) {
      validation.isValid = false
      validation.errors.push(`CPF: Invalid ${field}`)
    }
  })

  // Check required input fields
  if (!inputs.monthlySalary || inputs.monthlySalary <= 0) {
    validation.isValid = false
    validation.errors.push('CPF: Missing or invalid monthly salary')
  }

  if (!inputs.age || inputs.age < 16 || inputs.age > 100) {
    validation.isValid = false
    validation.errors.push('CPF: Invalid age (must be 16-100)')
  }
}

// Validate tax calculation
const validateTaxCalculation = (moduleId, data, validation) => {
  const result = data.result
  const inputs = data.inputs

  // Check required result fields
  if (!result.taxPayable || result.taxPayable < 0) {
    validation.isValid = false
    validation.errors.push(`${moduleId.toUpperCase()}: Invalid tax payable amount`)
  }

  // Check required input fields
  const incomeField = moduleId === 'income-tax' ? 'annualIncome' : 'taxableIncome'
  if (!inputs[incomeField] || inputs[incomeField] <= 0) {
    validation.isValid = false
    validation.errors.push(`${moduleId.toUpperCase()}: Missing or invalid ${incomeField}`)
  }

  // Validate income range
  if (inputs[incomeField] && inputs[incomeField] > 10000000) {
    validation.warnings.push(`${moduleId.toUpperCase()}: Income seems unusually high`)
  }
}

// Validate investment calculation
const validateInvestmentCalculation = (data, validation) => {
  const result = data.result
  const inputs = data.inputs

  // Check required result fields
  const requiredFields = ['totalValue', 'totalInvested', 'totalGains', 'roi']
  requiredFields.forEach(field => {
    if (typeof result[field] !== 'number' || result[field] < 0) {
      validation.isValid = false
      validation.errors.push(`Investment: Invalid ${field}`)
    }
  })

  // Check required input fields
  const requiredInputs = ['initialInvestment', 'monthlyContribution', 'expectedReturn', 'investmentPeriod']
  requiredInputs.forEach(field => {
    if (!inputs[field] || inputs[field] < 0) {
      validation.isValid = false
      validation.errors.push(`Investment: Missing or invalid ${field}`)
    }
  })

  // Validate expected return
  if (inputs.expectedReturn && (inputs.expectedReturn < 0 || inputs.expectedReturn > 50)) {
    validation.warnings.push('Investment: Expected return seems unusually high or low')
  }
}

// Validate HDB upgrade calculation
const validateHDBUpgradeCalculation = (data, validation) => {
  const result = data.result
  const inputs = data.inputs

  // Check required result fields
  const requiredFields = ['netProceeds', 'availableForUpgrade', 'additionalCashNeeded']
  requiredFields.forEach(field => {
    if (typeof result[field] !== 'number') {
      validation.isValid = false
      validation.errors.push(`HDB Upgrade: Invalid ${field}`)
    }
  })

  // Check required input fields
  const requiredInputs = ['hdbValue', 'outstandingLoan', 'targetDownPayment']
  requiredInputs.forEach(field => {
    if (!inputs[field] || inputs[field] < 0) {
      validation.isValid = false
      validation.errors.push(`HDB Upgrade: Missing or invalid ${field}`)
    }
  })
}

// Validate affordability calculation
const validateAffordabilityCalculation = (data, validation) => {
  const result = data.result
  const inputs = data.inputs

  // Check required result fields
  const requiredFields = ['maxLoanAmount', 'maxPropertyValue', 'monthlyEMI']
  requiredFields.forEach(field => {
    if (!result[field] || result[field] < 0) {
      validation.isValid = false
      validation.errors.push(`Affordability: Invalid ${field}`)
    }
  })

  // Check required input fields
  const requiredInputs = ['monthlyIncome', 'monthlyExpenses', 'availableDownPayment']
  requiredInputs.forEach(field => {
    if (!inputs[field] || inputs[field] < 0) {
      validation.isValid = false
      validation.errors.push(`Affordability: Missing or invalid ${field}`)
    }
  })
}

// Validate data consistency across calculations
const validateDataConsistency = (compiledData) => {
  const validation = {
    isValid: true,
    errors: [],
    warnings: []
  }

  // Check for consistent property values across stamp duty calculations
  const propertyCalculations = ['bsd', 'absd', 'ssd'].filter(id => compiledData[id])
  if (propertyCalculations.length > 1) {
    const propertyValues = propertyCalculations.map(id => compiledData[id].inputs.propertyValue)
    const uniqueValues = [...new Set(propertyValues)]
    if (uniqueValues.length > 1) {
      validation.warnings.push('Property values are inconsistent across stamp duty calculations')
    }
  }

  // Check for consistent income across calculations
  const incomeCalculations = ['tdsr', 'income-tax', 'affordability'].filter(id => compiledData[id])
  if (incomeCalculations.length > 1) {
    const incomes = incomeCalculations.map(id => {
      const inputs = compiledData[id].inputs
      return inputs.monthlyIncome || (inputs.annualIncome ? inputs.annualIncome / 12 : null)
    }).filter(Boolean)
    
    if (incomes.length > 1) {
      const uniqueIncomes = [...new Set(incomes)]
      if (uniqueIncomes.length > 1) {
        validation.warnings.push('Income values are inconsistent across calculations')
      }
    }
  }

  return validation
}

// Validate critical calculations are present
const validateCriticalCalculations = (compiledData) => {
  const validation = {
    isValid: true,
    warnings: []
  }

  // Check if property-related calculations are present
  const propertyCalculations = ['mortgage', 'bsd', 'absd', 'tdsr', 'affordability']
  const hasPropertyCalculations = propertyCalculations.some(id => compiledData[id])
  
  if (!hasPropertyCalculations) {
    validation.warnings.push('No property-related calculations found - consider adding mortgage, stamp duty, or affordability calculations')
  }

  // Check if tax calculations are present
  const taxCalculations = ['income-tax', 'corporate-tax']
  const hasTaxCalculations = taxCalculations.some(id => compiledData[id])
  
  if (!hasTaxCalculations) {
    validation.warnings.push('No tax calculations found - consider adding income tax or corporate tax calculations')
  }

  return validation
}

// Get validation summary for display
export const getValidationSummary = (validation) => {
  const { errors, warnings, summary } = validation
  
  return {
    status: validation.isValid ? 'ready' : 'errors',
    message: validation.isValid 
      ? `✅ Report ready for client (${summary.validCalculations} calculations validated)`
      : `❌ Report has ${errors.length} error(s) that must be fixed`,
    details: {
      totalCalculations: summary.totalCalculations,
      validCalculations: summary.validCalculations,
      invalidCalculations: summary.invalidCalculations,
      errors: errors,
      warnings: warnings
    }
  }
}
