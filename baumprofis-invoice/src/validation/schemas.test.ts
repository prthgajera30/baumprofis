import { describe, it, expect } from 'vitest'
import {
  customerSchema,
  invoiceNumberSchema,
  serviceLineSchema,
  detailsStepSchema,
  parseGermanDate,
  validateGermanDate,
  formatGermanDate
} from './schemas'

describe('Validation Schemas', () => {
  describe('German Date Validation in Context', () => {
    it('validates correct German date format in details step', () => {
      const result = detailsStepSchema.safeParse({
        invoiceNumber: 'TEST-001',
        date: '25.12.2025',
        object: 'Test object',
        dueDate: '01.01.2026'
      })
      expect(result.success).toBe(true)
    })

    it('rejects invalid date formats in details step', () => {
      const result = detailsStepSchema.safeParse({
        invoiceNumber: 'TEST-001',
        date: '25/12/2025', // wrong separator
        object: 'Test object',
        dueDate: '01.01.2026'
      })
      expect(result.success).toBe(false)
    })

    it('rejects invalid dates like February 30th', () => {
      const result = detailsStepSchema.safeParse({
        invoiceNumber: 'TEST-001',
        date: '30.02.2025', // invalid date
        object: 'Test object',
        dueDate: '01.01.2026'
      })
      expect(result.success).toBe(false)
    })
  })

  describe('Customer Schema', () => {
    it('validates valid customer data', () => {
      const validCustomer = {
        name: 'John Doe',
        address: 'Main Street 123, 12345 Berlin',
        email: 'john@example.com',
        phone: '+49 123 456789'
      }

      const result = customerSchema.safeParse(validCustomer)
      expect(result.success).toBe(true)
    })

    it('rejects customer with invalid name', () => {
      const invalidCustomer = {
        name: 'John123',  // Numbers in name
        address: 'Main Street 123, 12345 Berlin'
      }

      const result = customerSchema.safeParse(invalidCustomer)
      expect(result.success).toBe(false)
    })

    it('validates optional fields', () => {
      const customerWithoutOptionals = {
        name: 'Jane Doe',
        address: 'Main Street 123, 12345 Berlin'
      }

      const result = customerSchema.safeParse(customerWithoutOptionals)
      expect(result.success).toBe(true)
    })
  })

  describe('Invoice Number Schema', () => {
    it('validates valid invoice numbers', () => {
      const validNumbers = [
        'INV-001',
        'RE-2025-001',
        'ABC-123_DEF'
      ]

      validNumbers.forEach(number => {
        const result = invoiceNumberSchema.safeParse(number)
        expect(result.success).toBe(true)
      })
    })

    it('rejects invalid invoice numbers', () => {
      const longString = 'A'.repeat(51) // Creates 51 'A' characters
      const invalidNumbers = [
        'INV/001',     // wrong separator
        'INV 001',     // space
        longString,    // too long (51 characters)
      ]

      invalidNumbers.forEach(number => {
        const result = invoiceNumberSchema.safeParse(number)
        expect(result.success).toBe(false)
      })
    })
  })

  describe('Service Line Schema', () => {
    it('validates valid service line', () => {
      const validLine = {
        id: 'line-1',
        description: 'Tree pruning service',
        unitPrice: 150,
        quantity: 2,
        unit: 'Stunden' as const,
        total: 300
      }

      const result = serviceLineSchema.safeParse(validLine)
      expect(result.success).toBe(true)
    })

    it('rejects negative or zero prices', () => {
      const invalidLines = [
        { ...validLineTemplate, unitPrice: 0 },
        { ...validLineTemplate, unitPrice: -10 },
      ]

      invalidLines.forEach(line => {
        const result = serviceLineSchema.safeParse(line)
        expect(result.success).toBe(false)
      })
    })

    it('rejects negative or zero quantities', () => {
      const invalidLines = [
        { ...validLineTemplate, quantity: 0 },
        { ...validLineTemplate, quantity: -1 },
      ]

      invalidLines.forEach(line => {
        const result = serviceLineSchema.safeParse(line)
        expect(result.success).toBe(false)
      })
    })
  })
})

describe('Utility Functions', () => {
  describe('parseGermanDate', () => {
    it('parses valid German dates', () => {
      const date = parseGermanDate('25.12.2025')
      expect(date.getFullYear()).toBe(2025)
      expect(date.getMonth()).toBe(11) // December is 11 (zero-indexed)
      expect(date.getDate()).toBe(25)
    })
  })

  describe('validateGermanDate', () => {
    it('validates correct dates', () => {
      expect(validateGermanDate('25.12.2025')).toBe(true)
      expect(validateGermanDate('01.01.2024')).toBe(true)
    })

    it('rejects invalid dates', () => {
      expect(validateGermanDate('25/12/2025')).toBe(false)
      expect(validateGermanDate('32.12.2025')).toBe(false)
      expect(validateGermanDate('abc')).toBe(false)
    })
  })

  describe('formatGermanDate', () => {
    it('formats dates in German format', () => {
      const date = new Date(2025, 11, 25) // December 25, 2025
      expect(formatGermanDate(date)).toBe('25.12.2025')
    })
  })
})

// Helper for tests
const validLineTemplate = {
  id: 'line-1',
  description: 'Test service',
  unitPrice: 100,
  quantity: 1,
  unit: 'pauschal' as const,
  total: 100
}
