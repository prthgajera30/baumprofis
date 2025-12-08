// Type definitions for invoice data (separated from PDF rendering dependencies)
export interface InvoiceItem {
  position: number;
  description: string;
  unitPrice: number;
  quantity: number;
  unitLabel: string; // e.g. "pauschal", "Stunden"
  total: number;
}

export interface BaumprofisInvoicePdfProps {
  // Header / sender
  companyName: string;
  companyTaglineLines: string[];
  senderName: string;
  senderStreet: string;
  senderZipCity: string;
  senderMobile: string;

  // Logo
  logoImage?: string;

  // Recipient
  recipientName: string;
  recipientLine2?: string;
  recipientStreet: string;
  recipientZipCity: string;

  // Invoice meta
  invoiceNumber: string;
  objectDescription: string;
  place: string;
  invoiceDate: string;

  salutation: string;
  introText: string;

  items: InvoiceItem[];

  netTotal: number;
  vatRate: number;
  vatAmount: number;
  grossTotal: number;

  paymentText?: string;

  // Bank data
  bankName: string;
  iban: string;
  bic: string;
  accountHolder: string;

  // Footer tax info
  taxId: string;
  taxNumber: string;
}
