import { useState, useCallback } from 'react'
import jsPDF from 'jspdf'
import html2canvas from 'html2canvas'

interface InvoiceData {
  id?: string
  customerId?: string
  invoiceNumber: string
  status: 'draft' | 'finalized' | 'paid'
  date: string
  object: string
  customerName: string
  customerAddress: string
  customerStreet: string
  customerZipCode: string
  customerCity: string
  lines: any[]
  subtotal: number
  vatAmount: number
  totalAmount: number
  dueDate: string
}

export const usePDFGenerator = () => {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const generatePDF = useCallback(async (invoiceData: InvoiceData): Promise<boolean> => {
    setLoading(true)
    setError(null)

    try {
      // Find the template element
      const element = document.getElementById('invoice-pdf-template')
      if (!element) {
        throw new Error('PDF template element not found. Please ensure the invoice is properly rendered.')
      }

      // Make element temporarily visible for html2canvas
      const originalVisibility = element.style.visibility
      const originalPosition = element.style.position
      const originalLeft = element.style.left
      const originalTop = element.style.top
      const originalWidth = element.style.width

      element.style.visibility = 'visible'
      element.style.position = 'absolute'
      element.style.left = '-9999px'
      element.style.top = '0'
      element.style.width = '794px' // Standard A4 width for consistent rendering

      // Wait for rendering and fonts to load
      await new Promise(resolve => setTimeout(resolve, 200))

      try {
        // Configure html2canvas options for high-quality rendering
        const canvas = await html2canvas(element, {
          scale: 2,
          useCORS: true,
          allowTaint: true,
          backgroundColor: '#ffffff',
          logging: false, // Disable logging in production
          width: 794, // A4 width in pixels at 96 DPI
          height: element.scrollHeight,
          scrollX: 0,
          scrollY: 0,
          imageTimeout: 0, // No timeout for images
          removeContainer: true
        })

        // Calculate PDF dimensions (A4: 210mm x 297mm)
        const imgWidth = 210 // mm
        const imgHeight = (canvas.height * imgWidth) / canvas.width

        // Create new PDF
        const pdf = new jsPDF('p', 'mm', 'a4')

        // Convert canvas to image and add to PDF
        const imgData = canvas.toDataURL('image/png', 1.0)

        // Handle content fitting on page(s)
        if (imgHeight <= 297) {
          pdf.addImage(imgData, 'PNG', 0, 0, imgWidth, imgHeight)
        } else {
          // Handle multiple pages for long invoices
          let heightLeft = imgHeight
          let position = 0

          while (heightLeft > 0) {
            if (position > 0) {
              pdf.addPage()
            }

            const pageHeight = Math.min(297, heightLeft)
            const y = 297 - pageHeight

            pdf.addImage(imgData, 'PNG', 0, y, imgWidth, pageHeight, undefined, 'FAST')

            heightLeft -= 297
            position++
          }
        }

        // Generate filename with German formatting
        const filename = `Rechnung_${invoiceData.invoiceNumber.replace(/[\/]/g, '-')}_${new Date().toISOString().split('T')[0]}.pdf`

        // Download the PDF
        pdf.save(filename)

        return true
      } catch (renderError) {
        throw new Error(`PDF rendering failed: ${renderError instanceof Error ? renderError.message : 'Unknown rendering error'}`)
      } finally {
        // Restore original styling
        element.style.visibility = originalVisibility
        element.style.position = originalPosition
        element.style.left = originalLeft
        element.style.top = originalTop
        element.style.width = originalWidth
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'PDF generation failed'
      setError(errorMessage)
      return false
    } finally {
      setLoading(false)
    }
  }, [])


  const previewPDF = async (): Promise<string | null> => {
    setLoading(true)
    setError(null)

    try {
      const element = document.getElementById('invoice-pdf-template')
      if (!element) {
        throw new Error('PDF template element not found')
      }

      const canvas = await html2canvas(element, {
        scale: 2,
        useCORS: true,
        allowTaint: true,
        backgroundColor: '#ffffff',
        logging: false,
        width: element.scrollWidth,
        height: element.scrollHeight
      })

      const pdf = new jsPDF('p', 'mm', 'a4')
      const imgWidth = 210
      const imgHeight = (canvas.height * imgWidth) / canvas.width
      const imgData = canvas.toDataURL('image/png', 1.0)

      pdf.addImage(imgData, 'PNG', 0, 0, imgWidth, imgHeight)

      // Return base64 string for preview (could be used to show in browser)
      return pdf.output('datauristring')
    } catch (err) {
      console.error('PDF preview error:', err)
      setError(err instanceof Error ? err.message : 'PDF preview failed')
      return null
    } finally {
      setLoading(false)
    }
  }

  return {
    generatePDF,
    previewPDF,
    loading,
    error
  }
}

export default usePDFGenerator
