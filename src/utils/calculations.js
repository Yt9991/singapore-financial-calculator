// Singapore Financial Calculator - Calculation Utilities
// All rates and formulas are based on 2025 Singapore regulations

// ===== MORTGAGE CALCULATOR =====
export const calculateEMI = (principal, annualRate, tenureYears, propertyValue = null) => {
  if (!principal || !annualRate || !tenureYears) return null
  
  const monthlyRate = annualRate / 100 / 12
  const numPayments = tenureYears * 12
  
  if (monthlyRate === 0) {
    return principal / numPayments
  }
  
  const emi = (principal * monthlyRate * Math.pow(1 + monthlyRate, numPayments)) / 
              (Math.pow(1 + monthlyRate, numPayments) - 1)
  
  const ltvRatio = propertyValue ? (principal / propertyValue) * 100 : 0
  
  return {
    monthlyEMI: emi,
    totalPayment: emi * numPayments,
    totalInterest: (emi * numPayments) - principal,
    ltvRatio: ltvRatio
  }
}

// ===== STAMP DUTY CALCULATIONS =====
// BSD Progressive Rates (2025)
const bsdRates = [
  { limit: 180000, rate: 0.01 },
  { limit: 360000, rate: 0.02 },
  { limit: 1000000, rate: 0.03 },
  { limit: 1500000, rate: 0.04 },
  { limit: 3000000, rate: 0.05 },
  { limit: Infinity, rate: 0.06 }
]

// ABSD Rates (Updated 2025)
const absdRates = {
  'citizen_first': 0,
  'citizen_second': 0.20,  // Updated from 17% to 20%
  'citizen_third': 0.30,   // Updated from 25% to 30%
  'pr_first': 0.05,
  'pr_subsequent': 0.30,
  'foreigner': 0.60
}

// SSD Rates (Updated 2025 - 4 year holding period)
const ssdRates = [
  { year: 1, rate: 0.20 },  // Updated from 16% to 20%
  { year: 2, rate: 0.15 },  // Updated from 12% to 15%
  { year: 3, rate: 0.10 },  // Updated from 8% to 10%
  { year: 4, rate: 0.05 }   // Updated from 4% to 5%
]

export const calculateBSD = (propertyValue) => {
  if (!propertyValue || propertyValue <= 0) return 0
  
  let bsd = 0
  let remainingValue = propertyValue
  let previousLimit = 0
  
  for (const bracket of bsdRates) {
    if (remainingValue <= 0) break
    
    const bracketSize = bracket.limit - previousLimit
    const taxableAmount = Math.min(remainingValue, bracketSize)
    
    if (taxableAmount > 0) {
      bsd += taxableAmount * bracket.rate
      remainingValue -= taxableAmount
    }
    
    previousLimit = bracket.limit
  }
  
  return bsd
}

export const calculateABSD = (propertyValue, buyerType) => {
  if (!propertyValue || !buyerType) return 0
  
  const rate = absdRates[buyerType] || 0
  return propertyValue * rate
}

export const calculateSSD = (propertyValue, holdingPeriod) => {
  if (!propertyValue || !holdingPeriod || holdingPeriod <= 0) return 0
  
  const rate = ssdRates.find(r => r.year === Math.ceil(holdingPeriod))?.rate || 0
  return propertyValue * rate
}

// ===== SEPARATE STAMP DUTY CALCULATORS =====

// BSD Calculator - Buyer's Stamp Duty
export const calculateBSDOnly = (propertyValue) => {
  if (!propertyValue || propertyValue <= 0) return null
  
  const bsd = calculateBSD(propertyValue)
  
  return {
    propertyValue,
    bsd,
    breakdown: getBSDBreakdown(propertyValue)
  }
}

// ABSD Calculator - Additional Buyer's Stamp Duty
export const calculateABSDOnly = (propertyValue, buyerType) => {
  if (!propertyValue || !buyerType) return null
  
  const absd = calculateABSD(propertyValue, buyerType)
  const rate = absdRates[buyerType] || 0
  
  return {
    propertyValue,
    buyerType,
    absdRate: rate * 100,
    absd,
    explanation: getABSDExplanation(buyerType)
  }
}

// SSD Calculator - Seller's Stamp Duty
export const calculateSSDOnly = (propertyValue, holdingPeriod) => {
  if (!propertyValue || !holdingPeriod || holdingPeriod <= 0) return null
  
  const ssd = calculateSSD(propertyValue, holdingPeriod)
  const rate = ssdRates.find(r => r.year === Math.ceil(holdingPeriod))?.rate || 0
  
  return {
    propertyValue,
    holdingPeriod,
    ssdRate: rate * 100,
    ssd,
    explanation: getSSDExplanation(holdingPeriod)
  }
}

