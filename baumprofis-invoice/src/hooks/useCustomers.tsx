import { useState, useEffect, useMemo } from 'react'
import { useAuth } from './useAuth'
import { db } from '../lib/firebase'
import { collection, addDoc, getDocs, doc, updateDoc, deleteDoc, query, where, orderBy, Timestamp } from 'firebase/firestore'

export interface Customer {
  id?: string
  userId: string
  name: string
  email?: string
  phone?: string
  address: string
  createdAt: string
  updatedAt: string
  invoiceCount?: number
  totalInvoices?: number
}

export const useCustomers = () => {
  const { user } = useAuth()
  const [customers, setCustomers] = useState<Customer[]>([])
  const [loading, setLoading] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')

  // Load customers from Firestore
  const loadCustomers = async () => {
    if (!user) return

    setLoading(true)
    try {
      const q = query(
        collection(db, 'customers'),
        where('userId', '==', user.uid),
        orderBy('createdAt', 'desc')
      )
      const snapshot = await getDocs(q)
      const customerData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Customer[]
      setCustomers(customerData)
    } catch (error) {
      console.error('Error loading customers:', error)
    } finally {
      setLoading(false)
    }
  }

  // Search customers by name or address
  const searchCustomers = (term: string) => {
    setSearchTerm(term.toLowerCase())
  }

  // Filtered customers based on search
  const filteredCustomers = useMemo(() => {
    if (!searchTerm) return customers
    return customers.filter(customer =>
      customer.name.toLowerCase().includes(searchTerm) ||
      customer.address.toLowerCase().includes(searchTerm) ||
      (customer.email && customer.email.toLowerCase().includes(searchTerm))
    )
  }, [customers, searchTerm])

  // Create new customer
  const createCustomer = async (customerData: Omit<Customer, 'id' | 'userId' | 'createdAt' | 'updatedAt'>) => {
    if (!user) throw new Error('User not authenticated')

    try {
      const now = new Date().toISOString()
      const dataToSave = {
        ...customerData,
        userId: user.uid,
        createdAt: now,
        updatedAt: now
      }

      const docRef = await addDoc(collection(db, 'customers'), dataToSave)
      const newCustomer: Customer = {
        id: docRef.id,
        ...dataToSave
      }

      setCustomers(prev => [newCustomer, ...prev])
      return newCustomer
    } catch (error) {
      console.error('Error creating customer:', error)
      throw error
    }
  }

  // Update customer
  const updateCustomer = async (id: string, updates: Partial<Customer>) => {
    try {
      const dataToUpdate = {
        ...updates,
        updatedAt: new Date().toISOString()
      }
      await updateDoc(doc(db, 'customers', id), dataToUpdate)

      setCustomers(prev => prev.map(customer =>
        customer.id === id ? { ...customer, ...dataToUpdate } : customer
      ))
    } catch (error) {
      console.error('Error updating customer:', error)
      throw error
    }
  }

  // Delete customer
  const deleteCustomer = async (id: string) => {
    try {
      await deleteDoc(doc(db, 'customers', id))
      setCustomers(prev => prev.filter(customer => customer.id !== id))
    } catch (error) {
      console.error('Error deleting customer:', error)
      throw error
    }
  }

  // Get customer by ID
  const getCustomerById = (id: string): Customer | undefined => {
    return customers.find(customer => customer.id === id)
  }

  // Get customers with invoice history
  const getCustomersWithStats = async () => {
    if (!user) return customers

    try {
      // This would be enhanced to include invoice counts/totals
      // For now, just return customers as-is
      // TODO: Add aggregation query for invoice stats
      return customers.map(customer => ({
        ...customer,
        invoiceCount: customer.invoiceCount || 0,
        totalInvoices: customer.totalInvoices || 0
      }))
    } catch (error) {
      console.error('Error getting customer stats:', error)
      return customers
    }
  }

  useEffect(() => {
    loadCustomers()
  }, [user])

  return {
    customers: filteredCustomers,
    allCustomers: customers,
    loading,
    searchTerm,
    loadCustomers,
    searchCustomers,
    createCustomer,
    updateCustomer,
    deleteCustomer,
    getCustomerById,
    getCustomersWithStats
  }
}
