import { collection, query, where, getDocs } from 'firebase/firestore'
import { db } from '../lib/firebase'
import { germanDateRegex, parseGermanDate } from './schemas'

// Business validation rules beyond basic schema validation

export interface ValidationError {
  message: string
  field?: string
}

/**
 * Validate invoice number uniqueness for the current user
 */
export async function validateInvoiceNumberUnique(
  invoiceNumber: string,
  userId: string,
  excludeInvoiceId?: string
): Promise<boolean> {
  try {
    if (!userId) return false

    const invoicesRef = collection(db, 'invoices')
    const q = query(
      invoicesRef,
      where('userId', '==', userId),
      where('invoiceNumber', '==', invoiceNumber)
    )

    const snapshot = await getDocs(q)

    // Filter out the current invoice if we're updating
    const existingInvoices = snapshot.docs.filter(doc => doc.id !== excludeInvoiceId)

    return existingInvoices.length === 0
  } catch (error) {
    console.error('Error validating invoice number:', error)
    // In case of error, allow the validation (fail safely)
    return true
  }
}

/**
 * Validate date ranges for business logic
 */
export function validateDateRange(date: string): { isValid: boolean; error?: string } {
  if (!germanDateRegex.test(date)) {
    return { isValid: false, error: 'Datum muss im Format dd.MM.yyyy sein' }
  }

  const dateObj = parseGermanDate(date)
  const now = new Date()

  // Invoice date cannot be more than 1 year in the past
  const oneYearAgo = new Date()
  oneYearAgo.setFullYear(now.getFullYear() - 1)

  // Invoice date cannot be more than 1 month in the future (for pre-dating)
  const oneMonthFromNow = new Date()
  oneMonthFromNow.setMonth(now.getMonth() + 1)

  if (dateObj < oneYearAgo) {
    return { isValid: false, error: 'Rechnungsdatum darf nicht älter als 1 Jahr sein' }
  }

  if (dateObj > oneMonthFromNow) {
    return { isValid: false, error: 'Rechnungsdatum darf maximal 1 Monat in der Zukunft liegen' }
  }

  return { isValid: true }
}

/**
 * Validate due date against invoice date
 */
export function validateDueDate(invoiceDate: string, dueDate: string): { isValid: boolean; error?: string } {
  const invoiceDateObj = parseGermanDate(invoiceDate)
  const dueDateObj = parseGermanDate(dueDate)

  const daysDifference = Math.ceil((dueDateObj.getTime() - invoiceDateObj.getTime()) / (1000 * 60 * 60 * 24))

  if (daysDifference < 0) {
    return { isValid: false, error: 'Fälligkeitsdatum darf nicht vor dem Rechnungsdatum liegen' }
  }

  if (daysDifference > 365) {
    return { isValid: false, error: 'Fälligkeitsdatum darf maximal 1 Jahr nach Rechnungsdatum liegen' }
  }

  return { isValid: true }
}

/**
 * Validate business amounts and calculations
 */
export function validateInvoiceAmounts(subtotal: number, vatAmount: number, totalAmount: number): { isValid: boolean; error?: string } {
  // Basic sanity checks
  if (subtotal < 0 || vatAmount < 0 || totalAmount < 0) {
    return { isValid: false, error: 'Beträge dürfen nicht negativ sein' }
  }

  // Maximum reasonable amounts for a tree care business
  const maxReasonableTotal = 100000 // 100k €
  if (totalAmount > maxReasonableTotal) {
    return { isValid: false, error: 'Gesamtbetrag scheint ungewöhnlich hoch zu sein' }
  }

  // Check VAT calculation (assuming 19% German VAT)
  const expectedVat = subtotal * 0.19
  const expectedTotal = subtotal + expectedVat

  // Allow small rounding differences (up to 1 cent)
  const vatDifference = Math.abs(vatAmount - expectedVat)
  const totalDifference = Math.abs(totalAmount - expectedTotal)

  if (vatDifference > 0.01 || totalDifference > 0.01) {
    return { isValid: false, error: 'MwSt.-Berechnung stimmt nicht überein' }
  }

  return { isValid: true }
}

/**
 * Validate service line data integrity
 */