// Helper functions for detailed breakdowns
const getBSDBreakdown = (propertyValue) => {
  let breakdown = []
  let remainingValue = propertyValue
  let previousLimit = 0
  
  for (const bracket of bsdRates) {
    if (remainingValue <= 0) break
    
    const bracketSize = bracket.limit - previousLimit
    const taxableAmount = Math.min(remainingValue, bracketSize)
    
    if (taxableAmount > 0) {
      const tax = taxableAmount * bracket.rate
      breakdown.push({
        range: `$${previousLimit.toLocaleString()} - $${Math.min(bracket.limit, propertyValue).toLocaleString()}`,
        amount: taxableAmount,
        rate: bracket.rate * 100,
        tax: tax
      })
      remainingValue -= taxableAmount
    }
    
    previousLimit = bracket.limit
  }
  
  return breakdown
}

const getABSDExplanation = (buyerType) => {
  const explanations = {
    'citizen_first': 'No ABSD for Singapore citizens buying their first property',
    'citizen_second': '20% ABSD for Singapore citizens buying their second property',
    'citizen_third': '30% ABSD for Singapore citizens buying their third or subsequent property',
    'pr_first': '5% ABSD for PRs buying their first property',
    'pr_subsequent': '30% ABSD for PRs buying their second or subsequent property',
    'foreigner': '60% ABSD for foreigners buying any property in Singapore'
  }
  return explanations[buyerType] || 'ABSD applies based on buyer type and property count'
}

const getSSDExplanation = (holdingPeriod) => {
  const year = Math.ceil(holdingPeriod)
  const explanations = {
    1: '20% SSD for properties sold within the first year',
    2: '15% SSD for properties sold in the second year',
    3: '10% SSD for properties sold in the third year',
    4: '5% SSD for properties sold in the fourth year'
  }
  return explanations[year] || 'No SSD for properties held for more than 4 years'
}

// Legacy function for backward compatibility (if needed)
export const calculateStampDuty = (propertyValue, buyerType, holdingPeriod = 0) => {
  const bsd = calculateBSD(propertyValue)
  const absd = calculateABSD(propertyValue, buyerType)
  const ssd = calculateSSD(propertyValue, holdingPeriod)
  
  return {
    bsd,
    absd,
    ssd,
    total: bsd + absd + ssd
  }
}

// ===== TDSR CALCULATOR =====
export const calculateTDSR = (monthlyIncome, existingDebts, newLoanEMI) => {
  if (!monthlyIncome || monthlyIncome <= 0) return null
  
  const totalDebts = (existingDebts || 0) + (newLoanEMI || 0)
  const tdsrPercentage = (totalDebts / monthlyIncome) * 100
  
  return {
    tdsrPercentage,
    totalDebts,
    maxAllowedDebts: monthlyIncome * 0.55, // 55% limit
    isWithinLimit: tdsrPercentage <= 55
  }
}

// ===== CPF CALCULATOR (2025 Rates) =====
const cpfRates = {
  // Monthly ceiling: $7,400, Annual: $102,000 (2025)
  ageGroups: {
    'under_55': { employee: 0.20, employer: 0.17 },
    '55_to_60': { employee: 0.13, employer: 0.13 },  // Updated rates
    '60_to_65': { employee: 0.075, employer: 0.075 }, // Updated rates
    'over_65': { employee: 0.05, employer: 0.075 }
  },
  prRates: {
    'first_year': { employee: 0.05, employer: 0.17 },
    'second_year': { employee: 0.15, employer: 0.17 }
  }
}

export const calculateCPF = (monthlySalary, age, isPR = false, prYear = 1, voluntaryContribution = 0) => {
  if (!monthlySalary || !age) return null
  
  const ceiling = 7400 // Monthly ceiling
  const contributableSalary = Math.min(monthlySalary, ceiling)
  
  let rates
  if (isPR) {
    rates = cpfRates.prRates[prYear === 1 ? 'first_year' : 'second_year']
  } else {
    if (age < 55) rates = cpfRates.ageGroups.under_55
    else if (age < 60) rates = cpfRates.ageGroups['55_to_60']
    else if (age < 65) rates = cpfRates.ageGroups['60_to_65']
    else rates = cpfRates.ageGroups.over_65
  }
  
  const employeeContribution = contributableSalary * rates.employee
  const employerContribution = contributableSalary * rates.employer
  const totalContribution = employeeContribution + employerContribution + (voluntaryContribution || 0)
  
  return {
    employeeContribution,
    employerContribution,
    voluntaryContribution: voluntaryContribution || 0,
    totalContribution,
    annualContribution: totalContribution * 12,
    contributableSalary
  }
}

