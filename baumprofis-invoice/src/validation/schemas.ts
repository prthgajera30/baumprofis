import { z } from 'zod'

// German date format validator (dd.MM.yyyy)
export const germanDateRegex = /^(0[1-9]|[12][0-9]|3[01])\.(0[1-9]|1[0-2])\.\d{4}$/

const germanDateSchema = z
  .string()
  .regex(germanDateRegex, 'Datum muss im Format dd.MM.yyyy sein')
  .refine((date) => {
    const [day, month, year] = date.split('.').map(Number)
    const dateObj = new Date(year, month - 1, day)
    return dateObj.getDate() === day && dateObj.getMonth() === month - 1 && dateObj.getFullYear() === year
  }, 'Ungültiges Datum')

// Email validator
const emailSchema = z
  .string()
  .optional()
  .refine((email) => !email || z.string().email().safeParse(email).success, {
    message: 'Ungültige E-Mail-Adresse'
  })

// Phone validator (German format)
const phoneSchema = z
  .string()
  .optional()
  .refine((phone) => !phone || /^[\+]?[\d\s\-\(\)]+$/.test(phone), {
    message: 'Ungültige Telefonnummer'
  })

// Customer validation schemas
export const customerSchema = z.object({
  id: z.string().optional(),
  name: z
    .string()
    .min(2, 'Name muss mindestens 2 Zeichen lang sein')
    .max(100, 'Name darf maximal 100 Zeichen lang sein')
    .regex(/^[a-zA-ZäöüÄÖÜß\s\-\.]+$/, 'Name enthält ungültige Zeichen'),
  email: emailSchema,
  phone: phoneSchema,
  address: z
    .string()
    .min(5, 'Adresse muss mindestens 5 Zeichen lang sein')
    .max(200, 'Adresse darf maximal 200 Zeichen lang sein')
})

export const newCustomerSchema = customerSchema.omit({ id: true })

// Invoice validation schemas
export const invoiceNumberSchema = z
  .string()
  .min(1, 'Rechnungsnummer ist erforderlich')
  .max(50, 'Rechnungsnummer darf maximal 50 Zeichen lang sein')
  .regex(/^[A-Za-z0-9\-\_\.]+$/, 'Rechnungsnummer enthält ungültige Zeichen')

// Service line validation
export const serviceLineSchema = z.object({
  id: z.string(),
  description: z
    .string()
    .min(1, 'Beschreibung ist erforderlich')
    .max(500, 'Beschreibung darf maximal 500 Zeichen lang sein'),
  unitPrice: z
    .union([z.number(), z.string()])
    .transform((val) => typeof val === 'string' ? parseFloat(val) : val)
    .refine((val) => !isNaN(val) && val > 0, 'Einzelpreis muss eine positive Zahl sein')
    .refine((val) => val <= 999999.99, 'Einzelpreis zu hoch'),
  quantity: z
    .union([z.number(), z.string()])
    .transform((val) => typeof val === 'string' ? parseFloat(val) : val)
    .refine((val) => !isNaN(val) && val > 0, 'Menge muss eine positive Zahl sein')
    .refine((val) => val <= 9999, 'Menge zu hoch'),
  unit: z.enum(['Stunden', 'Stück', 'pauschal'], {
    message: 'Einheit muss Stunden, Stück oder pauschal sein'
  }),
  total: z.number().optional() // Calculated field
})

// Invoice data validation
export const invoiceDataSchema = z.object({
  invoiceNumber: invoiceNumberSchema,
  date: germanDateSchema,
  object: z
    .string()
    .min(1, 'Objekt-Beschreibung ist erforderlich')
    .max(200, 'Objekt-Beschreibung darf maximal 200 Zeichen lang sein'),
  customerId: z.string().optional(),
  customerName: customerSchema.shape.name,
  customerAddress: customerSchema.shape.address,
  lines: z
    .array(serviceLineSchema)
    .min(1, 'Mindestens eine Position ist erforderlich')
    .max(50, 'Maximal 50 Positionen erlaubt'),
  subtotal: z.number().min(0).max(9999999.99),
  vatAmount: z.number().min(0).max(999999.99),
  totalAmount: z.number().min(0).max(9999999.99),
  dueDate: germanDateSchema
}).refine((data) => {
  // Due date cannot be before invoice date
  const invoiceDate = parseGermanDate(data.date)
  const dueDate = parseGermanDate(data.dueDate)
  return dueDate >= invoiceDate
}, {
  message: 'Fälligkeitsdatum darf nicht vor dem Rechnungsdatum liegen',
  path: ['dueDate']
})

// Wizard step validation schemas
export const customerStepSchema = z.object({
  selected: z.boolean().refine(val => val === true, 'Kunde muss ausgewählt werden'),
  data: z.object({
    name: customerSchema.shape.name,
    address: customerSchema.shape.address,
    email: emailSchema,
    phone: phoneSchema
  })
})

export const detailsStepSchema = z.object({
  invoiceNumber: invoiceNumberSchema,
  date: germanDateSchema,
  object: z.string().min(1, 'Objekt ist erforderlich'),
  dueDate: germanDateSchema
}).refine((data) => {
  // Due date validation
  const invoiceDate = parseGermanDate(data.date)
  const dueDate = parseGermanDate(data.dueDate)
  return dueDate >= invoiceDate
}, {
  message: 'Fälligkeitsdatum darf nicht vor dem Rechnungsdatum liegen',
  path: ['dueDate']
})

export const servicesStepSchema = z.object({
  lines: z
    .array(serviceLineSchema)
    .min(1, 'Mindestens eine Position ist erforderlich'),
  subtotal: z.number().min(0.01, 'Summe muss größer als 0 sein'),
  vatAmount: z.number().min(0),
  totalAmount: z.number().min(0.01, 'Gesamtbetrag muss größer als 0 sein')
})

// Helper functions
export function parseGermanDate(date: string): Date {
  const [day, month, year] = date.split('.').map(Number)
  return new Date(year, month - 1, day)
}

export function validateGermanDate(date: string): boolean {
  if (!germanDateRegex.test(date)) return false
  const [day, month, year] = date.split('.').map(Number)
  const dateObj = new Date(year, month - 1, day)
  return dateObj.getDate() === day && dateObj.getMonth() === month - 1 && dateObj.getFullYear() === year
}

export function formatGermanDate(date: Date): string {
  return date.toLocaleDateString('de-DE')
}

// Type exports
export type CustomerValidation = z.infer<typeof customerSchema>
export type NewCustomerValidation = z.infer<typeof newCustomerSchema>
export type ServiceLineValidation = z.infer<typeof serviceLineSchema>
export type InvoiceDataValidation = z.infer<typeof invoiceDataSchema>
export type CustomerStepValidation = z.infer<typeof customerStepSchema>
export type DetailsStepValidation = z.infer<typeof detailsStepSchema>
export type ServicesStepValidation = z.infer<typeof servicesStepSchema>
