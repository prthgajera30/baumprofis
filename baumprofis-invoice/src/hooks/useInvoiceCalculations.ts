import { useEffect, useMemo, useCallback } from 'react'
import type { InvoiceLine } from './useInvoiceData'

// Hook return type
export interface UseInvoiceCalculationsReturn {
  calculatedTotals: {
    subtotal: number
    vatAmount: number
    totalAmount: number
  }
  calculateLineTotal: (unitPrice: number, quantity: number) => number
  updateLineTotal: (lineId: string, lines: InvoiceLine[]) => InvoiceLine[]
}

// VAT rate (German standard: 19%)
const VAT_RATE = 0.19

export const useInvoiceCalculations = (
  lines: InvoiceLine[],
  onTotalsChange?: (totals: { subtotal: number; vatAmount: number; totalAmount: number }) => void
): UseInvoiceCalculationsReturn => {

  // Calculate totals whenever lines change - optimized with useMemo for performance
  const calculatedTotals = useMemo(() => {
    console.time('calculateTotals') // Performance monitoring (dev only)
    const subtotal = lines.reduce((sum, line) => sum + line.total, 0)
    const vatAmount = subtotal * VAT_RATE
    const totalAmount = subtotal + vatAmount
    console.timeEnd('calculateTotals') // Performance monitoring (dev only)

    return { subtotal, vatAmount, totalAmount }
  }, [lines])

  // Notify parent of totals changes - only when totals actually change
  useEffect(() => {
    onTotalsChange?.(calculatedTotals)
  }, [calculatedTotals, onTotalsChange])

  // Calculate single line total - memoized for performance
  const calculateLineTotal = useCallback((unitPrice: number, quantity: number): number => {
    // Ensure precise calculations
    return Math.round((unitPrice * quantity) * 100) / 100 // Round to 2 decimal places
  }, [])

  // Update line total and return updated lines array - memoized for performance
  const updateLineTotal = useCallback((lineId: string, lines: InvoiceLine[]): InvoiceLine[] => {
    return lines.map(line => {
      if (line.id === lineId) {
        const newTotal = calculateLineTotal(line.unitPrice, line.quantity)
        // Only update if total actually changed to prevent unnecessary re-renders
        if (Math.abs(line.total - newTotal) > 0.01) {
          return { ...line, total: newTotal }
        }
      }
      return line
    })
  }, [calculateLineTotal])

  return {
    calculatedTotals,
    calculateLineTotal,
    updateLineTotal,
  }
}
