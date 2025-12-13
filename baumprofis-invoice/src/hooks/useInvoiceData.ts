import { useState } from 'react'
import { format } from 'date-fns'

// Invoice data types (shared with components)
export interface InvoiceLine {
  id: string
  description: string
  unitPrice: number
  quantity: number
  unit: 'Stunden' | 'Stück' | 'pauschal'
  total: number
}

export interface InvoiceData {
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
  lines: InvoiceLine[]
  subtotal: number
  vatAmount: number
  totalAmount: number
  dueDate: string
}

// Hook return type
export interface UseInvoiceDataReturn {
  invoiceData: InvoiceData
  setInvoiceData: React.Dispatch<React.SetStateAction<InvoiceData>>
  updateInvoiceField: (field: keyof InvoiceData, value: any) => void
  saving: boolean
  setSaving: React.Dispatch<React.SetStateAction<boolean>>
  pdfDownloading: boolean
  setPdfDownloading: React.Dispatch<React.SetStateAction<boolean>>
}

// Create default invoice data
const createDefaultInvoiceData = (): InvoiceData => ({
  id: `temp_${Date.now()}`, // Temporary ID for validation
  invoiceNumber: '04138-25',
  status: 'draft',
  date: format(new Date(), 'dd.MM.yyyy'),
  object: 'Baumarbeiten',
  customerName: '',
  customerAddress: '',
  customerStreet: '',
  customerZipCode: '',
  customerCity: '',
  lines: [{
    id: '1',
    description: 'Baumpflegearbeiten',
    unitPrice: 150.00,
    quantity: 1,
    unit: 'pauschal',
    total: 150.00
  }],
  subtotal: 150.00,
  vatAmount: 28.50,
  totalAmount: 178.50,
  dueDate: format(new Date(Date.now() + 10 * 24 * 60 * 60 * 1000), 'dd.MM.yyyy')
})

export const useInvoiceData = (): UseInvoiceDataReturn => {
  const [invoiceData, setInvoiceData] = useState<InvoiceData>(createDefaultInvoiceData)
  const [saving, setSaving] = useState(false)
  const [pdfDownloading, setPdfDownloading] = useState(false)

  // Utility function to update a specific field
  const updateInvoiceField = (field: keyof InvoiceData, value: any) => {
    setInvoiceData(prev => ({ ...prev, [field]: value }))
  }

  return {
    invoiceData,
    setInvoiceData,
    updateInvoiceField,
    saving,
    setSaving,
    pdfDownloading,
    setPdfDownloading,
  }
}
