import jsPDF from 'jspdf'
import html2canvas from 'html2canvas'
import { PDFDocument } from 'pdf-lib'
import { createIntegratedFooter } from './simpleDisclaimer'

// PDF Compression Utility
const compressPDF = async (pdfBytes) => {
  try {
    const pdfDoc = await PDFDocument.load(pdfBytes)
    
    // Remove unnecessary metadata and optimize
    pdfDoc.setTitle('Singapore Financial Calculator Report - Powered by Team Mindlink')
    pdfDoc.setAuthor('Team Mindlink')
    pdfDoc.setSubject('Financial Calculation Report')
    pdfDoc.setKeywords(['Singapore', 'Financial', 'Calculator', 'Property', 'Tax', 'Team Mindlink', 'The Peoples Agency'])
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
    return pdfBytes // Return original if compression fails
  }
}

// PDF Export Utility for Singapore Financial Calculator
export const exportToPDF = async (elementId, filename, title, includeHeader = true) => {
  try {
    const element = document.getElementById(elementId)
    if (!element) {
      throw new Error('Element not found for PDF export')
    }

    // Create canvas from HTML element with optimized settings
    const canvas = await html2canvas(element, {
      scale: 1.5, // Reduced scale for smaller file size
      useCORS: true,
      allowTaint: true,
      backgroundColor: '#ffffff',
      logging: false,
      width: element.scrollWidth,
      height: element.scrollHeight,
      imageTimeout: 0,
      removeContainer: true
    })

    const imgData = canvas.toDataURL('image/jpeg', 0.8) // JPEG with 80% quality for smaller size
    const pdf = new jsPDF({
      orientation: 'portrait',
      unit: 'mm',
      format: 'a4',
      compress: true,
      precision: 2
    })
    
    // Calculate dimensions
    const pdfWidth = pdf.internal.pageSize.getWidth()
    const pdfHeight = pdf.internal.pageSize.getHeight()
    const imgWidth = canvas.width
    const imgHeight = canvas.height
    const ratio = Math.min(pdfWidth / imgWidth, pdfHeight / imgHeight)
    const imgX = (pdfWidth - imgWidth * ratio) / 2
    const imgY = 30

    // Add professional header if requested
    if (includeHeader) {
      // Professional Header with Singapore colors
      pdf.setFillColor(188, 158, 123) // Default brown color
      pdf.rect(0, 0, pdfWidth, 25, 'F')
      
      // Singapore flag accent
      pdf.setFillColor(255, 0, 0) // Red
      pdf.rect(0, 0, pdfWidth, 2, 'F')
      pdf.setFillColor(255, 255, 255) // White
      pdf.rect(0, 2, pdfWidth, 2, 'F')
      
    // Main title
    pdf.setFontSize(20)
    pdf.setFont('helvetica', 'bold')
    pdf.setTextColor(255, 255, 255)
    pdf.text('🇸🇬 Singapore Financial Calculator', pdfWidth / 2, 12, { align: 'center' })
    
    pdf.setFontSize(12)
    pdf.setFont('helvetica', 'normal')
    pdf.text('Comprehensive financial planning tools for Singapore residents', pdfWidth / 2, 18, { align: 'center' })
    
    pdf.setFontSize(16)
    pdf.setFont('helvetica', 'bold')
    pdf.text(title, pdfWidth / 2, 24, { align: 'center' })
      
      // Get salesperson info for header
      const salespersonInfo = getSalespersonInfo()
      if (salespersonInfo && salespersonInfo.name) {
        pdf.setFontSize(10)
        pdf.setFont('helvetica', 'normal')
        pdf.text(`Prepared by: ${salespersonInfo.name} (CEA: ${salespersonInfo.ceaNumber || 'N/A'})`, 
                 pdfWidth / 2, 28, { align: 'center' })
      }
      
      // Add timestamp
      pdf.setTextColor(0, 0, 0)
      pdf.setFontSize(8)
      pdf.text(`Generated on: ${new Date().toLocaleDateString('en-SG')} at ${new Date().toLocaleTimeString('en-SG')}`, 
               10, pdfHeight - 10)
    }

    // Add the image
    pdf.addImage(imgData, 'JPEG', imgX, imgY, imgWidth * ratio, imgHeight * ratio)
    
    // Get PDF bytes for compression
    const pdfBytes = pdf.output('arraybuffer')
    
    // Compress the PDF
    const compressedBytes = await compressPDF(pdfBytes)
    
    // Create blob and download
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
    console.error('PDF export error:', error)
    throw new Error('Failed to generate PDF: ' + error.message)
  }
}

