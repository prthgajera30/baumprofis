import jsPDF from "jspdf";
import html2canvas from "html2canvas";
import type { BaumprofisInvoicePdfProps } from "./invoiceTypes";
import { InvoiceValidationService, type InvoiceData } from "../services/validationService";

// Import the logo as a module to get the proper Vite-processed URL
import companyLogo from "../assets/logos/Company_logo.png";

/**
 * Generate HTML template for the invoice
 */
function generateInvoiceHTML(props: BaumprofisInvoicePdfProps, logoUrl: string): string {
  const {
    companyName,
    companyTaglineLines,
    senderName,
    senderStreet,
    senderZipCity,
    senderMobile,
    recipientName,
    recipientLine2,
    recipientStreet,
    recipientZipCity,
    invoiceNumber,
    objectDescription,
    place,
    invoiceDate,
    salutation,
    introText,
    items,
    netTotal,
    vatRate,
    vatAmount,
    grossTotal,
    paymentText,
    bankName,
    iban,
    bic,
    accountHolder,
    taxId,
    taxNumber,
  } = props;

  const effectivePaymentText = paymentText ||
    `Bitte überweisen Sie den Rechnungsendbetrag über ${formatEuro(grossTotal)} binnen 10 Tagen auf folgendes Konto:`;

  return `
    <div style="font-family: Arial, sans-serif; font-size: 12px; line-height: 1.4; color: #333; width: 100%; min-height: 100vh; position: relative; padding-bottom: 40mm;">
      <!-- Header -->
      <table style="width: 100%; margin-bottom: 20px;">
        <tr>
          <td style="width: 50%; vertical-align: top;">
            <div style="font-size: 28px; font-weight: bold; margin-bottom: 8px;">${companyName}</div>
            ${companyTaglineLines.map(line => `<div style="font-size: 10px; color: #666;">${line}</div>`).join('')}
          </td>
          <td style="width: 45%; text-align: right; vertical-align: top;">
            <img src="${logoUrl}" style="width: 100px; height: 100px; object-fit: contain; margin-bottom: 10px;" alt="Company Logo">
          </td>
        </tr>
        <tr>
          <td style="margin-bottom: 20px;">
            <div style="font-size:9px">${senderName} ${senderStreet}</div>
            <div style="font-size:9px">${senderZipCity}</div>

            <div style="margin-top: 20px;">${recipientName}</div>
            ${recipientLine2 ? `<div>${recipientLine2}</div>` : ''}
            <div>${recipientStreet}</div>
            <div>${recipientZipCity}</div>
          </td>
          <td style="width: 45%; text-align: right; vertical-align: top;">
            <div>${companyName}</div>
            <div>${senderName}</div>
            <div>${senderStreet}</div>
            <div>${senderZipCity}</div>
            <div>Mobil: ${senderMobile}</div>
          </td>
        </tr>
      </table>

      <!-- Place and Date -->
      <div style="text-align: right; font-size: 12px; margin-bottom: 12px;">
        ${place}, den ${invoiceDate}
      </div>

      <!-- Invoice Meta -->
      <div style="margin-bottom: 12px;">
        <div style="margin-bottom: 4px;"><strong>Rechnung Nr :</strong> ${invoiceNumber}</div>
        <div><strong>Objekt :</strong> ${objectDescription}</div>
      </div>

      <!-- Intro -->
      <div style="margin-bottom: 12px; margin-top: 12px;">
        <div>${salutation}</div>
        <div>${introText}</div>
      </div>

      <!-- Items Table -->
      <table style="width: 100%; border-collapse: collapse; border: 1px solid #333; margin-top: 20px; margin-bottom: 15px;">
        <thead>
          <tr style="background-color: #f8f9fa;">
            <th style="padding: 8px 12px; text-align: center; border-bottom: 1px solid #333; border-right: 1px solid #ddd; font-weight: bold; font-size: 11px; width: 8%;">Pos</th>
            <th style="padding: 8px 12px; text-align: left; border-bottom: 1px solid #333; border-right: 1px solid #ddd; font-weight: bold; font-size: 11px;">Beschreibung</th>
            <th style="padding: 8px 12px; text-align: right; border-bottom: 1px solid #333; border-right: 1px solid #ddd; font-weight: bold; font-size: 11px;">Einzelpreis</th>
            <th style="padding: 8px 12px; text-align: right; border-bottom: 1px solid #333; border-right: 1px solid #ddd; font-weight: bold; font-size: 11px;">Anzahl</th>
            <th style="padding: 8px 12px; text-align: center; border-bottom: 1px solid #333; border-right: 1px solid #ddd; font-weight: bold; font-size: 11px;">Einheit</th>
            <th style="padding: 8px 12px; text-align: right; border-bottom: 1px solid #333; font-weight: bold; font-size: 11px;">Gesamtpreis</th>
          </tr>
        </thead>
        <tbody>
          ${items.map(item => `
            <tr>
              <td style="padding: 6px 12px; text-align: center; border-bottom: 1px solid #eee; border-right: 1px solid #ddd; font-size: 11px; font-weight: bold;">${item.position}</td>
              <td style="padding: 6px 12px; border-bottom: 1px solid #eee; border-right: 1px solid #ddd; font-size: 11px;">${item.description}</td>
              <td style="padding: 6px 12px; text-align: right; border-bottom: 1px solid #eee; border-right: 1px solid #ddd; font-size: 11px;">${formatEuro(item.unitPrice)}</td>
              <td style="padding: 6px 12px; text-align: right; border-bottom: 1px solid #eee; border-right: 1px solid #ddd; font-size: 11px;">${item.quantity}</td>
              <td style="padding: 6px 12px; text-align: center; border-bottom: 1px solid #eee; border-right: 1px solid #ddd; font-size: 11px;">${item.unitLabel}</td>
              <td style="padding: 6px 12px; text-align: right; border-bottom: 1px solid #eee; font-size: 11px;">${formatEuro(item.total)}</td>
            </tr>
          `).join('')}
        </tbody>
      </table>

      <!-- Totals -->
      <table style="margin-left: auto; width: 40%; margin-top: 20px;">
        <tr>
          <td style="text-align: left;">Summe :</td>
          <td style="text-align: right;">${formatEuro(netTotal)}</td>
        </tr>
        <tr>
          <td style="text-align: left;">zzgl. ${vatRate * 100}% MwSt. :</td>
          <td style="text-align: right;">${formatEuro(vatAmount)}</td>
        </tr>
        <tr style="border-top: 2px solid #666;">
          <td style="text-align: left; font-weight: bold;">Rechnungsbetrag :</td>
          <td style="text-align: right; font-weight: bold;">${formatEuro(grossTotal)}</td>
        </tr>
      </table>

      <!-- Payment -->
      <div style="margin-top: 10px;">
        <div>${effectivePaymentText}</div>
      </div>

      <!-- Bank Details -->
      <div style="font-size: 11px; margin-top: 10px;">
        <div>Bank : ${bankName}</div>
        <div style="">IBAN : ${iban}</div>
        <div>BIC : ${bic}</div>
        <div style="">Name : ${accountHolder}</div>
      </div>

      <!-- Closing -->
      <div style="margin-top: 25px;">
        <div>Mit freundlichen Grüßen</div>
        <div style="margin-top: 30px; margin-bottom: 10px;">${senderName}</div>
      </div>

      <!-- Footer - Fixed at bottom with proper margins aligned to page padding -->
      <div style="position: absolute; bottom: 20mm; left: 0; right: 0; font-size: 9px; border-top: 1px solid #ddd; padding-top: 10px; display: flex; justify-content: space-between;">
        <div>${senderName}<br>${senderStreet}<br>${senderZipCity}</div>
        <div style="text-align: right;">IdNr : ${taxId}<br>Steuernummer : ${taxNumber}</div>
      </div>
    </div>
  `;
}