// ===== INCOME TAX CALCULATOR (2025) =====
const taxBrackets = [
  { limit: 20000, rate: 0 },
  { limit: 30000, rate: 0.02 },
  { limit: 40000, rate: 0.035 },
  { limit: 80000, rate: 0.07 },
  { limit: 120000, rate: 0.115 },
  { limit: 160000, rate: 0.15 },
  { limit: 200000, rate: 0.18 },
  { limit: 240000, rate: 0.19 },
  { limit: 280000, rate: 0.195 },
  { limit: 320000, rate: 0.20 },
  { limit: 500000, rate: 0.22 },
  { limit: 1000000, rate: 0.23 },
  { limit: Infinity, rate: 0.24 }
]

const reliefs = {
  earned_income: 1000,
  spouse: 2000,
  parent: 9000,
  child: 4000 // per child
}

export const calculateIncomeTax = (annualIncome, isResident = true, taxReliefs = 0) => {
  if (!annualIncome || annualIncome <= 0) return null
  
  if (!isResident) {
    // Non-resident flat rate
    return {
      taxPayable: annualIncome * 0.15,
      effectiveRate: 0.15,
      marginalRate: 0.15
    }
  }
  
  const chargeableIncome = Math.max(0, annualIncome - (taxReliefs || 0))
  let taxPayable = 0
  let remainingIncome = chargeableIncome
  
  for (let i = 0; i < taxBrackets.length; i++) {
    const bracket = taxBrackets[i]
    const prevLimit = i === 0 ? 0 : taxBrackets[i - 1].limit
    
    if (remainingIncome <= 0) break
    
    const taxableAmount = Math.min(remainingIncome, bracket.limit - prevLimit)
    taxPayable += taxableAmount * bracket.rate
    remainingIncome -= taxableAmount
  }
  
  // 2025 Rebate: 50% capped at $200
  const rebate = Math.min(taxPayable * 0.5, 200)
  const finalTax = Math.max(0, taxPayable - rebate)
  
  return {
    taxPayable: finalTax,
    rebate,
    effectiveRate: annualIncome > 0 ? (finalTax / annualIncome) * 100 : 0,
    marginalRate: taxBrackets.find(b => chargeableIncome <= b.limit)?.rate || 0.24
  }
}

// ===== CORPORATE TAX CALCULATOR (2025) =====
const corporateTax = {
  standardRate: 0.17,
  startupExemption: {
    first100k: 1.0, // 100% exemption
    next25k: 0.75   // 75% exemption
  },
  partialExemption: {
    first10k: 0.75, // 75% exemption
    next190k: 0.05  // 5% exemption
  },
  rebate2025: 0.5, // 50% rebate capped at $20,000 (2025)
  cashGrant: 2000  // For companies with local employees
}

export const calculateCorporateTax = (taxableIncome, companyType = 'regular') => {
  if (!taxableIncome || taxableIncome <= 0) return null
  
  let taxPayable = 0
  let exemptions = 0
  
  if (companyType === 'startup') {
    // Startup tax exemption
    const first100k = Math.min(taxableIncome, 100000)
    const next25k = Math.min(Math.max(0, taxableIncome - 100000), 25000)
    
    exemptions = (first100k * corporateTax.startupExemption.first100k) + 
                 (next25k * corporateTax.startupExemption.next25k)
  } else if (companyType === 'sme') {
    // Partial exemption
    const first10k = Math.min(taxableIncome, 10000)
    const next190k = Math.min(Math.max(0, taxableIncome - 10000), 190000)
    
    exemptions = (first10k * corporateTax.partialExemption.first10k) + 
                 (next190k * corporateTax.partialExemption.next190k)
  }
  
  const chargeableIncome = Math.max(0, taxableIncome - exemptions)
  taxPayable = chargeableIncome * corporateTax.standardRate
  
  // 2025 rebate
  const rebate = Math.min(taxPayable * corporateTax.rebate2025, 20000)
  const finalTax = Math.max(0, taxPayable - rebate)
  
  return {
    taxPayable: finalTax,
    exemptions,
    rebate,
    effectiveRate: taxableIncome > 0 ? (finalTax / taxableIncome) * 100 : 0,
    marginalRate: corporateTax.standardRate
  }
}

