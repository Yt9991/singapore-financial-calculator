import { exportModernCalculationPDF } from './modernExportUtils'
import { calculateCompleteSummary } from './calculations'
import { createIntegratedFooter } from './simpleDisclaimer'

// Get user and client info from localStorage
const getUserInfo = () => {
  try {
    // Try new registration system first
    let savedInfo = localStorage.getItem('sg-finance-user-registration')
    if (!savedInfo) {
      // Fallback to old system
      savedInfo = localStorage.getItem('sg-finance-salesperson-info')
    }
    console.log('🔍 comprehensiveExportUtils getUserInfo - raw localStorage:', savedInfo)
    const parsed = savedInfo ? JSON.parse(savedInfo) : null
    console.log('🔍 comprehensiveExportUtils getUserInfo - parsed:', parsed)
    return parsed
  } catch (error) {
    console.error('Error loading user info:', error)
    return null
  }
}

const getClientInfo = () => {
  try {
    const clientName = localStorage.getItem('sg-finance-client-name')
    return clientName ? { clientName } : null
  } catch (error) {
    console.error('Error loading client info:', error)
    return null
  }
}

// Comprehensive Export Utility
export const exportComprehensiveReport = async (allCalculations) => {
  try {
    // Generate the complete summary
    const summaryResult = calculateCompleteSummary(allCalculations)
    
    if (!summaryResult || summaryResult.totalCalculations === 0) {
      alert('⚠️ No calculations found to export. Please add some calculations to the summary first.')
      return false
    }

    // Create a comprehensive PDF with all calculations
    const pdf = new (await import('jspdf')).jsPDF({
      orientation: 'portrait',
      unit: 'mm',
      format: 'a4',
      compress: true,
      precision: 2
    })
    
    const pdfWidth = pdf.internal.pageSize.getWidth()
    const pdfHeight = pdf.internal.pageSize.getHeight()
    
    // Get salesperson and client info
    const userInfo = getUserInfo()
    const clientInfo = getClientInfo()
    
    let yPosition = 20
    
    // Create header
    createComprehensiveHeader(pdf, pdfWidth, 'COMPREHENSIVE FINANCIAL REPORT')
    
    yPosition = 45
    
    // Skip salesperson information
    
    if (clientInfo && clientInfo.clientName) {
      pdf.setFontSize(12)
      pdf.setFont('helvetica', 'normal')
      pdf.setTextColor(45, 45, 45)
      pdf.text(`This report is specially prepared for: ${clientInfo.clientName}`, 15, yPosition)
      yPosition += 20
    }
    
    // Executive Summary
    yPosition += 10
    yPosition = createSectionHeader(pdf, pdfWidth, yPosition, 'EXECUTIVE SUMMARY')
    yPosition += 5
    
    pdf.setFontSize(10)
    pdf.setFont('helvetica', 'normal')
    pdf.setTextColor(45, 45, 45)
    pdf.text(`This comprehensive report contains ${summaryResult.totalCalculations} financial calculations:`, 15, yPosition)
    yPosition += 8
    
    // List all calculations
    Object.entries(summaryResult.compiledCalculations).forEach(([moduleId, data]) => {
      pdf.text(`• ${data.moduleName || moduleId}: Completed on ${new Date(data.timestamp).toLocaleDateString()}`, 20, yPosition)
      yPosition += 6
    })
    
    yPosition += 10
    
    // Financial Health Score
    if (summaryResult.financialHealth) {
      yPosition = createSectionHeader(pdf, pdfWidth, yPosition, 'FINANCIAL HEALTH SCORE')
      yPosition += 5
      
      pdf.setFontSize(12)
      pdf.setFont('helvetica', 'bold')
      pdf.setTextColor(45, 45, 45)
      pdf.text(`Overall Rating: ${summaryResult.financialHealth.overall} (${summaryResult.financialHealth.score}/100)`, 15, yPosition)
      yPosition += 8
      
      pdf.setFontSize(10)
      pdf.setFont('helvetica', 'normal')
      if (summaryResult.financialHealth.factors) {
        summaryResult.financialHealth.factors.forEach(factor => {
          pdf.text(`• ${factor.factor}: ${factor.status}`, 20, yPosition)
          yPosition += 5
        })
      }
      yPosition += 10
    }
    
    // Individual Calculations
    yPosition = createSectionHeader(pdf, pdfWidth, yPosition, 'DETAILED CALCULATIONS')
    yPosition += 5
    
    Object.entries(summaryResult.compiledCalculations).forEach(([moduleId, data]) => {
      // Check if we need a new page
      if (yPosition > 200) {
        pdf.addPage()
        yPosition = 20
      }
      
      // Module title
      pdf.setFontSize(12)
      pdf.setFont('helvetica', 'bold')
      pdf.setTextColor(45, 45, 45)
      pdf.text(`${data.moduleName || moduleId.toUpperCase()}`, 15, yPosition)
      yPosition += 8
      
      // Input parameters
      if (data.inputs) {
        pdf.setFontSize(10)
        pdf.setFont('helvetica', 'bold')
        pdf.setTextColor(100, 100, 100)
        pdf.text('Input Parameters:', 20, yPosition)
        yPosition += 5
        
        pdf.setFont('helvetica', 'normal')
        Object.entries(data.inputs).forEach(([key, value]) => {
          if (value !== undefined && value !== null && value !== '') {
            const label = key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())
            const displayValue = formatValueForDisplay(key, value, 'input')
            pdf.text(`${label}: ${displayValue}`, 25, yPosition)
            yPosition += 4
          }
        })
        yPosition += 5
      }
      
      // Results
      if (data.result) {
        pdf.setFontSize(10)
        pdf.setFont('helvetica', 'bold')
        pdf.setTextColor(100, 100, 100)
        pdf.text('Results:', 20, yPosition)
        yPosition += 5
        
        pdf.setFont('helvetica', 'normal')
        Object.entries(data.result).forEach(([key, value]) => {
          if (value !== undefined && value !== null && value !== '') {
            const label = key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())
            const displayValue = formatValueForDisplay(key, value, 'result')
            pdf.text(`${label}: ${displayValue}`, 25, yPosition)
            yPosition += 4
          }
        })
      }
      
      yPosition += 10
    })
    
    // Recommendations
    if (summaryResult.recommendations && summaryResult.recommendations.length > 0) {
      yPosition = createSectionHeader(pdf, pdfWidth, yPosition, 'RECOMMENDATIONS')
      yPosition += 5
      
      pdf.setFontSize(10)
      pdf.setFont('helvetica', 'normal')
      summaryResult.recommendations.forEach(rec => {
        pdf.setFont('helvetica', 'bold')
        pdf.text(`${rec.title} (${rec.priority})`, 15, yPosition)
        yPosition += 5
        pdf.setFont('helvetica', 'normal')
        pdf.text(rec.message, 20, yPosition)
        yPosition += 8
      })
    }
    
    // Integrated Footer with Disclaimer
    createIntegratedFooter(pdf, pdfWidth, pdfHeight, userInfo)
    
    // Compress and download
    const pdfBytes = pdf.output('arraybuffer')
    const compressedBytes = await compressPDF(pdfBytes)
    
    const filename = `Comprehensive_Financial_Report_${new Date().toISOString().split('T')[0]}.pdf`
    const blob = new Blob([compressedBytes], { type: 'application/pdf' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = filename
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    URL.revokeObjectURL(url)
    
    return true
  } catch (error) {
    console.error('Comprehensive export error:', error)
    throw new Error('Failed to generate comprehensive report: ' + error.message)
  }
}

