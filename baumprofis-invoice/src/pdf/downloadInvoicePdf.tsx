import jsPDF from "jspdf";
import html2canvas from "html2canvas";
import type { BaumprofisInvoicePdfProps } from "./invoiceTypes";
import { InvoiceValidationService, type InvoiceData } from "../services/validationService";

export async function downloadInvoicePdf(props: BaumprofisInvoicePdfProps) {
  // Convert PDF props to invoice data for validation
  const invoiceData: InvoiceData = {
    invoiceNumber: props.invoiceNumber,
    customerName: props.recipientName,
    customerAddress: `${props.recipientStreet}\n${props.recipientZipCity}`,
    customerEmail: undefined, // Not available in PDF props
    customerPhone: undefined, // Not available in PDF props
    lines: props.items.map(item => ({
      description: item.description,
      unitPrice: item.unitPrice,
      quantity: item.quantity,
      unit: item.unitLabel,
      total: item.total
    })),
    subtotal: props.netTotal,
    vatAmount: props.vatAmount,
    totalAmount: props.grossTotal,
    date: props.invoiceDate,
    dueDate: props.invoiceDate, // Not available in PDF props, use invoice date as fallback
    object: props.objectDescription
  };

  // Comprehensive validation before PDF generation
  const validationResult = await InvoiceValidationService.validateForPdfGeneration(invoiceData);

  if (!validationResult.isValid) {
    const errorMessages = Object.values(validationResult.errors).join('\n');
    alert(`PDF-Generierung blockiert:\n\n${errorMessages}`);
    throw new Error('Validation failed for PDF generation');
  }

  // Show warnings if any
  if (validationResult.warnings && validationResult.warnings.length > 0) {
    const warningMessages = validationResult.warnings.join('\n');
    if (!confirm(`Warnungen:\n\n${warningMessages}\n\nTrotzdem fortfahren?`)) {
      return;
    }
  }

  try {
    // Create temporary HTML element with the invoice template
    const invoiceElement = document.createElement('div');
    invoiceElement.innerHTML = generateInvoiceHTML(props);
    invoiceElement.style.position = 'absolute';
    invoiceElement.style.left = '-9999px';
    invoiceElement.style.width = '210mm';
    invoiceElement.style.backgroundColor = 'white';
    invoiceElement.style.fontFamily = 'Arial, sans-serif';
    invoiceElement.style.fontSize = '12px';
    invoiceElement.style.padding = '20mm';
    invoiceElement.style.paddingBottom = '40mm'; // Extra space for footer

    document.body.appendChild(invoiceElement);

    // Generate canvas from HTML
    const canvas = await html2canvas(invoiceElement, {
      scale: 2,
      useCORS: true,
      allowTaint: true,
      backgroundColor: '#ffffff',
      width: 794, // A4 width at 96 DPI
      height: 1123 // A4 height at 96 DPI
    });

    // Remove temporary element
    document.body.removeChild(invoiceElement);

    // Create PDF
    const pdf = new jsPDF('p', 'mm', 'a4');
    const imgData = canvas.toDataURL('image/png');

    pdf.addImage(imgData, 'PNG', 0, 0, 210, 297); // A4 dimensions

    // Save PDF
    const filename = `Rechnung-${props.invoiceNumber}.pdf`;
    pdf.save(filename);

    alert('✅ PDF erfolgreich heruntergeladen!');

  } catch (error) {
    console.error('PDF generation error:', error);
    alert('Fehler beim Generieren der PDF. Versuchen Sie es erneut.');
  }
}