// Get salesperson and client info from localStorage
const getUserInfo = () => {
  try {
    // Try new user details system first
    let savedInfo = localStorage.getItem('sg-finance-user-details')
    if (!savedInfo) {
      // Fallback to old systems
      savedInfo = localStorage.getItem('sg-finance-user-registration')
      if (!savedInfo) {
        savedInfo = localStorage.getItem('sg-finance-salesperson-info')
      }
    }
    console.log('🔍 exportUtils getUserInfo - raw localStorage:', savedInfo)
    const parsed = savedInfo ? JSON.parse(savedInfo) : null
    console.log('🔍 exportUtils getUserInfo - parsed:', parsed)
    return parsed
  } catch (error) {
    console.error('Error loading user info:', error)
    return null
  }
}

const getClientInfo = () => {
  // Client name functionality removed
  return null
}

// Export individual calculation results
export const exportCalculationPDF = async (moduleId, moduleName, calculation, inputs, clientName = '') => {
  try {
    const pdf = new jsPDF({
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
    const clientInfo = clientName ? { name: clientName } : null
    
    let yPosition = 20
    
    // Modern Professional Header with Gradient Effect
    // Main header background
    pdf.setFillColor(45, 45, 45) // Dark gray
    pdf.rect(0, 0, pdfWidth, 35, 'F')
    
    // Accent stripe
    pdf.setFillColor(188, 158, 123) // Brown accent
    pdf.rect(0, 0, pdfWidth, 4, 'F')
    
    // Singapore flag colors accent
    pdf.setFillColor(255, 0, 0) // Red
    pdf.rect(0, 4, pdfWidth, 1, 'F')
    pdf.setFillColor(255, 255, 255) // White
    pdf.rect(0, 5, pdfWidth, 1, 'F')
    
    // Logo area with calculator icon
    pdf.setFillColor(188, 158, 123)
    pdf.rect(10, 8, 20, 20, 'F')
    
    // Calculator icon inside logo area
    pdf.setFillColor(255, 255, 255)
    pdf.rect(12, 10, 16, 16, 'F')
    
    // Calculator display
    pdf.setFillColor(45, 45, 45)
    pdf.rect(13, 11, 14, 3, 'F')
    
    // Calculator buttons (4x4 grid)
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
    
    // Main title with better typography
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
    pdf.text(`${moduleName.toUpperCase()} CALCULATION REPORT`, pdfWidth - 15, 20, { align: 'right' })
    
    // Date and time
    pdf.setFontSize(8)
    pdf.setFont('helvetica', 'normal')
    pdf.setTextColor(150, 150, 150)
    pdf.text(`Generated: ${new Date().toLocaleDateString('en-SG')} ${new Date().toLocaleTimeString('en-SG')}`, 
             pdfWidth - 15, 25, { align: 'right' })
    
    // Reset text color
    pdf.setTextColor(0, 0, 0)
    yPosition = 45
    
    // Client Information Section (if provided)
    if (clientInfo?.name) {
      yPosition += 10
      
      // Simple client name text without box
      pdf.setFontSize(11)
      pdf.setFont('helvetica', 'bold')
      pdf.setTextColor(45, 45, 45)
      pdf.text(`Specially Prepared for: ${clientInfo.name}`, 20, yPosition)
      
      yPosition += 15
    }
    
    // Skip salesperson information section
    
    // Client name functionality removed
    
    // Input Parameters Section
    pdf.setFontSize(14)
    pdf.setFont('helvetica', 'bold')
    pdf.setTextColor(66, 45, 42) // Dark brown text
    pdf.text('📊 Input Parameters', 15, yPosition)
    yPosition += 10
    
    pdf.setFontSize(10)
    pdf.setFont('helvetica', 'normal')
    
    if (inputs) {
      Object.entries(inputs).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== '') {
          const label = key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())
          const displayValue = typeof value === 'number' ? 
            (key.includes('Rate') || key.includes('Percentage') ? `${value}%` : 
             key.includes('Value') || key.includes('Amount') || key.includes('Income') || key.includes('Salary') ? 
             `S$${value.toLocaleString()}` : value.toString()) : 
            value.toString()
          
          pdf.text(`${label}: ${displayValue}`, 20, yPosition)
          yPosition += 6
        }
      })
    }
    
    yPosition += 10
    
    // Results Section
    pdf.setFontSize(14)
    pdf.setFont('helvetica', 'bold')
    pdf.setTextColor(66, 45, 42) // Dark brown text
    pdf.text('📈 Calculation Results', 15, yPosition)
    yPosition += 10
    
    pdf.setFontSize(10)
    pdf.setFont('helvetica', 'normal')
    
    if (calculation) {
      Object.entries(calculation).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== '') {
          const label = key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())
          let displayValue = value
          
          if (typeof value === 'number') {
            if (key.includes('Rate') || key.includes('Percentage') || key.includes('ROI')) {
              displayValue = `${value.toFixed(2)}%`
            } else if (key.includes('Value') || key.includes('Amount') || key.includes('Payment') || 
                      key.includes('Interest') || key.includes('Tax') || key.includes('Duty')) {
              displayValue = `S$${value.toLocaleString()}`
            } else {
              displayValue = value.toString()
            }
          }
          
          pdf.text(`${label}: ${displayValue}`, 20, yPosition)
          yPosition += 6
          
          // Check if we need a new page
          if (yPosition > pdfHeight - 20) {
            pdf.addPage()
            yPosition = 20
          }
        }
      })
    }
    
    // Integrated Footer with Disclaimer
    createIntegratedFooter(pdf, pdfWidth, pdfHeight, userInfo)
    
    // Get PDF bytes for compression
    const pdfBytes = pdf.output('arraybuffer')
    
    // Compress the PDF
    const compressedBytes = await compressPDF(pdfBytes)
    
    // Create blob and download
    const filename = `${moduleName.replace(/\s+/g, '_')}_Calculation_${new Date().toISOString().split('T')[0]}.pdf`
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
    console.error('Calculation PDF export error:', error)
    throw new Error('Failed to generate calculation PDF: ' + error.message)
  }
}

