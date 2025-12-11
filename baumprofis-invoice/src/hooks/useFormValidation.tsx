import { useState, useCallback } from 'react'
import { useAuth } from './useAuth'
import {
  customerSchema,
  newCustomerSchema,
  serviceLineSchema,
  invoiceDataSchema,
  customerStepSchema,
  detailsStepSchema,
  servicesStepSchema,
  type CustomerValidation,
  type NewCustomerValidation,
  type ServiceLineValidation,
  type InvoiceDataValidation,
  type CustomerStepValidation,
  type DetailsStepValidation,
  type ServicesStepValidation
} from '../validation/schemas'
import { validateCompleteInvoice } from '../validation/rules'
import { z } from 'zod'

export interface ValidationErrors {
  [key: string]: string
}

export interface FormValidationState {
  isValid: boolean
  errors: ValidationErrors
  touched: Set<string>
  isValidating: boolean
}

/**
 * Custom hook for form validation with Zod schemas and business rules
 */
export const useFormValidation = () => {
  const { user } = useAuth()
  const [validationState, setValidationState] = useState<FormValidationState>({
    isValid: false,
    errors: {},
    touched: new Set(),
    isValidating: false
  })

  /**
   * Mark a field as touched for validation display
   */
  const touch = useCallback((field: string) => {
    setValidationState(prev => ({
      ...prev,
      touched: new Set([...prev.touched, field])
    }))
  }, [])

  /**
   * Clear validation errors for a field
   */
  const clearError = useCallback((field: string) => {
    setValidationState(prev => ({
      ...prev,
      errors: { ...prev.errors, [field]: '' },
      isValid: Object.values(prev.errors).filter(Boolean).length === 0
    }))
  }, [])

  /**
   * Validate a single field with Zod schema
   */
  const validateField = useCallback(
    async <T,>(
      schema: z.ZodSchema<T>,
      value: unknown,
      fieldName: string
    ): Promise<T | null> => {
      try {
        const result = await schema.safeParseAsync(value)
        if (result.success) {
          clearError(fieldName)
          return result.data
        } else {
          const errorMessage = result.error.issues[0]?.message || 'Ungültige Eingabe'
          setValidationState(prev => ({
            ...prev,
            errors: { ...prev.errors, [fieldName]: errorMessage },
            isValid: false
          }))
          return null
        }
      } catch (error) {
        console.warn(`Validation failed for field ${fieldName}:`, error)
        return null
      }
    },
    [clearError]
  )

  /**
   * Validate customer data
   */
  const validateCustomer = useCallback(
    (data: unknown): Promise<CustomerValidation | null> => {
      return validateField(customerSchema, data, 'customer')
    },
    [validateField]
  )

  /**
   * Validate new customer data
   */
  const validateNewCustomer = useCallback(
    (data: unknown): Promise<NewCustomerValidation | null> => {
      return validateField(newCustomerSchema, data, 'newCustomer')
    },
    [validateField]
  )

  /**
   * Validate single service line
   */
  const validateServiceLine = useCallback(
    (data: unknown, index: number): Promise<ServiceLineValidation | null> => {
      return validateField(serviceLineSchema, data, `line_${index}`)
    },
    [validateField]
  )

  /**
   * Validate complete invoice data with business rules
   */
  const validateInvoiceData = useCallback(
    async (
      data: unknown,
      excludeInvoiceId?: string
    ): Promise<InvoiceDataValidation | null> => {
      if (!user?.uid) return null

      setValidationState(prev => ({ ...prev, isValidating: true }))

      try {
        // First validate schema
        const schemaResult = await validateField(invoiceDataSchema, data, 'invoice')

        if (!schemaResult) return null

        // Then validate business rules
        const businessResult = await validateCompleteInvoice(
          schemaResult as any, // Type assertion needed due to complex nested types
          user.uid,
          excludeInvoiceId
        )

        setValidationState(prev => ({
          ...prev,
          isValid: businessResult.isValid,
          errors: businessResult.errors,
          isValidating: false
        }))

        return businessResult.isValid ? schemaResult : null
      } catch (error) {
        console.error('Invoice validation failed:', error)
        setValidationState(prev => ({
          ...prev,
          errors: { general: 'Validierung fehlgeschlagen' },
          isValid: false,
          isValidating: false
        }))
        return null
      }
    },
    [user?.uid, validateField]
  )

  /**
   * Validate customer step of wizard
   */
  const validateCustomerStep = useCallback(
    async (data: unknown): Promise<CustomerStepValidation | null> => {
      return validateField(customerStepSchema, data, 'customerStep')
    },
    [validateField]
  )

  /**
   * Validate details step of wizard
   */
  const validateDetailsStep = useCallback(
    async (data: unknown): Promise<DetailsStepValidation | null> => {
      return validateField(detailsStepSchema, data, 'detailsStep')
    },
    [validateField]
  )

  /**
   * Validate services step of wizard
   */
  const validateServicesStep = useCallback(
    async (data: unknown): Promise<ServicesStepValidation | null> => {
      return validateField(servicesStepSchema, data, 'servicesStep')
    },
    [validateField]
  )

  /**
   * Validate all wizard steps
   */
  const validateWizard = useCallback(
    async (
      customerData: unknown,
      detailsData: unknown,
      servicesData: unknown
    ): Promise<{
      customer: CustomerStepValidation | null
      details: DetailsStepValidation | null
      services: ServicesStepValidation | null
      allValid: boolean
    }> => {
      const [customer, details, services] = await Promise.all([
        validateCustomerStep(customerData),
        validateDetailsStep(detailsData),
        validateServicesStep(servicesData)
      ])

      const allValid = !!(customer && details && services)

      // Update overall state
      setValidationState(prev => ({
        ...prev,
        isValid: allValid,
        errors: {
          ...(!customer ? { customerStep: 'Kunden-Daten sind ungültig' } : {}),
          ...(!details ? { detailsStep: 'Rechnungsdaten sind ungültig' } : {}),
          ...(!services ? { servicesStep: 'Dienstleistungen sind ungültig' } : {}),
        }
      }))

      return { customer, details, services, allValid }
    },
    [validateCustomerStep, validateDetailsStep, validateServicesStep]
  )

  /**
   * Reset validation state
   */
  const resetValidation = useCallback(() => {
    setValidationState({
      isValid: false,
      errors: {},
      touched: new Set(),
      isValidating: false
    })
  }, [])

  /**
   * Check if a field has errors
   */
  const hasError = useCallback(
    (field: string): boolean => {
      return !!(validationState.errors[field] && validationState.touched.has(field))
    },
    [validationState.errors, validationState.touched]
  )

  /**
   * Get error message for a field
   */
  const getErrorMessage = useCallback(
    (field: string): string => {
      return validationState.errors[field] || ''
    },
    [validationState.errors]
  )

  /**
   * Get all errors
   */
  const getAllErrors = useCallback((): ValidationErrors => {
    return { ...validationState.errors }
  }, [validationState.errors])

  return {
    // State
    validationState,
    isValid: validationState.isValid,
    errors: validationState.errors,
    touched: validationState.touched,
    isValidating: validationState.isValidating,

    // Actions
    touch,
    clearError,
    validateField,
    validateCustomer,
    validateNewCustomer,
    validateServiceLine,
    validateInvoiceData,
    validateCustomerStep,
    validateDetailsStep,
    validateServicesStep,
    validateWizard,
    resetValidation,
    hasError,
    getErrorMessage,
    getAllErrors
  }
}