// Export individual calculations as separate PDFs
export const exportAllIndividualCalculations = async (allCalculations) => {
  try {
    const compiledData = allCalculations.summary?.compiledCalculations || {}
    const calculations = Object.entries(compiledData)
    
    if (calculations.length === 0) {
      alert('⚠️ No calculations found to export. Please add some calculations to the summary first.')
      return false
    }
    
    let exportedCount = 0
    
    for (const [moduleId, data] of calculations) {
      try {
        await exportModernCalculationPDF(moduleId, data.moduleName || moduleId, data.result, data.inputs || {})
        exportedCount++
      } catch (error) {
        console.error(`Failed to export ${moduleId}:`, error)
      }
    }
    
    alert(`✅ Successfully exported ${exportedCount} out of ${calculations.length} calculations!`)
    return true
  } catch (error) {
    console.error('Individual exports error:', error)
    throw new Error('Failed to export individual calculations: ' + error.message)
  }
}

// Helper functions (reused from modernExportUtils)
const createComprehensiveHeader = (pdf, pdfWidth, title) => {
  // Main header background
  pdf.setFillColor(45, 45, 45)
  pdf.rect(0, 0, pdfWidth, 35, 'F')
  
  // Accent stripe
  pdf.setFillColor(188, 158, 123)
  pdf.rect(0, 0, pdfWidth, 4, 'F')
  
  // Logo area with calculator icon
  pdf.setFillColor(188, 158, 123)
  pdf.rect(10, 8, 20, 20, 'F')
  
  // Calculator icon
  pdf.setFillColor(255, 255, 255)
  pdf.rect(12, 10, 16, 16, 'F')
  pdf.setFillColor(45, 45, 45)
  pdf.rect(13, 11, 14, 3, 'F')
  
  // Calculator buttons
  pdf.setFillColor(188, 158, 123)
  for (let row = 0; row < 4; row++) {
    for (let col = 0; col < 4; col++) {
      pdf.rect(13 + col * 3.5, 15 + row * 2.5, 3, 2, 'F')
    }
  }
  
  // Singapore flag accent
  pdf.setFillColor(255, 0, 0)
  pdf.circle(30, 18, 2, 'F')
  pdf.setFillColor(255, 255, 255)
  pdf.circle(30, 18, 1.5, 'F')
  pdf.setFillColor(255, 0, 0)
  pdf.circle(30, 18, 1, 'F')
  
  // Main title
  pdf.setFontSize(18)
  pdf.setFont('helvetica', 'bold')
  pdf.setTextColor(255, 255, 255)
  pdf.text('SINGAPORE FINANCIAL', 35, 15)
  pdf.text('CALCULATOR', 35, 20)
  
  pdf.setFontSize(10)
  pdf.setFont('helvetica', 'normal')
  pdf.setTextColor(200, 200, 200)
  pdf.text('Professional Financial Planning Tools', 35, 25)
  
  // Report title
  pdf.setFontSize(14)
  pdf.setFont('helvetica', 'bold')
  pdf.setTextColor(188, 158, 123)
  pdf.text(title, pdfWidth - 15, 20, { align: 'right' })
  
  // Date and time
  pdf.setFontSize(8)
  pdf.setFont('helvetica', 'normal')
  pdf.setTextColor(150, 150, 150)
  pdf.text(`Generated: ${new Date().toLocaleDateString('en-SG')} ${new Date().toLocaleTimeString('en-SG')}`, 
           pdfWidth - 15, 25, { align: 'right' })
}

