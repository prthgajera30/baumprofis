import { describe, it, expect, vi } from 'vitest'
import { renderHook, act } from '@testing-library/react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import React from 'react'
import { useInvoiceData } from './useInvoiceData'

// Mock date-fns to return consistent dates
vi.mock('date-fns', () => ({
  format: vi.fn(() => '25.12.2025'),
}))

describe('useInvoiceData hook', () => {
  const createWrapper = () => {
    const queryClient = new QueryClient({
      defaultOptions: {
        queries: { retry: false },
      },
    })

    return ({ children }: { children: React.ReactNode }) => (
      <QueryClientProvider client={queryClient}>
        {children}
      </QueryClientProvider>
    )
  }

  it('should initialize with default invoice data', () => {
    const { result } = renderHook(() => useInvoiceData(), {
      wrapper: createWrapper()
    })

    expect(result.current.invoiceData).toEqual({
      id: expect.stringContaining('temp_'),
      invoiceNumber: '04138-25',
      status: 'draft',
      date: '25.12.2025',
      object: 'Baumarbeiten',
      customerName: '',
      customerAddress: '',
      customerStreet: '',
      customerZipCode: '',
      customerCity: '',
      lines: expect.arrayContaining([
        expect.objectContaining({
          id: '1',
          description: 'Baumpflegearbeiten',
          unitPrice: 150,
          quantity: 1,
          unit: 'pauschal',
          total: 150,
        }),
      ]),
      subtotal: 150,
      vatAmount: 28.5,
      totalAmount: 178.5,
      dueDate: '25.12.2025',
    })

    expect(result.current.saving).toBe(false)
    expect(result.current.pdfDownloading).toBe(false)
  })

  it('should allow updating invoice fields', () => {
    const { result } = renderHook(() => useInvoiceData(), {
      wrapper: createWrapper()
    })

    expect(result.current.invoiceData.customerName).toBe('')

    act(() => {
      result.current.updateInvoiceField('customerName', 'John Doe')
    })

    expect(result.current.invoiceData.customerName).toBe('John Doe')
  })

  it('should allow setting saving state', () => {
    const { result } = renderHook(() => useInvoiceData(), {
      wrapper: createWrapper()
    })

    expect(result.current.saving).toBe(false)

    act(() => {
      result.current.setSaving(true)
    })

    expect(result.current.saving).toBe(true)
  })

  it('should allow setting pdf downloading state', () => {
    const { result } = renderHook(() => useInvoiceData(), {
      wrapper: createWrapper()
    })

    expect(result.current.pdfDownloading).toBe(false)

    act(() => {
      result.current.setPdfDownloading(true)
    })

    expect(result.current.pdfDownloading).toBe(true)
  })

  it('should allow updating entire invoice data', () => {
    const { result } = renderHook(() => useInvoiceData(), {
      wrapper: createWrapper()
    })

    const newInvoiceData = {
      ...result.current.invoiceData,
      customerName: 'Jane Doe',
      customerAddress: 'New Address',
    }

    act(() => {
      result.current.setInvoiceData(newInvoiceData)
    })

    expect(result.current.invoiceData.customerName).toBe('Jane Doe')
    expect(result.current.invoiceData.customerAddress).toBe('New Address')
  })
})
