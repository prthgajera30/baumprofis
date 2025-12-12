import { getAuth } from 'firebase/auth';
import { validateCompleteInvoice } from '../validation/rules';
import { invoiceDataSchema } from '../validation/schemas';

export interface ValidationResult {
  isValid: boolean;
  errors: Record<string, string>;
  warnings?: string[];
}

export interface InvoiceData {
  invoiceNumber: string;
  customerName: string;
  customerAddress: string;
  customerEmail?: string;
  customerPhone?: string;
  lines: Array<{
    description: string;
    unitPrice: number;
    quantity: number;
    unit: string;
    total: number;
  }>;
  subtotal: number;
  vatAmount: number;
  totalAmount: number;
  date: string;
  dueDate: string;
  object: string;
}

/**
 * Centralized validation service for invoice operations
 */
export class InvoiceValidationService {
  /**
   * Validate invoice data for PDF generation
   * This is a comprehensive validation that ensures only valid invoices can be generated
   */
  static async validateForPdfGeneration(invoiceData: InvoiceData, userId?: string, excludeInvoiceId?: string): Promise<ValidationResult> {
    const errors: Record<string, string> = {};
    const warnings: string[] = [];

    try {
      // 1. Authentication check
      const auth = getAuth();
      const user = auth.currentUser;

      if (!user) {
        errors.auth = 'Sie müssen angemeldet sein, um PDFs zu generieren.';
        return { isValid: false, errors, warnings };
      }

      const effectiveUserId = userId || user.uid;

      // 2. Schema validation
      const schemaResult = invoiceDataSchema.safeParse(invoiceData);
      if (!schemaResult.success) {
        schemaResult.error.issues.forEach(issue => {
          const field = issue.path.join('.');
          errors[field] = issue.message;
        });
      }

      // 3. Business rules validation
      const businessResult = await validateCompleteInvoice(invoiceData, effectiveUserId, excludeInvoiceId);
      if (!businessResult.isValid) {
        Object.assign(errors, businessResult.errors);
      }

      // 4. Additional PDF-specific validations
      if (invoiceData.totalAmount <= 0) {
        errors.totalAmount = 'Rechnungsbetrag muss größer als 0 sein.';
      }

      if (invoiceData.totalAmount > 50000) {
        warnings.push('Bei Beträgen über 50.000€ nehmen Sie bitte Rücksprache.');
      }

      // 5. Data quality checks
      if (this.hasPlaceholderData(invoiceData)) {
        errors.dataQuality = 'Bitte verwenden Sie keine Platzhalterdaten in der Rechnung.';
      }

      return {
        isValid: Object.keys(errors).length === 0,
        errors,
        warnings
      };

    } catch (error) {
      console.error('Validation service error:', error);
      errors.general = 'Validierung fehlgeschlagen. Bitte versuchen Sie es erneut.';
      return { isValid: false, errors, warnings };
    }
  }

  /**
   * Validate business rules only (for form validation during creation)
   */
  static validateBusinessRules(invoiceData: InvoiceData): ValidationResult {
    const errors: Record<string, string> = {};

    // Amount validations
    if (invoiceData.subtotal < 0 || invoiceData.vatAmount < 0 || invoiceData.totalAmount < 0) {
      errors.amounts = 'Beträge dürfen nicht negativ sein.';
    }

    // VAT calculation check (assuming 19% German VAT)
    const expectedVat = invoiceData.subtotal * 0.19;
    const expectedTotal = invoiceData.subtotal + expectedVat;

    const vatDifference = Math.abs(invoiceData.vatAmount - expectedVat);
    const totalDifference = Math.abs(invoiceData.totalAmount - expectedTotal);

    if (vatDifference > 0.01 || totalDifference > 0.01) {
      errors.vatCalculation = 'MwSt.-Berechnung stimmt nicht überein.';
    }

    // Service line validations
    invoiceData.lines.forEach((line, index) => {
      if (line.unitPrice <= 0 || line.unitPrice > 99999) {
        errors[`line_${index}_price`] = 'Preis muss zwischen 0.01€ und 99.999€ liegen.';
      }

      if (line.quantity <= 0 || line.quantity > 1000) {
        errors[`line_${index}_quantity`] = 'Menge muss zwischen 0.01 und 1000 liegen.';
      }

      if (line.total !== line.unitPrice * line.quantity) {
        errors[`line_${index}_total`] = 'Gesamtpreis-Berechnung ist falsch.';
      }
    });

    return {
      isValid: Object.keys(errors).length === 0,
      errors
    };
  }

  /**
   * Validate data integrity (no corruption, proper formatting)
   */
  static validateDataIntegrity(invoiceData: InvoiceData): ValidationResult {
    const errors: Record<string, string> = {};

    // Check for required fields
    if (!invoiceData.invoiceNumber?.trim()) {
      errors.invoiceNumber = 'Rechnungsnummer ist erforderlich.';
    }

    if (!invoiceData.customerName?.trim()) {
      errors.customerName = 'Kundenname ist erforderlich.';
    }

    if (!invoiceData.customerAddress?.trim()) {
      errors.customerAddress = 'Kundenadresse ist erforderlich.';
    }

    if (!invoiceData.object?.trim()) {
      errors.object = 'Objekt-Beschreibung ist erforderlich.';
    }

    if (!invoiceData.lines || invoiceData.lines.length === 0) {
      errors.lines = 'Mindestens eine Position ist erforderlich.';
    }

    // Check date formats
    const dateRegex = /^(0[1-9]|[12][0-9]|3[01])\.(0[1-9]|1[0-2])\.\d{4}$/;
    if (!dateRegex.test(invoiceData.date)) {
      errors.date = 'Rechnungsdatum muss im Format dd.MM.yyyy sein.';
    }

    if (!dateRegex.test(invoiceData.dueDate)) {
      errors.dueDate = 'Fälligkeitsdatum muss im Format dd.MM.yyyy sein.';
    }

    return {
      isValid: Object.keys(errors).length === 0,
      errors
    };
  }

  /**
   * Check for placeholder/test data
   */
  private static hasPlaceholderData(invoiceData: InvoiceData): boolean {
    const placeholderPatterns = [
      'kundenname', 'kunde', 'name', 'musterkunde', 'john doe', 'max mustermann',
      'straße', 'straße', 'straße', 'walterweg', 'musterstraße', 'beispielstraße',
      'ort', 'plz', 'stadt', 'stadt', 'stadt', 'musterstadt', 'beispielstadt',
      'position', 'leistung', 'dienst', 'arbeiten', 'arbeit', 'test', 'muster', 'beispiel'
    ];

    const checkText = (text: string) =>
      placeholderPatterns.some(pattern =>
        text.toLowerCase().includes(pattern)
      );

    if (checkText(invoiceData.customerName)) return true;
    if (checkText(invoiceData.customerAddress)) return true;
    if (checkText(invoiceData.object)) return true;

    return invoiceData.lines.some(line =>
      checkText(line.description)
    );
  }
}