function formatEuro(value: number): string {
  return value.toLocaleString("de-DE", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }) + " €";
}

export async function downloadInvoicePdf(props: BaumprofisInvoicePdfProps, toast?: { success: (msg: string) => void, error: (msg: string) => void }) {
  // Basic validation - ensure we have the minimum required data for PDF generation
  if (!props.recipientName?.trim() || !props.recipientStreet?.trim() || props.items.length === 0) {
    const message = 'Fehlende Empfängerdaten oder Positionen. Bitte überprüfen Sie die Rechnung.';
    if (toast) {
      toast.error(message);
    } else {
      alert(message);
    }
    throw new Error('Missing required data for PDF generation');
  }

  // Convert PDF props to invoice data for basic validation
  const invoiceData: InvoiceData = {
    invoiceNumber: props.invoiceNumber,
    customerName: props.recipientName,
    customerAddress: `${props.recipientStreet}\n${props.recipientZipCity}`,
    customerEmail: undefined,
    customerPhone: undefined,
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
    dueDate: props.invoiceDate,
    object: props.objectDescription
  };

  // Basic validation rather than comprehensive validation
  const dataIntegrityResult = InvoiceValidationService.validateDataIntegrity(invoiceData);
  if (!dataIntegrityResult.isValid) {
    const errorMessages = Object.values(dataIntegrityResult.errors).join('\n');
    const message = `PDF-Generierung blockiert:\n\n${errorMessages}`;
    if (toast) {
      toast.error(message);
    } else {
      alert(message);
    }
    throw new Error('Validation failed for PDF generation');
  }

  try {
    // Create temporary HTML element with the invoice template
    const invoiceElement = document.createElement('div');
    invoiceElement.innerHTML = generateInvoiceHTML(props, companyLogo);
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

    const message = `PDF erfolgreich heruntergeladen: ${filename}`;
    if (toast) {
      toast.success(message);
    } else {
      alert('✅ ' + message);
    }

  } catch (error) {
    console.error('PDF generation error:', error);
    const message = 'Fehler beim Generieren der PDF. Versuchen Sie es erneut.';
    if (toast) {
      toast.error(message);
    } else {
      alert(message);
    }
  }
}