const createInfoCard = (pdf, pdfWidth, yPosition, title, items, r, g, b) => {
  // Card background
  pdf.setFillColor(250, 250, 250)
  pdf.rect(10, yPosition, pdfWidth - 20, 25, 'F')
  
  // Card border
  pdf.setDrawColor(r, g, b)
  pdf.setLineWidth(0.5)
  pdf.rect(10, yPosition, pdfWidth - 20, 25, 'S')
  
  // Section header
  pdf.setFillColor(r, g, b)
  pdf.rect(10, yPosition, 4, 25, 'F')
  
  // Title
  pdf.setFontSize(12)
  pdf.setFont('helvetica', 'bold')
  pdf.setTextColor(45, 45, 45)
  pdf.text(title, 18, yPosition + 8)
  
  // Items
  pdf.setFontSize(9)
  pdf.setFont('helvetica', 'normal')
  pdf.setTextColor(100, 100, 100)
  
  let lineY = yPosition + 12
  items.forEach(item => {
    pdf.text(item, 18, lineY)
    lineY += 4
  })
  
  return yPosition + 35
}

const createSectionHeader = (pdf, pdfWidth, yPosition, title) => {
  // Section divider
  pdf.setDrawColor(188, 158, 123)
  pdf.setLineWidth(2)
  pdf.line(10, yPosition, pdfWidth - 10, yPosition)
  yPosition += 8
  
  // Title
  pdf.setFontSize(16)
  pdf.setFont('helvetica', 'bold')
  pdf.setTextColor(45, 45, 45)
  pdf.text(title, 15, yPosition)
  
  return yPosition + 12
}

