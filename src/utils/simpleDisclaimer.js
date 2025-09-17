// Simple Disclaimer Utility - Integrated with footer

export const getSimpleDisclaimer = () => {
  return {
    title: "PROFESSIONAL DISCLAIMER",
    content: [
      "This report is prepared by a licensed property salesperson for informational purposes only.",
      "All calculations are based on current Singapore regulations and should be verified with relevant authorities.",
      "This report does not constitute financial advice and clients should consult qualified professionals.",
      "Team Mindlink and the salesperson disclaim all liability for any losses arising from the use of this report."
    ]
  }
}

// Create integrated footer with disclaimer
export const createIntegratedFooter = (pdf, pdfWidth, pdfHeight, userInfo) => {
  // Debug logging
  console.log('🔍 Footer Debug - userInfo:', userInfo)
  
  // Simple footer without background box
  let yPosition = pdfHeight - 60
  
  // Disclaimer title
  pdf.setFontSize(8)
  pdf.setFont('helvetica', 'bold')
  pdf.setTextColor(45, 45, 45)
  pdf.text('PROFESSIONAL DISCLAIMER', 15, yPosition)
  yPosition += 6
  
  // Disclaimer content with user info
  pdf.setFont('helvetica', 'normal')
  pdf.setTextColor(100, 100, 100)
  pdf.setFontSize(6)
  
  // First bullet point with user info
  let userText = "This report is prepared by a licensed property salesperson"
  if (userInfo?.name) {
    userText += ` ${userInfo.name}`
  }
  if (userInfo?.ceaNumber) {
    userText += ` (CEA: ${userInfo.ceaNumber})`
  }
  if (userInfo?.mobile) {
    userText += `, Contact: ${userInfo.mobile}`
  }
  if (userInfo?.email) {
    userText += `, Email: ${userInfo.email}`
  }
  userText += " for informational purposes only."
  
  // Debug logging
  console.log('🔍 Footer Debug - userText:', userText)
  
  const disclaimerLines = [
    userText,
    "All calculations are estimates and should be verified with relevant authorities.",
    "Team Mindlink and the salesperson disclaim all liability for any losses."
  ]
  
  disclaimerLines.forEach(line => {
    const lines = pdf.splitTextToSize(`• ${line}`, pdfWidth - 30)
    lines.forEach(textLine => {
      pdf.text(textLine, 20, yPosition)
      yPosition += 3
    })
    yPosition += 1
  })
  
  // Powered by section
  yPosition += 3
  pdf.setFontSize(6)
  pdf.setFont('helvetica', 'normal')
  pdf.setTextColor(120, 120, 120)
  pdf.text('Powered by Team Mindlink | Courtesy of #thepeoplesagency', pdfWidth / 2, yPosition, { align: 'center' })
  
  return yPosition
}
