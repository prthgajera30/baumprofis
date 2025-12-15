import { downloadInvoicePdf } from '../pdf/downloadInvoicePdf'

export interface InvoiceData {
  customerName: string
  customerStreet: string
  customerZipCode: string
  customerCity: string
  invoiceNumber: string
  object: string
  date: string
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
}

export const generateAndDownloadPDF = async (
  invoiceData: InvoiceData,
  toast: { success: (msg: string) => void; error: (msg: string) => void }
) => {
  try {
    // Map InvoiceData to BaumprofisInvoicePdfProps
    const pdfProps = {
      // Header / sender (static values from the original template)
      companyName: "Baumprofis",
      companyTaglineLines: [
        "Baumpflege . Baumsanierung . Baumsicherung",
        "Baumkontrolle . Gartenpflege . Baumfällarbeiten",
        "(auch Problem- und Risikofällung)"
      ],
      senderName: "Phidelia Ogbeide",
      senderStreet: "Mühlstraße 22",
      senderZipCity: "65388 Schlangenbad",
      senderMobile: "+49 175 6048985",

      // Recipient
      recipientName: invoiceData.customerName || 'Kundenname',
      recipientLine2: undefined, // Could add if needed
      recipientStreet: invoiceData.customerStreet || 'Straße',
      recipientZipCity: `${invoiceData.customerZipCode || 'PLZ'} ${invoiceData.customerCity || 'Ort'}`,

      // Invoice meta
      invoiceNumber: invoiceData.invoiceNumber,
      objectDescription: invoiceData.object || 'Baumarbeiten',
      place: 'Schlangenbad', // Static from template
      invoiceDate: invoiceData.date,

      salutation: "Sehr geehrte Damen und Herren,",
      introText: "nach Abschluss der gewünschten Arbeiten stelle ich Ihnen diese in Rechnung.",

      // Invoice items - map the lines
      items: invoiceData.lines.map((line, index) => ({
        position: index + 1,
        description: line.description || `Position ${index + 1}`,
        unitPrice: Number(line.unitPrice),
        quantity: Number(line.quantity),
        unitLabel: line.unit === 'Stunden' ? 'Stunden' : (line.unit === 'Stück' ? 'Stück' : 'pauschal'),
        total: Number(line.total)
      })),

      // Totals
      netTotal: Number(invoiceData.subtotal),
      vatRate: 0.19, // 19%
      vatAmount: Number(invoiceData.vatAmount),
      grossTotal: Number(invoiceData.totalAmount),

      paymentText: undefined, // Use default

      // Bank data (static values from template)
      bankName: "Rheingauer Volksbank eG.",
      iban: "DE31 5109 1500 0000 1543 93",
      bic: "GENODE51RGG",
      accountHolder: "Phidelia Ogbeide",

      // Footer tax info (static values)
      taxId: "75961284403",
      taxNumber: "004/853/60532"
    }

    await downloadInvoicePdf(pdfProps, { success: toast.success, error: toast.error })
  } catch (error) {
    console.error('PDF generation error:', error)
    throw error
  }
}
