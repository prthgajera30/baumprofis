import { useState, useCallback } from 'react'
import { InvoiceValidationService } from '../services/validationService'
import type { InvoiceData } from './useInvoiceData'

// Hook return type
export interface UseInvoiceValidationReturn {
  validationErrors: Record<string, string>
  lineErrors: Record<string, string>
  validateForSave: (invoiceData: InvoiceData, userId?: string) => Promise<{ isValid: boolean; errors: Record<string, string> }>
  validateForPdf: (invoiceData: InvoiceData, userId?: string) => Promise<{ isValid: boolean; errors: Record<string, string> }>
  clearErrors: () => void
  setValidationErrors: React.Dispatch<React.SetStateAction<Record<string, string>>>
  setLineErrors: React.Dispatch<React.SetStateAction<Record<string, string>>>
}

export const useInvoiceValidation = (_invoiceData: InvoiceData): UseInvoiceValidationReturn => {
  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({})
  const [lineErrors, setLineErrors] = useState<Record<string, string>>({})

  // Validate invoice data for saving (less strict - data integrity + business rules)
  const validateForSave = useCallback(async (
    data: InvoiceData,
    _userId?: string
  ): Promise<{ isValid: boolean; errors: Record<string, string> }> => {
    try {
      // Map InvoiceData to validation service format
      const validationData = {
        invoiceNumber: data.invoiceNumber,
        customerName: data.customerName,
        customerAddress: data.customerAddress,
        customerEmail: undefined,
        customerPhone: undefined,
        lines: data.lines,
        subtotal: data.subtotal,
        vatAmount: data.vatAmount,
        totalAmount: data.totalAmount,
        date: data.date,
        dueDate: data.dueDate,
        object: data.object
      }

      // Run data integrity and business rules validation
      const dataIntegrityResult = InvoiceValidationService.validateDataIntegrity(validationData)
      const businessRulesResult = InvoiceValidationService.validateBusinessRules(validationData)

      // Combine errors
      const combinedErrors = {
        ...dataIntegrityResult.errors,
        ...businessRulesResult.errors
      }

      // Set general validation errors
      setValidationErrors(combinedErrors)

      // Validate individual service lines
      const lineErrorsMap: Record<string, string> = {}
      data.lines.forEach((line) => {
        const lineErrors: string[] = []

        // Validate description
        if (!line.description?.trim()) {
          lineErrors.push('Beschreibung ist erforderlich')
        } else if (line.description.trim().length < 3) {
          lineErrors.push('Beschreibung zu kurz (mind. 3 Zeichen)')
        }

        // Validate quantity
        if (line.quantity <= 0) {
          lineErrors.push('Menge muss größer als 0 sein')
        }

        // Validate unit price
        if (line.unitPrice <= 0) {
          lineErrors.push('Einzelpreis muss größer als 0 sein')
        }

        // Validate total calculation
        const expectedTotal = line.unitPrice * line.quantity
        if (Math.abs(line.total - expectedTotal) > 0.01) {
          lineErrors.push('Gesamtpreis-Berechnung ist falsch')
        }

        // Add line errors if any
        if (lineErrors.length > 0) {
          lineErrorsMap[line.id] = lineErrors.join(' | ')
        }
      })

      // Add general lines error if present
      if (combinedErrors.lines) {
        data.lines.forEach(line => {
          if (!lineErrorsMap[line.id]) {
            lineErrorsMap[line.id] = combinedErrors.lines
          }
        })
      }

      setLineErrors(lineErrorsMap)

      return {
        isValid: Object.keys(combinedErrors).length === 0,
        errors: combinedErrors
      }
    } catch (error: unknown) {
      console.error('Validation error:', error)
      const fallbackErrors: Record<string, string> = {}

      if (error instanceof Error && error.message.includes('invoiceNumber')) {
        fallbackErrors.invoiceNumber = 'Rechnungsnummer bereits vergeben'
      } else if (typeof error === 'string' && error.includes('invoiceNumber')) {
        fallbackErrors.invoiceNumber = 'Rechnungsnummer bereits vergeben'
      }

      setValidationErrors(fallbackErrors)
      return { isValid: false, errors: fallbackErrors }
    }
  }, [])

  // Validate invoice data for PDF generation (more strict)
  const validateForPdf = useCallback(async (
    data: InvoiceData,
    userId?: string
  ): Promise<{ isValid: boolean; errors: Record<string, string> }> => {
    try {
      // Map InvoiceData to validation service format
      const validationData = {
        invoiceNumber: data.invoiceNumber,
        customerName: data.customerName,
        customerAddress: data.customerAddress,
        customerEmail: undefined,
        customerPhone: undefined,
        lines: data.lines,
        subtotal: data.subtotal,
        vatAmount: data.vatAmount,
        totalAmount: data.totalAmount,
        date: data.date,
        dueDate: data.dueDate,
        object: data.object
      }

      const result = await InvoiceValidationService.validateForPdfGeneration(validationData, userId, data.id)
      setValidationErrors(result.errors || {})
      return result
    } catch (error: unknown) {
      console.error('PDF validation error:', error)
      const fallbackErrors: Record<string, string> = {}

      if (error instanceof Error && error.message.includes('customer')) {
        fallbackErrors.customer = 'Kundendaten unvollständig'
      }

      setValidationErrors(fallbackErrors)
      return { isValid: false, errors: fallbackErrors }
    }
  }, [])

  // Clear all validation errors
  const clearErrors = useCallback(() => {
    setValidationErrors({})
    setLineErrors({})
  }, [])

  return {
    validationErrors,
    lineErrors,
    validateForSave,
    validateForPdf,
    clearErrors,
    setValidationErrors,
    setLineErrors,
  }
}
