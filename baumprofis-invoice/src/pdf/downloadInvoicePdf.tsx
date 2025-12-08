import jsPDF from "jspdf";
import html2canvas from "html2canvas";
import type { BaumprofisInvoicePdfProps } from "./invoiceTypes";

export async function downloadInvoicePdf(props: BaumprofisInvoicePdfProps) {
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

  } catch (error) {
    console.error('PDF generation error:', error);
    alert('Fehler beim Generieren der PDF. Versuchen Sie es erneut.');
  }
}

function generateInvoiceHTML(props: BaumprofisInvoicePdfProps): string {
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
            <img src="/logos/baumprofis logo.png" style="width: 100px; height: 100px; object-fit: contain; margin-bottom: 10px;" alt="Company Logo">
            <div>${companyName}</div>
            <div>${senderName}</div>
            <div>${senderStreet}</div>
            <div>${senderZipCity}</div>
            <div>Mobil: ${senderMobile}</div>
          </td>
        </tr>
      </table>

      <!-- Recipient -->
      <div style="margin-bottom: 20px; margin-top: 40px;">
        <div>${recipientName}</div>
        ${recipientLine2 ? `<div>${recipientLine2}</div>` : ''}
        <div>${recipientStreet}</div>
        <div>${recipientZipCity}</div>
      </div>

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
      <table style="width: 100%; border-top: 1px solid #666; border-bottom: 1px solid #666; margin-top: 20px; margin-bottom: 10px;">
        <thead>
          <tr>
            <th style="padding: 8px; text-align: left; border-bottom: 1px solid #666; font-weight: bold;">Beschreibung</th>
            <th style="padding: 8px; text-align: right; border-bottom: 1px solid #666; font-weight: bold;">Einzelpreis</th>
            <th style="padding: 8px; text-align: right; border-bottom: 1px solid #666; font-weight: bold;">Anzahl</th>
            <th style="padding: 8px; text-align: center; border-bottom: 1px solid #666; font-weight: bold;">Einheit</th>
            <th style="padding: 8px; text-align: right; border-bottom: 1px solid #666; font-weight: bold;">Gesamtpreis</th>
          </tr>
        </thead>
        <tbody>
          ${items.map(item => `
            <tr>
              <td style="padding: 6px;">${item.description}</td>
              <td style="padding: 6px; text-align: right;">${formatEuro(item.unitPrice)}</td>
              <td style="padding: 6px; text-align: right;">${item.quantity}</td>
              <td style="padding: 6px; text-align: center;">${item.unitLabel}</td>
              <td style="padding: 6px; text-align: right;">${formatEuro(item.total)}</td>
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
      <div style="margin-top: 20px;">
        <div>${effectivePaymentText}</div>
      </div>

      <!-- Bank Details -->
      <div style="margin-top: 15px; font-size: 11px;">
        <div>Bank : ${bankName}</div>
        <div style="margin-top: 8px;">IBAN : ${iban}</div>
        <div>BIC : ${bic}</div>
        <div style="margin-top: 8px;">Name : ${accountHolder}</div>
      </div>

      <!-- Closing -->
      <div style="margin-top: 25px;">
        <div>Mit freundlichen Grüßen</div>
        <div style="margin-top: 20px;">${senderName}</div>
      </div>

      <!-- Footer - Fixed at bottom with proper margins aligned to page padding -->
      <div style="position: absolute; bottom: 0; left: 0; right: 0; font-size: 10px; border-top: 1px solid #ddd; padding: 10px 20px; display: flex; justify-content: space-between;">
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
