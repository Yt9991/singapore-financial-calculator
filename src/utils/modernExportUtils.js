import jsPDF from 'jspdf'
import html2canvas from 'html2canvas'
import { PDFDocument } from 'pdf-lib'
import { createIntegratedFooter } from './simpleDisclaimer'

// Modern PDF Export Utility with Professional Design
export const exportModernCalculationPDF = async (moduleId, moduleName, calculation, inputs, clientName = '') => {
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
    
    // Modern Professional Header
    createModernHeader(pdf, pdfWidth, moduleName)
    
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
    
    // Input Parameters Section
    yPosition += 10
    yPosition = createSectionHeader(pdf, pdfWidth, yPosition, 'INPUT PARAMETERS')
    yPosition += 5
    
    if (inputs) {
      yPosition = createDataTable(pdf, pdfWidth, yPosition, inputs, 'input')
    }
    
    // Results Section
    yPosition += 10
    yPosition = createSectionHeader(pdf, pdfWidth, yPosition, 'CALCULATION RESULTS')
    yPosition += 5
    
    if (calculation) {
      yPosition = createDataTable(pdf, pdfWidth, yPosition, calculation, 'result')
    }
    
    // Integrated Footer with Disclaimer
    createIntegratedFooter(pdf, pdfWidth, pdfHeight, userInfo)
    
    // Compress and download
    const pdfBytes = pdf.output('arraybuffer')
    const compressedBytes = await compressPDF(pdfBytes)
    
    const filename = `${moduleName.replace(/\s+/g, '_')}_Report_${new Date().toISOString().split('T')[0]}.pdf`
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
    console.error('Modern PDF export error:', error)
    throw new Error('Failed to generate modern PDF: ' + error.message)
  }
}

// Create modern header with professional design
const createModernHeader = (pdf, pdfWidth, moduleName) => {
  // Main header background with gradient effect
  pdf.setFillColor(45, 45, 45)
  pdf.rect(0, 0, pdfWidth, 35, 'F')
  
  // Accent stripe
  pdf.setFillColor(188, 158, 123)
  pdf.rect(0, 0, pdfWidth, 4, 'F')
  
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
  pdf.text(`${moduleName.toUpperCase()} REPORT`, pdfWidth - 15, 20, { align: 'right' })
  
  // Date and time
  pdf.setFontSize(8)
  pdf.setFont('helvetica', 'normal')
  pdf.setTextColor(150, 150, 150)
  pdf.text(`Generated: ${new Date().toLocaleDateString('en-SG')} ${new Date().toLocaleTimeString('en-SG')}`, 
           pdfWidth - 15, 25, { align: 'right' })
}

// Create modern info card
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

// Create section header with divider
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

// Create modern data table
const createDataTable = (pdf, pdfWidth, yPosition, data, type) => {
  pdf.setFontSize(10)
  pdf.setFont('helvetica', 'normal')
  
  const entries = Object.entries(data).filter(([key, value]) => 
    value !== undefined && value !== null && value !== ''
  )
  
  entries.forEach(([key, value], index) => {
    const label = key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())
    const displayValue = formatValueForDisplay(key, value, type)
    
    // Alternate row colors
    if (index % 2 === 0) {
      pdf.setFillColor(248, 248, 248)
      pdf.rect(15, yPosition - 3, pdfWidth - 30, 10, 'F')
    }
    
    // Label
    pdf.setTextColor(45, 45, 45)
    pdf.setFont('helvetica', 'bold')
    pdf.text(`${label}:`, 20, yPosition)
    
    // Value (positioned to the right of the label with proper spacing)
    pdf.setTextColor(100, 100, 100)
    pdf.setFont('helvetica', 'normal')
    const labelWidth = pdf.getTextWidth(`${label}:`)
    const valueX = 20 + labelWidth + 8
    const maxValueWidth = pdfWidth - valueX - 20
    
    // Check if value is too long and needs wrapping
    const valueWidth = pdf.getTextWidth(displayValue)
    if (valueWidth > maxValueWidth) {
      // Split long values into multiple lines
      const lines = pdf.splitTextToSize(displayValue, maxValueWidth)
      lines.forEach((line, lineIndex) => {
        pdf.text(line, valueX, yPosition + (lineIndex * 4))
      })
      yPosition += (lines.length - 1) * 4
    } else {
      pdf.text(displayValue, valueX, yPosition)
    }
    
    yPosition += 10
    
    // Check if we need a new page
    if (yPosition > 250) {
      pdf.addPage()
      yPosition = 20
    }
  })
  
  return yPosition
}

// Format values for display
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

// Create modern footer
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
  pdf.text('SINGAPORE FINANCIAL CALCULATOR - PROFESSIONAL REPORT', pdfWidth / 2, pdfHeight - 20, { align: 'center' })
  
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

// PDF Compression Utility
const compressPDF = async (pdfBytes) => {
  try {
    const pdfDoc = await PDFDocument.load(pdfBytes)
    
    // Set metadata
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
    return pdfBytes
  }
}

// Get user and client info from localStorage
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
    console.log('🔍 getUserInfo - raw localStorage:', savedInfo)
    const parsed = savedInfo ? JSON.parse(savedInfo) : null
    console.log('🔍 getUserInfo - parsed:', parsed)
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