const createModernFooter = (pdf, pdfWidth, pdfHeight, salespersonInfo) => {
  // Footer background
  pdf.setFillColor(45, 45, 45)
  pdf.rect(0, pdfHeight - 25, pdfWidth, 25, 'F')
  
  // Accent stripe
  pdf.setFillColor(188, 158, 123)
  pdf.rect(0, pdfHeight - 25, pdfWidth, 2, 'F')
  
  // Main footer text
  pdf.setFontSize(8)
  pdf.setTextColor(255, 255, 255)
  pdf.text('SINGAPORE FINANCIAL CALCULATOR - COMPREHENSIVE REPORT', pdfWidth / 2, pdfHeight - 20, { align: 'center' })
  
  // Contact information
  if (salespersonInfo && salespersonInfo.name) {
    pdf.setFontSize(7)
    pdf.text(`Prepared by: ${salespersonInfo.name} | CEA: ${salespersonInfo.ceaNumber || 'N/A'}`, 
             pdfWidth / 2, pdfHeight - 16, { align: 'center' })
    if (salespersonInfo.mobile || salespersonInfo.email) {
      let contactInfo = ''
      if (salespersonInfo.mobile) contactInfo += `Mobile: ${salespersonInfo.mobile}`
      if (salespersonInfo.mobile && salespersonInfo.email) contactInfo += ' | '
      if (salespersonInfo.email) contactInfo += `Email: ${salespersonInfo.email}`
      pdf.text(contactInfo, pdfWidth / 2, pdfHeight - 12, { align: 'center' })
    }
  }
  
  // Generation info and branding
  pdf.setFontSize(6)
  pdf.text(`Generated: ${new Date().toLocaleDateString('en-SG')} at ${new Date().toLocaleTimeString('en-SG')}`, 
           pdfWidth / 2, pdfHeight - 8, { align: 'center' })
  pdf.text('Powered by Team Mindlink | Courtesy of #thepeoplesagency', 
           pdfWidth / 2, pdfHeight - 4, { align: 'center' })
}

const formatValueForDisplay = (key, value, type) => {
  if (typeof value === 'number') {
    if (key.includes('Rate') || key.includes('Percentage') || key.includes('ROI')) {
      return `${value.toFixed(2)}%`
    } else if (key.includes('Value') || key.includes('Amount') || key.includes('Payment') || 
              key.includes('Interest') || key.includes('Tax') || key.includes('Duty') ||
              key.includes('Income') || key.includes('Salary')) {
      return `S$${value.toLocaleString()}`
    } else {
      return value.toString()
    }
  }
  return value.toString()
}

const compressPDF = async (pdfBytes) => {
  try {
    const { PDFDocument } = await import('pdf-lib')
    const pdfDoc = await PDFDocument.load(pdfBytes)
    
    // Set metadata
    pdfDoc.setTitle('Singapore Financial Calculator - Comprehensive Report')
    pdfDoc.setAuthor('Team Mindlink')
    pdfDoc.setSubject('Comprehensive Financial Report')
    pdfDoc.setKeywords(['Singapore', 'Financial', 'Calculator', 'Comprehensive', 'Report', 'Team Mindlink'])
    pdfDoc.setProducer('Singapore Financial Calculator v2025.1.0 - Team Mindlink')
    pdfDoc.setCreator('Team Mindlink')
    
    // Save with compression
    const compressedBytes = await pdfDoc.save({
      useObjectStreams: true,
      addDefaultPage: false,
      objectsPerTick: 50
    })
    
    return compressedBytes
  } catch (error) {
    console.error('PDF compression error:', error)
    return pdfBytes
  }
}

const getSalespersonInfo = () => {
  try {
    const savedInfo = localStorage.getItem('sg-finance-salesperson-info')
    return savedInfo ? JSON.parse(savedInfo) : null
  } catch (error) {
    console.error('Error loading salesperson info:', error)
    return null
  }
}

const getClientInfo = () => {
  try {
    const savedInfo = localStorage.getItem('sg-finance-client-info')
    return savedInfo ? JSON.parse(savedInfo) : null
  } catch (error) {
    console.error('Error loading client info:', error)
    return null
  }
}
