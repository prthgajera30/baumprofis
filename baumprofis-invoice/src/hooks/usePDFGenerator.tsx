import { useState, useCallback } from 'react'
import { pdf } from '@react-pdf/renderer'
import InvoicePDFTemplate from '../components/Invoice/InvoicePDFTemplate'

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
      // Create the PDF document
      const doc = <InvoicePDFTemplate invoice={invoiceData} />

      // Generate PDF blob
      const blob = await pdf(doc).toBlob()

      // Generate filename
      const filename = `Rechnung_${invoiceData.invoiceNumber.replace(/[\/]/g, '-')}_${new Date().toISOString().split('T')[0]}.pdf`

      // Create download link and trigger download
      const url = URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = url
      link.download = filename
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      URL.revokeObjectURL(url)

      return true
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'PDF generation failed'
      setError(errorMessage)
      return false
    } finally {
      setLoading(false)
    }
  }, [])


  const previewPDF = useCallback(async (invoiceData: InvoiceData): Promise<string | null> => {
    setLoading(true)
    setError(null)

    try {
      // Create the PDF document
      const doc = <InvoicePDFTemplate invoice={invoiceData} />

      // Generate PDF as base64 data URL
      const dataUrl = await pdf(doc).toBlob().then(blob => {
        return new Promise<string>((resolve) => {
          const reader = new FileReader()
          reader.onload = () => resolve(reader.result as string)
          reader.readAsDataURL(blob)
        })
      })

      return dataUrl
    } catch (err) {
      console.error('PDF preview error:', err)
      setError(err instanceof Error ? err.message : 'PDF preview failed')
      return null
    } finally {
      setLoading(false)
    }
  }, [])

  return {
    generatePDF,
    previewPDF,
    loading,
    error
  }
}

export default usePDFGenerator
