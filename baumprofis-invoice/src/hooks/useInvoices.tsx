import { useState, useEffect, useMemo } from 'react'
import { useAuth } from './useAuth'
import { db } from '../lib/firebase'
import { collection, getDocs, query, where } from 'firebase/firestore'

export interface InvoiceData {
  id?: string
  userId: string
  customerId?: string
  invoiceNumber: string
  status: 'draft' | 'finalized' | 'paid'
  date: string
  object: string
  customerName: string
  customerAddress: string
  lines: InvoiceLine[]
  subtotal: number
  vatAmount: number
  totalAmount: number
  dueDate: string
  createdAt: string
  updatedAt: string
  finalizedAt?: string
  paidAt?: string
}

export interface InvoiceLine {
  id: string
  description: string
  unitPrice: number
  quantity: number
  unit: 'Stunden' | 'Stück' | 'pauschal'
  total: number
}

export const useInvoices = () => {
  const { user } = useAuth()
  const [invoices, setInvoices] = useState<InvoiceData[]>([])
  const [loading, setLoading] = useState(false)
  const [selectedInvoice, setSelectedInvoice] = useState<InvoiceData | null>(null)
  const [hasMore, setHasMore] = useState(true)

  // Search filters
  const [filters, setFilters] = useState({
    status: '' as '' | 'draft' | 'finalized' | 'paid',
    customerName: '',
    dateFrom: '',
    dateTo: '',
    invoiceNumber: ''
  })

  // Load invoices from Firestore
  const loadInvoices = async (loadMore = false) => {
    if (!user) return

    setLoading(true)
    try {
      // For now, load ALL invoices for this user and filter client-side
      // This avoids the composite index requirement
      // TODO: Optimize with proper indexes in production
      if (!loadMore) {
        setInvoices([])
      }

      const q = query(collection(db, 'invoices'), where('userId', '==', user.uid))
      const snapshot = await getDocs(q)

      const invoiceData: InvoiceData[] = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as InvoiceData[]

      if (loadMore) {
        setInvoices(prev => [...prev, ...invoiceData])
      } else {
        setInvoices(invoiceData)
      }

      setHasMore(snapshot.docs.length >= 25)
    } catch (error) {
      console.error('Error loading invoices:', error)
    } finally {
      setLoading(false)
    }
  }

  // Filtered and searched invoices (client-side filtering)
  const filteredInvoices = useMemo(() => {
    return invoices.filter(invoice => {
      if (filters.customerName && !invoice.customerName.toLowerCase().includes(filters.customerName.toLowerCase())) {
        return false
      }
      if (filters.invoiceNumber && !invoice.invoiceNumber.toLowerCase().includes(filters.invoiceNumber.toLowerCase())) {
        return false
      }
      if (filters.dateFrom && invoice.date < filters.dateFrom) {
        return false
      }
      if (filters.dateTo && invoice.date > filters.dateTo) {
        return false
      }
      return true
    })
  }, [invoices, filters])

  // Get invoice by ID
  const getInvoiceById = async (id: string): Promise<InvoiceData | null> => {
    try {
      // Since we might not have all invoices loaded, query directly
      const invoice = invoices.find(inv => inv.id === id)
      if (invoice) return invoice

      // If not found, could implement direct query here
      return null
    } catch (error) {
      console.error('Error getting invoice:', error)
      return null
    }
  }

  // Get invoice statistics
  const getStats = () => {
    const total = filteredInvoices.length
    const draft = filteredInvoices.filter(inv => inv.status === 'draft').length
    const finalized = filteredInvoices.filter(inv => inv.status === 'finalized').length
    const paid = filteredInvoices.filter(inv => inv.status === 'paid').length
    const totalRevenue = filteredInvoices.reduce((sum, inv) => sum + inv.totalAmount, 0)

    return { total, draft, finalized, paid, totalRevenue }
  }

  // Reset filters
  const resetFilters = () => {
    setFilters({
      status: '',
      customerName: '',
      dateFrom: '',
      dateTo: '',
      invoiceNumber: ''
    })
  }

  useEffect(() => {
    loadInvoices()
  }, [user])

  // Reload when filters change
  useEffect(() => {
    if (user) {
      loadInvoices()
    }
  }, [filters.status])

  return {
    invoices: filteredInvoices,
    allInvoices: invoices,
    loading,
    selectedInvoice,
    hasMore,
    filters,
    stats: getStats(),
    loadInvoices: () => loadInvoices(false),
    loadMoreInvoices: () => loadInvoices(true),
    getInvoiceById,
    setSelectedInvoice,
    updateFilters: (newFilters: Partial<typeof filters>) => {
      setFilters(prev => ({ ...prev, ...newFilters }))
    },
    resetFilters
  }
}