// Export comprehensive summary report
export const exportSummaryPDF = async (summaryData) => {
  try {
    const pdf = new jsPDF({
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
    const clientInfo = clientName ? { name: clientName } : null
    
    let yPosition = 20
    
    // Professional Header with Singapore colors
    pdf.setFillColor(188, 158, 123) // Default brown color
    pdf.rect(0, 0, pdfWidth, 25, 'F')
    
    // Singapore flag accent
    pdf.setFillColor(255, 0, 0) // Red
    pdf.rect(0, 0, pdfWidth, 2, 'F')
    pdf.setFillColor(255, 255, 255) // White
    pdf.rect(0, 2, pdfWidth, 2, 'F')
    
    // Main title
    pdf.setFontSize(20)
    pdf.setFont('helvetica', 'bold')
    pdf.setTextColor(255, 255, 255)
    pdf.text('🇸🇬 Singapore Financial Calculator', pdfWidth / 2, 12, { align: 'center' })
    
    pdf.setFontSize(12)
    pdf.setFont('helvetica', 'normal')
    pdf.text('Comprehensive financial planning tools for Singapore residents', pdfWidth / 2, 18, { align: 'center' })
    
    pdf.setFontSize(16)
    pdf.setFont('helvetica', 'bold')
    pdf.text('Comprehensive Financial Summary Report', pdfWidth / 2, 24, { align: 'center' })
    
    // Reset text color
    pdf.setTextColor(0, 0, 0)
    yPosition = 35
    
    // Skip salesperson information section
    
    // Client name functionality removed
    
    // Financial Health Score
    if (summaryData.financialHealth) {
      pdf.setFontSize(16)
      pdf.setFont('helvetica', 'bold')
      pdf.text('Financial Health Score', 15, yPosition)
      yPosition += 10
      
      pdf.setFontSize(12)
      pdf.setFont('helvetica', 'normal')
      pdf.text(`Overall Rating: ${summaryData.financialHealth.overall}`, 20, yPosition)
      yPosition += 6
      pdf.text(`Score: ${summaryData.financialHealth.score}/100`, 20, yPosition)
      yPosition += 10
      
      // Health factors
      if (summaryData.financialHealth.factors) {
        pdf.setFontSize(10)
        summaryData.financialHealth.factors.forEach(factor => {
          pdf.text(`• ${factor.factor}: ${factor.status}`, 25, yPosition)
          yPosition += 5
        })
        yPosition += 5
      }
    }
    
    // Monthly Commitments
    if (summaryData.monthlyCommitments && summaryData.monthlyCommitments.total > 0) {
      pdf.setFontSize(14)
      pdf.setFont('helvetica', 'bold')
      pdf.text('Monthly Commitments', 15, yPosition)
      yPosition += 8
      
      pdf.setFontSize(10)
      pdf.setFont('helvetica', 'normal')
      Object.entries(summaryData.monthlyCommitments).forEach(([key, amount]) => {
        if (key !== 'total' && amount > 0) {
          const label = key.charAt(0).toUpperCase() + key.slice(1)
          pdf.text(`${label}: S$${amount.toLocaleString()}`, 20, yPosition)
          yPosition += 5
        }
      })
      pdf.setFont('helvetica', 'bold')
      pdf.text(`Total Monthly Commitments: S$${summaryData.monthlyCommitments.total.toLocaleString()}`, 20, yPosition)
      yPosition += 10
    }
    
    // Annual Obligations
    if (summaryData.annualObligations && summaryData.annualObligations.total > 0) {
      pdf.setFontSize(14)
      pdf.setFont('helvetica', 'bold')
      pdf.text('Annual Obligations', 15, yPosition)
      yPosition += 8
      
      pdf.setFontSize(10)
      pdf.setFont('helvetica', 'normal')
      Object.entries(summaryData.annualObligations).forEach(([key, amount]) => {
        if (key !== 'total' && amount > 0) {
          const label = key.charAt(0).toUpperCase() + key.slice(1)
          pdf.text(`${label}: S$${amount.toLocaleString()}`, 20, yPosition)
          yPosition += 5
        }
      })
      pdf.setFont('helvetica', 'bold')
      pdf.text(`Total Annual Obligations: S$${summaryData.annualObligations.total.toLocaleString()}`, 20, yPosition)
      yPosition += 10
    }
    
    // Property Summary
    if (summaryData.propertyCalculations && Object.keys(summaryData.propertyCalculations).length > 0) {
      pdf.setFontSize(14)
      pdf.setFont('helvetica', 'bold')
      pdf.text('Property Summary', 15, yPosition)
      yPosition += 8
      
      pdf.setFontSize(10)
      pdf.setFont('helvetica', 'normal')
      Object.entries(summaryData.propertyCalculations).forEach(([key, value]) => {
        const label = key.charAt(0).toUpperCase() + key.slice(1)
        if (typeof value === 'object' && value.monthlyEMI) {
          pdf.text(`${label} - Monthly EMI: S$${value.monthlyEMI.toLocaleString()}`, 20, yPosition)
        } else if (typeof value === 'object' && value.percentage) {
          pdf.text(`${label} - TDSR: ${value.percentage.toFixed(2)}%`, 20, yPosition)
        } else {
          pdf.text(`${label}: S$${value.toLocaleString()}`, 20, yPosition)
        }
        yPosition += 5
      })
      yPosition += 5
    }
    
    // Investment Summary
    if (summaryData.investmentCalculations) {
      pdf.setFontSize(14)
      pdf.setFont('helvetica', 'bold')
      pdf.text('Investment Summary', 15, yPosition)
      yPosition += 8
      
      pdf.setFontSize(10)
      pdf.setFont('helvetica', 'normal')
      pdf.text(`Total Investment Value: S$${summaryData.investmentCalculations.totalValue.toLocaleString()}`, 20, yPosition)
      yPosition += 5
      pdf.text(`Total Gains: S$${summaryData.investmentCalculations.totalGains.toLocaleString()}`, 20, yPosition)
      yPosition += 5
      pdf.text(`ROI: ${summaryData.investmentCalculations.roi.toFixed(2)}%`, 20, yPosition)
      yPosition += 10
    }
    
    // Recommendations
    if (summaryData.recommendations && summaryData.recommendations.length > 0) {
      pdf.setFontSize(14)
      pdf.setFont('helvetica', 'bold')
      pdf.text('Recommendations', 15, yPosition)
      yPosition += 8
      
      pdf.setFontSize(10)
      pdf.setFont('helvetica', 'normal')
      summaryData.recommendations.forEach(rec => {
        pdf.setFont('helvetica', 'bold')
        pdf.text(`${rec.title} (${rec.priority})`, 20, yPosition)
        yPosition += 5
        pdf.setFont('helvetica', 'normal')
        pdf.text(rec.message, 25, yPosition)
        yPosition += 8
      })
    }
    
    // Integrated Footer with Disclaimer
    createIntegratedFooter(pdf, pdfWidth, pdfHeight, userInfo)
    
    // Get PDF bytes for compression
    const pdfBytes = pdf.output('arraybuffer')
    
    // Compress the PDF
    const compressedBytes = await compressPDF(pdfBytes)
    
    // Create blob and download
    const filename = `Summary_Report_Powered_by_Team_Mindlink_${new Date().toISOString().split('T')[0]}.pdf`
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
    console.error('Summary PDF export error:', error)
    throw new Error('Failed to generate summary PDF: ' + error.message)
  }
}

// Helper function to format currency for display
export const formatCurrencyForPDF = (amount) => {
  return `S$${amount.toLocaleString()}`
}

// Helper function to format percentage for display
export const formatPercentageForPDF = (percentage) => {
  return `${percentage.toFixed(2)}%`
}
