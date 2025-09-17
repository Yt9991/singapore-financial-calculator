// PDF Export Utility for Singapore Financial Calculator
// Creates compressed, professional PDF reports

export const exportToPDF = (moduleId, moduleName, calculationData, salespersonInfo, clientInfo) => {
  try {
    // Get current date and time
    const now = new Date()
    const dateStr = now.toLocaleDateString('en-SG')
    const timeStr = now.toLocaleTimeString('en-SG')
    
    // Create HTML content for PDF
    const htmlContent = generatePDFHTML(moduleId, moduleName, calculationData, salespersonInfo, clientInfo, dateStr, timeStr)
    
    // Open new window for printing
    const printWindow = window.open('', '_blank')
    printWindow.document.write(htmlContent)
    printWindow.document.close()
    
    // Wait for content to load, then trigger print
    printWindow.onload = () => {
      setTimeout(() => {
        printWindow.print()
        // Close window after printing
        setTimeout(() => {
          printWindow.close()
        }, 1000)
      }, 500)
    }
    
    return true
  } catch (error) {
    console.error('PDF Export Error:', error)
    alert('PDF export failed. Please try again or use a different browser.')
    return false
  }
}

const generatePDFHTML = (moduleId, moduleName, calculationData, salespersonInfo, clientInfo, dateStr, timeStr) => {
  const isSummary = moduleId === 'summary'
  
  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <title>${isSummary ? 'Financial Summary Report' : moduleName} - Singapore Financial Calculator</title>
      <style>
        @page {
          size: A4;
          margin: 15mm;
        }
        
        * {
          margin: 0;
          padding: 0;
          box-sizing: border-box;
        }
        
        body {
          font-family: 'Arial', sans-serif;
          font-size: 11px;
          line-height: 1.4;
          color: #333;
          background: white;
        }
        
        .header {
          text-align: center;
          border-bottom: 2px solid #bc9e7b;
          padding-bottom: 15px;
          margin-bottom: 20px;
        }
        
        .header h1 {
          font-size: 18px;
          color: #422d2a;
          margin-bottom: 5px;
        }
        
        .header h2 {
          font-size: 14px;
          color: #6b513f;
          font-weight: normal;
        }
        
        .report-info {
          display: flex;
          justify-content: space-between;
          margin-bottom: 20px;
          font-size: 10px;
          color: #666;
        }
        
        .salesperson-info, .client-info {
          background: #f8f6f4;
          border: 1px solid #bc9e7b;
          border-radius: 5px;
          padding: 10px;
          margin-bottom: 15px;
        }
        
        .salesperson-info h3, .client-info h3 {
          font-size: 12px;
          color: #422d2a;
          margin-bottom: 8px;
          border-bottom: 1px solid #bc9e7b;
          padding-bottom: 3px;
        }
        
        .info-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 10px;
          font-size: 10px;
        }
        
        .info-item {
          display: flex;
          justify-content: space-between;
        }
        
        .info-label {
          font-weight: bold;
          color: #6b513f;
        }
        
        .results-section {
          margin-top: 20px;
        }
        
        .results-section h3 {
          font-size: 14px;
          color: #422d2a;
          margin-bottom: 10px;
          border-bottom: 1px solid #bc9e7b;
          padding-bottom: 5px;
        }
        
        .result-item {
          display: flex;
          justify-content: space-between;
          padding: 5px 0;
          border-bottom: 1px dotted #ccc;
        }
        
        .result-item:last-child {
          border-bottom: 2px solid #bc9e7b;
          font-weight: bold;
          margin-top: 5px;
        }
        
        .result-label {
          color: #6b513f;
        }
        
        .result-value {
          color: #422d2a;
          font-weight: bold;
        }
        
        .summary-section {
          margin: 15px 0;
          padding: 10px;
          background: #f8f6f4;
          border-left: 4px solid #bc9e7b;
        }
        
        .summary-section h4 {
          font-size: 12px;
          color: #422d2a;
          margin-bottom: 8px;
        }
        
        .health-score {
          display: flex;
          align-items: center;
          gap: 15px;
          margin: 10px 0;
        }
        
        .score-circle {
          width: 50px;
          height: 50px;
          border-radius: 50%;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          font-weight: bold;
          color: white;
          font-size: 10px;
        }
        
        .score-circle.excellent { background: #4caf50; }
        .score-circle.good { background: #8bc34a; }
        .score-circle.fair { background: #ff9800; }
        .score-circle.poor { background: #f44336; }
        
        .recommendations {
          margin-top: 15px;
        }
        
        .recommendation-item {
          padding: 8px;
          margin: 5px 0;
          border-left: 3px solid #bc9e7b;
          background: #f8f6f4;
          font-size: 10px;
        }
        
        .recommendation-title {
          font-weight: bold;
          color: #422d2a;
        }
        
        .disclaimer {
          margin-top: 30px;
          padding: 10px;
          background: #fff3cd;
          border: 1px solid #ffeaa7;
          border-radius: 5px;
          font-size: 9px;
          color: #856404;
        }
        
        .footer {
          margin-top: 20px;
          text-align: center;
          font-size: 9px;
          color: #666;
          border-top: 1px solid #ccc;
          padding-top: 10px;
        }
        
        @media print {
          body { -webkit-print-color-adjust: exact; }
          .no-print { display: none; }
        }
      </style>
    </head>
    <body>
      <div class="header">
        <h1>🇸🇬 Singapore Financial Calculator 2025</h1>
        <h2>${isSummary ? 'Financial Summary Report' : moduleName}</h2>
      </div>
      
      <div class="report-info">
        <div>Generated on: ${dateStr} at ${timeStr}</div>
        <div>Report ID: ${generateReportId()}</div>
      </div>
      
      ${generateSalespersonSection(salespersonInfo)}
      ${generateClientSection(clientInfo)}
      
      <div class="results-section">
        ${generateResultsContent(moduleId, moduleName, calculationData)}
      </div>
      
      ${generateDisclaimer()}
      
      <div class="footer">
        <p>Powered by #thepeoplesagency | Team Mindlink 2025</p>
        <p>For official rates and regulations, please refer to IRAS, CPF Board, MAS, and HDB websites</p>
      </div>
    </body>
    </html>
  `
}

const generateSalespersonSection = (salespersonInfo) => {
  if (!salespersonInfo || !salespersonInfo.name) return ''
  
  return `
    <div class="salesperson-info">
      <h3>📋 Professional Report Prepared By</h3>
      <div class="info-grid">
        <div class="info-item">
          <span class="info-label">Name:</span>
          <span>${salespersonInfo.name}</span>
        </div>
        <div class="info-item">
          <span class="info-label">CEA Number:</span>
          <span>${salespersonInfo.ceaNumber}</span>
        </div>
        <div class="info-item">
          <span class="info-label">Mobile:</span>
          <span>${salespersonInfo.mobile}</span>
        </div>
        <div class="info-item">
          <span class="info-label">Email:</span>
          <span>${salespersonInfo.email}</span>
        </div>
      </div>
    </div>
  `
}

const generateClientSection = (clientInfo) => {
  if (!clientInfo || !clientInfo.clientName) return ''
  
  return `
    <div class="client-info">
      <h3>👤 Client Information</h3>
      <div class="info-grid">
        <div class="info-item">
          <span class="info-label">Client Name:</span>
          <span>${clientInfo.clientName}</span>
        </div>
        <div class="info-item">
          <span class="info-label">Property Address:</span>
          <span>${clientInfo.propertyAddress || 'Not specified'}</span>
        </div>
        <div class="info-item">
          <span class="info-label">Mobile:</span>
          <span>${clientInfo.clientMobile || 'Not provided'}</span>
        </div>
        <div class="info-item">
          <span class="info-label">Email:</span>
          <span>${clientInfo.clientEmail || 'Not provided'}</span>
        </div>
      </div>
    </div>
  `
}

const generateResultsContent = (moduleId, moduleName, calculationData) => {
  if (moduleId === 'summary') {
    return generateSummaryResults(calculationData)
  } else {
    return generateModuleResults(moduleId, moduleName, calculationData)
  }
}

const generateSummaryResults = (summaryData) => {
  if (!summaryData || summaryData.totalCalculations === 0) {
    return '<h3>No calculations compiled yet</h3><p>Complete calculations in other modules and add them to this summary report.</p>'
  }
  
  let html = `
    <h3>📊 Financial Summary Report</h3>
    <p>Based on ${summaryData.totalCalculations} compiled calculation${summaryData.totalCalculations > 1 ? 's' : ''}:</p>
  `
  
  // Financial Health Score
  if (summaryData.financialHealth) {
    html += `
      <div class="summary-section">
        <h4>🏆 Financial Health Score</h4>
        <div class="health-score">
          <div class="score-circle ${summaryData.financialHealth.overall.toLowerCase()}">
            <span>${summaryData.financialHealth.score}</span>
            <span>/100</span>
          </div>
          <div>
            <strong>Overall Rating: ${summaryData.financialHealth.overall}</strong>
            ${summaryData.financialHealth.factors.map(factor => 
              `<div>${factor.factor}: ${factor.status}</div>`
            ).join('')}
          </div>
        </div>
      </div>
    `
  }
  
  // Monthly Commitments
  if (summaryData.monthlyCommitments && summaryData.monthlyCommitments.total > 0) {
    html += `
      <div class="summary-section">
        <h4>💰 Monthly Commitments</h4>
        ${Object.entries(summaryData.monthlyCommitments).map(([key, amount]) => 
          key !== 'total' && amount > 0 ? `
            <div class="result-item">
              <span class="result-label">${key.charAt(0).toUpperCase() + key.slice(1)}</span>
              <span class="result-value">${formatCurrency(amount)}</span>
            </div>
          ` : ''
        ).join('')}
        <div class="result-item">
          <span class="result-label">Total Monthly Commitments</span>
          <span class="result-value">${formatCurrency(summaryData.monthlyCommitments.total)}</span>
        </div>
      </div>
    `
  }
  
  // Annual Obligations
  if (summaryData.annualObligations && summaryData.annualObligations.total > 0) {
    html += `
      <div class="summary-section">
        <h4>📅 Annual Obligations</h4>
        ${Object.entries(summaryData.annualObligations).map(([key, amount]) => 
          key !== 'total' && amount > 0 ? `
            <div class="result-item">
              <span class="result-label">${key.charAt(0).toUpperCase() + key.slice(1)}</span>
              <span class="result-value">${formatCurrency(amount)}</span>
            </div>
          ` : ''
        ).join('')}
        <div class="result-item">
          <span class="result-label">Total Annual Obligations</span>
          <span class="result-value">${formatCurrency(summaryData.annualObligations.total)}</span>
        </div>
      </div>
    `
  }
  
  // Recommendations
  if (summaryData.recommendations && summaryData.recommendations.length > 0) {
    html += `
      <div class="recommendations">
        <h4>💡 Recommendations</h4>
        ${summaryData.recommendations.map(rec => `
          <div class="recommendation-item">
            <div class="recommendation-title">${rec.title} (${rec.priority})</div>
            <div>${rec.message}</div>
            <div style="font-size: 9px; color: #666; margin-top: 3px;">Category: ${rec.category}</div>
          </div>
        `).join('')}
      </div>
    `
  }
  
  return html
}

const generateModuleResults = (moduleId, moduleName, calculationData) => {
  if (!calculationData || !calculationData.result) {
    return '<h3>No calculation results available</h3>'
  }
  
  const result = calculationData.result
  let html = `<h3>${moduleName} Results</h3>`
  
  // Generate results based on module type
  switch (moduleId) {
    case 'mortgage':
      html += generateMortgageResults(result)
      break
    case 'bsd':
    case 'absd':
    case 'ssd':
      html += generateStampDutyResults(moduleId, result)
      break
    case 'tdsr':
      html += generateTDSRResults(result)
      break
    case 'cpf':
      html += generateCPFResults(result)
      break
    case 'incomeTax':
      html += generateIncomeTaxResults(result)
      break
    case 'corporateTax':
      html += generateCorporateTaxResults(result)
      break
    case 'investment':
      html += generateInvestmentResults(result)
      break
    case 'hdbUpgrade':
      html += generateHDBUpgradeResults(result)
      break
    case 'affordability':
      html += generateAffordabilityResults(result)
      break
    default:
      html += '<p>Results not available for this module.</p>'
  }
  
  return html
}

const generateMortgageResults = (result) => {
  return `
    <div class="result-item">
      <span class="result-label">Monthly EMI</span>
      <span class="result-value">${formatCurrency(result.monthlyEMI)}</span>
    </div>
    <div class="result-item">
      <span class="result-label">Total Payment</span>
      <span class="result-value">${formatCurrency(result.totalPayment)}</span>
    </div>
    <div class="result-item">
      <span class="result-label">Total Interest</span>
      <span class="result-value">${formatCurrency(result.totalInterest)}</span>
    </div>
    ${result.ltvRatio ? `
      <div class="result-item">
        <span class="result-label">LTV Ratio</span>
        <span class="result-value">${formatPercentage(result.ltvRatio)}</span>
      </div>
    ` : ''}
  `
}

const generateStampDutyResults = (moduleId, result) => {
  const typeMap = {
    'bsd': 'Buyer Stamp Duty (BSD)',
    'absd': 'Additional Buyer Stamp Duty (ABSD)',
    'ssd': 'Seller Stamp Duty (SSD)'
  }
  
  const amountMap = {
    'bsd': result.bsd,
    'absd': result.absd,
    'ssd': result.ssd
  }
  
  return `
    <div class="result-item">
      <span class="result-label">Property Value</span>
      <span class="result-value">${formatCurrency(result.propertyValue)}</span>
    </div>
    <div class="result-item">
      <span class="result-label">${typeMap[moduleId]}</span>
      <span class="result-value">${formatCurrency(amountMap[moduleId])}</span>
    </div>
    ${result.breakdown ? `
      <div style="margin-top: 10px;">
        <strong>Breakdown:</strong>
        ${result.breakdown.map(bracket => `
          <div style="font-size: 10px; margin: 2px 0;">
            ${bracket.range}: ${formatCurrency(bracket.tax)} (${bracket.rate}%)
          </div>
        `).join('')}
      </div>
    ` : ''}
  `
}

const generateTDSRResults = (result) => {
  return `
    <div class="result-item">
      <span class="result-label">TDSR Percentage</span>
      <span class="result-value" style="color: ${result.isWithinLimit ? 'green' : 'red'}">${formatPercentage(result.tdsrPercentage)}</span>
    </div>
    <div class="result-item">
      <span class="result-label">Total Monthly Debts</span>
      <span class="result-value">${formatCurrency(result.totalDebts)}</span>
    </div>
    <div class="result-item">
      <span class="result-label">Maximum Allowed Debts</span>
      <span class="result-value">${formatCurrency(result.maxAllowedDebts)}</span>
    </div>
    <div class="result-item">
      <span class="result-label">Status</span>
      <span class="result-value" style="color: ${result.isWithinLimit ? 'green' : 'red'}">
        ${result.isWithinLimit ? '✅ Within TDSR Limit (55%)' : '❌ Exceeds TDSR Limit (55%)'}
      </span>
    </div>
  `
}

const generateCPFResults = (result) => {
  return `
    <div class="result-item">
      <span class="result-label">Employee Contribution</span>
      <span class="result-value">${formatCurrency(result.employeeContribution)}</span>
    </div>
    <div class="result-item">
      <span class="result-label">Employer Contribution</span>
      <span class="result-value">${formatCurrency(result.employerContribution)}</span>
    </div>
    <div class="result-item">
      <span class="result-label">Total Monthly Contribution</span>
      <span class="result-value">${formatCurrency(result.totalContribution)}</span>
    </div>
    <div class="result-item">
      <span class="result-label">Annual Contribution</span>
      <span class="result-value">${formatCurrency(result.annualContribution)}</span>
    </div>
  `
}

const generateIncomeTaxResults = (result) => {
  return `
    <div class="result-item">
      <span class="result-label">Tax Payable</span>
      <span class="result-value">${formatCurrency(result.taxPayable)}</span>
    </div>
    ${result.rebate > 0 ? `
      <div class="result-item">
        <span class="result-label">Tax Rebate</span>
        <span class="result-value">${formatCurrency(result.rebate)}</span>
      </div>
    ` : ''}
    <div class="result-item">
      <span class="result-label">Effective Tax Rate</span>
      <span class="result-value">${formatPercentage(result.effectiveRate)}</span>
    </div>
  `
}

const generateCorporateTaxResults = (result) => {
  return `
    <div class="result-item">
      <span class="result-label">Tax Payable</span>
      <span class="result-value">${formatCurrency(result.taxPayable)}</span>
    </div>
    ${result.exemptions > 0 ? `
      <div class="result-item">
        <span class="result-label">Tax Exemptions</span>
        <span class="result-value">${formatCurrency(result.exemptions)}</span>
      </div>
    ` : ''}
    <div class="result-item">
      <span class="result-label">Effective Tax Rate</span>
      <span class="result-value">${formatPercentage(result.effectiveRate)}</span>
    </div>
  `
}

const generateInvestmentResults = (result) => {
  return `
    <div class="result-item">
      <span class="result-label">Total Investment Value</span>
      <span class="result-value">${formatCurrency(result.totalValue)}</span>
    </div>
    <div class="result-item">
      <span class="result-label">Total Amount Invested</span>
      <span class="result-value">${formatCurrency(result.totalInvested)}</span>
    </div>
    <div class="result-item">
      <span class="result-label">Total Gains</span>
      <span class="result-value">${formatCurrency(result.totalGains)}</span>
    </div>
    <div class="result-item">
      <span class="result-label">ROI</span>
      <span class="result-value">${formatPercentage(result.roi)}</span>
    </div>
  `
}

const generateHDBUpgradeResults = (result) => {
  return `
    <div class="result-item">
      <span class="result-label">Net Proceeds from HDB Sale</span>
      <span class="result-value">${formatCurrency(result.netProceeds)}</span>
    </div>
    <div class="result-item">
      <span class="result-label">Available for Upgrade</span>
      <span class="result-value">${formatCurrency(result.availableForUpgrade)}</span>
    </div>
    <div class="result-item">
      <span class="result-label">Additional Cash Needed</span>
      <span class="result-value" style="color: ${result.additionalCashNeeded > 0 ? 'red' : 'green'}">${formatCurrency(result.additionalCashNeeded)}</span>
    </div>
  `
}

const generateAffordabilityResults = (result) => {
  return `
    <div class="result-item">
      <span class="result-label">Maximum Loan Amount</span>
      <span class="result-value">${formatCurrency(result.maxLoanAmount)}</span>
    </div>
    <div class="result-item">
      <span class="result-label">Maximum Property Value</span>
      <span class="result-value">${formatCurrency(result.maxPropertyValue)}</span>
    </div>
    <div class="result-item">
      <span class="result-label">Monthly EMI</span>
      <span class="result-value">${formatCurrency(result.monthlyEMI)}</span>
    </div>
  `
}

const generateDisclaimer = () => {
  return `
    <div class="disclaimer">
      <strong>Professional Disclaimer:</strong> This report is prepared by a licensed property salesperson for informational purposes only. 
      All calculations are based on current Singapore regulations and should be verified with relevant authorities. 
      This tool does not constitute professional financial, legal, tax, or investment advice. 
      Users are strongly advised to consult with licensed professionals and verify all calculations with official sources.
    </div>
  `
}

const generateReportId = () => {
  return 'SG-FIN-' + Date.now().toString().slice(-8)
}

const formatCurrency = (amount) => {
  if (amount === null || amount === undefined) return '-'
  return new Intl.NumberFormat('en-SG', {
    style: 'currency',
    currency: 'SGD',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0
  }).format(amount)
}

const formatPercentage = (value) => {
  if (value === null || value === undefined) return '-'
  return `${value.toFixed(2)}%`
}