export function validateServiceLine(
  description: string,
  unitPrice: number,
  quantity: number,
  unit: string,
  calculatedTotal: number
): { isValid: boolean; error?: string } {
  // Check description quality
  const trimmedDesc = description.trim()
  if (trimmedDesc.length < 3) {
    return { isValid: false, error: 'Beschreibung zu kurz (mindestens 3 Zeichen)' }
  }

  // Check if description contains only meaningless content
  const meaninglessPatterns = [
    /^test/i,
    /^abc/i,
    /^xyz/i,
    /^(?:\d+\s*)+$/, // Only numbers
    /^[^\w]*$/, // Only special characters
  ]

  if (meaninglessPatterns.some(pattern => pattern.test(trimmedDesc))) {
    return { isValid: false, error: 'Beschreibung scheint nicht aussagekräftig zu sein' }
  }

  // Validate unit makes sense with quantity
  if (unit === 'Stunden' && quantity > 40) {
    return { isValid: false, error: 'Ungewöhnlich hohe Stundenanzahl' }
  }

  if (unit === 'Stück' && quantity > 1000) {
    return { isValid: false, error: 'Ungewöhnlich hohe Stückzahl' }
  }

  // Check total calculation
  const expectedTotal = unitPrice * quantity
  const difference = Math.abs(calculatedTotal - expectedTotal)

  if (difference > 0.01) {
    return { isValid: false, error: 'Gesamtpreis-Berechnung nicht korrekt' }
  }

  return { isValid: true }
}

/**
 * Validate customer data for business sense
 */
export function validateCustomerData(name: string, address: string, email?: string, _phone?: string): { isValid: boolean; error?: string } {
  // Check for placeholder/meaningless data
  const placeholderNames = [
    'name', 'kunde', 'customer', 'max mustermann', 'john doe',
    'testkunde', 'beispielkunde', 'neuer kunde'
  ]

  const lowerName = name.toLowerCase().trim()
  if (placeholderNames.some(placeholder => lowerName.includes(placeholder))) {
    return { isValid: false, error: 'Bitte geben Sie einen echten Kundennamen ein' }
  }

  const lowerAddress = address.toLowerCase().trim()
  if (lowerAddress.includes('musterstraße') ||
      lowerAddress.includes('beispielstraße') ||
      lowerAddress.includes('test address')) {
    return { isValid: false, error: 'Bitte geben Sie eine echte Adresse ein' }
  }

  // If email is provided, check basic quality
  if (email) {
    const emailPatterns = [
      /@test\.com$/i,
      /@example\.com$/i,
      /@beispiel\.de$/i,
      /test@/i,
      /beispiel@/i
    ]

    if (emailPatterns.some(pattern => pattern.test(email))) {
      return { isValid: false, error: 'Bitte geben Sie eine echte E-Mail-Adresse ein' }
    }
  }

  return { isValid: true }
}

/**
 * Comprehensive invoice validation (combines all rules)
 */
export async function validateCompleteInvoice(
  invoiceData: {
    invoiceNumber: string
    customerName: string
    customerAddress: string
    customerEmail?: string
    customerPhone?: string
    lines: Array<{
      description: string
      unitPrice: number
      quantity: number
      unit: string
      total: number
    }>
    subtotal: number
    vatAmount: number
    totalAmount: number
    date: string
    dueDate: string
  },
  userId: string,
  excludeInvoiceId?: string
): Promise<{ isValid: boolean; errors: Record<string, string> }> {
  const errors: Record<string, string> = {}

  try {
    // Invoice number uniqueness
    const isUnique = await validateInvoiceNumberUnique(invoiceData.invoiceNumber, userId, excludeInvoiceId)
    if (!isUnique) {
      errors.invoiceNumber = 'Rechnungsnummer bereits vergeben'
    }

    // Date validations
    const dateValidation = validateDateRange(invoiceData.date)
    if (!dateValidation.isValid) {
      errors.date = dateValidation.error!
    }

    const dueDateValidation = validateDueDate(invoiceData.date, invoiceData.dueDate)
    if (!dueDateValidation.isValid) {
      errors.dueDate = dueDateValidation.error!
    }

    // Customer validation
    const customerValidation = validateCustomerData(
      invoiceData.customerName,
      invoiceData.customerAddress,
      invoiceData.customerEmail,
      invoiceData.customerPhone
    )
    if (!customerValidation.isValid) {
      errors.customer = customerValidation.error!
    }

    // Amount validation
    const amountValidation = validateInvoiceAmounts(invoiceData.subtotal, invoiceData.vatAmount, invoiceData.totalAmount)
    if (!amountValidation.isValid) {
      errors.amounts = amountValidation.error!
    }

    // Service lines validation
    for (let i = 0; i < invoiceData.lines.length; i++) {
      const line = invoiceData.lines[i]
      const lineValidation = validateServiceLine(
        line.description,
        line.unitPrice,
        line.quantity,
        line.unit,
        line.total
      )
      if (!lineValidation.isValid) {
        errors[`line_${i}`] = lineValidation.error!
      }
    }

  } catch (error) {
    console.error('Error during comprehensive validation:', error)
    errors.general = 'Validierung fehlgeschlagen. Bitte versuchen Sie es erneut.'
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors
  }
}