// ===== INVESTMENT ROI CALCULATOR =====
export const calculateInvestmentROI = (initialInvestment, monthlyContribution, expectedReturn, investmentPeriod) => {
  if (!initialInvestment || !expectedReturn || !investmentPeriod) return null
  
  const monthlyReturn = expectedReturn / 100 / 12
  const totalMonths = investmentPeriod * 12
  
  // Future value of initial investment
  const fvInitial = initialInvestment * Math.pow(1 + monthlyReturn, totalMonths)
  
  // Future value of monthly contributions (annuity)
  const fvAnnuity = monthlyContribution * 
    ((Math.pow(1 + monthlyReturn, totalMonths) - 1) / monthlyReturn)
  
  const totalValue = fvInitial + fvAnnuity
  const totalInvested = initialInvestment + (monthlyContribution * totalMonths)
  const totalGains = totalValue - totalInvested
  
  return {
    totalValue,
    totalInvested,
    totalGains,
    roi: totalInvested > 0 ? (totalGains / totalInvested) * 100 : 0,
    annualizedReturn: Math.pow(totalValue / totalInvested, 1 / investmentPeriod) - 1
  }
}

// ===== HDB UPGRADER PATH CALCULATOR =====
export const calculateHDBUpgrade = (hdbValue, outstandingLoan, cpfUsed, accruedInterest, targetDownPayment) => {
  if (!hdbValue || !outstandingLoan) return null
  
  const netProceeds = hdbValue - outstandingLoan - (cpfUsed || 0) - (accruedInterest || 0)
  const availableForUpgrade = Math.max(0, netProceeds)
  const additionalCashNeeded = Math.max(0, (targetDownPayment || 0) - availableForUpgrade)
  
  return {
    netProceeds,
    availableForUpgrade,
    additionalCashNeeded,
    canAffordUpgrade: additionalCashNeeded === 0
  }
}

// ===== AFFORDABILITY CALCULATOR =====
export const calculateMaxLoanAmount = (monthlyIncome, existingDebts, interestRate, tenure) => {
  if (!monthlyIncome || !interestRate || !tenure) return null
  
  const maxTDSR = 55 // 55% limit
  const maxDebtAmount = (monthlyIncome * maxTDSR / 100) - (existingDebts || 0)
  
  if (maxDebtAmount <= 0) return 0
  
  // Reverse EMI calculation
  const monthlyRate = interestRate / 100 / 12
  const numPayments = tenure * 12
  
  if (monthlyRate === 0) {
    return maxDebtAmount * numPayments
  }
  
  const maxLoanAmount = (maxDebtAmount * (Math.pow(1 + monthlyRate, numPayments) - 1)) / 
                       (monthlyRate * Math.pow(1 + monthlyRate, numPayments))
  
  return maxLoanAmount
}

export const calculateAffordability = (monthlyIncome, monthlyExpenses, monthlyDebts, availableDownPayment, interestRate, tenure) => {
  const maxLoanAmount = calculateMaxLoanAmount(monthlyIncome, monthlyDebts, interestRate, tenure)
  const maxPropertyValue = maxLoanAmount + (availableDownPayment || 0)
  const monthlyEMI = maxLoanAmount > 0 ? calculateEMI(maxLoanAmount, interestRate, tenure)?.monthlyEMI || 0 : 0
  
  return {
    maxLoanAmount,
    maxPropertyValue,
    monthlyEMI,
    availableDownPayment: availableDownPayment || 0,
    remainingIncome: monthlyIncome - monthlyExpenses - monthlyDebts - monthlyEMI
  }
}

// ===== VALIDATION UTILITIES =====
export const validators = {
  propertyPrice: (value) => value > 0 && value < 50000000,
  interestRate: (value) => value >= 0 && value <= 20,
  income: (value) => value > 0 && value < 1000000,
  age: (value) => value >= 16 && value <= 100,
  tenure: (value) => value > 0 && value <= 35,
  loanAmount: (value) => value > 0 && value < 10000000
}

export const validateInput = (type, value) => {
  const validator = validators[type]
  return validator ? validator(value) : true
}

// ===== FORMATTING UTILITIES =====
export const formatCurrency = (amount, currency = 'SGD') => {
  if (amount === null || amount === undefined) return '-'
  return new Intl.NumberFormat('en-SG', {
    style: 'currency',
    currency: currency,
    minimumFractionDigits: 0,
    maximumFractionDigits: 0
  }).format(amount)
}

export const formatPercentage = (value, decimals = 2) => {
  if (value === null || value === undefined) return '-'
  return `${value.toFixed(decimals)}%`
}

export const formatNumber = (value, decimals = 0) => {
  if (value === null || value === undefined) return '-'
  return new Intl.NumberFormat('en-SG', {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals
  }).format(value)
}